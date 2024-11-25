const db = require("../../db/connection.js");

exports.selectProducts = () => {
  return db.query(`SELECT * FROM products`).then(({ rows }) => {
    return rows;
  });
};

exports.selectProductById = (product_id) => {
  return db
    .query(`SELECT * FROM products WHERE product_id = $1`, [product_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Product not found" });
      }
      return rows[0];
    });
};

exports.selectProductReviewsById = (product_id) => {
  return db
    .query(
      `SELECT review_id, product_id, user_id, rating, review_text, created_at 
       FROM reviews 
       WHERE product_id = $1`,
      [product_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Product not found",
        });
      }
      return rows;
    });
};

exports.insertProduct = async ({
  product_name,
  price,
  description,
  stock,
  category_id,
}) => {
  const categoryCheckQuery = `SELECT * FROM categories WHERE category_id = $1;`;
  const categoryCheckResult = await db.query(categoryCheckQuery, [category_id]);

  if (categoryCheckResult.rowCount === 0) {
    throw { status: 400, msg: "Invalid category ID provided" };
  }

  const productInsertQuery = `
    INSERT INTO products (product_name, price, description, stock, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [product_name, price, description, stock, category_id];

  const { rows } = await db.query(productInsertQuery, values);
  const newProduct = rows[0];
  newProduct.price = parseFloat(newProduct.price);
  return newProduct;
};

exports.insertProductReview = ({
  rating,
  review_text,
  user_id,
  product_id,
}) => {
  const query = `
    INSERT INTO reviews (product_id, user_id, rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [product_id, user_id, rating, review_text];

  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

exports.updateProductById = (product_id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return Promise.resolve(null);
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");

  const query = `
    UPDATE products
    SET ${setClause}
    WHERE product_id = $1
    RETURNING *;
  `;

  return db.query(query, [product_id, ...values]).then(({ rows }) => {
    return rows[0] || null;
  });
};

exports.getValidProductFields = () => {
  const query = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'products';
  `;

  return db.query(query).then(({ rows }) => rows.map((row) => row.column_name));
};

exports.selectProductToDelete = (product_id) => {
  return db
    .query(
      `
    WITH deleted_reviews AS (
      DELETE FROM reviews
      WHERE product_id = $1
    )
    DELETE FROM products
    WHERE product_id = $1
    RETURNING *;
    `,
      [product_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Product doesn't exist" });
      }
      return rows[0];
    });
};

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
          msg: "No reviews found for this product",
        });
      }
      return rows;
    });
};

exports.insertProduct = ({ name, price, description, stock, category }) => {
  const query = `
    INSERT INTO products (name, price, description, stock, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [name, price, description, stock, category];

  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

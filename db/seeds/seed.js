const format = require("pg-format");
const db = require("../connection.js");

const seed = async ({
  productsData,
  ordersData,
  ordersItemsData,
  categoriesData,
  reviewsData,
}) => {
  try {
    await db.query("BEGIN");
    await db.query(`
      DROP TABLE IF EXISTS reviews, order_items, orders, products, categories CASCADE;
    `);
    await db.query(`
      CREATE TABLE categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(30) NOT NULL UNIQUE
      );
    `);
    await db.query(`
      CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category INT REFERENCES categories(category_id) ON DELETE SET NULL
      );
    `);
    await db.query(`
      CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await db.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0)
      );
    `);
    await db.query(`
      CREATE TABLE reviews (
        review_id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const insertCategoryQueryStr = format(
      "INSERT INTO categories (category_name) VALUES %L RETURNING *",
      categoriesData.map(({ category_name }) => [category_name])
    );
    const categoriesResult = await db.query(insertCategoryQueryStr);

    const categoriesMap = {};
    categoriesResult.rows.forEach(({ category_id, category_name }) => {
      categoriesMap[category_name] = category_id;
    });

    const insertProductQueryStr = format(
      "INSERT INTO products (product_name, price, description, stock, category) VALUES %L RETURNING *",
      productsData.map(
        ({ product_name, price, description, stock, category_name }) => {
          const categoryId = categoriesMap[category_name];
          if (!categoryId) {
            throw new Error(
              `Category '${category_name}' not found for product '${product_name}'. Ensure all products reference valid categories.`
            );
          }
          return [product_name, price, description, stock, categoryId];
        }
      )
    );
    await db.query(insertProductQueryStr);

    const insertOrdersQueryStr = format(
      "INSERT INTO orders (user_id, total) VALUES %L RETURNING *",
      ordersData.map(({ user_id, total }) => [user_id, total])
    );
    await db.query(insertOrdersQueryStr);

    const insertOrdersItemsQueryStr = format(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES %L RETURNING *",
      ordersItemsData.map(({ order_id, product_id, quantity }) => [
        order_id,
        product_id,
        quantity,
      ])
    );
    await db.query(insertOrdersItemsQueryStr);

    const insertReviewsQueryStr = format(
      "INSERT INTO reviews (product_id, user_id, rating, review_text) VALUES %L RETURNING *",
      reviewsData.map(({ product_id, user_id, rating, review_text }) => [
        product_id,
        user_id,
        rating,
        review_text,
      ])
    );
    await db.query(insertReviewsQueryStr);
    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};

module.exports = seed;

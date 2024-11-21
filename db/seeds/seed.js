const format = require("pg-format");
const db = require("../connection.js");

const seed = ({
  productsData,
  ordersData,
  ordersItemsData,
  categoriesData,
  reviewsData,
}) => {
  return db
    .query(`DROP TABLE IF EXISTS reviews;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS order_items;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS orders;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS products CASCADE;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS categories;`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE categories (
          category_id SERIAL PRIMARY KEY,
          name VARCHAR(30)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE products (
          product_id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          price NUMERIC(10, 2),
          description TEXT,
          stock INT,
          category INT REFERENCES categories(category_id)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE orders (
          order_id SERIAL PRIMARY KEY,
          user_id INT,
          total NUMERIC(10, 2),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE order_items (
          id SERIAL PRIMARY KEY,
          order_id INT REFERENCES orders(order_id),
          product_id INT REFERENCES products(product_id),
          quantity INT
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE reviews (
          review_id SERIAL PRIMARY KEY,
          product_id INT REFERENCES products(product_id),
          user_id INT,
          rating INT CHECK (rating BETWEEN 1 AND 5),
          review_text TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    })
    .then(() => {
      const insertCategoryQueryStr = format(
        "INSERT INTO categories (name) VALUES %L RETURNING *",
        categoriesData.map(({ name }) => [name])
      );
      return db.query(insertCategoryQueryStr);
    })
    .then((categoriesResult) => {
      const categoriesMap = {};
      categoriesResult.rows.forEach(({ category_id, name }) => {
        categoriesMap[name] = category_id;
      });

      const insertProductQueryStr = format(
        "INSERT INTO products (name, price, description, stock, category) VALUES %L RETURNING *",
        productsData.map(({ name, price, description, stock, category }) => [
          name,
          price,
          description,
          stock,
          categoriesMap[category],
        ])
      );

      return db.query(insertProductQueryStr);
    })
    .then(() => {
      const insertOrdersQueryStr = format(
        "INSERT INTO orders (user_id, total, created_at) VALUES %L RETURNING *",
        ordersData.map(({ user_id, total, created_at }) => [
          user_id,
          total,
          created_at,
        ])
      );
      return db.query(insertOrdersQueryStr);
    })
    .then(() => {
      const insertOrdersItemsQueryStr = format(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES %L RETURNING *",
        ordersItemsData.map(({ order_id, product_id, quantity }) => [
          order_id,
          product_id,
          quantity,
        ])
      );
      return db.query(insertOrdersItemsQueryStr);
    })
    .then(() => {
      const insertReviewsQueryStr = format(
        "INSERT INTO reviews (product_id, user_id, rating, review_text, created_at) VALUES %L RETURNING *",
        reviewsData.map(
          ({ product_id, user_id, rating, review_text, created_at }) => [
            product_id,
            user_id,
            rating,
            review_text,
            created_at,
          ]
        )
      );
      return db.query(insertReviewsQueryStr);
    });
};

module.exports = seed;

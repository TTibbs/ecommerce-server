const format = require("pg-format");
const db = require("../connection.js");

const seed = ({ productsData, ordersData, ordersItemsData }) => {
  return db
    .query(`DROP TABLE IF EXISTS order_items;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS orders;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS products;`);
    })
    .then(() => {
      return db
        .query(
          `CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          price NUMERIC(10, 2),
          description TEXT,
          stock INT,
          category VARCHAR(50)
        );`
        )
        .then(() => {
          return db.query(
            `CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            user_id INT,
            total NUMERIC(10, 2),
            created_at TIMESTAMP DEFAULT NOW()
          );`
          );
        })
        .then(() => {
          return db.query(
            `CREATE TABLE order_items (
              id SERIAL PRIMARY KEY,
              order_id INT REFERENCES orders(id),
              product_id INT REFERENCES products(id),
              quantity INT
            );`
          );
        });
    })
    .then(() => {
      const insertProductQueryStr = format(
        "INSERT INTO products (name, price, description, stock, category) VALUES %L RETURNING *",
        productsData.map(({ name, price, description, stock, category }) => [
          name,
          price,
          description,
          stock,
          category,
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
    });
};

module.exports = seed;

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
        name VARCHAR(30) NOT NULL UNIQUE
      );
    `);
    await db.query(`
      CREATE TABLE products (
        product_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        stock INT NOT NULL CHECK (stock >= 0),
        category INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE
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
      "INSERT INTO categories (name) VALUES %L RETURNING *",
      categoriesData.map(({ name }) => [name])
    );
    const categoriesResult = await db.query(insertCategoryQueryStr);

    const categoriesMap = {};
    categoriesResult.rows.forEach(({ category_id, name }) => {
      categoriesMap[name] = category_id;
    });

    const insertProductQueryStr = format(
      "INSERT INTO products (name, price, description, stock, category) VALUES %L RETURNING *",
      productsData.map(({ name, price, description, stock, category }) => {
        const categoryId = categoriesMap[category];
        if (!categoryId) {
          throw new Error(
            `Category '${category}' not found for product '${name}'.`
          );
        }
        return [name, price, description, stock, categoryId];
      })
    );
    await db.query(insertProductQueryStr);

    const insertOrdersQueryStr = format(
      "INSERT INTO orders (user_id, total, created_at) VALUES %L RETURNING *",
      ordersData.map(({ user_id, total, created_at }) => [
        user_id,
        total,
        created_at || null,
      ])
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
      "INSERT INTO reviews (product_id, user_id, rating, review_text, created_at) VALUES %L RETURNING *",
      reviewsData.map(
        ({ product_id, user_id, rating, review_text, created_at }) => [
          product_id,
          user_id,
          rating,
          review_text,
          created_at || null,
        ]
      )
    );
    await db.query(insertReviewsQueryStr);
    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};

module.exports = seed;

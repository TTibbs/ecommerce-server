const format = require("pg-format");
const db = require("../connection.js");
const { convertTimestampToDate } = require("./utils.js");

const seed = async ({
  productsData,
  ordersData,
  ordersItemsData,
  categoriesData,
  reviewsData,
  usersData,
}) => {
  try {
    await db.query("BEGIN");
    await db.query(`
      DROP TABLE IF EXISTS reviews, order_items, orders, products, categories, users CASCADE;
    `);

    // Create tables
    await db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE
      );
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
        category INT REFERENCES categories(category_id) ON DELETE SET NULL,
        image_url VARCHAR(255)
      );
    `);
    await db.query(`
      CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
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
        user_id INT NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert users
    const insertUsersQueryStr = format(
      "INSERT INTO users (username, email) VALUES %L RETURNING *",
      usersData.map(({ username, email }) => [username, email])
    );
    const usersResult = await db.query(insertUsersQueryStr);

    const usersMap = {};
    usersResult.rows.forEach(({ user_id, username }) => {
      usersMap[username] = user_id;
    });

    // Insert categories
    const insertCategoryQueryStr = format(
      "INSERT INTO categories (category_name) VALUES %L RETURNING *",
      categoriesData.map(({ category_name }) => [category_name])
    );
    const categoriesResult = await db.query(insertCategoryQueryStr);

    const categoriesMap = {};
    categoriesResult.rows.forEach(({ category_id, category_name }) => {
      categoriesMap[category_name] = category_id;
    });

    // Insert products
    const insertProductQueryStr = format(
      "INSERT INTO products (product_name, price, description, stock, category, image_url) VALUES %L RETURNING *",
      productsData.map(
        ({
          product_name,
          price,
          description,
          stock,
          category_name,
          image_url,
        }) => {
          const categoryId = categoriesMap[category_name];
          if (!categoryId) {
            throw new Error(
              `Category '${category_name}' not found for product '${product_name}'. Ensure all products reference valid categories.`
            );
          }
          return [
            product_name,
            price,
            description,
            stock,
            categoryId,
            image_url,
          ];
        }
      )
    );
    await db.query(insertProductQueryStr);

    // Insert orders
    const preparedOrdersData = ordersData.map(convertTimestampToDate);
    const insertOrdersQueryStr = format(
      "INSERT INTO orders (user_id, total, created_at) VALUES %L RETURNING *",
      preparedOrdersData.map(({ user_id, total, created_at }) => [
        user_id,
        total,
        created_at,
      ])
    );
    const ordersResult = await db.query(insertOrdersQueryStr);

    const ordersMap = {};
    ordersResult.rows.forEach(({ order_id }) => {
      ordersMap[order_id] = order_id;
    });

    // Insert order items
    const insertOrdersItemsQueryStr = format(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES %L RETURNING *",
      ordersItemsData.map(({ order_id, product_id, quantity }) => {
        if (!ordersMap[order_id]) {
          throw new Error(
            `Order ID '${order_id}' in order_items does not exist in orders.`
          );
        }
        return [order_id, product_id, quantity];
      })
    );
    await db.query(insertOrdersItemsQueryStr);

    // Insert reviews
    const preparedReviewsData = reviewsData.map(convertTimestampToDate);
    const insertReviewsQueryStr = format(
      "INSERT INTO reviews (product_id, user_id, rating, review_text, created_at) VALUES %L RETURNING *",
      preparedReviewsData.map(
        ({ product_id, username, rating, review_text, created_at }) => {
          const user_id = usersMap[username];
          if (!user_id) {
            throw new Error(
              `User '${username}' not found for review. Ensure all reviews reference valid users.`
            );
          }
          return [product_id, user_id, rating, review_text, created_at];
        }
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

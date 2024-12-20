const db = require("../../db/connection.js");

exports.selectCategories = () => {
  return db.query(`SELECT * FROM categories`).then(({ rows }) => {
    return rows;
  });
};

exports.selectCategoryById = (category_id) => {
  return db
    .query(`SELECT * FROM categories WHERE category_id = $1`, [category_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Category not found" });
      }
      return rows[0];
    });
};

exports.insertCategory = ({ category_name }) => {
  if (!category_name || typeof category_name !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Bad request: category_name must be provided and be a string",
    });
  }

  const query = `INSERT INTO categories (category_name) VALUES ($1) RETURNING *;`;
  const values = [category_name];

  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

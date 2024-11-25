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

exports.insertCategory = ({ name }) => {
  const query = `INSERT INTO categories (name) VALUES ($1) RETURNING *;`;

  const values = [name];

  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

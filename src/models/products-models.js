const db = require("../../db/connection.js");

exports.selectProducts = () => {
  return db.query(`SELECT * FROM products`).then(({ rows }) => {
    return rows;
  });
};

exports.selectProductById = (product_id) => {
  return db
    .query(`SELECT * FROM products WHERE id = $1`, [product_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Product not found" });
      }
      return rows[0];
    });
};

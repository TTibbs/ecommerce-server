const db = require("../../db/connection");

exports.selectOrderItems = (order_id) => {
  return db
    .query("SELECT * FROM order_items WHERE order_id = $1", [order_id])
    .then(({ rows }) => rows);
};

exports.addOrderItem = (order_id, { product_id, quantity }) => {
  return db
    .query(
      "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [order_id, product_id, quantity]
    )
    .then(({ rows }) => rows[0]);
};

exports.updateOrderItem = (order_id, order_item_id, { quantity }) => {
  return db
    .query(
      "UPDATE order_items SET quantity = $1 WHERE id = $2 AND order_id = $3 RETURNING *",
      [quantity, order_item_id, order_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Order item not found",
        });
      }
      return rows[0];
    });
};

exports.deleteOrderItem = (order_id, order_item_id) => {
  return db
    .query(
      "DELETE FROM order_items WHERE id = $1 AND order_id = $2 RETURNING *",
      [order_item_id, order_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Order item not found",
        });
      }
    });
};

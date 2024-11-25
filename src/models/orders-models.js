const db = require("../../db/connection.js");

exports.selectOrders = () => {
  return db.query("SELECT * FROM orders").then(({ rows }) => rows);
};

exports.selectOrderById = (order_id) => {
  return db
    .query(
      `SELECT 
         order_id AS "order_id", 
         user_id AS "user_id", 
         total, 
         created_at 
       FROM orders 
       WHERE order_id = $1`,
      [order_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Order does not exist" });
      }
      return rows[0];
    });
};

exports.createOrder = ({ user_id, total }) => {
  return db
    .query("INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *", [
      user_id,
      total,
    ])
    .then(({ rows }) => rows[0]);
};

exports.updateOrder = (order_id, { total }) => {
  return db
    .query("UPDATE orders SET total = $1 WHERE order_id = $2 RETURNING *", [
      total,
      order_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
      const updatedOrder = rows[0];
      updatedOrder.total = parseFloat(updatedOrder.total);
      return updatedOrder;
    });
};

exports.deleteOrder = (order_id) => {
  return db
    .query("DELETE FROM orders WHERE order_id = $1 RETURNING *", [order_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Order not found" });
      }
    });
};

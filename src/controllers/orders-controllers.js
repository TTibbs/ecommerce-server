const {
  selectOrders,
  selectOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../models/orders-models");

exports.getOrders = (req, res, next) => {
  selectOrders()
    .then((orders) => {
      res.status(200).send({ orders });
    })
    .catch(next);
};

exports.getOrderById = (req, res, next) => {
  const { order_id } = req.params;

  if (isNaN(order_id)) {
    return next({ status: 400, msg: "Invalid order ID" });
  }

  selectOrderById(order_id)
    .then((order) => {
      res.status(200).send({ order });
    })
    .catch(next);
};

exports.createNewOrder = (req, res, next) => {
  const { user_id, total } = req.body;

  if (!user_id || typeof user_id !== "number") {
    return res
      .status(400)
      .send({ msg: "Invalid or missing user ID. It must be a number." });
  }
  if (!total || typeof total !== "number") {
    return res
      .status(400)
      .send({ msg: "Invalid or missing total. It must be a number." });
  }

  createOrder({ user_id, total })
    .then((newOrder) => {
      res.status(201).send({ newOrder });
    })
    .catch(next);
};

exports.updateOrderById = (req, res, next) => {
  const { order_id } = req.params;
  const { total } = req.body;

  if (isNaN(order_id)) {
    return next({ status: 400, msg: "Invalid order ID" });
  }

  if (total === undefined || typeof total !== "number") {
    return res.status(400).send({ msg: "No valid updates provided" });
  }

  updateOrder(order_id, { total })
    .then((updatedOrder) => {
      res.status(200).send({ updatedOrder });
    })
    .catch(next);
};

exports.deleteOrderById = (req, res, next) => {
  const { order_id } = req.params;

  if (isNaN(order_id)) {
    return next({ status: 400, msg: "Invalid order ID" });
  }

  deleteOrder(order_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

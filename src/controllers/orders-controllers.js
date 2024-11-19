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

exports.createOrder = (req, res, next) => {
  const { user_id, total } = req.body;

  createOrder({ user_id, total })
    .then((newOrder) => {
      res.status(201).send({ order: newOrder });
    })
    .catch(next);
};

exports.updateOrder = (req, res, next) => {
  const { order_id } = req.params;
  const { total } = req.body;

  if (isNaN(order_id)) {
    return next({ status: 400, msg: "Invalid order ID" });
  }

  updateOrder(order_id, { total })
    .then((updatedOrder) => {
      res.status(200).send({ order: updatedOrder });
    })
    .catch(next);
};

exports.deleteOrder = (req, res, next) => {
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

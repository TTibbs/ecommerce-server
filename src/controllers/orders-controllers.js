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

  if (!order_id || isNaN(order_id) || Number(order_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid order ID" });
  }

  selectOrderById(order_id)
    .then((order) => {
      res.status(200).send({ order });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.createNewOrder = (req, res, next) => {
  const { user_id, total } = req.body;

  if (!user_id || typeof user_id !== "number" || user_id <= 0) {
    return res.status(400).send({
      msg: "Bad request: Invalid or missing user ID. It must be a positive number.",
    });
  }
  if (!total || typeof total !== "number" || total < 0) {
    return res.status(400).send({
      msg: "Bad request: Invalid or missing total. It must be a non-negative number.",
    });
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

  if (!order_id || isNaN(order_id) || Number(order_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid order ID" });
  }

  if (total === undefined || typeof total !== "number" || total < 0) {
    return res.status(400).send({
      msg: "Bad request: Invalid or missing total. It must be a non-negative number.",
    });
  }

  updateOrder(order_id, { total })
    .then((updatedOrder) => {
      res.status(200).send({ updatedOrder });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.deleteOrderById = (req, res, next) => {
  const { order_id } = req.params;

  if (!order_id || isNaN(order_id) || Number(order_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid order ID" });
  }

  deleteOrder(order_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

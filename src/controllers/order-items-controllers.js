const {
  selectOrderItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} = require("../models/order-items-models");

exports.getOrderItems = (req, res, next) => {
  const { order_id } = req.params;

  if (isNaN(order_id)) {
    return next({ status: 400, msg: "Invalid order ID" });
  }

  selectOrderItems(order_id)
    .then((items) => {
      res.status(200).send({ order_items: items });
    })
    .catch(next);
};

exports.addOrderItem = (req, res, next) => {
  const { order_id } = req.params;
  const { product_id, quantity } = req.body;

  addOrderItem(order_id, { product_id, quantity })
    .then((newItem) => {
      res.status(201).send({ order_item: newItem });
    })
    .catch(next);
};

exports.updateOrderItem = (req, res, next) => {
  const { order_id, order_item_id } = req.params;
  const { quantity } = req.body;

  updateOrderItem(order_id, order_item_id, { quantity })
    .then((updatedItem) => {
      res.status(200).send({ order_item: updatedItem });
    })
    .catch(next);
};

exports.deleteOrderItem = (req, res, next) => {
  const { order_id, order_item_id } = req.params;

  deleteOrderItem(order_id, order_item_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

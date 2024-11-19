const orderItemsRouter = require("express").Router();
const {
  getOrderItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} = require("../controllers/order-items-controllers.js");

orderItemsRouter.get("/:order_id", getOrderItems);
orderItemsRouter.post("/:order_id", addOrderItem);
orderItemsRouter.patch("/:order_id/:order_item_id", updateOrderItem);
orderItemsRouter.delete("/:order_id/:order_item_id", deleteOrderItem);

module.exports = orderItemsRouter;

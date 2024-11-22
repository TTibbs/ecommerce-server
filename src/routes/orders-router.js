const ordersRouter = require("express").Router();
const {
  getOrders,
  getOrderById,
  createNewOrder,
  updateOrderById,
} = require("../controllers/orders-controllers");

ordersRouter.get("/", getOrders);
ordersRouter.get("/:order_id", getOrderById);
ordersRouter.post("/", createNewOrder);
ordersRouter.patch("/:order_id", updateOrderById);
// ordersRouter.delete("/:order_id", deleteOrderById);

module.exports = ordersRouter;

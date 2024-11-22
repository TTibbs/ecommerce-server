const express = require("express");
const apiRouter = express.Router();
const endpoints = require("../endpoints.json");
const productsRouter = require("./products-router.js");
const ordersRouter = require("./orders-router.js");
const orderItemsRouter = require("./order-items-router.js");
const reviewsRouter = require("./reviews-router.js");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ endpoints: endpoints });
});

apiRouter.use("/products", productsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/order_items", orderItemsRouter);

module.exports = apiRouter;

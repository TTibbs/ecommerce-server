const productsRouter = require("express").Router();
const {
  getProducts,
  getProductById,
} = require("../controllers/products-controllers");

productsRouter.get("/", getProducts);
productsRouter.get("/:product_id", getProductById);
// productsRouter.post("/", postProduct);
// productsRouter.get("/:product_id/reviews", getProductReviewsById);
// productsRouter.post("/:product_id/reviews", postProductReviewsById);
// productsRouter.patch("/:product_id", patchProductById);
// productsRouter.delete("/:product_id", deleteProductById);

module.exports = productsRouter;

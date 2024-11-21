const productsRouter = require("express").Router();
const {
  getProducts,
  getProductById,
  getProductReviewsById,
  postProduct,
} = require("../controllers/products-controllers");

productsRouter.get("/", getProducts);
productsRouter.get("/:product_id", getProductById);
productsRouter.get("/:product_id/reviews", getProductReviewsById);
productsRouter.post("/", postProduct);
// productsRouter.post("/:product_id/reviews", postProductReviewsById);
// productsRouter.patch("/:product_id", patchProductById);
// productsRouter.delete("/:product_id", deleteProductById);

module.exports = productsRouter;

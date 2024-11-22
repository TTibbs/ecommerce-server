const productsRouter = require("express").Router();
const {
  getProducts,
  getProductById,
  getProductReviewsById,
  postProduct,
  postProductReviewById,
  patchProductById,
  deleteProductById,
} = require("../controllers/products-controllers");

productsRouter.get("/", getProducts);
productsRouter.post("/", postProduct);
productsRouter.get("/:product_id", getProductById);
productsRouter.get("/:product_id/reviews", getProductReviewsById);
productsRouter.post("/:product_id/reviews", postProductReviewById);
productsRouter.patch("/:product_id", patchProductById);
productsRouter.delete("/:product_id", deleteProductById);

module.exports = productsRouter;

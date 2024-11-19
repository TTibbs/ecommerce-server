const {
  selectProducts,
  selectProductById,
} = require("../models/products-models");

exports.getProducts = (req, res, next) => {
  const { category, sort_by, order } = req.query;
  selectProducts(category, sort_by, order)
    .then((products) => {
      res.status(200).send({ products });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getProductById = (req, res, next) => {
  const { product_id } = req.params;
  if (isNaN(product_id)) {
    return next({ status: 400, msg: "Invalid product ID" });
  }

  selectProductById(product_id)
    .then((product) => {
      res.status(200).send({ product });
    })
    .catch(next);
};

const {
  selectProducts,
  selectProductById,
  selectProductReviewsById,
  insertProduct,
} = require("../models/products-models");

exports.getProducts = (req, res, next) => {
  // const { category, sort_by, order } = req.query;
  selectProducts()
    .then((products) => {
      res.status(200).send({ products });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getProductById = (req, res, next) => {
  const { product_id } = req.params;
  if (isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Invalid product id" });
  }
  selectProductById(product_id)
    .then((product) => {
      res.status(200).send({ product });
    })
    .catch(next);
};

exports.getProductReviewsById = (req, res, next) => {
  const { product_id } = req.params;
  if (isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Invalid product id" });
  }
  selectProductReviewsById(product_id)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch(next);
};

exports.postProduct = (req, res, next) => {
  const { name, price, description, stock, category } = req.body;

  if (!name || !price || !description || stock === undefined || !category) {
    res.status(400).send({ msg: "Bad request: Missing required fields" });
    return;
  }

  insertProduct({ name, price, description, stock, category })
    .then((newProduct) => {
      res.status(201).send({ product: newProduct });
    })
    .catch(next);
};

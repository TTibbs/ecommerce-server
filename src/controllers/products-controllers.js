const {
  selectProducts,
  selectProductById,
  selectProductReviewsById,
  insertProduct,
  insertProductReview,
  updateProductById,
  getValidProductFields,
  selectProductToDelete,
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
  const { product_name, price, description, stock, category_id } = req.body;

  if (
    !product_name ||
    price === undefined ||
    !description ||
    stock === undefined ||
    !category_id
  ) {
    return res
      .status(400)
      .send({ msg: "Bad request: Missing required fields" });
  }

  insertProduct({
    product_name,
    price,
    description,
    stock,
    category_id,
  })
    .then((newProduct) => {
      res.status(201).send({ product: newProduct });
    })
    .catch((err) => {
      if (err.status === 400) {
        res.status(400).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.postProductReviewById = (req, res, next) => {
  const { rating, review_text, user_id } = req.body;
  const { product_id } = req.params;

  if (!rating || !review_text || !user_id) {
    return res
      .status(400)
      .send({ msg: "Bad request: Missing required fields" });
  }

  const validateProduct = selectProductById(product_id);
  const insertReview = validateProduct.then(() => {
    return insertProductReview({ rating, review_text, user_id, product_id });
  });

  Promise.all([validateProduct, insertReview])
    .then(([_, newProductReview]) => {
      res.status(201).send({ newProductReview });
    })
    .catch((err) => {
      if (err.msg === "Product not found") {
        res.status(404).send({ msg: err.msg });
      } else {
        console.error(err);
        next(err);
      }
    });
};

exports.patchProductById = (req, res, next) => {
  const { product_id } = req.params;
  const updates = req.body;

  if (isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Invalid product id" });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).send({ msg: "No updates provided" });
  }

  getValidProductFields()
    .then((validFields) => {
      const invalidFields = Object.keys(updates).filter(
        (field) => !validFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return res.status(400).send({ msg: "Invalid fields provided" });
      }

      return updateProductById(product_id, updates);
    })
    .then((updatedProduct) => {
      if (!updatedProduct) {
        return res.status(404).send({ msg: "Product not found" });
      }
      res.status(200).send({ updatedProduct });
    })
    .catch(next);
};

exports.deleteProductById = (req, res, next) => {
  const { product_id } = req.params;
  selectProductToDelete(product_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

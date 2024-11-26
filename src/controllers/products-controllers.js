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
  const { limit, page, sort_by, order, category } = req.query;

  const queryOptions = {
    limit: parseInt(limit, 10) || 10,
    page: parseInt(page, 10) || 1,
    sort_by: sort_by || "product_id",
    order: order || "asc",
    category: category ? parseInt(category, 10) : undefined,
  };

  selectProducts(queryOptions)
    .then((products) => {
      res.status(200).send({ products });
    })
    .catch(next);
};

exports.getProductById = (req, res, next) => {
  const { product_id } = req.params;

  if (!product_id || isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid product ID" });
  }

  selectProductById(product_id)
    .then((product) => {
      res.status(200).send({ product });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.getProductReviewsById = (req, res, next) => {
  const { product_id } = req.params;

  if (!product_id || isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid product ID" });
  }

  selectProductReviewsById(product_id)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.postProduct = (req, res, next) => {
  const { product_name, price, description, stock, category_id, image_url } =
    req.body;

  if (
    !product_name ||
    price === undefined ||
    !description ||
    stock === undefined ||
    !category_id ||
    !image_url
  ) {
    return res
      .status(400)
      .send({ msg: "Bad request: Missing required fields" });
  }

  if (
    typeof product_name !== "string" ||
    typeof price !== "number" ||
    typeof description !== "string" ||
    typeof stock !== "number" ||
    typeof category_id !== "number" ||
    typeof image_url !== "string"
  ) {
    return res
      .status(400)
      .send({ msg: "Bad request: Invalid data types for fields" });
  }

  insertProduct({
    product_name,
    price,
    description,
    stock,
    category_id,
    image_url,
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
  const { product_id } = req.params;
  const { rating, review_text, user_id } = req.body;

  if (!product_id || isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid product ID" });
  }

  if (!rating || !review_text || !user_id) {
    return res
      .status(400)
      .send({ msg: "Bad request: Missing required fields" });
  }

  if (
    typeof rating !== "number" ||
    typeof review_text !== "string" ||
    typeof user_id !== "number"
  ) {
    return res
      .status(400)
      .send({ msg: "Bad request: Invalid data types for fields" });
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
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.patchProductById = (req, res, next) => {
  const { product_id } = req.params;
  const updates = req.body;

  if (!product_id || isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid product ID" });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).send({ msg: "Bad request: No updates provided" });
  }

  getValidProductFields()
    .then((validFields) => {
      const invalidFields = Object.keys(updates).filter(
        (field) => !validFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return Promise.reject({
          status: 400,
          msg: "Bad request: Invalid fields provided",
        });
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

  if (!product_id || isNaN(product_id) || Number(product_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid product ID" });
  }

  selectProductToDelete(product_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

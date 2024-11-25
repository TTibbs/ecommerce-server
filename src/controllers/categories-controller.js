const {
  selectCategories,
  selectCategoryById,
  insertCategory,
} = require("../models/categories-model");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCategoryById = (req, res, next) => {
  const { category_id } = req.params;

  if (!category_id || isNaN(category_id) || Number(category_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid category ID" });
  }

  selectCategoryById(category_id)
    .then((category) => {
      res.status(200).send({ category });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.postNewCategory = (req, res, next) => {
  const { category_name } = req.body;

  if (!category_name) {
    const keys = Object.keys(req.body);
    if (keys.length === 0) {
      return res
        .status(400)
        .send({ msg: "Bad request: No fields provided in the request body" });
    }
    return res
      .status(400)
      .send({ msg: "Bad request: Incorrect field(s) provided" });
  }

  if (typeof category_name !== "string" || category_name.trim().length === 0) {
    return res
      .status(400)
      .send({ msg: "Bad request: category name must be a non-empty string" });
  }

  insertCategory({ category_name })
    .then((newCategory) => {
      res.status(201).send({ newCategory });
    })
    .catch((err) => {
      next(err);
    });
};

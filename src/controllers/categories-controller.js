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
  if (isNaN(category_id) || Number(category_id) <= 0) {
    return res.status(400).send({ msg: "Invalid category ID" });
  }
  selectCategoryById(category_id)
    .then((category) => {
      res.status(200).send({ category });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postNewCategory = (req, res, next) => {
  const { category_name } = req.body;

  if (!category_name) {
    res.status(400).send({ msg: "Bad request: Missing required fields" });
    return;
  }

  insertCategory({ category_name })
    .then((newCategory) => {
      res.status(201).send({ newCategory });
    })
    .catch(next);
};

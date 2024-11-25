const categoriesRouter = require("express").Router();
const {
  getCategories,
  getCategoryById,
  postNewCategory,
} = require("../controllers/categories-controller");

categoriesRouter.get("/", getCategories);
categoriesRouter.get("/:category_id", getCategoryById);
categoriesRouter.post("/", postNewCategory);

module.exports = categoriesRouter;

const {
  getReviews,
  getReviewById,
  getReviewToPatchById,
  getReviewToDeleteById,
} = require("../controllers/reviews-controller");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewById);
reviewsRouter.patch("/:review_id", getReviewToPatchById);
reviewsRouter.delete("/:review_id", getReviewToDeleteById);

module.exports = reviewsRouter;

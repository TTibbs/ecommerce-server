const {
  selectReviews,
  selectReviewById,
  updateReviewById,
  deleteReviewById,
} = require("../models/reviews-models");

exports.getReviews = (req, res, next) => {
  selectReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch(next);
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;

  if (!review_id || isNaN(review_id) || Number(review_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid review ID" });
  }

  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

exports.getReviewToPatchById = (req, res, next) => {
  const { review_id } = req.params;
  const { rating, review_text } = req.body;

  if (!review_id || isNaN(review_id) || Number(review_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid review ID" });
  }

  if (
    (rating !== undefined &&
      (typeof rating !== "number" || rating < 1 || rating > 5)) ||
    (review_text !== undefined && typeof review_text !== "string")
  ) {
    return res.status(400).send({
      msg: "Bad request: Invalid updates. Ensure rating is a number between 1 and 5, and review_text is a string.",
    });
  }

  updateReviewById(review_id, { rating, review_text })
    .then((updatedReview) => {
      if (!updatedReview) {
        return res.status(404).send({ msg: "Review not found" });
      }
      res.status(200).send({ updatedReview });
    })
    .catch(next);
};

exports.getReviewToDeleteById = (req, res, next) => {
  const { review_id } = req.params;

  if (!review_id || isNaN(review_id) || Number(review_id) <= 0) {
    return res.status(400).send({ msg: "Bad request: Invalid review ID" });
  }

  deleteReviewById(review_id)
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

const db = require("../../db/connection.js");

exports.selectReviews = () => {
  return db.query(`SELECT * FROM reviews`).then(({ rows }) => rows);
};

exports.selectReviewById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Review not found" });
      }
      return rows[0];
    });
};

exports.updateReviewById = (review_id, { rating, review_text }) => {
  const updates = [];
  const values = [];

  if (rating !== undefined) {
    updates.push(`rating = $${values.length + 1}`);
    values.push(rating);
  }

  if (review_text !== undefined) {
    updates.push(`review_text = $${values.length + 1}`);
    values.push(review_text);
  }

  if (updates.length === 0) {
    return Promise.resolve(null);
  }

  const query = `
    UPDATE reviews
    SET ${updates.join(", ")}
    WHERE review_id = $${values.length + 1}
    RETURNING *;
  `;
  values.push(review_id);

  return db.query(query, values).then(({ rows }) => rows[0] || null);
};

exports.deleteReviewById = (review_id) => {
  return db
    .query(`DELETE FROM reviews WHERE review_id = $1 RETURNING *`, [review_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Review not found" });
      }
    });
};

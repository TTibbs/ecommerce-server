exports.inputErrorHandler = (req, res, next) => {
  res.status(404).send({ msg: "Invalid input" });
};

exports.psqlErrorHandler = (err, req, res, next) => {
  if (["23502", "22P02", "23503"].includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else next(err);
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).send({ msg: "Internal server error" });
};

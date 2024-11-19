const express = require("express");
const apiRouter = express.Router();
const endpoints = require("../endpoints.json");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ endpoints: endpoints });
});

module.exports = apiRouter;

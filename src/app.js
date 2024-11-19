const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./routes/api-router");
const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
  inputErrorHandler,
} = require("./errors/index.js");

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);
app.use("/api/*", inputErrorHandler);
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;

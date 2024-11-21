exports.inputErrorHandler = (req, res) => {
  res.status(404).send({ msg: "Invalid input" });
};

exports.psqlErrorHandler = (err, req, res, next) => {
  const psqlErrorCodes = {
    23502: { status: 400, msg: "Not null violation" },
    "22P02": { status: 400, msg: "Invalid text representation" },
    23503: { status: 400, msg: "Foreign key violation" },
    23505: { status: 409, msg: "Unique constraint violation" },
    42601: { status: 400, msg: "Syntax error" },
    42703: { status: 400, msg: "Undefined column" },
    42883: { status: 400, msg: "Undefined function" },
    "42P01": { status: 400, msg: "Undefined table" },
    23514: { status: 400, msg: "Check violation" },
    22001: { status: 400, msg: "String data right truncation" },
    22003: { status: 400, msg: "Numeric value out of range" },
    22012: { status: 400, msg: "Division by zero" },
    22008: { status: 400, msg: "Datetime field overflow" },
    22007: { status: 400, msg: "Invalid datetime format" },
    22019: { status: 400, msg: "Invalid escape character" },
    "2200B": { status: 400, msg: "Escape character conflict" },
    "2200C": { status: 400, msg: "Invalid use of escape character" },
    "2200D": { status: 400, msg: "Invalid escape octet" },
    "2200F": { status: 400, msg: "Zero-length character string" },
    "2200G": { status: 400, msg: "Most specific type mismatch" },
    "2200H": { status: 400, msg: "Sequence generator limit exceeded" },
    "2200L": { status: 400, msg: "Not an XML document" },
    "2200M": { status: 400, msg: "Invalid XML document" },
    "2200N": { status: 400, msg: "Invalid XML content" },
    "2200S": { status: 400, msg: "Invalid XML comment" },
    "2200T": { status: 400, msg: "Invalid XML processing instruction" },
    22021: { status: 400, msg: "Character not in repertoire" },
    22022: { status: 400, msg: "Indicator overflow" },
    22023: { status: 400, msg: "Invalid parameter value" },
    22024: { status: 400, msg: "Unterminated C string" },
    22025: { status: 400, msg: "Invalid escape sequence" },
    22026: { status: 400, msg: "String data length mismatch" },
    22027: { status: 400, msg: "Trim error" },
    "2202E": { status: 400, msg: "Array subscript error" },
    "2202G": { status: 400, msg: "Invalid tablesample repeat" },
    "2202H": { status: 400, msg: "Invalid tablesample argument" },
    22030: { status: 400, msg: "Duplicate JSON object key value" },
    22031: {
      status: 400,
      msg: "Invalid argument for SQL/JSON datetime function",
    },
    22032: { status: 400, msg: "Invalid JSON text" },
    22033: { status: 400, msg: "Invalid SQL/JSON subscript" },
    22034: { status: 400, msg: "More than one SQL/JSON item" },
    22035: { status: 400, msg: "No SQL/JSON item" },
    22036: { status: 400, msg: "Non-numeric SQL/JSON item" },
    22037: { status: 400, msg: "Non-unique keys in a JSON object" },
    22038: { status: 400, msg: "Singleton SQL/JSON item required" },
    22039: { status: 400, msg: "SQL/JSON array not found" },
    "2203A": { status: 400, msg: "SQL/JSON member not found" },
    "2203B": { status: 400, msg: "SQL/JSON number not found" },
    "2203C": { status: 400, msg: "SQL/JSON object not found" },
    "2203D": { status: 400, msg: "Too many JSON array elements" },
    "2203E": { status: 400, msg: "Too many JSON object members" },
    "2203F": { status: 400, msg: "SQL/JSON scalar required" },
    "2203G": {
      status: 400,
      msg: "SQL/JSON item cannot be cast to target type",
    },
    "2201B": { status: 400, msg: "Invalid regular expression" },
    "2201W": { status: 400, msg: "Invalid row count in limit clause" },
    "2201X": { status: 400, msg: "Invalid row count in result offset clause" },
  };
  const errorResponse = psqlErrorCodes[err.code];
  if (errorResponse) {
    res.status(errorResponse.status).send({ msg: errorResponse.msg });
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.serverErrorHandler = (err, req, res) => {
  console.error(err, "<<<<<< ------ Unhandled error");
  res.status(500).send({ msg: "Internal server error" });
};

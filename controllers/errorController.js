const AppError = require("../utiles/appError");

const handleCastErrorDB = (err) => {
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate fileds value: ${err.keyValue.name}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message);

  return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
};

const handleJWTError = () => new AppError("Invalid JWT token!", 401);

const handleJWTExpiredError = () => {
  return new AppError("Your token has been expired. Please login again!", 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api"))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  else
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
      });
    }
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }

  res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  // it will catch you have decare err in function parameters

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
    console.error("ERROR 🔥", err);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    console.error("ERROR 🔥", error);
    sendErrorProd(error, req, res);
  }
};

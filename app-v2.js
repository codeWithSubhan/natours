const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utiles/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// MIDDLEWARE
app.use(express.json());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.static(`${__dirname}/public`));

// ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// it work for all routes but if route match one of above routes will stop looking
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(err);
  // if we pass anything in next func it will skip all middleware and jump to global error middleware

  // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  res.status(200).json({
    status: "success 😀",
    message: "I am Subhan",
  });
});

app.use((err, req, res, next) => {
  // it will catch you have decare err in function parameters

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// app.use(globalErrorHandler);

module.exports = app;

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utiles/appError");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//GLOBAL  MIDDLEWARE
app.use(helmet()); // Secure HTTP headers

const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://js.stripe.com",
];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://tile.openstreetmap.org",
  "https://fonts.googleapis.com/",
  "https://js.stripe.com/",
  "https://js.stripe.com",
];
const connectSrcUrls = [
  "https://unpkg.com",
  "https://tile.openstreetmap.org",
  "ws://localhost:1234",
  "https://js.stripe.com",
];
const fontSrcUrls = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "https://js.stripe.com", // Fixed URL format
];
const frameSrcUrls = [
  "https://js.stripe.com", // Explicitly allow framing from Stripe
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Restrictive default source
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [], // Restrictive object source
      imgSrc: ["'self'", "blob:", "data:", "https:"],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", ...frameSrcUrls], // Explicitly allow Stripe's frame
    },
  })
);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// 60 * 60 * 1000 1hour only 100 request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, Please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, reading data from body to req.body
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitaize against NoSQL query injection "email":{"$gt":""},
app.use(mongoSanitize());

// Data sanitaize against xss like js code or html input
app.use(xss());

// static file
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// ROUTES

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't Find ${req.originalUrl} URL!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../utiles/appError");
const catchAsyn = require("../utiles/catchAsyn");

exports.getOverview = catchAsyn(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsyn(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError("There is no tour with that name.", 404));

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsyn(async (req, res) => {
  res.status(200).render("login", {
    title: `Log into your account`,
  });
});

exports.getAccount = catchAsyn(async (req, res) => {
  res.status(200).render("account", {
    title: `Your account`,
  });
});

exports.getMyTours = catchAsyn(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.updateUserData = catchAsyn(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render("account", {
    title: `Your account`,
    user: updatedUser,
  });
});

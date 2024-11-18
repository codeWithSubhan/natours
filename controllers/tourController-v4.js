const AppError = require("../utiles/appError");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utiles/apiFeatures");
const catchAsyn = require("../utiles/catchAsyn");
const factory = require("./handleFactory");

async function aliasTopTours(req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,summary,difficulty";
  next();
}

const getAllTours = catchAsyn(async (req, res, next) => {
  const feature = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await feature.query;
  // console.log(tours);

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getTour = catchAsyn(async (req, res, next) => {
  // add reference id object to tour variable using populate('guides');
  // const tour = await Tour.findById(req.params.id).populate("guides");
  const tour = await Tour.findById(req.params.id).populate("reviews");
  console.log("tour", tour);
  if (!tour) return next(new AppError(`Can't find tour with that ID`, 404));

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const createTour = catchAsyn(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    results: Tour.length,
    data: {
      tours: newTour,
    },
  });
});

const updateTour = catchAsyn(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) return next(new AppError(`Can't find tour with that ID`, 404));

  res.status(201).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsyn(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError(`Can't find tour with that ID`, 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getTourStats = catchAsyn(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        // _id: "$difficulty",
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },

    {
      $sort: { numRatings: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsyn(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tour: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};

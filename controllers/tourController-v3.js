const Tour = require("../models/tourModel");
const APIFeatures = require("../utiles/apiFeatures");

async function aliasTopTours(req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,summary,difficulty";
  next();
}

async function getTourStats(req, res) {
  try {
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
      // {
      //   //not equal to
      //   $match: { _id: { $ne: "EASY" } },
      // },
    ]);

    res.status(200).json({
      status: "successs",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
}

async function getMonthlyPlan(req, res) {
  try {
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
      status: "successs",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
}

async function getAllTours(req, res) {
  //   console.log(req.query);
  try {
    const feature = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await feature.query;
    console.log(tours);

    res.status(200).json({
      status: "successs",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
}

async function getTour(req, res) {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: "successs",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
}

async function createTour(req, res) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "successs",
      results: Tour.length,
      data: {
        tours: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
}

async function updateTour(req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: false,
    });
    res.status(201).json({
      status: "successs",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
}

async function deleteTour(req, res) {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "successs",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
}

function checkID(req, res, next, val) {
  // const tour = tours.find((item) => item.id === Number(val));
  // if (!tour)
  //   return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  // next();
}
function checkBody(req, res, next) {
  console.log(req.body);
  if (!req.body.name || !req.body.price)
    return res
      .status(400)
      .json({ status: "fail", message: "Missing name or price" });
  next();
}

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};

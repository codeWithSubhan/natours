const Tour = require("../models/tourModel");

async function aliasTopTours(req, res, next) {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,summary,difficulty";
  next();
}

async function getAllTours(req, res) {
  console.log(req.query);
  try {
    //FILTER
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((item) => delete queryObj[item]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // let query = await Tour.find(JSON.parse(queryStr));
    let query = Tour.find(JSON.parse(queryStr));

    //SORT
    if (req.query.sort) {
      sortBy = req.query.sort.split(",").join(" ");
      // console.log(sortBy);                            // // ('duration price')
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //FIELD LIMIT
    if (req.query.fields) {
      const feilds = req.query.fields.split(",").join(" ");
      query = query.select(feilds);
      // only send fields property
    } else {
      query = query.select("-__v");
      // do sent "_v" property
      // or we can not send by simple select to false in modal schema
    }

    //PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("This page does not exist.");
    }

    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    const tours = await query;

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
    // const tour = await Tour.findOne({_id:req.params.id});

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
  // const newTour = new Tour({});
  // newTour.save();
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
      runValidators: true,
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
};

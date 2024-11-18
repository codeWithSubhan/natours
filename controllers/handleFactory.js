const APIFeatures = require("../utiles/apiFeatures");
const AppError = require("../utiles/appError");
const catchAsyn = require("../utiles/catchAsyn");

exports.deleteOne = (Model) =>
  catchAsyn(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(`No Document found with that ID`, 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsyn(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError(`No Document found with that ID`, 404));

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsyn(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsyn(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError(`No Document found with that ID`, 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsyn(async (req, res, next) => {
    // to allow nested get review on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await feature.query.explain();
    const doc = await feature.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

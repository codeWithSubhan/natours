const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must have above 1.0"],
      max: [5, "Rating must have below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // Parent referrencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must be belong to a Tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must be belong to User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // console.log("this", tourId);
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }

  console.log("tour:", stats);
};

// run on after created and saved
reviewSchema.post("save", function() {
  // we don't access Review before reviewSchema added hence  this.constructor: Review
  this.constructor.calcAverageRatings(this.tour);
  // post don't have next middleware
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({ path: "tour", select: "name" }).populate({
  //   path: "user",
  //   select: "name photo",
  // });
  this.populate({ path: "user", select: "name photo" });
  next();
});

// run only findOneAnd startsWidth
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
  // by only this can access it's old data
  // post don't have next middleware
});

// run only findOneAnd startsWidth
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
  //  this.findOne doesn't work here , query is already executed
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

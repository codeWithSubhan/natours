const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "tour must have a name"],
      maxLength: [40, "A Tour name must have less or equal to 40 characters"],
      minLength: [10, "A Tour name must have at least 10 characters"],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "tour must have a price"],
    },
    duration: {
      type: Number,
      required: [true, "tour must have a durations"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "tour must have a difficulty"],
      enum: {
        values: ["difficult", "easy", "medium"],
        message: "Defficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must have above 1.0"],
      max: [5, "Rating must have below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this only point current doc and only for create new one or save doc
        // if false it means error
        validator: function(val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, "tour must have a image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    //startLocation object
    startLocation: {
      type: {
        type: "String",
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: "String",
      description: "String",
    },

    // in order to create new document and emded in another document create array of object
    locations: [
      {
        type: {
          type: "String",
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: "String",
        description: "String",
        day: Number,
      },
    ],
    // emended data modeling
    // guides: Array,

    // child referrencing
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },

  //second option
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log(this);
  next();
});

// tourSchema.pre("save", function(next) {
//   console.log("Will save document...");
//   next();
// });

// tourSchema.post("save", function(doc, next) {
//   console.log(doc);
//   next();
// });

// tourSchema.pre("find", function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// tourSchema.pre(/^find/, function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.populate("guides");
  next();
});

// tourSchema.post(/^find/, function(next) {
//   console.log("after find executed");
//   next();
// });

// embended data modeling, it added  another document data on it's Object
// tourSchema.pre("save", async function(next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre("aggregate", function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

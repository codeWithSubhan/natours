const express = require("express");
const router = express.Router();
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require("../controllers/tourController");

const authController = require("../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

router.use("/:tourId/reviews", reviewRouter);

// prettier-ignore
router.route("/monthly-plan/:year").get(authController.protect, authController.restrictTo("admin", "lead-guide",'guide'), getMonthlyPlan);
// prettier-ignore
router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getTourWithin)
router.route("/distances/:latlng/unit/:unit").get(getDistances);

router.route("/tour-stats").get(getTourStats);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

// prettier-ignore
router
.route("/")
.get(getAllTours)
.post(authController.protect, authController.restrictTo("admin", "lead-guide"), createTour);

// prettier-ignore
router
  .route("/:id")
  .get(getTour)
  .patch(authController.protect, authController.restrictTo("admin", "lead-guide"), uploadTourImages,resizeTourImages, updateTour)
  .delete(authController.protect, authController.restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;

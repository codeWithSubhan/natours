const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/tourController");

// it simply ingnoar if not id pass if pass wrong id it stop next execution 😮
// router.param('id', checkID);

router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);

// router.route('/').get(getAllTours).post(checkBody, createTour);
router
  .route("/")
  .get(getAllTours)
  .post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;

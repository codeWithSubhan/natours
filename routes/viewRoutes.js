const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLooggedIn,
  viewController.getOverview
);
router.get("/tour/:slug", authController.isLooggedIn, viewController.getTour);
router.get("/login", authController.isLooggedIn, viewController.getLoginForm);
router.get("/me", authController.protect, viewController.getAccount);
// prettier-ignore
router.post("/submit-user-data",authController.protect, viewController.updateUserData);
router.get(
  "/my-tours",
  bookingController.createBookingCheckout,
  authController.protect,
  viewController.getMyTours
);

module.exports = router;

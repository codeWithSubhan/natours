const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/signup", authController.signup);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:resetToken", authController.resetPassword);

router.use(authController.protect);

// prettier-ignore
router.patch("/updateMe", userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

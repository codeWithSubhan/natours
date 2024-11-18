const User = require("../models/userModel");
const AppError = require("../utiles/appError");
const catchAsyn = require("../utiles/catchAsyn");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Email = require("../utiles/email");
const crypto = require("crypto");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

//========================================================= signup =========================================================//
// This function handles user signup. It creates a new user and sends a JSON response with a token and the user data.
//==========================================================================================================================//
exports.signup = catchAsyn(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
  // console.log("function end");
});

//========================================================= login =========================================================//
// This function handles user login and unAuthorize user to access protected routes.
//==========================================================================================================================//
exports.login = catchAsyn(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please provide email and password!", 400));

  // .select("+password"); in order to get cypted password
  const user = await User.findOne({ email }).select("+password");
  // console.log(user);

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password!", 401));

  createSendToken(user, 201, res);
});

//========================================================= log out =========================================================//
// This function handles user log out by simply change jwt cookies
//==========================================================================================================================//
exports.logout = catchAsyn(async (req, res) => {
  // res.cookie("jwt", "loggedout", {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
});

//========================================================= protect =========================================================//
// This function handle Authentication proccess to protect our routes and responsible send user data to next middleware
//===========================================================================================================================//
exports.protect = catchAsyn(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;

  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) return next(new AppError("Incorrect JWT!", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  const currentUser = await User.findById(decoded.id);
  // console.log("currentUser", currentUser);

  // check if pwd or ac is deleted
  if (!currentUser)
    return next(new AppError("User is not belong to this JWT token!", 401));

  if (await currentUser.changePasswordAfter(decoded.iat))
    return next(new AppError("Password recently changed!", 401));

  // grand access protected routes 🤪
  // req.user would be available for next middleware simple
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

//========================================================= isLooggedIn =========================================================//
// This function handle whether user is loggedIn in order to render ui
//===========================================================================================================================//
exports.isLooggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) return next();

  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) return next();

  if (await currentUser.changePasswordAfter(decoded.iat)) return next();

  // req.local is available in pug template, it is the way of send data to pug template
  res.locals.user = currentUser;
  next();
};

//========================================================= restrictTo =========================================================//
// This function handle Authorization [admin, guide, lead-guide, user] to access our certain routes.
//==============================================================================================================================//
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    next(new AppError("You don't have permission!", 403));
  next();
};

//========================================================= forgotPassword =========================================================//
// This function handle Authentication proccess to protect our routes and responsible send user data to next middleware
//==================================================================================================================================//
exports.forgotPassword = catchAsyn(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError("User not found!", 404));

  // generate reset Otp
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send to user gmail to forgot password
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    passwordResetExpires = undefined;
    passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    const msg = "Ther was an error sending the email. Please again later!";
    return next(new AppError(msg, 500));
  }
});

//========================================================= resetPassword =========================================================//
// This function handle generate resetToken and encrypted token.
//=================================================================================================================================//
exports.resetPassword = catchAsyn(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // passwordResetExpires: { $gt: Date.now() },
  // Date.now() mongoDB will create at the time of passwordResetExpires time

  if (!user) return next(new AppError("Token is invalid or has expired!", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

//========================================================= updatePassword =========================================================//
// This function handle update Password who is logged in.
//=================================================================================================================================//
exports.updatePassword = catchAsyn(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError("Your current password is wrong!", 401)); //401 unauthorize

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

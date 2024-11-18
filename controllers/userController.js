const multer = require("multer");

const User = require("../models/userModel");
const AppError = require("../utiles/appError");
const catchAsyn = require("../utiles/catchAsyn");
const factory = require("./handleFactory");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, "public/img/users");
//   },
//   filename: function(req, file, cb) {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Invalid image", 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsyn(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowFileds) => {
  const newObj = {};

  Object.keys(obj).forEach((item) => {
    if (allowFileds.includes(item)) newObj[item] = obj[item];
  });

  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "Routes is not defined yet created",
  });
};

exports.updateMe = catchAsyn(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError("This routes is not for updating password!", 400));

  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  console.log("filteredBody:", filteredBody);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, //return updated user obj
    runValidators: true,
  });
  // runValidators will run only for filteredBody object fileds

  console.log("updatedUser:", updatedUser);

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsyn(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: {
      user: null,
    },
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// For admin route
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

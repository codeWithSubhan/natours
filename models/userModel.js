const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Please provide your email!"],
    validate: [validator.isEmail, "Please provide us a valid email!"],
    unique: true,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minLength: 8,
    // do not send password to client but store in DB
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      // only run in create or post or save
      validator: function(el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

//========================================================= userSchema.pre =========================================================//
// This function run before only for save the doc or create new one and handle save encrypted password.
//==================================================================================================================================//
// Whenever you change the value of the certain field, the value of isModified will get changed. So user.isModified('password')
// will be true whenever 'password' gets modified. In the first case, the password value initially would have been empty or null,
// so it will return true in that case as well.
userSchema.pre("save", async function(next) {
  // first it will run
  // this point to object send by user and while schema mongoDB prev added _id in this object
  console.log("isModified(password)", this.isModified("password"));
  console.log("this", this);

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // by doing this mongoDB do not create property in Database 😀
  this.passwordConfirm = undefined;

  console.log("this", this);

  next();

  //mongoDB saved doc in DB like when we use :- save(), create(), etc.
});

userSchema.pre("save", async function(next) {
  // then it will run
  console.log(
    "isModified(password) || this.isNew",
    this.isModified("password"),
    this.isNew
  );

  // console.log("2nd this", this);

  // if not password modefined or not created new doc then add passwordChangedAt property
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//run before which startsWith find methods
userSchema.pre(/^find/, async function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//========================================================= createPasswordResetToken =========================================================//
// This function handle generate resetToken and encrypted token.
//============================================================================================================================================//
userSchema.methods.createPasswordResetToken = function() {
  // plain text resetToken which send to user's email
  const resetToken = crypto.randomBytes(32).toString("hex");

  // encrypted resetToken which save to db
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//========================================================= correctPassword =========================================================//
// This function added in userSchema and handle camparision btw encrypted password and user password.
//===================================================================================================================================//
userSchema.methods.correctPassword = async function(password, dbPassword) {
  return await bcrypt.compare(password, dbPassword);
};

//========================================================= changePasswordAfter =========================================================//
// This function handle camparision btw encrypted password and user password.
//=======================================================================================================================================//
userSchema.methods.changePasswordAfter = async function(JWTTimestamp) {
  // if not passwordChangedAt property means no password changed 🤷‍♂️
  if (!this.passwordChangedAt) return false;

  //convert passwordChangedAt to miliseconds
  const changedTimeStamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  // console.log(JWTTimestamp, changedTimeStamp);
  // isOld token using and password changed it is an error
  return JWTTimestamp < changedTimeStamp;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

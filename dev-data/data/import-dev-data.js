const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("./../../models/tourModel");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABSE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
  fs.readFileSync(`${__dirname}/tours.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log("DB connected successfully"));

//import tour data
async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data successfuly loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

//delete all tour, user, data
async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfuly deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

console.log(process.argv);

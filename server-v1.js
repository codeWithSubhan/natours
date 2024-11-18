const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABSE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
// console.log(process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => console.log("DB connected successfully"));

// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'tour must have a name'],
//     unique: true,
//   },
//   rating: {
//     type: Number,
//     default: 4.5,
//   },
//   price: {
//     type: Number,
//     required: [true, 'tour must have a price'],
//   },
// });

// const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'The Forest Halker.',
//   rating: 4.7,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => console.log('doc', doc))
//   .catch((err) => console.log('err', err));

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`App running on port http://localhost:${port}`)
);

// Mongoose is a popular object modeling tool for MongoDB, a NoSQL database.
// it provide us feature of crud operation with databse
// Mongoose allows you to define schemas with data types, validation rules, and more, making it easier to work with MongoDB.
// It provides a straightforward schema-based solution to model your application data.


// subhan from ndb node packeage managaer
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("Error:", err.name, err.message);
  console.log("Full Error:", err);
  process.exit(1);
});

const app = require("./app");

const DB = process.env.DATABSE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log("DB connected successfully"));
// .catch((err) => console.log("hi"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`App is running on http://localhost:${port}`)
);

// handle unhandledRejection (assynchronous code)
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

// handle uncaughtException (synchronous code)
// console.log(x);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const paymentRoute = require("./api/router/transaction");
const locationRoutes = require("./api/router/location");
const userRoutes = require("./api/router/user");

mongoose.connect(
  "mongodb+srv://maratasmiles9:putoflan123@intprogapi.41polww.mongodb.net/Itinerawise?retryWrites=true&w=majority&appName=intprogAPI"
);

mongoose.Promise = global.Promise;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use("/location", locationRoutes);
app.use("/payment", paymentRoute);
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");
const morgan = require("morgan");

const LocationDetails = require("./api/models/location");

app.use(express.json());
app.listen(3000);
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/details", (req, res, next) => {
  LocationDetails.find()
    .select("name price _id location time locationImage description")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        locationDetails: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            location: doc.location,
            time: doc.time,
            locationImage: doc.locationImage,
            description: doc.description,
            _id: doc.id,
            request: {
              type: "GET",
              url: "http://localhost:3000/details/" + doc._id,
            },
          };
        }),
      };
      if (docs.length > 0) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "No Entries Found",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

app.post(
  "/createLocation",
  upload.single("locationImage"),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: "No file uploaded",
        },
      });
    }

    console.log(req.file);
    const locationDetails = new LocationDetails({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price,
      location: req.body.location,
      time: req.body.time,
      locationImage: req.file.path,
      description: req.body.description,
    });
    locationDetails
      .save()
      .then((result) => {
        console.log(result);
        res.status(201).json({
          message: "Created details successfully",
          createdLocationDetails: {
            name: result.name,
            price: result.price,
            location: result.location,
            description: result.description,
            _id: result._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/details/" + result._id,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err.message,
        });
      });
  }
);

mongoose.connect(
  "mongodb+srv://maratasmiles9:putoflan123@intprogapi.41polww.mongodb.net/?retryWrites=true&w=majority&appName=intprogAPI"
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

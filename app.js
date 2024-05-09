const express = require("express");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");
const morgan = require("morgan");
const bcrypt = require("bcrypt");

const LocationDetails = require("./api/models/location");
const User = require("./api/models/user");

app.use(express.json());
app.listen(3000);
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
// para kuha sa detail sa location
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

app.post;
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});
//very gubooooooooooooooooootttttt

/// create details sa location
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
// para sign up ni
app.post("/signup", upload.single("profileImage"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: {
        message: "No file uploaded",
      },
    });
  }
  if (!req.body.password || req.body.password.trim().length === 0) {
    return res.status(400).json({
      message: "Password cannot be empty",
    });
  }
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              lastName: req.body.lastName,
              firstName: req.body.firstName,
              phoneNumber: req.body.phoneNumber,
              email: req.body.email,
              profileImage: req.file.path,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});
///// para log-in
app.get("/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          return res.status(200).json({
            message: "Auth successful",
            user: {
              _id: user._id,
              email: user.email,
              lastName: user.lastName,
              firstName: user.firstName,
              phoneNumber: user.phoneNumber,
              profileImage: user.profileImage,
            },
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

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

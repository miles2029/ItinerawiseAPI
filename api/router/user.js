const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const bcrypt = require("bcrypt");

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
  //reject  a file
  if ((file, mimetype === "image/jpeg" || file.mimetype === "image/png")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1025 * 5 },
});

router.post("/signup", upload.single("profileImage"), (req, res, next) => {
  let profileImagePath = "";
  if (req.file) {
    profileImagePath = req.file.path;
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
          message: "Email already exists",
        });
      } else {
        User.find({ username: req.body.username })
          .exec()
          .then((user) => {
            if (user.length >= 1) {
              return res.status(409).json({
                message: "Username already exists",
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
                    username: req.body.username,
                    profileImage: profileImagePath,
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
      }
    });
});

///// para log-in
router.post("/login", (req, res, next) => {
  const { email, username, password } = req.body;
  User.findOne({ $or: [{ email: email }, { username: username }] })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(password, user.password, (err, result) => {
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
              username: user.username,
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

router.patch(
  "/updateProfile/:id",
  upload.single("profileImage"),
  (req, res, next) => {
    const id = req.params.id;
    let profileImagePath = "";
    if (req.file) {
      profileImagePath = req.file.path;
    }

    const updateOps = {};
    if (req.body.firstName) {
      updateOps.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
      updateOps.lastName = req.body.lastName;
    }
    if (req.body.phoneNumber) {
      updateOps.phoneNumber = req.body.phoneNumber;
    }
    if (profileImagePath) {
      updateOps.profileImage = profileImagePath;
    }
    if (req.body.email) {
      // Check if the email is valid
      if (!validateEmail(req.body.email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
      updateOps.email = req.body.email;
    }
    if (req.body.password) {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        }
        updateOps.password = hash;
        updateUser();
      });
    } else {
      updateUser();
    }
    function updateUser() {
      User.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
          res.status(200).json({
            message: "Profile updated",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            error: err,
          });
        });
    }
  }
);

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

module.exports = router;
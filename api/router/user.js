const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res, next) => {
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
                  let newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                    lastName: req.body.lastName,
                    firstName: req.body.firstName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email,
                    username: req.body.username,
                    profileImage: req.body.profileImage,
                    password: hash,
                  });

                  newUser
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

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(`Fetching user with ID: ${id}`); // Log the ID being fetched
  User.findById(id)
    .select("lastName firstName phoneNumber email username profileImage")
    .exec()
    .then((doc) => {
      console.log("From Database:", doc);
      if (doc) {
        res.status(200).json({
          success: true,
          data: doc,
          request: {
            type: "GET",
          },
        });
      } else {
        console.log("No valid entry found for provided ID");
        res.status(404).json({
          success: false,
          message: "No valid entry found for provided ID",
        });
      }
    })
    .catch((err) => {
      console.error("Error fetching user:", err.message); // Log the error message
      console.error("Stack trace:", err.stack); // Log the stack trace for more details
      res.status(500).json({ success: false, error: "Internal server error" });
    });
});

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

router.patch("/updateProfile/:id", async (req, res) => {
  const id = req.params.id;
  const updateOps = {};

  for (const key in req.body) {
    if (key === "email" && !validateEmail(req.body[key])) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }
    updateOps[key] = req.body[key];
  }

  if (updateOps.password) {
    // Hash the new password
    try {
      const hashedPassword = await bcrypt.hash(updateOps.password, 10);
      updateOps.password = hashedPassword;
    } catch (err) {
      return res.status(500).json({
        error: "Failed to hash the password",
      });
    }
  }

  try {
    // Update the user
    await User.updateOne({ _id: id }, { $set: updateOps });

    // Find the updated user
    const updatedUser = await User.findById(id).exec();
    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.status(200).json({
      message: "User Updated",
      updatedUser: {
        _id: updatedUser._id,
        lastName: updatedUser.lastName,
        firstName: updatedUser.firstName,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message || "An error occurred",
    });
  }
});

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

router.delete("/deleteUser/:id", (req, res, next) => {
  const id = req.params.id;

  User.findById(id)
    .exec()
    .then((doc) => {
      if (!doc) {
        return res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }

      return User.deleteOne({ _id: id })
        .exec()
        .then(() => {
          res.status(200).json({
            message: "User deleted",
            _id: doc._id,
            lastName: doc.lastName,
            firstName: doc.firstName,
            phoneNumber: doc.phoneNumber,
            email: doc.email,
            username: doc.username,
          });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;

module.exports = router;

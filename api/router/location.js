const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const LocationDetails = require("../models/location");

router.post("/create", (req, res, next) => {
  const locationDetails = new LocationDetails({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    location: req.body.location,
    time: req.body.time,
    locationImage: req.body.locationImage,
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
});

router.get("/details", (req, res, next) => {
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

router.get("/details/:id", (req, res, next) => {
  const id = req.params.id; // Get the ID from the request parameters
  LocationDetails.findById(id) // Use findById to find a document by its ID
    .select("name price _id location time locationImage description")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          locationDetails: {
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
          },
        });
      } else {
        res.status(404).json({
          message: "No Entry Found for Provided ID",
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

module.exports = router;

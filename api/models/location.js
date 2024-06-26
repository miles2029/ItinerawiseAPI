const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: String, required: true },
  location: { type: String, required: true },
  time: { type: String, required: true },
  locationImage: { type: String, required: true },
  description: { type: String, required: true },
  latitude: { type: String },
  longitude: { type: String },
});

module.exports = mongoose.model("Location Details", locationSchema);

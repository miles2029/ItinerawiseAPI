const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  lastName: {
    type: String,
    set: (value) => value.charAt(0).toUpperCase() + value.slice(1),
  },
  firstName: {
    type: String,
    set: (value) => value.charAt(0).toUpperCase() + value.slice(1),
  },
  phoneNumber: String,
  email: {
    type: String,
    required: true,
    unique: true,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  username: { type: String, required: true, unique: true },
  profileImage: {
    type: String,
    default: "",
  },
  password: { type: String, required: true },
});

module.exports = mongoose.model("users", userSchema);

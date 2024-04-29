const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },

  price: { type: Number, required: true },
  location: {type:String, required:true},
  time: {type:String, required:true},
  locationImage:{type:String,required:true},
  description: {type:String, required:true}

});

module.exports = mongoose.model("Product", productSchema);
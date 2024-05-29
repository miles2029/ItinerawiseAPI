const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentDetailsSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  date: { type: String },
  amount: { type: String },
  paymentMethod: { type: String },
});

const PaymentDetails = mongoose.model("PaymentDetails", paymentDetailsSchema);

module.exports = PaymentDetails;

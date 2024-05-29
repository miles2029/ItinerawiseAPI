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
});

const PaymentDetails = mongoose.model("PaymentDetails", paymentDetailsSchema);

module.exports = PaymentDetails;

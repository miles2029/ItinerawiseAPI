const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentDetailsSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
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
  clientString: { type: String },
});

const PaymentDetails = mongoose.model("Payment Details", paymentDetailsSchema);

module.exports = PaymentDetails;

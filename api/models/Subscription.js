const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  productName: String,
  price: Number,
  userId: String,
  cardholderName: String,
  email: String,
  paymentMethodId: String,
  clientSecret: String,
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;

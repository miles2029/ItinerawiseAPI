const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);

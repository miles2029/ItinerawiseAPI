const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Subscription = require("../models/Subscription");

router.use(bodyParser.json());

router.post("/create-subscription", async (req, res) => {
  const { productName, price, userId, cardholderName, email, paymentMethodId } =
    req.body;

  try {
    // Create a new customer
    const customer = await stripe.customers.create({
      email: email,
      name: cardholderName,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Define the priceId
    const priceId = "price_1PLXFk2MA5ECHB0FiahruIHv";

    // Create a new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save subscription details to MongoDB
    const newSubscription = new Subscription({
      userId,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      productName,
      price,
    });

    await newSubscription.save();

    res.json({ subscriptionId: subscription.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

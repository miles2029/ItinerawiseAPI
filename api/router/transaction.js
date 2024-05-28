const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const stripe = require("stripe")(
  "sk_test_51PF9Fd2MA5ECHB0FyoeqK8hlIPTkaCweJl657amxGwEHsyYh8bUPEuSi4niFFx44R59FSnNxCJRi5nDGf1n3ObAa00UJ1u7bw8"
);
const Subscription = require("../models/Subscription");

// Ensure the app uses bodyParser middleware
router.use(bodyParser.json());

router.post("/create-subscription", async (req, res) => {
  const { productName, price, userId, cardholderName, email, paymentMethodId } =
    req.body;

  try {
    const customer = await stripe.customers.create({
      email: email,
      name: cardholderName,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const priceId = "price_1PLXFk2MA5ECHB0FiahruIHv";

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

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

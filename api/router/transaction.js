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
    // Fetch PaymentIntent client secret from your backend
    const { clientSecret } = await fetchPaymentIntentFromBackend(
      price,
      paymentMethodId
    );

    // Save subscription details to the Subscription collection
    const subscription = new Subscription({
      productName,
      price,
      userId,
      cardholderName,
      email,
      paymentMethodId,
      clientSecret,
    });
    await subscription.save();

    res.json({
      clientSecret: clientSecret,
      productName: productName,
      price: price,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/get-payment-intent", async (req, res) => {
  const { price, paymentMethodId } = req.body;

  try {
    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "usd",
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
    });

    // Return the client secret to the client
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchPaymentIntentFromBackend(price, paymentMethodId) {
  // Make a request to your backend to fetch the PaymentIntent client secret
  const response = await fetch(
    "https://itinerawiseapi-xk5b.onrender.com/payment/get-payment-intent",
    {
      method: "POST",
      body: JSON.stringify({ price, paymentMethodId }),
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await response.json();
  return data;
}

module.exports = router;

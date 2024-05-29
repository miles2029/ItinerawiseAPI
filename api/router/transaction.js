const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PaymentDetails = require("../models/PaymentDetails");

router.use(bodyParser.json());

router.post("/create-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // Amount in the smallest currency unit (e.g., cents for USD)
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    // Extract date and amount from paymentIntent
    const { created, amount } = paymentIntent;

    // Format date in a readable format
    const date = new Date(created * 1000).toISOString();

    res.json({
      client_secret: paymentIntent.client_secret,
      date: date,
      amount: amount,
      paymentMethod: paymentIntent.automatic_payment_methods,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post("/save-payment-details", async (req, res) => {
  const { userId, fullName, date, amount, clientString } = req.body;

  if (!userId || !fullName || !clientString) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const paymentDetails = new PaymentDetails({
    userId,
    fullName,
    date,
    amount,
    clientString,
  });

  try {
    const savedPaymentDetails = await paymentDetails.save();
    res.status(201).json(savedPaymentDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

module.exports = router;

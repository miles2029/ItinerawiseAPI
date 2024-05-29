const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PaymentDetails = require("../models/PaymentDetails");
const mongoose = require("mongoose");

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
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post("/save-payment-details", async (req, res) => {
  const paymentDetails = new PaymentDetails({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body.userId,
    fullName: req.body.fullName,
    date: req.body.date,
    amount: req.body.amount,
    clientString: req.body.clientString,
  });
  paymentDetails
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created details successfully",
        paymentDetails: {
          _id: result._id,
          userId: result.userId,
          fullName: result.fullName,
          date: result.date,
          amount: result.amount,
          clientString: result.clientString,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err.message,
      });
    });
});

module.exports = router;

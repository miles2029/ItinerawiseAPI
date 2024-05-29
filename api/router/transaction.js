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
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post("/save-payment/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const fullName = req.body.fullName; // Assuming the full name is sent in the request body
    const paymentDetails = new PaymentDetails({
      userId: userId,
      fullName: fullName,
      ...req.body,
    });
    await paymentDetails.save();
    res.status(200).send("Payment details saved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to save payment details");
  }
});

module.exports = router;

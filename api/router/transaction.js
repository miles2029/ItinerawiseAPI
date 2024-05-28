const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51PF9Fd2MA5ECHB0FyoeqK8hlIPTkaCweJl657amxGwEHsyYh8bUPEuSi4niFFx44R59FSnNxCJRi5nDGf1n3ObAa00UJ1u7bw8"
);
const Transaction = require("../models/transactionDetails");

router.post("/create-checkout-session", async (req, res) => {
  const { productName, price, userId, cardholderName } = req.body;

  const successUrl = `${req.protocol}://${req.get("3001")}/success`;
  const cancelUrl = `${req.protocol}://${req.get("3001")}/cancel`;

  // Create a checkout session using Stripe API
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName || "Sample Product",
          },
          unit_amount: price || 100,
        },
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      cardholderName,
    },
  });

  // Return the session ID as JSON response
  res.json({ id: session.id });
});

router.get("/checkout-success", (req, res) => {
  // Handle successful checkout
  res.send("Payment succeeded");
});

router.get("/checkout-cancel", (req, res) => {
  // Handle canceled checkout
  res.send("Payment canceled");
});

// Webhook endpoint to handle Stripe events
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        "sk_test_51PF9Fd2MA5ECHB0FyoeqK8hlIPTkaCweJl657amxGwEHsyYh8bUPEuSi4niFFx44R59FSnNxCJRi5nDGf1n3ObAa00UJ1u7bw8"
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Extract relevant details
      const transactionDetails = {
        userId: session.metadata.userId,
        cardholderName: session.metadata.cardholderName,
        timestamp: new Date(session.created * 1000),
        amount: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
      };

      // Save to MongoDB
      const transaction = new Transaction(transactionDetails);
      await transaction.save();

      console.log("Transaction saved:", transaction);
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;

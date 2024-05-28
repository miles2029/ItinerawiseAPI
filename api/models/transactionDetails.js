const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cardholderName: { type: String, required: true },
  timestamp: { type: Date, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;

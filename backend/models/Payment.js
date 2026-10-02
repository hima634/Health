const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'SUCCESS' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Direct simulated payment
exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId, simulateSuccess } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'bookingId is required' });

    const booking = mongoose.Types.ObjectId.isValid(bookingId)
      ? await Booking.findById(bookingId)
      : await Booking.findOne({ bookingId });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isSuccess = simulateSuccess !== false;
    const newStatus = isSuccess ? 'CONFIRMED' : 'FAILED';
    booking.status = newStatus;
    await booking.save();

    const txnId = `TXN_${Date.now()}`;
    await Payment.create({
      transactionId: txnId,
      bookingId: booking.bookingId || booking._id.toString(),
      amount: booking.amount,
      status: isSuccess ? 'SUCCESS' : 'FAILED'
    });

    res.json({
      success: true,
      message: isSuccess ? 'Payment received! Booking confirmed.' : 'Payment failed. Please retry.',
      data: {
        bookingId: booking.bookingId || booking._id,
        transactionId: txnId,
        status: newStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Idempotent webhook receiver
exports.handleWebhook = async (req, res) => {
  try {
    const { transactionId, bookingId, status, amount } = req.body;

    if (!transactionId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing transactionId or bookingId in webhook payload'
      });
    }

    // 1. Idempotency Check: Already processed?
    const existing = await Payment.findOne({ transactionId });
    if (existing) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: 'Duplicate webhook detected. Already processed safely without double charge.',
        data: existing
      });
    }

    // 2. Record payment
    const payment = await Payment.create({
      transactionId,
      bookingId: String(bookingId),
      amount: Number(amount) || 0,
      status: status || 'SUCCESS'
    });

    // 3. Update Booking
    const booking = mongoose.Types.ObjectId.isValid(bookingId)
      ? await Booking.findById(bookingId)
      : await Booking.findOne({ bookingId });

    if (booking) {
      booking.status = status === 'SUCCESS' ? 'CONFIRMED' : 'FAILED';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      isDuplicate: false,
      message: 'Payment webhook processed successfully.',
      data: payment
    });
  } catch (err) {
    // 4. Catch race condition duplicate index error (MongoDB 11000)
    if (err.code === 11000) {
      const existing = await Payment.findOne({ transactionId: req.body.transactionId });
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: 'Duplicate webhook intercepted via unique database constraint.',
        data: existing
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get payments for a booking
exports.getPaymentsForBooking = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ bookingId: req.params.bookingId }, { transactionId: req.params.bookingId }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

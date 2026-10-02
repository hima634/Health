const express = require('express');
const router = express.Router();
const { simulatePayment, handleWebhook, getPaymentsForBooking } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Protected: User payment simulation and payment history
router.post('/simulate', protect, simulatePayment);
router.get('/:bookingId', protect, getPaymentsForBooking);

// Public: Gateway webhook endpoint (must be publicly reachable by gateway)
router.post('/webhook', handleWebhook);

module.exports = router;

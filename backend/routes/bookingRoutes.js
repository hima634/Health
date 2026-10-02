const express = require('express');
const router = express.Router();
const { getBookings, getBookingById, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

// All booking routes are protected with JWT authentication
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Test = require('../models/Test');
const Centre = require('../models/Centre');

// List bookings
exports.getBookings = async (req, res) => {
  try {
    const query = req.user ? { $or: [{ user: req.user.id }, { user: null }] } : {};
    const bookings = await Booking.find(query)
      .populate('test')
      .populate('centre')
      .sort({ createdAt: -1 });

    const formatted = bookings.map(b => {
      const obj = b.toObject();
      if (!obj.test && obj.testName) obj.test = { name: obj.testName, price: obj.amount };
      if (!obj.centre && obj.centreName) obj.centre = { name: obj.centreName };
      return obj;
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    let booking;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      booking = await Booking.findById(req.params.id).populate('test').populate('centre');
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: req.params.id }).populate('test').populate('centre');
    }
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { testId, centreId, appointmentDate, appointmentTime, patientName, patientPhone, patientNotes } = req.body;

    if (!testId || !centreId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Please provide test, centre, date, and time slot.' });
    }

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ success: false, message: 'Selected test not found' });

    const centre = await Centre.findById(centreId);
    if (!centre) return res.status(404).json({ success: false, message: 'Selected centre not found' });

    // Generate human-friendly booking ID like BK-1025
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-${randomNum}`;

    const booking = await Booking.create({
      bookingId,
      patientName: patientName || (req.user ? req.user.name : 'Patient'),
      patientPhone: patientPhone || '+91 98765 00000',
      patientNotes: patientNotes || '',
      test: test._id,
      testName: test.name,
      centre: centre._id,
      centreName: centre.name,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      amount: test.price,
      status: 'PENDING',
      user: req.user ? req.user.id : null
    });

    const populated = await Booking.findById(booking._id).populate('test').populate('centre');

    res.status(201).json({
      success: true,
      message: `Appointment reserved successfully! Booking ID: ${bookingId}`,
      data: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = mongoose.Types.ObjectId.isValid(req.params.id)
      ? await Booking.findById(req.params.id)
      : await Booking.findOne({ bookingId: req.params.id });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = 'CANCELLED';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

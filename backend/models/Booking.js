const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true }, // e.g. BK-1025
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientNotes: { type: String, default: '' },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  testName: { type: String },
  centre: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' },
  centreName: { type: String },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'],
    default: 'PENDING'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

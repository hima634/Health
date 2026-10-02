const mongoose = require('mongoose');

const centreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, default: '+91 98765 43210' },
  timings: { type: String, default: '7:00 AM - 8:00 PM' }
}, { timestamps: true });

module.exports = mongoose.model('Centre', centreSchema);

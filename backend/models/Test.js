const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  sampleRequired: { type: String, default: 'Blood' },
  fastingRequired: { type: Boolean, default: false },
  turnaroundHours: { type: Number, default: 24 }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);

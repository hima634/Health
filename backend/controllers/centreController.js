const Centre = require('../models/Centre');

// Get all diagnostic centres
exports.getCentres = async (req, res) => {
  try {
    const centres = await Centre.find();
    res.json({ success: true, data: centres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single centre by ID
exports.getCentreById = async (req, res) => {
  try {
    const centre = await Centre.findById(req.params.id);
    if (!centre) return res.status(404).json({ success: false, message: 'Centre not found' });
    res.json({ success: true, data: centre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

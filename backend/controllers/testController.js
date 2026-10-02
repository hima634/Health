const Test = require('../models/Test');
const Centre = require('../models/Centre');

// Get all diagnostic tests
exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find();
    const centres = await Centre.find();

    // Attach centres list to each test for frontend compatibility
    const data = tests.map(test => {
      const obj = test.toObject();
      obj.centres = centres;
      return obj;
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const centres = await Centre.find();
    const result = test.toObject();
    result.centres = centres;

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

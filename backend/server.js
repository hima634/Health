require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Models for auto-seeding check
const Centre = require('./models/Centre');
const Test = require('./models/Test');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Import Routes
const centreRoutes = require('./routes/centreRoutes');
const testRoutes = require('./routes/testRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/centres', centreRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date() });
});

// Auto-seed default centres & tests if database is empty
const seedDefaultsIfEmpty = async () => {
  try {
    const centreCount = await Centre.countDocuments();
    if (centreCount === 0) {
      await Centre.insertMany([
        {
          name: 'Apollo Diagnostics',
          city: 'Bengaluru (Indiranagar)',
          address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
          phone: '+91 80 4912 3456',
          timings: '7:00 AM - 8:00 PM'
        },
        {
          name: 'Thyrocare Wellness Centre',
          city: 'Bengaluru (Koramangala)',
          address: '80 Feet Road, 4th Block, Koramangala',
          phone: '+91 80 2553 7890',
          timings: '7:30 AM - 7:30 PM'
        },
        {
          name: 'City Health Diagnostic Lab',
          city: 'Bengaluru (Whitefield)',
          address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield',
          phone: '+91 80 6789 1234',
          timings: '8:00 AM - 9:00 PM'
        }
      ]);
      console.log('Seeded default centres.');
    }

    const testCount = await Test.countDocuments();
    if (testCount === 0) {
      await Test.insertMany([
        {
          name: 'Complete Blood Count (CBC)',
          code: 'CBC',
          price: 300,
          description: 'Checks red & white blood cells, platelets, and hemoglobin to detect infections and anemia.',
          sampleRequired: 'Blood (EDTA)',
          fastingRequired: false,
          turnaroundHours: 12
        },
        {
          name: 'Lipid Profile (Cholesterol)',
          code: 'LIPID',
          price: 500,
          description: 'Measures total cholesterol, HDL (good), LDL (bad), and triglycerides for cardiac health.',
          sampleRequired: 'Blood (Serum)',
          fastingRequired: true,
          turnaroundHours: 24
        },
        {
          name: 'Thyroid Profile (T3, T4, TSH)',
          code: 'THYROID',
          price: 450,
          description: 'Evaluates thyroid gland activity and metabolic hormone levels.',
          sampleRequired: 'Blood (Serum)',
          fastingRequired: false,
          turnaroundHours: 24
        },
        {
          name: 'Diabetes Screen (HbA1c & Fasting)',
          code: 'DIAB',
          price: 400,
          description: 'Tests 3-month average blood glucose level for accurate diabetes monitoring.',
          sampleRequired: 'Blood',
          fastingRequired: true,
          turnaroundHours: 12
        },
        {
          name: 'Liver Function Test (LFT)',
          code: 'LFT',
          price: 600,
          description: 'Assesses liver health, bilirubin, enzymes (SGOT/SGPT), and protein levels.',
          sampleRequired: 'Blood',
          fastingRequired: false,
          turnaroundHours: 24
        }
      ]);
      console.log('Seeded default tests.');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const userPassword = await bcrypt.hash('UserPassword123', 10);
      const adminPassword = await bcrypt.hash('AdminPassword123', 10);

      await User.insertMany([
        {
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          password: userPassword,
          role: 'user'
        },
        {
          name: 'System Admin',
          email: 'admin@evehealth.com',
          password: adminPassword,
          role: 'admin'
        }
      ]);
      console.log('Seeded demo users.');
    }
  } catch (err) {
    console.error('Seeding check error:', err.message);
  }
};

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultsIfEmpty();
    app.listen(PORT, () => {
      console.log(`🚀 EveHealth Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
  }
};

startServer();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mini CRM API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-crm';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Seed admin user if not exists
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@example.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      await Admin.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword
      });
      console.log('✅ Admin user created');
    }

    // Seed sample leads if empty
    const Lead = require('./models/Lead');
    const count = await Lead.countDocuments();
    if (count === 0) {
      await Lead.insertMany([
        { name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543210', source: 'Website', status: 'new', message: 'Interested in web design services', notes: [] },
        { name: 'Rahul Verma', email: 'rahul@example.com', phone: '9123456780', source: 'Referral', status: 'contacted', message: 'Need an e-commerce store', notes: [{ text: 'Called on Monday, send proposal', createdAt: new Date() }] },
        { name: 'Anjali Mehta', email: 'anjali@example.com', phone: '9988776655', source: 'Social Media', status: 'converted', message: 'Digital marketing campaign', notes: [{ text: 'Signed contract for 3 months', createdAt: new Date() }] },
        { name: 'Vikram Patel', email: 'vikram@example.com', phone: '9911223344', source: 'Website', status: 'new', message: 'Looking for SEO services', notes: [] },
        { name: 'Sneha Gupta', email: 'sneha@example.com', phone: '9876501234', source: 'Email Campaign', status: 'contacted', message: 'Mobile app development inquiry', notes: [{ text: 'Sent initial quote via email', createdAt: new Date() }] }
      ]);
      console.log('✅ Sample leads seeded');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

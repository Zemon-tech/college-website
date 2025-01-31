require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@usict.com' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      console.log('Admin password reset successfully');
      console.log('New password: admin123');
    } else {
      console.log('Admin user not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

resetAdminPassword(); 
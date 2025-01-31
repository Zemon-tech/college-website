require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkAndCreateAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@usict.com' });
    
    if (adminExists) {
      console.log('Admin user exists:', {
        email: adminExists.email,
        name: adminExists.name,
        role: adminExists.role,
        id: adminExists._id
      });
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@usict.com',
        password: 'admin123',
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
      console.log('Email: admin@usict.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkAndCreateAdmin(); 
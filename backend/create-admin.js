const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmtrust');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@farmtrust.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@farmtrust.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user with plain password - the pre-save middleware will hash it
    const admin = new User({
      name: 'FarmTrust Admin',
      email: 'admin@farmtrust.com',
      password: 'admin123', // Plain password - will be hashed by pre-save middleware
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@farmtrust.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: admin');

    // Verify the password works
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
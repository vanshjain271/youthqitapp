/**
 * YouthQit - Admin Seed Script
 * Creates initial ADMIN user
 */

// 🔴 ABSOLUTELY REQUIRED: Load env FIRST
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

// 🔍 DEBUG (will print once)
console.log('==========================================');
console.log('YouthQit - Admin Seed Script');
console.log('==========================================');
console.log('DEBUG ENV FILE:', path.resolve(__dirname, '../../.env'));
console.log('DEBUG MONGO_URI:', process.env.MONGO_URI);
console.log('------------------------------------------');

const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    const adminPhone = process.env.ADMIN_PHONE || '9999999999';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    const existingAdmin = await User.findOne({
      phone: adminPhone,
      role: 'ADMIN',
    });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: adminName,
      phone: adminPhone,
      role: 'ADMIN',
      isActive: true,
    });

    console.log('✅ Admin created successfully');
    console.log({
      id: admin._id.toString(),
      name: admin.name,
      phone: admin.phone,
      role: admin.role,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();


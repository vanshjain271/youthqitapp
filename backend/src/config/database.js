const mongoose = require('mongoose');
const path = require('path');

// 🔒 Force-load env here as well (important)
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    console.log('DEBUG Mongo URI:', mongoUri);

    if (!mongoUri) {
      throw new Error('MONGO_URI is undefined');
    }

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };


/**
 * Run: node scripts/seedAdmin.js
 * Creates an admin user if none exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env or below.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resolvenow';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@resolvenow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const exists = await User.findOne({ role: 'admin' });
  if (exists) {
    console.log('Admin user already exists:', exists.email);
    process.exit(0);
    return;
  }
  await User.create({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    isVerified: true,
  });
  console.log('Admin created:', ADMIN_EMAIL, '(password:', ADMIN_PASSWORD + ')');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

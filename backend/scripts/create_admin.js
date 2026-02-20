
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'admin@resolvenow.com';
        const password = 'admin123';

        // Check if admin exists
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('Admin already exists. No action taken.');
            console.log(`Email: ${email}`);
            console.log('If you forgot the password, please delete the user from DB and run this script again.');
        } else {
            await User.create({
                fullName: 'System Admin',
                email,
                password,
                role: 'admin',
                isApproved: true,
                isVerified: true
            });
            console.log('-----------------------------------');
            console.log('Admin Account Created Successfully!');
            console.log('-----------------------------------');
            console.log(`Role:     Admin`);
            console.log(`Email:    ${email}`);
            console.log(`Password: ${password}`);
            console.log('-----------------------------------');
            console.log('You can now login at http://localhost:3000/login');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();

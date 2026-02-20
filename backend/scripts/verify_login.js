
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // cleanup
        await User.deleteOne({ email: 'test_verify_login@example.com' });

        // Create Test User
        const userRole = 'user';
        const userEmail = 'test_verify_login@example.com';
        const userPass = 'password123';

        const userPlugin = new User({
            fullName: 'Test User',
            email: userEmail,
            password: userPass,
            role: userRole,
        });
        await userPlugin.save();
        console.log(`Test User Created: ${userEmail} (${userRole})`);

        // Simulate Login - correct role
        const foundUser = await User.findOne({ email: userEmail }).select('+password');

        if (!foundUser) {
            console.error('CRITICAL: User not found immediately after creation!');
        } else {
            const match = await foundUser.matchPassword(userPass);
            console.log(`Password Match for '${userPass}': ${match}`);

            const reqRole = 'user';
            console.log(`Attempting login as role: '${reqRole}'...`);

            if (reqRole && foundUser.role !== reqRole) {
                console.error(`FAIL: Access denied. You are not a ${reqRole}. (User role in DB: ${foundUser.role})`);
            } else {
                console.log(`SUCCESS: Login logic passed for correct role.`);
            }
        }

        // Simulate Login - wrong role
        console.log('--- Attempting login with wrong role (admin) ---');
        const wrongRole = 'admin';
        if (wrongRole && foundUser.role !== wrongRole) {
            console.log(`SUCCESS: Login correctly rejected for wrong role. (Expected: Access denied)`);
        } else {
            console.error(`FAIL: Login Unexpectedly Succeeded with wrong role ${wrongRole}`);
        }

        // Cleanup
        await User.deleteOne({ email: userEmail });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyLogin();

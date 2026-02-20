
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testLoginFailure = async () => {
    // URL of running dev server
    const URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('3000', '5000') + '/api/auth/login' : 'http://localhost:5000/api/auth/login';

    console.log(`Testing Login Failure against ${URL}`);

    // Create user first
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'test_fail@example.com';
    const password = 'password123';

    await User.deleteOne({ email });
    await User.create({
        fullName: 'Test Fail',
        email,
        password,
        role: 'user'
    });

    try {
        // Test 1: Wrong Password
        console.log('Test 1: Wrong Password');
        const res1 = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'wrongpassword', role: 'user' })
        });
        const data1 = await res1.json();
        if (res1.status === 401) {
            console.log('SUCCESS: Correctly rejected wrong password');
        } else {
            console.error(`FAIL: Expected 401, got ${res1.status}. Msg: ${data1.message}`);
        }

        // Test 2: Wrong Email
        console.log('Test 2: Wrong Email');
        const res2 = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'wrong@example.com', password, role: 'user' })
        });
        const data2 = await res2.json();
        if (res2.status === 401) {
            console.log('SUCCESS: Correctly rejected wrong email');
        } else {
            console.error(`FAIL: Expected 401, got ${res2.status}. Msg: ${data2.message}`);
        }

    } catch (err) {
        console.error('Fetch Error:', err.message);
    } finally {
        await User.deleteOne({ email });
        mongoose.disconnect();
    }
};

testLoginFailure();

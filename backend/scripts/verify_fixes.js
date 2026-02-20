
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyFixes = async () => {
    // URL of running dev server
    const URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('3000', '5000') + '/api/auth/login' : 'http://localhost:5000/api/auth/login';

    console.log(`Verifying fixes against ${URL}`);

    // Create user
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'test_fixes@example.com';
    const password = 'password123';
    const role = 'user';

    await User.deleteOne({ email });
    await User.create({
        fullName: 'Test Fixes',
        email,
        password,
        role
    });

    try {
        // Test 1: Correct Login
        console.log('Test 1: Correct Login');
        const res1 = await fetch(URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        if (res1.ok) console.log('PASS: Correct login works.');
        else console.error(`FAIL: Correct login failed. ${res1.status}`);

        // Test 2: Role Mismatch
        console.log('Test 2: Role Mismatch (Expected Failure)');
        const res2 = await fetch(URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'admin' })
        });
        if (res2.status === 403) console.log('PASS: Role mismatch correctly blocked (403).');
        else console.error(`FAIL: Role mismatch not blocked properly. Status: ${res2.status}`);

        // Test 3: Email Trimming (Space at end)
        console.log('Test 3: Email Trimming (Space at end)');
        const res3 = await fetch(URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email + ' ', password, role })
        });
        if (res3.ok) console.log('PASS: Trimming works.');
        else console.error(`FAIL: Trimming failed. Status: ${res3.status}`);

        // Test 4: Email Case Insensitivity (Upper case)
        console.log('Test 4: Email Case Insensitivity');
        const res4 = await fetch(URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.toUpperCase(), password, role })
        });
        if (res4.ok) console.log('PASS: Case insensitivity works.');
        else console.error(`FAIL: Case insensitivity failed. Status: ${res4.status}`);

    } catch (err) {
        console.error('Fetch Error:', err.message);
    } finally {
        await User.deleteOne({ email });
        mongoose.disconnect();
    }
};

verifyFixes();

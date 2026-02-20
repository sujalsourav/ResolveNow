
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// We need to actually CALL the controller or simulate the logic.
// Since we modified the controller file text, we can't easily import the *modified* controller unless we restart the server or reload.
// But we can check the file content or trust that `nodemon` restarted the server.
// The best way is to use `fetch` against the running server.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testLoginEndpoint = async () => {
    // URL of running dev server
    const URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('3000', '5000') + '/api/auth/login' : 'http://localhost:5000/api/auth/login';

    console.log(`Testing Login against ${URL}`);

    // First, ensure a test user exists via direct DB access (quickest)
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'test_relaxed@example.com';
    const password = 'password123';

    await User.deleteOne({ email });
    await User.create({
        fullName: 'Test Relaxed',
        email,
        password, // The model handles hashing in pre-save
        role: 'user'
    });
    console.log('Test User Created (Role: user)');

    // Now try to login via Fetch with WRONG role (admin)
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                role: 'admin' // INTENTIONAL MISMATCH
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS: Login succeeded despite role mismatch!');
            console.log('Returned User Role:', data.role);
        } else {
            console.error('FAILURE: Login failed with status', response.status);
            console.error('Message:', data.message);
        }

    } catch (err) {
        console.error('Fetch Error:', err.message);
    } finally {
        await User.deleteOne({ email });
        mongoose.disconnect();
    }
};

testLoginEndpoint();


import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyCaseSensitivity = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'test_lower@example.com';

        await User.deleteOne({ email });
        // Create user (schema will lowercase it if passed as upper? let's test)
        await User.create({
            fullName: 'Test Lower',
            email: 'Test_Lower@Example.com', // Mixed case input
            password: 'password123',
            role: 'user'
        });

        // The user should be stored as 'test_lower@example.com' because of schema fallback
        const storedUser = await User.findOne({ email: 'test_lower@example.com' });
        if (storedUser) {
            console.log('User stored correctly as lowercase: ' + storedUser.email);
        } else {
            console.error('FAIL: User not stored as lowercase!');
        }

        // Now try to find with Mixed Case query
        const found = await User.findOne({ email: 'Test_Lower@Example.com' });
        if (found) {
            console.log('SUCCESS: Mongoose automatically lowercased the query!');
        } else {
            console.error('FAIL: Query is case sensitive! Fix required.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await User.deleteOne({ email: 'test_lower@example.com' });
        mongoose.disconnect();
    }
};

verifyCaseSensitivity();

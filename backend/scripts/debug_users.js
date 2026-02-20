
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from ../.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: '${u.role}' (Type: ${typeof u.role})`);
            if (!u.role) {
                console.log(`WARNING: User ${u.email} has no role!`);
            } else if (u.role !== 'user' && u.role !== 'admin' && u.role !== 'agent') {
                console.log(`WARNING: User ${u.email} has invalid role: ${u.role}`);
            }
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();

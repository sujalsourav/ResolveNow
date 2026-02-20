import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import User from './models/User.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import Complaint from './models/Complaint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Auth required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (e) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);

  socket.on('join_complaint', (complaintId) => {
    socket.join(`complaint:${complaintId}`);
  });

  socket.on('leave_complaint', (complaintId) => {
    socket.leave(`complaint:${complaintId}`);
  });

  socket.on('send_message', async (payload) => {
    try {
      const { complaintId, text } = payload;
      const user = await User.findById(socket.userId).select('fullName email role');
      if (!user) return;

      const msg = await Message.create({
        complaint: complaintId,
        sender: socket.userId,
        text,
      });
      const message = await Message.findById(msg._id).populate('sender', 'fullName email role');

      const complaint = await Complaint.findById(complaintId);
      if (complaint) {
        const notifyUserId = complaint.user.toString() === socket.userId ? complaint.assignedTo : complaint.user;
        if (notifyUserId) {
          await Notification.create({
            user: notifyUserId,
            type: 'new_message',
            title: 'New message',
            message: `New message on complaint ${complaint.complaintId}`,
            complaint: complaint._id,
          });
          io.to(`user:${notifyUserId}`).emit('new_message', message);
          io.to(`user:${notifyUserId}`).emit('new_notification', {});
        }
        io.to(`complaint:${complaintId}`).emit('message', message);
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
});

export const getIO = () => io;

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

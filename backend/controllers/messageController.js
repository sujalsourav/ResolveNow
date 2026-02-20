import Message from '../models/Message.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

export const getMessages = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssigned = complaint.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ complaint: complaint._id })
      .populate('sender', 'fullName email role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssigned = complaint.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      complaint: complaint._id,
      sender: req.user._id,
      text: req.body.text,
    });

    const populated = await Message.findById(message._id).populate('sender', 'fullName email role');

    const notifyUserId = isOwner ? complaint.assignedTo : complaint.user;
    if (notifyUserId) {
      await Notification.create({
        user: notifyUserId,
        type: 'new_message',
        title: 'New message',
        message: `New message on complaint ${complaint.complaintId}`,
        complaint: complaint._id,
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

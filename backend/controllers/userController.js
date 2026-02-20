import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

export const getAgents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const agents = await User.find({ role: 'agent' }).select('fullName email _id');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = await User.find({ _id: { $ne: req.user._id } }).select('fullName email role isApproved isVerified');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAgent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { fullName, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ fullName, email, password, role: 'agent', isVerified: true });
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const [totalComplaints, byStatus, byCategory, totalUsers, totalAgents] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
    ]);

    const statusMap = {};
    byStatus.forEach((s) => (statusMap[s._id] = s.count));
    const categoryMap = {};
    byCategory.forEach((c) => (categoryMap[c._id] = c.count));

    res.json({
      totalComplaints,
      totalUsers,
      totalAgents,
      byStatus: statusMap,
      byCategory: categoryMap,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

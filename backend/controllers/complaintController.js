import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { sendEmail, complaintConfirmationEmail, statusUpdateEmail } from '../utils/email.js';
import generateComplaintId from '../utils/generateComplaintId.js';
import User from '../models/User.js';

export const createComplaint = async (req, res) => {
  try {
    const complaintId = generateComplaintId();
    const attachments = (req.files || []).map((f) => ({
      url: `/uploads/${f.filename}`,
      name: f.originalname,
    }));

    const complaint = await Complaint.create({
      complaintId,
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'other',
      priority: req.body.priority || 'medium',
      address: req.body.address,
      contactPhone: req.body.contactPhone,
      purchaseDate: req.body.purchaseDate,
      attachments,
    });

    await Notification.create({
      user: req.user._id,
      type: 'complaint_submitted',
      title: 'Complaint registered',
      message: `Your complaint ${complaintId} has been submitted.`,
      complaint: complaint._id,
    });

    const { subject, html } = complaintConfirmationEmail(complaintId, complaint.title);
    await sendEmail({ to: req.user.email, subject, html });

    const populated = await Complaint.findById(complaint._id).populate('user', 'fullName email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('assignedTo', 'fullName email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = complaint.user._id.toString() === req.user._id.toString();
    const isAssigned = complaint.assignedTo?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isAgent = complaint.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isAgent && !isAdmin) return res.status(403).json({ message: 'Access denied' });

    const { status, resolution } = req.body;
    if (status) complaint.status = status;
    if (resolution !== undefined) complaint.resolution = resolution;
    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedAt = complaint.resolvedAt || new Date();
      if (status === 'closed') complaint.closedAt = new Date();
    }
    await complaint.save();

    await Notification.create({
      user: complaint.user,
      type: 'status_update',
      title: 'Complaint update',
      message: `Complaint ${complaint.complaintId} is now ${complaint.status}.`,
      complaint: complaint._id,
      read: false,
    });

    const { subject, html } = statusUpdateEmail(complaint.complaintId, complaint.status, complaint.resolution);
    const user = await User.findById(complaint.user).select('email');
    if (user?.email) await sendEmail({ to: user.email, subject, html });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const agent = await User.findById(req.body.agentId);
    if (!agent || agent.role !== 'agent') return res.status(400).json({ message: 'Invalid agent' });

    complaint.assignedTo = agent._id;
    complaint.assignedAt = new Date();
    complaint.status = 'assigned';
    await complaint.save();

    await Notification.create({
      user: complaint.user,
      type: 'complaint_assigned',
      title: 'Agent assigned',
      message: `Complaint ${complaint.complaintId} has been assigned to an agent.`,
      complaint: complaint._id,
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('user', 'fullName email')
      .populate('assignedTo', 'fullName email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({ message: 'Feedback only after resolution' });
    }

    complaint.feedback = {
      rating: req.body.rating,
      comment: req.body.comment,
      submittedAt: new Date(),
    };
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin / Agent: list all or filtered
export const listComplaints = async (req, res) => {
  try {
    const { status, assignedTo, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;
    if (req.user.role === 'agent') filter.assignedTo = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter).populate('user', 'fullName email').populate('assignedTo', 'fullName email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Complaint.countDocuments(filter),
    ]);
    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const submitSuggestion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Suggestion text required' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssignedAgent = complaint.assignedTo?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save suggestion
    complaint.suggestions.push({
      from: req.user._id,
      fromRole: req.user.role,
      text: text.trim(),
    });
    await complaint.save();

    // Determine who to notify
    const notifyUserIds = [];

    if (isOwner) {
      // User → notify assigned agent (if any) + admin
      if (complaint.assignedTo) notifyUserIds.push(complaint.assignedTo.toString());
      // Find all admins
      const admins = await User.find({ role: 'admin' }).select('_id');
      admins.forEach((a) => notifyUserIds.push(a._id.toString()));
    } else if (isAssignedAgent) {
      // Agent → notify only admins
      const admins = await User.find({ role: 'admin' }).select('_id');
      admins.forEach((a) => notifyUserIds.push(a._id.toString()));
    }

    // Remove duplicates and self
    const uniqueIds = [...new Set(notifyUserIds)].filter((uid) => uid !== req.user._id.toString());

    if (uniqueIds.length > 0) {
      const notifications = uniqueIds.map((uid) => ({
        user: uid,
        type: 'suggestion',
        title: 'New Suggestion',
        message: `${req.user.fullName} (${req.user.role}) sent a suggestion on complaint ${complaint.complaintId}.`,
        complaint: complaint._id,
        read: false,
      }));
      await Notification.insertMany(notifications);
    }

    res.json({ message: 'Suggestion submitted', suggestion: complaint.suggestions.at(-1) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

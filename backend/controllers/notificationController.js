import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 50 } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter)
      .populate('complaint', 'complaintId title status')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) return res.status(404).json({ message: 'Not found' });
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendGlobalNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });

    // Fetch all users except sender (assuming admin sends this, maybe exclude admin?)
    // Actually, sending to ALL users (user, agent, admin) except self is good practice.
    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');

    const notifications = users.map(u => ({
      user: u._id,
      type: 'admin_broadcast',
      title,
      message,
      read: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Real-time via socket? 
      // The current controller doesn't import IO directly but we can try to improve this later.
      // For now, it just saves to DB. 
    }

    res.json({ message: `Notification sent to ${notifications.length} users` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

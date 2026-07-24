const Notification = require('../models/notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(30);
        const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markOneRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getNotifications, markAllRead, markOneRead };
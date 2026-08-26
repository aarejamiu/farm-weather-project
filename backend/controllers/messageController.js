const Message = require('../models/message');
const User = require('../models/user');

const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver and content are required' });
    }

    try {
        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content
        });

        res.status(201).json({ message: 'Message sent', data: message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConversation = async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        })
        .populate('sender', 'username role')
        .populate('receiver', 'username role')
        .sort({ createdAt: 1 });

        await Message.updateMany(
            { sender: userId, receiver: req.user.id, read: false },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInbox = async (req, res) => {
    try {
        const messages = await Message.find({ receiver: req.user.id })
            .populate('sender', 'username email role')
            .sort({ createdAt: -1 });

        const seen = new Set();
        const threads = messages.filter(m => {
            const key = m.sender._id.toString();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFarmerContact = async (req, res) => {
    try {
        const farmer = await User.findOne({ role: 'farmer' }).select('username email role');
        if (!farmer) return res.status(404).json({ message: 'Farm contact not found' });
        res.json(farmer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getConversation, getInbox, getFarmerContact };
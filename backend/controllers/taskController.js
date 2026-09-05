const FarmTask = require('../models/farmTask');

const getTasks = async (req, res) => {
    try {
        const tasks = await FarmTask.find({ user: req.user.id }).sort({ date: 1, createdAt: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    const { name, category, date, note, done } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'Task name and date are required' });

    try {
        const task = await FarmTask.create({ user: req.user.id, name, category, date, note, done });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const updates = {};
        ['name', 'category', 'date', 'note', 'done'].forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        const task = await FarmTask.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updates,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await FarmTask.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };

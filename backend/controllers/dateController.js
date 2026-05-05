const SavedDate = require('../models/savedDate');

const saveDate = async (req, res) => {
    const { location, temp, humidity, wind, condition, note } = req.body;

    try {
        const newDate = await SavedDate.create({
            user: req.user.id,
            location,
            temp,
            humidity,
            wind,
            condition,
            note
        });

        await newDate.save();
        res.status(201).json({ message: 'Date saved successfully', date: newDate });
    } catch (error) {
        console.error("SAVE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getDates = async (req, res) => {
    try {
        const dates = await SavedDate.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({ dates });
    } catch (error) {
        console.error("GET DATES ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteDate = async (req, res) => {
    const { id } = req.params;

    try {
        const date = await SavedDate.findOneAndDelete({ _id: id, user: req.user.id });

        if (!date) {
            return res.status(404).json({ message: "Date not found" });
        }

        res.status(200).json({ message: "Date deleted successfully" });
    } catch (error) {
        console.error("DELETE DATE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    saveDate,
    getDates,
    deleteDate
}
const User = require('../models/user');

const getProfile = async(req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(error){
        console.error(error);
        
        res.status(500).json({
            message: 'Server error'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (username?.trim()) user.username = username.trim();
        if (email?.trim()) user.email = email.trim();
        if (phone !== undefined) user.phone = phone.trim();
        await user.save();
        res.json({ message: 'Profile updated successfully', user: user.toObject({ transform: (_, value) => { delete value.password; return value; } }) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email is already in use' });
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { address: req.body.address || '' }, { returnDocument: 'after' }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Address updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFarmLocation = async(req,res)=>{
try {
    const { farmLocation } = req.body;

    const user = await User.findById(req.user.id);

    if(!user){
        return res.status(404).json({
            message: 'User not found'
        });
    }

    user.farmLocation = farmLocation;

    await user.save();

    res.json({
        message: "Farm location updated successfully",
        // farmLocation: user.farmLocation
    });
} catch (error) {
    console.error(error);

    res.status(500).json({
        message:"Server error"
    })
    
}}

module.exports = {
    getProfile,
    updateProfile,
    updateAddress,
    updateFarmLocation
}
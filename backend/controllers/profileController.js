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
        farmLocation: user.farmLocation
    });
} catch (error) {
    console.error(error);

    res.status(500).json({
        message:"Server error"
    })
    
}}

module.exports = {
    getProfile,
    updateFarmLocation
}
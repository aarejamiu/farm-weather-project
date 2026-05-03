const User = require('../models/user');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try{
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'Invalid email'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Invalid password'});
        }

        const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
        );

        res.json({ token, user: {
            id: user._id,
            username: user.username,
            email: user.email
        }});
    }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { 
    registerUser, 
    loginUser 
};
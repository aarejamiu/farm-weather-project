// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const registerUser = async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const role = email === process.env.FARMER_EMAIL ? 'farmer' : 'customer';

//         const user = await User.create({
//             username,
//             email,
//             password: hashedPassword,
//             role
//         });

//         res.status(201).json({
//             message: 'User registered successfully',
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid email' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid password' });
//         }

//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.json({
//             message: 'Login successful',
//             token,
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// module.exports = { registerUser, loginUser };

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const normalizeEmail = (email) => email.trim().toLowerCase();
const resetMessage = 'If an account exists for that email, a password reset link has been sent.';

const getResetUrl = (token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/frontend';
    return `${frontendUrl.replace(/\/$/, '')}/reset-password.html?token=${token}`;
};

const sendPasswordResetEmail = async (email, resetUrl, isLocalRequest) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        if (isLocalRequest) {
            console.log(`Password reset URL for ${email}: ${resetUrl}`);
            return;
        }
        throw new Error('Password reset email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT || 587) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
        from: MAIL_FROM || SMTP_USER,
        to: email,
        subject: 'Reset your Leaders-Union Farm password',
        text: `Reset your password using this link. It expires in one hour: ${resetUrl}`,
        html: `<p>Reset your Leaders-Union Farm password using the link below.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour.</p>`
    });
};

const setAuthCookie = (res, token) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
};

const getFarmerEmail = () => {
    const farmerEmail = process.env.FARMER_EMAIL?.trim().toLowerCase();

    if (!farmerEmail) {
        throw new Error('FARMER_EMAIL is not configured');
    }

    return farmerEmail;
};

const registerUser = async (req, res) => {
    const { username, password } = req.body;
    const email = normalizeEmail(req.body.email);

    try {
        const farmerEmail = getFarmerEmail();
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const role = email === farmerEmail ? 'farmer' : 'customer';

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        setAuthCookie(res, token);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    try {
        const farmerEmail = getFarmerEmail();
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        if (user.role === 'farmer' && email !== farmerEmail) {
            return res.status(403).json({ message: 'This account is not authorized as a farmer' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        setAuthCookie(res, token);

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    res.json({ message: 'Logged out successfully' });
};

const requestPasswordReset = async (req, res) => {
    const email = normalizeEmail(req.body.email || '');
    const isLocalRequest = ['localhost', '127.0.0.1'].includes(req.hostname);

    try {
        const user = await User.findOne({ email });
        let resetUrl;
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();
            resetUrl = getResetUrl(token);
            await sendPasswordResetEmail(user.email, resetUrl, isLocalRequest);
        }
        const response = { message: resetMessage };
        if (isLocalRequest && resetUrl) {
            response.resetUrl = resetUrl;
            response.emailSent = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        }
        if (isLocalRequest && !user) response.message = 'No account was found for that email address.';
        res.json(response);
    } catch (error) {
        console.error('Password reset request failed:', error);
        const isLocalRequest = ['localhost', '127.0.0.1'].includes(req.hostname);
        res.status(500).json({
            message: isLocalRequest
                ? error.message
                : 'Unable to process the password reset request.'
        });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ message: 'A valid token and a password of at least 8 characters are required.' });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: tokenHash,
            passwordResetExpires: { $gt: new Date() }
        });
        if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });

        user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Password reset failed:', error);
        res.status(500).json({ message: 'Unable to reset the password.' });
    }
};

module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword };
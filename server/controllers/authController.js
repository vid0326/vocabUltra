const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const bloomFilter = req.app.locals.bloomFilter;
        if (bloomFilter && bloomFilter.contains(email)) {
            console.log('Bloom Filter hit for:', email);
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        if (bloomFilter) {
            bloomFilter.add(email);
            bloomFilter.add(username);
        }

        user = new User({ username, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4e69;">Verify Your Email</h2>
                <p>Your verification code is:</p>
                <div style="background: #f2e9e4; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'VocabUltra Verification Code',
                html: message,
                text: `Your verification code is: ${otp}`
            });
            res.json({ msg: 'Registration successful! Please check your email for the OTP.' });
        } catch (err) {
            console.error(err);
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            return res.status(500).json({ msg: 'Email could not be sent' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: 'Please provide email and OTP' });

    try {
        const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            email,
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP' });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ msg: 'Email verified successfully. You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        } else {
            return res.status(400).json({ msg: 'Please login with Google' });
        }

        if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email first' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            let newUsername = name;
            let isUnique = false;
            const bloomFilter = req.app.locals.bloomFilter;

            while (!isUnique) {
                if (bloomFilter && bloomFilter.contains(newUsername)) {
                    const existingUser = await User.findOne({ username: newUsername });
                    if (existingUser) {
                        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                        newUsername = `${name} ${randomSuffix}`;
                        continue;
                    }
                }
                isUnique = true;
            }

            if (bloomFilter) {
                bloomFilter.add(newUsername);
                bloomFilter.add(email);
            }

            user = new User({
                username: newUsername,
                email,
                googleId: sub,
                avatar: picture,
                isVerified: true
            });
            await user.save();
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar } });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a4e69;">Reset Your Password</h2>
                <p>Your verification code is:</p>
                <div style="background: #f2e9e4; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'VocabUltra Password Reset Code',
                html: message,
                text: `Your password reset code is: ${otp}`
            });
            res.json({ msg: 'Reset code sent to your email' });
        } catch (err) {
            console.error(err);
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            return res.status(500).json({ msg: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ msg: 'Please provide all fields' });

    try {
        const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            email,
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ msg: 'Password reset successful. Please login.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'Please upload a file' });

        // Cloudinary storage provides the URL in req.file.path
        const avatarUrl = req.file.path;

        const user = await User.findById(req.user.id);
        user.avatar = avatarUrl;
        await user.save();

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.saveTypingResult = async (req, res) => {
    const { wpm, accuracy, timeline } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // Add to history (capped at last 50 for storage, we send last 5 to frontend)
        if (!user.typingHistory) user.typingHistory = [];
        user.typingHistory.push({ wpm, accuracy, timeline });
        if (user.typingHistory.length > 50) {
            user.typingHistory.shift();
        }

        // Check for new record
        let newRecord = false;
        if (wpm > (user.bestWpm || 0)) {
            user.bestWpm = wpm;
            newRecord = true;
        }

        await user.save();
        res.json({ bestWpm: user.bestWpm, history: user.typingHistory, newRecord });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Email Transporter (Configure with your credentials)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'websitedeve5@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || '' // Gmail App Password
    }
});
// Helper: Send OTP
const sendOTP = async (email, otp) => {
    try {
        // Always try to send real email if credentials exist
        if (process.env.EMAIL_APP_PASSWORD) {
            await transporter.sendMail({
                from: `Lost & Found <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Verification Code - Lost & Found',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Your OTP Code</h2>
            <p>Your verification code is:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
              ${otp}
            </div>
            <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">This code expires in 5 minutes.</p>
            <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
            });
            console.log(`✅ OTP email sent to ${email}`);
            return true;
        }

        // Development mode: log to console
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n=== OTP FOR ${email} ===`);
            console.log(`CODE: ${otp}`);
            console.log(`=== VALID FOR 5 MINUTES ===\n`);
            console.log(`=== VALID FOR 5 MINUTES ===\n`);
            return false; // Return false so we know it didn't strictly "send" via email
        }

        return false;
    } catch (err) {
        console.error('❌ EMAIL SENDING FAILED:', err);
        console.error('Stack:', err.stack);
        // Fallback to console in dev mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n=== OTP FOR ${email} (Email failed, showing here) ===`);
            console.log(`CODE: ${otp}`);
            console.log(`=== VALID FOR 5 MINUTES ===\n`);
            console.log(`=== VALID FOR 5 MINUTES ===\n`);
            return false; // Return false indicates "Email failed (even if fallback worked)"
        }
        return false;
    }
};

// Step 1: Request OTP for Registration
exports.requestOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;
        console.log(`Attempting to send OTP to ${email}. Has Password: ${!!process.env.EMAIL_APP_PASSWORD}`);

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered. Please login instead.' });

        // Check for duplicate phone number
        if (phone) {
            const phoneUser = await User.findOne({ phone });
            if (phoneUser) return res.status(400).json({ message: 'Phone number already in use.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP
        await OTP.findOneAndDelete({ email }); // Clear old OTPs
        await new OTP({ email, otp }).save();

        const sent = await sendOTP(email, otp);

        // If sending failed but we are in dev mode, it returns true but logs error
        // We really want to know if it REALLY sent or fell back. 
        // For now, let's assume if it returns true, we proceed.
        // But we can refine the message to be helpful.

        if (!sent && process.env.NODE_ENV !== 'development') {
            return res.status(500).json({ message: 'Failed to send OTP. Please check email address.' });
        }

        // Check logs to see if it fell back (we can't easily pass that flag back from sendOTP without changing signature, 
        // so let's just be explicit in the message for Devs)
        res.json({
            message: process.env.NODE_ENV === 'development'
                ? 'OTP sent! (If not in inbox, check Server Console or use: 123456)'
                : 'Verification code sent to your email',
            email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

// Register User (Direct - No OTP)
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate VIT email
        if (!email.endsWith('@vitstudent.ac.in')) {
            return res.status(400).json({ message: 'Please use your VIT email address (@vitstudent.ac.in)' });
        }

        // Check existing User
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        // Check for duplicate phone number
        if (phone) {
            const phoneUser = await User.findOne({ phone });
            if (phoneUser) return res.status(400).json({ message: 'Phone number already in use.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, email, phone, password: hashedPassword, verifiedPhone: true
        });

        await user.save();

        // Create Token
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // Reduced from 30d to 7d for security
            (err, token) => {
                if (err) throw err;
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        points: user.points,
                        isAdmin: user.isAdmin,
                        isHiddenFromLeaderboard: user.isHiddenFromLeaderboard
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000 && err.keyPattern && err.keyPattern.phone) {
            return res.status(400).json({ message: 'Phone number already in use.' });
        }
        res.status(500).send('Server Error');
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        // Check if account is locked
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
            const remainingTime = Math.ceil((user.lockoutUntil - new Date()) / (1000 * 60)); // minutes
            return res.status(429).json({
                message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingTime} minutes.`,
                lockoutUntil: user.lockoutUntil
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Increment failed attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Lock account after 5 failed attempts for 15 minutes
            if (user.loginAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                await user.save();

                console.log(`🔒 Account locked for ${email} after ${user.loginAttempts} failed attempts`);

                return res.status(429).json({
                    message: 'Account locked due to multiple failed login attempts. Please try again after 15 minutes or reset your password.',
                    lockoutUntil: user.lockoutUntil
                });
            }

            await user.save();

            const attemptsLeft = 5 - user.loginAttempts;
            return res.status(400).json({
                message: `Invalid Credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before account lockout.`
            });
        }

        // Successful login - reset attempts
        user.loginAttempts = 0;
        user.lockoutUntil = null;
        await user.save();

        // Create JWT
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // 7 days for security
            (err, token) => {
                if (err) throw err;
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        points: user.points,
                        isAdmin: user.isAdmin,
                        isHiddenFromLeaderboard: user.isHiddenFromLeaderboard
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Forgot Password: Request OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with this email address' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.findOneAndDelete({ email });
        await new OTP({ email, otp }).save();

        // Send enhanced password reset email
        try {
            await transporter.sendMail({
                from: `Lost & Found <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Password Reset - Lost & Found',
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                            <p style="font-size: 16px; color: #374151;">Hi <strong>${user.name}</strong>,</p>
                            <p style="font-size: 16px; color: #374151;">
                                We received a request to reset your password. Use the code below to proceed:
                            </p>
                            <div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px dashed #e5e7eb;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Reset Code</p>
                                <p style="margin: 0; font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</p>
                            </div>
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    ⏰ This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
                                </p>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">
                                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                                Lost & Found - VIT Chennai Campus
                            </p>
                        </div>
                    </div>
                `
            });
            console.log(`✅ Password reset OTP sent to ${email}`);
            res.json({
                message: 'Password reset code sent to your email. Please check your inbox.',
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for response
            });
        } catch (emailError) {
            console.error('❌ Failed to send password reset email:', emailError);
            // Fallback for development
            if (process.env.NODE_ENV === 'development') {
                console.log(`\n=== PASSWORD RESET OTP FOR ${email} ===`);
                console.log(`CODE: ${otp}`);
                console.log(`=== VALID FOR 5 MINUTES ===\n`);
                res.json({
                    message: 'OTP generated (check server console in development mode)',
                    email
                });
            } else {
                res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const validOTP = await OTP.findOne({ email, otp });
        if (!validOTP) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await OTP.deleteOne({ _id: validOTP._id });

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Check admin permission
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete user account (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        // Check admin permission
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const userId = req.params.id;

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascade delete: Remove all user's data
        const Item = require('../models/Item');
        const Chat = require('../models/Chat');
        const Notification = require('../models/Notification');
        const Watchlist = require('../models/Watchlist');

        await Item.deleteMany({ user: userId });
        await Chat.deleteMany({ $or: [{ user1: userId }, { user2: userId }] });
        await Notification.deleteMany({ userId: userId });
        await Watchlist.deleteMany({ user: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and all related data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

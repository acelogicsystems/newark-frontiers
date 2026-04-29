const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });
        const user = await User.create({ name, email, password, phone });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 🎯 FIX: Explicitly select '+password' 
        const user = await User.findOne({ email }).select('+password');

        if (user) {
            console.log("🔍 Attempting login for:", user.email);
            
            // This now has the hash needed to compare
            const isMatch = await user.matchPassword(password);
            console.log("🔍 Match Result:", isMatch);

            if (isMatch) {
                return res.json({ 
                    _id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    token: generateToken(user._id),
                    role: user.role // Added role for your admin middleware
                });
            }
        }
        
        // If user not found OR password doesn't match
        res.status(401).json({ message: "Invalid email or password" }); 
    } catch (error) { 
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ message: "Server error during login" }); 
    }
};
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateTransactionPin = async (req, res) => {
    try {
        const { newPin } = req.body;

        // 1. Validation
        if (!newPin || String(newPin).length !== 4) {
            return res.status(400).json({ message: "PIN must be exactly 4 digits." });
        }

        // 2. Identification
        // Ensure req.user exists (this comes from your 'protect' middleware)
        if (!req.user || !req.user.id) {
            console.error("❌ PIN Update Failed: No user ID found in request. Check your middleware.");
            return res.status(401).json({ message: "Not authorized" });
        }

        // 3. Execution
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        user.transactionPin = newPin;
        
        // This triggers the pre-save hook in User.js 
        // But because of your isModified check, it WON'T mess up the password!
        await user.save();

        console.log(`✅ PIN updated successfully for: ${user.email}`);
        res.json({ message: "Transaction PIN updated successfully! 🔒" });

    } catch (error) {
        // This log is the key to fixing the "Error updating PIN" message
        console.error("❌ PIN Update Error Detail:", error.message);
        res.status(500).json({ message: "Internal server error while updating PIN" });
    }
};
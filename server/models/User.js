const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'customer' },
    transactionPin: { type: String, default: null }, // Crucial for Newark security
    creditLimit: { type: Number, default: 5000 },
    totalRepaidLoans: { type: Number, default: 0 }
}, { timestamps: true });

// --- 🛡️ SECURITY HOOK: Hash password before saving ---
userSchema.pre('save', async function () {
    // 1. If the password hasn't been changed, just exit the function
    if (!this.isModified('password')) return;

    try {
        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error("Password hashing failed");
    }
}); // ✅ Fixed syntax: closed with });

// --- 🔑 SECURITY METHOD: Compare password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
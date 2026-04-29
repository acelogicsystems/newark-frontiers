const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// --- 1. Middleware ---
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://newark-frontiers.onrender.com',
        'https://newark-frontiers.vercel.app' 
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true
}));

// Standard Middlewares
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Added this for Safaricom form-data if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/mpesa', require('./routes/mpesaRoutes'));

// --- 3. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- 4. Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Newark Frontiers Server Active
    📡 Port: ${PORT}
    🔗 Ngrok Tunnel: https://giddily-impart-smugly.ngrok-free.dev
    `);
});
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const Loan = require('../models/Loan'); // Moved to top for efficiency

// 1. Middleware Imports
const { protect, admin } = require('../middleware/authMiddleware');

// 2. Controller Function Imports
const { 
    applyLoan, 
    getMyLoans, 
    getAllLoans, 
    updateLoanStatus, 
    repayLoan 
} = require('../controllers/loanController');

// --- BORROWER ROUTES ---

/**
 * @route   POST /api/loans/apply
 * @desc    Submit a loan application with ID and Selfie
 * @access  Private (Borrower)
 */
router.post('/apply', protect, upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]), applyLoan);

/**
 * @route   GET /api/loans/my-loans
 * @desc    Fetch loans belonging to the logged-in user
 * @access  Private (Borrower)
 */
router.get('/my-loans', protect, getMyLoans);

/**
 * @route   POST /api/loans/:id/repay
 * @desc    Initiate STK Push repayment for a specific loan
 * @access  Private (Borrower)
 */
router.post('/:id/repay', protect, repayLoan);


// --- ADMIN ROUTES ---

/**
 * @route   GET /api/loans/all
 * @desc    Fetch all loans in the system
 * @access  Private (Admin Only)
 */
router.get('/all', protect, admin, getAllLoans);

/**
 * @route   PATCH /api/loans/status/:id
 * @desc    Approve/Reject loan and trigger disbursement
 * @access  Private (Admin Only)
 */
router.patch('/status/:id', protect, admin, updateLoanStatus);


// --- DOCUMENT MANAGEMENT ---

/**
 * @route   PATCH /api/loans/upload/:id
 * @desc    Upload additional supporting documents to an existing loan
 * @access  Private
 */
router.patch('/upload/:id', protect, upload.array('documents', 2), async (req, res) => {
    try {
        const filePaths = req.files.map(file => file.path);
        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            { $push: { documents: { $each: filePaths } } },
            { new: true }
        );
        res.status(200).json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
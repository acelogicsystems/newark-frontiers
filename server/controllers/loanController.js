const Loan = require('../models/Loan');
const User = require('../models/User'); 
const { verifyKenyanID } = require('../services/verificationService');
const { disburseLoan, stkPush } = require('../services/mpesaService');
const { logAdminAction } = require('../utils/logger');
const { sendSMS, sendApprovalEmail } = require('../services/notificationService');

/**
 * --- APPLY FOR LOAN ---
 * Handles initial submission and asynchronous background identity verification.
 */
exports.applyLoan = async (req, res) => {
    try {
        const { amount, duration, purpose, idNumber } = req.body;
        const interestRate = 0.10; // 10% interest
        const totalRepayable = Math.round(amount * (1 + interestRate));

        const idImagePath = req.files['idImage'] ? req.files['idImage'][0].path : null;
        const selfiePath = req.files['selfie'] ? req.files['selfie'][0].path : null;

        if (!idImagePath || !selfiePath) {
            return res.status(400).json({ message: "Both ID card image and Selfie are required" });
        }

        const newLoan = await Loan.create({
            user: req.user.id,
            amount,
            totalRepayable,
            duration,
            purpose,
            idNumber,
            idImage: idImagePath,
            selfie: selfiePath,
            status: 'verifying' 
        });

        // Background Verification (Non-blocking)
        verifyKenyanID(idNumber, selfiePath, idImagePath, req.user)
            .then(async (result) => {
                await Loan.findByIdAndUpdate(newLoan._id, { 
                    status: 'pending',
                    verificationResult: result 
                });
                sendSMS(req.user.phone, `Hi ${req.user.name.split(' ')[0]}, your ID is verified. KES ${amount} loan is now under final review.`);
            })
            .catch(async (err) => {
                await Loan.findByIdAndUpdate(newLoan._id, { status: 'failed_verification' });
                sendSMS(req.user.phone, `Identity verification failed. Please check your email for details.`);
            });

        res.status(201).json({
            message: "Application submitted. Identity verification is in progress.",
            loan: newLoan
        });

    } catch (error) {
        console.error("Application Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * --- UPDATE LOAN STATUS (Admin) ---
 * Triggers M-Pesa B2C on 'approved' and updates status to 'disbursed'.
 */
exports.updateLoanStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const loanId = req.params.id;

        const loan = await Loan.findById(loanId).populate('user');
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        // 🚀 DISBURSEMENT LOGIC
        if (status === 'approved') {
            try {
                // 1. Trigger M-Pesa B2C
                const mpesaResponse = await disburseLoan(loan.user.phone, loan.amount, loan._id);
                
                loan.mpesaDetails = {
                    conversationId: mpesaResponse.ConversationID,
                    originatorConversationId: mpesaResponse.OriginatorConversationID
                };
                
                // 2. Set to 'disbursed' so User Side button activates immediately
                loan.status = 'disbursed'; 
                await loan.save();

                // 3. Notifications
                await sendSMS(loan.user.phone, `Hi ${loan.user.name.split(' ')[0]}, your KES ${loan.amount} loan is APPROVED and sent!`);
                await sendApprovalEmail(
                    loan.user.email, 
                    loan.user.name, 
                    loan.amount || 0,
                    loan.totalRepayable || 0,
                );

                await logAdminAction(req, 'DISBURSEMENT_INITIATED', `Ref: ${mpesaResponse.ConversationID}`, loan._id, loan.user._id);

                // 🛑 CRITICAL: Return here to prevent the code at the bottom from resetting status to 'approved'
                return res.json({ message: "Loan disbursed successfully!", loan });

            } catch (mpesaErr) {
                console.error("Disbursement Error:", mpesaErr.message);
                return res.status(500).json({ message: "M-Pesa Disbursement Failed" });
            }
        } 
        
        // Handle Rejections
        if (status === 'rejected') {
            sendSMS(loan.user.phone, `Loan request declined. Reason: ${reason || 'Criteria not met.'}`);
            await logAdminAction(req, 'LOAN_REJECTED', reason || 'Rejected by admin', loan._id, loan.user._id);
        }

        // Default status update for other cases (pending, etc.)
        loan.status = status;
        await loan.save();
        res.json({ message: `Status updated to ${status}.`, loan });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Update failed" });
    }
};

/**
 * --- INITIATE REPAYMENT (STK Push) ---
 * Triggered by the "Clear Balance" button on the User Dashboard.
 */
exports.repayLoan = async (req, res) => {
    try {
        const { pin } = req.body; 
        const loanId = req.params.id;

        const loan = await Loan.findById(loanId).populate('user');
        if (!loan) return res.status(404).json({ message: "Loan not found" });

        // Security Check: Verify Transaction PIN
        if (String(pin).trim() !== String(loan.user?.transactionPin || "").trim()) {
            return res.status(401).json({ message: "Invalid Security PIN." });
        }

        const amountToCollect = loan.totalRepayable || Math.round(loan.amount * 1.10);
        
        // Trigger M-Pesa Express (STK Push)
        const mpesaResponse = await stkPush(loan.user.phone, amountToCollect, loan._id);

        sendSMS(loan.user.phone, `Newark: Please enter your M-Pesa PIN on the popup to repay KES ${amountToCollect}.`);

        // Track CheckoutRequestID to verify payment in mpesaRoutes.js callback
        if (!loan.mpesaDetails) loan.mpesaDetails = {};
        loan.mpesaDetails.lastSTKCheckoutID = mpesaResponse.CheckoutRequestID;
        
        await loan.save();
        res.json({ message: "STK Push sent!", checkoutID: mpesaResponse.CheckoutRequestID });

    } catch (error) {
        console.error("Repayment Error:", error.message);
        res.status(500).json({ message: "Repayment initialization failed." });
    }
};

/**
 * --- ADMIN: FETCH ALL LOANS ---
 */
exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find()
            .populate('user', 'name email phone creditLimit')
            .sort({ createdAt: -1 });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: "Server Error fetching loans" });
    }
};

/**
 * --- USER: FETCH OWN LOANS ---
 */
exports.getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: "Error fetching your history" });
    }
};

/**
 * --- SECURITY: UPDATE TRANSACTION PIN ---
 */
exports.updateTransactionPin = async (req, res) => {
    try {
        const { newPin } = req.body;
        if (!newPin || newPin.length !== 4) {
            return res.status(400).json({ message: "PIN must be exactly 4 digits." });
        }

        const user = await User.findById(req.user.id);
        user.transactionPin = newPin;
        await user.save();

        sendSMS(user.phone, `Newark Security Alert: Your Transaction PIN has been established/updated. Keep it secret.`);

        res.json({ message: "Transaction PIN updated successfully! 🔒" });
    } catch (error) {
        console.error("PIN Update Error:", error);
        res.status(500).json({ message: "Security update failed." });
    }
};
const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { sendSMS } = require('../services/notificationService');

/**
 * ─── STK PUSH CALLBACK (REPAYMENT) ───
 * Safaricom calls this after the user enters their PIN.
 * URL: /api/mpesa/stk-callback
 */
router.post('/stk-callback', async (req, res) => {
    try {
        const { Body } = req.body;
        
        // Safety check for empty or malformed Safaricom responses
        if (!Body || !Body.stkCallback) {
            return res.status(400).json({ ResultCode: 1, ResultDesc: "Invalid payload" });
        }

        const checkoutID = Body.stkCallback.CheckoutRequestID;
        const resultCode = Body.stkCallback.ResultCode;

        console.log(`[M-PESA CALLBACK] CheckoutID: ${checkoutID} | Result: ${resultCode}`);

        if (resultCode === 0) {
            // SUCCESS: Find the loan associated with this specific STK Push
            const loan = await Loan.findOne({ "mpesaDetails.lastSTKCheckoutID": checkoutID }).populate('user');
            
            if (loan) {
                loan.status = 'paid';
                await loan.save();

                // 🚀 TRIGGER SUCCESS SMS
                const successMsg = `Confirmed! KES ${loan.totalRepayable} received. Your Newark credit limit has been increased! 🚀`;
                await sendSMS(loan.user.phone, successMsg);
                
                console.log(`💰 DEPOSIT CONFIRMED: Loan ${loan._id} is now PAID.`);
            }
        } else {
            console.warn(`❌ PAYMENT FAILED: User cancelled or insufficient funds (Code: ${resultCode})`);
        }

        // Safaricom requires a 200 OK Response
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    } catch (error) {
        console.error("Callback Logic Error:", error.message);
        res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Error" });
    }
});

/**
 * ─── B2C RESULT CALLBACK (DISBURSEMENT) ───
 * Safaricom calls this after the money hits the user's phone.
 * URL: /api/mpesa/disbursement-result
 */
router.post('/disbursement-result', async (req, res) => {
    try {
        const { Result } = req.body;
        const conversationId = Result.ConversationID;
        const resultCode = Result.ResultCode;

        if (resultCode === 0) {
            // Update the loan status from 'approved' to 'disbursed'
            const loan = await Loan.findOne({ "mpesaDetails.conversationId": conversationId });
            if (loan) {
                loan.status = 'disbursed';
                await loan.save();
                console.log(`🚀 DISBURSEMENT VERIFIED: Loan ${loan._id} funds settled.`);
            }
        }
        
        res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
        console.error("B2C Callback Error:", error.message);
        res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Error" });
    }
});

/**
 * ─── TEST ROUTE ───
 */
router.get('/test', (req, res) => {
    res.json({ 
        status: "Online", 
        service: "Newark M-Pesa Bridge", 
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
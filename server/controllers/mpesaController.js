const Loan = require('../models/Loan');
const User = require('../models/User');

// --- STK PUSH CALLBACK (Repayment) ---
exports.stkCallback = async (req, res) => {
    console.log("📩 STK Callback Received:", JSON.stringify(req.body, null, 2));
    
    // Always respond to Safaricom immediately
    res.json({ ResultCode: 0, ResultDesc: "Success" });

    try {
        const { CheckoutRequestID, ResultCode } = req.body.Body.stkCallback;

        if (ResultCode === 0) {
            // 1. Find the loan
            const loan = await Loan.findOne({ "mpesaDetails.lastSTKCheckoutID": CheckoutRequestID }).populate('user');
            
            if (loan) {
                // 2. Update Loan Status
                loan.status = 'paid';
                await loan.save();
                console.log(`💰 Loan ${loan._id} has been fully REPAID!`);

                // 3. 🚀 UPDATE CREDIT LIMIT ENGINE
                const user = await User.findById(loan.user._id);
                if (user) {
                    const incrementAmount = 2500; 
                    const maxLimit = 100000;
                    
                    if (user.creditLimit < maxLimit) {
                        user.creditLimit += incrementAmount;
                        user.totalRepaidLoans = (user.totalRepaidLoans || 0) + 1;
                        await user.save();
                        console.log(`📈 Limit Increased for ${user.name}: New Limit KES ${user.creditLimit}`);
                    }
                }
            }
        } else {
            console.warn(`❌ STK Push failed or cancelled. ResultCode: ${ResultCode}`);
        }
    } catch (err) {
        console.error("STK Callback Processing Error:", err.message);
    }
};

// --- B2C CALLBACK (Disbursement) ---
exports.disbursementCallback = async (req, res) => {
    console.log("📩 B2C Callback Received");
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

    try {
        if (!req.body.Result) return;

        const { ResultCode, ResultDesc, ConversationID } = req.body.Result;
        const loan = await Loan.findOne({ "mpesaDetails.conversationId": ConversationID });

        if (loan) {
            if (ResultCode === 0) {
                loan.status = 'disbursed';
                console.log(`✅ Loan ${loan._id} marked as DISBURSED.`);
            } else {
                loan.status = 'failed_disbursement';
                console.error(`❌ Payout failed for Loan ${loan._id}: ${ResultDesc}`);
            }
            await loan.save();
        }
    } catch (err) {
        console.error("🔥 B2C Callback Error:", err.message);
    }
};
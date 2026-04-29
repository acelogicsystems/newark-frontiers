const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// --- AFRICA'S TALKING CONFIG ---
const options = {
    apiKey: process.env.AT_API_KEY || 'sandbox',
    username: process.env.AT_USERNAME || 'sandbox',
};
const AfricasTalking = require('africastalking')(options);
const sms = AfricasTalking.SMS;

// --- EMAIL CONFIG (GMAIL) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Your 16-character App Password
    }
});

/**
 * Sends SMS via Africa's Talking
 * Automatically formats local numbers to +254
 */
exports.sendSMS = async (to, message) => {
    try {
        // Fix: Convert 07... to +2547...
        const recipient = to.startsWith('0') ? '+254' + to.slice(1) : to;
        
        // Use 'sandbox' check to prevent unnecessary API calls if keys aren't set
        if (process.env.AT_USERNAME === 'sandbox' && !process.env.AT_API_KEY) {
            console.log(`[MOCK SMS to ${recipient}]: ${message}`);
            return;
        }

        const result = await sms.send({
            to: [recipient],
            message: message
        });

        console.log(`✅ SMS Sent to ${recipient}:`, result.SMSMessageData.Recipients[0].status);
    } catch (error) {
        console.error("❌ SMS Error:", error.message);
    }
};

/**
 * Sends HTML Emails via Nodemailer
 */
exports.sendEmail = async (to, subject, htmlContent) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[MOCK EMAIL to ${to}]: ${subject}`);
            return;
        }

        const mailOptions = {
            from: `"Newark Frontiers" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error("❌ Email Error:", error.message);
    }
};
/**
 * Sends a high-quality HTML email for loan approvals
 */
exports.sendApprovalEmail = async (userEmail, userName, amount, repayable) => {
    try {

        const safeAmount = amount ? amount.toLocaleString() : "0";
        const safeRepayable = repayable ? repayable.toLocaleString(): "0";
        const mailOptions = {
            from: `"Newark Frontiers" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Your Loan Has Been Approved! 🚀",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #042f2e; padding: 30px; text-align: center;">
                        <h1 style="color: #fbbf24; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Newark Frontiers</h1>
                    </div>
                    <div style="padding: 40px; color: #1e293b;">
                        <h2 style="font-size: 24px; font-weight: 800;">Hello ${userName.split(' ')[0]},</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #64748b;">
                            Great news! Your application for a Newark Frontier loan has been approved and the funds have been disbursed to your M-Pesa account.
                        </p>
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 15px; margin: 30px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px;">Approved Amount</td>
                                    <td style="text-align: right; font-weight: 900; color: #042f2e;">KES ${amount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px;">Total Repayable</td>
                                    <td style="text-align: right; font-weight: 900; color: #059669;">KES ${repayable.toLocaleString()}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="font-size: 14px; color: #94a3b8; font-style: italic;">
                            Tip: Repay early to increase your credit limit for the next frontier.
                        </p>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                        © 2026 Newark Frontiers Ltd. Nairobi, Kenya.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Professional Email sent to ${userEmail}`);
    } catch (error) {
        console.error("❌ Email Error:", error.message);
    }
};
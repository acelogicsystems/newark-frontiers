const axios = require('axios');

/**
 * Helper: Generate Access Token
 * Automatically handles key trimming and error reporting.
 */
exports.getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim();
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim();

    // Trigger Mock Mode if keys are placeholders or missing
    if (!consumerKey || !consumerSecret || consumerKey.includes('your_sandbox')) {
        console.warn("⚠️ M-Pesa Keys missing. Running in MOCK MODE.");
        return "mock_access_token";
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${auth}` } }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("M-Pesa Auth Error:", error.response?.data || error.message);
        throw new Error("M-Pesa Auth Failed: Check your Consumer Key and Secret");
    }
};

/**
 * B2C Disbursement Logic
 */
exports.disburseLoan = async (phoneNumber, amount, loanId) => {
    try {
        const token = await this.getAccessToken();

        if (token === "mock_access_token") {
            console.log(`[SIMULATION] Sending KES ${amount} to ${phoneNumber}`);
            return { 
                ConversationID: "MOCK_B2C_" + Math.random().toString(36).substr(2, 9),
                ResponseDescription: "Simulation Successful" 
            };
        }

        const url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
        const formattedPhone = phoneNumber.startsWith('0') ? '254' + phoneNumber.slice(1) : phoneNumber;

        const payload = {
            InitiatorName: process.env.MPESA_INITIATOR_NAME || "testapi", 
            SecurityCredential: process.env.MPESA_INITIATOR_PASS || "Safaricom01!", 
            CommandID: "BusinessPayment",
            Amount: Math.round(amount), // Ensure no decimals
            PartyA: process.env.MPESA_B2C_SHORTCODE || "600000",
            PartyB: formattedPhone,
            Remarks: `Loan-${loanId.toString().slice(-5)}`,
            QueueTimeOutURL: process.env.MPESA_CALLBACK_URL + "/b2c-timeout",
            ResultURL: process.env.MPESA_CALLBACK_URL + "/b2c-result",
            Occasion: "Newark Disbursement"
        };

        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        console.error("B2C Error:", error.response?.data || error.message);
        throw new Error("M-Pesa Disbursement failed");
    }
};

/**
 * STK Push (Lipa Na M-Pesa)
 */
exports.stkPush = async (phoneNumber, amount, loanId) => {
    try {
        const token = await this.getAccessToken();

        if (token === "mock_access_token") {
            const mockId = "MOCK_STK_" + Date.now();
            console.log("🚀 MPESA SIMULATION ACTIVE");
            console.log("💰 Amount: KES", amount);
            console.log("🔑 CheckoutRequestID:", mockId);
            return { CheckoutRequestID: mockId, ResponseCode: "0" };
        }

        const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
        
        // Generate Timestamp (YYYYMMDDHHMMSS)
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
        
        // Generate Password
        const shortcode = process.env.MPESA_STK_SHORTCODE || "174379";
        const passkey = process.env.MPESA_STK_PASSKEY?.trim();
        const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

        const formattedPhone = phoneNumber.startsWith('0') ? '254' + phoneNumber.slice(1) : phoneNumber;

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: process.env.MPESA_CALLBACK_URL + "/stk-callback",
            AccountReference: `Newark-${loanId.toString().slice(-4)}`,
            TransactionDesc: "Loan Repayment"
        };

        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${token}` } // Critical space after Bearer
        });

        return response.data;
    } catch (error) {
        console.error("STK Push Error Details:", error.response?.data || error.message);
        throw new Error("Failed to initiate STK Push");
    }
};
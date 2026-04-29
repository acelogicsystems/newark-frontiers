const axios = require('axios');
const crypto = require('crypto');

const METROPOL_API_URL = "https://api.metropol.co.ke/v3";

/**
 * Generates the required Metropol Auth Hash
 * Usually: SHA256(API_KEY + TIMESTAMP + API_PUBLIC_KEY)
 */
const generateMetropolHash = (timestamp) => {
    const data = process.env.METROPOL_API_KEY + timestamp + process.env.METROPOL_PUBLIC_KEY;
    return crypto.createHash('sha256').update(data).digest('hex');
};

exports.getDelphiScore = async (idNumber) => {
    try {
        const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").substring(0, 14); // Format: YYYYMMDDHHMMSS
        
        const response = await axios.post(`${METROPOL_API_URL}/score/consumer`, {
            id_number: idNumber,
            report_type: "2" // 2 is typically the Summary Delphi Score
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-METROPOL-REST-API-KEY': process.env.METROPOL_API_KEY,
                'X-METROPOL-REST-API-HASH': generateMetropolHash(timestamp),
                'X-METROPOL-REST-API-TIMESTAMP': timestamp
            }
        });

        return response.data;
    } catch (error) {
        console.error("Metropol API Error:", error.response?.data || error.message);
        throw new Error("Credit scoring service currently unavailable.");
    }
};
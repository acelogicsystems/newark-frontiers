require('dotenv').config();
const options = {
    apiKey: 'atsk_330d7321412fe0f8a46379725ded5c51a423ed90b5a33487487beb9fa75aece8d4611363',
    username: 'sandbox', // or your real username
};
const AfricasTalking = require('africastalking')(options);
const sms = AfricasTalking.SMS;

async function sendTestSMS() {
    try {
        const result = await sms.send({
            to: ['+254711317540'], // 👈 REPLACE with your phone number (with +254)
            message: "Jambo! This is a test from the Newark Frontiers system. 🚀"
        });
        console.log("✅ Success:", result);
    } catch (ex) {
        console.error("❌ Error details:", ex);
    }
}

sendTestSMS();
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    }, // in months
    purpose: {
        type: String, 
        required: true
    },
    idNumber: { 
        type: String, 
        required: true
    },
    idImage: { 
        type: String, 
        required: true
    },
    selfie: { 
        type: String, 
        required: true // Added for Phase B compliance
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'disbursed', 'verifying', 'failed_verification', 'paid'], 
        default: 'verifying' // Changed to verifying to match the controller workflow
    },
    verificationResult: { 
        type: Object, 
        default: {} // Stores the IPRS/SmileID response data
    },
    processingFeePaid: { 
        type: Boolean, 
        default: false 
    },
    mpesaDetails: {
        conversationId: {type: String},
        originatorConversationId: {type: String},
        lastSTKCheckoutID: {type: String}
    }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
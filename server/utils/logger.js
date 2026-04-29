// server/utils/logger.js
const AuditLog = require('../models/AuditLog');

exports.logAdminAction = async (req, action, details, loanId, targetUserId) => {
    try {
        console.log(`[AUDIT LOG] ${action}: ${details}`);
        // For now, we just console log. 
        // Once you create the AuditLog model, this will save to DB.
    } catch (err) {
        console.error("Audit log failed:", err);
    }
};
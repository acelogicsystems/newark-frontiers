// server/routes/verificationRoutes.js
const express = require('express');
const router = express.Router();

// Temporary route to stop the crash
router.post('/smileid-callback', (req, res) => {
    res.status(200).send("Callback listener active");
});

module.exports = router;
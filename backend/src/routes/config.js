const express = require('express');
const router = express.Router();

// Serves public, non-secret configuration to the frontend at runtime.
// This avoids the need for VITE_ build-time environment variables.
router.get('/', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

module.exports = router;

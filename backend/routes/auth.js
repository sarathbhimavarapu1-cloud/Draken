const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email || 'demo@draken.ai',
    name: req.user.name || req.user.display_name || 'Demo User',
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

const allowedOrigins = [
  (process.env.FRONTEND_URL || '').trim(),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean).map(url => url.replace(/\/$/, ''));

router.get('/cors', (req, res) => {
  const origin = req.get('origin') || null;
  const isAllowed = (origin && allowedOrigins.indexOf(origin) !== -1) ||
    (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost:'));

  res.json({ origin, allowedOrigins, isAllowed });
});

module.exports = router;

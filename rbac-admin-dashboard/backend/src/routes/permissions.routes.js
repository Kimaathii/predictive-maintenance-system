const express = require('express');
const { db } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/permissions
router.get('/', (req, res) => {
  const perms = db.get('permissions').value();
  const grouped = {};
  perms.forEach(p => {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  });
  res.json({ success: true, permissions: perms, grouped });
});

module.exports = router;

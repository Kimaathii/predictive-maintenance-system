const express = require('express');
const { db, writeAuditLog } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(authMiddleware);

// GET /api/settings
router.get('/', requirePermission('settings.view'), (req, res) => {
  const settings = db.get('settings').value();
  const grouped = {};
  settings.forEach(s => {
    if (!grouped[s.group_name]) grouped[s.group_name] = [];
    grouped[s.group_name].push(s);
  });
  res.json({ success: true, settings, grouped });
});

// PUT /api/settings
router.put('/', requirePermission('settings.edit'), (req, res) => {
  const { settings } = req.body;
  settings.forEach(s => {
    db.get('settings').find({ key: s.key }).assign({ value: s.value }).write();
  });
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'SETTINGS_UPDATED', targetType: 'settings', details: { updated: settings.map(s => s.key) }, ipAddress: req.ip });
  res.json({ success: true, message: 'Settings saved.' });
});

module.exports = router;

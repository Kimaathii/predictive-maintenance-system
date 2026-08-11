const express = require('express');
const { db, writeAuditLog } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(authMiddleware);

// GET /api/audit-logs
router.get('/', requirePermission('audit.view'), (req, res) => {
  const { search, action, status, page = 1, limit = 25 } = req.query;
  let logs = db.get('audit_logs').value();
  if (search) logs = logs.filter(l => (l.actor_email || '').toLowerCase().includes(search.toLowerCase()) || (l.target_name || '').toLowerCase().includes(search.toLowerCase()) || (l.action || '').toLowerCase().includes(search.toLowerCase()));
  if (action) logs = logs.filter(l => l.action === action);
  if (status) logs = logs.filter(l => l.status === status);
  logs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const total = logs.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paged = logs.slice(start, start + parseInt(limit));
  const actions = [...new Set(db.get('audit_logs').map('action').value())].sort();
  res.json({ success: true, logs: paged, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), actions });
});

// GET /api/audit-logs/stats
router.get('/stats', requirePermission('audit.view'), (req, res) => {
  const all = db.get('audit_logs').value();
  const totalLogs   = all.length;
  const successLogs = all.filter(l => l.status === 'SUCCESS').length;
  const deniedLogs  = all.filter(l => l.status === 'DENIED').length;
  const failedLogs  = all.filter(l => l.status === 'FAILED').length;
  const recentActivity = all.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  res.json({ success: true, stats: { totalLogs, successLogs, deniedLogs, failedLogs }, recentActivity });
});

module.exports = router;

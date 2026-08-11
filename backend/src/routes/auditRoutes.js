const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requirePermission('audit.view'), auditController.getAuditLogs);

module.exports = router;


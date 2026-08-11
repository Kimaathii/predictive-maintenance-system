const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.get('/summary', authenticateToken, requirePermission('reports.view'), analyticsController.getExecutiveSummary);
router.get('/cost-avoidance', authenticateToken, requirePermission('reports.view'), analyticsController.getCostAvoidanceReport);

module.exports = router;


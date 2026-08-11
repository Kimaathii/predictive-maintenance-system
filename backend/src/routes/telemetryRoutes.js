const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.post('/ingest', authenticateToken, requirePermission('telemetry.ingest'), telemetryController.ingestTelemetry);
router.get('/equipment/:equipment_id', authenticateToken, telemetryController.getRecentTelemetry);

// History endpoint for frontend chart
router.get('/:equipment_id/history', authenticateToken, telemetryController.getRecentTelemetry);

module.exports = router;


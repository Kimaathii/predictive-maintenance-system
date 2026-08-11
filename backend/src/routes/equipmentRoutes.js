const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.get('/facilities', authenticateToken, requirePermission('telemetry.view'), equipmentController.listFacilities);
router.get('/', authenticateToken, requirePermission('telemetry.view'), equipmentController.listEquipment);
router.get('/:id', authenticateToken, requirePermission('telemetry.view'), equipmentController.getEquipmentById);
router.post('/', authenticateToken, requirePermission('telemetry.ingest'), equipmentController.createEquipment);

module.exports = router;


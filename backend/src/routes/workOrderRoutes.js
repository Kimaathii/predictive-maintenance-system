const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requirePermission('telemetry.view'), workOrderController.listWorkOrders);
router.post('/', authenticateToken, requirePermission('workorders.create'), workOrderController.createWorkOrder);
router.patch('/:id/status', authenticateToken, requirePermission('workorders.complete'), workOrderController.updateWorkOrderStatus);

module.exports = router;


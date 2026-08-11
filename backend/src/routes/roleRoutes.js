const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

// Protected role endpoints
router.get('/', authenticateToken, roleController.getRoles);
router.get('/permissions', authenticateToken, roleController.getPermissions);
router.put('/:roleId/permissions', authenticateToken, requirePermission('roles.manage'), roleController.updateRolePermissions);

module.exports = router;


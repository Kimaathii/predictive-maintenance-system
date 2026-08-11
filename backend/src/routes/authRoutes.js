const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requirePermission } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/register', authenticateToken, requirePermission('users.manage'), authController.registerUser);
router.get('/users', authenticateToken, requirePermission('users.manage'), authController.listUsers);

module.exports = router;


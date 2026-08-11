const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, getUserPermissions, writeAuditLog } = require('../database/db');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

  const user = db.get('users').find(u => u.email === email.toLowerCase().trim()).value();
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  if (user.status !== 'ACTIVE') return res.status(403).json({ success: false, message: 'Account suspended. Contact your administrator.' });

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    writeAuditLog({ actorEmail: email, action: 'LOGIN_FAILED', targetType: 'auth', targetName: email, details: { reason: 'Invalid password' }, ipAddress: req.ip, status: 'FAILED' });
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  db.get('users').find({ id: user.id }).assign({ last_login: new Date().toISOString() }).write();

  const role = db.get('roles').find({ id: user.role_id }).value();
  const permissions = getUserPermissions(user.id);
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

  writeAuditLog({ actorId: user.id, actorEmail: user.email, actorRole: role?.name, action: 'USER_LOGIN', targetType: 'auth', targetId: user.id, targetName: user.full_name, ipAddress: req.ip });

  res.json({
    success: true,
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, roleId: user.role_id, roleName: role?.name, roleColor: role?.color, department: user.department, avatarColor: user.avatar_color, lastLogin: user.last_login },
    permissions,
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user, permissions: req.userPermissions });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'USER_LOGOUT', targetType: 'auth', targetId: req.user.id, targetName: req.user.fullName, ipAddress: req.ip });
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;

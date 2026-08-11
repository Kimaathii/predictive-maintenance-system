const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, getUserPermissions, writeAuditLog } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
require('dotenv').config();

const router = express.Router();
router.use(authMiddleware);

function enrichUser(u) {
  const role = db.get('roles').find({ id: u.role_id }).value();
  const indPerms = db.get('user_permissions').filter({ user_id: u.id }).value().map(up => {
    const p = db.get('permissions').find({ id: up.permission_id }).value();
    return p ? { key: p.key, granted: up.granted } : null;
  }).filter(Boolean);
  return { ...u, password_hash: undefined, role_name: role?.name, role_color: role?.color, individualPermissions: indPerms };
}

// GET /api/users
router.get('/', requirePermission('users.edit'), (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;
  let users = db.get('users').value();
  if (search) users = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  if (role)   users = users.filter(u => u.role_id === role);
  if (status) users = users.filter(u => u.status === status);
  users = users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = users.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paged = users.slice(start, start + parseInt(limit)).map(enrichUser);
  res.json({ success: true, users: paged, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// POST /api/users
router.post('/', requirePermission('users.create'), (req, res) => {
  const { fullName, email, password, roleId, department, avatarColor } = req.body;
  if (!fullName || !email || !password || !roleId) return res.status(400).json({ success: false, message: 'fullName, email, password, and roleId are required.' });
  if (roleId === 'role-superadmin' && req.user.roleName !== 'Super Admin') return res.status(403).json({ success: false, message: '403 – Only Super Admin can create Super Admin accounts.' });

  const existing = db.get('users').find(u => u.email === email.toLowerCase().trim()).value();
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

  const id = 'usr-' + uuidv4().slice(0, 8);
  const role = db.get('roles').find({ id: roleId }).value();
  const newUser = {
    id, full_name: fullName.trim(), email: email.toLowerCase().trim(),
    password_hash: bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS) || 10),
    role_id: roleId, department: department || null, avatar_color: avatarColor || '#6366f1',
    status: 'ACTIVE', created_at: new Date().toISOString(), created_by: req.user.id, last_login: null
  };
  db.get('users').push(newUser).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'USER_CREATED', targetType: 'user', targetId: id, targetName: fullName, details: { role: role?.name, department }, ipAddress: req.ip });
  res.status(201).json({ success: true, user: enrichUser(newUser), message: 'User created successfully.' });
});

// PUT /api/users/:id
router.put('/:id', requirePermission('users.edit'), (req, res) => {
  const { id } = req.params;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const targetRole = db.get('roles').find({ id: user.role_id }).value();
  if (targetRole?.name === 'Super Admin' && req.user.roleName !== 'Super Admin') return res.status(403).json({ success: false, message: '403 – Cannot edit Super Admin accounts.' });
  if (req.body.roleId === 'role-superadmin' && req.user.roleName !== 'Super Admin') return res.status(403).json({ success: false, message: '403 – Only Super Admin can assign the Super Admin role.' });

  const updates = {};
  if (req.body.fullName)   updates.full_name = req.body.fullName;
  if (req.body.email)      updates.email = req.body.email.toLowerCase().trim();
  if (req.body.roleId)     updates.role_id = req.body.roleId;
  if (req.body.department !== undefined) updates.department = req.body.department;
  if (req.body.avatarColor) updates.avatar_color = req.body.avatarColor;

  db.get('users').find({ id }).assign(updates).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'USER_UPDATED', targetType: 'user', targetId: id, targetName: updates.full_name || user.full_name, details: updates, ipAddress: req.ip });
  res.json({ success: true, user: enrichUser(db.get('users').find({ id }).value()), message: 'User updated.' });
});

// DELETE /api/users/:id
router.delete('/:id', requirePermission('users.delete'), (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const role = db.get('roles').find({ id: user.role_id }).value();
  if (role?.name === 'Super Admin') {
    const superCount = db.get('users').filter(u => {
      const r = db.get('roles').find({ id: u.role_id }).value();
      return r?.name === 'Super Admin' && u.status === 'ACTIVE';
    }).value().length;
    if (superCount <= 1) return res.status(400).json({ success: false, message: 'Cannot delete the last Super Admin.' });
  }

  db.get('users').remove({ id }).write();
  db.get('user_permissions').remove({ user_id: id }).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'USER_DELETED', targetType: 'user', targetId: id, targetName: user.full_name, details: { deletedRole: role?.name }, ipAddress: req.ip });
  res.json({ success: true, message: 'User deleted.' });
});

// PATCH /api/users/:id/status
router.patch('/:id/status', requirePermission('users.suspend'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be ACTIVE or SUSPENDED.' });
  if (id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot change your own status.' });

  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  db.get('users').find({ id }).assign({ status }).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_ACTIVATED', targetType: 'user', targetId: id, targetName: user.full_name, ipAddress: req.ip });
  res.json({ success: true, message: `User ${status === 'SUSPENDED' ? 'suspended' : 'activated'}.` });
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', requirePermission('users.password_reset'), (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  db.get('users').find({ id }).assign({ password_hash: bcrypt.hashSync(newPassword, 10) }).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'PASSWORD_RESET', targetType: 'user', targetId: id, targetName: user.full_name, ipAddress: req.ip });
  res.json({ success: true, message: 'Password reset.' });
});

// PUT /api/users/:id/permissions
router.put('/:id/permissions', requirePermission('roles.assign_permissions'), (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  const user = db.get('users').find({ id }).value();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  db.get('user_permissions').remove({ user_id: id }).write();
  const allPerms = db.get('permissions').value();
  permissions.forEach(p => {
    const perm = allPerms.find(x => x.key === p.key);
    if (perm) db.get('user_permissions').push({ user_id: id, permission_id: perm.id, granted: p.granted }).write();
  });

  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'USER_PERMISSIONS_UPDATED', targetType: 'user', targetId: id, targetName: user.full_name, details: { permissions }, ipAddress: req.ip });
  res.json({ success: true, effectivePermissions: getUserPermissions(id), message: 'User permissions updated.' });
});

module.exports = router;

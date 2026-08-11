const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db, writeAuditLog } = require('../database/db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

const router = express.Router();
router.use(authMiddleware);

// GET /api/roles
router.get('/', (req, res) => {
  const roles = db.get('roles').value().map(r => {
    const permCount = db.get('role_permissions').filter({ role_id: r.id }).size().value();
    const userCount = db.get('users').filter({ role_id: r.id }).size().value();
    return { ...r, permission_count: permCount, user_count: userCount };
  });
  res.json({ success: true, roles });
});

// GET /api/roles/:id/permissions
router.get('/:id/permissions', (req, res) => {
  const allPerms = db.get('permissions').value();
  const assigned = db.get('role_permissions').filter({ role_id: req.params.id }).map('permission_id').value();
  res.json({ success: true, permissions: allPerms, assigned });
});

// POST /api/roles
router.post('/', requirePermission('roles.create'), (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Role name is required.' });
  if (db.get('roles').find(r => r.name.toLowerCase() === name.trim().toLowerCase()).value()) {
    return res.status(409).json({ success: false, message: 'A role with this name already exists.' });
  }
  const id = 'role-' + uuidv4().slice(0, 8);
  const newRole = { id, name: name.trim(), description: description || '', color: color || '#6366f1', is_system: false, created_at: new Date().toISOString() };
  db.get('roles').push(newRole).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'ROLE_CREATED', targetType: 'role', targetId: id, targetName: name, ipAddress: req.ip });
  res.status(201).json({ success: true, role: newRole, message: 'Role created.' });
});

// PUT /api/roles/:id
router.put('/:id', requirePermission('roles.edit'), (req, res) => {
  const { id } = req.params;
  const role = db.get('roles').find({ id }).value();
  if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.color) updates.color = req.body.color;
  db.get('roles').find({ id }).assign(updates).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'ROLE_UPDATED', targetType: 'role', targetId: id, targetName: updates.name || role.name, ipAddress: req.ip });
  res.json({ success: true, role: db.get('roles').find({ id }).value(), message: 'Role updated.' });
});

// DELETE /api/roles/:id
router.delete('/:id', requirePermission('roles.delete'), (req, res) => {
  const { id } = req.params;
  const role = db.get('roles').find({ id }).value();
  if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });
  if (role.is_system) return res.status(400).json({ success: false, message: 'System roles cannot be deleted.' });
  const userCount = db.get('users').filter({ role_id: id }).size().value();
  if (userCount > 0) return res.status(400).json({ success: false, message: `Cannot delete role with ${userCount} user(s). Reassign them first.` });
  db.get('roles').remove({ id }).write();
  db.get('role_permissions').remove({ role_id: id }).write();
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'ROLE_DELETED', targetType: 'role', targetId: id, targetName: role.name, ipAddress: req.ip });
  res.json({ success: true, message: 'Role deleted.' });
});

// PUT /api/roles/:id/permissions
router.put('/:id/permissions', requirePermission('roles.assign_permissions'), (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  const role = db.get('roles').find({ id }).value();
  if (!role) return res.status(404).json({ success: false, message: 'Role not found.' });

  const prev = db.get('role_permissions').filter({ role_id: id }).map('permission_id').value();
  db.get('role_permissions').remove({ role_id: id }).write();
  (permissionIds || []).forEach(pid => {
    if (!db.get('role_permissions').find({ role_id: id, permission_id: pid }).value()) {
      db.get('role_permissions').push({ role_id: id, permission_id: pid }).write();
    }
  });
  writeAuditLog({
    actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName,
    action: 'ROLE_PERMISSIONS_UPDATED', targetType: 'role', targetId: id, targetName: role.name,
    details: { added: (permissionIds || []).filter(p => !prev.includes(p)), removed: prev.filter(p => !(permissionIds || []).includes(p)) },
    ipAddress: req.ip,
  });
  res.json({ success: true, message: 'Role permissions updated.' });
});

// POST /api/roles/:id/duplicate
router.post('/:id/duplicate', requirePermission('roles.create'), (req, res) => {
  const { id } = req.params;
  const source = db.get('roles').find({ id }).value();
  if (!source) return res.status(404).json({ success: false, message: 'Source role not found.' });
  const newId = 'role-' + uuidv4().slice(0, 8);
  const newName = `${source.name} (Copy)`;
  const newRole = { id: newId, name: newName, description: source.description, color: source.color, is_system: false, created_at: new Date().toISOString() };
  db.get('roles').push(newRole).write();
  db.get('role_permissions').filter({ role_id: id }).value().forEach(rp => {
    db.get('role_permissions').push({ role_id: newId, permission_id: rp.permission_id }).write();
  });
  writeAuditLog({ actorId: req.user.id, actorEmail: req.user.email, actorRole: req.user.roleName, action: 'ROLE_DUPLICATED', targetType: 'role', targetId: newId, targetName: newName, details: { sourceRole: source.name }, ipAddress: req.ip });
  res.status(201).json({ success: true, role: newRole, message: `Role duplicated as '${newName}'.` });
});

module.exports = router;

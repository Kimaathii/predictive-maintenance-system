const { query, run, get } = require('../config/db');
const { logAudit } = require('../middleware/auditMiddleware');

async function getRoles(req, res) {
    try {
        const roles = await query(`SELECT * FROM roles ORDER BY created_at ASC`);
        const result = [];
        
        for (const r of roles) {
            const perms = await query(`SELECT permission_key FROM role_permissions WHERE role_id = ?`, [r.id]);
            result.push({
                ...r,
                permissions: perms.map(p => p.permission_key)
            });
        }

        return res.json({ success: true, roles: result });
    } catch (err) {
        console.error('Error fetching roles:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch roles.' });
    }
}

async function getPermissions(req, res) {
    try {
        const permissions = await query(`SELECT * FROM permissions ORDER BY category, name`);
        return res.json({ success: true, permissions });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch permissions.' });
    }
}

async function updateRolePermissions(req, res) {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body; // array of permission keys

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ success: false, error: 'Permissions must be an array of keys.' });
        }

        // Delete existing and insert new
        await run(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
        for (const key of permissions) {
            await run(`INSERT INTO role_permissions (role_id, permission_key) VALUES (?, ?)`, [roleId, key]);
        }

        await logAudit(req, 'UPDATE_ROLE_PERMISSIONS', 'roles', { roleId, updatedPermissionCount: permissions.length });

        return res.json({
            success: true,
            message: `Permissions updated successfully for role '${roleId}'.`,
            roleId,
            permissions
        });
    } catch (err) {
        console.error('Error updating role permissions:', err);
        return res.status(500).json({ success: false, error: 'Failed to update role permissions.' });
    }
}

module.exports = {
    getRoles,
    getPermissions,
    updateRolePermissions
};

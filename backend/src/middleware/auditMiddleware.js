const { run } = require('../config/db');

async function logAudit(req, action, targetEntity, metadata = {}) {
    try {
        const userId = req.user ? req.user.id : 'ANONYMOUS';
        const userEmail = req.user ? req.user.email : 'N/A';
        const userRole = req.user ? req.user.role : 'GUEST';
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const auditId = 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        await run(
            `INSERT INTO audit_logs (id, user_id, user_email, user_role, action, target_entity, ip_address, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [auditId, userId, userEmail, userRole, action, targetEntity, ipAddress, JSON.stringify(metadata)]
        );
    } catch (err) {
        console.error('⚠️ Failed to write audit log:', err.message);
    }
}

module.exports = {
    logAudit
};

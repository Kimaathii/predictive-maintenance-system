const { query } = require('../config/db');

async function getAuditLogs(req, res) {
    try {
        const logs = await query(`
            SELECT * FROM audit_logs
            ORDER BY timestamp DESC
            LIMIT 100
        `);

        return res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch regulatory audit logs.' });
    }
}

module.exports = {
    getAuditLogs
};

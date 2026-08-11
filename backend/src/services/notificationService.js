const { run, query } = require('../config/db');

// Ensure notifications table exists
async function initNotificationTable() {
    await run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            recipient_name TEXT NOT NULL,
            recipient_contact TEXT NOT NULL,
            channel TEXT CHECK(channel IN ('EMAIL', 'SMS')) NOT NULL,
            equipment_tag TEXT,
            subject TEXT NOT NULL,
            message_body TEXT NOT NULL,
            status TEXT DEFAULT 'DELIVERED',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Initialize on service load
initNotificationTable().catch(err => console.error('Failed to init notifications table:', err));

/**
 * Dispatch automated SMS notification (AWS SNS Simulation)
 */
async function sendSMSAlert({ phone, name, tag, facility, healthIndex, workOrderId }) {
    const id = 'sms-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const subject = `[SEPLAT CRITICAL SMS ALERT] ${tag}`;
    const message_body = `SEPLAT ALERT: Critical health (${healthIndex}%) detected on ${tag} at ${facility}. Failure Risk: Urgent. Work Order #${workOrderId || 'AUTO'} generated. Technician ${name} dispatched.`;
    const contact = phone || '+234-803-555-0192';

    try {
        await run(`
            INSERT INTO notifications (id, recipient_name, recipient_contact, channel, equipment_tag, subject, message_body, status)
            VALUES (?, ?, ?, 'SMS', ?, ?, ?, 'DELIVERED')
        `, [id, name, contact, tag, subject, message_body]);

        console.log(`📱 [AWS SNS SMS SIMULATION] Sent to ${name} (${contact}): "${message_body}"`);
        return { success: true, id, channel: 'SMS', contact, subject, message_body };
    } catch (err) {
        console.error('SMS notification error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Dispatch automated Email notification (AWS SES / SendGrid Simulation)
 */
async function sendEmailAlert({ to, name, tag, facility, failureMode, healthIndex, workOrderId }) {
    const id = 'email-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const subject = `⚠️ SEPLAT PREDICTIVE ALERT: ${tag} (${facility}) Health Index Critical (${healthIndex}%)`;
    const message_body = `Dear ${name},\n\nAutomated sensor telemetry at ${facility} has detected a critical anomaly on Asset Tag: ${tag}.\n\n- Current Health Index: ${healthIndex}%\n- Predicted Failure Mode: ${failureMode}\n- Action Required: Immediate Inspection\n- Work Order Reference: ${workOrderId || 'N/A'}\n\nPlease access the Seplat Energy Predictive Maintenance Portal to track repair progress.\n\nRegards,\nSeplat Energy Asset Integrity Systems`;
    const contact = to || 'maint.mgr@seplatenergy.com';

    try {
        await run(`
            INSERT INTO notifications (id, recipient_name, recipient_contact, channel, equipment_tag, subject, message_body, status)
            VALUES (?, ?, ?, 'EMAIL', ?, ?, ?, 'DELIVERED')
        `, [id, name, contact, tag, subject, message_body]);

        console.log(`✉️ [AWS SES EMAIL SIMULATION] Sent to ${name} (${contact}): Subject: "${subject}"`);
        return { success: true, id, channel: 'EMAIL', contact, subject, message_body };
    } catch (err) {
        console.error('Email notification error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * List recent notification logs
 */
async function listNotifications(limit = 50) {
    try {
        const notifications = await query(`
            SELECT * FROM notifications
            ORDER BY timestamp DESC
            LIMIT ?
        `, [limit]);
        return notifications;
    } catch (err) {
        console.error('List notifications error:', err);
        return [];
    }
}

module.exports = {
    sendSMSAlert,
    sendEmailAlert,
    listNotifications
};

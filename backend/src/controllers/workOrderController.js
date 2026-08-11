const { query, get, run } = require('../config/db');
const { logAudit } = require('../middleware/auditMiddleware');

async function listWorkOrders(req, res) {
    try {
        const { status, priority, assigned_to } = req.query;
        let sql = `
            SELECT wo.*, e.tag_name, e.equipment_type, e.criticality_rating, f.name as facility_name,
                   u.full_name as assigned_technician_name, car.net_savings_usd
            FROM work_orders wo
            JOIN equipment e ON wo.equipment_id = e.id
            JOIN facilities f ON e.facility_id = f.id
            LEFT JOIN users u ON wo.assigned_to_user_id = u.id
            LEFT JOIN cost_avoidance_reports car ON wo.id = car.work_order_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND wo.status = ?`;
            params.push(status);
        }
        if (priority) {
            sql += ` AND wo.priority = ?`;
            params.push(priority);
        }
        if (assigned_to) {
            sql += ` AND wo.assigned_to_user_id = ?`;
            params.push(assigned_to);
        }

        sql += ` ORDER BY wo.created_at DESC`;

        const workOrders = await query(sql, params);
        return res.json({ success: true, count: workOrders.length, workOrders });
    } catch (err) {
        console.error('List work orders error:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve work orders.' });
    }
}

async function createWorkOrder(req, res) {
    try {
        const { equipment_id, assigned_to_user_id, title, description, priority, predicted_failure_mode, estimated_rul_hours } = req.body;

        if (!equipment_id || !title) {
            return res.status(400).json({ success: false, error: 'Equipment ID and title are required.' });
        }

        const id = 'wo-' + Date.now();
        await run(`
            INSERT INTO work_orders (id, equipment_id, assigned_to_user_id, title, description, priority, status, predicted_failure_mode, estimated_rul_hours)
            VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
        `, [
            id,
            equipment_id,
            assigned_to_user_id || null,
            title,
            description || '',
            priority || 'MEDIUM',
            predicted_failure_mode || 'Preventive Inspection',
            estimated_rul_hours || 168.0
        ]);

        await logAudit(req, 'CREATE_WORK_ORDER', 'work_orders', { workOrderId: id, title });

        return res.status(201).json({ success: true, message: 'Work Order generated successfully.', id });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to generate work order.' });
    }
}

async function updateWorkOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, assigned_to_user_id, resolution_notes } = req.body;

        const wo = await get(`SELECT * FROM work_orders WHERE id = ?`, [id]);
        if (!wo) {
            return res.status(404).json({ success: false, error: 'Work order not found.' });
        }

        let completedAt = wo.completed_at;
        if (status === 'COMPLETED' && !completedAt) {
            completedAt = new Date().toISOString();
            // Reset equipment health index upon completion
            await run(`UPDATE equipment SET status = 'OPERATIONAL', health_index = 95.0 WHERE id = ?`, [wo.equipment_id]);
        }

        const updatedAssigned = assigned_to_user_id !== undefined ? assigned_to_user_id : wo.assigned_to_user_id;

        await run(`
            UPDATE work_orders
            SET status = ?, assigned_to_user_id = ?, completed_at = ?
            WHERE id = ?
        `, [status || wo.status, updatedAssigned, completedAt, id]);

        await logAudit(req, 'UPDATE_WORK_ORDER_STATUS', 'work_orders', { workOrderId: id, oldStatus: wo.status, newStatus: status });

        return res.json({ success: true, message: 'Work order status updated successfully.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to update work order status.' });
    }
}

module.exports = {
    listWorkOrders,
    createWorkOrder,
    updateWorkOrderStatus
};

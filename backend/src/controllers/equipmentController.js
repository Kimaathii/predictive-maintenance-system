const { query, get, run } = require('../config/db');
const { logAudit } = require('../middleware/auditMiddleware');

async function listEquipment(req, res) {
    try {
        const { status, facility_id } = req.query;
        let sql = `
            SELECT e.*, f.name as facility_name, f.region as facility_region
            FROM equipment e
            JOIN facilities f ON e.facility_id = f.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ` AND e.status = ?`;
            params.push(status);
        }
        if (facility_id) {
            sql += ` AND e.facility_id = ?`;
            params.push(facility_id);
        }

        sql += ` ORDER BY e.health_index ASC`;

        const equipment = await query(sql, params);
        return res.json({ success: true, count: equipment.length, equipment });
    } catch (err) {
        console.error('List equipment error:', err);
        return res.status(500).json({ success: false, error: 'Failed to retrieve equipment fleet.' });
    }
}

async function getEquipmentById(req, res) {
    try {
        const { id } = req.params;
        const equipment = await get(`
            SELECT e.*, f.name as facility_name, f.region as facility_region, f.facility_type
            FROM equipment e
            JOIN facilities f ON e.facility_id = f.id
            WHERE e.id = ?
        `, [id]);

        if (!equipment) {
            return res.status(404).json({ success: false, error: 'Equipment asset not found.' });
        }

        // Recent telemetry logs
        const telemetryHistory = await query(`
            SELECT * FROM telemetry_logs WHERE equipment_id = ? ORDER BY timestamp DESC LIMIT 30
        `, [id]);

        // Active work orders
        const activeWorkOrders = await query(`
            SELECT wo.*, u.full_name as technician_name
            FROM work_orders wo
            LEFT JOIN users u ON wo.assigned_to_user_id = u.id
            WHERE wo.equipment_id = ?
            ORDER BY wo.created_at DESC
        `, [id]);

        return res.json({
            success: true,
            equipment,
            telemetryHistory,
            activeWorkOrders
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Error fetching equipment details.' });
    }
}

async function createEquipment(req, res) {
    try {
        const { facility_id, tag_name, equipment_type, serial_number, criticality_rating } = req.body;

        if (!facility_id || !tag_name || !equipment_type || !serial_number) {
            return res.status(400).json({ success: false, error: 'Missing required equipment fields.' });
        }

        const id = 'eq-' + Date.now();
        await run(`
            INSERT INTO equipment (id, facility_id, tag_name, equipment_type, serial_number, criticality_rating, status, health_index)
            VALUES (?, ?, ?, ?, ?, ?, 'OPERATIONAL', 100.0)
        `, [id, facility_id, tag_name, equipment_type, serial_number, criticality_rating || 'HIGH']);

        await logAudit(req, 'CREATE_EQUIPMENT', 'equipment', { equipmentId: id, tag_name });

        return res.status(201).json({ success: true, message: 'Equipment registered successfully.', id });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to create equipment asset.' });
    }
}

async function listFacilities(req, res) {
    try {
        const facilities = await query(`
            SELECT f.*, COUNT(e.id) as equipment_count
            FROM facilities f
            LEFT JOIN equipment e ON f.id = e.facility_id
            GROUP BY f.id
        `);
        return res.json({ success: true, facilities });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch facilities.' });
    }
}

module.exports = {
    listEquipment,
    getEquipmentById,
    createEquipment,
    listFacilities
};

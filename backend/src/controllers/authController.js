const bcrypt = require('bcryptjs');
const { get, run, query } = require('../config/db');
const { generateToken } = require('../config/jwt');
const { logAudit } = require('../middleware/auditMiddleware');

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const user = await get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email address or password.' });
        }

        const token = generateToken(user);

        // Log audit event
        req.user = user;
        await logAudit(req, 'USER_LOGIN', 'users', { email: user.email, role: user.role });

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                facility_id: user.facility_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, error: 'Internal server login error.' });
    }
}

async function getMe(req, res) {
    try {
        const user = await get(`SELECT id, full_name, email, role, facility_id, created_at FROM users WHERE id = ?`, [req.user.id]);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User account not found.' });
        }
        return res.json({ success: true, user });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Error fetching user profile.' });
    }
}

async function registerUser(req, res) {
    try {
        const { full_name, email, password, role, facility_id } = req.body;

        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ success: false, error: 'Missing required user registration fields.' });
        }

        const existing = await get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
        if (existing) {
            return res.status(400).json({ success: false, error: 'User with this email already exists.' });
        }

        const userId = 'usr-' + Date.now();
        const passwordHash = await bcrypt.hash(password, 10);

        await run(
            `INSERT INTO users (id, full_name, email, password_hash, role, facility_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, full_name, email.toLowerCase().trim(), passwordHash, role, facility_id || null]
        );

        await logAudit(req, 'CREATE_USER', 'users', { createdUserId: userId, role });

        return res.status(201).json({
            success: true,
            message: 'User provisioned successfully.',
            user: { id: userId, full_name, email, role, facility_id }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ success: false, error: 'Failed to provision user.' });
    }
}

async function listUsers(req, res) {
    try {
        const users = await query(`
            SELECT u.id, u.full_name, u.email, u.role, u.facility_id, f.name as facility_name, u.created_at
            FROM users u
            LEFT JOIN facilities f ON u.facility_id = f.id
            ORDER BY u.created_at DESC
        `);
        return res.json({ success: true, users });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to list users.' });
    }
}

module.exports = {
    login,
    getMe,
    registerUser,
    listUsers
};

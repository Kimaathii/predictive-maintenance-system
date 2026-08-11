const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seplat_energy_pred_maint_secret_key_2026';
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            facility_id: user.facility_id,
            full_name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};

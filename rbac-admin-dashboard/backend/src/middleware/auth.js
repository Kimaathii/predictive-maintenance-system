const jwt = require('jsonwebtoken');
const { db, getUserPermissions } = require('../database/db');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '401 – Unauthorised: No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.get('users').find({ id: decoded.userId }).value();
    if (!user) return res.status(401).json({ success: false, message: '401 – User not found.' });
    if (user.status !== 'ACTIVE') return res.status(403).json({ success: false, message: '403 – Account suspended or inactive.' });

    const role = db.get('roles').find({ id: user.role_id }).value();
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: role?.name,
      roleColor: role?.color,
      department: user.department,
      avatarColor: user.avatar_color,
    };
    req.userPermissions = getUserPermissions(user.id);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: '401 – Invalid or expired token.' });
  }
};

module.exports = authMiddleware;

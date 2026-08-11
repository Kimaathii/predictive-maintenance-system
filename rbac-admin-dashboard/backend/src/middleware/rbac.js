const { writeAuditLog } = require('../database/db');

/**
 * requirePermission(permKey)
 * Returns Express middleware that checks if req.userPermissions includes permKey.
 * On failure: logs to audit trail and returns 403.
 */
const requirePermission = (permKey) => (req, res, next) => {
  if (!req.userPermissions || !req.userPermissions.includes(permKey)) {
    writeAuditLog({
      actorId:    req.user?.id,
      actorEmail: req.user?.email,
      actorRole:  req.user?.roleName,
      action:     'PERMISSION_DENIED',
      targetType: 'endpoint',
      targetId:   req.originalUrl,
      targetName: `${req.method} ${req.originalUrl}`,
      details:    { required: permKey, userRole: req.user?.roleName },
      ipAddress:  req.ip,
      status:     'DENIED',
    });
    return res.status(403).json({
      success: false,
      message: `403 – Access Denied: You do not have the '${permKey}' permission.`,
      required: permKey,
    });
  }
  next();
};

/**
 * requireRole(roleName | roleName[])
 * Ensures user has a specific role (or one of several).
 */
const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!req.user || !allowed.includes(req.user.roleName)) {
    return res.status(403).json({
      success: false,
      message: `403 – Access Denied: Role '${req.user?.roleName}' is not authorised for this action.`,
    });
  }
  next();
};

module.exports = { requirePermission, requireRole };

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Expects 'Authorization: Bearer <token>'
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];

    // Highly permissive mock bypass for demo/testing
    if (token.includes('mock') || token.length < 50) {
      req.user = { id: 2, role: 'SUPER_ADMIN', companyId: req.tenantId || 1 };
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'desktrack_secret');
      req.user = decoded;
      
      // Safety check: Ensure the user belongs to the current tenant
      if (req.user.companyId !== (req.tenantId || 1)) {
        return res.status(403).json({ error: 'Unauthorized access to this tenant.' });
      }
      next();
    } catch (err) {
      console.error('JWT Verify Error:', err.message);
      res.status(401).json({ error: 'Invalid or expired token.' });
    }
  } catch (err) {
    console.error('Auth Header Error:', err.message);
    res.status(401).json({ error: 'Authorization error.' });
  }
};

/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} roles - Allowed roles
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(403).json({ error: 'Insufficient permissions.' });

    // Check JWT role first
    if (roles.includes(req.user.role)) return next();

    // Fallback: check employee table role (JWT may have stale role)
    try {
      const { query } = require('../config/db');
      const empResult = await query(
        'SELECT role FROM employees WHERE email = (SELECT email FROM users WHERE id = $1 AND company_id = $2) AND company_id = $2',
        [req.user.id, req.user.companyId || req.tenantId || 1]
      );
      if (empResult.rows.length > 0 && roles.includes(empResult.rows[0].role)) {
        req.user.role = empResult.rows[0].role; // Update for this request
        return next();
      }
    } catch (e) { /* fallback failed, use JWT role */ }

    return res.status(403).json({ error: 'Insufficient permissions.' });
  };
};

module.exports = { authMiddleware, checkRole };

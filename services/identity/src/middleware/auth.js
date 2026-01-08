const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and adds user to request
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: { message: 'Autentifikimi mungon' } });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            perdoruesi_id: decoded.perdoruesi_id,
            email: decoded.email,
            roles: decoded.roles || []
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: { message: 'Token i skaduar' } });
        }
        return res.status(401).json({ error: { message: 'Token i pavlefshëm' } });
    }
};

/**
 * Admin Authorization Middleware
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.roles.includes('admin')) {
        return res.status(403).json({ error: { message: 'Vetëm adminët kanë qasje' } });
    }
    next();
};

module.exports = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;

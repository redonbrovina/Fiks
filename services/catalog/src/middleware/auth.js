const jwt = require('jsonwebtoken');

// Simple JWT authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: { message: 'Access token required' } });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: { message: 'Invalid or expired token' } });
        }
        
        req.user = user;
        next();
    });
};

// Middleware to check if user can only access their own profile
const authorizeProfileAccess = (req, res, next) => {
    const { profesionistiId } = req.params;
    const userId = req.user.userId; // Assuming userId is in the JWT payload

    if (profesionistiId !== userId) {
        return res.status(403).json({ error: { message: 'Access denied: You can only access your own profile' } });
    }

    next();
};

module.exports = {
    authenticateToken,
    authorizeProfileAccess
};

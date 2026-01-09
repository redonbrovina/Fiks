/**
 * Audit Log Middleware
 * Logs all important user actions for security and compliance
 * Non-blocking - continues even if logging fails
 */
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const auditLogFile = path.join(logsDir, 'audit.log');

/**
 * Format audit log entry
 */
function formatAuditEntry(data) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data
    }) + '\n';
}

/**
 * Write to audit log file (async, non-blocking)
 */
function writeAuditLog(entry) {
    fs.appendFile(auditLogFile, formatAuditEntry(entry), (err) => {
        if (err) {
            console.warn('Audit log write failed:', err.message);
        }
    });
}

/**
 * Audit Log Middleware
 * Logs: method, path, user, IP, status, duration
 */
const auditMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Capture original end function
    const originalEnd = res.end;

    res.end = function (...args) {
        const duration = Date.now() - startTime;

        // Extract user info if authenticated
        const userId = req.user?.perdoruesi_id || req.user?.userId || 'anonymous';
        const userRole = req.user?.role || req.user?.roles?.join(',') || 'none';

        // Log entry
        const auditEntry = {
            method: req.method,
            path: req.originalUrl || req.url,
            userId: userId,
            userRole: userRole,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'unknown',
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            // Only log body for write operations (not passwords)
            ...((['POST', 'PUT', 'DELETE'].includes(req.method) && req.body) && {
                action: getActionDescription(req.method, req.originalUrl),
                // Exclude sensitive fields
                bodyKeys: Object.keys(req.body).filter(k =>
                    !['password', 'fjalkalimi', 'token', 'refreshToken', 'accessToken'].includes(k)
                )
            })
        };

        // Write audit log
        writeAuditLog(auditEntry);

        // Also log important actions to console
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            console.log(`📝 AUDIT: ${req.method} ${req.originalUrl} by user:${userId} - ${res.statusCode} (${duration}ms)`);
        }

        // Call original end
        originalEnd.apply(res, args);
    };

    next();
};

/**
 * Get human-readable action description
 */
function getActionDescription(method, path) {
    const actions = {
        'POST /api/auth/register': 'User Registration',
        'POST /api/auth/login': 'User Login',
        'POST /api/auth/logout': 'User Logout',
        'PUT /api/users/me': 'Profile Update',
        'POST /api/v1/catalog/services': 'Service Created',
        'PUT /api/v1/catalog/services': 'Service Updated',
        'DELETE /api/v1/catalog/services': 'Service Deleted',
        'POST /api/bookings': 'Booking Created',
        'PUT /api/bookings': 'Booking Updated',
        'POST /api/reviews': 'Review Submitted'
    };

    // Find matching action
    for (const [key, value] of Object.entries(actions)) {
        const [m, p] = key.split(' ');
        if (method === m && path.startsWith(p)) {
            return value;
        }
    }

    return `${method} operation`;
}

/**
 * Security event logger for critical events
 */
const logSecurityEvent = (eventType, details) => {
    writeAuditLog({
        type: 'SECURITY_EVENT',
        eventType,
        ...details,
        severity: getSeverity(eventType)
    });

    console.warn(`🔒 SECURITY: ${eventType}`, details);
};

function getSeverity(eventType) {
    const severities = {
        'FAILED_LOGIN': 'MEDIUM',
        'INVALID_TOKEN': 'LOW',
        'UNAUTHORIZED_ACCESS': 'HIGH',
        'RATE_LIMIT_EXCEEDED': 'MEDIUM',
        'SUSPICIOUS_ACTIVITY': 'HIGH'
    };
    return severities[eventType] || 'INFO';
}

module.exports = {
    auditMiddleware,
    logSecurityEvent,
    writeAuditLog
};

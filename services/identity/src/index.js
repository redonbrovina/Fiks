require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const { runSeeder } = require('./seeder');
const client = require('prom-client');
const redisClient = require('./config/redis');
const KafkaProducer = require('./services/KafkaProducer');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const qytetiRoutes = require('./routes/qyteti');

const app = express();
const PORT = process.env.PORT || 3001;

// Metrics Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Attach redis to req
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'identity' });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qytetet', qytetiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Not Found' } });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('[OK] Database connection established');

        // Sync models (in development only)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('[OK] Database models synchronized');

            // Run seeders
            await runSeeder();
        }

        app.listen(PORT, () => {
            console.log(`[RUNNING] Identity service on port ${PORT}`);
        });
    } catch (error) {
        console.error('[ERROR] Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

// Export redisClient for use in services
module.exports = { app, redisClient };

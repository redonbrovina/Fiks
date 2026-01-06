require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const { runSeeder } = require('./seeder');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const qytetiRoutes = require('./routes/qyteti');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'identity' });
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

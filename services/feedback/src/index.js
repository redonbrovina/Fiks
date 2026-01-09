require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const reviewRoutes = require('./routes/reviewRoutes');

const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3004;

// Metrics Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'feedback' });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Review routes
app.use('/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: { message: err.message || 'Internal Server Error' }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Not Found' } });
});

// Start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized');
        }

        // Start Kafka consumer
        const KafkaConsumer = require('./services/KafkaConsumer');
        await KafkaConsumer.connect();
        console.log('✅ Kafka consumer connected');

        app.listen(PORT, () => {
            console.log(`🚀 Feedback service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

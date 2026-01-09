require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const KafkaConsumer = require('./services/KafkaConsumer');
const RedisCache = require('./services/RedisCache');
const { runSeeder } = require('./seeder');
const { register, updateCatalogMetrics } = require('./services/businessMetrics');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'catalog' });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    await updateCatalogMetrics();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Update metrics every 30 seconds
setInterval(() => {
    updateCatalogMetrics();
}, 30000);

// API Routes
app.use(routes);

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

        // Run sync and seeder in non-production environments
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized');

            // Run category seeder
            await runSeeder();
            console.log('✅ Category seeder completed');
        }

        // Start Kafka consumer
        await KafkaConsumer.connect();
        console.log('✅ Kafka consumer connected');

        // Connect Redis Cache (non-blocking - continues if Redis unavailable)
        await RedisCache.connect();

        app.listen(PORT, () => {
            console.log(`🚀 Catalog service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();


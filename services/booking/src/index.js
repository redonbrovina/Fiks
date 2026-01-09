require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const { register, updateBookingMetrics } = require('./services/businessMetrics');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
// app.use(cors()); // Disabled - CORS handled by nginx gateway
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'booking' });
});

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
    await updateBookingMetrics();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Update metrics every 30 seconds
setInterval(() => {
    updateBookingMetrics();
}, 30000);

const bookingRoutes = require('./routes/bookingRoutes');
const kerkesaPunesRoutes = require('./routes/kerkesaPunesRoutes');
const liriaOresRoutes = require('./routes/liriaOresRoutes');

app.use('/api/bookings', bookingRoutes);
app.use('/api/kerkesa-punes', kerkesaPunesRoutes);
app.use('/api/liria-ores', liriaOresRoutes);

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

            // Seed statuses
            const seedStatuses = require('./seeders/statusSeeder');
            await seedStatuses(sequelize);

            // Seed sample data
            const seedData = require('./seeders/dataSeeder');
            await seedData(sequelize);
        }

        // Start Kafka consumer
        const KafkaConsumer = require('./services/KafkaConsumer');
        await KafkaConsumer.connect();
        console.log('✅ Kafka consumer connected');

        app.listen(PORT, () => {
            console.log(`🚀 Booking service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

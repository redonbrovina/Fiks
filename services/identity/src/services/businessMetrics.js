/**
 * Business Metrics for Identity Service
 * Exposes user and professional counts to Prometheus
 */
const client = require('prom-client');
const { Perdoruesi, Profesionisti } = require('../models');

// Custom business metrics gauges
const totalUsersGauge = new client.Gauge({
    name: 'fiks_users_total',
    help: 'Total number of registered users'
});

const totalProfessionalsGauge = new client.Gauge({
    name: 'fiks_professionals_total',
    help: 'Total number of registered professionals'
});

const usersRegisteredTodayGauge = new client.Gauge({
    name: 'fiks_users_registered_today',
    help: 'Number of users registered today'
});

const usersRegisteredThisWeekGauge = new client.Gauge({
    name: 'fiks_users_registered_week',
    help: 'Number of users registered this week'
});

const usersRegisteredThisMonthGauge = new client.Gauge({
    name: 'fiks_users_registered_month',
    help: 'Number of users registered this month'
});

/**
 * Update all business metrics
 * Should be called periodically or on-demand
 */
async function updateBusinessMetrics() {
    try {
        const { Op } = require('sequelize');

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total counts
        const totalUsers = await Perdoruesi.count();
        const totalProfessionals = await Profesionisti.count();

        // Time-based counts
        const usersToday = await Perdoruesi.count({
            where: { createdAt: { [Op.gte]: startOfDay } }
        });

        const usersThisWeek = await Perdoruesi.count({
            where: { createdAt: { [Op.gte]: startOfWeek } }
        });

        const usersThisMonth = await Perdoruesi.count({
            where: { createdAt: { [Op.gte]: startOfMonth } }
        });

        // Set gauge values
        totalUsersGauge.set(totalUsers);
        totalProfessionalsGauge.set(totalProfessionals);
        usersRegisteredTodayGauge.set(usersToday);
        usersRegisteredThisWeekGauge.set(usersThisWeek);
        usersRegisteredThisMonthGauge.set(usersThisMonth);

        console.log('[METRICS] Business metrics updated:', {
            totalUsers,
            totalProfessionals,
            usersToday,
            usersThisWeek,
            usersThisMonth
        });
    } catch (error) {
        console.error('[METRICS] Error updating business metrics:', error.message);
    }
}

// Register metrics
function registerMetrics(registry) {
    registry.registerMetric(totalUsersGauge);
    registry.registerMetric(totalProfessionalsGauge);
    registry.registerMetric(usersRegisteredTodayGauge);
    registry.registerMetric(usersRegisteredThisWeekGauge);
    registry.registerMetric(usersRegisteredThisMonthGauge);
}

module.exports = {
    updateBusinessMetrics,
    registerMetrics,
    totalUsersGauge,
    totalProfessionalsGauge
};

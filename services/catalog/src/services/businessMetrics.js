/**
 * Business Metrics for Catalog Service
 * Exposes professional profile and service counts to Prometheus
 */
const client = require('prom-client');
const { Profili, Sherbimi, Kategoria } = require('../models');

// Create registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom business metrics gauges
const totalProfilesGauge = new client.Gauge({
    name: 'fiks_profiles_total',
    help: 'Total number of professional profiles',
    registers: [register]
});

const totalServicesGauge = new client.Gauge({
    name: 'fiks_services_total',
    help: 'Total number of services offered',
    registers: [register]
});

const totalCategoriesGauge = new client.Gauge({
    name: 'fiks_categories_total',
    help: 'Total number of service categories',
    registers: [register]
});

const profilesThisWeekGauge = new client.Gauge({
    name: 'fiks_profiles_week',
    help: 'Number of profiles created this week',
    registers: [register]
});

const profilesThisMonthGauge = new client.Gauge({
    name: 'fiks_profiles_month',
    help: 'Number of profiles created this month',
    registers: [register]
});

const averageRatingGauge = new client.Gauge({
    name: 'fiks_average_rating',
    help: 'Average professional rating across platform',
    registers: [register]
});

/**
 * Update all catalog metrics
 */
async function updateCatalogMetrics() {
    try {
        const { Op } = require('sequelize');
        const { sequelize } = require('../models');

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total counts
        const totalProfiles = await Profili.count();
        const totalServices = await Sherbimi.count();
        const totalCategories = await Kategoria.count();

        // Time-based counts
        const profilesThisWeek = await Profili.count({
            where: { createdAt: { [Op.gte]: startOfWeek } }
        });

        const profilesThisMonth = await Profili.count({
            where: { createdAt: { [Op.gte]: startOfMonth } }
        });

        // Average rating
        const avgRatingResult = await Profili.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
        });
        const avgRating = parseFloat(avgRatingResult?.dataValues?.avgRating) || 0;

        // Set gauge values
        totalProfilesGauge.set(totalProfiles);
        totalServicesGauge.set(totalServices);
        totalCategoriesGauge.set(totalCategories);
        profilesThisWeekGauge.set(profilesThisWeek);
        profilesThisMonthGauge.set(profilesThisMonth);
        averageRatingGauge.set(avgRating);

        console.log('[METRICS] Catalog metrics updated:', {
            totalProfiles,
            totalServices,
            totalCategories,
            avgRating: avgRating.toFixed(2)
        });
    } catch (error) {
        console.error('[METRICS] Error updating catalog metrics:', error.message);
    }
}

module.exports = {
    register,
    updateCatalogMetrics
};

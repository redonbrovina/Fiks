/**
 * Business Metrics for Booking Service
 * Exposes booking counts to Prometheus
 */
const client = require('prom-client');
const { KerkesaPunes, Termini } = require('../models');

// Create registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom business metrics gauges
const totalBookingsGauge = new client.Gauge({
    name: 'fiks_bookings_total',
    help: 'Total number of bookings/work requests',
    registers: [register]
});

const pendingBookingsGauge = new client.Gauge({
    name: 'fiks_bookings_pending',
    help: 'Number of pending bookings',
    registers: [register]
});

const completedBookingsGauge = new client.Gauge({
    name: 'fiks_bookings_completed',
    help: 'Number of completed bookings',
    registers: [register]
});

const bookingsTodayGauge = new client.Gauge({
    name: 'fiks_bookings_today',
    help: 'Number of bookings created today',
    registers: [register]
});

const bookingsThisWeekGauge = new client.Gauge({
    name: 'fiks_bookings_week',
    help: 'Number of bookings created this week',
    registers: [register]
});

const bookingsThisMonthGauge = new client.Gauge({
    name: 'fiks_bookings_month',
    help: 'Number of bookings created this month',
    registers: [register]
});

/**
 * Update all booking metrics
 */
async function updateBookingMetrics() {
    try {
        const { Op } = require('sequelize');

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total bookings
        const totalBookings = await KerkesaPunes.count();

        // Pending bookings (kerkesa_punes_status_id = 1 typically means pending)
        const pendingBookings = await KerkesaPunes.count({
            where: { kerkesa_punes_status_id: 1 }
        });

        // Completed bookings (kerkesa_punes_status_id = 3 typically means completed)
        const completedBookings = await KerkesaPunes.count({
            where: { kerkesa_punes_status_id: 3 }
        });

        // Time-based counts
        const bookingsToday = await KerkesaPunes.count({
            where: { createdAt: { [Op.gte]: startOfDay } }
        });

        const bookingsThisWeek = await KerkesaPunes.count({
            where: { createdAt: { [Op.gte]: startOfWeek } }
        });

        const bookingsThisMonth = await KerkesaPunes.count({
            where: { createdAt: { [Op.gte]: startOfMonth } }
        });

        // Set gauge values
        totalBookingsGauge.set(totalBookings);
        pendingBookingsGauge.set(pendingBookings);
        completedBookingsGauge.set(completedBookings);
        bookingsTodayGauge.set(bookingsToday);
        bookingsThisWeekGauge.set(bookingsThisWeek);
        bookingsThisMonthGauge.set(bookingsThisMonth);

        console.log('[METRICS] Booking metrics updated:', {
            totalBookings,
            pendingBookings,
            completedBookings,
            bookingsToday
        });
    } catch (error) {
        console.error('[METRICS] Error updating booking metrics:', error.message);
    }
}

module.exports = {
    register,
    updateBookingMetrics
};

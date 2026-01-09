const { LiriaOres } = require('../models');

exports.createLiriaOres = async (req, res) => {
    try {
        const { profesionisti_id, dita_javes, koha_fillimit, koha_mbarimit } = req.body;

        const liria = await LiriaOres.create({
            profesionisti_id,
            dita_javes,
            koha_fillimit,
            koha_mbarimit
        });

        res.status(201).json(liria);
    } catch (error) {
        console.error('Error creating LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to create availability slot' } });
    }
};

exports.getLiriaOresByProfesionistiId = async (req, res) => {
    try {
        const { profesionisti_id } = req.params;
        const lirite = await LiriaOres.findAll({
            where: { profesionisti_id },
            order: [['dita_javes', 'ASC'], ['koha_fillimit', 'ASC']]
        });

        res.json(lirite);
    } catch (error) {
        console.error('Error fetching LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to retrieve availability slots' } });
    }
};

// Get available time slots for a professional on a specific date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { profesionisti_id } = req.params;
        const { date } = req.query; // ISO date string (YYYY-MM-DD)

        if (!date) {
            return res.status(400).json({ error: { message: 'Date parameter is required (YYYY-MM-DD)' } });
        }

        const { Termini, KerkesaPunes } = require('../models');
        const { Op } = require('sequelize');

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get professional's availability for this day of week
        const availability = await LiriaOres.findAll({
            where: {
                profesionisti_id: parseInt(profesionisti_id),
                dita_javes: dayOfWeek
            },
            order: [['koha_fillimit', 'ASC']]
        });

        if (availability.length === 0) {
            return res.json({ 
                available: true, 
                slots: [],
                message: 'No availability defined for this day. Professional may accept bookings anyway.' 
            });
        }

        // Get booked appointments for this date
        const bookedAppointments = await Termini.findAll({
            include: [{
                model: KerkesaPunes,
                as: 'kerkesaPunes',
                where: {
                    profesionisti_id: parseInt(profesionisti_id)
                },
                required: true
            }],
            where: {
                koha_fillimit: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            order: [['koha_fillimit', 'ASC']]
        });

        // Generate available slots (simplified: return availability windows minus booked times)
        const slots = availability.map(avail => ({
            day_of_week: avail.dita_javes,
            start_time: avail.koha_fillimit,
            end_time: avail.koha_mbarimit,
            available: true // Could add logic to check against bookedAppointments
        }));

        res.json({
            date: date,
            day_of_week: dayOfWeek,
            availability: slots,
            booked_appointments: bookedAppointments.map(apt => ({
                start: apt.koha_fillimit,
                end: apt.koha_mbarimit
            }))
        });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: { message: 'Failed to retrieve available slots' } });
    }
};

exports.deleteLiriaOres = async (req, res) => {
    try {
        const { id } = req.params;
        const liria = await LiriaOres.findByPk(id);

        if (!liria) {
            return res.status(404).json({ error: { message: 'Availability slot not found' } });
        }

        await liria.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to delete availability slot' } });
    }
};

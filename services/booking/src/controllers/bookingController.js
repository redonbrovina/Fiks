const { Termini, KerkesaPunes, KerkesaPunesStatus, LiriaOres, sequelize } = require('../models');
const { Op } = require('sequelize');
const KafkaProducer = require('../services/KafkaProducer');

// Create appointment (Termini) from work request with conflict checking
exports.createBooking = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { kerkesa_punes_id, koha_fillimit, koha_mbarimit, cmimi } = req.body;

        if (!kerkesa_punes_id || !koha_fillimit || !koha_mbarimit) {
            return res.status(400).json({
                error: { message: 'Work request ID, start time, and end time are required' }
            });
        }

        // Get the work request
        const kerkesa = await KerkesaPunes.findByPk(kerkesa_punes_id, { transaction });
        if (!kerkesa) {
            await transaction.rollback();
            return res.status(404).json({ error: { message: 'Work request not found' } });
        }

        // Get professional ID from work request
        const profesionisti_id = kerkesa.profesionisti_id;
        if (!profesionisti_id) {
            await transaction.rollback();
            return res.status(400).json({
                error: { message: 'Work request must be assigned to a professional' }
            });
        }

        const startTime = new Date(koha_fillimit);
        const endTime = new Date(koha_mbarimit);

        // Check for conflicts: existing appointments that overlap for this professional
        // First get all work requests for this professional that have appointments
        const existingAppointments = await Termini.findAll({
            include: [{
                model: KerkesaPunes,
                as: 'kerkesaPunes',
                where: {
                    profesionisti_id: profesionisti_id
                },
                required: true
            }],
            transaction
        });

        // Check for overlapping times
        const conflictingAppointment = existingAppointments.find(apt => {
            // Skip if this is for the same work request
            if (apt.kerkesa_punes_id === parseInt(kerkesa_punes_id)) return false;

            if (!apt.koha_fillimit || !apt.koha_mbarimit) return false;

            const aptStart = new Date(apt.koha_fillimit);
            const aptEnd = new Date(apt.koha_mbarimit);

            // Check if appointments overlap (two appointments overlap if one starts before the other ends)
            return (startTime < aptEnd && endTime > aptStart);
        });

        if (conflictingAppointment) {
            await transaction.rollback();
            return res.status(409).json({
                error: {
                    message: 'Time slot conflicts with existing appointment',
                    conflictingAppointment: {
                        id: conflictingAppointment.termini_id,
                        start: conflictingAppointment.koha_fillimit,
                        end: conflictingAppointment.koha_mbarimit
                    }
                }
            });
        }

        // Check if time slot is within professional's availability
        const dayOfWeek = startTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startTimeOnly = startTime.toTimeString().slice(0, 5); // HH:mm format
        const endTimeOnly = endTime.toTimeString().slice(0, 5);

        // Check if professional has any availability slots defined for this day
        const availabilitySlots = await LiriaOres.findAll({
            where: {
                profesionisti_id: profesionisti_id,
                dita_javes: dayOfWeek
            },
            transaction
        });

        if (availabilitySlots.length === 0) {
            // If no availability defined for this day, allow booking (professional may accept anyway)
            console.log('⚠️  No availability slots defined for this day, allowing booking');
        } else {
            // Check if the requested time slot falls within any availability window
            // The booking must be completely within one availability slot
            const isWithinAvailability = availabilitySlots.some(slot => {
                // Convert TIME fields to HH:mm format for comparison
                let slotStart = String(slot.koha_fillimit);
                let slotEnd = String(slot.koha_mbarimit);

                // Handle different TIME formats (HH:mm:ss or HH:mm)
                if (slotStart.length > 5) slotStart = slotStart.slice(0, 5);
                if (slotEnd.length > 5) slotEnd = slotEnd.slice(0, 5);

                // Check if requested time is completely within this availability slot
                // Start time must be >= slot start, end time must be <= slot end
                return startTimeOnly >= slotStart && endTimeOnly <= slotEnd;
            });

            if (!isWithinAvailability) {
                await transaction.rollback();

                // Format available slots for better error message
                const availableHours = availabilitySlots.map(slot => {
                    let start = String(slot.koha_fillimit);
                    let end = String(slot.koha_mbarimit);
                    if (start.length > 5) start = start.slice(0, 5);
                    if (end.length > 5) end = end.slice(0, 5);
                    return `${start} - ${end}`;
                }).join(', ');

                return res.status(400).json({
                    error: {
                        message: `Selected time slot (${startTimeOnly} - ${endTimeOnly}) is outside professional's availability hours for this day. Available hours: ${availableHours || 'None'}`,
                        requestedTime: {
                            start: startTimeOnly,
                            end: endTimeOnly
                        },
                        availableSlots: availabilitySlots.map(slot => {
                            let start = String(slot.koha_fillimit);
                            let end = String(slot.koha_mbarimit);
                            if (start.length > 5) start = start.slice(0, 5);
                            if (end.length > 5) end = end.slice(0, 5);
                            return {
                                day: dayOfWeek,
                                start: start,
                                end: end
                            };
                        })
                    }
                });
            }
        }

        // Create the appointment
        const booking = await Termini.create({
            kerkesa_punes_id,
            koha_fillimit: startTime,
            koha_mbarimit: endTime,
            koha: startTime, // Legacy field
            cmimi: cmimi || null
        }, { transaction });

        // Update work request status to "Confirmed" or "Accepted"
        const [confirmedStatus] = await KerkesaPunesStatus.findOrCreate({
            where: { status: 'Confirmed' },
            defaults: { status: 'Confirmed' },
            transaction
        });

        await kerkesa.update({
            kerkesa_punes_status_id: confirmedStatus.kerkesa_punes_status_id
        }, { transaction });

        await transaction.commit();

        // Fetch the created booking with associations
        const createdBooking = await Termini.findByPk(booking.termini_id, {
            include: [{
                model: KerkesaPunes,
                as: 'kerkesaPunes',
                include: [{
                    model: KerkesaPunesStatus,
                    as: 'statusi'
                }]
            }]
        });

        // Publish booking_completed event to Kafka for review prompts
        await KafkaProducer.publish('booking_completed', {
            termini_id: booking.termini_id,
            profesionisti_id: profesionisti_id,
            perdoruesi_id: kerkesa.perdoruesi_id,
            timestamp: new Date().toISOString()
        });

        res.status(201).json(createdBooking);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating booking:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const { profesionisti_id, perdoruesi_id } = req.query;
        const whereClause = {};

        const includeClause = [{
            model: KerkesaPunes,
            as: 'kerkesaPunes',
            include: [{
                model: KerkesaPunesStatus,
                as: 'statusi'
            }]
        }];

        // Filter by professional if provided
        if (profesionisti_id) {
            includeClause[0].where = { profesionisti_id: parseInt(profesionisti_id) };
            includeClause[0].required = true;
        }

        // Filter by user if provided
        if (perdoruesi_id) {
            if (!includeClause[0].where) includeClause[0].where = {};
            includeClause[0].where.perdoruesi_id = parseInt(perdoruesi_id);
            includeClause[0].required = true;
        }

        const bookings = await Termini.findAll({
            where: whereClause,
            include: includeClause,
            order: [['koha_fillimit', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Termini.findByPk(req.params.id, {
            include: [{
                model: KerkesaPunes,
                as: 'kerkesaPunes',
                include: [{
                    model: KerkesaPunesStatus,
                    as: 'statusi'
                }]
            }]
        });
        if (!booking) {
            return res.status(404).json({ error: { message: 'Booking not found' } });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const [updated] = await Termini.update(req.body, {
            where: { termini_id: req.params.id }
        });
        if (updated) {
            const updatedBooking = await Termini.findByPk(req.params.id);
            res.json(updatedBooking);
        } else {
            res.status(404).json({ error: { message: 'Booking not found' } });
        }
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const deleted = await Termini.destroy({
            where: { termini_id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: { message: 'Booking not found' } });
        }
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

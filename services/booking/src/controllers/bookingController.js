const { Termini } = require('../models');

exports.createBooking = async (req, res) => {
    try {
        const booking = await Termini.create(req.body);
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: { message: error.message } });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Termini.findAll();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Termini.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: { message: 'Booking not found' } });
        }
        res.json(booking);
    } catch (error) {
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

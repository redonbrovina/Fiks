const { Pervoja, Profili } = require('../models');
const { validationResult } = require('express-validator');

// Get all experiences for a professional
const getExperiences = async (req, res) => {
    try {
        const { profesionistiId } = req.params;

        const experiences = await Pervoja.findAll({
            where: { profesionisti_id: profesionistiId },
            order: [['data_fillimit', 'DESC']]
        });

        res.json(experiences);
    } catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Create new experience
const createExperience = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { profesionisti_id, pozicioni, data_fillimit, data_mbarimit, roli, pershkrimi } = req.body;

        // Verify the profile exists
        const profile = await Profili.findOne({
            where: { profesionisti_id }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Profile not found' } });
        }

        const experience = await Pervoja.create({
            profesionisti_id,
            pozicioni,
            data_fillimit,
            data_mbarimit: data_mbarimit || null,
            roli,
            pershkrimi
        });

        res.status(201).json(experience);
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Update experience
const updateExperience = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { id } = req.params;
        const { pozicioni, data_fillimit, data_mbarimit, roli, pershkrimi } = req.body;

        const experience = await Pervoja.findByPk(id);

        if (!experience) {
            return res.status(404).json({ error: { message: 'Experience not found' } });
        }

        // Authorization check - verify user owns this experience
        if (req.user && req.user.profesionisti_id !== experience.profesionisti_id) {
            return res.status(403).json({ error: { message: 'Not authorized to update this experience' } });
        }

        const updateData = {};
        if (pozicioni !== undefined) updateData.pozicioni = pozicioni;
        if (data_fillimit !== undefined) updateData.data_fillimit = data_fillimit;
        if (data_mbarimit !== undefined) updateData.data_mbarimit = data_mbarimit;
        if (roli !== undefined) updateData.roli = roli;
        if (pershkrimi !== undefined) updateData.pershkrimi = pershkrimi;

        await experience.update(updateData);

        res.json(experience);
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Delete experience
const deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;

        const experience = await Pervoja.findByPk(id);

        if (!experience) {
            return res.status(404).json({ error: { message: 'Experience not found' } });
        }

        // Authorization check - verify user owns this experience
        if (req.user && req.user.profesionisti_id !== experience.profesionisti_id) {
            return res.status(403).json({ error: { message: 'Not authorized to delete this experience' } });
        }

        await experience.destroy();

        res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

module.exports = {
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience
};

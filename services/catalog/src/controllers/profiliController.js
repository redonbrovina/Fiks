const { Profili } = require('../models');
const { validationResult } = require('express-validator');
const path = require('path');

// Get profile by profesionisti_id
const getProfile = async (req, res) => {
    try {
        const { profesionistiId } = req.params;
        
        const profile = await Profili.findOne({
            where: { profesionisti_id: profesionistiId }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Profile not found' } });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { profesionistiId } = req.params;
        const { emri, email, nr_telefonit, imazh } = req.body;

        const profile = await Profili.findOne({
            where: { profesionisti_id: profesionistiId }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Profile not found' } });
        }

        // Update profile fields
        const updateData = {};
        if (emri !== undefined) updateData.emri = emri;
        if (email !== undefined) updateData.email = email;
        if (nr_telefonit !== undefined) updateData.nr_telefonit = nr_telefonit;
        if (imazh !== undefined) updateData.imazh = imazh;

        await profile.update(updateData);

        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Create new profile
const createProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { emri, email, nr_telefonit, imazh, profesionisti_id } = req.body;

        // Check if profile already exists for this profesionisti_id
        const existingProfile = await Profili.findOne({
            where: { profesionisti_id }
        });

        if (existingProfile) {
            return res.status(400).json({ error: { message: 'Profile already exists for this professional' } });
        }

        const profile = await Profili.create({
            emri,
            email,
            nr_telefonit,
            imazh,
            profesionisti_id
        });

        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Delete profile
const deleteProfile = async (req, res) => {
    try {
        const { profesionistiId } = req.params;

        const profile = await Profili.findOne({
            where: { profesionisti_id: profesionistiId }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Profile not found' } });
        }

        await profile.destroy();

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        const { profesionistiId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: { message: 'No file uploaded' } });
        }

        const profile = await Profili.findOne({
            where: { profesionisti_id: profesionistiId }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Profile not found' } });
        }

        // Update profile with image path
        const imagePath = `/uploads/profiles/${req.file.filename}`;
        await profile.update({ imazh: imagePath });

        res.json({ 
            message: 'Profile image uploaded successfully',
            imagePath: imagePath
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Serve uploaded files
const serveUploads = (req, res) => {
    const filePath = path.join(__dirname, '../../uploads', req.params.path);
    res.sendFile(filePath);
};

module.exports = {
    getProfile,
    updateProfile,
    createProfile,
    deleteProfile,
    uploadProfileImage,
    serveUploads
};

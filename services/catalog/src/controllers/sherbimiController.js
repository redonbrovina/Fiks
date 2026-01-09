const { Sherbimi, Profili, Kategoria } = require('../models');
const { validationResult } = require('express-validator');
const RedisCache = require('../services/RedisCache');

// Get all services for a professional (by profesionisti_id)
const getProfessionalServices = async (req, res) => {
    try {
        const { profesionistiId } = req.params;

        // First find the profile by profesionisti_id
        const profile = await Profili.findOne({
            where: { profesionisti_id: profesionistiId }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Professional profile not found' } });
        }

        // Then find services by profili_id
        const services = await Sherbimi.findAll({
            where: { profili_id: profile.profili_id },
            include: [
                {
                    model: Kategoria,
                    as: 'kategoria',
                    attributes: ['kategoria_id', 'lloji_kategorise']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(services);
    } catch (error) {
        console.error('Error fetching professional services:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Get single service by ID
const getService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await Sherbimi.findOne({
            where: { sherbimi_id: serviceId },
            include: [
                {
                    model: Profili,
                    as: 'profili',
                    attributes: ['profili_id', 'emri', 'email', 'nr_telefonit', 'imazh', 'rating']
                },
                {
                    model: Kategoria,
                    as: 'kategoria',
                    attributes: ['kategoria_id', 'lloji_kategorise']
                }
            ]
        });

        if (!service) {
            return res.status(404).json({ error: { message: 'Service not found' } });
        }

        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Create new service
const createService = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { titulli, pershkrimi, kategoria_id, cmimi, koha_punes } = req.body;

        // Find profile belonging to the authenticated user
        const profile = await Profili.findOne({
            where: { perdoruesi_id: req.user.perdoruesi_id }
        });

        if (!profile) {
            return res.status(404).json({ error: { message: 'Professional profile not found. Please upgrade to professional account first.' } });
        }

        const service = await Sherbimi.create({
            titulli,
            pershkrimi,
            kategoria_id,
            cmimi,
            koha_punes,
            profili_id: profile.profili_id
        });

        // Invalidate services cache when a new service is created
        await RedisCache.del('marketplace:services:all');

        // Fetch the created service with associations
        const createdService = await Sherbimi.findOne({
            where: { sherbimi_id: service.sherbimi_id },
            include: [
                {
                    model: Kategoria,
                    as: 'kategoria',
                    attributes: ['kategoria_id', 'lloji_kategorise']
                }
            ]
        });

        res.status(201).json(createdService);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
        }

        const { serviceId } = req.params;
        const { titulli, pershkrimi, kategoria_id, cmimi, koha_punes } = req.body;

        const service = await Sherbimi.findOne({
            where: { sherbimi_id: serviceId },
            include: [
                {
                    model: Profili,
                    as: 'profili',
                    attributes: ['profili_id', 'profesionisti_id']
                }
            ]
        });

        if (!service) {
            return res.status(404).json({ error: { message: 'Service not found' } });
        }

        // Check if the service belongs to the authenticated user
        if (service.profili.profesionisti_id !== req.user.userId) {
            return res.status(403).json({ error: { message: 'Access denied: You can only update your own services' } });
        }

        // Update service fields
        const updateData = {};
        if (titulli !== undefined) updateData.titulli = titulli;
        if (pershkrimi !== undefined) updateData.pershkrimi = pershkrimi;
        if (kategoria_id !== undefined) updateData.kategoria_id = kategoria_id;
        if (cmimi !== undefined) updateData.cmimi = cmimi;
        if (koha_punes !== undefined) updateData.koha_punes = koha_punes;

        await service.update(updateData);

        // Invalidate services cache when a service is updated
        await RedisCache.del('marketplace:services:all');

        // Fetch updated service with associations
        const updatedService = await Sherbimi.findOne({
            where: { sherbimi_id: serviceId },
            include: [
                {
                    model: Kategoria,
                    as: 'kategoria',
                    attributes: ['kategoria_id', 'lloji_kategorise']
                }
            ]
        });

        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const service = await Sherbimi.findOne({
            where: { sherbimi_id: serviceId },
            include: [
                {
                    model: Profili,
                    as: 'profili',
                    attributes: ['profili_id', 'profesionisti_id']
                }
            ]
        });

        if (!service) {
            return res.status(404).json({ error: { message: 'Service not found' } });
        }

        // Check if the service belongs to the authenticated user
        if (service.profili.profesionisti_id !== req.user.userId) {
            return res.status(403).json({ error: { message: 'Access denied: You can only delete your own services' } });
        }

        await service.destroy();

        // Invalidate services cache when a service is deleted
        await RedisCache.del('marketplace:services:all');

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Get all categories (with caching)
const getCategories = async (req, res) => {
    try {
        // Try to get from cache first
        const cacheKey = 'catalog:categories:all';
        const cached = await RedisCache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const categories = await Kategoria.findAll({
            include: [
                {
                    model: Kategoria,
                    as: 'nenKategorite',
                    attributes: ['kategoria_id', 'lloji_kategorise']
                }
            ],
            where: {
                kategoria_parent_id: null
            }
        });

        // Cache for 10 minutes (categories don't change often)
        await RedisCache.set(cacheKey, categories, 600);

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

// Get all services with profiles (for marketplace) - with caching
const getAllServices = async (req, res) => {
    try {
        // Try to get from cache first
        const cacheKey = 'marketplace:services:all';
        const cached = await RedisCache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const services = await Sherbimi.findAll({
            include: [
                {
                    model: Profili,
                    as: 'profili',
                    attributes: ['profili_id', 'emri', 'email', 'nr_telefonit', 'imazh', 'rating', 'profesionisti_id'],
                    required: true // Only return services that have profiles (professionals)
                },
                {
                    model: Kategoria,
                    as: 'kategoria',
                    attributes: ['kategoria_id', 'lloji_kategorise'],
                    required: false // Category is optional
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Filter out services without valid professional IDs
        const validServices = services.filter(service =>
            service.profili &&
            service.profili.profesionisti_id &&
            service.profili.profesionisti_id !== null
        );

        console.log(`Found ${services.length} total services, ${validServices.length} with valid professionals`);

        // Cache for 2 minutes (marketplace data can change more frequently)
        await RedisCache.set(cacheKey, validServices, 120);

        res.json(validServices);
    } catch (error) {
        console.error('Error fetching all services:', error);
        res.status(500).json({ error: { message: 'Internal server error', details: error.message } });
    }
};

module.exports = {
    getProfessionalServices,
    getService,
    createService,
    updateService,
    deleteService,
    getCategories,
    getAllServices
};

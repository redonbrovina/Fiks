const PerdoruesiService = require('../services/PerdoruesiService');
const AuthService = require('../services/AuthService');
const KafkaProducer = require('../services/KafkaProducer');

class PerdoruesiController {
    /**
     * GET /api/users (Admin only)
     */
    async getAllUsers(req, res, next) {
        try {
            const users = await PerdoruesiService.getAll();
            res.json(users.map(u => u.toJSON()));
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/users/:id (Admin only)
     */
    async deleteUser(req, res, next) {
        try {
            await PerdoruesiService.delete(req.params.id);
            res.json({ message: 'Përdoruesi u fshi me sukses' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/users/:id (Admin only)
     */
    async updateUser(req, res, next) {
        try {
            const { emri, adresa, nr_telefonit, qyteti_id } = req.body;
            const perdoruesi = await PerdoruesiService.update(req.params.id, {
                emri,
                adresa,
                nr_telefonit,
                qyteti_id
            });
            res.json({
                message: 'Përdoruesi u përditësua me sukses',
                perdoruesi: perdoruesi.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/users/me
     */
    async getMe(req, res, next) {
        try {
            const perdoruesi = await PerdoruesiService.getById(req.user.perdoruesi_id);

            if (!perdoruesi) {
                return res.status(404).json({ error: { message: 'Përdoruesi nuk u gjet' } });
            }

            res.json(perdoruesi.toJSON());
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/users/:id
     */
    async getById(req, res, next) {
        try {
            const perdoruesi = await PerdoruesiService.getById(req.params.id);

            if (!perdoruesi) {
                return res.status(404).json({ error: { message: 'Përdoruesi nuk u gjet' } });
            }

            res.json(perdoruesi.toJSON());
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/users/me
     */
    async updateMe(req, res, next) {
        try {
            const { emri, adresa, nr_telefonit, qyteti_id } = req.body;

            const perdoruesi = await PerdoruesiService.update(req.user.perdoruesi_id, {
                emri,
                adresa,
                nr_telefonit,
                qyteti_id
            });

            res.json({
                message: 'Profili u përditësua me sukses',
                perdoruesi: perdoruesi.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/users/me/professional
     */
    async becomeProfessional(req, res, next) {
        try {
            const { bio, service } = req.body;

            // Upgrade user using AuthService (handles roles, tokens, DB)
            const result = await AuthService.upgradeToProfessional(req.user.perdoruesi_id, { bio });

            // Publish event
            await KafkaProducer.publish('professional_created', {
                profesionisti_id: result.profesionisti.profesionisti_id,
                perdoruesi_id: result.perdoruesi.perdoruesi_id,
                emri: result.perdoruesi.emri,
                email: result.perdoruesi.email,
                nr_telefonit: result.perdoruesi.nr_telefonit,
                bio: result.profesionisti.bio,
                // Service data for Catalog to create Sherbimi
                service: service ? {
                    titulli: service.titulli,
                    pershkrimi: service.pershkrimi || '',
                    cmimi: service.cmimi,
                    kategoria_id: service.kategoria_id
                } : null
            });

            res.status(201).json({
                message: 'U bëtë profesionist me sukses',
                profesionisti: result.profesionisti,
                tokens: result.tokens
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/users/me/professional
     */
    async updateProfessional(req, res, next) {
        try {
            const { bio } = req.body;

            const profesionisti = await PerdoruesiService.updateProfesionisti(
                req.user.perdoruesi_id,
                { bio }
            );

            res.json({
                message: 'Profili i profesionistit u përditësua',
                profesionisti
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/users/qytetet
     */
    async getQytetet(req, res, next) {
        try {
            const qytetet = await PerdoruesiService.getAllQytetet();
            res.json(qytetet);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PerdoruesiController();

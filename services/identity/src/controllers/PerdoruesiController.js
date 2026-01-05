const PerdoruesiService = require('../services/PerdoruesiService');
const AuthService = require('../services/AuthService');
const KafkaProducer = require('../services/KafkaProducer');

class PerdoruesiController {
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
            const { bio } = req.body;

            // Check if already a professional
            const existing = await PerdoruesiService.getProfesionisti(req.user.perdoruesi_id);
            if (existing) {
                return res.status(409).json({ error: { message: 'Tashmë jeni profesionist' } });
            }

            // Get user and create professional
            const perdoruesi = await PerdoruesiService.getById(req.user.perdoruesi_id);
            const profesionisti = await AuthService.createProfessional(perdoruesi, bio);

            // Publish event
            await KafkaProducer.publish('professional_created', {
                profesionisti_id: profesionisti.profesionisti_id,
                perdoruesi_id: req.user.perdoruesi_id,
                emri: perdoruesi.emri,
                email: perdoruesi.email,
                bio: profesionisti.bio
            });

            res.status(201).json({
                message: 'U bëtë profesionist me sukses',
                profesionisti
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

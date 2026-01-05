const AuthService = require('../services/AuthService');
const KafkaProducer = require('../services/KafkaProducer');

class AuthController {
    /**
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { emri, email, fjalekalimi, adresa, nr_telefonit, qyteti_id, isProfessional, bio } = req.body;

            const result = await AuthService.register({
                emri,
                email,
                fjalekalimi,
                adresa,
                nr_telefonit,
                qyteti_id,
                isProfessional,
                bio
            });

            // Publish events
            await KafkaProducer.publish('user_registered', {
                perdoruesi_id: result.perdoruesi.perdoruesi_id,
                emri: result.perdoruesi.emri,
                email: result.perdoruesi.email,
                isProfessional: result.isProfessional
            });

            if (result.isProfessional) {
                const profesionisti = await result.perdoruesi.getProfesionisti();
                await KafkaProducer.publish('professional_created', {
                    profesionisti_id: profesionisti.profesionisti_id,
                    perdoruesi_id: result.perdoruesi.perdoruesi_id,
                    emri: result.perdoruesi.emri,
                    email: result.perdoruesi.email,
                    bio: profesionisti.bio
                });
            }

            res.status(201).json({
                message: 'Regjistrimi u krye me sukses',
                perdoruesi: result.perdoruesi.toJSON(),
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, fjalekalimi } = req.body;

            const result = await AuthService.login(email, fjalekalimi);

            res.json({
                message: 'Kyçja u krye me sukses',
                perdoruesi: result.perdoruesi.toJSON(),
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            const tokens = await AuthService.refresh(refreshToken);

            res.json({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     */
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;

            await AuthService.logout(refreshToken);

            res.json({ message: 'Dalja u krye me sukses' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();

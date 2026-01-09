const AuthService = require('../services/AuthService');
const KafkaProducer = require('../services/KafkaProducer');

class AuthController {
    /**
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { emri, email, fjalekalimi, adresa, nr_telefonit, qyteti_id, isProfessional, bio, service } = req.body;

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
                    nr_telefonit: result.perdoruesi.nr_telefonit,
                    bio: profesionisti.bio,
                    // Service data for Catalog to create Sherbimi
                    service: service ? {
                        titulli: service.titulli,
                        pershkrimi: service.pershkrimi || '',
                        cmimi: service.cmimi,
                        kategoria_id: service.kategoria_id
                    } : null
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

    /**
     * POST /api/auth/forgot-password
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await AuthService.forgotPassword(email);
            res.json({ message: 'Nëse ekziston një llogari me këtë email, do të pranoni udhëzimet për rivendosjen e fjalëkalimit.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/reset-password
     */
    async resetPassword(req, res, next) {
        try {
            const { token, fjalekalimi } = req.body;
            await AuthService.resetPassword(token, fjalekalimi);
            res.json({ message: 'Fjalëkalimi u rivendos me sukses. Tani mund të kyçeni.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();

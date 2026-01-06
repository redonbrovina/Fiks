const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Perdoruesi, Profesionisti, Roli, RoliPerdoruesit, RefreshToken } = require('../models');

class AuthService {
    /**
     * Generate access and refresh tokens for a user
     */
    generateTokens(perdoruesi) {
        const accessToken = jwt.sign(
            {
                perdoruesi_id: perdoruesi.perdoruesi_id,
                email: perdoruesi.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        const refreshToken = jwt.sign(
            {
                perdoruesi_id: perdoruesi.perdoruesi_id,
                tokenId: uuidv4()
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        return { accessToken, refreshToken };
    }

    /**
     * Save refresh token to database
     */
    async saveRefreshToken(perdoruesiId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        return RefreshToken.create({
            token,
            perdoruesiId: perdoruesiId,
            expiresAt: expiresAt
        });
    }

    /**
     * Register a new user
     */
    async register(userData) {
        const { emri, email, fjalekalimi, adresa, nr_telefonit, qyteti_id, isProfessional, bio } = userData;

        // Check if user exists
        const existingUser = await Perdoruesi.findOne({ where: { email } });
        if (existingUser) {
            const error = new Error('Email tashmë ekziston');
            error.status = 409;
            throw error;
        }

        // Create user
        const perdoruesi = await Perdoruesi.create({
            emri,
            email,
            fjalekalimi,
            adresa,
            nr_telefonit,
            qyteti_id
        });

        // Assign default role (klient)
        const [clientRole] = await Roli.findOrCreate({
            where: { lloji: 'klient' },
            defaults: { lloji: 'klient' }
        });
        await perdoruesi.addRolet(clientRole);

        // If registering as professional
        if (isProfessional) {
            await this.createProfessional(perdoruesi, bio);
        }

        // Generate tokens
        const tokens = this.generateTokens(perdoruesi);
        await this.saveRefreshToken(perdoruesi.perdoruesi_id, tokens.refreshToken);

        return { perdoruesi, tokens, isProfessional };
    }

    /**
     * Create professional profile for user
     */
    async createProfessional(perdoruesi, bio = '') {
        const profesionisti = await Profesionisti.create({
            perdoruesi_id: perdoruesi.perdoruesi_id,
            bio
        });

        return profesionisti;
    }

    /**
     * Login user with email and password
     */
    async login(email, fjalekalimi) {
        const perdoruesi = await Perdoruesi.findOne({
            where: { email },
            include: [{ model: Roli, as: 'rolet' }]
        });

        if (!perdoruesi) {
            const error = new Error('Kredencialet e pavlefshme');
            error.status = 401;
            throw error;
        }

        const isValid = await perdoruesi.validPassword(fjalekalimi);
        if (!isValid) {
            const error = new Error('Kredencialet e pavlefshme');
            error.status = 401;
            throw error;
        }

        const tokens = this.generateTokens(perdoruesi);
        await this.saveRefreshToken(perdoruesi.perdoruesi_id, tokens.refreshToken);

        return { perdoruesi, tokens };
    }

    /**
     * Refresh access token using refresh token
     */
    async refresh(refreshToken) {
        if (!refreshToken) {
            const error = new Error('Refresh token mungon');
            error.status = 400;
            throw error;
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            const error = new Error('Token i pavlefshëm');
            error.status = 401;
            throw error;
        }

        // Check if token exists and is not revoked
        const storedToken = await RefreshToken.findOne({
            where: { token: refreshToken, is_revoked: false }
        });

        if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
            const error = new Error('Token i skaduar ose i revokuar');
            error.status = 401;
            throw error;
        }

        // Get user
        const perdoruesi = await Perdoruesi.findByPk(decoded.perdoruesi_id);
        if (!perdoruesi) {
            const error = new Error('Përdoruesi nuk u gjet');
            error.status = 401;
            throw error;
        }

        // Revoke old token
        await storedToken.update({ is_revoked: true });

        // Generate new tokens
        const tokens = this.generateTokens(perdoruesi);
        await this.saveRefreshToken(perdoruesi.perdoruesi_id, tokens.refreshToken);

        return tokens;
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken) {
        if (refreshToken) {
            await RefreshToken.update(
                { is_revoked: true },
                { where: { token: refreshToken } }
            );
        }
    }
}

module.exports = new AuthService();

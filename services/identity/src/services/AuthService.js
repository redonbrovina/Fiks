const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Perdoruesi, Profesionisti, Roli, RoliPerdoruesit, RefreshToken } = require('../models');
const redisClient = require('../config/redis');

class AuthService {
    /**
     * Helper: Get cached user
     */
    async getUserFromCache(userId) {
        if (!redisClient.isOpen) return null;
        try {
            const cachedUser = await redisClient.get(`user:${userId}`);
            return cachedUser ? JSON.parse(cachedUser) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    }

    /**
     * Helper: Set user in cache (expires in 1 hour)
     */
    async setUserInCache(userId, data) {
        if (!redisClient.isOpen) return;
        try {
            await redisClient.set(`user:${userId}`, JSON.stringify(data), {
                EX: 3600 // 1 hour
            });
        } catch (error) {
            console.error('Redis Set Error:', error);
        }
    }

    /**
     * Helper: Invalidate user cache
     */
    async invalidateUserCache(userId) {
        if (!redisClient.isOpen) return;
        try {
            await redisClient.del(`user:${userId}`);
        } catch (error) {
            console.error('Redis Del Error:', error);
        }
    }

    /**
     * Generate access and refresh tokens for a user
     * @param {Object} perdoruesi - User object
     * @param {Array} roles - Array of role names (e.g., ['klient', 'admin'])
     */
    generateTokens(perdoruesi, roles = []) {
        const accessToken = jwt.sign(
            {
                perdoruesi_id: perdoruesi.perdoruesi_id,
                email: perdoruesi.email,
                roles: roles
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

            // Assign professional role
            const [profRole] = await Roli.findOrCreate({
                where: { lloji: 'profesionist' },
                defaults: { lloji: 'profesionist' }
            });
            await perdoruesi.addRolet(profRole);
        }

        // Fetch the user with roles to get role names
        const userWithRoles = await Perdoruesi.findByPk(perdoruesi.perdoruesi_id, {
            include: [{ model: Roli, as: 'rolet' }]
        });
        const roleNames = userWithRoles.rolet.map(r => r.lloji);

        // Cache the new user profile
        await this.setUserInCache(perdoruesi.perdoruesi_id, userWithRoles);

        // Generate tokens with roles
        const tokens = this.generateTokens(perdoruesi, roleNames);
        await this.saveRefreshToken(perdoruesi.perdoruesi_id, tokens.refreshToken);

        return { perdoruesi: userWithRoles, tokens, isProfessional };
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

        // Extract role names for JWT
        const roleNames = perdoruesi.rolet.map(r => r.lloji);

        // Update/Set Cache on login
        await this.setUserInCache(perdoruesi.perdoruesi_id, perdoruesi);

        const tokens = this.generateTokens(perdoruesi, roleNames);
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

        // Try getting user from cache first
        let perdoruesi = await this.getUserFromCache(decoded.perdoruesi_id);

        if (!perdoruesi) {
            // DB fallback
            perdoruesi = await Perdoruesi.findByPk(decoded.perdoruesi_id);
            if (!perdoruesi) {
                const error = new Error('Përdoruesi nuk u gjet');
                error.status = 401;
                throw error;
            }
            // Populate cache
            await this.setUserInCache(decoded.perdoruesi_id, perdoruesi);
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
            try {
                const decoded = jwt.decode(refreshToken);
                if (decoded && decoded.perdoruesi_id) {
                    await this.invalidateUserCache(decoded.perdoruesi_id);
                }
            } catch (e) {
                console.error('Error invalidating cache on logout', e);
            }

            await RefreshToken.update(
                { is_revoked: true },
                { where: { token: refreshToken } }
            );
        }
    }

    /**
     * Upgrade existing user to professional
     */
    async upgradeToProfessional(perdoruesiId, professionalData) {
        const { bio } = professionalData;

        const perdoruesi = await Perdoruesi.findByPk(perdoruesiId, {
            include: [{ model: Roli, as: 'rolet' }]
        });

        if (!perdoruesi) {
            const error = new Error('Përdoruesi nuk u gjet');
            error.status = 404;
            throw error;
        }

        // Check if already professional (by role)
        const isProfessional = perdoruesi.rolet.some(r => r.lloji === 'profesionist');
        if (isProfessional) {
            const error = new Error('Përdoruesi është tashmë profesionist');
            error.status = 400;
            throw error;
        }

        // Check if professional record exists (in case of previous partial failure)
        let profesionisti = await Profesionisti.findOne({ where: { perdoruesi_id: perdoruesiId } });

        if (!profesionisti) {
            // Create professional record if it doesn't exist
            profesionisti = await this.createProfessional(perdoruesi, bio);
        } else {
            // Update bio if provided
            if (bio) {
                profesionisti.bio = bio;
                await profesionisti.save();
            }
        }

        // Add professional role
        const [profRole] = await Roli.findOrCreate({
            where: { lloji: 'profesionist' },
            defaults: { lloji: 'profesionist' }
        });
        await perdoruesi.addRolet(profRole);

        // Refresh user with new roles
        const updatedUser = await Perdoruesi.findByPk(perdoruesiId, {
            include: [{ model: Roli, as: 'rolet' }]
        });
        const roleNames = updatedUser.rolet.map(r => r.lloji);

        // Invalidate old cache and set new
        await this.setUserInCache(perdoruesiId, updatedUser);

        // Generate new tokens
        const tokens = this.generateTokens(updatedUser, roleNames);
        await this.saveRefreshToken(updatedUser.perdoruesi_id, tokens.refreshToken);

        return { perdoruesi: updatedUser, profesionisti, tokens };
    }
}

module.exports = new AuthService();

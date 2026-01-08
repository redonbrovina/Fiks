const { Perdoruesi, Profesionisti, Qyteti, Roli } = require('../models');

class PerdoruesiService {
    /**
     * Get all users with related data (for admin)
     */
    async getAll() {
        return Perdoruesi.findAll({
            include: [
                { model: Qyteti, as: 'qyteti' },
                { model: Roli, as: 'rolet' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Delete user by ID (for admin)
     */
    async delete(perdoruesiId) {
        const perdoruesi = await Perdoruesi.findByPk(perdoruesiId);
        if (!perdoruesi) {
            const error = new Error('Përdoruesi nuk u gjet');
            error.status = 404;
            throw error;
        }
        await perdoruesi.destroy();
        return true;
    }

    /**
     * Get user by ID with related data
     */
    async getById(perdoruesiId) {
        return Perdoruesi.findByPk(perdoruesiId, {
            include: [
                { model: Qyteti, as: 'qyteti' },
                { model: Profesionisti, as: 'profesionisti' },
                { model: Roli, as: 'rolet' }
            ]
        });
    }

    /**
     * Update user profile
     */
    async update(perdoruesiId, updates) {
        const perdoruesi = await Perdoruesi.findByPk(perdoruesiId);

        if (!perdoruesi) {
            const error = new Error('Përdoruesi nuk u gjet');
            error.status = 404;
            throw error;
        }

        const { emri, adresa, nr_telefonit, qyteti_id } = updates;

        await perdoruesi.update({
            emri: emri || perdoruesi.emri,
            adresa: adresa !== undefined ? adresa : perdoruesi.adresa,
            nr_telefonit: nr_telefonit !== undefined ? nr_telefonit : perdoruesi.nr_telefonit,
            qyteti_id: qyteti_id !== undefined ? qyteti_id : perdoruesi.qyteti_id
        });

        return perdoruesi;
    }

    /**
     * Get user's professional profile
     */
    async getProfesionisti(perdoruesiId) {
        return Profesionisti.findOne({
            where: { perdoruesi_id: perdoruesiId }
        });
    }

    /**
     * Update professional profile
     */
    async updateProfesionisti(perdoruesiId, updates) {
        const profesionisti = await this.getProfesionisti(perdoruesiId);

        if (!profesionisti) {
            const error = new Error('Nuk jeni profesionist');
            error.status = 404;
            throw error;
        }

        const { bio } = updates;
        await profesionisti.update({ bio });

        return profesionisti;
    }

    /**
     * Get all cities
     */
    async getAllQytetet() {
        return Qyteti.findAll({
            order: [['emri', 'ASC']]
        });
    }
}

module.exports = new PerdoruesiService();

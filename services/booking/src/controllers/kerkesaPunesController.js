const { KerkesaPunes, KerkesaPunesStatus, Termini, sequelize } = require('../models');

exports.createKerkesaPunes = async (req, res) => {
    try {
        console.log('📝 Incoming Work Request Body:', req.body);
        const { pershkrimi, mesazhi, kategoria_id, profesionisti_id, perdoruesi_id } = req.body;

        if (!perdoruesi_id) {
            console.error('❌ Missing User ID in request body');
            return res.status(400).json({ error: { message: 'User ID is required' } });
        }

        // Ensure "Pending" status exists
        const [pendingStatus] = await KerkesaPunesStatus.findOrCreate({
            where: { status: 'Pending' },
            defaults: { status: 'Pending' }
        });

        const kerkesa = await KerkesaPunes.create({
            pershkrimi: pershkrimi || 'No description',
            mesazhi,
            kategoria_id: kategoria_id || null,
            profesionisti_id: profesionisti_id || null,
            perdoruesi_id,
            kerkesa_punes_status_id: pendingStatus.kerkesa_punes_status_id
        });

        console.log('✅ Work Request Created:', kerkesa.toJSON());
        res.status(201).json(kerkesa);
    } catch (error) {
        console.error('❌ Error creating KerkesaPunes:', error);
        res.status(500).json({
            error: {
                message: 'Failed to create work request',
                details: error.message
            }
        });
    }
};

exports.getAllKerkesaPunes = async (req, res) => {
    try {
        const { profesionisti_id, perdoruesi_id } = req.query;
        const whereClause = {};

        // Filter by professional if provided
        if (profesionisti_id) {
            whereClause.profesionisti_id = parseInt(profesionisti_id);
        }

        // Filter by user if provided
        if (perdoruesi_id) {
            whereClause.perdoruesi_id = parseInt(perdoruesi_id);
        }

        const kerkesat = await KerkesaPunes.findAll({
            where: whereClause,
            include: [
                { model: KerkesaPunesStatus, as: 'statusi' },
                { model: Termini, as: 'terminet' }
            ],
            order: [['koha_krijimit', 'DESC']]
        });
        res.json(kerkesat);
    } catch (error) {
        console.error('Error fetching KerkesaPunes:', error);
        res.status(500).json({ error: { message: 'Failed to retrieve work requests' } });
    }
};

exports.getKerkesaPunesById = async (req, res) => {
    try {
        const { id } = req.params;
        const kerkesa = await KerkesaPunes.findByPk(id, {
            include: [
                { model: KerkesaPunesStatus, as: 'statusi' },
                { model: Termini, as: 'terminet' }
            ]
        });

        if (!kerkesa) {
            return res.status(404).json({ error: { message: 'Work request not found' } });
        }

        res.json(kerkesa);
    } catch (error) {
        console.error('Error fetching KerkesaPunes by ID:', error);
        res.status(500).json({ error: { message: 'Failed to retrieve work request' } });
    }
};

exports.updateKerkesaPunes = async (req, res) => {
    try {
        const { id } = req.params;
        const { pershkrimi, mesazhi, kerkesa_punes_status_id } = req.body;

        const kerkesa = await KerkesaPunes.findByPk(id);
        if (!kerkesa) {
            return res.status(404).json({ error: { message: 'Work request not found' } });
        }

        await kerkesa.update({
            pershkrimi,
            mesazhi,
            kerkesa_punes_status_id
        });

        res.json(kerkesa);
    } catch (error) {
        console.error('Error updating KerkesaPunes:', error);
        res.status(500).json({ error: { message: 'Failed to update work request' } });
    }
};

exports.deleteKerkesaPunes = async (req, res) => {
    try {
        const { id } = req.params;
        const kerkesa = await KerkesaPunes.findByPk(id);

        if (!kerkesa) {
            return res.status(404).json({ error: { message: 'Work request not found' } });
        }

        await kerkesa.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting KerkesaPunes:', error);
        res.status(500).json({ error: { message: 'Failed to delete work request' } });
    }
};

// Deny/Reject a work request (and cancel associated appointment if exists)
exports.denyKerkesaPunes = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const workRequestId = parseInt(id, 10);
        
        console.log('🔴 Denying work request with ID:', id, 'parsed as:', workRequestId);
        
        if (isNaN(workRequestId)) {
            await transaction.rollback();
            return res.status(400).json({ error: { message: 'Invalid work request ID' } });
        }
        
        const kerkesa = await KerkesaPunes.findByPk(workRequestId, {
            include: [{ model: Termini, as: 'terminet' }],
            transaction
        });

        console.log('🔴 Found work request:', kerkesa ? `ID: ${kerkesa.kerkesa_punes_id}` : 'NOT FOUND');

        if (!kerkesa) {
            await transaction.rollback();
            console.log('❌ Work request not found with ID:', workRequestId);
            return res.status(404).json({ error: { message: 'Work request not found' } });
        }

        // Get or create 'Rejected' status
        const [rejectedStatus] = await KerkesaPunesStatus.findOrCreate({
            where: { status: 'Rejected' },
            defaults: { status: 'Rejected' },
            transaction
        });

        // Update work request status to Rejected
        await kerkesa.update({
            kerkesa_punes_status_id: rejectedStatus.kerkesa_punes_status_id
        }, { transaction });

        // Delete associated appointments if they exist
        if (kerkesa.terminet && kerkesa.terminet.length > 0) {
            for (const termin of kerkesa.terminet) {
                await termin.destroy({ transaction });
            }
        }

        await transaction.commit();

        // Fetch updated work request with associations
        const updatedKerkesa = await KerkesaPunes.findByPk(id, {
            include: [
                { model: KerkesaPunesStatus, as: 'statusi' },
                { model: Termini, as: 'terminet' }
            ]
        });

        res.json(updatedKerkesa);
    } catch (error) {
        await transaction.rollback();
        console.error('Error denying KerkesaPunes:', error);
        res.status(500).json({ error: { message: 'Failed to deny work request' } });
    }
};

const { LiriaOres } = require('../models');

exports.createLiriaOres = async (req, res) => {
    try {
        const { profesionisti_id, dita_javes, koha_fillimit, koha_mbarimit } = req.body;

        const liria = await LiriaOres.create({
            profesionisti_id,
            dita_javes,
            koha_fillimit,
            koha_mbarimit
        });

        res.status(201).json(liria);
    } catch (error) {
        console.error('Error creating LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to create availability slot' } });
    }
};

exports.getLiriaOresByProfesionistiId = async (req, res) => {
    try {
        const { profesionisti_id } = req.params;
        const lirite = await LiriaOres.findAll({
            where: { profesionisti_id }
        });

        res.json(lirite);
    } catch (error) {
        console.error('Error fetching LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to retrieve availability slots' } });
    }
};

exports.deleteLiriaOres = async (req, res) => {
    try {
        const { id } = req.params;
        const liria = await LiriaOres.findByPk(id);

        if (!liria) {
            return res.status(404).json({ error: { message: 'Availability slot not found' } });
        }

        await liria.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting LiriaOres:', error);
        res.status(500).json({ error: { message: 'Failed to delete availability slot' } });
    }
};

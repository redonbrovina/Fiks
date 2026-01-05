const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Import models with Albanian names matching database schema
const KerkesaPunes = require('./KerkesaPunes')(sequelize);
const Termini = require('./Termini')(sequelize);
const HistoriaTermineve = require('./HistoriaTermineve')(sequelize);
const KerkesaPunesStatus = require('./KerkesaPunesStatus')(sequelize);
const LiriaOres = require('./LiriaOres')(sequelize);

// =====================
// ASSOCIATIONS
// =====================

// KerkesaPunes belongs to KerkesaPunesStatus
KerkesaPunes.belongsTo(KerkesaPunesStatus, {
    foreignKey: 'kerkesa_punes_status_id',
    as: 'statusi'
});
KerkesaPunesStatus.hasMany(KerkesaPunes, {
    foreignKey: 'kerkesa_punes_status_id',
    as: 'kerkesat'
});

// KerkesaPunes has many Terminet
KerkesaPunes.hasMany(Termini, {
    foreignKey: 'kerkesa_punes_id',
    as: 'terminet'
});
Termini.belongsTo(KerkesaPunes, {
    foreignKey: 'kerkesa_punes_id',
    as: 'kerkesaPunes'
});

// Termini has HistoriaTermineve
Termini.hasMany(HistoriaTermineve, {
    foreignKey: 'termini_id',
    as: 'historia'
});
HistoriaTermineve.belongsTo(Termini, {
    foreignKey: 'termini_id',
    as: 'termini'
});

module.exports = {
    sequelize,
    KerkesaPunes,
    Termini,
    HistoriaTermineve,
    KerkesaPunesStatus,
    LiriaOres
};

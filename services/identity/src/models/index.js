const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Import models with Albanian names matching database schema
const Perdoruesi = require('./Perdoruesi')(sequelize);
const Profesionisti = require('./Profesionisti')(sequelize);
const Qyteti = require('./Qyteti')(sequelize);
const Roli = require('./Roli')(sequelize);
const RoliPerdoruesit = require('./RoliPerdoruesit')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);

// =====================
// ASSOCIATIONS
// =====================

// Perdoruesi belongs to Qyteti
Perdoruesi.belongsTo(Qyteti, { foreignKey: 'qyteti_id', as: 'qyteti' });
Qyteti.hasMany(Perdoruesi, { foreignKey: 'qyteti_id', as: 'perdoruesit' });

// Perdoruesi can be a Profesionisti (1:1)
Perdoruesi.hasOne(Profesionisti, { foreignKey: 'perdoruesi_id', as: 'profesionisti' });
Profesionisti.belongsTo(Perdoruesi, { foreignKey: 'perdoruesi_id', as: 'perdoruesi' });

// Perdoruesi has many Rolet through RoliPerdoruesit
Perdoruesi.belongsToMany(Roli, {
    through: RoliPerdoruesit,
    foreignKey: 'perdoruesi_id',
    otherKey: 'roli_id',
    as: 'rolet'
});
Roli.belongsToMany(Perdoruesi, {
    through: RoliPerdoruesit,
    foreignKey: 'roli_id',
    otherKey: 'perdoruesi_id',
    as: 'perdoruesit'
});

// Perdoruesi has RefreshTokens
Perdoruesi.hasMany(RefreshToken, { foreignKey: 'perdoruesi_id', as: 'refreshTokens' });
RefreshToken.belongsTo(Perdoruesi, { foreignKey: 'perdoruesi_id', as: 'perdoruesi' });

module.exports = {
    sequelize,
    Perdoruesi,
    Profesionisti,
    Qyteti,
    Roli,
    RoliPerdoruesit,
    RefreshToken
};

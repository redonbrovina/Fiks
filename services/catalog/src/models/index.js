const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Import models with Albanian names matching database schema
const Profili = require('./Profili')(sequelize);
const Sherbimi = require('./Sherbimi')(sequelize);
const Kategoria = require('./Kategoria')(sequelize);
const SherbimiKategoria = require('./SherbimiKategoria')(sequelize);
const Pervoja = require('./Pervoja')(sequelize);

// =====================
// ASSOCIATIONS
// =====================

// Profili has many Sherbimet
Profili.hasMany(Sherbimi, { foreignKey: 'profili_id', as: 'sherbimet' });
Sherbimi.belongsTo(Profili, { foreignKey: 'profili_id', as: 'profili' });

// Profili has many Pervoja (experiences)
Profili.hasMany(Pervoja, { foreignKey: 'profesionisti_id', sourceKey: 'profesionisti_id', as: 'pervojat' });
Pervoja.belongsTo(Profili, { foreignKey: 'profesionisti_id', targetKey: 'profesionisti_id', as: 'profili' });

// Sherbimi belongs to Kategoria
Sherbimi.belongsTo(Kategoria, { foreignKey: 'kategoria_id', as: 'kategoria' });
Kategoria.hasMany(Sherbimi, { foreignKey: 'kategoria_id', as: 'sherbimet' });

// Kategoria self-reference (parent/subcategories)
Kategoria.belongsTo(Kategoria, { foreignKey: 'kategoria_parent_id', as: 'kategoriaParent' });
Kategoria.hasMany(Kategoria, { foreignKey: 'kategoria_parent_id', as: 'nenKategorite' });

// Sherbimi-Kategoria many-to-many through SherbimiKategoria
Sherbimi.belongsToMany(Kategoria, {
    through: SherbimiKategoria,
    foreignKey: 'sherbimi_id',
    otherKey: 'kategoria_id',
    as: 'kategoriteExtra'
});
Kategoria.belongsToMany(Sherbimi, {
    through: SherbimiKategoria,
    foreignKey: 'kategoria_id',
    otherKey: 'sherbimi_id',
    as: 'sherbimetExtra'
});

module.exports = {
    sequelize,
    Profili,
    Sherbimi,
    Kategoria,
    SherbimiKategoria,
    Pervoja
};


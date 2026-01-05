const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Kategoria = sequelize.define('Kategoria', {
        kategoria_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lloji_kategorise: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        kategoria_parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'kategoria',
        timestamps: false,
        underscored: true
    });

    return Kategoria;
};

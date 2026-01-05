const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SherbimiKategoria = sequelize.define('SherbimiKategoria', {
        sherbimi_kategoria_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sherbimi_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kategoria_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'sherbimi_kategoria',
        timestamps: false,
        underscored: true
    });

    return SherbimiKategoria;
};

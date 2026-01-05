const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Roli = sequelize.define('Roli', {
        roli_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lloji: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'roli',
        timestamps: false,
        underscored: true
    });

    return Roli;
};

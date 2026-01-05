const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RoliPerdoruesit = sequelize.define('RoliPerdoruesit', {
        roli_perdoruesit_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roli_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        perdoruesi_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'roli_perdoruesit',
        timestamps: false,
        underscored: true
    });

    return RoliPerdoruesit;
};

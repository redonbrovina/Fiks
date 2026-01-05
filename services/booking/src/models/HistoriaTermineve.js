const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const HistoriaTermineve = sequelize.define('HistoriaTermineve', {
        historia_termineve_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        termini_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'historia_termineve',
        timestamps: true,
        underscored: true
    });

    return HistoriaTermineve;
};

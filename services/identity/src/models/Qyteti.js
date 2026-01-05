const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Qyteti = sequelize.define('Qyteti', {
        qyteti_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emri: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'qyteti',
        timestamps: false,
        underscored: true
    });

    return Qyteti;
};

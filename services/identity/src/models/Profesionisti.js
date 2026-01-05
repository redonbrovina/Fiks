const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Profesionisti = sequelize.define('Profesionisti', {
        profesionisti_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        perdoruesi_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'profesionisti',
        timestamps: true,
        underscored: true
    });

    return Profesionisti;
};

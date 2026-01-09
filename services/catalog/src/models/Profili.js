const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Profili = sequelize.define('Profili', {
        profili_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emri: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        perdoruesi_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        nr_telefonit: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        imazh: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        profesionisti_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            defaultValue: 0
        },
        pershkrimi: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'profili',
        timestamps: true,
        underscored: true
    });

    return Profili;
};

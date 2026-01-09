const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const KerkesaPunes = sequelize.define('KerkesaPunes', {
        kerkesa_punes_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        pershkrimi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        mesazhi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        kerkesa_punes_status_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        koha_krijimit: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        perdoruesi_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        kategoria_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        profesionisti_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'kerkesa_punes',
        timestamps: true,
        underscored: true
    });

    return KerkesaPunes;
};

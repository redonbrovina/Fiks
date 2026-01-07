const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Sherbimi = sequelize.define('Sherbimi', {
        sherbimi_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        titulli: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        pershkrimi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        kategoria_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        cmimi: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        profili_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'sherbimi',
        timestamps: true,
        underscored: true
    });

    return Sherbimi;
};

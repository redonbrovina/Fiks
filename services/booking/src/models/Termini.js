const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Termini = sequelize.define('Termini', {
        termini_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        koha: {
            type: DataTypes.DATE,
            allowNull: true
        },
        kerkesa_punes_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cmimi: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        koha_fillimit: {
            type: DataTypes.DATE,
            allowNull: true
        },
        koha_mbarimit: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'termini',
        timestamps: true,
        underscored: true
    });

    return Termini;
};

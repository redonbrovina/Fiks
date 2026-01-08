const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LiriaOres = sequelize.define('LiriaOres', {
        liria_ores_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profesionisti_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dita_javes: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        koha_fillimit: {
            type: DataTypes.TIME,
            allowNull: false
        },
        koha_mbarimit: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {
        tableName: 'liria_ores',
        timestamps: false,
        underscored: true
    });

    return LiriaOres;
};

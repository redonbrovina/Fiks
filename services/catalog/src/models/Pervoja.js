const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pervoja = sequelize.define('Pervoja', {
        pervoja_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profesionisti_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'profili',
                key: 'profesionisti_id'
            }
        },
        pozicioni: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        data_fillimit: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        data_mbarimit: {
            type: DataTypes.DATEONLY,
            allowNull: true // null means current/ongoing position
        },
        roli: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        pershkrimi: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'pervoja',
        timestamps: true,
        underscored: true
    });

    return Pervoja;
};

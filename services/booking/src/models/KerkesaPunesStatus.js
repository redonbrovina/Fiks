const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const KerkesaPunesStatus = sequelize.define('KerkesaPunesStatus', {
        kerkesa_punes_status_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'kerkesa_punes_status',
        timestamps: false,
        underscored: true
    });

    return KerkesaPunesStatus;
};

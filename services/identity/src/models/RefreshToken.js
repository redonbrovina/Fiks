const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define('RefreshToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        perdoruesiId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'perdoruesi_id'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at'
        },
        isRevoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_revoked'
        }
    }, {
        tableName: 'refresh_token',
        timestamps: true,
        underscored: true
    });

    return RefreshToken;
};

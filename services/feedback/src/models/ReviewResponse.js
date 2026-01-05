const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReviewResponse = sequelize.define('ReviewResponse', {
        review_response_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mesazhi: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'review_response',
        timestamps: true,
        underscored: true
    });

    return ReviewResponse;
};

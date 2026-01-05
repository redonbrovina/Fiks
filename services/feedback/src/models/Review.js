const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Review = sequelize.define('Review', {
        review_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        mesazhi: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        review_response_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        termini_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        profesionisti_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        perdoruesi_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        koha_krijimit: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'review',
        timestamps: true,
        underscored: true
    });

    return Review;
};

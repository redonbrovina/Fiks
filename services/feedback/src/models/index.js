const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Import models with Albanian names matching database schema
const Review = require('./Review')(sequelize);
const ReviewResponse = require('./ReviewResponse')(sequelize);

// =====================
// ASSOCIATIONS
// =====================

// Review belongs to ReviewResponse (optional response from professional)
Review.belongsTo(ReviewResponse, { foreignKey: 'review_response_id', as: 'pergjigje' });
ReviewResponse.hasOne(Review, { foreignKey: 'review_response_id', as: 'review' });

module.exports = {
    sequelize,
    Review,
    ReviewResponse
};

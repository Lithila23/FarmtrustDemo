const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import model functions
const UserModel = require('./User');
const CropModel = require('./Crop');

// Initialize models
const User = UserModel(sequelize);
const Crop = CropModel(sequelize);

// Define associations
User.hasMany(Crop, {
  foreignKey: 'farmerId',
  as: 'crops'
});

Crop.belongsTo(User, {
  foreignKey: 'farmerId',
  as: 'farmer'
});

// Test connection and sync
sequelize.authenticate()
  .then(() => console.log('MySQL connected'))
  .catch(err => console.log('MySQL connection error:', err));

// Sync database (create tables)
sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized'))
  .catch(err => console.log('Database sync error:', err));

module.exports = { sequelize, User, Crop };
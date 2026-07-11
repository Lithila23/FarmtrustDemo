const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const useMySql = String(process.env.DB_DIALECT || '').toLowerCase() === 'mysql';

function createSequelize() {
  if (useMySql) {
    return new Sequelize(
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
  }

  const storageDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: path.join(storageDir, 'farmtrust.sqlite'),
    logging: false
  });
}

const sequelize = createSequelize();

// Import model functions
const UserModel = require('./User');
const CropModel = require('./Crop');
const OrderModel = require('./Order');

// Initialize models
const User = UserModel(sequelize);
const Crop = CropModel(sequelize);
const Order = OrderModel(sequelize);

// Define associations
User.hasMany(Crop, {
  foreignKey: 'farmerId',
  as: 'crops'
});

Crop.belongsTo(User, {
  foreignKey: 'farmerId',
  as: 'farmer'
});

User.hasMany(Order, {
  foreignKey: 'buyerId',
  as: 'orders'
});

Order.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'buyer'
});

Crop.hasMany(Order, {
  foreignKey: 'cropId',
  as: 'orders'
});

Order.belongsTo(Crop, {
  foreignKey: 'cropId',
  as: 'crop'
});

// Test connection and sync
sequelize.authenticate()
  .then(() => console.log(`${sequelize.getDialect().toUpperCase()} connected`))
  .catch(err => console.log('Database connection error:', err));

// Sync database (create tables if they don't exist; use migration scripts for schema changes)
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synchronized');

    const defaultUsers = [
      {
        name: 'FarmTrust Admin',
        email: 'admin@farmtrust.com',
        password: 'admin123',
        role: 'admin',
        district: 'Colombo'
      },
      {
        name: 'John Farmer',
        email: 'farmer@farmtrust.com',
        password: 'farmer123',
        role: 'farmer',
        district: 'Kandy'
      },
      {
        name: 'Sarah Buyer',
        email: 'buyer@farmtrust.com',
        password: 'buyer123',
        role: 'buyer',
        district: 'Galle'
      }
    ];

    for (const userData of defaultUsers) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });

      await user.update({
        name: userData.name,
        password: userData.password,
        role: userData.role,
        district: userData.district
      });
    }

    console.log('Default local accounts are ready');
  })
  .catch(err => console.log('Database sync error:', err));

module.exports = { sequelize, User, Crop, Order };
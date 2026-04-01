const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');
require('dotenv').config();

async function seedUsers() {
  try {
    console.log('Seeding users...');

    // Ensure database is synced
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    const users = [
      {
        name: 'FarmTrust Admin',
        email: 'admin@farmtrust.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'John Farmer',
        email: 'farmer@farmtrust.com',
        password: 'farmer123',
        role: 'farmer'
      },
      {
        name: 'Sarah Buyer',
        email: 'buyer@farmtrust.com',
        password: 'buyer123',
        role: 'buyer'
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        // Update password for existing user
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`✅ ${userData.role} user updated: ${userData.email}`);
        continue;
      }

      // Create user (password will be hashed by model hook)
      await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      });

      console.log(`✅ ${userData.role} user created: ${userData.email}`);
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();
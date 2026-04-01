const { User, Crop, sequelize } = require('./models');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');

    // Get all users
    const users = await User.findAll();
    console.log('Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n');

    // Get all crops
    const crops = await Crop.findAll({
      include: [{
        model: User,
        as: 'farmer',
        attributes: ['name', 'email']
      }]
    });
    console.log('Crops:');
    if (crops.length === 0) {
      console.log('No crops found yet.');
    } else {
      crops.forEach(crop => {
        console.log(`- ${crop.name}: ${crop.description} - Price: $${crop.price} - Farmer: ${crop.farmer ? crop.farmer.name : 'Unknown'}`);
      });
    }

    console.log('\nDatabase check completed.');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
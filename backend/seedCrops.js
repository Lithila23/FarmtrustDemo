const { User, Crop, sequelize } = require('./models');
require('dotenv').config();

const sampleCrops = [
  { name: 'Tomato', quantity: 500, price: 120, description: 'Fresh red tomatoes from Kandy hills. Rich in vitamins and perfect for curries.', district: 'Kandy', discount: 10 },
  { name: 'Carrot', quantity: 300, price: 95, description: 'Crunchy orange carrots grown organically. Great for salads and cooking.', district: 'Kandy', discount: 0 },
  { name: 'Potato', quantity: 800, price: 85, description: 'Fresh potatoes harvested this season. Ideal for frying, boiling or curries.', district: 'Nuwara Eliya', discount: 5 },
  { name: 'Broccoli', quantity: 150, price: 200, description: 'Green fresh broccoli florets. High in fiber and perfect for stir-fries.', district: 'Nuwara Eliya', discount: 0 },
  { name: 'Spinach', quantity: 200, price: 60, description: 'Tender green spinach leaves. Freshly picked and packed with iron.', district: 'Kandy', discount: 0 },
  { name: 'Cabbage', quantity: 400, price: 75, description: 'Large fresh cabbages from Badulla. Perfect for salads and stir-fries.', district: 'Badulla', discount: 0 },
  { name: 'Onion', quantity: 600, price: 110, description: 'Red onions from the dry zone. Essential spice for all Sri Lankan curries.', district: 'Anuradhapura', discount: 0 },
  { name: 'Pumpkin', quantity: 250, price: 55, description: 'Sweet golden pumpkins. Great for soups, curries and desserts.', district: 'Kurunegala', discount: 15 },
  { name: 'Eggplant', quantity: 180, price: 90, description: 'Fresh purple eggplants (brinjal). Perfect for wambatu moju and curries.', district: 'Gampaha', discount: 0 },
  { name: 'Bitter Gourd', quantity: 120, price: 130, description: 'Fresh karela / bitter gourd. Excellent for diabetic-friendly cooking.', district: 'Colombo', discount: 0 },
  { name: 'Banana', quantity: 1000, price: 40, description: 'Sweet Ambul bananas from Kegalle. Ripe and ready to eat.', district: 'Kegalle', discount: 0 },
  { name: 'Mango', quantity: 300, price: 180, description: 'Sweet Karthakolomban mangoes. Juicy and perfect for eating fresh.', district: 'Jaffna', discount: 20 },
  { name: 'Coconut', quantity: 500, price: 90, description: 'Fresh mature coconuts. Essential for Sri Lankan cooking and sambol.', district: 'Gampaha', discount: 0 },
  { name: 'Pineapple', quantity: 200, price: 150, description: 'Sweet golden pineapples from Galle. Perfect for juices and desserts.', district: 'Galle', discount: 10 },
  { name: 'Watermelon', quantity: 100, price: 200, description: 'Large juicy watermelons. Perfect for hot summer days.', district: 'Hambantota', discount: 0 },
  { name: 'Leek', quantity: 180, price: 140, description: 'Fresh green leeks from the hill country. Great for soups and stir-fries.', district: 'Nuwara Eliya', discount: 0 },
  { name: 'Radish', quantity: 220, price: 70, description: 'White crispy radish. Used in salads and pickles.', district: 'Badulla', discount: 0 },
  { name: 'Green Bean', quantity: 160, price: 110, description: 'Tender green beans freshly harvested. Great for stir-fries and curries.', district: 'Kandy', discount: 5 },
  { name: 'Capsicum', quantity: 140, price: 160, description: 'Colorful bell peppers. Adds flavor and color to any dish.', district: 'Colombo', discount: 0 },
  { name: 'Cucumber', quantity: 350, price: 65, description: 'Fresh green cucumbers. Perfect for salads and cooling snacks.', district: 'Gampaha', discount: 0 },
];

async function seedCrops() {
  try {
    console.log('🌱 Seeding crop data...');

    // Find the default farmer account
    const farmer = await User.findOne({ where: { email: 'farmer@farmtrust.com' } });
    if (!farmer) {
      console.error('❌ Farmer account not found. Run `node seed.js` first.');
      process.exit(1);
    }

    console.log(`✅ Found farmer: ${farmer.name} (id: ${farmer.id})`);

    let created = 0;
    let skipped = 0;

    for (const cropData of sampleCrops) {
      const [crop, wasCreated] = await Crop.findOrCreate({
        where: { name: cropData.name, farmerId: farmer.id },
        defaults: {
          ...cropData,
          farmerId: farmer.id,
          status: 'approved',  // Auto-approve so buyers can see them
        }
      });

      if (wasCreated) {
        console.log(`  ✅ Created: ${cropData.name}`);
        created++;
      } else {
        // Update existing to ensure approved status and correct data
        await crop.update({ ...cropData, status: 'approved' });
        console.log(`  🔄 Updated: ${cropData.name}`);
        skipped++;
      }
    }

    console.log(`\n✅ Done! ${created} crops created, ${skipped} crops updated.`);
    console.log('🛒 All crops are set to "approved" — buyers can see them immediately.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedCrops();

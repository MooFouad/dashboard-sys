const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Models
const Vehicle = require('../models/Vehicle');
const HomeRent = require('../models/HomeRent');
const Electricity = require('../models/Electricity');
const SocialInsurance = require('../models/SocialInsurance');
const GOSI = require('../models/GOSI');
const Absher = require('../models/Absher');
const Insurance = require('../models/Insurance');
const MVPI = require('../models/MVPI');
const User = require('../models/User');
const PushSubscription = require('../models/PushSubscription');

/**
 * Reset Demo Data Script
 *
 * This script resets the database to its initial seed state.
 * Useful for:
 * - Resetting the demo after users have made changes
 * - Cleaning up test data
 * - Preparing for a fresh demo
 *
 * Usage:
 *   node scripts/resetDemoData.js
 *   npm run reset:demo
 */

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4
  });
  console.log('✅ Connected to MongoDB');
}

async function clearAllCollections() {
  console.log('\n🧹 Clearing all collections...');

  const collections = [
    { name: 'Vehicles', model: Vehicle },
    { name: 'Home Rents', model: HomeRent },
    { name: 'Electricity', model: Electricity },
    { name: 'Social Insurance', model: SocialInsurance },
    { name: 'GOSI', model: GOSI },
    { name: 'Absher', model: Absher },
    { name: 'Insurance', model: Insurance },
    { name: 'MVPI', model: MVPI },
    { name: 'Users', model: User },
    { name: 'Push Subscriptions', model: PushSubscription }
  ];

  for (const collection of collections) {
    const count = await collection.model.countDocuments();
    if (count > 0) {
      await collection.model.deleteMany({});
      console.log(`   ✅ Cleared ${collection.name}: ${count} records deleted`);
    } else {
      console.log(`   ⚪ ${collection.name}: already empty`);
    }
  }

  console.log('✅ All collections cleared\n');
}

async function reseedData() {
  console.log('🌱 Re-seeding demo data...\n');

  // Run the seed script
  const { execSync } = require('child_process');
  const path = require('path');
  const seedScriptPath = path.join(__dirname, 'seedDatabase.js');

  try {
    execSync(`node "${seedScriptPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });
  } catch (error) {
    console.error('❌ Error running seed script:', error.message);
    throw error;
  }
}

async function run() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 DEMO DATA RESET');
    console.log('='.repeat(60));
    console.log('This will delete all data and restore the demo dataset.');
    console.log('='.repeat(60) + '\n');

    await connect();
    await clearAllCollections();

    // Note: We don't call reseedData here because it would disconnect
    // Instead, inform the user to run the seed script manually
    console.log('✅ Reset complete!\n');
    console.log('📝 Next step: Run the seed script to restore demo data:');
    console.log('   cd backend && npm run seed\n');

  } catch (err) {
    console.error('\n❌ Reset failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// If running directly (not imported)
if (require.main === module) {
  run();
}

module.exports = { clearAllCollections, connect };

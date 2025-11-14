const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Service = require('../Models/serviceModel');

const CATEGORY_KEYWORDS = [
  { category: 'saloon', keywords: ['salon', 'saloon', 'wax', 'hair', 'beauty'] },
  { category: 'cleaning', keywords: ['clean', 'cleaning', 'bathroom', 'kitchen', 'pest', 'pestcontrol', 'deep clean'] },
  { category: 'appliance', keywords: ['ac', 'air conditioner', 'appliance', 'washing', 'microwave', 'repair', 'refrigerator', 'fridge', 'water purifier'] },
  { category: 'plumbing', keywords: ['plumb', 'plumbing', 'leak', 'tap', 'toilet', 'drain'] },
  { category: 'electrical', keywords: ['electri', 'electric', 'wiring', 'switch', 'fan', 'light', 'socket'] },
  { category: 'carpenter', keywords: ['carpen', 'carpenter', 'wood', 'furniture', 'cupboard', 'cabinet'] },
  { category: 'listing', keywords: ['listing', 'directory'] },
];

function detectCategoryForText(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  for (const item of CATEGORY_KEYWORDS) {
    for (const kw of item.keywords) {
      if (t.includes(kw)) return item.category;
    }
  }
  return null;
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Please set MONGO_URI environment variable before running this script.');
    process.exit(1);
  }

  await connectDB();

  try {
    const services = await Service.find({});
    console.log(`Found ${services.length} services`);

    let updated = 0;
    for (const s of services) {
      // skip if category already present and valid
      if (s.category && typeof s.category === 'string' && s.category.trim() !== '') continue;

      const fromTitle = detectCategoryForText(s.title || '');
      const fromDesc = detectCategoryForText(s.description || '');
      const category = fromTitle || fromDesc || 'others';

      s.category = category;
      await s.save();
      updated++;
      console.log(`Updated ${s._id} -> ${category}`);
    }

    console.log(`Migration completed. Updated ${updated} documents.`);
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    mongoose.disconnect();
  }
}

run();

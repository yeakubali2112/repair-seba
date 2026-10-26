const db = require('./db');
const crypto = require('node:crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'repair_seba_salt').digest('hex');
}

function seed() {
  console.log('Seeding Repair Seba Database...');

  // 1. Seed Admin
  const adminCheck = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!adminCheck) {
    db.prepare(`
      INSERT INTO admins (username, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashPassword('admin123'), 'Super Admin', 'superadmin');
    console.log('Admin user created: admin / admin123');
  }

  // 2. Seed Services
  const initialServices = [
    {
      code: 'screen-repair',
      device_type: 'all',
      title_bn: 'স্ক্রিন ও ডিসপ্লে প্রতিস্থাপন',
      title_en: 'Screen & Display Replacement',
      description_bn: 'ভাঙা টাচস্ক্রিন, কালো দাগ, ফ্লিকারিং ডিসপ্লে মেরামত এবং অরিজিনাল ডিসপ্লে ফিটিং।',
      description_en: 'Broken glass, touch unresponsive, black spots, flickering screen fixed with original OEM display.',
      starting_price: 1500,
      estimated_time_bn: '২-৪ ঘন্টা',
      estimated_time_en: '2-4 Hours',
      warranty_bn: '৯০ দিনের ওয়ারেন্টি',
      warranty_en: '90 Days Warranty',
      icon: 'smartphone'
    },
    {
      code: 'battery-replacement',
      device_type: 'all',
      title_bn: 'ব্যাটারি পরিবর্তন ও হেলথ রিকভারি',
      title_en: 'Battery Replacement & Health',
      description_bn: 'দ্রুত চার্জ শেষ হওয়া, ব্যাটারি ফুলে যাওয়া বা ফোন বারবার রিস্টার্ট হওয়ার স্থায়ী সমাধান।',
      description_en: 'Fix fast battery drainage, swollen battery, random restarts with high-capacity certified battery.',
      starting_price: 1200,
      estimated_time_bn: '১-২ ঘন্টা',
      estimated_time_en: '1-2 Hours',
      warranty_bn: '১৮০ দিনের ওয়ারেন্টি',
      warranty_en: '180 Days Warranty',
      icon: 'battery-charging'
    },
    {
      code: 'charging-port',
      device_type: 'all',
      title_bn: 'চার্জিং পোর্ট ও জ্যাক মেরামত',
      title_en: 'Charging Port & Jack Fix',
      description_bn: 'চার্জ না ধরা, লুজ পোর্ট, ফাস্ট চার্জিং কাজ না করা বা টাইপ-সি/লাইটনিং পোর্টের সমস্যা।',
      description_en: 'Loose port, slow charging, no charging detection, or water-damaged charging board repair.',
      starting_price: 600,
      estimated_time_bn: '১ ঘন্টা',
      estimated_time_en: '1 Hour',
      warranty_bn: '৬০ দিনের ওয়ারেন্টি',
      warranty_en: '60 Days Warranty',
      icon: 'zap'
    },
    {
      code: 'motherboard-repair',
      device_type: 'all',
      title_bn: 'মাদারবোর্ড ও চিপ লেভেল মেরামত',
      title_en: 'Motherboard & Chip Level Repair',
      description_bn: 'ফোন সম্পূর্ণ ডেড, শর্ট সার্কিট, পাওয়ার আইসি, সিপিইউ রিবলিং এবং ইএমএমসি চিপ মেরামত।',
      description_en: 'Dead device, short circuit, Power IC, CPU reballing, and advanced chip-level micro-soldering.',
      starting_price: 2500,
      estimated_time_bn: '২৪-৪৮ ঘন্টা',
      estimated_time_en: '24-48 Hours',
      warranty_bn: '৯০ দিনের ওয়ারেন্টি',
      warranty_en: '90 Days Warranty',
      icon: 'cpu'
    },
    {
      code: 'water-damage',
      device_type: 'all',
      title_bn: 'পানিতে পড়া ডিভাইস রিকভারি',
      title_en: 'Water & Liquid Damage Recovery',
      description_bn: 'পানিতে বা তরলে পড়া ডিভাইস আল্ট্রাসনিক ডিপ ক্লিন, ড্রায়ার ও কম্পোনেন্ট রিভাইভাল।',
      description_en: 'Ultrasonic chemical bath, anti-corrosion treatment, and component recovery for liquid submerged devices.',
      starting_price: 1800,
      estimated_time_bn: '১২-২৪ ঘন্টা',
      estimated_time_en: '12-24 Hours',
      warranty_bn: '৬০ দিনের ওয়ারেন্টি',
      warranty_en: '60 Days Warranty',
      icon: 'droplets'
    },
    {
      code: 'camera-repair',
      device_type: 'all',
      title_bn: 'ক্যামেরা ও লেন্স মেরামত',
      title_en: 'Camera & Lens Replacement',
      description_bn: 'ঝাপসা ছবি, ক্যামেরা ওপেন না হওয়া, ফোকাস সমস্যা বা ভাঙা ক্যামেরা গ্লাস পরিবর্তন।',
      description_en: 'Blurry camera, focus failure, black screen on camera app, or cracked camera lens glass replacement.',
      starting_price: 1000,
      estimated_time_bn: '২ ঘন্টা',
      estimated_time_en: '2 Hours',
      warranty_bn: '৯০ দিনের ওয়ারেন্টি',
      warranty_en: '90 Days Warranty',
      icon: 'camera'
    },
    {
      code: 'speaker-mic',
      device_type: 'all',
      title_bn: 'স্পিকার, মাইক ও ইয়ারপিস মেরামত',
      title_en: 'Speaker, Mic & Earpiece Repair',
      description_bn: 'কথা স্পষ্টভাবে শোনা না যাওয়া, রিংটোন না বাজা, বা মাউথপিসে কথা না যাওয়ার সমাধান।',
      description_en: 'Low earpiece volume, distorted loudspeaker, broken microphone during calls or recording.',
      starting_price: 500,
      estimated_time_bn: '১ ঘন্টা',
      estimated_time_en: '1 Hour',
      warranty_bn: '৬০ দিনের ওয়ারেন্টি',
      warranty_en: '60 Days Warranty',
      icon: 'volume-2'
    },
    {
      code: 'tablet-glass-digitizer',
      device_type: 'tablet',
      title_bn: 'ট্যাবলেট ডিজিটাইজার ও বড় স্ক্রিন মেরামত',
      title_en: 'Tablet Digitizer & Big Screen Repair',
      description_bn: 'আইপ্যাড এবং স্যামসাং সহ সকল ব্র্যান্ডের ট্যাবের বিশাল ডিসপ্লে ও টাচ ডিজিটাইজার ঠিক করা।',
      description_en: 'iPad, Samsung Tab, and all branded tablet touch digitizer and large LCD screen repair.',
      starting_price: 2200,
      estimated_time_bn: '৩-৫ ঘন্টা',
      estimated_time_en: '3-5 Hours',
      warranty_bn: '৯০ দিনের ওয়ারেন্টি',
      warranty_en: '90 Days Warranty',
      icon: 'tablet'
    },
    {
      code: 'software-os',
      device_type: 'all',
      title_bn: 'সফটওয়্যার, বুটলুপ ও আনলকিং',
      title_en: 'Software, Bootloop & Unlocking',
      description_bn: 'লোগো আটকে থাকা (বুটলুপ), হ্যাং হওয়া, প্যাটার্ন/পিন রিকভারি এবং অফিসিয়াল ওএস ফ্ল্যাশিং।',
      description_en: 'Stuck on logo / bootloop, system crashing, official firmware flashing, and OS troubleshooting.',
      starting_price: 800,
      estimated_time_bn: '১-২ ঘন্টা',
      estimated_time_en: '1-2 Hours',
      warranty_bn: '৩০ দিনের ওয়ারেন্টি',
      warranty_en: '30 Days Warranty',
      icon: 'hard-drive'
    }
  ];

  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (code, device_type, title_bn, title_en, description_bn, description_en, starting_price, estimated_time_bn, estimated_time_en, warranty_bn, warranty_en, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of initialServices) {
    insertService.run(s.code, s.device_type, s.title_bn, s.title_en, s.description_bn, s.description_en, s.starting_price, s.estimated_time_bn, s.estimated_time_en, s.warranty_bn, s.warranty_en, s.icon);
  }
  console.log('Services seeded successfully.');

  // 3. Orders: Do not seed sample orders (Only real orders from customers are stored)
  console.log('Skipping sample orders: Only real customer orders will be saved.');
  console.log('Database ready!');
}

if (require.main === module) {
  seed();
}

module.exports = { seed, hashPassword };

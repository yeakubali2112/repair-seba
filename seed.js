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

  // 3. Seed Realistic Sample Orders (to showcase full workflow)
  const orderCount = db.prepare('SELECT count(*) as count FROM orders').get().count;
  if (orderCount === 0) {
    const sampleOrders = [
      {
        order_number: 'RS-841920',
        customer_name: 'তানভীর আহমেদ (Tanveer Ahmed)',
        customer_phone: '01712345678',
        customer_alt_phone: '01812345678',
        address: 'House 42, Road 11, Block D, Banani',
        area: 'Banani',
        city: 'Dhaka',
        device_type: 'phone',
        brand: 'Samsung',
        model: 'Galaxy S21 Ultra',
        issues: JSON.stringify(['screen-repair', 'battery-replacement']),
        issue_description: 'হাত থেকে পড়ে ডিসপ্লে ফেটে গেছে, টাচ মাঝেমধ্যে আটকে যায় এবং ব্যাটারি দ্রুত শেষ হয়ে যায়।',
        preferred_date: '2026-10-25',
        preferred_time_slot: '2:00 PM - 5:00 PM',
        status: 'QUOTE_PENDING', // Awaiting customer confirmation!
        estimated_cost: 4800,
        final_cost: 4800,
        diagnosis_notes: 'ল্যাবে পরীক্ষা করে দেখা গেছে: ১) অরিজিনাল সুপার অ্যামোলেড ডিসপ্লে পরিবর্তন প্রয়োজন। ২) ৫০০০mAh ব্যাটারি প্রতিস্থাপন প্রয়োজন। মাদারবোর্ড অক্ষত আছে।',
        technician_notes: 'ডিসপ্লে স্টক রয়েছে। গ্রাহকের সম্মতি পেলে ২ ঘন্টার ভেতর কাজ শুরু হবে।',
        warranty_days: 90,
        quote_status: 'PENDING',
        customer_decision_notes: null,
        quote_decided_at: null,
        pickup_agent_name: 'সোহাগ রানা (Rider Sohag)',
        pickup_agent_phone: '01987654321',
        delivery_agent_name: null,
        delivery_agent_phone: null,
        payment_status: 'UNPAID',
        payment_method: 'CASH_ON_DELIVERY',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
      },
      {
        order_number: 'RS-712394',
        customer_name: 'রাফিয়া সুলতানা (Rafia Sultana)',
        customer_phone: '01899887766',
        customer_alt_phone: '',
        address: 'Flat 4B, Green Road, Dhanmondi',
        area: 'Dhanmondi',
        city: 'Dhaka',
        device_type: 'tablet',
        brand: 'Apple',
        model: 'iPad 9th Gen 10.2"',
        issues: JSON.stringify(['tablet-glass-digitizer']),
        issue_description: 'বাচ্চার হাত থেকে পড়ে সামনের কাঁচ ফেটে গেছে, ডিসপ্লে ভেতরের ছবি দেখা যায় কিন্তু টাচ কাজ করে না।',
        preferred_date: '2026-10-24',
        preferred_time_slot: '10:00 AM - 1:00 PM',
        status: 'IN_REPAIR', // Quote already approved, repair in progress!
        estimated_cost: 3200,
        final_cost: 3200,
        diagnosis_notes: 'এলসিডি ঠিক আছে, শুধু টাচ ডিজিটাইজার গ্লাস পরিবর্তন করা লাগবে।',
        technician_notes: 'গ্রাহক ফোন করে ও অনলাইনে খরচ অনুমোদন করেছেন। ডিজিটাইজার ফিটিং চলছে।',
        warranty_days: 90,
        quote_status: 'APPROVED',
        customer_decision_notes: 'গ্রাহক অনলাইনে ৳৩,২০০ খরচে সম্মতি দিয়েছেন।',
        quote_decided_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        pickup_agent_name: 'কামাল হোসেন (Rider Kamal)',
        pickup_agent_phone: '01755443322',
        delivery_agent_name: 'কামাল হোসেন',
        delivery_agent_phone: '01755443322',
        payment_status: 'UNPAID',
        payment_method: 'BKASH',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        order_number: 'RS-605821',
        customer_name: 'মাহমুদুল হাসান (Mahmudul Hasan)',
        customer_phone: '01611223344',
        customer_alt_phone: '',
        address: 'Plot 18, Sector 7, Uttara',
        area: 'Uttara',
        city: 'Dhaka',
        device_type: 'phone',
        brand: 'Xiaomi',
        model: 'Redmi Note 10 Pro',
        issues: JSON.stringify(['charging-port', 'water-damage']),
        issue_description: 'পানিতে পড়েছিল, শুকানোর পর চার্জ দিলে চার্জ হয় না এবং গরম হয়ে যায়।',
        preferred_date: '2026-10-25',
        preferred_time_slot: '11:00 AM - 2:00 PM',
        status: 'PENDING_PICKUP',
        estimated_cost: 0,
        final_cost: 0,
        diagnosis_notes: null,
        technician_notes: 'পিকআপের অপেক্ষায় রয়েছে।',
        warranty_days: 90,
        quote_status: 'NOT_ISSUED',
        customer_decision_notes: null,
        quote_decided_at: null,
        pickup_agent_name: null,
        pickup_agent_phone: null,
        delivery_agent_name: null,
        delivery_agent_phone: null,
        payment_status: 'UNPAID',
        payment_method: 'CASH_ON_DELIVERY',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        order_number: 'RS-592810',
        customer_name: 'সাবরিনা জাহান (Sabrina Jahan)',
        customer_phone: '01700112233',
        customer_alt_phone: '',
        address: 'House 12, Mirpur 10, Dhaka',
        area: 'Mirpur',
        city: 'Dhaka',
        device_type: 'phone',
        brand: 'iPhone',
        model: 'iPhone 12 Pro',
        issues: JSON.stringify(['speaker-mic', 'camera-repair']),
        issue_description: 'কল আসলে কথা শোনা যায় না এবং মেইন ক্যামেরায় ছবি ব্লার আসে।',
        preferred_date: '2026-10-23',
        preferred_time_slot: '2:00 PM - 5:00 PM',
        status: 'COMPLETED',
        estimated_cost: 3500,
        final_cost: 3500,
        diagnosis_notes: 'ইয়ারপিস মেশ ক্লিন ও নতুন ক্যামেরা ওআইএস মডিউল ইন্সটল করা হয়েছে।',
        technician_notes: 'টেস্টিং সম্পন্ন, গ্রাহককে ডেলিভারি ও পেমেন্ট রিসিভ করা হয়েছে।',
        warranty_days: 90,
        quote_status: 'APPROVED',
        customer_decision_notes: 'গ্রাহক খরচ অনুমোদন করেছিলেন। মেরামত সফল।',
        quote_decided_at: new Date(Date.now() - 3600000 * 40).toISOString(),
        pickup_agent_name: 'সোহাগ রানা',
        pickup_agent_phone: '01987654321',
        delivery_agent_name: 'সোহাগ রানা',
        delivery_agent_phone: '01987654321',
        payment_status: 'PAID',
        payment_method: 'CASH_ON_DELIVERY',
        created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ];

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_alt_phone,
        address, area, city, device_type, brand, model, issues,
        issue_description, preferred_date, preferred_time_slot,
        status, estimated_cost, final_cost, diagnosis_notes,
        technician_notes, warranty_days, quote_status,
        customer_decision_notes, quote_decided_at,
        pickup_agent_name, pickup_agent_phone,
        delivery_agent_name, delivery_agent_phone,
        payment_status, payment_method, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?
      )
    `);

    for (const o of sampleOrders) {
      insertOrder.run(
        o.order_number, o.customer_name, o.customer_phone, o.customer_alt_phone,
        o.address, o.area, o.city, o.device_type, o.brand, o.model, o.issues,
        o.issue_description, o.preferred_date, o.preferred_time_slot,
        o.status, o.estimated_cost, o.final_cost, o.diagnosis_notes,
        o.technician_notes, o.warranty_days, o.quote_status,
        o.customer_decision_notes, o.quote_decided_at,
        o.pickup_agent_name, o.pickup_agent_phone,
        o.delivery_agent_name, o.delivery_agent_phone,
        o.payment_status, o.payment_method, o.created_at, o.updated_at
      );
    }
    console.log('Sample orders seeded.');
  }

  console.log('Database ready!');
}

if (require.main === module) {
  seed();
}

module.exports = { seed, hashPassword };

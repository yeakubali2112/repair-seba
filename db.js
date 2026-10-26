const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

let DB_PATH = path.join(__dirname, 'repair_seba.db');

// On Vercel serverless environment, filesystem is read-only. Copy to /tmp for write access.
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'repair_seba.db');
  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, tmpDbPath);
      }
    } catch (e) {
      console.error('Failed to copy db to /tmp:', e);
    }
  }
  DB_PATH = tmpDbPath;
}

const db = new DatabaseSync(DB_PATH);

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_alt_phone TEXT,
      address TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Dhaka',
      device_type TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      issues TEXT NOT NULL,
      issue_description TEXT,
      preferred_date TEXT,
      preferred_time_slot TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_PICKUP',
      estimated_cost REAL DEFAULT 0,
      final_cost REAL DEFAULT 0,
      diagnosis_notes TEXT,
      technician_notes TEXT,
      warranty_days INTEGER DEFAULT 90,
      quote_status TEXT DEFAULT 'NOT_ISSUED',
      customer_decision_notes TEXT,
      quote_decided_at TEXT,
      pickup_agent_name TEXT,
      pickup_agent_phone TEXT,
      delivery_agent_name TEXT,
      delivery_agent_phone TEXT,
      payment_status TEXT DEFAULT 'UNPAID',
      payment_method TEXT DEFAULT 'CASH_ON_DELIVERY',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      device_type TEXT NOT NULL,
      title_bn TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_bn TEXT NOT NULL,
      description_en TEXT NOT NULL,
      starting_price REAL NOT NULL,
      estimated_time_bn TEXT,
      estimated_time_en TEXT,
      warranty_bn TEXT,
      warranty_en TEXT,
      icon TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      address TEXT,
      area TEXT,
      city TEXT DEFAULT 'Dhaka',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default hero banner settings if not present
  try {
    const existingHero = db.prepare("SELECT value FROM site_settings WHERE key = 'hero_banner_settings'").get();
    if (!existingHero) {
      const defaultHeroConfig = {
        show_animation: true,
        show_bike: true,
        bike_size: 'normal', // compact (0.42), normal (0.48), medium (0.58)
        bike_speed: 'normal', // slow (22s), normal (15s), fast (9s)
        show_tags: true,
        badge_text: '✨ বাংলাদেশে প্রথম ডিজিটাল ডোরস্টেপ রিপেয়ার সেবা',
        title_text: 'ঘরে বসেই নষ্ট ফোন ও ট্যাব মেরামত করুন',
        subtitle_text: 'আপনার ঠিকানায় গিয়ে নষ্ট ফোন বা ট্যাব সংগ্রহ করব, ল্যাবে পরীক্ষা করে খরচের হিসাব জানাব। আপনি রাজি হলে মেরামত করে আবার আপনার ঠিকানায় পৌঁছে দেব!',
        stat_1_num: '১৫,০০০+',
        stat_1_lbl: 'মেরামতকৃত ডিভাইস',
        stat_2_num: '৯০-১৮০ দিন',
        stat_2_lbl: 'সার্ভিস ওয়ারেন্টি',
        stat_3_num: 'ফ্রি পিকআপ',
        stat_3_lbl: 'ও ডোরস্টেপ ড্রপ'
      };
      db.prepare("INSERT INTO site_settings (key, value) VALUES ('hero_banner_settings', ?)").run(
        JSON.stringify(defaultHeroConfig)
      );
    }
  } catch (err) {
    console.error('Error seeding site_settings (hero):', err);
  }

  // Seed default contact & footer settings if not present
  try {
    const existingFooter = db.prepare("SELECT value FROM site_settings WHERE key = 'contact_footer_settings'").get();
    if (!existingFooter) {
      const defaultFooterConfig = {
        office_name: 'হেড অফিস ও সেন্ট্রাল ল্যাব:',
        office_address: 'লেভেল ৪, প্লট ১২, রোড ৭, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ।',
        office_hours: 'প্রতিদিন সকাল ৯:০০ - রাত ৯:০০ (শুক্রবারসহ সার্বক্ষণিক সহায়তা)',
        office_coverage: 'ঢাকা মহানগরের সকল থানা ও এরিয়া সরাসরি আওতাভুক্ত।',
        phone_primary: '০১৭১১-০০২২৩৩',
        phone_secondary: '০১৮২২-৩৩৪৪৫৫',
        whatsapp_number: '০১৭১১-০০২২৩৩',
        whatsapp_url: 'https://wa.me/8801711002233',
        email: 'support@repairseba.com',
        facebook_url: 'https://facebook.com/repairseba',
        youtube_url: 'https://youtube.com/@repairseba',
        instagram_url: 'https://instagram.com/repairseba',
        linkedin_url: 'https://linkedin.com/company/repairseba',
        brand_desc: 'বাংলাদেশের প্রথম ডিজিটাল ডোরস্টেপ গ্যাজেট রিপেয়ার প্ল্যাটফর্ম। আপনার বাসা বা অফিস থেকে ডিভাইস সংগ্রহ করে ল্যাব টেস্ট ও দ্রুততম সময়ে ওয়ারেন্টিসহ মেরামত ডেলিভারি দেওয়া হয়।',
        copyright_text: '© ২০২৬ রিপেয়ার সেবা (Repair Seba). সর্বস্বত্ব সংরক্ষিত। একটি বিশ্বস্ত ডিজিটাল ডোরস্টেপ সার্ভিস।',
        show_social: true,
        show_trust_badge: true
      };
      db.prepare("INSERT INTO site_settings (key, value) VALUES ('contact_footer_settings', ?)").run(
        JSON.stringify(defaultFooterConfig)
      );
    }
  } catch (err) {
    console.error('Error seeding site_settings (footer):', err);
  }
}

initDb();

module.exports = db;

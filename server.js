const http = require('node:http');
const url = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const db = require('./db');
const { hashPassword } = require('./seed');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-memory admin session storage (token -> { adminId, username, role, expiresAt })
const sessions = new Map();
// In-memory customer session storage (token -> { userId, phone, expiresAt })
const customerSessions = new Map();

// Helper to generate secure random tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate unique order number (e.g. RS-581920)
function generateOrderNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `RS-${digits}`;
}

// MIME Types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper to parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        // Try urlencoded fallback
        try {
          const params = new URLSearchParams(body);
          const obj = {};
          for (const [k, v] of params) obj[k] = v;
          resolve(obj);
        } catch {
          reject(new Error('Invalid JSON format'));
        }
      }
    });
    req.on('error', reject);
  });
}

// Response helpers
function jsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function errorResponse(res, statusCode, message, details = null) {
  jsonResponse(res, statusCode, {
    success: false,
    error: message,
    details
  });
}

const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 'repair_seba_jwt_secret_2026';

function generateAdminToken(admin) {
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  const payload = JSON.stringify({
    adminId: admin.id,
    username: admin.username,
    name: admin.name || 'Admin',
    role: admin.role || 'SUPER_ADMIN',
    expiresAt
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('hex');
  const token = `${b64}.${hmac}`;
  sessions.set(token, {
    adminId: admin.id,
    username: admin.username,
    name: admin.name || 'Admin',
    role: admin.role || 'SUPER_ADMIN',
    expiresAt
  });
  return token;
}

// Authentication middleware
function getAuthenticatedAdmin(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];

  const session = sessions.get(token);
  if (session) {
    if (session.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }
    return session;
  }

  // Stateless HMAC verification fallback
  try {
    const [b64, hmac] = token.split('.');
    if (!b64 || !hmac) return null;
    const expected = crypto.createHmac('sha256', AUTH_SECRET).update(b64).digest('hex');
    if (expected !== hmac) return null;
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (!data || !data.expiresAt || data.expiresAt < Date.now()) return null;
    sessions.set(token, data);
    return data;
  } catch {
    return null;
  }
}

function getAuthenticatedCustomer(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  const token = parts[1];

  const session = customerSessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    customerSessions.delete(token);
    return null;
  }
  return session;
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // -------------------------------------------------------------
    // REST API ROUTES
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/')) {

      // 1. Health check
      if (pathname === '/api/health' && method === 'GET') {
        return jsonResponse(res, 200, { status: 'ok', name: 'Repair Seba API', time: new Date().toISOString() });
      }

      // 2. Public Services
      if (pathname === '/api/services' && method === 'GET') {
        const deviceType = parsedUrl.query.device_type;
        let query = 'SELECT * FROM services WHERE is_active = 1';
        const params = [];
        if (deviceType && deviceType !== 'all') {
          query += " AND (device_type = ? OR device_type = 'all')";
          params.push(deviceType);
        }
        query += ' ORDER BY id ASC';
        const services = db.prepare(query).all(...params);
        return jsonResponse(res, 200, { success: true, services });
      }

      // Public Hero Banner Settings
      if (pathname === '/api/settings/hero' && method === 'GET') {
        const row = db.prepare("SELECT value FROM site_settings WHERE key = 'hero_banner_settings'").get();
        let settings = {};
        if (row && row.value) {
          try { settings = JSON.parse(row.value); } catch {}
        }
        return jsonResponse(res, 200, { success: true, settings });
      }

      // Public Footer & Contact Settings
      if ((pathname === '/api/settings/footer' || pathname === '/api/settings/contact') && method === 'GET') {
        const row = db.prepare("SELECT value FROM site_settings WHERE key = 'contact_footer_settings'").get();
        let settings = {};
        if (row && row.value) {
          try { settings = JSON.parse(row.value); } catch {}
        }
        return jsonResponse(res, 200, { success: true, settings });
      }

      // 3. Create New Order (Customer Booking)
      if (pathname === '/api/orders' && method === 'POST') {
        const body = await parseBody(req);
        const {
          customer_name,
          customer_phone,
          customer_alt_phone = '',
          address,
          area,
          city = 'Dhaka',
          device_type,
          brand,
          model,
          issues = [],
          issue_description = '',
          preferred_date = '',
          preferred_time_slot = ''
        } = body;

        // Validation
        if (!customer_name || !customer_phone || !address || !area || !device_type || !brand || !model) {
          return errorResponse(res, 400, 'Please fill in all required fields (নাম, ফোন নম্বর, ঠিকানা, এলাকা, ডিভাইসের নাম ও মডেল আবশ্যক)।');
        }

        // Clean phone number
        const cleanPhone = customer_phone.trim().replace(/[\s-]/g, '');
        if (cleanPhone.length < 11) {
          return errorResponse(res, 400, 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (Valid 11-digit phone number is required)।');
        }

        // Generate unique order number
        let orderNumber = generateOrderNumber();
        let attempts = 0;
        while (attempts < 5) {
          const exists = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderNumber);
          if (!exists) break;
          orderNumber = generateOrderNumber();
          attempts++;
        }

        const now = new Date().toISOString();
        const issuesJson = JSON.stringify(Array.isArray(issues) ? issues : [issues]);

        const insertStmt = db.prepare(`
          INSERT INTO orders (
            order_number, customer_name, customer_phone, customer_alt_phone,
            address, area, city, device_type, brand, model,
            issues, issue_description, preferred_date, preferred_time_slot,
            status, estimated_cost, final_cost, quote_status,
            payment_status, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            'PENDING_PICKUP', 0, 0, 'NOT_ISSUED',
            'UNPAID', ?, ?
          )
        `);

        insertStmt.run(
          orderNumber, customer_name.trim(), cleanPhone, customer_alt_phone.trim(),
          address.trim(), area.trim(), city.trim(), device_type, brand.trim(), model.trim(),
          issuesJson, issue_description.trim(), preferred_date, preferred_time_slot,
          now, now
        );

        const newOrder = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
        if (newOrder && newOrder.issues) {
          try { newOrder.issues = JSON.parse(newOrder.issues); } catch {}
        }

        // Auto-register or link customer profile if not already present
        try {
          let existingUser = db.prepare('SELECT id, address, area FROM users WHERE phone = ?').get(cleanPhone);
          if (!existingUser) {
            db.prepare('INSERT INTO users (phone, name, email, address, area, city, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
              .run(cleanPhone, customer_name.trim(), '', address.trim(), area.trim(), city.trim() || 'Dhaka', now, now);
          } else if (!existingUser.address) {
            db.prepare('UPDATE users SET address = ?, area = ?, updated_at = ? WHERE id = ?')
              .run(address.trim(), area.trim(), now, existingUser.id);
          }
        } catch (e) {
          console.warn('Auto user profile link:', e.message);
        }

        return jsonResponse(res, 201, {
          success: true,
          message_bn: 'আপনার রিপেয়ার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।',
          message_en: 'Your repair request has been successfully submitted! Our team will contact you shortly.',
          order_number: orderNumber,
          order: newOrder
        });
      }

      // 4. Track Order (Customer Search)
      if (pathname === '/api/orders/track' && method === 'GET') {
        const q = (parsedUrl.query.q || '').trim();
        if (!q) {
          return errorResponse(res, 400, 'অনুগ্রহ করে অর্ডার আইডি বা ফোন নম্বর দিন (Please provide Order ID or Phone Number)');
        }

        let orders = [];
        if (q.toUpperCase().startsWith('RS-')) {
          const order = db.prepare('SELECT * FROM orders WHERE UPPER(order_number) = ?').get(q.toUpperCase());
          if (order) orders.push(order);
        } else {
          // Clean search phone
          const cleanQ = q.replace(/[\s-]/g, '');
          orders = db.prepare(`
            SELECT * FROM orders 
            WHERE customer_phone LIKE ? OR customer_alt_phone LIKE ? OR UPPER(order_number) = ?
            ORDER BY id DESC
          `).all(`%${cleanQ}%`, `%${cleanQ}%`, q.toUpperCase());
        }

        // Parse issues JSON
        for (const ord of orders) {
          if (ord.issues) {
            try { ord.issues = JSON.parse(ord.issues); } catch { ord.issues = []; }
          }
        }

        return jsonResponse(res, 200, {
          success: true,
          count: orders.length,
          orders
        });
      }

      // 5. Customer Quotation Decision (Accept or Reject Quote)
      // /api/orders/:order_number/quote-action
      const quoteActionMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9_-]+)\/quote-action$/);
      if (quoteActionMatch && method === 'POST') {
        const orderNumber = quoteActionMatch[1].toUpperCase();
        const body = await parseBody(req);
        const { action, customer_notes = '' } = body; // action: 'ACCEPT' or 'REJECT'

        if (!action || !['ACCEPT', 'REJECT'].includes(action.toUpperCase())) {
          return errorResponse(res, 400, 'Invalid action. Must be ACCEPT or REJECT.');
        }

        const order = db.prepare('SELECT * FROM orders WHERE UPPER(order_number) = ?').get(orderNumber);
        if (!order) {
          return errorResponse(res, 404, 'Order not found with number ' + orderNumber);
        }

        if (order.status !== 'QUOTE_PENDING' && order.quote_status !== 'PENDING') {
          return errorResponse(res, 400, 'এই অর্ডারের জন্য কোনো মূল্য অনুমোদনের অপেক্ষায় নেই (No pending quote awaiting decision for this order).');
        }

        const now = new Date().toISOString();
        let newStatus = 'IN_REPAIR';
        let quoteStatus = 'APPROVED';
        let note = customer_notes ? `গ্রাহকের নোট: ${customer_notes}` : 'গ্রাহক অনলাইনে মূল্য অনুমোদন করেছেন।';

        if (action.toUpperCase() === 'REJECT') {
          newStatus = 'QUOTE_REJECTED';
          quoteStatus = 'REJECTED';
          note = customer_notes ? `প্রত্যাখ্যানের কারণ: ${customer_notes}` : 'গ্রাহক প্রস্তাবিত খরচ প্রত্যাখ্যান করেছেন। ডিভাইস ফেরত দেওয়া হবে।';
        }

        db.prepare(`
          UPDATE orders
          SET status = ?,
              quote_status = ?,
              customer_decision_notes = ?,
              quote_decided_at = ?,
              updated_at = ?
          WHERE id = ?
        `).run(newStatus, quoteStatus, note, now, now, order.id);

        const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
        if (updatedOrder && updatedOrder.issues) {
          try { updatedOrder.issues = JSON.parse(updatedOrder.issues); } catch {}
        }

        return jsonResponse(res, 200, {
          success: true,
          action: action.toUpperCase(),
          message_bn: action.toUpperCase() === 'ACCEPT' 
            ? 'ধন্যবাদ! আপনি খরচে সম্মতি দিয়েছেন। আমাদের টেকনিশিয়ানরা দ্রুত আপনার ফোন মেরামতের কাজ শুরু করছেন।'
            : 'আপনার সিদ্ধান্ত গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি আপনার ডিভাইসটি কোনো অতিরিক্ত খরচ ছাড়াই আপনার ঠিকানায় নিরাপদে পৌঁছে দিবেন।',
          message_en: action.toUpperCase() === 'ACCEPT'
            ? 'Thank you! You have accepted the quotation. Repair work is now underway.'
            : 'Your decision has been recorded. Our rider will safely return your device to your address.',
          order: updatedOrder
        });
      }

      // 6. Public Contact Form
      if (pathname === '/api/contact' && method === 'POST') {
        const body = await parseBody(req);
        const { name, phone, subject = 'General Inquiry', message } = body;
        if (!name || !phone || !message) {
          return errorResponse(res, 400, 'Please provide name, phone and message.');
        }
        db.prepare(`
          INSERT INTO contacts (name, phone, subject, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(name.trim(), phone.trim(), subject.trim(), message.trim(), new Date().toISOString());

        return jsonResponse(res, 201, {
          success: true,
          message_bn: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা দ্রুত যোগাযোগ করব।',
          message_en: 'Your inquiry has been submitted successfully.'
        });
      }

      // -------------------------------------------------------------
      // CUSTOMER / USER AUTHENTICATION & PROFILE API
      // -------------------------------------------------------------

      // 1. Customer Login via Phone (Auto-registers new users)
      if (pathname === '/api/user/login' && method === 'POST') {
        const body = await parseBody(req);
        let phone = (body.phone || '').trim().replace(/[^0-9+]/g, '');
        if (phone.startsWith('+88')) phone = phone.substring(3);
        if (phone.startsWith('88')) phone = phone.substring(2);

        if (!phone || phone.length < 11) {
          return errorResponse(res, 400, 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (Valid 11-digit mobile number required)');
        }

        const now = new Date().toISOString();
        let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

        if (!user) {
          const userName = (body.name || '').trim() || 'সম্মানিত গ্রাহক';
          const stmt = db.prepare('INSERT INTO users (phone, name, email, address, area, city, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
          const info = stmt.run(phone, userName, '', '', '', 'Dhaka', now, now);
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
        } else if (body.name && body.name.trim() && (user.name === 'সম্মানিত গ্রাহক' || !user.name)) {
          db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(body.name.trim(), now, user.id);
          user.name = body.name.trim();
        }

        const token = generateToken();
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
        customerSessions.set(token, {
          userId: user.id,
          phone: user.phone,
          expiresAt
        });

        return jsonResponse(res, 200, {
          success: true,
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email || '',
            address: user.address || '',
            area: user.area || '',
            city: user.city || 'Dhaka'
          }
        });
      }

      // 2. Customer Me (Session Check)
      if (pathname === '/api/user/me' && method === 'GET') {
        const session = getAuthenticatedCustomer(req);
        if (!session) {
          return errorResponse(res, 401, 'লগইন সেশন পাওয়া যায়নি');
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);
        if (!user) {
          return errorResponse(res, 404, 'গ্রাহক অ্যাকাউন্ট পাওয়া যায়নি');
        }
        return jsonResponse(res, 200, {
          success: true,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email || '',
            address: user.address || '',
            area: user.area || '',
            city: user.city || 'Dhaka'
          }
        });
      }

      // 3. Customer Profile Update (Allows user to edit name, email, address, area anytime)
      if (pathname === '/api/user/profile' && method === 'PUT') {
        const session = getAuthenticatedCustomer(req);
        if (!session) {
          return errorResponse(res, 401, 'প্রোফাইল পরিবর্তন করতে লগইন করা আবশ্যক');
        }
        const body = await parseBody(req);
        const name = (body.name || '').trim();
        const email = (body.email || '').trim();
        const address = (body.address || '').trim();
        const area = (body.area || '').trim();
        const city = (body.city || 'Dhaka').trim();
        const now = new Date().toISOString();

        if (!name) {
          return errorResponse(res, 400, 'অনুগ্রহ করে আপনার নাম দিন');
        }

        db.prepare(`
          UPDATE users 
          SET name = ?, email = ?, address = ?, area = ?, city = ?, updated_at = ?
          WHERE id = ?
        `).run(name, email, address, area, city, now, session.userId);

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);

        return jsonResponse(res, 200, {
          success: true,
          message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
          user: {
            id: updatedUser.id,
            phone: updatedUser.phone,
            name: updatedUser.name,
            email: updatedUser.email || '',
            address: updatedUser.address || '',
            area: updatedUser.area || '',
            city: updatedUser.city || 'Dhaka'
          }
        });
      }

      // 4. Customer Orders History
      if (pathname === '/api/user/orders' && method === 'GET') {
        const session = getAuthenticatedCustomer(req);
        if (!session) {
          return errorResponse(res, 401, 'লগইন আবশ্যক');
        }
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);
        if (!user) return errorResponse(res, 404, 'User not found');

        const orders = db.prepare(`
          SELECT * FROM orders 
          WHERE customer_phone = ? OR customer_alt_phone = ?
          ORDER BY id DESC
        `).all(user.phone, user.phone);

        return jsonResponse(res, 200, {
          success: true,
          orders: orders.map(o => {
            try { o.issues = JSON.parse(o.issues); } catch {}
            return o;
          })
        });
      }

      // 5. Customer Logout
      if (pathname === '/api/user/logout' && method === 'POST') {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          const token = authHeader.split(' ')[1];
          if (token) customerSessions.delete(token);
        }
        return jsonResponse(res, 200, { success: true, message: 'Logged out' });
      }

      // -------------------------------------------------------------
      // ADMIN API ROUTES
      // -------------------------------------------------------------

      // Admin Login
      if (pathname === '/api/admin/login' && method === 'POST') {
        const body = await parseBody(req);
        const { username, password } = body;

        if (!username || !password) {
          return errorResponse(res, 400, 'ইউজারনেম এবং পাসওয়ার্ড দিন (Username and password required)');
        }

        const hashed = hashPassword(password);
        const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND password_hash = ?').get(username, hashed);

        if (!admin) {
          return errorResponse(res, 401, 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials)');
        }

        const token = generateAdminToken(admin);

        let perms = ["orders","services","inquiries","hero","footer","users"];
        try {
          if (admin.permissions) perms = JSON.parse(admin.permissions);
        } catch (_) {}

        return jsonResponse(res, 200, {
          success: true,
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role,
            avatar: admin.avatar || '',
            phone: admin.phone || '',
            email: admin.email || '',
            permissions: perms
          }
        });
      }

      // Admin Logout
      if (pathname === '/api/admin/logout' && method === 'POST') {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          const token = authHeader.split(' ')[1];
          if (token) sessions.delete(token);
        }
        return jsonResponse(res, 200, { success: true, message: 'Logged out' });
      }

      // Admin Me (Session Verification)
      if (pathname === '/api/admin/me' && method === 'GET') {
        const session = getAuthenticatedAdmin(req);
        if (!session) {
          return errorResponse(res, 401, 'Unauthorized or session expired');
        }
        const admin = db.prepare('SELECT id, username, name, role, avatar, phone, email, permissions FROM admins WHERE id = ?').get(session.adminId);
        if (!admin) {
          return jsonResponse(res, 200, { success: true, admin: session });
        }
        let perms = ["orders","services","inquiries","hero","footer","users"];
        try {
          if (admin.permissions) perms = JSON.parse(admin.permissions);
        } catch (_) {}
        return jsonResponse(res, 200, {
          success: true,
          admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name || session.name,
            role: admin.role || session.role,
            avatar: admin.avatar || '',
            phone: admin.phone || '',
            email: admin.email || '',
            permissions: perms
          }
        });
      }

      // ALL REMAINING ADMIN ROUTES REQUIRE AUTH
      const adminSession = getAuthenticatedAdmin(req);
      if (!adminSession) {
        return errorResponse(res, 401, 'প্রবেশাধিকার নেই। অনুগ্রহ করে লগইন করুন (Unauthorized: Please log in as admin)');
      }

      // Admin Dashboard Stats
      if (pathname === '/api/admin/stats' && method === 'GET') {
        const total = db.prepare('SELECT count(*) as c FROM orders').get().c;
        const pendingPickup = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'PENDING_PICKUP'").get().c;
        const collected = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'COLLECTED'").get().c;
        const diagnosing = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'DIAGNOSING'").get().c;
        const quotePending = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'QUOTE_PENDING'").get().c;
        const inRepair = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'IN_REPAIR'").get().c;
        const outForDelivery = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'OUT_FOR_DELIVERY'").get().c;
        const completed = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'COMPLETED'").get().c;
        const quoteRejected = db.prepare("SELECT count(*) as c FROM orders WHERE status = 'QUOTE_REJECTED'").get().c;

        const revenueRow = db.prepare("SELECT SUM(final_cost) as total FROM orders WHERE payment_status = 'PAID'").get();
        const totalRevenue = revenueRow && revenueRow.total ? revenueRow.total : 0;

        return jsonResponse(res, 200, {
          success: true,
          stats: {
            total_orders: total,
            pending_pickup: pendingPickup,
            in_lab: collected + diagnosing,
            quote_pending: quotePending,
            in_repair: inRepair,
            out_for_delivery: outForDelivery,
            completed: completed,
            quote_rejected: quoteRejected,
            total_revenue: totalRevenue
          }
        });
      }

      // Admin Orders List
      if (pathname === '/api/admin/orders' && method === 'GET') {
        const status = parsedUrl.query.status;
        const search = (parsedUrl.query.search || '').trim();
        const deviceType = parsedUrl.query.device_type;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
          query += ' AND status = ?';
          params.push(status);
        }

        if (deviceType && deviceType !== 'ALL') {
          query += ' AND device_type = ?';
          params.push(deviceType);
        }

        if (search) {
          query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR brand LIKE ? OR model LIKE ?)';
          const wild = `%${search}%`;
          params.push(wild, wild, wild, wild, wild);
        }

        query += ' ORDER BY id DESC';
        const orders = db.prepare(query).all(...params);

        for (const ord of orders) {
          if (ord.issues) {
            try { ord.issues = JSON.parse(ord.issues); } catch { ord.issues = []; }
          }
        }

        return jsonResponse(res, 200, { success: true, count: orders.length, orders });
      }

      // Admin Single Order View
      const adminOrderMatch = pathname.match(/^\/api\/admin\/orders\/(\d+)$/);
      if (adminOrderMatch && method === 'GET') {
        const orderId = parseInt(adminOrderMatch[1], 10);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        if (!order) return errorResponse(res, 404, 'Order not found');
        if (order.issues) {
          try { order.issues = JSON.parse(order.issues); } catch { order.issues = []; }
        }
        return jsonResponse(res, 200, { success: true, order });
      }

      // Admin Update Order (Diagnosis, Price Quotation, Status, Rider Assignment, Notes)
      if (adminOrderMatch && method === 'PUT') {
        const orderId = parseInt(adminOrderMatch[1], 10);
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        if (!order) return errorResponse(res, 404, 'Order not found');

        const body = await parseBody(req);
        const {
          status,
          estimated_cost,
          final_cost,
          diagnosis_notes,
          technician_notes,
          warranty_days,
          quote_status,
          pickup_agent_name,
          pickup_agent_phone,
          delivery_agent_name,
          delivery_agent_phone,
          payment_status,
          payment_method
        } = body;

        let newStatus = status !== undefined ? status : order.status;
        let newEstCost = estimated_cost !== undefined ? parseFloat(estimated_cost) || 0 : order.estimated_cost;
        let newFinalCost = final_cost !== undefined ? parseFloat(final_cost) || 0 : (newEstCost || order.final_cost);
        let newQuoteStatus = quote_status !== undefined ? quote_status : order.quote_status;

        // Logic check: if admin inputs a cost and updates status to QUOTE_PENDING, auto-mark quote_status as PENDING
        if (newStatus === 'QUOTE_PENDING' && newEstCost > 0 && newQuoteStatus === 'NOT_ISSUED') {
          newQuoteStatus = 'PENDING';
        }

        const now = new Date().toISOString();

        db.prepare(`
          UPDATE orders
          SET status = ?,
              estimated_cost = ?,
              final_cost = ?,
              diagnosis_notes = ?,
              technician_notes = ?,
              warranty_days = ?,
              quote_status = ?,
              pickup_agent_name = ?,
              pickup_agent_phone = ?,
              delivery_agent_name = ?,
              delivery_agent_phone = ?,
              payment_status = ?,
              payment_method = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          newStatus,
          newEstCost,
          newFinalCost,
          diagnosis_notes !== undefined ? diagnosis_notes : order.diagnosis_notes,
          technician_notes !== undefined ? technician_notes : order.technician_notes,
          warranty_days !== undefined ? parseInt(warranty_days, 10) : order.warranty_days,
          newQuoteStatus,
          pickup_agent_name !== undefined ? pickup_agent_name : order.pickup_agent_name,
          pickup_agent_phone !== undefined ? pickup_agent_phone : order.pickup_agent_phone,
          delivery_agent_name !== undefined ? delivery_agent_name : order.delivery_agent_name,
          delivery_agent_phone !== undefined ? delivery_agent_phone : order.delivery_agent_phone,
          payment_status !== undefined ? payment_status : order.payment_status,
          payment_method !== undefined ? payment_method : order.payment_method,
          now,
          orderId
        );

        const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        if (updated && updated.issues) {
          try { updated.issues = JSON.parse(updated.issues); } catch {}
        }

        return jsonResponse(res, 200, {
          success: true,
          message_bn: 'অর্ডার তথ্য সফলভাবে আপডেট হয়েছে।',
          message_en: 'Order updated successfully.',
          order: updated
        });
      }

      // Admin Manage Services
      if (pathname === '/api/admin/services' && method === 'GET') {
        const services = db.prepare('SELECT * FROM services ORDER BY id ASC').all();
        return jsonResponse(res, 200, { success: true, services });
      }

      if (pathname === '/api/admin/services' && method === 'POST') {
        const body = await parseBody(req);
        const {
          code, device_type = 'all', title_bn, title_en,
          description_bn, description_en, starting_price,
          estimated_time_bn, estimated_time_en, warranty_bn, warranty_en, icon = 'wrench'
        } = body;

        if (!title_bn || !title_en || !starting_price) {
          return errorResponse(res, 400, 'Title and starting price are required');
        }

        const finalCode = code || 'service-' + Date.now();
        db.prepare(`
          INSERT INTO services (
            code, device_type, title_bn, title_en, description_bn, description_en,
            starting_price, estimated_time_bn, estimated_time_en, warranty_bn, warranty_en, icon
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          finalCode, device_type, title_bn, title_en, description_bn || '', description_en || '',
          parseFloat(starting_price) || 0, estimated_time_bn || '', estimated_time_en || '',
          warranty_bn || '', warranty_en || '', icon
        );

        return jsonResponse(res, 201, { success: true, message: 'Service added' });
      }

      const serviceIdMatch = pathname.match(/^\/api\/admin\/services\/(\d+)$/);
      if (serviceIdMatch && method === 'PUT') {
        const serviceId = parseInt(serviceIdMatch[1], 10);
        const body = await parseBody(req);
        const s = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
        if (!s) return errorResponse(res, 404, 'Service not found');

        db.prepare(`
          UPDATE services
          SET title_bn = ?, title_en = ?, description_bn = ?, description_en = ?,
              starting_price = ?, estimated_time_bn = ?, estimated_time_en = ?,
              warranty_bn = ?, warranty_en = ?, is_active = ?
          WHERE id = ?
        `).run(
          body.title_bn || s.title_bn,
          body.title_en || s.title_en,
          body.description_bn !== undefined ? body.description_bn : s.description_bn,
          body.description_en !== undefined ? body.description_en : s.description_en,
          body.starting_price !== undefined ? parseFloat(body.starting_price) : s.starting_price,
          body.estimated_time_bn || s.estimated_time_bn,
          body.estimated_time_en || s.estimated_time_en,
          body.warranty_bn || s.warranty_bn,
          body.warranty_en || s.warranty_en,
          body.is_active !== undefined ? (body.is_active ? 1 : 0) : s.is_active,
          serviceId
        );

        return jsonResponse(res, 200, { success: true, message: 'Service updated' });
      }

      // Admin Inquiries / Contacts
      if (pathname === '/api/admin/contacts' && method === 'GET') {
        const contacts = db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();
        return jsonResponse(res, 200, { success: true, contacts });
      }

      // Admin Update Hero Banner Settings
      if (pathname === '/api/admin/settings/hero' && method === 'PUT') {
        const body = await parseBody(req);
        let currentSettings = {};
        const row = db.prepare("SELECT value FROM site_settings WHERE key = 'hero_banner_settings'").get();
        if (row && row.value) {
          try { currentSettings = JSON.parse(row.value); } catch {}
        }

        const updatedSettings = {
          ...currentSettings,
          ...body
        };

        db.prepare(`
          INSERT INTO site_settings (key, value)
          VALUES ('hero_banner_settings', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(JSON.stringify(updatedSettings));

        return jsonResponse(res, 200, { success: true, message: 'Hero banner settings updated', settings: updatedSettings });
      }

      // Admin Update Footer & Contact Settings
      if ((pathname === '/api/admin/settings/footer' || pathname === '/api/admin/settings/contact') && method === 'PUT') {
        const body = await parseBody(req);
        let currentSettings = {};
        const row = db.prepare("SELECT value FROM site_settings WHERE key = 'contact_footer_settings'").get();
        if (row && row.value) {
          try { currentSettings = JSON.parse(row.value); } catch {}
        }

        const updatedSettings = {
          ...currentSettings,
          ...body
        };

        db.prepare(`
          INSERT INTO site_settings (key, value)
          VALUES ('contact_footer_settings', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(JSON.stringify(updatedSettings));

        return jsonResponse(res, 200, { success: true, message: 'Footer and contact settings updated', settings: updatedSettings });
      }

      // Admin Update Own Profile
      if (pathname === '/api/admin/profile' && method === 'PUT') {
        const body = await parseBody(req);
        const { name, avatar, phone, email, password } = body;

        let query = 'UPDATE admins SET name = ?, avatar = ?, phone = ?, email = ?';
        let params = [name || adminSession.name, avatar || '', phone || '', email || ''];

        if (password && password.trim().length >= 6) {
          query += ', password_hash = ?';
          params.push(hashPassword(password.trim()));
        }
        query += ' WHERE id = ?';
        params.push(adminSession.adminId);

        db.prepare(query).run(...params);

        const updated = db.prepare('SELECT id, username, name, role, avatar, phone, email, permissions FROM admins WHERE id = ?').get(adminSession.adminId);
        let perms = ["orders","services","inquiries","hero","footer","users"];
        try {
          if (updated.permissions) perms = JSON.parse(updated.permissions);
        } catch (_) {}

        return jsonResponse(res, 200, {
          success: true,
          admin: {
            ...updated,
            permissions: perms
          }
        });
      }

      // Get All Admin Users
      if (pathname === '/api/admin/users' && method === 'GET') {
        const rows = db.prepare('SELECT id, username, name, role, avatar, phone, email, permissions, created_at FROM admins ORDER BY id ASC').all();
        const users = rows.map(u => {
          let perms = ["orders","services","inquiries","hero","footer","users"];
          try {
            if (u.permissions) perms = JSON.parse(u.permissions);
          } catch (_) {}
          return {
            ...u,
            permissions: perms
          };
        });
        return jsonResponse(res, 200, { success: true, users });
      }

      // Create New Admin Profile
      if (pathname === '/api/admin/users' && method === 'POST') {
        const body = await parseBody(req);
        const { username, password, name, role, avatar, phone, email, permissions } = body;

        if (!username || !password || !name) {
          return errorResponse(res, 400, 'ইউজারনেম, পাসওয়ার্ড এবং পূর্ণ নাম আবশ্যক (Username, password, and name required)');
        }

        const cleanUsername = username.trim().toLowerCase();
        const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(cleanUsername);
        if (existing) {
          return errorResponse(res, 409, 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে (Username already exists)');
        }

        const hashed = hashPassword(password.trim());
        const permsStr = JSON.stringify(Array.isArray(permissions) ? permissions : ["orders"]);
        const createdAt = new Date().toISOString();

        const result = db.prepare(`
          INSERT INTO admins (username, password_hash, name, role, avatar, phone, email, permissions, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          cleanUsername,
          hashed,
          name.trim(),
          role || 'admin',
          avatar || '',
          phone || '',
          email || '',
          permsStr,
          createdAt
        );

        return jsonResponse(res, 201, {
          success: true,
          message: 'নতুন অ্যাডমিন প্রোফাইল সফলভাবে তৈরি হয়েছে',
          user: {
            id: Number(result.lastInsertRowid),
            username: cleanUsername,
            name: name.trim(),
            role: role || 'admin',
            avatar: avatar || '',
            phone: phone || '',
            email: email || '',
            permissions: Array.isArray(permissions) ? permissions : ["orders"],
            created_at: createdAt
          }
        });
      }

      // Update Admin User by ID
      if (pathname.startsWith('/api/admin/users/') && method === 'PUT') {
        const userId = parseInt(pathname.split('/')[4], 10);
        if (!userId) return errorResponse(res, 400, 'Invalid user ID');

        const body = await parseBody(req);
        const { name, role, avatar, phone, email, permissions, password } = body;

        let query = 'UPDATE admins SET name = ?, role = ?, avatar = ?, phone = ?, email = ?, permissions = ?';
        let permsStr = JSON.stringify(Array.isArray(permissions) ? permissions : ["orders"]);
        let params = [name, role, avatar || '', phone || '', email || '', permsStr];

        if (password && password.trim().length >= 6) {
          query += ', password_hash = ?';
          params.push(hashPassword(password.trim()));
        }
        query += ' WHERE id = ?';
        params.push(userId);

        db.prepare(query).run(...params);

        return jsonResponse(res, 200, { success: true, message: 'প্রোফাইল আপডেট হয়েছে' });
      }

      // Delete Admin User by ID
      if (pathname.startsWith('/api/admin/users/') && method === 'DELETE') {
        const userId = parseInt(pathname.split('/')[4], 10);
        if (!userId) return errorResponse(res, 400, 'Invalid user ID');

        const target = db.prepare('SELECT username FROM admins WHERE id = ?').get(userId);
        if (!target) return errorResponse(res, 404, 'User not found');
        if (target.username === 'admin' || userId === 1) {
          return errorResponse(res, 403, 'প্রধান সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না (Cannot delete main Super Admin)');
        }

        db.prepare('DELETE FROM admins WHERE id = ?').run(userId);
        return jsonResponse(res, 200, { success: true, message: 'প্রোফাইল মুছে ফেলা হয়েছে' });
      }

      return errorResponse(res, 404, 'API endpoint not found: ' + pathname);
    }

    // -------------------------------------------------------------
    // STATIC FILE SERVING
    // -------------------------------------------------------------
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    if (safePath === '/admin' || safePath === '/admin/') safePath = '/admin.html';
    if (safePath === '/track' || safePath === '/track/') safePath = '/index.html';
    if (safePath === '/favicon.ico') safePath = '/favicon.svg';

    let filePath = path.join(PUBLIC_DIR, safePath);

    // Security check: ensure path is within PUBLIC_DIR
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for client-side navigation if not found
        const fallback = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(fallback, (err2, content) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });

  } catch (error) {
    console.error('Server Error:', error);
    errorResponse(res, 500, 'Internal Server Error', error.message);
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Repair Seba (রিপেয়ার সেবা) Server Running!`);
    console.log(`  Local URL:        http://localhost:${PORT}`);
    console.log(`  Admin Dashboard:  http://localhost:${PORT}/admin.html`);
    console.log(`  Default Admin:    admin / admin123`);
    console.log(`====================================================`);
  });
}

module.exports = server;

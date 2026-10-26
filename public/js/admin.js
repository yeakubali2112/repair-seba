// Repair Seba - Admin Dashboard Logic

// -------------------------------------------------------------
// CENTERED MODAL / POPUP ALERT (Replaces browser top alert)
// -------------------------------------------------------------
let customAdminMessageCallback = null;

function showCenterPopup(title, message, icon = '🎉', btnText = 'ঠিক আছে (OK)', callback = null) {
  const modal = document.getElementById('custom-message-modal');
  if (!modal) {
    if (window._nativeAlert) window._nativeAlert(message);
    if (callback) callback();
    return;
  }
  const titleEl = document.getElementById('custom-modal-title');
  const msgEl = document.getElementById('custom-modal-message');
  const iconEl = document.getElementById('custom-modal-icon');
  const btnEl = document.getElementById('custom-modal-action-btn');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;
  if (btnEl) btnEl.textContent = btnText;

  customAdminMessageCallback = callback;
  modal.classList.remove('hidden');
}

function closeCustomMessageModal() {
  const modal = document.getElementById('custom-message-modal');
  if (modal) modal.classList.add('hidden');
  if (customAdminMessageCallback) {
    const cb = customAdminMessageCallback;
    customAdminMessageCallback = null;
    cb();
  }
}

// Override window.alert so all popups display centered in page
if (typeof window !== 'undefined') {
  window._nativeAlert = window.alert;
  window.alert = function(msg) {
    let icon = '📢';
    let title = 'বিজ্ঞপ্তি';
    if (typeof msg === 'string') {
      if (msg.includes('সফল') || msg.includes('সংরক্ষণ') || msg.includes('আপডেট')) {
        icon = '✅';
        title = 'সফলতা';
      } else if (msg.includes('ভুল') || msg.includes('ব্যর্থ') || msg.includes('এরর') || msg.includes('অনুমতি নেই')) {
        icon = '⚠️';
        title = 'সতর্কতা';
      }
    }
    showCenterPopup(title, msg, icon, 'ঠিক আছে');
  };
}

window.showCenterPopup = showCenterPopup;
window.closeCustomMessageModal = closeCustomMessageModal;

const ADMIN_STATUS_BADGES = {
  'PENDING_PICKUP': { bn: 'পিকআপ বাকি', en: 'Pending Pickup', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  'PICKUP_ASSIGNED': { bn: 'পিকআপ রাইডার নির্ধারিত', en: 'Rider Assigned', color: 'bg-blue-50 text-blue-800 border-blue-300' },
  'COLLECTED': { bn: 'ডিভাইস সংগ্রহ সম্পন্ন', en: 'Collected', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  'DIAGNOSING': { bn: 'ল্যাবে পরীক্ষা চলছে', en: 'Diagnosing', color: 'bg-purple-50 text-purple-800 border-purple-300' },
  'QUOTE_PENDING': { bn: '⚠️ মূল্য অনুমোদন অপেক্ষমাণ', en: 'Quote Pending', color: 'bg-orange-50 text-orange-800 border-orange-400 font-bold animate-pulse' },
  'QUOTE_APPROVED': { bn: 'গ্রাহক অনুমোদন দিয়েছেন', en: 'Quote Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' },
  'QUOTE_REJECTED': { bn: 'গ্রাহক বাতিল করেছেন', en: 'Quote Rejected', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  'IN_REPAIR': { bn: 'মেরামত চলছে', en: 'In Repair', color: 'bg-cyan-50 text-cyan-800 border-cyan-300' },
  'QUALITY_CHECK': { bn: 'কোয়ালিটি টেস্ট চলছে', en: 'Quality Check', color: 'bg-teal-50 text-teal-800 border-teal-300' },
  'OUT_FOR_DELIVERY': { bn: 'ডেলিভারিতে রয়েছে', en: 'Out for Delivery', color: 'bg-sky-50 text-sky-800 border-sky-300' },
  'COMPLETED': { bn: 'সম্পন্ন', en: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' },
  'CANCELLED': { bn: 'বাতিল', en: 'Cancelled', color: 'bg-slate-100 text-slate-700 border-slate-300' }
};

const TAB_TITLES = {
  'overview': 'ড্যাশবোর্ড ওভারভিউ',
  'orders': '<span>📦</span> অর্ডার আবেদন ও মেরামত ট্র্যাকিং ব্যবস্থাপনা',
  'customers': '<span>👥</span> ওয়েবসাইটে নিবন্ধিত গ্রাহক একাউন্টসমূহ',
  'services': '<span>🛠️</span> রিপেয়ার সার্ভিস ও মূল্য তালিকা পরিচালনা',
  'inquiries': '<span>💬</span> গ্রাহকদের মেসেজ ও যোগাযোগ তালিকা',
  'hero': '<span>🎨</span> হিরো ব্যানার ও বাইক অ্যানিমেশন কন্ট্রোল',
  'footer': '<span>🏢</span> অফিস ঠিকানা ও ফুটার সেটিংস',
  'users': '<span>👤</span> প্রোফাইল তৈরি, টিম ও এক্সেস কন্ট্রোল'
};

function toggleAdminSidebar(open) {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  if (open === undefined) {
    sidebar.classList.toggle('-translate-x-full');
    backdrop?.classList.toggle('hidden');
  } else if (open) {
    sidebar.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  }
}

let adminServicesCache = [];

let adminToken = localStorage.getItem('repair_seba_admin_token');
let currentAdminTab = 'overview';
let currentStatusFilter = 'ALL';
let adminOrdersCache = [];

let currentAdminProfile = null;
let currentAdminPermissions = ["orders","services","inquiries","hero","footer","users"];
try {
  const cachedProf = localStorage.getItem('repair_seba_admin_profile');
  if (cachedProf && adminToken) {
    currentAdminProfile = JSON.parse(cachedProf);
    if (Array.isArray(currentAdminProfile.permissions)) {
      currentAdminPermissions = currentAdminProfile.permissions;
    }
  }
} catch (_) {}

// Initialize immediately if DOM is already ready, or listen to DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAdminAuth();
    setupAdminListeners();
  });
} else {
  initAdminAuth();
  setupAdminListeners();
}

function updateHeaderProfileUI(admin) {
  if (!admin) return;
  currentAdminProfile = admin;
  try {
    localStorage.setItem('repair_seba_admin_profile', JSON.stringify(admin));
  } catch (_) {}
  currentAdminPermissions = Array.isArray(admin.permissions) ? admin.permissions : ["orders","services","inquiries","hero","footer","users"];

  const nameEl = document.getElementById('header-admin-name');
  const roleEl = document.getElementById('header-admin-role');
  const subEl = document.getElementById('header-admin-sub');
  const avatarEl = document.getElementById('header-admin-avatar');
  const initialEl = document.getElementById('header-admin-initial');

  if (nameEl) nameEl.textContent = admin.name || 'Yeakub Ali';
  
  const roleMap = {
    'superadmin': { label: 'সুপার', fullLabel: 'সুপার অ্যাডমিন', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'manager': { label: 'ম্যানেজার', fullLabel: 'অপারেশন ম্যানেজার', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'technician': { label: 'টেকনিশিয়ান', fullLabel: 'ল্যাব টেকনিশিয়ান', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'support': { label: 'সাপোর্ট', fullLabel: 'কাস্টমার সাপোর্ট ও রাইডার', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'admin': { label: 'অ্যাডমিন', fullLabel: 'অ্যাডমিন', color: 'bg-teal-100 text-teal-800 border-teal-200' }
  };
  const roleInfo = roleMap[admin.role] || { label: admin.role, fullLabel: admin.role, color: 'bg-slate-100 text-slate-800 border-slate-200' };

  if (roleEl) {
    roleEl.textContent = roleInfo.label;
    roleEl.className = `px-1.5 py-0.2 text-[9px] font-black rounded ${roleInfo.color} border`;
  }
  if (subEl) subEl.textContent = `${admin.role === 'superadmin' ? 'সুপার অ্যাডমিন' : admin.name} • @${admin.username}`;

  if (admin.avatar && admin.avatar.trim() !== '') {
    if (avatarEl) {
      avatarEl.src = admin.avatar;
      avatarEl.classList.remove('hidden');
    }
    if (initialEl) initialEl.classList.add('hidden');
  } else {
    if (avatarEl) avatarEl.classList.add('hidden');
    if (initialEl) {
      initialEl.textContent = (admin.name || admin.username || 'প্র')[0].toUpperCase();
      initialEl.classList.remove('hidden');
    }
  }

  // Update My Profile Card in Tab-Users
  const myName = document.getElementById('my-card-name');
  const myUser = document.getElementById('my-card-username');
  const myRole = document.getElementById('my-card-role-badge');
  const myPhone = document.getElementById('my-card-phone');
  const myEmail = document.getElementById('my-card-email');
  const myAvatar = document.getElementById('my-card-avatar');
  const myInit = document.getElementById('my-card-initial');

  if (myName) myName.textContent = admin.name || 'Yeakub Ali';
  if (myUser) myUser.textContent = `@${admin.username || 'admin'}`;
  if (myRole) myRole.textContent = roleInfo.fullLabel || roleInfo.label;
  if (myPhone) myPhone.textContent = admin.phone || 'ফোন নম্বর নেই';
  if (myEmail) myEmail.textContent = admin.email || 'support@repairseba.com';
  if (myAvatar && admin.avatar && admin.avatar.trim() !== '') {
    myAvatar.src = admin.avatar;
    myAvatar.classList.remove('hidden');
    if (myInit) myInit.classList.add('hidden');
  } else {
    if (myAvatar) myAvatar.classList.add('hidden');
    if (myInit) {
      myInit.textContent = (admin.name || admin.username || 'প্র')[0].toUpperCase();
      myInit.classList.remove('hidden');
    }
  }

  // Apply RBAC to sidebar tabs
  applyRolePermissions(currentAdminPermissions, admin.role === 'superadmin');
}

function applyRolePermissions(perms, isSuper) {
  const tabElements = {
    'overview': [document.getElementById('tab-btn-overview')],
    'orders': [document.getElementById('tab-btn-orders')],
    'customers': [document.getElementById('tab-btn-customers')],
    'services': [document.getElementById('tab-btn-services')],
    'inquiries': [document.getElementById('tab-btn-inquiries')],
    'hero': [document.getElementById('tab-btn-hero')],
    'footer': [document.getElementById('tab-btn-footer')],
    'users': [document.getElementById('tab-btn-users')]
  };

  Object.entries(tabElements).forEach(([key, btnList]) => {
    const hasPerm = isSuper || perms.includes(key) || perms.includes('*') 
      || (key === 'overview' && (perms.includes('orders') || isSuper))
      || (key === 'customers' && (perms.includes('users') || perms.includes('orders') || isSuper));
    btnList.forEach(btn => {
      if (!btn) return;
      btn.style.display = hasPerm ? 'flex' : 'none';
    });
  });

  // If non-superadmin does not have orders permission and is on orders/overview tab, redirect to first permitted tab
  if (!isSuper && !perms.includes('orders') && !perms.includes('*') && (currentAdminTab === 'orders' || currentAdminTab === 'overview')) {
    const allowed = ['customers', 'services', 'inquiries', 'hero', 'footer', 'users'].find(p => perms.includes(p));
    if (allowed) {
      switchTab(allowed);
    }
  }
}

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------
async function initAdminAuth() {
  if (!adminToken) {
    showLoginScreen();
    return;
  }

  // INSTANTLY display dashboard with zero delay and zero login page flicker
  showDashboardScreen();
  if (currentAdminProfile) {
    updateHeaderProfileUI(currentAdminProfile);
  }

  // Start loading dashboard orders, stats & polling immediately
  loadAdminDashboardData();

  // Validate session in background
  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 401) {
      adminLogout();
      return;
    }
    const data = await res.json();
    if (data.success && data.admin) {
      currentAdminProfile = data.admin;
      updateHeaderProfileUI(data.admin);
    }
  } catch (err) {
    console.warn('Session background verify network notice:', err);
  }
}

function showLoginScreen() {
  document.documentElement.classList.remove('admin-logged-in');
  document.documentElement.classList.add('admin-logged-out');
  const login = document.getElementById('admin-login-screen');
  const dash = document.getElementById('admin-dashboard-screen');
  if (login) {
    login.classList.remove('hidden');
    login.style.display = 'flex';
  }
  if (dash) {
    dash.classList.add('hidden');
    dash.style.display = 'none';
  }
}

function showDashboardScreen() {
  document.documentElement.classList.remove('admin-logged-out');
  document.documentElement.classList.add('admin-logged-in');
  const login = document.getElementById('admin-login-screen');
  const dash = document.getElementById('admin-dashboard-screen');
  if (login) {
    login.classList.add('hidden');
    login.style.display = 'none';
  }
  if (dash) {
    dash.classList.remove('hidden');
    dash.style.display = 'flex';
  }
}

function adminLogout() {
  if (adminToken) {
    fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).catch(() => {});
  }
  localStorage.removeItem('repair_seba_admin_token');
  localStorage.removeItem('repair_seba_admin_profile');
  adminToken = null;
  currentAdminProfile = null;
  showLoginScreen();
}

async function handleAdminLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const u = document.getElementById('login-username')?.value.trim();
  const p = document.getElementById('login-password')?.value.trim();
  const loginForm = document.getElementById('admin-login-form');
  const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

  if (!u || !p) {
    alert('অনুগ্রহ করে ইউজারনেম এবং পাসওয়ার্ড দিন।');
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'যাচাই করা হচ্ছে...';
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.success) {
      adminToken = data.token;
      localStorage.setItem('repair_seba_admin_token', adminToken);
      if (data.admin) {
        currentAdminProfile = data.admin;
        localStorage.setItem('repair_seba_admin_profile', JSON.stringify(data.admin));
      }
      showDashboardScreen();
      updateHeaderProfileUI(data.admin);
      loadAdminDashboardData();
    } else {
      alert(data.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড। সঠিক তথ্য দিন।');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'লগইন করুন (Sign In)';
    }
  }
}
window.handleAdminLoginSubmit = handleAdminLoginSubmit;
window.adminLogout = adminLogout;
window.showLoginScreen = showLoginScreen;
window.showDashboardScreen = showDashboardScreen;

function setupAdminListeners() {
  // Login Form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.removeEventListener('submit', handleAdminLoginSubmit);
    loginForm.addEventListener('submit', handleAdminLoginSubmit);
  }

  // Search input debounce
  const searchInput = document.getElementById('order-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadAdminOrders();
      }, 300);
    });
  }

  // Edit Order Form Submit
  const editForm = document.getElementById('order-edit-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleOrderUpdate();
    });
  }
}

// -------------------------------------------------------------
// LOAD DASHBOARD DATA
// -------------------------------------------------------------
async function loadAdminDashboardData() {
  await loadAdminStats();
  await loadOverviewOrders();
  await loadAdminOrders();
  startAdminLivePolling();
}

async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      renderAdminStats(data.stats);
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

function renderAdminStats(s) {
  const container = document.getElementById('stats-container');
  if (!container) return;

  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = s.total_orders;

  const sidebarOrderBadge = document.getElementById('badge-tab-orders');
  if (sidebarOrderBadge) sidebarOrderBadge.textContent = `${s.pending_pickup}টি নতুন`;

  const badgeTotal = document.getElementById('badge-table-total');
  if (badgeTotal) badgeTotal.textContent = `${s.total_orders}টি মোট`;

  container.innerHTML = `
    <!-- Card 1: মোট অর্ডার - Mint Green -->
    <div class="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
        <span class="truncate">মোট অর্ডার</span>
        <span class="text-xs shrink-0">👥</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.total_orders || 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
        <span class="px-1 py-0.2 text-[8px] font-bold rounded bg-emerald-200/70 text-emerald-900 border border-emerald-300">রিয়েল</span>
      </div>
    </div>

    <!-- Card 2: অপেক্ষমাণ - Amber/Cream -->
    <div class="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
        <span class="truncate">অপেক্ষমাণ</span>
        <span class="text-xs shrink-0">📦</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.pending_pickup || 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
        ${s.pending_pickup > 0 ? `<span class="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-200/70 text-amber-900 border border-amber-300 animate-pulse">${s.pending_pickup} নতুন</span>` : ''}
      </div>
    </div>

    <!-- Card 3: মেরামত ও ল্যাব - Soft Blue -->
    <div class="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
        <span class="truncate">মেরামত ও ল্যাব</span>
        <span class="text-xs shrink-0">🔬</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${(s.in_repair || 0) + (s.in_lab || 0)}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
      </div>
    </div>

    <!-- Card 4: অনুমোদন বাকি - Soft Purple -->
    <div class="bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-purple-800 mb-1">
        <span class="truncate">অনুমোদন বাকি</span>
        <span class="text-xs shrink-0">🔔</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.quote_pending || 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
      </div>
    </div>

    <!-- Card 5: প্রাপ্ত বার্তা - Soft Rose -->
    <div class="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-rose-800 mb-1">
        <span class="truncate">প্রাপ্ত বার্তা</span>
        <span class="text-xs shrink-0">💬</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none" id="stat-card-inq-count">${s.total_contacts !== undefined ? s.total_contacts : 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
      </div>
    </div>

    <!-- Card 6: পুরাতন (Alumni) - Soft Teal -->
    <div class="bg-[#f0fdfa] border border-[#99f6e4] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-teal-800 mb-1">
        <span class="truncate">পুরাতন ডিভাইস</span>
        <span class="text-xs shrink-0">🎓</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.completed || 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
      </div>
    </div>

    <!-- Card 7: সার্ভিসসমূহ - Soft Sky -->
    <div class="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-sky-800 mb-1">
        <span class="truncate">সার্ভিস ক্যাটাগরি</span>
        <span class="text-xs shrink-0">🛠️</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none" id="stat-card-serv-count">${s.total_services !== undefined ? s.total_services : 0}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
      </div>
    </div>

    <!-- Card 8: মোট আদায় - Mint Emerald -->
    <div class="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
        <span class="truncate">মোট আদায়</span>
        <span class="text-xs shrink-0">💰</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-sm sm:text-base font-black text-slate-900 leading-none truncate">৳${(s.total_revenue || 0).toLocaleString()}</span>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ORDERS LIST & FILTERS
// -------------------------------------------------------------
function filterOrders(status) {
  currentStatusFilter = status;
  document.querySelectorAll('.order-status-tab').forEach(t => {
    t.classList.remove('active', 'bg-[#0f766e]', 'text-white', 'shadow-2xs', 'font-bold');
    t.classList.add('text-slate-700', 'hover:text-slate-900', 'font-medium');
  });
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active', 'bg-[#0f766e]', 'text-white', 'shadow-2xs', 'font-bold');
    window.event.currentTarget.classList.remove('text-slate-700', 'hover:text-slate-900', 'font-medium');
  }
  loadAdminOrders();
}

async function loadAdminOrders() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500">অর্ডার লোড হচ্ছে...</td></tr>`;

  const search = document.getElementById('order-search-input')?.value.trim() || '';
  const url = `/api/admin/orders?status=${currentStatusFilter}&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      adminOrdersCache = data.orders;
      renderAdminOrdersTable(data.orders);
    } else {
      if (res.status === 401 || data.error?.includes('Unauthorized') || data.error?.includes('প্রবেশাধিকার')) {
        adminLogout();
        return;
      }
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-rose-400">${data.error}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading admin orders:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-rose-400">অর্ডার লোড করতে সমস্যা হয়েছে।</td></tr>`;
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderOrderMediaBadges(o) {
  const hasPhoto = o.photo_url || (typeof o.attachments === 'string' && o.attachments.includes('"photo"'));
  const hasVideo = o.video_url || (typeof o.attachments === 'string' && o.attachments.includes('"video"'));
  const hasVoice = o.voice_url || (typeof o.attachments === 'string' && o.attachments.includes('"voice"'));

  if (!hasPhoto && !hasVideo && !hasVoice) return '';

  return `
    <div class="flex items-center gap-1 mt-1">
      ${hasPhoto ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded">📷 ছবি</span>` : ''}
      ${hasVideo ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">🎥 ভিডিও</span>` : ''}
      ${hasVoice ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">🎙️ ভয়েস</span>` : ''}
    </div>
  `;
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-500 font-medium">কোনো অর্ডার পাওয়া যায়নি।</td></tr>`;
    return;
  }

  const statusList = [
    { val: 'PENDING_PICKUP', label: '⏳ পিকআপ বাকি', color: 'bg-amber-50 text-amber-900 border-amber-300' },
    { val: 'PICKUP_ASSIGNED', label: '🚴 রাইডার নিযুক্ত', color: 'bg-blue-50 text-blue-900 border-blue-300' },
    { val: 'COLLECTED', label: '📦 ল্যাবে আসছে', color: 'bg-indigo-50 text-indigo-900 border-indigo-300' },
    { val: 'DIAGNOSING', label: '🔬 টেস্ট চলছে', color: 'bg-purple-50 text-purple-900 border-purple-300' },
    { val: 'QUOTE_PENDING', label: '⚠️ কোটেশন বাকি', color: 'bg-orange-50 text-orange-900 border-orange-300' },
    { val: 'QUOTE_APPROVED', label: '✅ অনুমোদিত', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
    { val: 'IN_REPAIR', label: '🛠️ মেরামত চলছে', color: 'bg-cyan-50 text-cyan-900 border-cyan-300' },
    { val: 'OUT_FOR_DELIVERY', label: '🚚 ডেলিভারিতে', color: 'bg-teal-50 text-teal-900 border-teal-300' },
    { val: 'COMPLETED', label: '🎉 সম্পন্ন', color: 'bg-emerald-100 text-emerald-950 border-emerald-400' },
    { val: 'CANCELLED', label: '❌ বাতিল', color: 'bg-rose-50 text-rose-900 border-rose-300' }
  ];

  tbody.innerHTML = orders.map(o => {
    const curStatus = statusList.find(s => s.val === o.status) || { color: 'bg-slate-50 text-slate-800 border-slate-300' };
    const dateFormatted = new Date(o.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Direct status dropdown (No modal/submit needed! Direct 1-click update)
    const statusWidget = `
      <select onchange="quickUpdateOrderStatus(${o.id}, this.value)" class="text-[11px] font-bold py-1.5 px-2 rounded-xl border cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs w-full ${curStatus.color}" title="সরাসরি স্ট্যাটাস পরিবর্তন করুন">
        ${statusList.map(s => `
          <option value="${s.val}" ${s.val === o.status ? 'selected' : ''}>${s.label}</option>
        `).join('')}
      </select>
    `;

    return `
      <tr class="hover:bg-slate-50/80 transition text-slate-800 text-xs">
        <td class="py-2.5 px-3 font-bold font-mono text-[#0f766e] truncate">
          ${o.order_number}
        </td>

        <td class="py-2.5 px-3">
          <div class="font-bold text-slate-900 truncate" title="${o.customer_name}">${o.customer_name}</div>
          <div class="text-[10px] text-slate-500 truncate">📍 ${o.area || 'ঢাকা'}</div>
        </td>

        <td class="py-2.5 px-3">
          <div class="font-semibold text-slate-800 truncate" title="${o.brand} ${o.model}">${o.brand} ${o.model}</div>
          <div class="text-[10px] text-slate-500 truncate">⚠️ ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}</div>
          ${renderOrderMediaBadges(o)}
        </td>

        <td class="py-2.5 px-3 font-mono">
          <div class="text-slate-800 text-xs font-semibold truncate">${o.customer_phone}</div>
          <a href="https://wa.me/88${o.customer_phone}?text=${encodeURIComponent(`Assalamu Alaikum, Repair Seba থেকে আপনার অর্ডার ${o.order_number} এর ব্যাপারে যোগাযোগ করছি।`)}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold inline-flex items-center gap-0.5 mt-0.5" title="WhatsApp Chat">
            💬 চ্যাট
          </a>
        </td>

        <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">
          ${dateFormatted}
        </td>

        <td class="py-2.5 px-3">
          ${statusWidget}
        </td>

        <td class="py-2.5 px-2 text-center whitespace-nowrap">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="openEditModal(${o.id})" class="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-200/90 flex items-center justify-center text-xs transition shadow-2xs hover:scale-105 cursor-pointer" title="অর্ডার কোটেশন ও বিবরণ এডিট করুন">
              ✏️
            </button>
            <button onclick="deleteAdminOrder(${o.id}, '${o.order_number}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/90 flex items-center justify-center text-xs transition shadow-2xs hover:scale-105 cursor-pointer" title="অর্ডার ডিলিট করুন">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Overview table (shows only up to 5 new orders, without direct status dropdown or action button)
async function loadOverviewOrders() {
  const tbody = document.getElementById('overview-orders-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500 font-medium">নতুন অর্ডার লোড হচ্ছে...</td></tr>`;

  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success) {
      // Filter for new/pending orders (status === 'PENDING_PICKUP')
      const newOrders = data.orders.filter(o => o.status === 'PENDING_PICKUP');
      // Show up to 5 new orders
      const displayOrders = newOrders.slice(0, 5);
      renderOverviewOrdersTable(displayOrders, newOrders.length);
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-rose-400 font-medium">${data.error}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading overview orders:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-rose-400 font-medium">অর্ডার লোড করতে সমস্যা হয়েছে।</td></tr>`;
  }
}

function renderOverviewOrdersTable(orders, totalNewCount = 0) {
  const tbody = document.getElementById('overview-orders-table-body');
  if (!tbody) return;

  const countBadge = document.getElementById('badge-overview-total');
  if (countBadge) {
    countBadge.textContent = `${orders.length}টি নতুন আবেদন`;
  }

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-medium">বর্তমানে কোনো নতুন অপেক্ষমাণ অর্ডার নেই। <button onclick="switchTab('orders')" class="text-[#0f766e] font-bold underline hover:text-[#115e59] ml-1">সকল অর্ডার দেখুন →</button></td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const dateFormatted = new Date(o.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return `
      <tr class="hover:bg-slate-50/80 transition text-slate-800 text-xs">
        <td class="py-3 px-3 font-bold font-mono text-[#0f766e] whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            <span>${o.order_number}</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">নতুন</span>
          </div>
        </td>

        <td class="py-3 px-3">
          <div class="font-bold text-slate-900 truncate max-w-[150px]" title="${o.customer_name}">${o.customer_name}</div>
          <div class="text-[10px] text-slate-500 truncate max-w-[150px]">📍 ${o.area || 'ঢাকা'}</div>
        </td>

        <td class="py-3 px-3">
          <div class="font-semibold text-slate-800 truncate max-w-[180px]" title="${o.brand} ${o.model}">${o.brand} ${o.model}</div>
          <div class="text-[10px] text-slate-500 truncate max-w-[180px]">⚠️ ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}</div>
        </td>

        <td class="py-3 px-3 font-mono whitespace-nowrap">
          <div class="text-slate-800 text-xs font-semibold">${o.customer_phone}</div>
          <a href="https://wa.me/88${o.customer_phone}?text=${encodeURIComponent(`Assalamu Alaikum, Repair Seba থেকে আপনার অর্ডার ${o.order_number} এর ব্যাপারে যোগাযোগ করছি।`)}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold inline-flex items-center gap-0.5 mt-0.5" title="WhatsApp Chat">
            💬 চ্যাট
          </a>
        </td>

        <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
          ${dateFormatted}
        </td>
      </tr>
    `;
  }).join('');
}

// Direct 1-click status update without submit button or modal popup
async function quickUpdateOrderStatus(orderId, newStatus) {
  try {
    const payload = { status: newStatus };
    if (newStatus === 'QUOTE_APPROVED') {
      payload.quote_status = 'APPROVED';
    } else if (newStatus === 'QUOTE_PENDING') {
      payload.quote_status = 'PENDING';
    }

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      loadAdminOrders();
      loadAdminStats();
      loadOverviewOrders();
    } else {
      alert(data.error || 'স্ট্যাটাস পরিবর্তন করা যায়নি।');
    }
  } catch (err) {
    console.error('Quick status update error:', err);
    alert('সার্ভার ত্রুটি।');
  }
}

async function quickDirectApprove(orderId) {
  await quickUpdateOrderStatus(orderId, 'QUOTE_APPROVED');
}

window.quickUpdateOrderStatus = quickUpdateOrderStatus;
window.quickDirectApprove = quickDirectApprove;

// -------------------------------------------------------------
// EDIT ORDER & QUOTATION MANAGEMENT MODAL
// -------------------------------------------------------------
function openEditModal(orderId) {
  const order = adminOrdersCache.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('edit-order-id').value = order.id;
  document.getElementById('modal-edit-orderno').textContent = `${order.order_number} (${order.brand} ${order.model})`;

  // Populate Customer Reported Issue & Attachments (Photo, Video, Voice)
  const customerDescEl = document.getElementById('modal-customer-desc');
  const mediaContainer = document.getElementById('modal-attachments-container');
  const mediaBadge = document.getElementById('modal-media-badge');

  if (customerDescEl) {
    customerDescEl.textContent = (order.issue_description && order.issue_description.trim()) ? order.issue_description : 'গ্রাহক কোনো অতিরিক্ত লিখিত বিবরণ দেননি।';
  }

  // Parse attachments
  let attList = [];
  try {
    if (order.attachments) {
      attList = typeof order.attachments === 'string' ? JSON.parse(order.attachments) : order.attachments;
    }
  } catch (e) {}

  if (!Array.isArray(attList)) attList = [];

  // Fallbacks if individual columns exist
  if (order.photo_url && !attList.find(a => a.type === 'photo')) {
    attList.push({ type: 'photo', url: order.photo_url, fileName: 'ডিভাইসের ছবি' });
  }
  if (order.video_url && !attList.find(a => a.type === 'video')) {
    attList.push({ type: 'video', url: order.video_url, fileName: 'সমস্যার ভিডিও' });
  }
  if (order.voice_url && !attList.find(a => a.type === 'voice')) {
    attList.push({ type: 'voice', url: order.voice_url, fileName: 'ভয়েস রেকর্ড' });
  }

  if (mediaBadge) {
    mediaBadge.textContent = attList.length > 0 ? `${attList.length}টি মিডিয়া ফাইল সংযুক্ত` : 'কোনো মিডিয়া ফাইল নেই';
    mediaBadge.className = attList.length > 0
      ? 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200'
      : 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200';
  }

  if (mediaContainer) {
    if (attList.length === 0) {
      mediaContainer.innerHTML = `<div class="p-3 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400 italic">কোনো ছবি, ভিডিও বা ভয়েস রেকর্ড সংযুক্ত নেই।</div>`;
    } else {
      mediaContainer.innerHTML = attList.map(item => {
        if (item.type === 'photo') {
          return `
            <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📷</span> <span>গ্রাহকের পাঠানো ডিভাইসের ছবি</span>
                  ${item.size ? `<span class="text-[10px] text-slate-400">(${formatFileSize(item.size)})</span>` : ''}
                </span>
                <a href="${item.url}" target="_blank" download class="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition inline-flex items-center gap-1">
                  🔍 বড় করে দেখুন / ডাউনলোড
                </a>
              </div>
              <div class="rounded-xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50 flex items-center justify-center p-1">
                <img src="${item.url}" alt="Customer device photo" class="max-h-72 w-auto object-contain rounded-lg cursor-pointer hover:opacity-95 transition" onclick="window.open('${item.url}', '_blank')">
              </div>
            </div>
          `;
        } else if (item.type === 'video') {
          return `
            <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🎥</span> <span>ডিভাইসের সমস্যার ভিডিও (Video)</span>
                  ${item.size ? `<span class="text-[10px] text-slate-400">(${formatFileSize(item.size)})</span>` : ''}
                </span>
                <a href="${item.url}" target="_blank" download class="text-[11px] font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition inline-flex items-center gap-1">
                  ⬇️ ডাউনলোড
                </a>
              </div>
              <div class="rounded-xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                <video src="${item.url}" controls playsinline preload="metadata" class="w-full max-h-72 object-contain bg-black"></video>
              </div>
            </div>
          `;
        } else if (item.type === 'voice') {
          return `
            <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🎙️</span> <span>গ্রাহকের ভয়েস মেসেজ (Voice Recording)</span>
                </span>
                <a href="${item.url}" target="_blank" download class="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition inline-flex items-center gap-1">
                  ⬇️ অডিও ডাউনলোড
                </a>
              </div>
              <div class="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
                <audio src="${item.url}" controls class="w-full"></audio>
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }
  }

  document.getElementById('edit-status').value = order.status;
  document.getElementById('edit-estimated-cost').value = order.estimated_cost || '';
  document.getElementById('edit-warranty-days').value = order.warranty_days || 90;
  document.getElementById('edit-diagnosis-notes').value = order.diagnosis_notes || '';
  document.getElementById('edit-pickup-name').value = order.pickup_agent_name || '';
  document.getElementById('edit-pickup-phone').value = order.pickup_agent_phone || '';
  document.getElementById('edit-payment-status').value = order.payment_status || 'UNPAID';
  document.getElementById('edit-tech-notes').value = order.technician_notes || '';

  document.getElementById('order-edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('order-edit-modal').classList.add('hidden');
}

function setAsQuoteReady() {
  const cost = document.getElementById('edit-estimated-cost').value;
  if (!cost || parseFloat(cost) <= 0) {
    alert('অনুগ্রহ করে আগে প্রস্তাবিত মোট খরচ (৳) লিখুন।');
    document.getElementById('edit-estimated-cost').focus();
    return;
  }
  document.getElementById('edit-status').value = 'QUOTE_PENDING';
  alert('স্ট্যাটাস QUOTE_PENDING সিলেক্ট করা হয়েছে। এখন "সংরক্ষণ করুন" বাটনে চাপ দিন। গ্রাহক ওয়েবসাইটে তাঁর অর্ডার ট্র্যাক করে অনুমোদন বাটন দেখতে পাবেন!');
}

async function handleOrderUpdate() {
  const id = document.getElementById('edit-order-id').value;
  const payload = {
    status: document.getElementById('edit-status').value,
    estimated_cost: parseFloat(document.getElementById('edit-estimated-cost').value) || 0,
    final_cost: parseFloat(document.getElementById('edit-estimated-cost').value) || 0,
    warranty_days: parseInt(document.getElementById('edit-warranty-days').value, 10) || 90,
    diagnosis_notes: document.getElementById('edit-diagnosis-notes').value.trim(),
    pickup_agent_name: document.getElementById('edit-pickup-name').value.trim(),
    pickup_agent_phone: document.getElementById('edit-pickup-phone').value.trim(),
    payment_status: document.getElementById('edit-payment-status').value,
    technician_notes: document.getElementById('edit-tech-notes').value.trim()
  };

  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert('অর্ডার সফলভাবে আপডেট হয়েছে!');
      closeEditModal();
      loadAdminDashboardData();
    } else {
      alert(data.error || 'আপডেট ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Update error:', err);
    alert('সার্ভার এরর।');
  }
}

// -------------------------------------------------------------
// DELETE ORDER (ADMIN)
// -------------------------------------------------------------
async function deleteAdminOrder(orderId, orderNumber) {
  if (!confirm(`আপনি কি নিশ্চিত যে আপনি অর্ডার "${orderNumber}" স্থায়ীভাবে মুছে ফেলতে চান?\n\nমুছে ফেললে এই অর্ডারের সমস্ত তথ্য ডেটাবেস থেকে সম্পূর্ণ মুছে যাবে।`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message_bn || 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে');
      await loadAdminStats();
      await loadOverviewOrders();
      await loadAdminOrders();
      if (typeof loadAdminCustomers === 'function') loadAdminCustomers();
    } else {
      alert(data.error || 'অর্ডার মুছতে সমস্যা হয়েছে');
    }
  } catch (err) {
    console.error('Delete order error:', err);
    alert('সার্ভার এরর: অর্ডার মোছা যায়নি');
  }
}
window.deleteAdminOrder = deleteAdminOrder;

async function deleteCurrentEditOrder() {
  if (!currentEditOrderId) return;
  const num = document.getElementById('edit-modal-order-num')?.textContent?.trim() || `#${currentEditOrderId}`;
  closeEditModal();
  await deleteAdminOrder(currentEditOrderId, num);
}
window.deleteCurrentEditOrder = deleteCurrentEditOrder;

// -------------------------------------------------------------
// LIVE REAL-TIME AUTO-SYNC & NOTIFICATION SYSTEM
// -------------------------------------------------------------
let livePollingTimer = null;
let isPollingActive = false;
let lastKnownTotalOrders = null;
let lastKnownLatestOrderId = null;
let lastKnownPendingPickupCount = null;

function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Bell chime 1: High crisp tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Bell chime 2: Clear chime tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.22, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (_) {}
}

function showAdminLiveToast(order) {
  let toastContainer = document.getElementById('admin-live-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'admin-live-toast-container';
    toastContainer.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-3';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-gradient-to-r from-teal-900 to-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-teal-400/60 transform translate-y-[-20px] opacity-0 transition-all duration-300 flex items-start gap-3';
  toast.innerHTML = `
    <div class="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0 text-lg animate-bounce">
      🔔
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h4 class="text-[11px] font-black text-teal-300 uppercase tracking-wider">নতুন অর্ডার আবেদন এসেছে!</h4>
        <span class="text-[9px] text-slate-300 font-mono">এখনই</span>
      </div>
      <p class="text-xs font-bold text-white truncate mt-0.5">${order.customer_name || 'নতুন কাস্টমার'}</p>
      <div class="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
        <span class="font-mono text-teal-200 font-bold">${order.order_number || ''}</span>
        <span>•</span>
        <span class="truncate">${order.brand || ''} ${order.model || ''}</span>
      </div>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white text-sm leading-none p-1 cursor-pointer">✕</button>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-10px]');
    setTimeout(() => toast.remove(), 300);
  }, 6000);
}

async function pollNewOrdersQuietly() {
  if (!adminToken || isPollingActive) return;
  isPollingActive = true;
  try {
    const res = await fetch('/api/admin/orders?status=ALL', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!res.ok) {
      if (res.status === 401) adminLogout();
      return;
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.orders)) {
      const orders = data.orders;
      const count = orders.length;
      const latestOrder = orders[0];
      const latestId = latestOrder ? latestOrder.id : null;
      const pendingCount = orders.filter(o => o.status === 'PENDING_PICKUP').length;

      if (lastKnownTotalOrders === null) {
        lastKnownTotalOrders = count;
        lastKnownLatestOrderId = latestId;
        lastKnownPendingPickupCount = pendingCount;
        return;
      }

      const isNewOrder = (count > lastKnownTotalOrders) || (latestId !== null && latestId !== lastKnownLatestOrderId);
      const isPendingChanged = pendingCount !== lastKnownPendingPickupCount;

      if (isNewOrder) {
        lastKnownTotalOrders = count;
        lastKnownLatestOrderId = latestId;
        lastKnownPendingPickupCount = pendingCount;

        playNewOrderChime();
        if (latestOrder) showAdminLiveToast(latestOrder);

        await loadAdminStats();
        await loadOverviewOrders();
        await loadAdminOrders();
        if (typeof loadAdminCustomers === 'function') loadAdminCustomers();
      } else if (isPendingChanged) {
        lastKnownPendingPickupCount = pendingCount;
        await loadAdminStats();
        await loadOverviewOrders();
      }
    }
  } catch (err) {
    // quiet polling
  } finally {
    isPollingActive = false;
  }
}

function startAdminLivePolling() {
  if (livePollingTimer) clearInterval(livePollingTimer);
  pollNewOrdersQuietly();
  livePollingTimer = setInterval(pollNewOrdersQuietly, 3500);
}

// Cross-tab zero-latency sync with BroadcastChannel and storage events
try {
  if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel('repair_seba_realtime_orders');
    bc.onmessage = async (evt) => {
      if (evt.data && evt.data.type === 'NEW_ORDER') {
        const order = evt.data.order;
        playNewOrderChime();
        if (order) showAdminLiveToast(order);
        await loadAdminStats();
        await loadOverviewOrders();
        await loadAdminOrders();
        if (typeof loadAdminCustomers === 'function') loadAdminCustomers();
      }
    };
  }
} catch (_) {}

window.addEventListener('storage', async (e) => {
  if (e.key === 'repair_seba_last_order_ping') {
    try {
      const parsed = JSON.parse(e.newValue || '{}');
      playNewOrderChime();
      if (parsed.order_number) {
        showAdminLiveToast({ order_number: parsed.order_number, customer_name: parsed.customer_name });
      }
    } catch (_) {}
    await loadAdminStats();
    await loadOverviewOrders();
    await loadAdminOrders();
    if (typeof loadAdminCustomers === 'function') loadAdminCustomers();
  }
});

// -------------------------------------------------------------
// TABS & SERVICES & INQUIRIES
// -------------------------------------------------------------
function switchTab(tab) {
  if (currentAdminProfile && currentAdminProfile.role !== 'superadmin') {
    const isOverviewAllowed = tab === 'overview' && (currentAdminPermissions.includes('orders') || currentAdminPermissions.includes('*'));
    const isCustomersAllowed = tab === 'customers' && (currentAdminPermissions.includes('users') || currentAdminPermissions.includes('orders') || currentAdminPermissions.includes('customers') || currentAdminPermissions.includes('*'));
    if (!currentAdminPermissions.includes(tab) && !currentAdminPermissions.includes('*') && !isOverviewAllowed && !isCustomersAllowed) {
      alert('আপনার এই সেকশনে প্রবেশের অনুমতি নেই।');
      return;
    }
  }
  currentAdminTab = tab;
  ['overview', 'orders', 'customers', 'services', 'inquiries', 'hero', 'footer', 'users'].forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    
    if (t === tab) {
      sec?.classList.remove('hidden');
      btn?.classList.add('bg-[#0f766e]', 'text-white', 'font-bold', 'shadow-md', 'shadow-teal-700/20');
      btn?.classList.remove('text-slate-700', 'hover:bg-slate-100', 'font-medium');
    } else {
      sec?.classList.add('hidden');
      btn?.classList.remove('bg-[#0f766e]', 'text-white', 'font-bold', 'shadow-md', 'shadow-teal-700/20');
      btn?.classList.add('text-slate-700', 'hover:bg-slate-100', 'font-medium');
    }
  });

  const topTitle = document.getElementById('top-bar-title');
  if (topTitle && TAB_TITLES[tab]) {
    topTitle.innerHTML = TAB_TITLES[tab];
  }

  if (tab === 'overview') {
    loadAdminStats();
    loadOverviewOrders();
    loadAdminCustomers();
  }
  if (tab === 'orders') loadAdminOrders();
  if (tab === 'customers') loadAdminCustomers();
  if (tab === 'services') loadAdminServices();
  if (tab === 'inquiries') loadAdminContacts();
  if (tab === 'hero') loadAdminHeroSettings();
  if (tab === 'footer') loadAdminFooterSettings();
  if (tab === 'users') {
    loadAdminUsers();
  }
}

async function createNewDemoOrder() {
  const dummyModels = ['iPhone 13 Pro', 'Samsung Galaxy S22', 'Google Pixel 7', 'iPad Air 5th Gen', 'Xiaomi Redmi Note 12'];
  const dummyNames = ['মুহাম্মদ আব্দুল্লাহ আল মামুন', 'ফাতিমা তুয যোহরা', 'হাফেজ মো: সালমান ফারসী', 'তানভীর আহমেদ', 'আরিফুল ইসলাম'];
  const dummyAreas = ['ধানমন্ডি', 'মিরপুর', 'উত্তরা', 'গুলশান', 'মোহাম্মদপুর'];
  const dummyIssues = [['screen-repair'], ['battery-replacement'], ['charging-port'], ['water-damage']];

  const randomModel = dummyModels[Math.floor(Math.random() * dummyModels.length)];
  const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
  const randomArea = dummyAreas[Math.floor(Math.random() * dummyAreas.length)];
  const randomIssue = dummyIssues[Math.floor(Math.random() * dummyIssues.length)];

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: randomName,
        customer_phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `প্লট #${Math.floor(1 + Math.random() * 50)}, রোড #${Math.floor(1 + Math.random() * 20)}`,
        area: randomArea,
        city: 'Dhaka',
        device_type: randomModel.includes('iPad') ? 'tablet' : 'phone',
        brand: randomModel.split(' ')[0],
        model: randomModel,
        issues: randomIssue,
        issue_description: 'অনলাইন পোর্টাল ডেমো আবেদন টেস্ট',
        preferred_date: new Date().toISOString().split('T')[0],
        preferred_time_slot: 'morning'
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`নতুন ডেমো অর্ডার সফলভাবে যুক্ত হয়েছে!\\nঅর্ডার নম্বর: ${data.order_number}`);
      loadAdminDashboardData();
    } else {
      alert(data.error || 'অর্ডার তৈরি করা যায়নি');
    }
  } catch (err) {
    console.error('Demo order error:', err);
  }
}
window.createNewDemoOrder = createNewDemoOrder;

function toggleMobileSidebar() {
  const sidebar = document.getElementById('admin-floating-sidebar');
  if (sidebar) sidebar.classList.toggle('hidden');
}
window.toggleMobileSidebar = toggleMobileSidebar;


function openAddServiceModal() {
  const form = document.getElementById('admin-service-form');
  if (form) form.reset();
  const idEl = document.getElementById('service-id');
  const codeEl = document.getElementById('service-code');
  if (idEl) idEl.value = '';
  if (codeEl) codeEl.value = '';

  const titleEl = document.getElementById('service-modal-title');
  if (titleEl) titleEl.textContent = 'নতুন সার্ভিস যোগ করুন';

  const btnTextEl = document.getElementById('btn-save-service-text');
  if (btnTextEl) btnTextEl.textContent = 'সার্ভিস সংরক্ষণ করুন';

  const activeEl = document.getElementById('service-is-active');
  if (activeEl) activeEl.checked = true;

  const modal = document.getElementById('admin-service-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function openEditServiceModal(serviceId) {
  const service = adminServicesCache.find(s => s.id === serviceId);
  if (!service) {
    showCenterPopup('ত্রুটি', 'সার্ভিস খুঁজে পাওয়া যায়নি!', '⚠️');
    return;
  }

  const idEl = document.getElementById('service-id');
  const codeEl = document.getElementById('service-code');
  const titleBnEl = document.getElementById('service-title-bn');
  const titleEnEl = document.getElementById('service-title-en');
  const deviceEl = document.getElementById('service-device-type');
  const iconEl = document.getElementById('service-icon');
  const priceEl = document.getElementById('service-price');
  const warrantyEl = document.getElementById('service-warranty-bn');
  const timeEl = document.getElementById('service-time-bn');
  const descBnEl = document.getElementById('service-desc-bn');
  const descEnEl = document.getElementById('service-desc-en');
  const activeEl = document.getElementById('service-is-active');

  if (idEl) idEl.value = service.id;
  if (codeEl) codeEl.value = service.code || '';
  if (titleBnEl) titleBnEl.value = service.title_bn || '';
  if (titleEnEl) titleEnEl.value = service.title_en || '';
  if (deviceEl) deviceEl.value = service.device_type || 'all';
  if (iconEl) iconEl.value = service.icon || 'wrench';
  if (priceEl) priceEl.value = service.starting_price || 0;
  if (warrantyEl) warrantyEl.value = service.warranty_bn || '';
  if (timeEl) timeEl.value = service.estimated_time_bn || '';
  if (descBnEl) descBnEl.value = service.description_bn || '';
  if (descEnEl) descEnEl.value = service.description_en || '';
  if (activeEl) activeEl.checked = service.is_active === 1 || service.is_active === true;

  const titleModalEl = document.getElementById('service-modal-title');
  if (titleModalEl) titleModalEl.textContent = 'সার্ভিস সম্পাদনা করুন';

  const btnTextEl = document.getElementById('btn-save-service-text');
  if (btnTextEl) btnTextEl.textContent = 'পরিবর্তন সংরক্ষণ করুন';

  const modal = document.getElementById('admin-service-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeServiceModal() {
  const modal = document.getElementById('admin-service-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function handleSaveService(event) {
  if (event) event.preventDefault();

  const id = document.getElementById('service-id')?.value;
  const code = document.getElementById('service-code')?.value;
  const title_bn = document.getElementById('service-title-bn')?.value.trim();
  const title_en = document.getElementById('service-title-en')?.value.trim();
  const device_type = document.getElementById('service-device-type')?.value || 'all';
  const icon = document.getElementById('service-icon')?.value || 'wrench';
  const starting_price = parseFloat(document.getElementById('service-price')?.value);
  const warranty_bn = document.getElementById('service-warranty-bn')?.value.trim();
  const estimated_time_bn = document.getElementById('service-time-bn')?.value.trim();
  const description_bn = document.getElementById('service-desc-bn')?.value.trim();
  const description_en = document.getElementById('service-desc-en')?.value.trim();
  const is_active = document.getElementById('service-is-active')?.checked ? 1 : 0;

  if (!title_bn) {
    showCenterPopup('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে সার্ভিসের বাংলা নাম লিখুন।', '⚠️');
    return;
  }
  if (isNaN(starting_price) || starting_price < 0) {
    showCenterPopup('অসম্পূর্ণ তথ্য', 'অনুগ্রহ করে সঠিক প্রারম্ভিক মূল্য দিন।', '⚠️');
    return;
  }

  const payload = {
    code,
    title_bn,
    title_en: title_en || title_bn,
    device_type,
    icon,
    starting_price,
    warranty_bn: warranty_bn || '৯০ দিনের ওয়ারেন্টি',
    warranty_en: warranty_bn || '90 Days Warranty',
    estimated_time_bn: estimated_time_bn || '২-৪ ঘন্টা',
    estimated_time_en: estimated_time_bn || '2-4 Hours',
    description_bn,
    description_en: description_en || description_bn,
    is_active
  };

  const btn = document.getElementById('btn-save-service');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> <span>সংরক্ষণ হচ্ছে...</span>';
  }

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `/api/admin/services/${id}` : '/api/admin/services';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      closeServiceModal();
      await loadAdminServices();
      showCenterPopup('সফল!', isEdit ? 'সার্ভিসটি সফলভাবে আপডেট করা হয়েছে।' : 'নতুন সার্ভিস সফলভাবে যুক্ত করা হয়েছে।', '🎉');
    } else {
      showCenterPopup('ব্যর্থ!', data.message || 'সার্ভিস সংরক্ষণ করতে সমস্যা হয়েছে।', '⚠️');
    }
  } catch (err) {
    console.error('Error saving service:', err);
    showCenterPopup('সার্ভার ত্রুটি', 'সার্ভারে সংযোগ করা সম্ভব হয়নি। আবার চেষ্টা করুন।', '⚠️');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

async function deleteAdminService(serviceId, serviceTitle) {
  if (!confirm(`আপনি কি নিশ্চিত যে "${serviceTitle || 'এই সার্ভিসটি'}" মুছে ফেলতে চান?\nমুছে ফেললে এটি হোমপেজ ও বুকিং ফর্ম থেকেও বাদ পড়বে।`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await loadAdminServices();
      showCenterPopup('মুছে ফেলা হয়েছে', 'সার্ভিসটি সফলভাবে মুছে ফেলা হয়েছে।', '🗑️');
    } else {
      showCenterPopup('ব্যর্থ', data.message || 'সার্ভিস মুছে ফেলা সম্ভব হয়নি।', '⚠️');
    }
  } catch (err) {
    console.error('Error deleting service:', err);
    showCenterPopup('সার্ভার ত্রুটি', 'সার্ভারে সংযোগ করা সম্ভব হয়নি।', '⚠️');
  }
}

async function toggleServiceStatus(serviceId, currentActive) {
  try {
    const nextStatus = currentActive ? 0 : 1;
    const res = await fetch(`/api/admin/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_active: nextStatus })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await loadAdminServices();
    } else {
      showCenterPopup('ব্যর্থ', data.message || 'স্ট্যাটাস পরিবর্তন করা যায়নি।', '⚠️');
    }
  } catch (err) {
    console.error('Error toggling service status:', err);
  }
}

async function loadAdminServices() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/services', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      adminServicesCache = data.services || [];
      const servBadge = document.getElementById('badge-tab-services');
      if (servBadge) servBadge.textContent = `${adminServicesCache.length}টি`;

      if (adminServicesCache.length === 0) {
        container.innerHTML = `
          <div class="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <div class="text-4xl mb-3">🛠️</div>
            <h3 class="text-base font-bold text-slate-800 mb-1">কোনো রিপেয়ার সার্ভিস নেই</h3>
            <p class="text-xs text-slate-500 mb-4">হোমপেজে প্রদর্শনের জন্য নতুন সার্ভিস তৈরি করুন</p>
            <button type="button" onclick="openAddServiceModal()" class="px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs shadow-md transition cursor-pointer">
              + নতুন সার্ভিস যোগ করুন
            </button>
          </div>
        `;
        return;
      }

      const iconMap = {
        'smartphone': '📱', 'battery-charging': '🔋', 'zap': '⚡', 'cpu': '🔬',
        'droplets': '💧', 'camera': '📷', 'volume-2': '🔊', 'tablet': '💻',
        'hard-drive': '💾', 'wrench': '🛠️'
      };

      container.innerHTML = adminServicesCache.map(s => {
        const ico = iconMap[s.icon] || '🛠️';
        const deviceLabel = s.device_type === 'phone' ? '📱 মোবাইল' : s.device_type === 'tablet' ? '💻 ট্যাবলেট' : '📱 ফোন ও ট্যাব';
        const safeTitle = (s.title_bn || '').replace(/'/g, "\\'");

        return `
          <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-teal-500 hover:shadow-md transition group">
            <div>
              <!-- Top Category & Status Toggle -->
              <div class="flex items-center justify-between mb-3.5">
                <span class="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                  ${deviceLabel}
                </span>
                <button type="button" onclick="toggleServiceStatus(${s.id}, ${s.is_active ? 1 : 0})" title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন" class="text-xs px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'}">
                  <span class="w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                  <span>${s.is_active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Off)'}</span>
                </button>
              </div>

              <!-- Icon & Titles -->
              <div class="flex items-start gap-3 mb-3">
                <div class="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-[#0f766e] flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                  ${ico}
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="font-bold text-slate-900 text-base leading-snug">${s.title_bn}</h4>
                  ${s.title_en ? `<p class="text-[11px] text-slate-400 font-medium truncate">${s.title_en}</p>` : ''}
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">${s.description_bn || s.description_en || 'কোনো বিবরণ যোগ করা হয়নি'}</p>
                </div>
              </div>
            </div>

            <div>
              <!-- Price & Warranty Bar -->
              <div class="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 block font-semibold leading-tight">প্রারম্ভিক ফি</span>
                  <span class="text-[#0f766e] font-black text-lg">৳${(s.starting_price || 0).toLocaleString()}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 block font-semibold leading-tight">${s.estimated_time_bn ? `⏱️ ${s.estimated_time_bn}` : 'ওয়ারেন্টি'}</span>
                  <span class="font-bold text-slate-700 text-xs">🛡️ ${s.warranty_bn || '৯০ দিন'}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button type="button" onclick="openEditServiceModal(${s.id})" class="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-[#0f766e] hover:text-white border border-teal-200 text-[#0f766e] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer">
                  <span>✏️</span>
                  <span>সম্পাদনা করুন</span>
                </button>
                <button type="button" onclick="deleteAdminService(${s.id}, '${safeTitle}')" title="সার্ভিস মুছুন" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs transition flex items-center justify-center shadow-2xs cursor-pointer">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error loading services:', err);
  }
}

window.openAddServiceModal = openAddServiceModal;
window.openEditServiceModal = openEditServiceModal;
window.closeServiceModal = closeServiceModal;
window.handleSaveService = handleSaveService;
window.deleteAdminService = deleteAdminService;
window.toggleServiceStatus = toggleServiceStatus;
window.loadAdminServices = loadAdminServices;

async function loadAdminContacts() {
  const container = document.getElementById('admin-contacts-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/contacts', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const inqBadge = document.getElementById('badge-tab-inquiries');
      if (inqBadge && data.contacts) inqBadge.textContent = `${data.contacts.length}টি`;
      if (data.contacts.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">কোনো মেসেজ জমা নেই।</div>`;
        return;
      }
      container.innerHTML = data.contacts.map(c => `
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-900">${c.name} (${c.phone})</span>
            <span class="text-xs text-slate-500">${new Date(c.created_at).toLocaleString('bn-BD')}</span>
          </div>
          <p class="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">${c.message}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading contacts:', err);
  }
}

function printAdminJobSheet(orderId) {
  const order = adminOrdersCache.find(o => o.id === orderId);
  if (!order) return;

  const printable = document.getElementById('printable-receipt');
  if (!printable) return;

  printable.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #0f172a; color: black;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #0284c7; font-size: 24px;">Repair Seba (রিপেয়ার সেবা)</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">Doorstep Smartphone & Tab Repair Platform | Hotline: 01711-002233</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 18px;">OFFICIAL LAB JOB SHEET</h2>
          <p style="margin: 4px 0 0; font-size: 14px; font-weight: bold; color: #0284c7;">ORDER: ${order.order_number}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b;">CUSTOMER DETAILS</h4>
          <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customer_name}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.customer_phone}</p>
          <p style="margin: 4px 0;"><strong>Pickup Address:</strong> ${order.address}, ${order.area}</p>
        </div>
        <div style="background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b;">DEVICE & ISSUES</h4>
          <p style="margin: 4px 0;"><strong>Device:</strong> ${order.brand} ${order.model} (${order.device_type})</p>
          <p style="margin: 4px 0;"><strong>Reported Issues:</strong> ${Array.isArray(order.issues) ? order.issues.join(', ') : order.issues}</p>
          <p style="margin: 4px 0;"><strong>Current Status:</strong> ${order.status}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b;">LAB DIAGNOSTIC & QUOTATION</h4>
        <p style="margin: 4px 0;"><strong>Technician Findings:</strong> ${order.diagnosis_notes || 'Pending Inspection'}</p>
        <p style="margin: 4px 0;"><strong>Estimated / Quoted Cost:</strong> <span style="font-size: 18px; font-weight: bold; color: #0284c7;">৳ ${order.final_cost || order.estimated_cost}</span></p>
        <p style="margin: 4px 0;"><strong>Customer Approval Status:</strong> ${order.quote_status}</p>
        <p style="margin: 4px 0;"><strong>Assigned Rider:</strong> ${order.pickup_agent_name || 'Not assigned'} (${order.pickup_agent_phone || ''})</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #94a3b8; font-size: 12px;">
        <div>
          <p style="margin-bottom: 25px;">_________________________</p>
          <p>Customer Signature</p>
        </div>
        <div>
          <p style="margin-bottom: 25px;">_________________________</p>
          <p>Lab In-charge / Engineer</p>
        </div>
      </div>
    </div>
  `;

  window.print();
}

// -------------------------------------------------------------
// HERO BANNER & BIKE SETTINGS
// -------------------------------------------------------------
async function loadAdminHeroSettings() {
  try {
    const res = await fetch('/api/settings/hero');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;
      
      const showBike = document.getElementById('hero-cfg-show-bike');
      if (showBike) showBike.checked = s.show_bike !== false;

      const showAnim = document.getElementById('hero-cfg-show-anim');
      if (showAnim) showAnim.checked = s.show_animation !== false;

      const showTags = document.getElementById('hero-cfg-show-tags');
      if (showTags) showTags.checked = s.show_tags !== false;

      // Bike size radio
      const sizeRadio = document.querySelector(`input[name="hero_bike_size"][value="${s.bike_size || 'normal'}"]`);
      if (sizeRadio) sizeRadio.checked = true;

      // Bike speed radio
      const speedRadio = document.querySelector(`input[name="hero_bike_speed"][value="${s.bike_speed || 'normal'}"]`);
      if (speedRadio) speedRadio.checked = true;

      // Texts
      const badgeInput = document.getElementById('hero-cfg-badge-text');
      if (badgeInput && s.badge_text) badgeInput.value = s.badge_text;

      const titleInput = document.getElementById('hero-cfg-title-text');
      if (titleInput && s.title_text) titleInput.value = s.title_text;

      const subtitleInput = document.getElementById('hero-cfg-subtitle-text');
      if (subtitleInput && s.subtitle_text) subtitleInput.value = s.subtitle_text;

      // Stats
      const s1Num = document.getElementById('hero-cfg-stat1-num');
      const s1Lbl = document.getElementById('hero-cfg-stat1-lbl');
      if (s1Num && s.stat_1_num) s1Num.value = s.stat_1_num;
      if (s1Lbl && s.stat_1_lbl) s1Lbl.value = s.stat_1_lbl;

      const s2Num = document.getElementById('hero-cfg-stat2-num');
      const s2Lbl = document.getElementById('hero-cfg-stat2-lbl');
      if (s2Num && s.stat_2_num) s2Num.value = s.stat_2_num;
      if (s2Lbl && s.stat_2_lbl) s2Lbl.value = s.stat_2_lbl;

      const s3Num = document.getElementById('hero-cfg-stat3-num');
      const s3Lbl = document.getElementById('hero-cfg-stat3-lbl');
      if (s3Num && s.stat_3_num) s3Num.value = s.stat_3_num;
      if (s3Lbl && s.stat_3_lbl) s3Lbl.value = s.stat_3_lbl;
    }
  } catch (err) {
    console.error('Failed to load hero banner settings:', err);
  }
}

async function saveAdminHeroSettings() {
  const saveBtn = document.getElementById('btn-save-hero');
  const originalHtml = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>⏳</span> সংরক্ষণ হচ্ছে...';
  }

  try {
    const showBike = document.getElementById('hero-cfg-show-bike')?.checked;
    const showAnim = document.getElementById('hero-cfg-show-anim')?.checked;
    const showTags = document.getElementById('hero-cfg-show-tags')?.checked;
    const bikeSize = document.querySelector('input[name="hero_bike_size"]:checked')?.value || 'normal';
    const bikeSpeed = document.querySelector('input[name="hero_bike_speed"]:checked')?.value || 'normal';

    const badgeText = document.getElementById('hero-cfg-badge-text')?.value.trim();
    const titleText = document.getElementById('hero-cfg-title-text')?.value.trim();
    const subtitleText = document.getElementById('hero-cfg-subtitle-text')?.value.trim();

    const stat1Num = document.getElementById('hero-cfg-stat1-num')?.value.trim();
    const stat1Lbl = document.getElementById('hero-cfg-stat1-lbl')?.value.trim();
    const stat2Num = document.getElementById('hero-cfg-stat2-num')?.value.trim();
    const stat2Lbl = document.getElementById('hero-cfg-stat2-lbl')?.value.trim();
    const stat3Num = document.getElementById('hero-cfg-stat3-num')?.value.trim();
    const stat3Lbl = document.getElementById('hero-cfg-stat3-lbl')?.value.trim();

    const payload = {
      show_bike: Boolean(showBike),
      show_animation: Boolean(showAnim),
      show_tags: Boolean(showTags),
      bike_size: bikeSize,
      bike_speed: bikeSpeed,
      badge_text: badgeText || '✨ বাংলাদেশে প্রথম ডিজিটাল ডোরস্টেপ রিপেয়ার সেবা',
      title_text: titleText || 'ঘরে বসেই নষ্ট ফোন ও ট্যাব মেরামত করুন',
      subtitle_text: subtitleText || 'আপনার ঠিকানায় গিয়ে নষ্ট ফোন বা ট্যাব সংগ্রহ করব, ল্যাবে পরীক্ষা করে খরচের হিসাব জানাব। আপনি রাজি হলে মেরামত করে আবার আপনার ঠিকানায় পৌঁছে দেব!',
      stat_1_num: stat1Num || '১৫,০০০+',
      stat_1_lbl: stat1Lbl || 'মেরামতকৃত ডিভাইস',
      stat_2_num: stat2Num || '৯০-১৮০ দিন',
      stat_2_lbl: stat2Lbl || 'সার্ভিস ওয়ারেন্টি',
      stat_3_num: stat3Num || 'ফ্রি পিকআপ',
      stat_3_lbl: stat3Lbl || 'ও ডোরস্টেপ ড্রপ'
    };

    const res = await fetch('/api/admin/settings/hero', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ হিরো ব্যানার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে! ওয়েবসাইটে এটি আপডেট হয়ে গেছে।');
    } else {
      alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Save error:', err);
    alert('সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
    }
  }
}

function resetAdminHeroSettings() {
  if (!confirm('আপনি কি হিরো ব্যানারের সেটিংস ডিফল্ট মানে রিসেট করতে চান?')) return;

  const showBike = document.getElementById('hero-cfg-show-bike');
  if (showBike) showBike.checked = true;

  const showAnim = document.getElementById('hero-cfg-show-anim');
  if (showAnim) showAnim.checked = true;

  const showTags = document.getElementById('hero-cfg-show-tags');
  if (showTags) showTags.checked = true;

  const sizeRadio = document.querySelector('input[name="hero_bike_size"][value="normal"]');
  if (sizeRadio) sizeRadio.checked = true;

  const speedRadio = document.querySelector('input[name="hero_bike_speed"][value="normal"]');
  if (speedRadio) speedRadio.checked = true;

  const badgeInput = document.getElementById('hero-cfg-badge-text');
  if (badgeInput) badgeInput.value = '✨ বাংলাদেশে প্রথম ডিজিটাল ডোরস্টেপ রিপেয়ার সেবা';

  const titleInput = document.getElementById('hero-cfg-title-text');
  if (titleInput) titleInput.value = 'ঘরে বসেই নষ্ট ফোন ও ট্যাব মেরামত করুন';

  const subtitleInput = document.getElementById('hero-cfg-subtitle-text');
  if (subtitleInput) subtitleInput.value = 'আপনার ঠিকানায় গিয়ে নষ্ট ফোন বা ট্যাব সংগ্রহ করব, ল্যাবে পরীক্ষা করে খরচের হিসাব জানাব। আপনি রাজি হলে মেরামত করে আবার আপনার ঠিকানায় পৌঁছে দেব!';

  const s1Num = document.getElementById('hero-cfg-stat1-num');
  const s1Lbl = document.getElementById('hero-cfg-stat1-lbl');
  if (s1Num) s1Num.value = '১৫,০০০+';
  if (s1Lbl) s1Lbl.value = 'মেরামতকৃত ডিভাইস';

  const s2Num = document.getElementById('hero-cfg-stat2-num');
  const s2Lbl = document.getElementById('hero-cfg-stat2-lbl');
  if (s2Num) s2Num.value = '৯০-১৮০ দিন';
  if (s2Lbl) s2Lbl.value = 'সার্ভিস ওয়ারেন্টি';

  const s3Num = document.getElementById('hero-cfg-stat3-num');
  const s3Lbl = document.getElementById('hero-cfg-stat3-lbl');
  if (s3Num) s3Num.value = 'ফ্রি পিকআপ';
  if (s3Lbl) s3Lbl.value = 'ও ডোরস্টেপ ড্রপ';

  saveAdminHeroSettings();
}

// -------------------------------------------------------------
// OFFICE & FOOTER CONTACT SETTINGS (ADMIN)
// -------------------------------------------------------------
// FOOTER MANAGEMENT (ADMIN)
// -------------------------------------------------------------
async function loadAdminFooterSettings() {
  try {
    const res = await fetch('/api/settings/footer');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
      };

      setVal('footer-cfg-office-name', s.office_name || '');
      setVal('footer-cfg-office-hours', s.office_hours || '');
      setVal('footer-cfg-office-address', s.office_address || '');
      setVal('footer-cfg-office-coverage', s.office_coverage || '');

      setVal('footer-cfg-phone-primary', s.phone_primary || '');
      setVal('footer-cfg-phone-secondary', s.phone_secondary || '');
      setVal('footer-cfg-whatsapp-number', s.whatsapp_number || '');
      setVal('footer-cfg-whatsapp-url', s.whatsapp_url || '');
      setVal('footer-cfg-email', s.email || '');

      setVal('footer-cfg-fb-url', s.facebook_url || '');
      setVal('footer-cfg-yt-url', s.youtube_url || '');
      setVal('footer-cfg-ig-url', s.instagram_url || '');
      setVal('footer-cfg-li-url', s.linkedin_url || '');

      setVal('footer-cfg-brand-desc', s.brand_desc || '');
      setVal('footer-cfg-copyright', s.copyright_text || '');

      const showSocial = document.getElementById('footer-cfg-show-social');
      if (showSocial) showSocial.checked = s.show_social !== false;

      const showTrust = document.getElementById('footer-cfg-show-trust');
      if (showTrust) showTrust.checked = s.show_trust_badge !== false;
    }
  } catch (err) {
    console.error('Failed to load footer settings:', err);
  }
}

async function saveAdminFooterSettings(e) {
  if (e && e.preventDefault) e.preventDefault();
  const saveBtn = document.getElementById('btn-save-footer');
  const originalHtml = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>⏳</span> সংরক্ষণ হচ্ছে...';
  }

  try {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const showSocial = document.getElementById('footer-cfg-show-social')?.checked;
    const showTrust = document.getElementById('footer-cfg-show-trust')?.checked;

    const payload = {
      office_name: getVal('footer-cfg-office-name'),
      office_hours: getVal('footer-cfg-office-hours'),
      office_address: getVal('footer-cfg-office-address'),
      office_coverage: getVal('footer-cfg-office-coverage'),
      phone_primary: getVal('footer-cfg-phone-primary'),
      phone_secondary: getVal('footer-cfg-phone-secondary'),
      whatsapp_number: getVal('footer-cfg-whatsapp-number'),
      whatsapp_url: getVal('footer-cfg-whatsapp-url'),
      email: getVal('footer-cfg-email'),
      facebook_url: getVal('footer-cfg-fb-url'),
      youtube_url: getVal('footer-cfg-yt-url'),
      instagram_url: getVal('footer-cfg-ig-url'),
      linkedin_url: getVal('footer-cfg-li-url'),
      brand_desc: getVal('footer-cfg-brand-desc'),
      copyright_text: getVal('footer-cfg-copyright'),
      show_social: Boolean(showSocial),
      show_trust_badge: Boolean(showTrust)
    };

    const res = await fetch('/api/admin/settings/footer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ ফুটার ম্যানেজমেন্ট কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে! ওয়েবসাইটের ফুটারে এটি তৎক্ষণাৎ আপডেট হয়ে গেছে।');
    } else {
      alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Save footer settings error:', err);
    alert('সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
    }
  }
}

function resetAdminFooterSettings() {
  if (!confirm('আপনি কি ফুটার সেটিংস ডিফল্ট মানে রিসেট করতে চান?')) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('footer-cfg-office-name', 'হেড অফিস ও সেন্ট্রাল ল্যাব:');
  setVal('footer-cfg-office-hours', 'প্রতিদিন সকাল ৯:০০ - রাত ৯:০০ (শুক্রবারসহ সার্বক্ষণিক সহায়তা)');
  setVal('footer-cfg-office-address', 'লেভেল ৪, প্লট ১২, রোড ৭, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ।');
  setVal('footer-cfg-office-coverage', 'ঢাকা মহানগরের সকল থানা ও এরিয়া সরাসরি আওতাভুক্ত।');

  setVal('footer-cfg-phone-primary', '০১৭১১-০০২২৩৩');
  setVal('footer-cfg-phone-secondary', '০১৮২২-৩৩৪৪৫৫');
  setVal('footer-cfg-whatsapp-number', '০১৭১১-০০২২৩৩');
  setVal('footer-cfg-whatsapp-url', 'https://wa.me/8801711002233');
  setVal('footer-cfg-email', 'support@repairseba.com');

  setVal('footer-cfg-fb-url', 'https://facebook.com/repairseba');
  setVal('footer-cfg-yt-url', 'https://youtube.com/@repairseba');
  setVal('footer-cfg-ig-url', 'https://instagram.com/repairseba');
  setVal('footer-cfg-li-url', 'https://linkedin.com/company/repairseba');

  setVal('footer-cfg-brand-desc', 'বাংলাদেশের প্রথম ডিজিটাল ডোরস্টেপ গ্যাজেট রিপেয়ার প্ল্যাটফর্ম। আপনার বাসা বা অফিস থেকে ডিভাইস সংগ্রহ করে ল্যাব টেস্ট ও দ্রুততম সময়ে ওয়ারেন্টিসহ মেরামত ডেলিভারি দেওয়া হয়।');
  setVal('footer-cfg-copyright', '© ২০২৬ রিপেয়ার সেবা (Repair Seba). সর্বস্বত্ব সংরক্ষিত। একটি বিশ্বস্ত ডিজিটাল ডোরস্টেপ সার্ভিস।');

  const showSocial = document.getElementById('footer-cfg-show-social');
  if (showSocial) showSocial.checked = true;

  const showTrust = document.getElementById('footer-cfg-show-trust');
  if (showTrust) showTrust.checked = true;

  saveAdminFooterSettings();
}

// -------------------------------------------------------------
// ADMIN PROFILE (TOP HEADER CAPSULE) MANAGEMENT
// -------------------------------------------------------------
function openAdminProfileModal() {
  if (!currentAdminProfile) return;
  const nameInp = document.getElementById('my-profile-name');
  const userInp = document.getElementById('my-profile-username');
  const avatarInp = document.getElementById('my-profile-avatar-url');
  const phoneInp = document.getElementById('my-profile-phone');
  const emailInp = document.getElementById('my-profile-email');
  const pwdInp = document.getElementById('my-profile-new-password');

  if (nameInp) nameInp.value = currentAdminProfile.name || '';
  if (userInp) userInp.value = `@${currentAdminProfile.username || 'admin'}`;
  if (avatarInp) avatarInp.value = currentAdminProfile.avatar || '';
  if (phoneInp) phoneInp.value = currentAdminProfile.phone || '';
  if (emailInp) emailInp.value = currentAdminProfile.email || '';
  if (pwdInp) pwdInp.value = '';

  previewMyProfileAvatar(currentAdminProfile.avatar || '');
  document.getElementById('admin-profile-modal')?.classList.remove('hidden');
}

function closeAdminProfileModal() {
  document.getElementById('admin-profile-modal')?.classList.add('hidden');
}

function previewMyProfileAvatar(url) {
  const img = document.getElementById('my-profile-avatar-preview');
  const initial = document.getElementById('my-profile-initial-preview');
  if (url && url.trim() !== '') {
    if (img) {
      img.src = url.trim();
      img.classList.remove('hidden');
    }
    if (initial) initial.classList.add('hidden');
  } else {
    if (img) img.classList.add('hidden');
    if (initial) {
      initial.textContent = (currentAdminProfile?.name || 'প্র')[0].toUpperCase();
      initial.classList.remove('hidden');
    }
  }
}

function compressAndCropSquareImage(file, callback) {
  if (!file || !file.type.startsWith('image/')) {
    alert('অনুগ্রহ করে একটি সঠিক ছবি (JPG, PNG ইত্যাদি) নির্বাচন করুন।');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 256;
      let width = img.width;
      let height = img.height;

      // Center crop square
      let sx = 0, sy = 0, sSize = Math.min(width, height);
      if (width > height) {
        sx = (width - height) / 2;
      } else {
        sy = (height - width) / 2;
      }

      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, MAX_SIZE, MAX_SIZE);

      const base64Url = canvas.toDataURL('image/jpeg', 0.85);
      callback(base64Url);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAdminProfileFileUpload(inputEl) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  compressAndCropSquareImage(file, (base64Url) => {
    const avatarInput = document.getElementById('my-profile-avatar-url');
    if (avatarInput) avatarInput.value = base64Url;
    previewMyProfileAvatar(base64Url);

    const statusEl = document.getElementById('admin-profile-file-status');
    if (statusEl) {
      statusEl.classList.remove('hidden');
      setTimeout(() => statusEl.classList.add('hidden'), 3500);
    }
  });
}

function handleTeamUserFileUpload(inputEl) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  compressAndCropSquareImage(file, (base64Url) => {
    const avatarInput = document.getElementById('manage-user-avatar');
    if (avatarInput) avatarInput.value = base64Url;
  });
}

function setMyAvatarPreset(url) {
  const inp = document.getElementById('my-profile-avatar-url');
  if (inp) inp.value = url;
  const fileInput = document.getElementById('admin-profile-file-input');
  if (fileInput) fileInput.value = '';
  previewMyProfileAvatar(url);
}

async function handleSaveOwnProfile(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('my-profile-name')?.value.trim();
  const avatar = document.getElementById('my-profile-avatar-url')?.value.trim();
  const phone = document.getElementById('my-profile-phone')?.value.trim();
  const email = document.getElementById('my-profile-email')?.value.trim();
  const password = document.getElementById('my-profile-new-password')?.value.trim();
  const btn = document.getElementById('btn-save-my-profile');

  if (!name) {
    alert('অনুগ্রহ করে আপনার নাম দিন।');
    return false;
  }
  if (password && password.length < 6) {
    alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    return false;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'সংরক্ষণ হচ্ছে...';
  }

  try {
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name, avatar, phone, email, password })
    });
    const data = await res.json();
    if (data.success) {
      alert('আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      updateHeaderProfileUI(data.admin);
      closeAdminProfileModal();
      loadAdminUsers();
    } else {
      alert(data.error || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Update profile error:', err);
    alert('সার্ভার এরর। আবার চেষ্টা করুন।');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'পরিবর্তন সংরক্ষণ করুন';
    }
  }
  return false;
}

// -------------------------------------------------------------
// USER ROLES & PERMISSIONS MANAGEMENT (TAB-USERS)
// -------------------------------------------------------------
let cachedAdminUsers = [];

async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500">ইউজার তালিকা লোড হচ্ছে...</td></tr>`;

  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      cachedAdminUsers = data.users;
      renderAdminUsersTable(data.users);
      const badge = document.getElementById('badge-users-count');
      if (badge) badge.textContent = `${data.users.length} জন`;
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-rose-500">${data.error}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading users:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-rose-500">ইউজার লোড করতে সমস্যা হয়েছে।</td></tr>`;
  }
}

function handleSearchAdminUsers(term) {
  const q = (term || '').toLowerCase().trim();
  if (!q) {
    renderAdminUsersTable(cachedAdminUsers);
    return;
  }
  const filtered = cachedAdminUsers.filter(u => 
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.username && u.username.toLowerCase().includes(q)) ||
    (u.phone && u.phone.includes(q)) ||
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.role && u.role.toLowerCase().includes(q))
  );
  renderAdminUsersTable(filtered);
}

function renderAdminUsersTable(users) {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500 font-medium">কোনো ইউজার পাওয়া যায়নি।</td></tr>`;
    return;
  }

  const roleLabels = {
    'superadmin': { label: 'সুপার অ্যাডমিন', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    'manager': { label: 'অপারেশন ম্যানেজার', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    'technician': { label: 'ল্যাব টেকনিশিয়ান', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    'support': { label: 'সাপোর্ট ও রাইডার', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    'admin': { label: 'অ্যাডমিন', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    'custom': { label: 'কাস্টম স্টাফ', color: 'bg-slate-100 text-slate-800 border-slate-300' }
  };

  const permBadges = {
    'orders': { label: '📦 অর্ডার ও কোটেশন', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    'services': { label: '🛠️ সার্ভিস প্রাইসিং', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    'inquiries': { label: '💬 কাস্টমার মেসেজ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    'hero': { label: '🎨 হিরো ব্যানার', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'footer': { label: '🏢 ফুটার সেটিংস', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    'users': { label: '👤 প্রোফাইল কন্ট্রোল', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  };

  tbody.innerHTML = users.map(u => {
    const rInfo = roleLabels[u.role] || { label: u.role, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    const avatarHtml = u.avatar && u.avatar.trim() !== ''
      ? `<img src="${u.avatar}" alt="${u.name}" class="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0">`
      : `<div class="w-9 h-9 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-xs shrink-0">${(u.name || u.username)[0].toUpperCase()}</div>`;

    const permsList = Array.isArray(u.permissions) ? u.permissions : [];
    const permsPills = u.role === 'superadmin' || permsList.includes('*')
      ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">⭐ সর্বময় অ্যাক্সেস (All Options)</span>`
      : permsList.map(p => {
          const pb = permBadges[p] || { label: p, color: 'bg-slate-100 text-slate-700 border-slate-200' };
          return `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold ${pb.color} border">${pb.label}</span>`;
        }).join(' ');

    const canDelete = u.username !== 'admin' && u.id !== 1;

    return `
      <tr class="hover:bg-slate-50/80 transition text-xs">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            ${avatarHtml}
            <div>
              <div class="font-bold text-slate-900">${u.name}</div>
              <div class="text-[10px] text-slate-500">${u.phone || 'ফোন নেই'}${u.email ? ` • ${u.email}` : ''}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono font-bold text-slate-700">
          @${u.username}
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${rInfo.color} border">
            ${rInfo.label}
          </span>
        </td>
        <td class="py-3 px-4">
          <div class="flex flex-wrap gap-1 max-w-[320px]">
            ${permsPills || '<span class="text-slate-400 text-[10px]">কোনো পারমিশন নেই</span>'}
          </div>
        </td>
        <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
          <button onclick="openEditUserModal(${u.id})" class="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] transition">
            ✏️ এডিট ও পারমিশন
          </button>
          ${canDelete ? `
            <button onclick="deleteAdminUser(${u.id}, '${u.username}')" class="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition">
              🗑️ ডিলিট
            </button>
          ` : `
            <span class="px-2 py-1 text-[10px] text-slate-400 font-medium">প্রধান অ্যাডমিন</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function applyPresetPermissions(preset) {
  const permMap = {
    'all': ['orders', 'services', 'inquiries', 'hero', 'footer', 'users'],
    'manager': ['orders', 'services', 'inquiries'],
    'technician': ['orders', 'services'],
    'support': ['orders', 'inquiries'],
    'none': []
  };
  const target = permMap[preset] || [];
  ['orders', 'services', 'inquiries', 'hero', 'footer', 'users'].forEach(p => {
    const chk = document.getElementById(`perm-${p}`);
    if (chk) chk.checked = target.includes(p);
  });
}

function handleRolePresetChange(role) {
  if (role === 'superadmin') {
    applyPresetPermissions('all');
  } else if (role === 'manager') {
    applyPresetPermissions('manager');
  } else if (role === 'technician') {
    applyPresetPermissions('technician');
  } else if (role === 'support') {
    applyPresetPermissions('support');
  }
}

function openCreateUserModal() {
  document.getElementById('manage-user-id').value = '';
  document.getElementById('user-modal-title').textContent = 'নতুন প্রোফাইল তৈরি ও অপশন পারমিশন কন্ট্রোল';
  document.getElementById('manage-user-name').value = '';
  document.getElementById('manage-user-username').value = '';
  document.getElementById('manage-user-username').disabled = false;
  document.getElementById('manage-user-password').value = '';
  document.getElementById('manage-user-password').required = true;
  document.getElementById('manage-user-pwd-hint').classList.add('hidden');
  document.getElementById('manage-user-phone').value = '';
  document.getElementById('manage-user-email').value = '';
  document.getElementById('manage-user-avatar').value = '';
  document.getElementById('manage-user-role').value = 'manager';

  applyPresetPermissions('manager');

  document.getElementById('admin-user-modal')?.classList.remove('hidden');
}

function openEditUserModal(userId) {
  const u = cachedAdminUsers.find(x => x.id === userId);
  if (!u) return;

  document.getElementById('manage-user-id').value = u.id;
  document.getElementById('user-modal-title').textContent = `প্রোফাইল ও পারমিশন সম্পাদনা (@${u.username})`;
  document.getElementById('manage-user-name').value = u.name || '';
  document.getElementById('manage-user-username').value = u.username;
  document.getElementById('manage-user-username').disabled = true; // username cannot change
  document.getElementById('manage-user-password').value = '';
  document.getElementById('manage-user-password').required = false;
  document.getElementById('manage-user-pwd-hint').classList.remove('hidden');
  document.getElementById('manage-user-phone').value = u.phone || '';
  document.getElementById('manage-user-email').value = u.email || '';
  document.getElementById('manage-user-avatar').value = u.avatar || '';
  document.getElementById('manage-user-role').value = u.role || 'manager';

  const perms = Array.isArray(u.permissions) ? u.permissions : [];
  ['orders', 'services', 'inquiries', 'hero', 'footer', 'users'].forEach(p => {
    const chk = document.getElementById(`perm-${p}`);
    if (chk) chk.checked = perms.includes(p) || perms.includes('*') || u.role === 'superadmin';
  });

  document.getElementById('admin-user-modal')?.classList.remove('hidden');
}

function closeUserModal() {
  document.getElementById('admin-user-modal')?.classList.add('hidden');
}

function toggleAllPermissions(checked) {
  document.querySelectorAll('.user-perm-checkbox').forEach(chk => {
    chk.checked = checked;
  });
}

async function handleSaveAdminUser(e) {
  if (e && e.preventDefault) e.preventDefault();
  const userId = document.getElementById('manage-user-id')?.value;
  const name = document.getElementById('manage-user-name')?.value.trim();
  const username = document.getElementById('manage-user-username')?.value.trim();
  const password = document.getElementById('manage-user-password')?.value.trim();
  const role = document.getElementById('manage-user-role')?.value;
  const phone = document.getElementById('manage-user-phone')?.value.trim();
  const email = document.getElementById('manage-user-email')?.value.trim();
  const avatar = document.getElementById('manage-user-avatar')?.value.trim();
  const btn = document.getElementById('btn-save-admin-user');

  const selectedPerms = [];
  document.querySelectorAll('.user-perm-checkbox:checked').forEach(chk => {
    selectedPerms.push(chk.value);
  });

  if (!name || (!userId && !username)) {
    alert('অনুগ্রহ করে নাম এবং ইউজারনেম পূরণ করুন।');
    return false;
  }
  if (!userId && (!password || password.length < 6)) {
    alert('নতুন ইউজারের পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    return false;
  }

  const payload = {
    name,
    username,
    role,
    phone,
    email,
    avatar,
    permissions: selectedPerms
  };
  if (password && password.length >= 6) {
    payload.password = password;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'সংরক্ষণ হচ্ছে...';
  }

  try {
    const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';
    const method = userId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert(userId ? 'ইউজার প্রোফাইল ও পারমিশন সফলভাবে আপডেট হয়েছে!' : 'নতুন প্রোফাইল সফলভাবে তৈরি হয়েছে!');
      closeUserModal();
      loadAdminUsers();
    } else {
      alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Save user error:', err);
    alert('সার্ভার এরর। আবার চেষ্টা করুন।');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'সংরক্ষণ করুন (Save Profile)';
    }
  }
  return false;
}

async function deleteAdminUser(userId, username) {
  if (!confirm(`আপনি কি নিশ্চিত যে @${username} ইউজার অ্যাকাউন্টটি মুছে ফেলতে চান?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      alert('ইউজার প্রোফাইল মুছে ফেলা হয়েছে।');
      loadAdminUsers();
    } else {
      alert(data.error || 'মুছে ফেলা যায়নি।');
    }
  } catch (err) {
    console.error('Delete user error:', err);
    alert('সার্ভার এরর।');
  }
}

// Window attachments for inline event handlers
window.openAdminProfileModal = openAdminProfileModal;
window.closeAdminProfileModal = closeAdminProfileModal;
window.previewMyProfileAvatar = previewMyProfileAvatar;
window.setMyAvatarPreset = setMyAvatarPreset;
window.handleSaveOwnProfile = handleSaveOwnProfile;
window.loadAdminUsers = loadAdminUsers;
window.handleSearchAdminUsers = handleSearchAdminUsers;
window.applyPresetPermissions = applyPresetPermissions;
window.handleRolePresetChange = handleRolePresetChange;
window.openCreateUserModal = openCreateUserModal;
window.openEditUserModal = openEditUserModal;
window.closeUserModal = closeUserModal;
window.toggleAllPermissions = toggleAllPermissions;
window.handleSaveAdminUser = handleSaveAdminUser;
window.deleteAdminUser = deleteAdminUser;

// -------------------------------------------------------------
// REGISTERED WEBSITE CUSTOMERS MANAGEMENT (SUBTAB)
// -------------------------------------------------------------
let cachedAdminCustomers = [];

function switchUserSubTab(subtab) {
  if (subtab === 'customers') {
    switchTab('customers');
    return;
  }
  loadAdminUsers();
}

async function loadAdminCustomers() {
  const tbody = document.getElementById('admin-customers-table-body');
  const refreshIcon = document.getElementById('cust-refresh-icon');
  if (refreshIcon) refreshIcon.classList.add('animate-spin');

  if (tbody && (!cachedAdminCustomers || cachedAdminCustomers.length === 0)) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500 font-medium">গ্রাহক তালিকা লোড হচ্ছে...</td></tr>`;
  }

  try {
    const res = await fetch('/api/admin/customers', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      cachedAdminCustomers = data.customers || [];
      renderAdminCustomersTable(cachedAdminCustomers);

      // Update counters
      const totalCount = cachedAdminCustomers.length;
      const orderedCount = cachedAdminCustomers.filter(c => (c.total_orders || 0) > 0).length;
      
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentCount = cachedAdminCustomers.filter(c => c.created_at && new Date(c.created_at).getTime() > oneWeekAgo).length;

      const badgeSidebar = document.getElementById('badge-sidebar-customers');
      if (badgeSidebar) badgeSidebar.textContent = totalCount;

      const badgeCount = document.getElementById('badge-customers-count');
      if (badgeCount) badgeCount.textContent = `${totalCount} জন`;

      const statTotal = document.getElementById('cust-stat-total');
      if (statTotal) statTotal.textContent = totalCount;

      const statOrdered = document.getElementById('cust-stat-ordered');
      if (statOrdered) statOrdered.textContent = orderedCount;

      const statRecent = document.getElementById('cust-stat-recent');
      if (statRecent) statRecent.textContent = recentCount;
    } else {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-rose-500">${data.error}</td></tr>`;
    }
  } catch (err) {
    console.error('Error loading customers:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-rose-500">গ্রাহক তালিকা লোড করতে সমস্যা হয়েছে।</td></tr>`;
  } finally {
    if (refreshIcon) {
      setTimeout(() => refreshIcon.classList.remove('animate-spin'), 400);
    }
  }
}

function renderAdminCustomersTable(customers) {
  const tbody = document.getElementById('admin-customers-table-body');
  if (!tbody) return;

  if (!customers || customers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-12 text-slate-500">
          <div class="flex flex-col items-center justify-center gap-2">
            <span class="text-3xl">👥</span>
            <div class="font-bold text-slate-700">কোনো নিবন্ধিত গ্রাহক পাওয়া যায়নি</div>
            <p class="text-xs text-slate-400 max-w-sm">গ্রাহকরা ওয়েবসাইট থেকে একাউন্ট তৈরি করলে বা অর্ডার প্লেস করলে তাদের বিবরণ এখানে দেখা যাবে।</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = customers.map(c => {
    const initial = (c.name || 'গ').charAt(0).toUpperCase();
    const avatarHtml = c.avatar && c.avatar.trim() 
      ? `<img src="${c.avatar}" alt="${c.name || 'গ্রাহক'}" class="w-full h-full object-cover">`
      : `<span class="font-bold text-xs">${initial}</span>`;
    
    let dateStr = 'অজানা';
    let timeStr = '';
    if (c.created_at) {
      const d = new Date(c.created_at);
      dateStr = d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
      timeStr = d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    }
    const totalOrders = c.total_orders || 0;

    const displayArea = c.area || c.address || 'ঠিকানা নেই';
    const displayDetails = c.area && c.address && c.area !== c.address ? c.address : (c.city || '');
    const fullAddressTooltip = [c.address, c.area, c.city].filter(Boolean).join(', ') || 'ঠিকানা দেওয়া হয়নি';

    return `
      <tr class="hover:bg-slate-50/90 transition text-slate-800 text-xs">
        
        <!-- 1. Avatar & Name -->
        <td class="py-2.5 px-2.5 sm:px-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="relative w-8 h-8 rounded-full overflow-hidden bg-[#0f766e] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-teal-300 shadow-2xs cursor-pointer group" onclick="openCustomerDetailsModal(${c.id})" title="প্রোফাইল দেখতে ক্লিক করুন">
              ${avatarHtml}
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-bold text-slate-900 hover:text-teal-700 cursor-pointer truncate" onclick="openCustomerDetailsModal(${c.id})" title="${c.name || 'সম্মানিত গ্রাহক'}">
                ${c.name || 'সম্মানিত গ্রাহক'}
              </div>
              <div class="text-[10px] text-teal-800 font-medium font-mono">#RS-C${c.id}</div>
            </div>
          </div>
        </td>

        <!-- 2. Phone Number -->
        <td class="py-2.5 px-2.5 sm:px-3">
          <div class="flex items-center gap-1.5 font-mono font-bold text-slate-900">
            <a href="tel:${c.phone}" class="hover:text-teal-700 hover:underline truncate" title="কল করুন">
              ${c.phone}
            </a>
            <button onclick="navigator.clipboard.writeText('${c.phone}'); alert('ফোন নম্বর কপি করা হয়েছে: ${c.phone}');" class="text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer text-[11px]" title="নম্বর কপি করুন">
              📋
            </button>
          </div>
        </td>

        <!-- 3. Email -->
        <td class="py-2.5 px-2.5 sm:px-3">
          <div class="truncate text-slate-600 font-sans" title="${c.email || ''}">
            ${c.email ? `<span class="font-medium text-slate-800">${c.email}</span>` : `<span class="text-slate-400 italic text-[11px]">দেওয়া হয়নি</span>`}
          </div>
        </td>

        <!-- 4. Address & Area -->
        <td class="py-2.5 px-2.5 sm:px-3">
          <div class="text-xs min-w-0" title="${fullAddressTooltip}">
            <div class="font-medium text-slate-800 truncate">
              📍 ${displayArea}
            </div>
            ${displayDetails ? `<div class="text-[10px] text-slate-400 truncate">${displayDetails}</div>` : ''}
          </div>
        </td>

        <!-- 5. Total Orders -->
        <td class="py-2.5 px-2.5 sm:px-3 text-center">
          <button onclick="openCustomerDetailsModal(${c.id})" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${totalOrders > 0 ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}" title="অর্ডার দেখতে ক্লিক করুন">
            ${totalOrders}টি অর্ডার
          </button>
        </td>

        <!-- 6. Registration Date & Time -->
        <td class="py-2.5 px-2.5 sm:px-3">
          <div class="text-[11px] font-medium text-slate-800 whitespace-nowrap">${dateStr}</div>
          <div class="text-[10px] text-slate-400 whitespace-nowrap">${timeStr}</div>
        </td>

        <!-- 7. Actions (Only Edit icon and Delete icon) -->
        <td class="py-2.5 px-2.5 sm:px-3 text-center">
          <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
            <button onclick="openCustomerEditModal(${c.id})" class="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0f766e] border border-teal-200/90 flex items-center justify-center text-xs transition shadow-2xs hover:scale-105 cursor-pointer" title="গ্রাহকের তথ্য সম্পাদনা ও বিস্তারিত">
              ✏️
            </button>
            <button onclick="deleteAdminCustomer(${c.id}, '${(c.name || c.phone).replace(/'/g, "\\'")}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 flex items-center justify-center text-xs transition shadow-2xs hover:scale-105 cursor-pointer" title="গ্রাহক মুছে ফেলুন">
              🗑️
            </button>
          </div>
        </td>

      </tr>
    `;
  }).join('');
}

function handleSearchCustomers(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderAdminCustomersTable(cachedAdminCustomers);
    return;
  }
  const filtered = cachedAdminCustomers.filter(c => 
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q)) ||
    (c.email && c.email.toLowerCase().includes(q)) ||
    (c.address && c.address.toLowerCase().includes(q)) ||
    (c.area && c.area.toLowerCase().includes(q)) ||
    (c.city && c.city.toLowerCase().includes(q))
  );
  renderAdminCustomersTable(filtered);
}

function handleFilterCustomers(filter) {
  if (filter === 'with_orders') {
    renderAdminCustomersTable(cachedAdminCustomers.filter(c => (c.total_orders || 0) > 0));
  } else if (filter === 'no_orders') {
    renderAdminCustomersTable(cachedAdminCustomers.filter(c => (c.total_orders || 0) === 0));
  } else {
    renderAdminCustomersTable(cachedAdminCustomers);
  }
}

function openCustomerEditModal(customerId) {
  const customer = cachedAdminCustomers.find(c => c.id === customerId);
  if (!customer) return;

  const content = document.getElementById('customer-details-content');
  if (!content) return;

  const initial = (customer.name || 'গ').charAt(0).toUpperCase();
  const avatarHtml = customer.avatar && customer.avatar.trim() 
    ? `<img src="${customer.avatar}" alt="${customer.name}" class="w-full h-full object-cover">`
    : `<span class="text-2xl font-black">${initial}</span>`;

  const regDate = customer.created_at 
    ? new Date(customer.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'তারিখ নেই';

  // Find customer's orders from cachedOrders
  const custOrders = (window.cachedOrders || []).filter(o => {
    let oPhone = (o.customer_phone || '').trim().replace(/[^0-9]/g, '');
    let cPhone = (customer.phone || '').trim().replace(/[^0-9]/g, '');
    if (oPhone.startsWith('88')) oPhone = oPhone.substring(2);
    if (cPhone.startsWith('88')) cPhone = cPhone.substring(2);
    return oPhone && cPhone && (oPhone === cPhone || oPhone.endsWith(cPhone) || cPhone.endsWith(oPhone));
  });

  const ordersListHtml = custOrders.length > 0 ? custOrders.map(o => `
    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900 font-mono text-xs">#${o.order_number}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">${o.status}</span>
        </div>
        <div class="text-slate-600 font-medium mt-1">
          📱 <strong>${o.brand || ''} ${o.model || ''}</strong> (${o.device_type || 'Device'})
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">
          📅 ${new Date(o.created_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="font-bold text-slate-900 font-sans">৳${o.final_cost || o.estimated_cost || 0}</span>
        <button onclick="closeCustomerDetailsModal(); switchTab('orders'); setTimeout(() => searchOrder('${o.order_number}'), 300);" class="px-2.5 py-1 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs transition cursor-pointer">
          অর্ডারে যান →
        </button>
      </div>
    </div>
  `).join('') : `
    <div class="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
      এই গ্রাহক এখনও ওয়েবসাইট থেকে কোনো মেরামতের অর্ডার প্লেস করেননি।
    </div>
  `;

  content.innerHTML = `
    <!-- Customer Header Card -->
    <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-teal-700 text-white flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
          ${avatarHtml}
        </div>
        <div class="space-y-0.5 min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="text-base font-black text-white truncate">${customer.name || 'সম্মানিত গ্রাহক'}</h4>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/20 text-teal-100 font-mono">#RS-C${customer.id}</span>
          </div>
          <p class="text-xs text-teal-100 font-mono">
            📞 ${customer.phone}
          </p>
          <p class="text-[10px] text-teal-200/80">
            যুক্ত হয়েছেন: ${regDate}
          </p>
        </div>
      </div>
      
      <!-- Contact Shortcuts -->
      <div class="flex items-center gap-1.5 shrink-0">
        <a href="https://wa.me/88${customer.phone}?text=${encodeURIComponent(`Assalamu Alaikum ${customer.name || ''}, Repair Seba থেকে আপনার সাথে যোগাযোগ করছি।`)}" target="_blank" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs" title="WhatsApp Message">
          <span>💬</span> <span>WhatsApp</span>
        </a>
        <a href="tel:${customer.phone}" class="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition flex items-center justify-center" title="সরাসরি কল">
          📞
        </a>
      </div>
    </div>

    <!-- Edit Customer Profile Form -->
    <form onsubmit="handleSaveCustomerEdit(event, ${customer.id}); return false;" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
      <div class="font-bold text-slate-800 border-b border-slate-200/80 pb-2 flex items-center justify-between">
        <div class="flex items-center gap-1.5 text-teal-950 font-bold">
          <span>✏️</span> <span>গ্রাহকের তথ্য সম্পাদনা (Edit Profile)</span>
        </div>
        <span class="text-[10px] text-slate-400 font-normal">পরিবর্তন করতে তথ্য এডিট করুন</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-slate-700 mb-1">পূর্ণ নাম (Full Name)*</label>
          <input type="text" id="edit-cust-name" required value="${(customer.name || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-teal-600 focus:outline-none transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone)*</label>
          <input type="tel" id="edit-cust-phone" required value="${(customer.phone || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:border-teal-600 focus:outline-none transition">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-slate-700 mb-1">ইমেইল এড্রেস (Email)</label>
          <input type="email" id="edit-cust-email" value="${(customer.email || '').replace(/"/g, '&quot;')}" placeholder="customer@example.com" class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-teal-600 focus:outline-none transition">
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">এলাকা / জোন (Area)</label>
          <input type="text" id="edit-cust-area" value="${(customer.area || '').replace(/"/g, '&quot;')}" placeholder="যেমন: মিরপুর ১০, ধানমন্ডি" class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-teal-600 focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-1">বিস্তারিত ঠিকানা (Full Address)</label>
        <input type="text" id="edit-cust-address" value="${(customer.address || '').replace(/"/g, '&quot;')}" placeholder="বাসা নম্বর, রোড, এলাকা..." class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-teal-600 focus:outline-none transition">
      </div>

      <div class="pt-1 flex items-center justify-end">
        <button type="submit" id="btn-save-cust" class="px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer">
          <span>💾</span> <span>পরিবর্তন সংরক্ষণ করুন</span>
        </button>
      </div>
    </form>

    <!-- Orders Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h5 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>📦</span> <span>এই গ্রাহকের সমস্ত অর্ডার (${custOrders.length}টি)</span>
        </h5>
      </div>
      <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
        ${ordersListHtml}
      </div>
    </div>
  `;

  document.getElementById('customer-details-modal')?.classList.remove('hidden');
}

async function handleSaveCustomerEdit(e, customerId) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('edit-cust-name')?.value.trim();
  const phone = document.getElementById('edit-cust-phone')?.value.trim();
  const email = document.getElementById('edit-cust-email')?.value.trim();
  const area = document.getElementById('edit-cust-area')?.value.trim();
  const address = document.getElementById('edit-cust-address')?.value.trim();
  const btn = document.getElementById('btn-save-cust');

  if (!name || !phone) {
    alert('গ্রাহকের নাম ও ফোন নম্বর আবশ্যক।');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'সংরক্ষণ হচ্ছে...';
  }

  try {
    const res = await fetch(`/api/admin/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name, phone, email, area, address })
    });
    const data = await res.json();
    if (data.success) {
      alert('গ্রাহকের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
      closeCustomerDetailsModal();
      loadAdminCustomers();
    } else {
      alert(data.error || 'সংরক্ষণ করা যায়নি');
    }
  } catch (err) {
    console.error('Save customer error:', err);
    alert('সার্ভার এরর');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'পরিবর্তন সংরক্ষণ করুন';
    }
  }
}

function openCustomerDetailsModal(customerId) {
  openCustomerEditModal(customerId);
}

function closeCustomerDetailsModal() {
  document.getElementById('customer-details-modal')?.classList.add('hidden');
}

async function deleteAdminCustomer(customerId, customerName) {
  if (!confirm(`আপনি কি নিশ্চিত যে গ্রাহক "${customerName}" এর প্রোফাইল মুছে ফেলতে চান?`)) return;

  try {
    const res = await fetch(`/api/admin/customers/${customerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadAdminCustomers();
    } else {
      alert(data.error || 'মুছে ফেলা যায়নি');
    }
  } catch (err) {
    console.error('Delete customer error:', err);
    alert('সার্ভার এরর');
  }
}

window.switchUserSubTab = switchUserSubTab;
window.loadAdminCustomers = loadAdminCustomers;
window.handleSearchCustomers = handleSearchCustomers;
window.handleFilterCustomers = handleFilterCustomers;
window.openCustomerEditModal = openCustomerEditModal;
window.openCustomerDetailsModal = openCustomerDetailsModal;
window.closeCustomerDetailsModal = closeCustomerDetailsModal;
window.handleSaveCustomerEdit = handleSaveCustomerEdit;
window.deleteAdminCustomer = deleteAdminCustomer;
window.handleAdminProfileFileUpload = handleAdminProfileFileUpload;
window.handleTeamUserFileUpload = handleTeamUserFileUpload;
window.setMyAvatarPreset = setMyAvatarPreset;
window.previewMyProfileAvatar = previewMyProfileAvatar;




// Repair Seba - Admin Dashboard Logic

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
  'orders': 'ড্যাশবোর্ড ওভারভিউ',
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

function openAddServiceModal() {
  alert('নতুন সার্ভিস কনফিগ ফিচার: সার্ভিসের নাম, ক্যাটাগরি এবং প্রারম্ভিক ফি শীঘ্রই কাস্টমাইজ করা যাবে। বর্তমান সার্ভিস তালিকা নিচে প্রদর্শিত হচ্ছে।');
}

let adminToken = localStorage.getItem('repair_seba_admin_token');
let currentAdminTab = 'orders';
let currentStatusFilter = 'ALL';
let adminOrdersCache = [];

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

let currentAdminProfile = null;
let currentAdminPermissions = ["orders","services","inquiries","hero","footer","users"];

function updateHeaderProfileUI(admin) {
  if (!admin) return;
  currentAdminProfile = admin;
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
    'orders': [document.getElementById('tab-btn-orders'), document.getElementById('tab-btn-orders-list')],
    'services': [document.getElementById('tab-btn-services')],
    'inquiries': [document.getElementById('tab-btn-inquiries')],
    'hero': [document.getElementById('tab-btn-hero')],
    'footer': [document.getElementById('tab-btn-footer')],
    'users': [document.getElementById('tab-btn-users')]
  };

  Object.entries(tabElements).forEach(([key, btnList]) => {
    const hasPerm = isSuper || perms.includes(key) || perms.includes('*');
    btnList.forEach(btn => {
      if (!btn) return;
      btn.style.display = hasPerm ? 'flex' : 'none';
    });
  });

  // If non-superadmin does not have orders permission and is on orders tab, redirect to first permitted tab
  if (!isSuper && !perms.includes('orders') && !perms.includes('*') && currentAdminTab === 'orders') {
    const allowed = ['services', 'inquiries', 'hero', 'footer', 'users'].find(p => perms.includes(p));
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

  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showDashboardScreen();
      updateHeaderProfileUI(data.admin);
      loadAdminDashboardData();
    } else {
      adminLogout();
    }
  } catch (err) {
    console.error('Session verify error:', err);
    showLoginScreen();
  }
}

function showLoginScreen() {
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
  adminToken = null;
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
  return false;
}
window.handleAdminLoginSubmit = handleAdminLoginSubmit;

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
  await loadAdminOrders();
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
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.total_orders}</span>
        <span class="text-[10px] font-bold text-slate-600">জন</span>
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
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.pending_pickup}</span>
        <span class="text-[10px] font-bold text-slate-600">টি</span>
        <span class="px-1 py-0.2 text-[8px] font-bold rounded bg-amber-200/70 text-amber-900 border border-amber-300">১ নতুন</span>
      </div>
    </div>

    <!-- Card 3: মেরামত ও ল্যাব - Soft Blue -->
    <div class="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
        <span class="truncate">মেরামত ও ল্যাব</span>
        <span class="text-xs shrink-0">🔬</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.in_repair + (s.in_lab || 0)}</span>
        <span class="text-[10px] font-bold text-slate-600">জন</span>
      </div>
    </div>

    <!-- Card 4: অনুমোদন বাকি - Soft Purple -->
    <div class="bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-purple-800 mb-1">
        <span class="truncate">অনুমোদন বাকি</span>
        <span class="text-xs shrink-0">🔔</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.quote_pending}</span>
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
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none" id="stat-card-inq-count">২</span>
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
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none">${s.completed}</span>
        <span class="text-[10px] font-bold text-slate-600">জন</span>
      </div>
    </div>

    <!-- Card 7: সার্ভিসসমূহ - Soft Sky -->
    <div class="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-2 sm:p-2.5 shadow-2xs flex flex-col justify-center min-w-0">
      <div class="flex items-center justify-between text-[11px] font-bold text-sky-800 mb-1">
        <span class="truncate">সার্ভিস ক্যাটাগরি</span>
        <span class="text-xs shrink-0">🛠️</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-base sm:text-lg font-black text-slate-900 leading-none" id="stat-card-serv-count">৯</span>
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
        <span class="text-sm sm:text-base font-black text-slate-900 leading-none truncate">৳${s.total_revenue.toLocaleString()}</span>
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

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-500 font-medium">কোনো অর্ডার পাওয়া যায়নি।</td></tr>`;
    return;
  }

  const statusList = [
    { val: 'PENDING_PICKUP', label: '⏳ পিকআপ বাকি', color: 'bg-amber-50 text-amber-900 border-amber-300' },
    { val: 'PICKUP_ASSIGNED', label: '🚴 রাইডার নির্ধারিত', color: 'bg-blue-50 text-blue-900 border-blue-300' },
    { val: 'COLLECTED', label: '📦 ল্যাবের পথে', color: 'bg-indigo-50 text-indigo-900 border-indigo-300' },
    { val: 'DIAGNOSING', label: '🔬 টেস্ট চলছে', color: 'bg-purple-50 text-purple-900 border-purple-300' },
    { val: 'QUOTE_PENDING', label: '⚠️ মূল্য অনুমোদন বাকি', color: 'bg-orange-50 text-orange-900 border-orange-300' },
    { val: 'QUOTE_APPROVED', label: '✅ অনুমোদন সম্পন্ন (Allow)', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
    { val: 'IN_REPAIR', label: '🛠️ মেরামত চলছে', color: 'bg-cyan-50 text-cyan-900 border-cyan-300' },
    { val: 'OUT_FOR_DELIVERY', label: '🚚 ডেলিভারির পথে', color: 'bg-teal-50 text-teal-900 border-teal-300' },
    { val: 'COMPLETED', label: '🎉 সম্পন্ন', color: 'bg-emerald-100 text-emerald-950 border-emerald-400' },
    { val: 'CANCELLED', label: '❌ বাতিল', color: 'bg-rose-50 text-rose-900 border-rose-300' }
  ];

  tbody.innerHTML = orders.map(o => {
    const curStatus = statusList.find(s => s.val === o.status) || { color: 'bg-slate-50 text-slate-800 border-slate-300' };
    const dateFormatted = new Date(o.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Direct status dropdown (No modal/submit needed! Direct 1-click update/allow)
    const statusWidget = `
      <div class="flex items-center gap-1.5 flex-nowrap">
        <select onchange="quickUpdateOrderStatus(${o.id}, this.value)" class="text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs ${curStatus.color}" title="সরাসরি স্ট্যাটাস পরিবর্তন করুন (সাবমিট বাটন ছাড়া)">
          ${statusList.map(s => `
            <option value="${s.val}" ${s.val === o.status ? 'selected' : ''}>${s.label}</option>
          `).join('')}
        </select>
        ${o.status === 'QUOTE_PENDING' ? `
          <button onclick="quickDirectApprove(${o.id})" class="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition shrink-0" title="সরাসরি অনুমোদন করুন (Direct Allow without submit)">
            ✓ অনুমোদন
          </button>
        ` : ''}
      </div>
    `;

    return `
      <tr class="hover:bg-slate-50/80 transition text-slate-800 text-xs">
        <td class="py-2.5 px-3 font-bold font-mono text-[#0f766e] whitespace-nowrap">
          ${o.order_number}
        </td>

        <td class="py-2.5 px-3">
          <div class="font-bold text-slate-900 truncate max-w-[130px]" title="${o.customer_name}">${o.customer_name}</div>
          <div class="text-[10px] text-slate-500 truncate max-w-[130px]">📍 ${o.area || 'ঢাকা'}</div>
        </td>

        <td class="py-2.5 px-3">
          <div class="font-semibold text-slate-800 truncate max-w-[160px]" title="${o.brand} ${o.model}">${o.brand} ${o.model}</div>
          <div class="text-[10px] text-slate-500 truncate max-w-[160px]">⚠️ ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}</div>
        </td>

        <td class="py-2.5 px-3 font-mono whitespace-nowrap">
          <div class="text-slate-800 text-xs font-semibold">${o.customer_phone}</div>
          <a href="https://wa.me/88${o.customer_phone}?text=${encodeURIComponent(`Assalamu Alaikum, Repair Seba থেকে আপনার অর্ডার ${o.order_number} এর ব্যাপারে যোগাযোগ করছি।`)}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold inline-flex items-center gap-0.5 mt-0.5" title="WhatsApp Chat">
            💬 চ্যাট
          </a>
        </td>

        <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">
          ${dateFormatted}
        </td>

        <td class="py-2.5 px-3 whitespace-nowrap">
          ${statusWidget}
        </td>

        <td class="py-2.5 px-3 text-right whitespace-nowrap">
          <button onclick="openEditModal(${o.id})" class="px-2.5 py-1.5 rounded-lg bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs shadow-2xs transition inline-flex items-center gap-1 shrink-0" title="কোটেশন ও বিস্তারিত বিবরণ সম্পাদনা">
            <span>📝</span> <span>আপডেট</span>
          </button>
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
// TABS & SERVICES & INQUIRIES
// -------------------------------------------------------------
function switchTab(tab) {
  if (currentAdminProfile && currentAdminProfile.role !== 'superadmin') {
    if (!currentAdminPermissions.includes(tab) && !currentAdminPermissions.includes('*')) {
      alert('আপনার এই সেকশনে প্রবেশের অনুমতি নেই।');
      return;
    }
  }
  currentAdminTab = tab;
  ['orders', 'services', 'inquiries', 'hero', 'footer', 'users'].forEach(t => {
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

  if (tab === 'services') loadAdminServices();
  if (tab === 'inquiries') loadAdminContacts();
  if (tab === 'hero') loadAdminHeroSettings();
  if (tab === 'footer') loadAdminFooterSettings();
  if (tab === 'users') loadAdminUsers();
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


async function loadAdminServices() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/services', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const servBadge = document.getElementById('badge-tab-services');
      if (servBadge && data.services) servBadge.textContent = `${data.services.length}টি`;
      container.innerHTML = data.services.map(s => {
        const iconMap = {
          'smartphone': '📱', 'battery-charging': '🔋', 'zap': '⚡', 'cpu': '🔬',
          'droplets': '💧', 'camera': '📷', 'volume-2': '🔊', 'tablet': '💻',
          'hard-drive': '💾', 'wrench': '🛠️'
        };
        const ico = iconMap[s.icon] || '🛠️';
        return `
          <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-cyan-500 hover:shadow-md transition">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs uppercase font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-cyan-800 border border-slate-200">${s.device_type}</span>
                <span class="text-xs ${s.is_active ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-500 bg-slate-100'} px-2 py-0.5 rounded-lg font-bold">
                  ${s.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div class="flex items-start gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
                  ${ico}
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-base">${s.title_bn}</h4>
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">${s.description_bn}</p>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-cyan-700 font-black text-base">৳${s.starting_price.toLocaleString()}</span>
              <span class="text-xs text-slate-500">🛡️ ${s.warranty_bn || '৯০ দিন'}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error loading services:', err);
  }
}

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

function setMyAvatarPreset(url) {
  const inp = document.getElementById('my-profile-avatar-url');
  if (inp) inp.value = url;
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




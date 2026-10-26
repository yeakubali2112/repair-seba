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
  'services': '<span>⚙️</span> রিপেয়ার সার্ভিস ও মূল্য তালিকা কনফিগ',
  'inquiries': '<span>💬</span> গ্রাহকদের মেসেজ ও যোগাযোগ তালিকা',
  'hero': '<span>🎨</span> হিরো ব্যানার ও বাইক অ্যানিমেশন কন্ট্রোল',
  'footer': '<span>🏢</span> অফিস ঠিকানা ও ফুটার সেটিংস'
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
    <!-- Card 1: মোট অর্ডার (নিবন্ধিত) - Mint Green -->
    <div class="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
          <span>মোট অর্ডার (নিবন্ধিত)</span>
          <span class="text-xs">👥</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">${s.total_orders} জন</span>
          <span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-200/70 text-emerald-900 border border-emerald-300">রিয়েল ডাটা</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">পিকআপ: ${s.pending_pickup} জন • ল্যাব: ${s.in_lab || 1} জন</div>
      </div>
      <div class="text-[9px] text-emerald-700 font-semibold mt-1.5 pt-1 border-t border-emerald-200/60 truncate">
        (অগ্রাধিকার লক্ষ্যমাত্রা: ১০০%)
      </div>
    </div>

    <!-- Card 2: পিকআপ অপেক্ষমাণ (অনলাইন) - Amber/Cream -->
    <div class="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
          <span>পিকআপ অপেক্ষমাণ (অনলাইন)</span>
          <span class="text-xs">📦</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">${s.pending_pickup} টি</span>
          <span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-200/70 text-amber-900 border border-amber-300">১ নতুন</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">${s.pending_pickup}টি অপেক্ষমাণ • রাইডার নির্ধারিত</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-amber-200/60">
        <a href="javascript:void(0)" onclick="filterOrders('PENDING_PICKUP')" class="text-[10px] text-amber-800 font-bold hover:underline block truncate">অনলাইন আবেদন যাচাই করুন →</a>
      </div>
    </div>

    <!-- Card 3: মেরামত ও ল্যাব পরীক্ষা - Soft Blue -->
    <div class="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-blue-800 mb-1">
          <span>মেরামত ও কোয়ালিটি টেস্ট</span>
          <span class="text-xs">🔬</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">${s.in_repair + (s.in_lab || 0)} জন</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">মেরামত: ${s.in_repair} জন • ল্যাব: ${s.in_lab || 0} জন</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-blue-200/60">
        <a href="javascript:void(0)" onclick="filterOrders('IN_REPAIR')" class="text-[10px] text-blue-800 font-bold hover:underline block truncate">ল্যাব মেরামত তালিকা দেখুন →</a>
      </div>
    </div>

    <!-- Card 4: মূল্য অনুমোদন অপেক্ষমাণ - Soft Purple -->
    <div class="bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-purple-800 mb-1">
          <span>মূল্য অনুমোদন অপেক্ষমাণ</span>
          <span class="text-xs">🔔</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">${s.quote_pending} টি</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">সম্মতির জন্য ${s.quote_pending}টি অর্ডার</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-purple-200/60">
        <a href="javascript:void(0)" onclick="filterOrders('QUOTE_PENDING')" class="text-[10px] text-purple-800 font-bold hover:underline block truncate">কোটেশন ও অনুমোদন দেখুন →</a>
      </div>
    </div>

    <!-- Card 5: প্রাপ্ত বার্তা ও ইনকোয়ারি - Soft Rose -->
    <div class="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-rose-800 mb-1">
          <span>প্রাপ্ত বার্তা ও ইনকোয়ারি</span>
          <span class="text-xs">💬</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight" id="stat-card-inq-count">২ টি</span>
        </div>
        <div class="text-[10px] text-rose-700 font-semibold mt-0.5 truncate">সকল বার্তা পর্যালোচনা সম্পন্ন</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-rose-200/60">
        <a href="javascript:void(0)" onclick="switchTab('inquiries')" class="text-[10px] text-rose-800 font-bold hover:underline block truncate">গ্রাহকদের মেসেজ পড়ুন →</a>
      </div>
    </div>

    <!-- Card 6: পুরাতন ডিভাইস (Alumni) - Soft Teal -->
    <div class="bg-[#f0fdfa] border border-[#99f6e4] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-teal-800 mb-1">
          <span>পুরাতন ডিভাইস (Alumni)</span>
          <span class="text-xs">🎓</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">${s.completed} জন</span>
        </div>
        <div class="text-[10px] text-teal-700 font-semibold mt-0.5 truncate">ওয়ারেন্টি সম্পন্ন ডিভাইস রেজিস্ট্রি</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-teal-200/60">
        <a href="javascript:void(0)" onclick="filterOrders('COMPLETED')" class="text-[10px] text-teal-800 font-bold hover:underline block truncate">সম্পন্ন গ্রাহক তালিকা →</a>
      </div>
    </div>

    <!-- Card 7: সক্রিয় সার্ভিসসমূহ - Soft Sky -->
    <div class="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-sky-800 mb-1">
          <span>সক্রিয় সার্ভিস ক্যাটাগরি</span>
          <span class="text-xs">🛠️</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight" id="stat-card-serv-count">৯ টি</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">ক্যাটাগরিভিত্তিক সাপ্তাহিক শিডিউল</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-sky-200/60">
        <a href="javascript:void(0)" onclick="switchTab('services')" class="text-[10px] text-sky-800 font-bold hover:underline block truncate">সার্ভিস সম্পাদনা ও রেটকার্ড →</a>
      </div>
    </div>

    <!-- Card 8: মোট আদায়কৃত আয় - Mint Emerald -->
    <div class="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
          <span>মোট আদায়কৃত আয়</span>
          <span class="text-xs">💰</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg sm:text-xl font-black text-slate-900 leading-tight">৳${s.total_revenue.toLocaleString()}</span>
        </div>
        <div class="text-[10px] text-slate-600 mt-0.5 truncate">ক্যাশ অন ডেলিভারি ও অনলাইন</div>
      </div>
      <div class="mt-1.5 pt-1 border-t border-emerald-200/60">
        <span class="text-[10px] text-emerald-800 font-bold block truncate">আর্থিক স্থিতি ও হিসাব রিপোর্ট →</span>
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
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-rose-400">${data.error}</td></tr>`;
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

  tbody.innerHTML = orders.map(o => {
    const st = ADMIN_STATUS_BADGES[o.status] || (typeof STATUS_MAP !== 'undefined' ? STATUS_MAP[o.status] : null) || { bn: o.status, en: o.status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    const dateFormatted = new Date(o.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Status pill style matching reference school dashboard screenshot
    let statusPill = '';
    if (o.status === 'COMPLETED' || o.quote_status === 'APPROVED') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#ecfdf5] text-emerald-800 border border-emerald-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${st.bn}</span>`;
    } else if (o.status === 'PENDING_PICKUP' || o.quote_status === 'PENDING') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fffbeb] text-amber-800 border border-amber-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ${st.bn}</span>`;
    } else {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#eff6ff] text-blue-800 border border-blue-300 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ${st.bn}</span>`;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition text-slate-800 text-xs">
        <td class="py-3 px-4 font-bold font-mono text-[#0f766e]">
          ${o.order_number}
        </td>

        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${o.customer_name}</div>
          <div class="text-[10px] text-slate-500 font-normal mt-0.5">📍 ${o.area || 'ঢাকা'}</div>
        </td>

        <td class="py-3 px-4">
          <div class="font-semibold text-slate-800">${o.brand} ${o.model}</div>
          <div class="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">⚠️ ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}</div>
        </td>

        <td class="py-3 px-4 font-mono">
          <div class="text-slate-800 text-xs font-semibold">${o.customer_phone}</div>
          <a href="https://wa.me/88${o.customer_phone}?text=${encodeURIComponent(`Assalamu Alaikum, Repair Seba থেকে আপনার অর্ডার ${o.order_number} এর ব্যাপারে যোগাযোগ করছি।`)}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold inline-flex items-center gap-0.5 mt-0.5" title="WhatsApp Chat">
            💬 চ্যাট
          </a>
        </td>

        <td class="py-3 px-4 text-slate-600 whitespace-nowrap">
          ${dateFormatted}
        </td>

        <td class="py-3 px-4 whitespace-nowrap">
          ${statusPill}
        </td>

        <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
          <button onclick="openEditModal(${o.id})" class="px-2.5 py-1 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-[11px] shadow-2xs transition">
            প্রোফাইল তৈরি
          </button>
          <button onclick="openEditModal(${o.id})" class="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[11px] transition">
            বিস্তারিত
          </button>
          <button onclick="printAdminJobSheet(${o.id})" class="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs transition" title="জব-শীট প্রিন্ট">
            🖨️
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

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
  currentAdminTab = tab;
  ['orders', 'services', 'inquiries', 'hero', 'footer'].forEach(t => {
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



// Repair Seba - Client Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Language
  applyTranslations();

  // 2. Fetch Services
  loadServices('all');

  // 3. Setup Brand & Issues in Booking Form
  setupBookingForm();

  // 4. Setup Event Listeners
  setupEventListeners();

  // 5. Initialize Hero City Banner & Animated Cyclist
  initHeroCityBanner();

  // 6. Initialize Customer Phone Auth & Profile
  initCustomerAuth();

  // 6. Check URL params for direct tracking (e.g. ?track=RS-841920)
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('track');
  if (trackId) {
    const trackInput = document.getElementById('track-input');
    if (trackInput) {
      trackInput.value = trackId;
      document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' });
      trackOrder(trackId);
    }
  }
});

// Cache services
let allServices = [];

// -------------------------------------------------------------
// LOAD & RENDER SERVICES
// -------------------------------------------------------------
async function loadServices(filter = 'all') {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success) {
      allServices = data.services;
      renderServices(filter);
      renderBookingIssues();
    }
  } catch (err) {
    console.error('Failed to load services:', err);
  }
}

function renderServices(filter = 'all') {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const filtered = allServices.filter(s => {
    if (filter === 'all') return true;
    return s.device_type === filter || s.device_type === 'all';
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-medium">কোনো সার্ভিস পাওয়া যায়নি।</div>`;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const title = currentLang === 'bn' ? s.title_bn : s.title_en;
    const desc = currentLang === 'bn' ? s.description_bn : s.description_en;
    const time = currentLang === 'bn' ? s.estimated_time_bn : s.estimated_time_en;
    const warranty = currentLang === 'bn' ? s.warranty_bn : s.warranty_en;
    const startTxt = getTranslation('starting_from') || 'শুরু মাত্র';
    const bookTxt = getTranslation('btn_book_service') || 'এই সার্ভিস বুক করুন';

    const deviceBadgeLabel = s.device_type === 'phone'
      ? (currentLang === 'bn' ? '📱 মোবাইল' : '📱 Mobile')
      : s.device_type === 'tablet'
        ? (currentLang === 'bn' ? '💻 ট্যাবলেট' : '💻 Tablet')
        : (currentLang === 'bn' ? '📱 ফোন ও ট্যাব' : '📱 Phone & Tab');

    return `
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-cyan-400/80 shadow-sm hover:shadow-2xl hover:shadow-cyan-950/10 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
        
        <!-- Top Gradient Edge Accent on Card Hover -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <!-- Ambient Radial Aura in Corner on Hover -->
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl group-hover:bg-cyan-400/25 transition-all duration-500 pointer-events-none"></div>

        <div>
          <!-- Header: Eye-Catching Custom Visual Icon + Category & Time Badges -->
          <div class="flex items-start justify-between gap-3 mb-5">
            ${getServiceVisualBadge(s.icon, s.code)}
            
            <div class="flex flex-col items-end gap-1.5">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80">
                ${deviceBadgeLabel}
              </span>
              ${time ? `
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
                  ⏱️ ${time}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Service Title -->
          <h3 class="text-lg sm:text-xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors duration-200 leading-snug mb-2.5">
            ${title}
          </h3>

          <!-- Service Description -->
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
            ${desc}
          </p>

          <!-- Key Guarantees Pill Tags -->
          <div class="flex flex-wrap items-center gap-2 mb-6">
            ${warranty ? `
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                🛡️ ${warranty}
              </span>
            ` : ''}
            <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
              <span class="text-cyan-600 font-bold">✓</span> অরিজিনাল পার্টস
            </span>
          </div>
        </div>
        
        <!-- Bottom Pricing & Action Section -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">${startTxt}</span>
            <div class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline">
              <span>৳${s.starting_price.toLocaleString()}</span>
            </div>
          </div>
          
          <button onclick="prefillBooking('${s.code}', '${s.device_type}')" class="px-5 py-2.5 rounded-xl bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-sky-600 text-white text-xs sm:text-sm font-bold transition-all duration-300 shadow-md group-hover:shadow-cyan-500/25 flex items-center gap-1.5 whitespace-nowrap group/btn">
            <span>${bookTxt}</span>
            <span class="inline-block transition-transform duration-200 group-hover/btn:translate-x-1 font-black">→</span>
          </button>
        </div>

      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// EYE-CATCHING CUSTOM VECTOR SVG BADGES WITH LIVE ANIMATIONS
// -------------------------------------------------------------
function getServiceVisualBadge(icon, code) {
  const configs = {
    'smartphone': {
      gradient: 'from-cyan-500 via-sky-500 to-blue-600',
      aura: 'bg-cyan-500/30',
      shadow: 'shadow-cyan-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-screen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3"/>
          <path d="M12 18h.01" stroke-width="3"/>
          <path d="M8 5h8" stroke-width="1.5" stroke-dasharray="1 1"/>
          <path d="M7 8l4 5 6-7" stroke="#bae6fd" stroke-width="2"/>
        </svg>
      `
    },
    'battery-charging': {
      gradient: 'from-emerald-400 via-emerald-500 to-teal-600',
      aura: 'bg-emerald-500/30',
      shadow: 'shadow-emerald-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-battery" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="16" height="10" rx="2.5"/>
          <line x1="22" y1="11" x2="22" y2="13" stroke-width="2.5"/>
          <path d="M9 10l-2 3h3l-1 3 4-4h-3l1-2z" fill="#fef08a" stroke="#fef08a" stroke-width="0.8"/>
        </svg>
      `
    },
    'zap': {
      gradient: 'from-amber-400 via-amber-500 to-orange-500',
      aura: 'bg-amber-500/30',
      shadow: 'shadow-amber-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-zap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#ffffff" fill-opacity="0.95"/>
        </svg>
      `
    },
    'cpu': {
      gradient: 'from-indigo-500 via-purple-600 to-violet-700',
      aura: 'bg-purple-500/30',
      shadow: 'shadow-purple-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-cpu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="3"/>
          <rect x="9" y="9" width="6" height="6" rx="1" fill="#e9d5ff" fill-opacity="0.5"/>
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
        </svg>
      `
    },
    'droplets': {
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      aura: 'bg-blue-500/30',
      shadow: 'shadow-blue-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-drop" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="#bae6fd" fill-opacity="0.35"/>
          <path d="M12 9v6M9 12h6" stroke="#ffffff" stroke-width="2"/>
        </svg>
      `
    },
    'camera': {
      gradient: 'from-rose-500 via-pink-500 to-red-600',
      aura: 'bg-rose-500/30',
      shadow: 'shadow-rose-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4" fill="#fbcfe8" fill-opacity="0.4"/>
        </svg>
      `
    },
    'volume-2': {
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      aura: 'bg-violet-500/30',
      shadow: 'shadow-violet-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff" fill-opacity="0.9"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      `
    },
    'tablet': {
      gradient: 'from-teal-400 via-cyan-600 to-blue-600',
      aura: 'bg-teal-500/30',
      shadow: 'shadow-teal-500/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-tablet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="12" cy="18" r="1" fill="#ffffff"/>
          <path d="M7 8h10M7 12h6" stroke="#99f6e4" stroke-width="1.8"/>
        </svg>
      `
    },
    'hard-drive': {
      gradient: 'from-slate-700 via-slate-800 to-cyan-900',
      aura: 'bg-cyan-500/25',
      shadow: 'shadow-slate-800/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-software" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
          <line x1="14" y1="4" x2="10" y2="20" stroke="#38bdf8"/>
        </svg>
      `
    },
    'wrench': {
      gradient: 'from-cyan-600 via-sky-600 to-slate-800',
      aura: 'bg-cyan-500/30',
      shadow: 'shadow-cyan-600/30',
      svg: `
        <svg class="w-7 h-7 text-white anim-srv-wrench" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      `
    }
  };

  const c = configs[icon] || configs[code] || configs['wrench'];

  return `
    <div class="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
      <!-- Ambient Backlight Halo with Breathing Pulse -->
      <div class="absolute inset-0 rounded-2xl ${c.aura} blur-md anim-service-aura group-hover:blur-xl transition-all duration-300 -z-10"></div>
      <!-- Icon Squircle -->
      <div class="relative w-full h-full rounded-2xl bg-gradient-to-tr ${c.gradient} flex items-center justify-center shadow-lg ${c.shadow} border border-white/20 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 overflow-hidden">
        ${c.svg}
      </div>
    </div>
  `;
}

function getServiceEmoji(icon) {
  const map = {
    'smartphone': '📱',
    'battery-charging': '🔋',
    'zap': '⚡',
    'cpu': '🔬',
    'droplets': '💧',
    'camera': '📷',
    'volume-2': '🔊',
    'tablet': '💻',
    'hard-drive': '💾',
    'wrench': '🛠️'
  };
  return map[icon] || '🔧';
}

// -------------------------------------------------------------
// BOOKING FORM LOGIC
// -------------------------------------------------------------
const phoneBrands = [
  'Apple (iPhone)', 'Samsung', 'Xiaomi / Redmi / Poco', 'Vivo', 'Oppo',
  'Realme', 'OnePlus', 'Motorola', 'Google Pixel', 'Walton', 'Infinix', 'Tecno', 'Other / অন্যান্য'
];

const tabletBrands = [
  'Apple (iPad)', 'Samsung Galaxy Tab', 'Xiaomi Pad', 'Lenovo Tab',
  'Huawei MediaPad', 'Amazon Fire Tab', 'Walton Tab', 'Other / অন্যান্য'
];

const dhakaAreas = [
  'Banani (বনানী)', 'Gulshan 1 & 2 (গুলশান)', 'Dhanmondi (ধানমন্ডি)',
  'Uttara (উত্তরা)', 'Mirpur (মিরপুর)', 'Mohakhali & DOHS (মহাখালী)',
  'Mohammadpur (মোহাম্মদপুর)', 'Badda & Rampura (বাড্ডা ও রামপুরা)',
  'Bashundhara R/A (বসুন্ধরা)', 'Baridhara (বারিধারা)',
  'Shantinagar & Kakrail (শান্তিনগর)', 'Motijheel & Dilkusha (মতিঝিল)',
  'Khilgaon & Malibagh (খিলগাঁও)', 'Old Dhaka / পুরাণ ঢাকা (সদরঘাট/ওয়ারী)',
  'Tejgaon (তেজগাঁও)', 'Farmgate (ফার্মগেট)', 'Khilkhet & Nikunja (খিলক্ষেত)',
  'Savar & Ashulia (সাভার)', 'Gazipur (গাজীপুর)', 'Chattogram City (চট্টগ্রাম সিটি)',
  'Other Area / অন্যান্য এলাকা'
];

function setupBookingForm() {
  const brandSelect = document.getElementById('brand-select');
  const areaSelect = document.getElementById('area-select');
  const dateInput = document.getElementById('pickup-date');

  // Populate Areas
  if (areaSelect) {
    areaSelect.innerHTML = `<option value="">${getTranslation('area_select_default')}</option>` +
      dhakaAreas.map(a => `<option value="${a}">${a}</option>`).join('');
  }

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  // Handle device type toggle
  updateBrandList('phone');

  document.querySelectorAll('input[name="device_type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateBrandList(e.target.value);
    });
  });
}

function updateBrandList(deviceType) {
  const brandSelect = document.getElementById('brand-select');
  if (!brandSelect) return;

  const brands = deviceType === 'tablet' ? tabletBrands : phoneBrands;
  brandSelect.innerHTML = `<option value="">${getTranslation('brand_select_default')}</option>` +
    brands.map(b => `<option value="${b}">${b}</option>`).join('');
}

function renderBookingIssues() {
  const container = document.getElementById('issues-checkbox-list');
  if (!container) return;

  const defaultIssues = [
    { code: 'screen-repair', bn: 'ডিসপ্লে / টাচ স্ক্রিন ফাটা বা নষ্ট', en: 'Cracked / Broken Display & Touch' },
    { code: 'battery-replacement', bn: 'ব্যাটারি দ্রুত শেষ হওয়া বা ফুলে যাওয়া', en: 'Fast Battery Drain / Swollen Battery' },
    { code: 'charging-port', bn: 'চার্জিং পোর্ট লুজ বা চার্জ না ধরা', en: 'Charging Port Loose / Not Charging' },
    { code: 'water-damage', bn: 'পানিতে বা তরলে পড়ে নষ্ট হওয়া', en: 'Water or Liquid Submerged Damage' },
    { code: 'motherboard-repair', bn: 'ফোন সম্পূর্ণ অন হয় না (ডেড মাদারবোর্ড)', en: 'Device Completely Dead / Motherboard Issue' },
    { code: 'camera-repair', bn: 'ক্যামেরা ব্লার বা ওপেন না হওয়া', en: 'Camera Blurry / Focus Problem' },
    { code: 'speaker-mic', bn: 'কথা শোনা যায় না বা স্পিকার বাজে না', en: 'Earpiece Low Volume / Speaker / Mic' },
    { code: 'software-os', bn: 'লোগো আটকে থাকা বা সফটওয়্যার হ্যাং', en: 'Bootloop / Hang on Logo / Software' }
  ];

  container.innerHTML = defaultIssues.map(i => {
    const label = currentLang === 'bn' ? i.bn : i.en;
    return `
      <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-cyan-50/50 hover:border-cyan-300 transition cursor-pointer">
        <input type="checkbox" name="issues" value="${i.code}" class="mt-1 w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500">
        <span class="text-sm font-medium text-slate-800">${label}</span>
      </label>
    `;
  }).join('');
}

function prefillBooking(serviceCode, deviceType) {
  // Switch device type if needed
  if (deviceType === 'tablet') {
    const tabRadio = document.querySelector('input[name="device_type"][value="tablet"]');
    if (tabRadio) {
      tabRadio.checked = true;
      updateBrandList('tablet');
    }
  } else {
    const phoneRadio = document.querySelector('input[name="device_type"][value="phone"]');
    if (phoneRadio) {
      phoneRadio.checked = true;
      updateBrandList('phone');
    }
  }

  // Scroll to booking form
  document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });

  // Check the issue checkbox
  setTimeout(() => {
    const checkbox = document.querySelector(`input[name="issues"][value="${serviceCode}"]`);
    if (checkbox) checkbox.checked = true;
  }, 200);
}

// -------------------------------------------------------------
// EVENT LISTENERS & FORM SUBMISSION
// -------------------------------------------------------------
function setupEventListeners() {
  // Language Switchers
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      renderServices(document.querySelector('.service-filter-btn.active')?.getAttribute('data-filter') || 'all');
      renderBookingIssues();
    });
  });

  // Services filter buttons
  document.querySelectorAll('.service-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.service-filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-cyan-600', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      });
      btn.classList.add('active', 'bg-cyan-600', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
      loadServices(btn.getAttribute('data-filter'));
    });
  });

  // Booking Form Submit
  const bookingForm = document.getElementById('repair-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleOrderSubmit(bookingForm);
    });
  }

  // Quick Tracker in Hero
  const quickTrackForm = document.getElementById('quick-track-form');
  if (quickTrackForm) {
    quickTrackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('hero-track-input').value.trim();
      if (!val) return;
      document.getElementById('track-input').value = val;
      document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' });
      trackOrder(val);
    });
  }

  // Main Track Form
  const mainTrackForm = document.getElementById('main-track-form');
  if (mainTrackForm) {
    mainTrackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('track-input').value.trim();
      if (val) trackOrder(val);
    });
  }

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'পাঠানো হচ্ছে...';

      const payload = {
        name: document.getElementById('contact-name').value,
        phone: document.getElementById('contact-phone').value,
        message: document.getElementById('contact-message').value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert(currentLang === 'bn' ? data.message_bn : data.message_en);
          contactForm.reset();
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert('Failed to send inquiry.');
      } finally {
        btn.disabled = false;
        btn.textContent = getTranslation('contact_submit');
      }
    });
  }
}

// -------------------------------------------------------------
// HANDLE NEW ORDER SUBMIT
// -------------------------------------------------------------
async function handleOrderSubmit(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    ${currentLang === 'bn' ? 'অর্ডার প্রক্রিয়াধীন...' : 'Processing Request...'}
  `;

  // Collect checked issues
  const selectedIssues = [];
  form.querySelectorAll('input[name="issues"]:checked').forEach(cb => selectedIssues.push(cb.value));

  const payload = {
    device_type: form.querySelector('input[name="device_type"]:checked')?.value || 'phone',
    brand: document.getElementById('brand-select').value,
    model: document.getElementById('model-input').value,
    issues: selectedIssues,
    issue_description: document.getElementById('desc-input').value,
    customer_name: document.getElementById('name-input').value,
    customer_phone: document.getElementById('phone-input').value,
    customer_alt_phone: document.getElementById('alt-phone-input').value,
    area: document.getElementById('area-select').value,
    address: document.getElementById('address-input').value,
    preferred_date: document.getElementById('pickup-date').value,
    preferred_time_slot: document.getElementById('time-slot-select').value
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      // Show Success Modal
      showOrderSuccessModal(data.order);
      form.reset();
      setupBookingForm();
    } else {
      alert(data.error || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    alert('সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = getTranslation('btn_submit_order');
  }
}

function showOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  if (!modal) return;

  document.getElementById('modal-order-number').textContent = order.order_number;
  document.getElementById('modal-customer-name').textContent = order.customer_name;
  document.getElementById('modal-device-name').textContent = `${order.brand} - ${order.model}`;
  document.getElementById('modal-address').textContent = `${order.address}, ${order.area}`;

  const trackBtn = document.getElementById('modal-track-btn');
  trackBtn.onclick = () => {
    closeSuccessModal();
    document.getElementById('track-input').value = order.order_number;
    document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' });
    trackOrder(order.order_number);
  };

  modal.classList.remove('hidden');
}

function closeSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.add('hidden');
}

// -------------------------------------------------------------
// TRACK ORDER & QUOTE APPROVAL LOGIC
// -------------------------------------------------------------
let currentTrackedOrder = null;

async function trackOrder(query) {
  const container = document.getElementById('track-results');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
      <p class="mt-3 text-slate-600 font-medium">${currentLang === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading status...'}</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.success || data.orders.length === 0) {
      container.innerHTML = `
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800">
          <div class="text-4xl mb-2">🔍</div>
          <h4 class="text-lg font-bold mb-1">${currentLang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি!' : 'No Order Found!'}</h4>
          <p class="text-sm text-rose-600">${currentLang === 'bn' ? 'অনুগ্রহ করে সঠিক অর্ডার আইডি (যেমন: RS-841920) অথবা বুকিং করার সময় দেওয়া মোবাইল নম্বর দিন।' : 'Please check your Order ID or registered mobile number and try again.'}</p>
        </div>
      `;
      return;
    }

    // If multiple orders for this phone, display a selector or the latest one with history tabs
    currentTrackedOrder = data.orders[0];
    renderTrackedOrder(currentTrackedOrder, data.orders);

  } catch (err) {
    console.error('Error tracking order:', err);
    container.innerHTML = `<div class="text-center py-6 text-rose-600">সার্ভার ত্রুটি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।</div>`;
  }
}

function renderTrackedOrder(order, allOrders = []) {
  const container = document.getElementById('track-results');
  if (!container) return;

  const st = STATUS_MAP[order.status] || {
    bn: order.status,
    en: order.status,
    color: 'bg-slate-100 text-slate-800',
    step: 1
  };

  const statusLabel = currentLang === 'bn' ? st.bn : st.en;
  const createdDate = new Date(order.created_at).toLocaleString(currentLang === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Calculate Stepper Progress Percentage
  let stepNumber = st.step;
  let progressPercent = 10;
  if (stepNumber === 1) progressPercent = 20;
  else if (stepNumber === 2) progressPercent = 40;
  else if (stepNumber === 3) progressPercent = 60;
  else if (stepNumber === 4) progressPercent = 80;
  else if (stepNumber === 5) progressPercent = 100;

  // Multiple orders switcher if customer booked multiple times
  let switcherHtml = '';
  if (allOrders.length > 1) {
    switcherHtml = `
      <div class="mb-6 p-3 bg-slate-100 rounded-xl flex items-center gap-2 overflow-x-auto">
        <span class="text-xs font-bold text-slate-600 uppercase whitespace-nowrap">${currentLang === 'bn' ? 'আপনার অর্ডারসমূহ:' : 'Your Orders:'}</span>
        ${allOrders.map(o => `
          <button onclick="switchTrackedOrder('${o.order_number}')" class="px-3 py-1 text-xs rounded-lg font-semibold transition ${o.order_number === order.order_number ? 'bg-cyan-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200'}">
            ${o.order_number} (${o.brand} ${o.model})
          </button>
        `).join('')}
      </div>
    `;
  }

  // Quote Decision Box (THE CRITICAL FLOW)
  let quoteCardHtml = '';
  if (order.status === 'QUOTE_PENDING' || order.quote_status === 'PENDING') {
    quoteCardHtml = `
      <div class="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md animate-fade-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold">
            ৳
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-900">${getTranslation('quote_box_title')}</h4>
            <p class="text-xs text-amber-900 font-medium">${currentLang === 'bn' ? 'ল্যাবে পরীক্ষা শেষে মেরামতের খরচ নির্ধারণ করা হয়েছে। আপনি সম্মতি দিলে আমরা কাজ শুরু করব।' : 'Laboratory inspection complete. Please review the estimated repair cost and approve to start repair.'}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 backdrop-blur rounded-xl p-4 border border-amber-200 mb-6">
          <div>
            <div class="text-xs text-slate-500 font-medium">${getTranslation('quote_cost_lbl')}</div>
            <div class="text-3xl font-black text-cyan-600">৳${order.estimated_cost.toLocaleString()} <span class="text-xs font-normal text-slate-500">(সর্বমোট খরচ)</span></div>
            <div class="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>🛡️</span> ${getTranslation('quote_warranty_lbl')} ${order.warranty_days || 90} ${currentLang === 'bn' ? 'দিন ফ্রি সার্ভিসিং' : 'Days Free Warranty'}
            </div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">${getTranslation('quote_diagnosis_lbl')}</div>
            <div class="text-sm text-slate-800 font-medium mt-1 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
              ${order.diagnosis_notes || (currentLang === 'bn' ? 'পার্টস রিপ্লেসমেন্ট ও সম্পূর্ণ ল্যাব টেস্টিং।' : 'OEM parts replacement and complete diagnostic QA.')}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <input type="text" id="quote-customer-note" placeholder="${getTranslation('quote_customer_note_placeholder')}" class="w-full text-sm px-4 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white">
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-3">
          <button onclick="handleQuoteDecision('${order.order_number}', 'ACCEPT')" class="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2">
            <span>✅</span> ${getTranslation('btn_accept_quote')}
          </button>
          <button onclick="handleQuoteDecision('${order.order_number}', 'REJECT')" class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 transition border border-rose-300 flex items-center justify-center gap-2">
            <span>❌</span> ${getTranslation('btn_reject_quote')}
          </button>
        </div>
        <p class="text-xs text-slate-500 mt-3 text-center">${getTranslation('quote_terms')}</p>
      </div>
    `;
  } else if (order.quote_status === 'APPROVED' || order.status === 'IN_REPAIR' || order.status === 'QUALITY_CHECK') {
    quoteCardHtml = `
      <div class="mt-6 bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎉</span>
          <div>
            <h5 class="font-bold text-emerald-900">${getTranslation('quote_accepted_badge')}</h5>
            <p class="text-xs text-emerald-700 mt-0.5">অনুমোদিত খরচ: <strong>৳${order.final_cost || order.estimated_cost}</strong> • ওয়ারেন্টি: <strong>${order.warranty_days} দিন</strong></p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">Approved</span>
      </div>
    `;
  } else if (order.quote_status === 'REJECTED' || order.status === 'QUOTE_REJECTED') {
    quoteCardHtml = `
      <div class="mt-6 bg-rose-50 border border-rose-300 rounded-2xl p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">ℹ️</span>
          <div>
            <h5 class="font-bold text-rose-900">${getTranslation('quote_rejected_badge')}</h5>
            <p class="text-xs text-rose-700 mt-0.5">${order.customer_decision_notes || 'কোনো চার্জ ছাড়াই আপনার ডিভাইস অক্ষত অবস্থায় ফেরত পাঠানো হবে।'}</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-200 text-rose-800">Declined</span>
      </div>
    `;
  }

  container.innerHTML = `
    ${switcherHtml}
    
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
      <!-- Order Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">${order.order_number}</h3>
            <span class="px-3 py-1 rounded-full text-xs font-bold border ${st.color}">
              ${statusLabel}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">${currentLang === 'bn' ? 'অর্ডার তারিখ:' : 'Order Date:'} ${createdDate}</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="printJobSheet()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition flex items-center gap-1.5">
            🖨️ ${getTranslation('btn_print_receipt')}
          </button>
          <a href="https://wa.me/8801711002233?text=${encodeURIComponent(`Hello Repair Seba, I need update on my Order ID: ${order.order_number}`)}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition border border-emerald-200 flex items-center gap-1.5">
            💬 ${getTranslation('btn_whatsapp_help')}
          </a>
        </div>
      </div>

      <!-- Live Stepper Flow -->
      <div class="py-8">
        <div class="relative">
          <!-- Background Line -->
          <div class="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0"></div>
          <!-- Active Line -->
          <div class="absolute top-5 left-6 h-1 bg-cyan-600 transition-all duration-700 -z-0" style="width: ${progressPercent}%;"></div>

          <!-- 5 Steps -->
          <div class="relative z-10 grid grid-cols-5 text-center">
            <!-- Step 1 -->
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${stepNumber >= 1 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}">
                ${stepNumber > 1 ? '✓' : '1'}
              </div>
              <span class="text-xs font-semibold ${stepNumber >= 1 ? 'text-cyan-700' : 'text-slate-400'}">${currentLang === 'bn' ? 'পিকআপ বুকিং' : 'Pickup Booking'}</span>
            </div>

            <!-- Step 2 -->
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${stepNumber >= 2 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}">
                ${stepNumber > 2 ? '✓' : '2'}
              </div>
              <span class="text-xs font-semibold ${stepNumber >= 2 ? 'text-cyan-700' : 'text-slate-400'}">${currentLang === 'bn' ? 'ল্যাব ডায়াগনোসিস' : 'Lab Diagnosis'}</span>
            </div>

            <!-- Step 3 -->
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${stepNumber >= 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}">
                ${stepNumber > 3 ? '✓' : '3'}
              </div>
              <span class="text-xs font-semibold ${stepNumber >= 3 ? 'text-cyan-700' : 'text-slate-400'}">${currentLang === 'bn' ? 'খরচের অনুমোদন' : 'Quote Approval'}</span>
            </div>

            <!-- Step 4 -->
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${stepNumber >= 4 ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}">
                ${stepNumber > 4 ? '✓' : '4'}
              </div>
              <span class="text-xs font-semibold ${stepNumber >= 4 ? 'text-cyan-700' : 'text-slate-400'}">${currentLang === 'bn' ? 'মেরামত ও টেস্টিং' : 'Repair & QA'}</span>
            </div>

            <!-- Step 5 -->
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${stepNumber >= 5 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}">
                ${stepNumber === 5 ? '✓' : '5'}
              </div>
              <span class="text-xs font-semibold ${stepNumber >= 5 ? 'text-emerald-700' : 'text-slate-400'}">${currentLang === 'bn' ? 'ডোরস্টেপ রিটার্ন' : 'Doorstep Return'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical Quotation Decision Box -->
      ${quoteCardHtml}

      <!-- Order Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100">
        <!-- Device & Problem Info -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400">${currentLang === 'bn' ? 'ডিভাইস ও সমস্যা' : 'Device & Problem'}</h4>
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 font-medium">${getTranslation('device_lbl')}</span>
              <span class="font-bold text-slate-900">${order.brand} - ${order.model} (${order.device_type === 'phone' ? 'Phone' : 'Tablet'})</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 font-medium">${getTranslation('issues_found_lbl')}</span>
              <span class="font-semibold text-cyan-700 text-right">
                ${Array.isArray(order.issues) ? order.issues.join(', ') : order.issues}
              </span>
            </div>
            ${order.issue_description ? `
              <div class="pt-2 border-t border-slate-200 text-xs text-slate-600">
                <span class="font-semibold text-slate-700">${currentLang === 'bn' ? 'গ্রাহকের বিবরণ:' : 'Customer Note:'}</span> ${order.issue_description}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Logistics & Contact Info -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400">${currentLang === 'bn' ? 'পিকআপ ও ডেলিভারি তথ্য' : 'Logistics & Address'}</h4>
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 font-medium">${getTranslation('customer_lbl')}</span>
              <span class="font-bold text-slate-900">${order.customer_name} (${order.customer_phone})</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500 font-medium">${getTranslation('address_lbl')}</span>
              <span class="font-medium text-slate-800 text-right max-w-xs">${order.address}, ${order.area}</span>
            </div>
            <div class="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span class="text-slate-500 font-medium">${getTranslation('assigned_rider_lbl')}</span>
              <span class="font-bold ${order.pickup_agent_name ? 'text-slate-900' : 'text-amber-600'}">
                ${order.pickup_agent_name ? `${order.pickup_agent_name} (${order.pickup_agent_phone})` : getTranslation('not_assigned_yet')}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function switchTrackedOrder(orderNumber) {
  trackOrder(orderNumber);
}

// -------------------------------------------------------------
// QUOTE DECISION API CALL
// -------------------------------------------------------------
async function handleQuoteDecision(orderNumber, action) {
  const noteInput = document.getElementById('quote-customer-note');
  const customerNotes = noteInput ? noteInput.value.trim() : '';

  const confirmMsg = action === 'ACCEPT'
    ? (currentLang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই খরচে আপনার ডিভাইস মেরামত করাতে চান?' : 'Are you sure you want to approve this repair quotation?')
    : (currentLang === 'bn' ? 'আপনি কি নিশ্চিত যে এই খরচে মেরামত করতে রাজি নন? আমরা আপনার ফোনটি বিনামূল্যে ফেরত পাঠাব।' : 'Are you sure you want to decline? We will safely return your device free of charge.');

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/orders/${orderNumber}/quote-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, customer_notes: customerNotes })
    });
    const data = await res.json();

    if (data.success) {
      alert(currentLang === 'bn' ? data.message_bn : data.message_en);
      trackOrder(orderNumber);
    } else {
      alert(data.error || 'Failed to submit decision.');
    }
  } catch (err) {
    console.error('Error submitting quote decision:', err);
    alert('Server error. Please try again.');
  }
}

// -------------------------------------------------------------
// PRINT JOB SHEET & INVOICE
// -------------------------------------------------------------
function printJobSheet() {
  if (!currentTrackedOrder) return;
  const o = currentTrackedOrder;

  const printable = document.getElementById('printable-receipt');
  if (!printable) return;

  printable.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #0f172a;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #0284c7; font-size: 26px;">Repair Seba (রিপেয়ার সেবা)</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">Doorstep Smartphone & Tablet Repair Platform | Hotline: 01711-002233</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 20px; color: #0f172a;">JOB SHEET & INVOICE</h2>
          <p style="margin: 4px 0 0; font-size: 14px; font-weight: bold; color: #0284c7;">ORDER: ${o.order_number}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b;">CUSTOMER DETAILS</h4>
          <p style="margin: 4px 0;"><strong>Name:</strong> ${o.customer_name}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${o.customer_phone}</p>
          <p style="margin: 4px 0;"><strong>Address:</strong> ${o.address}, ${o.area}, ${o.city}</p>
        </div>
        <div style="background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b;">DEVICE INFORMATION</h4>
          <p style="margin: 4px 0;"><strong>Device:</strong> ${o.brand} ${o.model} (${o.device_type})</p>
          <p style="margin: 4px 0;"><strong>Reported Issue:</strong> ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${o.status}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px;">
        <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b;">DIAGNOSTIC & COST ESTIMATE</h4>
        <p style="margin: 4px 0;"><strong>Technician Findings:</strong> ${o.diagnosis_notes || 'Diagnostic in progress'}</p>
        <p style="margin: 4px 0;"><strong>Estimated / Final Cost:</strong> <span style="font-size: 18px; font-weight: bold; color: #0284c7;">৳ ${o.final_cost || o.estimated_cost}</span></p>
        <p style="margin: 4px 0;"><strong>Warranty:</strong> ${o.warranty_days || 90} Days Official Service Warranty</p>
        <p style="margin: 4px 0;"><strong>Customer Quote Decision:</strong> ${o.quote_status}</p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 1px dashed #94a3b8; font-size: 12px;">
        <div>
          <p style="margin-bottom: 30px;">_________________________</p>
          <p>Customer Signature</p>
        </div>
        <div>
          <p style="margin-bottom: 30px;">_________________________</p>
          <p>Authorized Technician / Rider</p>
        </div>
      </div>
      <p style="font-size: 11px; text-align: center; color: #94a3b8; margin-top: 20px;">Repair Seba • Terms: 100% genuine components • 90 Days warranty on service parts.</p>
    </div>
  `;

  window.print();
}

// -------------------------------------------------------------
// HERO CITY BANNER & DELIVERY CYCLIST LOGIC
// -------------------------------------------------------------
function initHeroCityBanner() {
  const statusEl = document.getElementById('cyclist-status-text');
  const cyclistClickable = document.getElementById('cyclist-clickable');
  const bellBtn = document.getElementById('banner-bell-btn');
  const chimeBubble = document.getElementById('cyclist-chime-bubble');

  const statusKeys = ['city_status_1', 'city_status_2', 'city_status_3', 'city_status_4'];
  let currentIdx = 0;

  if (statusEl) {
    statusEl.textContent = getTranslation(statusKeys[0]);

    setInterval(() => {
      statusEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      statusEl.style.opacity = '0';
      statusEl.style.transform = 'translateY(-3px)';
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % statusKeys.length;
        statusEl.textContent = getTranslation(statusKeys[currentIdx]);
        statusEl.style.opacity = '1';
        statusEl.style.transform = 'translateY(0)';
      }, 300);
    }, 3800);
  }

  // Scooter / Motorbike electric horn synthesizer using Web Audio API
  function ringMotorbikeHorn() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        // Two quick scooter horn beeps: "বিপ! বিপ!"
        [0, 0.16].forEach(delay => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(425, ctx.currentTime + delay);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(495, ctx.currentTime + delay);

          gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(ctx.currentTime + delay);
          osc2.start(ctx.currentTime + delay);
          osc1.stop(ctx.currentTime + delay + 0.13);
          osc2.stop(ctx.currentTime + delay + 0.13);
        });
      }
    } catch (e) {
      console.log('AudioContext notification', e);
    }

    // Comic Horn Pop Bubble
    if (chimeBubble) {
      chimeBubble.textContent = getTranslation('city_bell_sound_bubble') || '📢 পিপ পিপ!';
      chimeBubble.classList.remove('hidden');
      chimeBubble.classList.remove('bell-ring-active');
      void chimeBubble.offsetWidth; // Reflow
      chimeBubble.classList.add('bell-ring-active');
      setTimeout(() => {
        chimeBubble.classList.add('hidden');
      }, 1600);
    }
  }

  if (cyclistClickable) {
    cyclistClickable.addEventListener('click', (e) => {
      e.stopPropagation();
      ringMotorbikeHorn();
    });
  }

  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      ringMotorbikeHorn();
    });
  }

  window.addEventListener('languageChanged', () => {
    if (statusEl) {
      statusEl.textContent = getTranslation(statusKeys[currentIdx]);
    }
  });

  // Load and dynamically apply Hero Banner Settings from Admin
  loadAndApplyHeroSettings();

  // Load and dynamically apply Footer & Contact Settings
  loadAndApplyFooterSettings();
}

// -------------------------------------------------------------
// DYNAMIC HERO BANNER SETTINGS APPLICATION
// -------------------------------------------------------------
async function loadAndApplyHeroSettings() {
  try {
    const res = await fetch('/api/settings/hero');
    const data = await res.json();
    if (!data.success || !data.settings) return;
    const s = data.settings;

    const heroSection = document.getElementById('hero-section');
    const bikeTrack = document.getElementById('cyclist-clickable');
    const bikeScaler = document.getElementById('hero-bike-scaler');
    const tagHome = document.getElementById('landmark-tag-home');
    const tagCity = document.getElementById('landmark-tag-city');
    const tagLab = document.getElementById('landmark-tag-lab');

    // 1. Bike Visibility
    if (bikeTrack) {
      if (s.show_bike === false) {
        bikeTrack.style.display = 'none';
      } else {
        bikeTrack.style.display = '';
      }
    }

    // 2. Bike Scale / Size (Compact: 0.42, Proportional: 0.48, Medium: 0.58)
    if (bikeScaler) {
      if (s.bike_size === 'compact') {
        bikeScaler.setAttribute('transform', 'translate(24, 355) scale(0.42)');
      } else if (s.bike_size === 'medium') {
        bikeScaler.setAttribute('transform', 'translate(24, 330) scale(0.58)');
      } else {
        // default normal / proportional
        bikeScaler.setAttribute('transform', 'translate(24, 346) scale(0.48)');
      }
    }

    // 3. Bike Speed
    if (bikeTrack) {
      bikeTrack.classList.remove('speed-slow', 'speed-normal', 'speed-fast');
      if (s.bike_speed === 'slow') {
        bikeTrack.classList.add('speed-slow');
      } else if (s.bike_speed === 'fast') {
        bikeTrack.classList.add('speed-fast');
      } else {
        bikeTrack.classList.add('speed-normal');
      }
    }

    // 4. Background City Animations
    if (heroSection) {
      if (s.show_animation === false) {
        heroSection.classList.add('hero-animations-disabled');
      } else {
        heroSection.classList.remove('hero-animations-disabled');
      }
    }

    // 5. Landmark Tags
    [tagHome, tagCity, tagLab].forEach(el => {
      if (el) {
        el.style.display = s.show_tags === false ? 'none' : '';
      }
    });

    // 6. Custom Texts (Only override if custom values are provided)
    if (s.badge_text) {
      const badgeEl = document.getElementById('hero-badge-text');
      if (badgeEl) badgeEl.textContent = s.badge_text;
    }
    if (s.title_text) {
      const titleEl = document.getElementById('hero-main-title');
      if (titleEl) titleEl.textContent = s.title_text;
    }
    if (s.subtitle_text) {
      const subEl = document.getElementById('hero-main-subtitle');
      if (subEl) subEl.textContent = s.subtitle_text;
    }
    if (s.stat_1_num && s.stat_1_lbl) {
      const s1v = document.getElementById('hero-stat-1-val');
      const s1l = document.getElementById('hero-stat-1-lbl');
      if (s1v) s1v.textContent = s.stat_1_num;
      if (s1l) s1l.textContent = s.stat_1_lbl;
    }
    if (s.stat_2_num && s.stat_2_lbl) {
      const s2v = document.getElementById('hero-stat-2-val');
      const s2l = document.getElementById('hero-stat-2-lbl');
      if (s2v) s2v.textContent = s.stat_2_num;
      if (s2l) s2l.textContent = s.stat_2_lbl;
    }
    if (s.stat_3_num && s.stat_3_lbl) {
      const s3v = document.getElementById('hero-stat-3-val');
      const s3l = document.getElementById('hero-stat-3-lbl');
      if (s3v) s3v.textContent = s.stat_3_num;
      if (s3l) s3l.textContent = s.stat_3_lbl;
    }
  } catch (err) {
    console.error('Failed to apply hero settings:', err);
  }
}

// -------------------------------------------------------------
// DYNAMIC FOOTER & CONTACT SETTINGS APPLICATION
// -------------------------------------------------------------
async function loadAndApplyFooterSettings() {
  try {
    const res = await fetch('/api/settings/footer');
    const data = await res.json();
    if (!data.success || !data.settings) return;
    const s = data.settings;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.textContent = val;
    };
    const setLink = (id, href) => {
      const el = document.getElementById(id);
      if (el && href) el.href = href;
    };

    if (s.office_name) setVal('footer-office-name', s.office_name);
    if (s.office_address) setVal('footer-office-address', s.office_address);
    if (s.office_hours) setVal('footer-office-hours', s.office_hours);
    if (s.office_coverage) setVal('footer-office-coverage', s.office_coverage);
    if (s.phone_primary) setVal('footer-phone', s.phone_primary);
    if (s.phone_secondary) setVal('footer-phone2', s.phone_secondary);
    if (s.whatsapp_number) setVal('footer-whatsapp', `${s.whatsapp_number} (Live Chat)`);
    if (s.email) setVal('footer-email', s.email);

    if (s.phone_primary) setLink('footer-phone-link', `tel:${s.phone_primary.replace(/[^0-9+]/g, '')}`);
    if (s.phone_secondary) setLink('footer-phone2-link', `tel:${s.phone_secondary.replace(/[^0-9+]/g, '')}`);
    if (s.whatsapp_url) {
      setLink('footer-whatsapp-link', s.whatsapp_url);
      setLink('footer-wa-social-link', s.whatsapp_url);
    }
    if (s.email) setLink('footer-email-link', `mailto:${s.email}`);
    if (s.facebook_url) setLink('footer-fb-link', s.facebook_url);
    if (s.youtube_url) setLink('footer-yt-link', s.youtube_url);
    if (s.instagram_url) setLink('footer-ig-link', s.instagram_url);
    if (s.linkedin_url) setLink('footer-li-link', s.linkedin_url);

    if (s.brand_desc) setVal('footer-brand-desc', s.brand_desc);
    if (s.copyright_text) setVal('footer-copyright-text', s.copyright_text);

    if (s.show_social === false) {
      const socialContainer = document.getElementById('footer-social-container');
      if (socialContainer) socialContainer.style.display = 'none';
    } else {
      const socialContainer = document.getElementById('footer-social-container');
      if (socialContainer) socialContainer.style.display = '';
    }

    if (s.show_trust_badge === false) {
      const trustBadge = document.getElementById('footer-trust-badge');
      if (trustBadge) trustBadge.style.display = 'none';
    } else {
      const trustBadge = document.getElementById('footer-trust-badge');
      if (trustBadge) trustBadge.style.display = '';
    }
  } catch (err) {
    console.error('Failed to apply footer settings:', err);
  }
}

// -------------------------------------------------------------
// CUSTOMER PHONE AUTHENTICATION & PROFILE EDIT MANAGER
// -------------------------------------------------------------

let customerToken = localStorage.getItem('repair_seba_customer_token');
let currentCustomer = null;

async function initCustomerAuth() {
  if (!customerToken) {
    updateNavUserUI(false);
    return;
  }

  try {
    const res = await fetch('/api/user/me', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentCustomer = data.user;
      updateNavUserUI(true);
      autofillBookingFormWithCustomer(data.user);
    } else {
      localStorage.removeItem('repair_seba_customer_token');
      customerToken = null;
      currentCustomer = null;
      updateNavUserUI(false);
    }
  } catch (err) {
    console.error('Customer auth check error:', err);
    updateNavUserUI(false);
  }
}

function updateNavUserUI(isLoggedIn) {
  const loginBtn = document.getElementById('nav-btn-login');
  const userDropdown = document.getElementById('nav-user-dropdown');
  const displayName = document.getElementById('nav-user-display-name');
  const userSub = document.getElementById('nav-user-sub');
  const userAvatarImg = document.getElementById('nav-user-avatar');
  const userInitial = document.getElementById('nav-user-initial');
  const dropdownName = document.getElementById('dropdown-user-name');
  const dropdownPhone = document.getElementById('dropdown-user-phone');
  const dropdownAvatarImg = document.getElementById('dropdown-user-avatar');
  const dropdownInitial = document.getElementById('dropdown-user-initial');

  if (isLoggedIn && currentCustomer) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userDropdown) {
      userDropdown.classList.remove('hidden');
      userDropdown.style.display = 'flex';
    }

    const name = currentCustomer.name || 'সম্মানিত গ্রাহক';
    const initial = (name.trim().charAt(0) || 'গ').toUpperCase();

    if (displayName) displayName.textContent = name;
    if (userSub) userSub.textContent = currentCustomer.phone || '';
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownPhone) dropdownPhone.textContent = currentCustomer.phone || '';

    // Handle Nav Avatar
    if (currentCustomer.avatar && currentCustomer.avatar.trim()) {
      if (userAvatarImg) {
        userAvatarImg.src = currentCustomer.avatar;
        userAvatarImg.classList.remove('hidden');
      }
      if (userInitial) userInitial.classList.add('hidden');
      if (dropdownAvatarImg) {
        dropdownAvatarImg.src = currentCustomer.avatar;
        dropdownAvatarImg.classList.remove('hidden');
      }
      if (dropdownInitial) dropdownInitial.classList.add('hidden');
    } else {
      if (userAvatarImg) {
        userAvatarImg.src = '';
        userAvatarImg.classList.add('hidden');
      }
      if (userInitial) {
        userInitial.textContent = initial;
        userInitial.classList.remove('hidden');
      }
      if (dropdownAvatarImg) {
        dropdownAvatarImg.src = '';
        dropdownAvatarImg.classList.add('hidden');
      }
      if (dropdownInitial) {
        dropdownInitial.textContent = initial;
        dropdownInitial.classList.remove('hidden');
      }
    }
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userDropdown) {
      userDropdown.classList.add('hidden');
      userDropdown.style.display = 'none';
    }
  }
}

function updateProfileAvatarPreview(url) {
  const preview = document.getElementById('profile-modal-avatar-preview');
  const initial = document.getElementById('profile-modal-avatar-initial');
  if (url && url.trim()) {
    if (preview) {
      preview.src = url.trim();
      preview.classList.remove('hidden');
    }
    if (initial) initial.classList.add('hidden');
  } else {
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (initial) initial.classList.remove('hidden');
  }
}

function clearProfileAvatar() {
  const input = document.getElementById('profile-edit-avatar');
  if (input) input.value = '';
  updateProfileAvatarPreview('');
}

function selectAvatarPreset(url) {
  const input = document.getElementById('profile-edit-avatar');
  if (input) input.value = url;
  updateProfileAvatarPreview(url);
}

window.updateProfileAvatarPreview = updateProfileAvatarPreview;
window.clearProfileAvatar = clearProfileAvatar;
window.selectAvatarPreset = selectAvatarPreset;

function openUserLoginModal() {
  const modal = document.getElementById('user-login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('user-login-phone')?.focus();
  }
}

function closeUserLoginModal() {
  const modal = document.getElementById('user-login-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleUserDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.toggle('hidden');
}

function closeUserDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.add('hidden');
}

// Close dropdown if user clicks outside
window.addEventListener('click', (e) => {
  const container = document.getElementById('nav-user-container');
  if (container && !container.contains(e.target)) {
    closeUserDropdown();
  }
});

async function handleUserPhoneLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  const phoneInput = document.getElementById('user-login-phone');
  const nameInput = document.getElementById('user-login-name');
  const submitBtn = document.getElementById('btn-user-login-submit');

  const phone = phoneInput ? phoneInput.value.trim() : '';
  const name = nameInput ? nameInput.value.trim() : '';

  if (!phone || phone.length < 11) {
    alert('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    phoneInput?.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳</span> <span>যাচাই করা হচ্ছে...</span>`;
  }

  try {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name })
    });
    const data = await res.json();

    if (data.success) {
      customerToken = data.token;
      currentCustomer = data.user;
      localStorage.setItem('repair_seba_customer_token', customerToken);

      closeUserLoginModal();
      updateNavUserUI(true);
      autofillBookingFormWithCustomer(data.user);

      alert(`স্বাগতম, ${data.user.name || 'গ্রাহক'}! আপনার অ্যাকাউন্ট সফলভাবে লগইন হয়েছে। আপনি যেকোনো সময় আপনার প্রোফাইল ও অর্ডার পরিচালনা করতে পারবেন।`);
    } else {
      alert(data.error || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  } catch (err) {
    console.error('Phone login error:', err);
    alert('সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>⚡</span> <span>লগইন / প্রবেশ করুন</span>`;
    }
  }
}

function openUserProfileModal(tab = 'profile') {
  if (!currentCustomer) {
    openUserLoginModal();
    return;
  }

  const modal = document.getElementById('user-profile-modal');
  if (!modal) return;

  // Populate profile form fields
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('profile-edit-phone', currentCustomer.phone);
  setVal('profile-edit-name', currentCustomer.name === 'সম্মানিত গ্রাহক' ? '' : currentCustomer.name);
  setVal('profile-edit-avatar', currentCustomer.avatar || '');
  setVal('profile-edit-email', currentCustomer.email);
  setVal('profile-edit-address', currentCustomer.address);
  setVal('profile-edit-area', currentCustomer.area);
  setVal('profile-edit-city', currentCustomer.city || 'Dhaka');

  // Update top modal profile card
  const modalName = document.getElementById('profile-modal-display-name');
  const modalPhone = document.getElementById('profile-modal-display-phone');
  if (modalName) modalName.textContent = currentCustomer.name || 'সম্মানিত গ্রাহক';
  if (modalPhone) modalPhone.textContent = currentCustomer.phone || '';
  updateProfileAvatarPreview(currentCustomer.avatar || '');

  switchProfileModalTab(tab);
  modal.classList.remove('hidden');
}

function closeUserProfileModal() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) modal.classList.add('hidden');
}

function switchProfileModalTab(tab) {
  const profileTab = document.getElementById('profile-tab-content');
  const ordersTab = document.getElementById('orders-tab-content');
  const btnProfile = document.getElementById('modal-tab-btn-profile');
  const btnOrders = document.getElementById('modal-tab-btn-orders');

  if (tab === 'profile') {
    if (profileTab) profileTab.classList.remove('hidden');
    if (ordersTab) ordersTab.classList.add('hidden');

    btnProfile?.classList.add('bg-cyan-600', 'text-white', 'shadow-xs');
    btnProfile?.classList.remove('bg-slate-100', 'text-slate-700');

    btnOrders?.classList.remove('bg-cyan-600', 'text-white', 'shadow-xs');
    btnOrders?.classList.add('bg-slate-100', 'text-slate-700');
  } else {
    if (profileTab) profileTab.classList.add('hidden');
    if (ordersTab) ordersTab.classList.remove('hidden');

    btnOrders?.classList.add('bg-cyan-600', 'text-white', 'shadow-xs');
    btnOrders?.classList.remove('bg-slate-100', 'text-slate-700');

    btnProfile?.classList.remove('bg-cyan-600', 'text-white', 'shadow-xs');
    btnProfile?.classList.add('bg-slate-100', 'text-slate-700');

    loadCustomerOrders();
  }
}

async function handleUserProfileSave(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (!customerToken) {
    alert('প্রোফাইল আপডেট করতে অনুগ্রহ করে লগইন করুন।');
    return;
  }

  const name = document.getElementById('profile-edit-name')?.value.trim();
  const avatar = document.getElementById('profile-edit-avatar')?.value.trim() || '';
  const email = document.getElementById('profile-edit-email')?.value.trim();
  const address = document.getElementById('profile-edit-address')?.value.trim();
  const area = document.getElementById('profile-edit-area')?.value.trim();
  const city = document.getElementById('profile-edit-city')?.value.trim();
  const saveBtn = document.getElementById('btn-save-user-profile');
  const msgEl = document.getElementById('profile-save-message');

  if (!name) {
    alert('অনুগ্রহ করে আপনার নাম লিখুন।');
    document.getElementById('profile-edit-name')?.focus();
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>⏳</span> <span>সংরক্ষণ হচ্ছে...</span>`;
  }

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ name, email, avatar, address, area, city })
    });
    const data = await res.json();

    if (data.success) {
      currentCustomer = data.user;
      updateNavUserUI(true);
      autofillBookingFormWithCustomer(data.user);

      if (msgEl) {
        msgEl.textContent = '✓ প্রোফাইল সফলভাবে আপডেট করা হয়েছে!';
        msgEl.classList.remove('hidden');
        setTimeout(() => msgEl.classList.add('hidden'), 4000);
      }
      alert('আপনার প্রোফাইল তথ্য সফলভাবে আপডেট ও সংরক্ষণ করা হয়েছে!');
    } else {
      alert(data.error || 'আপডেট ব্যর্থ হয়েছে।');
    }
  } catch (err) {
    console.error('Update profile error:', err);
    alert('সার্ভার এরর।');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>💾</span> <span>প্রোফাইল সংরক্ষণ করুন</span>`;
    }
  }
}

async function loadCustomerOrders() {
  const container = document.getElementById('user-orders-list-container');
  const countBadge = document.getElementById('user-orders-count');
  if (!container) return;

  container.innerHTML = `<div class="p-8 text-center text-slate-500">আপনার অর্ডারসমূহ লোড হচ্ছে...</div>`;

  try {
    const res = await fetch('/api/user/orders', {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const data = await res.json();

    if (data.success) {
      const orders = data.orders || [];
      if (countBadge) countBadge.textContent = orders.length;

      if (orders.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
            <span class="text-3xl block mb-2">📦</span>
            <div class="font-bold text-slate-800 text-sm">কোনো রিপেয়ার অর্ডার পাওয়া যায়নি</div>
            <p class="text-xs text-slate-500 mt-1 mb-4">আপনার মোবাইল নম্বর দিয়ে এখনো কোনো ডিভাইস রিপেয়ার অর্ডার করা হয়নি।</p>
            <a href="#booking-section" onclick="closeUserProfileModal();" class="inline-flex px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition">
              + এখনই পিকআপ বুক করুন
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(o => {
        const dateFormatted = new Date(o.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
        const st = (typeof STATUS_MAP !== 'undefined' ? STATUS_MAP[o.status] : null) || { bn: o.status, en: o.status, color: 'bg-slate-100 text-slate-700 border-slate-300' };

        return `
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-300 transition">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono font-black text-cyan-700 text-sm">${o.order_number}</span>
                <span class="text-xs text-slate-400">• ${dateFormatted}</span>
              </div>
              <div class="font-bold text-slate-800 text-sm">
                ${o.brand} ${o.model} 
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">${o.device_type}</span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                সমস্যা: ${Array.isArray(o.issues) ? o.issues.join(', ') : o.issues}
              </div>
            </div>

            <div class="flex items-center gap-2 sm:self-center">
              <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${st.color}">
                ${st.bn}
              </span>
              <button onclick="closeUserProfileModal(); trackDirectOrder('${o.order_number}');" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-xs">
                ট্র্যাক করুন
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Failed to load customer orders:', err);
    container.innerHTML = `<div class="p-6 text-center text-rose-500 text-xs">অর্ডার লোড করতে সমস্যা হয়েছে।</div>`;
  }
}

function trackDirectOrder(orderNumber) {
  const trackInput = document.getElementById('track-input');
  if (trackInput) trackInput.value = orderNumber;
  const trackSec = document.getElementById('track-section');
  if (trackSec) trackSec.scrollIntoView({ behavior: 'smooth' });
  if (typeof trackOrder === 'function') trackOrder(orderNumber);
}

function autofillBookingFormWithCustomer(user) {
  if (!user) return;
  const setIfEmpty = (id, val) => {
    const el = document.getElementById(id);
    if (el && !el.value && val) el.value = val;
  };
  setIfEmpty('customer-name', user.name === 'সম্মানিত গ্রাহক' ? '' : user.name);
  setIfEmpty('customer-phone', user.phone);
  setIfEmpty('customer-address', user.address);
  setIfEmpty('customer-area', user.area);
}

function handleUserLogout() {
  if (!confirm('আপনি কি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?')) return;

  if (customerToken) {
    fetch('/api/user/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).catch(() => {});
  }

  localStorage.removeItem('repair_seba_customer_token');
  customerToken = null;
  currentCustomer = null;
  updateNavUserUI(false);
  alert('আপনি সফলভাবে লগআউট হয়েছেন।');
}




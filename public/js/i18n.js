// Repair Seba - Complete Bilingual (Bangla & English) Dictionary

const translations = {
  bn: {
    // Brand & Header
    brand_name: "রিপেয়ার সেবা",
    brand_tagline: "ডোরস্টেপ ফোন ও ট্যাব মেরামত সার্ভিস",
    nav_home: "হোম",
    nav_services: "সার্ভিসসমূহ",
    nav_how_it_works: "কাজের ধাপ",
    nav_book: "রিপেয়ার বুক করুন",
    nav_track: "অর্ডার ট্র্যাক",
    nav_contact: "যোগাযোগ",
    nav_admin: "অ্যাডমিন প্যানেল",
    call_support: "হটলাইন: ০১৭১১-০০২২৩৩",

    // Hero Section
    hero_badge: "✨ বাংলাদেশে প্রথম ডিজিটাল ডোরস্টেপ রিপেয়ার সেবা",
    hero_title: "ঘরে বসেই নষ্ট ফোন ও ট্যাব মেরামত করুন",
    hero_subtitle: "আপনার ঠিকানায় গিয়ে নষ্ট ফোন বা ট্যাব সংগ্রহ করব, ল্যাবে পরীক্ষা করে খরচের হিসাব জানাব। আপনি রাজি হলে মেরামত করে আবার আপনার ঠিকানায় পৌঁছে দেব!",
    hero_cta_book: "এখনই পিকআপ বুক করুন",
    hero_cta_track: "অর্ডার ট্র্যাক করুন",
    hero_stat_1_num: "১৫,০০০+",
    hero_stat_1_lbl: "সফলভাবে মেরামতকৃত ডিভাইস",
    hero_stat_2_num: "৯০-১৮০ দিন",
    hero_stat_2_lbl: "সার্ভিস ওয়ারেন্টি",
    hero_stat_3_num: "ফ্রি পিকআপ",
    hero_stat_3_lbl: "ও ডোরস্টেপ ডেলিভারি",

    // Quick Tracker in Hero
    track_quick_title: "আপনার ডিভাইসের বর্তমান অবস্থা জানুন",
    track_input_placeholder: "অর্ডার আইডি (যেমন: RS-841920) অথবা ফোন নম্বর দিন...",
    track_btn_search: "ট্র্যাক করুন",

    // City Scene & Delivery Hero Banner
    city_banner_tag: "🔴 লাইভ ডোরস্টেপ সার্ভিস",
    city_banner_hint: "🛵 রাইডারে ক্লিক করে হর্ন বাজান 📢 | হোভার করলে স্পিড বাড়বে 💨",
    city_bell_btn: "হর্ন বাজান 📢",
    city_pickup_point: "🏡 পিকআপ: গ্রাহকের বাসা",
    city_lab_point: "🔬 ল্যাব ও সার্ভিস সেন্টার",
    city_metro_badge: "🚇 ঢাকা সিটি এক্সপ্রেস রুট",
    city_status_1: "🛵 বাসা থেকে নষ্ট ফোন পিকআপ হচ্ছে...",
    city_status_2: "🔬 এক্সপার্ট ল্যাবে টেস্ট ও খরচের হিসাব...",
    city_status_3: "🛠️ অরিজিনাল পার্টস দিয়ে নিখুঁত মেরামত...",
    city_status_4: "📦 অক্ষত অবস্থায় ফ্রি ডোরস্টেপ ডেলিভারি!",
    city_bell_sound_bubble: "📢 পিপ পিপ!",

    // How It Works
    how_title: "আমরা যেভাবে সেবা প্রদান করি",
    how_subtitle: "ঝামেলাহীন ও বিশ্বস্ত ৪টি সহজ ধাপে আপনার ফোন বা ট্যাব ঠিক করিয়ে নিন",
    step1_num: "০১",
    step1_title: "অনলাইনে অর্ডার ও ফ্রি পিকআপ",
    step1_desc: "ওয়েবসাইটে আপনার ফোন বা ট্যাবের সমস্যা লিখে বুক করুন। আমাদের প্রতিনিধি আপনার বাসায়/অফিসে গিয়ে ডিভাইসটি সংগ্রহ করে নিয়ে আসবে।",
    step2_num: "০২",
    step2_title: "ল্যাব ডায়াগনোসিস ও খরচের হিসাব",
    step2_desc: "আমাদের এক্সপার্ট ল্যাবে ফোনটি সম্পূর্ণ টেস্ট করা হবে। আমরা আপনাকে কল করে এবং অনলাইনে জানাব ঠিক করতে মোট কত টাকা লাগবে।",
    step3_num: "০৩",
    step3_title: "গ্রাহকের সিদ্ধান্ত ও অনুমোদন",
    step3_desc: "খরচে আপনি সম্মত (Agree) হলে আমরা অরিজিনাল পার্টস দিয়ে মেরামত শুরু করব। সম্মত না হলে ডিভাইসটি অক্ষত অবস্থায় বিনামূল্যে ফেরত পাঠানো হবে।",
    step4_num: "০৪",
    step4_title: "দ্রুত মেরামত ও ডোরস্টেপ ডেলিভারি",
    step4_desc: "কোয়ালিটি টেস্টিং ও ওয়ারেন্টি স্লিপ সহ আমাদের রাইডার আপনার পূর্বের ঠিকানায় ফোনটি পৌঁছে দেবে। চেক করে ক্যাশ বা বিকাশে পেমেন্ট করবেন।",

    // Services Section
    services_title: "আমাদের রিপেয়ার সার্ভিসসমূহ",
    services_subtitle: "যেকোনো ব্র্যান্ডের ফোন বা ট্যাবের নির্ভরযোগ্য সলিউশন",
    filter_all: "সকল সার্ভিস",
    filter_phone: "স্মার্টফোন / মোবাইল",
    filter_tablet: "ট্যাবলেট / ট্যাব",
    starting_from: "শুরু মাত্র ৳",
    warranty_prefix: "ওয়ারেন্টি: ",
    time_prefix: "সময়: ",
    btn_book_service: "এই সার্ভিস বুক করুন",

    // Booking Section
    book_title: "ডোরস্টেপ রিপেয়ার বুকিং ফর্ম",
    book_subtitle: "নিচের তথ্যগুলো দিন, আমাদের রাইডার আপনার ঠিকানায় পৌঁছে যাবে",
    device_type_label: "ডিভাইসের ধরন নির্বাচন করুন*",
    type_phone: "স্মার্টফোন (Phone)",
    type_tablet: "ট্যাবলেট (Tab / iPad)",
    brand_label: "ব্র্যান্ড নির্বাচন করুন*",
    brand_select_default: "-- ব্র্যান্ড পছন্দ করুন --",
    model_label: "মডেলের নাম লিখুন*",
    model_placeholder: "যেমন: Galaxy S21 / iPhone 13 / Redmi Note 11 / iPad 9th Gen",
    issues_label: "সমস্যাসমূহ টিক দিন (একাধিক নির্বাচন করা যাবে)*",
    desc_label: "সমস্যার বিস্তারিত বিবরণ (যদি থাকে)",
    desc_placeholder: "ফোনে কি সমস্যা হচ্ছে বা কিভাবে নষ্ট হয়েছে সংক্ষেপে লিখুন...",
    cust_info_heading: "আপনার যোগাযোগের তথ্য ও ঠিকানা",
    name_label: "আপনার সম্পূর্ণ নাম*",
    name_placeholder: "যেমন: মোঃ আব্দুল্লাহ",
    phone_label: "সচল মোবাইল নম্বর (১১ ডিজিট)*",
    phone_placeholder: "০১৭১১-XXXXXX",
    alt_phone_label: "বিকল্প মোবাইল নম্বর (ঐচ্ছিক)",
    alt_phone_placeholder: "০১৮XX-XXXXXX",
    area_label: "এলাকা নির্বাচন করুন*",
    area_select_default: "-- এলাকা পছন্দ করুন --",
    address_label: "সম্পূর্ণ ঠিকানা (বাসা নং, রোড, ফ্ল্যাট/ল্যান্ডমার্ক)*",
    address_placeholder: "যেমন: বাসা নং ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা",
    date_label: "পছন্দের পিকআপ তারিখ",
    time_slot_label: "পছন্দের সময়",
    slot_morning: "সকাল ১০:০০ - দুপুর ১:০০",
    slot_afternoon: "দুপুর ২:০০ - বিকাল ৫:০০",
    slot_evening: "সন্ধ্যা ৬:০০ - রাত ৯:০০",
    btn_submit_order: "রিপেয়ার পিকআপ নিশ্চিত করুন",
    booking_terms: "🔒 আপনার ডিভাইসের ডাটা এবং যন্ত্রাংশের পূর্ণ নিরাপত্তা আমাদের প্রতিশ্রুতি। নো ফিক্স, নো ফি নীতি।",

    // Tracking Section
    track_section_title: "লাইভ অর্ডার ট্র্যাকিং ও সিদ্ধান্ত পোর্টাল",
    track_section_subtitle: "আপনার ডিভাইসের বর্তমান অগ্রগতি দেখুন এবং প্রয়োজনে খরচের অনুমোদন দিন",
    track_search_btn: "তথ্য খুঁজুন",
    order_details_title: "অর্ডার বিবরণী",
    order_no_lbl: "অর্ডার নং:",
    device_lbl: "ডিভাইস:",
    customer_lbl: "গ্রাহক:",
    address_lbl: "পিকআপ ঠিকানা:",
    assigned_rider_lbl: "নির্ধারিত পিকআপ রাইডার:",
    not_assigned_yet: "শীঘ্রই প্রতিনিধি নির্ধারিত হবে",
    issues_found_lbl: "উল্লেখিত সমস্যাসমূহ:",
    current_status_lbl: "বর্তমান অবস্থা:",

    // Quote Box in Tracker (Very important)
    quote_box_title: "⚠️ ল্যাব ডায়াগনোসিস ও খরচের হিসাব (গ্রাহকের সিদ্ধান্ত প্রয়োজন)",
    quote_cost_lbl: "সার্ভিসের আনুমানিক খরচ:",
    quote_warranty_lbl: "ওয়ারেন্টি মেয়াদ:",
    quote_diagnosis_lbl: "টেকনিশিয়ানের পরীক্ষা রিপোর্ট:",
    quote_customer_note_placeholder: "কোনো বিশেষ অনুরোধ বা মন্তব্য থাকলে এখানে লিখুন (ঐচ্ছিক)...",
    btn_accept_quote: "✅ খরচ অনুমোদন করুন ও মেরামত শুরু করুন",
    btn_reject_quote: "❌ প্রস্তাবিত খরচ বাতিল করুন ও ডিভাইস ফেরত নিন",
    quote_accepted_badge: "🎉 আপনি সফলভাবে এই খরচে সম্মতি দিয়েছেন। মেরামত কাজ চলছে।",
    quote_rejected_badge: "ℹ️ আপনি প্রস্তাবিত খরচে অসম্মতি জানিয়েছেন। ডিভাইসটি অক্ষতভাবে ফেরত দেওয়া হবে।",
    quote_terms: "💡 নো ফিক্স, নো ফি। কাজ সন্তোষজনক না হলে কোনো সার্ভিস চার্জ নেওয়া হয় না।",

    // Invoice & Actions
    btn_print_receipt: "রসিদ / জব শিট প্রিন্ট করুন",
    btn_whatsapp_help: "হোয়াটসঅ্যাপে সাহায্য নিন",

    // Why Choose Us
    why_title: "কেন রিপেয়ার সেবা সেরা?",
    why_subtitle: "আমরা শুধু মেরামত করি না, দিই পূর্ণ মানসিক শান্তি",
    why_1_title: "ফ্রি ডোরস্টেপ পিকআপ ও ড্রপ",
    why_1_desc: "আপনাকে জ্যামে নষ্ট করে কোনো দোকানে যেতে হবে না। আমাদের নিজস্ব রাইডার আপনার বাসায় আসবে।",
    why_2_title: "শতভাগ অরিজিনাল পার্টস",
    why_2_desc: "ডিসপ্লে, ব্যাটারি ও আইসিতে সরাসরি অরিজিনাল ও গ্রেড-এ সার্টিফাইড যন্ত্রাংশ ব্যবহার করা হয়।",
    why_3_title: "স্বচ্ছ মূল্য ও আগে জানানোর নিয়ম",
    why_3_desc: "আপনার ফোন খোলার পর আগে জানানো হবে খরচ কত হবে। আপনি রাজি হলেই কেবল কাজ করা হবে।",
    why_4_title: "৯০ থেকে ১৮০ দিন পর্যন্ত ওয়ারেন্টি",
    why_4_desc: "সার্ভিসিং এর পর কোনো ত্রুটি দেখা দিলে নির্ধারিত মেয়াদের মধ্যে সম্পূর্ণ বিনামূল্যে সমাধান।",

    // Contact & Footer
    contact_title: "আমাদের সাথে যোগাযোগ",
    contact_subtitle: "যেকোনো তথ্য বা সরাসরি প্রশ্নের জন্য মেসেজ দিন",
    contact_name: "নাম",
    contact_phone: "ফোন নম্বর",
    contact_message: "আপনার বার্তা",
    contact_submit: "বার্তা পাঠান",
    footer_text: "© ২০২৬ রিপেয়ার সেবা (Repair Seba). সর্বস্বত্ব সংরক্ষিত। নির্ভরযোগ্য মোবাইল ও ট্যাবলেট মেরামত প্রতিষ্ঠান।",

    // Admin Management Portal Translations (Bangla)
    admin_brand_name: "রিপেয়ার সেবা (Repair Seba)",
    admin_trade_code: "ট্রেড কোড: RS-২০২৬",
    admin_login_subtitle: "ল্যাব ও ডোরস্টেপ রিপেয়ার ম্যানেজমেন্ট প্যানেল",
    admin_login_username_lbl: "ইউজারনেম / Username",
    admin_login_password_lbl: "পাসওয়ার্ড / Password",
    admin_login_demo_hint: "🔑 ডিফল্ট লগইন: admin / admin123",
    admin_login_btn: "লগইন করুন (Sign In)",
    admin_back_to_site: "← কাস্টমার ওয়েবসাইটে ফিরে যান",
    admin_sidebar_menu: "প্রধান মেনু",
    admin_tab_overview: "ওভারভিউ",
    admin_tab_hero: "হিরো ব্যানার",
    admin_tab_orders: "অর্ডার আবেদন",
    admin_tab_customers: "গ্রাহক একাউন্টসমূহ",
    admin_tab_services: "সার্ভিস ব্যবস্থাপনা",
    admin_tab_inquiries: "প্রাপ্ত বার্তা ও ইনকোয়ারি",
    admin_tab_footer: "অফিস ও ফুটার",
    admin_tab_users: "প্রোফাইল ও ইউজার কন্ট্রোল",
    admin_overview_title: "ড্যাশবোর্ড ওভারভিউ",
    admin_overview_sub: "রিপেয়ার সেবার সকল সার্ভিসের লাইভ ডাটা, পিকআপ ট্র্যাকিং, মেরামত পরিসংখ্যান ও সাম্প্রতিক কার্যক্রমের সারসংক্ষেপ",
    admin_btn_orders_shortcut: "অর্ডার আবেদন ও ব্যবস্থাপনা",
    admin_stat_total_orders: "মোট অর্ডার",
    admin_stat_pending: "অপেক্ষমাণ",
    admin_stat_repair_lab: "মেরামত ও ল্যাব",
    admin_stat_quote_pending: "অনুমোদন বাকি",
    admin_stat_inquiries: "প্রাপ্ত বার্তা",
    admin_stat_completed: "পুরাতন ডিভাইস",
    admin_stat_services: "সার্ভিস ক্যাটাগরি",
    admin_stat_revenue: "মোট আদায়",
    admin_unit_pcs: "টি",
    admin_badge_live: "রিয়েল",
    admin_badge_new: "নতুন",
    admin_recent_orders_title: "সর্বশেষ অর্ডারসমূহ (অনলাইন পোর্টাল)",
    admin_btn_view_all_orders: "সকল অর্ডার ব্যবস্থাপনা করুন →",
    admin_th_tracking_id: "ট্র্যাকিং আইডি",
    admin_th_customer_name: "গ্রাহকের নাম",
    admin_th_device_issue: "ডিভাইস ও সমস্যা",
    admin_th_mobile: "মোবাইল",
    admin_th_date: "তারিখ",
    admin_th_status: "বর্তমান অবস্থা",
    admin_th_action: "অ্যাকশন",
    admin_recent_messages_title: "সর্বশেষ প্রাপ্ত বার্তা (ওয়েবসাইট অনুসন্ধান)",
    admin_all_messages_btn: "সকল বার্তা →",
    admin_recent_notices_title: "সর্বশেষ প্রকাশিত নোটিশ ও পলিসি আপডেট",
    admin_all_services_btn: "সকল সার্ভিস →",
    admin_orders_title: "অর্ডার আবেদন ও মেরামত ট্র্যাকিং ব্যবস্থাপনা",
    admin_orders_sub: "ওয়েবসাইট থেকে আসা সকল অনলাইন সার্ভিস রিকোয়েস্ট পরিচালনা, স্ট্যাটাস পরিবর্তন, রাইডার নির্ধারণ ও কোটেশন আপডেট",
    admin_orders_table_title: "সকল অর্ডার আবেদন তালিকা",
    admin_filter_all: "সকল",
    admin_filter_pending: "অপেক্ষমাণ",
    admin_filter_approved: "অনুমোদিত",
    admin_filter_in_repair: "মেরামত",
    admin_filter_completed: "সম্পন্ন",
    admin_order_search_placeholder: "অর্ডার আইডি, ফোন বা নাম...",
    admin_cust_tag: "রিয়েল-টাইম গ্রাহক ডাটাবেস",
    admin_cust_title: "ওয়েবসাইটে নিবন্ধিত গ্রাহক একাউন্টসমূহ",
    admin_cust_sub: "ইউজার ওয়েবসাইট থেকে গ্রাহকরা যখনই নতুন একাউন্ট তৈরি করবে, ফোন দিয়ে লগইন করবে বা অর্ডার প্লেস করবে, তাদের প্রোফাইল ছবি, নাম, মোবাইল নম্বর, ঠিকানা ও সমস্ত বিবরণ স্বয়ংক্রিয়ভাবে এখানে চলে আসবে।",
    admin_cust_stat_total: "মোট গ্রাহক",
    admin_cust_stat_ordered: "অর্ডারকারী",
    admin_cust_stat_recent: "নতুন যুক্ত",
    admin_cust_table_title: "সমস্ত গ্রাহকদের তালিকা ও প্রোফাইল বিবরণ",
    admin_cust_search_placeholder: "নাম, ফোন বা এলাকা দিয়ে খুঁজুন...",
    admin_cust_filter_all: "সব গ্রাহক",
    admin_cust_filter_with_orders: "যাদের অর্ডার আছে",
    admin_cust_filter_no_orders: "নতুন (অর্ডার ছাড়া)",
    admin_cust_th_profile: "গ্রাহকের প্রোফাইল ও নাম",
    admin_cust_th_phone: "মোবাইল নম্বর",
    admin_cust_th_email: "ইমেইল",
    admin_cust_th_address: "ঠিকানা ও এরিয়া",
    admin_cust_th_orders: "সর্বমোট অর্ডার",
    admin_cust_th_registered: "রেজিস্ট্রেশন",
    admin_services_title: "আমাদের রিপেয়ার সার্ভিসসমূহ",
    admin_services_sub: "হোমপেজে প্রদর্শিত রিপেয়ার সার্ভিসের নাম, ফি, বিবরণ, আইকন ও স্ট্যাটাস সরাসরি সম্পাদনা ও নিয়ন্ত্রণ করুন",
    admin_btn_add_service: "নতুন সার্ভিস যোগ করুন",
    admin_inquiries_title: "গ্রাহকদের মেসেজ ও যোগাযোগ",
    admin_inquiries_sub: "কন্টাক্ট ফর্মের মাধ্যমে পাঠানো কাস্টমার অনুসন্ধানসমূহ",
    admin_hero_title: "হিরো ব্যানার ও বাইক অ্যানিমেশন কন্ট্রোল",
    admin_hero_sub: "ওয়েবসাইটের হোমপেজের হিরো ব্যানার, ডেলিভারি বাইক, গতি ও টেক্সট কাস্টমাইজ করুন",
    admin_btn_restore_default: "🔄 ডিফল্ট রিস্টোর",
    admin_btn_save_changes: "পরিবর্তন সংরক্ষণ করুন",
    admin_footer_title: "অফিস ঠিকানা, যোগাযোগ নম্বর ও সোশ্যাল মিডিয়া কন্ট্রোল",
    admin_footer_sub: "ওয়েবসাইটের নিচের ফুটারে প্রদর্শিত অফিস লোকেশন, কাস্টমার হেল্পলাইন ও সোশ্যাল লিংক আপডেট করুন।",
    admin_users_title: "প্রোফাইল তৈরি, টিম ও এক্সেস কন্ট্রোল",
    admin_users_sub: "এখানে আপনি নিজের প্রোফাইল সাজাতে পারবেন, নতুন সাব-অ্যাডমিন ও টিম মেম্বারদের প্রোফাইল তৈরি করতে পারবেন এবং তারা অ্যাডমিন প্যানেলে কি কি অপশন ব্যবহার করতে পারবে তা নিয়ন্ত্রণ করতে পারবেন।",
    admin_btn_create_profile: "➕ নতুন প্রোফাইল তৈরি",
    admin_btn_my_profile: "✏️ আমার প্রোফাইল",
    admin_btn_logout: "লগআউট",
    admin_btn_save: "সংরক্ষণ করুন",
    admin_btn_cancel: "বাতিল",
    admin_profile_settings_title: "আমার প্রোফাইল ও ছবি",
    admin_profile_full_name: "পূর্ণ নাম (Full Name)*",
    admin_profile_username: "ইউজারনেম (Username)",
    admin_profile_phone: "মোবাইল ফোন (Phone)",
    admin_profile_email: "ইমেইল (Email)",
    admin_profile_new_pwd: "নতুন পাসওয়ার্ড (ঐচ্ছিক / Leave blank to keep current)",
    admin_profile_upload_btn: "মোবাইল বা পিসি থেকে ছবি দিন",
    admin_profile_remove_pic: "✕ ছবি মুছুন",
    admin_role_superadmin: "সুপার অ্যাডমিন",
    admin_role_admin: "অ্যাডমিন",
    admin_role_manager: "অপারেশন ম্যানেজার",
    admin_role_technician: "ল্যাব টেকনিশিয়ান",
    admin_role_support: "কাস্টমার সাপোর্ট"
  },

  en: {
    // Brand & Header
    brand_name: "Repair Seba",
    brand_tagline: "Doorstep Phone & Tablet Repair Platform",
    nav_home: "Home",
    nav_services: "Services",
    nav_how_it_works: "How It Works",
    nav_book: "Book Repair",
    nav_track: "Track Order",
    nav_contact: "Contact",
    nav_admin: "Admin Portal",
    call_support: "Hotline: 01711-002233",

    // Hero Section
    hero_badge: "✨ Bangladesh's Premier Digital Doorstep Repair Service",
    hero_title: "Get Your Broken Phone & Tablet Repaired from Home",
    hero_subtitle: "We collect your damaged device directly from your doorstep, inspect it in our certified lab, and provide a transparent quotation. Upon your approval, we fix it and deliver it safely back to you!",
    hero_cta_book: "Book Doorstep Pickup",
    hero_cta_track: "Track Existing Order",
    hero_stat_1_num: "15,000+",
    hero_stat_1_lbl: "Devices Successfully Repaired",
    hero_stat_2_num: "90-180 Days",
    hero_stat_2_lbl: "Repair Warranty",
    hero_stat_3_num: "Free Pickup",
    hero_stat_3_lbl: "& Doorstep Delivery",

    // Quick Tracker in Hero
    track_quick_title: "Check Your Repair Status Instantly",
    track_input_placeholder: "Enter Order ID (e.g. RS-841920) or Phone Number...",
    track_btn_search: "Track Now",

    // City Scene & Delivery Hero Banner
    city_banner_tag: "🔴 Live Doorstep Service",
    city_banner_hint: "🛵 Click rider to honk horn 📢 | Hover for turbo speed 💨",
    city_bell_btn: "Honk Horn 📢",
    city_pickup_point: "🏡 Pickup: Customer Doorstep",
    city_lab_point: "🔬 Lab & Service Center",
    city_metro_badge: "🚇 Dhaka Express Transit Route",
    city_status_1: "🛵 Picking up damaged phone from doorstep...",
    city_status_2: "🔬 Lab diagnosis & transparent cost estimation...",
    city_status_3: "🛠️ Precision repair with genuine parts...",
    city_status_4: "📦 Safe & fast doorstep return with warranty!",
    city_bell_sound_bubble: "📢 Beep Beep!",

    // How It Works
    how_title: "How Repair Seba Works",
    how_subtitle: "Hassle-free, transparent 4-step repair workflow right at your doorstep",
    step1_num: "01",
    step1_title: "Book Online & Doorstep Pickup",
    step1_desc: "Submit your device details and address. Our verified courier will collect the broken device directly from your home or office.",
    step2_num: "02",
    step2_title: "Lab Diagnosis & Price Quotation",
    step2_desc: "Our senior technicians run a thorough diagnostic test. We notify you via call and online system with the exact repair cost.",
    step3_num: "03",
    step3_title: "Customer Decision & Approval",
    step3_desc: "If you agree to the quoted cost, we begin repairing with original OEM parts. If you decline, your device is returned safely at zero repair charge.",
    step4_num: "04",
    step4_title: "Repaired & Delivered to Your Door",
    step4_desc: "After multi-point QA testing and warranty certification, our rider delivers the device back to your address. Pay after verification.",

    // Services Section
    services_title: "Our Repair Services",
    services_subtitle: "Reliable, high-grade solutions for all major phone and tablet brands",
    filter_all: "All Services",
    filter_phone: "Smartphones",
    filter_tablet: "Tablets / iPads",
    starting_from: "Starts from ৳",
    warranty_prefix: "Warranty: ",
    time_prefix: "Time: ",
    btn_book_service: "Book This Service",

    // Booking Section
    book_title: "Book Doorstep Repair Pickup",
    book_subtitle: "Fill in the details below and our pickup rider will arrive at your address",
    device_type_label: "Select Device Type*",
    type_phone: "Smartphone / Mobile",
    type_tablet: "Tablet / iPad",
    brand_label: "Select Brand*",
    brand_select_default: "-- Choose Brand --",
    model_label: "Model Name / Number*",
    model_placeholder: "e.g. Galaxy S21 / iPhone 13 / Redmi Note 11 / iPad 9th Gen",
    issues_label: "Select Issues (Check all that apply)*",
    desc_label: "Problem Details (Optional)",
    desc_placeholder: "Describe how the issue occurred or any specific symptoms...",
    cust_info_heading: "Your Contact & Pickup Address",
    name_label: "Full Name*",
    name_placeholder: "e.g. John Doe / Md. Tanveer",
    phone_label: "Active Mobile Number (11 digits)*",
    phone_placeholder: "01711-XXXXXX",
    alt_phone_label: "Alternate Mobile (Optional)",
    alt_phone_placeholder: "018XX-XXXXXX",
    area_label: "Select Area / Zone*",
    area_select_default: "-- Choose Area --",
    address_label: "Full Address (House, Road, Flat, Landmark)*",
    address_placeholder: "e.g. House 12, Road 4, Block C, Banani, Dhaka",
    date_label: "Preferred Pickup Date",
    time_slot_label: "Preferred Time Slot",
    slot_morning: "Morning: 10:00 AM - 1:00 PM",
    slot_afternoon: "Afternoon: 2:00 PM - 5:00 PM",
    slot_evening: "Evening: 6:00 PM - 9:00 PM",
    btn_submit_order: "Confirm Doorstep Pickup",
    booking_terms: "🔒 100% data privacy and genuine parts guaranteed. No Fix, No Fee policy.",

    // Tracking Section
    track_section_title: "Live Order Tracking & Decision Portal",
    track_section_subtitle: "Check live repair progress and approve or decline laboratory cost estimates",
    track_search_btn: "Find Order",
    order_details_title: "Order Details",
    order_no_lbl: "Order #:",
    device_lbl: "Device:",
    customer_lbl: "Customer:",
    address_lbl: "Pickup Address:",
    assigned_rider_lbl: "Assigned Rider:",
    not_assigned_yet: "Rider will be assigned shortly",
    issues_found_lbl: "Reported Issues:",
    current_status_lbl: "Current Status:",

    // Quote Box in Tracker (Very important)
    quote_box_title: "⚠️ Laboratory Diagnostic & Cost Estimation (Awaiting Your Decision)",
    quote_cost_lbl: "Estimated Repair Cost:",
    quote_warranty_lbl: "Warranty Period:",
    quote_diagnosis_lbl: "Technician Diagnostic Findings:",
    quote_customer_note_placeholder: "Any special instructions or comments (optional)...",
    btn_accept_quote: "✅ Accept Quotation & Start Repair",
    btn_reject_quote: "❌ Decline Quotation & Return Device",
    quote_accepted_badge: "🎉 You have accepted the quotation. Repair is in progress.",
    quote_rejected_badge: "ℹ️ You declined the repair cost. Your device will be safely returned to your address.",
    quote_terms: "💡 No Fix, No Fee. If we cannot fix your device or you decline, you only pay zero service fee.",

    // Invoice & Actions
    btn_print_receipt: "Print Job Sheet / Receipt",
    btn_whatsapp_help: "Get WhatsApp Support",

    // Why Choose Us
    why_title: "Why Choose Repair Seba?",
    why_subtitle: "Convenience, precision technology, and complete peace of mind",
    why_1_title: "Free Doorstep Pickup & Drop",
    why_1_desc: "No need to waste hours in traffic or search market shops. We pick up and return at your doorstep.",
    why_2_title: "100% Original & Certified Parts",
    why_2_desc: "We only use original OEM and Grade-A certified displays, batteries, and micro-components.",
    why_3_title: "Prior Cost Approval",
    why_3_desc: "We diagnose first and quote exact price. We only proceed if you explicitly agree to the price.",
    why_4_title: "90 to 180 Days Warranty",
    why_4_desc: "All repairs are covered with a warranty slip. Any issue during this period is repaired free.",

    // Contact & Footer
    contact_title: "Contact Us",
    contact_subtitle: "Send us a message for queries, corporate repairs, or support",
    contact_name: "Name",
    contact_phone: "Phone Number",
    contact_message: "Your Message",
    contact_submit: "Send Message",
    footer_text: "© 2026 Repair Seba. All rights reserved. Trusted Doorstep Smartphone & Tablet Repair Platform.",

    // Admin Management Portal Translations (English)
    admin_brand_name: "Repair Seba Portal",
    admin_trade_code: "Trade Code: RS-2026",
    admin_login_subtitle: "Lab & Doorstep Repair Management Portal",
    admin_login_username_lbl: "Username",
    admin_login_password_lbl: "Password",
    admin_login_demo_hint: "🔑 Default Login: admin / admin123",
    admin_login_btn: "Sign In",
    admin_back_to_site: "← Back to Customer Website",
    admin_sidebar_menu: "Main Menu",
    admin_tab_overview: "Overview",
    admin_tab_hero: "Hero Banner",
    admin_tab_orders: "Orders",
    admin_tab_customers: "Customer Accounts",
    admin_tab_services: "Services",
    admin_tab_inquiries: "Inquiries & Messages",
    admin_tab_footer: "Office & Footer",
    admin_tab_users: "Profile & Users",
    admin_overview_title: "Dashboard Overview",
    admin_overview_sub: "Live data, pickup tracking, repair statistics, and recent activity summary across all services",
    admin_btn_orders_shortcut: "Order Management",
    admin_stat_total_orders: "Total Orders",
    admin_stat_pending: "Pending Pickup",
    admin_stat_repair_lab: "In Repair & Lab",
    admin_stat_quote_pending: "Quote Pending",
    admin_stat_inquiries: "Received Messages",
    admin_stat_completed: "Completed Devices",
    admin_stat_services: "Service Categories",
    admin_stat_revenue: "Total Revenue",
    admin_unit_pcs: "pcs",
    admin_badge_live: "Live",
    admin_badge_new: "New",
    admin_recent_orders_title: "Recent Orders (Online Portal)",
    admin_btn_view_all_orders: "Manage All Orders →",
    admin_th_tracking_id: "Tracking ID",
    admin_th_customer_name: "Customer Name",
    admin_th_device_issue: "Device & Issue",
    admin_th_mobile: "Mobile",
    admin_th_date: "Date",
    admin_th_status: "Status",
    admin_th_action: "Action",
    admin_recent_messages_title: "Recent Inquiries (Website)",
    admin_all_messages_btn: "All Messages →",
    admin_recent_notices_title: "Latest Notices & Policy Updates",
    admin_all_services_btn: "All Services →",
    admin_orders_title: "Order Requests & Repair Tracking",
    admin_orders_sub: "Manage online service requests, update statuses, assign couriers, and update lab quotes",
    admin_orders_table_title: "All Order Requests",
    admin_filter_all: "All",
    admin_filter_pending: "Pending",
    admin_filter_approved: "Approved",
    admin_filter_in_repair: "In Repair",
    admin_filter_completed: "Completed",
    admin_order_search_placeholder: "Order ID, phone, or name...",
    admin_cust_tag: "Real-time Customer Database",
    admin_cust_title: "Registered Customer Accounts",
    admin_cust_sub: "Whenever customers sign up, log in with phone, or place repair orders, their profile and history sync here instantly.",
    admin_cust_stat_total: "Total Customers",
    admin_cust_stat_ordered: "With Orders",
    admin_cust_stat_recent: "New Joined",
    admin_cust_table_title: "All Registered Customers & Profile Details",
    admin_cust_search_placeholder: "Search by name, phone, or area...",
    admin_cust_filter_all: "All Customers",
    admin_cust_filter_with_orders: "With Orders",
    admin_cust_filter_no_orders: "New (No Orders)",
    admin_cust_th_profile: "Customer Profile & Name",
    admin_cust_th_phone: "Mobile Number",
    admin_cust_th_email: "Email",
    admin_cust_th_address: "Address & Area",
    admin_cust_th_orders: "Total Orders",
    admin_cust_th_registered: "Registered",
    admin_services_title: "Repair Services Management",
    admin_services_sub: "Manage titles, pricing, descriptions, icons, and active display on the website homepage",
    admin_btn_add_service: "Add New Service",
    admin_inquiries_title: "Customer Messages & Inquiries",
    admin_inquiries_sub: "Direct queries received through the customer contact form",
    admin_hero_title: "Hero Banner & Animation Control",
    admin_hero_sub: "Customize homepage promotional banner, delivery bike motion, speed, and headline texts",
    admin_btn_restore_default: "🔄 Restore Default",
    admin_btn_save_changes: "Save Changes",
    admin_footer_title: "Office Address, Helpline & Social Settings",
    admin_footer_sub: "Update physical office address, customer hotlines, WhatsApp link, and social profiles displayed on the footer.",
    admin_users_title: "Profiles, Team & Access Control",
    admin_users_sub: "Customize your profile, invite staff members, and assign role-based dashboard permissions.",
    admin_btn_create_profile: "➕ Create New Profile",
    admin_btn_my_profile: "✏️ My Profile",
    admin_btn_logout: "Logout",
    admin_btn_save: "Save Changes",
    admin_btn_cancel: "Cancel",
    admin_profile_settings_title: "My Profile & Avatar",
    admin_profile_full_name: "Full Name*",
    admin_profile_username: "Username",
    admin_profile_phone: "Mobile Phone",
    admin_profile_email: "Email Address",
    admin_profile_new_pwd: "New Password (Leave blank to keep current)",
    admin_profile_upload_btn: "Upload Photo from Device",
    admin_profile_remove_pic: "✕ Remove Photo",
    admin_role_superadmin: "Super Admin",
    admin_role_admin: "Admin",
    admin_role_manager: "Operations Manager",
    admin_role_technician: "Lab Technician",
    admin_role_support: "Customer Support"
  }
};

// Status definitions and badges in both languages
const STATUS_MAP = {
  PENDING_PICKUP: {
    bn: "পিকআপের অপেক্ষায়",
    en: "Pickup Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    step: 1
  },
  PICKUP_ASSIGNED: {
    bn: "পিকআপ রাইডার নির্ধারিত",
    en: "Rider Assigned for Pickup",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    step: 1
  },
  COLLECTED: {
    bn: "ডিভাইস সংগ্রহ সম্পন্ন (ল্যাবে পথে)",
    en: "Device Collected (En Route to Lab)",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    step: 2
  },
  DIAGNOSING: {
    bn: "ল্যাবে টেস্ট ও ডায়াগনোসিস চলছে",
    en: "In-Lab Diagnostic in Progress",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    step: 2
  },
  QUOTE_PENDING: {
    bn: "মূল্য নির্ধারণ করা হয়েছে (গ্রাহকের সিদ্ধান্তের অপেক্ষায়)",
    en: "Quote Ready - Awaiting Customer Approval",
    color: "bg-orange-100 text-orange-800 border-orange-300 animate-pulse",
    step: 3
  },
  QUOTE_APPROVED: {
    bn: "খরচ অনুমোদিত (মেরামত প্রস্তুতি)",
    en: "Quote Approved - Preparing Repair",
    color: "bg-teal-100 text-teal-800 border-teal-300",
    step: 3
  },
  QUOTE_REJECTED: {
    bn: "খরচ প্রত্যাখ্যাত (ডিভাইস ফেরত পাঠানো হবে)",
    en: "Quote Declined - Preparing Return",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    step: 3
  },
  IN_REPAIR: {
    bn: "মেরামত চলছে (পার্টস প্রতিস্থাপন)",
    en: "Repair in Progress",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
    step: 4
  },
  QUALITY_CHECK: {
    bn: "কোয়ালিটি টেস্টিং সম্পন্ন",
    en: "Quality Check Passed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    step: 4
  },
  OUT_FOR_DELIVERY: {
    bn: "আপনার ঠিকানায় ডেলিভারির জন্য রওনা হয়েছে",
    en: "Out for Doorstep Delivery",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    step: 5
  },
  COMPLETED: {
    bn: "ডেলিভারি ও পেমেন্ট সম্পন্ন",
    en: "Delivered & Payment Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    step: 5
  },
  CANCELLED: {
    bn: "বাতিলকৃত",
    en: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    step: 0
  }
};

// Current language manager
let currentLang = localStorage.getItem('repair_seba_lang') || 'bn';
// In admin panel, ensure standard Bangla default
if (typeof window !== 'undefined' && window.location && window.location.pathname.includes('admin')) {
  currentLang = 'bn';
}

function setLanguage(lang) {
  if (lang !== 'bn' && lang !== 'en') lang = 'bn';
  currentLang = lang;
  localStorage.setItem('repair_seba_lang', lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
  applyTranslations();
  // Dispatch custom event for reactive UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

function getTranslation(key) {
  if (translations[currentLang] && translations[currentLang][key] !== undefined) {
    return translations[currentLang][key];
  }
  if (translations.en && translations.en[key] !== undefined) {
    return translations.en[key];
  }
  return key;
}

function t(key, fallback = '') {
  const val = getTranslation(key);
  return (val && val !== key) ? val : (fallback || key);
}

function applyTranslations() {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = getTranslation(key);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Handle placeholders specifically
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = getTranslation(key);
    if (text) el.placeholder = text;
  });

  // Handle title tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const text = getTranslation(key);
    if (text) el.title = text;
  });

  // Update language toggle buttons visual active state across site & admin
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    const targetLang = btn.getAttribute('data-lang');
    if (targetLang === currentLang) {
      btn.classList.add('bg-cyan-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-700', 'hover:bg-slate-100', 'text-gray-700', 'hover:bg-gray-100');
    } else {
      btn.classList.remove('bg-cyan-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-700', 'hover:bg-slate-100');
    }
  });
}

// Global click listener for all language toggle buttons (Website & Admin Panel)
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle-btn');
    if (btn) {
      const lang = btn.getAttribute('data-lang');
      if (lang && typeof setLanguage === 'function') {
        setLanguage(lang);
      }
    }
  });

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTranslations();
    });
  } else {
    applyTranslations();
  }
}

// Expose globals
if (typeof window !== 'undefined') {
  window.translations = translations;
  window.STATUS_MAP = STATUS_MAP;
  window.currentLang = currentLang;
  window.setLanguage = setLanguage;
  window.getTranslation = getTranslation;
  window.applyTranslations = applyTranslations;
  window.t = t;
}

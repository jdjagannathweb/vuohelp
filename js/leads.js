/**
 * VLE HELP DESK - Dynamic VLE's Lead & Services Management System
 * Handles VLE leads, instant automatic WhatsApp alert to Admin (+919937037131),
 * dynamic custom service addition & deletion by Admin, cloud sync, and real-time tracking.
 */

const VUO_LEADS = {
  adminPhone: '919937037131',

  // 13 Standard Built-in Services
  defaultServices: [
    {
      key: 'bank_bc',
      title: 'Bank BC (CSP Point)',
      label: '🏦 Bank BC (CSP Point Application)',
      badge: 'CSP Kiosk',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: 'fa-solid fa-building-columns',
      iconBg: 'from-blue-600 to-indigo-700',
      desc: 'SBI, PNB, BoI & Odisha Gramya Bank BC point application, IIBF support & kiosk authorization.',
      actionText: 'Apply Now'
    },
    {
      key: 'new_atm_install',
      title: 'New ATM Install',
      label: '🏧 New ATM Install (Bank / White Label ATM Setup)',
      badge: 'WLA / Bank ATM',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'fa-solid fa-vault',
      iconBg: 'from-emerald-600 to-teal-700',
      desc: 'Shop / commercial space White Label ATM machine installation (Hitachi, Tata Indicash, India1) with monthly rent & per-tx commission.',
      actionText: 'Apply ATM'
    },
    {
      key: 'micro_atm',
      title: 'Micro ATM (Cash Machine)',
      label: '💳 Micro ATM (mPOS Device)',
      badge: 'mPOS Device',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: 'fa-solid fa-money-bill-transfer',
      iconBg: 'from-teal-500 to-emerald-600',
      desc: 'Bluetooth high-speed Micro-ATM terminal, cash withdrawal, balance inquiry & DigiPay activation.',
      actionText: 'Order Device'
    },
    {
      key: 'insurance',
      title: 'Insurance (40% to 50% Comm.)',
      label: '🛡️ Insurance (40% to 50% Commission)',
      badge: '40% - 50% Comm.',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'fa-solid fa-shield-halved',
      iconBg: 'from-emerald-500 to-teal-600',
      hotTag: '★ HOT 50% COMMISSION',
      desc: 'Bike, Car, Commercial & Health Mediclaim policy issuance with highest 40% to 50% instant commission.',
      actionText: 'Quick Policy'
    },
    {
      key: 'state_gov',
      title: 'State Government Services',
      label: '🏛️ State Government Services (Odisha)',
      badge: 'Odisha Govt',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'fa-solid fa-landmark',
      iconBg: 'from-amber-500 to-orange-600',
      desc: 'Subhadra Yojana, e-District Caste/Income/Residence, Bhulekh Land RoR, e-Pauti & Labour services.',
      actionText: 'State Desk'
    },
    {
      key: 'central_gov',
      title: 'Central Government Services',
      label: '🇮🇳 Central Government Services',
      badge: 'Digital India',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: 'fa-solid fa-globe',
      iconBg: 'from-indigo-600 to-blue-700',
      desc: 'PM Kisan KYC, Ayushman Bharat Card, Passport Seva, EPFO UAN, Jeevan Pramaan & e-Shram Card.',
      actionText: 'Central Desk'
    },
    {
      key: 'police_verification',
      title: 'Police Verification',
      label: '👮 Police Verification & Character Certificate',
      badge: 'Character Cert',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: 'fa-solid fa-user-shield',
      iconBg: 'from-purple-600 to-pink-600',
      desc: 'Character Certificate for Job, Tenant verification, Domestic Help verification & PCC portal clearance.',
      actionText: 'Apply PCC'
    },
    {
      key: 'pan_card',
      title: 'New & Correction PAN',
      label: '🪪 New & Correction PAN Card',
      badge: '2-Hr e-PAN',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: 'fa-solid fa-id-card-clip',
      iconBg: 'from-sky-500 to-blue-600',
      desc: 'Instant paperless 2-hour e-PAN, NSDL/UTI physical PAN, Minor to Major & Name/DOB/Photo correction.',
      actionText: 'Apply PAN'
    },
    {
      key: 'voter_id_pdf',
      title: 'Voter ID PDF Download',
      label: '🗳️ Voter ID PDF (EPIC Download)',
      badge: 'Digital EPIC',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: 'fa-solid fa-check-to-slot',
      iconBg: 'from-rose-500 to-red-600',
      desc: 'Instant digital color EPIC card PDF download, electoral roll search & voter address correction.',
      actionText: 'Get Voter PDF'
    },
    {
      key: 'dl_pdf',
      title: 'DL PDF (License Extract)',
      label: '🚗 DL PDF (Driving License Extract)',
      badge: 'RTO Extract',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: 'fa-solid fa-file-invoice',
      iconBg: 'from-orange-500 to-amber-600',
      desc: 'SARATHI Parivahan official DL digital PDF extract, duplicate license print & RTO record search.',
      actionText: 'Extract DL'
    },
    {
      key: 'll_pass',
      title: 'LL Pass (Learner License)',
      label: '🚦 LL Pass (Learner License Exam Help)',
      badge: '100% Approval',
      badgeClass: 'bg-lime-100 text-lime-800 border-lime-300',
      icon: 'fa-solid fa-traffic-light',
      iconBg: 'from-lime-500 to-emerald-600',
      desc: 'RTO online LL exam test preparation, slot booking assistance & first-attempt approval support.',
      actionText: 'LL Pass Help'
    },
    {
      key: 'dl_apply',
      title: 'DL Apply (Driving License)',
      label: '🚘 DL Apply (Driving License Full Application)',
      badge: 'Permanent DL',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: 'fa-solid fa-car-side',
      iconBg: 'from-cyan-500 to-blue-600',
      desc: 'Fresh Permanent DL application, LL to DL conversion, DL renewal, vehicle class addition & address change.',
      actionText: 'Apply DL'
    },
    {
      key: 'other_csc',
      title: 'Other CSC / Citizen Services',
      label: '📄 Other CSC / Citizen Service',
      badge: 'Citizen Services',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: 'fa-solid fa-ellipsis',
      iconBg: 'from-slate-600 to-slate-800',
      desc: 'Custom digital queries, GST registration, ITR filing, Trade license, ticket booking & utility payments.',
      actionText: 'Other Services'
    }
  ],

  // Color theme dictionary for custom services
  themeColorMap: {
    blue: { badge: 'bg-blue-100 text-blue-800 border-blue-300', iconBg: 'from-blue-600 to-indigo-700', border: 'hover:border-blue-400', text: 'text-blue-600' },
    emerald: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', iconBg: 'from-emerald-600 to-teal-700', border: 'hover:border-emerald-400', text: 'text-emerald-600' },
    teal: { badge: 'bg-teal-100 text-teal-800 border-teal-300', iconBg: 'from-teal-500 to-emerald-600', border: 'hover:border-teal-400', text: 'text-teal-600' },
    amber: { badge: 'bg-amber-100 text-amber-800 border-amber-300', iconBg: 'from-amber-500 to-orange-600', border: 'hover:border-amber-400', text: 'text-amber-600' },
    purple: { badge: 'bg-purple-100 text-purple-800 border-purple-300', iconBg: 'from-purple-600 to-pink-600', border: 'hover:border-purple-400', text: 'text-purple-600' },
    sky: { badge: 'bg-sky-100 text-sky-800 border-sky-300', iconBg: 'from-sky-500 to-blue-600', border: 'hover:border-sky-400', text: 'text-sky-600' },
    rose: { badge: 'bg-rose-100 text-rose-800 border-rose-300', iconBg: 'from-rose-500 to-red-600', border: 'hover:border-rose-400', text: 'text-rose-600' },
    indigo: { badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', iconBg: 'from-indigo-600 to-blue-700', border: 'hover:border-indigo-400', text: 'text-indigo-600' },
    orange: { badge: 'bg-orange-100 text-orange-800 border-orange-300', iconBg: 'from-orange-500 to-amber-600', border: 'hover:border-orange-400', text: 'text-orange-600' },
    cyan: { badge: 'bg-cyan-100 text-cyan-800 border-cyan-300', iconBg: 'from-cyan-500 to-blue-600', border: 'hover:border-cyan-400', text: 'text-cyan-600' }
  },

  defaultSampleLeads: [
    {
      id: 'LEAD-10101',
      leadId: 'LEAD-10101',
      name: 'Rajesh Kumar Sahoo',
      mobile: '9861234567',
      district: 'Cuttack',
      block: 'Salipur',
      serviceType: 'bank_bc',
      serviceLabel: '🏦 Bank BC (CSP Point Application)',
      details: 'SBI & Odisha Gramya Bank BC Point application guidance, IIBF certificate passed, kiosk location setup.',
      date: '08/09/2026 11:30 AM',
      timestamp: 1788761400000,
      status: 'In Progress',
      source: 'VLE Leads Portal'
    },
    {
      id: 'LEAD-10102',
      leadId: 'LEAD-10102',
      name: 'Priyanka Mohapatra',
      mobile: '9437112233',
      district: 'Khordha',
      block: 'Bhubaneswar',
      serviceType: 'insurance',
      serviceLabel: '🛡️ Insurance (40% to 50% Commission)',
      details: 'Car & 2-Wheeler comprehensive insurance bulk portal onboarding for CSC center with 40-50% commission slab.',
      date: '08/09/2026 03:15 PM',
      timestamp: 1788774900000,
      status: 'New',
      source: 'WhatsApp Desk'
    },
    {
      id: 'LEAD-10103',
      leadId: 'LEAD-10103',
      name: 'Manoj Kumar Nayak',
      mobile: '7008998877',
      district: 'Ganjam',
      block: 'Berhampur',
      serviceType: 'dl_apply',
      serviceLabel: '🚘 DL Apply (Driving License Full Application)',
      details: 'Customer commercial LM & Transport Driving License fresh application & document upload.',
      date: '09/09/2026 09:40 AM',
      timestamp: 1788841200000,
      status: 'New',
      source: 'VLE Leads Portal'
    },
    {
      id: 'LEAD-10104',
      leadId: 'LEAD-10104',
      name: 'Bikram Keshari Rout',
      mobile: '9938554422',
      district: 'Jajpur',
      block: 'Dharmasala',
      serviceType: 'new_atm_install',
      serviceLabel: '🏧 New ATM Install (Bank / White Label ATM Setup)',
      details: 'Commercial shop front white-label ATM setup (Hitachi / Tata Indicash), 60 sq.ft space available on main road.',
      date: '09/09/2026 12:10 PM',
      timestamp: 1788850200000,
      status: 'In Progress',
      source: 'VLE Leads Portal'
    }
  ],

  // Dynamic getters for labels and badges
  get serviceLabels() {
    const labels = {};
    this.getAllServices().forEach(s => {
      labels[s.key] = s.label || s.title;
    });
    return labels;
  },

  get serviceBadges() {
    const badges = {};
    this.getAllServices().forEach(s => {
      badges[s.key] = s.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300';
    });
    return badges;
  },

  currentCategory: 'all',
  searchQuery: '',
  _initialized: false,

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    this.renderAllServiceUI();
  },

  bindEvents() {
    // Form submission inside modal
    const form = document.getElementById('publicLeadForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(e, 'online');
      });
    }

    // Direct WhatsApp submit button in modal
    const waBtn = document.getElementById('leadSubmitWhatsAppBtn');
    if (waBtn) {
      waBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmit(e, 'whatsapp');
      });
    }

    // Category filter tabs on dedicated Leads view
    document.querySelectorAll('.lead-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lead-cat-btn').forEach(b => {
          b.className = 'lead-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all';
        });
        const target = e.currentTarget;
        target.className = 'lead-cat-btn px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 border border-emerald-600 text-white shadow-sm transition-all';
        this.currentCategory = target.getAttribute('data-lead-cat') || 'all';
        this.renderHomepageCards();
      });
    });

    // Search input on dedicated Leads view
    const searchInput = document.getElementById('leadsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderHomepageCards();
      });
    }

    // Admin Add Lead Form
    const adminLeadForm = document.getElementById('adminAddLeadForm');
    if (adminLeadForm) {
      adminLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdminAddLead();
      });
    }

    // Admin Add Custom Service Form
    const adminAddServiceForm = document.getElementById('adminAddLeadServiceForm');
    if (adminAddServiceForm) {
      adminAddServiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdminAddCustomService();
      });
    }
  },

  // ---------------- SERVICE MANAGEMENT (ADMIN CAN ADD NEW SERVICES) ---------------- //
  getCustomServices() {
    try {
      const stored = localStorage.getItem('vuo_custom_lead_services');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      console.warn("Error reading vuo_custom_lead_services:", e);
      return [];
    }
  },

  getAllServices() {
    const custom = this.getCustomServices();
    return [...this.defaultServices, ...custom];
  },

  addCustomService(serviceObj) {
    try {
      if (!serviceObj.title || !serviceObj.title.trim()) {
        if (typeof showToast === 'function') showToast('Please provide a service title.', 'warning');
        return false;
      }

      const customList = this.getCustomServices();
      const rawTitle = serviceObj.title.trim();
      const emoji = serviceObj.emoji || '⚡';
      const key = serviceObj.key || `srv_${rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20)}_${Date.now().toString().slice(-4)}`;
      const colorKey = serviceObj.color || 'sky';
      const theme = this.themeColorMap[colorKey] || this.themeColorMap['sky'];

      const newService = {
        key: key,
        title: rawTitle,
        label: `${emoji} ${rawTitle}`,
        emoji: emoji,
        badge: serviceObj.badge || 'New Service',
        badgeClass: theme.badge,
        icon: serviceObj.icon || 'fa-solid fa-bolt',
        iconBg: theme.iconBg,
        desc: serviceObj.desc || `${rawTitle} assistance, registration & fast processing service.`,
        actionText: serviceObj.actionText || 'Apply Now',
        color: colorKey,
        isCustom: true,
        createdAt: Date.now()
      };

      customList.push(newService);
      localStorage.setItem('vuo_custom_lead_services', JSON.stringify(customList));

      // Sync to Cloud DB
      if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveCustomLeadService) {
        VUO_DB.cloudSaveCustomLeadService(newService);
      }

      this.renderAllServiceUI();

      if (typeof showToast === 'function') {
        showToast(`✨ Service "${rawTitle}" added to Leads successfully!`, 'success');
      }
      return true;
    } catch (e) {
      console.error("Error adding custom lead service:", e);
      return false;
    }
  },

  deleteCustomService(serviceKey) {
    const services = this.getAllServices();
    const target = services.find(s => s.key === serviceKey);
    const serviceName = target ? target.title : serviceKey;

    if (!confirm(`Are you sure you want to delete lead service "${serviceName}"?`)) return false;

    let customList = this.getCustomServices();
    customList = customList.filter(s => s.key !== serviceKey);
    localStorage.setItem('vuo_custom_lead_services', JSON.stringify(customList));

    // Sync deletion to Cloud DB
    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudDeleteCustomLeadService) {
      VUO_DB.cloudDeleteCustomLeadService(serviceKey);
    }

    this.renderAllServiceUI();

    if (typeof showToast === 'function') {
      showToast(`Service "${serviceName}" removed!`, 'info');
    }
    return true;
  },

  handleAdminAddCustomService() {
    const title = document.getElementById('adminNewServiceName')?.value.trim();
    const emoji = document.getElementById('adminNewServiceEmoji')?.value.trim() || '⚡';
    const badge = document.getElementById('adminNewServiceBadge')?.value.trim() || 'Custom';
    const color = document.getElementById('adminNewServiceColor')?.value || 'sky';
    const desc = document.getElementById('adminNewServiceDesc')?.value.trim();
    const actionText = document.getElementById('adminNewServiceAction')?.value.trim() || 'Apply Now';

    if (!title) {
      if (typeof showToast === 'function') showToast('Please enter service title.', 'warning');
      return;
    }

    const success = this.addCustomService({
      title,
      emoji,
      badge,
      color,
      desc,
      actionText
    });

    if (success) {
      document.getElementById('adminAddLeadServiceForm')?.reset();
      document.getElementById('adminManageServicesSection')?.classList.add('hidden');
    }
  },

  // ---------------- UI RENDERING ---------------- //
  renderAllServiceUI() {
    this.renderHomepageCards();
    this.renderModalOptions();
    this.renderAdminServiceDropdowns();
    this.renderAdminServicesList();
  },

  renderHomepageCards() {
    const homeGrid = document.getElementById('vleLeadServicesGrid');
    const dedicatedGrid = document.getElementById('dedicatedLeadsGridContainer');
    const grids = [homeGrid, dedicatedGrid].filter(Boolean);
    if (grids.length === 0) return;

    let services = this.getAllServices();

    // Category filter for dedicated view
    if (this.currentCategory !== 'all') {
      const cat = this.currentCategory.toLowerCase().trim();
      services = services.filter(s => {
        const k = (s.key || '').toLowerCase();
        const t = (s.title || '').toLowerCase();
        const b = (s.badge || '').toLowerCase();
        if (cat === 'banking') return k.includes('bank') || k.includes('atm') || t.includes('bank') || t.includes('atm');
        if (cat === 'insurance') return k.includes('insurance') || t.includes('insurance');
        if (cat === 'gov' || cat === 'government') return k.includes('gov') || k.includes('state') || k.includes('central') || t.includes('gov') || b.includes('govt');
        if (cat === 'identity') return k.includes('police') || k.includes('pan') || k.includes('voter') || t.includes('police') || t.includes('pan') || t.includes('voter');
        if (cat === 'rto') return k.includes('dl') || k.includes('ll') || t.includes('dl') || t.includes('license') || t.includes('driving');
        return k.includes(cat) || t.includes(cat);
      });
    }

    // Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      services = services.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.desc && s.desc.toLowerCase().includes(q)) ||
        (s.badge && s.badge.toLowerCase().includes(q)) ||
        (s.label && s.label.toLowerCase().includes(q))
      );
    }

    const cardsHtml = services.length === 0 ? `
      <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-headset text-4xl text-slate-300 mb-2"></i>
        <p class="font-bold text-slate-700">No services found matching "${this.searchQuery}".</p>
        <p class="text-xs text-slate-400 mt-1">Try searching for Bank BC, ATM, Insurance, PAN, or Driving License.</p>
      </div>
    ` : services.map(s => {
      const isHot = s.hotTag ? `<span class="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">${s.hotTag}</span>` : '';
      const customBadge = s.isCustom ? `<span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 ml-1">✨ Admin Added</span>` : '';

      return `
        <div class="bg-white hover:bg-slate-50/60 p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all group flex flex-col justify-between shadow-xs hover:shadow-md relative">
          ${isHot}
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="w-10 h-10 rounded-xl bg-gradient-to-br ${s.iconBg || 'from-sky-500 to-blue-600'} flex items-center justify-center text-white text-lg shadow-md">
                <i class="${s.icon || 'fa-solid fa-bolt'}"></i>
              </span>
              <div class="flex items-center">
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300'}">
                  ${s.badge || 'Service'}
                </span>
                ${customBadge}
              </div>
            </div>
            <h4 class="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
              ${s.title}
            </h4>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
              ${s.desc}
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button onclick="VUO_LEADS.openLeadModal('${s.key}')" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-calendar-check text-emerald-600"></i> ${s.actionText || 'Book Now'}
            </button>
            <button onclick="VUO_LEADS.openLeadModal('${s.key}')" class="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer">
              Book <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    grids.forEach(g => {
      g.innerHTML = cardsHtml;
    });
  },

  handleOnPageSubmit(mode = 'online') {
    const nameEl = document.getElementById('onpageLeadName');
    const mobileEl = document.getElementById('onpageLeadMobile');
    const serviceEl = document.getElementById('onpageLeadService');
    const districtEl = document.getElementById('onpageLeadDistrict');
    const detailsEl = document.getElementById('onpageLeadDetails');

    const name = nameEl ? nameEl.value.trim() : '';
    const mobile = mobileEl ? mobileEl.value.trim().replace(/\D/g, '') : '';
    const serviceType = serviceEl ? serviceEl.value : 'bank_bc';
    const district = districtEl ? districtEl.value.trim() : 'Odisha';
    const details = detailsEl ? detailsEl.value.trim() : '';

    if (!name) {
      if (typeof showToast === 'function') showToast('Please enter your full name.', 'warning');
      nameEl?.focus();
      return;
    }

    if (!mobile || mobile.length !== 10) {
      if (typeof showToast === 'function') showToast('Please enter a valid 10-digit mobile number.', 'warning');
      mobileEl?.focus();
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const leadId = `LEAD-${uniqueNum}`;
    const serviceLabel = this.serviceLabels[serviceType] || serviceType;

    const leadObj = {
      id: leadId,
      leadId: leadId,
      name: name,
      mobile: mobile,
      district: district,
      block: district,
      serviceType: serviceType,
      serviceLabel: serviceLabel,
      details: details || 'On-Page Quick Inquiry from Vle Desk.',
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'New',
      source: mode === 'whatsapp' ? 'WhatsApp Direct' : 'Web On-Page Desk'
    };

    this.saveLead(leadObj);

    const waMessage = 
`🚨 *NEW LEAD ALERT — VLE HELP DESK*
━━━━━━━━━━━━━━━━━━━━━━━
📋 *Lead ID:* ${leadId}
👤 *Name:* ${name}
📱 *Customer / VLE Mobile:* ${mobile}
🛠️ *Service Requested:* ${serviceLabel}
📍 *Location:* ${district}
📝 *Requirements / Notes:* ${details || 'Immediate service assistance requested'}
📅 *Submitted At:* ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━━━━
_Hello VLE Help Desk Team (+91 9937037131), new customer lead received from portal. Please assist immediately._`;

    const waUrl = `https://wa.me/${this.adminPhone}?text=${encodeURIComponent(waMessage)}`;

    document.getElementById('onpageLeadForm')?.reset();

    // Trigger WhatsApp window ONLY IF mode is 'whatsapp'
    if (mode === 'whatsapp') {
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn("Popup blocked:", err);
      }
      if (typeof showToast === 'function') {
        showToast(`⚡ Lead #${leadId} submitted! Opening WhatsApp chat with Admin...`, 'success');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(`✅ Service request #${leadId} booked successfully!`, 'success');
      }
    }

    this.openLeadSuccessModal(leadObj, waUrl, mode);
  },

  renderModalOptions() {
    const select = document.getElementById('leadServiceType');
    if (!select) return;

    const currentVal = select.value;
    const services = this.getAllServices();
    select.innerHTML = services.map(s => `
      <option value="${s.key}">${s.label || s.title}</option>
    `).join('');

    if (currentVal && services.some(s => s.key === currentVal)) {
      select.value = currentVal;
    }
  },

  renderAdminServiceDropdowns() {
    const newLeadSelect = document.getElementById('adminNewLeadService');
    const filterSelect = document.getElementById('adminLeadServiceFilter');
    const services = this.getAllServices();

    if (newLeadSelect) {
      const cur = newLeadSelect.value;
      newLeadSelect.innerHTML = services.map(s => `
        <option value="${s.key}">${s.label || s.title}</option>
      `).join('');
      if (cur && services.some(s => s.key === cur)) newLeadSelect.value = cur;
    }

    if (filterSelect) {
      const curFilter = filterSelect.value;
      filterSelect.innerHTML = `
        <option value="all">All Services (Vle's Leads)</option>
        ${services.map(s => `<option value="${s.key}">${s.label || s.title}</option>`).join('')}
      `;
      if (curFilter) filterSelect.value = curFilter;
    }
  },

  renderAdminServicesList() {
    const tbody = document.getElementById('adminLeadServicesTableBody');
    if (!tbody) return;

    const services = this.getAllServices();
    tbody.innerHTML = services.map(s => {
      const typeBadge = s.isCustom 
        ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Custom Added</span>`
        : `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Default Built-in</span>`;
      
      const deleteBtn = s.isCustom
        ? `<button onclick="VUO_LEADS.deleteCustomService('${s.key}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-all cursor-pointer" title="Delete custom service"><i class="fa-solid fa-trash-can mr-1"></i>Delete</button>`
        : `<span class="text-xs text-slate-400 italic">Protected</span>`;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs transition-colors">
          <td class="p-3">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-br ${s.iconBg || 'from-sky-500 to-blue-600'} text-white flex items-center justify-center text-xs shadow-xs">
                <i class="${s.icon || 'fa-solid fa-bolt'}"></i>
              </span>
              <span class="font-bold text-slate-900">${s.label || s.title}</span>
            </div>
          </td>
          <td class="p-3 font-mono text-[11px] text-slate-600">${s.key}</td>
          <td class="p-3">
            <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${s.badgeClass || 'bg-slate-100 text-slate-800'}">
              ${s.badge || 'Service'}
            </span>
          </td>
          <td class="p-3">${typeBadge}</td>
          <td class="p-3 text-right">${deleteBtn}</td>
        </tr>
      `;
    }).join('');
  },

  // ---------------- LEADS DATA CRUD & SYNC ---------------- //
  getAllLeads() {
    try {
      const stored = localStorage.getItem('vuo_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Seed default sample leads
      localStorage.setItem('vuo_leads', JSON.stringify(this.defaultSampleLeads));
      return [...this.defaultSampleLeads];
    } catch (e) {
      console.warn("Error reading vuo_leads:", e);
      return [...this.defaultSampleLeads];
    }
  },

  saveLead(leadObj) {
    try {
      const leads = this.getAllLeads();
      const existingIdx = leads.findIndex(l => l.id === leadObj.id || l.leadId === leadObj.leadId);
      if (existingIdx >= 0) {
        leads[existingIdx] = { ...leads[existingIdx], ...leadObj };
      } else {
        leads.unshift(leadObj);
      }
      localStorage.setItem('vuo_leads', JSON.stringify(leads));

      // Sync to Cloud DB
      if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveLead) {
        VUO_DB.cloudSaveLead(leadObj);
      }

      // Update Admin table if open
      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLeadsTable) {
        VUO_ADMIN.renderLeadsTable();
      }
      return true;
    } catch (e) {
      console.error("Failed to save lead:", e);
      return false;
    }
  },

  saveLeads(leadsArray) {
    try {
      localStorage.setItem('vuo_leads', JSON.stringify(leadsArray));
      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLeadsTable) {
        VUO_ADMIN.renderLeadsTable();
      }
      return true;
    } catch (e) {
      console.error("Failed to save leads array:", e);
      return false;
    }
  },

  updateLeadStatus(leadId, newStatus) {
    const leads = this.getAllLeads();
    const target = leads.find(l => l.id === leadId || l.leadId === leadId);
    if (target) {
      target.status = newStatus;
      target.updatedAt = Date.now();
      localStorage.setItem('vuo_leads', JSON.stringify(leads));
      if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveLead) {
        VUO_DB.cloudSaveLead(target);
      }
      if (typeof showToast === 'function') {
        showToast(`Lead #${target.leadId} status updated to: ${newStatus}`, 'success');
      }
      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLeadsTable) {
        VUO_ADMIN.renderLeadsTable();
      }
      return true;
    }
    return false;
  },

  deleteLead(leadId) {
    if (!confirm(`Are you sure you want to delete Lead #${leadId}?`)) return;
    let leads = this.getAllLeads();
    leads = leads.filter(l => l.id !== leadId && l.leadId !== leadId);
    localStorage.setItem('vuo_leads', JSON.stringify(leads));

    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudDeleteLead) {
      VUO_DB.cloudDeleteLead(leadId);
    }
    if (typeof showToast === 'function') {
      showToast(`Lead #${leadId} removed successfully!`, 'info');
    }
    if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLeadsTable) {
      VUO_ADMIN.renderLeadsTable();
    }
  },

  openLeadModal(serviceType = 'bank_bc') {
    const modal = document.getElementById('leadModal');
    if (!modal) return;

    this.renderModalOptions();

    const selectEl = document.getElementById('leadServiceType');
    if (selectEl && serviceType) {
      selectEl.value = serviceType;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    const nameInput = document.getElementById('leadCustomerName');
    if (nameInput) {
      nameInput.focus();
    }
  },

  closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  openLeadSuccessModal(leadObj, waUrl, mode = 'online') {
    const modal = document.getElementById('leadSuccessModal');
    if (!modal) return;

    const idEl = document.getElementById('leadSuccessId');
    if (idEl) idEl.textContent = leadObj.leadId;
    const nameEl = document.getElementById('leadSuccessName');
    if (nameEl) nameEl.textContent = leadObj.name;
    const mobileEl = document.getElementById('leadSuccessMobile');
    if (mobileEl) mobileEl.textContent = leadObj.mobile;
    const srvEl = document.getElementById('leadSuccessService');
    if (srvEl) srvEl.textContent = leadObj.serviceLabel;
    
    const waBtn = document.getElementById('leadSuccessWhatsAppAction');
    if (waBtn && waUrl) {
      waBtn.href = waUrl;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeLeadSuccessModal() {
    const modal = document.getElementById('leadSuccessModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  // ---------------- FORM SUBMISSION WITH INSTANT WHATSAPP ALERT ---------------- //
  handleSubmit(e, mode = 'online') {
    const nameEl = document.getElementById('leadCustomerName');
    const mobileEl = document.getElementById('leadCustomerMobile');
    const serviceEl = document.getElementById('leadServiceType');
    const districtEl = document.getElementById('leadCustomerDistrict');
    const blockEl = document.getElementById('leadCustomerBlock');
    const detailsEl = document.getElementById('leadCustomerDetails');

    const name = nameEl ? nameEl.value.trim() : '';
    const mobile = mobileEl ? mobileEl.value.trim().replace(/\D/g, '') : '';
    const serviceType = serviceEl ? serviceEl.value : 'bank_bc';
    const serviceLabel = this.serviceLabels[serviceType] || serviceType || 'VLE Service Request';
    const district = districtEl ? districtEl.value.trim() : '';
    const block = blockEl ? blockEl.value.trim() : '';
    const details = detailsEl ? detailsEl.value.trim() : '';

    // Validations
    if (!name) {
      if (typeof showToast === 'function') showToast('Please enter your full name.', 'warning');
      nameEl?.focus();
      return;
    }

    if (!mobile || mobile.length !== 10) {
      if (typeof showToast === 'function') showToast('Please enter a valid 10-digit mobile number.', 'warning');
      mobileEl?.focus();
      return;
    }

    if (!district) {
      if (typeof showToast === 'function') showToast('Please select your Odisha District.', 'warning');
      districtEl?.focus();
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const leadId = `LEAD-${uniqueNum}`;

    const leadObj = {
      id: leadId,
      leadId: leadId,
      name: name,
      mobile: mobile,
      district: district,
      block: block || district,
      serviceType: serviceType,
      serviceLabel: serviceLabel,
      details: details || 'Instant assistance / quotation requested.',
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'New',
      source: mode === 'whatsapp' ? 'WhatsApp Direct' : 'VLE Portal Form'
    };

    // 1. Save Lead to LocalStorage and Firebase Cloud DB
    this.saveLead(leadObj);

    // 2. Format Automatic Instant WhatsApp Message to Admin (+91 9937037131)
    const waMessage = 
`🚨 *NEW LEAD ALERT — VLE HELP DESK*
━━━━━━━━━━━━━━━━━━━━━━━
📋 *Lead ID:* ${leadId}
👤 *Name:* ${name}
📱 *Customer / VLE Mobile:* ${mobile}
🛠️ *Service Requested:* ${serviceLabel}
📍 *Location:* ${district}${block ? ` (${block})` : ''}
📝 *Requirements / Notes:* ${details || 'Immediate service assistance requested'}
📅 *Submitted At:* ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━━━━
_Hello VLE Help Desk Team (+91 9937037131), new customer lead received from portal. Please assist immediately._`;

    const waUrl = `https://wa.me/${this.adminPhone}?text=${encodeURIComponent(waMessage)}`;

    // 3. Reset Form & Close Modal
    const form = document.getElementById('publicLeadForm');
    if (form) form.reset();
    this.closeLeadModal();

    // 4. Trigger WhatsApp window ONLY IF mode is 'whatsapp'
    if (mode === 'whatsapp') {
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn("Popup blocked, fallback modal ready:", err);
      }
      if (typeof showToast === 'function') {
        showToast(`⚡ Lead #${leadId} submitted! Opening WhatsApp chat with Admin (+91 9937037131)...`, 'success');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(`✅ Service request #${leadId} booked successfully! Our team will contact you.`, 'success');
      }
    }
    
    // 5. Open Success Notice Modal
    this.openLeadSuccessModal(leadObj, waUrl, mode);
  },

  handleAdminAddLead() {
    const name = document.getElementById('adminNewLeadName')?.value.trim();
    const mobile = document.getElementById('adminNewLeadMobile')?.value.trim().replace(/\D/g, '');
    const serviceType = document.getElementById('adminNewLeadService')?.value || 'bank_bc';
    const district = document.getElementById('adminNewLeadDistrict')?.value.trim() || 'Odisha';
    const block = document.getElementById('adminNewLeadBlock')?.value.trim() || district;
    const details = document.getElementById('adminNewLeadDetails')?.value.trim() || 'Offline Manual Lead Added by Admin';

    if (!name || !mobile || mobile.length !== 10) {
      if (typeof showToast === 'function') showToast('Please enter valid Name and 10-digit Mobile Number.', 'warning');
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const leadId = `LEAD-${uniqueNum}`;

    const leadObj = {
      id: leadId,
      leadId: leadId,
      name: name,
      mobile: mobile,
      district: district,
      block: block,
      serviceType: serviceType,
      serviceLabel: this.serviceLabels[serviceType] || serviceType,
      details: details,
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'New',
      source: 'Admin Manual Entry'
    };

    this.saveLead(leadObj);
    document.getElementById('adminAddLeadForm')?.reset();
    document.getElementById('adminAddLeadSection')?.classList.add('hidden');
    if (typeof showToast === 'function') showToast(`Lead #${leadId} added successfully!`, 'success');
  },

  // Direct quick quote trigger from home page cards
  openQuickQuote(serviceType) {
    this.openLeadModal(serviceType);
  },

  // Export Leads to CSV
  exportCsv() {
    const leads = this.getAllLeads();
    if (leads.length === 0) {
      if (typeof showToast === 'function') showToast('No leads available to export.', 'warning');
      return;
    }

    const headers = ['Lead ID', 'Date', 'Customer Name', 'Mobile Number', 'District', 'Block', 'Service Requested', 'Details', 'Status', 'Source'];
    const rows = leads.map(l => [
      `"${l.leadId || l.id}"`,
      `"${l.date || ''}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.mobile || ''}"`,
      `"${(l.district || '').replace(/"/g, '""')}"`,
      `"${(l.block || '').replace(/"/g, '""')}"`,
      `"${(l.serviceLabel || l.serviceType || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.status || 'New'}"`,
      `"${l.source || 'Web'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VLE_HELP_DESK_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') showToast('Leads CSV exported successfully!', 'success');
  }
};

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.VUO_LEADS = VUO_LEADS;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof VUO_LEADS !== 'undefined') {
    VUO_LEADS.init();
  }
});

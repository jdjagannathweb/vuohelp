/**
 * VUO CSC HELP - Core Application Router, Global Search & View Controller
 */

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600' :
                  type === 'error' ? 'bg-rose-600' :
                  type === 'warning' ? 'bg-amber-600' : 'bg-slate-800';

  toast.className = `flex items-center gap-2 px-4 py-3 text-white text-xs font-semibold rounded-xl shadow-xl transition-all transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 opacity-70 hover:opacity-100">&times;</button>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global Announcements Ticker Renderer
function renderAnnouncementsTicker() {
  const track = document.getElementById('newsTickerTrack');
  if (!track) return;

  const anns = JSON.parse(localStorage.getItem('vuo_announcements') || '[]');
  if (anns.length === 0) {
    track.innerHTML = '<span class="px-6 text-xs text-sky-200">📢 Welcome to VUO CSC HELP — Your Digital Partner for CSC Services in Odisha.</span>';
    return;
  }

  const itemsHtml = anns.map(a => {
    const text = currentLanguage === 'or' && a.textOdia ? a.textOdia : a.text;
    return `
      <span class="inline-flex items-center gap-2 px-6 text-xs font-medium text-slate-100">
        ${a.urgent ? '<span class="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px]">NEW</span>' : '•'}
        <span>${text}</span>
      </span>
    `;
  }).join('');

  // Duplicate for seamless loop
  track.innerHTML = itemsHtml + itemsHtml;
}

// Global Search System
const VUO_SEARCH = {
  init() {
    // Keyboard shortcut Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    const searchInput = document.getElementById('globalSearchModalInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  },

  open() {
    const modal = document.getElementById('globalSearchModal');
    const input = document.getElementById('globalSearchModalInput');
    if (modal) {
      modal.classList.remove('hidden');
      if (input) {
        input.value = '';
        input.focus();
        this.handleSearch('');
      }
    }
  },

  close() {
    const modal = document.getElementById('globalSearchModal');
    if (modal) modal.classList.add('hidden');
  },

  handleSearch(query) {
    const q = query.toLowerCase().trim();
    const resultsContainer = document.getElementById('globalSearchResults');
    if (!resultsContainer) return;
    const tools = [
      { name: "Gemini AI Passport Photo Studio", nameOdia: "ଜେମିନି AI ପାସପୋର୍ଟ ଷ୍ଟୁଡିଓ", hash: "#passphoto", type: "Tool", icon: "✨", desc: "Professional 35x45mm passport photo maker with Gemini AI prompt & A4 print sheet" },
      { name: "Image Compressor", nameOdia: "ଫଟୋ କମ୍ପ୍ରେସ୍", hash: "#imagetools", type: "Tool", icon: "🖼️", desc: "Compress image file size for portal limits" },
      { name: "Signature Resizer", nameOdia: "ସାଇନ (Signature) ରିସାଇଜ୍", hash: "#imagetools", type: "Tool", icon: "✍️", desc: "PAN and government portal signature optimizer" },
      { name: "CSC Bill Maker", nameOdia: "CSC ବିଲ୍ ମେକର", hash: "#billmaker", type: "Tool", icon: "🧾", desc: "Generate professional customer receipts with shop details" },
      { name: "PDF Tools Suite", nameOdia: "PDF ଟୁଲ୍ସ ସୁଇଟ୍", hash: "#pdftools", type: "Tool", icon: "📄", desc: "JPG to PDF, merge, split, and watermark documents" },
      { name: "Resume Maker", nameOdia: "ରେଜ୍ୟୁମେ / ବାୟୋଡାଟା ମେକର", hash: "#resumemaker", type: "Tool", icon: "📋", desc: "Modern job resume and bio-data builder" },
      { name: "I-Card Maker", nameOdia: "VLE ଆଇ-କାର୍ଡ ମେକର", hash: "#icardmaker", type: "Tool", icon: "🪪", desc: "VLE UNION ODISHA official identity card generator" },
      { name: "Age Calculator", nameOdia: "ବୟସ କାଲକୁଲେଟର", hash: "#calculators-age", type: "Tool", icon: "🎂", desc: "Exact age in Y/M/D for Odisha & Central Govt Exam cut-offs" },
      { name: "Loan EMI Calculator", nameOdia: "ଋଣ EMI କାଲକୁଲେଟର", hash: "#calculators-emi", type: "Tool", icon: "💰", desc: "Customer Loan EMI, Total Interest & Amortization" },
      { name: "GST Calculator", nameOdia: "GST କାଲକୁଲେଟର", hash: "#calculators-gst", type: "Tool", icon: "🧾", desc: "Add/Remove GST (5%, 12%, 18%, 28%) with CGST/SGST split" },
      { name: "Marks & Percentage Calculator", nameOdia: "ପ୍ରତିଶତ କାଲକୁଲେଟର", hash: "#calculators-marks", type: "Tool", icon: "📊", desc: "Calculate exact percentage, division & grades" },
      { name: "Smart PVC ID Print Studio", nameOdia: "ସ୍ମାର୍ଟ PVC ଆଇଡି ପ୍ରିଣ୍ଟ", hash: "#pvcprint", type: "Tool", icon: "🪪", desc: "Aadhaar, Voter ID, Driving Licence, RC & Ayushman PVC Card Tray & A4 Print" },
      { name: "Aadhaar PVC Card Print", nameOdia: "ଆଧାର PVC କାର୍ଡ ପ୍ରିଣ୍ଟ", hash: "#pvcprint-aadhaar", type: "Tool", icon: "🪪", desc: "Unlock password e-Aadhaar PDF and auto CR-80 PVC print" },
      { name: "Voter ID (e-EPIC) PVC Print", nameOdia: "ଭୋଟର ଆଇଡି PVC ପ୍ରିଣ୍ଟ", hash: "#pvcprint-voter", type: "Tool", icon: "🗳️", desc: "e-EPIC Voter Card front & back CR-80 PVC print" },
      { name: "Driving Licence (DL) PVC Print", nameOdia: "ଡ୍ରାଇଭିଂ ଲାଇସେନ୍ସ PVC ପ୍ରିଣ୍ଟ", hash: "#pvcprint-dl", type: "Tool", icon: "🚗", desc: "Parivahan DL smart card format PVC tray print" },
      { name: "Vehicle RC Smart Card Print", nameOdia: "RC ସ୍ମାର୍ଟ କାର୍ଡ ପ୍ରିଣ୍ଟ", hash: "#pvcprint-rc", type: "Tool", icon: "📄", desc: "Parivahan Vehicle RC certificate front & back PVC print" },
      { name: "Govt ID Card Multi-Print", nameOdia: "ଆଇଡି କାର୍ଡ ପ୍ରିଣ୍ଟ", hash: "#csctools-idcard", type: "Tool", icon: "🪪", desc: "Aadhaar, Voter, PAN, E-Shram CR80 (85.6x54mm) PVC/A4 print" },
      { name: "CSC Rubber Stamp Maker", nameOdia: "CSC ରବର ଷ୍ଟାମ୍ପ ମେକର", hash: "#csctools-stamp", type: "Tool", icon: "⭕", desc: "Design circular & rectangle CSC center seals with PNG download" },
      { name: "Salary Slip Generator", nameOdia: "ଦରମା ସ୍ଲିପ୍ ମେକର", hash: "#csctools-salary", type: "Tool", icon: "💼", desc: "Monthly employee payslip with Basic, HRA, DA, PF & Print" },
      { name: "WhatsApp Direct Message", nameOdia: "ହ୍ୱାଟ୍ସଆପ୍ ଡାଇରେକ୍ଟ", hash: "#csctools-whatsapp", type: "Tool", icon: "💬", desc: "Send customer alerts without saving phone numbers" },
      { name: "Typing Speed Test", nameOdia: "ଟାଇପିଂ ଟେଷ୍ଟ", hash: "#csctools-typing", type: "Tool", icon: "⌨️", desc: "Practice 1-min typing test with WPM & accuracy tracker" },
      { name: "Marriage Bio-Data Maker", nameOdia: "ବିବାହ ବାୟୋଡାଟା ମେକର", hash: "#resumemaker", type: "Tool", icon: "卐", desc: "Hindu marriage biodata with Gotra, Rashi & horoscope" },
      { name: "Husband & Wife Pass Photo", nameOdia: "ଯୋଡ଼ି ପାସପୋର୍ଟ ଫଟୋ", hash: "#passphoto", type: "Tool", icon: "💑", desc: "Joint couple passport photo maker for bank & ration card" },
      { name: "CGPA to Percentage Calculator", nameOdia: "CGPA କାଲକୁଲେଟର", hash: "#calculators-cgpa", type: "Tool", icon: "🎓", desc: "Convert CGPA to percentage for CBSE & Odisha Universities" },
      { name: "Custom QR Code Generator", nameOdia: "QR କୋଡ୍ ଜେନେରେଟର", hash: "#csctools-qrcode", type: "Tool", icon: "📱", desc: "Create UPI Payment QR, Web URL & Mobile QR standees" },
      { name: "CSC Advertisement Poster Maker", nameOdia: "ପୋଷ୍ଟର ମେକର", hash: "#csctools-poster", type: "Tool", icon: "📢", desc: "Subhadra Yojana, PAN & AEPS banking banner maker with VLE details" },
      { name: "VLE Udhar Khata (Credit Ledger)", nameOdia: "ଉଧାର ଖାତା (Credit)", hash: "#csctools-credit", type: "Tool", icon: "📒", desc: "Customer credit ledger with auto 7-day WhatsApp overdue reminder" },
      { name: "Word to PDF Converter", nameOdia: "ୱାର୍ଡ ଟୁ PDF", hash: "#pdftools-wordtopdf", type: "Tool", icon: "📝", desc: "Convert Docx and text files to clean A4 PDF documents" },
      { name: "PDF Editor & Attestation Seal", nameOdia: "PDF ଏଡିଟର ଓ ଷ୍ଟାମ୍ପ", hash: "#pdfeditor", type: "Tool", icon: "✒️", desc: "Interactive visual PDF editor, stamps & signatures" },
      { name: "WhatsApp Image Resizer & Darkness Clear", nameOdia: "ହ୍ୱାଟ୍ସଆପ୍ ଡକ୍ୟୁମେଣ୍ଟ ରିସାଇଜର ଓ ଡାର୍କନେସ କ୍ଲିଅର", hash: "#whatsappresizer", type: "Tool", icon: "🟢", desc: "4-Corner perspective warp, clear darkness for printing & save ink" },
      { name: "Image to PDF (<200KB Portal Mode)", nameOdia: "ଇମେଜ୍ ଟୁ PDF (<୨୦୦ KB)", hash: "#imgtopdf", type: "Tool", icon: "📑", desc: "Multi-image to PDF with Odisha e-District & Subhadra <200KB preset" },
      { name: "Job Alert & Online Form Desk", nameOdia: "ଚାକିରି ଆଲର୍ଟ ଓ ଅନଲାଇନ୍ ଫର୍ମ ଡେସ୍କ", hash: "#jobalert", type: "Desk", icon: "📢", desc: "Odisha & Central Govt Jobs with salary, last date, apply link & document checklist" }
    ];

    const jobs = (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.getAllJobs === 'function' ? VUO_JOB_ALERT.getAllJobs() : []).map(j => ({
      name: j.title || j.post || 'Govt Job Notification',
      nameOdia: j.titleOdia || j.post || 'ଚାକିରି ବିଜ୍ଞପ୍ତି',
      hash: "#jobalert",
      type: "Job Alert",
      icon: "💼",
      desc: (j.organization ? j.organization + ' • ' : '') + (j.salary ? 'Salary: ' + j.salary + ' • ' : '') + 'Last Date: ' + (j.lastDate || 'N/A')
    }));

    const links = VUO_LINKS.getAllLinks().map(l => ({
      name: l.title,
      nameOdia: l.titleOdia,
      url: l.url,
      type: "Portal Link",
      icon: "🔗",
      desc: l.desc
    }));

    const videos = VUO_TRAINING.getAllVideos().map(v => ({
      name: v.title,
      nameOdia: v.titleOdia,
      hash: "#training",
      type: "Training Video",
      icon: "🎓",
      desc: v.desc
    }));

    const forms = (typeof VUO_FORMS !== 'undefined' ? VUO_FORMS.getAllForms() : []).map(f => ({
      name: f.title,
      nameOdia: f.titleOdia,
      url: f.fileUrl,
      type: "Offline PDF Form",
      icon: "📄",
      desc: f.desc || (f.categoryName + " - " + f.size)
    }));

    const allItems = [...tools, ...jobs, ...links, ...videos, ...forms];

    const filtered = q ? allItems.filter(item => 
      item.name.toLowerCase().includes(q) || 
      (item.nameOdia && item.nameOdia.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q)) ||
      item.type.toLowerCase().includes(q)
    ) : allItems.slice(0, 8); // show top items by default

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-xs">
          No matches found for "${query}". Try searching for "Subhadra", "Photo", "Bill", "PDF", or "DigiPay".
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => {
      const displayName = currentLanguage === 'or' && item.nameOdia ? item.nameOdia : item.name;
      const isExternal = !!item.url;
      const targetAction = isExternal ? 
        `href="${item.url}" onclick="if (typeof VUO_LINKS !== 'undefined' && VUO_LINKS.openPortalLink) { VUO_SEARCH.close(); return VUO_LINKS.openPortalLink(event, '${item.url}', '${(displayName || '').replace(/'/g, "\\'")}'); }"` : 
        `href="${item.hash}" onclick="VUO_SEARCH.close()"`;

      return `
        <a ${targetAction} class="flex items-center justify-between p-3 rounded-lg hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-all group">
          <div class="flex items-center gap-3">
            <span class="text-xl">${item.icon}</span>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-xs font-bold text-slate-800 group-hover:text-sky-700">${displayName}</p>
                <span class="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">${item.type}</span>
              </div>
              <p class="text-[11px] text-slate-500 truncate max-w-sm">${item.desc || ''}</p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-sky-600 text-xs">➔</span>
        </a>
      `;
    }).join('');
  }
};

// Modal & Popup Global Handlers
function renderWhatsappCommunityBanner() {
  const defaultData = (typeof VUO_DATA !== 'undefined' && VUO_DATA.whatsappCommunity) ? VUO_DATA.whatsappCommunity : {
    enabled: true,
    title: "Join Odisha CSC VLE WhatsApp Community",
    desc: "Get instant daily CSC updates, Odisha Govt scheme notifications & technical support directly on WhatsApp.",
    link: "https://chat.whatsapp.com/DaaKvtlF2NN3baGvdRnfiE",
    buttonText: "Join WhatsApp Community"
  };

  let settings;
  try {
    settings = JSON.parse(localStorage.getItem('vuo_whatsapp_community')) || defaultData;
  } catch (_) {
    settings = defaultData;
  }

  const isEnabled = settings.enabled !== false;
  const link = (settings.link && settings.link.trim()) ? settings.link.trim() : (defaultData.link || 'https://chat.whatsapp.com/DaaKvtlF2NN3baGvdRnfiE');
  const title = (settings.title && settings.title.trim()) ? settings.title.trim() : defaultData.title;
  const desc = (settings.desc && settings.desc.trim()) ? settings.desc.trim() : defaultData.desc;
  const btnText = (settings.buttonText && settings.buttonText.trim()) ? settings.buttonText.trim() : (defaultData.buttonText || 'Join WhatsApp Community');

  // 1. Prominent Dashboard Banner
  const banner = document.getElementById('dashWhatsappBanner');
  if (banner) {
    banner.style.display = isEnabled ? 'block' : 'none';
    if (isEnabled) banner.classList.remove('hidden'); else banner.classList.add('hidden');
    const bTitle = document.getElementById('dashWhatsappTitle');
    const bDesc = document.getElementById('dashWhatsappDesc');
    const bBtn = document.getElementById('dashWhatsappCommunityBtn');
    if (bTitle) bTitle.textContent = title;
    if (bDesc) bDesc.textContent = desc;
    if (bBtn) {
      bBtn.href = link;
      bBtn.innerHTML = `<i class="fa-brands fa-whatsapp text-emerald-600 text-lg"></i> <span>${btnText}</span> <i class="fa-solid fa-arrow-up-right-from-square text-[11px] text-emerald-700 ml-1"></i>`;
    }
  }

  // 2. Main Digital Toolbox Option Card on Dashboard
  const toolCard = document.getElementById('dashToolWhatsappCard');
  if (toolCard) {
    toolCard.style.display = isEnabled ? 'flex' : 'none';
    if (isEnabled) toolCard.classList.remove('hidden'); else toolCard.classList.add('hidden');
    const tTitle = document.getElementById('dashToolWhatsappTitle');
    const tDesc = document.getElementById('dashToolWhatsappDesc');
    const tBtn = document.getElementById('dashToolWhatsappBtn');
    if (tTitle) tTitle.textContent = title;
    if (tDesc) tDesc.textContent = desc;
    if (tBtn) {
      tBtn.href = link;
      tBtn.innerHTML = `<i class="fa-brands fa-whatsapp text-base"></i> <span>${btnText}</span> <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-0.5"></i>`;
    }
  }

  // 3. Hero Action CTA Button & Quick Jump Chip
  const heroCta = document.getElementById('heroWhatsappCtaBtn');
  if (heroCta) {
    heroCta.href = link;
    heroCta.style.display = isEnabled ? 'inline-flex' : 'none';
    if (isEnabled) heroCta.classList.remove('hidden'); else heroCta.classList.add('hidden');
  }
  const heroChip = document.getElementById('heroWhatsappChip');
  if (heroChip) {
    heroChip.href = link;
    heroChip.style.display = isEnabled ? 'inline-flex' : 'none';
    if (isEnabled) heroChip.classList.remove('hidden'); else heroChip.classList.add('hidden');
  }

  // 4. Header Navigation Button
  const headerBtn = document.getElementById('headerWhatsappBtn');
  if (headerBtn) {
    headerBtn.href = link;
    headerBtn.style.display = isEnabled ? 'inline-flex' : 'none';
    if (isEnabled) headerBtn.classList.remove('hidden'); else headerBtn.classList.add('hidden');
  }

  // 5. Personal VLE Dashboard Modal Link
  const modalLink = document.getElementById('dashModalWhatsappLink');
  if (modalLink) {
    modalLink.href = link;
    modalLink.style.display = isEnabled ? 'block' : 'none';
    if (isEnabled) modalLink.classList.remove('hidden'); else modalLink.classList.add('hidden');
    const mTitle = document.getElementById('dashModalWhatsappTitle');
    const mDesc = document.getElementById('dashModalWhatsappDesc');
    if (mTitle) mTitle.textContent = title;
    if (mDesc) mDesc.textContent = desc;
  }
}

function playWelcomePopupVideo() {
  const iframeEl = document.getElementById('welcomePopupIframe');
  const overlayEl = document.getElementById('welcomePopupPlayOverlay');
  const thumbEl = document.getElementById('welcomePopupVideoThumb');
  if (iframeEl && iframeEl.dataset.embedUrl) {
    iframeEl.src = iframeEl.dataset.embedUrl + (iframeEl.dataset.embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
    iframeEl.classList.remove('hidden');
    iframeEl.style.display = 'block';
    if (overlayEl) {
      overlayEl.classList.add('hidden');
      overlayEl.style.display = 'none';
    }
    if (thumbEl) {
      thumbEl.classList.add('hidden');
      thumbEl.style.display = 'none';
    }
  }
}

function openWelcomePopup(overrideSettings) {
  const modal = document.getElementById('welcomePopupModal');
  if (!modal) return;

  // 1. Base settings from localStorage
  let popupSettings = JSON.parse(localStorage.getItem('vuo_popup') || '{}');

  // 2. If called with override, merge it
  if (overrideSettings && typeof overrideSettings === 'object') {
    popupSettings = { ...popupSettings, ...overrideSettings };
  } else {
    // ONLY override from Admin Panel if the admin panel is currently active/visible AND the url input has a value
    const adminPane = document.getElementById('admin_pane_welcome_popup');
    const isAdminActive = adminPane && !adminPane.classList.contains('hidden') && adminPane.style.display !== 'none';
    const liveUrlInput = document.getElementById('adminPopupPosterUrl');

    if (isAdminActive && liveUrlInput && liveUrlInput.value.trim()) {
      popupSettings.imageUrl = liveUrlInput.value.trim();
      const liveTitle = document.getElementById('adminPopupTitle');
      const liveHeadline = document.getElementById('adminPopupHeadline');
      const liveMessage = document.getElementById('adminPopupMessage');
      const liveBadge = document.getElementById('adminPopupBadgeText');
      const liveBtnText = document.getElementById('adminPopupButtonText');
      const liveBtnLink = document.getElementById('adminPopupButtonLink');
      if (liveTitle && liveTitle.value.trim()) popupSettings.title = liveTitle.value.trim();
      if (liveHeadline && liveHeadline.value.trim()) popupSettings.headline = liveHeadline.value.trim();
      if (liveMessage && liveMessage.value.trim()) popupSettings.message = liveMessage.value.trim();
      if (liveBadge && liveBadge.value.trim()) popupSettings.badgeText = liveBadge.value.trim();
      if (liveBtnText && liveBtnText.value.trim()) popupSettings.buttonText = liveBtnText.value.trim();
      if (liveBtnLink && liveBtnLink.value.trim()) popupSettings.buttonLink = liveBtnLink.value.trim();
    }
  }

  const badgeEl = document.getElementById('welcomePopupBadge');
  const titleEl = document.getElementById('welcomePopupTitle');
  const headlineEl = document.getElementById('welcomePopupHeadline');
  const messageEl = document.getElementById('welcomePopupMessage');
  const imgEl = document.getElementById('welcomePopupImage');
  const imgWrapper = document.getElementById('welcomePopupImageWrapper');
  const imgZoom = document.getElementById('welcomePopupImageZoom');
  const btnEl = document.getElementById('welcomePopupActionBtn');
  const videoBox = document.getElementById('welcomePopupVideoBox');
  const imageBox = document.getElementById('welcomePopupImageBox');
  const iframeEl = document.getElementById('welcomePopupIframe');
  const videoThumbEl = document.getElementById('welcomePopupVideoThumb');
  const playOverlayEl = document.getElementById('welcomePopupPlayOverlay');
  const videoWatchBtn = document.getElementById('welcomePopupVideoWatchBtn');

  if (badgeEl) {
    let bText = popupSettings.badgeText || 'OFFICIAL NOTIFICATION';
    bText = bText.replace(/^[^\w\s\u0900-\u0DFF]+/, '').trim();
    if (!bText || bText.includes('ð')) bText = 'OFFICIAL NOTIFICATION';
    badgeEl.innerHTML = `<i class="fa-solid fa-bullhorn text-xs"></i> <span>${bText}</span>`;
  }
  if (titleEl) {
    titleEl.textContent = popupSettings.title || 'Official Digital Updates — VLE HELP DESK';
  }
  if (headlineEl) {
    if (popupSettings.headline && popupSettings.headline.trim()) {
      headlineEl.textContent = popupSettings.headline;
      headlineEl.classList.remove('hidden');
    } else {
      headlineEl.classList.add('hidden');
    }
  }
  if (messageEl) {
    const rawMsg = popupSettings.message || '';
    messageEl.textContent = rawMsg;
    messageEl.style.whiteSpace = 'pre-line';
  }

  const parseMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return { type: 'none', raw: '' };
    const raw = url.trim();
    if (!raw) return { type: 'none', raw: '' };

    let testStr = raw;
    const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      testStr = iframeMatch[1];
    }

    let videoId = '';
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = testStr.match(patterns[i]);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId && (testStr.includes('youtube') || testStr.includes('youtu.be'))) {
      const fallbackMatch = testStr.match(/(?:v\/|v=|vi\/|youtu\.be\/|\/)([a-zA-Z0-9_-]{11})/);
      if (fallbackMatch && fallbackMatch[1]) {
        videoId = fallbackMatch[1];
      }
    }

    if (videoId) {
      return {
        type: 'youtube',
        videoId: videoId,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        fallbackThumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        raw: raw
      };
    }

    const playlistMatch = testStr.match(/[?&]list=(PL[\w-]+)/i);
    if (playlistMatch && (testStr.includes('youtube.com') || testStr.includes('youtu.be'))) {
      const pId = playlistMatch[1];
      return {
        type: 'youtube',
        videoId: '',
        playlistId: pId,
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&auto=format&fit=crop',
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${pId}&rel=0`,
        watchUrl: `https://www.youtube.com/playlist?list=${pId}`,
        raw: raw
      };
    }

    if (testStr.includes('youtube.com') || testStr.includes('youtu.be')) {
      const cleanUrl = testStr.startsWith('http') ? testStr : `https://${testStr}`;
      return {
        type: 'youtube',
        videoId: '',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&auto=format&fit=crop',
        embedUrl: cleanUrl,
        watchUrl: cleanUrl,
        raw: raw
      };
    }

    return {
      type: 'image',
      imageUrl: raw,
      raw: raw
    };
  };

  const applyPopupMedia = (url) => {
    const media = parseMediaUrl(url);

    if (media.type === 'youtube') {
      if (imgWrapper) {
        imgWrapper.classList.remove('hidden');
        imgWrapper.style.display = 'flex';
      }
      if (imageBox) {
        imageBox.classList.add('hidden');
        imageBox.style.display = 'none';
      }
      if (imgZoom) {
        imgZoom.classList.add('hidden');
        imgZoom.style.display = 'none';
      }
      if (imgEl) {
        imgEl.src = '';
        imgEl.classList.add('hidden');
        imgEl.style.display = 'none';
      }

      if (videoBox) {
        videoBox.classList.remove('hidden');
        videoBox.style.display = 'flex';
      }
      
      // Setup YouTube Video Card with HD Thumbnail & Play Button
      if (videoThumbEl) {
        videoThumbEl.classList.remove('hidden');
        videoThumbEl.style.display = 'block';
        videoThumbEl.src = media.thumbnailUrl;
        videoThumbEl.onerror = function() {
          if (media.fallbackThumbnail && this.src !== media.fallbackThumbnail) {
            this.src = media.fallbackThumbnail;
          }
        };
      }
      if (playOverlayEl) {
        playOverlayEl.classList.remove('hidden');
        playOverlayEl.style.display = 'flex';
      }
      if (iframeEl) {
        iframeEl.classList.add('hidden');
        iframeEl.style.display = 'none';
        iframeEl.src = '';
        iframeEl.dataset.embedUrl = media.embedUrl;
      }
      if (videoWatchBtn) {
        videoWatchBtn.href = media.watchUrl;
        videoWatchBtn.classList.remove('hidden');
        videoWatchBtn.style.display = 'inline-flex';
      }

      // Action Button
      if (btnEl) {
        const bText = (popupSettings.buttonText && popupSettings.buttonText.trim()) ? popupSettings.buttonText : 'Watch Video on YouTube';
        const bLink = (popupSettings.buttonLink && popupSettings.buttonLink.trim() && popupSettings.buttonLink !== '#passphoto') ? popupSettings.buttonLink : media.watchUrl;
        btnEl.innerHTML = `<i class="fa-brands fa-youtube text-base mr-1"></i> <span>${bText}</span>`;
        btnEl.href = bLink;
        btnEl.target = '_blank';
        btnEl.className = 'flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2';
        btnEl.classList.remove('hidden');
        btnEl.style.display = 'inline-flex';
      }
    } else if (media.type === 'image' && media.imageUrl) {
      if (videoBox) {
        videoBox.classList.add('hidden');
        videoBox.style.display = 'none';
      }
      if (iframeEl) {
        iframeEl.src = '';
        iframeEl.classList.add('hidden');
        iframeEl.style.display = 'none';
      }
      if (videoWatchBtn) {
        videoWatchBtn.classList.add('hidden');
        videoWatchBtn.style.display = 'none';
      }

      if (imgWrapper) {
        imgWrapper.classList.remove('hidden');
        imgWrapper.style.display = 'flex';
      }
      if (imageBox) {
        imageBox.classList.remove('hidden');
        imageBox.style.display = 'flex';
      }
      if (imgEl) {
        imgEl.src = media.imageUrl;
        imgEl.classList.remove('hidden');
        imgEl.style.display = 'block';
      }
      if (imgZoom) {
        imgZoom.href = media.imageUrl;
        imgZoom.classList.remove('hidden');
        imgZoom.style.display = 'inline-flex';
      }
      if (btnEl) {
        if (popupSettings.buttonText && popupSettings.buttonText.trim()) {
          btnEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${popupSettings.buttonText}</span>`;
          btnEl.href = popupSettings.buttonLink || '#passphoto';
          btnEl.target = (btnEl.href.startsWith('http')) ? '_blank' : '_self';
          btnEl.className = 'flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2';
          btnEl.classList.remove('hidden');
          btnEl.style.display = 'inline-flex';
        } else {
          btnEl.classList.add('hidden');
          btnEl.style.display = 'none';
        }
      }
    } else {
      if (imgWrapper) {
        imgWrapper.classList.add('hidden');
        imgWrapper.style.display = 'none';
      }
      if (imageBox) {
        imageBox.classList.add('hidden');
        imageBox.style.display = 'none';
      }
      if (videoBox) {
        videoBox.classList.add('hidden');
        videoBox.style.display = 'none';
      }
      if (imgZoom) {
        imgZoom.classList.add('hidden');
        imgZoom.style.display = 'none';
      }
      if (videoWatchBtn) {
        videoWatchBtn.classList.add('hidden');
        videoWatchBtn.style.display = 'none';
      }
      if (iframeEl) {
        iframeEl.src = '';
        iframeEl.classList.add('hidden');
        iframeEl.style.display = 'none';
      }
      if (imgEl) {
        imgEl.src = '';
        imgEl.classList.add('hidden');
        imgEl.style.display = 'none';
      }
      if (btnEl) {
        if (popupSettings.buttonText && popupSettings.buttonText.trim()) {
          btnEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${popupSettings.buttonText}</span>`;
          btnEl.href = popupSettings.buttonLink || '#passphoto';
          btnEl.target = (btnEl.href.startsWith('http')) ? '_blank' : '_self';
          btnEl.className = 'flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2';
          btnEl.classList.remove('hidden');
          btnEl.style.display = 'inline-flex';
        } else {
          btnEl.classList.add('hidden');
          btnEl.style.display = 'none';
        }
      }
    }
  };

  applyPopupMedia(popupSettings.imageUrl);

  // Fallback to IndexedDB ONLY if imageUrl was saved as 'indexeddb'
  if (popupSettings.imageUrl === 'indexeddb' && window.VUO_IDB && typeof window.VUO_IDB.getPdfBlob === 'function') {
    window.VUO_IDB.getPdfBlob('vuo_popup_image').then(entry => {
      if (entry && entry.data && entry.data.startsWith('data:image')) {
        applyPopupMedia(entry.data);
      }
    }).catch(err => console.warn(err));
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeWelcomePopup() {
  const modal = document.getElementById('welcomePopupModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  // Immediately stop video playback so audio does not keep playing in the background
  const iframeEl = document.getElementById('welcomePopupIframe');
  if (iframeEl) {
    iframeEl.src = '';
    iframeEl.classList.add('hidden');
  }
  const overlayEl = document.getElementById('welcomePopupPlayOverlay');
  if (overlayEl) overlayEl.classList.remove('hidden');
  const thumbEl = document.getElementById('welcomePopupVideoThumb');
  if (thumbEl) thumbEl.classList.remove('hidden');

  sessionStorage.setItem('vuo_popup_closed', '1');

  const dontShow = document.getElementById('dontShowPopupToday')?.checked;
  if (dontShow) {
    const today = new Date().toDateString();
    localStorage.setItem('vle_popup_suppressed_date', today);
  }
}

function initWelcomePopup() {
  const today = new Date().toDateString();
  const isSuppressed = localStorage.getItem('vle_popup_suppressed_date') === today;
  const isClosedThisSession = sessionStorage.getItem('vuo_popup_closed') === '1';

  // Helper to trigger popup display if enabled
  const tryDisplayPopup = () => {
    if (isSuppressed || isClosedThisSession) return;
    const pop = JSON.parse(localStorage.getItem('vuo_popup') || '{}');
    if (pop.enabled !== false) {
      setTimeout(() => {
        if (sessionStorage.getItem('vuo_popup_closed') !== '1') {
          openWelcomePopup();
        }
      }, 700);
    }
  };

  // If running on HTTP/HTTPS server, sync latest published popup settings in background
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    fetch('popup_settings.json?t=' + Date.now())
      .then(res => res.ok ? res.json() : fetch('api/popup-settings').then(r => r.ok ? r.json() : null))
      .then(serverSettings => {
        if (serverSettings && serverSettings.title) {
          const local = JSON.parse(localStorage.getItem('vuo_popup') || '{}');
          if (!local.updatedAtTimestamp || (serverSettings.updatedAtTimestamp && serverSettings.updatedAtTimestamp >= local.updatedAtTimestamp)) {
            localStorage.setItem('vuo_popup', JSON.stringify(serverSettings));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        tryDisplayPopup();
      });
  } else {
    tryDisplayPopup();
  }
}

function openDonateModal() {
  const modal = document.getElementById('donateModal');
  if (!modal) return;

  // Sync donation settings
  const donateSettings = JSON.parse(localStorage.getItem('vuo_donation') || '{}');
  if (donateSettings.upiId && document.getElementById('donateUpiId')) {
    document.getElementById('donateUpiId').textContent = donateSettings.upiId;
  }
  if (donateSettings.payeeName && document.getElementById('donatePayeeName')) {
    document.getElementById('donatePayeeName').textContent = donateSettings.payeeName;
  }
  if (donateSettings.bankName && document.getElementById('donateBankName')) {
    document.getElementById('donateBankName').textContent = donateSettings.bankName;
  }
  if (donateSettings.accountNumber && document.getElementById('donateAccountNumber')) {
    document.getElementById('donateAccountNumber').textContent = donateSettings.accountNumber;
  }
  if (donateSettings.ifscCode && document.getElementById('donateIfsc')) {
    document.getElementById('donateIfsc').textContent = donateSettings.ifscCode;
  }
  if (donateSettings.qrImageUrl && document.getElementById('donateQrImage')) {
    document.getElementById('donateQrImage').src = donateSettings.qrImageUrl;
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeDonateModal() {
  const modal = document.getElementById('donateModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function copyDonateUpi() {
  const upiId = document.getElementById('donateUpiId')?.textContent?.trim() || '9937037131@ybl';
  navigator.clipboard.writeText(upiId).then(() => {
    const btnText = document.getElementById('copyUpiBtnText');
    if (btnText) btnText.textContent = 'Copied! ✓';
    showToast(`UPI ID "${upiId}" copied to clipboard!`, 'success');
    setTimeout(() => {
      if (btnText) btnText.textContent = 'Copy';
    }, 2500);
  }).catch(() => {
    showToast(`UPI ID: ${upiId}`, 'info');
  });
}

function openCutoutProAssistant() {
  const modal = document.getElementById('cutoutProModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeCutoutProAssistant() {
  const modal = document.getElementById('cutoutProModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

const VUO_APP = {
  init() {
    this.bindGlobalEvents();
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());

    // Initialize Submodules
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.init();
    }
    if (typeof VUO_SEARCH !== 'undefined') {
      VUO_SEARCH.init();
    }
    if (typeof renderAnnouncementsTicker === 'function') {
      renderAnnouncementsTicker();
    }
    if (typeof VUO_AUTH !== 'undefined') {
      VUO_AUTH.updateAuthUI();
    }
    if (typeof initWelcomePopup === 'function') {
      initWelcomePopup();
      renderWhatsappCommunityBanner();
    }

    // Auto-sync training videos in background
    setTimeout(() => {
      if (typeof VUO_TRAINING !== 'undefined' && typeof VUO_TRAINING.syncFromYouTubeChannel === 'function') {
        VUO_TRAINING.syncFromYouTubeChannel(true);
      }
    }, 2500);

    // Listen for language changes
    window.addEventListener('languageChanged', () => {
      if (typeof renderAnnouncementsTicker === 'function') {
        renderAnnouncementsTicker();
      }
    });
  },

  filterDashboardTools(category, btn) {
    document.querySelectorAll('.dash-tool-filter-btn').forEach(b => {
      b.className = 'dash-tool-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 bg-white/90 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-300 shadow-2xs transition-all';
    });
    if (btn) {
      btn.className = 'dash-tool-filter-btn px-4 py-2 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md shadow-blue-500/25 border border-sky-400/80 transform scale-[1.02]';
    }
    document.querySelectorAll('.vle-tool-card').forEach(card => {
      const cardCat = card.getAttribute('data-tool-category');
      let matches = false;
      if (category === 'all') {
        matches = true;
      } else if (category === 'image') {
        matches = (cardCat === 'image' || cardCat === 'photo');
      } else if (category === 'pdf') {
        matches = (cardCat === 'pdf' || cardCat === 'docs');
      } else if (category === 'other') {
        matches = (cardCat === 'other' || cardCat === 'utility' || cardCat === 'portals' || cardCat === 'calculator');
      } else if (cardCat === category) {
        matches = true;
      }

      if (matches) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  },

  bindGlobalEvents() {
    // Mobile Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const closeMobileDrawer = document.getElementById('closeMobileDrawer');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('hidden');
      });
    }

    if (closeMobileDrawer && mobileDrawer) {
      closeMobileDrawer.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    }

    // Close mobile drawer on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileDrawer) mobileDrawer.classList.add('hidden');
      });
    });

    // Language Toggle Buttons
    const langEnBtn = document.getElementById('langToggleEn');
    const langOrBtn = document.getElementById('langToggleOr');

    if (langEnBtn) langEnBtn.addEventListener('click', () => setLanguage('en'));
    if (langOrBtn) langOrBtn.addEventListener('click', () => setLanguage('or'));

    // Reusable Navigation Dropdown Controller (Hover, Click & Touch Toggle + Auto Close)
    const setupNavDropdown = (wrapperId, btnId, menuId, chevronId, toggleFnName) => {
      const wrapper = document.getElementById(wrapperId);
      const btn = document.getElementById(btnId);
      const menu = document.getElementById(menuId);
      const chevron = document.getElementById(chevronId);
      if (!wrapper || !btn || !menu) return;

      let closeTimer = null;

      const openDropdown = () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        // Close other dropdowns
        document.querySelectorAll('.nav-dropdown-wrapper').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('open');
            const m = w.querySelector('.nav-dropdown-menu');
            if (m) m.classList.add('hidden');
            const c = w.querySelector('.nav-chevron, [id$="Chevron"]');
            if (c) c.classList.remove('rotate-180');
          }
        });

        wrapper.classList.add('open');
        menu.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
      };

      const closeDropdown = (delay = 0) => {
        if (delay > 0) {
          closeTimer = setTimeout(() => {
            wrapper.classList.remove('open');
            menu.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
          }, delay);
        } else {
          if (closeTimer) clearTimeout(closeTimer);
          wrapper.classList.remove('open');
          menu.classList.add('hidden');
          if (chevron) chevron.classList.remove('rotate-180');
        }
      };

      if (toggleFnName) {
        window[toggleFnName] = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          if (menu.classList.contains('hidden') || !wrapper.classList.contains('open')) {
            openDropdown();
          } else {
            closeDropdown(0);
          }
        };
        btn.onclick = (e) => window[toggleFnName](e);
      }

      // Hover on desktop
      wrapper.addEventListener('mouseenter', () => openDropdown());
      wrapper.addEventListener('mouseleave', () => closeDropdown(180));

      // Global outside click
      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          closeDropdown(0);
        }
      });

      // Dropdown sub-link routing
      wrapper.querySelectorAll('.nav-dropdown-menu a').forEach(subLink => {
        subLink.addEventListener('click', (e) => {
          const targetHash = subLink.getAttribute('href');
          if (targetHash && targetHash.startsWith('#')) {
            e.preventDefault();
            const routeName = targetHash.replace('#', '');
            window.location.hash = targetHash;
            VUO_APP.handleRoute(routeName);
            window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof renderWhatsappCommunityBanner === 'function') {
      renderWhatsappCommunityBanner();
    }
          }
          setTimeout(() => {
            closeDropdown(0);
            try {
              subLink.blur();
              if (document.activeElement) document.activeElement.blur();
            } catch(err) {}
          }, 50);
        });
      });
    };

    // Initialize all 4 Navigation Dropdowns: Image Tools, PDF Tools, Office & CSC Tools, CSC Services
    setupNavDropdown('navImageToolsDropdownWrapper', 'navImageToolsDropdownBtn', 'navImageToolsDropdownMenu', 'navImageToolsChevron', 'toggleNavImageToolsDropdown');
    setupNavDropdown('navPdfToolsDropdownWrapper', 'navPdfToolsDropdownBtn', 'navPdfToolsDropdownMenu', 'navPdfToolsChevron', 'toggleNavPdfToolsDropdown');
    setupNavDropdown('navOfficeToolsDropdownWrapper', 'navOfficeToolsDropdownBtn', 'navOfficeToolsDropdownMenu', 'navOfficeToolsChevron', 'toggleNavOfficeToolsDropdown');
    setupNavDropdown('navServicesDropdownWrapper', 'navServicesDropdownBtn', 'navServicesDropdownMenu', 'navServicesChevron', 'toggleNavServicesDropdown');

    // Backward compatibility alias for legacy toggleNavToolsDropdown
    window.toggleNavToolsDropdown = (e) => {
      if (typeof window.toggleNavImageToolsDropdown === 'function') {
        window.toggleNavImageToolsDropdown(e);
      }
    };

    // Global Hash Link Click Handler (Ensures immediate 1-click navigation for ALL options across website)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        if (hash && hash !== '#') {
          const route = hash.replace('#', '');
          
          // Close mobile drawer if open
          const mobileDrawer = document.getElementById('mobileDrawer');
          if (mobileDrawer) mobileDrawer.classList.add('hidden');

          // Close any open navigation dropdowns
          document.querySelectorAll('.nav-dropdown-wrapper').forEach(w => {
            w.classList.remove('open');
            const m = w.querySelector('.nav-dropdown-menu');
            if (m) m.classList.add('hidden');
            const c = w.querySelector('.nav-chevron, [id$="Chevron"]');
            if (c) c.classList.remove('rotate-180');
          });

          // If clicking current hash, prevent default page jump and re-route
          if (hash === window.location.hash) {
            e.preventDefault();
          }

          // Route immediately
          VUO_APP.handleRoute(route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      const handleAdminLoginSubmit = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const passInput = document.getElementById('adminPasswordInput') || document.getElementById('adminPinInput');
        const pass = passInput ? passInput.value : '';
        const res = VUO_AUTH.adminLogin(pass);
        if (res.success) {
          const modal = document.getElementById('adminLoginModal');
          if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
          }
          if (passInput) passInput.value = '';
          showToast("Admin access unlocked successfully!", "success");

          // Ensure hash reflects #admin
          window.location.hash = '#admin';

          // Force immediate route switch to admin view without waiting or needing a second click
          VUO_APP.handleRoute('admin');

          if (typeof VUO_ADMIN !== 'undefined') {
            VUO_ADMIN.init();
          }
          if (typeof window.vuoRenderAdminFormsTable === 'function') {
            setTimeout(window.vuoRenderAdminFormsTable, 50);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          showToast(res.message || "Invalid Admin Password. Access Denied!", "error");
          if (passInput) {
            passInput.value = '';
            passInput.focus();
          }
        }
      };

      adminLoginForm.addEventListener('submit', handleAdminLoginSubmit);

      const passInput = document.getElementById('adminPasswordInput');
      if (passInput) {
        passInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdminLoginSubmit(e);
          }
        });
      }
    }

    // Contact Form Submission
    const contactForm = document.getElementById('vuoContactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ticketId = `VUO-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
        const name = document.getElementById('contactName').value;
        const mobile = document.getElementById('contactMobile').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessage').value;

        const newTicket = {
          ticketId,
          name,
          mobile,
          subject,
          message,
          date: new Date().toLocaleDateString(),
          status: 'Pending'
        };

        const tickets = JSON.parse(localStorage.getItem('vuo_tickets') || '[]');
        tickets.unshift(newTicket);
        localStorage.setItem('vuo_tickets', JSON.stringify(tickets));
        if (typeof VUO_DB !== 'undefined') {
          VUO_DB.cloudSaveTicket(newTicket);
        }

        contactForm.reset();
        showToast(`Your support ticket #${ticketId} has been registered! Our VUO CSC HELP team will reach out at 9937037131 soon.`, "success");
      });
    }

    // Modal Backdrop Click to Close & Escape Key Dismiss
    const modalIds = [
      'welcomePopupModal',
      'donateModal',
      'cutoutProModal',
      'adminLoginModal',
      'videoPlayerModal',
      'globalSearchModal',
      'leadModal',
      'leadSuccessModal'
    ];

    modalIds.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            if (id === 'welcomePopupModal') {
              closeWelcomePopup();
            } else {
              modal.classList.add('hidden');
              modal.style.display = 'none';
            }
            if (id === 'videoPlayerModal' && typeof VUO_TRAINING !== 'undefined') {
              VUO_TRAINING.closePlayer();
            }
            if (id === 'adminLoginModal' && !VUO_AUTH.isAdmin()) {
              window.location.hash = '#home';
            }
          }
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modalIds.forEach(id => {
          const m = document.getElementById(id);
          if (m && (!m.classList.contains('hidden') || m.style.display !== 'none')) {
            if (id === 'welcomePopupModal') {
              closeWelcomePopup();
            } else {
              m.classList.add('hidden');
              m.style.display = 'none';
            }
            if (id === 'videoPlayerModal' && typeof VUO_TRAINING !== 'undefined') {
              VUO_TRAINING.closePlayer();
            }
            if (id === 'adminLoginModal' && !VUO_AUTH.isAdmin()) {
              window.location.hash = '#home';
            }
          }
        });
        // Close any open navigation dropdowns
        document.querySelectorAll('.nav-dropdown-wrapper').forEach(w => {
          w.classList.remove('open');
          const m = w.querySelector('.nav-dropdown-menu');
          if (m) m.classList.add('hidden');
          const c = w.querySelector('.nav-chevron, [id$="Chevron"]');
          if (c) c.classList.remove('rotate-180');
        });
      }
    });

    // Make every dashboard tool card clickable across the entire card
    document.querySelectorAll('.vle-tool-card, .pro-tool-card').forEach(card => {
      const link = card.querySelector('a[href^="#"]');
      if (link) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('input')) {
            link.click();
          }
        });
      }
    });
  },

  handleRoute(forceView) {
    const rawHash = forceView ? `#${forceView}` : (window.location.hash || '#home');
    const cleanHash = rawHash.replace('#', '').trim() || 'home';
    
    // Parse main view and sub-tool tab (e.g. imagetools-enhancer -> viewName: imagetools, subTab: enhancer)
    let viewName = cleanHash;
    let subTab = '';

    if (cleanHash.startsWith('imagetools-')) {
      viewName = 'imagetools';
      subTab = cleanHash.replace('imagetools-', '');
    } else if (cleanHash.startsWith('pdftools-')) {
      viewName = 'pdftools';
      subTab = cleanHash.replace('pdftools-', '');
    } else if (cleanHash.startsWith('links-')) {
      viewName = 'links';
      subTab = cleanHash.replace('links-', '');
    } else if (cleanHash.startsWith('forms-')) {
      viewName = 'forms';
      subTab = cleanHash.replace('forms-', '');
    } else if (cleanHash.startsWith('training-')) {
      viewName = 'training';
      subTab = cleanHash.replace('training-', '');
    } else if (cleanHash.startsWith('leads-')) {
      viewName = 'leads';
      subTab = cleanHash.replace('leads-', '');
    } else if (cleanHash === 'leads') {
      viewName = 'leads';
    } else if (cleanHash.startsWith('calculators-')) {
      viewName = 'calculators';
      subTab = cleanHash.replace('calculators-', '');
    } else if (cleanHash === 'calculators') {
      viewName = 'calculators';
    } else if (cleanHash.startsWith('csctools-')) {
      viewName = 'csctools';
      subTab = cleanHash.replace('csctools-', '');
    } else if (cleanHash === 'csctools') {
      viewName = 'csctools';
    } else if (cleanHash.startsWith('pvcprint-')) {
      viewName = 'pvcprint';
      subTab = cleanHash.replace('pvcprint-', '');
    } else if (cleanHash === 'pvcprint') {
      viewName = 'pvcprint';
    } else if (cleanHash === 'whatsappresizer' || cleanHash === 'whatsapp-resizer' || cleanHash === 'whatsapp') {
      viewName = 'whatsappresizer';
    } else if (cleanHash === 'geminipassport' || cleanHash === 'gemini') {
      viewName = 'passphoto';
    } else if (cleanHash === 'pdfeditor') {
      viewName = 'pdftools';
      subTab = 'pdfEditor';
    } else if (cleanHash === 'imgtopdf' || cleanHash === 'imagetopdf') {
      viewName = 'pdftools';
      subTab = 'imgToPdf';
    } else if (cleanHash.startsWith('jobalert-') || cleanHash === 'jobalert' || cleanHash === 'jobalerts' || cleanHash === 'jobs') {
      viewName = 'jobalert';
      subTab = cleanHash.startsWith('jobalert-') ? cleanHash.replace('jobalert-', '') : '';
    } else if (cleanHash.startsWith('admin-')) {
      viewName = 'admin';
      subTab = cleanHash.replace('admin-', '');
    }

    // Hide all view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.add('hidden');
    });

    // Update active nav link classes
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkHref = link.getAttribute('href') || '';
      if (linkHref === `#${viewName}` || (viewName === 'home' && linkHref === '#home')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Strict Authentication Guard for All Tools & Services
    const publicRoutes = ['home', 'contact', 'admin'];
    const currentUser = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.getCurrentUser) ? VUO_AUTH.getCurrentUser() : null;

    if (!publicRoutes.includes(viewName) && !currentUser) {
      // Revert hash to #home
      window.location.hash = '#home';

      // Hide all views and show Home view
      document.querySelectorAll('.view-container').forEach(el => el.classList.add('hidden'));
      const homeView = document.getElementById('view_home');
      if (homeView) homeView.classList.remove('hidden');

      // Update active nav link to Home
      document.querySelectorAll('.nav-link').forEach(link => {
        const linkHref = link.getAttribute('href') || '';
        if (linkHref === '#home') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (typeof showToast === 'function') {
        showToast("⚠️ Kripya pehle VLE Login karein! Sabhi tools, services, videos aur forms keval registered VLEs ke liye uplabdh hain.", "warning");
      }

      if (typeof VUO_AUTH_MODAL !== 'undefined' && VUO_AUTH_MODAL.openLogin) {
        VUO_AUTH_MODAL.openLogin({
          item: `CSC Tools & Services (${cleanHash.toUpperCase()})`
        }, () => {
          window.location.hash = `#${cleanHash}`;
          VUO_APP.handleRoute(cleanHash);
        });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Show target view (With strict admin guard)
    if (viewName === 'admin' && !VUO_AUTH.isAdmin()) {
      const homeView = document.getElementById('view_home');
      if (homeView) homeView.classList.remove('hidden');
      const adminModal = document.getElementById('adminLoginModal');
      if (adminModal) {
        adminModal.classList.remove('hidden');
        adminModal.style.display = 'flex';
        const passInput = document.getElementById('adminPasswordInput') || document.getElementById('adminPinInput');
        if (passInput) passInput.focus();
      }
    } else {
      const targetView = document.getElementById(`view_${viewName}`);
      if (targetView) {
        targetView.classList.remove('hidden');
      } else {
        const homeView = document.getElementById('view_home');
        if (homeView) homeView.classList.remove('hidden');
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize specific view modules and switch sub-tabs on route entry
    if (viewName === 'whatsappresizer') {
      if (typeof VUO_WHATSAPP_RESIZER !== 'undefined') {
        VUO_WHATSAPP_RESIZER.init();
      }
    } else if (viewName === 'passphoto') {
      VUO_PASSPHOTO.init();
      if (cleanHash === 'geminipassport' || cleanHash === 'gemini') {
        setTimeout(() => {
          const geminiPanel = document.getElementById('passPhotoGeminiPanel');
          if (geminiPanel && geminiPanel.classList.contains('hidden')) {
            VUO_PASSPHOTO.toggleGeminiAssistant();
          }
          const studioCard = document.getElementById('geminiPassportStudioCard') || geminiPanel;
          if (studioCard) studioCard.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else if (viewName === 'imagetools') {
      VUO_IMAGETOOLS.init();
      if (subTab) {
        VUO_IMAGETOOLS.switchTab(subTab);
      }
    } else if (viewName === 'billmaker') {
      VUO_BILLMAKER.init();
    } else if (viewName === 'pdftools') {
      VUO_PDFTOOLS.init();
      if (subTab) {
        const tabMap = {
          'imgtopdf': 'imgToPdf',
          'merge': 'mergePdf',
          'split': 'splitPdf',
          'watermark': 'watermarkPdf',
          'wordtopdf': 'wordToPdf',
          'pdfeditor': 'pdfEditor'
        };
        VUO_PDFTOOLS.switchTab(tabMap[subTab.toLowerCase()] || subTab);
      }
    } else if (viewName === 'resumemaker') {
      VUO_RESUMEMAKER.init();
    } else if (viewName === 'icardmaker') {
      VUO_ICARDMAKER.init();
    } else if (viewName === 'pvcprint') {
      if (typeof VUO_PVCPRINT !== 'undefined') {
        VUO_PVCPRINT.init();
        if (subTab) {
          VUO_PVCPRINT.setCardType(subTab);
        }
      }
    } else if (viewName === 'links') {
      VUO_LINKS.init();
      if (subTab) {
        VUO_LINKS.currentCategory = subTab;
        VUO_LINKS.renderLinks();
      }
    } else if (viewName === 'forms') {
      if (typeof VUO_FORMS !== 'undefined') {
        VUO_FORMS.init();
        if (subTab) {
          VUO_FORMS.currentCategory = subTab;
          VUO_FORMS.renderForms();
        }
      }
    } else if (viewName === 'training') {
      VUO_TRAINING.init();
      if (subTab) {
        VUO_TRAINING.currentCategory = subTab;
        VUO_TRAINING.renderVideos();
      }
      if (typeof VUO_TRAINING !== 'undefined' && typeof VUO_TRAINING.syncFromYouTubeChannel === 'function') {
        setTimeout(() => VUO_TRAINING.syncFromYouTubeChannel(true), 300);
      }
    } else if (viewName === 'leads') {
      if (typeof VUO_LEADS !== 'undefined') {
        VUO_LEADS.init();
        if (subTab) {
          VUO_LEADS.currentCategory = subTab;
          VUO_LEADS.renderAllServiceUI();
        }
      }
    } else if (viewName === 'calculators') {
      if (typeof VUO_CALCULATORS !== 'undefined') {
        VUO_CALCULATORS.init();
        if (subTab) {
          VUO_CALCULATORS.switchTab(subTab);
        }
      }
    } else if (viewName === 'csctools') {
      if (typeof VUO_CSCTOOLS !== 'undefined') {
        VUO_CSCTOOLS.init();
        if (subTab) {
          VUO_CSCTOOLS.switchTab(subTab);
        }
      }
    } else if (viewName === 'jobalert') {
      if (typeof VUO_JOB_ALERT !== 'undefined') {
        VUO_JOB_ALERT.init();
        if (subTab) {
          VUO_JOB_ALERT.setFilter(subTab);
        }
      }
    } else if (viewName === 'admin') {
      if (VUO_AUTH.isAdmin()) {
        if (typeof VUO_ADMIN !== 'undefined') {
          VUO_ADMIN.init();
          if (subTab) {
            VUO_ADMIN.switchTab(subTab);
          }
        }
        if (typeof window.vuoRenderAdminFormsTable === 'function') {
          setTimeout(window.vuoRenderAdminFormsTable, 50);
        }
      }
    }

    applyTranslations();
  }
};

// Initialize App on DOMContentLoaded
if (typeof window !== 'undefined') {
  window.VUO_APP = VUO_APP;
}

document.addEventListener('DOMContentLoaded', () => {
  VUO_APP.init();
});

window.filterDashboardTools = function(cat, btn) { VUO_APP.filterDashboardTools(cat, btn); };

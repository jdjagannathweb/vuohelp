/**
 * VUO CSC HELP - VLE Hardware Store & Amazon Affiliate Hub
 * Curated equipment, printers, biometric scanners, and consumables for CSC VLEs & Cyber Cafes across Odisha.
 * Supports custom Amazon Associate Tag configuration by Admin with automatic fallback.
 */

const VUO_STORE = {
  currentCategory: 'all',
  searchQuery: '',
  defaultTag: 'vuohelp-21',
  customTag: null,

  getAffiliateTag() {
    if (this.customTag) return this.customTag;
    try {
      const saved = localStorage.getItem('vuo_amazon_affiliate_tag');
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    return this.defaultTag;
  },

  setAffiliateTag(tag) {
    if (!tag) return;
    const cleanTag = tag.trim().replace(/^tag=/, '');
    this.customTag = cleanTag;
    localStorage.setItem('vuo_amazon_affiliate_tag', cleanTag);
    if (typeof VUO_DB !== 'undefined' && typeof VUO_DB.directRestSaveDoc === 'function') {
      try {
        VUO_DB.directRestSaveDoc('vuo_settings', 'affiliate', {
          amazonTag: cleanTag,
          updatedAt: Date.now()
        });
      } catch (e) {}
    }
  },

  products: [
    // ---------------- 1. BIOMETRIC SCANNERS (AEPS, PM-KISAN, SUBHADRA) ----------------
    {
      id: 'prod-mantra-mfs100',
      title: 'Mantra MFS100 Optical Fingerprint Scanner',
      category: 'biometric',
      badge: 'CSC Essential',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tagline: 'UIDAI & STQC Approved RD Service Ready',
      desc: 'Top choice for AEPS Cash Withdrawal, PM-KISAN eKYC, Ayushman Card, Jeevan Pramaan, and Odisha Subhadra Yojana authentication. Works with Android OTG & Windows PC.',
      rating: '4.8',
      reviews: '28,400+ VLEs',
      priceApprox: '₹2,350',
      amazonSearchQuery: 'Mantra MFS100 Fingerprint Scanner',
      directAsin: 'B0753CVJ2W',
      icon: 'fa-fingerprint',
      accentColor: 'emerald'
    },
    {
      id: 'prod-mantra-mfs110',
      title: 'Mantra MFS110 L1 Optical Fingerprint Scanner',
      category: 'biometric',
      badge: 'Latest L1 Tech',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      tagline: 'Mandatory L1 Certified UIDAI Biometric',
      desc: 'Next-generation L1 Biometric device compliant with new UIDAI security norms. Cryptographically signed biometric data for banking, DigiPay, and Govt KYC.',
      rating: '4.7',
      reviews: '4,200+ VLEs',
      priceApprox: '₹3,499',
      amazonSearchQuery: 'Mantra MFS110 L1 Fingerprint Scanner',
      directAsin: 'B0CZ4L9CGS',
      icon: 'fa-shield-halved',
      accentColor: 'indigo'
    },
    {
      id: 'prod-morpho-1300',
      title: 'Morpho MSO 1300 E3 Fingerprint Scanner',
      category: 'biometric',
      badge: 'Heavy Duty',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      tagline: 'High-speed capture for tough or dry fingers',
      desc: 'Industry standard for banking Kiosk and high-volume CSC centers. Optical sensor with fake finger detection and scratch-resistant sensor glass.',
      rating: '4.6',
      reviews: '12,900+ VLEs',
      priceApprox: '₹3,850',
      amazonSearchQuery: 'Morpho MSO 1300 E3 Fingerprint Scanner',
      directAsin: 'B07BHMM7CV',
      icon: 'fa-fingerprint',
      accentColor: 'sky'
    },
    {
      id: 'prod-mantra-iris',
      title: 'Mantra MIS100V2 Dual Eye Iris Scanner',
      category: 'biometric',
      badge: 'Senior Citizens',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      tagline: '100% Success where fingerprints fail',
      desc: 'Lifesaver for elderly beneficiaries whose fingerprints are faded. Best for Ayushman Bharat Golden Card generation and Old Age Pension disbursement.',
      rating: '4.8',
      reviews: '3,100+ VLEs',
      priceApprox: '₹4,200',
      amazonSearchQuery: 'Mantra MIS100V2 Single Iris Scanner',
      directAsin: 'B08F22756G',
      icon: 'fa-eye',
      accentColor: 'purple'
    },

    // ---------------- 2. PRINTERS & PVC CARD TRAYS ----------------
    {
      id: 'prod-epson-l3210',
      title: 'Epson EcoTank L3210 All-in-One Ink Tank Color Printer',
      category: 'printers',
      badge: 'Most Popular',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      tagline: 'Ultra-low cost printing (7p black / 18p color)',
      desc: 'The backbone of any CSC center. High quality passport photo printing, color Xerox, document scanning, and certificate printing with mess-free ink tanks.',
      rating: '4.7',
      reviews: '45,800+ Ratings',
      priceApprox: '₹12,499',
      amazonSearchQuery: 'Epson EcoTank L3210 All-in-One Ink Tank Printer',
      directAsin: 'B09HQ5W7H6',
      icon: 'fa-print',
      accentColor: 'amber'
    },
    {
      id: 'prod-pvc-tray-l805',
      title: 'Epson L805 / L8050 / L850 PVC ID Card Tray',
      category: 'printers',
      badge: 'Instant PVC Print',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      tagline: 'Direct PVC Card Printing Tray for Epson',
      desc: 'Convert your Epson photo printer into a full PVC ID card printing machine. Print 2 PVC cards simultaneously (Aadhaar, Voter ID, PAN, Student ID) in 30 seconds.',
      rating: '4.6',
      reviews: '2,900+ Orders',
      priceApprox: '₹499',
      amazonSearchQuery: 'Epson L805 PVC ID card tray',
      directAsin: 'B07MGB5DCP',
      icon: 'fa-id-card',
      accentColor: 'teal'
    },
    {
      id: 'prod-thermal-printer-58mm',
      title: '58mm USB / Bluetooth Thermal Receipt Printer',
      category: 'printers',
      badge: 'Customer Slip Print',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      tagline: 'Zero Ink Thermal Printing for DigiPay & Electricity Bills',
      desc: 'Give professional thermal receipts to citizens for AEPS Cash Withdrawal, Money Transfer, and Electricity Bill payments using VUO CSC Bill Maker.',
      rating: '4.5',
      reviews: '8,500+ VLEs',
      priceApprox: '₹1,599',
      amazonSearchQuery: '58mm USB Bluetooth Thermal Receipt Printer',
      directAsin: 'B07N3BNN5H',
      icon: 'fa-receipt',
      accentColor: 'rose'
    },

    // ---------------- 3. LAMINATION & CONSUMABLES ----------------
    {
      id: 'prod-lamination-machine-a4',
      title: 'Heavy Duty A4 Photo & Document Lamination Machine',
      category: 'paper',
      badge: 'Essential Tool',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      tagline: 'Hot & Cold 4-Roller Jam-Free Lamination',
      desc: 'Fast 2-minute warmup, bubble-free lamination for Aadhaar card, Land Record (RoR), Marks-sheets, and Caste/Income Certificates. High durability.',
      rating: '4.7',
      reviews: '19,200+ VLEs',
      priceApprox: '₹1,850',
      amazonSearchQuery: 'A4 Heavy Duty Lamination Machine with Hot Cold Switch',
      directAsin: 'B07K6Q1X1S',
      icon: 'fa-file-shield',
      accentColor: 'amber'
    },
    {
      id: 'prod-printable-pvc-cards',
      title: 'Inkjet Printable Blank PVC Cards (Pack of 100 Cards)',
      category: 'paper',
      badge: 'CR80 Standard',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      tagline: 'Direct Ink Absorption Waterproof White PVC',
      desc: 'High gloss CR-80 standard thickness (30 Mil / 0.76mm) blank PVC cards. Instant ink drying, scratch-resistant, water-proof color output.',
      rating: '4.6',
      reviews: '5,300+ Orders',
      priceApprox: '₹649',
      amazonSearchQuery: 'Inkjet Printable Blank PVC Cards Pack of 100',
      directAsin: 'B07Q83G278',
      icon: 'fa-credit-card',
      accentColor: 'emerald'
    },
    {
      id: 'prod-lamination-pouches-a4',
      title: 'A4 Lamination Pouches (125 Micron, Pack of 100 Sheets)',
      category: 'paper',
      badge: 'Top Seller',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      tagline: 'Crystal Clear Anti-Static High Gloss Film',
      desc: 'Premium quality 125 micron thermal film for certificates and government legal documents. Protects against water, dust, and aging.',
      rating: '4.8',
      reviews: '34,000+ Orders',
      priceApprox: '₹420',
      amazonSearchQuery: 'A4 Lamination Pouches 125 Micron Pack of 100',
      directAsin: 'B07V28ZFXQ',
      icon: 'fa-layer-group',
      accentColor: 'sky'
    },
    {
      id: 'prod-glossy-photo-paper-4x6',
      title: 'Premium Glossy Photo Paper 4x6 / A4 (210 GSM)',
      category: 'paper',
      badge: 'Studio Quality',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      tagline: 'High Gloss Waterproof Paper for Passport Photos',
      desc: 'Cast coated high brightness paper compatible with all Epson, Canon, and HP Inkjet printers. Vivid color reproduction for urgent passport photos.',
      rating: '4.7',
      reviews: '22,600+ Orders',
      priceApprox: '₹280',
      amazonSearchQuery: 'Glossy Photo Paper 4x6 210 GSM for Passport Photos',
      directAsin: 'B079DNGM5Z',
      icon: 'fa-image',
      accentColor: 'indigo'
    },

    // ---------------- 4. CYBER CAFE & SHOP ACCESSORIES ----------------
    {
      id: 'prod-logitech-c270-webcam',
      title: 'Logitech C270 HD Web Camera (with Mic)',
      category: 'accessories',
      badge: 'KYC & Photo',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      tagline: 'Automatic Light Correction with Noise-Cancelling Mic',
      desc: 'Crisp capture for live video KYC, PM-Kisan photo verification, CSC live beneficiary registration, and instant webcam passport photos with VUO Studio.',
      rating: '4.8',
      reviews: '68,000+ Reviews',
      priceApprox: '₹1,995',
      amazonSearchQuery: 'Logitech C270 HD Webcam with Built-in Microphone',
      directAsin: 'B003PAOAWG',
      icon: 'fa-camera',
      accentColor: 'purple'
    },
    {
      id: 'prod-passport-die-cutter',
      title: 'Heavy Duty Passport Photo Die Cutter Punch (25x35mm / 35x45mm)',
      category: 'accessories',
      badge: 'Time Saver',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      tagline: 'One-Press Precision Corner Cutting for Photos',
      desc: 'Say goodbye to scissors! Cut perfectly rounded clean passport photos in a single second. Essential for high speed CSC photo studios.',
      rating: '4.7',
      reviews: '3,800+ VLEs',
      priceApprox: '₹750',
      amazonSearchQuery: 'Heavy Duty Passport Size Photo Die Cutter 25x35mm 35x45mm',
      directAsin: 'B07C64R67Z',
      icon: 'fa-scissors',
      accentColor: 'rose'
    },
    {
      id: 'prod-thermal-paper-rolls',
      title: '58mm (2 Inch) Thermal Paper Rolls (Pack of 20 Rolls)',
      category: 'accessories',
      badge: 'Bulk Value',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      tagline: 'BPA-Free High Contrast Long Life Paper',
      desc: 'Universal fit for all 58mm mini thermal POS printers. Clear dark black impression without paper jam. Great bulk value for VLE daily receipts.',
      rating: '4.6',
      reviews: '9,400+ Orders',
      priceApprox: '₹399',
      amazonSearchQuery: '58mm 2 Inch Thermal Paper Rolls Pack of 10 20',
      directAsin: 'B07P8N9BCH',
      icon: 'fa-scroll',
      accentColor: 'amber'
    },
    {
      id: 'prod-usb-hub-powered',
      title: '4-Port USB 3.0 Hub with Individual Power Switches',
      category: 'accessories',
      badge: 'Multi-Device',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      tagline: 'Connect Biometric Scanner, Web Cam & Printer together',
      desc: 'High speed data transmission with separate LED on/off buttons. Solves USB port shortage on VLE laptop/desktop.',
      rating: '4.6',
      reviews: '18,500+ Orders',
      priceApprox: '₹449',
      amazonSearchQuery: '4 Port USB 3.0 Hub with individual power switches',
      directAsin: 'B07FCKQ89D',
      icon: 'fa-network-wired',
      accentColor: 'teal'
    }
  ],

  getProductUrl(product) {
    const tag = this.getAffiliateTag();
    if (product.directAsin) {
      return `https://www.amazon.in/dp/${product.directAsin}?tag=${encodeURIComponent(tag)}`;
    }
    return `https://www.amazon.in/s?k=${encodeURIComponent(product.amazonSearchQuery)}&tag=${encodeURIComponent(tag)}`;
  },

  setCategory(cat) {
    this.currentCategory = cat || 'all';
    document.querySelectorAll('.vle-store-cat-btn').forEach(btn => {
      const bCat = btn.getAttribute('data-cat') || 'all';
      if (bCat === this.currentCategory) {
        btn.className = 'vle-store-cat-btn px-4 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md cursor-pointer whitespace-nowrap transition-all';
      } else {
        btn.className = 'vle-store-cat-btn px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap transition-all';
      }
    });
    this.renderStore();
  },

  handleSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderStore();
  },

  renderStore() {
    const container = document.getElementById('vleStoreProductGrid');
    const countEl = document.getElementById('vleStoreProductCount');
    if (!container) return;

    let filtered = this.products;

    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.currentCategory);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.desc.toLowerCase().includes(this.searchQuery) ||
        p.tagline.toLowerCase().includes(this.searchQuery)
      );
    }

    if (countEl) countEl.textContent = `${filtered.length} Equipment Deals`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-box-open text-4xl text-slate-300 mb-3 block"></i>
          <p class="text-sm font-bold text-slate-700">No products match your search.</p>
          <p class="text-xs text-slate-500 mt-1">Try searching for Mantra, Lamination, Photo Paper, or Epson.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const url = this.getProductUrl(p);
      return `
        <div class="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/0 rounded-bl-full pointer-events-none"></div>

          <div>
            <!-- Top Badges & Category -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${p.badgeClass}">
                <i class="fa-solid ${p.icon}"></i> ${p.badge}
              </span>
              <span class="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <i class="fa-solid fa-star text-amber-400 text-xs"></i> ${p.rating}
                <span class="text-[10px] text-slate-400">(${p.reviews})</span>
              </span>
            </div>

            <!-- Title & Tagline -->
            <h3 class="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
              ${p.title}
            </h3>
            <p class="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-[10px]"></i> ${p.tagline}
            </p>

            <!-- Description -->
            <p class="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
              ${p.desc}
            </p>
          </div>

          <!-- Price & Action Button -->
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Approx. Deal</div>
              <div class="text-base font-black text-slate-900">${p.priceApprox}*</div>
            </div>

            <a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-orange-500/20 inline-flex items-center gap-1.5 transition-all transform hover:scale-[1.03] active:scale-95 cursor-pointer">
              <i class="fa-brands fa-amazon text-sm text-slate-950"></i>
              <span>Buy on Amazon</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-0.5 opacity-80"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  // Helper to inject contextual affiliate banners on specific tools
  renderContextualBanners() {
    const tag = this.getAffiliateTag();

    // 1. Passport Photo Maker Banner
    const passphotoTarget = document.getElementById('passphotoAffiliateBox');
    if (passphotoTarget && !passphotoTarget.hasChildNodes()) {
      passphotoTarget.innerHTML = `
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-amber-50 border border-sky-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <i class="fa-solid fa-camera-retro"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-slate-900">📸 Recommended for Photo Studio: Glossy 4x6 Photo Paper &amp; Die Cutter</h4>
              <p class="text-[11px] text-slate-600">Get crystal clear 210 GSM photo paper &amp; 1-second corner die-cutter to speed up photo printing.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a href="https://www.amazon.in/s?k=Glossy+Photo+Paper+4x6+210+GSM&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
              <i class="fa-brands fa-amazon text-amber-400"></i> Photo Paper
            </a>
            <a href="https://www.amazon.in/s?k=Passport+Photo+Die+Cutter+Punch+35x45mm&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5">
              <i class="fa-solid fa-scissors"></i> Photo Cutter
            </a>
          </div>
        </div>
      `;
    }

    // 2. PVC Print Banner
    const pvcTarget = document.getElementById('pvcAffiliateBox');
    if (pvcTarget && !pvcTarget.hasChildNodes()) {
      pvcTarget.innerHTML = `
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-teal-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-slate-900">💳 Epson PVC ID Card Tray &amp; Printable Blank PVC Cards (100 Pack)</h4>
              <p class="text-[11px] text-slate-600">Print Aadhaar, Ayushman &amp; Voter PVC cards on your standard Epson printer with specialized tray.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a href="https://www.amazon.in/s?k=Epson+PVC+ID+Card+Tray&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
              <i class="fa-brands fa-amazon text-teal-300"></i> PVC Tray
            </a>
            <a href="https://www.amazon.in/s?k=Inkjet+Printable+Blank+PVC+Cards+Pack+of+100&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5">
              <i class="fa-solid fa-credit-card"></i> 100 Blank Cards
            </a>
          </div>
        </div>
      `;
    }

    // 3. Bill Maker Banner
    const billTarget = document.getElementById('billMakerAffiliateBox');
    if (billTarget && !billTarget.hasChildNodes()) {
      billTarget.innerHTML = `
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-slate-900">🖨️ Give Printed Thermal Slips: 58mm Mini USB/Bluetooth POS Printer</h4>
              <p class="text-[11px] text-slate-600">Zero-ink thermal printer for AEPS cash withdrawal &amp; bill receipts. Instant customer satisfaction.</p>
            </div>
          </div>
          <a href="https://www.amazon.in/s?k=58mm+USB+Bluetooth+Thermal+Receipt+Printer&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5 shrink-0">
            <i class="fa-brands fa-amazon text-amber-300"></i> Check Thermal Printer Price
          </a>
        </div>
      `;
    }

    // 4. CSC Tools Biometric Scanner Banner
    const cscTarget = document.getElementById('cscToolsAffiliateBox');
    if (cscTarget && !cscTarget.hasChildNodes()) {
      cscTarget.innerHTML = `
        <div class="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <i class="fa-solid fa-fingerprint"></i>
            </div>
            <div>
              <h4 class="text-xs font-black text-slate-900">🔒 Mantra MFS100 / MFS110 L1 Optical Biometric Scanner (RD Service)</h4>
              <p class="text-[11px] text-slate-600">Mandatory for DigiPay, PM-Kisan, Ayushman Golden Card &amp; Odisha Subhadra Yojana authentication.</p>
            </div>
          </div>
          <a href="https://www.amazon.in/s?k=Mantra+MFS100+Fingerprint+Scanner&tag=${encodeURIComponent(tag)}" target="_blank" rel="noopener noreferrer nofollow" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black shadow-sm inline-flex items-center gap-1.5 shrink-0">
            <i class="fa-brands fa-amazon text-amber-300"></i> Check Biometric Price
          </a>
        </div>
      `;
    }
  },

  init() {
    this.renderStore();
    this.renderContextualBanners();
  }
};

if (typeof window !== 'undefined') {
  window.VUO_STORE = VUO_STORE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VUO_STORE;
}

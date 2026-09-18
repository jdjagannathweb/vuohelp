/**
 * VUO CSC HELP - School & College ID Card Maker
 * High resolution CR80 identity card generator with Light / Dark theme,
 * custom School Logo upload, Student Photo, dynamic QR verification,
 * and double-sided A4 PDF / PNG export.
 */

const VUO_ICARDMAKER = {
  theme: 'light', // 'light' or 'dark'
  logoDataUrl: null,
  photoDataUrl: null,
  signDataUrl: null,

  defaultLogoSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="4"/><path d="M50 18 L76 34 L76 42 L50 28 L24 42 L24 34 Z" fill="%23ffffff"/><path d="M30 46 L30 68 L36 68 L36 46 Z M47 46 L47 68 L53 68 L53 46 Z M64 46 L64 68 L70 68 L70 46 Z" fill="%23ffffff"/><rect x="20" y="68" width="60" height="7" rx="2" fill="%23f59e0b"/><circle cx="50" cy="38" r="5" fill="%23f59e0b"/></svg>`,
  defaultStudentSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="%23e2e8f0"/><circle cx="50" cy="45" r="22" fill="%2394a3b8"/><path d="M15 110 C15 78 32 72 50 72 C68 72 85 78 85 110 Z" fill="%2364748b"/></svg>`,
  defaultSignSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50"><path d="M10 35 Q 35 5, 55 28 T 90 20 T 120 32 T 140 15" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round"/></svg>`,

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    this.updateCard();
  },

  bindEvents() {
    const textInputs = [
      'schoolName', 'schoolSubtitle', 'schoolAddress', 'schoolPhone',
      'cardType', 'studentName', 'admNo', 'studentClass', 'rollNo',
      'dob', 'bloodGroup', 'fatherName', 'studentMobile', 'cardSession'
    ];

    textInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateCard());
    });

    // School Logo Input
    const logoInput = document.getElementById('schoolLogoInput');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.logoDataUrl = ev.target.result;
            this.updateCard();
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Student Photo Input
    const photoInput = document.getElementById('studentPhotoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.photoDataUrl = ev.target.result;
            this.updateCard();
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Principal Signature Input
    const signInput = document.getElementById('principalSignInput');
    if (signInput) {
      signInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.signDataUrl = ev.target.result;
            this.updateCard();
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }
  },

  setTheme(theme) {
    this.theme = theme;
    const lightBtn = document.getElementById('icardThemeLightBtn');
    const darkBtn = document.getElementById('icardThemeDarkBtn');
    if (lightBtn && darkBtn) {
      if (theme === 'light') {
        lightBtn.className = 'flex-1 py-2 px-3 rounded-xl font-black text-xs border-2 border-sky-500 bg-sky-50 text-sky-800 shadow-sm flex items-center justify-center gap-1.5 transition-all';
        darkBtn.className = 'flex-1 py-2 px-3 rounded-xl font-bold text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all';
      } else {
        darkBtn.className = 'flex-1 py-2 px-3 rounded-xl font-black text-xs border-2 border-amber-400 bg-slate-900 text-amber-300 shadow-sm flex items-center justify-center gap-1.5 transition-all';
        lightBtn.className = 'flex-1 py-2 px-3 rounded-xl font-bold text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all';
      }
    }
    this.updateCard();
  },

  updateCard() {
    const val = id => document.getElementById(id)?.value?.trim() || '';

    const schoolName = val('schoolName') || 'SARASWATI VIDYA MANDIR HIGH SCHOOL';
    const schoolSubtitle = val('schoolSubtitle') || 'Affiliated to CBSE / BSE Odisha | Estd: 1994';
    const schoolAddress = val('schoolAddress') || 'Station Road, Satyabadi, Puri, Odisha - 752014';
    const schoolPhone = val('schoolPhone') || '+91 99370 37131';
    const cardType = val('cardType') || 'STUDENT IDENTITY CARD';
    const studentName = val('studentName') || 'Rahul Kumar Nayak';
    const admNo = val('admNo') || 'ADM-2026-1082';
    const studentClass = val('studentClass') || 'Class X - Sec A';
    const rollNo = val('rollNo') || '18';
    const dob = val('dob') || '15/08/2010';
    const bloodGroup = val('bloodGroup') || 'O+';
    const fatherName = val('fatherName') || 'Bikram Nayak';
    const studentMobile = val('studentMobile') || '9937037131';
    const cardSession = val('cardSession') || '2026 - 2027';

    const isLight = (this.theme === 'light');
    const frontEl = document.getElementById('icardFrontContainer');
    const backEl = document.getElementById('icardBackContainer');

    const logoSrc = this.logoDataUrl || this.defaultLogoSvg;
    const photoSrc = this.photoDataUrl || this.defaultStudentSvg;
    const signSrc = this.signDataUrl || this.defaultSignSvg;

    if (frontEl) {
      if (isLight) {
        frontEl.className = "w-[390px] h-[245px] bg-white rounded-2xl text-slate-900 shadow-2xl relative overflow-hidden border-2 border-sky-600 flex flex-col justify-between select-none";
        frontEl.innerHTML = `
          <!-- Top Header Strip -->
          <div class="bg-gradient-to-r from-blue-900 via-sky-800 to-indigo-900 text-white px-3 py-1.5 flex items-center gap-2 border-b-2 border-amber-400">
            <img src="${logoSrc}" class="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs shrink-0" alt="Logo" />
            <div class="flex-1 min-w-0">
              <h2 class="text-[11.5px] font-black uppercase tracking-tight leading-tight truncate font-heading text-amber-300">${schoolName}</h2>
              <p class="text-[8.5px] text-sky-100 truncate opacity-90">${schoolSubtitle}</p>
            </div>
          </div>

          <!-- Card Type Ribbon -->
          <div class="bg-amber-400 text-slate-950 px-3 py-0.5 flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
            <span>🎓 ${cardType}</span>
            <span class="bg-slate-950 text-white px-1.5 py-0.2 rounded font-mono">SESSION: ${cardSession}</span>
          </div>

          <!-- Body Grid (Photo + Details + QR) -->
          <div class="p-2.5 flex items-center gap-3 flex-1">
            <!-- Student Photo Box -->
            <div class="flex flex-col items-center shrink-0">
              <div class="w-[74px] h-[92px] rounded-lg border-2 border-sky-600 overflow-hidden shadow-sm bg-slate-100">
                <img src="${photoSrc}" class="w-full h-full object-cover" alt="Student Photo" />
              </div>
              <span class="mt-1 px-1.5 py-0.2 rounded bg-sky-100 text-sky-900 text-[8px] font-black uppercase font-mono">ROLL: ${rollNo}</span>
            </div>

            <!-- Details Key-Value List -->
            <div class="flex-1 text-[9.5px] space-y-0.5 leading-tight text-slate-700">
              <div class="border-b border-slate-200 pb-0.5 mb-1">
                <span class="text-[7.5px] uppercase font-bold text-slate-400 block">Student Name</span>
                <span class="text-[11px] font-black uppercase text-slate-900 tracking-tight font-heading">${studentName}</span>
              </div>
              <div class="grid grid-cols-2 gap-x-1">
                <div><span class="font-bold text-slate-500">Adm No:</span> <span class="font-bold text-sky-800 font-mono">${admNo}</span></div>
                <div><span class="font-bold text-slate-500">Class:</span> <span class="font-bold text-slate-900">${studentClass}</span></div>
                <div><span class="font-bold text-slate-500">DOB:</span> <span class="font-bold text-slate-900">${dob}</span></div>
                <div><span class="font-bold text-slate-500">Blood:</span> <span class="font-black text-rose-700 font-mono">${bloodGroup}</span></div>
              </div>
              <div class="truncate"><span class="font-bold text-slate-500">Father:</span> <span class="font-semibold text-slate-800">${fatherName}</span></div>
              <div><span class="font-bold text-slate-500">Contact:</span> <span class="font-bold text-slate-900 font-mono">${studentMobile}</span></div>
            </div>

            <!-- QR & Principal Sign Column -->
            <div class="flex flex-col items-center justify-between h-full shrink-0 pl-1 border-l border-slate-100">
              <div id="icardFrontQrBox" class="w-[46px] h-[46px] bg-white p-0.5 border border-slate-300 rounded shadow-2xs flex items-center justify-center"></div>
              <div class="flex flex-col items-center mt-1">
                <img src="${signSrc}" class="h-4 max-w-[50px] object-contain" alt="Sign" />
                <span class="text-[7px] font-black uppercase text-slate-500 border-t border-slate-400 pt-0.5 mt-0.5">Principal</span>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Strip -->
          <div class="bg-slate-100 text-slate-600 px-3 py-1 border-t border-slate-200 flex items-center justify-between text-[7.5px] font-medium">
            <span class="truncate max-w-[260px]"><i class="fa-solid fa-location-dot text-sky-600 mr-1"></i>${schoolAddress}</span>
            <span class="font-mono font-bold text-slate-700">${schoolPhone}</span>
          </div>
        `;
      } else {
        // DARK ROYAL THEME
        frontEl.className = "w-[390px] h-[245px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl text-white shadow-2xl relative overflow-hidden border-2 border-amber-400 flex flex-col justify-between select-none";
        frontEl.innerHTML = `
          <!-- Top Header Strip -->
          <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-3 py-1.5 flex items-center gap-2 border-b-2 border-amber-400">
            <img src="${logoSrc}" class="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs shrink-0" alt="Logo" />
            <div class="flex-1 min-w-0">
              <h2 class="text-[11.5px] font-black uppercase tracking-tight leading-tight truncate font-heading text-amber-300">${schoolName}</h2>
              <p class="text-[8.5px] text-sky-200 truncate opacity-90">${schoolSubtitle}</p>
            </div>
          </div>

          <!-- Card Type Ribbon -->
          <div class="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 px-3 py-0.5 flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
            <span>🎓 ${cardType}</span>
            <span class="bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded font-mono">SESSION: ${cardSession}</span>
          </div>

          <!-- Body Grid (Photo + Details + QR) -->
          <div class="p-2.5 flex items-center gap-3 flex-1">
            <!-- Student Photo Box -->
            <div class="flex flex-col items-center shrink-0">
              <div class="w-[74px] h-[92px] rounded-lg border-2 border-amber-400 overflow-hidden shadow-sm bg-slate-900">
                <img src="${photoSrc}" class="w-full h-full object-cover" alt="Student Photo" />
              </div>
              <span class="mt-1 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase font-mono">ROLL: ${rollNo}</span>
            </div>

            <!-- Details Key-Value List -->
            <div class="flex-1 text-[9.5px] space-y-0.5 leading-tight text-slate-300">
              <div class="border-b border-slate-700/80 pb-0.5 mb-1">
                <span class="text-[7.5px] uppercase font-bold text-slate-400 block">Student Name</span>
                <span class="text-[11px] font-black uppercase text-amber-200 tracking-tight font-heading">${studentName}</span>
              </div>
              <div class="grid grid-cols-2 gap-x-1">
                <div><span class="font-bold text-slate-400">Adm No:</span> <span class="font-bold text-sky-400 font-mono">${admNo}</span></div>
                <div><span class="font-bold text-slate-400">Class:</span> <span class="font-bold text-white">${studentClass}</span></div>
                <div><span class="font-bold text-slate-400">DOB:</span> <span class="font-bold text-white">${dob}</span></div>
                <div><span class="font-bold text-slate-400">Blood:</span> <span class="font-black text-rose-400 font-mono">${bloodGroup}</span></div>
              </div>
              <div class="truncate"><span class="font-bold text-slate-400">Father:</span> <span class="font-semibold text-slate-200">${fatherName}</span></div>
              <div><span class="font-bold text-slate-400">Contact:</span> <span class="font-bold text-amber-300 font-mono">${studentMobile}</span></div>
            </div>

            <!-- QR & Principal Sign Column -->
            <div class="flex flex-col items-center justify-between h-full shrink-0 pl-1 border-l border-slate-800">
              <div id="icardFrontQrBox" class="w-[46px] h-[46px] bg-white p-0.5 border border-amber-400/60 rounded shadow-2xs flex items-center justify-center"></div>
              <div class="flex flex-col items-center mt-1">
                <img src="${signSrc}" class="h-4 max-w-[50px] object-contain filter invert" alt="Sign" />
                <span class="text-[7px] font-black uppercase text-amber-400 border-t border-slate-600 pt-0.5 mt-0.5">Principal</span>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Strip -->
          <div class="bg-slate-900/90 text-slate-400 px-3 py-1 border-t border-slate-800 flex items-center justify-between text-[7.5px] font-medium">
            <span class="truncate max-w-[260px]"><i class="fa-solid fa-location-dot text-amber-400 mr-1"></i>${schoolAddress}</span>
            <span class="font-mono font-bold text-amber-300">${schoolPhone}</span>
          </div>
        `;
      }
    }

    // BACK CARD
    if (backEl) {
      if (isLight) {
        backEl.className = "w-[390px] h-[245px] bg-slate-50 rounded-2xl text-slate-800 shadow-2xl relative overflow-hidden border-2 border-sky-600 flex flex-col justify-between select-none p-3.5";
        backEl.innerHTML = `
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div class="flex items-center gap-2">
              <img src="${logoSrc}" class="w-6 h-6 rounded-full bg-white p-0.5 object-contain shadow-2xs" alt="Logo" />
              <span class="text-[10px] font-black text-sky-900 uppercase tracking-tight font-heading">${schoolName}</span>
            </div>
            <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-900 text-[8px] font-bold">RULES & TERMS</span>
          </div>

          <!-- Instructions Body -->
          <div class="text-[8.5px] text-slate-600 space-y-1 my-2 leading-tight">
            <p><i class="fa-solid fa-circle-check text-sky-600 mr-1 text-[7px]"></i>1. This identity card is the property of the school and must be produced upon demand.</p>
            <p><i class="fa-solid fa-circle-check text-sky-600 mr-1 text-[7px]"></i>2. Loss of this card must be immediately reported to the Principal office.</p>
            <p><i class="fa-solid fa-circle-check text-sky-600 mr-1 text-[7px]"></i>3. Valid strictly for Session <strong class="text-slate-900">${cardSession}</strong>.</p>
            <p><i class="fa-solid fa-circle-check text-sky-600 mr-1 text-[7px]"></i>4. In case of emergency or if found, please return to school office or call below.</p>
          </div>

          <!-- Emergency Contacts & Signature -->
          <div class="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-[7.5px] uppercase font-bold text-slate-400 block">Emergency Return Address</span>
              <p class="text-[8px] text-slate-700 font-semibold max-w-[200px] leading-tight">${schoolAddress}</p>
              <p class="text-[8.5px] font-bold text-sky-800 font-mono mt-0.5"><i class="fa-solid fa-phone text-[7px] mr-1"></i>${schoolPhone}</p>
            </div>
            <div class="flex flex-col items-center">
              <img src="${signSrc}" class="h-5 max-w-[65px] object-contain" alt="Sign" />
              <span class="text-[7px] font-black uppercase text-slate-600 border-t border-slate-400 pt-0.5 mt-0.5">Authorized Signatory</span>
            </div>
          </div>

          <div class="text-center text-[7px] text-slate-400 font-mono pt-1">
            DIGITAL STUDENT ID CARD - GENERATED VIA VUO CSC HELP
          </div>
        `;
      } else {
        // DARK BACK
        backEl.className = "w-[390px] h-[245px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-2xl relative overflow-hidden border-2 border-amber-400 flex flex-col justify-between select-none p-3.5";
        backEl.innerHTML = `
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div class="flex items-center gap-2">
              <img src="${logoSrc}" class="w-6 h-6 rounded-full bg-white p-0.5 object-contain shadow-2xs" alt="Logo" />
              <span class="text-[10px] font-black text-amber-300 uppercase tracking-tight font-heading">${schoolName}</span>
            </div>
            <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[8px] font-black">RULES & TERMS</span>
          </div>

          <!-- Instructions Body -->
          <div class="text-[8.5px] text-slate-300 space-y-1 my-2 leading-tight">
            <p><i class="fa-solid fa-circle-check text-amber-400 mr-1 text-[7px]"></i>1. This identity card is the property of the school and must be produced upon demand.</p>
            <p><i class="fa-solid fa-circle-check text-amber-400 mr-1 text-[7px]"></i>2. Loss of this card must be immediately reported to the Principal office.</p>
            <p><i class="fa-solid fa-circle-check text-amber-400 mr-1 text-[7px]"></i>3. Valid strictly for Session <strong class="text-amber-200">${cardSession}</strong>.</p>
            <p><i class="fa-solid fa-circle-check text-amber-400 mr-1 text-[7px]"></i>4. In case of emergency or if found, please return to school office or call below.</p>
          </div>

          <!-- Emergency Contacts & Signature -->
          <div class="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-[7.5px] uppercase font-bold text-slate-400 block">Emergency Return Address</span>
              <p class="text-[8px] text-slate-300 font-semibold max-w-[200px] leading-tight">${schoolAddress}</p>
              <p class="text-[8.5px] font-bold text-amber-300 font-mono mt-0.5"><i class="fa-solid fa-phone text-[7px] mr-1"></i>${schoolPhone}</p>
            </div>
            <div class="flex flex-col items-center">
              <img src="${signSrc}" class="h-5 max-w-[65px] object-contain filter invert" alt="Sign" />
              <span class="text-[7px] font-black uppercase text-amber-300 border-t border-slate-600 pt-0.5 mt-0.5">Authorized Signatory</span>
            </div>
          </div>

          <div class="text-center text-[7px] text-slate-500 font-mono pt-1">
            DIGITAL STUDENT ID CARD - GENERATED VIA VUO CSC HELP
          </div>
        `;
      }
    }

    // Render Dynamic QR code
    this.renderQrCode(studentName, admNo, studentClass, schoolName, cardSession, studentMobile);
  },

  renderQrCode(name, adm, sClass, school, session, phone) {
    const qrContainer = document.getElementById('icardFrontQrBox');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    const qrText = `STUDENT ID VERIFICATION\nName: ${name}\nAdm No: ${adm}\nClass: ${sClass}\nSchool: ${school}\nSession: ${session}\nPhone: ${phone}\nStatus: VERIFIED VALID`;

    if (window.QRCode) {
      new QRCode(qrContainer, {
        text: qrText,
        width: 42,
        height: 42,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  },

  downloadFrontPng() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (Front PNG)', category: 'icard' }, () => this._doDownloadFrontPng());
    }
    this._doDownloadFrontPng();
  },
  _doDownloadFrontPng() {
    const frontEl = document.getElementById('icardFrontContainer');
    if (!frontEl || !window.html2canvas) {
      showToast("Card not ready or library loading.", "warning");
      return;
    }
    showToast("Generating Front Card HD PNG...", "info");
    html2canvas(frontEl, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      const name = document.getElementById('studentName')?.value || 'Student';
      link.download = `School_ID_Front_${name.replace(/\\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("Front ID Card PNG downloaded!", "success");
    });
  },

  downloadBackPng() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (Back PNG)', category: 'icard' }, () => this._doDownloadBackPng());
    }
    this._doDownloadBackPng();
  },
  _doDownloadBackPng() {
    const backEl = document.getElementById('icardBackContainer');
    if (!backEl || !window.html2canvas) {
      showToast("Card not ready or library loading.", "warning");
      return;
    }
    showToast("Generating Back Card HD PNG...", "info");
    html2canvas(backEl, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      const name = document.getElementById('studentName')?.value || 'Student';
      link.download = `School_ID_Back_${name.replace(/\\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("Back ID Card PNG downloaded!", "success");
    });
  },

  downloadFullPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (A4 Print PDF)', category: 'icard' }, () => this._doDownloadFullPdf());
    }
    this._doDownloadFullPdf();
  },
  _doDownloadFullPdf() {
    const frontEl = document.getElementById('icardFrontContainer');
    const backEl = document.getElementById('icardBackContainer');

    if (!frontEl || !backEl || !window.html2canvas || !window.jspdf) {
      showToast("Libraries loading, please try again in a moment.", "warning");
      return;
    }

    showToast("Generating Double-Sided A4 Print PDF...", "info");

    Promise.all([
      html2canvas(frontEl, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }),
      html2canvas(backEl, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
    ]).then(([frontCanvas, backCanvas]) => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 is 210 x 297 mm

      // Standard CR80 ID Card dimensions: 85.6mm x 53.98mm
      const cardW = 85.6;
      const cardH = 53.98;

      // Header on PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text("OFFICIAL SCHOOL & COLLEGE IDENTITY CARD", 105, 20, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Standard CR80 Format (85.6 x 54 mm) - Ready for Direct PVC Printing or Lamination", 105, 26, { align: 'center' });

      // Cutting guide rectangle / marks
      const startY = 40;
      const frontX = 16;
      const backX = 108;

      // Draw Front Card
      const frontImg = frontCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(frontImg, 'JPEG', frontX, startY, cardW, cardH);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.rect(frontX - 1, startY - 1, cardW + 2, cardH + 2); // Cutting outline
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text("FRONT SIDE (Cut along border)", frontX + (cardW / 2), startY + cardH + 6, { align: 'center' });

      // Draw Back Card
      const backImg = backCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(backImg, 'JPEG', backX, startY, cardW, cardH);
      pdf.rect(backX - 1, startY - 1, cardW + 2, cardH + 2); // Cutting outline
      pdf.text("BACK SIDE (Cut along border)", backX + (cardW / 2), startY + cardH + 6, { align: 'center' });

      // Second row / extra duplicate copy for student records
      const row2Y = startY + cardH + 22;
      pdf.addImage(frontImg, 'JPEG', frontX, row2Y, cardW, cardH);
      pdf.rect(frontX - 1, row2Y - 1, cardW + 2, cardH + 2);
      pdf.text("DUPLICATE COPY (Front)", frontX + (cardW / 2), row2Y + cardH + 6, { align: 'center' });

      pdf.addImage(backImg, 'JPEG', backX, row2Y, cardW, cardH);
      pdf.rect(backX - 1, row2Y - 1, cardW + 2, cardH + 2);
      pdf.text("DUPLICATE COPY (Back)", backX + (cardW / 2), row2Y + cardH + 6, { align: 'center' });

      // Print Instructions Footer
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Printed from VUO CSC Help Platform | Keep scale at 100% (Actual Size) in printer settings.", 105, 280, { align: 'center' });

      const name = document.getElementById('studentName')?.value || 'Student';
      pdf.save(`School_ID_Card_${name.replace(/\\s+/g, '_')}.pdf`);
      showToast("Printable ID Card PDF generated with cutting guides!", "success");
    });
  },

  printCard() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'Student ID Card (Print)', category: 'icard' }, () => this._doPrintCard());
    }
    this._doPrintCard();
  },
  _doPrintCard() {
    window.print();
  }
};

window.VUO_ICARDMAKER = VUO_ICARDMAKER;

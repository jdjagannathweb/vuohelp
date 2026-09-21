/**
 * VUO CSC HELP - School & College ID Card Maker
 * High resolution CR80 identity card generator with Light / Dark theme,
 * custom School Logo upload, Student Photo, dynamic QR verification,
 * and double-sided A4 PDF / PNG export.
 */

const VUO_ICARDMAKER = {
  theme: 'multicolor_wave', // 'multicolor_wave', 'tricolor_crest', 'dark_gold'
  logoDataUrl: null,
  photoDataUrl: null,
  signDataUrl: null,

  defaultLogoSvg: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#f59e0b" stroke-width="4"/><path d="M50 18 L76 34 L76 42 L50 28 L24 42 L24 34 Z" fill="#ffffff"/><path d="M30 46 L30 68 L36 68 L36 46 Z M47 46 L47 68 L53 68 L53 46 Z M64 46 L64 68 L70 68 L70 46 Z" fill="#ffffff"/><rect x="20" y="68" width="60" height="7" rx="2" fill="#f59e0b"/><circle cx="50" cy="38" r="5" fill="#f59e0b"/></svg>'),
  defaultStudentSvg: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#e2e8f0"/><circle cx="50" cy="45" r="22" fill="#94a3b8"/><path d="M15 110 C15 78 32 72 50 72 C68 72 85 78 85 110 Z" fill="#64748b"/></svg>'),
  defaultSignSvg: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50"><path d="M10 35 Q 35 5, 55 28 T 90 20 T 120 32 T 140 15" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/></svg>'),

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
    const waveBtn = document.getElementById('icardThemeWaveBtn');
    const triBtn = document.getElementById('icardThemeTricolorBtn');
    const darkBtn = document.getElementById('icardThemeDarkBtn');

    const activeClasses = 'py-2 px-2.5 rounded-xl font-black text-xs border-2 border-sky-500 bg-sky-50 text-sky-900 shadow-sm flex items-center justify-center gap-1.5 transition-all';
    const inactiveClasses = 'py-2 px-2.5 rounded-xl font-bold text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all';

    if (waveBtn) waveBtn.className = (theme === 'multicolor_wave' || theme === 'light') ? activeClasses : inactiveClasses;
    if (triBtn) triBtn.className = (theme === 'tricolor_crest') ? activeClasses : inactiveClasses;
    if (darkBtn) darkBtn.className = (theme === 'dark_gold' || theme === 'dark') ? activeClasses : inactiveClasses;

    this.updateCard();
  },

  // ---------------- Odia Typing Assistant Engine ---------------- //
  odiaWordDict: {
    'saraswati': 'ସରସ୍ୱତୀ',
    'sarasvati': 'ସରସ୍ୱତୀ',
    'shishu': 'ଶିଶୁ',
    'sishu': 'ଶିଶୁ',
    'bidya': 'ବିଦ୍ୟା',
    'vidya': 'ବିଦ୍ୟା',
    'mandir': 'ମନ୍ଦିର',
    'mandira': 'ମନ୍ଦିର',
    'high school': 'ଉଚ୍ଚ ବିଦ୍ୟାଳୟ',
    'highschool': 'ଉଚ୍ଚ ବିଦ୍ୟାଳୟ',
    'school': 'ବିଦ୍ୟାଳୟ',
    'college': 'ମହାବିଦ୍ୟାଳୟ',
    'sarakari': 'ସରକାରୀ',
    'sarkari': 'ସରକାରୀ',
    'prathamika': 'ପ୍ରାଥମିକ',
    'prathmik': 'ପ୍ରାଥମିକ',
    'nodal': 'ନୋଡାଲ',
    'uchha': 'ଉଚ୍ଚ',
    'chhatra': 'ଛାତ୍ର',
    'chhatri': 'ଛାତ୍ରୀ',
    'rahul': 'ରାହୁଲ',
    'kumar': 'କୁମାର',
    'nayak': 'ନାୟକ',
    'dash': 'ଦାଶ',
    'das': 'ଦାସ',
    'jena': 'ଜେନା',
    'sahoo': 'ସାହୁ',
    'sahu': 'ସାହୁ',
    'pradhan': 'ପ୍ରଧାନ',
    'behera': 'ବେହେରା',
    'rout': 'ରାଉତ',
    'mohapatra': 'ମହାପାତ୍ର',
    'mishra': 'ମିଶ୍ର',
    'swain': 'ସ୍ୱାଇଁ',
    'patra': 'ପାତ୍ର',
    'barik': 'ବାରିକ',
    'muduli': 'ମୁଦୁଲି',
    'bikram': 'ବିକ୍ରମ',
    'ramesh': 'ରମେଶ',
    'suresh': 'ସୁରେଶ',
    'rajesh': 'ରାଜେଶ',
    'puri': 'ପୁରୀ',
    'cuttack': 'କଟକ',
    'kataka': 'କଟକ',
    'bhubaneswar': 'ଭୁବନେଶ୍ୱର',
    'khordha': 'ଖୋର୍ଦ୍ଧା',
    'balasore': 'ବାଲେଶ୍ୱର',
    'bhadrak': 'ଭଦ୍ରକ',
    'ganjam': 'ଗଞ୍ଜାମ',
    'odisha': 'ଓଡ଼ିଶା',
    'orissa': 'ଓଡ଼ିଶା',
    'satyabadi': 'ସତ୍ୟବାଦୀ',
    'class': 'ଶ୍ରେଣୀ',
    'roll': 'ରୋଲ୍',
    'pradhana': 'ପ୍ରଧାନ',
    'shikshak': 'ଶିକ୍ଷକ',
    'adhyaksha': 'ଅଧ୍ୟକ୍ଷ'
  },

  transliterateToOdia(text) {
    if (!text) return '';
    const words = text.split(/(\s+|[.,;!?/-])/);
    const converted = words.map(w => {
      const lower = w.toLowerCase().trim();
      if (!lower) return w;
      if (this.odiaWordDict[lower]) return this.odiaWordDict[lower];
      return this._phoneticWordToOdia(lower);
    });
    return converted.join('');
  },

  _phoneticWordToOdia(w) {
    if (this.odiaWordDict[w]) return this.odiaWordDict[w];

    const consonants = {
      'ksh': 'କ୍ଷ', 'gy': 'ଜ୍ଞ', 'kh': 'ଖ', 'gh': 'ଘ', 'ch': 'ଚ', 'chh': 'ଛ',
      'jh': 'ଝ', 'th': 'ଥ', 'dh': 'ଧ', 'ph': 'ଫ', 'bh': 'ଭ', 'sh': 'ଶ',
      'shh': 'ଷ', 'ng': 'ଙ', 'ny': 'ଞ', 'thh': 'ଠ', 'dhh': 'ଢ',
      'k': 'କ', 'g': 'ଗ', 'j': 'ଜ', 't': 'ତ', 'd': 'ଦ', 'p': 'ପ',
      'b': 'ବ', 'm': 'ମ', 'y': 'ଯ', 'r': 'ର', 'l': 'ଲ', 'v': 'ଵ', 'w': 'ଵ',
      's': 'ସ', 'h': 'ହ', 'n': 'ନ'
    };

    const matras = {
      'aa': 'ା', 'a': '', 'ii': 'ୀ', 'ee': 'ୀ', 'i': 'ି', 'uu': 'ୂ', 'oo': 'ୂ',
      'u': 'ୁ', 'ai': 'ୈ', 'e': 'େ', 'au': 'ୌ', 'ou': 'ୌ', 'o': 'ୋ', 'ri': 'ୃ'
    };

    const independentVowels = {
      'aa': 'ଆ', 'a': 'ଅ', 'ii': 'ଈ', 'ee': 'ଈ', 'i': 'ଇ', 'uu': 'ଊ', 'oo': 'ଊ',
      'u': 'ଉ', 'ai': 'ଐ', 'e': 'ଏ', 'au': 'ଔ', 'ou': 'ଔ', 'o': 'ଓ', 'ri': 'ଋ'
    };

    let result = '';
    let i = 0;
    const len = w.length;
    let prevWasConsonant = false;

    while (i < len) {
      const c3 = w.substr(i, 3);
      if (consonants[c3]) {
        if (prevWasConsonant) result += '୍';
        result += consonants[c3];
        prevWasConsonant = true;
        i += 3;
        continue;
      }

      const c2 = w.substr(i, 2);
      if (consonants[c2]) {
        if (prevWasConsonant) result += '୍';
        result += consonants[c2];
        prevWasConsonant = true;
        i += 2;
        continue;
      }

      const c1 = w[i];
      if (consonants[c1]) {
        if (prevWasConsonant) result += '୍';
        result += consonants[c1];
        prevWasConsonant = true;
        i += 1;
        continue;
      }

      const v2 = w.substr(i, 2);
      if (matras[v2] !== undefined || independentVowels[v2]) {
        if (prevWasConsonant) {
          result += matras[v2];
        } else {
          result += independentVowels[v2];
        }
        prevWasConsonant = false;
        i += 2;
        continue;
      }

      const v1 = w[i];
      if (matras[v1] !== undefined || independentVowels[v1]) {
        if (prevWasConsonant) {
          result += matras[v1];
        } else {
          result += independentVowels[v1];
        }
        prevWasConsonant = false;
        i += 1;
        continue;
      }

      result += w[i];
      prevWasConsonant = false;
      i += 1;
    }

    return result;
  },

  handleOdiaTyping(str) {
    const converted = this.transliterateToOdia(str);
    const previewEl = document.getElementById('odiaTypingPreview');
    if (previewEl) {
      previewEl.textContent = converted || '—';
    }
  },

  applyOdiaText(targetId) {
    const input = document.getElementById('odiaTypingInput');
    const text = this.transliterateToOdia(input?.value || '');
    if (!text) {
      showToast('Kripya pehle box me text type karein!', 'warning');
      return;
    }
    const target = document.getElementById(targetId);
    if (target) {
      target.value = text;
      this.updateCard();
      showToast(`Odia text applied!`, 'success');
    }
  },

  insertOdiaTerm(term, targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      target.value = term;
      this.updateCard();
      showToast(`Inserted: ${term}`, 'success');
    }
  },

  appendOdiaChar(char) {
    const input = document.getElementById('odiaTypingInput');
    if (input) {
      input.value += char;
      this.handleOdiaTyping(input.value);
    }
  },

  // ---------------- Portrait Card Render Engine (CR80 Vertical) ---------------- //
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
      if (this.theme === 'tricolor_crest') {
        // TRICOLOR CREST THEME (Saffron, Navy & Emerald)
        frontEl.className = "w-[275px] h-[436px] bg-white rounded-2xl text-slate-900 shadow-2xl relative overflow-hidden border-2 border-emerald-600 flex flex-col justify-between select-none";
        frontEl.innerHTML = `
          <!-- Saffron Header Strip -->
          <div class="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-2.5 px-3 flex items-center gap-2 border-b-2 border-white">
            <img src="${logoSrc}" class="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs shrink-0" alt="Logo" />
            <div class="flex-1 min-w-0">
              <h2 class="text-[11.5px] font-black uppercase tracking-tight leading-tight truncate font-heading text-white">${schoolName}</h2>
              <p class="text-[8px] text-orange-100 truncate opacity-95">${schoolSubtitle}</p>
            </div>
          </div>

          <!-- Emerald Ribbon -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3 py-0.5 flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
            <span class="truncate max-w-[170px]">🇮🇳 ${cardType}</span>
            <span class="bg-white text-emerald-900 px-1.5 py-0.2 rounded font-mono text-[7.5px] shrink-0 font-black">${cardSession}</span>
          </div>

          <!-- Body Container -->
          <div class="px-3 py-1 flex flex-col items-center flex-1 justify-between">
            <div class="flex flex-col items-center mt-0.5">
              <div class="w-[82px] h-[98px] rounded-xl border-2 border-emerald-600 ring-2 ring-orange-500/80 overflow-hidden shadow-sm bg-slate-100">
                <img src="${photoSrc}" class="w-full h-full object-cover" alt="Student Photo" />
              </div>
              <span class="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-800 text-white text-[8px] font-black uppercase font-mono tracking-wider">ROLL NO: ${rollNo}</span>
            </div>

            <div class="text-center w-full my-0.5">
              <h3 class="text-xs font-black text-slate-950 uppercase tracking-tight font-heading leading-tight truncate px-1">${studentName}</h3>
            </div>

            <div class="w-full bg-orange-50/50 rounded-xl p-1.5 px-2 border border-orange-200/80 text-[9px] leading-tight text-slate-800">
              <table class="w-full border-collapse">
                <tr><td class="font-bold text-slate-500 w-[68px] py-0.5">Adm No:</td><td class="font-black text-emerald-900 font-mono py-0.5">${admNo}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Class &amp; Sec:</td><td class="font-black text-slate-900 py-0.5">${studentClass}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">DOB / Blood:</td><td class="font-bold text-slate-800 py-0.5">${dob} | <span class="font-black text-rose-600 font-mono">${bloodGroup}</span></td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Father:</td><td class="font-bold text-slate-900 truncate max-w-[155px] py-0.5">${fatherName}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Emergency:</td><td class="font-black text-emerald-900 font-mono py-0.5">${studentMobile}</td></tr>
              </table>
            </div>

            <div class="w-full pt-1 flex items-center justify-between border-t border-slate-200">
              <div id="icardFrontQrBox" class="w-[36px] h-[36px] bg-white p-0.5 border border-slate-300 rounded shadow-2xs flex items-center justify-center shrink-0"></div>
              <div class="flex flex-col items-center">
                <img src="${signSrc}" class="h-4 max-w-[55px] object-contain" alt="Sign" />
                <span class="text-[7px] font-black uppercase text-slate-600 border-t border-slate-400 pt-0.5">Principal Sign</span>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-emerald-800 to-teal-900 text-emerald-100 px-2 py-0.5 border-t-2 border-orange-500 flex items-center justify-between text-[7px] font-medium">
            <span class="truncate max-w-[170px]"><i class="fa-solid fa-location-dot text-amber-300 mr-0.5"></i>${schoolAddress}</span>
            <span class="font-mono font-bold text-white shrink-0">${schoolPhone}</span>
          </div>
        `;
      } else if (this.theme === 'dark_gold' || this.theme === 'dark') {
        // ROYAL DARK GOLD THEME
        frontEl.className = "w-[275px] h-[436px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl text-white shadow-2xl relative overflow-hidden border-2 border-amber-400 flex flex-col justify-between select-none";
        frontEl.innerHTML = `
          <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-2.5 px-3 flex items-center gap-2 border-b-2 border-amber-400">
            <img src="${logoSrc}" class="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs shrink-0" alt="Logo" />
            <div class="flex-1 min-w-0">
              <h2 class="text-[11.5px] font-black uppercase tracking-tight leading-tight truncate font-heading text-amber-300">${schoolName}</h2>
              <p class="text-[8px] text-sky-200 truncate opacity-90">${schoolSubtitle}</p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 px-3 py-0.5 flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
            <span class="truncate max-w-[170px]">🎓 ${cardType}</span>
            <span class="bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded font-mono text-[7.5px] shrink-0 font-bold">${cardSession}</span>
          </div>

          <div class="px-3 py-1 flex flex-col items-center flex-1 justify-between">
            <div class="flex flex-col items-center mt-0.5">
              <div class="w-[82px] h-[98px] rounded-xl border-2 border-amber-400 overflow-hidden shadow-sm bg-slate-900">
                <img src="${photoSrc}" class="w-full h-full object-cover" alt="Student Photo" />
              </div>
              <span class="mt-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase font-mono tracking-wider">ROLL NO: ${rollNo}</span>
            </div>

            <div class="text-center w-full my-0.5">
              <h3 class="text-xs font-black text-amber-200 uppercase tracking-tight font-heading leading-tight truncate px-1">${studentName}</h3>
            </div>

            <div class="w-full bg-slate-900/90 rounded-xl p-1.5 px-2 border border-slate-700/80 text-[9px] leading-tight text-slate-200">
              <table class="w-full border-collapse">
                <tr><td class="font-bold text-slate-400 w-[68px] py-0.5">Adm No:</td><td class="font-bold text-sky-400 font-mono py-0.5">${admNo}</td></tr>
                <tr><td class="font-bold text-slate-400 py-0.5">Class &amp; Sec:</td><td class="font-bold text-white py-0.5">${studentClass}</td></tr>
                <tr><td class="font-bold text-slate-400 py-0.5">DOB / Blood:</td><td class="font-semibold text-slate-200 py-0.5">${dob} | <span class="font-black text-rose-400 font-mono">${bloodGroup}</span></td></tr>
                <tr><td class="font-bold text-slate-400 py-0.5">Father:</td><td class="font-semibold text-slate-200 truncate max-w-[155px] py-0.5">${fatherName}</td></tr>
                <tr><td class="font-bold text-slate-400 py-0.5">Emergency:</td><td class="font-bold text-amber-300 font-mono py-0.5">${studentMobile}</td></tr>
              </table>
            </div>

            <div class="w-full pt-1 flex items-center justify-between border-t border-slate-800">
              <div id="icardFrontQrBox" class="w-[36px] h-[36px] bg-white p-0.5 border border-amber-400/60 rounded shadow-2xs flex items-center justify-center shrink-0"></div>
              <div class="flex flex-col items-center">
                <img src="${signSrc}" class="h-4 max-w-[55px] object-contain filter invert" alt="Sign" />
                <span class="text-[7px] font-black uppercase text-amber-400 border-t border-slate-600 pt-0.5">Principal Sign</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/90 text-slate-400 px-2 py-0.5 border-t border-slate-800 flex items-center justify-between text-[7px] font-medium">
            <span class="truncate max-w-[170px]"><i class="fa-solid fa-location-dot text-amber-400 mr-0.5"></i>${schoolAddress}</span>
            <span class="font-mono font-bold text-amber-300 shrink-0">${schoolPhone}</span>
          </div>
        `;
      } else {
        // MULTI-COLOR MODERN TECH WAVE THEME (Default)
        frontEl.className = "w-[275px] h-[436px] bg-white rounded-2xl text-slate-900 shadow-2xl relative overflow-hidden border-2 border-indigo-600 flex flex-col justify-between select-none";
        frontEl.innerHTML = `
          <!-- Top Multi-Color Wave Header -->
          <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white p-2.5 px-3 flex items-center gap-2 border-b-2 border-amber-400 relative">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-amber-500/20 pointer-events-none"></div>
            <img src="${logoSrc}" class="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs shrink-0 relative z-10" alt="Logo" />
            <div class="flex-1 min-w-0 relative z-10">
              <h2 class="text-[11.5px] font-black uppercase tracking-tight leading-tight truncate font-heading text-amber-300 drop-shadow-xs">${schoolName}</h2>
              <p class="text-[8px] text-sky-100 truncate opacity-90">${schoolSubtitle}</p>
            </div>
          </div>

          <!-- Multi-Color Ribbon -->
          <div class="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 px-3 py-0.5 flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider shadow-2xs">
            <span class="truncate max-w-[170px]">🎓 ${cardType}</span>
            <span class="bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded font-mono text-[7.5px] shrink-0 font-bold">${cardSession}</span>
          </div>

          <!-- Body Container -->
          <div class="px-3 py-1 flex flex-col items-center flex-1 justify-between">
            <div class="flex flex-col items-center mt-0.5">
              <div class="w-[82px] h-[98px] rounded-xl border-2 border-indigo-600 ring-2 ring-amber-400/80 overflow-hidden shadow-sm bg-slate-100">
                <img src="${photoSrc}" class="w-full h-full object-cover" alt="Student Photo" />
              </div>
              <span class="mt-1 px-2.5 py-0.5 rounded-full bg-indigo-900 text-white text-[8px] font-black uppercase font-mono tracking-wider shadow-2xs">ROLL NO: ${rollNo}</span>
            </div>

            <div class="text-center w-full my-0.5">
              <h3 class="text-xs font-black text-slate-950 uppercase tracking-tight font-heading leading-tight truncate px-1">${studentName}</h3>
            </div>

            <div class="w-full bg-gradient-to-b from-sky-50/70 to-indigo-50/50 rounded-xl p-1.5 px-2 border border-sky-200/80 text-[9px] leading-tight text-slate-800">
              <table class="w-full border-collapse">
                <tr><td class="font-bold text-slate-500 w-[68px] py-0.5">Adm No:</td><td class="font-black text-sky-900 font-mono py-0.5">${admNo}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Class &amp; Sec:</td><td class="font-black text-slate-900 py-0.5">${studentClass}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">DOB / Blood:</td><td class="font-bold text-slate-800 py-0.5">${dob} | <span class="font-black text-rose-600 font-mono">${bloodGroup}</span></td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Father:</td><td class="font-bold text-slate-900 truncate max-w-[155px] py-0.5">${fatherName}</td></tr>
                <tr><td class="font-bold text-slate-500 py-0.5">Emergency:</td><td class="font-black text-indigo-900 font-mono py-0.5">${studentMobile}</td></tr>
              </table>
            </div>

            <div class="w-full pt-1 flex items-center justify-between border-t border-slate-200">
              <div id="icardFrontQrBox" class="w-[36px] h-[36px] bg-white p-0.5 border border-slate-300 rounded shadow-2xs flex items-center justify-center shrink-0"></div>
              <div class="flex flex-col items-center">
                <img src="${signSrc}" class="h-4 max-w-[55px] object-contain" alt="Sign" />
                <span class="text-[7px] font-black uppercase text-slate-600 border-t border-slate-400 pt-0.5">Principal Sign</span>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-sky-200 px-2 py-0.5 border-t border-amber-400 flex items-center justify-between text-[7px] font-medium">
            <span class="truncate max-w-[170px]"><i class="fa-solid fa-location-dot text-amber-400 mr-0.5"></i>${schoolAddress}</span>
            <span class="font-mono font-bold text-amber-300 shrink-0">${schoolPhone}</span>
          </div>
        `;
      }
    }

    // BACK CARD (Portrait)
    if (backEl) {
      if (this.theme === 'dark_gold' || this.theme === 'dark') {
        backEl.className = "w-[275px] h-[436px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-2xl relative overflow-hidden border-2 border-amber-400 flex flex-col justify-between select-none p-3";
        backEl.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-800 pb-1 px-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <img src="${logoSrc}" class="w-5 h-5 rounded-full bg-white p-0.5 object-contain shadow-2xs shrink-0" alt="Logo" />
              <span class="text-[9.5px] font-black text-amber-300 uppercase tracking-tight font-heading truncate">${schoolName}</span>
            </div>
            <span class="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[7px] font-black shrink-0">TERMS</span>
          </div>

          <div class="text-[8.5px] text-slate-300 space-y-1 my-1.5 leading-tight px-1">
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-amber-400 mt-0.5 text-[6.5px] shrink-0"></i><span>This identity card is the property of the school and must be worn on campus.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-amber-400 mt-0.5 text-[6.5px] shrink-0"></i><span>Loss of this card must be immediately reported to school office.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-amber-400 mt-0.5 text-[6.5px] shrink-0"></i><span>Valid strictly for Session <strong class="text-amber-200">${cardSession}</strong>.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-amber-400 mt-0.5 text-[6.5px] shrink-0"></i><span>If found, please return to school office or call emergency helpline.</span></p>
          </div>

          <div class="bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-[8.5px] space-y-0.5 mx-1">
            <span class="text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Emergency Return Address</span>
            <p class="text-slate-200 font-semibold leading-tight">${schoolAddress}</p>
            <p class="text-[9px] font-bold text-amber-300 font-mono mt-0.5"><i class="fa-solid fa-phone text-[7px] mr-1"></i>${schoolPhone}</p>
          </div>

          <div class="p-1.5 mx-1 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
            <div class="text-left">
              <span class="text-[6.5px] uppercase font-bold text-slate-400 block">BLOOD GROUP</span>
              <span class="text-[10.5px] font-black text-rose-400 font-mono">${bloodGroup}</span>
            </div>
            <div class="flex flex-col items-center">
              <img src="${signSrc}" class="h-4 max-w-[55px] object-contain filter invert" alt="Sign" />
              <span class="text-[6.5px] font-black uppercase text-amber-300 border-t border-slate-600 pt-0.5">Authorized Signatory</span>
            </div>
          </div>

          <div class="text-center text-[7px] text-slate-500 font-mono pt-0.5">
            DIGITAL STUDENT ID • CSC HELP DESK
          </div>
        `;
      } else {
        // Multi-Color / Tricolor Back Card
        backEl.className = "w-[275px] h-[436px] bg-slate-50 rounded-2xl text-slate-800 shadow-2xl relative overflow-hidden border-2 border-indigo-600 flex flex-col justify-between select-none p-3";
        backEl.innerHTML = `
          <div class="flex items-center justify-between border-b border-indigo-200 pb-1 px-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <img src="${logoSrc}" class="w-5 h-5 rounded-full bg-white p-0.5 object-contain shadow-2xs shrink-0" alt="Logo" />
              <span class="text-[9.5px] font-black text-indigo-950 uppercase tracking-tight font-heading truncate">${schoolName}</span>
            </div>
            <span class="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 text-[7px] font-black shrink-0">TERMS</span>
          </div>

          <div class="text-[8.5px] text-slate-700 space-y-1 my-1.5 leading-tight px-1">
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-indigo-600 mt-0.5 text-[6.5px] shrink-0"></i><span>This identity card is the property of the school and must be worn on campus.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-indigo-600 mt-0.5 text-[6.5px] shrink-0"></i><span>Loss of this card must be immediately reported to school office.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-indigo-600 mt-0.5 text-[6.5px] shrink-0"></i><span>Valid strictly for Session <strong class="text-slate-900">${cardSession}</strong>.</span></p>
            <p class="flex items-start gap-1"><i class="fa-solid fa-circle-check text-indigo-600 mt-0.5 text-[6.5px] shrink-0"></i><span>If found, please return to school office or call emergency helpline.</span></p>
          </div>

          <div class="bg-white p-2 rounded-xl border border-indigo-100 text-[8.5px] space-y-0.5 mx-1 shadow-2xs">
            <span class="text-[7px] uppercase font-bold text-slate-400 block tracking-wider">Emergency Return Address</span>
            <p class="text-slate-800 font-semibold leading-tight">${schoolAddress}</p>
            <p class="text-[9px] font-bold text-indigo-900 font-mono mt-0.5"><i class="fa-solid fa-phone text-[7px] mr-1"></i>${schoolPhone}</p>
          </div>

          <div class="p-1.5 mx-1 bg-white rounded-xl border border-indigo-100 flex items-center justify-between shadow-2xs">
            <div class="text-left">
              <span class="text-[6.5px] uppercase font-bold text-slate-400 block">BLOOD GROUP</span>
              <span class="text-[10.5px] font-black text-rose-700 font-mono">${bloodGroup}</span>
            </div>
            <div class="flex flex-col items-center">
              <img src="${signSrc}" class="h-4 max-w-[55px] object-contain" alt="Sign" />
              <span class="text-[6.5px] font-black uppercase text-slate-700 border-t border-slate-400 pt-0.5">Authorized Signatory</span>
            </div>
          </div>

          <div class="text-center text-[7px] text-slate-400 font-mono pt-0.5">
            DIGITAL STUDENT ID • CSC HELP DESK
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
        width: 36,
        height: 36,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  },

  downloadFrontPng() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (Front Portrait PNG)', category: 'icard' }, () => this._doDownloadFrontPng());
    }
    this._doDownloadFrontPng();
  },
  _doDownloadFrontPng() {
    const frontEl = document.getElementById('icardFrontContainer');
    if (!frontEl || !window.html2canvas) {
      showToast("Card not ready or library loading.", "warning");
      return;
    }
    showToast("Generating Front Portrait HD PNG...", "info");
    html2canvas(frontEl, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      const name = document.getElementById('studentName')?.value || 'Student';
      link.download = `School_ID_Front_Portrait_${name.replace(/\\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("Front Portrait ID Card PNG downloaded!", "success");
    });
  },

  downloadBackPng() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (Back Portrait PNG)', category: 'icard' }, () => this._doDownloadBackPng());
    }
    this._doDownloadBackPng();
  },
  _doDownloadBackPng() {
    const backEl = document.getElementById('icardBackContainer');
    if (!backEl || !window.html2canvas) {
      showToast("Card not ready or library loading.", "warning");
      return;
    }
    showToast("Generating Back Portrait HD PNG...", "info");
    html2canvas(backEl, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      const name = document.getElementById('studentName')?.value || 'Student';
      link.download = `School_ID_Back_Portrait_${name.replace(/\\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast("Back Portrait ID Card PNG downloaded!", "success");
    });
  },

  downloadFullPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Student ID Card (Portrait A4 Print PDF)', category: 'icard' }, () => this._doDownloadFullPdf());
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

    showToast("Generating Portrait Double-Sided A4 Print PDF...", "info");

    Promise.all([
      html2canvas(frontEl, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }),
      html2canvas(backEl, { scale: 3, useCORS: true, backgroundColor: '#ffffff' })
    ]).then(([frontCanvas, backCanvas]) => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 is 210 x 297 mm

      // Standard CR80 Portrait ID Card dimensions: 54mm width x 85.6mm height
      const cardW = 54;
      const cardH = 85.6;

      // Header on PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(15, 23, 42);
      pdf.text("OFFICIAL SCHOOL & STUDENT IDENTITY CARD", 105, 18, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Standard Vertical CR80 Format (54 x 85.6 mm) - Portrait Lanyard & Direct PVC Print", 105, 24, { align: 'center' });

      // Row 1 (Front & Back)
      const startY = 32;
      const frontX = 38;
      const backX = 118;

      // Draw Front Card
      const frontImg = frontCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(frontImg, 'JPEG', frontX, startY, cardW, cardH);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.rect(frontX - 0.5, startY - 0.5, cardW + 1, cardH + 1); // Cutting outline
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text("FRONT SIDE (Cut along border)", frontX + (cardW / 2), startY + cardH + 5, { align: 'center' });

      // Draw Back Card
      const backImg = backCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(backImg, 'JPEG', backX, startY, cardW, cardH);
      pdf.rect(backX - 0.5, startY - 0.5, cardW + 1, cardH + 1); // Cutting outline
      pdf.text("BACK SIDE (Cut along border)", backX + (cardW / 2), startY + cardH + 5, { align: 'center' });

      // Row 2: Duplicate copy for school records
      const row2Y = startY + cardH + 16;
      pdf.addImage(frontImg, 'JPEG', frontX, row2Y, cardW, cardH);
      pdf.rect(frontX - 0.5, row2Y - 0.5, cardW + 1, cardH + 1);
      pdf.text("DUPLICATE COPY (Front)", frontX + (cardW / 2), row2Y + cardH + 5, { align: 'center' });

      pdf.addImage(backImg, 'JPEG', backX, row2Y, cardW, cardH);
      pdf.rect(backX - 0.5, row2Y - 0.5, cardW + 1, cardH + 1);
      pdf.text("DUPLICATE COPY (Back)", backX + (cardW / 2), row2Y + cardH + 5, { align: 'center' });

      // Print Instructions Footer
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Printed from VUO CSC Help Platform | Keep scale at 100% (Actual Size) in printer settings.", 105, 280, { align: 'center' });

      const name = document.getElementById('studentName')?.value || 'Student';
      pdf.save(`School_ID_Portrait_${name.replace(/\\s+/g, '_')}.pdf`);
      showToast("Printable Portrait ID Card PDF generated with cutting guides!", "success");
    });
  },

  printCard() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'Student ID Card (Print)', category: 'icard' }, () => this._doPrintCard());
    }
    this._doPrintCard();
  },
  _doPrintCard() {
    const frontEl = document.getElementById('icardFrontContainer');
    const backEl = document.getElementById('icardBackContainer');
    if (!frontEl || !backEl) {
      if (typeof showToast === 'function') showToast('Card preview not ready to print.', 'warning');
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast('Popup blocked! Please allow popups to print ID card.', 'error');
      return;
    }

    const studentName = document.getElementById('studentName')?.value || 'Student';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student ID Card - ${studentName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 20px;
            background: #ffffff;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .sheet-header {
            text-align: center;
            margin-bottom: 20px;
            color: #1e293b;
          }
          .sheet-header h1 {
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .sheet-header p {
            font-size: 11px;
            color: #64748b;
            margin: 0;
          }
          .cards-container {
            display: flex;
            gap: 25px;
            justify-content: center;
            align-items: flex-start;
          }
          .card-slot {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .slot-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .cr80-card {
            width: 54mm;
            height: 85.6mm;
            border: 1px dashed #94a3b8;
            border-radius: 3.18mm;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            position: relative;
          }
          .cr80-card > div {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .cutting-guide {
            margin-top: 18px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .no-print {
              display: none;
            }
          }
        </style>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="sheet-header no-print">
          <h1>Official Student & School Identity Card (CR80)</h1>
          <p>Standard PVC Card Size (54 x 85.6 mm) | Keep scale at 100% (Actual Size) in printer settings</p>
        </div>

        <div class="cards-container">
          <div class="card-slot">
            <span class="slot-label">Front Side (Cut along guide)</span>
            <div class="cr80-card">${frontEl.outerHTML}</div>
          </div>
          <div class="card-slot">
            <span class="slot-label">Back Side (Cut along guide)</span>
            <div class="cr80-card">${backEl.outerHTML}</div>
          </div>
        </div>

        <div class="cutting-guide">
          ✂️ Cut along the outer dashed guide for standard lanyard pouch, clip holder, or direct PVC tray printing.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }
};

window.VUO_ICARDMAKER = VUO_ICARDMAKER;

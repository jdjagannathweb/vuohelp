/**
 * VUO CSC HELP - Ready-to-Print Affidavit & Declarations Drafter
 * Generates official Odisha e-District & Court-standard declarations in English and Odia (ଓଡ଼ିଆ).
 * Supports:
 *  1. Income Certificate Self-Declaration (ଆୟ ପ୍ରମାଣ ପତ୍ର ସ୍ୱୟଂ ଘୋଷଣା)
 *  2. Residence / Nativity Certificate Self-Declaration (ବାସସ୍ଥାନ ପ୍ରମାଣ ପତ୍ର ସ୍ୱୟଂ ଘୋଷଣା)
 *  3. SEBC / OBC Caste Declaration (ପଛୁଆ ବର୍ଗ ଜାତି ଘୋଷଣାନାମା)
 *  4. SC Caste Verification Affidavit (ଅନୁସୂଚିତ ଜାତି - SC ସତ୍ୟପାଠ)
 *  5. ST Caste Verification Affidavit (ଅନୁସୂଚିତ ଜନଜାତି - ST ସତ୍ୟପାଠ)
 *  6. One and The Same Person Name Clarification Affidavit (ନାମ ସଂଶୋଧନ ଶପଥ ପତ୍ର)
 *  7. Lost Document / Marksheet / Aadhaar Declaration (ହଜିଯାଇଥିବା ପ୍ରମାଣପତ୍ର ଘୋଷଣା)
 *  8. Sahamati Patra for Paddy Procurement / Sharecropper (ଧାନ ବିକ୍ରୟ ସହମତି ପତ୍ର)
 *  9. Declaration of Sale of Motor Vehicle (ଗାଡ଼ି ବିକ୍ରୟ ଘୋଷଣାନାମା)
 * 10. Non-Judicial Stamp Paper Mode (55mm top margin) vs Plain Paper Mode
 */

const VUO_AFFIDAVIT = {
  template: 'income',
  language: 'or', // 'or' (Odia) or 'en' (English)
  paperMode: 'plain', // 'plain' or 'stamp' (leaves 55mm top clearance for stamp papers)

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  init() {
    this.populateDistricts();
    this.bindEvents();
    this.updateVisibleFields();
    this.renderPreview();
  },

  setLanguage(lang) {
    this.language = lang;
    const el = document.getElementById('affLanguage');
    if (el) el.value = lang;
    this.renderPreview();
  },

  setPaperMode(mode) {
    this.paperMode = mode;
    const el = document.getElementById('affPaperMode');
    if (el) el.value = mode;
    this.renderPreview();
  },

  setTemplate(t) {
    this.template = t;
    const el = document.getElementById('affTemplate');
    if (el) el.value = t;
    this.updateVisibleFields();
    this.renderPreview();
  },

  populateDistricts() {
    const sel = document.getElementById('affDistrict');
    if (!sel || sel.children.length > 1) return;

    const districts = [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh",
      "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
      "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri",
      "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur",
      "Subarnapur (Sonepur)", "Sundargarh"
    ];

    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === 'Puri') opt.selected = true;
      sel.appendChild(opt);
    });
  },

  bindEvents() {
    const inputs = [
      'affTemplate', 'affLanguage', 'affPaperMode', 'affName', 'affFatherName', 'affRelation',
      'affAge', 'affVillage', 'affPost', 'affPs', 'affTahasil', 'affDistrict',
      'affIncomeAmount', 'affIncomeWords', 'affFamilyMembers', 'affIncomeSource',
      'affResYears', 'affResPurpose',
      'affCasteCategory', 'affSubCaste',
      'affNameDocA', 'affNameDocB', 'affNameCorrect',
      'affLostDocName', 'affLostDocNo', 'affLostDate', 'affLostPlace',
      'affPaddyFarmerId', 'affPaddyKhata', 'affPaddyPlot', 'affPaddyArea', 'affPaddyOwner',
      'affVehRegNo', 'affVehChassis', 'affVehBuyer', 'affVehPrice'
    ];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (id === 'affTemplate') {
            this.template = el.value;
            this.updateVisibleFields();
          } else if (id === 'affLanguage') {
            this.language = el.value;
          } else if (id === 'affPaperMode') {
            this.paperMode = el.value;
          } else if (id === 'affCasteCategory') {
            const subEl = document.getElementById('affSubCaste');
            const val = el.value || '';
            if (val.includes('ST')) {
              if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Chasa / Khandayat')) subEl.value = 'Kandha';
            } else if (val.includes('SC')) {
              if (subEl && (subEl.value === 'Kandha' || subEl.value === 'Chasa / Khandayat')) subEl.value = 'Dhoba';
            } else if (val.includes('SEBC') || val.includes('OBC')) {
              if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Kandha')) subEl.value = 'Chasa / Khandayat';
            }
          }
          this.renderPreview();
        });
      }
    });

    const incomeInput = document.getElementById('affIncomeAmount');
    if (incomeInput) {
      incomeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        const wordsEl = document.getElementById('affIncomeWords');
        if (wordsEl && !isNaN(val) && val > 0) {
          wordsEl.value = this.numberToWords(val);
        }
        this.renderPreview();
      });
    }
  },

  updateVisibleFields() {
    const sections = ['Income', 'Resident', 'Caste', 'Name', 'Lost', 'Paddy', 'Vehicle'];
    sections.forEach(s => {
      const box = document.getElementById(`affSection_${s}`);
      if (box) box.classList.add('hidden');
    });

    if (this.template === 'income') {
      document.getElementById('affSection_Income')?.classList.remove('hidden');
    } else if (this.template === 'resident') {
      document.getElementById('affSection_Resident')?.classList.remove('hidden');
    } else if (this.template.startsWith('caste')) {
      document.getElementById('affSection_Caste')?.classList.remove('hidden');
      const catEl = document.getElementById('affCasteCategory');
      const subEl = document.getElementById('affSubCaste');
      const badgeEl = document.getElementById('affCasteBadge');

      if (this.template === 'caste_sc') {
        if (catEl) catEl.value = 'Scheduled Caste (SC)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || subEl.value === 'Kandha' || !subEl.value)) subEl.value = 'Dhoba';
        if (badgeEl) badgeEl.textContent = 'SC (ଅନୁସୂଚିତ ଜାତି)';
      } else if (this.template === 'caste_st') {
        if (catEl) catEl.value = 'Scheduled Tribe (ST)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || subEl.value === 'Dhoba' || !subEl.value)) subEl.value = 'Kandha';
        if (badgeEl) badgeEl.textContent = 'ST (ଅନୁସୂଚିତ ଜନଜାତି)';
      } else if (this.template === 'caste_scst') {
        if (catEl && !catEl.value.includes('SC') && !catEl.value.includes('ST')) catEl.value = 'Scheduled Caste (SC)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || !subEl.value)) subEl.value = 'Dhoba';
        if (badgeEl) badgeEl.textContent = 'SC / ST (ତଫସିଲଭୁକ୍ତ ଜାତି/ଜନଜାତି)';
      } else if (this.template === 'caste_sebc') {
        if (catEl) catEl.value = 'SEBC';
        if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Kandha' || !subEl.value)) subEl.value = 'Chasa / Khandayat';
        if (badgeEl) badgeEl.textContent = 'SEBC / OBC (ପଛୁଆ ବର୍ଗ)';
      }
    } else if (this.template === 'name_correction') {
      document.getElementById('affSection_Name')?.classList.remove('hidden');
    } else if (this.template === 'lost_doc') {
      document.getElementById('affSection_Lost')?.classList.remove('hidden');
    } else if (this.template === 'paddy_sahamati') {
      document.getElementById('affSection_Paddy')?.classList.remove('hidden');
    } else if (this.template === 'vehicle_sale') {
      document.getElementById('affSection_Vehicle')?.classList.remove('hidden');
    }
  },

  numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Rupees Only';
  },

  getFormData() {
    const g = (id) => (document.getElementById(id)?.value || '').trim();
    return {
      template: this.template,
      language: this.language,
      paperMode: this.paperMode,
      name: g('affName') || 'Sri Santosh Kumar Sahoo',
      fatherName: g('affFatherName') || 'Bichitrananda Sahoo',
      relation: g('affRelation') || 'Son of',
      age: g('affAge') || '32',
      village: g('affVillage') || 'Balarampur',
      post: g('affPost') || 'Satyabadi',
      ps: g('affPs') || 'Satyabadi',
      tahasil: g('affTahasil') || 'Satyabadi',
      district: g('affDistrict') || 'Puri',
      state: 'Odisha',
      incomeAmount: g('affIncomeAmount') || '96,000',
      incomeWords: g('affIncomeWords') || 'Ninety Six Thousand Rupees Only',
      familyMembers: g('affFamilyMembers') || '4',
      incomeSource: g('affIncomeSource') || 'Agriculture & Daily Labour',
      resYears: g('affResYears') || '25',
      resPurpose: g('affResPurpose') || 'Government Scheme & Educational Purpose',
      casteCategory: g('affCasteCategory') || (this.template.includes('st') ? 'Scheduled Tribe (ST)' : (this.template.includes('sc') ? 'Scheduled Caste (SC)' : 'SEBC')),
      subCaste: g('affSubCaste') || (this.template.includes('st') ? 'Kandha' : (this.template.includes('sc') ? 'Dhoba' : 'Chasa / Khandayat')),
      nameDocA: g('affNameDocA') || 'Santosh Sahoo (in Aadhaar Card)',
      nameDocB: g('affNameDocB') || 'Santosh Kumar Sahoo (in Matric Certificate)',
      nameCorrect: g('affNameCorrect') || 'Santosh Kumar Sahoo',
      lostDocName: g('affLostDocName') || 'Original High School Certificate & Aadhaar Card',
      lostDocNo: g('affLostDocNo') || 'HSC-2018-091244',
      lostDate: g('affLostDate') || new Date().toISOString().split('T')[0],
      lostPlace: g('affLostPlace') || 'Near Bus Stand, Satyabadi',
      paddyFarmerId: g('affPaddyFarmerId') || 'FID-PURI-991204',
      paddyKhata: g('affPaddyKhata') || '142/18',
      paddyPlot: g('affPaddyPlot') || '304 & 305',
      paddyArea: g('affPaddyArea') || '1.50 Acre',
      paddyOwner: g('affPaddyOwner') || 'Late Rabindranath Sahoo',
      vehRegNo: g('affVehRegNo') || 'OD-02-BD-1234',
      vehChassis: g('affVehChassis') || 'ME4JC50XXXXX9912',
      vehBuyer: g('affVehBuyer') || 'Prakash Rout',
      vehPrice: g('affVehPrice') || '45,000'
    };
  },

  renderPreview() {
    const container = document.getElementById('affidavitPreviewDoc') || document.getElementById('affidavitPreviewContent');
    if (!container) return;

    const d = this.getFormData();
    const isOdia = this.language === 'or';
    const isStamp = this.paperMode === 'stamp';

    let contentHtml = '';

    if (this.template === 'income') {
      contentHtml = isOdia ? this.renderOdiaIncome(d) : this.renderEnglishIncome(d);
    } else if (this.template === 'resident') {
      contentHtml = isOdia ? this.renderOdiaResident(d) : this.renderEnglishResident(d);
    } else if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      contentHtml = isOdia ? this.renderOdiaScSt(d) : this.renderEnglishScSt(d);
    } else if (this.template === 'caste_sebc' || this.template.startsWith('caste')) {
      contentHtml = isOdia ? this.renderOdiaSebc(d) : this.renderEnglishSebc(d);
    } else if (this.template === 'name_correction') {
      contentHtml = isOdia ? this.renderOdiaNameCorrection(d) : this.renderEnglishNameCorrection(d);
    } else if (this.template === 'lost_doc') {
      contentHtml = isOdia ? this.renderOdiaLostDoc(d) : this.renderEnglishLostDoc(d);
    } else if (this.template === 'paddy_sahamati') {
      contentHtml = isOdia ? this.renderOdiaPaddySahamati(d) : this.renderEnglishPaddySahamati(d);
    } else if (this.template === 'vehicle_sale') {
      contentHtml = isOdia ? this.renderOdiaVehicle(d) : this.renderEnglishVehicle(d);
    }

    const fontFam = isOdia 
      ? "'Noto Sans Odia', 'Aparajita', 'Kalinga', Arial, sans-serif" 
      : "'Times New Roman', 'Noto Serif', Georgia, serif";

    container.innerHTML = `
      <div class="aff-paper ${isStamp ? 'pt-24 sm:pt-28' : 'pt-2'} text-slate-900 leading-relaxed min-h-[600px]" style="font-family: ${fontFam};">
        ${isStamp ? `
          <div class="mb-6 p-2 text-center border-2 border-dashed border-amber-300 bg-amber-50/70 rounded-lg text-amber-800 text-[10px] uppercase font-sans font-bold no-print">
            ▲ STAMP PAPER SPACE (55mm) - Document will print directly below your physical Non-Judicial Stamp Paper header ▲
          </div>
        ` : ''}
        ${contentHtml}
      </div>
    `;
  },

  // ================= 1. INCOME DECLARATION ================= //
  renderOdiaIncome(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(ଆୟ ପ୍ରମାଣ ପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ${this.escapeHtml(d.relation === 'Son of' ? 'ପୁତ୍ର' : (d.relation === 'Daughter of' ? 'କନ୍ୟା' : 'ପତ୍ନୀ'))}: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ ।
        </p>

        <p class="font-bold">ଏତଦ୍ୱାରା ସତ୍ୟର ସହିତ ଘୋଷଣା କରୁଅଛି ଯେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ ଉପରୋକ୍ତ ଠିକଣାରେ ମୋର ପରିବାର ସହିତ ସ୍ଥାୟୀ ଭାବେ ବସବାସ କରିଆସୁଅଛି ।
          </li>
          <li>
            ଆମ୍ଭ ପରିବାରରେ ମୋଟ <strong>${this.escapeHtml(d.familyMembers)}</strong> ଜଣ ସଦସ୍ୟ ଅଛନ୍ତି ।
          </li>
          <li>
            ଆମ୍ଭ ପରିବାରର ସମସ୍ତ ସୂତ୍ରରୁ (ଯଥା: ${this.escapeHtml(d.incomeSource)}) ରୁ ବାର୍ଷିକ ସମୁଦାୟ ଆୟ 
            <strong>₹${this.escapeHtml(d.incomeAmount)}/-</strong> (ଅକ୍ଷରରେ: <strong>${this.escapeHtml(d.incomeWords)}</strong>) ଟଙ୍କା ଅଟେ ।
          </li>
          <li>
            ମୋର ପରିବାରରେ କୌଣସି ସଦସ୍ୟ ଆୟକର (Income Tax) ପ୍ରଦାନ କରନ୍ତି ନାହିଁ ।
          </li>
          <li>
            ଉପରୋକ୍ତ ସମସ୍ତ ତଥ୍ୟ ମୋର ଜ୍ଞାନ ଓ ବିଶ୍ୱାସ ମତେ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ । ଯଦି ଭବିଷ୍ୟତରେ ଏହା ମିଥ୍ୟା ପ୍ରମାଣିତ ହୁଏ, ତେବେ ସରକାରଙ୍କ ଆଇନ ଅନୁଯାୟୀ ମୁଁ ଦାୟୀ ରହିବି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishIncome(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Self Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of Income Certificate - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly affirm and declare as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I am a bona fide citizen of India and a permanent resident of the address specified above.
          </li>
          <li>
            That my family consists of <strong>${this.escapeHtml(d.familyMembers)}</strong> members living together.
          </li>
          <li>
            That the total annual income of my entire family from all sources (including ${this.escapeHtml(d.incomeSource)}) is 
            <strong>Rs. ${this.escapeHtml(d.incomeAmount)}/-</strong> (Rupees <strong>${this.escapeHtml(d.incomeWords)}</strong>).
          </li>
          <li>
            That neither myself nor any member of my family is an income tax assessee.
          </li>
          <li>
            That the facts stated in this declaration are true and correct to the best of my knowledge, information, and belief, and no material fact has been concealed.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 2. RESIDENT DECLARATION ================= //
  renderOdiaResident(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(ବାସସ୍ଥାନ ପ୍ରମାଣ ପତ୍ର / Resident Certificate ପ୍ରଦାନ ନିମନ୍ତେ)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ${this.escapeHtml(d.relation === 'Son of' ? 'ପୁତ୍ର' : (d.relation === 'Daughter of' ? 'କନ୍ୟା' : 'ପତ୍ନୀ'))}: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ ।
        </p>

        <p class="font-bold">ଏତଦ୍ୱାରା ନିମ୍ନଲିଖିତ ମତେ ଘୋଷଣା କରୁଅଛି ଯେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ ଉପରୋକ୍ତ ଠିକଣାରେ ବିଗତ <strong>${this.escapeHtml(d.resYears)}</strong> ବର୍ଷ ଧରି ମୋର ପରିବାର ସହିତ ସ୍ଥାୟୀ ଓ ନିରବଚ୍ଛିନ୍ନ ଭାବେ ବସବାସ କରିଆସୁଅଛି ।
          </li>
          <li>
            ଉକ୍ତ ଠିକଣା ବ୍ୟତୀତ ଭାରତ ବର୍ଷର ଅନ୍ୟ କୌଣସି ସ୍ଥାନରେ ମୋର ସ୍ଥାୟୀ ବାସସ୍ଥାନ ନାହିଁ କିମ୍ବା ମୁଁ ଅନ୍ୟ କୌଣସି ରାଜ୍ୟର ବାସିନ୍ଦା ନୁହେଁ ।
          </li>
          <li>
            ମୋର <strong>${this.escapeHtml(d.resPurpose)}</strong> ନିମନ୍ତେ ଏକ ସରକାରୀ ବାସସ୍ଥାନ ପ୍ରମାଣ ପତ୍ର (Resident / Nativity Certificate) ଆବଶ୍ୟକ ହେଉଅଛି ।
          </li>
          <li>
            ଏହି ଘୋଷଣାନାମାରେ ଲିଖିତ ସମସ୍ତ ବିବରଣୀ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ । ଯଦି କୌଣସି ତଥ୍ୟ ମିଥ୍ୟା ବୋଲି ପ୍ରମାଣିତ ହୁଏ, ତେବେ ଆଇନ ଅନୁଯାୟୀ ମୁଁ ସମ୍ପୂର୍ଣ୍ଣ ଦାୟୀ ରହିବି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishResident(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Self Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of Resident / Nativity Certificate)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly declare as under:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I am a permanent and continuous resident of the aforesaid address for the last <strong>${this.escapeHtml(d.resYears)}</strong> years along with my family.
          </li>
          <li>
            That I do not possess any other permanent place of residence anywhere else in India.
          </li>
          <li>
            That I require a Resident / Nativity Certificate for <strong>${this.escapeHtml(d.resPurpose)}</strong>.
          </li>
          <li>
            That the statements made above are true and correct to the best of my knowledge and belief.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 3. SC / ST CASTE VERIFICATION AFFIDAVIT ================= //
  renderOdiaScSt(d) {
    const isST = this.template === 'caste_st' || (d.casteCategory && d.casteCategory.includes('ST'));
    const categoryName = isST ? 'ଅନୁସୂଚିତ ଜନଜାତି (Scheduled Tribe - ST)' : 'ଅନୁସୂଚିତ ଜାତି (Scheduled Caste - SC)';
    const constitutionOrder = isST 
      ? 'ଭାରତ ସମ୍ବିଧାନ (ଅନୁସୂଚିତ ଜନଜାତି) ଆଦେଶ, ୧୯୫୦' 
      : 'ଭାରତ ସମ୍ବିଧାନ (ଅନୁସୂଚିତ ଜାତି) ଆଦେଶ, ୧୯୫୦';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ଶପଥ ପତ୍ର / ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(${categoryName} ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ${this.escapeHtml(d.relation === 'Son of' ? 'ପୁତ୍ର' : (d.relation === 'Daughter of' ? 'କନ୍ୟା' : 'ପତ୍ନୀ'))}: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ । ଏତଦ୍ୱାରା ଶପଥପୂର୍ବକ ସତ୍ୟର ସହିତ ଘୋଷଣା କରୁଅଛି ଯେ:
        </p>

        <p class="font-bold">ଶପଥ ବିବରଣୀ ନିମ୍ନ ପ୍ରକାରେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ <strong>${this.escapeHtml(d.subCaste || (isST ? 'କନ୍ଧ' : 'ଧୋବା'))}</strong> ଜାତି / ଉପଜାତିର ଅଟେ, ଯାହା <strong>${constitutionOrder}</strong> ଏବଂ ଓଡ଼ିଶା ସରକାରଙ୍କ ବିଜ୍ଞପ୍ତି ଅନୁଯାୟୀ ଓଡ଼ିଶା ରାଜ୍ୟରେ <strong>${categoryName}</strong> ଭାବେ ଆଇନଗତ ସ୍ୱୀକୃତ ।
          </li>
          <li>
            ମୁଁ କିମ୍ବା ମୋର ପୂର୍ବପୁରୁଷ କେବେହେଲେ ଧର୍ମାନ୍ତରିତ ହୋଇନାହାନ୍ତି କିମ୍ବା ଅନ୍ୟ କୌଣସି ଧର୍ମ ଗ୍ରହଣ କରିନାହାନ୍ତି । ମୁଁ ଜନ୍ମସୂତ୍ରେ ମୋର ମୂଳ ଜାତି ଓ ଧର୍ମ ପାଳନ କରିଆସୁଅଛି ।
          </li>
          <li>
            ମୋର ପରିବାର ୧୯୫୦ ମସିହା ପୂର୍ବରୁ ଓଡ଼ିଶା ରାଜ୍ୟରେ ସ୍ଥାୟୀ ଭାବେ ବସବାସ କରିଆସୁଅଛନ୍ତି ଏବଂ ଆମ୍ଭେ ଓଡ଼ିଶାର ମୂଳ ଅଧିବାସୀ ଅଟୁ ।
          </li>
          <li>
            ମୋତେ କିମ୍ବା ମୋ ପରିବାରର କୌଣସି ସଦସ୍ୟଙ୍କୁ ଅନ୍ୟ କୌଣସି ତହସିଲ, ଜିଲ୍ଲା କିମ୍ବା ଅନ୍ୟ ରାଜ୍ୟରୁ SC/ST ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ କରାଯାଇ ନାହିଁ କିମ୍ବା ମୁଁ କେବେହେଲେ ଅନ୍ୟତ୍ର ଦାବି କରିନାହିଁ ।
          </li>
          <li>
            ଉପରୋକ୍ତ ସମସ୍ତ ତଥ୍ୟ ମୋର ଜ୍ଞାନ ଓ ବିଶ୍ୱାସ ମତେ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ । ଯଦି ଭବିଷ୍ୟତରେ ଏହା ମିଥ୍ୟା କିମ୍ବା ଜାଲ ପ୍ରମାଣିତ ହୁଏ, ତେବେ ଭାରତୀୟ ଆଇନ (BNS / IPC) ଏବଂ SC/ST ଆଇନ ଅନୁଯାୟୀ ମୋ ବିରୁଦ୍ଧରେ ଫୌଜଦାରୀ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଗ୍ରହଣ କରାଯିବ ଏବଂ ପ୍ରମାଣପତ୍ର ରଦ୍ଦ କରାଯିବ ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishScSt(d) {
    const isST = this.template === 'caste_st' || (d.casteCategory && d.casteCategory.includes('ST'));
    const categoryName = isST ? 'Scheduled Tribe (ST)' : 'Scheduled Caste (SC)';
    const constitutionOrder = isST 
      ? 'The Constitution (Scheduled Tribes) Order, 1950' 
      : 'The Constitution (Scheduled Castes) Order, 1950';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Affidavit / Sworn Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of ${categoryName} Certificate - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly affirm and state on oath as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I belong to the <strong>${this.escapeHtml(d.subCaste || (isST ? 'Kandha' : 'Dhoba'))}</strong> community / sub-caste, which is officially notified and recognized as <strong>${categoryName}</strong> in the State of Odisha under <strong>${constitutionOrder}</strong> (as amended from time to time).
          </li>
          <li>
            That neither myself nor my parents / ancestors have ever renounced our original faith or converted to any other religion.
          </li>
          <li>
            That my family has been continuously and permanently residing in the State of Odisha prior to the year 1950, and we are original permanent residents of Odisha.
          </li>
          <li>
            That neither I nor any member of my family has obtained a Caste Certificate from any other Tahasil, District, or State.
          </li>
          <li>
            That the statements made above are true and correct to the best of my knowledge, information, and belief. If any information is found false or fabricated, I shall be liable for criminal prosecution under applicable laws and the certificate issued shall be cancelled.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 4. SEBC / OBC CASTE DECLARATION ================= //
  renderOdiaSebc(d) {
    const isObc = d.casteCategory && d.casteCategory.includes('OBC');
    const catTitle = isObc ? 'OBC (Other Backward Classes)' : 'SEBC (ପଛୁଆ ବର୍ଗ)';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(${catTitle} ଜାତି ପ୍ରମାଣ ପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ${this.escapeHtml(d.relation === 'Son of' ? 'ପୁତ୍ର' : (d.relation === 'Daughter of' ? 'କନ୍ୟା' : 'ପତ୍ନୀ'))}: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ । ଏତଦ୍ୱାରା ସତ୍ୟର ସହିତ ଘୋଷଣା କରୁଅଛି ଯେ:
        </p>

        <p class="font-bold">ଘୋଷଣା ବିବରଣୀ ନିମ୍ନ ପ୍ରକାରେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ <strong>${this.escapeHtml(d.subCaste || 'ଚାଷା / ଖଣ୍ଡାୟତ')}</strong> ଜାତିଭୁକ୍ତ ଅଟେ, ଯାହା ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା <strong>${this.escapeHtml(d.casteCategory || 'SEBC')}</strong> (Socially and Educationally Backward Class) ଶ୍ରେଣୀଭୁକ୍ତ ଭାବେ ଆଇନଗତ ସ୍ୱୀକୃତ ।
          </li>
          <li>
            ମୁଁ କିମ୍ବା ମୋର ପରିବାର ଭାରତ ସରକାର କିମ୍ବା ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା ନିର୍ଦ୍ଧାରିତ କ୍ରିମିଲେୟାର (Creamy Layer) ଅନ୍ତର୍ଭୁକ୍ତ ନୁହଁନ୍ତି ।
          </li>
          <li>
            ଆମ୍ଭ ପରିବାରର ସମସ୍ତ ସୂତ୍ରରୁ ବାର୍ଷିକ ସମୁଦାୟ ଆୟ କ୍ରିମିଲେୟାର ସୀମା (୮ ଲକ୍ଷ ଟଙ୍କା) ରୁ କମ୍ ଅଟେ ।
          </li>
          <li>
            ମୋର ପରିବାର ଓଡ଼ିଶା ରାଜ୍ୟରେ ସ୍ଥାୟୀ ଭାବେ ବସବାସ କରିଆସୁଅଛନ୍ତି ଏବଂ ଆମ୍ଭେ ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟୁ ।
          </li>
          <li>
            ଉପରୋକ୍ତ ସମସ୍ତ ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ ଅଟେ । ଯଦି ଭବିଷ୍ୟତରେ ଏହା ମିଥ୍ୟା ପ୍ରମାଣିତ ହୁଏ, ତେବେ ସରକାରଙ୍କ ଆଇନ ଅନୁଯାୟୀ ମୁଁ ଦାୟୀ ରହିବି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishSebc(d) {
    const isObc = d.casteCategory && d.casteCategory.includes('OBC');
    const catTitle = isObc ? 'OBC (Other Backward Classes)' : 'SEBC (Socially and Educationally Backward Classes)';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Self Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of ${catTitle} Certificate - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly declare as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I belong to the <strong>${this.escapeHtml(d.subCaste || 'Chasa / Khandayat')}</strong> community / sub-caste, which is officially recognized as <strong>${this.escapeHtml(d.casteCategory || 'SEBC')}</strong> by the Government of Odisha.
          </li>
          <li>
            That I do not belong to the Creamy Layer section as defined by the Government of India / Government of Odisha.
          </li>
          <li>
            That the total annual income of my family from all sources is within the non-creamy layer prescribed ceiling.
          </li>
          <li>
            That I am a permanent bona fide resident of the State of Odisha.
          </li>
          <li>
            That the facts stated in this declaration are true and correct to the best of my knowledge, and nothing material has been concealed.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderOdiaCaste(d) {
    if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      return this.renderOdiaScSt(d);
    }
    return this.renderOdiaSebc(d);
  },

  renderEnglishCaste(d) {
    if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      return this.renderEnglishScSt(d);
    }
    return this.renderEnglishSebc(d);
  },

  // ================= 5. NAME CORRECTION / ONE AND THE SAME PERSON ================= //
  renderOdiaNameCorrection(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ଶପଥ ପତ୍ର (Affidavit)</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(ଏକ ଏବଂ ଅଭିନ୍ନ ବ୍ୟକ୍ତିତ୍ୱ / ନାମ ସଂଶୋଧନ ପ୍ରମାଣ)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.nameCorrect)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ପିତା/ସ୍ୱାମୀ: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶା ଏତଦ୍ୱାରା ଶପଥପୂର୍ବକ ପ୍ରକାଶ କରୁଅଛି ଯେ:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୋର ପ୍ରକୃତ ଓ ସଠିକ୍ ନାମ ହେଉଛି <strong>${this.escapeHtml(d.nameCorrect)}</strong> ।
          </li>
          <li>
            ଭୁଲବଶତଃ ମୋର କେତେକ ସରକାରୀ ଦସ୍ତାବିଜରେ ମୋର ନାମ <strong>${this.escapeHtml(d.nameDocA)}</strong> 
            ଏବଂ ଅନ୍ୟ ଦସ୍ତାବିଜରେ <strong>${this.escapeHtml(d.nameDocB)}</strong> ଉଲ୍ଲେଖ ରହିଅଛି ।
          </li>
          <li>
            ଏତଦ୍ୱାରା ସତ୍ୟପାଠ କରୁଅଛି ଯେ <strong>${this.escapeHtml(d.nameDocA)}</strong> ଏବଂ 
            <strong>${this.escapeHtml(d.nameDocB)}</strong> ଭିନ୍ନ ବ୍ୟକ୍ତି ନୁହଁନ୍ତି, ଏହି ଉଭୟ ନାମ ଗୋଟିଏ ଏବଂ ଅଭିନ୍ନ ବ୍ୟକ୍ତି (ମୋର) ଅଟେ ।
          </li>
          <li>
            ଭବିଷ୍ୟତର ସମସ୍ତ ସରକାରୀ ତଥା ବେସରକାରୀ କାର୍ଯ୍ୟରେ ମୋର ସଠିକ୍ ନାମ <strong>${this.escapeHtml(d.nameCorrect)}</strong> ବୋଲି ଗ୍ରହଣ କରାଯାଉ ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଶପଥକାରୀଙ୍କ ସ୍ୱାକ୍ଷର
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.nameCorrect)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishNameCorrection(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Affidavit</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Name Clarification &amp; One and The Same Person)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.nameCorrect)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          resident of Village: <strong>${this.escapeHtml(d.village)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, Odisha, do hereby solemnly affirm and state on oath as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That my actual, genuine, and correct legal name is <strong>${this.escapeHtml(d.nameCorrect)}</strong>.
          </li>
          <li>
            That in some of my records my name is recorded as <strong>${this.escapeHtml(d.nameDocA)}</strong>, 
            whereas in other documents it is recorded as <strong>${this.escapeHtml(d.nameDocB)}</strong>.
          </li>
          <li>
            That <strong>${this.escapeHtml(d.nameDocA)}</strong> and <strong>${this.escapeHtml(d.nameDocB)}</strong> 
            refer to one and the same identical individual, which is myself.
          </li>
          <li>
            That for all official and legal purposes henceforth, my name should be recognized as <strong>${this.escapeHtml(d.nameCorrect)}</strong>.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.nameCorrect)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 6. LOST DOCUMENT DECLARATION ================= //
  renderOdiaLostDoc(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(ଦସ୍ତାବିଜ୍ / ପ୍ରମାଣପତ୍ର ହଜିବା ସମ୍ବନ୍ଧରେ)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ପିତା: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶା ।
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୋର ମୂଳ <strong>${this.escapeHtml(d.lostDocName)}</strong> (Document No: <strong>${this.escapeHtml(d.lostDocNo)}</strong>) 
            ତାରିଖ <strong>${this.escapeHtml(d.lostDate)}</strong> ରେ <strong>${this.escapeHtml(d.lostPlace)}</strong> ଠାରେ କେଉଁଆଡେ ହଜିଯାଇଅଛି ।
          </li>
          <li>
            ବହୁ ଖୋଜାଖୋଜି କରିବା ପରେ ମଧ୍ୟ ତାହା ମିଳିଲା ନାହିଁ ।
          </li>
          <li>
            ମୁଁ ଉକ୍ତ ପ୍ରମାଣପତ୍ରକୁ କୌଣସି ସ୍ଥାନରେ ବନ୍ଧକ କିମ୍ବା ବେଆଇନ କାର୍ଯ୍ୟରେ ବ୍ୟବହାର କରିନାହିଁ ।
          </li>
          <li>
            ଡୁପ୍ଲିକେଟ ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ ଏହି ସତ୍ୟପାଠ ଦାଖଲ କରୁଅଛି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishLostDoc(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Self Declaration for Lost Document</h2>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, resident of Village: <strong>${this.escapeHtml(d.village)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, do hereby declare that:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            My original <strong>${this.escapeHtml(d.lostDocName)}</strong> bearing Certificate No: <strong>${this.escapeHtml(d.lostDocNo)}</strong> 
            was misplaced/lost on <strong>${this.escapeHtml(d.lostDate)}</strong> near <strong>${this.escapeHtml(d.lostPlace)}</strong>.
          </li>
          <li>
            Despite sincere efforts, the same could not be traced.
          </li>
          <li>
            I have not pledged or misused the document anywhere.
          </li>
          <li>
            I pray for the issuance of a duplicate certificate.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature of Applicant
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 7. PADDY PROCUREMENT SAHAMATI PATRA ================= //
  renderOdiaPaddySahamati(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସହମତି ପତ୍ର (Paddy Procurement Consent)</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(ଧାନ ସଂଗ୍ରହ ନିମନ୍ତେ ଚାଷୀ ଓ ଜମି ମାଲିକଙ୍କ ସମ୍ମତି)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong> (ଚାଷୀ / Farmer ID: <strong>${this.escapeHtml(d.paddyFarmerId)}</strong>), 
          ପିତା: <strong>${this.escapeHtml(d.fatherName)}</strong>, ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong> ।
        </p>

        <p class="font-bold">ଏତଦ୍ୱାରା ଘୋଷଣା କରୁଅଛି ଯେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ଉକ୍ତ ଖାତା ନଂ <strong>${this.escapeHtml(d.paddyKhata)}</strong>, ପ୍ଲଟ୍ ନଂ <strong>${this.escapeHtml(d.paddyPlot)}</strong>, 
            ରକବା <strong>${this.escapeHtml(d.paddyArea)}</strong> ଜମିରେ ମୁଁ ଚାଷ କାର୍ଯ୍ୟ କରି ଧାନ ଉତ୍ପାଦନ କରିଅଛି ।
          </li>
          <li>
            ଉକ୍ତ ଜମିର ମୂଳ ମାଲିକ <strong>${this.escapeHtml(d.paddyOwner)}</strong> ଙ୍କ ସହିତ ମୋର ସହମତି ଅଛି ଏବଂ ମୁଁ ପ୍ରକୃତ ଚାଷୀ (Actual Cultivator) ଅଟେ ।
          </li>
          <li>
            ମଣ୍ଡିରେ ସରକାରୀ ସହାୟକ ମୂଲ୍ୟରେ ଧାନ ବିକ୍ରୟ କରିବା ପାଇଁ ଏହି ସହମତି ପ୍ରଦାନ କରୁଅଛି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଚାଷୀଙ୍କ ସ୍ୱାକ୍ଷର
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishPaddySahamati(d) {
    return this.renderOdiaPaddySahamati(d);
  },

  // ================= 8. VEHICLE SALE ================= //
  renderOdiaVehicle(d) {
    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ଗାଡ଼ି ବିକ୍ରୟ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(Declaration of Sale of Motor Vehicle)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong> (ବିକ୍ରେତା / Seller), ପିତା: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶା ।
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ ମୋର ମୋଟର ଯାନ (Vehicle No: <strong>${this.escapeHtml(d.vehRegNo)}</strong>, Chassis No: <strong>${this.escapeHtml(d.vehChassis)}</strong>) କୁ 
            ଶ୍ରୀ <strong>${this.escapeHtml(d.vehBuyer)}</strong> (କ୍ରେତା / Purchaser) ଙ୍କୁ ସର୍ବମୋଟ <strong>₹${this.escapeHtml(d.vehPrice)}/-</strong> ଟଙ୍କାରେ ବିକ୍ରୟ କରିଅଛି ।
          </li>
          <li>
            ଆଜି ତାରିଖ ଠାରୁ ଗାଡ଼ିର ସମସ୍ତ ଦାୟିତ୍ୱ ଓ କାଗଜପତ୍ର କ୍ରେତାଙ୍କୁ ହସ୍ତାନ୍ତର କରାଗଲା ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              କ୍ରେତାଙ୍କ ସ୍ୱାକ୍ଷର (Buyer)
            </div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ବିକ୍ରେତାଙ୍କ ସ୍ୱାକ୍ଷର (Seller)
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishVehicle(d) {
    return this.renderOdiaVehicle(d);
  },

  printAffidavit() {
    const el = document.getElementById('affidavitPreviewDoc') || document.getElementById('affidavitPreviewContent');
    if (!el) {
      if (typeof showToast === 'function') showToast("Affidavit preview document not ready.", "warning");
      return;
    }

    const isStamp = this.paperMode === 'stamp';
    const isOdia = this.language === 'or';
    const fontFam = isOdia 
      ? "'Noto Sans Odia', 'Aparajita', 'Kalinga', Arial, sans-serif" 
      : "'Times New Roman', 'Noto Serif', Georgia, serif";

    // Clone content without preview warning
    const clone = el.cloneNode(true);
    const noPrints = clone.querySelectorAll('.no-print');
    noPrints.forEach(n => n.remove());

    // Normalize ordered lists (ol > li) into clean, perfectly aligned rows
    clone.querySelectorAll('ol').forEach(ol => {
      const lis = Array.from(ol.querySelectorAll('li'));
      const container = document.createElement('div');
      container.style.marginTop = '12px';
      container.style.marginBottom = '14px';
      lis.forEach((li, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'flex-start';
        row.style.marginBottom = '10px';
        row.style.lineHeight = '1.8';
        row.innerHTML = `<span style="font-weight: 700; min-width: 24px; flex-shrink: 0;">${idx + 1}.</span><div style="flex: 1; text-align: justify;">${li.innerHTML}</div>`;
        container.appendChild(row);
      });
      ol.replaceWith(container);
    });

    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Odia:wght@400;600;700;800&family=Noto+Serif:wght@400;700&display=swap');
      @page { 
        size: A4 portrait; 
        margin: ${isStamp ? '55mm 18mm 18mm 18mm' : '18mm 18mm 18mm 18mm'}; 
      }
      * { box-sizing: border-box; }
      body { 
        font-family: ${fontFam} !important; 
        font-size: 13pt; 
        line-height: 1.6; 
        color: #000; 
        margin: 0; 
        padding: 0; 
        background: #fff;
      }
      .aff-paper {
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        min-height: auto !important;
        font-family: ${fontFam} !important;
      }
      .no-print { display: none !important; }
      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .text-left { text-align: left !important; }
      .text-justify { text-align: justify !important; }
      h1, h2, h3, h4 { text-align: center !important; margin: 0 0 6px 0 !important; }
      h2 { font-size: 17pt !important; font-weight: 800 !important; }
      h3 { font-size: 12pt !important; font-weight: 700 !important; color: #333 !important; }
      strong, .font-bold, .font-black { font-weight: 700 !important; }
      .uppercase { text-transform: uppercase !important; }
      .tracking-wide { letter-spacing: 0.05em !important; }
      .tracking-widest { letter-spacing: 0.1em !important; }
      .border-b-2 { border-bottom: 2px solid #000 !important; padding-bottom: 8px !important; margin-bottom: 16px !important; }
      .border-t { border-top: 1px solid #000 !important; }
      .flex { display: flex !important; }
      .justify-between { justify-content: space-between !important; }
      .items-end { align-items: flex-end !important; }
      .grid { display: grid !important; }
      .grid-cols-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; }
      .gap-4 { gap: 1rem !important; }
      .pt-8 { padding-top: 2.2rem !important; }
      .pb-4 { padding-bottom: 1rem !important; }
      .mb-4 { margin-bottom: 1rem !important; }
      .mt-0\.5 { margin-top: 2px !important; }
      .space-y-3\.5 > * + * { margin-top: 12px !important; }
      .space-y-4 > * + * { margin-top: 14px !important; }
      .space-y-2 > * + * { margin-top: 8px !important; }
      p { margin: 0 0 10px 0; }
    `;

    const printHtmlContent = clone.querySelector('.aff-paper') ? clone.querySelector('.aff-paper').innerHTML : clone.innerHTML;

    if (window.VUO_PRINT) {
      window.VUO_PRINT.printHtml(`Affidavit - ${this.template.toUpperCase()}`, printHtmlContent, styles);
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast("Please allow popups to print affidavit.", "warning");
      return;
    }
    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Affidavit - ${this.template.toUpperCase()}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${printHtmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  async downloadPdf() {
    const el = document.getElementById('affidavitPreviewDoc') || document.getElementById('affidavitPreviewContent');
    if (!el) {
      if (typeof showToast === 'function') showToast("Affidavit preview document not ready.", "warning");
      return;
    }

    if (typeof showToast === 'function') showToast("Generating high-quality A4 Affidavit PDF...", "info");

    const templateName = this.template ? this.template.toUpperCase() : 'DECLARATION';
    const filename = `Affidavit_${templateName}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const isStamp = this.paperMode === 'stamp';
    const isOdia = this.language === 'or';
    const fontFam = isOdia 
      ? "'Noto Sans Odia', 'Aparajita', 'Kalinga', Arial, sans-serif" 
      : "'Times New Roman', 'Noto Serif', Georgia, serif";

    // Extract document content without the on-screen preview stamp indicator
    const clone = el.cloneNode(true);
    const noPrints = clone.querySelectorAll('.no-print');
    noPrints.forEach(n => n.remove());

    // Normalize ordered lists (ol > li) into clean, perfectly aligned rows
    // so list numbers never float above text in html2canvas / Indic webfonts
    clone.querySelectorAll('ol').forEach(ol => {
      const lis = Array.from(ol.querySelectorAll('li'));
      const container = document.createElement('div');
      container.style.marginTop = '12px';
      container.style.marginBottom = '14px';
      lis.forEach((li, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'flex-start';
        row.style.marginBottom = '10px';
        row.style.lineHeight = '1.8';
        row.innerHTML = `<span style="font-weight: 700; min-width: 24px; flex-shrink: 0;">${idx + 1}.</span><div style="flex: 1; text-align: justify;">${li.innerHTML}</div>`;
        container.appendChild(row);
      });
      ol.replaceWith(container);
    });

    const contentHtml = clone.querySelector('.aff-paper') ? clone.querySelector('.aff-paper').innerHTML : clone.innerHTML;

    try {
      if (typeof html2canvas === 'undefined') {
        throw new Error("html2canvas not loaded");
      }
      const jsPdfClass = window.jspdf ? window.jspdf.jsPDF : (window.jsPDF || null);
      if (!jsPdfClass) {
        throw new Error("jsPDF not loaded");
      }

      // Fast isolated sandbox iframe for instantaneous clean A4 rendering (< 1 sec)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = 'none';
      iframe.style.zIndex = '-9999';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Odia:wght@400;600;700;800&family=Noto+Serif:wght@400;700&display=swap">
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: 794px;
              height: 1123px;
              background: #ffffff;
              color: #0f172a;
              font-family: ${fontFam};
              -webkit-font-smoothing: antialiased;
            }
            .a4-page {
              width: 794px;
              height: 1123px;
              padding: ${isStamp ? '205px 65px 60px 65px' : '65px 65px 60px 65px'};
              display: block; /* Natural top-to-bottom document flow: text flows as far as needed, no unnatural gaps! */
              font-size: 14.5px;
              line-height: 1.8;
              background: #ffffff;
            }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            .text-justify { text-align: justify !important; }
            h1, h2, h3, h4 { text-align: center !important; margin: 0 0 6px 0 !important; }
            h2 { font-size: 19px; font-weight: 800; margin: 0 0 4px 0; }
            h3 { font-size: 13.5px; font-weight: 700; color: #334155; margin: 0 0 14px 0; }
            .font-black, .font-bold, strong { font-weight: 700 !important; }
            .uppercase { text-transform: uppercase !important; }
            .tracking-wide { letter-spacing: 0.05em !important; }
            .border-b-2 { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            .border-t { border-top: 1px solid #334155 !important; }
            .space-y-3\.5 > * + * { margin-top: 14px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-2 > * + * { margin-top: 8px; }
            p { margin: 0 0 12px 0; }
            .grid-cols-2 { display: flex; justify-content: space-between; gap: 24px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-end { align-items: flex-end; }
            .pt-8 { padding-top: 36px !important; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div class="a4-page">
            ${contentHtml}
          </div>
        </body>
        </html>
      `);
      doc.close();

      if (iframe.contentWindow.document.fonts && iframe.contentWindow.document.fonts.ready) {
        await iframe.contentWindow.document.fonts.ready;
      }
      await new Promise(r => setTimeout(r, 150));

      const pageEl = iframe.contentWindow.document.querySelector('.a4-page') || iframe.contentWindow.document.body;

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      iframe.remove();

      const pdf = new jsPdfClass('p', 'mm', 'a4', true);
      const pdfW = 210;
      const pdfH = 297;
      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      pdf.save(filename);
      if (typeof showToast === 'function') showToast("Affidavit PDF downloaded successfully!", "success");
    } catch (err) {
      console.error("Fast A4 PDF download error:", err);
      if (typeof showToast === 'function') showToast("PDF download fallback: opening print dialog...", "info");
      this.printAffidavit();
    }
  },

  copyText() {
    const el = document.getElementById('affidavitPreviewDoc') || document.getElementById('affidavitPreviewContent');
    if (!el) return;

    navigator.clipboard.writeText(el.innerText).then(() => {
      if (typeof showToast === 'function') {
        showToast("Affidavit legal text copied to clipboard!", "success");
      }
    }).catch(() => {
      alert("Text copied!");
    });
  }
};

window.VUO_AFFIDAVIT = VUO_AFFIDAVIT;

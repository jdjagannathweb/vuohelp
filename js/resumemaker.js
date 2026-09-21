/**
 * VUO CSC HELP - Resume Maker & Bio-Data Generator
 * Comprehensive multi-template CV & Indian Marriage Biodata builder with live A4 preview,
 * multi-page support with page-breaks, and 1-click PDF download with margins.
 */

const VUO_RESUMEMAKER = {
  template: 'modern', // 'modern', 'classic', 'executive', 'biodata_traditional', 'biodata_royal'
  pageMode: 'auto', // 'auto', '1page', '2page'
  activePagesCount: 1,
  photoDataUrl: null,
  educations: [],
  experiences: [],

  setPageMode(mode) {
    this.pageMode = mode || 'auto';
    const autoBtn = document.getElementById('resModeAuto');
    const p1Btn = document.getElementById('resMode1');
    const p2Btn = document.getElementById('resMode2');

    [autoBtn, p1Btn, p2Btn].forEach(b => {
      if (b) {
        b.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-all';
      }
    });

    if (this.pageMode === 'auto' && autoBtn) {
      autoBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs cursor-pointer transition-all';
    } else if (this.pageMode === '1page' && p1Btn) {
      p1Btn.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs cursor-pointer transition-all';
    } else if (this.pageMode === '2page' && p2Btn) {
      p2Btn.className = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs cursor-pointer transition-all';
    }

    this.updatePreview();
    if (typeof showToast === 'function') {
      const modeNames = { 'auto': 'Automatic A4 Detect', '1page': '1-Page Compact Fit', '2page': '2-Page Multi-Sheet' };
      showToast("A4 Format: " + (modeNames[this.pageMode] || this.pageMode), "info");
    }
  },

  detectNeedsTwoPages(params) {
    if (this.pageMode === '2page') return true;
    if (this.pageMode === '1page') return false;

    // Automatic detection based on standard A4 page limits:
    // 1. If 2 or more work experiences exist
    if (this.experiences.length >= 2) return true;

    // 2. If 4 or more educational qualifications exist
    if (this.educations.length >= 4) return true;

    // 3. If 1 experience + 3 educations and lengthy objective or skills
    if (this.experiences.length >= 1 && this.educations.length >= 3) {
      if ((params.objective && params.objective.length > 200) || (params.skills && params.skills.length >= 5)) {
        return true;
      }
    }

    // 4. For marriage biodata: if extended family or horoscope or education is long
    if (this.template && this.template.startsWith('biodata')) {
      if ((params.family && params.family.length > 60) || this.educations.length >= 3) {
        return true;
      }
    }

    return false;
  },

  renderSheetBreak(page1Note = "Page 1 Ends Here", page2Note = "Page 2 Starts Below") {
    return `
      <div class="resume-page-break my-5 py-2.5 px-4 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700 shadow-2xs">
        <div class="flex items-center gap-2 text-slate-700">
          <i class="fa-solid fa-scissors text-slate-500"></i>
          <span class="font-bold text-xs text-slate-800">${page1Note}</span>
        </div>
        <span class="px-3 py-1 rounded-full bg-slate-900 text-white text-[10.5px] font-mono font-black shadow-xs">
          ${page2Note} ↓
        </span>
      </div>
    `;
  },

  init() {
    if (!this._initialized) {
      this.initDefaultData();
      this.bindEvents();
      this._initialized = true;
    }
    this.renderEducationRows();
    this.renderExperienceRows();
    this.updatePreview();
  },

  initDefaultData() {
    this.educations = [
      { degree: "Bachelor of Arts (B.A)", school: "Utkal University, Bhubaneswar", year: "2022", score: "72.5%" },
      { degree: "+2 Arts / Intermediate", school: "BJB Higher Secondary School", year: "2019", score: "76.0%" },
      { degree: "Matriculation (10th)", school: "Govt High School, Salepur", year: "2017", score: "81.2%" }
    ];

    this.experiences = [
      { role: "Computer Operations & Office Associate", company: "Digital Services & Citizen Hub", period: "2022 - Present", desc: "Managing computerized citizen documentation, database records, typing reports, customer correspondence, and digital certificates." }
    ];
  },

  bindEvents() {
    // Template Selector Buttons
    document.querySelectorAll('.resume-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.resume-template-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-sky-500', 'bg-sky-50', 'ring-amber-500', 'bg-amber-50');
        });
        const target = e.currentTarget;
        target.classList.add('ring-2', 'ring-sky-500', 'bg-sky-50');
        this.template = target.getAttribute('data-template');

        // Toggle biodata fields visibility if biodata template is chosen
        const bioFields = document.getElementById('resBiodataExtraFields');
        if (bioFields) {
          if (this.template.startsWith('biodata')) {
            bioFields.classList.remove('hidden');
          } else {
            bioFields.classList.add('hidden');
          }
        }

        this.updatePreview();
      });
    });

    // Form input listeners
    const ids = [
      'resFullName', 'resJobTitle', 'resPhone', 'resEmail', 'resAddress', 'resObjective',
      'resSkills', 'resCertifications', 'resLanguages', 'resDob', 'resGender', 'resMaritalStatus', 'resFather', 'resPlace',
      'bioTimeOfBirth', 'bioPlaceOfBirth', 'bioRashi', 'bioNakshatra', 'bioGotra', 'bioHeight',
      'bioComplexion', 'bioManglik', 'bioMotherName', 'bioFamilyDetails', 'bioContactPerson'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updatePreview());
    });

    // Photo input
    const photoInput = document.getElementById('resPhotoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.photoDataUrl = ev.target.result;
            this.updatePreview();
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Add Education button
    const addEduBtn = document.getElementById('resAddEduBtn');
    if (addEduBtn) {
      addEduBtn.addEventListener('click', () => {
        this.educations.push({ degree: "Degree / Course", school: "College / Board", year: "2024", score: "75%" });
        this.renderEducationRows();
        this.updatePreview();
      });
    }

    // Add Experience button
    const addExpBtn = document.getElementById('resAddExpBtn');
    if (addExpBtn) {
      addExpBtn.addEventListener('click', () => {
        this.experiences.push({ role: "Job Title", company: "Company / Shop", period: "2023 - 2024", desc: "Brief description of responsibilities" });
        this.renderExperienceRows();
        this.updatePreview();
      });
    }
  },

  renderEducationRows() {
    const container = document.getElementById('resEduContainer');
    if (!container) return;
    container.innerHTML = '';

    this.educations.forEach((edu, idx) => {
      const div = document.createElement('div');
      div.className = 'grid grid-cols-1 md:grid-cols-4 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg mb-2 relative';
      div.innerHTML = `
        <div>
          <label class="text-[11px] text-slate-500 font-semibold">Degree / Exam</label>
          <input type="text" value="${edu.degree}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
            oninput="VUO_RESUMEMAKER.updateEdu(${idx}, 'degree', this.value)" />
        </div>
        <div>
          <label class="text-[11px] text-slate-500 font-semibold">School / University</label>
          <input type="text" value="${edu.school}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
            oninput="VUO_RESUMEMAKER.updateEdu(${idx}, 'school', this.value)" />
        </div>
        <div>
          <label class="text-[11px] text-slate-500 font-semibold">Passing Year</label>
          <input type="text" value="${edu.year}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
            oninput="VUO_RESUMEMAKER.updateEdu(${idx}, 'year', this.value)" />
        </div>
        <div class="flex items-end gap-1">
          <div class="flex-1">
            <label class="text-[11px] text-slate-500 font-semibold">% / CGPA</label>
            <input type="text" value="${edu.score}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
              oninput="VUO_RESUMEMAKER.updateEdu(${idx}, 'score', this.value)" />
          </div>
          <button type="button" onclick="VUO_RESUMEMAKER.removeEdu(${idx})" class="p-1 text-rose-500 hover:text-rose-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
      container.appendChild(div);
    });
  },

  updateEdu(idx, key, val) {
    if (this.educations[idx]) {
      this.educations[idx][key] = val;
      this.updatePreview();
    }
  },

  removeEdu(idx) {
    this.educations.splice(idx, 1);
    this.renderEducationRows();
    this.updatePreview();
  },

  renderExperienceRows() {
    const container = document.getElementById('resExpContainer');
    if (!container) return;
    container.innerHTML = '';

    this.experiences.forEach((exp, idx) => {
      const div = document.createElement('div');
      div.className = 'p-2.5 bg-slate-50 border border-slate-200 rounded-lg mb-2 relative space-y-1.5';
      div.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label class="text-[11px] text-slate-500 font-semibold">Job Title / Designation</label>
            <input type="text" value="${exp.role}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
              oninput="VUO_RESUMEMAKER.updateExp(${idx}, 'role', this.value)" />
          </div>
          <div>
            <label class="text-[11px] text-slate-500 font-semibold">Company / Shop Name</label>
            <input type="text" value="${exp.company}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
              oninput="VUO_RESUMEMAKER.updateExp(${idx}, 'company', this.value)" />
          </div>
          <div class="flex items-end gap-1">
            <div class="flex-1">
              <label class="text-[11px] text-slate-500 font-semibold">Period / Duration</label>
              <input type="text" value="${exp.period}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
                oninput="VUO_RESUMEMAKER.updateExp(${idx}, 'period', this.value)" />
            </div>
            <button type="button" onclick="VUO_RESUMEMAKER.removeExp(${idx})" class="p-1 text-rose-500 hover:text-rose-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
        <div>
          <label class="text-[11px] text-slate-500 font-semibold">Key Responsibilities / Description</label>
          <input type="text" value="${exp.desc}" class="w-full text-xs px-2 py-1 border border-slate-200 rounded" 
            oninput="VUO_RESUMEMAKER.updateExp(${idx}, 'desc', this.value)" />
        </div>
      `;
      container.appendChild(div);
    });
  },

  updateExp(idx, key, val) {
    if (this.experiences[idx]) {
      this.experiences[idx][key] = val;
      this.updatePreview();
    }
  },

  removeExp(idx) {
    this.experiences.splice(idx, 1);
    this.renderExperienceRows();
    this.updatePreview();
  },

  updatePreview() {
    const name = document.getElementById('resFullName')?.value || "Rakesh Kumar Jena";
    const jobTitle = document.getElementById('resJobTitle')?.value || "Computer Operator & Citizen Service Associate";
    const phone = document.getElementById('resPhone')?.value || "+91 98612 34567";
    const email = document.getElementById('resEmail')?.value || "rakesh.jena@email.com";
    const address = document.getElementById('resAddress')?.value || "At/PO: Salepur, Cuttack, Odisha - 754202";
    const objective = document.getElementById('resObjective')?.value || "Dedicated and ambitious professional seeking a growth-oriented role in a dynamic organization where I can leverage my organizational skills, technical proficiency, problem-solving abilities, and strong communication skills to contribute effectively towards company objectives while continuously enhancing my knowledge, professional leadership capabilities, and long-term career growth.";
    const skills = document.getElementById('resSkills')?.value.split(',').map(s => s.trim()).filter(Boolean) || ["MS Office & Excel", "Internet & Web Portals", "Document Scanning & OCR", "Fast Odia & English Typing", "Customer Assistance"];
    const certs = document.getElementById('resCertifications')?.value.split(',').map(s => s.trim()).filter(Boolean) || ["DCA (Diploma in Computer Applications)", "Computer Science Foundation", "BCC (Basic Computer Course)"];
    const languages = document.getElementById('resLanguages')?.value || "Odia (Native), English, Hindi";
    const dob = document.getElementById('resDob')?.value || "15-May-2000";
    const gender = document.getElementById('resGender')?.value || "Male";
    const maritalStatus = document.getElementById('resMaritalStatus')?.value || "Unmarried";
    const father = document.getElementById('resFather')?.value || "Suresh Chandra Jena";
    const place = document.getElementById('resPlace')?.value || "Cuttack";

    // Marriage Biodata specific inputs
    const tob = document.getElementById('bioTimeOfBirth')?.value || "06:45 AM";
    const pob = document.getElementById('bioPlaceOfBirth')?.value || "Cuttack, Odisha";
    const rashi = document.getElementById('bioRashi')?.value || "Mithuna (Gemini)";
    const nakshatra = document.getElementById('bioNakshatra')?.value || "Ardra";
    const gotra = document.getElementById('bioGotra')?.value || "Kashyapa";
    const height = document.getElementById('bioHeight')?.value || "5 ft 8 in (173 cm)";
    const complexion = document.getElementById('bioComplexion')?.value || "Fair";
    const manglik = document.getElementById('bioManglik')?.value || "No (Non-Manglik)";
    const mother = document.getElementById('bioMotherName')?.value || "Minati Jena (Homemaker)";
    const family = document.getElementById('bioFamilyDetails')?.value || "1 Younger Sister (Pursuing B.Sc), Well-respected Hindu Khandayat family residing in Salepur.";
    const contactPerson = document.getElementById('bioContactPerson')?.value || `${father} (Father) - Mob: ${phone}`;

    const previewContainer = document.getElementById('resumeA4Preview');
    if (!previewContainer) return;

    // Detect if content needs 2 distinct A4 sheets
    const isTwoPage = this.detectNeedsTwoPages({ objective, skills, certs, family, address });
    this.activePagesCount = isTwoPage ? 2 : 1;

    // Update status badge in toolbar
    const pageCountLabel = document.getElementById('resPageCountLabel');
    if (pageCountLabel) {
      pageCountLabel.innerHTML = isTwoPage ? 
        'A4 Format: 2 Pages (Auto Split)' : 
        'A4 Format: 1 Page (Standard)';
    }

    const photoHtml = this.photoDataUrl ? 
      `<img src="${this.photoDataUrl}" class="w-24 h-28 object-cover rounded-lg border-2 border-slate-300 shadow-sm" />` :
      `<div class="w-24 h-28 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1 font-semibold"><span>Passport Photo</span></div>`;

    // ---------------- TEMPLATE 1: MODERN TECH TWO-COLUMN ----------------
    if (this.template === 'modern') {
      if (!isTwoPage) {
        previewContainer.innerHTML = `
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-800 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 1</span>
            </div>
            <div class="resume-page-content flex-1">
              <!-- Header Bar -->
              <div class="flex justify-between items-start pb-5 border-b-2 border-sky-600">
                <div>
                  <h1 class="text-2xl font-black text-slate-900 tracking-tight">${name.toUpperCase()}</h1>
                  <p class="text-sm font-bold text-sky-700 uppercase mt-0.5">${jobTitle}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2">
                    <span>📱 ${phone}</span>
                    <span>✉️ ${email}</span>
                    <span>📍 ${address}</span>
                  </div>
                </div>
                <div class="shrink-0 ml-4">${photoHtml}</div>
              </div>

              <!-- Objective -->
              <div class="mt-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Career Objective</h2>
                <p class="mt-2 text-slate-700 leading-relaxed text-[11.5px]">${objective}</p>
              </div>

              <!-- Education -->
              <div class="mt-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Educational Qualification</h2>
                <table class="w-full mt-2 text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <th class="p-1.5 border border-slate-200">Degree / Exam</th>
                      <th class="p-1.5 border border-slate-200">School / Board / University</th>
                      <th class="p-1.5 border border-slate-200 text-center">Year</th>
                      <th class="p-1.5 border border-slate-200 text-right">% / CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.educations.map(e => `
                      <tr class="border-b border-slate-200 text-[11px]">
                        <td class="p-1.5 font-semibold text-slate-900 border border-slate-200">${e.degree}</td>
                        <td class="p-1.5 border border-slate-200">${e.school}</td>
                        <td class="p-1.5 text-center border border-slate-200">${e.year}</td>
                        <td class="p-1.5 text-right font-bold text-slate-800 border border-slate-200">${e.score}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Experience -->
              ${this.experiences.length > 0 ? `
                <div class="mt-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Work Experience</h2>
                  <div class="mt-2 space-y-2">
                    ${this.experiences.map(exp => `
                      <div class="border-l-2 border-sky-400 pl-3 mb-2">
                        <div class="flex justify-between font-bold text-slate-900 text-[11.5px]">
                          <span>${exp.role} — <span class="text-sky-700 font-semibold">${exp.company}</span></span>
                          <span class="text-slate-500 text-[11px]">${exp.period}</span>
                        </div>
                        <p class="text-slate-600 text-[11px] mt-0.5">${exp.desc}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Skills & Certifications -->
              <div class="grid grid-cols-2 gap-4 mt-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div>
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Key Skills</h2>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    ${skills.map(s => `<span class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded text-[10.5px]">${s}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Certifications</h2>
                  <ul class="list-disc list-inside mt-2 text-[11px] text-slate-700 space-y-1">
                    ${certs.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Personal Profile -->
              <div class="mt-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1 rounded border-l-4 border-sky-600">Personal Details</h2>
                <div class="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-[11px] text-slate-700">
                  <div><strong>Father's Name:</strong> ${father}</div>
                  <div><strong>Date of Birth:</strong> ${dob}</div>
                  <div><strong>Gender:</strong> ${gender}</div>
                  <div><strong>Marital Status:</strong> ${maritalStatus}</div>
                  <div class="col-span-2"><strong>Languages Known:</strong> ${languages}</div>
                </div>
              </div>

              <!-- Declaration -->
              <div class="mt-6 pt-3 border-t border-slate-200 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <p class="text-[10px] text-slate-500 italic">I hereby declare that all the information provided above is true and authentic to the best of my knowledge.</p>
                <div class="flex justify-between items-end mt-4 text-[11px]">
                  <div>
                    <p><strong>Place:</strong> ${place}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                  <div class="text-center">
                    <div class="w-32 border-b border-slate-400 mb-1"></div>
                    <p class="font-bold text-slate-800">(${name})</p>
                    <p class="text-[10px] text-slate-500">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // 2 PAGES MODE
        const primaryExp = this.experiences.length > 0 ? this.experiences[0] : null;
        const additionalExps = this.experiences.slice(1);

        previewContainer.innerHTML = `
          <!-- A4 SHEET 1 OF 2 -->
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-800 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 2</span>
            </div>
            <div class="resume-page-content flex-1">
              <!-- Header Bar -->
              <div class="flex justify-between items-start pb-5 border-b-2 border-sky-600">
                <div>
                  <h1 class="text-2xl font-black text-slate-900 tracking-tight">${name.toUpperCase()}</h1>
                  <p class="text-sm font-bold text-sky-700 uppercase mt-0.5">${jobTitle}</p>
                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-2">
                    <span>📱 ${phone}</span>
                    <span>✉️ ${email}</span>
                    <span>📍 ${address}</span>
                  </div>
                </div>
                <div class="shrink-0 ml-4">${photoHtml}</div>
              </div>

              <!-- Objective -->
              <div class="mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Career Objective &amp; Professional Profile</h2>
                <p class="mt-2 text-slate-700 leading-relaxed text-[12px]">${objective}</p>
              </div>

              <!-- Education -->
              <div class="mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Educational Background &amp; Qualifications</h2>
                <table class="w-full mt-2.5 text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <th class="p-2 border border-slate-200">Degree / Exam</th>
                      <th class="p-2 border border-slate-200">School / Board / University</th>
                      <th class="p-2 border border-slate-200 text-center">Year</th>
                      <th class="p-2 border border-slate-200 text-right">% / CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.educations.map(e => `
                      <tr class="border-b border-slate-200 text-[11.5px]">
                        <td class="p-2 font-semibold text-slate-900 border border-slate-200">${e.degree}</td>
                        <td class="p-2 border border-slate-200">${e.school}</td>
                        <td class="p-2 text-center border border-slate-200 font-mono">${e.year}</td>
                        <td class="p-2 text-right font-bold text-slate-800 border border-slate-200">${e.score}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Primary Experience -->
              ${primaryExp ? `
                <div class="mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Professional Work Experience</h2>
                  <div class="mt-2.5 border-l-2 border-sky-500 pl-3.5 py-1">
                    <div class="flex justify-between font-bold text-slate-900 text-[12px]">
                      <span>${primaryExp.role} — <span class="text-sky-700 font-semibold">${primaryExp.company}</span></span>
                      <span class="text-slate-500 text-[11px] font-mono">${primaryExp.period}</span>
                    </div>
                    <p class="text-slate-600 text-[11.5px] mt-1 leading-relaxed">${primaryExp.desc}</p>
                  </div>
                </div>
              ` : ''}
            </div>

          </div>

          <!-- VISUAL A4 SHEET BREAK DIVIDER -->
          ${this.renderSheetBreak('Page 1 Ends Here', 'Page 2 Starts Below')}

          <!-- A4 SHEET 2 OF 2 -->
          <div class="resume-document resume-a4-page resume-page-2 bg-white text-slate-800 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="2">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-3 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 2 of 2</span>
            </div>

            <div class="resume-page-content flex-1">

              <!-- Additional Work Experience (if multiple) -->
              ${additionalExps.length > 0 ? `
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Additional Work Experience &amp; Engagements</h2>
                  <div class="mt-2.5 space-y-3">
                    ${additionalExps.map(exp => `
                      <div class="border-l-2 border-sky-400 pl-3.5 py-1">
                        <div class="flex justify-between font-bold text-slate-900 text-[12px]">
                          <span>${exp.role} — <span class="text-sky-700 font-semibold">${exp.company}</span></span>
                          <span class="text-slate-500 text-[11px] font-mono">${exp.period}</span>
                        </div>
                        <p class="text-slate-600 text-[11.5px] mt-1 leading-relaxed">${exp.desc}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Skills & Certifications -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div>
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Core Competencies &amp; Technical Skills</h2>
                  <div class="flex flex-wrap gap-2 mt-3">
                    ${skills.map(s => `<span class="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-md text-[11px] shadow-2xs">${s}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Certifications &amp; Accreditations</h2>
                  <ul class="list-disc list-inside mt-3 text-[11.5px] text-slate-700 space-y-1.5 font-medium">
                    ${certs.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Personal Profile -->
              <div class="mt-6 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h2 class="text-xs font-black uppercase text-sky-800 tracking-wider bg-sky-50 px-2.5 py-1.5 rounded border-l-4 border-sky-600">Personal Profile &amp; KYC Particulars</h2>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-[11.5px] text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <div><strong>Father's Name:</strong> ${father}</div>
                  <div><strong>Date of Birth:</strong> ${dob}</div>
                  <div><strong>Gender:</strong> ${gender}</div>
                  <div><strong>Marital Status:</strong> ${maritalStatus}</div>
                  <div class="col-span-2"><strong>Languages Known:</strong> ${languages}</div>
                  <div class="col-span-2"><strong>Permanent Address:</strong> ${address}</div>
                </div>
              </div>

              <!-- Declaration & Signature -->
              <div class="mt-8 pt-4 border-t border-slate-200 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <p class="text-[10.5px] text-slate-500 italic">I hereby solemnly affirm that the information provided above is true and correct to the best of my knowledge and belief.</p>
                <div class="flex justify-between items-end mt-6 text-[11px]">
                  <div>
                    <p><strong>Place:</strong> ${place}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                  <div class="text-center">
                    <div class="w-36 border-b border-slate-400 mb-1"></div>
                    <p class="font-bold text-slate-900">(${name})</p>
                    <p class="text-[10px] text-slate-500">Applicant Signature</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `;
      }
    } 

    // ---------------- TEMPLATE 2: EXECUTIVE CORPORATE ----------------
    else if (this.template === 'executive') {
      if (!isTwoPage) {
        previewContainer.innerHTML = `
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-900 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 1</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="border-b-4 border-slate-900 pb-4 flex justify-between items-end">
                <div>
                  <h1 class="text-3xl font-black tracking-wider text-slate-950">${name.toUpperCase()}</h1>
                  <p class="text-sm font-semibold tracking-widest text-emerald-700 uppercase mt-1">${jobTitle}</p>
                  <div class="flex flex-wrap gap-4 text-[11px] text-slate-600 mt-2">
                    <span>📱 ${phone}</span>
                    <span>✉️ ${email}</span>
                    <span>📍 ${address}</span>
                  </div>
                </div>
                <div class="shrink-0 ml-4">${photoHtml}</div>
              </div>

              <div class="mt-5 space-y-4">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">Professional Summary</h3>
                  <p class="mt-1.5 text-[11.5px] leading-relaxed text-slate-700">${objective}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">Educational Background</h3>
                  <table class="w-full mt-2 text-left border-collapse text-[11px]">
                    <thead>
                      <tr class="bg-slate-900 text-white font-bold">
                        <th class="p-1.5">Qualification</th>
                        <th class="p-1.5">Board / University</th>
                        <th class="p-1.5 text-center">Year</th>
                        <th class="p-1.5 text-right">% / Division</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.educations.map(e => `
                        <tr class="border-b border-slate-200">
                          <td class="p-1.5 font-bold text-slate-900">${e.degree}</td>
                          <td class="p-1.5">${e.school}</td>
                          <td class="p-1.5 text-center font-mono">${e.year}</td>
                          <td class="p-1.5 text-right font-black text-slate-800">${e.score}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                ${this.experiences.length > 0 ? `
                  <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">Employment &amp; Work Experience</h3>
                    <div class="mt-2 space-y-2">
                      ${this.experiences.map(exp => `
                        <div class="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <div class="flex justify-between font-bold text-slate-900 text-[11.5px]">
                            <span>${exp.role} <span class="text-emerald-700 font-semibold">@ ${exp.company}</span></span>
                            <span class="text-slate-500 font-mono text-[10.5px]">${exp.period}</span>
                          </div>
                          <p class="text-slate-600 text-[11px] mt-1 leading-normal">${exp.desc}</p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">Core Competencies &amp; Skills</h3>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    ${skills.map(s => `<span class="px-2.5 py-1 bg-slate-100 text-slate-900 font-bold rounded text-[11px] border border-slate-300">${s}</span>`).join('')}
                  </div>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">Personal Particulars</h3>
                  <div class="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-[11px] text-slate-700">
                    <div><strong>Father's Name:</strong> ${father}</div>
                    <div><strong>Date of Birth:</strong> ${dob}</div>
                    <div><strong>Gender:</strong> ${gender}</div>
                    <div><strong>Marital Status:</strong> ${maritalStatus}</div>
                    <div class="col-span-2"><strong>Languages Known:</strong> ${languages}</div>
                  </div>
                </div>
              </div>

              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[11px] resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div>
                  <p><strong>Place:</strong> ${place}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div class="text-center">
                  <div class="w-36 border-b border-slate-500 mb-1"></div>
                  <p class="font-bold text-slate-900">(${name})</p>
                  <p class="text-[10px] text-slate-500">Applicant Signature</p>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // EXECUTIVE 2 PAGES
        const primaryExp = this.experiences.length > 0 ? this.experiences[0] : null;
        const additionalExps = this.experiences.slice(1);

        previewContainer.innerHTML = `
          <!-- SHEET 1 -->
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-900 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 2</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="border-b-4 border-slate-900 pb-4 flex justify-between items-end">
                <div>
                  <h1 class="text-3xl font-black tracking-wider text-slate-950">${name.toUpperCase()}</h1>
                  <p class="text-sm font-semibold tracking-widest text-emerald-700 uppercase mt-1">${jobTitle}</p>
                  <div class="flex flex-wrap gap-4 text-[11px] text-slate-600 mt-2">
                    <span>📱 ${phone}</span>
                    <span>✉️ ${email}</span>
                    <span>📍 ${address}</span>
                  </div>
                </div>
                <div class="shrink-0 ml-4">${photoHtml}</div>
              </div>

              <div class="mt-5 space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Executive Summary</h3>
                  <p class="mt-2 text-[12px] leading-relaxed text-slate-700">${objective}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Educational Credentials</h3>
                  <table class="w-full mt-2.5 text-left border-collapse text-[11.5px]">
                    <thead>
                      <tr class="bg-slate-900 text-white font-bold">
                        <th class="p-2">Qualification</th>
                        <th class="p-2">Board / University</th>
                        <th class="p-2 text-center">Year</th>
                        <th class="p-2 text-right">% / Division</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.educations.map(e => `
                        <tr class="border-b border-slate-200">
                          <td class="p-2 font-bold text-slate-900">${e.degree}</td>
                          <td class="p-2">${e.school}</td>
                          <td class="p-2 text-center font-mono">${e.year}</td>
                          <td class="p-2 text-right font-black text-slate-800">${e.score}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

                ${primaryExp ? `
                  <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Key Employment Role</h3>
                    <div class="mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div class="flex justify-between font-bold text-slate-900 text-[12px]">
                        <span>${primaryExp.role} <span class="text-emerald-700 font-semibold">@ ${primaryExp.company}</span></span>
                        <span class="text-slate-500 font-mono text-[11px]">${primaryExp.period}</span>
                      </div>
                      <p class="text-slate-600 text-[11.5px] mt-1.5 leading-relaxed">${primaryExp.desc}</p>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

          </div>

          <!-- BREAK -->
          ${this.renderSheetBreak('Page 1 Ends Here', 'Page 2 Starts Below')}

          <!-- SHEET 2 -->
          <div class="resume-document resume-a4-page resume-page-2 bg-white text-slate-900 font-sans text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="2">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-3 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 2 of 2</span>
            </div>

            <div class="resume-page-content flex-1">

              ${additionalExps.length > 0 ? `
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Additional Employment &amp; Roles</h3>
                  <div class="mt-2.5 space-y-2.5">
                    ${additionalExps.map(exp => `
                      <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div class="flex justify-between font-bold text-slate-900 text-[12px]">
                          <span>${exp.role} <span class="text-emerald-700 font-semibold">@ ${exp.company}</span></span>
                          <span class="text-slate-500 font-mono text-[11px]">${exp.period}</span>
                        </div>
                        <p class="text-slate-600 text-[11.5px] mt-1 leading-relaxed">${exp.desc}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Core Competencies &amp; Technical Skills</h3>
                <div class="flex flex-wrap gap-2 mt-3">
                  ${skills.map(s => `<span class="px-3 py-1 bg-slate-100 text-slate-900 font-bold rounded-lg text-[11.5px] border border-slate-300">${s}</span>`).join('')}
                </div>
              </div>

              <div class="mt-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Certifications &amp; Courses</h3>
                <ul class="list-disc list-inside mt-2.5 text-[11.5px] text-slate-700 space-y-1 font-medium">
                  ${certs.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>

              <div class="mt-6 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1.5">Personal Particulars &amp; Verification</h3>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-[11.5px] text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><strong>Father's Name:</strong> ${father}</div>
                  <div><strong>Date of Birth:</strong> ${dob}</div>
                  <div><strong>Gender:</strong> ${gender}</div>
                  <div><strong>Marital Status:</strong> ${maritalStatus}</div>
                  <div class="col-span-2"><strong>Languages Known:</strong> ${languages}</div>
                  <div class="col-span-2"><strong>Permanent Address:</strong> ${address}</div>
                </div>
              </div>

              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[11px] resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div>
                  <p><strong>Place:</strong> ${place}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div class="text-center">
                  <div class="w-36 border-b border-slate-500 mb-1"></div>
                  <p class="font-bold text-slate-900">(${name})</p>
                  <p class="text-[10px] text-slate-500">Applicant Signature</p>
                </div>
              </div>
            </div>

          </div>
        `;
      }
    }

    // ---------------- TEMPLATE 3: INDIAN MARRIAGE BIODATA (TRADITIONAL) ----------------
    else if (this.template === 'biodata_traditional') {
      if (!isTwoPage) {
        previewContainer.innerHTML = `
          <div class="resume-document resume-a4-page resume-page-1 bg-amber-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-8 border-double border-amber-800 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-amber-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 font-bold border border-amber-300/80">Page 1 of 1</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center border-b-2 border-amber-800/60 pb-3 mb-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div class="flex items-center justify-center gap-3 text-amber-900">
                  <span class="text-2xl font-bold">卐</span>
                  <span class="text-xl font-bold font-heading">॥ श्री गणेशाय नमः ॥</span>
                  <span class="text-2xl font-bold">卐</span>
                </div>
                <h1 class="text-2xl font-bold text-amber-950 tracking-wide uppercase mt-1">MARRIAGE BIO-DATA</h1>
                <p class="text-xs text-amber-800 italic">May divine blessings bring happiness &amp; auspicious prosperity</p>
              </div>

              <div class="flex justify-between items-start gap-4 mb-4">
                <div class="flex-1 space-y-1">
                  <h2 class="text-xl font-bold text-amber-950">${name}</h2>
                  <p class="text-xs font-semibold text-slate-700"><strong>Profession:</strong> ${jobTitle}</p>
                  <p class="text-xs text-slate-700"><strong>Present Address:</strong> ${address}</p>
                </div>
                <div class="shrink-0 p-1 bg-white border-2 border-amber-700 rounded-lg shadow-sm">${photoHtml}</div>
              </div>

              <div class="space-y-4">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                    1. Personal &amp; Horoscope Details (ବ୍ୟକ୍ତିଗତ ଓ କୁଣ୍ଡଳୀ ବିବରଣୀ)
                  </h3>
                  <table class="w-full mt-2 border border-amber-300 text-[11.5px]">
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 w-1/3 bg-amber-100/50">Full Name:</td><td class="p-1.5 font-semibold">${name}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Date of Birth:</td><td class="p-1.5">${dob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Time of Birth:</td><td class="p-1.5">${tob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Place of Birth:</td><td class="p-1.5">${pob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Height &amp; Complexion:</td><td class="p-1.5">${height} | ${complexion}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Rashi (Zodiac):</td><td class="p-1.5 font-bold text-amber-900">${rashi}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Nakshatra &amp; Gotra:</td><td class="p-1.5">${nakshatra} (Gotra: <strong>${gotra}</strong>)</td></tr>
                    <tr><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Manglik Status:</td><td class="p-1.5 font-semibold text-emerald-800">${manglik}</td></tr>
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                    2. Education &amp; Professional Career (ଶିକ୍ଷା ଓ ବୃତ୍ତି)
                  </h3>
                  <table class="w-full mt-2 border border-amber-300 text-[11px]">
                    <tr class="bg-amber-100/80 font-bold text-amber-950">
                      <th class="p-1.5 border border-amber-300">Degree / Qualification</th>
                      <th class="p-1.5 border border-amber-300">Board / University</th>
                      <th class="p-1.5 border border-amber-300 text-center">Year</th>
                      <th class="p-1.5 border border-amber-300 text-right">% / Score</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr class="border-b border-amber-200">
                        <td class="p-1.5 font-bold border border-amber-300">${e.degree}</td>
                        <td class="p-1.5 border border-amber-300">${e.school}</td>
                        <td class="p-1.5 text-center border border-amber-300 font-mono">${e.year}</td>
                        <td class="p-1.5 text-right font-bold border border-amber-300">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                    3. Family Background (ପାରିବାରିକ ବିବରଣୀ)
                  </h3>
                  <table class="w-full mt-2 border border-amber-300 text-[11.5px]">
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 w-1/3 bg-amber-100/50">Father's Name:</td><td class="p-1.5">${father}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Mother's Name:</td><td class="p-1.5">${mother}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Siblings &amp; Family Info:</td><td class="p-1.5">${family}</td></tr>
                    <tr><td class="p-1.5 font-bold text-amber-950 bg-amber-100/50">Permanent Native Place:</td><td class="p-1.5">${address}</td></tr>
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                    4. Contact Details (ଯୋଗାଯୋଗ)
                  </h3>
                  <div class="mt-2 p-3 bg-amber-100/60 rounded border border-amber-300 flex justify-between items-center text-[11.5px]">
                    <div>
                      <p><strong>Primary Contact:</strong> ${contactPerson}</p>
                      <p class="text-slate-600 mt-0.5">Email: ${email}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-amber-900"><i class="fa-solid fa-phone mr-1"></i>${phone}</p>
                      <p class="text-slate-600 text-[10px]">Horoscope matching welcome</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // TRADITIONAL BIODATA 2 PAGES
        previewContainer.innerHTML = `
          <!-- SHEET 1 -->
          <div class="resume-document resume-a4-page resume-page-1 bg-amber-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-8 border-double border-amber-800 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-amber-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 font-bold border border-amber-300/80">Page 1 of 2</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center border-b-2 border-amber-800/60 pb-3 mb-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div class="flex items-center justify-center gap-3 text-amber-900">
                  <span class="text-2xl font-bold">卐</span>
                  <span class="text-xl font-bold font-heading">॥ श्री गणेशाय नमः ॥</span>
                  <span class="text-2xl font-bold">卐</span>
                </div>
                <h1 class="text-2xl font-bold text-amber-950 tracking-wide uppercase mt-1">MARRIAGE BIO-DATA</h1>
                <p class="text-xs text-amber-800 italic">May divine blessings bring happiness &amp; auspicious prosperity</p>
              </div>

              <div class="flex justify-between items-start gap-4 mb-5">
                <div class="flex-1 space-y-1.5">
                  <h2 class="text-2xl font-bold text-amber-950">${name}</h2>
                  <p class="text-xs font-bold text-slate-800"><strong>Occupation / Role:</strong> ${jobTitle}</p>
                  <p class="text-xs text-slate-700"><strong>Present Address:</strong> ${address}</p>
                </div>
                <div class="shrink-0 p-1.5 bg-white border-2 border-amber-700 rounded-lg shadow-md">${photoHtml}</div>
              </div>

              <div class="space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs">
                    1. Personal &amp; Horoscope Details (ବ୍ୟକ୍ତିଗତ ଓ କୁଣ୍ଡଳୀ ବିବରଣୀ)
                  </h3>
                  <table class="w-full mt-2.5 border border-amber-300 text-[12px]">
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 w-1/3 bg-amber-100/60">Full Name:</td><td class="p-2 font-semibold">${name}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Date of Birth:</td><td class="p-2 font-mono">${dob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Time of Birth:</td><td class="p-2 font-mono">${tob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Place of Birth:</td><td class="p-2">${pob}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Height &amp; Complexion:</td><td class="p-2">${height} | ${complexion}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Rashi (Zodiac):</td><td class="p-2 font-bold text-amber-900">${rashi}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Nakshatra &amp; Gotra:</td><td class="p-2">${nakshatra} (Gotra: <strong>${gotra}</strong>)</td></tr>
                    <tr><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Manglik Status:</td><td class="p-2 font-semibold text-emerald-800">${manglik}</td></tr>
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs">
                    2. Education &amp; Qualifications (ଶିକ୍ଷାଗତ ଯୋଗ୍ୟତା)
                  </h3>
                  <table class="w-full mt-2.5 border border-amber-300 text-[11.5px]">
                    <tr class="bg-amber-100/90 font-bold text-amber-950">
                      <th class="p-2 border border-amber-300">Degree / Qualification</th>
                      <th class="p-2 border border-amber-300">Board / University</th>
                      <th class="p-2 border border-amber-300 text-center">Year</th>
                      <th class="p-2 border border-amber-300 text-right">% / Score</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr class="border-b border-amber-200">
                        <td class="p-2 font-bold border border-amber-300">${e.degree}</td>
                        <td class="p-2 border border-amber-300">${e.school}</td>
                        <td class="p-2 text-center border border-amber-300 font-mono">${e.year}</td>
                        <td class="p-2 text-right font-bold border border-amber-300">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>
              </div>
            </div>

          </div>

          <!-- BREAK -->
          ${this.renderSheetBreak('Page 1 Ends Here', 'Page 2 Starts Below')}

          <!-- SHEET 2 -->
          <div class="resume-document resume-a4-page resume-page-2 bg-amber-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-8 border-double border-amber-800 relative flex flex-col justify-between" data-page="2">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-3 text-[10px] text-amber-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 font-bold border border-amber-300/80">Page 2 of 2</span>
            </div>

            <div class="resume-page-content flex-1">

              ${this.experiences.length > 0 ? `
                <div class="resume-section mb-5" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs">
                    3. Professional Occupation &amp; Employment (ବୃତ୍ତିଗତ ବିବରଣୀ)
                  </h3>
                  <div class="mt-2.5 bg-amber-100/40 p-3 rounded-lg border border-amber-300 space-y-2">
                    ${this.experiences.map(exp => `
                      <div>
                        <div class="flex justify-between font-bold text-amber-950 text-[12px]">
                          <span>${exp.role} <span class="text-slate-800">(${exp.company})</span></span>
                          <span class="text-slate-600 font-mono text-[11px]">${exp.period}</span>
                        </div>
                        <p class="text-slate-700 text-[11.5px] mt-0.5">${exp.desc}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs">
                    4. Family Background (ପାରିବାରିକ ପରିଚୟ)
                  </h3>
                  <table class="w-full mt-2.5 border border-amber-300 text-[12px]">
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 w-1/3 bg-amber-100/60">Father's Name:</td><td class="p-2 font-semibold">${father}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Mother's Name:</td><td class="p-2 font-semibold">${mother}</td></tr>
                    <tr class="border-b border-amber-200"><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Siblings &amp; Family Info:</td><td class="p-2">${family}</td></tr>
                    <tr><td class="p-2 font-bold text-amber-950 bg-amber-100/60">Permanent Native Place:</td><td class="p-2">${address}</td></tr>
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs">
                    5. Contact Particulars &amp; Match Inquiry (ଯୋଗାଯୋଗ)
                  </h3>
                  <div class="mt-2.5 p-4 bg-amber-100/70 rounded-xl border border-amber-300 flex justify-between items-center text-[12px]">
                    <div>
                      <p class="font-bold text-amber-950 text-[13px]">${contactPerson}</p>
                      <p class="text-slate-700 mt-1">Email: ${email}</p>
                      <p class="text-slate-600 text-[11px] mt-0.5">Languages: ${languages}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-black text-amber-900 text-sm"><i class="fa-solid fa-phone mr-1"></i>${phone}</p>
                      <span class="inline-block mt-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Kundali Matching Welcome</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `;
      }
    }

    // ---------------- TEMPLATE 4: ROYAL MAROON & GOLD BIODATA ----------------
    else if (this.template === 'biodata_royal') {
      if (!isTwoPage) {
        previewContainer.innerHTML = `
          <div class="resume-document resume-a4-page resume-page-1 bg-gradient-to-b from-rose-50/40 via-amber-50/30 to-rose-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-[6px] border-rose-900 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-rose-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-rose-100/70 text-rose-950 font-bold border border-rose-300/80">Page 1 of 1</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center pb-3 border-b-2 border-rose-900/40 mb-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div class="inline-block px-4 py-1 rounded-full bg-rose-950 text-amber-300 font-bold text-xs tracking-widest uppercase mb-1 shadow-sm">
                  ॥ ॐ श्री गणेशाय नमः ॥
                </div>
                <h1 class="text-2xl font-black text-rose-950 tracking-wider uppercase mt-1">ROYAL MARRIAGE BIODATA</h1>
                <p class="text-[11px] text-amber-900 font-semibold italic">Confidential Kundali &amp; Family Profile</p>
              </div>

              <div class="flex justify-between items-center gap-4 bg-rose-100/60 p-4 rounded-xl border border-rose-300 mb-4">
                <div>
                  <h2 class="text-2xl font-black text-rose-950 font-heading">${name}</h2>
                  <p class="text-xs font-bold text-rose-800 uppercase mt-0.5">${jobTitle}</p>
                  <p class="text-[11px] text-slate-700 mt-1">📍 ${address}</p>
                </div>
                <div class="shrink-0 p-1 bg-white rounded-lg border-2 border-rose-800 shadow-md">${photoHtml}</div>
              </div>

              <div class="space-y-4">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wider rounded flex items-center justify-between">
                    <span>Personal &amp; Horoscope Information</span>
                    <span class="text-[10px] text-amber-300 font-normal">Janma Patrika</span>
                  </h3>
                  <div class="grid grid-cols-2 gap-2 mt-2 text-[11.5px] bg-white p-3 rounded-lg border border-rose-200">
                    <div><strong>Date of Birth:</strong> ${dob}</div>
                    <div><strong>Time of Birth:</strong> ${tob}</div>
                    <div><strong>Place of Birth:</strong> ${pob}</div>
                    <div><strong>Height &amp; Complexion:</strong> ${height} / ${complexion}</div>
                    <div><strong>Gotra:</strong> <span class="text-rose-900 font-bold">${gotra}</span></div>
                    <div><strong>Rashi &amp; Nakshatra:</strong> ${rashi} / ${nakshatra}</div>
                    <div><strong>Manglik:</strong> <span class="text-emerald-700 font-bold">${manglik}</span></div>
                    <div><strong>Languages:</strong> ${languages}</div>
                  </div>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wider rounded">
                    Education &amp; Career Profile
                  </h3>
                  <table class="w-full mt-2 border border-rose-200 text-[11px] bg-white">
                    <tr class="bg-rose-50 font-bold text-rose-950">
                      <th class="p-1.5 border border-rose-200">Exam / Degree</th>
                      <th class="p-1.5 border border-rose-200">University / College</th>
                      <th class="p-1.5 border border-rose-200 text-center">Year</th>
                      <th class="p-1.5 border border-rose-200 text-right">% / Grade</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr class="border-b border-rose-100">
                        <td class="p-1.5 font-bold border border-rose-200">${e.degree}</td>
                        <td class="p-1.5 border border-rose-200">${e.school}</td>
                        <td class="p-1.5 text-center border border-rose-200 font-mono">${e.year}</td>
                        <td class="p-1.5 text-right font-black border border-rose-200 text-rose-950">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1 text-xs font-black uppercase tracking-wider rounded">
                    Family Particulars &amp; Native Heritage
                  </h3>
                  <div class="mt-2 bg-white p-3 rounded-lg border border-rose-200 space-y-1.5 text-[11.5px]">
                    <p><strong>Father's Name &amp; Occupation:</strong> ${father}</p>
                    <p><strong>Mother's Name:</strong> ${mother}</p>
                    <p><strong>Family Details / Siblings:</strong> ${family}</p>
                    <p><strong>Permanent Native Place:</strong> ${address}</p>
                  </div>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <div class="bg-gradient-to-r from-rose-900 to-amber-900 text-white p-3 rounded-xl flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <p class="font-bold text-amber-200 text-sm">${contactPerson}</p>
                      <p class="text-[11px] text-rose-200 mt-0.5">Email: ${email}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-base font-black text-amber-300"><i class="fa-solid fa-phone mr-1"></i>${phone}</p>
                      <p class="text-[10px] text-rose-200">Call / WhatsApp for Match Inquiry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // ROYAL BIODATA 2 PAGES
        previewContainer.innerHTML = `
          <!-- SHEET 1 -->
          <div class="resume-document resume-a4-page resume-page-1 bg-gradient-to-b from-rose-50/40 via-amber-50/30 to-rose-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-[6px] border-rose-900 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-rose-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-rose-100/70 text-rose-950 font-bold border border-rose-300/80">Page 1 of 2</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center pb-3 border-b-2 border-rose-900/40 mb-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <div class="inline-block px-4 py-1.5 rounded-full bg-rose-950 text-amber-300 font-bold text-xs tracking-widest uppercase mb-1 shadow-sm">
                  ॥ ॐ श्री गणेशाय नमः ॥
                </div>
                <h1 class="text-2xl font-black text-rose-950 tracking-wider uppercase mt-1">ROYAL MARRIAGE BIODATA</h1>
                <p class="text-[11px] text-amber-900 font-semibold italic">Confidential Kundali &amp; Family Profile</p>
              </div>

              <div class="flex justify-between items-center gap-4 bg-rose-100/60 p-4 rounded-xl border border-rose-300 mb-5">
                <div>
                  <h2 class="text-2xl font-black text-rose-950 font-heading">${name}</h2>
                  <p class="text-xs font-bold text-rose-800 uppercase mt-0.5">${jobTitle}</p>
                  <p class="text-[11.5px] text-slate-700 mt-1">📍 ${address}</p>
                </div>
                <div class="shrink-0 p-1.5 bg-white rounded-lg border-2 border-rose-800 shadow-md">${photoHtml}</div>
              </div>

              <div class="space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded flex items-center justify-between shadow-xs">
                    <span>1. Personal &amp; Horoscope Information</span>
                    <span class="text-[10.5px] text-amber-300 font-normal">Janma Patrika</span>
                  </h3>
                  <div class="grid grid-cols-2 gap-3 mt-2.5 text-[12px] bg-white p-3.5 rounded-xl border border-rose-200">
                    <div><strong>Date of Birth:</strong> ${dob}</div>
                    <div><strong>Time of Birth:</strong> ${tob}</div>
                    <div><strong>Place of Birth:</strong> ${pob}</div>
                    <div><strong>Height &amp; Complexion:</strong> ${height} / ${complexion}</div>
                    <div><strong>Gotra:</strong> <span class="text-rose-900 font-bold">${gotra}</span></div>
                    <div><strong>Rashi &amp; Nakshatra:</strong> ${rashi} / ${nakshatra}</div>
                    <div><strong>Manglik:</strong> <span class="text-emerald-700 font-bold">${manglik}</span></div>
                    <div><strong>Languages Known:</strong> ${languages}</div>
                  </div>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded shadow-xs">
                    2. Educational Qualifications &amp; Career
                  </h3>
                  <table class="w-full mt-2.5 border border-rose-200 text-[11.5px] bg-white">
                    <tr class="bg-rose-50 font-bold text-rose-950">
                      <th class="p-2 border border-rose-200">Exam / Degree</th>
                      <th class="p-2 border border-rose-200">University / College</th>
                      <th class="p-2 border border-rose-200 text-center">Year</th>
                      <th class="p-2 border border-rose-200 text-right">% / Grade</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr class="border-b border-rose-100">
                        <td class="p-2 font-bold border border-rose-200">${e.degree}</td>
                        <td class="p-2 border border-rose-200">${e.school}</td>
                        <td class="p-2 text-center border border-rose-200 font-mono">${e.year}</td>
                        <td class="p-2 text-right font-black border border-rose-200 text-rose-950">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>
              </div>
            </div>

          </div>

          <!-- BREAK -->
          ${this.renderSheetBreak('Page 1 Ends Here', 'Page 2 Starts Below')}

          <!-- SHEET 2 -->
          <div class="resume-document resume-a4-page resume-page-2 bg-gradient-to-b from-rose-50/40 via-amber-50/30 to-rose-50/40 text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-7 border-[6px] border-rose-900 relative flex flex-col justify-between" data-page="2">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-3 text-[10px] text-rose-900/60 font-mono">
              <span class="px-2 py-0.5 rounded bg-rose-100/70 text-rose-950 font-bold border border-rose-300/80">Page 2 of 2</span>
            </div>

            <div class="resume-page-content flex-1">

              ${this.experiences.length > 0 ? `
                <div class="resume-section mb-5" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded shadow-xs">
                    3. Professional Engagements &amp; Role
                  </h3>
                  <div class="mt-2.5 bg-white p-3 rounded-xl border border-rose-200 space-y-2 text-[12px]">
                    ${this.experiences.map(exp => `
                      <div>
                        <div class="flex justify-between font-bold text-rose-950">
                          <span>${exp.role} <span class="text-slate-800">(${exp.company})</span></span>
                          <span class="text-slate-500 font-mono text-[11px]">${exp.period}</span>
                        </div>
                        <p class="text-slate-600 text-[11.5px] mt-0.5">${exp.desc}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded shadow-xs">
                    4. Family Particulars &amp; Native Heritage
                  </h3>
                  <div class="mt-2.5 bg-white p-3.5 rounded-xl border border-rose-200 space-y-2 text-[12px]">
                    <p><strong>Father's Name &amp; Occupation:</strong> ${father}</p>
                    <p><strong>Mother's Name:</strong> ${mother}</p>
                    <p><strong>Family Details / Siblings:</strong> ${family}</p>
                    <p><strong>Permanent Native Place:</strong> ${address}</p>
                  </div>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="bg-rose-900 text-amber-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded shadow-xs">
                    5. Match Inquiry &amp; Primary Contacts
                  </h3>
                  <div class="mt-2.5 bg-gradient-to-r from-rose-900 to-amber-900 text-white p-4 rounded-xl flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <p class="font-bold text-amber-200 text-sm">${contactPerson}</p>
                      <p class="text-[11.5px] text-rose-200 mt-1">Email: ${email}</p>
                      <p class="text-[11px] text-rose-300 mt-0.5">Permanent Residence: ${place}, Odisha</p>
                    </div>
                    <div class="text-right">
                      <p class="text-base font-black text-amber-300"><i class="fa-solid fa-phone mr-1"></i>${phone}</p>
                      <span class="inline-block mt-1 px-2.5 py-1 rounded bg-rose-950 text-amber-300 font-bold text-[10px] border border-amber-400/40">Call / WhatsApp for Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `;
      }
    }

    // ---------------- DEFAULT: CLASSIC STANDARD CV ----------------
    else {
      if (!isTwoPage) {
        previewContainer.innerHTML = `
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 1</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center border-b pb-3 mb-4 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h1 class="text-xl font-bold tracking-wide uppercase">CURRICULUM VITAE</h1>
                <h2 class="text-lg font-bold text-slate-800 mt-1">${name}</h2>
                <p class="text-[11px] text-slate-600">${address} | Mob: ${phone} | Email: ${email}</p>
              </div>

              <div class="space-y-4">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-0.5">Career Objective</h3>
                  <p class="mt-1 text-[11px] leading-relaxed text-slate-700">${objective}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-0.5">Academic Credentials</h3>
                  <table class="w-full mt-1 text-left border text-[11px]">
                    <tr class="bg-slate-100 font-bold">
                      <th class="border p-1">Qualification</th>
                      <th class="border p-1">Institution</th>
                      <th class="border p-1 text-center">Year</th>
                      <th class="border p-1 text-right">Marks</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr>
                        <td class="border p-1 font-semibold">${e.degree}</td>
                        <td class="border p-1">${e.school}</td>
                        <td class="border p-1 text-center">${e.year}</td>
                        <td class="border p-1 text-right">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-0.5">Technical &amp; Professional Skills</h3>
                  <p class="mt-1 text-[11px] text-slate-700">${skills.join(', ')}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-0.5">Personal Details</h3>
                  <div class="grid grid-cols-2 gap-2 mt-1 text-[11px]">
                    <div>Father's Name: ${father}</div>
                    <div>Date of Birth: ${dob}</div>
                    <div>Gender: ${gender}</div>
                    <div>Marital Status: ${maritalStatus}</div>
                    <div class="col-span-2">Languages: ${languages}</div>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-2 border-t text-[11px] resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <p class="text-[10px] text-slate-600">Declaration: The above particulars are correct to the best of my knowledge.</p>
                <div class="flex justify-between items-end mt-4">
                  <div>
                    <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    <p>Place: ${place}</p>
                  </div>
                  <div class="text-center font-bold">
                    <div class="w-32 border-b border-slate-500 mb-1"></div>
                    <p>${name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // CLASSIC 2 PAGES
        previewContainer.innerHTML = `
          <!-- SHEET 1 -->
          <div class="resume-document resume-a4-page resume-page-1 bg-white text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="1">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-2 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 1 of 2</span>
            </div>
            <div class="resume-page-content flex-1">
              <div class="text-center border-b pb-3 mb-5 resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <h1 class="text-2xl font-bold tracking-wide uppercase">CURRICULUM VITAE</h1>
                <h2 class="text-xl font-bold text-slate-800 mt-1">${name}</h2>
                <p class="text-[12px] text-slate-600 mt-1">${address} | Mob: ${phone} | Email: ${email}</p>
              </div>

              <div class="space-y-5">
                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Career Objective</h3>
                  <p class="mt-2 text-[12px] leading-relaxed text-slate-700">${objective}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Academic Credentials</h3>
                  <table class="w-full mt-2.5 text-left border text-[11.5px]">
                    <tr class="bg-slate-100 font-bold">
                      <th class="border p-2">Qualification</th>
                      <th class="border p-2">Institution</th>
                      <th class="border p-2 text-center">Year</th>
                      <th class="border p-2 text-right">Marks</th>
                    </tr>
                    ${this.educations.map(e => `
                      <tr>
                        <td class="border p-2 font-semibold">${e.degree}</td>
                        <td class="border p-2">${e.school}</td>
                        <td class="border p-2 text-center font-mono">${e.year}</td>
                        <td class="border p-2 text-right font-bold">${e.score}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>

                ${this.experiences.length > 0 ? `
                  <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                    <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Primary Work Experience</h3>
                    <div class="mt-2.5 space-y-1">
                      <p class="font-bold text-slate-900 text-[12px]">${this.experiences[0].role} — ${this.experiences[0].company} (${this.experiences[0].period})</p>
                      <p class="text-slate-600 text-[11.5px]">${this.experiences[0].desc}</p>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

          </div>

          <!-- BREAK -->
          ${this.renderSheetBreak('Page 1 Ends Here', 'Page 2 Starts Below')}

          <!-- SHEET 2 -->
          <div class="resume-document resume-a4-page resume-page-2 bg-white text-slate-900 font-serif text-xs min-h-[1050px] shadow-lg rounded-2xl p-8 border border-slate-300 relative flex flex-col justify-between" data-page="2">
            <div class="resume-page-header-tag flex items-center justify-end pb-1 mb-3 text-[10px] text-slate-400 font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-100/90 text-slate-600 font-bold border border-slate-200">Page 2 of 2</span>
            </div>

            <div class="resume-page-content flex-1">
              <div class="space-y-5">
                ${this.experiences.length > 1 ? `
                  <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                    <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Additional Work Experience</h3>
                    <div class="mt-2.5 space-y-3">
                      ${this.experiences.slice(1).map(exp => `
                        <div>
                          <p class="font-bold text-slate-900 text-[12px]">${exp.role} — ${exp.company} (${exp.period})</p>
                          <p class="text-slate-600 text-[11.5px]">${exp.desc}</p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Technical &amp; Professional Skills</h3>
                  <p class="mt-2 text-[12px] text-slate-700 leading-relaxed">${skills.join(', ')}</p>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Certifications</h3>
                  <ul class="list-disc list-inside mt-2 text-[11.5px] text-slate-700 space-y-1">
                    ${certs.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>

                <div class="resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                  <h3 class="font-bold text-xs uppercase border-b border-slate-300 pb-1">Personal Details</h3>
                  <div class="grid grid-cols-2 gap-2.5 mt-2 text-[11.5px] bg-slate-50 p-3.5 rounded border border-slate-200">
                    <div>Father's Name: <strong>${father}</strong></div>
                    <div>Date of Birth: <strong>${dob}</strong></div>
                    <div>Gender: <strong>${gender}</strong></div>
                    <div>Marital Status: <strong>${maritalStatus}</strong></div>
                    <div class="col-span-2">Languages Known: <strong>${languages}</strong></div>
                    <div class="col-span-2">Permanent Address: ${address}</div>
                  </div>
                </div>
              </div>

              <div class="mt-8 pt-3 border-t text-[11px] resume-section" style="break-inside: avoid; page-break-inside: avoid;">
                <p class="text-[10.5px] text-slate-600">Declaration: The above particulars are correct and verified to the best of my knowledge.</p>
                <div class="flex justify-between items-end mt-6">
                  <div>
                    <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
                    <p>Place: ${place}</p>
                  </div>
                  <div class="text-center font-bold">
                    <div class="w-36 border-b border-slate-500 mb-1"></div>
                    <p>${name}</p>
                    <p class="text-[10px] text-slate-500 font-normal">Candidate Signature</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `;
      }
    }
  },

  printResume() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'Resume / Biodata (Print)', category: 'resume' }, () => this._doPrintResume());
    }
    this._doPrintResume();
  },

  _doPrintResume() {
    const el = document.getElementById('resumeA4Preview');
    if (!el) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast("Please allow popups in your browser to print directly.", "warning");
      return;
    }

    const name = document.getElementById('resFullName')?.value || 'Resume';
    const resumeHtml = el.innerHTML;
    const isTwoPage = el.querySelectorAll('.resume-a4-page').length > 1;

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${name} - VUO CSC Help</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif;
          }
          .resume-print-root {
            width: 100%;
            max-width: 186mm;
            margin: 0 auto;
            padding: 0;
          }
          .resume-page-break {
            display: none !important;
          }
          .resume-page-header-tag {
            display: none !important;
          }
          .resume-a4-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 0 10mm 0 !important;
            background: transparent !important;
            min-height: auto !important;
          }
          .resume-document {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .resume-page-content {
            padding: 0 !important;
          }
          ${isTwoPage ? `
          .resume-page-1 {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 270mm !important;
          }
          .resume-page-2 {
            page-break-before: always !important;
            break-before: page !important;
            min-height: 270mm !important;
            padding-top: 4mm !important;
          }
          ` : `
          .resume-page-1 {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          `}
          .resume-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 12px;
          }
          table, tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @media print {
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            .resume-print-root {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .resume-page-break {
              display: none !important;
            }
            .resume-document {
              border: none !important;
              box-shadow: none !important;
            }
            .resume-page-footer {
              display: none !important;
            }
          }
          @media screen {
            body {
              padding: 20px;
              background: #f1f5f9;
            }
            .resume-print-root {
              background: #ffffff;
              padding: 25px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-print-root">
          ${resumeHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  downloadPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Resume / Biodata (Multi-Page PDF)', category: 'resume' }, () => this._doDownloadPdf());
    }
    this._doDownloadPdf();
  },

  async _doDownloadPdf() {
    const el = document.getElementById('resumeA4Preview');
    if (!el || !window.html2canvas || !window.jspdf) {
      showToast("PDF generator library loading, please try again in a moment.", "info");
      return;
    }

    const pages = Array.from(el.querySelectorAll('.resume-a4-page'));
    if (pages.length === 0) {
      showToast("Resume content not ready for PDF.", "warning");
      return;
    }

    showToast(`Generating ${pages.length}-Page A4 PDF with exact margins...`, "info");

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 is 210 x 297 mm
      const marginX = 12; // 12mm Left & Right Margin
      const marginTop = 12; // 12mm Top Margin
      const printableWidth = 210 - (2 * marginX); // 186mm

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const drawnHeightMm = (canvas.height * printableWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage('a4', 'p');
        }

        // Draw page image onto A4 sheet
        pdf.addImage(imgData, 'JPEG', marginX, marginTop, printableWidth, Math.min(drawnHeightMm, 273));
      }

      const name = document.getElementById('resFullName')?.value || 'Resume';
      const cleanName = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Resume_${cleanName}_A4.pdf`);
      showToast(`Resume PDF (${pages.length} Pages) downloaded successfully!`, "success");
    } catch (err) {
      console.error("Error generating PDF:", err);
      showToast("Error generating PDF. Please use the Print A4 button.", "error");
    }
  }
};

window.VUO_RESUMEMAKER = VUO_RESUMEMAKER;

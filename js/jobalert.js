/**
 * VUO CSC HELP - Job Alert Desk
 * Auto-synced Government Job Notifications (Odisha & All India)
 * Features: Salary Scale, Start & Last Date, Required Documents Checklist,
 * Direct Apply Link, Official Notification PDF, and WhatsApp Customer Share.
 */

const VUO_JOB_ALERT = {
  currentCategory: 'all',
  searchQuery: '',
  sortBy: 'lastDate',
  jobs: [],
  _initialized: false,
  _isSyncing: false,

  // Fallback high-value curated job notifications for Odisha VLEs & Citizens
  defaultJobs: [
    {
      id: 'job-ossc-cgl-2026',
      title: 'OSSC Combined Graduate Level (CGL) Specialist Recruitment 2026',
      titleOdia: 'OSSC ସମ୍ମିଳିତ ସ୍ନାତକ ସ୍ତରୀୟ (CGL) ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Odisha Staff Selection Commission (OSSC)',
      post: 'Auditor, Inspector of Supplies, Junior Fishery Technical Assistant',
      vacancies: '595 Posts',
      qualification: 'Graduate in Any Discipline (B.A / B.Sc / B.Com / B.Tech)',
      ageLimit: '21 - 38 Years (SC/ST/SEBC +5 Yrs, Women +5 Yrs)',
      salary: '₹35,400 - ₹1,12,400 (Level-9 Pay Matrix)',
      startDate: '05-10-2026',
      lastDate: '04-11-2026',
      category: 'Odisha Govt',
      status: 'Active',
      applyUrl: 'https://www.ossc.gov.in',
      notificationUrl: 'https://www.ossc.gov.in/Public/OSSC/Default.aspx',
      officialUrl: 'https://www.ossc.gov.in',
      sourceUrl: 'https://www.freejobalert.com/odisha-government-jobs/',
      source: 'OSSC Portal',
      documents: [
        '10th Class Board Certificate & Marksheet (Age & DOB Proof)',
        '+2 / Higher Secondary Passing Certificate & Marksheet',
        'Graduation Degree Certificate & Final Year Marksheet',
        'Aadhaar Card (Clean Photo & Address Linked with Mobile)',
        'Recent Passport Size Photo (White Background, 20-50 KB)',
        'Candidate Signature (Black Ink on White Paper, 10-20 KB)',
        'Odisha Resident / Domicile Certificate (Tahasil e-District)',
        'Caste Certificate (SC / ST / SEBC if applicable)',
        'Employment Exchange Registration Card'
      ],
      examFee: '₹0 (Free for All Categories as per Odisha Govt Rule)',
      featured: true
    },
    {
      id: 'job-odisha-police-sepoy-2026',
      title: 'Odisha Police Sepoy / Constable Recruitment 2026',
      titleOdia: 'ଓଡ଼ିଶା ପୋଲିସ୍ କନଷ୍ଟେବଲ୍ / ସିପାହୀ ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'State Selection Board, Odisha Police (SSB)',
      post: 'Sepoy / Constable in OSAP / IRBn / SSBn Battalions',
      vacancies: '1,360 Posts',
      qualification: '10th / Matriculation Pass with Odia subject',
      ageLimit: '18 - 23 Years (Relaxable up to 28 for SC/ST/SEBC)',
      salary: '₹21,700 - ₹69,100 (Level-3 Pay Matrix)',
      startDate: '23-09-2026',
      lastDate: '30-10-2026',
      category: 'Defense & Police',
      status: 'Active',
      applyUrl: 'https://odishapolice.gov.in',
      notificationUrl: 'https://odishapolice.gov.in/sites/default/files/recruitment.pdf',
      officialUrl: 'https://odishapolice.gov.in',
      sourceUrl: 'https://www.freejobalert.com/odisha-government-jobs/',
      source: 'Odisha Police',
      documents: [
        '10th Board Certificate & Marksheet (Mandatory DOB)',
        'Odia Subject Pass Certificate (ME Standard or Class 10)',
        'Aadhaar Card (Mobile Number Linked)',
        'Recent Passport Size Photo (White Background, 20-50 KB)',
        'Candidate Signature (Black Ink, 10-20 KB)',
        'Resident Certificate of Odisha (Issued by Tehsildar)',
        'Caste Certificate (SC / ST / SEBC if applicable)',
        'Valid Driving License (For Driver preference, if available)',
        'Sports / NCC Certificate (For Bonus marks, if any)'
      ],
      examFee: '₹0 (No Examination Fee for Any Candidate)',
      featured: true
    },
    {
      id: 'job-rrb-ntpc-2026',
      title: 'Railway RRB NTPC Graduate & 12th Level Recruitment 2026',
      titleOdia: 'ରେଳବାଇ RRB NTPC ଗ୍ରାଜୁଏଟ୍ ଓ +୨ ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Railway Recruitment Control Board (RRB)',
      post: 'Station Master, Goods Train Manager, Jr Accounts Assistant, Typist',
      vacancies: '11,558 Posts (8,113 Graduate + 3,445 12th Level)',
      qualification: '12th Pass or Any Bachelor Degree',
      ageLimit: '18 - 36 Years (3 Years Covid Relief Included)',
      salary: '₹19,900 - ₹35,400 (Level-2 to Level-5 + Railway DA & Perks)',
      startDate: '14-09-2026',
      lastDate: '20-10-2026',
      category: 'Railway',
      status: 'Active',
      applyUrl: 'https://www.rrbapply.gov.in',
      notificationUrl: 'https://indianrailways.gov.in',
      officialUrl: 'https://www.rrbapply.gov.in',
      sourceUrl: 'https://www.freejobalert.com/rrb-ntpc/',
      source: 'RRB Official',
      documents: [
        '10th Board Certificate & Marksheet (Roll No & DOB)',
        '12th (+2) / Graduation Final Marksheet & Certificate',
        'Aadhaar Card (Mandatory for biometric & face verify)',
        'Recent Color Passport Photo (Light Background, no cap/specs)',
        'Scanned Signature (Running handwriting, 10-20 KB)',
        'SC / ST Certificate (for Free Sleeper Class Travel Pass)',
        'Bank Account Passbook / Cancelled Cheque (for Fee Refund)'
      ],
      examFee: 'Gen/OBC: ₹500 (₹400 Refundable) | SC/ST/Female: ₹250 (Full Refund)',
      featured: true
    },
    {
      id: 'job-india-post-gds-2026',
      title: 'India Post GDS (Gramin Dak Sevak - BPM / ABPM) Cycle 2026',
      titleOdia: 'ଭାରତୀୟ ଡାକ ବିଭାଗ GDS (ଡାକ ସେବକ) ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Department of Posts, Govt of India',
      post: 'Branch Postmaster (BPM) & Assistant Branch Postmaster (ABPM)',
      vacancies: '44,228 Posts (Odisha Circle: 2,477 Posts)',
      qualification: '10th Pass with Mathematics, English & Local Language (Odia)',
      ageLimit: '18 - 40 Years (SC/ST +5, OBC +3, PWD +10)',
      salary: '₹10,000 - ₹29,380 TRCA (BPM: ₹12K-29K | ABPM: ₹10K-24K)',
      startDate: '15-07-2026',
      lastDate: '18-10-2026',
      category: '10th & 12th Pass',
      status: 'Closing Soon',
      applyUrl: 'https://indiapostgdsonline.gov.in',
      notificationUrl: 'https://indiapostgdsonline.gov.in',
      officialUrl: 'https://indiapostgdsonline.gov.in',
      sourceUrl: 'https://www.freejobalert.com/india-post-gds/',
      source: 'India Post',
      documents: [
        '10th Board Marksheet with Marks/Grades details',
        '10th Pass Certificate',
        'Aadhaar Card',
        'Passport Size Color Photograph (Max 50 KB JPG)',
        'Candidate Signature (Max 20 KB JPG)',
        'Caste / Community Certificate (SC / ST / OBC / EWS)',
        'Computer Training Certificate (Basic 60 Days, if any)'
      ],
      examFee: '₹100 (Female, SC, ST, PWD: No Fee)',
      featured: true
    },
    {
      id: 'job-ssc-gd-constable-2026',
      title: 'SSC GD Constable (BSF, CISF, CRPF, SSB, ITBP, AR, SSF) 2026',
      titleOdia: 'SSC GD କନଷ୍ଟେବଲ୍ (ଅର୍ଦ୍ଧସାମରିକ ବଳ) ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Staff Selection Commission (SSC)',
      post: 'Constable (General Duty) & Rifleman in Assam Rifles',
      vacancies: '39,481 Posts',
      qualification: '10th Pass (Matriculation) from recognized Board',
      ageLimit: '18 - 23 Years (SC/ST: 28, OBC: 26)',
      salary: '₹21,700 - ₹69,100 (Pay Level-3 Matrix)',
      startDate: '05-09-2026',
      lastDate: '14-10-2026',
      category: 'Defense & Police',
      status: 'Closing Soon',
      applyUrl: 'https://ssc.gov.in',
      notificationUrl: 'https://ssc.gov.in',
      officialUrl: 'https://ssc.gov.in',
      sourceUrl: 'https://www.freejobalert.com/ssc-gd-constable/',
      source: 'SSC Portal',
      documents: [
        '10th Class Board Certificate (Roll No & Passing Year)',
        'Live Webcam Photo Capture (through SSC MyGov App or Browser)',
        'Scanned Signature (10 to 20 KB, Sharp JPG)',
        'Aadhaar Card / Voter ID / DL',
        'State Domicile / Permanent Resident Certificate',
        'Caste Certificate (Central Govt Format for OBC/SC/ST)',
        'NCC Certificate (A/B/C bonus marks, if applicable)'
      ],
      examFee: '₹100 (Women, SC, ST, ESM: No Fee)',
      featured: true
    },
    {
      id: 'job-osssc-cre-2026',
      title: 'OSSSC Combined Recruitment Examination (RI, ARI, Amin, ICDS)',
      titleOdia: 'OSSSC ରାଜସ୍ୱ ପରିଦର୍ଶକ (RI), ARI ଓ ଅମିନ ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Odisha Sub-ordinate Staff Selection Commission (OSSSC)',
      post: 'Revenue Inspector (RI), Assistant RI (ARI), Amin, Supervisor',
      vacancies: '2,895 Posts',
      qualification: '12th (+2) Pass for ARI/Amin | Graduation for RI & Supervisor',
      ageLimit: '21 - 38 Years (Relaxable for SC/ST/SEBC/Women)',
      salary: '₹19,900 - ₹35,400 (Level-4 for ARI/Amin | Level-9 for RI)',
      startDate: '01-10-2026',
      lastDate: '31-10-2026',
      category: 'Odisha Govt',
      status: 'Active',
      applyUrl: 'https://www.osssc.gov.in',
      notificationUrl: 'https://www.osssc.gov.in',
      officialUrl: 'https://www.osssc.gov.in',
      sourceUrl: 'https://www.freejobalert.com/osssc/',
      source: 'OSSSC',
      documents: [
        '10th Pass Certificate with Odia Subject Proof',
        '+2 / Intermediate Marksheet (for ARI & Amin)',
        'Graduation Degree Certificate (for RI & ICDS Supervisor)',
        'Aadhaar Card',
        'Passport Photo (White BG, 20-50KB)',
        'Signature (Black Ink, 10-20KB)',
        'Resident Certificate of Odisha (Revenue Tehsildar)',
        'Caste Certificate (SC/ST/SEBC)',
        'Employment Exchange Registration Number'
      ],
      examFee: '₹0 (Free for All Candidates)',
      featured: true
    },
    {
      id: 'job-sbi-clerk-2026',
      title: 'SBI Junior Associate (Customer Support & Sales / Clerk) 2026',
      titleOdia: 'SBI ବ୍ୟାଙ୍କ ଜୁନିଅର ଆସୋସିଏଟ୍ (କ୍ଲର୍କ) ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'State Bank of India (SBI)',
      post: 'Junior Associate (Clerk) - Odisha Circle (Bhubaneswar)',
      vacancies: '8,773 Posts (Odisha: 310 Posts)',
      qualification: 'Graduation in Any Discipline / Final Year Students',
      ageLimit: '20 - 28 Years (SC/ST: 33, OBC: 31)',
      salary: '₹26,730 - ₹45,000 (Basic ₹19,900 + DA + Special Allowance)',
      startDate: '10-10-2026',
      lastDate: '05-11-2026',
      category: 'Banking',
      status: 'Active',
      applyUrl: 'https://sbi.co.in/careers',
      notificationUrl: 'https://sbi.co.in/web/careers',
      officialUrl: 'https://sbi.co.in',
      sourceUrl: 'https://www.freejobalert.com/sbi-clerk/',
      source: 'SBI Careers',
      documents: [
        'Graduation Degree Marksheet & Provisional Certificate',
        '10th Board Certificate (Name & Date of Birth)',
        'Aadhaar Card / PAN Card',
        'Passport Size Photograph (4.5 cm x 3.5 cm, 20-50 KB)',
        'Signature in Black Ink (10-20 KB, No Capital Letters)',
        'Left Thumb Impression (Blue/Black Ink, 20-50 KB)',
        'Hand-written Declaration Form (as per SBI Format)',
        'Caste Certificate (Central Format for OBC-NCL / SC / ST)'
      ],
      examFee: '₹750 (General/OBC/EWS) | SC/ST/PWD: Nil',
      featured: false
    },
    {
      id: 'job-odisha-anganwadi-2026',
      title: 'Odisha Anganwadi Worker & Helper District-wise Recruitment 2026',
      titleOdia: 'ଓଡ଼ିଶା ଅଙ୍ଗନୱାଡ଼ି କର୍ମୀ ଓ ସହାୟିକା ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Women & Child Development Department, Govt of Odisha',
      post: 'Anganwadi Worker (AWW) & Anganwadi Helper (AWH)',
      vacancies: '3,250 Posts (District Gram Panchayat Ward Level)',
      qualification: '10th Pass for Worker | 8th / 9th Pass for Helper (Female Only)',
      ageLimit: '19 - 43 Years',
      salary: '₹7,500 - ₹10,000 Monthly Honorarium + State Incentives',
      startDate: '20-09-2026',
      lastDate: '28-10-2026',
      category: '10th & 12th Pass',
      status: 'Active',
      applyUrl: 'https://anganwadirec.odisha.gov.in',
      notificationUrl: 'https://wcd.odisha.gov.in',
      officialUrl: 'https://anganwadirec.odisha.gov.in',
      sourceUrl: 'https://www.freejobalert.com/odisha-government-jobs/',
      source: 'WCD Odisha',
      documents: [
        '10th / 8th Pass Marksheet & School Leaving Certificate',
        'Permanent Resident Certificate (Same Gram Panchayat / Ward mandatory)',
        'Aadhaar Card & Voter ID Card',
        'Ration Card / NFSA / SFSS Card (Family proof)',
        'Caste Certificate (SC / ST / SEBC)',
        'Passport Size Photo (2 Copies)',
        'Married / Unmarried / Widow Certificate (Ward Member signed)'
      ],
      examFee: '₹0 (No Application Fee)',
      featured: false
    },
    {
      id: 'job-itr-drdo-2026',
      title: 'ITR DRDO Chandipur Graduate & Technician Apprentice 2026',
      titleOdia: 'DRDO ଚାନ୍ଦିପୁର ଆପ୍ରେଣ୍ଟିସ୍ ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Integrated Test Range (ITR), DRDO Chandipur, Balasore',
      post: 'Graduate Apprentice (B.Tech/Degree) & Technician (Diploma)',
      vacancies: '54 Posts',
      qualification: 'B.E/B.Tech, Diploma, B.B.A, B.Com, B.Lib',
      ageLimit: '18 - 28 Years',
      salary: '₹8,000 - ₹9,000 Monthly Stipend',
      startDate: '09-10-2026',
      lastDate: '02-11-2026',
      category: 'Odisha Govt',
      status: 'Active',
      applyUrl: 'https://www.drdo.gov.in',
      notificationUrl: 'https://www.drdo.gov.in/drdo/careers',
      officialUrl: 'https://www.drdo.gov.in',
      sourceUrl: 'https://www.freejobalert.com/articles/itr-drdo-vacancy-2026/',
      source: 'DRDO ITR',
      documents: [
        'Degree / Diploma Marksheet & Passing Certificate',
        '10th Board Certificate for DOB proof',
        'NATS 2.0 / NAPS Portal 16-Digit Enrollment Number',
        'Aadhaar Card',
        'Passport Photo (White BG, 20-50KB)',
        'Candidate Signature (10-20KB)',
        'Caste Certificate (if applicable)'
      ],
      examFee: 'Nil (No Fee)',
      featured: false
    },
    {
      id: 'job-cuo-koraput-2026',
      title: 'Central University of Odisha (CUO Koraput) Non-Teaching Staff',
      titleOdia: 'ଓଡ଼ିଶା କେନ୍ଦ୍ରୀୟ ବିଶ୍ୱବିଦ୍ୟାଳୟ (କୋରାପୁଟ) ନିଯୁକ୍ତି ୨୦୨୬',
      organization: 'Central University of Odisha (CUO)',
      post: 'Junior Assistant, LDC, MTS & Laboratory Attendant',
      vacancies: '32 Posts',
      qualification: '10th / 12th / Any Graduate with Typing Knowledge',
      ageLimit: '18 - 32 Years',
      salary: '₹19,900 - ₹63,200 (Level-2 / Level-4)',
      startDate: '08-10-2026',
      lastDate: '20-11-2026',
      category: 'Odisha Govt',
      status: 'Active',
      applyUrl: 'https://cuo.ac.in',
      notificationUrl: 'https://cuo.ac.in/recruitment.asp',
      officialUrl: 'https://cuo.ac.in',
      sourceUrl: 'https://www.freejobalert.com/odisha-government-jobs/',
      source: 'CUO Koraput',
      documents: [
        '10th Class Certificate & Marksheet',
        '+2 / Graduation Certificate & Marksheets',
        'Computer & Typing Certificate (30/35 wpm)',
        'Aadhaar Card',
        'Passport Photo & Signature',
        'Caste / EWS Certificate (if applicable)'
      ],
      examFee: '₹500 (SC/ST/PWD/Female: Exempted)',
      featured: false
    }
  ],

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
    this.loadJobs();
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    this.renderStats();
    this.renderJobs();
    this.fetchLiveServerJobs(false);
  },

  loadJobs() {
    let list = [...this.defaultJobs];
    try {
      const localCustom = localStorage.getItem('vuo_custom_job_alerts');
      if (localCustom) {
        const parsed = JSON.parse(localCustom);
        if (Array.isArray(parsed)) {
          // Prepend custom user-added jobs
          const existingIds = new Set(list.map(j => j.id));
          parsed.forEach(pj => {
            if (!existingIds.has(pj.id)) {
              list.unshift(pj);
              existingIds.add(pj.id);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[JobAlert] Error loading local custom jobs:', e);
    }
    this.jobs = list;
  },

  async fetchLiveServerJobs(force = false) {
    if (this._isSyncing) return;
    this._isSyncing = true;
    const syncBtn = document.getElementById('jobAlertSyncBtn');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin text-amber-300"></i> <span>Syncing Latest Jobs...</span>`;
    }

    try {
      const endpoint = force ? '/api/sync-job-alerts' : '/api/job-alerts';
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          const map = new Map();
          // Keep server scraped jobs
          data.jobs.forEach(j => map.set(j.id, j));
          // Merge custom & default
          this.defaultJobs.forEach(dj => {
            if (!map.has(dj.id)) map.set(dj.id, dj);
          });
          // Local custom jobs
          try {
            const localCustom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
            localCustom.forEach(lj => map.set(lj.id, lj));
          } catch(e) {}

          this.jobs = Array.from(map.values());
          this.renderStats();
          this.renderJobs();

          if (force && typeof showToast === 'function') {
            const addedMsg = data.newAdded ? ` (${data.newAdded} New Jobs Added!)` : '';
            showToast(`✅ Successfully synced ${data.count} Live Govt Jobs!${addedMsg}`, 'success');
          }
        }
      }
    } catch (e) {
      // Offline fallback: jobs already loaded from defaultJobs
      console.log('[JobAlert] Running in offline / static hosting mode:', e.message);
    } finally {
      this._isSyncing = false;
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate text-amber-300"></i> <span>Auto-Sync Latest Jobs</span>`;
      }
    }
  },

  executeSearch() {
    const searchInput = document.getElementById('jobAlertSearchInput');
    if (searchInput) {
      this.searchQuery = searchInput.value.toLowerCase().trim();
      this.renderJobs();
    }
  },

  clearSearch() {
    const searchInput = document.getElementById('jobAlertSearchInput');
    if (searchInput) {
      searchInput.value = '';
      this.searchQuery = '';
      this.renderJobs();
    }
  },

  bindEvents() {
    // Category pills
    document.querySelectorAll('.job-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.job-cat-btn').forEach(b => {
          b.className = 'job-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer whitespace-nowrap';
        });
        const target = e.currentTarget;
        target.className = 'job-cat-btn px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-500 text-slate-950 shadow-md transition-all cursor-pointer whitespace-nowrap';
        this.currentCategory = target.getAttribute('data-cat') || 'all';
        this.renderJobs();
      });
    });

    // Search input
    const searchInput = document.getElementById('jobAlertSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderJobs();
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.executeSearch();
        }
      });
    }

    // Sort select
    const sortSelect = document.getElementById('jobAlertSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderJobs();
      });
    }
  },

  getAllJobs() {
    return (this.jobs && this.jobs.length > 0) ? this.jobs : this.defaultJobs;
  },

  setCategory(cat) {
    this.currentCategory = cat || 'all';
    document.querySelectorAll('.job-cat-btn').forEach(b => {
      const bCat = b.getAttribute('data-cat') || 'all';
      if (bCat === this.currentCategory) {
        b.className = 'job-cat-btn px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-500 text-slate-950 shadow-md transition-all cursor-pointer whitespace-nowrap';
      } else {
        b.className = 'job-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer whitespace-nowrap';
      }
    });
    this.renderJobs();
  },

  setFilter(cat) {
    this.setCategory(cat);
  },

  renderStats() {
    const totalEl = document.getElementById('jobStatTotal');
    const odishaEl = document.getElementById('jobStatOdisha');
    const centralEl = document.getElementById('jobStatCentral');
    const closingEl = document.getElementById('jobStatClosing');

    const total = this.jobs.length;
    const odisha = this.jobs.filter(j => j.category === 'Odisha Govt').length;
    const central = this.jobs.filter(j => j.category === 'Central Govt' || j.category === 'Railway' || j.category === 'Banking' || j.category === 'Defense & Police').length;
    const closing = this.jobs.filter(j => this.getDaysRemaining(j.lastDate) <= 7 && this.getDaysRemaining(j.lastDate) >= 0).length;

    if (totalEl) totalEl.textContent = total;
    if (odishaEl) odishaEl.textContent = odisha;
    if (centralEl) centralEl.textContent = central;
    if (closingEl) closingEl.textContent = closing;
  },

  getDaysRemaining(dateStr) {
    if (!dateStr) return 999;
    // Format could be DD-MM-YYYY or DD/MM/YYYY
    const parts = dateStr.replace(/\//g, '-').split('-');
    if (parts.length !== 3) return 999;
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;

    const target = new Date(year, month, day, 23, 59, 59);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },

  renderJobs() {
    const container = document.getElementById('jobAlertsGrid');
    const emptyState = document.getElementById('jobAlertsEmpty');
    const countBadge = document.getElementById('jobAlertsCountBadge');
    if (!container) return;

    let filtered = this.jobs.filter(job => {
      // Category filter
      if (this.currentCategory === 'odisha' && job.category !== 'Odisha Govt') return false;
      if (this.currentCategory === 'central' && job.category !== 'Central Govt') return false;
      if (this.currentCategory === 'railway' && job.category !== 'Railway') return false;
      if (this.currentCategory === 'banking' && job.category !== 'Banking') return false;
      if (this.currentCategory === 'matric') {
        const isMatric = job.category === '10th & 12th Pass' ||
          /10th|10 th|8th|matric|12th|\+2|intermediate/i.test((job.qualification || '') + ' ' + (job.post || ''));
        if (!isMatric) return false;
      }
      if (this.currentCategory === 'closing') {
        const days = this.getDaysRemaining(job.lastDate);
        if (days > 7 || days < 0) return false;
      }

      // Search query
      if (this.searchQuery) {
        const hay = `${job.title} ${job.titleOdia || ''} ${job.organization} ${job.post} ${job.qualification} ${job.salary || ''}`.toLowerCase();
        if (!hay.includes(this.searchQuery)) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'lastDate') {
        return this.getDaysRemaining(a.lastDate) - this.getDaysRemaining(b.lastDate);
      } else if (this.sortBy === 'newest') {
        return (b.syncedAt || 0) - (a.syncedAt || 0);
      }
      return 0;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Jobs Found`;
    }

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = filtered.map(job => this.createJobCardHtml(job)).join('');
  },

  createJobCardHtml(job) {
    const daysLeft = this.getDaysRemaining(job.lastDate);
    let deadlineBadge = '';
    if (daysLeft < 0) {
      deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Application Closed</span>`;
    } else if (daysLeft <= 3) {
      deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-200"><i class="fa-solid fa-fire mr-1"></i>Closing in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}!</span>`;
    } else if (daysLeft <= 7) {
      deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300"><i class="fa-solid fa-clock mr-1"></i>${daysLeft} Days Left</span>`;
    } else {
      deadlineBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i>Active (${daysLeft} Days Left)</span>`;
    }

    // Category styling badge
    let catClass = 'bg-sky-50 text-sky-800 border-sky-200';
    let catIcon = 'fa-building-columns';
    if (job.category === 'Odisha Govt') {
      catClass = 'bg-amber-50 text-amber-900 border-amber-300';
      catIcon = 'fa-landmark';
    } else if (job.category === 'Railway') {
      catClass = 'bg-red-50 text-red-800 border-red-200';
      catIcon = 'fa-train';
    } else if (job.category === 'Banking') {
      catClass = 'bg-blue-50 text-blue-800 border-blue-200';
      catIcon = 'fa-piggy-bank';
    } else if (job.category === 'Defense & Police') {
      catClass = 'bg-emerald-50 text-emerald-900 border-emerald-300';
      catIcon = 'fa-shield-halved';
    } else if (job.category === '10th & 12th Pass') {
      catClass = 'bg-purple-50 text-purple-900 border-purple-200';
      catIcon = 'fa-graduation-cap';
    }

    const docsCount = Array.isArray(job.documents) ? job.documents.length : 0;
    const docsListHtml = (Array.isArray(job.documents) && job.documents.length > 0)
      ? job.documents.map(d => `<li class="flex items-start gap-2 py-1 border-b border-slate-100 text-xs text-slate-700 last:border-none"><i class="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-[11px] shrink-0"></i><span>${this.escapeHtml(d)}</span></li>`).join('')
      : `<li class="text-xs text-slate-500 py-1">Standard Government Job Documents (10th/12th certificate, Aadhaar, Photo & Signature).</li>`;

    const cleanSafeTitle = (job.title || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const cleanSafePost = (job.post || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeJobId = (job.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeOrg = this.escapeHtml(job.organization || 'Govt Department');
    const safeTitle = this.escapeHtml(job.title || '');
    const safeTitleOdia = this.escapeHtml(job.titleOdia || '');
    const safeSalary = this.escapeHtml(job.salary || 'Govt Norms');
    const safeVacancies = this.escapeHtml(job.vacancies || 'Check Notice');
    const safeQual = this.escapeHtml(job.qualification || 'Matric / Degree');
    const safeStartDate = this.escapeHtml(job.startDate || 'Started');
    const safeLastDate = this.escapeHtml(job.lastDate || 'Closing Soon');
    const safeAge = this.escapeHtml(job.ageLimit || '');

    return `
      <div class="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group">
        
        <!-- Card Top Header Bar -->
        <div class="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/30">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${catClass}">
              <i class="fa-solid ${catIcon} text-[10px]"></i>
              <span>${job.category || 'Govt Job'}</span>
            </span>
            ${deadlineBadge}
          </div>

          <!-- Organization & Title -->
          <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <i class="fa-regular fa-building text-amber-500"></i>
            <span class="truncate">${safeOrg}</span>
          </div>
          <h3 class="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors leading-snug mt-1">
            ${safeTitle}
          </h3>
          ${job.titleOdia ? `<p class="text-xs font-semibold text-amber-700/90 mt-0.5 font-sans">${safeTitleOdia}</p>` : ''}
        </div>

        <!-- Key Metrics Strip: Salary, Vacancy & Qualification -->
        <div class="p-4 sm:p-5 py-3.5 bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <!-- 1. Salary / Pay Scale -->
          <div class="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
            <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0 font-bold">₹</span>
            <div class="min-w-0">
              <span class="text-[10px] font-bold uppercase text-slate-500 block leading-none">Salary / Pay Scale</span>
              <span class="font-black text-emerald-800 text-xs truncate block mt-0.5">${safeSalary}</span>
            </div>
          </div>

          <!-- 2. Vacancies -->
          <div class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs shrink-0 font-bold"><i class="fa-solid fa-users"></i></span>
            <div class="min-w-0">
              <span class="text-[10px] font-bold uppercase text-slate-500 block leading-none">Total Vacancies</span>
              <span class="font-extrabold text-slate-900 text-xs truncate block mt-0.5">${safeVacancies}</span>
            </div>
          </div>

          <!-- 3. Qualification -->
          <div class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs shrink-0 font-bold"><i class="fa-solid fa-user-graduate"></i></span>
            <div class="min-w-0">
              <span class="text-[10px] font-bold uppercase text-slate-500 block leading-none">Qualification</span>
              <span class="font-bold text-slate-800 text-xs truncate block mt-0.5">${safeQual}</span>
            </div>
          </div>
        </div>

        <!-- Dates Timeline Strip -->
        <div class="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div class="flex items-center gap-1.5">
            <i class="fa-regular fa-calendar-check text-emerald-600"></i>
            <span class="text-slate-500">Apply Start:</span>
            <span class="font-bold text-slate-900">${safeStartDate}</span>
          </div>
          <div class="flex items-center gap-1.5 font-extrabold">
            <i class="fa-regular fa-calendar-xmark text-rose-600"></i>
            <span class="text-slate-500">Last Date:</span>
            <span class="text-rose-700">${safeLastDate}</span>
          </div>
          ${job.ageLimit ? `<div class="w-full text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><i class="fa-solid fa-cake-candles text-amber-500"></i> <span>Age Limit: <b>${safeAge}</b></span></div>` : ''}
        </div>

        <!-- Required Documents Accordion -->
        <div class="px-4 sm:px-5 py-3 flex-grow">
          <div class="bg-amber-50/40 rounded-xl border border-amber-200/70 p-3">
            <div class="flex items-center justify-between cursor-pointer" onclick="VUO_JOB_ALERT.toggleDocs('${safeJobId}')">
              <div class="flex items-center gap-2 text-xs font-black text-amber-950">
                <i class="fa-solid fa-clipboard-list text-amber-600"></i>
                <span>ଦରକାରୀ କାଗଜପତ୍ର (Documents Required)</span>
                <span class="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">${docsCount} Docs</span>
              </div>
              <button type="button" class="text-amber-800 text-xs font-bold hover:text-amber-950 flex items-center gap-1">
                <span id="docsToggleText-${safeJobId}">View</span>
                <i id="docsToggleIcon-${safeJobId}" class="fa-solid fa-chevron-down text-[10px] transition-transform"></i>
              </button>
            </div>

            <!-- Expandable Documents List -->
            <div id="docsList-${safeJobId}" class="mt-2.5 pt-2 border-t border-amber-200/60 hidden">
              <ul class="space-y-0.5 mb-2.5">
                ${docsListHtml}
              </ul>
              <div class="flex flex-wrap gap-2 pt-1 border-t border-amber-200/50">
                <button onclick="VUO_JOB_ALERT.copyDocs('${safeJobId}')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer">
                  <i class="fa-regular fa-copy text-slate-500"></i> Copy Checklist
                </button>
                <a href="#passphoto" class="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 transition-all">
                  <i class="fa-solid fa-camera text-indigo-500"></i> Passport Studio
                </a>
                <a href="#imagetools" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all">
                  <i class="fa-solid fa-signature text-emerald-500"></i> Signature Resizer
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="p-4 sm:p-5 pt-3 bg-white border-t border-slate-100 mt-auto flex flex-wrap items-center gap-2">
          <!-- 1. Direct Apply Online Button -->
          <a href="${job.applyUrl || '#'}" target="_blank" rel="noopener noreferrer" 
            class="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs text-center shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] cursor-pointer">
            <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span>Apply Online</span>
          </a>

          <!-- 2. Official Notification PDF Link -->
          <a href="${job.notificationUrl || job.applyUrl || '#'}" target="_blank" rel="noopener noreferrer"
            class="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer" title="Download Official Notification PDF">
            <i class="fa-solid fa-file-pdf text-rose-600"></i>
            <span class="hidden sm:inline">Notification</span> PDF
          </a>

          <!-- 3. WhatsApp Share to Customer -->
          <button onclick="VUO_JOB_ALERT.shareJobWhatsApp('${safeJobId}')"
            class="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer" title="Share with customer on WhatsApp (+91)">
            <i class="fa-brands fa-whatsapp text-sm"></i>
            <span class="hidden md:inline">Share</span>
          </button>

          <!-- 4. Print Notice Slip -->
          <button onclick="VUO_JOB_ALERT.printJobNotice('${safeJobId}')"
            class="py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-all cursor-pointer" title="Print 1-Page CSC Notice Slip">
            <i class="fa-solid fa-print"></i>
          </button>
        </div>

      </div>
    `;
  },

  toggleDocs(jobId) {
    const list = document.getElementById(`docsList-${jobId}`);
    const text = document.getElementById(`docsToggleText-${jobId}`);
    const icon = document.getElementById(`docsToggleIcon-${jobId}`);
    if (!list) return;

    if (list.classList.contains('hidden')) {
      list.classList.remove('hidden');
      if (text) text.textContent = 'Hide';
      if (icon) icon.classList.add('rotate-180');
    } else {
      list.classList.add('hidden');
      if (text) text.textContent = 'View';
      if (icon) icon.classList.remove('rotate-180');
    }
  },

  copyDocs(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || !Array.isArray(job.documents)) return;

    const text = `📋 [ଦରକାରୀ କାଗଜପତ୍ର ତାଲିକା / REQUIRED DOCUMENTS]
ଚାକିରୀ: ${job.title}
ସଂସ୍ଥା: ${job.organization}
ଦରମା: ${job.salary || 'As per Govt Norms'}
ଆବେଦନ ଶେଷ ତାରିଖ: ${job.lastDate}

ଆବେଦନ ପାଇଁ ନିମ୍ନଲିଖିତ କାଗଜପତ୍ର ଆଣି CSC କେନ୍ଦ୍ରକୁ ଆସନ୍ତୁ:
${job.documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}

ଆବେଦନ ଲିଙ୍କ୍: ${job.applyUrl}
— VLE HELP DESK (vleunionodisha.in)`;

    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast("✅ କାଗଜପତ୍ର ତାଲିକା କ୍ଲିପବୋର୍ଡକୁ କପି ହୋଇଗଲା! WhatsApp ରେ ପଠାଇପାରିବେ।", "success");
      }
    }).catch(() => {
      alert(text);
    });
  },

  shareJobWhatsApp(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    const docsText = Array.isArray(job.documents)
      ? job.documents.map((d, i) => `  ${i + 1}️⃣ ${d}`).join('\n')
      : '  10th/12th Certificate, Aadhaar, Photo & Signature';

    const msg = `📢 *ସରକାରୀ ଚାକିରୀ ସୂଚନା (GOVT JOB ALERT)*
━━━━━━━━━━━━━━━━━━━━
📌 *ପଦବୀ:* ${job.title}
🏛️ *ବିଭାଗ:* ${job.organization}
👥 *ମୋଟ ପୋଷ୍ଟ:* ${job.vacancies}
🎓 *ଶିକ୍ଷାଗତ ଯୋଗ୍ୟତା:* ${job.qualification}
💰 *ମାସିକ ଦରମା (Salary):* ${job.salary || 'Govt Scale'}

🗓️ *ଆରମ୍ଭ ତାରିଖ:* ${job.startDate}
⏰ *ଶେଷ ତାରିଖ (Last Date):* ${job.lastDate}

📋 *ଆବେଦନ ପାଇଁ ଆବଶ୍ୟକ କାଗଜପତ୍ର:*
${docsText}

🌐 *ଅନଲାଇନ୍ ଆବେଦନ ଲିଙ୍କ୍:* ${job.applyUrl}

ଆପଣଙ୍କ ନିକଟସ୍ଥ CSC କେନ୍ଦ୍ରରେ ଅନଲାଇନ୍ ଆବେଦନ ପାଇଁ ତୁରନ୍ତ ଯୋଗାଯୋଗ କରନ୍ତୁ।
━━━━━━━━━━━━━━━━━━━━
ପ୍ରସ୍ତୁତି: *VLE HELP DESK* | https://vleunionodisha.in`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  },

  printJobNotice(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    const docsHtml = Array.isArray(job.documents)
      ? job.documents.map(d => `<li style="padding: 4px 0; border-bottom: 1px dotted #ccc;">✔ ${d}</li>`).join('')
      : '<li>Standard Documents</li>';

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast("Please allow popups to print notice", "warning");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${job.title} - CSC Notice</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; }
            .header { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 12px; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; color: #0369a1; text-transform: uppercase; }
            .header h2 { margin: 5px 0 0 0; font-size: 14px; color: #d97706; }
            .badge-bar { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
            .badge-item { font-size: 13px; font-weight: bold; }
            .main-title { font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 12px; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .info-table td { padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 13px; }
            .info-table td.label { font-weight: bold; background: #f1f5f9; width: 30%; }
            .salary-box { background: #ecfdf5; border: 2px solid #10b981; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center; }
            .salary-title { font-size: 12px; font-weight: bold; color: #047857; text-transform: uppercase; }
            .salary-val { font-size: 22px; font-weight: 900; color: #065f46; margin-top: 4px; }
            .docs-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
            .docs-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #92400e; }
            .docs-box ul { margin: 0; padding-left: 18px; list-style-type: none; font-size: 12px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1>🏛️ COMMON SERVICES CENTRE (CSC) — NOTICE</h1>
            <h2>ସରକାରୀ ଚାକିରୀ ଆବେଦନ ସୂଚନା ପତ୍ର (GOVT JOB RECRUITMENT ALERT)</h2>
          </div>

          <div class="badge-bar">
            <span class="badge-item">🏛️ ବିଭାଗ: ${job.organization}</span>
            <span class="badge-item">👥 ମୋଟ ପଦବୀ: ${job.vacancies}</span>
            <span class="badge-item" style="color: #b91c1c;">⏰ ଶେଷ ତାରିଖ: ${job.lastDate}</span>
          </div>

          <div class="main-title">${job.title}</div>

          <div class="salary-box">
            <div class="salary-title">ମାସିକ ଦରମା / PAY SCALE</div>
            <div class="salary-val">${job.salary || 'As per Govt Norms'}</div>
          </div>

          <table class="info-table">
            <tr>
              <td class="label">ପଦବୀ ନାମ (Post Name)</td>
              <td>${job.post || job.title}</td>
            </tr>
            <tr>
              <td class="label">ଶିକ୍ଷାଗତ ଯୋଗ୍ୟତା (Qualification)</td>
              <td>${job.qualification}</td>
            </tr>
            <tr>
              <td class="label">ବୟସ ସୀମା (Age Limit)</td>
              <td>${job.ageLimit || '18 - 38 Years'}</td>
            </tr>
            <tr>
              <td class="label">ଅନଲାଇନ୍ ଆବେଦନ ଆରମ୍ଭ</td>
              <td>${job.startDate}</td>
            </tr>
            <tr>
              <td class="label" style="color: #b91c1c;">ଅନଲାଇନ୍ ଆବେଦନ ଶେଷ ତାରିଖ</td>
              <td style="font-weight: bold; color: #b91c1c;">${job.lastDate}</td>
            </tr>
            <tr>
              <td class="label">ପରୀକ୍ଷା ଫିସ୍ (Exam Fee)</td>
              <td>${job.examFee || 'Free / As per notification'}</td>
            </tr>
          </table>

          <div class="docs-box">
            <h3>📋 ଆବେଦନ ପାଇଁ ସାଙ୍ଗରେ ଆଣିବାକୁ ଥିବା ଆବଶ୍ୟକ କାଗଜପତ୍ର (Checklist):</h3>
            <ul>
              ${docsHtml}
            </ul>
          </div>

          <div style="background: #f8fafc; border: 1px dashed #0284c7; padding: 10px; border-radius: 6px; text-align: center; font-size: 13px; font-weight: bold; color: #0369a1;">
            👉 ଆମ CSC କେନ୍ଦ୍ରକୁ ଆସି ନିର୍ଭୁଲ୍ ଭାବେ ଅନଲାଇନ୍ ଫର୍ମ ପୂରଣ କରନ୍ତୁ।
          </div>

          <div class="footer">
            Printed from VLE HELP DESK Portal | Digital CSC Partner: vleunionodisha.in
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
  },

  openAddJobModal() {
    const modal = document.getElementById('addJobAlertModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const titleInput = document.getElementById('customJobTitle');
      if (titleInput) titleInput.focus();
    }
  },

  closeAddJobModal() {
    const modal = document.getElementById('addJobAlertModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  saveCustomJob(e) {
    if (e && e.preventDefault) e.preventDefault();

    const title = (document.getElementById('customJobTitle')?.value || '').trim();
    const org = (document.getElementById('customJobOrg')?.value || '').trim();
    const post = (document.getElementById('customJobPost')?.value || '').trim() || title;
    const vacancies = (document.getElementById('customJobVacancies')?.value || '').trim() || 'Check Notification';
    const qual = (document.getElementById('customJobQual')?.value || '').trim() || 'Any Degree / Matric';
    const salary = (document.getElementById('customJobSalary')?.value || '').trim() || '₹21,700 - ₹69,100 (Level-3)';
    const startDate = (document.getElementById('customJobStartDate')?.value || '').trim() || new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const lastDate = (document.getElementById('customJobLastDate')?.value || '').trim();
    const applyUrl = (document.getElementById('customJobApplyUrl')?.value || '').trim() || 'https://www.freejobalert.com';
    const notifUrl = (document.getElementById('customJobNotifUrl')?.value || '').trim() || applyUrl;
    const category = document.getElementById('customJobCategory')?.value || 'Odisha Govt';
    const docsRaw = (document.getElementById('customJobDocs')?.value || '').trim();

    if (!title || !lastDate) {
      if (typeof showToast === 'function') {
        showToast("Kripya Job Title aur Last Date daalein!", "warning");
      }
      return;
    }

    let docs = [];
    if (docsRaw) {
      docs = docsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    } else {
      docs = [
        "10th Class Board Certificate & Marksheet",
        "+2 / Degree Certificate & Marksheet",
        "Aadhaar Card (Mobile Linked)",
        "Recent Passport Size Color Photo (White BG)",
        "Candidate Signature (Black Ink)",
        "Resident & Caste Certificate (if applicable)"
      ];
    }

    const newJob = {
      id: `custom-job-${Date.now()}`,
      title: title,
      titleOdia: title,
      organization: org || 'Government of Odisha / India',
      post: post,
      vacancies: vacancies,
      qualification: qual,
      salary: salary,
      startDate: startDate,
      lastDate: lastDate,
      category: category,
      status: 'Active',
      applyUrl: applyUrl,
      notificationUrl: notifUrl,
      officialUrl: applyUrl,
      source: 'Admin / VLE Added',
      documents: docs,
      featured: true,
      syncedAt: Date.now()
    };

    // Save to local storage
    try {
      let custom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
      custom.unshift(newJob);
      localStorage.setItem('vuo_custom_job_alerts', JSON.stringify(custom));
    } catch(e) {}

    // Send to server if available
    try {
      fetch('/api/save-job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      }).catch(() => {});
    } catch(e) {}

    this.jobs.unshift(newJob);
    this.renderStats();
    this.renderJobs();
    this.closeAddJobModal();

    if (typeof showToast === 'function') {
      showToast("✅ ନୂଆ ଚାକିରୀ ସୂଚନା ସଫଳତାର ସହିତ ଯୋଡ଼ାଗଲା!", "success");
    }
  }
};

window.VUO_JOB_ALERT = VUO_JOB_ALERT;

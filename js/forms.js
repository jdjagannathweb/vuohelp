
window.VUO_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1F7z-O5uxfMarZyJH8rsrEryuxVQEC6lX?usp=sharing";
window.VUO_DRIVE_FORMS_MAP = {
  "5-18.pdf": "13LMfLqFqRSzMTbQB3Y6Mt5BYaQHhBJLx",
  "18 +.pdf": "1IiscSfKD-uxjCV4JkAwtas8HryhFYO-W",
  "AC Open Form For BC BOI 2.pdf": "1fEdsMdYzL2axlvJUEVBI0hSJhTzlh1pC",
  "AC Open Form For BC BOI.pdf": "1trlqpueUK1efXhe9Pmy8LFemdNVrtgk8",
  "ANGANWADI 1.pdf": "1OV0kZf_nrJ_cpV4aeSx9mZOjn1aVKr8Z",
  "ANGANWADI 2.pdf": "1pQF7PVnfWF4PLfWRarTam4VH_VnBRPMd",
  "bhaga chasi.pdf": "18yfgLEtT-thH5WfikuVb7iUOrKD3kk6z",
  "Diclaration of sale vehicle.pdf": "1uvP5eGPQCBgDIvlfKK3HdOkmCxUNmr5m",
  "fasal bima.pdf": "1d25aOsyYBarYBNeeOa-IeK9Db9KIXSq7",
  "FORM LEBOUR CARD.pdf": "1EberSvR9Ya_ZGHwzO6-3VTpRnNeFSgnl",
  "Form15G.pdf": "1tg6nQdb7YWUPr_-datQm7ckNr_NFlWSQ",
  "Form121.pdf": "1O7fQ5StJK_O2VYT0QJ7kNB4Y5wVRUiNe",
  "hf based adress form.pdf": "1-gV0FWpzqjRUEGqk1i61nAPs8lHSefjG",
  "ligal hire form.pdf": "1yLHn9eXjP42gjTLrZZDRpSbmfW6f1i6m",
  "monthly form.pdf": "13GQ2MbVtQJaw9Rt4YMFA_MzZwMS5fXmS",
  "ri form bhata.pdf": "1gjOzoectJT9KFxVFqkrfw8ukOurZStJF",
  "SAHAMATI PATRA PADDY.pdf": "1ENdUnapJLC68-Dyu8-0sRu1hm4Ycp90q",
  "SELF DECLARATION FOR CEWS.pdf": "1FRwaHUVYBtoRbooA35SVsUyGwUpwCpQG",
  "SELF DECLARATION FOR ISSUE OF INCOME CERTIFICATE.pdf": "1ITQantiHaVjEleKDlQJ6P5LOg8VazYd3",
  "SELF DECLARATION FOR ISSUE OF O.B.C CERTIFICATE.pdf": "161cJdMVhBLrtbOdnqaAlJZAnW1KA_Wlo",
  "SELF DECLARATION FOR ISSUE OF RESIDENCE CERTIFICATE.pdf": "1g2CRDMnSVvWSt5v_aGdmASZ8Rd9oDHKg",
  "SELF DECLARATION FOR ISSUE OF S.C_S.T. CERTIFICATE.pdf": "1axwrRD9w9OJBPoT0oCYk1l9T1XJpZ00O",
  "SELF DECLARATION FOR ISSUE OF S.E.B.C CERTIFICATE.pdf": "1hv7XBOQoqBBJq5-wtbjTNySkJ4xSMP2f",
  "self genelogy PADDY.pdf": "1Bz3FwmBaiw36w4layvt8Fuk3kuaEft2r",
  "UIDAI Standard Form.pdf": "1OcLaulvpNz2VJZbtBSBnPUL9_uD5wppb"
};

window.vuoResolveDriveFormUrl = function(form) {
  if (!form) return form;
  if (form.downloadUrl && form.downloadUrl.startsWith('http') && form.previewUrl && form.previewUrl.startsWith('http')) {
    return form;
  }
  const raw = form.fileUrl || form.url || '';
  const fname = decodeURIComponent(raw.split('/').pop() || '').trim();
  if (window.VUO_DRIVE_FORMS_MAP && window.VUO_DRIVE_FORMS_MAP[fname]) {
    const fid = window.VUO_DRIVE_FORMS_MAP[fname];
    form.isDrive = true;
    form.storageType = 'google_drive';
    form.previewUrl = `https://drive.google.com/file/d/${fid}/preview`;
    form.downloadUrl = `https://drive.usercontent.google.com/download?id=${fid}&export=download`;
    form.fileUrl = `https://drive.google.com/file/d/${fid}/view?usp=sharing`;
  }
  return form;
};

/**
 * VUO CSC HELP - CSC Offline PDF Forms & Formats Hub
 * Allows VLEs to search, preview, and download official Odisha & Central application PDFs.
 * Supports:
 *  1. Google Drive / Cloud Direct PDF links (100% functional on Vercel & across all devices)
 *  2. IndexedDB High-Capacity Client-Side Storage for Direct PDF Uploads (Zero Quota Errors)
 *  3. Static official repository PDFs (/forms/*.pdf)
 */

// =================== 1. INDEXED-DB ENGINE FOR LARGE PDF STORAGE ===================
const VUO_IDB = {
  dbName: 'vuo_pdf_catalog_db',
  storeName: 'pdf_blobs',
  _dbPromise: null,

  getDB() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn("IndexedDB not available in this browser");
        return resolve(null);
      }
      try {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => {
          console.warn("IndexedDB open error:", e.target.error);
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB exception:", err);
        resolve(null);
      }
    });
    return this._dbPromise;
  },

  async savePdfBlob(id, blobOrDataUrl, fileName) {
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put({ id, data: blobOrDataUrl, fileName, savedAt: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn("savePdfBlob error:", e);
      return false;
    }
  },

  async getPdfBlob(id) {
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("getPdfBlob error:", e);
      return null;
    }
  },

  async deletePdfBlob(id) {
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
};
window.VUO_IDB = VUO_IDB;

// Helper: Parse Google Drive or Web PDF URL
function parseCloudPdfUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();
  if (!url) return null;

  // Auto prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Detect Google Drive sharing link formats (supports multi-account /u/0, open?id, uc?id, /d/ID, etc.)
  const driveMatch = url.match(/\/file(?:\/u\/\d+)?\/d\/([a-zA-Z0-9_-]+)/i) ||
                     url.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                     url.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      isDrive: true,
      fileId: fileId,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      directDownloadUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
      cleanUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
    };
  }

  // Standard web URL or relative path
  return {
    isDrive: false,
    previewUrl: url,
    downloadUrl: url,
    cleanUrl: url
  };
}
window.parseCloudPdfUrl = parseCloudPdfUrl;

// =================== 2. VUO_FORMS CONTROLLER ===================
const VUO_FORMS = {
  currentCategory: 'all',
  searchQuery: '',
  _initialized: false,

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    this.renderForms();
  },

  bindEvents() {
    // Category tabs
    document.querySelectorAll('.form-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.form-cat-btn').forEach(b => {
          b.className = 'form-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all';
        });
        const target = e.currentTarget;
        target.className = 'form-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 border border-sky-600 text-white shadow-sm transition-all';
        this.currentCategory = target.getAttribute('data-cat') || 'all';
        this.renderForms();
      });
    });

    // Search input
    const searchInput = document.getElementById('formsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderForms();
      });
    }

    window.addEventListener('languageChanged', () => {
      this.renderForms();
    });
  },

  getAllForms() {
    const defaultForms = (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.forms)) ? VUO_DATA.forms : [];
    try {
      const deletedIds = JSON.parse(localStorage.getItem('vuo_forms_deleted') || '[]');
      const stored = localStorage.getItem('vuo_forms');
      let customForms = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customForms = parsed.filter(f => f.isCustom);
        }
      }
      
      const formsMap = new Map();
      // 1. Put custom/admin added forms first so they appear at the top
      customForms.forEach(cf => {
        if (!deletedIds.includes(cf.id)) {
          formsMap.set(cf.id, cf);
        }
      });
      // 2. Append default catalog forms if not deleted and not overridden
      defaultForms.forEach(df => {
        if (!deletedIds.includes(df.id) && !formsMap.has(df.id)) {
          formsMap.set(df.id, df);
        }
      });
      
      const merged = Array.from(formsMap.values()).map(f => (typeof window.vuoResolveDriveFormUrl === 'function') ? window.vuoResolveDriveFormUrl(f) : f);
      return merged;
    } catch (e) {
      console.warn("getAllForms error:", e);
      return defaultForms;
    }
  },

  saveForms(formsList) {
    try {
      // Strip any huge base64 dataUrl before saving to localStorage to prevent QuotaExceededError
      const safeForms = formsList.map(f => {
        const copy = { ...f };
        if (copy.dataUrl && copy.dataUrl.length > 500) {
          copy.hasIndexedDbData = true;
          delete copy.dataUrl;
        }
        return copy;
      });
      localStorage.setItem('vuo_forms', JSON.stringify(safeForms));
      return true;
    } catch (e) {
      console.error("Error saving forms to localStorage:", e);
      return false;
    }
  },

  saveCustomForm(newForm) {
    try {
      let forms = this.getAllForms();
      forms = forms.filter(f => f.id !== newForm.id);
      forms.unshift(newForm);
      this.saveForms(forms);
      this.renderForms();
      return true;
    } catch (e) {
      console.error("Error saving custom form:", e);
      return false;
    }
  },

  deleteForm(id) {
    try {
      const deletedIds = JSON.parse(localStorage.getItem('vuo_forms_deleted') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('vuo_forms_deleted', JSON.stringify(deletedIds));
      }
      if (typeof VUO_IDB !== 'undefined') {
        VUO_IDB.deletePdfBlob(id);
      }
      const forms = this.getAllForms().filter(f => f.id !== id);
      this.saveForms(forms);
      this.renderForms();
      return true;
    } catch (e) {
      console.error("Error deleting form:", e);
      return false;
    }
  },

  toBlob(data) {
    if (data instanceof Blob) return data;
    if (typeof data !== 'string') return new Blob([], { type: 'application/pdf' });
    if (!data.includes(',')) return new Blob([data], { type: 'application/pdf' });
    try {
      const parts = data.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      return new Blob([], { type: 'application/pdf' });
    }
  },

  triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  },

  async handlePreview(id) {
    const forms = this.getAllForms();
    const f = forms.find(item => item.id === id);
    if (!f) return;

    // 1. If stored in IndexedDB
    if (f.storageType === 'indexeddb' || f.hasIndexedDbData) {
      try {
        const record = await VUO_IDB.getPdfBlob(id);
        if (record && record.data) {
          const blob = (record.data instanceof Blob) ? record.data : this.toBlob(record.data);
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
          return;
        }
      } catch (e) {
        console.warn("IDB preview error:", e);
      }
    }

    // 2. If Google Drive preview URL
    if (f.previewUrl) {
      window.open(f.previewUrl, '_blank');
      return;
    }

    // 3. If standard fileUrl or dataUrl
    const targetUrl = f.dataUrl || f.fileUrl;
    if (targetUrl) {
      if (targetUrl.startsWith('data:')) {
        const blob = this.toBlob(targetUrl);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(targetUrl, '_blank');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast("PDF document not accessible.", "warning");
      }
    }
  },

  async handleDownload(id) {
    const forms = this.getAllForms();
    const f = forms.find(item => item.id === id);
    if (!f) return;

    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({
        type: 'download',
        item: `PDF Form: ${f.title || 'CSC Application Form'}`,
        category: 'form'
      }, () => this._doDownloadForm(f));
    }
    this._doDownloadForm(f);
  },

  async _doDownloadForm(f) {
    const safeTitle = `${(f.title || 'csc-form').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    // 1. If stored in IndexedDB
    if (f.storageType === 'indexeddb' || f.hasIndexedDbData) {
      try {
        const record = await VUO_IDB.getPdfBlob(f.id);
        if (record && record.data) {
          const blob = (record.data instanceof Blob) ? record.data : this.toBlob(record.data);
          this.triggerDownload(blob, safeTitle);
          return;
        }
      } catch (e) {
        console.warn("IDB download error:", e);
      }
    }

    // 2. If Google Drive download URL
    if (f.downloadUrl && f.downloadUrl.startsWith('http')) {
      window.open(f.downloadUrl, '_blank');
      return;
    }

    // 3. If dataUrl
    if (f.dataUrl) {
      const blob = this.toBlob(f.dataUrl);
      this.triggerDownload(blob, safeTitle);
      return;
    }

    // 4. If standard fileUrl
    const fileUrl = f.fileUrl;
    if (fileUrl) {
      if (fileUrl.startsWith('http')) {
        window.open(fileUrl, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = safeTitle;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      if (typeof showToast === 'function') {
        showToast("Download file not found.", "warning");
      }
    }
  },

  renderForms() {
    const container = document.getElementById('formsGridContainer');
    const totalBadge = document.getElementById('formsTotalCount');
    const adminTotalBadge = document.getElementById('adminTotalFormsCount');
    let allForms = this.getAllForms();

    if (totalBadge) totalBadge.textContent = allForms.length;
    if (adminTotalBadge) adminTotalBadge.textContent = allForms.length;
    const totalTabBadge = document.getElementById('formsTotalTabCount');
    if (totalTabBadge) totalTabBadge.textContent = `${allForms.length}+`;

    if (!container) return;

    let forms = [...allForms];

    // Filter by Category with smart matching
    if (this.currentCategory !== 'all') {
      const cat = this.currentCategory;
      forms = forms.filter(f => {
        if (f.category === cat) return true;
        if (cat === 'edistrict' && (f.category === 'affidavits' || (f.tags && f.tags.some(t => /income|caste|residence|obc|district|tahasil/i.test(t))))) return true;
        if (cat === 'affidavits' && (f.category === 'edistrict' && f.title && f.title.toLowerCase().includes('declaration'))) return true;
        if (cat === 'banking' && (f.tags && f.tags.some(t => /15g|121|tds|bank|csp|boi/i.test(t)))) return true;
        return false;
      });
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      forms = forms.filter(f => 
        (f.title && f.title.toLowerCase().includes(q)) ||
        (f.titleOdia && f.titleOdia.toLowerCase().includes(q)) ||
        (f.desc && f.desc.toLowerCase().includes(q)) ||
        (f.categoryName && f.categoryName.toLowerCase().includes(q)) ||
        (f.fileUrl && f.fileUrl.toLowerCase().includes(q)) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (forms.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <i class="fa-solid fa-file-pdf text-4xl text-slate-300 mb-2"></i>
          <p class="font-bold text-slate-700">No application forms found matching "${this.searchQuery}".</p>
          <p class="text-xs text-slate-400 mt-1">Try searching for Form 121, Form 15G, Income, OBC, Caste, Subhadra, PAN, or Banking.</p>
        </div>
      `;
      return;
    }

    const currentLang = localStorage.getItem('vuo_lang') || 'en';

    container.innerHTML = forms.map(f => {
      const displayTitle = (currentLang === 'or' && f.titleOdia) ? f.titleOdia : f.title;
      const subTitle = (currentLang === 'or') ? f.title : (f.titleOdia || '');

      let catBadgeClass = 'bg-sky-100 text-sky-800 border-sky-200';
      if (f.category === 'subhadra') catBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      else if (f.category === 'pan_aadhaar') catBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
      else if (f.category === 'agriculture') catBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      else if (f.category === 'banking') catBadgeClass = 'bg-teal-100 text-teal-800 border-teal-200';
      else if (f.category === 'affidavits') catBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
      else if (f.category === 'general') catBadgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
      else if (f.category === 'food') catBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';

      const tagChips = (f.tags || []).slice(0, 3).map(t => 
        `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">#${t}</span>`
      ).join('');

      let storageBadge = '';
      if (f.isDrive || (f.fileUrl && f.fileUrl.includes('drive.google.com'))) {
        storageBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><i class="fa-brands fa-google-drive"></i> Cloud Link</span>`;
      } else if ((f.storageType && f.storageType.startsWith('cloud')) || (f.fileUrl && f.fileUrl.startsWith('http'))) {
        storageBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200"><i class="fa-solid fa-cloud"></i> 1-Click Cloud PDF</span>`;
      } else if (f.storageType === 'indexeddb' || f.hasIndexedDbData) {
        storageBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-laptop"></i> Uploaded PDF</span>`;
      }

      return `
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group hover:border-sky-400 relative overflow-hidden">
          <!-- Top Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500"></div>

          <div>
            <!-- Header Row -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${catBadgeClass}">
                  ${f.categoryName || 'CSC Form'}
                </span>
                ${f.isCustom ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">✨ NEW / ADMIN ADDED</span>` : ''}
                ${storageBadge}
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold shrink-0">
                <i class="fa-solid fa-file-pdf text-rose-500 mr-1"></i> ${f.size || 'PDF'}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors font-heading leading-snug">
              ${displayTitle}
            </h3>
            ${subTitle ? `<p class="text-[11px] text-slate-500 font-odia mt-0.5">${subTitle}</p>` : ''}

            <!-- Description -->
            <p class="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
              ${f.desc || 'Official application form and document checklist for Odisha citizen services.'}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mt-3">
              ${tagChips}
              ${f.pages ? `<span class="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">📑 ${f.pages}</span>` : ''}
            </div>
          </div>

          <!-- Actions: Preview & Download -->
          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
            <button type="button" onclick="VUO_FORMS.handlePreview('${f.id}')" 
               class="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-eye text-sky-600"></i>
              <span>Preview</span>
            </button>
            <button type="button" onclick="VUO_FORMS.handleDownload('${f.id}')" 
               class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 transform hover:scale-[1.02] cursor-pointer">
              <i class="fa-solid fa-download"></i>
              <span>Download</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.VUO_FORMS = VUO_FORMS;

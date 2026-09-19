/**
 * VUO CSC HELP - Administrator Panel
 * Member management, link updates, training video curation, announcements and support inbox
 */

const VUO_ADMIN = {
  activeTab: 'leads',

  init() {
    this.bindEvents();
    this.switchTab(this.activeTab || 'leads');
    this.renderAll();
  },

  bindEvents() {
    // Admin Tabs
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-admin-tab');
        this.switchTab(tab);
      });
    });

    // Add Link Form
    const addLinkForm = document.getElementById('adminAddLinkForm');
    if (addLinkForm) {
      addLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddLink();
      });
    }

    // Add CSC PDF Form
    const addFormForm = document.getElementById('adminAddPdfForm');
    if (addFormForm) {
      addFormForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddPdfForm();
      });
    }

    const urlInput = document.getElementById('adminFormUrl');
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        let val = e.target.value.trim();
        const driveIndicator = document.getElementById('adminFormDriveDetected');
        const titleInput = document.getElementById('adminFormTitle');
        const sizeInput = document.getElementById('adminFormSize');
        if (typeof parseCloudPdfUrl === 'function' && val) {
          const parsed = parseCloudPdfUrl(val);
          if (parsed && parsed.isDrive) {
            if (driveIndicator) {
              driveIndicator.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> <span>Google Drive Link Verified! (ID: ${parsed.fileId}) — Ready to publish</span>`;
              driveIndicator.classList.remove('hidden');
            }
            if (titleInput && (!titleInput.value || titleInput.value.startsWith('Form Title') || titleInput.value.startsWith('Auto-filled'))) {
              titleInput.value = "CSC Application Form";
            }
            if (sizeInput && !sizeInput.value) {
              sizeInput.value = "Official PDF / Cloud";
            }
          } else {
            if (driveIndicator) driveIndicator.classList.add('hidden');
          }
        } else if (driveIndicator) {
          driveIndicator.classList.add('hidden');
        }
      });
    }

    const formFileInput = document.getElementById('adminFormLocalFile');
    const formFileBox = document.getElementById('adminFormFileBox');

    const handleFileSelected = (file) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast("Kripya sirf valid PDF file select karein (.pdf)", "warning");
        return;
      }
      const sizeInput = document.getElementById('adminFormSize');
      const titleInput = document.getElementById('adminFormTitle');
      const fileNameEl = document.getElementById('adminFormSelectedFileName');
      const fileSizeEl = document.getElementById('adminFormSelectedFileSize');
      
      const kb = Math.round(file.size / 1024);
      const sizeStr = kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`;

      this._pendingPdfFile = file;
      this._pendingPdfFileName = file.name;

      if (sizeInput) {
        sizeInput.value = `${sizeStr} / A4 PDF`;
      }
      if (titleInput) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
      if (fileNameEl) {
        fileNameEl.innerHTML = `<span class="text-emerald-700 font-black flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> ${file.name}</span>`;
      }
      if (fileSizeEl) {
        fileSizeEl.innerHTML = `<span class="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">${sizeStr}</span> <span class="text-slate-600 font-semibold ml-1">File select ho chuki hai! Ab "Save & Publish" par click karein.</span>`;
      }
      showToast(`PDF select ho gayi: ${file.name} (${sizeStr})`, "success");
    };

    if (formFileInput) {
      formFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (formFileBox) {
      formFileBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        formFileBox.classList.add('border-rose-600', 'bg-rose-50');
      });
      formFileBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        formFileBox.classList.remove('border-rose-600', 'bg-rose-50');
      });
      formFileBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        formFileBox.classList.remove('border-rose-600', 'bg-rose-50');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    // Add Video Form
    const addVideoForm = document.getElementById('adminAddVideoForm');
    if (addVideoForm) {
      addVideoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddVideo();
      });
    }

    // Add Announcement Form
    const addAnnForm = document.getElementById('adminAddAnnForm');
    if (addAnnForm) {
      addAnnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddAnnouncement();
      });
    }

    // Change Password Form
    const changePassForm = document.getElementById('adminChangePasswordForm');
    if (changePassForm) {
      changePassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleChangePassword();
      });
    }

    // Firebase Config Form
    const fbForm = document.getElementById('adminFirebaseConfigForm');
    if (fbForm) {
      fbForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveFirebaseConfig();
      });
    }

    // Donation Form
    const donForm = document.getElementById('adminDonationForm');
    if (donForm) {
      donForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveDonationSettings();
      });
    }

    const donFile = document.getElementById('adminDonationQrFile');
    if (donFile) {
      donFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const preview = document.getElementById('adminDonationQrPreview');
            const urlInput = document.getElementById('adminDonationQrUrl');
            if (preview) preview.src = ev.target.result;
            if (urlInput) urlInput.value = ev.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    const donUrlInput = document.getElementById('adminDonationQrUrl');
    if (donUrlInput) {
      donUrlInput.addEventListener('input', (e) => {
        const preview = document.getElementById('adminDonationQrPreview');
        if (preview && e.target.value.trim()) {
          preview.src = e.target.value.trim();
        }
      });
    }

    // Popup Form
    const popForm = document.getElementById('adminPopupForm');
    if (popForm) {
      popForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSavePopupSettings();
      });
    }

    // Notice Poster File & Drag-and-Drop Handling
    const popFile = document.getElementById('adminPopupPosterFile');
    const popDropZone = document.getElementById('adminPopupFileDropZone');

    const handlePopupPhotoFile = async (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast("Kripya valid image file select karein (PNG, JPG, WebP)", "warning");
        return;
      }

      const statusEl = document.getElementById('adminPopupPhotoStatus');
      if (statusEl) {
        statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Optimizing photo to Full HD...`;
        statusEl.classList.remove('hidden');
      }

      try {
        const res = await this.compressNoticeImage(file);
        const preview = document.getElementById('adminPopupPosterPreview');
        const urlInput = document.getElementById('adminPopupPosterUrl');
        const zoomBtn = document.getElementById('adminPopupPreviewZoom');

        if (preview) {
          preview.src = res.dataUrl;
          preview.classList.remove('hidden');
        }
        if (urlInput) urlInput.value = res.dataUrl;
        if (zoomBtn) zoomBtn.href = res.dataUrl;

        this._pendingPopupImageBlob = res.dataUrl;

        if (statusEl) {
          statusEl.innerHTML = `<span class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> ${res.width}×${res.height} px HD Ready (${res.sizeKb} KB)</span>`;
          statusEl.classList.remove('hidden');
        }
        showToast(`Full photo optimized successfully (${res.width}×${res.height}px)!`, "success");
      } catch (err) {
        console.error("Notice photo processing error:", err);
        showToast("Error processing photo. Please try another image.", "error");
      }
    };

    if (popFile) {
      popFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handlePopupPhotoFile(e.target.files[0]);
        }
      });
    }

    if (popDropZone) {
      ['dragenter', 'dragover'].forEach(ev => {
        popDropZone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          popDropZone.classList.add('border-purple-600', 'bg-purple-100/60');
        });
      });

      ['dragleave', 'drop'].forEach(ev => {
        popDropZone.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          popDropZone.classList.remove('border-purple-600', 'bg-purple-100/60');
        });
      });

      popDropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handlePopupPhotoFile(e.dataTransfer.files[0]);
        }
      });
    }

    const popUrlInput = document.getElementById('adminPopupPosterUrl');
    if (popUrlInput) {
      popUrlInput.addEventListener('input', (e) => {
        const preview = document.getElementById('adminPopupPosterPreview');
        const zoomBtn = document.getElementById('adminPopupPreviewZoom');
        const val = e.target.value.trim();
        if (preview && val) {
          preview.src = val;
          preview.classList.remove('hidden');
          if (zoomBtn) zoomBtn.href = val;
        }
      });
    }

    // Leads Filter & Search
    const leadSearch = document.getElementById('adminLeadSearch');
    if (leadSearch) {
      leadSearch.addEventListener('input', () => this.renderLeadsTable());
    }

    const leadServiceFilter = document.getElementById('adminLeadServiceFilter');
    if (leadServiceFilter) {
      leadServiceFilter.addEventListener('change', () => this.renderLeadsTable());
    }

    const leadStatusFilter = document.getElementById('adminLeadStatusFilter');
    if (leadStatusFilter) {
      leadStatusFilter.addEventListener('change', () => this.renderLeadsTable());
    }

    const exportLeadsBtn = document.getElementById('adminExportLeadsBtn');
    if (exportLeadsBtn) {
      exportLeadsBtn.addEventListener('click', () => {
        if (typeof VUO_LEADS !== 'undefined') {
          VUO_LEADS.exportCsv();
        }
      });
    }

    // VLE Activity Tracker Filters
    const vleSearch = document.getElementById('adminVleSearch');
    if (vleSearch) {
      vleSearch.addEventListener('input', () => this.renderVleActivityTable());
    }

    const vleDist = document.getElementById('adminVleDistrictFilter');
    if (vleDist) {
      vleDist.addEventListener('change', () => this.renderVleActivityTable());
    }

    const vleType = document.getElementById('adminVleTypeFilter');
    if (vleType) {
      vleType.addEventListener('change', () => this.renderVleActivityTable());
    }

  },

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-admin-tab') === tabName) {
        btn.className = 'admin-nav-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-sky-600 text-white shadow-sm';
      } else {
        btn.className = 'admin-nav-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100';
      }
    });

    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      if (pane.id === `admin_pane_${tabName}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    this.renderAll();
  },

  renderAll() {
    try { this.renderLeadsTable(); } catch (e) { console.warn("renderLeadsTable error:", e); }
    try { this.renderLinksTable(); } catch (e) { console.warn("renderLinksTable error:", e); }
    try { this.renderFormsTable(); } catch (e) { console.warn("renderFormsTable error:", e); }
    try { this.renderVideosTable(); } catch (e) { console.warn("renderVideosTable error:", e); }
    try { this.renderAnnouncementsTable(); } catch (e) { console.warn("renderAnnouncementsTable error:", e); }
    try { this.renderSupportTickets(); } catch (e) { console.warn("renderSupportTickets error:", e); }
    try { this.renderDonationSettings(); } catch (e) { console.warn("renderDonationSettings error:", e); }
    try { this.renderPopupSettings(); } catch (e) { console.warn("renderPopupSettings error:", e); }
    try { this.renderSecurityInfo(); } catch (e) { console.warn("renderSecurityInfo error:", e); }
    try { this.renderFirebaseStatus(); } catch (e) { console.warn("renderFirebaseStatus error:", e); }
    try { this.renderVleActivityTable(); } catch (e) { console.warn("renderVleActivityTable error:", e); }
  },

  // ---------------- 1. IMPORTANT LINKS ---------------- //
  renderLinksTable() {
    const tbody = document.getElementById('adminLinksTbody');
    const countBadge = document.getElementById('adminTotalLinksCount');
    if (!tbody) return;
    const links = (typeof VUO_LINKS !== 'undefined') ? VUO_LINKS.getAllLinks() : [];
    if (countBadge) countBadge.textContent = links.length;

    if (links.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">No portal links found.</td></tr>`;
      return;
    }

    tbody.innerHTML = links.map(l => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs transition-colors">
        <td class="p-3 font-semibold text-slate-800">
          ${l.title}
          ${l.important ? '<span class="ml-1 text-amber-500 font-bold">★</span>' : ''}
        </td>
        <td class="p-3 text-slate-500 font-odia">${l.titleOdia || '—'}</td>
        <td class="p-3 font-mono text-[11px] text-sky-600 truncate max-w-[180px]"><a href="${l.url}" target="_blank" class="hover:underline">${l.url}</a></td>
        <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-[10px] border border-slate-200">${l.categoryName || l.category}</span></td>
        <td class="p-3 text-right">
          <button onclick="VUO_ADMIN.deleteLink('${l.id}')" class="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition-colors">
            <i class="fa-solid fa-trash-can mr-1"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  },

  // Helper: Extract Clean YouTube Video ID from any format
  extractYouTubeId(input) {
    if (!input) return '';
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/;
    const match = trimmed.match(regExp);
    if (match && match[1]) {
      return match[1];
    }
    if (trimmed.includes('youtu.be/')) {
      return trimmed.split('youtu.be/')[1].split('?')[0].split('&')[0];
    } else if (trimmed.includes('v=')) {
      return trimmed.split('v=')[1].split('&')[0].split('?')[0];
    }
    return trimmed;
  },

  handleAddLink() {
    const title = document.getElementById('adminLinkTitle').value.trim();
    const titleOdia = document.getElementById('adminLinkTitleOdia').value.trim();
    let url = document.getElementById('adminLinkUrl').value.trim();
    const category = document.getElementById('adminLinkCategory').value;
    const desc = document.getElementById('adminLinkDesc').value.trim();
    const important = document.getElementById('adminLinkImportant').checked;

    if (!title || !url) {
      showToast("Please fill in Portal Title and URL.", "warning");
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('#') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      url = 'https://' + url;
    }

    const catMap = {
      gov: "Odisha Govt",
      csc: "CSC Services",
      banking: "Banking & CSP",
      jobs: "Jobs & Recruitment",
      ai_tools: "AI Tools",
      citizen: "Citizen Utilities",
      vuo: "VUO CSC HELP"
    };

    const newLink = {
      id: `link-${Date.now()}`,
      title,
      titleOdia,
      url,
      category,
      categoryName: catMap[category] || "General",
      desc: desc || "Official portal service for CSC VLEs.",
      important: !!important,
      createdAt: Date.now()
    };

    if (typeof VUO_LINKS !== 'undefined') {
      VUO_LINKS.saveCustomLink(newLink);
    }
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudSaveLink(newLink);
    }
    document.getElementById('adminAddLinkForm').reset();
    this.renderLinksTable();
    if (typeof VUO_LINKS !== 'undefined') {
      VUO_LINKS.renderLinks();
    }
    showToast("New portal link saved and published live!", "success");
  },

  deleteLink(linkId) {
    if (!confirm("Are you sure you want to remove this portal link?")) return;
    if (typeof VUO_LINKS !== 'undefined') {
      VUO_LINKS.deleteLinkById(linkId);
    }
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudDeleteLink(linkId);
    }
    this.renderLinksTable();
    if (typeof VUO_LINKS !== 'undefined') {
      VUO_LINKS.renderLinks();
    }
    showToast("Portal link deleted.", "info");
  },

  // ---------------- 2.5. CSC PDF FORMS ---------------- //
  renderFormsTable() {
    const tbody = document.getElementById('adminFormsTbody');
    const countBadge = document.getElementById('adminTotalFormsCount');
    if (!tbody) return;
    const forms = (typeof VUO_FORMS !== 'undefined') ? VUO_FORMS.getAllForms() : [];
    if (countBadge) countBadge.textContent = forms.length;

    if (forms.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400 text-xs">No CSC application PDF forms in catalog yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = forms.map(f => {
      const isCustom = f.isCustom || !f.isOfficial;
      let displayUrl = f.fileUrl || 'Offline PDF';
      let typeBadge = '<span class="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">OFFICIAL</span>';
      if (isCustom) {
        if (f.isDrive || (f.fileUrl && f.fileUrl.includes('drive.google.com'))) {
          typeBadge = '<span class="ml-1.5 px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded text-[9px] font-black"><i class="fa-brands fa-google-drive"></i> DRIVE LINK</span>';
          displayUrl = 'Google Drive Cloud';
        } else if ((f.storageType && f.storageType.startsWith('cloud')) || (f.fileUrl && f.fileUrl.startsWith('http'))) {
          typeBadge = '<span class="ml-1.5 px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 rounded text-[9px] font-black"><i class="fa-solid fa-cloud"></i> CLOUD PDF</span>';
          displayUrl = 'Cloud Storage';
        } else if (f.storageType === 'indexeddb' || f.hasIndexedDbData) {
          typeBadge = '<span class="ml-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9px] font-black"><i class="fa-solid fa-laptop"></i> UPLOADED PDF</span>';
          displayUrl = 'IndexedDB Storage';
        } else {
          typeBadge = '<span class="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-black">ADMIN ADDED</span>';
        }
      }
      
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
          <td class="p-3 font-semibold text-slate-800">
            ${f.title}
            ${typeBadge}
          </td>
          <td class="p-3 text-slate-500 font-odia">${f.titleOdia || '-'}</td>
          <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px]">${f.categoryName || f.category}</span></td>
          <td class="p-3 font-mono text-[11px] text-sky-600 truncate max-w-[160px]">
            <span class="truncate block">${displayUrl}</span>
          </td>
          <td class="p-3 font-mono text-[10px] text-slate-500">${f.size || 'PDF'}</td>
          <td class="p-3 text-right whitespace-nowrap">
            <button type="button" onclick="VUO_FORMS.handlePreview('${f.id}')" class="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold mr-1 text-[11px] inline-flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-eye text-sky-600"></i> Preview
            </button>
            <button type="button" onclick="VUO_ADMIN.deletePdfForm('${f.id}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  setFormUploadMode(mode) {
    this._formUploadMode = mode;
    const urlBtn = document.getElementById('adminFormModeUrlBtn');
    const fileBtn = document.getElementById('adminFormModeFileBtn');
    const urlBox = document.getElementById('adminFormUrlBox');
    const fileBox = document.getElementById('adminFormFileBox');

    if (mode === 'url') {
      if (urlBtn) urlBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-black transition-all bg-white text-rose-700 shadow-sm border border-slate-200 cursor-pointer';
      if (fileBtn) fileBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
      if (urlBox) urlBox.classList.remove('hidden');
      if (fileBox) fileBox.classList.add('hidden');
    } else {
      if (fileBtn) fileBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-black transition-all bg-white text-rose-700 shadow-sm border border-slate-200 cursor-pointer';
      if (urlBtn) urlBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
      if (fileBox) fileBox.classList.remove('hidden');
      if (urlBox) urlBox.classList.add('hidden');
    }
  },

  testFormUrl() {
    const urlInput = document.getElementById('adminFormUrl');
    let raw = urlInput ? urlInput.value.trim() : '';
    if (!raw) {
      showToast("Pehle Google Drive ya PDF link paste karein test karne ke liye.", "warning");
      if (urlInput) urlInput.focus();
      return;
    }
    if (!/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
      if (urlInput) urlInput.value = raw;
    }
    const parsed = (typeof parseCloudPdfUrl === 'function') ? parseCloudPdfUrl(raw) : null;
    const target = (parsed && parsed.previewUrl) ? parsed.previewUrl : raw;
    window.open(target, '_blank');
    showToast("Link test ke liye naye tab me kholi ja rahi hai...", "info");
  },

  async handleAddPdfForm() {
    const titleInput = document.getElementById('adminFormTitle');
    let title = titleInput ? titleInput.value.trim() : '';
    const titleOdia = document.getElementById('adminFormTitleOdia').value.trim();
    const category = document.getElementById('adminFormCategory').value;
    const size = document.getElementById('adminFormSize').value.trim() || 'Official PDF';
    const desc = document.getElementById('adminFormDesc').value.trim();
    const urlInput = document.getElementById('adminFormUrl');
    let rawUrl = urlInput ? urlInput.value.trim() : '';
    const fileInput = document.getElementById('adminFormLocalFile');
    const selectedFile = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : this._pendingPdfFile;

    // Detect mode reliably
    const mode = this._formUploadMode || (selectedFile ? 'file' : 'url');

    let fileUrl = '';
    let previewUrl = '';
    let downloadUrl = '';
    let isDrive = false;
    let storageType = 'cloud_url';
    const formId = `form-custom-${Date.now()}`;

    if (mode === 'url') {
      if (!rawUrl) {
        showToast("Please paste a Google Drive link or Web PDF URL, or switch to Direct File Upload tab.", "warning");
        if (urlInput) urlInput.focus();
        return;
      }
      // Auto prepend https:// if missing
      if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = 'https://' + rawUrl;
        if (urlInput) urlInput.value = rawUrl;
      }
      const parsed = (typeof parseCloudPdfUrl === 'function') ? parseCloudPdfUrl(rawUrl) : { isDrive: false, previewUrl: rawUrl, downloadUrl: rawUrl, cleanUrl: rawUrl };
      fileUrl = parsed.cleanUrl;
      previewUrl = parsed.previewUrl;
      downloadUrl = parsed.downloadUrl;
      isDrive = parsed.isDrive;
      storageType = isDrive ? 'google_drive' : 'web_url';

      if (!title) {
        title = "CSC Application Form";
        if (titleInput) titleInput.value = title;
      }
    } else {
      // Local File upload mode (IndexedDB + 1-Click Cloud Upload)
      if (!selectedFile) {
        showToast("Please select a PDF file from your device.", "warning");
        return;
      }
      if (!title) {
        title = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        title = title.charAt(0).toUpperCase() + title.slice(1);
        if (titleInput) titleInput.value = title;
      }
      storageType = 'indexeddb';

      // 1. Immediate In-Browser Offline Backup via IndexedDB
      if (typeof VUO_IDB !== 'undefined') {
        try {
          await VUO_IDB.savePdfBlob(formId, selectedFile, selectedFile.name);
        } catch (idbErr) {
          console.warn("IDB save error:", idbErr);
        }
      }

      // 2. Direct 1-Click Cloud Upload for Global Vercel Access
      const progressBox = document.getElementById('adminFormUploadProgress');
      const progressText = document.getElementById('adminFormProgressText');
      const progressPercent = document.getElementById('adminFormProgressPercent');
      const progressBar = document.getElementById('adminFormProgressBar');

      if (typeof VUO_CLOUD_STORAGE !== 'undefined') {
        try {
          if (progressBox) progressBox.classList.remove('hidden');
          if (progressBar) progressBar.style.width = '30%';
          if (progressPercent) progressPercent.textContent = '30%';
          if (progressText) progressText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Cloud storage connecting...`;
          showToast("PDF ko cloud storage me upload kiya ja raha hai...", "info");

          const cloudRes = await VUO_CLOUD_STORAGE.uploadPdf(selectedFile, (msg) => {
            if (progressText) progressText.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> ${msg}`;
            if (progressBar) progressBar.style.width = '70%';
            if (progressPercent) progressPercent.textContent = '70%';
            showToast(msg, "info");
          });

          if (cloudRes && cloudRes.url && cloudRes.url.startsWith('http')) {
            fileUrl = cloudRes.url;
            downloadUrl = cloudRes.downloadUrl || cloudRes.url;
            previewUrl = cloudRes.previewUrl || cloudRes.url;
            storageType = cloudRes.provider || 'cloud_pdf';
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            if (progressText) progressText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Cloud Upload Success!`;
          }
        } catch (cloudErr) {
          console.warn("Cloud upload attempt finished:", cloudErr);
        } finally {
          setTimeout(() => {
            if (progressBox) progressBox.classList.add('hidden');
          }, 1500);
        }
      }

      if (!fileUrl) {
        fileUrl = `forms/${selectedFile.name}`;
      }

      // 3. Local server background write if available
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            await fetch('/api/upload-form', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: selectedFile.name, base64Data: e.target.result })
            });
          } catch (_) {}
        };
        reader.readAsDataURL(selectedFile);
      } catch (_) {}
    }

    const categoryNames = {
      subhadra: "Subhadra Yojana",
      edistrict: "e-District & Revenue",
      pan_aadhaar: "PAN & Aadhaar",
      agriculture: "Agriculture & PM Kisan",
      banking: "Banking & CSP",
      affidavits: "Affidavits & Formats",
      food: "Ration & Food Security",
      general: "Labour & General CSC"
    };

    const newForm = {
      id: formId,
      title,
      titleOdia: titleOdia || '',
      category,
      categoryName: categoryNames[category] || "CSC Form",
      fileUrl,
      previewUrl,
      downloadUrl,
      isDrive,
      storageType,
      hasIndexedDbData: (storageType === 'indexeddb'),
      size,
      pages: "A4 Format",
      desc: desc || "Official offline application format for Odisha VLEs and citizens.",
      tags: [category, "CSC", "Offline PDF"],
      isOfficial: false,
      isCustom: true,
      createdAt: Date.now()
    };

    let forms = (typeof VUO_FORMS !== 'undefined') ? VUO_FORMS.getAllForms() : [];
    forms = forms.filter(f => f.id !== newForm.id);
    forms.unshift(newForm);
    if (typeof VUO_FORMS !== 'undefined') {
      VUO_FORMS.saveForms(forms);
      VUO_FORMS.renderForms();
    }
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized) {
      VUO_DB.cloudSaveForm(newForm);
    }

    this._pendingPdfFile = null;
    this._pendingPdfFileName = null;
    document.getElementById('adminAddPdfForm').reset();
    const fileNameEl = document.getElementById('adminFormSelectedFileName');
    const fileSizeEl = document.getElementById('adminFormSelectedFileSize');
    const driveIndicator = document.getElementById('adminFormDriveDetected');
    if (fileNameEl) fileNameEl.textContent = "Click to Choose PDF or Drag & Drop Here";
    if (fileSizeEl) fileSizeEl.innerHTML = `<span class="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><i class="fa-solid fa-cloud"></i> Firebase Cloud + IndexedDB Sync</span> <span class="ml-1 text-[11px] text-slate-400 font-medium">Supports all devices & sizes</span>`;
    if (driveIndicator) driveIndicator.classList.add('hidden');

    this.renderFormsTable();
    showToast(`"${title}" published to Forms Catalog!`, "success");
  },

  deletePdfForm(id) {
    if (!confirm("Are you sure you want to delete this form?")) return;
    if (typeof VUO_FORMS !== 'undefined') {
      VUO_FORMS.deleteForm(id);
    }
    if (typeof VUO_IDB !== 'undefined') {
      VUO_IDB.deletePdfBlob(id);
    }
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized) {
      VUO_DB.cloudDeleteForm(id);
    }
    this.renderFormsTable();
    showToast("Form removed from catalog.", "info");
  },

  // ---------------- 3. TRAINING VIDEOS ---------------- //
  renderVideosTable() {
    const tbody = document.getElementById('adminVideosTbody');
    if (!tbody) return;
    const videos = VUO_TRAINING.getAllVideos();

    if (videos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400 text-xs">No training tutorials added yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = videos.map(v => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 font-semibold text-slate-800">${v.title}</td>
        <td class="p-3"><span class="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-semibold text-[10px]">${v.category}</span></td>
        <td class="p-3 font-mono text-[11px] text-sky-700">
          <a href="https://www.youtube.com/watch?v=${v.youtubeId}" target="_blank" class="hover:underline flex items-center gap-1">
            <i class="fa-brands fa-youtube text-rose-600"></i> ${v.youtubeId}
          </a>
        </td>
        <td class="p-3 text-right">
          <button onclick="VUO_ADMIN.deleteVideo('${v.id}')" class="text-rose-500 hover:text-rose-700 font-bold text-[11px]">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  },

  handleAddVideo() {
    const title = document.getElementById('adminVideoTitle').value.trim();
    const titleOdia = document.getElementById('adminVideoTitleOdia').value.trim();
    const youtubeInput = document.getElementById('adminVideoUrl').value.trim();
    const category = document.getElementById('adminVideoCategory').value;
    const desc = document.getElementById('adminVideoDesc').value.trim();

    if (!title || !youtubeInput) {
      showToast("Please fill in Video Title and YouTube Link or ID.", "warning");
      return;
    }

    const ytId = this.extractYouTubeId(youtubeInput);
    if (!ytId) {
      showToast("Could not extract a valid YouTube video ID.", "error");
      return;
    }

    const videos = VUO_TRAINING.getAllVideos();
    const newVideo = {
      id: `tr-${Date.now()}`,
      title,
      titleOdia,
      category,
      youtubeId: ytId,
      desc: desc || "CSC VLE practical step-by-step training tutorial.",
      duration: "10:00 min",
      views: "1.0K",
      isCustom: true,
      createdAt: Date.now()
    };

    videos.unshift(newVideo);
    VUO_TRAINING.saveVideos(videos);
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudSaveVideo(newVideo);
    }
    document.getElementById('adminAddVideoForm').reset();
    this.renderVideosTable();
    VUO_TRAINING.renderVideos();
    showToast("Training video tutorial added and published live!", "success");
  },

  deleteVideo(vidId) {
    if (!confirm("Are you sure you want to remove this training video?")) return;
    if (typeof VUO_TRAINING !== 'undefined' && VUO_TRAINING.deleteVideo) {
      VUO_TRAINING.deleteVideo(vidId);
    } else {
      let videos = (typeof VUO_TRAINING !== 'undefined') ? VUO_TRAINING.getAllVideos() : [];
      videos = videos.filter(v => v.id !== vidId && v.youtubeId !== vidId);
      if (typeof VUO_TRAINING !== 'undefined') VUO_TRAINING.saveVideos(videos);
    }
    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudDeleteVideo) {
      VUO_DB.cloudDeleteVideo(vidId);
    }
    this.renderVideosTable();
    if (typeof VUO_TRAINING !== 'undefined') {
      VUO_TRAINING.renderVideos();
    }
    showToast("Training video deleted.", "info");
  },

  // ---------------- 4. ANNOUNCEMENTS ---------------- //
  renderAnnouncementsTable() {
    const tbody = document.getElementById('adminAnnTbody');
    if (!tbody) return;
    const anns = JSON.parse(localStorage.getItem('vuo_announcements') || '[]');

    tbody.innerHTML = anns.map(a => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 text-slate-800">${a.text}</td>
        <td class="p-3 text-slate-600 font-odia">${a.textOdia || '-'}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.urgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
            ${a.urgent ? 'Urgent' : 'Normal'}
          </span>
        </td>
        <td class="p-3 text-right">
          <button onclick="VUO_ADMIN.deleteAnnouncement('${a.id}')" class="text-rose-500 hover:text-rose-700 font-bold text-[11px]">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  },

  handleAddAnnouncement() {
    const text = document.getElementById('adminAnnText').value.trim();
    const textOdia = document.getElementById('adminAnnTextOdia').value.trim();
    const urgent = document.getElementById('adminAnnUrgent').checked;

    if (!text) {
      showToast("Please enter announcement text.", "warning");
      return;
    }

    const anns = JSON.parse(localStorage.getItem('vuo_announcements') || '[]');
    const newAnn = {
      id: `ann-${Date.now()}`,
      text,
      textOdia,
      date: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      urgent
    };

    anns.unshift(newAnn);
    localStorage.setItem('vuo_announcements', JSON.stringify(anns));
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudSaveAnnouncement(newAnn);
    }
    document.getElementById('adminAddAnnForm').reset();
    this.renderAnnouncementsTable();
    renderAnnouncementsTicker();
    showToast("Announcement published live!", "success");
  },

  deleteAnnouncement(annId) {
    let anns = JSON.parse(localStorage.getItem('vuo_announcements') || '[]');
    anns = anns.filter(a => a.id !== annId);
    localStorage.setItem('vuo_announcements', JSON.stringify(anns));
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudDeleteAnnouncement(annId);
    }
    this.renderAnnouncementsTable();
    renderAnnouncementsTicker();
    showToast("Announcement removed.", "info");
  },

  // ---------------- 5. SUPPORT TICKETS INBOX ---------------- //
  renderSupportTickets() {
    const tbody = document.getElementById('adminTicketsTbody');
    if (!tbody) return;
    const tickets = JSON.parse(localStorage.getItem('vuo_tickets') || '[]');

    if (tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 text-xs">No support inquiries received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map((t, idx) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 font-mono font-bold text-sky-700">${t.ticketId || t.id || ('TKT-' + (idx + 1))}</td>
        <td class="p-3 font-semibold text-slate-800">${t.name} <span class="text-slate-400 font-normal">(${t.mobile})</span></td>
        <td class="p-3 font-semibold text-slate-700">${t.subject}</td>
        <td class="p-3 text-slate-600 max-w-[200px] truncate">${t.message}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded font-bold text-[10px] ${t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${t.status || 'Pending'}
          </span>
        </td>
        <td class="p-3 text-right whitespace-nowrap">
          <button onclick="VUO_ADMIN.toggleTicketStatus(${idx})" class="text-sky-600 hover:text-sky-800 font-bold text-[11px] mr-2">
            ${t.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}
          </button>
          <button onclick="VUO_ADMIN.deleteTicket('${t.ticketId || t.id || idx}')" class="text-rose-500 hover:text-rose-700 font-bold text-[11px] hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors" title="Delete Ticket">
            <i class="fa-solid fa-trash-can mr-0.5"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  },

  deleteTicket(identifier) {
    if (!confirm("Are you sure you want to delete this support ticket?")) return;
    let tickets = JSON.parse(localStorage.getItem('vuo_tickets') || '[]');
    tickets = tickets.filter((t, idx) => {
      return t.ticketId !== identifier && t.id !== identifier && String(idx) !== String(identifier);
    });
    localStorage.setItem('vuo_tickets', JSON.stringify(tickets));
    this.renderSupportTickets();
    showToast("Support ticket deleted.", "info");
  },

  toggleTicketStatus(idx) {
    const tickets = JSON.parse(localStorage.getItem('vuo_tickets') || '[]');
    if (tickets[idx]) {
      tickets[idx].status = tickets[idx].status === 'Resolved' ? 'Pending' : 'Resolved';
      localStorage.setItem('vuo_tickets', JSON.stringify(tickets));
      this.renderSupportTickets();
      showToast("Updated ticket status.", "info");
    }
  },

  // ---------------- 6. DONATION & BARCODE/QR MANAGEMENT ---------------- //
  renderDonationSettings() {
    const don = JSON.parse(localStorage.getItem('vuo_donation') || JSON.stringify(VUO_DATA.donationSettings));
    if (!don) return;

    if (document.getElementById('adminDonationUpiId')) document.getElementById('adminDonationUpiId').value = don.upiId || '';
    if (document.getElementById('adminDonationPayeeName')) document.getElementById('adminDonationPayeeName').value = don.payeeName || '';
    if (document.getElementById('adminDonationBankName')) document.getElementById('adminDonationBankName').value = don.bankName || '';
    if (document.getElementById('adminDonationAccountNo')) document.getElementById('adminDonationAccountNo').value = don.accountNumber || '';
    if (document.getElementById('adminDonationIfsc')) document.getElementById('adminDonationIfsc').value = don.ifscCode || '';
    if (document.getElementById('adminDonationNote')) document.getElementById('adminDonationNote').value = don.note || '';
    if (document.getElementById('adminDonationQrUrl')) document.getElementById('adminDonationQrUrl').value = don.qrImageUrl || '';
    if (document.getElementById('adminDonationQrPreview')) {
      document.getElementById('adminDonationQrPreview').src = don.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(don.upiId || '9937037131@ybl')}`;
    }
  },

  handleSaveDonationSettings() {
    const upiId = document.getElementById('adminDonationUpiId').value.trim();
    const payeeName = document.getElementById('adminDonationPayeeName').value.trim();
    const bankName = document.getElementById('adminDonationBankName').value.trim();
    const accountNumber = document.getElementById('adminDonationAccountNo').value.trim();
    const ifscCode = document.getElementById('adminDonationIfsc').value.trim();
    const note = document.getElementById('adminDonationNote').value.trim();
    let qrImageUrl = document.getElementById('adminDonationQrUrl').value.trim();

    if (!upiId || !payeeName) {
      showToast("Please enter UPI ID and Payee Name.", "warning");
      return;
    }

    if (!qrImageUrl) {
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId)}%26pn%3D${encodeURIComponent(payeeName)}%26cu%3DINR`;
    }

    const donationObj = {
      upiId,
      payeeName,
      bankName,
      accountNumber,
      ifscCode,
      note,
      qrImageUrl
    };

    localStorage.setItem('vuo_donation', JSON.stringify(donationObj));

    // Update modal in DOM if open
    if (document.getElementById('donateUpiId')) document.getElementById('donateUpiId').textContent = upiId;
    if (document.getElementById('donatePayeeName')) document.getElementById('donatePayeeName').textContent = payeeName;
    if (document.getElementById('donateBankName')) document.getElementById('donateBankName').textContent = bankName;
    if (document.getElementById('donateAccountNumber')) document.getElementById('donateAccountNumber').textContent = accountNumber;
    if (document.getElementById('donateIfsc')) document.getElementById('donateIfsc').textContent = ifscCode;
    if (document.getElementById('donateQrImage')) document.getElementById('donateQrImage').src = qrImageUrl;

    this.renderDonationSettings();
    showToast("Donation & Barcode/QR settings saved successfully!", "success");
  },

  // ---------------- 7. FULL HD WELCOME POPUP & NOTICE MANAGEMENT ---------------- //
  compressNoticeImage(file, maxDimension = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("No file provided"));
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKb = Math.round(dataUrl.length * 0.75 / 1024);
          resolve({
            dataUrl,
            width,
            height,
            sizeKb,
            originalKb: Math.round(file.size / 1024)
          });
        };
        img.onerror = () => reject(new Error("Invalid image format"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  },

  clearPopupImage() {
    const preview = document.getElementById('adminPopupPosterPreview');
    const urlInput = document.getElementById('adminPopupPosterUrl');
    const fileInput = document.getElementById('adminPopupPosterFile');
    const statusEl = document.getElementById('adminPopupPhotoStatus');
    const zoomBtn = document.getElementById('adminPopupPreviewZoom');

    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (zoomBtn) zoomBtn.href = '#';
    if (statusEl) {
      statusEl.innerHTML = `<span class="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block text-[11px] font-semibold"><i class="fa-solid fa-info-circle mr-1"></i> Photo removed. Notice will display as text-only.</span>`;
      statusEl.classList.remove('hidden');
    }
    this._pendingPopupImageBlob = '';
    showToast("Notice photo removed. Click 'Save Popup Settings' to publish changes.", "info");
  },

  renderPopupSettings() {
    const pop = JSON.parse(localStorage.getItem('vuo_popup') || JSON.stringify(VUO_DATA.popupSettings || {}));
    if (!pop) return;

    if (document.getElementById('adminPopupEnabled')) document.getElementById('adminPopupEnabled').checked = pop.enabled !== false;
    if (document.getElementById('adminPopupBadgeText')) document.getElementById('adminPopupBadgeText').value = pop.badgeText || '📢 OFFICIAL NOTIFICATION';
    if (document.getElementById('adminPopupTitle')) document.getElementById('adminPopupTitle').value = pop.title || '';
    if (document.getElementById('adminPopupHeadline')) document.getElementById('adminPopupHeadline').value = pop.headline || '';
    if (document.getElementById('adminPopupMessage')) document.getElementById('adminPopupMessage').value = pop.message || '';
    if (document.getElementById('adminPopupButtonText')) document.getElementById('adminPopupButtonText').value = pop.buttonText || '';
    if (document.getElementById('adminPopupButtonLink')) document.getElementById('adminPopupButtonLink').value = pop.buttonLink || '#passphoto';
    if (document.getElementById('adminPopupPosterUrl')) document.getElementById('adminPopupPosterUrl').value = pop.imageUrl || '';
    
    const preview = document.getElementById('adminPopupPosterPreview');
    const zoomBtn = document.getElementById('adminPopupPreviewZoom');

    if (preview) {
      if (pop.imageUrl && pop.imageUrl.trim()) {
        preview.src = pop.imageUrl;
        preview.classList.remove('hidden');
        if (zoomBtn) zoomBtn.href = pop.imageUrl;
      } else {
        preview.src = '';
        preview.classList.add('hidden');
        if (zoomBtn) zoomBtn.href = '#';
      }
    }
  },

  async handleSavePopupSettings() {
    const enabled = document.getElementById('adminPopupEnabled') ? document.getElementById('adminPopupEnabled').checked : true;
    const badgeText = document.getElementById('adminPopupBadgeText') ? document.getElementById('adminPopupBadgeText').value.trim() : '📢 OFFICIAL NOTIFICATION';
    let title = document.getElementById('adminPopupTitle') ? document.getElementById('adminPopupTitle').value.trim() : '';
    const headline = document.getElementById('adminPopupHeadline') ? document.getElementById('adminPopupHeadline').value.trim() : '';
    const message = document.getElementById('adminPopupMessage') ? document.getElementById('adminPopupMessage').value.trim() : '';
    const buttonText = document.getElementById('adminPopupButtonText') ? document.getElementById('adminPopupButtonText').value.trim() : '';
    const buttonLink = document.getElementById('adminPopupButtonLink') ? document.getElementById('adminPopupButtonLink').value.trim() : '#passphoto';
    let imageUrl = document.getElementById('adminPopupPosterUrl') ? document.getElementById('adminPopupPosterUrl').value.trim() : '';

    // If title is blank, provide a sensible default so save is never blocked
    if (!title) {
      title = imageUrl ? "Official Notice / ଅଫିସିଆଲ୍ ନୋଟିସ୍" : "Official Digital Updates — VLE HELP DESK";
      const titleInput = document.getElementById('adminPopupTitle');
      if (titleInput) titleInput.value = title;
    }

    const popupObj = {
      enabled,
      badgeText: badgeText || '📢 OFFICIAL NOTIFICATION',
      title,
      headline,
      message,
      buttonText,
      buttonLink,
      imageUrl,
      updatedAt: new Date().toLocaleString(),
      updatedAtTimestamp: Date.now()
    };

    // 1. Channel A: Save to Local Storage & IndexedDB (Immediate local responsiveness)
    try {
      localStorage.setItem('vuo_popup', JSON.stringify(popupObj));
    } catch (e) {
      console.warn("localStorage quota exceeded, storing in IndexedDB:", e);
    }
    if (window.VUO_IDB && typeof window.VUO_IDB.savePdfBlob === 'function') {
      window.VUO_IDB.savePdfBlob('vuo_popup_settings', popupObj, 'vuo_popup_settings');
    }

    // 2. Channel B: Save to Local HTTP Server (For LAN / Localhost multi-device viewing)
    if (window.location.protocol.startsWith('http')) {
      try {
        const payload = {
          settings: popupObj,
          imageBase64: (imageUrl && imageUrl.startsWith('data:image')) ? imageUrl : null
        };
        const srvRes = await fetch('api/save-popup-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (srvRes.ok) {
          const srvJson = await srvRes.json();
          if (srvJson && srvJson.settings && srvJson.settings.imageUrl) {
            console.log("💾 Notice saved to server file storage:", srvJson.settings.imageUrl);
          }
        }
      } catch (err) {
        console.warn("Local server save notice (offline or static mode):", err);
      }
    }

    // 3. Channel C: Publish to Firebase Cloud Firestore (For global internet multi-computer & mobile visitors)
    let cloudSynced = false;
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized) {
      try {
        const cloudRes = await VUO_DB.cloudSavePopup(popupObj);
        if (cloudRes && cloudRes.success) {
          cloudSynced = true;
        }
      } catch (err) {
        console.warn("Cloud Firestore publish warning:", err);
      }
    }

    // Update live DOM modal elements immediately
    if (document.getElementById('welcomePopupBadge')) {
      document.getElementById('welcomePopupBadge').innerHTML = `<i class="fa-solid fa-bullhorn text-xs"></i> <span>${badgeText || '📢 OFFICIAL NOTIFICATION'}</span>`;
    }
    if (document.getElementById('welcomePopupTitle')) {
      document.getElementById('welcomePopupTitle').textContent = title;
    }
    if (document.getElementById('welcomePopupHeadline')) {
      const hEl = document.getElementById('welcomePopupHeadline');
      if (headline) {
        hEl.textContent = headline;
        hEl.classList.remove('hidden');
      } else {
        hEl.classList.add('hidden');
      }
    }
    if (document.getElementById('welcomePopupMessage')) {
      const mEl = document.getElementById('welcomePopupMessage');
      mEl.textContent = message;
      mEl.style.whiteSpace = 'pre-line';
    }

    const imgEl = document.getElementById('welcomePopupImage');
    const imgWrapper = document.getElementById('welcomePopupImageWrapper');
    const imgZoom = document.getElementById('welcomePopupImageZoom');

    if (imageUrl && imageUrl.trim()) {
      if (imgEl) {
        imgEl.src = imageUrl;
        imgEl.classList.remove('hidden');
      }
      if (imgWrapper) imgWrapper.classList.remove('hidden');
      if (imgZoom) imgZoom.href = imageUrl;
    } else {
      if (imgWrapper) imgWrapper.classList.add('hidden');
    }

    const btnEl = document.getElementById('welcomePopupActionBtn');
    if (btnEl) {
      if (buttonText) {
        btnEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${buttonText}</span>`;
        btnEl.href = buttonLink || '#passphoto';
        btnEl.classList.remove('hidden');
      } else {
        btnEl.classList.add('hidden');
      }
    }

    this.renderPopupSettings();
    if (cloudSynced) {
      showToast("Notice & Full HD Photo published to Cloud & all devices successfully!", "success");
    } else {
      showToast("Notice & Photo saved successfully! Live preview updated.", "success");
    }
  },

  // ---------------- 8. SECURITY & PASSWORD ---------------- //
  renderSecurityInfo() {
    const updatedEl = document.getElementById('adminPassLastUpdated');
    if (updatedEl) {
      const lastUpdated = localStorage.getItem('vuo_admin_password_updated') || 'Default setup';
      updatedEl.textContent = lastUpdated;
    }
  },

  handleChangePassword() {
    const currPass = document.getElementById('adminCurrentPassword').value;
    const newPass = document.getElementById('adminNewPassword').value;
    const confirmPass = document.getElementById('adminConfirmPassword').value;

    if (!currPass || !newPass || !confirmPass) {
      showToast("Please fill in all password fields.", "warning");
      return;
    }

    if (newPass !== confirmPass) {
      showToast("New passwords do not match! Please check.", "error");
      return;
    }

    if (newPass.length < 4) {
      showToast("New password must be at least 4 characters.", "warning");
      return;
    }

    const res = VUO_AUTH.updateAdminPassword(currPass, newPass);
    if (res.success) {
      document.getElementById('adminChangePasswordForm').reset();
      this.renderSecurityInfo();
      showToast(res.message, "success");
    } else {
      showToast(res.message, "error");
    }
  },

  // ---------------- 7. FIREBASE CLOUD SYNC ---------------- //
  renderFirebaseStatus() {
    const card = document.getElementById('firebaseStatusCard');
    const dot = document.getElementById('firebaseStatusDot');
    const title = document.getElementById('firebaseStatusTitle');
    const desc = document.getElementById('firebaseStatusDesc');

    if (!card || !title) return;

    // Pre-fill inputs if saved
    if (typeof VUO_DB !== 'undefined') {
      const cfg = VUO_DB.getSavedConfig();
      if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = cfg.apiKey || '';
      if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = cfg.projectId || '';
      if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = cfg.authDomain || '';
      if (document.getElementById('fbStorageBucket')) document.getElementById('fbStorageBucket').value = cfg.storageBucket || '';
      if (document.getElementById('fbMessagingSenderId')) document.getElementById('fbMessagingSenderId').value = cfg.messagingSenderId || '';
      if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = cfg.appId || '';

      if (VUO_DB.isInitialized) {
        card.className = "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/80 border-emerald-200 text-emerald-950";
        dot.className = "w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm";
        title.textContent = `🟢 Connected to Firebase Cloud (${cfg.projectId})`;
        desc.textContent = "Real-time synchronization is ACTIVE. All link, video & announcement updates broadcast live to all public users!";
      } else {
        card.className = "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-slate-200 text-slate-800";
        dot.className = "w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse";
        title.textContent = "🟡 LocalStorage Mode (Cloud Sync Pending)";
        desc.textContent = "Enter your free Firebase credentials below to enable live cloud synchronization worldwide.";
      }
    }
  },

  handleSaveFirebaseConfig() {
    const apiKey = document.getElementById('fbApiKey').value.trim();
    const projectId = document.getElementById('fbProjectId').value.trim();
    const authDomain = document.getElementById('fbAuthDomain').value.trim();
    const storageBucket = document.getElementById('fbStorageBucket').value.trim();
    const messagingSenderId = document.getElementById('fbMessagingSenderId').value.trim();
    const appId = document.getElementById('fbAppId').value.trim();

    if (!apiKey || !projectId) {
      showToast("Please enter at least API Key and Project ID.", "warning");
      return;
    }

    const configObj = {
      apiKey,
      projectId,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId,
      appId
    };

    const res = VUO_DB.saveConfig(configObj);
    if (res.success) {
      this.renderFirebaseStatus();
      showToast("Firebase Cloud Config saved! Testing connection...", "success");
      setTimeout(() => this.testFirebaseConnection(), 500);
    } else {
      showToast("Error saving config: " + res.message, "error");
    }
  },

  async testFirebaseConnection() {
    if (!VUO_DB.isConfigured()) {
      showToast("Please enter Firebase config first.", "warning");
      return;
    }
    showToast("Connecting to Google Firestore...", "info");
    VUO_DB.init();
    if (VUO_DB.isInitialized) {
      this.renderFirebaseStatus();
      showToast("🎉 Successfully connected to Google Firebase Cloud Database!", "success");
    } else {
      showToast("Connection failed. Please verify API Key & Project ID in Firebase console.", "error");
    }
  },

  async syncLocalToCloud() {
    if (!VUO_DB.isInitialized) {
      showToast("Please connect Firebase first before pushing data.", "warning");
      return;
    }

    showToast("Pushing local data to Firebase Cloud...", "info");
    try {
      await VUO_DB.seedCloudDefaults();
      showToast("✅ All Links, Videos & News successfully synced to Cloud!", "success");
    } catch (e) {
      showToast("Sync error: " + e.message, "error");
    }
  },

  // ---------------- 11. LEADS & GENERAL INSURANCE ---------------- //
  renderLeadsTable() {
    const tbody = document.getElementById('adminLeadsTbody');
    if (!tbody) return;

    if (typeof VUO_LEADS === 'undefined') return;

    // Synchronize services list & dropdowns
    if (VUO_LEADS.renderAdminServicesList) VUO_LEADS.renderAdminServicesList();
    if (VUO_LEADS.renderAdminServiceDropdowns) VUO_LEADS.renderAdminServiceDropdowns();

    let leads = VUO_LEADS.getAllLeads();
    
    // Stats calculation
    const totalCount = leads.length;
    const newCount = leads.filter(l => l.status === 'New').length;
    const inProgressCount = leads.filter(l => l.status === 'In Progress' || l.status === 'Contacted').length;
    const closedCount = leads.filter(l => l.status === 'Converted' || l.status === 'Closed').length;

    // Update Badges & Counters
    const badgeEl = document.getElementById('adminLeadsBadge');
    if (badgeEl) {
      badgeEl.textContent = newCount;
      badgeEl.style.display = newCount > 0 ? 'inline-block' : 'none';
    }

    const totalEl = document.getElementById('adminLeadsTotalCount');
    if (totalEl) totalEl.textContent = totalCount;
    const newEl = document.getElementById('adminLeadsNewCount');
    if (newEl) newEl.textContent = newCount;
    const inProgEl = document.getElementById('adminLeadsInProgCount');
    if (inProgEl) inProgEl.textContent = inProgressCount;
    const closedEl = document.getElementById('adminLeadsClosedCount');
    if (closedEl) closedEl.textContent = closedCount;

    // Filters
    const query = document.getElementById('adminLeadSearch')?.value.toLowerCase().trim() || '';
    const serviceFilter = document.getElementById('adminLeadServiceFilter')?.value || 'all';
    const statusFilter = document.getElementById('adminLeadStatusFilter')?.value || 'all';

    if (query) {
      leads = leads.filter(l => 
        (l.name && l.name.toLowerCase().includes(query)) ||
        (l.mobile && l.mobile.includes(query)) ||
        (l.leadId && l.leadId.toLowerCase().includes(query)) ||
        (l.district && l.district.toLowerCase().includes(query)) ||
        (l.block && l.block.toLowerCase().includes(query)) ||
        (l.details && l.details.toLowerCase().includes(query))
      );
    }

    if (serviceFilter !== 'all') {
      leads = leads.filter(l => l.serviceType === serviceFilter);
    }

    if (statusFilter !== 'all') {
      leads = leads.filter(l => l.status === statusFilter);
    }

    if (leads.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-headset text-3xl mb-2 text-slate-300 block"></i>
            <p class="font-medium text-xs">No matching leads or inquiries found.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = leads.map(l => {
      const badgeColor = (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.serviceBadges && VUO_LEADS.serviceBadges[l.serviceType]) || 'bg-slate-100 text-slate-800 border-slate-300';
      const serviceTitle = l.serviceLabel || (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.serviceLabels && VUO_LEADS.serviceLabels[l.serviceType]) || l.serviceType || 'Service Inquiry';
      
      const waMsg = `Hello ${l.name || 'Customer'},\nThis is VLE HELP DESK regarding your inquiry #${l.leadId || l.id} for "${serviceTitle}".\nHow may we assist you today?`;
      const waUrl = `https://wa.me/91${l.mobile}?text=${encodeURIComponent(waMsg)}`;
      
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs transition-colors">
          <td class="p-3">
            <div class="font-mono font-bold text-sky-700">${l.leadId || l.id}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${l.date || ''}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-900">${l.name}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <a href="tel:${l.mobile}" class="font-mono text-slate-600 hover:text-sky-600 font-medium">${l.mobile}</a>
              <a href="${waUrl}" target="_blank" class="text-emerald-600 hover:text-emerald-700" title="Chat on WhatsApp">
                <i class="fa-brands fa-whatsapp text-sm"></i>
              </a>
            </div>
          </td>
          <td class="p-3">
            <div class="font-semibold text-slate-700">${l.district || '—'}</div>
            <div class="text-[11px] text-slate-500">${l.block || ''}</div>
          </td>
          <td class="p-3">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border ${badgeColor}">
              ${serviceTitle}
            </span>
          </td>
          <td class="p-3 max-w-xs">
            <p class="text-slate-600 text-[11px] line-clamp-2 leading-relaxed" title="${(l.details || '').replace(/"/g, '&quot;')}">
              ${l.details || '—'}
            </p>
          </td>
          <td class="p-3">
            <select onchange="VUO_LEADS.updateLeadStatus('${l.id || l.leadId}', this.value)" class="px-2 py-1 text-[11px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              l.status === 'New' ? 'bg-amber-50 text-amber-800 border-amber-300' :
              l.status === 'In Progress' ? 'bg-sky-50 text-sky-800 border-sky-300' :
              l.status === 'Contacted' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
              l.status === 'Converted' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
              'bg-slate-50 text-slate-700 border-slate-300'
            }">
              <option value="New" ${l.status === 'New' ? 'selected' : ''}>🟡 New</option>
              <option value="In Progress" ${l.status === 'In Progress' ? 'selected' : ''}>🔵 In Progress</option>
              <option value="Contacted" ${l.status === 'Contacted' ? 'selected' : ''}>🟣 Contacted</option>
              <option value="Converted" ${l.status === 'Converted' ? 'selected' : ''}>🟢 Converted / Closed</option>
              <option value="Cancelled" ${l.status === 'Cancelled' ? 'selected' : ''}>⚪ Cancelled</option>
            </select>
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs mr-1 transition-all" title="WhatsApp Customer">
              <i class="fa-brands fa-whatsapp text-xs"></i>
              <span class="hidden sm:inline">WhatsApp</span>
            </a>
            <a href="tel:${l.mobile}" class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] mr-1" title="Call Customer">
              <i class="fa-solid fa-phone text-xs"></i>
            </a>
            <button onclick="VUO_LEADS.deleteLead('${l.id || l.leadId}')" class="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors" title="Delete Lead">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleAdminAddLead() {
    const name = document.getElementById('adminNewLeadName')?.value.trim();
    const mobile = document.getElementById('adminNewLeadMobile')?.value.trim().replace(/\D/g, '');
    const serviceType = document.getElementById('adminNewLeadService')?.value;
    const district = document.getElementById('adminNewLeadDistrict')?.value.trim();
    const block = document.getElementById('adminNewLeadBlock')?.value.trim();
    const details = document.getElementById('adminNewLeadDetails')?.value.trim();

    if (!name || !mobile || mobile.length !== 10) {
      showToast("Please provide customer name and valid 10-digit mobile number.", "warning");
      return;
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const leadId = `LEAD-${uniqueNum}`;

    const leadObj = {
      id: leadId,
      leadId: leadId,
      name,
      mobile,
      district: district || 'Odisha',
      block: block || '',
      serviceType: serviceType || 'bike_insurance',
      serviceLabel: (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.serviceLabels && VUO_LEADS.serviceLabels[serviceType]) || 'Service Inquiry',
      details: details || 'Manual lead entry from Admin Panel.',
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'New',
      source: 'Admin Manual Entry'
    };

    if (typeof VUO_LEADS !== 'undefined') {
      VUO_LEADS.saveLead(leadObj);
    }
    showToast(`Lead #${leadId} created successfully!`, "success");
    document.getElementById('adminAddLeadForm')?.reset();
    this.renderLeadsTable();
  },

  deleteLead(leadId) {
    if (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.deleteLead) {
      VUO_LEADS.deleteLead(leadId);
    }
    this.renderLeadsTable();
  },

  // ---------------- 11. VLE ACTIVITY & REPEAT VISITS TRACKER ---------------- //
  _cachedVleActivities: null,
  _firebaseVleActivities: null,

  async fetchVleActivities() {
    let activities = [];

    // 1. Try local server API
    try {
      const resp = await fetch('/api/vle-activities');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) activities = data;
        else if (data && typeof data === 'object' && Object.keys(data).length > 0) activities = [data];
      }
    } catch (e) {}

    // 2. Merge with localStorage activities
    try {
      const local = JSON.parse(localStorage.getItem('vuo_vle_activities') || localStorage.getItem('vuo_vle_activities_local') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const existingIds = new Set(activities.map(a => a.id));
        local.forEach(l => {
          if (!existingIds.has(l.id)) activities.push(l);
        });
      }
    } catch (e) {}

    // 3. Merge with Firebase listener cache if available
    if (Array.isArray(this._firebaseVleActivities) && this._firebaseVleActivities.length > 0) {
      const existingIds = new Set(activities.map(a => a.id));
      this._firebaseVleActivities.forEach(f => {
        if (!existingIds.has(f.id)) activities.push(f);
      });
    }

    // Sort descending by timestamp
    activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    this._cachedVleActivities = activities;
    return activities;
  },

  async renderVleActivityTable(freshList = null) {
    const tbody = document.getElementById('adminVleActivityTbody');
    if (!tbody) return;

    let list = freshList;
    if (!list) {
      if (this._cachedVleActivities) {
        list = this._cachedVleActivities;
        this.fetchVleActivities().then(updated => {
          if (updated && updated.length !== list.length) this.renderVleActivityTable(updated);
        });
      } else {
        list = await this.fetchVleActivities();
      }
    }

    list = list || [];

    // Metrics computation
    const totalCount = list.length;
    const uniqueVles = new Set(list.map(a => a.mobile || a.name)).size;
    const repeatVisits = list.filter(a => a.type === 'visit').length;
    const totalDownloads = list.filter(a => a.type === 'download').length;

    // Update badges & metrics
    const totalBadge = document.getElementById('adminTotalVleCount');
    if (totalBadge) totalBadge.textContent = totalCount;

    const totalActionsEl = document.getElementById('adminVleTotalActions');
    if (totalActionsEl) totalActionsEl.textContent = totalCount;

    const uniqueEl = document.getElementById('adminVleUniqueCount');
    if (uniqueEl) uniqueEl.textContent = uniqueVles;

    const repeatEl = document.getElementById('adminVleRepeatVisits');
    if (repeatEl) repeatEl.textContent = repeatVisits;

    const downloadsEl = document.getElementById('adminVleTotalDownloads');
    if (downloadsEl) downloadsEl.textContent = totalDownloads;

    // Apply Filter & Search
    const searchVal = (document.getElementById('adminVleSearch')?.value || '').toLowerCase().trim();
    const districtFilter = document.getElementById('adminVleDistrictFilter')?.value || 'all';
    const typeFilter = document.getElementById('adminVleTypeFilter')?.value || 'all';

    let filtered = list.filter(item => {
      if (districtFilter !== 'all' && item.district !== districtFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchVal) {
        const text = `${item.name || ''} ${item.mobile || ''} ${item.item || ''} ${item.district || ''} ${item.action || ''}`.toLowerCase();
        if (!text.includes(searchVal)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-400">No VLE activity logs match your filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const d = item.timestamp ? new Date(item.timestamp) : new Date();
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      let typeBadge = '';
      let actionIcon = 'fa-arrow-down';
      if (item.type === 'visit') {
        typeBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Repeat Visit</span>';
        actionIcon = 'fa-globe text-purple-600';
      } else if (item.type === 'video') {
        typeBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Video Watched</span>';
        actionIcon = 'fa-play text-indigo-600';
      } else if (item.type === 'print') {
        typeBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Print</span>';
        actionIcon = 'fa-print text-amber-600';
      } else {
        typeBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Download</span>';
        actionIcon = 'fa-cloud-arrow-down text-teal-600';
      }

      const cleanPhone = (item.mobile || '').replace(/\D/g, '');
      const waLink = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Namaskar ' + (item.name || 'VLE') + ', VLE CSC Help desk se contact kar rahe hain.')}` : '#';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs">
          <td class="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
            <div>${dateStr}</div>
            <div class="text-[10px] text-slate-400">${timeStr}</div>
          </td>
          <td class="p-3 font-bold text-slate-900 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-[10px]">
                ${(item.name || 'V').charAt(0).toUpperCase()}
              </div>
              <span>${item.name || 'Anonymous VLE'}</span>
            </div>
          </td>
          <td class="p-3 whitespace-nowrap">
            <div class="flex items-center gap-1.5 font-mono font-bold text-slate-800 text-[11px]">
              <span>${item.mobile || '-'}</span>
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" class="text-emerald-600 hover:text-emerald-700 p-1" title="Chat on WhatsApp">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                </a>
                <a href="tel:${cleanPhone}" class="text-sky-600 hover:text-sky-700 p-1" title="Call VLE">
                  <i class="fa-solid fa-phone text-xs"></i>
                </a>
              ` : ''}
            </div>
          </td>
          <td class="p-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              ${item.district || 'Odisha'}
            </span>
          </td>
          <td class="p-3 font-medium text-slate-800">
            <div class="flex items-center gap-2">
              <i class="fa-solid ${actionIcon} text-xs"></i>
              <span class="font-bold text-slate-900">${item.item || item.action || 'CSC Resource'}</span>
            </div>
            ${item.action && item.action !== item.item ? `<div class="text-[10px] text-slate-400 mt-0.5">${item.action}</div>` : ''}
          </td>
          <td class="p-3 whitespace-nowrap">
            ${typeBadge}
          </td>
        </tr>
      `;
    }).join('');
  },

  exportVleActivitiesCsv() {
    const list = this._cachedVleActivities || [];
    if (list.length === 0) {
      if (typeof showToast === 'function') showToast("No activities to export.", "warning");
      return;
    }

    const headers = ["Timestamp", "Date", "Time", "VLE Name", "Mobile", "District", "Activity Type", "Action", "Item", "Category"];
    const rows = list.map(item => {
      const d = item.timestamp ? new Date(item.timestamp) : new Date();
      return [
        item.timestamp || '',
        d.toLocaleDateString('en-GB'),
        d.toLocaleTimeString('en-US'),
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${item.mobile || ''}"`,
        `"${(item.district || '').replace(/"/g, '""')}"`,
        `"${item.type || ''}"`,
        `"${(item.action || '').replace(/"/g, '""')}"`,
        `"${(item.item || '').replace(/"/g, '""')}"`,
        `"${item.category || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VUO_VLE_Activity_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') showToast("VLE Activity CSV exported successfully!", "success");
  }
};

if (typeof window !== 'undefined') {
  window.VUO_ADMIN = VUO_ADMIN;
}

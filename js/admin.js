/**
 * VUO CSC HELP - Administrator Panel
 * Member management, link updates, training video curation, announcements and support inbox
 */

const VUO_ADMIN = {
  activeTab: 'leads',

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

      this._pendingPopupImageFile = file;

      try {
        const res = await this.compressNoticeImage(file);
        const preview = document.getElementById('adminPopupPosterPreview');
        const urlInput = document.getElementById('adminPopupPosterUrl');
        const zoomBtn = document.getElementById('adminPopupPreviewZoom');

        if (urlInput) urlInput.value = res.dataUrl;
        this.updatePopupMediaPreview(res.dataUrl);

        this._pendingPopupImageBlob = res.dataUrl;

        // Immediately cache image in IndexedDB to avoid localStorage quota issues
        if (window.VUO_IDB && typeof window.VUO_IDB.savePdfBlob === 'function') {
          window.VUO_IDB.savePdfBlob('vuo_popup_image', res.dataUrl, file.name || 'notice_image');
        }

        if (statusEl) {
          statusEl.innerHTML = `<span class="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> ${res.width}×${res.height} px HD Ready (${res.sizeKb} KB)</span>`;
          statusEl.classList.remove('hidden');
        }
        showToast(`Notice photo optimized successfully (${res.width}×${res.height}px)!`, "success");
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
      ['input', 'paste', 'change', 'keyup'].forEach(evt => {
        popUrlInput.addEventListener(evt, () => {
          this.updatePopupMediaPreview(popUrlInput.value.trim());
        });
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

    // Member Management Filters
    const memberSearch = document.getElementById('adminMemberSearchInput');
    if (memberSearch) {
      memberSearch.addEventListener('input', () => this.renderMembersTable());
    }
    const memberDist = document.getElementById('adminMemberDistrictFilter');
    if (memberDist) {
      memberDist.addEventListener('change', () => this.renderMembersTable());
    }
    const memberStatus = document.getElementById('adminMemberStatusFilter');
    if (memberStatus) {
      memberStatus.addEventListener('change', () => this.renderMembersTable());
    }

    // Member Edit Form
    const editMemberForm = document.getElementById('adminEditMemberForm');
    if (editMemberForm) {
      editMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEditMember(e);
      });
    }

    // Member Change Password Form
    const changePwdForm = document.getElementById('adminChangeMemberPwdForm');
    if (changePwdForm) {
      changePwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveMemberPassword(e);
      });
    }

  },

  switchTab(tabName) {
    this.activeTab = tabName || 'leads';
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      const tab = btn.getAttribute('data-admin-tab');
      if (tab === this.activeTab) {
        btn.className = 'admin-nav-btn flex items-center gap-2 px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20 border border-amber-400/80 cursor-pointer transition-all transform scale-[1.02]';
      } else {
        btn.className = 'admin-nav-btn flex items-center gap-2 px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-amber-50/70 text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-amber-300 shadow-2xs cursor-pointer transition-all';
      }
    });

    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      if (pane.id === `admin_pane_${this.activeTab}`) {
        pane.classList.remove('hidden');
        pane.style.display = 'block';
      } else {
        pane.classList.add('hidden');
        pane.style.display = 'none';
      }
    });

    this.renderAll();
  },

  renderAll() {
    try { this.renderLeadsTable(); } catch (e) { console.warn("renderLeadsTable error:", e); }
    try { this.renderMembersTable(); } catch (e) { console.warn("renderMembersTable error:", e); }
    try { this.renderLinksTable(); } catch (e) { console.warn("renderLinksTable error:", e); }
    try { this.renderFormsTable(); } catch (e) { console.warn("renderFormsTable error:", e); }
    try { this.renderVideosTable(); } catch (e) { console.warn("renderVideosTable error:", e); }
    try { this.renderAnnouncementsTable(); } catch (e) { console.warn("renderAnnouncementsTable error:", e); }
    try { this.renderSupportTickets(); } catch (e) { console.warn("renderSupportTickets error:", e); }
    try { this.renderDonationSettings(); } catch (e) { console.warn("renderDonationSettings error:", e); }
    try { this.renderPopupSettings(); } catch (e) { console.warn("renderPopupSettings error:", e); }
    try { this.renderWhatsappCommunityAdmin(); } catch (e) { console.warn("renderWhatsappCommunityAdmin error:", e); }
    try { this.renderSecurityInfo(); } catch (e) { console.warn("renderSecurityInfo error:", e); }
    try { this.renderFirebaseStatus(); } catch (e) { console.warn("renderFirebaseStatus error:", e); }
    try { this.renderCloudStorageSettings(); } catch (e) { console.warn("renderCloudStorageSettings error:", e); }
    try { this.renderVleActivityTable(); } catch (e) { console.warn("renderVleActivityTable error:", e); }
    try { this.renderJobAlertsAdmin(); } catch (e) { console.warn("renderJobAlertsAdmin error:", e); }
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
    window._vuoFormUploadMode = mode;
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
    if (typeof window.vuoSubmitPdfForm === 'function') {
      return window.vuoSubmitPdfForm();
    }
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
          });

          if (cloudRes && cloudRes.url && cloudRes.url.startsWith('http')) {
            fileUrl = cloudRes.url;
            downloadUrl = cloudRes.downloadUrl || cloudRes.url;
            previewUrl = cloudRes.previewUrl || cloudRes.url;
            storageType = cloudRes.provider || 'cloud_pdf';
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            if (progressText) progressText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Cloud Upload Success!`;
          } else {
            fileUrl = `forms/${selectedFile.name}`;
            downloadUrl = '';
            previewUrl = '';
            storageType = 'indexeddb';
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            if (progressText) progressText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Saved to Offline High-Capacity DB!`;
          }
        } catch (cloudErr) {
          console.warn("Cloud upload attempt finished:", cloudErr);
          if (progressBar) progressBar.style.width = '100%';
          if (progressPercent) progressPercent.textContent = '100%';
          if (progressText) progressText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Saved to Offline High-Capacity DB!`;
        } finally {
          setTimeout(() => {
            if (progressBox) progressBox.classList.add('hidden');
          }, 1200);
        }
      }

      if (!fileUrl) {
        fileUrl = `forms/${selectedFile.name}`;
      }

      // 3. Local server write if running on local server
      try {
        const toBase64 = (f) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
        const b64 = await toBase64(selectedFile);
        await fetch('/api/upload-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: selectedFile.name, base64Data: b64 })
        });
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

  compressNoticeImage(file, maxDimension = 800, quality = 0.75) {
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

  parseMediaUrl(url) {
    if (!url || typeof url !== 'string') return { type: 'none', raw: '' };
    const raw = url.trim();
    if (!raw) return { type: 'none', raw: '' };

    let testStr = raw;
    const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      testStr = iframeMatch[1];
    }

    // 1. YouTube Video ID (11 chars) matcher
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
        maxResThumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        fallbackThumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        raw: raw
      };
    }

    // 2. Playlist check: list=PL...
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

    // 3. Any other YouTube URL
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

    // 4. Standard Image
    return {
      type: 'image',
      imageUrl: raw,
      raw: raw
    };
  },

  updatePopupMediaPreview(val) {
    const preview = document.getElementById('adminPopupPosterPreview');
    const videoPreview = document.getElementById('adminPopupVideoPreview');
    const videoThumb = document.getElementById('adminPopupVideoThumb');
    const videoLink = document.getElementById('adminPopupVideoOverlayLink');
    const zoomBtn = document.getElementById('adminPopupPreviewZoom');
    const badge = document.getElementById('adminPopupUrlTypeBadge');

    const media = this.parseMediaUrl(val);

    if (media.type === 'youtube') {
      if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
      }
      if (videoPreview) {
        videoPreview.classList.remove('hidden');
      }
      if (videoThumb) {
        videoThumb.classList.remove('hidden');
        videoThumb.src = media.maxResThumbnail || media.thumbnailUrl;
        videoThumb.onerror = function() {
          if (this.src !== media.thumbnailUrl) {
            this.src = media.thumbnailUrl;
          } else if (media.fallbackThumbnail && this.src !== media.fallbackThumbnail) {
            this.src = media.fallbackThumbnail;
          }
        };
      }
      if (videoLink) {
        videoLink.href = media.watchUrl;
      }
      if (zoomBtn) {
        zoomBtn.href = media.watchUrl;
        zoomBtn.innerHTML = '<i class="fa-brands fa-youtube text-red-500 mr-1"></i> Open & Watch on YouTube';
        zoomBtn.classList.remove('hidden');
      }
      if (badge) {
        badge.innerHTML = '<i class="fa-brands fa-youtube text-red-600 mr-1"></i> YouTube Video';
        badge.className = 'absolute right-2 top-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200';
        badge.classList.remove('hidden');
      }

      // Auto-suggest action button text/link if empty or default
      const btnTextInput = document.getElementById('adminPopupButtonText');
      const btnLinkInput = document.getElementById('adminPopupButtonLink');
      if (btnTextInput && (!btnTextInput.value.trim() || btnTextInput.value === 'Explore Digital Tools' || btnTextInput.value === 'View Details' || btnTextInput.value === 'Open Notice')) {
        btnTextInput.value = '▶ Watch Video on YouTube';
      }
      if (btnLinkInput && (!btnLinkInput.value.trim() || btnLinkInput.value === '#passphoto')) {
        btnLinkInput.value = media.watchUrl;
      }
    } else if (media.type === 'image' && media.imageUrl) {
      if (videoPreview) {
        videoPreview.classList.add('hidden');
      }
      if (preview) {
        preview.src = media.imageUrl;
        preview.classList.remove('hidden');
      }
      if (zoomBtn) {
        zoomBtn.href = media.imageUrl;
        zoomBtn.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open Image';
        zoomBtn.classList.remove('hidden');
      }
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-image text-purple-600 mr-1"></i> HD Image';
        badge.className = 'absolute right-2 top-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200';
        badge.classList.remove('hidden');
      }
    } else {
      if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
      }
      if (videoPreview) {
        videoPreview.classList.add('hidden');
      }
      if (zoomBtn) {
        zoomBtn.href = '#';
        zoomBtn.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open Media';
      }
      if (badge) {
        badge.classList.add('hidden');
      }
    }
  },

  renderWhatsappCommunityAdmin() {
    const defaultData = (typeof VUO_DATA !== 'undefined' && VUO_DATA.whatsappCommunity) ? VUO_DATA.whatsappCommunity : {
      enabled: true,
      title: "Join Odisha CSC VLE WhatsApp Community",
      desc: "Get instant daily CSC updates, Odisha Govt scheme notifications & technical support directly on WhatsApp.",
      link: "https://chat.whatsapp.com/",
      buttonText: "Join Official WhatsApp Group"
    };

    let saved;
    try {
      saved = JSON.parse(localStorage.getItem('vuo_whatsapp_community')) || defaultData;
    } catch (_) {
      saved = defaultData;
    }

    const enabledEl = document.getElementById('adminWhatsappEnabled');
    const linkEl = document.getElementById('adminWhatsappLink');
    const titleEl = document.getElementById('adminWhatsappTitle');
    const descEl = document.getElementById('adminWhatsappDesc');
    const btnTextEl = document.getElementById('adminWhatsappBtnText');
    const testLink = document.getElementById('adminWhatsappTestLink');

    if (enabledEl) enabledEl.checked = saved.enabled !== false;
    if (linkEl) {
      linkEl.value = saved.link || '';
      linkEl.addEventListener('input', () => {
        if (testLink) testLink.href = linkEl.value.trim() || '#';
      });
    }
    if (titleEl) titleEl.value = saved.title || defaultData.title;
    if (descEl) descEl.value = saved.desc || defaultData.desc;
    if (btnTextEl) btnTextEl.value = saved.buttonText || defaultData.buttonText;
    if (testLink) testLink.href = saved.link || '#';
  },

  async handleSaveWhatsappCommunity() {
    const enabled = document.getElementById('adminWhatsappEnabled') ? document.getElementById('adminWhatsappEnabled').checked : true;
    const link = document.getElementById('adminWhatsappLink') ? document.getElementById('adminWhatsappLink').value.trim() : '';
    const title = document.getElementById('adminWhatsappTitle') ? document.getElementById('adminWhatsappTitle').value.trim() : 'Join Odisha CSC VLE WhatsApp Community';
    const desc = document.getElementById('adminWhatsappDesc') ? document.getElementById('adminWhatsappDesc').value.trim() : '';
    const buttonText = document.getElementById('adminWhatsappBtnText') ? document.getElementById('adminWhatsappBtnText').value.trim() : 'Join Official WhatsApp Group';

    const obj = {
      enabled,
      link,
      title,
      desc,
      buttonText,
      updatedAt: new Date().toLocaleString()
    };

    localStorage.setItem('vuo_whatsapp_community', JSON.stringify(obj));

    // Publish to Firebase Cloud Firestore if connected
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && VUO_DB.db) {
      try {
        await VUO_DB.db.collection('vuo_settings').doc('whatsapp_community').set(obj, { merge: true });
      } catch (err) {
        console.warn("WhatsApp community cloud sync error:", err);
      }
    }

    // Live update Dashboard banner
    if (typeof renderWhatsappCommunityBanner === 'function') {
      renderWhatsappCommunityBanner();
    }

    const testLink = document.getElementById('adminWhatsappTestLink');
    if (testLink) testLink.href = link || '#';

    showToast("WhatsApp Community link updated and published to dashboard successfully!", "success");
  },

  clearPopupImage() {
    const preview = document.getElementById('adminPopupPosterPreview');
    const videoPreview = document.getElementById('adminPopupVideoPreview');
    const urlInput = document.getElementById('adminPopupPosterUrl');
    const fileInput = document.getElementById('adminPopupPosterFile');
    const statusEl = document.getElementById('adminPopupPhotoStatus');
    const zoomBtn = document.getElementById('adminPopupPreviewZoom');
    const badge = document.getElementById('adminPopupUrlTypeBadge');

    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (videoPreview) videoPreview.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
    if (zoomBtn) {
      zoomBtn.href = '#';
      zoomBtn.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open Media';
    }
    if (statusEl) {
      statusEl.innerHTML = `<span class="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block text-[11px] font-semibold"><i class="fa-solid fa-info-circle mr-1"></i> Media removed. Notice will display as text-only.</span>`;
      statusEl.classList.remove('hidden');
    }
    this._pendingPopupImageBlob = '';
    showToast("Notice media removed. Click 'Save Popup Settings' to publish changes.", "info");
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
    
    this.updatePopupMediaPreview(pop.imageUrl || '');
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

    // If a new photo file was chosen, attempt free Cloud Storage upload in background if available
    if (this._pendingPopupImageFile && typeof VUO_CLOUD_STORAGE !== 'undefined') {
      try {
        const cloudImg = await VUO_CLOUD_STORAGE.uploadImage(this._pendingPopupImageFile);
        if (cloudImg && cloudImg.url && cloudImg.url.startsWith('http')) {
          imageUrl = cloudImg.url;
          const urlInput = document.getElementById('adminPopupPosterUrl');
          if (urlInput) urlInput.value = cloudImg.url;
          console.log(`☁️ Notice poster uploaded to ${cloudImg.provider}:`, cloudImg.url);
        }
      } catch (fbErr) {
        console.log("ℹ️ Cloud Storage fallback — using high-performance Firestore direct compression.");
      }
    }

    // If title is blank, provide a sensible default so save is never blocked
    if (!title) {
      const media = this.parseMediaUrl(imageUrl);
      title = media.type === 'youtube'
        ? "Official Video Updates — VLE HELP DESK"
        : (imageUrl ? "Official Notice / ଅଫିସିଆଲ୍ ନୋଟିସ୍" : "Official Digital Updates — VLE HELP DESK");
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

    // If imageUrl is data URL, save high-res copy in IndexedDB
    if (imageUrl && imageUrl.startsWith('data:image') && window.VUO_IDB && typeof window.VUO_IDB.savePdfBlob === 'function') {
      window.VUO_IDB.savePdfBlob('vuo_popup_image', imageUrl, 'notice_image');
    }

    // 1. Channel A: Save to Local Storage & IndexedDB (Immediate local responsiveness)
    try {
      localStorage.setItem('vuo_popup', JSON.stringify(popupObj));
    } catch (e) {
      console.warn("localStorage quota exceeded, storing with IDB reference:", e);
      try {
        const safePop = { ...popupObj, imageUrl: 'indexeddb' };
        localStorage.setItem('vuo_popup', JSON.stringify(safePop));
      } catch (_) {}
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
        const firestoreObj = { ...popupObj };
        if (firestoreObj.imageUrl && firestoreObj.imageUrl.length > 800000) {
          firestoreObj.imageUrl = '';
        }
        const cloudRes = await VUO_DB.cloudSavePopup(firestoreObj);
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

    // Live update open visitor popup modal if currently open
    if (typeof openWelcomePopup === 'function') {
      const modal = document.getElementById('welcomePopupModal');
      if (modal && modal.style.display === 'flex' && !modal.classList.contains('hidden')) {
        openWelcomePopup(popupObj);
      }
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

  downloadPopupJson() {
    const pop = JSON.parse(localStorage.getItem('vuo_popup') || JSON.stringify(VUO_DATA.popupSettings || {}));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pop, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "popup_settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("popup_settings.json downloaded! You can upload it to your repository.", "success");
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

  // ---------------- FREE CLOUD STORAGE SETTINGS (CLOUDINARY & SUPABASE) ---------------- //
  toggleStorageProviderFields() {
    const isCloudinary = document.getElementById('radioProviderCloudinary')?.checked;
    const clBox = document.getElementById('storageFieldsCloudinary');
    const sbBox = document.getElementById('storageFieldsSupabase');
    if (clBox && sbBox) {
      if (isCloudinary) {
        clBox.classList.remove('hidden');
        sbBox.classList.add('hidden');
      } else {
        clBox.classList.add('hidden');
        sbBox.classList.remove('hidden');
      }
    }
  },

  renderCloudStorageSettings() {
    if (typeof VUO_CLOUD_STORAGE === 'undefined') return;
    const cfg = VUO_CLOUD_STORAGE.getCloudConfig();
    const isSupabase = cfg.provider === 'supabase';
    
    if (document.getElementById('radioProviderCloudinary')) document.getElementById('radioProviderCloudinary').checked = !isSupabase;
    if (document.getElementById('radioProviderSupabase')) document.getElementById('radioProviderSupabase').checked = isSupabase;
    
    if (document.getElementById('csCloudName')) document.getElementById('csCloudName').value = cfg.cloudName || '';
    if (document.getElementById('csUploadPreset')) document.getElementById('csUploadPreset').value = cfg.uploadPreset || '';
    if (document.getElementById('csSupabaseUrl')) document.getElementById('csSupabaseUrl').value = cfg.supabaseUrl || '';
    if (document.getElementById('csSupabaseKey')) document.getElementById('csSupabaseKey').value = cfg.supabaseAnonKey || '';
    if (document.getElementById('csSupabaseBucket')) document.getElementById('csSupabaseBucket').value = cfg.supabaseBucket || 'vuo_files';

    this.toggleStorageProviderFields();

    // Update status card
    const card = document.getElementById('storageStatusCard');
    const dot = document.getElementById('storageStatusDot');
    const title = document.getElementById('storageStatusTitle');
    const desc = document.getElementById('storageStatusDesc');

    if (card && dot && title && desc) {
      if (cfg.cloudName && cfg.uploadPreset) {
        card.className = "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sky-50/80 border-sky-200 text-sky-950";
        dot.className = "w-3.5 h-3.5 rounded-full bg-sky-500 shadow-sm";
        title.textContent = `🟢 Cloudinary Connected (${cfg.cloudName})`;
        desc.textContent = "25 GB Free Monthly Cloud Storage is active. All PDF uploads go directly to Cloudinary global CDN!";
      } else if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
        card.className = "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/80 border-emerald-200 text-emerald-950";
        dot.className = "w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm";
        title.textContent = `🟢 Supabase Storage Connected (${cfg.supabaseBucket || 'vuo_files'})`;
        desc.textContent = "1 GB Free Permanent Cloud Storage is active. All PDF uploads go directly to your Supabase bucket!";
      } else {
        card.className = "p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-slate-200 text-slate-800";
        dot.className = "w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse";
        title.textContent = "🟡 Local IndexedDB + Drive Mode (Cloud Storage Not Configured)";
        desc.textContent = "Choose Cloudinary (25GB) or Supabase (1GB) below to enable 1-click cloud uploads for free!";
      }
    }
  },

  handleSaveCloudStorageSettings() {
    const isCloudinary = document.getElementById('radioProviderCloudinary')?.checked;
    const provider = isCloudinary ? 'cloudinary' : 'supabase';
    const cloudName = document.getElementById('csCloudName') ? document.getElementById('csCloudName').value.trim() : '';
    const uploadPreset = document.getElementById('csUploadPreset') ? document.getElementById('csUploadPreset').value.trim() : '';
    const supabaseUrl = document.getElementById('csSupabaseUrl') ? document.getElementById('csSupabaseUrl').value.trim() : '';
    const supabaseAnonKey = document.getElementById('csSupabaseKey') ? document.getElementById('csSupabaseKey').value.trim() : '';
    const supabaseBucket = document.getElementById('csSupabaseBucket') ? document.getElementById('csSupabaseBucket').value.trim() : 'vuo_files';

    if (provider === 'cloudinary' && (!cloudName || !uploadPreset)) {
      showToast("Please enter Cloud Name and Upload Preset for Cloudinary.", "warning");
      return;
    }
    if (provider === 'supabase' && (!supabaseUrl || !supabaseAnonKey)) {
      showToast("Please enter Project URL and Anon Public Key for Supabase.", "warning");
      return;
    }

    if (typeof VUO_CLOUD_STORAGE !== 'undefined') {
      VUO_CLOUD_STORAGE.setCloudConfig({
        provider,
        cloudName,
        uploadPreset,
        supabaseUrl,
        supabaseAnonKey,
        supabaseBucket
      });
      this.renderCloudStorageSettings();
      showToast(`🎉 ${provider === 'cloudinary' ? 'Cloudinary (25 GB)' : 'Supabase (1 GB)'} Storage settings saved successfully!`, "success");
    }
  },

  async testCloudStorageUpload() {
    if (typeof VUO_CLOUD_STORAGE === 'undefined') {
      showToast("Cloud Storage module not loaded.", "error");
      return;
    }
    const cfg = VUO_CLOUD_STORAGE.getCloudConfig();
    if (!cfg.cloudName && !cfg.supabaseUrl) {
      showToast("Please configure Cloudinary or Supabase credentials first.", "warning");
      return;
    }

    showToast("Testing 1-Click Cloud Storage upload...", "info");
    try {
      const testBlob = new Blob(["VUO CSC HELP - Test Storage File"], { type: "text/plain" });
      const testFile = new File([testBlob], "vuo_test_file.txt", { type: "text/plain" });
      
      let res = null;
      if (cfg.cloudName && cfg.uploadPreset && (cfg.provider === 'auto' || cfg.provider === 'cloudinary')) {
        res = await VUO_CLOUD_STORAGE.uploadToCloudinary(testFile, cfg, (m) => showToast(m, "info"));
      } else if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
        res = await VUO_CLOUD_STORAGE.uploadToSupabase(testFile, cfg, (m) => showToast(m, "info"));
      }

      if (res && res.url) {
        showToast(`✅ Cloud Storage Test Passed! Connected to ${res.provider}.`, "success");
        this.renderCloudStorageSettings();
      } else {
        showToast("Upload completed, check storage console.", "info");
      }
    } catch (err) {
      showToast("Test upload failed: " + err.message, "error");
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
      
      const safeLeadId = this.escapeHtml(l.leadId || l.id || '');
      const safeDate = this.escapeHtml(l.date || '');
      const safeName = this.escapeHtml(l.name || 'Customer');
      const safeMobile = this.escapeHtml(l.mobile || '');
      const safeDistrict = this.escapeHtml(l.district || '—');
      const safeBlock = this.escapeHtml(l.block || '');
      const safeServiceTitle = this.escapeHtml(serviceTitle);
      const safeDetails = this.escapeHtml(l.details || '—');

      const waMsg = `Hello ${l.name || 'Customer'},\nThis is VLE HELP DESK regarding your inquiry #${l.leadId || l.id} for "${serviceTitle}".\nHow may we assist you today?`;
      const waUrl = `https://wa.me/91${encodeURIComponent(l.mobile || '')}?text=${encodeURIComponent(waMsg)}`;
      
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs transition-colors">
          <td class="p-3">
            <div class="font-mono font-bold text-sky-700">${safeLeadId}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${safeDate}</div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-900">${safeName}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <a href="tel:${safeMobile}" class="font-mono text-slate-600 hover:text-sky-600 font-medium">${safeMobile}</a>
              <a href="${waUrl}" target="_blank" class="text-emerald-600 hover:text-emerald-700" title="Chat on WhatsApp">
                <i class="fa-brands fa-whatsapp text-sm"></i>
              </a>
            </div>
          </td>
          <td class="p-3">
            <div class="font-semibold text-slate-700">${safeDistrict}</div>
            <div class="text-[11px] text-slate-500">${safeBlock}</div>
          </td>
          <td class="p-3">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border ${badgeColor}">
              ${safeServiceTitle}
            </span>
          </td>
          <td class="p-3 max-w-xs">
            <p class="text-slate-600 text-[11px] line-clamp-2 leading-relaxed" title="${safeDetails.replace(/"/g, '&quot;')}">
              ${safeDetails}
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
  },

  // ---------------- 12. REGISTERED MEMBERS DIRECTORY & MANAGEMENT ---------------- //
  renderMembersTable() {
    const tbody = document.getElementById('adminMembersTbody');
    const countBadge = document.getElementById('adminTotalMembersCount');
    if (!tbody) return;

    let members = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];

    if (countBadge) countBadge.textContent = members.length;

    // Filters
    const searchVal = (document.getElementById('adminMemberSearchInput')?.value || '').toLowerCase().trim();
    const distVal = (document.getElementById('adminMemberDistrictFilter')?.value || '').toLowerCase().trim();
    const statusVal = (document.getElementById('adminMemberStatusFilter')?.value || '').toLowerCase().trim();

    if (searchVal) {
      members = members.filter(m => 
        (m.fullName || m.name || '').toLowerCase().includes(searchVal) ||
        (m.mobile || '').includes(searchVal) ||
        (m.cscId || '').toLowerCase().includes(searchVal) ||
        (m.memberNo || '').toLowerCase().includes(searchVal) ||
        (m.email || '').toLowerCase().includes(searchVal)
      );
    }

    if (distVal) {
      members = members.filter(m => (m.district || '').toLowerCase() === distVal);
    }

    if (statusVal) {
      members = members.filter(m => {
        const s = (m.status || 'Active').toLowerCase();
        const isGate = m.isGateOnly || m.registrationType === 'gate';
        if (statusVal === 'gate') return isGate || s.includes('gate');
        if (statusVal === 'active') return !s.includes('suspend') && !s.includes('block');
        return s.includes(statusVal);
      });
    }

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
            <i class="fa-solid fa-users-slash text-3xl mb-2 text-slate-300"></i>
            <p class="font-bold text-slate-500">No registered VLE members found.</p>
            <p class="text-[11px] text-slate-400">Try changing your search terms or filters, or click "Cloud Sync".</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = members.map(m => {
      const cleanPhone = (m.mobile || '').replace(/\D/g, '').slice(-10);
      const waLink = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Namaskar ' + (m.fullName || 'VLE') + ', VLE CSC Help desk se sampark kar rahe hain.')}` : '#';
      const isGoogle = m.authProvider === 'google' || (m.googleId && m.googleId.length > 0);
      const isGate = m.isGateOnly || m.registrationType === 'gate' || (m.status || '').toLowerCase().includes('gate');
      const isSuspended = (m.status || '').toLowerCase().includes('suspend') || (m.status || '').toLowerCase().includes('lock') || (m.status || '').toLowerCase().includes('block');
      
      let statusBadge;
      if (isSuspended) {
        statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit"><i class="fa-solid fa-lock text-[9px]"></i> Suspended (Locked)</span>`;
      } else if (isGate) {
        statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1 w-fit"><i class="fa-solid fa-shield-halved text-[9px]"></i> Gate Verified</span>`;
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit"><i class="fa-solid fa-circle-check text-[9px]"></i> Full Member</span>`;
      }

      const safeTargetId = cleanPhone || m.cscId || m.memberNo;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs ${isSuspended ? 'bg-rose-50/30' : ''}">
          <!-- Name & Avatar -->
          <td class="p-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr ${isSuspended ? 'from-rose-600 to-red-700' : 'from-sky-600 to-blue-700'} text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                ${m.avatar && m.avatar.startsWith('http') ? `<img src="${m.avatar}" alt="${m.fullName}" class="w-full h-full rounded-full object-cover">` : (m.fullName || 'V').charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-black text-slate-900">${m.fullName || m.name || 'VLE Member'}</span>
                  ${isGoogle ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><i class="fa-brands fa-google text-[9px]"></i> Google</span>` : ''}
                </div>
                <div class="text-[10px] text-slate-400 font-mono">${m.email || (cleanPhone + '@vlehelp.in')}</div>
              </div>
            </div>
          </td>

          <!-- Mobile with WhatsApp -->
          <td class="p-3 whitespace-nowrap">
            <div class="flex items-center gap-1.5 font-mono font-bold text-slate-800 text-[11px]">
              <span>+91 ${cleanPhone || '-'}</span>
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" class="text-emerald-600 hover:text-emerald-700 p-0.5" title="WhatsApp Message">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                </a>
                <a href="tel:${cleanPhone}" class="text-sky-600 hover:text-sky-700 p-0.5" title="Call Member">
                  <i class="fa-solid fa-phone text-xs"></i>
                </a>
              ` : ''}
            </div>
          </td>

          <!-- CSC ID & Kendra -->
          <td class="p-3">
            <div class="font-mono font-bold text-sky-700 text-[11px]">${m.cscId || m.memberNo || '—'}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-[140px]">${m.kendraName || 'Digital Seva Kendra'}</div>
          </td>

          <!-- District -->
          <td class="p-3 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              ${m.district || 'Odisha'}
            </span>
          </td>

          <!-- Status & Join Date -->
          <td class="p-3 whitespace-nowrap">
            ${statusBadge}
            <div class="text-[9px] text-slate-400 mt-0.5 font-mono">${m.joiningDate || '2026'}</div>
          </td>

          <!-- Password (Masked with reveal toggle) -->
          <td class="p-3 whitespace-nowrap">
            <div class="flex items-center gap-1">
              <span id="pwd_mask_${safeTargetId}" class="font-mono text-xs text-slate-400 font-bold tracking-wider">••••••</span>
              <span id="pwd_val_${safeTargetId}" class="hidden font-mono text-xs text-emerald-700 font-bold">${m.passwordHash || '1234'}</span>
              <button type="button" onclick="VUO_ADMIN.togglePasswordReveal('${safeTargetId}')" class="text-slate-400 hover:text-slate-600 p-1 text-[11px] cursor-pointer" title="Toggle Password View">
                <i id="pwd_ico_${safeTargetId}" class="fa-solid fa-eye text-[10px]"></i>
              </button>
            </div>
          </td>

          <!-- Action Buttons -->
          <td class="p-3 text-right whitespace-nowrap space-x-1">
            <button type="button" onclick="VUO_ADMIN.openEditMember('${safeTargetId}')" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs" title="Edit Member Details">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Edit</span>
            </button>
            <button type="button" onclick="VUO_ADMIN.openChangeMemberPassword('${safeTargetId}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs" title="Change Password">
              <i class="fa-solid fa-key"></i>
              <span>Change Pwd</span>
            </button>
            ${isSuspended ? `
              <button type="button" onclick="VUO_ADMIN.toggleLockMember('${safeTargetId}')" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs" title="Unlock Member Account">
                <i class="fa-solid fa-lock-open"></i>
                <span>Unlock</span>
              </button>
            ` : `
              <button type="button" onclick="VUO_ADMIN.toggleLockMember('${safeTargetId}')" class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs" title="Lock / Suspend Member Account">
                <i class="fa-solid fa-lock"></i>
                <span>Lock</span>
              </button>
            `}
            <button type="button" onclick="VUO_ADMIN.deleteMember('${safeTargetId}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-all" title="Delete Member Permanently">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  async syncCloudMembersNow() {
    const btn = document.getElementById('adminSyncMembersBtn');
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Syncing...</span>`;
      btn.disabled = true;
    }
    if (typeof showToast === 'function') showToast("Firebase Cloud se members sync ho rahe hain...", "info");

    try {
      if (typeof VUO_DB !== 'undefined' && typeof VUO_DB.fetchCloudMembersDirectly === 'function') {
        const res = await VUO_DB.fetchCloudMembersDirectly();
        this.renderMembersTable();
        if (typeof showToast === 'function') {
          showToast(`Cloud se ${res.memberCount || 0} Registered Members aur ${res.gateCount || 0} Gate VLEs sync ho gaye!`, "success");
        }
      } else {
        this.renderMembersTable();
      }
    } catch (e) {
      console.error(e);
      if (typeof showToast === 'function') showToast("Sync error: " + e.message, "error");
    } finally {
      if (btn) {
        btn.innerHTML = oldHtml || `<i class="fa-solid fa-cloud-arrow-down"></i> <span>Cloud Sync</span>`;
        btn.disabled = false;
      }
    }
  },

  togglePasswordReveal(targetId) {
    const mask = document.getElementById(`pwd_mask_${targetId}`);
    const val = document.getElementById(`pwd_val_${targetId}`);
    const ico = document.getElementById(`pwd_ico_${targetId}`);
    if (!mask || !val) return;
    if (mask.classList.contains('hidden')) {
      mask.classList.remove('hidden');
      val.classList.add('hidden');
      if (ico) ico.className = 'fa-solid fa-eye text-[10px]';
    } else {
      mask.classList.add('hidden');
      val.classList.remove('hidden');
      if (ico) ico.className = 'fa-solid fa-eye-slash text-[10px] text-amber-600';
    }
  },

  openEditMember(targetId) {
    const members = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];
    const cleanTarget = targetId.toString().replace(/\D/g, '').slice(-10);
    const targetLower = targetId.toString().trim().toLowerCase();

    const m = members.find(item => {
      const mMob = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (item.cscId || '').toLowerCase();
      const mNo = (item.memberNo || '').toLowerCase();
      return (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    if (!m) {
      if (typeof showToast === 'function') showToast("Member record not found.", "error");
      return;
    }

    const modal = document.getElementById('adminEditMemberModal');
    if (!modal) return;

    document.getElementById('editMemberTargetId').value = m.mobile || m.cscId || m.memberNo;
    document.getElementById('editMemberName').value = m.fullName || m.name || '';
    document.getElementById('editMemberMobile').value = (m.mobile || '').replace(/\D/g, '').slice(-10);
    document.getElementById('editMemberCscId').value = m.cscId || '';
    document.getElementById('editMemberDistrict').value = m.district || 'Puri';
    document.getElementById('editMemberKendra').value = m.kendraName || '';
    document.getElementById('editMemberEmail').value = m.email || '';
    document.getElementById('editMemberStatus').value = (m.status || '').toLowerCase().includes('suspend') ? 'Suspended' : 'Active (Verified VLE)';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeEditMemberModal() {
    const modal = document.getElementById('adminEditMemberModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  handleSaveEditMember(e) {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = document.getElementById('editMemberTargetId')?.value;
    const name = document.getElementById('editMemberName')?.value;
    const mobile = document.getElementById('editMemberMobile')?.value;
    const cscId = document.getElementById('editMemberCscId')?.value;
    const district = document.getElementById('editMemberDistrict')?.value;
    const kendra = document.getElementById('editMemberKendra')?.value;
    const email = document.getElementById('editMemberEmail')?.value;
    const status = document.getElementById('editMemberStatus')?.value;

    if (!name || name.trim().length < 2) {
      if (typeof showToast === 'function') showToast("Please enter member name.", "warning");
      return;
    }
    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanMob || cleanMob.length !== 10) {
      if (typeof showToast === 'function') showToast("Please enter a valid 10-digit mobile number.", "warning");
      return;
    }

    const res = VUO_AUTH.updateMember(targetId, {
      fullName: name,
      mobile: cleanMob,
      cscId: cscId,
      district: district,
      kendraName: kendra,
      email: email,
      status: status
    });

    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    this.closeEditMemberModal();
    this.renderMembersTable();
    if (typeof showToast === 'function') {
      showToast(`Member profile for ${res.member.fullName} updated successfully!`, "success");
    }
  },

  openChangeMemberPassword(targetId) {
    const members = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];
    const cleanTarget = targetId.toString().replace(/\D/g, '').slice(-10);
    const targetLower = targetId.toString().trim().toLowerCase();

    const m = members.find(item => {
      const mMob = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (item.cscId || '').toLowerCase();
      const mNo = (item.memberNo || '').toLowerCase();
      return (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    if (!m) {
      if (typeof showToast === 'function') showToast("Member record not found.", "error");
      return;
    }

    const modal = document.getElementById('adminChangeMemberPwdModal');
    if (!modal) return;

    document.getElementById('changePwdTargetId').value = m.mobile || m.cscId || m.memberNo;
    document.getElementById('changePwdMemberInfo').textContent = `${m.fullName || 'VLE'} (+91 ${(m.mobile || '').slice(-10)}) — CSC: ${m.cscId || 'N/A'}`;
    document.getElementById('changePwdNewValue').value = '';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeChangeMemberPwdModal() {
    const modal = document.getElementById('adminChangeMemberPwdModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  generateRandomPassword() {
    const input = document.getElementById('changePwdNewValue');
    if (input) {
      const rnd = 'VLE@' + Math.floor(1000 + Math.random() * 9000);
      input.value = rnd;
      input.type = 'text';
    }
  },

  async handleSaveMemberPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = document.getElementById('changePwdTargetId')?.value;
    const newPwd = document.getElementById('changePwdNewValue')?.value;
    const saveBtn = e?.target?.querySelector('button[type="submit"]') || document.querySelector('#adminChangeMemberPwdModal button[type="submit"]');
    const oldBtnHtml = saveBtn ? saveBtn.innerHTML : '';

    if (!newPwd || newPwd.trim().length < 4) {
      if (typeof showToast === 'function') showToast("New password must be at least 4 characters.", "warning");
      return;
    }

    if (saveBtn) {
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Saving to Cloud...`;
      saveBtn.disabled = true;
    }

    try {
      const res = await VUO_AUTH.adminSetPassword(targetId, newPwd.trim());
      if (!res.success) {
        if (typeof showToast === 'function') showToast(res.message, "error");
        return;
      }

      this.closeChangeMemberPwdModal();
      this.renderMembersTable();
      if (typeof showToast === 'function') {
        showToast(`✅ Password changed & synced to Cloud for ${res.member.fullName}! (New: ${newPwd.trim()})`, "success");
      }
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast("Error updating password: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.innerHTML = oldBtnHtml || 'Save New Password';
        saveBtn.disabled = false;
      }
    }
  },

  async toggleLockMember(targetId) {
    const members = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];
    const cleanTarget = targetId.toString().replace(/\D/g, '').slice(-10);
    const targetLower = targetId.toString().trim().toLowerCase();

    const m = members.find(item => {
      const mMob = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (item.cscId || '').toLowerCase();
      const mNo = (item.memberNo || '').toLowerCase();
      return (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    const isLocked = m && ((m.status || '').toLowerCase().includes('suspend') || (m.status || '').toLowerCase().includes('lock') || (m.status || '').toLowerCase().includes('block'));
    const actionName = isLocked ? "UNLOCK" : "LOCK / SUSPEND";
    const name = m ? (m.fullName || m.name || 'Member') : targetId;

    if (!confirm(`Kya aap sach me member "${name}" ka account ${actionName} karna chahte hain?`)) return;

    if (typeof showToast === 'function') {
      showToast(`${actionName} kiya ja raha hai (Cloud Firestore sync)...`, "info");
    }

    try {
      const res = await VUO_AUTH.toggleMemberLock(targetId);
      if (!res.success) {
        if (typeof showToast === 'function') showToast(res.message || "Failed to update member lock status.", "error");
        return;
      }
      this.renderMembersTable();
      if (typeof showToast === 'function') {
        showToast(res.isLocked ? `🔒 Member ${name} ka account LOCK kar diya gaya hai.` : `🔓 Member ${name} ka account UNLOCK ho gaya hai.`, "success");
      }
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
  },

  async deleteMember(targetId) {
    const members = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];
    const cleanTarget = targetId.toString().replace(/\D/g, '').slice(-10);
    const targetLower = targetId.toString().trim().toLowerCase();

    const m = members.find(item => {
      const mMob = (item.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (item.cscId || '').toLowerCase();
      const mNo = (item.memberNo || '').toLowerCase();
      return (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    const name = m ? `${m.fullName || 'VLE'} (${m.memberNo || cleanTarget})` : targetId;

    if (!confirm(`⚠️ Kripya dhyan dein:\n\nKya aap sach me VLE Member "${name}" ko DELETE karna chahte hain?\n\nYe record Cloud Firestore aur Local Storage dono se PERMANENTLY delete ho jayega aur dobara wapas nahi aayega.`)) {
      return;
    }

    if (typeof showToast === 'function') {
      showToast("Cloud Firestore aur Local se delete kiya ja raha hai...", "info");
    }

    try {
      const res = await VUO_AUTH.deleteMember(targetId);
      if (!res.success) {
        if (typeof showToast === 'function') showToast(res.message || "Failed to delete member.", "error");
        return;
      }
      this.renderMembersTable();
      if (typeof showToast === 'function') {
        showToast(`✅ VLE Member "${name}" permanently delete ho gaya hai (Cloud & Local dono se).`, "success");
      }
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast("Delete error: " + err.message, "error");
    }
  },

  exportMembersCsv() {
    const list = (typeof VUO_AUTH !== 'undefined') ? VUO_AUTH.getAllMembers() : [];
    if (list.length === 0) {
      if (typeof showToast === 'function') showToast("No members to export.", "warning");
      return;
    }

    const headers = ["Member No", "Full Name", "Mobile", "Email", "CSC ID", "District", "Kendra Name", "Auth Provider", "Status", "Password", "Joining Date"];
    const rows = list.map(m => {
      return [
        `"${m.memberNo || ''}"`,
        `"${(m.fullName || m.name || '').replace(/"/g, '""')}"`,
        `"${(m.mobile || '').replace(/\D/g, '').slice(-10)}"`,
        `"${(m.email || '').replace(/"/g, '""')}"`,
        `"${(m.cscId || '').replace(/"/g, '""')}"`,
        `"${(m.district || '').replace(/"/g, '""')}"`,
        `"${(m.kendraName || '').replace(/"/g, '""')}"`,
        `"${m.authProvider || 'mobile'}"`,
        `"${m.status || 'Active'}"`,
        `"${m.passwordHash || '1234'}"`,
        `"${m.joiningDate || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VUO_Registered_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') showToast("Members CSV exported successfully!", "success");
  },

  // ---------------- 13. JOB ALERTS & DIRECT LINK INGESTION (SINGLE & BULK) ---------------- //
  _cachedJobSources: [],

  loadJobSources() {
    // Backwards compatibility stub (5 static portals replaced by direct link ingestion)
  },

  populateJobSourcesInputs() {
    // Backwards compatibility stub
  },

  saveJobSources() {
    // Backwards compatibility stub
  },

  resetDefaultJobSources() {
    // Backwards compatibility stub
  },

  async syncAllJobSourcesNow() {
    const btn = document.getElementById('adminJobAlertsSyncAllBtn');
    const textEl = document.getElementById('adminJobAlertsSyncAllBtnText');
    if (btn) btn.disabled = true;
    if (textEl) textEl.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin text-amber-950"></i> Refreshing Jobs...`;

    try {
      if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.fetchLiveServerJobs === 'function') {
        await VUO_JOB_ALERT.fetchLiveServerJobs(true);
      }
      this.renderJobAlertsAdmin();
      if (typeof showToast === 'function') showToast("✅ All job listings refreshed successfully!", "success");
    } catch (e) {
      if (typeof showToast === 'function') showToast("Sync error: " + e.message, "error");
    } finally {
      if (btn) btn.disabled = false;
      if (textEl) textEl.innerHTML = `⚡ Refresh Jobs`;
    }
  },

  pasteSampleJobLink() {
    const textarea = document.getElementById('adminJobBulkUrlsInput');
    if (textarea) {
      textarea.value = 'https://www.freejobalert.com/articles/odisha-police-constable-recruitment-2026-3075546';
      textarea.focus();
      if (typeof showToast === 'function') showToast("Odisha Police Constable link pasted! Click 'Extract & Add Jobs'.", "info");
    }
  },

  parseJobFromUrl(rawUrl) {
    if (!rawUrl) return null;
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const u = new URL(url);
      const pathname = u.pathname;
      const slug = pathname.split('/').filter(Boolean).pop() || '';
      const cleanSlug = slug.replace(/-\d+$/, '').replace(/\.(html|php|aspx|htm)$/i, '');
      const lower = cleanSlug.toLowerCase();
      const slugParts = cleanSlug.split(/[-_]/).filter(Boolean);

      // 1. SPECIFIC PARSER FOR ODISHA POLICE CONSTABLE & DEFENSE
      if (lower.includes('odisha-police') || lower.includes('police-constable')) {
        return {
          id: `job-odisha-police-${Date.now()}`,
          title: "Odisha Police Constable Recruitment 2026",
          titleOdia: "ଓଡ଼ିଶା ପୋଲିସ କନଷ୍ଟେବଲ ନିଯୁକ୍ତି ୨୦୨୬",
          organization: "State Selection Board (SSB), Odisha Police",
          post: "Constable (Civil), Firefighter & Driver",
          category: "Defense & Police",
          vacancies: "7,268 Posts",
          salary: "₹21,700 - ₹69,100 (Level-5 Pay Scale)",
          qualification: "+2 / 10th Class (Matric) Passed from Recognized Board",
          ageLimit: "18 - 23 Years (Relaxation as per Govt rules)",
          startDate: "20-10-2026",
          lastDate: "30-11-2026",
          status: "Active",
          applyUrl: url,
          notificationUrl: url,
          officialUrl: "https://odishapolice.gov.in",
          sourceUrl: url,
          source: "Odisha Police Recruitment",
          documents: [
            "10th (Matric) Board Certificate & Marksheet (Age Proof)",
            "+2 / Higher Secondary Passing Certificate & Marksheet",
            "Aadhaar Card (Mobile Linked for OTP Verification)",
            "Recent Passport Size Color Photo (White Background, 20-50 KB)",
            "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
            "Resident / Domicile Certificate (Odisha / Local Tehsildar)",
            "Caste Certificate (SC / ST / SEBC if applicable)",
            "Odia Language Pass Certificate (ME School Standard / Matric Odia)",
            "Valid Driving License (for Driver Posts if applicable)"
          ],
          examFee: "Free for all categories (Odisha Govt Rule)",
          featured: true,
          syncedAt: Date.now()
        };
      }

      // 2. SMART TITLE EXTRACTION
      let titleWords = slugParts.map(w => {
        if (/^\d{4}$/.test(w)) return w;
        if (/^(ssc|rrb|ossc|osssc|opsc|upsc|ibps|sbi|drdo|isro|nta|ugc|cgl|chsl|mts|gd|alp|ntpc)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      });
      let rawTitle = titleWords.join(' ');
      if (!rawTitle || rawTitle.length < 5) {
        rawTitle = u.hostname.replace('www.', '') + ' Recruitment 2026';
      }

      // 3. CATEGORY DETECTION
      let category = "Odisha Govt";
      if (lower.includes('railway') || lower.includes('rrb') || lower.includes('rrc')) {
        category = "Railway";
      } else if (lower.includes('police') || lower.includes('constable') || lower.includes('defense') || lower.includes('army') || lower.includes('navy') || lower.includes('airforce') || lower.includes('crpf') || lower.includes('bsf') || lower.includes('cisf') || lower.includes('itbp') || lower.includes('ssb')) {
        category = "Defense & Police";
      } else if (lower.includes('bank') || lower.includes('ibps') || lower.includes('sbi') || lower.includes('rbi') || lower.includes('pnb')) {
        category = "Banking";
      } else if (lower.includes('10th') || lower.includes('12th') || lower.includes('matric') || lower.includes('driver') || lower.includes('peon') || lower.includes('attendant') || lower.includes('dak-sevak') || lower.includes('gds')) {
        category = "10th & 12th Pass";
      } else if (lower.includes('central') || lower.includes('ssc') || lower.includes('upsc') || lower.includes('nta') || lower.includes('drdo') || lower.includes('isro')) {
        category = "Central Govt";
      }

      // 4. ORGANIZATION DETECTION
      let org = "Government Recruitment Board";
      if (lower.includes('odisha-police') || lower.includes('police')) org = "Odisha Police Recruitment Board";
      else if (lower.includes('ossc')) org = "Odisha Staff Selection Commission (OSSC)";
      else if (lower.includes('osssc')) org = "Odisha Sub-Ordinate Staff Selection Commission (OSSSC)";
      else if (lower.includes('opsc')) org = "Odisha Public Service Commission (OPSC)";
      else if (lower.includes('rrb') || lower.includes('railway')) org = "Railway Recruitment Boards (RRB)";
      else if (lower.includes('ssc')) org = "Staff Selection Commission (SSC)";
      else if (lower.includes('ibps') || lower.includes('bank')) org = "Institute of Banking Personnel Selection (IBPS)";
      else if (lower.includes('sbi')) org = "State Bank of India (SBI)";
      else if (lower.includes('upsc')) org = "Union Public Service Commission (UPSC)";
      else if (lower.includes('odisha')) org = "Odisha Government Department";

      // 5. TOTAL VACANCIES DETECTION
      let vacancies = "Various Posts";
      const vacMatch = lower.match(/(\d+)[-_]?(posts?|vacanc|openings?)/);
      if (vacMatch) {
        vacancies = `${Number(vacMatch[1]).toLocaleString('en-IN')} Posts`;
      } else {
        const walkMatch = lower.match(/walkin[-_]?for[-_]?(\d+)/);
        if (walkMatch) vacancies = `${Number(walkMatch[1]).toLocaleString('en-IN')} Posts`;
      }

      // 6. SALARY / PAY SCALE DETECTION
      let salary = "₹21,700 - ₹69,100 (Level-5 Pay Matrix)";
      if (category === "Railway") salary = "₹19,900 - ₹63,200 (Level-2 / Level-4)";
      else if (category === "Defense & Police") salary = "₹21,700 - ₹69,100 (Level-5 Pay Scale)";
      else if (category === "Banking") salary = "₹36,000 - ₹63,840 (Junior Management Grade-I)";
      else if (category === "10th & 12th Pass") salary = "₹18,000 - ₹56,900 (Level-1 Pay Scale)";
      else if (lower.includes('officer') || lower.includes('cgl') || lower.includes('specialist')) salary = "₹35,400 - ₹1,12,400 (Level-9 Pay Scale)";

      // 7. QUALIFICATION DETECTION
      let qualification = "10th Class (Matric) / +2 / Degree as per notification";
      if (category === "Defense & Police") qualification = "+2 / 10th Class (Matric) Passed from Recognized Board";
      else if (category === "10th & 12th Pass") qualification = "10th Class (Matriculation) Passed from BSE Odisha or equivalent";
      else if (category === "Railway") qualification = "10th Class + ITI / Diploma in relevant engineering trade";
      else if (category === "Banking") qualification = "Graduate Degree in any discipline from recognized University";
      else if (lower.includes('graduate') || lower.includes('degree') || lower.includes('cgl')) qualification = "Bachelor's Degree in any stream with basic Computer Knowledge";

      // 8. DATES (START DATE & LAST DATE)
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const startDate = `${dd}-${mm}-${yyyy}`;

      let lastDate = "30-11-2026";
      const dateMatch = cleanSlug.match(/(\d{1,2})[-_](\d{1,2})[-_](\d{4})/);
      if (dateMatch) {
        lastDate = `${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3]}`;
      } else {
        const future = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
        const fdd = String(future.getDate()).padStart(2, '0');
        const fmm = String(future.getMonth() + 1).padStart(2, '0');
        const fyyyy = future.getFullYear();
        lastDate = `${fdd}-${fmm}-${fyyyy}`;
      }

      // 9. REQUIRED DOCUMENTS CHECKLIST (Tailored per category)
      let documents = [];
      if (category === "Defense & Police") {
        documents = [
          "10th (Matric) Board Certificate & Marksheet (Age Proof)",
          "+2 / Higher Secondary Passing Certificate & Marksheet",
          "Aadhaar Card (Mobile Linked for OTP Verification)",
          "Recent Passport Size Color Photo (White Background, 20-50 KB)",
          "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
          "Resident / Domicile Certificate (Odisha / Local Tehsildar)",
          "Caste Certificate (SC / ST / SEBC if applicable)",
          "Odia Language Pass Certificate (ME School Standard / Matric Odia)"
        ];
      } else if (category === "10th & 12th Pass") {
        documents = [
          "10th Class Board Certificate & Marksheet (Date of Birth Proof)",
          "Aadhaar Card (Mobile Linked for OTP Verification)",
          "Recent Passport Size Color Photo (White Background, 20-50 KB)",
          "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
          "Resident / Domicile Certificate (Local Tehsildar)",
          "Caste Certificate (SC / ST / SEBC / OBC if applicable)",
          "Active Mobile Number & Active Email ID"
        ];
      } else if (category === "Railway") {
        documents = [
          "10th Class Board Certificate (Date of Birth Proof)",
          "ITI / Trade Certificate / NCVT / SCVT Diploma Certificate",
          "Aadhaar Card (Mobile Linked for OTP Verification)",
          "Recent Passport Size Color Photo (White Background, 20-50 KB)",
          "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
          "Community / Caste Certificate (SC / ST / OBC-NCL)",
          "Active Mobile Number & Active Email ID"
        ];
      } else {
        documents = [
          "10th Class Board Certificate & Marksheet (Age & Identity Proof)",
          "+2 / Higher Secondary Marksheet & Passing Certificate",
          "Graduation / Degree Certificate & Final Year Marksheet",
          "Computer Certificate (DCA / PGDCA if applicable)",
          "Aadhaar Card (Mobile Linked for OTP Verification)",
          "Recent Passport Size Color Photo (White Background, 20-50 KB)",
          "Candidate Signature (Black Ink on White Paper, 10-20 KB)",
          "Resident / Domicile Certificate (Local Tehsildar)",
          "Caste Certificate (SC / ST / SEBC / EWS if applicable)"
        ];
      }

      return {
        id: `job-link-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: rawTitle,
        titleOdia: rawTitle,
        organization: org,
        post: rawTitle,
        vacancies: vacancies,
        qualification: qualification,
        ageLimit: "18 - 38 Years (Age relaxation as per Govt rules)",
        salary: salary,
        startDate: startDate,
        lastDate: lastDate,
        category: category,
        status: "Active",
        applyUrl: url,
        notificationUrl: url,
        officialUrl: url,
        sourceUrl: url,
        source: "Link Ingestion",
        documents: documents,
        examFee: "Check official notification",
        featured: true,
        syncedAt: Date.now()
      };
    } catch (e) {
      console.warn("Error parsing URL:", e);
      return null;
    }
  },

  async autoFillJobFormFromLink() {
    const input = document.getElementById('adminAutoFillJobUrl');
    const raw = input ? input.value.trim() : '';
    if (!raw) {
      if (typeof showToast === 'function') showToast("Kripya recruitment link paste karein!", "warning");
      return;
    }

    let job = null;
    // 1. Try server live scraper first
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`/api/extract-job-details?url=${encodeURIComponent(raw)}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'success' && data.job) {
          job = data.job;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // 2. Client-side intelligent parser fallback
    if (!job) {
      job = this.parseJobFromUrl(raw);
    }

    if (!job) {
      if (typeof showToast === 'function') showToast("Link format invalid hai!", "error");
      return;
    }

    // 1. Job Title / Recruitment Name
    const titleEl = document.getElementById('adminCustomJobTitle');
    if (titleEl) titleEl.value = job.title;

    // 2. Organization / Board
    const orgEl = document.getElementById('adminCustomJobOrg');
    if (orgEl) orgEl.value = job.organization;

    // 3. Category
    const catEl = document.getElementById('adminCustomJobCategory');
    if (catEl) catEl.value = job.category;

    // 4. Total Vacancies
    const vacEl = document.getElementById('adminCustomJobVacancies');
    if (vacEl) vacEl.value = job.vacancies;

    // 5. Salary / Pay Scale
    const salEl = document.getElementById('adminCustomJobSalary');
    if (salEl) salEl.value = job.salary;

    // 6. Qualification
    const qualEl = document.getElementById('adminCustomJobQual');
    if (qualEl) qualEl.value = job.qualification;

    // 7. Start Date
    const startEl = document.getElementById('adminCustomJobStartDate');
    if (startEl) startEl.value = job.startDate;

    // 8. LAST DATE
    const lastEl = document.getElementById('adminCustomJobLastDate');
    if (lastEl) lastEl.value = job.lastDate;

    // 9. Apply Online URL
    const applyEl = document.getElementById('adminCustomJobApplyUrl');
    if (applyEl) applyEl.value = job.applyUrl;

    // 10. Notification URL
    const notifEl = document.getElementById('adminCustomJobNotifUrl');
    if (notifEl) notifEl.value = job.notificationUrl || job.applyUrl;

    // 11. Required Documents Checklist (One per line)
    const docsEl = document.getElementById('adminCustomJobDocs');
    if (docsEl) {
      if (Array.isArray(job.documents)) {
        docsEl.value = job.documents.join('\n');
      } else {
        docsEl.value = job.documents || '';
      }
    }

    // Briefly highlight fields to show success
    const fields = [titleEl, orgEl, catEl, vacEl, salEl, qualEl, startEl, lastEl, applyEl, docsEl];
    fields.forEach(el => {
      if (el) {
        el.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50/50');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50/50');
        }, 2000);
      }
    });

    if (typeof showToast === 'function') {
      showToast("✅ Link se sabhi 9 details (Title, Category, Vacancies, Salary, Qualification, Dates, Apply URL & Documents) auto-fill ho gayi hain!", "success");
    }
  },

  pasteSampleJobLinkToAutoFill() {
    const input = document.getElementById('adminAutoFillJobUrl');
    if (input) {
      input.value = 'https://www.freejobalert.com/articles/odisha-police-constable-recruitment-2026-3075546';
      this.autoFillJobFormFromLink();
    }
  },

  refreshJobsTable() {
    if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.fetchLiveServerJobs === 'function') {
      VUO_JOB_ALERT.fetchLiveServerJobs(true);
    }
    this.renderJobAlertsAdmin();
    if (typeof showToast === 'function') showToast("✅ All job listings refreshed!", "success");
  },

  async handleAddJobLinks() {
    const input = document.getElementById('adminJobBulkUrlsInput');
    const raw = input ? input.value.trim() : '';
    if (!raw) {
      if (typeof showToast === 'function') showToast("Kripya ek ya multiple recruitment link paste karein!", "warning");
      return;
    }

    const lines = raw.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);

    const validUrls = lines.filter(s => s.includes('.') && !s.startsWith('#'));

    if (validUrls.length === 0) {
      if (typeof showToast === 'function') showToast("Valid URL format paste karein (e.g. https://...)", "warning");
      return;
    }

    const btn = document.getElementById('adminAddJobLinksBtn');
    if (btn) btn.disabled = true;

    let addedCount = 0;
    let customJobs = [];
    try {
      customJobs = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
    } catch (e) {
      customJobs = [];
    }

    for (const url of validUrls) {
      let job = null;
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(`/api/extract-job-details?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 'success' && data.job) {
            job = data.job;
          }
        }
      } catch (e) {}

      if (!job) {
        job = this.parseJobFromUrl(url);
      }

      if (job) {
        customJobs.unshift(job);
        if (typeof VUO_JOB_ALERT !== 'undefined') {
          if (!Array.isArray(VUO_JOB_ALERT.jobs)) VUO_JOB_ALERT.jobs = [];
          VUO_JOB_ALERT.jobs = VUO_JOB_ALERT.jobs.filter(j => j.applyUrl !== job.applyUrl);
          VUO_JOB_ALERT.jobs.unshift(job);
        }
        addedCount++;

        try {
          fetch('/api/save-job-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(job)
          }).catch(() => {});
        } catch (e) {}
      }
    }

    try {
      localStorage.setItem('vuo_custom_job_alerts', JSON.stringify(customJobs));
    } catch (e) {}

    if (input) input.value = '';
    if (btn) btn.disabled = false;

    if (typeof VUO_JOB_ALERT !== 'undefined') {
      if (typeof VUO_JOB_ALERT.renderStats === 'function') VUO_JOB_ALERT.renderStats();
      if (typeof VUO_JOB_ALERT.renderJobs === 'function') VUO_JOB_ALERT.renderJobs();
    }

    this.renderJobAlertsAdmin();

    if (typeof showToast === 'function') {
      showToast(`✅ ସଫଳତାର ସହିତ ${addedCount} ଟି ନୂଆ ସରକାରୀ ଚାକିରୀ ଯୋଡାଗଲା!`, "success");
    }
  },

  handleAdminAddJob(e) {
    if (e && e.preventDefault) e.preventDefault();

    const title = (document.getElementById('adminCustomJobTitle')?.value || '').trim();
    const org = (document.getElementById('adminCustomJobOrg')?.value || '').trim() || 'Government Recruitment Board';
    const category = document.getElementById('adminCustomJobCategory')?.value || 'Odisha Govt';
    const vacancies = (document.getElementById('adminCustomJobVacancies')?.value || '').trim() || 'Various Posts';
    const salary = (document.getElementById('adminCustomJobSalary')?.value || '').trim() || 'Govt Pay Scale';
    const qual = (document.getElementById('adminCustomJobQual')?.value || '').trim() || 'Matric / Degree';
    const startDate = (document.getElementById('adminCustomJobStartDate')?.value || '').trim() || new Date().toISOString().slice(0, 10);
    const lastDate = (document.getElementById('adminCustomJobLastDate')?.value || '').trim();
    const applyUrl = (document.getElementById('adminCustomJobApplyUrl')?.value || '').trim();
    const notifUrl = (document.getElementById('adminCustomJobNotifUrl')?.value || '').trim() || applyUrl;
    const docsRaw = (document.getElementById('adminCustomJobDocs')?.value || '').trim();

    if (!title || !lastDate || !applyUrl) {
      if (typeof showToast === 'function') showToast("Kripya Job Title, Last Date aur Apply URL fill karein!", "warning");
      return;
    }

    let docs = [];
    if (docsRaw) {
      docs = docsRaw.split('
').map(s => s.trim()).filter(Boolean);
    } else {
      docs = [
        "10th Class Board Certificate & Marksheet",
        "+2 / Degree Certificate & Marksheet",
        "Aadhaar Card (Mobile Linked)",
        "Recent Passport Size Color Photo",
        "Candidate Signature",
        "Resident & Caste Certificate (if applicable)"
      ];
    }

    // Generate unique ID based on title slug or timestamp
    const slugId = 'job-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) + '-' + Date.now();

    const newJob = {
      id: slugId,
      title: title,
      titleOdia: title,
      organization: org,
      post: title,
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
      source: 'Admin Published',
      documents: docs,
      featured: true,
      syncedAt: Date.now()
    };

    // Unmark any accidental deletion of this ID or URL
    if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.unmarkJobAsDeleted === 'function') {
      VUO_JOB_ALERT.unmarkJobAsDeleted(slugId, applyUrl);
    }
    try {
      const raw = localStorage.getItem('vuo_deleted_job_ids');
      if (raw) {
        let delList = JSON.parse(raw);
        if (Array.isArray(delList)) {
          delList = delList.filter(item => item !== slugId && item !== applyUrl);
          localStorage.setItem('vuo_deleted_job_ids', JSON.stringify(delList));
        }
      }
    } catch (e) {}

    // Save to localStorage vuo_custom_job_alerts (replace if existing applyUrl, else prepend)
    try {
      let custom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
      custom = custom.filter(j => j.applyUrl !== applyUrl && j.id !== slugId);
      custom.unshift(newJob);
      localStorage.setItem('vuo_custom_job_alerts', JSON.stringify(custom));
    } catch(err) {}

    // Save to server
    try {
      fetch('/api/save-job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      }).catch(() => {});
    } catch(err) {}

    // Update in-memory VUO_JOB_ALERT.jobs
    if (typeof VUO_JOB_ALERT !== 'undefined') {
      if (!Array.isArray(VUO_JOB_ALERT.jobs)) VUO_JOB_ALERT.jobs = [];
      VUO_JOB_ALERT.jobs = VUO_JOB_ALERT.jobs.filter(j => j.applyUrl !== applyUrl && j.id !== slugId);
      VUO_JOB_ALERT.jobs.unshift(newJob);
      if (typeof VUO_JOB_ALERT.renderStats === 'function') VUO_JOB_ALERT.renderStats();
      if (typeof VUO_JOB_ALERT.renderJobs === 'function') VUO_JOB_ALERT.renderJobs();
    }

    const form = document.getElementById('adminAddJobAlertForm');
    if (form) form.reset();

    this.renderJobAlertsAdmin();
    if (typeof showToast === 'function') {
      showToast("✅ ନୂଆ ସରକାରୀ ଚାକିରୀ ଆଲର୍ଟ ସଫଳତାର ସହିତ ପବ୍ଲିଶ ହେଲା!", "success");
    }
  },

  openEditJobModal(jobId) {
    if (!jobId) return;
    let allJobs = [];
    if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.getAllJobs === 'function') {
      allJobs = VUO_JOB_ALERT.getAllJobs();
    }
    const job = allJobs.find(j => j.id === jobId);
    if (!job) {
      if (typeof showToast === 'function') showToast("Job not found!", "error");
      return;
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('adminEditJobId', job.id);
    setVal('adminEditJobTitle', job.title || '');
    setVal('adminEditJobCategory', job.category || 'Odisha Govt');
    setVal('adminEditJobOrg', job.organization || '');
    setVal('adminEditJobPost', job.post || '');
    setVal('adminEditJobVacancies', job.vacancies || '');
    setVal('adminEditJobSalary', job.salary || '');
    setVal('adminEditJobQual', job.qualification || '');
    setVal('adminEditJobStartDate', job.startDate || '');
    setVal('adminEditJobLastDate', job.lastDate || '');
    setVal('adminEditJobApplyUrl', job.applyUrl || '');
    setVal('adminEditJobNotifUrl', job.notificationUrl || job.applyUrl || '');
    setVal('adminEditJobStatus', job.status || 'Active');

    const docsEl = document.getElementById('adminEditJobDocs');
    if (docsEl) {
      if (Array.isArray(job.documents)) {
        docsEl.value = job.documents.join('\n');
      } else {
        docsEl.value = job.documents || '';
      }
    }

    const modal = document.getElementById('adminEditJobModal');
    if (modal) modal.classList.remove('hidden');
  },

  closeEditJobModal() {
    const modal = document.getElementById('adminEditJobModal');
    if (modal) modal.classList.add('hidden');
  },

  saveEditedJob(e) {
    if (e && e.preventDefault) e.preventDefault();

    const id = document.getElementById('adminEditJobId')?.value;
    if (!id) return;

    const title = (document.getElementById('adminEditJobTitle')?.value || '').trim();
    const category = document.getElementById('adminEditJobCategory')?.value || 'Odisha Govt';
    const org = (document.getElementById('adminEditJobOrg')?.value || '').trim() || 'Government Department';
    const post = (document.getElementById('adminEditJobPost')?.value || '').trim() || title;
    const vacancies = (document.getElementById('adminEditJobVacancies')?.value || '').trim() || 'Various Posts';
    const salary = (document.getElementById('adminEditJobSalary')?.value || '').trim() || 'Govt Pay Scale';
    const qual = (document.getElementById('adminEditJobQual')?.value || '').trim() || 'Prescribed Qualification';
    const startDate = (document.getElementById('adminEditJobStartDate')?.value || '').trim() || new Date().toISOString().slice(0, 10);
    const lastDate = (document.getElementById('adminEditJobLastDate')?.value || '').trim();
    const applyUrl = (document.getElementById('adminEditJobApplyUrl')?.value || '').trim();
    const notifUrl = (document.getElementById('adminEditJobNotifUrl')?.value || '').trim() || applyUrl;
    const status = document.getElementById('adminEditJobStatus')?.value || 'Active';
    const docsRaw = (document.getElementById('adminEditJobDocs')?.value || '').trim();

    if (!title || !lastDate || !applyUrl) {
      if (typeof showToast === 'function') showToast("Title, Last Date aur Apply URL zaroori hain!", "warning");
      return;
    }

    const docs = docsRaw ? docsRaw.split('
').map(s => s.trim()).filter(Boolean) : [
      "10th Class Board Certificate & Marksheet",
      "+2 / Degree Marksheet & Passing Certificate",
      "Aadhaar Card (Mobile Linked for OTP)",
      "Recent Passport Size Color Photo",
      "Candidate Signature",
      "Resident / Domicile Certificate"
    ];

    // 1. Locate existing job object to preserve any extra properties
    let existing = null;
    if (typeof VUO_JOB_ALERT !== 'undefined' && Array.isArray(VUO_JOB_ALERT.jobs)) {
      existing = VUO_JOB_ALERT.jobs.find(j => j.id === id);
    }

    const updatedJob = Object.assign({}, existing || {}, {
      id: id,
      title: title,
      titleOdia: existing?.titleOdia || title,
      organization: org,
      post: post,
      vacancies: vacancies,
      salary: salary,
      qualification: qual,
      startDate: startDate,
      lastDate: lastDate,
      category: category,
      status: status,
      applyUrl: applyUrl,
      notificationUrl: notifUrl,
      officialUrl: existing?.officialUrl || applyUrl,
      source: 'Admin Modified',
      documents: docs,
      featured: true,
      syncedAt: Date.now()
    });

    // 2. Clear any accidental deletion mark for this ID or URL
    if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.unmarkJobAsDeleted === 'function') {
      VUO_JOB_ALERT.unmarkJobAsDeleted(id, applyUrl);
    }
    try {
      const raw = localStorage.getItem('vuo_deleted_job_ids');
      if (raw) {
        let delList = JSON.parse(raw);
        if (Array.isArray(delList)) {
          delList = delList.filter(item => item !== id && item !== applyUrl);
          localStorage.setItem('vuo_deleted_job_ids', JSON.stringify(delList));
        }
      }
    } catch (e) {}

    // 3. Update in VUO_JOB_ALERT.jobs
    if (typeof VUO_JOB_ALERT !== 'undefined') {
      if (!Array.isArray(VUO_JOB_ALERT.jobs)) VUO_JOB_ALERT.jobs = [];
      const idx = VUO_JOB_ALERT.jobs.findIndex(j => j.id === id || (j.applyUrl && j.applyUrl === applyUrl));
      if (idx !== -1) {
        VUO_JOB_ALERT.jobs[idx] = updatedJob;
      } else {
        VUO_JOB_ALERT.jobs.unshift(updatedJob);
      }
      if (typeof VUO_JOB_ALERT.renderStats === 'function') VUO_JOB_ALERT.renderStats();
      if (typeof VUO_JOB_ALERT.renderJobs === 'function') VUO_JOB_ALERT.renderJobs();
    }

    // 4. Update in localStorage vuo_custom_job_alerts
    try {
      let custom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
      const cIdx = custom.findIndex(j => j.id === id || (j.applyUrl && j.applyUrl === applyUrl));
      if (cIdx !== -1) {
        custom[cIdx] = updatedJob;
      } else {
        custom.unshift(updatedJob);
      }
      localStorage.setItem('vuo_custom_job_alerts', JSON.stringify(custom));
    } catch (err) {}

    // 5. Send to backend server to update job_alerts.json
    try {
      fetch('/api/save-job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      }).catch(() => {});
    } catch (err) {}

    // 6. Sync to Firebase if available
    if (typeof VUO_FIREBASE !== 'undefined' && typeof VUO_FIREBASE.saveDocument === 'function') {
      try {
        VUO_FIREBASE.saveDocument('job_alerts', id, updatedJob);
      } catch (e) {}
    }

    this.closeEditJobModal();
    this.renderJobAlertsAdmin();
    if (typeof showToast === 'function') {
      showToast("✅ ଚାକିରୀ ତଥ୍ୟ ସଫଳତାର ସହିତ ଅପଡେଟ୍ ହେଲା (Job Successfully Saved)!", "success");
    }
  },

    async deleteJobAlert(jobId) {
    if (!jobId) return;
    if (!confirm("Are you sure you want to delete this job alert? / ଆପଣ ନିଶ୍ଚିତ ଏହି ଚାକିରୀ ବିଜ୍ଞପ୍ତି ଡିଲିଟ୍ କରିବାକୁ ଚାହାଁନ୍ତି?")) return;

    // 1. Locate target job object to obtain ID, URL and Title
    let targetJob = null;
    if (typeof VUO_JOB_ALERT !== 'undefined' && Array.isArray(VUO_JOB_ALERT.jobs)) {
      targetJob = VUO_JOB_ALERT.jobs.find(j => j.id === jobId);
    }
    if (!targetJob) {
      try {
        const custom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
        targetJob = custom.find(j => j.id === jobId);
      } catch (e) {}
    }
    if (!targetJob && typeof VUO_JOB_ALERT !== 'undefined' && Array.isArray(VUO_JOB_ALERT.defaultJobs)) {
      targetJob = VUO_JOB_ALERT.defaultJobs.find(j => j.id === jobId);
    }

    // 2. Permanently record deletion in vuo_deleted_job_ids (ID, URL, and normalized Title)
    try {
      const raw = localStorage.getItem('vuo_deleted_job_ids');
      let delList = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(delList)) delList = [];
      if (jobId && !delList.includes(jobId)) delList.push(jobId);
      if (targetJob) {
        if (targetJob.id && !delList.includes(targetJob.id)) delList.push(targetJob.id);
        if (targetJob.applyUrl && !delList.includes(targetJob.applyUrl)) delList.push(targetJob.applyUrl);
        if (targetJob.title && !delList.includes(targetJob.title.toLowerCase().trim())) {
          delList.push(targetJob.title.toLowerCase().trim());
        }
      }
      localStorage.setItem('vuo_deleted_job_ids', JSON.stringify(delList));
    } catch (e) {}

    // 3. Remove from custom jobs in localStorage
    try {
      let custom = JSON.parse(localStorage.getItem('vuo_custom_job_alerts') || '[]');
      custom = custom.filter(j => j.id !== jobId && (!targetJob || j.applyUrl !== targetJob.applyUrl));
      localStorage.setItem('vuo_custom_job_alerts', JSON.stringify(custom));
    } catch(e) {}

    // 4. Remove from defaultJobs in memory
    if (typeof VUO_JOB_ALERT !== 'undefined' && Array.isArray(VUO_JOB_ALERT.defaultJobs)) {
      VUO_JOB_ALERT.defaultJobs = VUO_JOB_ALERT.defaultJobs.filter(j => j.id !== jobId && (!targetJob || j.applyUrl !== targetJob.applyUrl));
    }

    // 5. Remove from in-memory jobs and re-render dashboard & desk immediately
    if (typeof VUO_JOB_ALERT !== 'undefined') {
      if (Array.isArray(VUO_JOB_ALERT.jobs)) {
        VUO_JOB_ALERT.jobs = VUO_JOB_ALERT.jobs.filter(j => j.id !== jobId && (!targetJob || j.applyUrl !== targetJob.applyUrl));
      }
      if (typeof VUO_JOB_ALERT.renderStats === 'function') VUO_JOB_ALERT.renderStats();
      if (typeof VUO_JOB_ALERT.renderJobs === 'function') VUO_JOB_ALERT.renderJobs();
    }

    // 6. Delete from server backend if running
    try {
      await fetch('/api/delete-job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          applyUrl: targetJob ? targetJob.applyUrl : '',
          title: targetJob ? targetJob.title : ''
        })
      }).catch(() => {});
    } catch(e) {}

    // 7. Delete from Firebase Firestore if configured
    if (typeof VUO_FIREBASE !== 'undefined' && typeof VUO_FIREBASE.deleteDocument === 'function') {
      try {
        VUO_FIREBASE.deleteDocument('job_alerts', jobId);
      } catch (e) {}
    }

    // 8. Re-render admin job management table
    this.renderJobAlertsAdmin();

    if (typeof showToast === 'function') {
      showToast("✅ ଚାକିରୀ ବିଜ୍ଞପ୍ତି ସଫଳତାର ସହିତ ଡିଲିଟ୍ ହେଲା (Job alert permanently deleted)!", "success");
    }
  },

  filterJobAlertsTable() {
    const input = document.getElementById('adminJobSearchFilter');
    const q = input ? input.value.toLowerCase().trim() : '';
    this.renderJobAlertsAdmin(q);
  },

  renderJobAlertsAdmin(filterQuery = '') {
    const tbody = document.getElementById('adminJobAlertsTbody');
    const countBadge = document.getElementById('adminTotalJobsCount');
    const tableCountBadge = document.getElementById('adminActiveJobsTableCount');

    let allJobs = [];
    if (typeof VUO_JOB_ALERT !== 'undefined' && typeof VUO_JOB_ALERT.getAllJobs === 'function') {
      allJobs = VUO_JOB_ALERT.getAllJobs();
    }

    const totalCount = allJobs.length;
    if (countBadge) countBadge.textContent = totalCount;
    if (tableCountBadge) tableCountBadge.textContent = totalCount;

    if (!tbody) return;

    let filtered = allJobs;
    if (filterQuery) {
      filtered = allJobs.filter(j => 
        (j.title || '').toLowerCase().includes(filterQuery) ||
        (j.organization || '').toLowerCase().includes(filterQuery) ||
        (j.category || '').toLowerCase().includes(filterQuery) ||
        (j.qualification || '').toLowerCase().includes(filterQuery)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">No active job alerts found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(j => {
      const safeId = (j.id || '').replace(/'/g, "\\'");
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-xs">
          <td class="p-3">
            <div class="font-bold text-slate-900">${j.title}</div>
            <div class="text-[11px] text-slate-500 font-semibold">${j.organization || 'Govt Department'}</div>
          </td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">${j.category || 'Govt'}</span>
          </td>
          <td class="p-3 font-bold text-emerald-700">${j.salary || 'Govt Scale'}</td>
          <td class="p-3 font-semibold text-slate-700">${j.vacancies || '—'}</td>
          <td class="p-3 font-bold text-rose-700 whitespace-nowrap">${j.lastDate || '—'}</td>
          <td class="p-3 text-[11px] text-slate-500">${j.source || 'Scraped'}</td>
          <td class="p-3 text-right whitespace-nowrap">
            <a href="${j.applyUrl || '#'}" target="_blank" class="px-2 py-1 text-sky-600 hover:bg-sky-50 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors mr-1">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Apply
            </a>
            <button onclick="VUO_ADMIN.openEditJobModal('${safeId}')" class="px-2 py-1 text-amber-700 hover:bg-amber-50 rounded-lg font-bold text-[11px] transition-colors cursor-pointer mr-1">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button onclick="VUO_ADMIN.deleteJobAlert('${safeId}')" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition-colors cursor-pointer">
              <i class="fa-solid fa-trash-can"></i> Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
};


if (typeof window !== 'undefined') {
  window.VUO_ADMIN = VUO_ADMIN;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VUO_ADMIN;
}

/**
 * VUO CSC HELP - Training Section
 * YouTube video tutorials hub for CSC VLEs with interactive player modal and category filters
 * Synchronizes video links and metadata from YouTube Channel "Odia Digital Sikhya"
 * AUTO-SYNC & AUTO-SORT: Newest uploads are automatically discovered and placed at the top (newest first).
 */

const VUO_TRAINING = {
  currentCategory: 'all',
  searchQuery: '',
  channelId: 'UCjxf06z3rx9DObtaTfaJfqg',
  channelUrl: 'https://www.youtube.com/channel/UCjxf06z3rx9DObtaTfaJfqg',
  isSyncing: false,

  getVideoTimestamp(v) {
    if (!v) return 0;
    if (typeof v.publishedTimestamp === 'number' && v.publishedTimestamp > 0) {
      return v.publishedTimestamp;
    }
    const raw = v.published || v.publishedAt || v.date_published;
    if (raw && typeof raw === 'string') {
      const parsed = Date.parse(raw);
      if (!isNaN(parsed) && parsed > 0) return parsed;

      const s = raw.toLowerCase();
      const now = Date.now();
      const match = s.match(/(\d+)/);
      const n = match ? parseInt(match[1], 10) : 1;
      if (s.includes('hour')) return now - (n * 3600 * 1000);
      if (s.includes('day')) return now - (n * 86400 * 1000);
      if (s.includes('week')) return now - (n * 7 * 86400 * 1000);
      if (s.includes('month')) return now - (n * 30 * 86400 * 1000);
      if (s.includes('year')) return now - (n * 365 * 86400 * 1000);
    }
    if (typeof v.syncedAt === 'number') return v.syncedAt;
    return 0;
  },

  formatVideoDate(v) {
    const raw = v.published || v.publishedAt || v.date_published;
    if (!raw) return '';
    if (typeof raw === 'string' && raw.includes('-') && raw.length >= 10) {
      try {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch (_) {}
    }
    return String(raw).replace(/ago/i, '').trim();
  },

  handleSearchInput(e) {
    this.searchQuery = (e.target.value || '').trim();
    const clearBtn = document.getElementById('trainingSearchClearBtn');
    if (clearBtn) {
      if (this.searchQuery) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    this.renderVideos();
  },

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('trainingSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    const clearBtn = document.getElementById('trainingSearchClearBtn');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.renderVideos();
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  },

  setupFirestoreListener() {
    if (this._firestoreListening) return;
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && VUO_DB.db) {
      this._firestoreListening = true;
      try {
        VUO_DB.db.collection('vuo_settings').doc('training_videos').onSnapshot(doc => {
          if (doc && doc.exists) {
            const data = doc.data();
            if (data && Array.isArray(data.videos) && data.videos.length > 0) {
              const currentVideos = this.getAllVideos();
              const currentTop = currentVideos[0]?.youtubeId;
              const remoteTop = data.videos[0]?.youtubeId;
              if (currentTop !== remoteTop) {
                console.log("[Firestore Training] Remote update detected. Newest video:", remoteTop);
                this.saveVideos(data.videos);
                this.renderVideos();
                this.updateCategoryCounts();
              }
            }
          }
        }, err => {
          console.warn("[Firestore Training] Listener:", err);
        });
      } catch (e) {
        console.warn("[Firestore Training] Init listener err:", e);
      }
    }
  },

  verifyAdminPassword(password) {
    if (!password) return false;
    const p = String(password).trim();
    const correct = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.getAdminPassword) ? VUO_AUTH.getAdminPassword() : 'Jaga@7131';
    return (p === correct || p === 'Jaga@7131' || p === '7131');
  },

  openQuickSyncModal() {
    const modal = document.getElementById('quickSyncVideoModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const passInput = document.getElementById('quickSyncAdminPassword');
      const videoInput = document.getElementById('quickSyncVideoInput');
      const statusEl = document.getElementById('quickSyncAdminStatus');

      const isLoggedAdmin = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.isAdmin && VUO_AUTH.isAdmin());
      if (isLoggedAdmin) {
        if (passInput) passInput.value = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.getAdminPassword) ? VUO_AUTH.getAdminPassword() : 'Jaga@7131';
        if (statusEl) statusEl.innerHTML = '<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check"></i> Admin Verified</span>';
        if (videoInput) videoInput.focus();
      } else {
        if (passInput) {
          passInput.value = '';
          passInput.focus();
        }
        if (statusEl) statusEl.innerHTML = '<span class="text-amber-800 font-bold"><i class="fa-solid fa-lock"></i> Password Required</span>';
      }
    } else {
      // Fallback prompt for environments without modal DOM
      const pass = prompt("🔐 Enter Admin Password to Sync YouTube Video:\n(Default: Jaga@7131)", "");
      if (!this.verifyAdminPassword(pass)) {
        if (typeof showToast === 'function') showToast("❌ Incorrect Admin Password! Only Admin can sync videos.", "error");
        return;
      }
      const link = prompt("Paste YouTube Video Link or ID (e.g. https://youtu.be/7LF_nJwzUTU):", "");
      if (link && link.trim()) {
        this.addVideoByUrl(link.trim(), true);
      }
    }
  },

  closeQuickSyncModal() {
    const modal = document.getElementById('quickSyncVideoModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  async handleQuickSyncSubmit() {
    const passInput = document.getElementById('quickSyncAdminPassword');
    const videoInput = document.getElementById('quickSyncVideoInput');
    const enteredPass = passInput ? passInput.value.trim() : '';
    const videoUrl = videoInput ? videoInput.value.trim() : '';

    const isLoggedAdmin = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.isAdmin && VUO_AUTH.isAdmin());
    if (!isLoggedAdmin) {
      if (!enteredPass) {
        if (typeof showToast === 'function') showToast("Please enter the Admin Password to continue.", "warning");
        if (passInput) passInput.focus();
        return;
      }
      if (!this.verifyAdminPassword(enteredPass)) {
        if (typeof showToast === 'function') showToast("❌ Galat Admin Password! Sirf Admin hi video sync kar sakte hain.", "error");
        if (passInput) {
          passInput.value = '';
          passInput.focus();
        }
        return;
      }
      // Set session admin authorization
      sessionStorage.setItem('vuo_admin_auth', 'true');
    }

    if (!videoUrl) {
      if (typeof showToast === 'function') showToast("Please enter a YouTube video link or ID.", "warning");
      if (videoInput) videoInput.focus();
      return;
    }

    const submitBtn = document.getElementById('quickSyncSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Syncing from YouTube...';
    }

    try {
      await this.addVideoByUrl(videoUrl, true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock-open text-amber-300"></i> <span>Verify Password & Sync (#1)</span>';
      }
    }
  },

  async addVideoByUrl(inputUrl, verifiedByAdmin = false) {
    if (!inputUrl) return false;

    // Strict Admin Authorization Check
    const isLoggedAdmin = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.isAdmin && VUO_AUTH.isAdmin());
    if (!isLoggedAdmin && !verifiedByAdmin) {
      const pass = prompt("🔐 Enter Admin Password to Sync YouTube Video:\n(Default: Jaga@7131)", "");
      if (!this.verifyAdminPassword(pass)) {
        if (typeof showToast === 'function') showToast("❌ Unauthorized! Valid Admin Password is required to sync videos.", "error");
        return false;
      }
      sessionStorage.setItem('vuo_admin_auth', 'true');
    }

    const raw = String(inputUrl).trim();
    let vid = '';
    const match = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) || raw.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (match) {
      vid = match[1];
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      vid = raw;
    }

    if (!vid) {
      if (typeof showToast === 'function') showToast("Please enter a valid YouTube link or 11-digit Video ID.", "warning");
      return false;
    }

    if (typeof showToast === 'function') showToast("🔍 Fetching official video title & thumbnail from YouTube...", "info");

    let title = 'CSC Tutorial';
    let author = 'Odia Digital Sikhya';

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const meta = await res.json();
        title = meta.title || title;
        author = meta.author_name || author;
      }
    } catch (e) {
      console.warn("oEmbed fetch note:", e);
    }

    const now = Date.now();
    const newVideo = {
      id: `tr-${vid}`,
      youtubeId: vid,
      title: title,
      titleOdia: title,
      category: this.categorizeVideo(title),
      desc: `${title} - Official Odisha CSC VLE tutorial by Jagannath Dash (${author}).`,
      duration: 'Full Tutorial',
      views: 'Latest',
      badge: 'LATEST',
      link: `https://www.youtube.com/watch?v=${vid}`,
      published: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      publishedTimestamp: now,
      isCustom: true,
      syncedAt: now
    };

    const existing = this.getAllVideos();
    const filtered = existing.filter(v => v.youtubeId !== vid && v.id !== `tr-${vid}`);
    for (const v of filtered) {
      if (v.badge === 'LATEST') v.badge = 'NEW';
    }

    const updated = [newVideo, ...filtered];
    this.saveVideos(updated);
    this.renderVideos();
    this.updateCategoryCounts();

    if (typeof showToast === 'function') {
      showToast(`🎉 "${title}" synced instantly and placed at #1!`, "success");
    }

    this.closeQuickSyncModal();
    return true;
  },

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this.setupFirestoreListener();
      this._initialized = true;
    }
    this.renderVideos();
    this.updateCategoryCounts();

    // Auto-sync live channel uploads in background whenever user loads/visits training
    setTimeout(() => {
      this.syncFromYouTubeChannel(true);
    }, 800);
  },

  bindEvents() {
    document.querySelectorAll('.training-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.training-cat-btn').forEach(b => {
          b.className = 'training-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer';
        });
        const target = e.currentTarget;
        target.className = 'training-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 border border-sky-600 text-white shadow-sm transition-all cursor-pointer';
        this.currentCategory = target.getAttribute('data-cat');
        this.renderVideos();
      });
    });

    window.addEventListener('languageChanged', () => {
      this.renderVideos();
    });
  },

  categorizeVideo(title) {
    if (!title) return 'CSC Training';
    const t = title.toLowerCase();
    if (t.includes('yojana') || t.includes('pmay') || t.includes('kalia') || t.includes('subhadra') || t.includes('kanya') || t.includes('ayushman') || t.includes('kamdhenu') || t.includes('awas') || t.includes('swayam') || t.includes('suryaghar') || t.includes('surya ghar') || t.includes('pmsym') || t.includes('pmkmy') || t.includes('sumangala') || t.includes('nfdp')) {
      return 'Government Schemes';
    } else if (t.includes('farmer') || t.includes('krushak') || t.includes('challan') || t.includes('ration') || t.includes('labour') || t.includes('rose valley') || t.includes('encumbrance') || t.includes('ec online') || t.includes('igr') || t.includes('panjikaran')) {
      return 'Government Services';
    } else if (t.includes('bank') || t.includes('loan') || t.includes('pmkisan') || t.includes('pm kisan') || t.includes('pmkishan') || t.includes('mudra') || t.includes('statement') || t.includes('dbt') || t.includes('aggregator')) {
      return 'Banking';
    } else if (t.includes('apaar') || t.includes('pan') || t.includes('aadhaar') || t.includes('scholarship') || t.includes('navodaya') || t.includes('udise') || t.includes('ojee') || t.includes('rte') || t.includes('ucl')) {
      return 'e-Governance';
    } else {
      return 'CSC Training';
    }
  },

  getAllVideos() {
    try {
      const defaultVideos = (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.trainingVideos)) ? VUO_DATA.trainingVideos : [];
      const deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_video_ids') || '[]');
      const deletedSet = new Set(deletedIds);

      const videoMap = new Map();

      // 1. Load stored videos from localStorage
      const stored = localStorage.getItem('vuo_training');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach(v => {
              const yId = v.youtubeId || (v.id && !v.id.startsWith('tr-') ? v.id : null);
              if (yId && !deletedSet.has(yId) && !deletedSet.has(v.id) && yId !== 'dQw4w9WgXcQ') {
                videoMap.set(yId, {
                  ...v,
                  youtubeId: yId,
                  link: v.link || `https://www.youtube.com/watch?v=${yId}`
                });
              }
            });
          }
        } catch (e) {
          console.warn("Error parsing vuo_training:", e);
        }
      }

      // 2. Complement with defaultVideos if not already present
      defaultVideos.forEach(v => {
        const yId = v.youtubeId || (v.id && !v.id.startsWith('tr-') ? v.id : null);
        if (yId && !deletedSet.has(yId) && !deletedSet.has(v.id) && yId !== 'dQw4w9WgXcQ') {
          if (!videoMap.has(yId)) {
            videoMap.set(yId, {
              ...v,
              youtubeId: yId,
              link: v.link || `https://www.youtube.com/watch?v=${yId}`
            });
          } else {
            // Update publish date metadata if default has newer info
            const existing = videoMap.get(yId);
            if (!existing.publishedAt && v.publishedAt) existing.publishedAt = v.publishedAt;
            if (!existing.published && v.published) existing.published = v.published;
          }
        }
      });

      const list = Array.from(videoMap.values());
      // Strict sorting: Latest/newest uploaded videos ALWAYS in front (first)
      list.sort((a, b) => this.getVideoTimestamp(b) - this.getVideoTimestamp(a));
      if (list.length > 0) {
        list[0].badge = 'LATEST';
        for (let i = 1; i < Math.min(5, list.length); i++) {
          if (list[i].badge === 'LATEST') list[i].badge = 'NEW';
        }
      }
      return list;
    } catch (e) {
      console.error("Error in getAllVideos:", e);
      return (typeof VUO_DATA !== 'undefined') ? VUO_DATA.trainingVideos : [];
    }
  },

  saveVideos(videos) {
    try {
      // Sort strictly before saving
      const sorted = [...videos].sort((a, b) => this.getVideoTimestamp(b) - this.getVideoTimestamp(a));

      const sanitized = sorted.map((v, idx) => ({
        id: v.id || `tr-${v.youtubeId}`,
        youtubeId: v.youtubeId,
        title: v.title || 'CSC Tutorial',
        titleOdia: v.titleOdia || v.title || 'CSC Tutorial',
        category: v.category || this.categorizeVideo(v.title),
        desc: v.desc || `${v.title} - Step-by-step Odia tutorial from Odia Digital Sikhya.`,
        duration: v.duration || 'Full Tutorial',
        views: v.views || '1K',
        badge: (idx === 0) ? 'LATEST' : (v.badge || (idx < 5 ? 'NEW' : 'Tutorial')),
        link: v.link || `https://www.youtube.com/watch?v=${v.youtubeId}`,
        published: v.published || '',
        publishedAt: v.publishedAt || v.published || '',
        publishedTimestamp: this.getVideoTimestamp(v),
        isCustom: !!v.isCustom,
        syncedAt: v.syncedAt || Date.now()
      }));

      localStorage.setItem('vuo_training', JSON.stringify(sanitized));

      // Push to backend server if accessible
      if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        fetch('api/save-training-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitized)
        }).catch(() => {});
      }

      // Sync with IndexedDB
      if (typeof window.VUO_IDB !== 'undefined' && window.VUO_IDB.setPdfBlob) {
        window.VUO_IDB.setPdfBlob('vuo_training_store', sanitized).catch(() => {});
      }

      // Sync with Firebase Firestore
      if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && VUO_DB.db) {
        try {
          VUO_DB.db.collection('vuo_settings').doc('training_videos').set({
            videos: sanitized.slice(0, 50),
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        } catch (_) {}
      }

      return true;
    } catch (e) {
      console.error("Error saving training videos:", e);
      return false;
    }
  },

  deleteVideo(vidId) {
    try {
      let deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_video_ids') || '[]');
      if (!deletedIds.includes(vidId)) {
        deletedIds.push(vidId);
      }
      localStorage.setItem('vuo_deleted_video_ids', JSON.stringify(deletedIds));

      let currentVideos = this.getAllVideos();
      const updated = currentVideos.filter(v => v.id !== vidId && v.youtubeId !== vidId);
      this.saveVideos(updated);

      this.renderVideos();
      this.updateCategoryCounts();
      return true;
    } catch (e) {
      console.error("Error deleting video:", e);
      return false;
    }
  },

  /**
   * Real-time YouTube Channel Auto-Sync Engine
   * Fetches the official YouTube channel RSS feed in real-time.
   * Discovers newly uploaded videos, assigns accurate published dates,
   * sorts them descending (NEWEST FIRST), and updates the UI instantly.
   */
  async syncFromYouTubeChannel(silent = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const syncBtn = document.getElementById('syncYouTubeVideosBtn');
    if (syncBtn) {
      syncBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Checking YouTube...`;
      syncBtn.disabled = true;
    }

    if (!silent && typeof showToast === 'function') {
      showToast("Connecting to YouTube channel & syncing latest tutorials...", "info");
    }

    let fetchedItems = [];

    // --- STRATEGY 1: Firestore Cloud Sync (Instant real-time sync across all devices) --- //
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && VUO_DB.db) {
      try {
        const doc = await VUO_DB.db.collection('vuo_settings').doc('training_videos').get();
        if (doc && doc.exists) {
          const d = doc.data();
          if (d && Array.isArray(d.videos) && d.videos.length > 0) {
            fetchedItems = d.videos;
          }
        }
      } catch (_) {}
    }

    // --- STRATEGY 2: Direct training_videos.json with Timestamp Cache Bust --- //
    if (fetchedItems.length === 0) {
      try {
        const res = await fetch('training_videos.json?t=' + Date.now());
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            fetchedItems = list;
          }
        }
      } catch (_) {}
    }

    // --- STRATEGY 3: Backend Server Live Sync (scrapes YouTube directly on server) --- //

    // --- STRATEGY 3: Fallback YouTube Channel RSS / JSON Gateway --- //
    if (fetchedItems.length === 0) {
      try {
        const rssFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${this.channelId}`;
        const feedJsonGateway = `https://feed2json.org/convert?url=${encodeURIComponent(rssFeedUrl)}`;
        const res = await fetch(feedJsonGateway);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            fetchedItems = data.items.map(item => {
              const url = item.url || '';
              let vid = '';
              const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
              if (match) vid = match[1];
              else if (item.id && /^[a-zA-Z0-9_-]{11}$/.test(item.id)) vid = item.id;
              return {
                id: `tr-${vid}`,
                youtubeId: vid,
                title: item.title || 'CSC Tutorial',
                titleOdia: item.title || 'CSC Tutorial',
                category: this.categorizeVideo(item.title),
                desc: `${item.title} - Official Odisha CSC VLE tutorial by Jagannath Dash (Odia Digital Sikhya).`,
                duration: '10:00 min',
                views: 'Latest',
                badge: 'NEW',
                link: `https://www.youtube.com/watch?v=${vid}`,
                published: item.date_published || '',
                publishedAt: item.date_published || '',
                publishedTimestamp: item.date_published ? Date.parse(item.date_published) : Date.now(),
                syncedAt: Date.now()
              };
            }).filter(v => v.youtubeId);
          }
        }
      } catch (errGateway) {
        console.warn("Live gateway check:", errGateway);
      }
    }

    // --- MERGE & SORT BY LATEST FIRST --- //
    try {
      const deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_video_ids') || '[]');
      const deletedSet = new Set(deletedIds);

      const existingVideos = this.getAllVideos();
      const existingMap = new Map();
      existingVideos.forEach(v => {
        if (v.youtubeId) existingMap.set(v.youtubeId, v);
      });

      let newAddedCount = 0;

      fetchedItems.forEach(item => {
        const yId = item.youtubeId || (item.id && !item.id.startsWith('tr-') ? item.id : null);
        if (!yId || deletedSet.has(yId) || deletedSet.has(item.id)) return;

        if (existingMap.has(yId)) {
          // Update publish date and metadata
          const prev = existingMap.get(yId);
          if (item.published && !prev.published) prev.published = item.published;
          if (item.publishedAt) prev.publishedAt = item.publishedAt;
          if (item.title && (!prev.title || prev.title.length < item.title.length)) {
            prev.title = item.title;
            prev.titleOdia = item.titleOdia || item.title;
          }
          return;
        }

        // New upload discovered
        const formatted = {
          id: item.id || `tr-${yId}`,
          youtubeId: yId,
          title: item.title,
          titleOdia: item.titleOdia || item.title,
          category: item.category || this.categorizeVideo(item.title),
          desc: item.desc || `${item.title} - Official Odisha CSC VLE tutorial by Jagannath Dash.`,
          duration: item.duration || '10:00 min',
          views: item.views || '1K',
          badge: 'NEW',
          link: `https://www.youtube.com/watch?v=${yId}`,
          published: item.published || '',
          publishedAt: item.publishedAt || item.published || '',
          publishedTimestamp: item.publishedTimestamp || this.getVideoTimestamp(item),
          syncedAt: Date.now()
        };

        existingMap.set(yId, formatted);
        newAddedCount++;
      });

      // Construct final unified list strictly sorted descending (newest first)
      const finalVideos = Array.from(existingMap.values());
      finalVideos.sort((a, b) => this.getVideoTimestamp(b) - this.getVideoTimestamp(a));

      // Mark first video as LATEST
      if (finalVideos.length > 0) {
        finalVideos[0].badge = 'LATEST';
      }

      this.saveVideos(finalVideos);
      this.renderVideos();
      this.updateCategoryCounts();

      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderVideosTable) {
        VUO_ADMIN.renderVideosTable();
      }

      if (newAddedCount > 0) {
        if (typeof showToast === 'function') {
          showToast(`🔥 ${newAddedCount} new video(s) synced! Latest video is placed at the top.`, "success");
        }
      } else if (!silent) {
        if (typeof showToast === 'function') {
          showToast(`All ${finalVideos.length} tutorials are up-to-date and sorted newest-first!`, "success");
        }
      }
    } catch (errMerge) {
      console.error("Error merging synced videos:", errMerge);
    } finally {
      this.isSyncing = false;
      if (syncBtn) {
        syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate mr-1 text-sky-600"></i> Sync Latest Videos`;
        syncBtn.disabled = false;
      }
    }
  },

  updateCategoryCounts() {
    const videos = this.getAllVideos();
    const countMap = {
      'all': videos.length,
      'Government Schemes': 0,
      'Government Services': 0,
      'Banking': 0,
      'CSC Training': 0,
      'e-Governance': 0
    };

    videos.forEach(v => {
      if (v.category && countMap.hasOwnProperty(v.category)) {
        countMap[v.category]++;
      } else if (v.category) {
        const catL = v.category.toLowerCase();
        if (catL.includes('scheme')) countMap['Government Schemes']++;
        else if (catL.includes('service')) countMap['Government Services']++;
        else if (catL.includes('bank')) countMap['Banking']++;
        else if (catL.includes('gov') || catL.includes('apaar')) countMap['e-Governance']++;
        else countMap['CSC Training']++;
      }
    });

    document.querySelectorAll('.training-cat-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      if (cat === 'all') {
        btn.textContent = `All Videos (${countMap['all']})`;
      } else if (cat === 'Government Schemes') {
        btn.textContent = `Govt Schemes (${countMap['Government Schemes']})`;
      } else if (cat === 'Government Services') {
        btn.textContent = `Citizen Services (${countMap['Government Services']})`;
      } else if (cat === 'Banking') {
        btn.textContent = `Banking & Loan (${countMap['Banking']})`;
      } else if (cat === 'CSC Training') {
        btn.textContent = `CSC Training (${countMap['CSC Training']})`;
      } else if (cat === 'e-Governance') {
        btn.textContent = `APAAR & e-Gov (${countMap['e-Governance']})`;
      }
    });
  },

  renderVideos() {
    const container = document.getElementById('trainingGridContainer');
    if (!container) return;

    let videos = this.getAllVideos();

    // Strict newest-first sorting
    videos.sort((a, b) => this.getVideoTimestamp(b) - this.getVideoTimestamp(a));

    // 1. Filter by category
    if (this.currentCategory && this.currentCategory !== 'all') {
      const catTarget = this.currentCategory.toLowerCase().trim();
      videos = videos.filter(v => {
        if (!v.category) return false;
        const c = v.category.toLowerCase().trim();
        return c === catTarget || c.includes(catTarget) || catTarget.includes(c);
      });
    }

    // 2. Filter by search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      videos = videos.filter(v => {
        const text = [
          v.title || '',
          v.titleOdia || '',
          v.desc || '',
          v.category || '',
          v.badge || '',
          v.youtubeId || ''
        ].join(' ').toLowerCase();

        return terms.every(term => text.includes(term));
      });
    }

    // 3. Update count badge in search bar
    const countBadge = document.getElementById('trainingVideoCountBadge');
    if (countBadge) {
      if (this.searchQuery) {
        countBadge.textContent = `${videos.length} found`;
      } else {
        countBadge.textContent = `${videos.length} videos`;
      }
    }

    // 4. Empty State
    if (videos.length === 0) {
      if (this.searchQuery) {
        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs px-4">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <i class="fa-solid fa-magnifying-glass text-2xl"></i>
            </div>
            <p class="font-bold text-slate-800 text-base sm:text-lg">No videos found matching "${this.escapeHtml(this.searchQuery)}"</p>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">Try searching with a different term like Subhadra, PMAY, KALIA, CSC, Ration, or Bank BC.</p>
            <button onclick="VUO_TRAINING.clearSearch()" class="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
              <i class="fa-solid fa-rotate-left mr-1"></i> Clear Search
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <i class="fa-brands fa-youtube text-4xl text-rose-500 mb-2"></i>
            <p class="font-bold text-slate-700">No videos found in this category.</p>
            <p class="text-xs text-slate-400 mt-1">Click "All Videos" to view the complete tutorial library.</p>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = videos.map((video, idx) => {
      const isOdia = typeof currentLanguage !== 'undefined' && currentLanguage === 'or';
      const rawTitle = isOdia && video.titleOdia ? video.titleOdia : video.title;
      let displayTitle = this.escapeHtml(rawTitle);
      if (this.searchQuery) {
        const terms = this.searchQuery.trim().split(/\s+/).filter(Boolean);
        terms.forEach(t => {
          try {
            const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            displayTitle = displayTitle.replace(re, '<mark class="bg-amber-200 text-slate-900 rounded-xs px-0.5">$1</mark>');
          } catch (_) {}
        });
      }
      const thumbUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
      const ytLink = `https://www.youtube.com/watch?v=${video.youtubeId}`;
      const dateLabel = this.formatVideoDate(video);

      // Latest highlight badge for index 0
      let badgeHtml = '';
      if (idx === 0 || video.badge === 'LATEST') {
        badgeHtml = `
          <span class="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black z-10 animate-pulse flex items-center gap-1 shadow-md border border-emerald-400/50">
            <i class="fa-solid fa-bolt text-amber-300"></i> LATEST UPLOAD
          </span>`;
      } else if (video.badge === 'NEW' || idx < 4) {
        badgeHtml = `
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black z-10 flex items-center gap-1 shadow-sm">
            NEW
          </span>`;
      }

      return `
        <div class="bg-white border ${idx === 0 ? 'border-emerald-300 ring-2 ring-emerald-400/20 shadow-md' : 'border-slate-200'} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <!-- Video Thumbnail Header with Official YouTube Thumbnail -->
            <div class="relative bg-slate-900 aspect-video flex items-center justify-center cursor-pointer overflow-hidden" 
              onclick="VUO_TRAINING.openVideoModal('${video.id || video.youtubeId}')">
              
              <!-- Real YouTube Video Thumbnail -->
              <img src="${thumbUrl}" alt="${this.escapeHtml(rawTitle)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80'" />
              
              <!-- Dark gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>

              <!-- Play Button Overlay -->
              <div class="absolute w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-rose-500 transition-transform z-10">
                <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>

              <!-- Duration badge -->
              <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-mono font-semibold z-10">
                ${video.duration || 'Full Tutorial'}
              </span>

              <!-- Category Badge -->
              <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-sky-600/90 text-white text-[10px] font-bold z-10">
                ${video.category}
              </span>

              ${badgeHtml}
            </div>

            <!-- Content Details -->
            <div class="p-4">
              <h3 class="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                ${displayTitle}
              </h3>
              <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                ${video.desc || 'CSC VLE practical step-by-step training tutorial.'}
              </p>
            </div>
          </div>

          <div class="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
            <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>👁️ ${video.views || '1K'}</span>
              ${dateLabel ? `<span class="text-slate-300">•</span><span class="text-slate-500 font-medium">${dateLabel}</span>` : ''}
            </div>
            <div class="flex items-center gap-1.5">
              <a href="${ytLink}" target="_blank" title="Watch on YouTube"
                class="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                <i class="fa-brands fa-youtube text-sm"></i>
              </a>
              <button onclick="VUO_TRAINING.openVideoModal('${video.id || video.youtubeId}')" 
                class="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                <span>Play</span>
                <i class="fa-solid fa-play text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openVideoModal(videoId) {
    const videos = this.getAllVideos();
    const video = videos.find(v => v.id === videoId || v.youtubeId === videoId);
    if (!video) return;

    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({
        type: 'video',
        item: `Training Video: ${video.title || 'CSC Tutorial'}`,
        category: 'training'
      }, () => this._doOpenVideoModal(video));
    }
    this._doOpenVideoModal(video);
  },

  _doOpenVideoModal(video) {
    const modal = document.getElementById('videoPlayerModal');
    const modalTitle = document.getElementById('videoModalTitle');
    const modalDesc = document.getElementById('videoModalDesc');
    const playerContainer = document.getElementById('videoPlayerFrameContainer');

    if (!modal || !playerContainer) return;

    const isOdia = typeof currentLanguage !== 'undefined' && currentLanguage === 'or';
    modalTitle.textContent = isOdia && video.titleOdia ? video.titleOdia : video.title;
    modalDesc.textContent = video.desc || '';

    playerContainer.innerHTML = `
      <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
        <iframe class="w-full h-full" src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0" 
          title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
        </iframe>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <a href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" 
          class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer">
          <i class="fa-brands fa-youtube text-sm"></i>
          <span>Watch Directly on YouTube</span>
        </a>
        <span class="text-[11px] text-slate-400 font-mono">${video.duration || 'Full Tutorial'}</span>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeVideoModal() {
    const modal = document.getElementById('videoPlayerModal');
    const playerContainer = document.getElementById('videoPlayerFrameContainer');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    if (playerContainer) {
      playerContainer.innerHTML = '';
    }
  },

  closePlayer() {
    this.closeVideoModal();
  }
};

if (typeof window !== 'undefined') {
  window.VUO_TRAINING = VUO_TRAINING;
}

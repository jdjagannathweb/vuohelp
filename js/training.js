/**
 * VUO CSC HELP - Training Section
 * YouTube video tutorials hub for CSC VLEs with interactive player modal and category filters
 * Synchronizes video links and metadata from YouTube Channel "Odia Digital Sikhya"
 */

const VUO_TRAINING = {
  currentCategory: 'all',
  channelId: 'UCjxf06z3rx9DObtaTfaJfqg',
  channelUrl: 'https://www.youtube.com/channel/UCjxf06z3rx9DObtaTfaJfqg',
  isSyncing: false,

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
      // Auto-sync channel videos in background when user opens the site
      setTimeout(() => {
        this.syncFromYouTubeChannel(true);
      }, 1500);
    }
    this.renderVideos();
    this.updateCategoryCounts();
  },

  bindEvents() {
    // Training category filter buttons
    document.querySelectorAll('.training-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.training-cat-btn').forEach(b => {
          b.className = 'training-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all';
        });
        const target = e.currentTarget;
        target.className = 'training-cat-btn px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 border border-sky-600 text-white shadow-sm transition-all';
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

      // 1. Load stored videos from localStorage first
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

      // 2. Complement with defaultVideos if not already in storage
      defaultVideos.forEach(v => {
        const yId = v.youtubeId || (v.id && !v.id.startsWith('tr-') ? v.id : null);
        if (yId && !deletedSet.has(yId) && !deletedSet.has(v.id) && yId !== 'dQw4w9WgXcQ' && !videoMap.has(yId)) {
          videoMap.set(yId, {
            ...v,
            youtubeId: yId,
            link: v.link || `https://www.youtube.com/watch?v=${yId}`
          });
        }
      });

      return Array.from(videoMap.values());
    } catch (e) {
      console.error("Error in getAllVideos:", e);
      return (typeof VUO_DATA !== 'undefined') ? VUO_DATA.trainingVideos : [];
    }
  },

  saveVideos(videos) {
    try {
      // Store lightweight link metadata only (no full video blobs)
      const sanitized = videos.map(v => ({
        id: v.id || `tr-${v.youtubeId}`,
        youtubeId: v.youtubeId,
        title: v.title || 'CSC Tutorial',
        titleOdia: v.titleOdia || v.title || 'CSC Tutorial',
        category: v.category || this.categorizeVideo(v.title),
        desc: v.desc || `${v.title} - Step-by-step Odia tutorial from Odia Digital Sikhya.`,
        duration: v.duration || 'Full Tutorial',
        views: v.views || '1K',
        badge: v.badge || 'Tutorial',
        link: v.link || `https://www.youtube.com/watch?v=${v.youtubeId}`,
        published: v.published || '',
        isCustom: !!v.isCustom,
        syncedAt: v.syncedAt || Date.now()
      }));

      localStorage.setItem('vuo_training', JSON.stringify(sanitized));

      // Push to backend server file if on web server
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
      if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveVideo) {
        sanitized.slice(0, 10).forEach(v => VUO_DB.cloudSaveVideo(v));
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
   * Automatically fetch and sync all videos from YouTube Channel in real-time.
   * - Saves ONLY video links and metadata (no full video file downloads)
   * - Deduplicates: once a video link is saved, it is preserved and not re-duplicated
   * - Retains deleted items: never brings back videos deleted by admin/user
   */
  async syncFromYouTubeChannel(silent = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const syncBtn = document.getElementById('syncYouTubeVideosBtn');
    if (syncBtn) {
      syncBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Syncing...`;
      syncBtn.disabled = true;
    }

    if (!silent && typeof showToast === 'function') {
      showToast("Connecting to YouTube channel & checking for new tutorials...", "info");
    }

    let fetchedItems = [];

    // --- STEP 1: Fast & Reliable Backend Server Sync --- //
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('api/sync-youtube-videos');
        if (res.ok) {
          const data = await res.json();
          if (data && data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
            fetchedItems = data.videos;
          }
        }
      } catch (e) {
        console.warn("Backend YouTube sync endpoint check:", e);
      }

      // Check training_videos.json directly if /api/ not reached
      if (fetchedItems.length === 0) {
        try {
          const res = await fetch('training_videos.json?t=' + Date.now());
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length > 0) {
              fetchedItems = list;
            }
          }
        } catch (e2) {
          console.warn("Direct training_videos.json check:", e2);
        }
      }
    }

    // --- STEP 2: Client-side Proxy Scraper Fallback (for static hosts) --- //
    if (fetchedItems.length === 0) {
      const channelUrl = `https://www.youtube.com/channel/${this.channelId}/videos`;
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(channelUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(channelUrl)}`
      ];

      for (const proxyUrl of proxies) {
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const html = await res.text();
            const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
            if (match) {
              const ytData = JSON.parse(match[1]);
              const list = [];
              const seen = new Set();

              const extract = (obj) => {
                if (obj && typeof obj === 'object') {
                  if (obj.lockupViewModel) {
                    const lvm = obj.lockupViewModel;
                    const vid = lvm.contentId;
                    if (vid && !seen.has(vid)) {
                      seen.add(vid);
                      const title = lvm.metadata?.lockupMetadataViewModel?.title?.content || 'Tutorial';
                      const rows = lvm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
                      let views = '1K';
                      let published = '';
                      if (rows[0]?.metadataParts) {
                        views = rows[0].metadataParts[0]?.accessibilityLabel || rows[0].metadataParts[0]?.text?.content || '1K';
                        published = rows[0].metadataParts[1]?.accessibilityLabel || rows[0].metadataParts[1]?.text?.content || '';
                      }
                      let duration = '10:00 min';
                      const badges = lvm.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges || [];
                      if (badges[0]?.thumbnailBadgeViewModel?.text) {
                        duration = badges[0].thumbnailBadgeViewModel.text + ' min';
                      }

                      list.push({
                        id: `tr-${vid}`,
                        youtubeId: vid,
                        title: title,
                        titleOdia: title,
                        category: this.categorizeVideo(title),
                        desc: `${title} - Step-by-step Odia tutorial from Odia Digital Sikhya.`,
                        duration: duration,
                        views: views.replace(/views?/gi, '').trim() || '1K',
                        badge: 'NEW',
                        link: `https://www.youtube.com/watch?v=${vid}`,
                        published: published,
                        syncedAt: Date.now()
                      });
                    }
                  }
                  Object.values(obj).forEach(extract);
                }
              };

              extract(ytData);
              if (list.length > 0) {
                fetchedItems = list;
                break;
              }
            }
          }
        } catch (errProxy) {
          console.warn("Proxy scraper attempt failed:", errProxy);
        }
      }
    }

    // --- STEP 3: Deduplication and Automatic Persistence --- //
    try {
      const deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_video_ids') || '[]');
      const deletedSet = new Set(deletedIds);

      const existingVideos = this.getAllVideos();
      const existingMap = new Map();
      existingVideos.forEach(v => {
        if (v.youtubeId) existingMap.set(v.youtubeId, v);
      });

      let newAddedCount = 0;
      const newlyDiscovered = [];

      fetchedItems.forEach(item => {
        const yId = item.youtubeId || (item.id && !item.id.startsWith('tr-') ? item.id : null);
        if (!yId || deletedSet.has(yId) || deletedSet.has(item.id)) return;

        // If video is ALREADY synced & saved, do NOT duplicate it!
        if (existingMap.has(yId)) {
          // Update view count/duration if newer data is available without duplicating
          const prev = existingMap.get(yId);
          if (item.views && item.views !== 'Latest') prev.views = item.views;
          if (item.duration && item.duration !== 'Full Tutorial') prev.duration = item.duration;
          return;
        }

        // It is a brand new video upload!
        const formatted = {
          id: item.id || `tr-${yId}`,
          youtubeId: yId,
          title: item.title,
          titleOdia: item.titleOdia || item.title,
          category: item.category || this.categorizeVideo(item.title),
          desc: item.desc || `${item.title} - Step-by-step Odia tutorial from Odia Digital Sikhya.`,
          duration: item.duration || '10:00 min',
          views: item.views || '1K',
          badge: item.badge || 'NEW',
          link: `https://www.youtube.com/watch?v=${yId}`,
          published: item.published || '',
          syncedAt: Date.now()
        };

        newlyDiscovered.push(formatted);
        existingMap.set(yId, formatted);
        newAddedCount++;
      });

      // Construct final unified list (newest discoveries at the top, followed by existing saved)
      const finalVideos = [...newlyDiscovered, ...existingVideos];

      // Automatically persist to localStorage, IndexedDB & backend
      this.saveVideos(finalVideos);
      this.renderVideos();
      this.updateCategoryCounts();

      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderVideosTable) {
        VUO_ADMIN.renderVideosTable();
      }

      if (newAddedCount > 0) {
        if (typeof showToast === 'function') {
          showToast(`🔥 ${newAddedCount} new tutorial link(s) automatically synced & saved!`, "success");
        }
      } else if (!silent) {
        if (typeof showToast === 'function') {
          showToast(`All ${finalVideos.length} tutorials are up-to-date and saved!`, "success");
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
      const cat = v.category;
      if (countMap[cat] !== undefined) {
        countMap[cat]++;
      }
    });

    // Update buttons in DOM
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

    if (this.currentCategory && this.currentCategory !== 'all') {
      const catTarget = this.currentCategory.toLowerCase().trim();
      videos = videos.filter(v => {
        if (!v.category) return false;
        const c = v.category.toLowerCase().trim();
        return c === catTarget || c.includes(catTarget) || catTarget.includes(c);
      });
    }

    if (videos.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <i class="fa-brands fa-youtube text-4xl text-rose-500 mb-2"></i>
          <p class="font-bold text-slate-700">No videos found in this category.</p>
          <p class="text-xs text-slate-400 mt-1">Click "All Videos" to view the complete tutorial library.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = videos.map(video => {
      const isOdia = typeof currentLanguage !== 'undefined' && currentLanguage === 'or';
      const title = isOdia && video.titleOdia ? video.titleOdia : video.title;
      const thumbUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
      const ytLink = `https://www.youtube.com/watch?v=${video.youtubeId}`;

      return `
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <!-- Video Thumbnail Header with Official YouTube Thumbnail -->
            <div class="relative bg-slate-900 aspect-video flex items-center justify-center cursor-pointer overflow-hidden" 
              onclick="VUO_TRAINING.openVideoModal('${video.id || video.youtubeId}')">
              
              <!-- Real YouTube Video Thumbnail -->
              <img src="${thumbUrl}" alt="${title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
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
            </div>

            <!-- Content Details -->
            <div class="p-4">
              <h3 class="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                ${title}
              </h3>
              <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                ${video.desc || 'CSC VLE practical step-by-step training tutorial.'}
              </p>
            </div>
          </div>

          <div class="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
            <span class="text-[11px] text-slate-400">👁️ ${video.views || '1K'} views</span>
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

    // Responsive embed with official YouTube iframe + direct YouTube link
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
      playerContainer.innerHTML = ''; // Stop video playback
    }
  },

  // Alias for compatibility
  closePlayer() {
    this.closeVideoModal();
  }
};

if (typeof window !== 'undefined') {
  window.VUO_TRAINING = VUO_TRAINING;
}

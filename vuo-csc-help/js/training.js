/**
 * VUO CSC HELP - Training Section
 * YouTube video tutorials hub for CSC VLEs with interactive player modal and category filters
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
      }, 1200);
    }
    this.renderVideos();
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

  getAllVideos() {
    try {
      const defaultVideos = (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.trainingVideos)) ? VUO_DATA.trainingVideos : [];
      const deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_video_ids') || '[]');
      const deletedSet = new Set(deletedIds);

      const stored = localStorage.getItem('vuo_training');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          // Custom / admin added videos first
          parsed.filter(v => v.isCustom || !defaultVideos.some(d => d.id === v.id)).forEach(v => {
            const vidKey = v.id || v.youtubeId;
            if (!deletedSet.has(vidKey) && !deletedSet.has(v.id) && !deletedSet.has(v.youtubeId) && v.youtubeId && v.youtubeId !== 'dQw4w9WgXcQ') {
              map.set(vidKey, v);
            }
          });
          // Default videos
          defaultVideos.forEach(v => {
            const vidKey = v.id || v.youtubeId;
            if (!deletedSet.has(vidKey) && !deletedSet.has(v.id) && !deletedSet.has(v.youtubeId) && v.youtubeId !== 'dQw4w9WgXcQ' && !map.has(vidKey)) {
              map.set(vidKey, v);
            }
          });
          return Array.from(map.values());
        }
      }
      return defaultVideos.filter(v => {
        const vidKey = v.id || v.youtubeId;
        return !deletedSet.has(vidKey) && !deletedSet.has(v.id) && !deletedSet.has(v.youtubeId) && v.youtubeId !== 'dQw4w9WgXcQ';
      });
    } catch (e) {
      return (typeof VUO_DATA !== 'undefined') ? VUO_DATA.trainingVideos : [];
    }
  },

  saveVideos(videos) {
    try {
      localStorage.setItem('vuo_training', JSON.stringify(videos));
      return true;
    } catch (e) {
      console.error("Error saving training videos to storage:", e);
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

      let stored = JSON.parse(localStorage.getItem('vuo_training') || '[]');
      if (Array.isArray(stored)) {
        stored = stored.filter(v => v.id !== vidId && v.youtubeId !== vidId);
        localStorage.setItem('vuo_training', JSON.stringify(stored));
      }

      this.renderVideos();
      return true;
    } catch (e) {
      console.error("Error deleting video:", e);
      return false;
    }
  },

  /**
   * Automatically fetch all latest uploads from YouTube Channel RSS Feed in real-time
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
      showToast("Checking YouTube Channel for new uploads...", "info");
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${this.channelId}`;
    let items = [];

    try {
      // 1. First attempt: rss2json API
      try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'ok' && json.items && json.items.length > 0) {
            items = json.items.map(it => {
              let vid = '';
              if (it.guid && it.guid.includes('yt:video:')) {
                vid = it.guid.replace('yt:video:', '');
              } else if (it.link && it.link.includes('v=')) {
                vid = it.link.split('v=')[1]?.split('&')[0];
              } else if (it.link && it.link.includes('/shorts/')) {
                vid = it.link.split('/shorts/')[1]?.split('?')[0];
              }
              return {
                id: vid,
                title: it.title,
                desc: it.description || '',
                pubDate: it.pubDate
              };
            });
          }
        }
      } catch (e) {
        console.warn("rss2json fetch error, trying proxy fallback...", e);
      }

      // 2. Second attempt: AllOrigins XML Proxy fallback
      if (items.length === 0) {
        try {
          const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`);
          if (res.ok) {
            const xmlText = await res.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const entries = xmlDoc.getElementsByTagName("entry");
            for (let i = 0; i < entries.length; i++) {
              const entry = entries[i];
              const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent;
              const title = entry.getElementsByTagName("title")[0]?.textContent;
              const desc = entry.getElementsByTagName("media:description")[0]?.textContent || "";
              const published = entry.getElementsByTagName("published")[0]?.textContent;
              if (videoId && title) {
                items.push({
                  id: videoId,
                  title: title,
                  desc: desc,
                  pubDate: published
                });
              }
            }
          }
        } catch (e2) {
          console.warn("AllOrigins proxy error:", e2);
        }
      }

      // Process new items into existing list
      if (items.length > 0) {
        let existingVideos = this.getAllVideos();
        let newAdded = 0;

        items.forEach(item => {
          if (!item.id) return;
          const exists = existingVideos.some(v => v.youtubeId === item.id);
          if (!exists) {
            // Auto categorize based on title
            let cat = 'CSC Training';
            const t = item.title.toLowerCase();
            if (t.includes('yojana') || t.includes('pmay') || t.includes('kalia') || t.includes('subhadra') || t.includes('kanya') || t.includes('ayushman')) {
              cat = 'Government Schemes';
            } else if (t.includes('farmer') || t.includes('krushak') || t.includes('challan') || t.includes('ration') || t.includes('labour')) {
              cat = 'Government Services';
            } else if (t.includes('bank') || t.includes('loan') || t.includes('pmkisan') || t.includes('mudra') || t.includes('statement')) {
              cat = 'Banking';
            } else if (t.includes('apaar') || t.includes('pan') || t.includes('aadhaar') || t.includes('scholarship') || t.includes('navodaya')) {
              cat = 'e-Governance';
            }

            const newVid = {
              id: `tr-auto-${item.id}`,
              title: item.title,
              titleOdia: item.title,
              category: cat,
              youtubeId: item.id,
              desc: item.desc ? item.desc.substring(0, 160) + '...' : 'Latest tutorial from Odia Digital Sikhya channel.',
              duration: 'New Upload',
              views: 'Latest',
              badge: 'NEW',
              isLive: true
            };

            existingVideos.unshift(newVid); // Place brand new uploads right at the top
            newAdded++;
          }
        });

        if (newAdded > 0) {
          this.saveVideos(existingVideos);
          this.renderVideos();
          if (typeof showToast === 'function') {
            showToast(`🔥 ${newAdded} new video(s) automatically synced from YouTube Channel!`, "success");
          }
        } else if (!silent && typeof showToast === 'function') {
          showToast("All videos are up-to-date with your YouTube channel!", "success");
        }
      } else if (!silent && typeof showToast === 'function') {
        showToast("Connected to channel. All videos are currently synced.", "info");
      }
    } catch (err) {
      console.error("Auto sync error:", err);
      if (!silent && typeof showToast === 'function') {
        showToast("Auto sync completed. Showing loaded video catalog.", "info");
      }
    } finally {
      this.isSyncing = false;
      if (syncBtn) {
        syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate mr-1"></i> Sync Latest Videos`;
        syncBtn.disabled = false;
      }
    }
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
      const title = currentLanguage === 'or' && video.titleOdia ? video.titleOdia : video.title;
      const thumbUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

      return `
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <!-- Video Thumbnail Header with Official YouTube Thumbnail -->
            <div class="relative bg-slate-900 aspect-video flex items-center justify-center cursor-pointer overflow-hidden" 
              onclick="VUO_TRAINING.openVideoModal('${video.id}')">
              
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
                ${video.duration}
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
                ${video.desc}
              </p>
            </div>
          </div>

          <div class="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100">
            <span class="text-[11px] text-slate-400">👁️ ${video.views} views</span>
            <div class="flex items-center gap-1.5">
              <button onclick="VUO_TRAINING.openVideoModal('${video.id}')" 
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

    modalTitle.textContent = currentLanguage === 'or' && video.titleOdia ? video.titleOdia : video.title;
    modalDesc.textContent = video.desc || '';

    // Responsive embed or simulated player with YouTube iframe + direct YouTube link
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

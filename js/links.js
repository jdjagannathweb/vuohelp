/**
 * VUO CSC HELP - Important Links Hub
 * Categorized government, banking and CSC links with real-time search & filter
 * Guaranteed rock-solid persistence for custom admin-added links.
 */

const VUO_LINKS = {
  currentCategory: 'all',
  searchQuery: '',

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    this.renderLinks();
  },

  bindEvents() {
    // Category tabs
    document.querySelectorAll('.link-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.link-cat-btn').forEach(b => {
          b.className = 'link-cat-btn px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-xs';
        });
        const target = e.currentTarget;
        target.className = 'link-cat-btn px-4 py-2 text-xs md:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 border border-sky-600 text-white shadow-md transition-all';
        this.currentCategory = target.getAttribute('data-cat') || 'all';
        this.renderLinks();
      });
    });

    // Search input
    const searchInput = document.getElementById('linksSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderLinks();
      });
    }

    window.addEventListener('languageChanged', () => {
      this.renderLinks();
    });
  },

  getAllLinks() {
    const defaultLinks = (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.links)) ? VUO_DATA.links : [];
    let customLinks = [];
    let deletedIds = [];
    
    try {
      // 1. Read custom links added by admin
      const customStored = localStorage.getItem('vuo_custom_links');
      if (customStored) {
        const parsed = JSON.parse(customStored);
        if (Array.isArray(parsed)) customLinks = parsed;
      }

      // 2. Also check if vuo_links has any custom added links (respecting deletedIds)
      const vuoLinksStored = localStorage.getItem('vuo_links');
      if (vuoLinksStored) {
        const parsedVuo = JSON.parse(vuoLinksStored);
        if (Array.isArray(parsedVuo)) {
          const defaultIds = new Set(defaultLinks.map(d => d.id));
          const deletedCheckSet = new Set(deletedIds);
          parsedVuo.forEach(item => {
            if (!defaultIds.has(item.id) && !deletedCheckSet.has(item.id) && !customLinks.some(c => c.id === item.id)) {
              customLinks.push(item);
            }
          });
        }
      }

      // 3. Read deleted link IDs
      const deletedStored = localStorage.getItem('vuo_deleted_link_ids');
      if (deletedStored) {
        const parsedDel = JSON.parse(deletedStored);
        if (Array.isArray(parsedDel)) deletedIds = parsedDel;
      }
    } catch (e) {
      console.warn("Error reading custom links from storage:", e);
    }

    const deletedSet = new Set(deletedIds);
    const activeDefaults = defaultLinks.filter(l => !deletedSet.has(l.id));
    const activeCustom = customLinks.filter(l => !deletedSet.has(l.id));

    // Combine custom links first (top priority) + active default links
    const customIds = new Set(activeCustom.map(l => l.id));
    const merged = [...activeCustom, ...activeDefaults.filter(l => !customIds.has(l.id))];

    // Sync back to local storage
    try {
      localStorage.setItem('vuo_custom_links', JSON.stringify(activeCustom));
      localStorage.setItem('vuo_links', JSON.stringify(merged));
    } catch (e) {}

    return merged;
  },

  saveCustomLink(newLink) {
    try {
      let customLinks = [];
      const stored = localStorage.getItem('vuo_custom_links');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) customLinks = parsed;
      }

      const existingIdx = customLinks.findIndex(l => l.id === newLink.id);
      if (existingIdx >= 0) {
        customLinks[existingIdx] = newLink;
      } else {
        customLinks.unshift(newLink);
      }

      localStorage.setItem('vuo_custom_links', JSON.stringify(customLinks));

      // Remove from deleted list if present
      let deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_link_ids') || '[]');
      deletedIds = deletedIds.filter(id => id !== newLink.id);
      localStorage.setItem('vuo_deleted_link_ids', JSON.stringify(deletedIds));

      // Update full links array
      return this.getAllLinks();
    } catch (e) {
      console.error("Failed to save custom link:", e);
      return false;
    }
  },

  deleteLinkById(linkId) {
    try {
      // 1. Mark in deleted link IDs first
      let deletedIds = JSON.parse(localStorage.getItem('vuo_deleted_link_ids') || '[]');
      if (!deletedIds.includes(linkId)) {
        deletedIds.push(linkId);
      }
      localStorage.setItem('vuo_deleted_link_ids', JSON.stringify(deletedIds));

      // 2. Remove from custom links
      let customLinks = JSON.parse(localStorage.getItem('vuo_custom_links') || '[]');
      customLinks = customLinks.filter(l => l.id !== linkId);
      localStorage.setItem('vuo_custom_links', JSON.stringify(customLinks));

      // 3. Remove from vuo_links as well
      let vuoLinks = JSON.parse(localStorage.getItem('vuo_links') || '[]');
      if (Array.isArray(vuoLinks)) {
        vuoLinks = vuoLinks.filter(l => l.id !== linkId);
        localStorage.setItem('vuo_links', JSON.stringify(vuoLinks));
      }

      // 4. Update full links array
      this.getAllLinks();
      return true;
    } catch (e) {
      console.error("Failed to delete link:", e);
      return false;
    }
  },

  saveLinks(links) {
    try {
      localStorage.setItem('vuo_links', JSON.stringify(links));
      return true;
    } catch (e) {
      console.error("Error saving links to storage:", e);
      return false;
    }
  },

  renderLinks() {
    const container = document.getElementById('linksGridContainer');
    if (!container) return;

    let links = this.getAllLinks();

    // Filter by Category
    if (this.currentCategory !== 'all') {
      links = links.filter(l => l.category === this.currentCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      links = links.filter(l => 
        (l.title && l.title.toLowerCase().includes(this.searchQuery)) ||
        (l.titleOdia && l.titleOdia.toLowerCase().includes(this.searchQuery)) ||
        (l.desc && l.desc.toLowerCase().includes(this.searchQuery)) ||
        (l.categoryName && l.categoryName.toLowerCase().includes(this.searchQuery)) ||
        (l.url && l.url.toLowerCase().includes(this.searchQuery))
      );
    }

    if (links.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <i class="fa-solid fa-link-slash text-4xl text-slate-300 mb-3 block"></i>
          <p class="font-bold text-slate-700 text-sm">No portal links found matching your search.</p>
          <p class="text-xs text-slate-400 mt-1">Try searching for "Subhadra", "e-District", "PAN", "DigiPay", "Aadhaar" or "ChatGPT".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = links.map(link => {
      const title = currentLanguage === 'or' && link.titleOdia ? link.titleOdia : link.title;
      const categoryBadge = link.category === 'gov' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            link.category === 'csc' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                            link.category === 'banking' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            link.category === 'jobs' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                            link.category === 'ai_tools' ? 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' :
                            link.category === 'citizen' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-purple-100 text-purple-800 border-purple-200';

      return `
        <div class="feature-card bg-white border border-slate-200/90 hover:border-sky-400 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden group">
          ${link.important ? `
            <div class="absolute top-0 right-0">
              <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                <i class="fa-solid fa-star text-[9px]"></i>
                <span>IMPORTANT</span>
              </div>
            </div>
          ` : ''}

          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadge}">
                ${link.categoryName || 'Portal'}
              </span>
            </div>

            <h3 class="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors mt-1 font-heading">
              ${title}
            </h3>
            
            ${currentLanguage === 'en' && link.titleOdia ? `
              <p class="text-xs text-slate-500 font-odia mt-0.5">${link.titleOdia}</p>
            ` : ''}

            <p class="text-xs text-slate-600 mt-2 leading-relaxed">
              ${link.desc || 'Direct access to official portal services for CSC VLEs.'}
            </p>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[180px]">${link.url}</span>
            <a href="${link.url}" onclick="return VUO_LINKS.openPortalLink(event, '${link.url}', '${(link.title || 'Govt Portal').replace(/'/g, "\\'")}')" 
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer">
              <span>Open Portal</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  openPortalLink(event, url, title) {
    if (event) event.preventDefault();
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({
        type: 'link',
        item: `Portal Link: ${title || 'Official Govt / CSC Portal'}`,
        category: 'links'
      }, () => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
    const user = (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.getCurrentUser) ? VUO_AUTH.getCurrentUser() : null;
    if (!user) {
      if (typeof VUO_AUTH_MODAL !== 'undefined' && VUO_AUTH_MODAL.openLogin) {
        VUO_AUTH_MODAL.openLogin({ item: `Portal Link: ${title || 'Official Govt / CSC Portal'}` }, () => {
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
      return false;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return false;
  }
};

window.VUO_LINKS = VUO_LINKS;
if (typeof module !== 'undefined') module.exports = VUO_LINKS;


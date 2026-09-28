// Toast notification helper
window.showToast = function(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgClass = type === "success" ? "bg-emerald-600 text-white" :
                  type === "info" ? "bg-blue-600 text-white" :
                  type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white";

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg ${bgClass} text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${type === "success" ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
        type === "info" ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' :
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Main App Controller
class CscPortalApp {
  constructor() {
    this.currentTab = "dashboard";
    this.leads = [];
    this.initClock();
    this.initTabs();
    this.initGlobalSearch();
    this.initLeadsCRM();
    this.initFormsLibrary();
    this.initSarkariUpdates();
    this.initRateCalculator();
    this.initSubmodules();
  }

  initClock() {
    const clockEl = document.getElementById("live-clock");
    const dateEl = document.getElementById("live-date");

    const updateTime = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  initTabs() {
    const navLinks = document.querySelectorAll("[data-tab-target]");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.getAttribute("data-tab-target");
        this.switchTab(tab);
      });
    });

    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        if (backdrop) backdrop.classList.toggle("hidden");
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
        backdrop.classList.add("hidden");
      });
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll("[data-tab-target]").forEach(el => {
      if (el.getAttribute("data-tab-target") === tabId) {
        el.classList.add("bg-blue-800", "text-white", "font-semibold");
        el.classList.remove("text-blue-100", "hover:bg-blue-900/60");
      } else {
        el.classList.remove("bg-blue-800", "text-white", "font-semibold");
        el.classList.add("text-blue-100", "hover:bg-blue-900/60");
      }
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.add("hidden");
    });

    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) {
      activePane.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar && !sidebar.classList.contains("-translate-x-full") && window.innerWidth < 1024) {
      sidebar.classList.add("-translate-x-full");
      if (backdrop) backdrop.classList.add("hidden");
    }
  }

  initGlobalSearch() {
    const searchInput = document.getElementById("global-search-input");
    const resultsContainer = document.getElementById("global-search-results");
    if (!searchInput || !resultsContainer) return;

    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        resultsContainer.classList.add("hidden");
        return;
      }

      const matchedTools = [
        { title: "Passport Photo Maker", tab: "passport-photo", desc: "Crop 35x45mm, change background to white/blue, 4x6 print grid" },
        { title: "PAN Card Photo / Signature Resizer", tab: "pan-resizer", desc: "UTIITSL & NSDL 213x213px <30KB, 400x200px <60KB" },
        { title: "PDF Merge Tool", tab: "pdf-toolkit", desc: "Combine multiple document PDFs" },
        { title: "PDF Compress (<200KB / <100KB)", tab: "pdf-toolkit", desc: "Fit portal size requirements" },
        { title: "Image to PDF Converter", tab: "pdf-toolkit", desc: "Convert Aadhaar & marksheet scans to A4 PDF" },
        { title: "Customer & Lead Tracker (CRM)", tab: "leads-tracker", desc: "Track citizen applications, WhatsApp notification, Excel export" },
        { title: "Rate Card & Receipt Generator", tab: "rate-card", desc: "Print customer fee receipt" }
      ].filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));

      const matchedForms = (window.CSC_FORMS_DATA || []).filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.hindiTitle.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q)
      );

      const matchedUpdates = (window.CSC_UPDATES_DATA || []).filter(u =>
        u.title.toLowerCase().includes(q) ||
        u.hindiTitle.toLowerCase().includes(q) ||
        u.eligibility.toLowerCase().includes(q) ||
        u.authority.toLowerCase().includes(q)
      );

      let html = "";
      if (matchedTools.length > 0) {
        html += `<div class="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Tools & Utilities</div>`;
        matchedTools.forEach(t => {
          html += `
            <a href="#" class="block p-2.5 hover:bg-blue-50 border-b border-gray-100 search-item-link" data-tab="${t.tab}">
              <p class="text-sm font-semibold text-blue-700">${t.title}</p>
              <p class="text-xs text-gray-500">${t.desc}</p>
            </a>
          `;
        });
      }

      if (matchedForms.length > 0) {
        html += `<div class="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Offline Forms (${matchedForms.length})</div>`;
        matchedForms.slice(0, 4).forEach(f => {
          html += `
            <a href="#" class="block p-2.5 hover:bg-emerald-50 border-b border-gray-100 search-form-link" data-form-id="${f.id}">
              <p class="text-sm font-semibold text-emerald-800">${f.title}</p>
              <p class="text-xs text-gray-500">${f.hindiTitle} • ${f.department}</p>
            </a>
          `;
        });
      }

      if (matchedUpdates.length > 0) {
        html += `<div class="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Sarkari Updates & Schemes</div>`;
        matchedUpdates.slice(0, 3).forEach(u => {
          html += `
            <a href="#" class="block p-2.5 hover:bg-amber-50 border-b border-gray-100 search-item-link" data-tab="sarkari-updates">
              <p class="text-sm font-semibold text-amber-800">${u.title}</p>
              <p class="text-xs text-gray-500">${u.benefit.slice(0, 75)}...</p>
            </a>
          `;
        });
      }

      if (!html) {
        html = `<div class="p-4 text-center text-sm text-gray-500">No matching tools, forms or schemes found for "${q}".</div>`;
      }

      resultsContainer.innerHTML = html;
      resultsContainer.classList.remove("hidden");

      resultsContainer.querySelectorAll(".search-item-link").forEach(a => {
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          resultsContainer.classList.add("hidden");
          searchInput.value = "";
          this.switchTab(a.getAttribute("data-tab"));
        });
      });

      resultsContainer.querySelectorAll(".search-form-link").forEach(a => {
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          resultsContainer.classList.add("hidden");
          searchInput.value = "";
          this.switchTab("offline-forms");
          this.openFormChecklistModal(a.getAttribute("data-form-id"));
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.classList.add("hidden");
      }
    });
  }
  // --- LEADS & CUSTOMER CRM ---
  initLeadsCRM() {
    const savedLeads = localStorage.getItem("CSC_LEADS_DATA");
    if (savedLeads) {
      try {
        this.leads = JSON.parse(savedLeads);
      } catch (e) {
        this.leads = this.getInitialLeads();
      }
    } else {
      this.leads = this.getInitialLeads();
      this.saveLeads();
    }

    this.renderLeadsTable();
    this.updateDashboardStats();

    const searchInput = document.getElementById("lead-search-input");
    const statusFilter = document.getElementById("lead-status-filter");

    if (searchInput) searchInput.addEventListener("input", () => this.renderLeadsTable());
    if (statusFilter) statusFilter.addEventListener("change", () => this.renderLeadsTable());

    const openModalBtn = document.getElementById("open-add-lead-btn");
    const openModalHeroBtn = document.getElementById("hero-add-lead-btn");
    const modal = document.getElementById("add-lead-modal");
    const closeBtn = document.getElementById("close-lead-modal-btn");
    const form = document.getElementById("add-lead-form");

    const openModal = () => {
      if (modal) modal.classList.remove("hidden");
      if (form) form.reset();
      const dateInp = document.getElementById("lead-form-date");
      if (dateInp) dateInp.value = new Date().toISOString().split("T")[0];
    };

    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    if (openModalHeroBtn) openModalHeroBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("lead-name").value.trim();
        const mobile = document.getElementById("lead-mobile").value.trim();
        const service = document.getElementById("lead-service").value;
        const fee = document.getElementById("lead-fee").value || 0;
        const notes = document.getElementById("lead-notes").value.trim();
        const date = document.getElementById("lead-form-date").value || new Date().toISOString().split("T")[0];

        if (!name || !mobile) {
          alert("Please provide citizen name and mobile number.");
          return;
        }

        const newLead = {
          id: "LD-" + Date.now().toString().slice(-5),
          name,
          mobile,
          service,
          fee: parseInt(fee, 10),
          status: "Pending",
          date,
          notes
        };

        this.leads.unshift(newLead);
        this.saveLeads();
        this.renderLeadsTable();
        this.updateDashboardStats();
        modal.classList.add("hidden");
        window.showToast("Citizen inquiry logged successfully!");
      });
    }

    const exportBtn = document.getElementById("export-leads-csv-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportLeadsCSV());
    }
  }

  getInitialLeads() {
    const today = new Date().toISOString().split("T")[0];
    return [
      { id: "LD-9201", name: "Ramesh Chandra Sahoo", mobile: "9861234567", service: "Aadhaar Biometric Update", fee: 100, status: "Done", date: today, notes: "Mandatory biometric 15+ years" },
      { id: "LD-9202", name: "Sunita Mohapatra", mobile: "9437112233", service: "Subhadra Yojana e-KYC", fee: 50, status: "Done", date: today, notes: "Single bank NPCI active verified" },
      { id: "LD-9203", name: "Bipin Bihari Jena", mobile: "8917889900", service: "New PAN Card (NSDL)", fee: 150, status: "In Progress", date: today, notes: "Acknowledgement slip issued" },
      { id: "LD-9204", name: "Gita Rani Dash", mobile: "9938556677", service: "Old Age Pension (IGNOAPS)", fee: 30, status: "Pending", date: today, notes: "Waiting for BPL card photocopy" },
      { id: "LD-9205", name: "Kunal Nayak", mobile: "7894223344", service: "PM Surya Ghar Registration", fee: 100, status: "Follow-up", date: today, notes: "Electricity consumer bill uploaded" }
    ];
  }

  saveLeads() {
    localStorage.setItem("CSC_LEADS_DATA", JSON.stringify(this.leads));
  }

  renderLeadsTable() {
    const tbody = document.getElementById("leads-table-body");
    const searchVal = (document.getElementById("lead-search-input")?.value || "").toLowerCase();
    const filterVal = document.getElementById("lead-status-filter")?.value || "All";

    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = this.leads.filter(lead => {
      const matchText = lead.name.toLowerCase().includes(searchVal) ||
                        lead.mobile.includes(searchVal) ||
                        lead.service.toLowerCase().includes(searchVal);
      const matchStatus = filterVal === "All" || lead.status === filterVal;
      return matchText && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">
            No customer inquiries found matching your filters.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(lead => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50/80 transition-colors border-b border-gray-100 text-sm";

      const waMsg = encodeURIComponent(`Namaste ${lead.name} ji,\nThis is an update from Janaseba Kendra / CSC regarding your *${lead.service}*.\nStatus: *${lead.status}*\nFor any queries, please visit our Kendra.\nThank you!`);
      const waUrl = `https://wa.me/91${lead.mobile.replace(/\D/g, "")}?text=${waMsg}`;

      tr.innerHTML = `
        <td class="px-4 py-3 font-mono text-xs text-gray-500">${lead.id}</td>
        <td class="px-4 py-3 font-medium text-gray-900">${lead.name}</td>
        <td class="px-4 py-3 text-gray-600 font-mono text-xs">${lead.mobile}</td>
        <td class="px-4 py-3">
          <span class="font-medium text-gray-800">${lead.service}</span>
          ${lead.notes ? `<p class="text-[11px] text-gray-400 truncate max-w-[180px]">${lead.notes}</p>` : ""}
        </td>
        <td class="px-4 py-3 text-gray-500 text-xs">${lead.date}</td>
        <td class="px-4 py-3">
          <select class="text-xs rounded border border-gray-200 py-1 px-1.5 bg-white font-medium lead-status-changer" data-lead-id="${lead.id}">
            <option value="Pending" ${lead.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${lead.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Done" ${lead.status === "Done" ? "selected" : ""}>Done</option>
            <option value="Follow-up" ${lead.status === "Follow-up" ? "selected" : ""}>Follow-up</option>
          </select>
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <a href="${waUrl}" target="_blank" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Send WhatsApp Update">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
            </a>
            <button class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg delete-lead-btn" data-lead-id="${lead.id}" title="Delete Lead">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector(".lead-status-changer")?.addEventListener("change", (ev) => {
        lead.status = ev.target.value;
        this.saveLeads();
        this.updateDashboardStats();
        window.showToast(`Updated ${lead.name}'s status to ${lead.status}`);
      });

      tr.querySelector(".delete-lead-btn")?.addEventListener("click", () => {
        if (confirm(`Delete inquiry record for ${lead.name}?`)) {
          this.leads = this.leads.filter(l => l.id !== lead.id);
          this.saveLeads();
          this.renderLeadsTable();
          this.updateDashboardStats();
          window.showToast("Record removed");
        }
      });

      tbody.appendChild(tr);
    });
  }

  exportLeadsCSV() {
    if (this.leads.length === 0) {
      alert("No customer records to export.");
      return;
    }

    const headers = ["Inquiry ID", "Citizen Name", "Mobile Number", "Service Requested", "Fee (INR)", "Status", "Date", "Notes"];
    const rows = this.leads.map(l => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.mobile}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      l.fee || 0,
      `"${l.status}"`,
      `"${l.date}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `Janaseba_Customer_Register_${new Date().toISOString().split("T")[0]}.csv`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.showToast("Exported Customer Register to CSV!");
  }

  updateDashboardStats() {
    const totalEl = document.getElementById("stat-total-leads");
    const pendingEl = document.getElementById("stat-pending-leads");
    const doneEl = document.getElementById("stat-done-today");
    const revenueEl = document.getElementById("stat-total-revenue");

    const todayStr = new Date().toISOString().split("T")[0];

    const total = this.leads.length;
    const pending = this.leads.filter(l => l.status === "Pending" || l.status === "In Progress").length;
    const doneToday = this.leads.filter(l => l.status === "Done" && l.date === todayStr).length;
    const revenue = this.leads.filter(l => l.status === "Done").reduce((acc, l) => acc + (l.fee || 0), 0);

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (doneEl) doneEl.textContent = doneToday;
    if (revenueEl) revenueEl.textContent = "₹" + revenue.toLocaleString("en-IN");
  }
  // --- OFFLINE FORMS LIBRARY ---
  initFormsLibrary() {
    const forms = window.CSC_FORMS_DATA || [];
    this.renderForms(forms);

    const searchInp = document.getElementById("forms-search-input");
    if (searchInp) searchInp.addEventListener("input", () => this.filterForms());

    document.querySelectorAll("[data-form-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-form-cat]").forEach(b => {
          b.classList.remove("bg-blue-600", "text-white");
          b.classList.add("bg-white", "text-gray-700", "border-gray-200");
        });
        btn.classList.remove("bg-white", "text-gray-700", "border-gray-200");
        btn.classList.add("bg-blue-600", "text-white");
        this.filterForms();
      });
    });
  }

  filterForms() {
    const query = (document.getElementById("forms-search-input")?.value || "").toLowerCase();
    const activeCatBtn = document.querySelector("[data-form-cat].bg-blue-600");
    const cat = activeCatBtn ? activeCatBtn.getAttribute("data-form-cat") : "All";

    const filtered = (window.CSC_FORMS_DATA || []).filter(form => {
      const matchCat = cat === "All" || form.category === cat;
      const matchQuery = form.title.toLowerCase().includes(query) ||
                         form.hindiTitle.toLowerCase().includes(query) ||
                         form.department.toLowerCase().includes(query) ||
                         form.summary.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    this.renderForms(filtered);
  }

  renderForms(forms) {
    const grid = document.getElementById("forms-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (forms.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-100">
          <p class="text-base text-gray-500">No offline forms found for your search query.</p>
        </div>
      `;
      return;
    }

    forms.forEach(form => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";

      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-3 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              ${form.category}
            </span>
            <span class="text-xs text-gray-400 font-medium">⏱ ${form.processingTime}</span>
          </div>

          <h3 class="text-base font-bold text-gray-900 leading-snug">${form.title}</h3>
          <p class="text-xs font-medium text-emerald-700 mb-2">${form.hindiTitle}</p>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">${form.summary}</p>

          <div class="space-y-1.5 py-2.5 my-2 border-t border-b border-gray-100 text-xs">
            <div class="flex justify-between text-gray-600">
              <span class="text-gray-400">Department:</span>
              <span class="font-medium text-right truncate max-w-[180px]">${form.department}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span class="text-gray-400">Validity:</span>
              <span class="font-medium">${form.validity}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span class="text-gray-400">Govt Fee:</span>
              <span class="font-medium text-emerald-700">${form.govtFee}</span>
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <button class="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 form-checklist-btn" data-form-id="${form.id}">
            <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            Docs Checklist
          </button>
          <button class="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 form-print-btn" data-form-id="${form.id}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Form
          </button>
        </div>
      `;

      card.querySelector(".form-checklist-btn")?.addEventListener("click", () => {
        this.openFormChecklistModal(form.id);
      });

      card.querySelector(".form-print-btn")?.addEventListener("click", () => {
        this.printOfflineForm(form.id);
      });

      grid.appendChild(card);
    });
  }

  openFormChecklistModal(formId) {
    const form = (window.CSC_FORMS_DATA || []).find(f => f.id === formId);
    if (!form) return;

    const modal = document.getElementById("form-checklist-modal");
    const body = document.getElementById("form-checklist-body");
    const title = document.getElementById("form-checklist-title");

    if (title) title.textContent = form.title;
    if (body) {
      body.innerHTML = `
        <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <span class="font-bold">Important for VLE:</span> Hand this verified checklist to citizen or attach to citizen dossier before scanning.
        </div>

        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mandatory Supporting Documents</h4>
        <ul class="space-y-2 mb-5">
          ${form.docsRequired.map((doc, i) => `
            <li class="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-xs font-medium text-gray-800">
              <input type="checkbox" class="mt-0.5 rounded text-blue-600 focus:ring-blue-500" id="chk-${i}">
              <label for="chk-${i}" class="cursor-pointer">${doc}</label>
            </li>
          `).join("")}
        </ul>

        <div class="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
          <div><span class="text-gray-500">Service Validity:</span> <p class="font-bold text-gray-800">${form.validity}</p></div>
          <div><span class="text-gray-500">Govt / VLE Fee:</span> <p class="font-bold text-emerald-700">${form.govtFee}</p></div>
        </div>

        <div class="flex gap-2">
          <button onclick="window.printChecklist()" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Checklist Slip
          </button>
        </div>
      `;
    }

    if (modal) modal.classList.remove("hidden");
  }

  printOfflineForm(formId) {
    const form = (window.CSC_FORMS_DATA || []).find(f => f.id === formId);
    if (!form) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${form.title} - Janaseba Kendra</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.4; font-size: 13px; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px; position: relative; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header h3 { margin: 4px 0; font-size: 14px; font-weight: normal; color: #333; }
          .header p { margin: 2px 0; font-size: 11px; color: #555; }
          .photo-box { position: absolute; right: 0; top: 0; width: 110px; height: 130px; border: 1px dashed #000; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; padding: 4px; }
          .section-title { font-size: 12px; font-weight: bold; background: #f0f0f0; padding: 4px 8px; border: 1px solid #ccc; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; }
          table.fields { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          table.fields td { padding: 7px 4px; vertical-align: bottom; }
          .line-input { border-bottom: 1px dotted #333; min-width: 140px; display: inline-block; }
          .checklist { list-style: square; padding-left: 20px; font-size: 12px; }
          .declaration { font-size: 11px; text-align: justify; margin: 15px 0; line-height: 1.5; border: 1px solid #ddd; padding: 8px; background: #fafafa; }
          .footer-sig { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 4px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="photo-box">Affix Recent Passport Size Photograph (Self-Attested)</div>
          <p>GOVERNMENT OF ODISHA / INDIA • COMMON SERVICES CENTER</p>
          <h2>${form.title}</h2>
          <h3>${form.hindiTitle}</h3>
          <p>Department: ${form.department} | Application for Janaseba Kendra Service</p>
        </div>

        <div style="margin-right: 130px;">
          <table class="fields">
            <tr>
              <td width="25%"><b>Application / Token No:</b></td>
              <td width="35%"><span class="line-input" style="width: 100%;"></span></td>
              <td width="15%"><b>Date:</b></td>
              <td width="25%"><span class="line-input" style="width: 100%;"></span></td>
            </tr>
          </table>
        </div>

        <div class="section-title">1. Applicant Details / आवेदक का विवरण</div>
        <table class="fields">
          ${form.fields.map(f => `
            <tr>
              <td width="35%"><b>${f.label}:</b></td>
              <td width="65%"><span class="line-input" style="width: 100%;"></span></td>
            </tr>
          `).join("")}
        </table>

        <div class="section-title">2. Mandatory Enclosures / संलग्न दस्तावेज</div>
        <ul class="checklist">
          ${form.docsRequired.map(d => `<li>[  ] ${d}</li>`).join("")}
        </ul>

        <div class="declaration">
          <b>Self-Declaration:</b> I hereby solemnly declare that all the information given above is true, complete, and correct to the best of my knowledge and belief. In case any information is found false or incorrect at any stage, my application/certificate shall be liable to be cancelled and I shall be subject to legal proceedings under applicable laws.
        </div>

        <div class="footer-sig">
          <div class="sig-box">
            CSC Janaseba Kendra Seal & Sign<br>
            <span style="font-size: 9px; color: #666;">(VLE Verification Stamp)</span>
          </div>
          <div class="sig-box">
            Signature / Thumb Impression of Applicant<br>
            <span style="font-size: 9px; color: #666;">Date: ___________ Place: ___________</span>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // --- SARKARI UPDATES & SCHEMES ---
  initSarkariUpdates() {
    const updates = window.CSC_UPDATES_DATA || [];
    this.renderUpdates(updates);

    document.querySelectorAll("[data-update-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-update-filter]").forEach(b => {
          b.classList.remove("bg-blue-600", "text-white");
          b.classList.add("bg-white", "text-gray-700", "border-gray-200");
        });
        btn.classList.remove("bg-white", "text-gray-700", "border-gray-200");
        btn.classList.add("bg-blue-600", "text-white");
        this.filterUpdates();
      });
    });

    const searchInp = document.getElementById("updates-search-input");
    if (searchInp) searchInp.addEventListener("input", () => this.filterUpdates());
  }

  filterUpdates() {
    const query = (document.getElementById("updates-search-input")?.value || "").toLowerCase();
    const activeBtn = document.querySelector("[data-update-filter].bg-blue-600");
    const filter = activeBtn ? activeBtn.getAttribute("data-update-filter") : "All";

    const filtered = (window.CSC_UPDATES_DATA || []).filter(u => {
      const matchType = filter === "All" || u.type === filter || (filter === "Job" && (u.type === "Job" || u.type === "Results"));
      const matchQuery = u.title.toLowerCase().includes(query) ||
                         u.hindiTitle.toLowerCase().includes(query) ||
                         u.eligibility.toLowerCase().includes(query) ||
                         u.authority.toLowerCase().includes(query);
      return matchType && matchQuery;
    });

    this.renderUpdates(filtered);
  }

  renderUpdates(updates) {
    const grid = document.getElementById("updates-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (updates.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-12 text-center bg-white rounded-2xl border border-gray-100">
          <p class="text-base text-gray-500">No Sarkari schemes or job notices found matching your search.</p>
        </div>
      `;
      return;
    }

    updates.forEach(u => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";

      const badgeColor =
        u.badgeColor === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
        u.badgeColor === "purple" ? "bg-purple-50 text-purple-700 border-purple-200" :
        u.badgeColor === "red" ? "bg-red-50 text-red-700 border-red-200" :
        u.badgeColor === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" :
        "bg-blue-50 text-blue-700 border-blue-200";

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}">
              ${u.badge}
            </span>
            <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
              ${u.level} Govt
            </span>
          </div>

          <h3 class="text-base font-bold text-gray-900 leading-snug">${u.title}</h3>
          <p class="text-xs font-medium text-blue-700 mb-2.5">${u.hindiTitle}</p>

          <div class="p-3 bg-gray-50 rounded-xl mb-3 space-y-1.5 text-xs text-gray-700">
            <p><span class="font-semibold text-gray-900">Authority:</span> ${u.authority}</p>
            <p><span class="font-semibold text-gray-900">Eligibility:</span> ${u.eligibility}</p>
            <p><span class="font-semibold text-gray-900">Benefit:</span> <span class="text-emerald-700 font-medium">${u.benefit}</span></p>
            <p><span class="font-semibold text-gray-900">Timeline:</span> <span class="text-rose-600 font-semibold">${u.lastDate}</span></p>
          </div>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <button class="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 copy-wa-btn" data-update-id="${u.id}">
            <svg class="w-3.5 h-3.5 text-emerald-600 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/></svg>
            Copy WhatsApp Notice
          </button>
          <a href="${u.applyUrl}" target="_blank" class="py-2 px-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1">
            Apply ↗
          </a>
        </div>
      `;

      card.querySelector(".copy-wa-btn")?.addEventListener("click", () => {
        navigator.clipboard.writeText(u.whatsappTemplate).then(() => {
          window.showToast("WhatsApp notice copied to clipboard! Ready to paste in village groups.");
        }).catch(() => {
          alert(u.whatsappTemplate);
        });
      });

      grid.appendChild(card);
    });
  }

  // --- RATE CARD & RECEIPT GENERATOR ---
  initRateCalculator() {
    const calcBtn = document.getElementById("generate-receipt-btn");
    if (!calcBtn) return;

    calcBtn.addEventListener("click", () => {
      const citizenName = document.getElementById("rc-citizen-name")?.value || "Citizen";
      const citizenMobile = document.getElementById("rc-citizen-mobile")?.value || "N/A";
      const serviceSelect = document.getElementById("rc-service-select");
      const serviceText = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : "CSC Service";
      const fee = parseInt(document.getElementById("rc-fee-amount")?.value, 10) || 50;

      const printWin = window.open("", "_blank");
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CSC Janaseba Kendra Receipt</title>
          <style>
            @page { size: 80mm 120mm; margin: 5mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; margin: 0; padding: 5px; color: #000; }
            .receipt { border: 1px dashed #444; padding: 8px; border-radius: 4px; }
            .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
            .header h3 { margin: 0; font-size: 14px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 6px 0; }
            td { padding: 3px 0; }
            .total-row { border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-weight: bold; font-size: 12px; }
            .footer { text-align: center; margin-top: 12px; font-size: 9px; color: #555; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h3>JANASEBA KENDRA</h3>
              <p>Common Services Center (CSC) • Digital India</p>
              <p>Date: ${new Date().toLocaleString("en-IN")}</p>
            </div>

            <table>
              <tr><td>Receipt No:</td><td align="right">#JK-${Date.now().toString().slice(-6)}</td></tr>
              <tr><td>Citizen Name:</td><td align="right"><b>${citizenName}</b></td></tr>
              <tr><td>Mobile:</td><td align="right">${citizenMobile}</td></tr>
              <tr><td>Service:</td><td align="right">${serviceText}</td></tr>
            </table>

            <table>
              <tr class="total-row">
                <td>Total Amount Paid:</td>
                <td align="right">₹ ${fee}.00</td>
              </tr>
            </table>

            <div class="footer">
              <p>Thank you for using Digital Seva Services!</p>
              <p>Authorized VLE Seal / Stamp</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWin.document.close();
      setTimeout(() => {
        printWin.print();
      }, 500);
    });
  }

  initSubmodules() {
    try {
      window.passportMaker = new window.PassportPhotoMaker();
    } catch (e) {
      console.warn("PassportPhotoMaker init error:", e);
    }

    try {
      window.panResizer = new window.PanCardResizer();
    } catch (e) {
      console.warn("PanCardResizer init error:", e);
    }

    try {
      window.pdfToolkit = new window.PdfToolkit();
    } catch (e) {
      console.warn("PdfToolkit init error:", e);
    }
  }
}

window.printChecklist = function() {
  const modalBody = document.getElementById("form-checklist-body");
  const title = document.getElementById("form-checklist-title")?.textContent || "Document Checklist";
  if (!modalBody) return;

  const win = window.open("", "_blank");
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - Janaseba Kendra Checklist</title>
      <style>
        body { font-family: sans-serif; font-size: 13px; padding: 20px; line-height: 1.5; }
        h2 { border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <h2>CSC Janaseba Kendra • Document Checklist</h2>
      <h3>${title}</h3>
      ${modalBody.innerHTML}
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
};

document.addEventListener("DOMContentLoaded", () => {
  window.app = new CscPortalApp();
});

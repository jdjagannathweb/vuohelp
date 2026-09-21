/**
 * VUO CSC HELP - VLE Udhar Khata / Credit Note Ledger
 * Tracks customer credit balances, calculates 7-day overdue reminders,
 * provides 1-click WhatsApp & SMS payment reminders, and generates credit slips.
 */

const VUO_CREDITKHATA = {
  storageKey: 'vuo_vle_credit_khata',
  currentFilter: 'all', // 'all', 'overdue', 'paid'
  entries: [],

  init() {
    this.loadEntries();
    this.renderMetrics();
    this.renderList();
    this.updateNavBadge();
  },

  loadEntries() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.entries = JSON.parse(data);
      } else {
        // Sample default entries so VLE sees how 7-day overdue detection works
        const now = Date.now();
        const tenDaysAgo = new Date(now - (10 * 86400000)).toISOString().split('T')[0];
        const twoDaysAgo = new Date(now - (2 * 86400000)).toISOString().split('T')[0];
        
        this.entries = [
          {
            id: 'CR-' + (now - 1000),
            name: 'Bikash Mohanty',
            mobile: '9861234567',
            service: 'Online Form Fillup + Color Print (OPSC)',
            amount: 250,
            date: tenDaysAgo,
            status: 'pending',
            notes: 'Will pay on coming Monday',
            createdAt: now - (10 * 86400000)
          },
          {
            id: 'CR-' + (now - 2000),
            name: 'Prakash Rout',
            mobile: '9437012345',
            service: 'PVC Smart Card + Lamination (Aadhaar)',
            amount: 120,
            date: twoDaysAgo,
            status: 'pending',
            notes: 'Partial paid 50, due balance 120',
            createdAt: now - (2 * 86400000)
          }
        ];
        this.saveEntries();
      }
    } catch (e) {
      console.warn("Error loading credit khata:", e);
      this.entries = [];
    }
  },

  saveEntries() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (e) {
      console.warn("Error saving credit khata:", e);
    }
  },

  getDaysOverdue(dateStr) {
    if (!dateStr) return 0;
    const entryDate = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - entryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  isOverdue(entry) {
    if (entry.status === 'paid') return false;
    return this.getDaysOverdue(entry.date) >= 7;
  },

  addEntry(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('khataCustName');
    const mobileInput = document.getElementById('khataCustMobile');
    const serviceInput = document.getElementById('khataCustService');
    const amountInput = document.getElementById('khataCustAmount');
    const dateInput = document.getElementById('khataCustDate');
    const notesInput = document.getElementById('khataCustNotes');

    const name = nameInput ? nameInput.value.trim() : '';
    let mobile = mobileInput ? mobileInput.value.trim().replace(/\D/g, '') : '';
    const service = serviceInput ? serviceInput.value.trim() : '';
    const amount = amountInput ? parseFloat(amountInput.value) : 0;
    const date = dateInput ? (dateInput.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
    const notes = notesInput ? notesInput.value.trim() : '';

    if (mobile.length === 12 && mobile.startsWith('91')) {
      mobile = mobile.substring(2);
    }

    if (!name || name.length < 2) {
      if (typeof showToast === 'function') showToast("Please enter Customer Name.", "warning");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!mobile || mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      if (typeof showToast === 'function') showToast("Please enter valid 10-digit WhatsApp/Mobile Number.", "warning");
      if (mobileInput) mobileInput.focus();
      return;
    }

    if (!amount || amount <= 0) {
      if (typeof showToast === 'function') showToast("Please enter a valid credit amount (₹).", "warning");
      if (amountInput) amountInput.focus();
      return;
    }

    const newEntry = {
      id: 'CR-' + Date.now(),
      name,
      mobile,
      service: service || 'CSC Citizen Service',
      amount,
      date,
      status: 'pending',
      notes,
      createdAt: Date.now()
    };

    this.entries.unshift(newEntry);
    this.saveEntries();

    // Reset form fields
    if (nameInput) nameInput.value = '';
    if (mobileInput) mobileInput.value = '';
    if (serviceInput) serviceInput.value = '';
    if (amountInput) amountInput.value = '';
    if (notesInput) notesInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    this.renderMetrics();
    this.renderList();
    this.updateNavBadge();

    if (typeof showToast === 'function') {
      showToast(`Credit entry for ${name} (₹${amount}) saved successfully!`, 'success');
    }
  },

  markAsPaid(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    entry.status = 'paid';
    entry.paidAt = new Date().toISOString();
    this.saveEntries();

    this.renderMetrics();
    this.renderList();
    this.updateNavBadge();

    if (typeof showToast === 'function') {
      showToast(`Entry for ${entry.name} marked as PAID / CLEARED!`, 'success');
    }
  },

  deleteEntry(id) {
    if (!confirm("Are you sure you want to delete this credit record?")) return;

    this.entries = this.entries.filter(e => e.id !== id);
    this.saveEntries();

    this.renderMetrics();
    this.renderList();
    this.updateNavBadge();

    if (typeof showToast === 'function') {
      showToast("Credit record deleted.", "info");
    }
  },

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.khata-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === filter) {
        btn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      } else {
        btn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      }
    });
    this.renderList();
  },

  sendWhatsAppReminder(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const shopName = document.getElementById('posterShopName')?.value.trim() || 'Digital Seva Kendra';
    const vlePhone = document.getElementById('posterPhone')?.value.trim() || '';
    const days = this.getDaysOverdue(entry.date);

    const message = `ନମସ୍କାର ${entry.name} ଆଜ୍ଞା,\n\nଆପଣଙ୍କର ${shopName} ରେ "${entry.service}" ବାବଦକୁ ମୋଟ ₹${entry.amount}/- ଟଙ୍କା ବାକି (Udhar / Credit) ରହିଅଛି। (ତାରିଖ: ${entry.date}${days >= 7 ? ` - ${days} ଦିନ ବିତିଗଲାଣି` : ''})।\n\nଦୟାକରି ଏହି ବାକି ଟଙ୍କା ଶୀଘ୍ର ପରିଶୋଧ କରିବାକୁ ଅନୁରୋଧ। \n\nଧନ୍ୟବାଦ,\n${shopName}\nମୋବାଇଲ୍: ${vlePhone}`;

    const cleanMobile = entry.mobile.replace(/\D/g, '').slice(-10);
    const waUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    entry.lastReminderAt = Date.now();
    this.saveEntries();
    this.renderList();

    if (typeof showToast === 'function') {
      showToast(`WhatsApp reminder sent to ${entry.name}!`, 'success');
    }
  },

  copySmsText(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const shopName = document.getElementById('posterShopName')?.value.trim() || 'Digital Seva Kendra';
    const text = `Dear ${entry.name}, your due balance at ${shopName} for "${entry.service}" is Rs.${entry.amount}. Kindly clear your pending payment soon. Thanks, ${shopName}`;

    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast("SMS text copied to clipboard! You can paste & send via normal SMS.", "success");
      }
    }).catch(() => {
      alert("SMS Text:\n" + text);
    });
  },

  printCreditSlip(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const shopName = document.getElementById('posterShopName')?.value.trim() || 'ODISHA DIGITAL SEVA KENDRA';
    const vlePhone = document.getElementById('posterPhone')?.value.trim() || '+91 9937037131';
    const vleAddress = document.getElementById('posterAddress')?.value.trim() || 'Odisha';

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast("Please allow popups to print slip.", "warning");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Credit Slip - ${entry.name}</title>
        <style>
          @page { size: 80mm 120mm; margin: 5mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; margin: 0; padding: 10px; color: #111; }
          .receipt { border: 1.5px dashed #444; padding: 10px; border-radius: 6px; }
          .header { text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 8px; }
          .shop-title { font-size: 14px; font-weight: 900; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: bold; }
          .amount-box { background: #f4f4f4; padding: 6px; text-align: center; font-size: 16px; font-weight: 900; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
          .footer { text-align: center; font-size: 9px; color: #666; margin-top: 10px; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="receipt">
          <div class="header">
            <div class="shop-title">${shopName}</div>
            <div style="font-size: 10px;">${vleAddress}</div>
            <div style="font-size: 10px;">Mob: ${vlePhone}</div>
            <div style="margin-top: 4px; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #b91c1c;">CUSTOMER UDHAR / CREDIT SLIP</div>
          </div>
          <div class="row"><span>Slip No:</span><span class="bold">${entry.id}</span></div>
          <div class="row"><span>Date:</span><span>${entry.date}</span></div>
          <div class="row"><span>Customer:</span><span class="bold">${entry.name}</span></div>
          <div class="row"><span>Mobile:</span><span>${entry.mobile}</span></div>
          <div class="row"><span>Service:</span><span>${entry.service}</span></div>
          ${entry.notes ? `<div class="row"><span>Notes:</span><span>${entry.notes}</span></div>` : ''}
          <div class="amount-box">
            DUE AMOUNT: ₹${entry.amount}/-
          </div>
          <div class="row"><span style="font-size: 10px;">Status:</span><span class="bold" style="color: ${entry.status === 'paid' ? '#059669' : '#b91c1c'}; text-transform: uppercase;">${entry.status === 'paid' ? 'PAID / CLEARED' : 'PENDING'}</span></div>
          <div class="footer">
            Computer Generated Credit Record • VUO CSC Help<br>
            Please clear your due payment at the earliest.
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  renderMetrics() {
    let pendingTotal = 0;
    let overdueTotal = 0;
    let paidTotal = 0;
    let pendingCustomers = 0;
    let overdueCount = 0;

    this.entries.forEach(entry => {
      if (entry.status === 'pending') {
        pendingTotal += entry.amount;
        pendingCustomers++;
        if (this.isOverdue(entry)) {
          overdueTotal += entry.amount;
          overdueCount++;
        }
      } else if (entry.status === 'paid') {
        paidTotal += entry.amount;
      }
    });

    const pendingEl = document.getElementById('khataMetricPending');
    const overdueEl = document.getElementById('khataMetricOverdue');
    const paidEl = document.getElementById('khataMetricPaid');
    const countEl = document.getElementById('khataMetricCount');

    if (pendingEl) pendingEl.textContent = '₹' + pendingTotal.toLocaleString('en-IN');
    if (overdueEl) overdueEl.textContent = '₹' + overdueTotal.toLocaleString('en-IN') + ` (${overdueCount})`;
    if (paidEl) paidEl.textContent = '₹' + paidTotal.toLocaleString('en-IN');
    if (countEl) countEl.textContent = pendingCustomers.toString();
  },

  updateNavBadge() {
    const overdueCount = this.entries.filter(e => this.isOverdue(e)).length;
    const badge = document.getElementById('creditOverdueBadgeNav');
    if (badge) {
      if (overdueCount > 0) {
        badge.textContent = overdueCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  renderList() {
    const container = document.getElementById('khataEntriesContainer');
    if (!container) return;

    let filtered = this.entries;
    if (this.currentFilter === 'overdue') {
      filtered = this.entries.filter(e => this.isOverdue(e));
    } else if (this.currentFilter === 'paid') {
      filtered = this.entries.filter(e => e.status === 'paid');
    } else {
      // 'all' shows pending first, then overdue
      filtered = [...this.entries].sort((a, b) => {
        if (a.status === 'pending' && b.status === 'paid') return -1;
        if (a.status === 'paid' && b.status === 'pending') return 1;
        return new Date(b.date) - new Date(a.date);
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <i class="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
          <p class="text-xs font-bold text-slate-500">No credit records found in this category.</p>
          <p class="text-[11px] text-slate-400 mt-1">Use the "Add New Credit Entry" form on the left to add your customers' udhar khata.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(entry => {
      const isOver = this.isOverdue(entry);
      const days = this.getDaysOverdue(entry.date);
      const isPaid = entry.status === 'paid';

      return `
        <div class="p-4 rounded-2xl border transition-all ${isOver ? 'bg-rose-50/50 border-rose-300 shadow-sm' : isPaid ? 'bg-slate-50/60 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-black text-slate-900 text-sm">${entry.name}</span>
              <a href="tel:${entry.mobile}" class="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 hover:bg-sky-100">
                <i class="fa-solid fa-phone mr-1"></i>${entry.mobile}
              </a>
              ${isPaid ? `
                <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  <i class="fa-solid fa-check mr-1"></i>PAID / CLEARED
                </span>
              ` : isOver ? `
                <span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse shadow-xs">
                  <i class="fa-solid fa-triangle-exclamation mr-1"></i>${days} DAYS OVERDUE (7+ DAY ALERT)
                </span>
              ` : `
                <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                  Pending (${days} days)
                </span>
              `}
            </div>

            <p class="text-xs font-medium text-slate-600">
              <strong>Service:</strong> ${entry.service}
              ${entry.notes ? `<span class="italic text-slate-500 ml-2">(${entry.notes})</span>` : ''}
            </p>

            <div class="flex items-center gap-3 text-[11px] text-slate-400">
              <span><i class="fa-regular fa-calendar mr-1"></i>${entry.date}</span>
              ${entry.lastReminderAt ? `
                <span class="text-emerald-700 font-semibold"><i class="fa-brands fa-whatsapp mr-1"></i>Reminder Sent: ${new Date(entry.lastReminderAt).toLocaleDateString()}</span>
              ` : ''}
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div class="text-right">
              <span class="text-xs text-slate-400 uppercase font-bold mr-1">Amount:</span>
              <span class="text-lg font-black ${isPaid ? 'text-slate-500 line-through' : isOver ? 'text-rose-600' : 'text-slate-900'}">
                ₹${entry.amount}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              ${!isPaid ? `
                <button type="button" onclick="VUO_CREDITKHATA.sendWhatsAppReminder('${entry.id}')" title="Send WhatsApp Payment Reminder" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                  <span>Remind</span>
                </button>
                <button type="button" onclick="VUO_CREDITKHATA.copySmsText('${entry.id}')" title="Copy SMS Reminder text" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer">
                  <i class="fa-regular fa-comment-dots"></i>
                </button>
                <button type="button" onclick="VUO_CREDITKHATA.markAsPaid('${entry.id}')" title="Mark as Paid" class="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-300 text-xs font-bold transition-all cursor-pointer">
                  <i class="fa-solid fa-check mr-1"></i>Paid
                </button>
              ` : ''}

              <button type="button" onclick="VUO_CREDITKHATA.printCreditSlip('${entry.id}')" title="Print Slip" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer">
                <i class="fa-solid fa-print"></i>
              </button>

              <button type="button" onclick="VUO_CREDITKHATA.deleteEntry('${entry.id}')" title="Delete Record" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition-all cursor-pointer">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

        </div>
      `;
    }).join('');
  }
};

window.VUO_CREDITKHATA = VUO_CREDITKHATA;

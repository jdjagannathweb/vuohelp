/**
 * VUO CSC HELP - VLE Daily Cashbook & Profit Register + Customer Khata Book
 * Handles:
 *  1. Daily Transaction Ledger with Real-Time Profit Calculation (Revenue - Govt Fee/Cost = Profit)
 *  2. Date / Period Filters: Specific Date Picker, Today, Yesterday, Last 7 Days, This Month, Last Month, Specific Month Picker
 *  3. Automatic Link to Customer Khata Book (Udhar Khata) for partial payments / pending balances
 *  4. Customer Khata Book with 7-Day Overdue Tracking, Odia WhatsApp & SMS Payment Reminders, and Credit Slips
 *  5. Export to Excel (CSV), Printable Daily Sheets, and Daily WhatsApp Business Closing Summary
 */

const VUO_CASHBOOK = {
  storageKey: 'vuo_vle_cashbook_entries',
  entries: [],
  currentFilter: 'today', // 'today', 'yesterday', 'week', 'this_month', 'last_month', 'custom_date', 'custom_month', 'all'
  selectedDate: '',
  selectedMonth: '',
  searchQuery: '',
  activeTab: 'daily', // 'daily' (Cashbook) or 'khata' (Customer Khata Book)

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  getTodayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  },

  getYesterdayStr() {
    const d = new Date(Date.now() - 86400000);
    return d.toISOString().split('T')[0];
  },

  getCurrentMonthStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  getLastMonthStr() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  init() {
    this.selectedDate = this.getTodayStr();
    this.selectedMonth = this.getCurrentMonthStr();
    this.loadEntries();
    this.setupDatePickers();
    this.renderMetrics();
    this.renderTable();
    this.updateServicePresets();

    // Also initialize credit khata
    if (typeof VUO_CREDITKHATA !== 'undefined') {
      VUO_CREDITKHATA.init();
    }
  },

  setupDatePickers() {
    const dateInput = document.getElementById('cbFilterCustomDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = this.selectedDate;
    }
    const monthInput = document.getElementById('cbFilterCustomMonth');
    if (monthInput && !monthInput.value) {
      monthInput.value = this.selectedMonth;
    }
    const entryDateInput = document.getElementById('cbEntryDate');
    if (entryDateInput && !entryDateInput.value) {
      entryDateInput.value = this.selectedDate;
    }
    const entryTimeInput = document.getElementById('cbEntryTime');
    if (entryTimeInput && !entryTimeInput.value) {
      const now = new Date();
      entryTimeInput.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }
  },

  updateServicePresets() {
    const serviceInput = document.getElementById('cbEntryServiceSelect');
    if (serviceInput && serviceInput.children.length <= 1) {
      const presets = [
        { name: "Subhadra Yojana e-KYC / Application", fee: 60, cost: 0 },
        { name: "Caste / Income / Resident Certificate", fee: 80, cost: 30 },
        { name: "Aadhaar Color PVC Smart Card Print", fee: 60, cost: 15 },
        { name: "New PAN Card Apply (Form 49A)", fee: 150, cost: 107 },
        { name: "Electricity Bill Payment (TPCODL/TPSODL)", fee: 20, cost: 0 },
        { name: "AePS Aadhaar Cash Withdrawal", fee: 30, cost: 0 },
        { name: "Odisha Police / Sarkari Job Form Apply", fee: 100, cost: 0 },
        { name: "PM-Kisan / KALIA e-KYC & Status", fee: 50, cost: 15 },
        { name: "Passport Size Photo (8/16 Copies)", fee: 50, cost: 10 },
        { name: "A4 Xerox / Color Document Print & Lamination", fee: 40, cost: 8 }
      ];
      presets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify(p);
        opt.textContent = `${p.name} (Fee: ₹${p.fee} | Cost: ₹${p.cost})`;
        serviceInput.appendChild(opt);
      });

      serviceInput.addEventListener('change', (e) => {
        if (!e.target.value) return;
        try {
          const item = JSON.parse(e.target.value);
          const nameInput = document.getElementById('cbEntryService');
          const amountInput = document.getElementById('cbEntryAmount');
          const costInput = document.getElementById('cbEntryCost');
          if (nameInput) nameInput.value = item.name;
          if (amountInput) amountInput.value = item.fee;
          if (costInput) costInput.value = item.cost;
          this.recalculateLiveProfit();
        } catch (err) {}
      });
    }
  },

  recalculateLiveProfit() {
    const amt = parseFloat(document.getElementById('cbEntryAmount')?.value || 0);
    const cost = parseFloat(document.getElementById('cbEntryCost')?.value || 0);
    const profitEl = document.getElementById('cbEntryProfitPreview');
    const profit = Math.round((amt - cost) * 100) / 100;
    if (profitEl) {
      profitEl.textContent = `₹${profit.toLocaleString('en-IN')}`;
      if (profit >= 0) {
        profitEl.className = 'text-emerald-700 font-black text-sm';
      } else {
        profitEl.className = 'text-rose-600 font-black text-sm';
      }
    }

    // Auto-update due amounts if partial
    const status = document.getElementById('cbEntryPaymentStatus')?.value;
    const paidInput = document.getElementById('cbEntryPaidAmount');
    const dueInput = document.getElementById('cbEntryDueAmount');
    if (status === 'full_paid') {
      if (paidInput) paidInput.value = amt;
      if (dueInput) dueInput.value = 0;
    } else if (status === 'due') {
      if (paidInput) paidInput.value = 0;
      if (dueInput) dueInput.value = amt;
    } else if (status === 'partial_paid') {
      const paid = parseFloat(paidInput?.value || 0);
      if (dueInput) dueInput.value = Math.max(0, amt - paid);
    }
  },

  onPaymentStatusChange() {
    const status = document.getElementById('cbEntryPaymentStatus')?.value;
    const partialFields = document.getElementById('cbPartialFieldsBox');
    const khataCheckboxBox = document.getElementById('cbKhataCheckboxBox');
    const khataCheckbox = document.getElementById('cbEntryAddToKhata');

    if (status === 'partial_paid' || status === 'due') {
      if (partialFields) partialFields.classList.remove('hidden');
      if (khataCheckboxBox) khataCheckboxBox.classList.remove('hidden');
      if (khataCheckbox) khataCheckbox.checked = true;
    } else {
      if (partialFields) partialFields.classList.add('hidden');
      if (khataCheckboxBox) khataCheckboxBox.classList.add('hidden');
      if (khataCheckbox) khataCheckbox.checked = false;
    }
    this.recalculateLiveProfit();
  },

  loadEntries() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        let loaded = JSON.parse(data);
        // Filter out any dummy demo sample entries
        this.entries = Array.isArray(loaded) ? loaded.filter(e => e.customerName !== 'Bikash Chandra Mohanty' && e.customerName !== 'Sasmita Rout' && e.customerName !== 'Pradeep Kumar Nayak' && e.customerName !== 'Manas Ranjan Sahoo') : [];
      } else {
        this.entries = []; // Fresh empty register ready for genuine citizen transactions
        this.saveEntries();
      }
    } catch (e) {
      console.warn("Error loading cashbook entries:", e);
      this.entries = [];
    }
  },

  saveEntries() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (e) {
      console.warn("Error saving cashbook:", e);
    }
  },

  addTransaction(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('cbEntryCustName');
    const mobileInput = document.getElementById('cbEntryCustMobile');
    const serviceInput = document.getElementById('cbEntryService');
    const amountInput = document.getElementById('cbEntryAmount');
    const costInput = document.getElementById('cbEntryCost');
    const modeInput = document.getElementById('cbEntryPaymentMode');
    const statusInput = document.getElementById('cbEntryPaymentStatus');
    const paidInput = document.getElementById('cbEntryPaidAmount');
    const dueInput = document.getElementById('cbEntryDueAmount');
    const addToKhataInput = document.getElementById('cbEntryAddToKhata');
    const dateInput = document.getElementById('cbEntryDate');
    const timeInput = document.getElementById('cbEntryTime');
    const notesInput = document.getElementById('cbEntryNotes');

    const customerName = nameInput ? nameInput.value.trim() : '';
    let customerMobile = mobileInput ? mobileInput.value.trim().replace(/\D/g, '') : '';
    const service = serviceInput ? serviceInput.value.trim() : 'CSC Citizen Service';
    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    const cost = parseFloat(costInput ? costInput.value : 0) || 0;
    const paymentMode = modeInput ? modeInput.value : 'cash';
    const paymentStatus = statusInput ? statusInput.value : 'full_paid';
    const date = dateInput ? (dateInput.value || this.getTodayStr()) : this.getTodayStr();
    const time = timeInput ? (timeInput.value || '12:00 PM') : '12:00 PM';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (customerMobile.length === 12 && customerMobile.startsWith('91')) {
      customerMobile = customerMobile.substring(2);
    }

    if (!customerName || customerName.length < 2) {
      if (typeof showToast === 'function') showToast("Please enter Customer Name.", "warning");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!customerMobile || customerMobile.length !== 10 || !/^[6-9]/.test(customerMobile)) {
      if (typeof showToast === 'function') showToast("Please enter valid 10-digit Customer Mobile Number.", "warning");
      if (mobileInput) mobileInput.focus();
      return;
    }

    if (amount <= 0) {
      if (typeof showToast === 'function') showToast("Please enter total customer fee amount (₹).", "warning");
      if (amountInput) amountInput.focus();
      return;
    }

    let paidAmount = amount;
    let dueAmount = 0;
    if (paymentStatus === 'due') {
      paidAmount = 0;
      dueAmount = amount;
    } else if (paymentStatus === 'partial_paid') {
      paidAmount = parseFloat(paidInput ? paidInput.value : 0) || 0;
      dueAmount = parseFloat(dueInput ? dueInput.value : 0) || (amount - paidAmount);
    }

    const profit = Math.round((amount - cost) * 100) / 100;
    const addToKhata = addToKhataInput ? addToKhataInput.checked : false;

    let khataEntryId = null;
    // Auto-link to Customer Khata Book (Udhar Khata) if due exists & box is checked
    if (dueAmount > 0 && addToKhata && typeof VUO_CREDITKHATA !== 'undefined') {
      const khataEntry = VUO_CREDITKHATA.addDirectEntry({
        name: customerName,
        mobile: customerMobile,
        service: `${service} (Due: ₹${dueAmount})`,
        amount: dueAmount,
        date: date,
        notes: notes ? `${notes} [Linked from Cashbook]` : 'Partial payment due from Cashbook'
      });
      if (khataEntry && khataEntry.id) {
        khataEntryId = khataEntry.id;
      }
    }

    const newTx = {
      id: 'CB-' + Date.now(),
      date,
      time,
      customerName,
      customerMobile,
      service,
      amount,
      cost,
      profit,
      paymentMode,
      paymentStatus,
      paidAmount,
      dueAmount,
      addToKhata,
      khataEntryId,
      notes,
      createdAt: Date.now()
    };

    this.entries.unshift(newTx);
    this.saveEntries();

    // Reset inputs
    if (nameInput) nameInput.value = '';
    if (mobileInput) mobileInput.value = '';
    if (serviceInput) serviceInput.value = '';
    if (amountInput) amountInput.value = '';
    if (costInput) costInput.value = '0';
    if (notesInput) notesInput.value = '';
    const serviceSelect = document.getElementById('cbEntryServiceSelect');
    if (serviceSelect) serviceSelect.value = '';
    if (statusInput) statusInput.value = 'full_paid';
    this.onPaymentStatusChange();

    this.renderMetrics();
    this.renderTable();

    if (typeof showToast === 'function') {
      const dueMsg = dueAmount > 0 ? ` (₹${dueAmount} added to Customer Khata Book)` : '';
      showToast(`Transaction saved! Profit: ₹${profit}${dueMsg}`, "success");
    }
  },

  deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this cashbook transaction record?")) return;
    this.entries = this.entries.filter(e => e.id !== id);
    this.saveEntries();
    this.renderMetrics();
    this.renderTable();
    if (typeof showToast === 'function') {
      showToast("Transaction deleted successfully.", "info");
    }
  },

  setFilter(mode) {
    this.currentFilter = mode;

    document.querySelectorAll('.cb-filter-btn').forEach(btn => {
      const target = btn.getAttribute('data-cb-filter');
      if (target === mode) {
        btn.className = 'cb-filter-btn px-3 py-1.5 rounded-xl font-black text-xs transition-all bg-emerald-600 text-white shadow-sm cursor-pointer flex items-center gap-1.5';
      } else {
        btn.className = 'cb-filter-btn px-3 py-1.5 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5';
      }
    });

    this.renderMetrics();
    this.renderTable();
  },

  onCustomDateSelected(dateVal) {
    if (!dateVal) return;
    this.selectedDate = dateVal;
    this.setFilter('custom_date');
  },

  onCustomMonthSelected(monthVal) {
    if (!monthVal) return;
    this.selectedMonth = monthVal;
    this.setFilter('custom_month');
  },

  onSearchInput(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.renderMetrics();
    this.renderTable();
  },

  getFilteredEntries() {
    const today = this.getTodayStr();
    const yesterday = this.getYesterdayStr();
    const thisMonth = this.getCurrentMonthStr();
    const lastMonth = this.getLastMonthStr();

    let list = this.entries;

    // Filter by period / date
    if (this.currentFilter === 'today') {
      list = list.filter(e => e.date === today);
    } else if (this.currentFilter === 'yesterday') {
      list = list.filter(e => e.date === yesterday);
    } else if (this.currentFilter === 'week') {
      const sevenDaysAgo = new Date(Date.now() - (7 * 86400000)).toISOString().split('T')[0];
      list = list.filter(e => e.date >= sevenDaysAgo);
    } else if (this.currentFilter === 'this_month') {
      list = list.filter(e => (e.date || '').startsWith(thisMonth));
    } else if (this.currentFilter === 'last_month') {
      list = list.filter(e => (e.date || '').startsWith(lastMonth));
    } else if (this.currentFilter === 'custom_date') {
      list = list.filter(e => e.date === this.selectedDate);
    } else if (this.currentFilter === 'custom_month') {
      list = list.filter(e => (e.date || '').startsWith(this.selectedMonth));
    }

    // Filter by search query
    if (this.searchQuery) {
      list = list.filter(e => 
        (e.customerName || '').toLowerCase().includes(this.searchQuery) ||
        (e.customerMobile || '').includes(this.searchQuery) ||
        (e.service || '').toLowerCase().includes(this.searchQuery)
      );
    }

    return list;
  },

  getFilterTitle() {
    if (this.currentFilter === 'today') return "Today's Ledger (ଆଜିର ହିସାବ)";
    if (this.currentFilter === 'yesterday') return "Yesterday's Ledger (ଗତକାଲିର ହିସାବ)";
    if (this.currentFilter === 'week') return "Last 7 Days (ବିଗତ ୭ ଦିନର ହିସାବ)";
    if (this.currentFilter === 'this_month') return "This Month (ଚଳିତ ମାସର ହିସାବ)";
    if (this.currentFilter === 'last_month') return "Last Month (ପୂର୍ବ ମାସର ହିସାବ)";
    if (this.currentFilter === 'custom_date') return `Date: ${this.selectedDate} (ଚୟନିତ ତାରିଖ)`;
    if (this.currentFilter === 'custom_month') return `Month: ${this.selectedMonth} (ଚୟନିତ ମାସ)`;
    return "All Time Transactions (ସବୁ ସମୟର ହିସାବ)";
  },

  renderMetrics() {
    const list = this.getFilteredEntries();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalDue = 0;
    let cashCount = 0;
    let upiCount = 0;
    let cashAmount = 0;
    let upiAmount = 0;

    list.forEach(tx => {
      totalRevenue += (tx.amount || 0);
      totalCost += (tx.cost || 0);
      totalProfit += (tx.profit !== undefined ? tx.profit : ((tx.amount || 0) - (tx.cost || 0)));
      totalDue += (tx.dueAmount || 0);

      const paidPart = tx.paidAmount !== undefined ? tx.paidAmount : tx.amount;
      if (tx.paymentMode === 'upi') {
        upiCount++;
        upiAmount += paidPart;
      } else {
        cashCount++;
        cashAmount += paidPart;
      }
    });

    totalProfit = Math.round(totalProfit * 100) / 100;

    const countEl = document.getElementById('cbMetricTxCount');
    const revEl = document.getElementById('cbMetricRevenue');
    const costEl = document.getElementById('cbMetricCost');
    const profitEl = document.getElementById('cbMetricProfit');
    const dueEl = document.getElementById('cbMetricDue');
    const modeSplitEl = document.getElementById('cbMetricModeSplit');
    const titleEl = document.getElementById('cbActiveFilterTitle');

    if (countEl) countEl.textContent = list.length.toString();
    if (revEl) revEl.textContent = '₹' + Math.round(totalRevenue).toLocaleString('en-IN');
    if (costEl) costEl.textContent = '₹' + Math.round(totalCost).toLocaleString('en-IN');
    if (profitEl) {
      profitEl.textContent = '₹' + Math.round(totalProfit).toLocaleString('en-IN');
      if (totalProfit >= 0) {
        profitEl.className = 'text-2xl sm:text-3xl font-black text-emerald-600 font-heading';
      } else {
        profitEl.className = 'text-2xl sm:text-3xl font-black text-rose-600 font-heading';
      }
    }
    if (dueEl) dueEl.textContent = '₹' + Math.round(totalDue).toLocaleString('en-IN');
    if (modeSplitEl) {
      modeSplitEl.innerHTML = `
        <span class="inline-flex items-center gap-1 text-slate-700"><i class="fa-solid fa-money-bill-wave text-emerald-600"></i> Cash: ₹${Math.round(cashAmount).toLocaleString('en-IN')} (${cashCount})</span>
        <span class="text-slate-300">|</span>
        <span class="inline-flex items-center gap-1 text-sky-700"><i class="fa-solid fa-qrcode text-sky-600"></i> UPI: ₹${Math.round(upiAmount).toLocaleString('en-IN')} (${upiCount})</span>
      `;
    }
    if (titleEl) titleEl.textContent = this.getFilterTitle();
  },

  renderTable() {
    const tbody = document.getElementById('cbTransactionsTbody');
    if (!tbody) return;

    const list = this.getFilteredEntries();

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-receipt text-3xl mb-2 text-slate-300"></i>
            <p class="text-xs font-bold text-slate-600">No transactions found for this period.</p>
            <p class="text-[11px] text-slate-400 mt-1">Record new citizen service charges on the left form to calculate your net profit.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map((tx, idx) => {
      const isPaid = tx.paymentStatus === 'full_paid';
      const isPartial = tx.paymentStatus === 'partial_paid';
      const isDue = tx.paymentStatus === 'due';
      const profit = tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost);

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/80 text-xs transition-colors">
          <td class="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
            <div>${this.escapeHtml(tx.date)}</div>
            <div class="text-[10px] text-slate-400">${this.escapeHtml(tx.time || '')}</div>
          </td>
          <td class="p-3">
            <div class="font-black text-slate-900">${this.escapeHtml(tx.customerName)}</div>
            <a href="tel:${this.escapeHtml(tx.customerMobile)}" class="text-[11px] font-mono text-sky-700 hover:underline">
              <i class="fa-solid fa-phone text-[9px] mr-1"></i>${this.escapeHtml(tx.customerMobile)}
            </a>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-800">${this.escapeHtml(tx.service)}</div>
            ${tx.notes ? `<div class="text-[10px] text-slate-400 italic">${this.escapeHtml(tx.notes)}</div>` : ''}
          </td>
          <td class="p-3 font-mono font-bold text-slate-900">₹${tx.amount}</td>
          <td class="p-3 font-mono text-slate-500">₹${tx.cost || 0}</td>
          <td class="p-3 font-mono font-black ${profit >= 0 ? 'text-emerald-700 bg-emerald-50/50' : 'text-rose-600'}">
            ₹${profit}
          </td>
          <td class="p-3 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${tx.paymentMode === 'upi' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
              <i class="fa-solid ${tx.paymentMode === 'upi' ? 'fa-qrcode' : 'fa-money-bill'}"></i>
              ${(tx.paymentMode || 'cash').toUpperCase()}
            </span>
            <div class="mt-1">
              ${isPaid ? `
                <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PAID
                </span>
              ` : isPartial ? `
                <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200" title="Due: ₹${tx.dueAmount}">
                  PARTIAL (₹${tx.dueAmount} DUE)
                </span>
              ` : `
                <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  DUE ₹${tx.dueAmount || tx.amount}
                </span>
              `}
            </div>
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1">
              ${tx.dueAmount > 0 && tx.khataEntryId ? `
                <button type="button" onclick="VUO_CASHBOOK.goToLinkedKhata('${tx.khataEntryId}')" title="View in Customer Khata Book" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer">
                  <i class="fa-solid fa-book-bookmark text-xs"></i>
                </button>
              ` : ''}
              <button type="button" onclick="VUO_CASHBOOK.printSingleReceipt('${tx.id}')" title="Print Customer Slip" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer">
                <i class="fa-solid fa-print text-xs"></i>
              </button>
              <button type="button" onclick="VUO_CASHBOOK.deleteTransaction('${tx.id}')" title="Delete Entry" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  goToLinkedKhata(khataId) {
    this.switchView('khata');
    setTimeout(() => {
      const entry = document.getElementById(`khata_entry_${khataId}`);
      if (entry) {
        entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entry.classList.add('ring-2', 'ring-rose-500');
        setTimeout(() => entry.classList.remove('ring-2', 'ring-rose-500'), 2500);
      }
    }, 100);
  },

  switchView(tab) {
    this.activeTab = tab;
    const dailyBtn = document.getElementById('cashbookSubTabBtn_daily');
    const khataBtn = document.getElementById('cashbookSubTabBtn_khata');
    const dailyView = document.getElementById('cashbookSubView_daily');
    const khataView = document.getElementById('cashbookSubView_khata');

    if (tab === 'daily') {
      if (dailyBtn) {
        dailyBtn.className = 'px-5 py-2.5 rounded-xl font-black text-xs transition-all bg-emerald-600 text-white shadow-md flex items-center gap-2 cursor-pointer';
      }
      if (khataBtn) {
        khataBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer';
      }
      if (dailyView) dailyView.classList.remove('hidden');
      if (khataView) khataView.classList.add('hidden');
      this.renderMetrics();
      this.renderTable();
    } else {
      if (dailyBtn) {
        dailyBtn.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer';
      }
      if (khataBtn) {
        khataBtn.className = 'px-5 py-2.5 rounded-xl font-black text-xs transition-all bg-rose-600 text-white shadow-md flex items-center gap-2 cursor-pointer';
      }
      if (dailyView) dailyView.classList.add('hidden');
      if (khataView) khataView.classList.remove('hidden');
      if (typeof VUO_CREDITKHATA !== 'undefined') {
        VUO_CREDITKHATA.renderMetrics();
        VUO_CREDITKHATA.renderList();
      }
    }
  },

  exportToCsv() {
    const list = this.getFilteredEntries();
    if (list.length === 0) {
      if (typeof showToast === 'function') showToast("No transactions to export for this period.", "warning");
      return;
    }

    const headers = ["Transaction ID", "Date", "Time", "Customer Name", "Customer Mobile", "Service", "Fee Charged (INR)", "Govt Cost (INR)", "Net Profit (INR)", "Payment Mode", "Payment Status", "Paid Amount", "Due Amount", "Notes"];
    
    const rows = list.map(tx => [
      tx.id,
      tx.date,
      `"${tx.time || ''}"`,
      `"${(tx.customerName || '').replace(/"/g, '""')}"`,
      tx.customerMobile,
      `"${(tx.service || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.cost || 0,
      tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost),
      tx.paymentMode,
      tx.paymentStatus,
      tx.paidAmount !== undefined ? tx.paidAmount : tx.amount,
      tx.dueAmount || 0,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CSC_Cashbook_Profit_${this.currentFilter}_${this.getTodayStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showToast === 'function') {
      showToast(`Exported ${list.length} transactions to CSV Excel file!`, "success");
    }
  },

  printDailySummary() {
    return this.printRegister();
  },

  printRegister() {
    const list = this.getFilteredEntries();
    const filterTitle = this.getFilterTitle();
    const vle = typeof VUO_CREDITKHATA !== 'undefined' ? VUO_CREDITKHATA.getVleInfo() : { shopName: 'Digital Seva Kendra', vleName: 'VLE Operator', phone: '' };

    let totalRev = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalDue = 0;
    list.forEach(tx => {
      totalRev += (tx.amount || 0);
      totalCost += (tx.cost || 0);
      totalProfit += (tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost));
      totalDue += (tx.dueAmount || 0);
    });

    const styles = `
      @page { size: A4 landscape; margin: 8mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 10px; }
      .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
      .title { font-size: 18px; font-weight: 900; color: #0f172a; }
      .subtitle { font-size: 12px; color: #475569; margin-top: 3px; }
      .metrics { display: flex; gap: 15px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
      .metric-box { flex: 1; text-align: center; }
      .metric-lbl { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; }
      .metric-val { font-size: 15px; font-weight: 900; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th { background: #0f172a; color: #fff; text-align: left; padding: 6px 8px; font-weight: bold; }
      td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) { background: #f8fafc; }
      .profit { font-weight: 900; color: #047857; }
      .footer { margin-top: 15px; text-align: right; font-size: 9px; color: #64748b; }
      .no-print { display: none !important; }
    `;

    if (window.VUO_PRINT) {
      window.VUO_PRINT.printHtml(`CSC Daily Cashbook & Profit Register - ${filterTitle}`, `
        <div class="header">
          <div class="title">${this.escapeHtml(vle.shopName.toUpperCase())}</div>
          <div class="subtitle">Daily Cashbook &amp; Net Profit Register • Operator: ${this.escapeHtml(vle.vleName)} • Ph: ${this.escapeHtml(vle.phone)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #047857; margin-top: 4px;">Period: ${this.escapeHtml(filterTitle)} • Generated on: ${new Date().toLocaleString()}</div>
        </div>
        <div class="metrics">
          <div class="metric-box">
            <div class="metric-lbl">Total Transactions</div>
            <div class="metric-val">${list.length}</div>
          </div>
          <div class="metric-box">
            <div class="metric-lbl">Total Customer Fees</div>
            <div class="metric-val">₹${Math.round(totalRev).toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-box">
            <div class="metric-lbl">Govt Portal Expenses</div>
            <div class="metric-val">₹${Math.round(totalCost).toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-box">
            <div class="metric-lbl">Net Profit (ଲାଭ)</div>
            <div class="metric-val profit">₹${Math.round(totalProfit).toLocaleString('en-IN')}</div>
          </div>
          <div class="metric-box">
            <div class="metric-lbl">Pending Due</div>
            <div class="metric-val" style="color: #e11d48;">₹${Math.round(totalDue).toLocaleString('en-IN')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sl</th>
              <th>Date &amp; Time</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Service</th>
              <th>Mode</th>
              <th style="text-align: right;">Fee (₹)</th>
              <th style="text-align: right;">Cost (₹)</th>
              <th style="text-align: right;">Profit (₹)</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((tx, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${tx.date} ${tx.time || ''}</td>
                <td><b>${this.escapeHtml(tx.customerName)}</b></td>
                <td>${this.escapeHtml(tx.customerMobile)}</td>
                <td>${this.escapeHtml(tx.service)}</td>
                <td style="text-transform: uppercase;">${tx.paymentMode}</td>
                <td style="text-align: right;">₹${tx.amount}</td>
                <td style="text-align: right;">₹${tx.cost || 0}</td>
                <td style="text-align: right;" class="profit">₹${tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost)}</td>
                <td style="text-align: center;">${tx.paymentStatus === 'full_paid' ? 'Paid' : (tx.paymentStatus === 'partial_paid' ? 'Partial' : 'Due')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          VLE Help Desk Operating System • Authorized System Log
        </div>
      `, styles);
      return;
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast("Please allow popups to print report.", "warning");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CSC Daily Cashbook & Profit Register - ${filterTitle}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
          .title { font-size: 18px; font-weight: 900; color: #0f172a; }
          .subtitle { font-size: 12px; color: #475569; margin-top: 3px; }
          .metrics { display: flex; gap: 15px; margin-bottom: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
          .metric-box { flex: 1; text-align: center; }
          .metric-lbl { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; }
          .metric-val { font-size: 15px; font-weight: 900; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background: #0f172a; color: #fff; text-align: left; padding: 6px 8px; font-weight: bold; }
          td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .profit { font-weight: 900; color: #047857; }
          .footer { margin-top: 15px; text-align: right; font-size: 9px; color: #64748b; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="header">
          <div class="title">${this.escapeHtml(vle.shopName.toUpperCase())}</div>
          <div class="subtitle">Daily Cashbook &amp; Net Profit Register • Operator: ${this.escapeHtml(vle.vleName)} • Ph: ${this.escapeHtml(vle.phone)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #047857; margin-top: 4px;">Period: ${this.escapeHtml(filterTitle)} • Generated on: ${new Date().toLocaleString()}</div>
        </div>

        <div class="metrics">
          <div class="metric-box"><div class="metric-lbl">Total Transactions</div><div class="metric-val">${list.length}</div></div>
          <div class="metric-box"><div class="metric-lbl">Total Collection</div><div class="metric-val">₹${Math.round(totalRev).toLocaleString('en-IN')}</div></div>
          <div class="metric-box"><div class="metric-lbl">Govt Fee / Cost</div><div class="metric-val">₹${Math.round(totalCost).toLocaleString('en-IN')}</div></div>
          <div class="metric-box"><div class="metric-lbl" style="color: #047857;">TOTAL NET PROFIT</div><div class="metric-val" style="color: #047857;">₹${Math.round(totalProfit).toLocaleString('en-IN')}</div></div>
          <div class="metric-box"><div class="metric-lbl" style="color: #b91c1c;">Pending Due (Baki)</div><div class="metric-val" style="color: #b91c1c;">₹${Math.round(totalDue).toLocaleString('en-IN')}</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date &amp; Time</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Service Rendered</th>
              <th>Fee (₹)</th>
              <th>Cost (₹)</th>
              <th>Profit (₹)</th>
              <th>Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((tx, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${this.escapeHtml(tx.date)} ${this.escapeHtml(tx.time || '')}</td>
                <td><strong>${this.escapeHtml(tx.customerName)}</strong></td>
                <td>${this.escapeHtml(tx.customerMobile)}</td>
                <td>${this.escapeHtml(tx.service)}</td>
                <td>₹${tx.amount}</td>
                <td>₹${tx.cost || 0}</td>
                <td class="profit">₹${tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost)}</td>
                <td>${(tx.paymentMode || 'cash').toUpperCase()}</td>
                <td>${(tx.paymentStatus || 'PAID').toUpperCase()} ${tx.dueAmount > 0 ? `(Due: ₹${tx.dueAmount})` : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          VLE Help Desk Certified Ledger Record • Authorized Common Service Center (Jana Seba Kendra)
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  shareWhatsappSummary() {
    const list = this.getFilteredEntries();
    const filterTitle = this.getFilterTitle();
    const vle = typeof VUO_CREDITKHATA !== 'undefined' ? VUO_CREDITKHATA.getVleInfo() : { shopName: 'Digital Seva Kendra', vleName: 'VLE Operator' };

    let totalRev = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalDue = 0;
    list.forEach(tx => {
      totalRev += (tx.amount || 0);
      totalCost += (tx.cost || 0);
      totalProfit += (tx.profit !== undefined ? tx.profit : (tx.amount - tx.cost));
      totalDue += (tx.dueAmount || 0);
    });

    const msg = `📊 *${vle.shopName} - Daily Business & Profit Summary*\n📅 *Period:* ${filterTitle}\n\n` +
      `🔢 *Total Services Rendered:* ${list.length}\n` +
      `💰 *Total Customer Collection:* ₹${Math.round(totalRev).toLocaleString('en-IN')}\n` +
      `🏷️ *Govt Fees / Portal Expenses:* ₹${Math.round(totalCost).toLocaleString('en-IN')}\n` +
      `✨ *TOTAL NET PROFIT (MUNAFA):* ₹${Math.round(totalProfit).toLocaleString('en-IN')}\n` +
      `⏳ *Total Pending Due (Baki):* ₹${Math.round(totalDue).toLocaleString('en-IN')}\n\n` +
      `_Automated VLE Ledger from VLE Help Desk portal._`;

    const cleanMobile = (vle.phone || '').replace(/\D/g, '').slice(-10);
    const targetUrl = cleanMobile ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');
  },

  printSingleReceipt(id) {
    const tx = this.entries.find(e => e.id === id);
    if (!tx) return;

    const vle = typeof VUO_CREDITKHATA !== 'undefined' ? VUO_CREDITKHATA.getVleInfo() : { shopName: 'Digital Seva Kendra', vleName: 'VLE Operator', address: 'Odisha', phone: '' };

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Receipt - ${tx.customerName}</title>
        <style>
          @page { size: 80mm 120mm; margin: 4mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; margin: 0; padding: 10px; color: #111; }
          .receipt { border: 1.5px solid #1e293b; padding: 10px; border-radius: 6px; }
          .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px; }
          .shop-title { font-size: 13px; font-weight: 900; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .bold { font-weight: bold; }
          .amount-box { background: #f0fdf4; border: 1px solid #86efac; padding: 6px; text-align: center; font-size: 15px; font-weight: 900; color: #166534; margin: 8px 0; border-radius: 4px; }
          .footer { text-align: center; font-size: 9px; color: #64748b; margin-top: 8px; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="receipt">
          <div class="header">
            <div class="shop-title">${this.escapeHtml(vle.shopName.toUpperCase())}</div>
            <div style="font-size: 9px;">${this.escapeHtml(vle.address)}</div>
            <div style="font-size: 9px;">Mob: ${this.escapeHtml(vle.phone)}</div>
            <div style="margin-top: 3px; font-weight: bold; font-size: 10px; color: #047857;">CASH / SERVICE RECEIPT</div>
          </div>
          <div class="row"><span>Receipt No:</span><span class="bold">${this.escapeHtml(tx.id)}</span></div>
          <div class="row"><span>Date:</span><span>${this.escapeHtml(tx.date)} ${this.escapeHtml(tx.time || '')}</span></div>
          <div class="row"><span>Customer:</span><span class="bold">${this.escapeHtml(tx.customerName)}</span></div>
          <div class="row"><span>Mobile:</span><span>${this.escapeHtml(tx.customerMobile)}</span></div>
          <div class="row"><span>Service:</span><span class="bold">${this.escapeHtml(tx.service)}</span></div>
          <div class="row"><span>Payment Mode:</span><span class="bold">${(tx.paymentMode || 'cash').toUpperCase()}</span></div>
          <div class="amount-box">
            TOTAL PAID: ₹${tx.paidAmount !== undefined ? tx.paidAmount : tx.amount}/-
          </div>
          ${tx.dueAmount > 0 ? `<div class="row" style="color: #b91c1c; font-weight: bold;"><span>Remaining Due:</span><span>₹${tx.dueAmount}/-</span></div>` : ''}
          <div class="footer">
            Thank you for visiting! • Authorized Digital Seva Kendra
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  }
};


/**
 * VUO CSC HELP - VLE Udhar Khata / Credit Note Ledger
 * Tracks customer credit balances, calculates 7-day overdue reminders,
 * provides 1-click WhatsApp & SMS payment reminders, and generates credit slips.
 */
const VUO_CREDITKHATA = {
  storageKey: 'vuo_vle_credit_khata',
  currentFilter: 'all', // 'all', 'overdue', 'paid'
  entries: [],

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

  addDirectEntry(entryData) {
    const newEntry = {
      id: 'CR-' + Date.now(),
      name: entryData.name,
      mobile: entryData.mobile,
      service: entryData.service || 'CSC Citizen Service',
      amount: entryData.amount,
      date: entryData.date || new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: entryData.notes || '',
      createdAt: Date.now()
    };
    this.entries.unshift(newEntry);
    this.saveEntries();
    this.renderMetrics();
    this.renderList();
    this.updateNavBadge();
    return newEntry;
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

    this.addDirectEntry({ name, mobile, service, amount, date, notes });

    // Reset form fields
    if (nameInput) nameInput.value = '';
    if (mobileInput) mobileInput.value = '';
    if (serviceInput) serviceInput.value = '';
    if (amountInput) amountInput.value = '';
    if (notesInput) notesInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

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

  getVleInfo() {
    let vleName = 'VLE Member';
    let shopName = 'Digital Seva Kendra';
    let phone = '';
    let address = 'Odisha';
    let cscId = '';

    if (typeof VUO_AUTH !== 'undefined' && VUO_AUTH.getCurrentUser) {
      const u = VUO_AUTH.getCurrentUser();
      if (u) {
        if (u.fullName) vleName = u.fullName;
        if (u.kendraName) shopName = u.kendraName;
        if (u.mobile) phone = u.mobile;
        if (u.district) address = u.district + ', Odisha';
        if (u.cscId) cscId = u.cscId;
      }
    }
    const pShop = document.getElementById('posterShopName')?.value.trim();
    if (pShop) shopName = pShop;
    const pPhone = document.getElementById('posterPhone')?.value.trim();
    if (pPhone) phone = pPhone;
    const pAddr = document.getElementById('posterAddress')?.value.trim();
    if (pAddr) address = pAddr;

    return { vleName, shopName, phone, address, cscId };
  },

  sendWhatsAppReminder(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const vle = this.getVleInfo();
    const days = this.getDaysOverdue(entry.date);
    const overdueText = days >= 7 ? ` (${days} ଦିନ ବିତିଗଲାଣି)` : '';

    const message = `ନମସ୍କାର ${entry.name} ଆଜ୍ଞା,\n\nଆପଣଙ୍କର ${vle.shopName} ରେ "${entry.service}" ବାବଦକୁ ମୋଟ ₹${entry.amount}/- ଟଙ୍କା ବାକି (Udhar / Credit) ରହିଅଛି। (ତାରିଖ: ${entry.date}${overdueText})।\n\nଦୟାକରି ଏହି ବାକି ଟଙ୍କା ଶୀଘ୍ର ପରିଶୋଧ କରିବାକୁ ଅନୁରୋଧ କରୁଅଛୁ।\n\nଧନ୍ୟବାଦ ସହିତ,\n${vle.vleName}\n${vle.shopName}\nମୋବାଇଲ୍: ${vle.phone}`;

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

  sendSmsReminder(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const vle = this.getVleInfo();
    const cleanMobile = entry.mobile.replace(/\D/g, '').slice(-10);
    const text = `ନମସ୍କାର ${entry.name} ଆଜ୍ଞା, ${vle.shopName} ରେ ଆପଣଙ୍କର ${entry.service} ବାବଦକୁ ₹${entry.amount}/- ବାକି ଅଛି। ଦୟାକରି ଶୀଘ୍ର ପରିଶୋଧ କରନ୍ତୁ। ଧନ୍ୟବାଦ - ${vle.vleName} (${vle.phone})`;

    if (typeof VUO_SMS !== 'undefined') {
      VUO_SMS.sendSms(cleanMobile, text);
    } else {
      window.location.href = `sms:+91${cleanMobile}?body=${encodeURIComponent(text)}`;
    }

    entry.lastReminderAt = Date.now();
    this.saveEntries();
    this.renderList();

    if (typeof showToast === 'function') {
      showToast(`Odia SMS reminder dispatched to ${entry.name}!`, 'success');
    }
  },

  copySmsText(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const vle = this.getVleInfo();
    const text = `ନମସ୍କାର ${entry.name} ଆଜ୍ଞା, ${vle.shopName} ରେ ଆପଣଙ୍କର ${entry.service} ବାବଦକୁ ₹${entry.amount}/- ବାକି ଅଛି। ଦୟାକରି ଶୀଘ୍ର ପରିଶୋଧ କରନ୍ତୁ। ଧନ୍ୟବାଦ - ${vle.vleName} (${vle.phone})`;

    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast("ଓଡ଼ିଆ SMS ଟେକ୍ସଟ କପି ହୋଇଗଲା! (Odia SMS text copied)", "success");
      }
    }).catch(() => {
      alert("Odia SMS Text:\n" + text);
    });
  },

  printCreditSlip(id) {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;

    const vle = this.getVleInfo();
    const shopName = vle.shopName.toUpperCase();
    const vlePhone = vle.phone || '+91 9937037131';
    const vleAddress = vle.address || 'Odisha';

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
            <div class="shop-title">${this.escapeHtml(shopName)}</div>
            <div style="font-size: 10px;">${this.escapeHtml(vleAddress)}</div>
            <div style="font-size: 10px;">Mob: ${this.escapeHtml(vlePhone)}</div>
            <div style="margin-top: 4px; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #b91c1c;">CUSTOMER UDHAR / CREDIT SLIP</div>
          </div>
          <div class="row"><span>Slip No:</span><span class="bold">${this.escapeHtml(entry.id)}</span></div>
          <div class="row"><span>Date:</span><span>${this.escapeHtml(entry.date)}</span></div>
          <div class="row"><span>Customer:</span><span class="bold">${this.escapeHtml(entry.name)}</span></div>
          <div class="row"><span>Mobile:</span><span>${this.escapeHtml(entry.mobile)}</span></div>
          <div class="row"><span>Service:</span><span>${this.escapeHtml(entry.service)}</span></div>
          ${entry.notes ? `<div class="row"><span>Notes:</span><span>${this.escapeHtml(entry.notes)}</span></div>` : ''}
          <div class="amount-box">
            DUE AMOUNT: ₹${entry.amount}/-
          </div>
          <div class="row"><span style="font-size: 10px;">Status:</span><span class="bold" style="color: ${entry.status === 'paid' ? '#059669' : '#b91c1c'}; text-transform: uppercase;">${entry.status === 'paid' ? 'PAID / CLEARED' : 'PENDING'}</span></div>
          <div class="footer">
            Computer Generated Credit Record • Authorized Digital Seva Kendra<br>
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
    const subBadge = document.getElementById('khataPendingBadgeSub');

    if (pendingEl) pendingEl.textContent = '₹' + pendingTotal.toLocaleString('en-IN');
    if (overdueEl) overdueEl.textContent = '₹' + overdueTotal.toLocaleString('en-IN') + ` (${overdueCount})`;
    if (paidEl) paidEl.textContent = '₹' + paidTotal.toLocaleString('en-IN');
    if (countEl) countEl.textContent = pendingCustomers.toString();
    if (subBadge) {
      if (pendingCustomers > 0) {
        subBadge.textContent = pendingCustomers.toString();
        subBadge.classList.remove('hidden');
      } else {
        subBadge.classList.add('hidden');
      }
    }
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
          <p class="text-[11px] text-slate-400 mt-1">Use the "Add New Credit Entry" form on the left or add partial-paid transactions from Daily Cashbook.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(entry => {
      const isOver = this.isOverdue(entry);
      const days = this.getDaysOverdue(entry.date);
      const isPaid = entry.status === 'paid';

      return `
        <div id="khata_entry_${entry.id}" class="p-4 rounded-2xl border transition-all ${isOver ? 'bg-rose-50/50 border-rose-300 shadow-sm' : isPaid ? 'bg-slate-50/60 border-slate-200 opacity-80' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-black text-slate-900 text-sm">${this.escapeHtml(entry.name)}</span>
              <a href="tel:${this.escapeHtml(entry.mobile)}" class="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 hover:bg-sky-100">
                <i class="fa-solid fa-phone mr-1"></i>${this.escapeHtml(entry.mobile)}
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
              <strong>Service:</strong> ${this.escapeHtml(entry.service)}
              ${entry.notes ? `<span class="italic text-slate-500 ml-2">(${this.escapeHtml(entry.notes)})</span>` : ''}
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
                <button type="button" onclick="VUO_CREDITKHATA.sendWhatsAppReminder('${entry.id}')" title="Send Odia WhatsApp Payment Reminder" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                  <span>WhatsApp</span>
                </button>
                <button type="button" onclick="VUO_CREDITKHATA.sendSmsReminder('${entry.id}')" title="Send Free Odia SMS Reminder" class="px-2 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer">
                  <i class="fa-solid fa-comment-sms text-xs"></i>
                  <span>SMS</span>
                </button>
                <button type="button" onclick="VUO_CREDITKHATA.copySmsText('${entry.id}')" title="Copy Odia SMS Reminder text" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-all cursor-pointer">
                  <i class="fa-regular fa-copy"></i>
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

window.VUO_CASHBOOK = VUO_CASHBOOK;
window.VUO_CREDITKHATA = VUO_CREDITKHATA;

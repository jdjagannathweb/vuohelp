// CSC Janaseba Kendra - Admin Portal Controller
// Handles VLE Kendra settings, daily cash ledger, rate card management, staff, and backup

class CscAdminPortal {
  constructor() {
    this.adminPin = "1234";
    this.isAuthenticated = false;
    this.kendraConfig = this.loadKendraConfig();
    this.ratesConfig = this.loadRatesConfig();
    this.cashLedger = this.loadCashLedger();
    this.staffList = this.loadStaffList();
    this.noticesList = this.loadNoticesList();

    this.initAuth();
    this.initKendraProfileForm();
    this.initLedger();
    this.initRatesManager();
    this.initStaffManager();
    this.initBackupRestore();
    this.initAdminStats();
  }

  loadKendraConfig() {
    const saved = localStorage.getItem("CSC_KENDRA_CONFIG");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return {
      kendraName: "Maa Tarini Janaseba Kendra",
      vleName: "Jagannath Das",
      cscId: "OD-92014-CSC",
      mobile: "9861234567",
      email: "vle.tarini@cscportal.in",
      district: "Khordha",
      panchayat: "Jatni Ward 4",
      upiId: "janaseba@sbi",
      timings: "08:00 AM - 08:30 PM (Mon-Sat)"
    };
  }

  saveKendraConfig() {
    localStorage.setItem("CSC_KENDRA_CONFIG", JSON.stringify(this.kendraConfig));
  }

  loadRatesConfig() {
    const saved = localStorage.getItem("CSC_RATES_CONFIG");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: "r1", name: "Aadhaar Demographic Update", govtFee: 50, vleFee: 30, total: 80, time: "3-5 Days" },
      { id: "r2", name: "Aadhaar Biometric Update (15+ yrs)", govtFee: 100, vleFee: 20, total: 120, time: "Instant" },
      { id: "r3", name: "New PAN Card (NSDL / UTI)", govtFee: 107, vleFee: 50, total: 157, time: "10-15 Days" },
      { id: "r4", name: "PAN Card Correction / Duplicate", govtFee: 107, vleFee: 60, total: 167, time: "15 Days" },
      { id: "r5", name: "Passport Photo Print (6 Copies 4x6)", govtFee: 0, vleFee: 50, total: 50, time: "5 Mins" },
      { id: "r6", name: "Passport Photo Print (8 Copies 4x6)", govtFee: 0, vleFee: 60, total: 60, time: "5 Mins" },
      { id: "r7", name: "Caste / Income / Residence Cert.", govtFee: 30, vleFee: 40, total: 70, time: "15-20 Days" },
      { id: "r8", name: "Subhadra / PM-Kisan e-KYC", govtFee: 0, vleFee: 30, total: 30, time: "Instant" },
      { id: "r9", name: "AEPS Cash Withdrawal (per ₹1000)", govtFee: 0, vleFee: 10, total: 10, time: "Instant" },
      { id: "r10", name: "Electricity Bill Payment", govtFee: 0, vleFee: 15, total: 15, time: "Instant" },
      { id: "r11", name: "Color Printout / Xerox (A4)", govtFee: 0, vleFee: 10, total: 10, time: "Instant" },
      { id: "r12", name: "Lamination (A4 / Certificate)", govtFee: 0, vleFee: 20, total: 20, time: "Instant" }
    ];
  }

  saveRatesConfig() {
    localStorage.setItem("CSC_RATES_CONFIG", JSON.stringify(this.ratesConfig));
  }

  loadCashLedger() {
    const saved = localStorage.getItem("CSC_CASH_LEDGER");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    const today = new Date().toISOString().split("T")[0];
    return [
      { id: "TX-101", type: "income", category: "Service Fees", desc: "Aadhaar & PAN application fees", amount: 1250, time: "10:30 AM", date: today },
      { id: "TX-102", type: "income", category: "Photo Prints", desc: "12 sets of passport photos", amount: 600, time: "12:15 PM", date: today },
      { id: "TX-103", type: "expense", category: "Shop Expense", desc: "A4 Photo Paper Ream (100 sheets)", amount: 450, time: "02:00 PM", date: today },
      { id: "TX-104", type: "income", category: "AEPS Commission", desc: "Cash withdrawal commission", amount: 320, time: "04:30 PM", date: today },
      { id: "TX-105", type: "expense", category: "Electricity", desc: "Inverter battery water & shop tea", amount: 120, time: "05:45 PM", date: today }
    ];
  }

  saveCashLedger() {
    localStorage.setItem("CSC_CASH_LEDGER", JSON.stringify(this.cashLedger));
  }

  loadStaffList() {
    const saved = localStorage.getItem("CSC_STAFF_LIST");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: "ST-01", name: "Bikash Jena", role: "Senior Computer Operator", mobile: "9853112233", shift: "Morning (8 AM - 2 PM)", status: "Active" },
      { id: "ST-02", name: "Priyanka Sahoo", role: "Documentation & Scanning", mobile: "9439445566", shift: "Evening (2 PM - 8 PM)", status: "Active" }
    ];
  }

  saveStaffList() {
    localStorage.setItem("CSC_STAFF_LIST", JSON.stringify(this.staffList));
  }

  loadNoticesList() {
    const saved = localStorage.getItem("CSC_ADMIN_NOTICES");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: "N-1", title: "Sunday Special Aadhaar & Subhadra Camp", date: "Coming Sunday", body: "Camp timings: 9 AM to 3 PM. Bring original Aadhaar, bank passbook, and voter ID.", active: true },
      { id: "N-2", title: "High-Speed Color Printing Now Available", date: "This Month", body: "High quality 300 DPI laminated photo prints and certificates available in 2 minutes.", active: true }
    ];
  }

  saveNoticesList() {
    localStorage.setItem("CSC_ADMIN_NOTICES", JSON.stringify(this.noticesList));
  }

  initAuth() {
    const pinForm = document.getElementById("admin-pin-form");
    const pinInput = document.getElementById("admin-pin-input");
    const authBox = document.getElementById("admin-auth-box");
    const portalBox = document.getElementById("admin-portal-box");
    const errorMsg = document.getElementById("admin-pin-error");

    if (pinForm) {
      pinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pin = pinInput.value.trim();
        const savedPin = localStorage.getItem("CSC_ADMIN_PIN") || this.adminPin;

        if (pin === savedPin) {
          this.isAuthenticated = true;
          if (authBox) authBox.classList.add("hidden");
          if (portalBox) portalBox.classList.remove("hidden");
          if (errorMsg) errorMsg.classList.add("hidden");
          this.populateAllAdminData();
          window.showToast("Admin access unlocked successfully!", "success");
        } else {
          if (errorMsg) {
            errorMsg.classList.remove("hidden");
            errorMsg.textContent = "Incorrect Admin PIN! (Default is 1234)";
          }
        }
      });
    }

    // Change PIN button
    const changePinBtn = document.getElementById("change-admin-pin-btn");
    if (changePinBtn) {
      changePinBtn.addEventListener("click", () => {
        const newPin = prompt("Enter new 4-digit Admin PIN:");
        if (newPin && newPin.trim().length >= 4) {
          localStorage.setItem("CSC_ADMIN_PIN", newPin.trim());
          alert("Admin PIN updated successfully! Your new PIN is: " + newPin.trim());
        }
      });
    }

    // Lock Admin button
    const lockBtn = document.getElementById("admin-lock-btn");
    if (lockBtn) {
      lockBtn.addEventListener("click", () => {
        this.isAuthenticated = false;
        if (authBox) authBox.classList.remove("hidden");
        if (portalBox) portalBox.classList.add("hidden");
        if (pinInput) pinInput.value = "";
        window.showToast("Admin session locked.", "info");
      });
    }
  }

  populateAllAdminData() {
    this.renderKendraConfigUI();
    this.renderLedgerUI();
    this.renderRatesUI();
    this.renderStaffUI();
    this.initAdminStats();
  }

  // --- KENDRA PROFILE & SETTINGS ---
  initKendraProfileForm() {
    const form = document.getElementById("kendra-profile-form");
    if (!form) return;

    this.renderKendraConfigUI();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.kendraConfig.kendraName = document.getElementById("kp-kendra-name")?.value || this.kendraConfig.kendraName;
      this.kendraConfig.vleName = document.getElementById("kp-vle-name")?.value || this.kendraConfig.vleName;
      this.kendraConfig.cscId = document.getElementById("kp-csc-id")?.value || this.kendraConfig.cscId;
      this.kendraConfig.mobile = document.getElementById("kp-mobile")?.value || this.kendraConfig.mobile;
      this.kendraConfig.email = document.getElementById("kp-email")?.value || this.kendraConfig.email;
      this.kendraConfig.district = document.getElementById("kp-district")?.value || this.kendraConfig.district;
      this.kendraConfig.panchayat = document.getElementById("kp-panchayat")?.value || this.kendraConfig.panchayat;
      this.kendraConfig.upiId = document.getElementById("kp-upi")?.value || this.kendraConfig.upiId;
      this.kendraConfig.timings = document.getElementById("kp-timings")?.value || this.kendraConfig.timings;

      this.saveKendraConfig();
      window.showToast("Kendra Profile updated! Changes reflect on all printouts & receipts.");
    });
  }

  renderKendraConfigUI() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    setVal("kp-kendra-name", this.kendraConfig.kendraName);
    setVal("kp-vle-name", this.kendraConfig.vleName);
    setVal("kp-csc-id", this.kendraConfig.cscId);
    setVal("kp-mobile", this.kendraConfig.mobile);
    setVal("kp-email", this.kendraConfig.email);
    setVal("kp-district", this.kendraConfig.district);
    setVal("kp-panchayat", this.kendraConfig.panchayat);
    setVal("kp-upi", this.kendraConfig.upiId);
    setVal("kp-timings", this.kendraConfig.timings);

    // Update banner display names
    document.querySelectorAll(".kendra-display-name").forEach(el => {
      el.textContent = this.kendraConfig.kendraName;
    });
    document.querySelectorAll(".vle-display-name").forEach(el => {
      el.textContent = this.kendraConfig.vleName;
    });
    document.querySelectorAll(".csc-display-id").forEach(el => {
      el.textContent = this.kendraConfig.cscId;
    });
  }

  // --- DAILY CASH LEDGER (ROJNAMCHA) ---
  initLedger() {
    const addTxForm = document.getElementById("add-ledger-form");
    if (addTxForm) {
      addTxForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.getElementById("tx-type").value;
        const category = document.getElementById("tx-category").value;
        const desc = document.getElementById("tx-desc").value.trim();
        const amount = parseFloat(document.getElementById("tx-amount").value) || 0;

        if (!desc || amount <= 0) {
          alert("Please provide transaction description and valid amount.");
          return;
        }

        const now = new Date();
        const newTx = {
          id: "TX-" + Date.now().toString().slice(-4),
          type,
          category,
          desc,
          amount,
          time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          date: now.toISOString().split("T")[0]
        };

        this.cashLedger.unshift(newTx);
        this.saveCashLedger();
        this.renderLedgerUI();
        addTxForm.reset();
        window.showToast("Cash transaction recorded in Day Book!");
      });
    }

    const exportBtn = document.getElementById("export-ledger-csv-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportLedgerCSV());
    }
  }

  renderLedgerUI() {
    const tbody = document.getElementById("ledger-table-body");
    const totalIncomeEl = document.getElementById("ledger-total-income");
    const totalExpenseEl = document.getElementById("ledger-total-expense");
    const netProfitEl = document.getElementById("ledger-net-profit");

    if (!tbody) return;
    tbody.innerHTML = "";

    let totalIncome = 0;
    let totalExpense = 0;

    this.cashLedger.forEach((tx, idx) => {
      if (tx.type === "income") totalIncome += tx.amount;
      else totalExpense += tx.amount;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 border-b border-slate-100 text-xs";

      const badge = tx.type === "income" ?
        `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">+ Income</span>` :
        `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">- Expense</span>`;

      tr.innerHTML = `
        <td class="px-3 py-2.5 font-mono text-slate-500">${tx.id}</td>
        <td class="px-3 py-2.5">${badge}</td>
        <td class="px-3 py-2.5 font-medium text-slate-800">${tx.category}</td>
        <td class="px-3 py-2.5 text-slate-600">${tx.desc}</td>
        <td class="px-3 py-2.5 font-bold ${tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}">
          ${tx.type === 'income' ? '+' : '-'}₹${tx.amount.toLocaleString("en-IN")}
        </td>
        <td class="px-3 py-2.5 text-slate-400">${tx.time}</td>
        <td class="px-3 py-2.5 text-right">
          <button class="text-slate-400 hover:text-red-600 p-1" data-del-tx="${idx}">✕</button>
        </td>
      `;

      tr.querySelector("[data-del-tx]")?.addEventListener("click", () => {
        if (confirm("Delete this cash ledger entry?")) {
          this.cashLedger.splice(idx, 1);
          this.saveCashLedger();
          this.renderLedgerUI();
        }
      });

      tbody.appendChild(tr);
    });

    if (totalIncomeEl) totalIncomeEl.textContent = "₹" + totalIncome.toLocaleString("en-IN");
    if (totalExpenseEl) totalExpenseEl.textContent = "₹" + totalExpense.toLocaleString("en-IN");
    if (netProfitEl) {
      const net = totalIncome - totalExpense;
      netProfitEl.textContent = (net >= 0 ? "+" : "") + "₹" + net.toLocaleString("en-IN");
      netProfitEl.className = "text-xl font-extrabold " + (net >= 0 ? "text-emerald-700" : "text-rose-600");
    }
  }

  exportLedgerCSV() {
    if (this.cashLedger.length === 0) {
      alert("No cash ledger records to export.");
      return;
    }
    const headers = ["Tx ID", "Type", "Category", "Description", "Amount (INR)", "Time", "Date"];
    const rows = this.cashLedger.map(tx => [
      `"${tx.id}"`,
      `"${tx.type}"`,
      `"${tx.category}"`,
      `"${tx.desc.replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.time}"`,
      `"${tx.date}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `CSC_Daily_Cash_DayBook_${new Date().toISOString().split("T")[0]}.csv`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.showToast("Exported Daily Cash DayBook to CSV!");
  }

  // --- DYNAMIC RATES & SERVICE PRICING ---
  initRatesManager() {
    const addRateForm = document.getElementById("add-rate-form");
    if (addRateForm) {
      addRateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("nr-name").value.trim();
        const govtFee = parseFloat(document.getElementById("nr-govt-fee").value) || 0;
        const vleFee = parseFloat(document.getElementById("nr-vle-fee").value) || 0;
        const time = document.getElementById("nr-time").value.trim() || "1 Day";

        if (!name) return;

        const newRate = {
          id: "r" + (this.ratesConfig.length + 1),
          name,
          govtFee,
          vleFee,
          total: govtFee + vleFee,
          time
        };

        this.ratesConfig.push(newRate);
        this.saveRatesConfig();
        this.renderRatesUI();
        addRateForm.reset();
        window.showToast("New service rate added!");
      });
    }
  }

  renderRatesUI() {
    const tbody = document.getElementById("admin-rates-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    this.ratesConfig.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 border-b border-slate-100 text-xs";

      tr.innerHTML = `
        <td class="px-3 py-2.5 font-medium text-slate-800">${item.name}</td>
        <td class="px-3 py-2.5 font-mono text-slate-500">₹${item.govtFee}</td>
        <td class="px-3 py-2.5">
          <input type="number" class="w-16 px-2 py-1 border border-slate-200 rounded font-mono text-xs text-blue-700 font-bold edit-vle-fee" data-rate-idx="${idx}" value="${item.vleFee}" min="0">
        </td>
        <td class="px-3 py-2.5 font-bold text-emerald-700 font-mono">₹<span class="total-fee-val">${item.govtFee + item.vleFee}</span></td>
        <td class="px-3 py-2.5 text-slate-500">${item.time}</td>
        <td class="px-3 py-2.5 text-right">
          <button class="text-slate-400 hover:text-red-600 p-1" data-del-rate="${idx}">✕</button>
        </td>
      `;

      // Live update fee listener
      const feeInp = tr.querySelector(".edit-vle-fee");
      feeInp?.addEventListener("input", (e) => {
        const newVle = parseFloat(e.target.value) || 0;
        item.vleFee = newVle;
        item.total = item.govtFee + newVle;
        tr.querySelector(".total-fee-val").textContent = item.total;
        this.saveRatesConfig();
      });

      tr.querySelector("[data-del-rate]")?.addEventListener("click", () => {
        if (confirm(`Remove rate for ${item.name}?`)) {
          this.ratesConfig.splice(idx, 1);
          this.saveRatesConfig();
          this.renderRatesUI();
        }
      });

      tbody.appendChild(tr);
    });
  }

  // --- STAFF & OPERATOR MANAGEMENT ---
  initStaffManager() {
    const addStaffForm = document.getElementById("add-staff-form");
    if (addStaffForm) {
      addStaffForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("staff-name").value.trim();
        const role = document.getElementById("staff-role").value.trim();
        const mobile = document.getElementById("staff-mobile").value.trim();
        const shift = document.getElementById("staff-shift").value;

        if (!name || !mobile) {
          alert("Please provide staff name and mobile number.");
          return;
        }

        const newStaff = {
          id: "ST-0" + (this.staffList.length + 1),
          name,
          role,
          mobile,
          shift,
          status: "Active"
        };

        this.staffList.push(newStaff);
        this.saveStaffList();
        this.renderStaffUI();
        addStaffForm.reset();
        window.showToast("New center operator added!");
      });
    }
  }

  renderStaffUI() {
    const listEl = document.getElementById("staff-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    this.staffList.forEach((st, idx) => {
      const card = document.createElement("div");
      card.className = "p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between";

      card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            ${st.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800">${st.name} <span class="text-xs font-normal text-emerald-600 ml-1">● ${st.status}</span></p>
            <p class="text-xs text-slate-500">${st.role} • 📱 ${st.mobile}</p>
            <p class="text-[11px] text-slate-400">Shift: ${st.shift}</p>
          </div>
        </div>
        <button class="text-slate-400 hover:text-red-600 p-1" data-del-staff="${idx}" title="Remove staff">✕</button>
      `;

      card.querySelector("[data-del-staff]")?.addEventListener("click", () => {
        if (confirm(`Remove operator record for ${st.name}?`)) {
          this.staffList.splice(idx, 1);
          this.saveStaffList();
          this.renderStaffUI();
        }
      });

      listEl.appendChild(card);
    });
  }

  // --- DATA BACKUP & RESTORE ---
  initBackupRestore() {
    const backupBtn = document.getElementById("admin-backup-json-btn");
    const restoreInput = document.getElementById("admin-restore-json-input");

    if (backupBtn) {
      backupBtn.addEventListener("click", () => {
        const fullBackup = {
          kendraConfig: this.kendraConfig,
          ratesConfig: this.ratesConfig,
          cashLedger: this.cashLedger,
          staffList: this.staffList,
          leads: JSON.parse(localStorage.getItem("CSC_LEADS_DATA") || "[]"),
          backupDate: new Date().toISOString()
        };

        const jsonStr = JSON.stringify(fullBackup, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `CSC_Kendra_FullBackup_${new Date().toISOString().split("T")[0]}.json`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        window.showToast("Full Kendra database backup downloaded!");
      });
    }

    if (restoreInput) {
      restoreInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const data = JSON.parse(ev.target.result);
              if (data.kendraConfig) localStorage.setItem("CSC_KENDRA_CONFIG", JSON.stringify(data.kendraConfig));
              if (data.ratesConfig) localStorage.setItem("CSC_RATES_CONFIG", JSON.stringify(data.ratesConfig));
              if (data.cashLedger) localStorage.setItem("CSC_CASH_LEDGER", JSON.stringify(data.cashLedger));
              if (data.staffList) localStorage.setItem("CSC_STAFF_LIST", JSON.stringify(data.staffList));
              if (data.leads) localStorage.setItem("CSC_LEADS_DATA", JSON.stringify(data.leads));

              alert("Backup data restored successfully! Reloading portal...");
              window.location.reload();
            } catch (err) {
              alert("Failed to restore backup file: Invalid JSON structure.");
            }
          };
          reader.readAsText(file);
        }
      });
    }
  }

  initAdminStats() {
    const totalLeads = (JSON.parse(localStorage.getItem("CSC_LEADS_DATA") || "[]")).length;
    const totalTx = this.cashLedger.length;
    const totalOperators = this.staffList.length;

    const el1 = document.getElementById("admin-stat-leads");
    const el2 = document.getElementById("admin-stat-tx");
    const el3 = document.getElementById("admin-stat-staff");

    if (el1) el1.textContent = totalLeads;
    if (el2) el2.textContent = totalTx;
    if (el3) el3.textContent = totalOperators;
  }
}

window.CscAdminPortal = CscAdminPortal;

document.addEventListener("DOMContentLoaded", () => {
  window.adminPortal = new CscAdminPortal();
});

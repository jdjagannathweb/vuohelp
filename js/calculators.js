/**
 * VUO CSC HELP - Multi-Calculator Suite
 * Includes:
 *  1. Sarkari / CSC Age Calculator (Exact Y/M/D, Cut-off date, Next birthday)
 *  2. Loan EMI & Interest Calculator (Monthly EMI, Total Interest, Amortization)
 *  3. GST & CGST/SGST Calculator (+/- 5%, 12%, 18%, 28%)
 *  4. Percentage & Marks Calculator (Total, Obtained, Percentage, Grade)
 */

const VUO_CALCULATORS = {
  currentTab: 'age',

  init() {
    this.initAgeCalc();
    this.initEmiCalc();
    this.initGstCalc();
    this.initPercentageCalc();
    this.initCgpaCalc();
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.calc-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-calc-tab');
      if (target === tabId) {
        btn.className = 'calc-tab-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer';
      } else {
        btn.className = 'calc-tab-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer';
      }
    });

    document.querySelectorAll('.calc-tab-panel').forEach(panel => {
      if (panel.id === `calcPanel_${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
  },

  /* ================= 1. AGE CALCULATOR ================= */
  initAgeCalc() {
    const asOnInput = document.getElementById('calcAgeAsOn');
    if (asOnInput && !asOnInput.value) {
      const today = new Date().toISOString().split('T')[0];
      asOnInput.value = today;
    }
  },

  calculateAge() {
    const dobVal = document.getElementById('calcAgeDob')?.value;
    const asOnVal = document.getElementById('calcAgeAsOn')?.value;

    if (!dobVal) {
      showToast('Kripya Date of Birth (Janma Tarikh) chuniye!', 'warning');
      return;
    }
    if (!asOnVal) {
      showToast('Kripya As On Date (Kis Tarikh Tak) chuniye!', 'warning');
      return;
    }

    const dob = new Date(dobVal);
    const asOn = new Date(asOnVal);

    if (dob > asOn) {
      showToast('Janma Tarikh cut-off date se pehle honi chahiye!', 'error');
      return;
    }

    let years = asOn.getFullYear() - dob.getFullYear();
    let months = asOn.getMonth() - dob.getMonth();
    let days = asOn.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(asOn.getFullYear(), asOn.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total calculations
    const diffTime = Math.abs(asOn - dob);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;

    // Next Birthday calculation
    const currentYear = asOn.getFullYear();
    let nextBday = new Date(currentYear, dob.getMonth(), dob.getDate());
    if (nextBday < asOn) {
      nextBday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday - asOn) / (1000 * 60 * 60 * 24));

    // Update UI
    const resContainer = document.getElementById('calcAgeResults');
    if (resContainer) resContainer.classList.remove('hidden');

    document.getElementById('calcAgeYears').textContent = years;
    document.getElementById('calcAgeMonths').textContent = months;
    document.getElementById('calcAgeDays').textContent = days;

    document.getElementById('calcAgeTotalDays').textContent = totalDays.toLocaleString('en-IN') + ' Days';
    document.getElementById('calcAgeTotalWeeks').textContent = totalWeeks.toLocaleString('en-IN') + ' Weeks';
    document.getElementById('calcAgeTotalMonths').textContent = totalMonths.toLocaleString('en-IN') + ' Months';
    document.getElementById('calcAgeTotalHours').textContent = totalHours.toLocaleString('en-IN') + ' Hours';
    document.getElementById('calcAgeNextBday').textContent = daysToNextBday === 0 ? '🎉 Today is Birthday!' : `${daysToNextBday} Days to go`;

    // Eligibility tags
    const min18 = years >= 18;
    const max38 = years < 38;
    const eligEl = document.getElementById('calcAgeGovtElig');
    if (eligEl) {
      if (min18 && max38) {
        eligEl.innerHTML = `<span class="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-black"><i class="fa-solid fa-circle-check"></i> Eligible for Most Odisha & Central Govt Jobs (18-38 Years)</span>`;
      } else if (!min18) {
        eligEl.innerHTML = `<span class="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full text-xs font-black"><i class="fa-solid fa-circle-xmark"></i> Underage: Minimum 18 Years required for Sarkari Jobs</span>`;
      } else {
        eligEl.innerHTML = `<span class="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-xs font-black"><i class="fa-solid fa-triangle-exclamation"></i> Over 38 Years (Check SC/ST/OBC/SEBC age relaxation)</span>`;
      }
    }
  },

  resetAgeCalc() {
    if (document.getElementById('calcAgeDob')) document.getElementById('calcAgeDob').value = '';
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('calcAgeAsOn')) document.getElementById('calcAgeAsOn').value = today;
    const res = document.getElementById('calcAgeResults');
    if (res) res.classList.add('hidden');
  },

  /* ================= 2. LOAN EMI CALCULATOR ================= */
  initEmiCalc() {
    this.calculateEMI();
  },

  calculateEMI() {
    const pInput = document.getElementById('calcEmiPrincipal');
    const rInput = document.getElementById('calcEmiRate');
    const tInput = document.getElementById('calcEmiTenure');
    const typeInput = document.getElementById('calcEmiTenureType');

    if (!pInput || !rInput || !tInput) return;

    const principal = parseFloat(pInput.value) || 0;
    const ratePerYear = parseFloat(rInput.value) || 0;
    let tenure = parseFloat(tInput.value) || 0;

    if (principal <= 0 || tenure <= 0) {
      return;
    }

    const isMonths = typeInput && typeInput.value === 'months';
    const totalMonths = isMonths ? tenure : tenure * 12;
    const monthlyRate = (ratePerYear / 12) / 100;

    let emi = 0;
    if (monthlyRate > 0) {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      emi = principal / totalMonths;
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principal;

    const emiEl = document.getElementById('calcEmiMonthly');
    const interestEl = document.getElementById('calcEmiTotalInterest');
    const totalEl = document.getElementById('calcEmiTotalAmount');

    if (emiEl) emiEl.textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
    if (interestEl) interestEl.textContent = '₹' + Math.round(totalInterest).toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = '₹' + Math.round(totalPayment).toLocaleString('en-IN');

    // Update breakdown bar
    const pPercent = Math.round((principal / totalPayment) * 100);
    const iPercent = 100 - pPercent;
    const pBar = document.getElementById('calcEmiPrincipalBar');
    const iBar = document.getElementById('calcEmiInterestBar');
    if (pBar) pBar.style.width = `${pPercent}%`;
    if (iBar) iBar.style.width = `${iPercent}%`;
    if (document.getElementById('calcEmiPrincipalPct')) {
      document.getElementById('calcEmiPrincipalPct').textContent = `${pPercent}% (Principal)`;
    }
    if (document.getElementById('calcEmiInterestPct')) {
      document.getElementById('calcEmiInterestPct').textContent = `${iPercent}% (Interest)`;
    }
  },

  /* ================= 3. GST & PERCENTAGE CALCULATOR ================= */
  initGstCalc() {
    this.calculateGST();
  },

  setGstRate(rate) {
    const rateInput = document.getElementById('calcGstRate');
    if (rateInput) {
      rateInput.value = rate;
      this.calculateGST();
    }
  },

  calculateGST() {
    const amountInput = document.getElementById('calcGstAmount');
    const rateInput = document.getElementById('calcGstRate');
    const typeSelect = document.getElementById('calcGstType');

    if (!amountInput || !rateInput) return;

    const amount = parseFloat(amountInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const isInclusive = typeSelect ? typeSelect.value === 'inclusive' : false;

    let baseAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (isInclusive) {
      // Amount already includes GST
      totalAmount = amount;
      baseAmount = (amount * 100) / (100 + rate);
      gstAmount = totalAmount - baseAmount;
    } else {
      // Amount is exclusive of GST
      baseAmount = amount;
      gstAmount = (baseAmount * rate) / 100;
      totalAmount = baseAmount + gstAmount;
    }

    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    const resBase = document.getElementById('calcGstBaseVal');
    const resGst = document.getElementById('calcGstTotalVal');
    const resCgst = document.getElementById('calcGstCgstVal');
    const resSgst = document.getElementById('calcGstSgstVal');
    const resFinal = document.getElementById('calcGstFinalVal');

    if (resBase) resBase.textContent = '₹' + baseAmount.toFixed(2);
    if (resGst) resGst.textContent = '₹' + gstAmount.toFixed(2);
    if (resCgst) resCgst.textContent = '₹' + cgst.toFixed(2) + ` (${(rate/2).toFixed(1)}%)`;
    if (resSgst) resSgst.textContent = '₹' + sgst.toFixed(2) + ` (${(rate/2).toFixed(1)}%)`;
    if (resFinal) resFinal.textContent = '₹' + totalAmount.toFixed(2);
  },

  /* ================= 4. PERCENTAGE & MARKS CALCULATOR ================= */
  initPercentageCalc() {
    this.calculateMarks();
  },

  calculateMarks() {
    const totalInput = document.getElementById('calcMarksTotal');
    const obtInput = document.getElementById('calcMarksObt');

    if (!totalInput || !obtInput) return;

    const total = parseFloat(totalInput.value) || 0;
    const obtained = parseFloat(obtInput.value) || 0;

    if (total <= 0) return;

    const pct = (obtained / total) * 100;
    const fixedPct = pct.toFixed(2);

    let grade = 'Fail';
    let gradeBadge = 'bg-rose-100 text-rose-800 border-rose-300';
    let division = 'Needs Improvement';

    if (pct >= 85) {
      grade = 'A+ (Distinction)';
      gradeBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      division = 'First Division with Distinction';
    } else if (pct >= 60) {
      grade = '1st Division';
      gradeBadge = 'bg-blue-100 text-blue-800 border-blue-300';
      division = 'First Division';
    } else if (pct >= 45) {
      grade = '2nd Division';
      gradeBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      division = 'Second Division';
    } else if (pct >= 33) {
      grade = '3rd Division';
      gradeBadge = 'bg-orange-100 text-orange-800 border-orange-300';
      division = 'Third Division (Pass)';
    }

    const pctEl = document.getElementById('calcMarksPercentage');
    const gradeEl = document.getElementById('calcMarksGrade');
    const divEl = document.getElementById('calcMarksDivision');

    if (pctEl) pctEl.textContent = `${fixedPct}%`;
    if (gradeEl) {
      gradeEl.textContent = grade;
      gradeEl.className = `px-3 py-1 rounded-full text-xs font-black border ${gradeBadge}`;
    }
    if (divEl) divEl.textContent = division;
  },

  /* ================= 5. CGPA & SGPA CALCULATOR ================= */
  initCgpaCalc() {
    this.calculateCgpa();
  },

  calculateCgpa() {
    const cgpaInput = document.getElementById('calcCgpaInput');
    const formulaSelect = document.getElementById('calcCgpaFormula');
    if (!cgpaInput || !formulaSelect) return;

    const cgpa = parseFloat(cgpaInput.value) || 0;
    const formula = formulaSelect.value;

    let percentage = 0;
    let formulaText = '';

    if (formula === '9.5') {
      percentage = cgpa * 9.5;
      formulaText = `Formula: ${cgpa} x 9.5 = ${percentage.toFixed(2)}% (CBSE Standard)`;
    } else if (formula === '10.0') {
      percentage = cgpa * 10.0;
      formulaText = `Formula: ${cgpa} x 10.0 = ${percentage.toFixed(2)}% (Direct 10 Scale)`;
    } else if (formula === '9.0') {
      percentage = cgpa * 9.0;
      formulaText = `Formula: ${cgpa} x 9.0 = ${percentage.toFixed(2)}% (Univ Scale 9.0)`;
    } else if (formula === 'bput') {
      percentage = (cgpa - 0.5) * 10.0;
      formulaText = `Formula: (${cgpa} - 0.5) x 10 = ${percentage.toFixed(2)}% (BPUT / AICTE)`;
    }

    percentage = Math.max(0, Math.min(100, percentage));
    const fixedPct = percentage.toFixed(2);

    let gradeBadge = 'Grade A (Very Good)';
    let gradeBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let division = 'First Division';

    if (percentage >= 85) {
      gradeBadge = 'Grade O / Outstanding';
      gradeBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      division = 'First Division with Distinction';
    } else if (percentage >= 70) {
      gradeBadge = 'Grade A / Very Good';
      gradeBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
      division = 'First Division';
    } else if (percentage >= 60) {
      gradeBadge = 'Grade B+ / Good';
      gradeBadgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
      division = 'First Division';
    } else if (percentage >= 50) {
      gradeBadge = 'Grade B / Average';
      gradeBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      division = 'Second Division';
    } else if (percentage >= 33) {
      gradeBadge = 'Grade C / Pass';
      gradeBadgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
      division = 'Third Division (Pass)';
    } else {
      gradeBadge = 'Grade F / Needs Improvement';
      gradeBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
      division = 'Needs Improvement';
    }

    const pctEl = document.getElementById('calcCgpaResultPct');
    const formulaEl = document.getElementById('calcCgpaFormulaUsed');
    const divEl = document.getElementById('calcCgpaDivision');
    const badgeEl = document.getElementById('calcCgpaGradeBadge');

    if (pctEl) pctEl.textContent = `${fixedPct}%`;
    if (formulaEl) formulaEl.textContent = formulaText;
    if (divEl) divEl.textContent = division;
    if (badgeEl) {
      badgeEl.textContent = gradeBadge;
      badgeEl.className = `px-3 py-1 rounded-full text-xs font-black border ${gradeBadgeClass}`;
    }
  }
};

window.VUO_CALCULATORS = VUO_CALCULATORS;

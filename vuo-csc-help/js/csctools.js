/**
 * VUO CSC HELP - CSC Dedicated Work Tools Suite
 * Includes:
 *  1. Govt ID Card / PVC Multi-Print Maker (Aadhaar, Voter, PAN, E-Shram Crop & 85.6x54mm print)
 *  2. Official CSC Rubber Stamp Maker (Round / Oval / Rectangle with custom text & PNG export)
 *  3. Employee Monthly Salary Slip / Payslip Generator (Earnings, Deductions, Net Pay, Print)
 *  4. Direct WhatsApp Message Tool (Chat without saving number + Quick VLE message templates)
 *  5. Typing Speed & Accuracy Test (1-Minute live exam typing simulator with WPM & Accuracy)
 */

const VUO_CSCTOOLS = {
  currentTab: 'idcard',

  init() {
    this.initIdCard();
    this.initStampMaker();
    this.initSalarySlip();
    this.initWhatsAppTool();
    this.initTypingTest();
    this.initQrCode();
    this.initPosterMaker();
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.csctool-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-csctool-tab');
      if (target === tabId) {
        btn.className = 'csctool-tab-btn px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer';
      } else {
        btn.className = 'csctool-tab-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer';
      }
    });

    document.querySelectorAll('.csctool-tab-panel').forEach(panel => {
      if (panel.id === `csctoolPanel_${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
  },

  /* ================= 1. GOVT ID CARD & PVC PRINT MAKER ================= */
  idFrontImg: null,
  idBackImg: null,

  initIdCard() {
    // Setup file inputs
    const frontInput = document.getElementById('idCardFrontInput');
    const backInput = document.getElementById('idCardBackInput');

    if (frontInput) {
      frontInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              this.idFrontImg = img;
              this.renderIdCardPreview();
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (backInput) {
      backInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              this.idBackImg = img;
              this.renderIdCardPreview();
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },

  renderIdCardPreview() {
    const canvas = document.getElementById('idCardCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // A4 dimensions at 300 DPI: 2480 x 3508 px
    // Standard CR80 ID Card dimensions: 85.6mm x 53.98mm (~1011 x 638 px at 300 DPI)
    canvas.width = 1200;
    canvas.height = 800;

    // Fill white sheet background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sheet title
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('CR80 Standard ID Card Layout (85.6mm x 54mm) - Ready for PVC / 4x6 / A4 Print', 40, 40);

    const cardWidth = 500;
    const cardHeight = 315;
    const radius = 14;

    // Draw Front ID Card Slot
    const frontX = 60;
    const frontY = 80;

    ctx.save();
    this.roundRect(ctx, frontX, frontY, cardWidth, cardHeight, radius);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();

    if (this.idFrontImg) {
      ctx.clip();
      ctx.drawImage(this.idFrontImg, frontX, frontY, cardWidth, cardHeight);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT SIDE OF ID CARD', frontX + cardWidth / 2, frontY + cardHeight / 2 - 10);
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Upload Aadhaar / Voter / PAN Front Image', frontX + cardWidth / 2, frontY + cardHeight / 2 + 15);
    }
    ctx.restore();

    // Draw Back ID Card Slot
    const backX = 630;
    const backY = 80;

    ctx.save();
    this.roundRect(ctx, backX, backY, cardWidth, cardHeight, radius);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();

    if (this.idBackImg) {
      ctx.clip();
      ctx.drawImage(this.idBackImg, backX, backY, cardWidth, cardHeight);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BACK SIDE OF ID CARD', backX + cardWidth / 2, backY + cardHeight / 2 - 10);
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Upload Aadhaar / Voter / PAN Back Image', backX + cardWidth / 2, backY + cardHeight / 2 + 15);
    }
    ctx.restore();

    // Cutting lines & alignment marks
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    // Horizontal alignment guidelines
    ctx.beginPath();
    ctx.moveTo(30, frontY);
    ctx.lineTo(frontX, frontY);
    ctx.moveTo(frontX + cardWidth, frontY);
    ctx.lineTo(backX, frontY);
    ctx.moveTo(backX + cardWidth, frontY);
    ctx.lineTo(canvas.width - 30, frontY);
    ctx.stroke();

    // Footer Info
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Odisha CSC VLE Help Desk — Standard ID Card Print Engine', canvas.width / 2, 450);
  },

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  printIdCard() {
    const canvas = document.getElementById('idCardCanvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Print ID Card - VUO CSC HELP</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: flex-start; }
            img { width: 100%; max-width: 190mm; height: auto; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    win.document.close();
  },

  downloadIdCard() {
    const canvas = document.getElementById('idCardCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `CSC_ID_Card_Print_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('ID Card Print Sheet download ho gaya!', 'success');
  },

  /* ================= 2. CSC OFFICIAL RUBBER STAMP MAKER ================= */
  initStampMaker() {
    this.renderStamp();
  },

  renderStamp() {
    const canvas = document.getElementById('stampCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const shape = document.getElementById('stampShape')?.value || 'round';
    const topText = (document.getElementById('stampTopText')?.value || 'COMMON SERVICE CENTER').toUpperCase();
    const centerText = (document.getElementById('stampCenterText')?.value || 'DIGITAL SEVA KENDRA').toUpperCase();
    const bottomText = (document.getElementById('stampBottomText')?.value || 'PURI, ODISHA').toUpperCase();
    const cscId = (document.getElementById('stampCscId')?.value || 'CSC ID: 123456789012').toUpperCase();
    const inkColor = document.getElementById('stampInkColor')?.value || '#1d4ed8'; // Default royal blue

    canvas.width = 400;
    canvas.height = 400;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = inkColor;
    ctx.fillStyle = inkColor;

    const centerX = 200;
    const centerY = 200;

    if (shape === 'round') {
      // Outer Double Circle
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 175, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 168, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Circle
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 115, 0, Math.PI * 2);
      ctx.stroke();

      // Top Curved Text
      this.drawCurvedText(ctx, topText, centerX, centerY, 140, Math.PI, 0, inkColor, 'bold 15px Arial');

      // Bottom Curved Text
      this.drawCurvedText(ctx, bottomText, centerX, centerY, 140, 0, Math.PI, inkColor, 'bold 14px Arial', true);

      // Star separators
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', centerX - 145, centerY);
      ctx.fillText('★', centerX + 145, centerY);

      // Center Box / Texts
      ctx.font = 'bold 17px Arial';
      ctx.fillText(centerText, centerX, centerY - 15);

      ctx.font = 'bold 13px Arial';
      ctx.fillText(cscId, centerX, centerY + 12);

      // Center Divider Lines
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, centerY - 2);
      ctx.lineTo(centerX + 80, centerY - 2);
      ctx.stroke();

    } else if (shape === 'rectangle') {
      // Outer Rectangle
      ctx.lineWidth = 4;
      this.roundRect(ctx, 30, 80, 340, 240, 10);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      this.roundRect(ctx, 38, 88, 324, 224, 8);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Line 1: Top
      ctx.font = 'bold 18px Arial';
      ctx.fillText(topText, centerX, 130);

      // Line 2: Center
      ctx.font = 'bold 16px Arial';
      ctx.fillText(centerText, centerX, 175);

      // Divider line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 205);
      ctx.lineTo(340, 205);
      ctx.stroke();

      // Line 3: CSC ID
      ctx.font = 'bold 14px Arial';
      ctx.fillText(cscId, centerX, 235);

      // Line 4: Bottom Location
      ctx.font = 'bold 13px Arial';
      ctx.fillText(bottomText, centerX, 270);
    }
  },

  drawCurvedText(ctx, text, x, y, radius, startAngle, endAngle, color, font, isBottom = false) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = isBottom ? 'bottom' : 'top';

    const len = text.length;
    const arcLength = (Math.PI * 0.75);
    const step = arcLength / (len - 1 || 1);

    if (!isBottom) {
      // Top arch
      let angle = (Math.PI * 1.5) - (arcLength / 2);
      for (let i = 0; i < len; i++) {
        const char = text[i];
        ctx.save();
        ctx.translate(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
        angle += step;
      }
    } else {
      // Bottom arch (read left to right)
      let angle = (Math.PI * 0.5) + (arcLength / 2);
      for (let i = 0; i < len; i++) {
        const char = text[i];
        ctx.save();
        ctx.translate(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        ctx.rotate(angle - Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
        angle -= step;
      }
    }
    ctx.restore();
  },

  downloadStamp() {
    const canvas = document.getElementById('stampCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `CSC_Rubber_Stamp_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Official CSC Rubber Stamp (PNG Transparent) download ho gaya!', 'success');
  },

  /* ================= 3. SALARY SLIP / PAYSLIP GENERATOR ================= */
  initSalarySlip() {
    const monthSelect = document.getElementById('slipMonth');
    if (monthSelect) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const d = new Date();
      const curMonth = months[d.getMonth()];
      const curYear = d.getFullYear();
      monthSelect.value = `${curMonth} ${curYear}`;
    }
    this.calculateSalary();
  },

  calculateSalary() {
    const basic = parseFloat(document.getElementById('slipBasic')?.value) || 0;
    const hra = parseFloat(document.getElementById('slipHra')?.value) || 0;
    const da = parseFloat(document.getElementById('slipDa')?.value) || 0;
    const special = parseFloat(document.getElementById('slipSpecial')?.value) || 0;

    const pf = parseFloat(document.getElementById('slipPf')?.value) || 0;
    const esic = parseFloat(document.getElementById('slipEsic')?.value) || 0;
    const tds = parseFloat(document.getElementById('slipTds')?.value) || 0;
    const advance = parseFloat(document.getElementById('slipAdvance')?.value) || 0;

    const totalEarnings = basic + hra + da + special;
    const totalDeductions = pf + esic + tds + advance;
    const netSalary = totalEarnings - totalDeductions;

    if (document.getElementById('slipPreviewEarnings')) document.getElementById('slipPreviewEarnings').textContent = '₹' + totalEarnings.toLocaleString('en-IN');
    if (document.getElementById('slipPreviewDeductions')) document.getElementById('slipPreviewDeductions').textContent = '₹' + totalDeductions.toLocaleString('en-IN');
    if (document.getElementById('slipPreviewNet')) document.getElementById('slipPreviewNet').textContent = '₹' + netSalary.toLocaleString('en-IN');
    if (document.getElementById('slipPreviewNetWords')) document.getElementById('slipPreviewNetWords').textContent = this.numToWords(Math.round(netSalary)) + ' Rupees Only';
  },

  numToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() || 'Zero';
  },

  printSalarySlip() {
    // Populate printable elements
    const org = document.getElementById('slipOrgName')?.value || 'COMMON SERVICE CENTER (CSC)';
    const emp = document.getElementById('slipEmpName')?.value || 'Employee Name';
    const desig = document.getElementById('slipDesignation')?.value || 'Operator';
    const month = document.getElementById('slipMonth')?.value || 'March 2026';

    const basic = parseFloat(document.getElementById('slipBasic')?.value) || 0;
    const hra = parseFloat(document.getElementById('slipHra')?.value) || 0;
    const da = parseFloat(document.getElementById('slipDa')?.value) || 0;
    const special = parseFloat(document.getElementById('slipSpecial')?.value) || 0;

    const pf = parseFloat(document.getElementById('slipPf')?.value) || 0;
    const esic = parseFloat(document.getElementById('slipEsic')?.value) || 0;
    const tds = parseFloat(document.getElementById('slipTds')?.value) || 0;
    const advance = parseFloat(document.getElementById('slipAdvance')?.value) || 0;

    const earnings = basic + hra + da + special;
    const deductions = pf + esic + tds + advance;
    const net = earnings - deductions;

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${emp}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #1e293b; }
            .slip-box { border: 2px solid #0f172a; padding: 20px; border-radius: 8px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 15px; }
            .header h2 { margin: 0; font-size: 22px; color: #0369a1; text-transform: uppercase; }
            .header p { margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: bold; }
            .emp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; }
            .net-box { background: #e0f2fe; padding: 12px; font-size: 15px; font-weight: bold; display: flex; justify-content: space-between; border-radius: 6px; margin-bottom: 25px; }
            .sign-row { display: flex; justify-content: space-between; margin-top: 50px; font-size: 13px; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="slip-box">
            <div class="header">
              <h2>${org}</h2>
              <p>PAYSLIP FOR THE MONTH OF: ${month.toUpperCase()}</p>
            </div>
            <div class="emp-grid">
              <div><strong>Employee Name:</strong> ${emp}</div>
              <div><strong>Designation:</strong> ${desig}</div>
              <div><strong>Payment Mode:</strong> Bank Transfer / Cash</div>
              <div><strong>Date of Pay:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>EARNINGS</th>
                  <th style="text-align:right;">AMOUNT (₹)</th>
                  <th>DEDUCTIONS</th>
                  <th style="text-align:right;">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style="text-align:right;">₹${basic.toFixed(2)}</td>
                  <td>Provident Fund (PF)</td>
                  <td style="text-align:right;">₹${pf.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td style="text-align:right;">₹${hra.toFixed(2)}</td>
                  <td>ESIC Deduction</td>
                  <td style="text-align:right;">₹${esic.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Dearness Allowance (DA)</td>
                  <td style="text-align:right;">₹${da.toFixed(2)}</td>
                  <td>TDS / Tax</td>
                  <td style="text-align:right;">₹${tds.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Special / Bonus</td>
                  <td style="text-align:right;">₹${special.toFixed(2)}</td>
                  <td>Advance / Loan EMI</td>
                  <td style="text-align:right;">₹${advance.toFixed(2)}</td>
                </tr>
                <tr style="font-weight:bold; background:#f8fafc;">
                  <td>Gross Earnings</td>
                  <td style="text-align:right;">₹${earnings.toFixed(2)}</td>
                  <td>Total Deductions</td>
                  <td style="text-align:right;">₹${deductions.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="net-box">
              <span>NET SALARY PAYABLE: ₹${net.toLocaleString('en-IN')}</span>
              <span style="font-size:12px; font-weight:normal;">(${this.numToWords(Math.round(net))} Rupees Only)</span>
            </div>
            <div class="sign-row">
              <div>Employee Signature</div>
              <div>Authorized Signatory / Seal</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  },

  /* ================= 4. WHATSAPP DIRECT MESSAGE TOOL ================= */
  initWhatsAppTool() {
    //
  },

  applyWhatsAppTemplate(type) {
    const msgBox = document.getElementById('waDirectMessage');
    if (!msgBox) return;

    if (type === 'doc_ready') {
      msgBox.value = `Namaskar! Apanka apply karithiba document (Certificate/PAN/Aadhaar/e-District) ready hoi jaichi. Kripya CSC Center ku asi collect karantu. Dhanyabad!`;
    } else if (type === 'subhadra') {
      msgBox.value = `Namaskar! Subhadra Yojana form apply ba DBT Status check kariba pain apananka Aadhaar Card, Bank Passbook sahita CSC Center ku asantu. Dhanyabad!`;
    } else if (type === 'bill') {
      msgBox.value = `Namaskar! Apanka service ra bill payment confirmation receipt ready achi. Thank you for visiting our CSC Digital Seva Kendra!`;
    }
  },

  openWhatsAppChat() {
    const code = document.getElementById('waCountryCode')?.value || '91';
    let phone = document.getElementById('waPhoneNumber')?.value || '';
    const message = document.getElementById('waDirectMessage')?.value || '';

    phone = phone.replace(/[^0-9]/g, '');
    if (!phone || phone.length < 10) {
      showToast('Kripya valid 10-digit mobile number enter karein!', 'warning');
      return;
    }

    // Strip leading 0 if present
    if (phone.length === 11 && phone.startsWith('0')) {
      phone = phone.substring(1);
    }

    const fullNumber = phone.length === 10 ? `${code}${phone}` : phone;
    const encodedMsg = encodeURIComponent(message);
    const url = `https://wa.me/${fullNumber}?text=${encodedMsg}`;
    window.open(url, '_blank');
    showToast('WhatsApp Chat window open ho rahi hai!', 'success');
  },

  /* ================= 5. TYPING SPEED & ACCURACY TEST ================= */
  typingSamples: [
    "Digital India is a flagship programme of the Government of India with a vision to transform India into a digitally empowered society and knowledge economy. Common Service Centers are the front end delivery points for government, private and social sector services to citizens in rural and remote locations.",
    "Odisha is one of the pioneering states in India for digital governance. From Bhulekh land records to Subhadra Yojana and e-District services, thousands of Village Level Entrepreneurs provide round the clock online citizen assistance across all thirty districts.",
    "Fast and accurate typing is an essential professional skill for every CSC operator. High typing speed helps in submitting government applications quickly without timeout errors, and ensures error free citizen data entry during peak rush hours."
  ],
  typingTimer: null,
  typingTimeLeft: 60,
  typingRunning: false,

  initTypingTest() {
    this.resetTypingTest();
  },

  resetTypingTest() {
    clearInterval(this.typingTimer);
    this.typingRunning = false;
    this.typingTimeLeft = 60;

    const timerEl = document.getElementById('typingTimer');
    const wpmEl = document.getElementById('typingWpm');
    const accEl = document.getElementById('typingAcc');
    const inputEl = document.getElementById('typingInput');
    const textEl = document.getElementById('typingSourceText');

    if (timerEl) timerEl.textContent = '60s';
    if (wpmEl) wpmEl.textContent = '0';
    if (accEl) accEl.textContent = '100%';
    if (inputEl) {
      inputEl.value = '';
      inputEl.disabled = false;
      inputEl.placeholder = 'Start typing here... Timer will begin automatically on first keypress!';
    }

    if (textEl) {
      const sample = this.typingSamples[Math.floor(Math.random() * this.typingSamples.length)];
      textEl.innerHTML = sample.split('').map(char => `<span class="typing-char">${char}</span>`).join('');
    }
  },

  handleTypingInput() {
    const inputEl = document.getElementById('typingInput');
    const textEl = document.getElementById('typingSourceText');
    if (!inputEl || !textEl) return;

    if (!this.typingRunning) {
      this.typingRunning = true;
      this.typingTimer = setInterval(() => {
        this.typingTimeLeft--;
        const timerEl = document.getElementById('typingTimer');
        if (timerEl) timerEl.textContent = `${this.typingTimeLeft}s`;

        if (this.typingTimeLeft <= 0) {
          clearInterval(this.typingTimer);
          inputEl.disabled = true;
          this.typingRunning = false;
          showToast('Typing test complete! Apna score check karein.', 'success');
        }
      }, 1000);
    }

    const typedVal = inputEl.value;
    const charSpans = textEl.querySelectorAll('.typing-char');
    let correctCount = 0;

    charSpans.forEach((span, idx) => {
      const char = typedVal[idx];
      if (char == null) {
        span.className = 'typing-char text-slate-700';
      } else if (char === span.textContent) {
        span.className = 'typing-char text-emerald-600 font-bold bg-emerald-50';
        correctCount++;
      } else {
        span.className = 'typing-char text-rose-600 font-bold bg-rose-100 underline';
      }
    });

    // Calculate WPM and Accuracy
    const timeElapsed = 60 - this.typingTimeLeft || 1;
    const wordsTyped = (typedVal.length / 5);
    const wpm = Math.round((wordsTyped / timeElapsed) * 60);
    const accuracy = typedVal.length > 0 ? Math.round((correctCount / typedVal.length) * 100) : 100;

    const wpmEl = document.getElementById('typingWpm');
    const accEl = document.getElementById('typingAcc');
    if (wpmEl) wpmEl.textContent = Math.max(0, wpm);
    if (accEl) accEl.textContent = `${accuracy}%`;
  },

  /* ================= 6. CUSTOM QR CODE GENERATOR ================= */
  qrInstance: null,

  initQrCode() {
    this.generateQrCode();
  },

  onQrTypeChange() {
    const type = document.getElementById('qrType')?.value;
    const upiFields = document.getElementById('qrUpiFields');
    const generalField = document.getElementById('qrGeneralField');

    if (type === 'upi') {
      if (upiFields) upiFields.classList.remove('hidden');
      if (generalField) generalField.classList.add('hidden');
    } else {
      if (upiFields) upiFields.classList.add('hidden');
      if (generalField) generalField.classList.remove('hidden');
    }
    this.generateQrCode();
  },

  generateQrCode() {
    const canvas = document.getElementById('cscQrCanvas');
    if (!canvas) return;

    const type = document.getElementById('qrType')?.value || 'upi';
    let qrValue = 'https://vleunionodisha.in';

    if (type === 'upi') {
      const vpa = document.getElementById('qrUpiId')?.value.trim() || '9937037131@ybl';
      const name = document.getElementById('qrUpiName')?.value.trim() || 'ODISHA DIGITAL SEVA KENDRA';
      const amount = document.getElementById('qrUpiAmount')?.value.trim();

      qrValue = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&cu=INR`;
      if (amount && parseFloat(amount) > 0) {
        qrValue += `&am=${encodeURIComponent(amount)}`;
      }

      const standeeName = document.getElementById('qrStandeeShopName');
      const standeeUpi = document.getElementById('qrStandeeUpiText');
      if (standeeName) standeeName.textContent = name;
      if (standeeUpi) standeeUpi.textContent = amount ? `${vpa} • ₹${amount}` : vpa;
    } else {
      const text = document.getElementById('qrGeneralText')?.value.trim();
      if (type === 'phone') {
        qrValue = `tel:${text || '+919937037131'}`;
      } else {
        qrValue = text || 'https://vleunionodisha.in';
      }
    }

    if (window.QRious) {
      this.qrInstance = new QRious({
        element: canvas,
        value: qrValue,
        size: 300,
        level: 'H',
        foreground: '#0f172a',
        background: '#ffffff'
      });
    }
  },

  downloadQrCode() {
    const canvas = document.getElementById('cscQrCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'CSC_Payment_QR.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Payment QR Code downloaded as HD PNG!', 'success');
  },

  printQrStandee() {
    const card = document.getElementById('qrStandeeCard');
    if (!card) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Please allow popups to print Standee directly.', 'warning');
      return;
    }

    const cardHtml = card.outerHTML;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CSC Payment Standee - VUO CSC Help</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css">
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; padding: 20px; }
            #qrStandeeCard { max-width: 380px !important; width: 100% !important; border: 2px solid #38bdf8 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 350);">
          ${cardHtml}
        </body>
      </html>
    `);
    printWin.document.close();
  },

  /* ================= 7. CSC ADVERTISEMENT POSTER MAKER ================= */
  initPosterMaker() {
    this.renderPoster();
  },

  renderPoster() {
    const canvas = document.getElementById('cscPosterCanvas');
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 1600; // High-res portrait A4 poster (3:4 ratio)
    const ctx = canvas.getContext('2d');

    const template = document.getElementById('posterTemplate')?.value || 'subhadra';
    const shopName = document.getElementById('posterShopName')?.value.trim() || 'ODISHA DIGITAL SEVA KENDRA';
    const phone = document.getElementById('posterPhone')?.value.trim() || '+91 9937037131';
    const address = document.getElementById('posterAddress')?.value.trim() || 'Near Block Office, Satyabadi, Puri, Odisha';

    // 1. Background Gradient
    if (template === 'subhadra') {
      const grad = ctx.createLinearGradient(0, 0, 0, 1600);
      grad.addColorStop(0, '#991b1b');
      grad.addColorStop(0.35, '#7f1d1d');
      grad.addColorStop(0.75, '#450a0a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1600);

      // Gold Ornamental Border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 16;
      ctx.strokeRect(24, 24, 1152, 1552);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, 1128, 1528);

      // Top Tagline
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('॥ ଓଡ଼ିଶା ସରକାରଙ୍କ ଯୁଗାନ୍ତକାରୀ ମହିଳା କଲ୍ୟାଣ ଯୋଜନା ॥', 600, 100);

      // Header Banner
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 78px sans-serif';
      ctx.fillText('ସୁଭଦ୍ରା ଯୋଜନା (SUBHADRA)', 600, 190);

      // Subhead Box
      ctx.fillStyle = '#f59e0b';
      ctx.roundRect(100, 230, 1000, 90, 20);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 48px sans-serif';
      ctx.fillText('ମୋଟ ₹୫୦,୦୦୦/- ସହାୟତା ରାଶି', 600, 292);

      // Main Feature Points Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(80, 360, 1040, 800, 24);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#991b1b';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('ଆମ କେନ୍ଦ୍ରରେ ଉପଲବ୍ଧ ସେବାସମୂହ :', 130, 430);

      const bulletPoints = [
        '✓ ନୂଆ ସୁଭଦ୍ରା ଫର୍ମ ଅନଲାଇନ୍ ଆବେଦନ (New Registration)',
        '✓ ଆଧାର ଲିଙ୍କ୍ ଡିବିଟି (Aadhaar DBT / NPCI) ଷ୍ଟାଟସ୍ ଯାଞ୍ଚ',
        '✓ ଇ-କେୱାଇସି (Biometric / Face eKYC) ତୁରନ୍ତ ସମାଧାନ',
        '✓ ଆବେଦନ ରିଜେକ୍ଟ ହୋଇଥିଲେ ନୂଆ ସଂଶୋଧନ (Correction)',
        '✓ ବ୍ୟାଙ୍କ ଖାତା ସହିତ ଆଧାର ମ୍ୟାପିଂ ସହାୟତା',
        '✓ ପଞ୍ଜୀକରଣ ରସିଦ୍ ଓ ସୁଭଦ୍ରା ଆଇଡି ପ୍ରିଣ୍ଟ'
      ];

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 30px sans-serif';
      bulletPoints.forEach((text, i) => {
        ctx.fillText(text, 130, 520 + (i * 70));
      });

      // Special highlight banner
      ctx.fillStyle = '#fef3c7';
      ctx.roundRect(120, 980, 960, 130, 16);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ଆବଶ୍ୟକୀୟ ଡକ୍ୟୁମେଣ୍ଟ : ଆଧାର କାର୍ଡ, ବ୍ୟାଙ୍କ ପାସବୁକ୍ ଓ ମୋବାଇଲ୍ ନମ୍ବର', 600, 1035);
      ctx.fillText('ଆଜି ହିଁ ଆସି ନିଜର ଆବେଦନ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ !', 600, 1080);

    } else if (template === 'pan') {
      // PAN Blue gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1600);
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.5, '#0c4a6e');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1600);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 12;
      ctx.strokeRect(24, 24, 1152, 1552);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INSTANT PAN CARD SERVICE', 600, 180);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ମାତ୍ର ୨ ଘଣ୍ଟାରେ ଇ-ପ୍ୟାନ୍ ଓ ଘରେ ପହଞ୍ଚିବ PVC କାର୍ଡ', 600, 250);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(80, 340, 1040, 820, 24);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0369a1';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('ପ୍ୟାନ୍ କାର୍ଡ ସେବା ସମୂହ :', 130, 420);

      const points = [
        '✓ ନୂଆ ପ୍ୟାନ୍ କାର୍ଡ ଆବେଦନ (New PAN Card Apply)',
        '✓ ନାମ, ଜନ୍ମ ତାରିଖ ଓ ବାପାଙ୍କ ନାମ ସଂଶୋଧନ (Correction)',
        '✓ ନାବାଳକ / Minor PAN Card ଆବେଦନ',
        '✓ ହଜିଯାଇଥିବା ପ୍ୟାନ୍ କାର୍ଡ ପୁନଃ ପ୍ରିଣ୍ଟ (Duplicate PAN)',
        '✓ ଆଧାର କାର୍ଡ ସହିତ ପ୍ୟାନ୍ ଲିଙ୍କ୍ (Aadhaar-PAN Link)',
        '✓ ଫିଙ୍ଗରପ୍ରିଣ୍ଟ ବା ଓଟିପି ଦ୍ୱାରା ୨ ଘଣ୍ଟାରେ E-PAN'
      ];

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 30px sans-serif';
      points.forEach((t, i) => {
        ctx.fillText(t, 130, 510 + (i * 72));
      });

    } else {
      // AEPS Banking Green
      const grad = ctx.createLinearGradient(0, 0, 0, 1600);
      grad.addColorStop(0, '#065f46');
      grad.addColorStop(0.5, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1600);

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 12;
      ctx.strokeRect(24, 24, 1152, 1552);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DIGI SEVA BANKING POINT', 600, 180);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ଆଧାର ଦ୍ୱାରା ଯେକୌଣସି ବ୍ୟାଙ୍କରୁ ଟଙ୍କା ଉଠାଣ ଓ ଜମା', 600, 250);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(80, 340, 1040, 820, 24);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#065f46';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('ବ୍ୟାଙ୍କିଙ୍ଗ ସେବାସମୂହ :', 130, 420);

      const bPoints = [
        '✓ ଆଧାର ଫିଙ୍ଗରପ୍ରିଣ୍ଟ ମାଧ୍ୟମରେ ତୁରନ୍ତ ଟଙ୍କା ଉଠାଣ (AEPS Cash)',
        '✓ ଯେକୌଣସି ବ୍ୟାଙ୍କ ଖାତାର ବାଲାନ୍ସ ଚେକ୍ ଓ ମିନି ଷ୍ଟେଟମେଣ୍ଟ',
        '✓ ସମସ୍ତ ବ୍ୟାଙ୍କକୁ ତୁରନ୍ତ ଟଙ୍କା ପଠାଣ (Money Transfer)',
        '✓ ପିଏମ କିଷାନ ଓ କାଳିଆ ଯୋଜନା କିସ୍ତି ଟଙ୍କା ଉଠାଣ',
        '✓ ବିଦ୍ୟୁତ୍ ବିଲ୍, ମୋବାଇଲ୍ ରିଚାର୍ଜ ଓ DTH ରିଚାର୍ଜ'
      ];

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 30px sans-serif';
      bPoints.forEach((t, i) => {
        ctx.fillText(t, 130, 520 + (i * 80));
      });
    }

    // Bottom Center Footer Strip with VLE Details
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(80, 1220, 1040, 320, 24);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(shopName.toUpperCase(), 600, 1300);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(`📱 ସମ୍ପର୍କ କରନ୍ତୁ : ${phone}`, 600, 1370);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`📍 ଠିକଣା : ${address}`, 600, 1435);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('ସମୟ : ସକାଳ ୮:୦୦ ରୁ ରାତି ୯:୦୦ ପର୍ଯ୍ୟନ୍ତ ଖୋଲା ରହିବ', 600, 1490);
  },

  downloadPoster() {
    const canvas = document.getElementById('cscPosterCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'CSC_Advertisement_Poster.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast('Advertisement Poster downloaded as High-Res A4 JPG!', 'success');
  },

  printPoster() {
    const canvas = document.getElementById('cscPosterCanvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Please allow popups to print poster directly.', 'warning');
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CSC Advertisement Poster</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    printWin.document.close();
  }
};

window.VUO_CSCTOOLS = VUO_CSCTOOLS;

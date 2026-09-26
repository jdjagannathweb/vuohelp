/**
 * VUO CSC HELP - CSC Bill Maker & Customer Receipt Generator
 * Generates official receipts with VLE details, dynamic line items, auto calculations, UPI QR, multi-page A4 auto-pagination, and PDF/Print export
 */

const VUO_BILLMAKER = {
  items: [],
  billNoCounter: parseInt(localStorage.getItem('vuo_last_bill_no') || '1001', 10),

  init() {
    this.loadSavedShopInfo();
    if (!this._initialized) {
      this.initDefaultItems();
      this.bindEvents();
      this._initialized = true;
    }
    const pendingItem = sessionStorage.getItem('vuo_pending_bill_item');
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        this.items.unshift({ id: Date.now(), name: item.description, qty: item.qty || 1, rate: item.rate || 50 });
        sessionStorage.removeItem('vuo_pending_bill_item');
      } catch(e) {}
    }
    this.renderItemsTable();
    this.updateBillPreview();
  },

  bindEvents() {
    // Save shop info button
    const saveShopBtn = document.getElementById('billSaveShopBtn');
    if (saveShopBtn) {
      saveShopBtn.addEventListener('click', () => this.saveShopInfo());
    }

    // Add Item button
    const addItemBtn = document.getElementById('billAddItemBtn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => this.addNewItem());
    }

    // Live form inputs trigger preview updates
    const inputsToWatch = [
      'billShopName', 'billVleName', 'billCscId', 'billShopPhone', 'billShopAddress', 'billUpiId',
      'billCustomerName', 'billCustomerPhone', 'billCustomerAddress', 'billNo', 'billDate',
      'billDiscount', 'billTax', 'billPaymentMode', 'billPaymentStatus', 'billNotes'
    ];

    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateBillPreview());
      }
    });

    // Populate service preset dropdown
    const presetSelect = document.getElementById('billServicePreset');
    if (presetSelect) {
      presetSelect.innerHTML = '<option value="">-- Add Standard CSC Service (ଚୟନ କରନ୍ତୁ) --</option>';
      if (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.billServices)) {
        VUO_DATA.billServices.forEach(s => {
          const opt = document.createElement('option');
          opt.value = JSON.stringify(s);
          opt.textContent = `${s.name} (₹${s.rate})`;
          presetSelect.appendChild(opt);
        });
      }

      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          try {
            const service = JSON.parse(e.target.value);
            this.addNewItem(service.name, 1, service.rate);
            e.target.value = '';
          } catch(err) {}
        }
      });
    }
  },

  loadSavedShopInfo() {
    const user = typeof VUO_AUTH !== 'undefined' ? VUO_AUTH.getCurrentUser() : null;
    const savedShop = localStorage.getItem('vuo_saved_shop_info');

    let shopData = {
      shopName: "VUO CSC HELP DIGITAL SEVA KENDRA",
      vleName: user ? (user.fullName || user.name) : "Jagannath Mohanty",
      cscId: user ? user.cscId : "782910482910",
      phone: user ? (user.mobile || user.phone) : "9937037131",
      address: user ? `${user.gp || ''}, ${user.block || ''}, ${user.district || 'Puri, Odisha'}` : "Satyabadi, Puri, Odisha",
      upiId: "9937037131@upi"
    };

    if (savedShop) {
      try {
        shopData = { ...shopData, ...JSON.parse(savedShop) };
      } catch (e) {}
    }

    // Set input values
    if (document.getElementById('billShopName')) document.getElementById('billShopName').value = shopData.shopName;
    if (document.getElementById('billVleName')) document.getElementById('billVleName').value = shopData.vleName;
    if (document.getElementById('billCscId')) document.getElementById('billCscId').value = shopData.cscId;
    if (document.getElementById('billShopPhone')) document.getElementById('billShopPhone').value = shopData.phone;
    if (document.getElementById('billShopAddress')) document.getElementById('billShopAddress').value = shopData.address;
    if (document.getElementById('billUpiId')) document.getElementById('billUpiId').value = shopData.upiId;

    // Set initial Bill Details
    if (document.getElementById('billNo')) document.getElementById('billNo').value = `CSC-${this.billNoCounter}`;
    if (document.getElementById('billDate')) document.getElementById('billDate').value = new Date().toISOString().split('T')[0];
    if (document.getElementById('billCustomerName') && !document.getElementById('billCustomerName').value) {
      document.getElementById('billCustomerName').value = "Ramesh Chandra Das";
    }
    if (document.getElementById('billCustomerPhone') && !document.getElementById('billCustomerPhone').value) {
      document.getElementById('billCustomerPhone').value = "9438012345";
    }
  },

  saveShopInfo() {
    const shopData = {
      shopName: document.getElementById('billShopName')?.value || '',
      vleName: document.getElementById('billVleName')?.value || '',
      cscId: document.getElementById('billCscId')?.value || '',
      phone: document.getElementById('billShopPhone')?.value || '',
      address: document.getElementById('billShopAddress')?.value || '',
      upiId: document.getElementById('billUpiId')?.value || ''
    };
    localStorage.setItem('vuo_saved_shop_info', JSON.stringify(shopData));
    if (typeof showToast === 'function') showToast("Shop information saved successfully for future bills!", "success");
    this.updateBillPreview();
  },

  initDefaultItems() {
    this.items = [
      { id: 1, name: "Aadhaar Card Color PVC Print & Lamination", qty: 2, rate: 50 },
      { id: 2, name: "Subhadra Yojana Online Application", qty: 1, rate: 50 },
      { id: 3, name: "e-District Caste & Income Certificate", qty: 1, rate: 60 }
    ];
  },

  addNewItem(name = "CSC Citizen Service", qty = 1, rate = 50) {
    const newItem = {
      id: Date.now() + Math.random(),
      name,
      qty: parseInt(qty, 10) || 1,
      rate: parseFloat(rate) || 0
    };
    this.items.push(newItem);
    this.renderItemsTable();
    this.updateBillPreview();
  },

  removeItem(index) {
    this.items.splice(index, 1);
    this.renderItemsTable();
    this.updateBillPreview();
  },

  renderItemsTable() {
    const tbody = document.getElementById('billItemsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    this.items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100';
      tr.innerHTML = `
        <td class="py-2 pr-2">
          <input type="text" value="${item.name.replace(/"/g, '&quot;')}" class="w-full text-xs font-medium px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500" 
            onchange="VUO_BILLMAKER.updateItem(${idx}, 'name', this.value)" />
        </td>
        <td class="py-2 px-1 w-20">
          <input type="number" min="1" value="${item.qty}" class="w-full text-xs text-center px-1 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500" 
            onchange="VUO_BILLMAKER.updateItem(${idx}, 'qty', this.value)" />
        </td>
        <td class="py-2 px-1 w-24">
          <input type="number" min="0" value="${item.rate}" class="w-full text-xs text-right px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500" 
            onchange="VUO_BILLMAKER.updateItem(${idx}, 'rate', this.value)" />
        </td>
        <td class="py-2 px-2 w-24 text-xs font-bold text-slate-800 text-right">
          ₹${(item.qty * item.rate).toFixed(2)}
        </td>
        <td class="py-2 pl-1 w-10 text-center">
          <button type="button" onclick="VUO_BILLMAKER.removeItem(${idx})" class="text-rose-500 hover:text-rose-700 p-1" title="Remove Item">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  updateItem(index, key, val) {
    if (!this.items[index]) return;
    if (key === 'qty') this.items[index].qty = parseInt(val, 10) || 1;
    else if (key === 'rate') this.items[index].rate = parseFloat(val) || 0;
    else this.items[index][key] = val;

    this.renderItemsTable();
    this.updateBillPreview();
  },

  /**
   * Intelligently paginates items for A4 pages:
   * - If total items <= 8: single page with full header + all items + totals & QR + footer
   * - If total items > 8:
   *    Page 1: Full Header + Customer strip + Table Header + 10 items + "Continued..." note
   *    Page 2+: Compact header + Customer strip + Table Header + items + Totals/QR on final page
   */
  paginateItems(items) {
    if (!items || items.length === 0) {
      return [{ pageNum: 1, items: [], startIndex: 0 }];
    }
    if (items.length <= 8) {
      return [{ pageNum: 1, items: [...items], startIndex: 0 }];
    }

    const pages = [];
    // Page 1 gets first 10 items
    pages.push({
      pageNum: 1,
      items: items.slice(0, 10),
      startIndex: 0
    });

    let currentOffset = 10;
    let pageCounter = 2;

    while (currentOffset < items.length) {
      const remainingCount = items.length - currentOffset;
      // If remaining items can fit on the final page with Totals & QR (up to 8 items)
      if (remainingCount <= 8) {
        pages.push({
          pageNum: pageCounter,
          items: items.slice(currentOffset),
          startIndex: currentOffset
        });
        break;
      } else {
        // Intermediate page without totals can comfortably fit 12 items
        const sliceCount = Math.min(12, remainingCount);
        pages.push({
          pageNum: pageCounter,
          items: items.slice(currentOffset, currentOffset + sliceCount),
          startIndex: currentOffset
        });
        currentOffset += sliceCount;
        pageCounter++;
      }
    }
    return pages;
  },

  updateBillPreview() {
    const billContainer = document.getElementById('printableBillArea');
    if (!billContainer) return;

    const shopName = document.getElementById('billShopName')?.value || "VUO CSC HELP DIGITAL SEVA KENDRA";
    const vleName = document.getElementById('billVleName')?.value || "Jagannath Mohanty";
    const cscId = document.getElementById('billCscId')?.value || "782910482910";
    const shopPhone = document.getElementById('billShopPhone')?.value || "9937037131";
    const shopAddress = document.getElementById('billShopAddress')?.value || "Satyabadi, Puri, Odisha";
    const upiId = document.getElementById('billUpiId')?.value || "9937037131@upi";

    const customerName = document.getElementById('billCustomerName')?.value || "Valued Customer";
    const customerPhone = document.getElementById('billCustomerPhone')?.value || "-";
    const customerAddress = document.getElementById('billCustomerAddress')?.value || "-";
    const billNo = document.getElementById('billNo')?.value || `CSC-${this.billNoCounter}`;
    const billDate = document.getElementById('billDate')?.value || new Date().toISOString().split('T')[0];

    const discount = parseFloat(document.getElementById('billDiscount')?.value || 0);
    const tax = parseFloat(document.getElementById('billTax')?.value || 0);
    const paymentMode = document.getElementById('billPaymentMode')?.value || "Cash";
    const paymentStatus = document.getElementById('billPaymentStatus')?.value || "PAID";
    const notes = document.getElementById('billNotes')?.value || "Thank you for visiting our Common Services Center! For queries contact VLE.";

    // Calculate totals
    let subtotal = 0;
    this.items.forEach(i => { subtotal += i.qty * i.rate; });
    const grandTotal = Math.max(0, subtotal - discount + tax);
    const totalInWords = `${this.numberToWords(grandTotal)} Rupees Only`;

    // Paginate items across A4 pages
    const pages = this.paginateItems(this.items);
    const totalPages = pages.length;

    // Build HTML for each page
    let htmlContent = '';

    pages.forEach((page, pIdx) => {
      const isFirst = pIdx === 0;
      const isLast = pIdx === totalPages - 1;
      const pageNum = page.pageNum;

      htmlContent += `
        <!-- Page ${pageNum} of ${totalPages} Container -->
        <div class="bill-a4-page bg-white p-7 sm:p-9 rounded-2xl border-2 border-slate-300 shadow-xl text-slate-800 font-sans text-xs space-y-4 my-4 mx-auto max-w-2xl relative" data-page="${pageNum}" data-total-pages="${totalPages}">
      `;

      // Header
      if (isFirst) {
        htmlContent += `
          <!-- Full Header (Page 1) -->
          <div class="flex justify-between items-start border-b-2 border-slate-900 pb-3 bill-header-section">
            <div>
              <h2 class="text-lg font-black text-slate-900 tracking-tight">${shopName}</h2>
              <p class="text-[11px] text-slate-600 mt-0.5">VLE Operator: <span class="font-bold text-slate-900">${vleName}</span></p>
              <p class="text-[11px] text-slate-600">CSC ID: <span class="font-mono font-bold text-sky-800">${cscId}</span></p>
              <p class="text-[11px] text-slate-500 max-w-xs mt-0.5">${shopAddress}</p>
              <p class="text-[11px] text-slate-500">Contact: <span class="font-semibold text-slate-700">${shopPhone}</span></p>
            </div>
            <div class="text-right">
              <div class="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-md shadow-xs mb-1.5 tracking-wide">
                TAX INVOICE / RECEIPT
              </div>
              <p class="text-xs font-bold text-slate-700">Bill No: <span class="font-mono text-sky-700 font-black">${billNo}</span></p>
              <p class="text-[11px] text-slate-500 mt-0.5">Date: <span class="font-medium text-slate-700">${billDate}</span></p>
              <div class="mt-1.5">
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">${paymentStatus}</span>
              </div>
            </div>
          </div>

          <!-- Customer Info Strip -->
          <div class="bg-slate-50/90 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-[11.5px] bill-customer-section">
            <div>
              <span class="text-slate-500 font-medium">Customer Name: </span>
              <strong class="text-slate-900 font-bold ml-1">${customerName}</strong>
            </div>
            <div>
              <span class="text-slate-500 font-medium">Mobile: </span>
              <span class="font-mono font-bold text-slate-800 ml-1">${customerPhone}</span>
            </div>
          </div>
        `;
      } else {
        htmlContent += `
          <!-- Continuation Header (Page ${pageNum}) -->
          <div class="flex justify-between items-center border-b-2 border-slate-900 pb-3 bill-header-section">
            <div>
              <h3 class="text-sm font-black text-slate-900 tracking-tight">${shopName}</h3>
              <p class="text-[10.5px] text-slate-500">CSC ID: <strong class="text-sky-800 font-mono">${cscId}</strong> • VLE: <span class="font-bold text-slate-800">${vleName}</span></p>
            </div>
            <div class="text-right">
              <div class="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-black text-[10px] rounded mb-0.5">
                TAX INVOICE (CONTINUED)
              </div>
              <p class="text-[11px] font-bold text-slate-700">Bill No: <span class="font-mono text-sky-700 font-black">${billNo}</span> • <span class="text-slate-500">${billDate}</span></p>
            </div>
          </div>

          <!-- Compact Customer Bar -->
          <div class="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] flex justify-between items-center bill-customer-section">
            <span>Customer: <strong class="text-slate-900">${customerName}</strong></span>
            <span>Mobile: <span class="font-mono text-slate-800">${customerPhone}</span></span>
          </div>
        `;
      }

      // Items Table for this Page
      htmlContent += `
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-800 text-[11px] font-black border-y-2 border-slate-300 uppercase tracking-wider">
              <th class="py-2 px-2 text-center w-9">#</th>
              <th class="py-2 px-2">Service Description</th>
              <th class="py-2 px-2 text-center w-14">Qty</th>
              <th class="py-2 px-2 text-right w-24">Rate</th>
              <th class="py-2 px-2 text-right w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
      `;

      page.items.forEach((item, rowIdx) => {
        const globalRowIdx = page.startIndex + rowIdx + 1;
        const zebra = (rowIdx % 2 === 1) ? 'bg-slate-50/70' : 'bg-white';
        htmlContent += `
          <tr class="border-b border-slate-200 text-xs ${zebra}">
            <td class="py-2 px-2 text-center text-slate-500 font-medium">${globalRowIdx}</td>
            <td class="py-2 px-2 text-slate-800 font-semibold leading-relaxed">${item.name}</td>
            <td class="py-2 px-2 text-center text-slate-700 font-mono">${item.qty}</td>
            <td class="py-2 px-2 text-right text-slate-700 font-mono">₹${item.rate.toFixed(2)}</td>
            <td class="py-2 px-2 text-right text-slate-900 font-mono font-bold">₹${(item.qty * item.rate).toFixed(2)}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;

      // If this is the LAST page, show Totals, QR, Words, Notes & Signatory
      if (isLast) {
        htmlContent += `
          <!-- Totals & Payment QR -->
          <div class="flex justify-between items-end pt-3 border-t-2 border-slate-200 bill-totals-section">
            <div class="flex items-center gap-3.5">
              <canvas id="prevUpiQrCanvas" class="w-20 h-20 border border-slate-300 rounded-lg p-1 bg-white shadow-xs"></canvas>
              <div class="text-[10.5px] text-slate-500 space-y-0.5">
                <p class="font-bold text-slate-800 flex items-center gap-1">
                  <i class="fa-solid fa-qrcode text-sky-600"></i> Scan to Pay via UPI
                </p>
                <p class="text-slate-400">GooglePay / PhonePe / Paytm / BHIM</p>
                <p>Mode: <strong class="text-slate-800 uppercase font-bold">${paymentMode}</strong></p>
              </div>
            </div>

            <div class="w-56 space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span class="font-mono font-semibold">₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span class="font-mono font-semibold text-rose-600">₹${discount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Tax / Fee:</span>
                <span class="font-mono font-semibold">₹${tax.toFixed(2)}</span>
              </div>
              <div class="flex justify-between font-black text-sm text-slate-900 pt-2 border-t-2 border-slate-900">
                <span>Total Amount:</span>
                <span class="text-sky-700 font-mono text-base font-black">₹${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="text-[10.5px] text-slate-600 italic pt-2 border-t border-slate-200 bill-words-section">
            Amount in Words: <strong class="text-slate-900 font-bold not-italic">${totalInWords}</strong>
          </div>

          <!-- Footer note & Signature -->
          <div class="flex justify-between items-end pt-4 text-[10.5px] text-slate-500 bill-footer-section">
            <div>
              <p class="font-medium text-slate-700">${notes}</p>
              <p class="mt-0.5 text-[10px] text-slate-400">Official Computer-Generated Receipt • VUO CSC Help • Page ${pageNum} of ${totalPages}</p>
            </div>
            <div class="text-center">
              <div class="w-32 border-b-2 border-slate-700 mb-1"></div>
              <p class="font-bold text-slate-900 text-xs">Authorized Signatory</p>
              <p class="text-[9px] text-slate-400">(${shopName})</p>
            </div>
          </div>
        `;
      } else {
        // Intermediate Page Footer
        htmlContent += `
          <div class="flex justify-between items-center pt-3 text-[10.5px] text-slate-500 border-t-2 border-slate-200">
            <span class="italic text-slate-600 font-medium">Continued on Page ${pageNum + 1}...</span>
            <span class="font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-mono">Page ${pageNum} of ${totalPages}</span>
          </div>
        `;
      }

      htmlContent += `
        </div>
      `;
    });

    billContainer.innerHTML = htmlContent;

    // Render UPI QR Code on the canvas in the last page
    this.renderUpiQr(upiId, grandTotal, shopName);
  },

  renderUpiQr(upiId, amount, shopName) {
    const qrCanvas = document.getElementById('prevUpiQrCanvas');
    if (!qrCanvas) return;

    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${amount.toFixed(2)}&cu=INR`;
    
    if (window.QRious) {
      try {
        new QRious({
          element: qrCanvas,
          value: upiUri,
          size: 90,
          level: 'M'
        });
      } catch(e) {}
    }
  },

  numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    num = Math.floor(num);
    if (num === 0) return 'Zero';

    function inWords(n) {
      if (n < 20) return a[n];
      const digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 === 0 ? '' : 'and ' + inWords(n % 100));
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 === 0 ? '' : inWords(n % 1000));
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 === 0 ? '' : inWords(n % 100000));
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 === 0 ? '' : inWords(n % 10000000));
    }

    return inWords(num).trim();
  },

  printBill() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'CSC Cash Receipt / Bill Print', category: 'bill' }, () => this._doPrintBill());
    }
    this._doPrintBill();
  },

  _doPrintBill() {
    window.print();

    // Increment bill counter
    this.billNoCounter++;
    localStorage.setItem('vuo_last_bill_no', this.billNoCounter.toString());
    const billNoEl = document.getElementById('billNo');
    if (billNoEl) billNoEl.value = `CSC-${this.billNoCounter}`;
  },

  downloadPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'CSC Cash Receipt (PDF)', category: 'bill' }, () => this._doDownloadPdf());
    }
    this._doDownloadPdf();
  },

  /**
   * High-Fidelity Multi-Page PDF Exporter:
   * Accurately captures every .bill-a4-page container with html2canvas and embeds each onto its own A4 page in jsPDF.
   * Completely avoids cutting rows or text across page boundaries.
   * Includes robust fallbacks if jsPDF or html2canvas takes time to load.
   */
  async _doDownloadPdf() {
    const billContainer = document.getElementById('printableBillArea');
    if (!billContainer) return;

    const pageElements = billContainer.querySelectorAll('.bill-a4-page');
    if (!pageElements || pageElements.length === 0) {
      if (typeof showToast === 'function') showToast("No bill pages found to export.", "error");
      return;
    }

    // Helper to resolve jsPDF constructor across different UMD/global builds
    const getJsPDF = () => {
      if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
      if (typeof window.jsPDF === 'function') return window.jsPDF;
      if (typeof jsPDF === 'function') return jsPDF;
      return null;
    };

    // Helper to dynamically load external script if missing
    const loadScript = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    if (!window.html2canvas) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      } catch (e) {}
    }

    let JsPDFClass = getJsPDF();
    if (!JsPDFClass) {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        JsPDFClass = getJsPDF();
      } catch (e) {}
    }

    if (!window.html2canvas || !JsPDFClass) {
      if (typeof showToast === 'function') {
        showToast("PDF direct generator loading... Opening browser print (Save as PDF).", "info");
      }
      window.print();
      return;
    }

    const billNo = document.getElementById('billNo')?.value || 'Receipt';
    const totalPages = pageElements.length;

    if (typeof showToast === 'function') {
      showToast(`Generating ${totalPages} Page A4 PDF Bill... Kripya intezar karein.`, "info");
    }

    try {
      const pdf = new JsPDFClass({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfPageWidth = 210;
      const pdfPageHeight = 297;
      const margin = 6; // 6mm margin for clean printable borders
      const printWidth = pdfPageWidth - (margin * 2); // 198mm

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        const canvas = await window.html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const mmPerPx = printWidth / canvas.width;
        const printHeight = Math.min(canvas.height * mmPerPx, pdfPageHeight - (margin * 2));

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight);
      }

      // Download PDF
      try {
        pdf.save(`CSC_Bill_${billNo}.pdf`);
      } catch (saveErr) {
        // Fallback for strict browser environments via Blob URL
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const dlLink = document.createElement('a');
        dlLink.href = blobUrl;
        dlLink.download = `CSC_Bill_${billNo}.pdf`;
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }

      if (typeof showToast === 'function') {
        showToast(`PDF Bill downloaded successfully (${totalPages} Page${totalPages > 1 ? 's' : ''})!`, "success");
      }

      // Increment bill counter after successful export
      this.billNoCounter++;
      localStorage.setItem('vuo_last_bill_no', this.billNoCounter.toString());
      const billNoEl = document.getElementById('billNo');
      if (billNoEl) billNoEl.value = `CSC-${this.billNoCounter}`;

    } catch (err) {
      console.error("PDF generation error:", err);
      if (typeof showToast === 'function') {
        showToast("Direct PDF download me dikkat aayi. Browser Print khula ja raha hai (Save as PDF karein).", "info");
      }
      window.print();
    }
  },

  downloadImage() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'CSC Cash Receipt (PNG Image)', category: 'bill' }, () => this._doDownloadImage());
    }
    this._doDownloadImage();
  },

  _doDownloadImage() {
    const billContainer = document.getElementById('printableBillArea');
    if (!billContainer || !window.html2canvas) return;

    const firstPage = billContainer.querySelector('.bill-a4-page') || billContainer;

    window.html2canvas(firstPage, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
      const link = document.createElement('a');
      const billNo = document.getElementById('billNo')?.value || 'Receipt';
      link.download = `CSC_Bill_${billNo}_Page1.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (typeof showToast === 'function') showToast("Bill image downloaded successfully!", "success");
    });
  }
};

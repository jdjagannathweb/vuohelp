/**
 * VUO CSC HELP - PDF Tools Suite
 * Powered by pdf-lib and jsPDF for 100% client-side, secure PDF processing
 */

const VUO_PDFTOOLS = {
  activeTab: 'imgToPdf',
  imgFilesList: [],
  mergeFilesList: [],

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.pdf-tool-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-pdf-tab');
        this.switchTab(tab);
      });
    });

    // 1. Image to PDF Upload
    const imgToPdfInput = document.getElementById('imgToPdfInput');
    if (imgToPdfInput) {
      imgToPdfInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          Array.from(e.target.files).forEach(file => {
            if (file.type.startsWith('image/')) {
              this.imgFilesList.push(file);
            }
          });
          this.renderImgToPdfList();
        }
      });
    }

    // 2. PDF Merge Upload
    const pdfMergeInput = document.getElementById('pdfMergeInput');
    if (pdfMergeInput) {
      pdfMergeInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          Array.from(e.target.files).forEach(file => {
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
              this.mergeFilesList.push(file);
            }
          });
          this.renderPdfMergeList();
        }
      });
    }

    // 3. PDF Split Upload
    const pdfSplitInput = document.getElementById('pdfSplitInput');
    if (pdfSplitInput) {
      pdfSplitInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadPdfForSplit(e.target.files[0]);
        }
      });
    }

    // 4. PDF Watermark Upload
    const pdfWatermarkInput = document.getElementById('pdfWatermarkInput');
    
    // 5. Word / Text File Input
    const wordFileInput = document.getElementById('wordFileInput');
    if (wordFileInput) {
      wordFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleWordFileUpload(e.target.files[0]);
        }
      });
    }

    const wordTitleInput = document.getElementById('wordDocTitle');
    const wordBodyInput = document.getElementById('wordDocContent');
    if (wordTitleInput) {
      wordTitleInput.addEventListener('input', () => this.updateWordDocPreview());
    }
    if (wordBodyInput) {
      wordBodyInput.addEventListener('input', () => this.updateWordDocPreview());
    }

    // 6. PDF Editor Upload
    const pdfEditorInput = document.getElementById('pdfEditorInput');
    if (pdfEditorInput) {
      pdfEditorInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.editorPdfFile = e.target.files[0];
          const notice = document.getElementById('pdfEditorNotice');
          if (notice) {
            notice.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-file-circle-check text-2xl mb-1 block"></i>Ready: ${e.target.files[0].name} (${(e.target.files[0].size/1024).toFixed(1)} KB)</span>`;
          }
          showToast(`PDF loaded: ${e.target.files[0].name}`, 'info');
        }
      });
    }
    if (pdfWatermarkInput) {
      pdfWatermarkInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadPdfForWatermark(e.target.files[0]);
        }
      });
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.pdf-tool-tab').forEach(btn => {
      if (btn.getAttribute('data-pdf-tab') === tabName) {
        btn.className = 'pdf-tool-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 text-white shadow-sm';
      } else {
        btn.className = 'pdf-tool-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100';
      }
    });

    document.querySelectorAll('.pdf-tool-pane').forEach(pane => {
      if (pane.id === `pdf_pane_${tabName}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });
  },

  // ---------------- 1. JPG/PNG TO PDF ---------------- //
  renderImgToPdfList() {
    const listContainer = document.getElementById('imgToPdfList');
    const actionArea = document.getElementById('imgToPdfActions');
    if (!listContainer) return;

    if (this.imgFilesList.length === 0) {
      listContainer.innerHTML = '';
      if (actionArea) actionArea.classList.add('hidden');
      return;
    }

    if (actionArea) actionArea.classList.remove('hidden');
    listContainer.innerHTML = '';

    this.imgFilesList.forEach((file, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        itemEl.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 flex items-center justify-center bg-sky-100 text-sky-800 font-bold text-xs rounded-full">${idx + 1}</span>
            <img src="${e.target.result}" class="w-12 h-12 object-cover rounded border border-slate-200" />
            <div>
              <p class="text-xs font-semibold text-slate-800 max-w-[200px] truncate">${file.name}</p>
              <p class="text-[11px] text-slate-500">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            ${idx > 0 ? `<button onclick="VUO_PDFTOOLS.moveImg(${idx}, -1)" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs">▲</button>` : ''}
            ${idx < this.imgFilesList.length - 1 ? `<button onclick="VUO_PDFTOOLS.moveImg(${idx}, 1)" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs">▼</button>` : ''}
            <button onclick="VUO_PDFTOOLS.removeImg(${idx})" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `;
      };
      reader.readAsDataURL(file);
      listContainer.appendChild(itemEl);
    });
  },

  moveImg(index, dir) {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= this.imgFilesList.length) return;
    const temp = this.imgFilesList[index];
    this.imgFilesList[index] = this.imgFilesList[targetIdx];
    this.imgFilesList[targetIdx] = temp;
    this.renderImgToPdfList();
  },

  removeImg(index) {
    this.imgFilesList.splice(index, 1);
    this.renderImgToPdfList();
  },

  generateImagesToPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Images to PDF Document', category: 'pdf' }, () => this._doGenerateImagesToPdf());
    }
    this._doGenerateImagesToPdf();
  },

  async _doGenerateImagesToPdf() {
    if (this.imgFilesList.length === 0) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("PDF library loading, please try again in a moment.", "info");
      return;
    }

    showToast("Generating combined PDF...", "info");
    const { jsPDF } = window.jspdf;
    const orientation = document.getElementById('imgToPdfOrientation')?.value || 'p';
    const marginType = document.getElementById('imgToPdfMargin')?.value || 'small';

    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let margin = 10;
    if (marginType === 'none') margin = 0;
    else if (marginType === 'normal') margin = 20;

    for (let i = 0; i < this.imgFilesList.length; i++) {
      if (i > 0) pdf.addPage();
      const file = this.imgFilesList[i];
      const dataUrl = await this.readFileAsDataUrl(file);

      const img = new Image();
      await new Promise(resolve => { img.onload = resolve; img.src = dataUrl; });

      const printableWidth = pageWidth - (margin * 2);
      const printableHeight = pageHeight - (margin * 2);

      const hRatio = printableWidth / img.naturalWidth;
      const vRatio = printableHeight / img.naturalHeight;
      const ratio = Math.min(hRatio, vRatio);

      const drawW = img.naturalWidth * ratio;
      const drawH = img.naturalHeight * ratio;
      const drawX = margin + (printableWidth - drawW) / 2;
      const drawY = margin + (printableHeight - drawH) / 2;

      pdf.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
    }

    pdf.save(`VUO_Combined_Images_${Date.now()}.pdf`);
    showToast("PDF document generated and downloaded!", "success");
  },

  readFileAsDataUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  },

  // ---------------- 2. PDF MERGE ---------------- //
  renderPdfMergeList() {
    const listContainer = document.getElementById('pdfMergeList');
    const actionArea = document.getElementById('pdfMergeActions');
    if (!listContainer) return;

    if (this.mergeFilesList.length === 0) {
      listContainer.innerHTML = '';
      if (actionArea) actionArea.classList.add('hidden');
      return;
    }

    if (actionArea) actionArea.classList.remove('hidden');
    listContainer.innerHTML = '';

    this.mergeFilesList.forEach((file, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm';
      itemEl.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 flex items-center justify-center bg-rose-100 text-rose-800 font-bold text-xs rounded-full">${idx + 1}</span>
          <svg class="w-7 h-7 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path></svg>
          <div>
            <p class="text-xs font-semibold text-slate-800 max-w-[220px] truncate">${file.name}</p>
            <p class="text-[11px] text-slate-500">${(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          ${idx > 0 ? `<button onclick="VUO_PDFTOOLS.moveMergePdf(${idx}, -1)" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs">▲</button>` : ''}
          ${idx < this.mergeFilesList.length - 1 ? `<button onclick="VUO_PDFTOOLS.moveMergePdf(${idx}, 1)" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs">▼</button>` : ''}
          <button onclick="VUO_PDFTOOLS.removeMergePdf(${idx})" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
      listContainer.appendChild(itemEl);
    });
  },

  moveMergePdf(index, dir) {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= this.mergeFilesList.length) return;
    const temp = this.mergeFilesList[index];
    this.mergeFilesList[index] = this.mergeFilesList[targetIdx];
    this.mergeFilesList[targetIdx] = temp;
    this.renderPdfMergeList();
  },

  removeMergePdf(index) {
    this.mergeFilesList.splice(index, 1);
    this.renderPdfMergeList();
  },

  executePdfMerge() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Merged PDF Document', category: 'pdf' }, () => this._doExecutePdfMerge());
    }
    this._doExecutePdfMerge();
  },

  async _doExecutePdfMerge() {
    if (this.mergeFilesList.length < 2) {
      showToast("Please upload at least 2 PDF files to merge.", "warning");
      return;
    }

    if (!window.PDFLib) {
      showToast("PDF engine loading...", "info");
      return;
    }

    try {
      showToast("Merging PDF files...", "info");
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const file of this.mergeFilesList) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `VUO_Merged_Doc_${Date.now()}.pdf`;
      link.click();
      showToast("Merged PDF created and downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Error merging PDF files. Please ensure files are valid.", "error");
    }
  },

  // ---------------- 3. PDF SPLIT & PAGE EXTRACTOR ---------------- //
  async loadPdfForSplit(file) {
    this._splitFile = file;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = window.PDFLib;
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      document.getElementById('splitFileName').textContent = file.name;
      document.getElementById('splitTotalPages').textContent = `${totalPages} Pages`;
      document.getElementById('splitPageRange').placeholder = `e.g. 1-${Math.min(totalPages, 3)}, ${totalPages}`;
      document.getElementById('splitWorkspace').classList.remove('hidden');
      document.getElementById('splitDropZone').classList.add('hidden');
      this._splitDocPages = totalPages;
    } catch (e) {
      showToast("Could not read PDF. Make sure it is not password protected.", "error");
    }
  },

  executePdfSplit() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Split / Extracted PDF Pages', category: 'pdf' }, () => this._doExecutePdfSplit());
    }
    this._doExecutePdfSplit();
  },

  async _doExecutePdfSplit() {
    if (!this._splitFile || !window.PDFLib) return;

    const rangeStr = document.getElementById('splitPageRange').value.trim();
    if (!rangeStr) {
      showToast("Please enter page numbers or range to extract (e.g. 1-2, 4).", "warning");
      return;
    }

    try {
      const { PDFDocument } = window.PDFLib;
      const arrayBuffer = await this._splitFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      // Parse page ranges e.g. "1-3, 5" -> [0, 1, 2, 4]
      const totalPages = srcDoc.getPageCount();
      const pageIndices = new Set();

      rangeStr.split(',').forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(p => parseInt(p.trim(), 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
              pageIndices.add(i - 1);
            }
          }
        } else {
          const pageNum = parseInt(part, 10);
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            pageIndices.add(pageNum - 1);
          }
        }
      });

      if (pageIndices.size === 0) {
        showToast("No valid page numbers found in specified range.", "error");
        return;
      }

      const indicesArr = Array.from(pageIndices).sort((a, b) => a - b);
      const copiedPages = await newDoc.copyPages(srcDoc, indicesArr);
      copiedPages.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `VUO_Extracted_Pages_${Date.now()}.pdf`;
      link.click();
      showToast(`Extracted ${indicesArr.length} pages to new PDF!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Error extracting pages.", "error");
    }
  },

  // ---------------- 4. PDF WATERMARK ---------------- //
  async loadPdfForWatermark(file) {
    this._watermarkFile = file;
    document.getElementById('watermarkFileName').textContent = file.name;
    document.getElementById('watermarkWorkspace').classList.remove('hidden');
    document.getElementById('watermarkDropZone').classList.add('hidden');
  },

  executePdfWatermark() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Watermarked & Sealed PDF', category: 'pdf' }, () => this._doExecutePdfWatermark());
    }
    this._doExecutePdfWatermark();
  },

  async _doExecutePdfWatermark() {
    if (!this._watermarkFile || !window.PDFLib) return;

    const text = document.getElementById('watermarkText').value.trim() || "VUO CSC HELP";
    const opacity = parseFloat(document.getElementById('watermarkOpacity').value) || 0.3;

    try {
      showToast("Applying watermark...", "info");
      const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
      const arrayBuffer = await this._watermarkFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 10;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textHeight / 2,
          size: fontSize,
          font: font,
          color: rgb(0.1, 0.5, 0.8),
          opacity: opacity,
          rotate: degrees(45)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `VUO_Watermarked_${Date.now()}.pdf`;
      link.click();
      showToast("Watermark applied successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error adding watermark.", "error");
    }
  },

  editorPdfFile: null,

  handleWordFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const titleInput = document.getElementById('wordDocTitle');
      const bodyInput = document.getElementById('wordDocContent');
      if (titleInput && !titleInput.value) {
        titleInput.value = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      if (bodyInput) {
        bodyInput.value = text;
      }
      this.updateWordDocPreview();
      showToast(`Document "${file.name}" loaded successfully!`, 'success');
    };
    reader.readAsText(file);
  },

  updateWordDocPreview() {
    const title = document.getElementById('wordDocTitle')?.value || 'APPLICATION / DOCUMENT TITLE';
    const body = document.getElementById('wordDocContent')?.value || 'Preview of your document formatted cleanly with A4 margins will appear here in real time...';

    const pTitle = document.getElementById('prevDocTitle');
    const pBody = document.getElementById('prevDocBody');
    if (pTitle) pTitle.textContent = title;
    if (pBody) pBody.textContent = body;
  },

  generateWordToPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Word to Printable A4 PDF', category: 'pdf' }, () => this._doGenerateWordToPdf());
    }
    this._doGenerateWordToPdf();
  },

  _doGenerateWordToPdf() {
    const title = document.getElementById('wordDocTitle')?.value.trim() || 'Document';
    const content = document.getElementById('wordDocContent')?.value.trim();

    if (!content) {
      showToast('Kripya document text likhiye ya file upload karein!', 'warning');
      return;
    }

    if (!window.jspdf) {
      showToast('PDF generator loading, please wait...', 'info');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Margins (15mm top/bottom, 15mm left/right)
    const margin = 15;
    const pageWidth = 210;
    const maxLineWidth = pageWidth - (2 * margin);

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title.toUpperCase(), pageWidth / 2, 22, { align: 'center' });

    // Underline
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(margin, 26, pageWidth - margin, 26);

    // Body Text with auto line wrap
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const splitText = doc.splitTextToSize(content, maxLineWidth);
    let cursorY = 36;
    const pageHeight = 297;

    for (let i = 0; i < splitText.length; i++) {
      if (cursorY > pageHeight - margin - 15) {
        doc.addPage();
        cursorY = 25;
      }
      doc.text(splitText[i], margin, cursorY);
      cursorY += 7;
    }

    // Footer signature / date
    if (cursorY > pageHeight - 35) {
      doc.addPage();
      cursorY = 30;
    }
    cursorY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, margin, cursorY);
    doc.text('Authorized Signature', pageWidth - margin - 40, cursorY);

    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeTitle}.pdf`);
    showToast('Word / Text document converted to A4 PDF successfully!', 'success');
  },

  executePdfEditorStamp() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Signed & Stamped PDF Document', category: 'pdf' }, () => this._doExecutePdfEditorStamp());
    }
    this._doExecutePdfEditorStamp();
  },

  async _doExecutePdfEditorStamp() {
    if (!this.editorPdfFile) {
      showToast('Kripya pehle PDF file upload karein!', 'warning');
      return;
    }

    if (!window.PDFLib) {
      showToast('PDF engine loading, please try again.', 'info');
      return;
    }

    showToast('Applying seal & stamp annotation...', 'info');

    try {
      const fileBytes = await this.editorPdfFile.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      const stampType = document.getElementById('pdfEditorStampType')?.value || 'verified';
      const customText = document.getElementById('pdfEditorCustomText')?.value || 'Verified by CSC Odisha VLE Desk';
      const colorVal = document.getElementById('pdfEditorColor')?.value || 'blue';
      const posVal = document.getElementById('pdfEditorPosition')?.value || 'bottom_right';

      let stampColor = PDFLib.rgb(0.01, 0.4, 0.8); // blue
      if (colorVal === 'red') stampColor = PDFLib.rgb(0.85, 0.1, 0.1);
      if (colorVal === 'green') stampColor = PDFLib.rgb(0.05, 0.6, 0.2);

      let x = width - 210;
      let y = 30;

      if (posVal === 'bottom_left') {
        x = 30; y = 30;
      } else if (posVal === 'top_right') {
        x = width - 210; y = height - 80;
      } else if (posVal === 'center') {
        x = (width / 2) - 100; y = (height / 2) - 30;
      }

      // Draw Stamp Box on First Page
      firstPage.drawRectangle({
        x: x,
        y: y,
        width: 190,
        height: 52,
        borderColor: stampColor,
        borderWidth: 2,
        color: PDFLib.rgb(1, 1, 1),
        opacity: 0.95
      });

      const stampHeaders = {
        verified: 'VERIFIED & ATTESTED',
        approved: 'APPROVED & SUBMITTED',
        received: 'RECEIVED & PROCESSED',
        custom: 'OFFICIAL CSC SEAL'
      };

      const header = stampHeaders[stampType] || 'VERIFIED';
      firstPage.drawText(header, {
        x: x + 10,
        y: y + 34,
        size: 11,
        color: stampColor
      });

      firstPage.drawText(customText.substring(0, 32), {
        x: x + 10,
        y: y + 18,
        size: 8.5,
        color: PDFLib.rgb(0.2, 0.2, 0.2)
      });

      firstPage.drawText(`Date: ${new Date().toLocaleDateString('en-GB')} • Odisha VLE`, {
        x: x + 10,
        y: y + 6,
        size: 7.5,
        color: PDFLib.rgb(0.4, 0.4, 0.4)
      });

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Stamped_${this.editorPdfFile.name}`;
      link.click();

      showToast('Stamped & Verified PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error stamping PDF document.', 'error');
    }
  },

  loadSampleImages() {
    const createDocCanvas = (title, subtitle, bgColor) => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 600, 800);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(40, 40, 520, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 300, 85);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(subtitle, 300, 200);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('Government of Odisha Citizen Document Scan', 300, 240);
      ctx.fillText('Processed with VLE HELP DESK PDF Suite', 300, 270);
      return canvas;
    };

    const c1 = createDocCanvas('DOCUMENT SCAN - PAGE 1', 'Subhadra Yojana / Citizen Record', '#f8fafc');
    const c2 = createDocCanvas('DOCUMENT SCAN - PAGE 2', 'Identity & Address Verification', '#f1f5f9');

    c1.toBlob((blob1) => {
      const f1 = new File([blob1], 'Document_Page_1_Sample.jpg', { type: 'image/jpeg' });
      this.imgFilesList.push(f1);
      c2.toBlob((blob2) => {
        const f2 = new File([blob2], 'Document_Page_2_Sample.jpg', { type: 'image/jpeg' });
        this.imgFilesList.push(f2);
        this.renderImgToPdfList();
        showToast("2 Sample Document Scans Loaded! Click 'Generate Combined PDF'", "success");
      }, 'image/jpeg', 0.9);
    }, 'image/jpeg', 0.9);
  }
};

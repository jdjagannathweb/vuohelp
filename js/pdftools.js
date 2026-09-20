/**
 * VUO CSC HELP - PDF Tools Suite
 * Powered by pdf-lib and jsPDF for 100% client-side, secure PDF processing
 */
if (typeof window.showToast !== 'function') {
  window.showToast = function(msg, type = 'info') {
    console.log(`[Toast ${type}]:`, msg);
  };
}

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
          this.loadPdfForEditor(e.target.files[0]);
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
    const compressMode = document.getElementById('imgToPdfCompression')?.value || 'portal_200';

    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let margin = 10;
    if (marginType === 'none') margin = 0;
    else if (marginType === 'normal') margin = 20;

    const numFiles = this.imgFilesList.length;
    // Calculate JPEG quality and max dimension based on compression mode
    let maxDim = 2000;
    let quality = 0.85;

    if (compressMode === 'portal_200') {
      // Odisha e-District / Subhadra upload limit < 200 KB
      maxDim = numFiles > 2 ? 1000 : 1200;
      quality = numFiles > 2 ? 0.55 : 0.65;
    } else if (compressMode === 'portal_100') {
      // Ultra strict < 100 KB
      maxDim = 900;
      quality = 0.45;
    }

    for (let i = 0; i < numFiles; i++) {
      if (i > 0) pdf.addPage();
      const file = this.imgFilesList[i];
      const dataUrl = await this.readFileAsDataUrl(file);

      const img = new Image();
      await new Promise(resolve => { img.onload = resolve; img.src = dataUrl; });

      // Resize & compress via offscreen canvas
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        const s = maxDim / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      const printableWidth = pageWidth - (margin * 2);
      const printableHeight = pageHeight - (margin * 2);

      const hRatio = printableWidth / w;
      const vRatio = printableHeight / h;
      const ratio = Math.min(hRatio, vRatio);

      const drawW = w * ratio;
      const drawH = h * ratio;
      const drawX = margin + (printableWidth - drawW) / 2;
      const drawY = margin + (printableHeight - drawH) / 2;

      pdf.addImage(compressedDataUrl, 'JPEG', drawX, drawY, drawW, drawH);
    }

    const pdfBlob = pdf.output('blob');
    const sizeKb = (pdfBlob.size / 1024).toFixed(1);

    pdf.save(`VUO_Combined_Images_${Date.now()}.pdf`);

    if (compressMode === 'portal_200') {
      showToast(`Combined PDF generated: ${sizeKb} KB (Government Portal Ready < 200 KB)!`, 'success');
    } else {
      showToast(`PDF document generated: ${sizeKb} KB!`, 'success');
    }
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

  // ==================== INTERACTIVE PDF EDITOR ENGINE (Pi7.org Style) ====================
  editorPdfFile: null,
  editorPdfBytes: null,
  editorPdfDoc: null,
  editorCurrentPage: 1,
  editorTotalPages: 1,
  editorPageRotation: 0,
  editorAnnotations: [], // list of { page, type: 'replace_text'|'stamp'|'text'|'sign'|'redact'|'highlight', relX, relY, relW, relH, title, text, oldText, color, fontSize, dataUrl }
  activeEditorTool: 'edit_text', // Default: 'edit_text' (Pi7 mode: click any line/word to edit)
  signatureDataUrl: null,
  isDrawingSig: false,
  editorTextItems: [],

  async loadPdfForEditor(file) {
    if (!file) return;
    this.editorPdfFile = file;

    try {
      const rawBuf = await file.arrayBuffer();
      // Keep non-detached master Uint8Array copy
      this.editorPdfBytes = new Uint8Array(rawBuf);

      if (typeof pdfjsLib === 'undefined') {
        showToast('PDF rendering engine loading, please try again.', 'info');
        return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      // Pass a cloned slice so the worker never detaches this.editorPdfBytes
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(this.editorPdfBytes.slice(0)) });
      this.editorPdfDoc = await loadingTask.promise;
      this.editorTotalPages = this.editorPdfDoc.numPages;
      this.editorCurrentPage = 1;
      this.editorPageRotation = 0;
      this.editorAnnotations = [];

      this.updateEditorPageNav();
      await this.renderEditorPage();

      const workspace = document.getElementById('pdfEditorWorkspace');
      if (workspace) workspace.classList.remove('hidden');
      const placeholder = document.getElementById('pdfEditorPlaceholder');
      if (placeholder) placeholder.classList.add('hidden');

      // Bind canvas click if not already bound
      const canvas = document.getElementById('pdfEditorCanvas');
      if (canvas && !canvas._hasEditorListener) {
        canvas._hasEditorListener = true;
        canvas.addEventListener('click', (e) => this.handleEditorCanvasClick(e));
      }

      // Initialize signature pad
      this.initSignaturePad();

      // Ensure Pi7 edit tool is active by default
      this.setEditorTool('edit_text');

      showToast(`Loaded PDF: ${file.name} (${this.editorTotalPages} pages) - Click any word or line to edit!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error reading PDF: ' + err.message, 'error');
    }
  },

  async renderEditorPage() {
    if (!this.editorPdfDoc) return;
    const canvas = document.getElementById('pdfEditorCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const page = await this.editorPdfDoc.getPage(this.editorCurrentPage);
    // Render at scale 1.35 for sharp reading
    const viewport = page.getViewport({ scale: 1.35, rotation: this.editorPageRotation });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    // Draw annotations & replacements on top of PDF page
    const pageAnns = this.editorAnnotations.filter(a => a.page === this.editorCurrentPage);
    pageAnns.forEach(ann => {
      this.drawAnnotationOnCanvas(ctx, ann, canvas.width, canvas.height);
    });

    // Render interactive text layer for Pi7 click-to-edit
    await this.renderEditorTextLayer(page, viewport, canvas.width, canvas.height);
  },

  async renderEditorTextLayer(page, viewport, canvasW, canvasH) {
    const layer = document.getElementById('pdfEditorTextLayer');
    if (!layer) return;
    layer.innerHTML = '';

    try {
      const textContent = await page.getTextContent();
      if (!textContent || !textContent.items || !textContent.items.length) {
        return;
      }

      this.editorTextItems = textContent.items;

      textContent.items.forEach((item, index) => {
        const text = (item.str || '').trim();
        if (!text) return;

        // Coordinate conversion using PDF.js viewport
        const tx = item.transform[4];
        const ty = item.transform[5];
        const [vx, vy] = viewport.convertToViewportPoint(tx, ty);

        // Calculate font scale and bounding box
        const fontScale = Math.hypot(item.transform[0], item.transform[1]) || 12;
        const fontPt = Math.max(6, Math.round(fontScale));
        const fontHeight = Math.max(10, fontScale * viewport.scale);
        const itemWidth = Math.max(12, (item.width || text.length * 7.5) * viewport.scale);
        const left = Math.max(0, vx);
        const top = Math.max(0, vy - fontHeight);
        const width = itemWidth;
        const height = fontHeight * 1.25;

        // Detect Font Metadata (Family, Bold, Italic)
        const fontName = (item.fontName || '').toLowerCase();
        const styleObj = (textContent.styles && textContent.styles[item.fontName]) || {};
        const styleFamily = (styleObj.fontFamily || '').toLowerCase();

        let fontCategory = 'sans-serif';
        if (fontName.includes('times') || fontName.includes('roman') || fontName.includes('serif') || styleFamily.includes('serif')) {
          fontCategory = 'serif';
        } else if (fontName.includes('courier') || fontName.includes('mono') || styleFamily.includes('monospace')) {
          fontCategory = 'monospace';
        }

        const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || fontName.includes('w7') || fontName.includes('w8') || fontName.includes('w9') || (styleObj.bold === true);
        const isItalic = fontName.includes('italic') || fontName.includes('oblique') || (Math.abs(item.transform[1]) > 0.05);

        const fontInfo = {
          fontPt,
          fontCategory,
          isBold,
          isItalic,
          fontName: item.fontName || 'Helvetica'
        };

        const node = document.createElement('div');
        node.className = 'pdf-text-node';
        node.style.left = `${left}px`;
        node.style.top = `${top}px`;
        node.style.width = `${width}px`;
        node.style.height = `${height}px`;
        node.setAttribute('data-idx', index);
        node.title = `Click to edit text: "${text}" (${fontCategory}, ${fontPt}pt${isBold ? ', Bold' : ''})`;

        // Check if this position was edited
        const existingAnn = this.editorAnnotations.find(a =>
          a.page === this.editorCurrentPage &&
          a.type === 'replace_text' &&
          Math.abs(a.relX * canvasW - left) < 14 &&
          Math.abs(a.relY * canvasH - top) < 14
        );
        if (existingAnn) {
          node.classList.add('is-replaced');
          node.title = `Edited: "${existingAnn.text}" (Original: "${text}") - Click to re-edit`;
        }

        node.addEventListener('click', (e) => {
          if (this.activeEditorTool === 'edit_text') {
            e.stopPropagation();
            this.openInlineTextEditor(node, item, left, top, width, height, fontHeight, canvasW, canvasH, fontInfo, existingAnn);
          }
        });

        layer.appendChild(node);
      });

      // Render interactive nodes for custom text annotations on this page
      const customTexts = this.editorAnnotations.filter(a => a.page === this.editorCurrentPage && a.type === 'text');
      customTexts.forEach((ann) => {
        const annLeft = ann.relX * canvasW;
        const annTop = Math.max(0, ann.relY * canvasH - (ann.fontSize || 14) * 0.9);
        const approxCharW = (ann.fontSize || 14) * 0.65;
        const annWidth = Math.max(55, (ann.text || '').length * approxCharW + 18);
        const annHeight = Math.max(22, (ann.fontSize || 14) * 1.5);

        const node = document.createElement('div');
        node.className = 'pdf-text-node pdf-custom-text-node';
        node.style.left = `${annLeft}px`;
        node.style.top = `${annTop}px`;
        node.style.width = `${annWidth}px`;
        node.style.height = `${annHeight}px`;
        node.title = `Custom Text: "${ann.text}" - Click to edit, change words or delete!`;

        node.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openInlineEditCustomText(ann, annLeft, annTop, annWidth, annHeight, canvasW, canvasH);
        });

        layer.appendChild(node);
      });
    } catch (err) {
      console.warn('Could not extract text content for Pi7 editor:', err);
    }
  },

  openInlineAddText(clickX, clickY, relX, relY, canvasW, canvasH) {
    const existing = document.querySelector('.pdf-inline-editor');
    if (existing) existing.remove();
    const existingBar = document.getElementById('pdfFloatingFormatBar');
    if (existingBar) existingBar.remove();

    let fontCategory = 'sans-serif';
    let isBold = false;
    let isItalic = false;
    let fontPt = parseInt(document.getElementById('pdfEditorFontSize')?.value || '14', 10);
    const colorVal = document.getElementById('pdfEditorColor')?.value || 'blue';
    let textColor = '#1d4ed8';
    if (colorVal === 'red') textColor = '#dc2626';
    else if (colorVal === 'black') textColor = '#0f172a';
    else if (colorVal === 'green') textColor = '#059669';

    const presetText = document.getElementById('pdfEditorCustomText')?.value || '';

    const layer = document.getElementById('pdfEditorTextLayer');
    if (!layer) return;

    // Create toolbar
    const bar = document.createElement('div');
    bar.id = 'pdfFloatingFormatBar';
    bar.className = 'pdf-floating-format-bar';
    bar.style.left = `${Math.max(4, clickX)}px`;
    const barTop = clickY >= 42 ? (clickY - 38) : (clickY + 34);
    bar.style.top = `${barTop}px`;

    bar.innerHTML = `
      <span style="font-size:9px;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 5px;border-radius:4px;letter-spacing:0.3px;">
        <i class="fa-solid fa-plus"></i> ADD TEXT
      </span>
      <select class="pdf-format-select" id="pdfAddFontSelect" title="Font Family">
        <option value="sans-serif">Sans (Arial)</option>
        <option value="serif">Serif (Times)</option>
        <option value="monospace">Mono (Courier)</option>
      </select>
      <button type="button" class="pdf-format-btn" id="pdfAddBoldBtn" title="Toggle Bold">
        <strong>B</strong>
      </button>
      <button type="button" class="pdf-format-btn" id="pdfAddItalicBtn" title="Toggle Italic">
        <em>I</em>
      </button>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfAddSizeDec">-</button>
      <input type="number" class="pdf-format-size-input" id="pdfAddSizeInput" value="${fontPt}" min="6" max="72" title="Font Size (pt)" />
      <button type="button" class="pdf-format-btn" id="pdfAddSizeInc">+</button>
      <div class="pdf-format-divider"></div>
      <input type="color" id="pdfAddColorPicker" value="${textColor}" style="width:20px;height:22px;padding:0;border:none;border-radius:4px;cursor:pointer;" title="Color" />
      <span class="pdf-format-color-chip" data-color="#000000" style="background:#000000;" title="Black"></span>
      <span class="pdf-format-color-chip" data-color="#0b3b82" style="background:#0b3b82;" title="Navy Blue"></span>
      <span class="pdf-format-color-chip" data-color="#dc2626" style="background:#dc2626;" title="Red"></span>
      <span class="pdf-format-color-chip" data-color="#16a34a" style="background:#16a34a;" title="Green"></span>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfAddSaveBtn" style="background:#10b981;color:#fff;border-color:#059669;padding:0 7px;" title="Save (Enter)">
        <i class="fa-solid fa-check"></i>
      </button>
      <button type="button" class="pdf-format-btn" id="pdfAddCancelBtn" style="background:#f1f5f9;color:#64748b;padding:0 5px;" title="Cancel (Esc)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    bar.addEventListener('mousedown', (e) => e.preventDefault());

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pdf-inline-editor';
    input.placeholder = 'Type any text / word here...';
    input.value = presetText;
    input.style.left = `${Math.max(0, clickX)}px`;
    input.style.top = `${Math.max(0, clickY - fontPt)}px`;
    input.style.minWidth = '140px';
    input.style.height = `${Math.max(fontPt * 1.5, 28)}px`;

    const updateStyle = () => {
      let fontFam = 'Inter, Arial, sans-serif';
      if (fontCategory === 'serif') fontFam = '"Times New Roman", Times, Georgia, serif';
      else if (fontCategory === 'monospace') fontFam = '"Courier New", Courier, monospace';
      input.style.fontFamily = fontFam;
      input.style.fontWeight = isBold ? '700' : '500';
      input.style.fontStyle = isItalic ? 'italic' : 'normal';
      input.style.fontSize = `${fontPt}px`;
      input.style.color = textColor;
      input.style.backgroundColor = 'transparent';
    };
    updateStyle();

    layer.appendChild(bar);
    layer.appendChild(input);
    input.focus();
    input.select();

    const fontSelect = bar.querySelector('#pdfAddFontSelect');
    const boldBtn = bar.querySelector('#pdfAddBoldBtn');
    const italicBtn = bar.querySelector('#pdfAddItalicBtn');
    const sizeInput = bar.querySelector('#pdfAddSizeInput');
    const sizeDec = bar.querySelector('#pdfAddSizeDec');
    const sizeInc = bar.querySelector('#pdfAddSizeInc');
    const colorPicker = bar.querySelector('#pdfAddColorPicker');
    const saveBtn = bar.querySelector('#pdfAddSaveBtn');
    const cancelBtn = bar.querySelector('#pdfAddCancelBtn');

    fontSelect.addEventListener('change', (e) => { fontCategory = e.target.value; updateStyle(); });
    boldBtn.addEventListener('click', () => { isBold = !isBold; boldBtn.classList.toggle('is-active', isBold); updateStyle(); });
    italicBtn.addEventListener('click', () => { isItalic = !isItalic; italicBtn.classList.toggle('is-active', isItalic); updateStyle(); });
    const setSize = (p) => { fontPt = Math.max(6, Math.min(72, p)); sizeInput.value = fontPt; updateStyle(); };
    sizeInput.addEventListener('input', (e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setSize(v); });
    sizeDec.addEventListener('click', () => setSize(fontPt - 1));
    sizeInc.addEventListener('click', () => setSize(fontPt + 1));
    colorPicker.addEventListener('input', (e) => { textColor = e.target.value; updateStyle(); });
    bar.querySelectorAll('.pdf-format-color-chip').forEach(chip => {
      chip.addEventListener('click', () => { textColor = chip.getAttribute('data-color'); colorPicker.value = textColor; updateStyle(); });
    });

    let committed = false;
    const cleanup = () => {
      if (bar.parentNode) bar.remove();
      if (input.parentNode) input.remove();
    };

    const commitAdd = () => {
      if (committed) return;
      committed = true;
      const textVal = input.value.trim();
      cleanup();

      if (textVal) {
        this.editorAnnotations.push({
          id: 'text_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          page: this.editorCurrentPage,
          type: 'text',
          relX: relX,
          relY: relY,
          text: textVal,
          fontFamily: fontCategory,
          isBold: isBold,
          isItalic: isItalic,
          fontSize: fontPt,
          color: textColor
        });
        showToast(`Text added: "${textVal}"! Click on it anytime to edit.`, 'success');
        this.renderEditorPage();
      }
    };

    saveBtn.addEventListener('click', () => commitAdd());
    cancelBtn.addEventListener('click', () => { committed = true; cleanup(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commitAdd(); }
      else if (e.key === 'Escape') { e.preventDefault(); committed = true; cleanup(); }
    });
    input.addEventListener('blur', () => {
      setTimeout(() => { if (!bar.contains(document.activeElement)) commitAdd(); }, 180);
    });
  },

  openInlineEditCustomText(ann, left, top, width, height, canvasW, canvasH) {
    const existing = document.querySelector('.pdf-inline-editor');
    if (existing) existing.remove();
    const existingBar = document.getElementById('pdfFloatingFormatBar');
    if (existingBar) existingBar.remove();

    let fontCategory = ann.fontFamily || 'sans-serif';
    let isBold = ann.isBold || false;
    let isItalic = ann.isItalic || false;
    let fontPt = ann.fontSize || 14;
    let textColor = ann.color || '#1d4ed8';
    if (textColor === 'blue') textColor = '#1d4ed8';
    else if (textColor === 'red') textColor = '#dc2626';
    else if (textColor === 'black') textColor = '#0f172a';
    else if (textColor === 'green') textColor = '#059669';

    const layer = document.getElementById('pdfEditorTextLayer');
    if (!layer) return;

    // Create toolbar
    const bar = document.createElement('div');
    bar.id = 'pdfFloatingFormatBar';
    bar.className = 'pdf-floating-format-bar';
    bar.style.left = `${Math.max(4, left)}px`;
    const barTop = top >= 42 ? (top - 38) : (top + height + 8);
    bar.style.top = `${barTop}px`;

    bar.innerHTML = `
      <span style="font-size:9px;font-weight:800;color:#2563eb;background:#dbeafe;padding:2px 5px;border-radius:4px;letter-spacing:0.3px;">
        <i class="fa-solid fa-pen"></i> EDIT
      </span>
      <select class="pdf-format-select" id="pdfEditFontSelect" title="Font Family">
        <option value="sans-serif" ${fontCategory === 'sans-serif' ? 'selected' : ''}>Sans (Arial)</option>
        <option value="serif" ${fontCategory === 'serif' ? 'selected' : ''}>Serif (Times)</option>
        <option value="monospace" ${fontCategory === 'monospace' ? 'selected' : ''}>Mono (Courier)</option>
      </select>
      <button type="button" class="pdf-format-btn ${isBold ? 'is-active' : ''}" id="pdfEditBoldBtn" title="Toggle Bold">
        <strong>B</strong>
      </button>
      <button type="button" class="pdf-format-btn ${isItalic ? 'is-active' : ''}" id="pdfEditItalicBtn" title="Toggle Italic">
        <em>I</em>
      </button>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfEditSizeDec">-</button>
      <input type="number" class="pdf-format-size-input" id="pdfEditSizeInput" value="${fontPt}" min="6" max="72" title="Font Size (pt)" />
      <button type="button" class="pdf-format-btn" id="pdfEditSizeInc">+</button>
      <div class="pdf-format-divider"></div>
      <input type="color" id="pdfEditColorPicker" value="${textColor}" style="width:20px;height:22px;padding:0;border:none;border-radius:4px;cursor:pointer;" title="Color" />
      <span class="pdf-format-color-chip" data-color="#000000" style="background:#000000;" title="Black"></span>
      <span class="pdf-format-color-chip" data-color="#0b3b82" style="background:#0b3b82;" title="Navy Blue"></span>
      <span class="pdf-format-color-chip" data-color="#dc2626" style="background:#dc2626;" title="Red"></span>
      <span class="pdf-format-color-chip" data-color="#16a34a" style="background:#16a34a;" title="Green"></span>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfEditSaveBtn" style="background:#10b981;color:#fff;border-color:#059669;padding:0 7px;" title="Save (Enter)">
        <i class="fa-solid fa-check"></i>
      </button>
      <button type="button" class="pdf-format-btn" id="pdfEditDeleteBtn" style="background:#fee2e2;color:#b91c1c;border-color:#fca5a5;padding:0 6px;" title="Delete text">
        <i class="fa-solid fa-trash-can"></i>
      </button>
      <button type="button" class="pdf-format-btn" id="pdfEditCancelBtn" style="background:#f1f5f9;color:#64748b;padding:0 5px;" title="Cancel (Esc)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    bar.addEventListener('mousedown', (e) => e.preventDefault());

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pdf-inline-editor';
    input.value = ann.text || '';
    input.style.left = `${Math.max(0, left)}px`;
    input.style.top = `${Math.max(0, top)}px`;
    input.style.minWidth = `${Math.max(width, 140)}px`;
    input.style.height = `${Math.max(height, 28)}px`;

    const updateStyle = () => {
      let fontFam = 'Inter, Arial, sans-serif';
      if (fontCategory === 'serif') fontFam = '"Times New Roman", Times, Georgia, serif';
      else if (fontCategory === 'monospace') fontFam = '"Courier New", Courier, monospace';
      input.style.fontFamily = fontFam;
      input.style.fontWeight = isBold ? '700' : '500';
      input.style.fontStyle = isItalic ? 'italic' : 'normal';
      input.style.fontSize = `${fontPt}px`;
      input.style.color = textColor;
      input.style.backgroundColor = 'transparent';
    };
    updateStyle();

    layer.appendChild(bar);
    layer.appendChild(input);
    input.focus();
    input.select();

    const fontSelect = bar.querySelector('#pdfEditFontSelect');
    const boldBtn = bar.querySelector('#pdfEditBoldBtn');
    const italicBtn = bar.querySelector('#pdfEditItalicBtn');
    const sizeInput = bar.querySelector('#pdfEditSizeInput');
    const sizeDec = bar.querySelector('#pdfEditSizeDec');
    const sizeInc = bar.querySelector('#pdfEditSizeInc');
    const colorPicker = bar.querySelector('#pdfEditColorPicker');
    const saveBtn = bar.querySelector('#pdfEditSaveBtn');
    const deleteBtn = bar.querySelector('#pdfEditDeleteBtn');
    const cancelBtn = bar.querySelector('#pdfEditCancelBtn');

    fontSelect.addEventListener('change', (e) => { fontCategory = e.target.value; updateStyle(); });
    boldBtn.addEventListener('click', () => { isBold = !isBold; boldBtn.classList.toggle('is-active', isBold); updateStyle(); });
    italicBtn.addEventListener('click', () => { isItalic = !isItalic; italicBtn.classList.toggle('is-active', isItalic); updateStyle(); });
    const setSize = (p) => { fontPt = Math.max(6, Math.min(72, p)); sizeInput.value = fontPt; updateStyle(); };
    sizeInput.addEventListener('input', (e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setSize(v); });
    sizeDec.addEventListener('click', () => setSize(fontPt - 1));
    sizeInc.addEventListener('click', () => setSize(fontPt + 1));
    colorPicker.addEventListener('input', (e) => { textColor = e.target.value; updateStyle(); });
    bar.querySelectorAll('.pdf-format-color-chip').forEach(chip => {
      chip.addEventListener('click', () => { textColor = chip.getAttribute('data-color'); colorPicker.value = textColor; updateStyle(); });
    });

    let committed = false;
    const cleanup = () => {
      if (bar.parentNode) bar.remove();
      if (input.parentNode) input.remove();
    };

    const commitEdit = () => {
      if (committed) return;
      committed = true;
      const newStr = input.value.trim();
      cleanup();

      if (newStr === '') {
        const idx = this.editorAnnotations.indexOf(ann);
        if (idx !== -1) {
          this.editorAnnotations.splice(idx, 1);
          showToast('Text deleted from document', 'info');
          this.renderEditorPage();
        }
      } else {
        ann.text = newStr;
        ann.fontFamily = fontCategory;
        ann.isBold = isBold;
        ann.isItalic = isItalic;
        ann.fontSize = fontPt;
        ann.color = textColor;
        showToast(`Text updated: "${newStr}"`, 'success');
        this.renderEditorPage();
      }
    };

    deleteBtn.addEventListener('click', () => {
      committed = true;
      cleanup();
      const idx = this.editorAnnotations.indexOf(ann);
      if (idx !== -1) {
        this.editorAnnotations.splice(idx, 1);
        showToast('Text deleted from document', 'info');
        this.renderEditorPage();
      }
    });

    saveBtn.addEventListener('click', () => commitEdit());
    cancelBtn.addEventListener('click', () => { committed = true; cleanup(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
      else if (e.key === 'Escape') { e.preventDefault(); committed = true; cleanup(); }
    });
    input.addEventListener('blur', () => {
      setTimeout(() => { if (!bar.contains(document.activeElement)) commitEdit(); }, 180);
    });
  },

  sampleTextAndBgColor(left, top, width, height) {
    const canvas = document.getElementById('pdfEditorCanvas');
    if (!canvas) return { textColor: '#0f172a', bgColor: '#ffffff' };
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { textColor: '#0f172a', bgColor: '#ffffff' };

    try {
      const sx = Math.max(0, Math.floor(left));
      const sy = Math.max(0, Math.floor(top));
      const sw = Math.min(canvas.width - sx, Math.ceil(width));
      const sh = Math.min(canvas.height - sy, Math.ceil(height));
      if (sw <= 2 || sh <= 2) return { textColor: '#0f172a', bgColor: '#ffffff' };

      const imgData = ctx.getImageData(sx, sy, sw, sh);
      const data = imgData.data;

      // 1. Sample Background Color from boundary pixels (filter out dark ink pixels)
      const borderPixels = [];
      const addBorder = (px, py) => {
        const idx = (py * sw + px) * 4;
        if (data[idx + 3] > 30) {
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          borderPixels.push({ r, g, b, brightness });
        }
      };

      for (let x = 0; x < sw; x += 2) {
        addBorder(x, 0);
        addBorder(x, sh - 1);
      }
      for (let y = 0; y < sh; y += 2) {
        addBorder(0, y);
        addBorder(sw - 1, y);
      }

      let bgR = 255, bgG = 255, bgB = 255;
      if (borderPixels.length > 0) {
        // Sort descending by brightness: paper background is the lightest pixels, not dark ink
        borderPixels.sort((a, b) => b.brightness - a.brightness);
        const lightCount = Math.max(1, Math.floor(borderPixels.length * 0.6));
        let sr = 0, sg = 0, sb = 0;
        for (let i = 0; i < lightCount; i++) {
          sr += borderPixels[i].r;
          sg += borderPixels[i].g;
          sb += borderPixels[i].b;
        }
        bgR = Math.round(sr / lightCount);
        bgG = Math.round(sg / lightCount);
        bgB = Math.round(sb / lightCount);
      }

      // Snap near-white background to pure white
      if (bgR >= 235 && bgG >= 235 && bgB >= 235) {
        bgR = 255; bgG = 255; bgB = 255;
      }
      const toHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      const bgColor = toHex(bgR, bgG, bgB);

      // 2. Sample Text Ink Color from high-contrast interior pixels
      const textPixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 50) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (dist > 45) {
          textPixels.push({ r, g, b, dist });
        }
      }

      let textR = 15, textG = 23, textB = 42;
      if (textPixels.length > 0) {
        textPixels.sort((a, b) => b.dist - a.dist);
        const count = Math.min(25, textPixels.length);
        let tr = 0, tg = 0, tb = 0;
        for (let i = 0; i < count; i++) {
          tr += textPixels[i].r;
          tg += textPixels[i].g;
          tb += textPixels[i].b;
        }
        textR = Math.round(tr / count);
        textG = Math.round(tg / count);
        textB = Math.round(tb / count);
      }
      const textColor = toHex(textR, textG, textB);

      return { textColor, bgColor };
    } catch (err) {
      console.warn('Color sampling error:', err);
      return { textColor: '#0f172a', bgColor: '#ffffff' };
    }
  },

  openInlineTextEditor(node, item, left, top, width, height, fontHeight, canvasW, canvasH, fontInfo = {}, existingAnn = null) {
    const existing = document.querySelector('.pdf-inline-editor');
    if (existing) existing.remove();
    const existingBar = document.getElementById('pdfFloatingFormatBar');
    if (existingBar) existingBar.remove();

    // Sample canvas colors
    const sampled = this.sampleTextAndBgColor(left, top, width, height);

    // Initial formatting state (auto-detected from PDF metadata & canvas)
    let fontCategory = existingAnn ? (existingAnn.fontFamily || 'sans-serif') : (fontInfo.fontCategory || 'sans-serif');
    let isBold = existingAnn ? (existingAnn.isBold !== undefined ? existingAnn.isBold : false) : (fontInfo.isBold || false);
    let isItalic = existingAnn ? (existingAnn.isItalic !== undefined ? existingAnn.isItalic : false) : (fontInfo.isItalic || false);
    let fontPt = existingAnn ? (existingAnn.fontSizePt || 12) : (fontInfo.fontPt || Math.max(8, Math.round(fontHeight * 0.8)));
    let textColor = existingAnn ? (existingAnn.color || '#0f172a') : sampled.textColor;
    let bgColor = existingAnn ? (existingAnn.bgColor || '#ffffff') : sampled.bgColor;

    const layer = document.getElementById('pdfEditorTextLayer');
    if (!layer) return;

    // 1. Create Pi7-Style Floating Formatting Toolbar
    const bar = document.createElement('div');
    bar.id = 'pdfFloatingFormatBar';
    bar.className = 'pdf-floating-format-bar';
    bar.style.left = `${Math.max(4, left)}px`;
    const barTop = top >= 42 ? (top - 38) : (top + height + 8);
    bar.style.top = `${barTop}px`;

    bar.innerHTML = `
      <span style="font-size:9px;font-weight:800;color:#0284c7;background:#e0f2fe;padding:2px 5px;border-radius:4px;letter-spacing:0.3px;">
        <i class="fa-solid fa-wand-magic-sparkles"></i> AUTO-MATCH
      </span>
      <select class="pdf-format-select" id="pdfFormatFontSelect" title="Font Family">
        <option value="sans-serif" ${fontCategory === 'sans-serif' ? 'selected' : ''}>Sans (Arial)</option>
        <option value="serif" ${fontCategory === 'serif' ? 'selected' : ''}>Serif (Times)</option>
        <option value="monospace" ${fontCategory === 'monospace' ? 'selected' : ''}>Mono (Courier)</option>
      </select>
      <button type="button" class="pdf-format-btn ${isBold ? 'is-active' : ''}" id="pdfFormatBoldBtn" title="Toggle Bold">
        <strong>B</strong>
      </button>
      <button type="button" class="pdf-format-btn ${isItalic ? 'is-active' : ''}" id="pdfFormatItalicBtn" title="Toggle Italic">
        <em>I</em>
      </button>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfFormatSizeDec" title="Decrease Font Size">-</button>
      <input type="number" class="pdf-format-size-input" id="pdfFormatSizeInput" value="${fontPt}" min="6" max="72" title="Font Size (pt)" />
      <button type="button" class="pdf-format-btn" id="pdfFormatSizeInc" title="Increase Font Size">+</button>
      <div class="pdf-format-divider"></div>
      <input type="color" id="pdfFormatColorPicker" value="${textColor}" style="width:20px;height:22px;padding:0;border:none;border-radius:4px;cursor:pointer;" title="Pick Color" />
      <span class="pdf-format-color-chip" data-color="#000000" style="background:#000000;" title="Black"></span>
      <span class="pdf-format-color-chip" data-color="#0b3b82" style="background:#0b3b82;" title="Navy Blue"></span>
      <span class="pdf-format-color-chip" data-color="#dc2626" style="background:#dc2626;" title="Red"></span>
      <span class="pdf-format-color-chip" data-color="#16a34a" style="background:#16a34a;" title="Green"></span>
      <div class="pdf-format-divider"></div>
      <button type="button" class="pdf-format-btn" id="pdfFormatSaveBtn" style="background:#10b981;color:#fff;border-color:#059669;padding:0 7px;" title="Save (Enter)">
        <i class="fa-solid fa-check"></i>
      </button>
      <button type="button" class="pdf-format-btn" id="pdfFormatCancelBtn" style="background:#f1f5f9;color:#64748b;padding:0 5px;" title="Cancel (Esc)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Prevent toolbar clicks from causing input blur
    bar.addEventListener('mousedown', (e) => e.preventDefault());

    // 2. Create the Inline Editable Input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pdf-inline-editor';
    input.value = existingAnn ? existingAnn.text : item.str;
    input.style.left = `${Math.max(0, left - 2)}px`;
    input.style.top = `${Math.max(0, top - 2)}px`;
    input.style.minWidth = `${Math.max(width + 24, 110)}px`;
    input.style.height = `${Math.max(height + 4, 26)}px`;

    const updateInputStyle = () => {
      let fontFam = 'Inter, Arial, sans-serif';
      if (fontCategory === 'serif') fontFam = '"Times New Roman", Times, Georgia, serif';
      else if (fontCategory === 'monospace') fontFam = '"Courier New", Courier, monospace';

      const scale = this.editorViewport?.scale || 1.35;
      const pixelSize = Math.max(10, Math.round(fontPt * scale));

      input.style.fontFamily = fontFam;
      input.style.fontWeight = isBold ? '700' : '400';
      input.style.fontStyle = isItalic ? 'italic' : 'normal';
      input.style.fontSize = `${pixelSize}px`;
      input.style.color = textColor;
      input.style.backgroundColor = bgColor;
    };

    updateInputStyle();

    layer.appendChild(bar);
    layer.appendChild(input);
    input.focus();
    input.select();

    // 3. Bind Floating Toolbar Controls
    const fontSelect = bar.querySelector('#pdfFormatFontSelect');
    const boldBtn = bar.querySelector('#pdfFormatBoldBtn');
    const italicBtn = bar.querySelector('#pdfFormatItalicBtn');
    const sizeInput = bar.querySelector('#pdfFormatSizeInput');
    const sizeDec = bar.querySelector('#pdfFormatSizeDec');
    const sizeInc = bar.querySelector('#pdfFormatSizeInc');
    const colorPicker = bar.querySelector('#pdfFormatColorPicker');
    const saveBtn = bar.querySelector('#pdfFormatSaveBtn');
    const cancelBtn = bar.querySelector('#pdfFormatCancelBtn');

    fontSelect.addEventListener('change', (e) => {
      fontCategory = e.target.value;
      updateInputStyle();
    });

    boldBtn.addEventListener('click', () => {
      isBold = !isBold;
      boldBtn.classList.toggle('is-active', isBold);
      updateInputStyle();
    });

    italicBtn.addEventListener('click', () => {
      isItalic = !isItalic;
      italicBtn.classList.toggle('is-active', isItalic);
      updateInputStyle();
    });

    const updateSize = (newPt) => {
      fontPt = Math.max(6, Math.min(72, newPt));
      sizeInput.value = fontPt;
      updateInputStyle();
    };
    sizeInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) updateSize(val);
    });
    sizeDec.addEventListener('click', () => updateSize(fontPt - 1));
    sizeInc.addEventListener('click', () => updateSize(fontPt + 1));

    colorPicker.addEventListener('input', (e) => {
      textColor = e.target.value;
      updateInputStyle();
    });

    bar.querySelectorAll('.pdf-format-color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        textColor = chip.getAttribute('data-color');
        colorPicker.value = textColor;
        updateInputStyle();
      });
    });

    let committed = false;
    const cleanup = () => {
      if (bar.parentNode) bar.remove();
      if (input.parentNode) input.remove();
    };

    const commitEdit = () => {
      if (committed) return;
      committed = true;
      const newStr = input.value;
      cleanup();

      if (newStr !== undefined && (newStr !== item.str || existingAnn)) {
        if (existingAnn) {
          existingAnn.text = newStr;
          existingAnn.fontSizePt = fontPt;
          existingAnn.fontFamily = fontCategory;
          existingAnn.isBold = isBold;
          existingAnn.isItalic = isItalic;
          existingAnn.color = textColor;
          existingAnn.bgColor = bgColor;
        } else {
          this.editorAnnotations.push({
            page: this.editorCurrentPage,
            type: 'replace_text',
            relX: left / canvasW,
            relY: top / canvasH,
            relW: width / canvasW,
            relH: height / canvasH,
            oldText: item.str,
            text: newStr,
            fontSizePt: fontPt,
            fontFamily: fontCategory,
            isBold: isBold,
            isItalic: isItalic,
            color: textColor,
            bgColor: bgColor
          });
        }
        showToast(`Text updated with matching format (${fontCategory}, ${fontPt}pt)!`, 'success');
        this.renderEditorPage();
      }
    };

    saveBtn.addEventListener('click', () => commitEdit());
    cancelBtn.addEventListener('click', () => {
      committed = true;
      cleanup();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        committed = true;
        cleanup();
      }
    });

    input.addEventListener('blur', (e) => {
      setTimeout(() => {
        if (!bar.contains(document.activeElement)) {
          commitEdit();
        }
      }, 180);
    });
  },

  drawAnnotationOnCanvas(ctx, ann, canvasW, canvasH) {
    const x = ann.relX * canvasW;
    const y = ann.relY * canvasH;

    if (ann.type === 'replace_text') {
      const w = (ann.relW || 0.1) * canvasW;
      const h = (ann.relH || 0.03) * canvasH;

      ctx.save();
      // 1. Opaque rectangle matching the sampled background color
      ctx.fillStyle = ann.bgColor || '#ffffff';
      ctx.fillRect(x, y, w, h);

      // 2. Render replacement text with exact font family, weight, style, size and color
      const weight = ann.isBold ? '700' : '400';
      const style = ann.isItalic ? 'italic' : 'normal';
      let fontFam = 'Inter, Arial, sans-serif';
      if (ann.fontFamily === 'serif') fontFam = '"Times New Roman", Times, Georgia, serif';
      else if (ann.fontFamily === 'monospace') fontFam = '"Courier New", Courier, monospace';

      const scale = this.editorViewport?.scale || 1.35;
      const drawFontSize = ann.fontSizePt ? Math.round(ann.fontSizePt * scale) : Math.max(11, Math.round(h * 0.8));

      ctx.fillStyle = ann.color || '#0f172a';
      ctx.font = `${style} ${weight} ${drawFontSize}px ${fontFam}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ann.text || '', x + 1, y + h / 2);
      ctx.restore();
    } else if (ann.type === 'stamp') {
      const stampW = Math.min(220, canvasW * 0.35);
      const stampH = 58;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(x - stampW / 2, y - stampH / 2, stampW, stampH);

      let strokeCol = '#0284c7'; // blue
      if (ann.color === 'red') strokeCol = '#dc2626';
      if (ann.color === 'green') strokeCol = '#059669';

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x - stampW / 2, y - stampH / 2, stampW, stampH);

      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = strokeCol;
      ctx.textAlign = 'center';
      ctx.fillText(ann.title || 'VERIFIED & ATTESTED', x, y - stampH / 2 + 18);

      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText((ann.text || 'CSC Digital Seva Kendra').substring(0, 28), x, y - stampH / 2 + 34);

      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Date: ${new Date().toLocaleDateString('en-GB')} • Odisha VLE`, x, y - stampH / 2 + 48);

      ctx.restore();
    } else if (ann.type === 'text') {
      ctx.save();
      let fontColor = ann.color || '#0f172a';
      if (ann.color === 'blue') fontColor = '#1d4ed8';
      else if (ann.color === 'red') fontColor = '#dc2626';
      else if (ann.color === 'black') fontColor = '#0f172a';
      else if (ann.color === 'green') fontColor = '#059669';

      const weight = ann.isBold ? '700' : '500';
      const style = ann.isItalic ? 'italic' : 'normal';
      let fontFam = 'Inter, Arial, sans-serif';
      if (ann.fontFamily === 'serif') fontFam = '"Times New Roman", Times, Georgia, serif';
      else if (ann.fontFamily === 'monospace') fontFam = '"Courier New", Courier, monospace';

      const scale = this.editorViewport?.scale || 1.35;
      const drawFontSize = ann.fontSize ? Math.round(ann.fontSize * (scale / 1.35)) : 14;

      ctx.font = `${style} ${weight} ${drawFontSize}px ${fontFam}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ann.text || 'Text Note', x, y);
      ctx.restore();
    } else if (ann.type === 'signature' && ann.dataUrl) {
      const sigImg = new Image();
      sigImg.onload = () => {
        const sigW = 120;
        const sigH = 50;
        ctx.drawImage(sigImg, x - sigW / 2, y - sigH / 2, sigW, sigH);
      };
      sigImg.src = ann.dataUrl;
    } else if (ann.type === 'redact') {
      const rw = (ann.relW || 0.25) * canvasW;
      const rh = (ann.relH || 0.04) * canvasH;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - rw / 2, y - rh / 2, rw, rh);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);
      ctx.restore();
    } else if (ann.type === 'highlight') {
      const hw = (ann.relW || 0.3) * canvasW;
      const hh = (ann.relH || 0.035) * canvasH;
      ctx.save();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.55)'; // Yellow highlighter
      ctx.fillRect(x - hw / 2, y - hh / 2, hw, hh);
      ctx.restore();
    }
  },

  handleEditorCanvasClick(e) {
    if (!this.editorPdfDoc) return;
    const canvas = document.getElementById('pdfEditorCanvas');
    if (!canvas) return;

    const tool = this.activeEditorTool;
    if (tool === 'edit_text') {
      // In edit_text mode, clicking empty canvas blurs active inline editor
      const activeInput = document.querySelector('.pdf-inline-editor');
      if (activeInput) activeInput.blur();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const relX = clickX / canvas.width;
    const relY = clickY / canvas.height;

    if (tool === 'stamp') {
      const stampType = document.getElementById('pdfEditorStampType')?.value || 'verified';
      const customText = document.getElementById('pdfEditorCustomText')?.value || 'Verified by CSC Odisha VLE Desk';
      const colorVal = document.getElementById('pdfEditorColor')?.value || 'blue';

      const stampTitles = {
        verified: 'VERIFIED & ATTESTED',
        approved: 'APPROVED & SUBMITTED',
        received: 'RECEIVED & VERIFIED',
        kendra: 'CSC DIGITAL SEVA KENDRA',
        custom: 'OFFICIAL ATTESTATION'
      };

      this.editorAnnotations.push({
        page: this.editorCurrentPage,
        type: 'stamp',
        relX: relX,
        relY: relY,
        title: stampTitles[stampType] || 'VERIFIED & ATTESTED',
        text: customText,
        color: colorVal
      });

      this.renderEditorPage();
      showToast('Official Stamp placed on PDF page!', 'success');
    } else if (tool === 'text') {
      this.openInlineAddText(clickX, clickY, relX, relY, canvas.width, canvas.height);
      return;
    } else if (tool === 'signature') {
      if (!this.signatureDataUrl) {
        showToast('Kripya pehle signature pad par sign karein aur "Use Signature" par click karein!', 'warning');
        return;
      }

      this.editorAnnotations.push({
        page: this.editorCurrentPage,
        type: 'signature',
        relX: relX,
        relY: relY,
        dataUrl: this.signatureDataUrl
      });

      this.renderEditorPage();
      showToast('Signature placed on PDF!', 'success');
    } else if (tool === 'redact') {
      this.editorAnnotations.push({
        page: this.editorCurrentPage,
        type: 'redact',
        relX: relX,
        relY: relY,
        relW: 0.25,
        relH: 0.04
      });
      this.renderEditorPage();
      showToast('Whiteout redact box placed!', 'info');
    } else if (tool === 'highlight') {
      this.editorAnnotations.push({
        page: this.editorCurrentPage,
        type: 'highlight',
        relX: relX,
        relY: relY,
        relW: 0.35,
        relH: 0.035
      });
      this.renderEditorPage();
      showToast('Highlighter placed!', 'info');
    }
  },

  setEditorTool(tool) {
    this.activeEditorTool = tool;

    // Toggle pointer events for text layer
    const textLayer = document.getElementById('pdfEditorTextLayer');
    if (textLayer) {
      textLayer.style.pointerEvents = (tool === 'edit_text') ? 'auto' : 'none';
    }

    document.querySelectorAll('.pdf-editor-tool-btn').forEach(btn => {
      const btnTool = btn.getAttribute('data-tool');
      if (btnTool === tool) {
        btn.classList.add('bg-sky-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-slate-100', 'text-slate-700', 'bg-emerald-600');
      } else if (btnTool !== 'find_replace') {
        btn.classList.remove('bg-sky-600', 'text-white', 'shadow-md', 'bg-emerald-600');
        btn.classList.add('bg-slate-100', 'text-slate-700');
      }
    });

    const sigContainer = document.getElementById('pdfEditorSigPadContainer');
    if (sigContainer) {
      if (tool === 'signature') {
        sigContainer.classList.remove('hidden');
      } else {
        sigContainer.classList.add('hidden');
      }
    }

    const tip = document.getElementById('pdfEditorEditTip');
    if (tip) {
      if (tool === 'edit_text') {
        tip.classList.remove('hidden');
      } else {
        tip.classList.add('hidden');
      }
    }

    const hint = document.getElementById('pdfEditorCanvasHint');
    if (hint) {
      if (tool === 'edit_text') {
        hint.innerHTML = '<i class="fa-solid fa-hand-pointer text-sky-600"></i><span>Pi7 Mode: Hover on any text and click to edit directly!</span>';
      } else if (tool === 'stamp') {
        hint.innerHTML = '<i class="fa-solid fa-stamp text-sky-600"></i><span>Click anywhere on PDF to place official verified stamp</span>';
      } else if (tool === 'text') {
        hint.innerHTML = '<i class="fa-solid fa-font text-sky-600"></i><span>Click anywhere on PDF to place custom text</span>';
      } else if (tool === 'signature') {
        hint.innerHTML = '<i class="fa-solid fa-signature text-sky-600"></i><span>Draw signature above, then click anywhere on PDF to place</span>';
      } else if (tool === 'redact') {
        hint.innerHTML = '<i class="fa-solid fa-eraser text-sky-600"></i><span>Click to place whiteout redaction box</span>';
      } else if (tool === 'highlight') {
        hint.innerHTML = '<i class="fa-solid fa-highlighter text-sky-600"></i><span>Click to place highlighter strip</span>';
      }
    }
  },

  toggleFindReplaceBar() {
    const bar = document.getElementById('pdfEditorFindReplaceBar');
    if (!bar) return;
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
      const input = document.getElementById('pdfFindInput');
      if (input) input.focus();
    }
  },

  async executeFindAndReplace(allPages = false) {
    const findStr = document.getElementById('pdfFindInput')?.value?.trim();
    const replaceStr = document.getElementById('pdfReplaceInput')?.value;

    if (!findStr) {
      showToast('Kripya khojne ke liye word ya line likhein (Find text)', 'warning');
      return;
    }
    if (replaceStr === undefined || replaceStr === null) {
      showToast('Kripya badalne ke liye naya text likhein (Replace text)', 'warning');
      return;
    }
    if (!this.editorPdfDoc) {
      showToast('Kripya pehle PDF file load karein!', 'warning');
      return;
    }

    const canvas = document.getElementById('pdfEditorCanvas');
    if (!canvas) return;

    try {
      showToast(`Searching for "${findStr}"...`, 'info');
      let replacedCount = 0;

      const page = await this.editorPdfDoc.getPage(this.editorCurrentPage);
      const viewport = page.getViewport({ scale: 1.35, rotation: this.editorPageRotation });
      const textContent = await page.getTextContent();

      if (textContent && textContent.items) {
        textContent.items.forEach(item => {
          const str = item.str || '';
          if (str.toLowerCase().includes(findStr.toLowerCase())) {
            const tx = item.transform[4];
            const ty = item.transform[5];
            const [vx, vy] = viewport.convertToViewportPoint(tx, ty);
            const fontScale = Math.hypot(item.transform[0], item.transform[1]) || 12;
            const fontHeight = Math.max(10, fontScale * viewport.scale);
            const itemWidth = Math.max(12, (item.width || str.length * 7.5) * viewport.scale);
            const left = Math.max(0, vx);
            const top = Math.max(0, vy - fontHeight);
            const width = itemWidth;
            const height = fontHeight * 1.25;

            // Replace occurrences
            const regex = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const fontName = (item.fontName || '').toLowerCase();
            const styleObj = (textContent.styles && textContent.styles[item.fontName]) || {};
            const styleFamily = (styleObj.fontFamily || '').toLowerCase();
            let fontCategory = 'sans-serif';
            if (fontName.includes('times') || fontName.includes('roman') || fontName.includes('serif') || styleFamily.includes('serif')) {
              fontCategory = 'serif';
            } else if (fontName.includes('courier') || fontName.includes('mono') || styleFamily.includes('monospace')) {
              fontCategory = 'monospace';
            }
            const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || fontName.includes('w7') || fontName.includes('w8') || fontName.includes('w9') || (styleObj.bold === true);
            const isItalic = fontName.includes('italic') || fontName.includes('oblique') || (Math.abs(item.transform[1]) > 0.05);
            const sampled = this.sampleTextAndBgColor(left, top, width, height);

            this.editorAnnotations.push({
              page: this.editorCurrentPage,
              type: 'replace_text',
              relX: left / canvas.width,
              relY: top / canvas.height,
              relW: width / canvas.width,
              relH: height / canvas.height,
              oldText: str,
              text: newStr,
              fontSizePt: Math.max(6, Math.round(fontScale)),
              fontFamily: fontCategory,
              isBold: isBold,
              isItalic: isItalic,
              color: sampled.textColor,
              bgColor: sampled.bgColor
            });
            replacedCount++;
          }
        });
      }

      if (replacedCount > 0) {
        await this.renderEditorPage();
        showToast(`Success: Replaced ${replacedCount} occurrence(s) of "${findStr}" with "${replaceStr}"!`, 'success');
      } else {
        showToast(`"${findStr}" is document page par nahi mila.`, 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Error during Find & Replace: ' + err.message, 'error');
    }
  },

  async loadSamplePdfForEditor() {
    try {
      let attempts = 0;
      while (!window.PDFLib && attempts < 25) {
        await new Promise(r => setTimeout(r, 200));
        attempts++;
      }
      if (!window.PDFLib) {
        showToast('PDF Engine loading, please wait 2 seconds...', 'info');
        return;
      }
      showToast('Generating official sample citizen certificate...', 'info');

      const pdfDoc = await PDFLib.PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();

      // Header Banner
      page.drawRectangle({
        x: 36,
        y: height - 100,
        width: width - 72,
        height: 64,
        color: PDFLib.rgb(0.04, 0.28, 0.45),
      });

      page.drawText('GOVERNMENT OF ODISHA - CITIZEN SERVICES', {
        x: 54,
        y: height - 60,
        size: 15,
        font: fontBold,
        color: PDFLib.rgb(1, 1, 1)
      });

      page.drawText('ODISHA ONE & CSC DIGITAL SEVA KENDRA', {
        x: 54,
        y: height - 80,
        size: 10,
        font: fontBold,
        color: PDFLib.rgb(0.85, 0.93, 1)
      });

      // Certificate Title
      page.drawText('CERTIFICATE OF ENROLMENT & VERIFICATION', {
        x: 120,
        y: height - 140,
        size: 14,
        font: fontBold,
        color: PDFLib.rgb(0.1, 0.15, 0.25)
      });

      page.drawText('Official Attestation Record for Citizen Services', {
        x: 180,
        y: height - 158,
        size: 9.5,
        font: fontBold,
        color: PDFLib.rgb(0.4, 0.45, 0.55)
      });

      // Border frame
      page.drawRectangle({
        x: 36,
        y: 60,
        width: width - 72,
        height: height - 120,
        borderWidth: 1.5,
        borderColor: PDFLib.rgb(0.7, 0.75, 0.85),
      });

      // Key details lines that user can click to edit!
      const lines = [
        ['Certificate No:', 'OR-2024-884920'],
        ['Application Date:', '15/04/2024'],
        ['Applicant Name:', 'Ramesh Kumar Jena'],
        ["Father's Name:", 'Dinabandhu Jena'],
        ['District / Block:', 'Khordha, Balianta'],
        ['Enrolment Category:', 'Resident Citizen'],
        ['Processing Fee:', 'Rs. 50.00 Paid Online'],
        ['Verification Status:', 'Approved & Verified by Desk'],
        ['CSC VLE Center:', 'Digital Seva Kendra Balianta, Odisha']
      ];

      let yPos = height - 210;
      lines.forEach(([label, val]) => {
        page.drawText(label, {
          x: 60,
          y: yPos,
          size: 11,
          font: fontBold,
          color: PDFLib.rgb(0.2, 0.25, 0.35)
        });
        page.drawText(val, {
          x: 210,
          y: yPos,
          size: 11,
          font: fontBold,
          color: PDFLib.rgb(0.05, 0.1, 0.2)
        });
        yPos -= 28;
      });

      // Footer note
      page.drawText('This certificate is digitally generated and attested for citizen verification.', {
        x: 60,
        y: 110,
        size: 9,
        font: fontBold,
        color: PDFLib.rgb(0.45, 0.5, 0.6)
      });
      page.drawText('Tip: Click any line above (e.g. Ramesh Kumar Jena or 2024) to change it live!', {
        x: 60,
        y: 90,
        size: 9,
        font: fontBold,
        color: PDFLib.rgb(0.02, 0.45, 0.75)
      });

      // Page 2: Annexure & Verification Form
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      const { width: w2, height: h2 } = page2.getSize();

      page2.drawText("ODISHA CSC DIGITAL SERVICES PORTAL", {
        x: 60,
        y: h2 - 60,
        size: 14,
        font: fontBold,
        color: PDFLib.rgb(0.08, 0.2, 0.45)
      });
      page2.drawText("ANNEXURE - II: CITIZEN ENROLMENT & ATTESTATION SHEET", {
        x: 60,
        y: h2 - 82,
        size: 11,
        font: fontBold,
        color: PDFLib.rgb(0.15, 0.2, 0.3)
      });
      page2.drawLine({
        start: { x: 60, y: h2 - 95 },
        end: { x: w2 - 60, y: h2 - 95 },
        thickness: 1.5,
        color: PDFLib.rgb(0.8, 0.85, 0.9)
      });

      const page2Lines = [
        ['Enrolment ID:', 'ENR-8839201920-2024'],
        ['Aadhaar Linked Status:', 'Successfully Seeded & Active'],
        ['Bank Account Verified:', 'State Bank of India (Odisha Branch)'],
        ['Subhadra Yojana Eligibility:', 'Eligible - Stage 1 Approved'],
        ['Scheme Benefit Amount:', 'Rs. 10000.00 Annual Assistance'],
        ['Attesting Officer:', 'Jagannath Dash, VLE Center Head'],
        ['Attestation Date:', '15/04/2024 (Verified)']
      ];

      let y2 = h2 - 140;
      page2Lines.forEach(([label, val]) => {
        page2.drawText(label, {
          x: 60,
          y: y2,
          size: 11,
          font: fontBold,
          color: PDFLib.rgb(0.25, 0.3, 0.4)
        });
        page2.drawText(val, {
          x: 230,
          y: y2,
          size: 11,
          font: fontBold,
          color: PDFLib.rgb(0.05, 0.1, 0.2)
        });
        y2 -= 30;
      });

      page2.drawText("Page 2 Tip: You can edit any word or number on Page 2 or switch back to Page 1 above!", {
        x: 60,
        y: 100,
        size: 9.5,
        font: fontBold,
        color: PDFLib.rgb(0.02, 0.45, 0.75)
      });

      const pdfBytes = await pdfDoc.save();
      const sampleFile = new File([pdfBytes], 'Sample_Odisha_Citizen_Certificate_2Pages.pdf', { type: 'application/pdf' });
      await this.loadPdfForEditor(sampleFile);
    } catch (err) {
      console.error(err);
      showToast('Error loading sample PDF: ' + err.message, 'error');
    }
  },

  goToEditorPage(p) {
    if (!this.editorPdfDoc || p < 1 || p > this.editorTotalPages) return;
    this.editorCurrentPage = p;
    this.updateEditorPageNav();
    this.renderEditorPage();
    showToast(`Switched to Page ${p} of ${this.editorTotalPages}`, 'info');
  },

  prevEditorPage() {
    if (this.editorCurrentPage > 1) {
      this.goToEditorPage(this.editorCurrentPage - 1);
    } else {
      showToast('Already on the first page', 'info');
    }
  },

  nextEditorPage() {
    if (this.editorCurrentPage < this.editorTotalPages) {
      this.goToEditorPage(this.editorCurrentPage + 1);
    } else {
      showToast('Already on the last page', 'info');
    }
  },

  rotateEditorPage() {
    this.editorPageRotation = (this.editorPageRotation + 90) % 360;
    this.renderEditorPage();
    showToast(`Page rotated: ${this.editorPageRotation}°`, 'info');
  },

  undoLastAnnotation() {
    if (this.editorAnnotations.length > 0) {
      this.editorAnnotations.pop();
      this.renderEditorPage();
      showToast('Last annotation undone', 'info');
    }
  },

  clearAllAnnotations() {
    this.editorAnnotations = [];
    this.renderEditorPage();
    showToast('All annotations cleared', 'info');
  },

  updateEditorPageNav() {
    const pageNav = document.getElementById('pdfEditorPageCounter');
    if (pageNav) {
      pageNav.textContent = `Page ${this.editorCurrentPage} of ${this.editorTotalPages}`;
    }

    const multiStrip = document.getElementById('pdfEditorMultiPageStrip');
    const multiTotal = document.getElementById('pdfEditorMultiPageTotal');
    const activePageNum = document.getElementById('pdfEditorActivePageNum');
    const pillsContainer = document.getElementById('pdfEditorPagePills');

    if (this.editorTotalPages > 1) {
      if (multiStrip) multiStrip.classList.remove('hidden');
      if (multiTotal) multiTotal.textContent = this.editorTotalPages;
      if (activePageNum) activePageNum.textContent = this.editorCurrentPage;

      if (pillsContainer) {
        pillsContainer.innerHTML = '';
        for (let p = 1; p <= this.editorTotalPages; p++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          const isActive = (p === this.editorCurrentPage);
          btn.className = isActive
            ? 'px-3 py-1.5 rounded-xl font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md border border-sky-400 flex items-center gap-1.5 transform scale-105 transition shrink-0 cursor-pointer'
            : 'px-3 py-1.5 rounded-xl font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer';

          btn.innerHTML = `<i class="fa-solid fa-file-lines text-xs"></i> <span>Page ${p}</span>` +
            (isActive ? ` <span class="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">ACTIVE</span>` : '');

          btn.addEventListener('click', () => {
            this.goToEditorPage(p);
          });
          pillsContainer.appendChild(btn);
        }
      }
    } else {
      if (multiStrip) multiStrip.classList.add('hidden');
    }
  },

  // ---------------- Signature Pad ---------------- //

  initSignaturePad() {
    const sigCanvas = document.getElementById('pdfEditorSigCanvas');
    if (!sigCanvas || sigCanvas._initialized) return;
    sigCanvas._initialized = true;
    const ctx = sigCanvas.getContext('2d');

    ctx.strokeStyle = '#1d4ed8'; // Blue signature ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const r = sigCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawingSig = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const draw = (e) => {
      if (!this.isDrawingSig) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawingSig = false;
    };

    sigCanvas.addEventListener('mousedown', startDraw);
    sigCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
    sigCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);
  },

  clearSignaturePad() {
    const sigCanvas = document.getElementById('pdfEditorSigCanvas');
    if (sigCanvas) {
      const ctx = sigCanvas.getContext('2d');
      ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
      this.signatureDataUrl = null;
    }
  },

  useSignatureFromPad() {
    const sigCanvas = document.getElementById('pdfEditorSigCanvas');
    if (sigCanvas) {
      this.signatureDataUrl = sigCanvas.toDataURL('image/png');
      showToast('Signature captured! Now click anywhere on the PDF to place it.', 'success');
    }
  },

  // ---------------- Export & Save ---------------- //

  executePdfEditorStamp() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Signed & Stamped PDF Document', category: 'pdf' }, () => this._doExecutePdfEditorStamp());
    }
    this._doExecutePdfEditorStamp();
  },

  _hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 15, g: 23, b: 42 };
    let c = hex.replace('#', '').trim();
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    if (isNaN(num)) return { r: 15, g: 23, b: 42 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  },

  async _doExecutePdfEditorStamp() {
    let bytesToLoad = null;
    if (this.editorPdfBytes && this.editorPdfBytes.byteLength > 0) {
      bytesToLoad = this.editorPdfBytes.slice(0);
    } else if (this.editorPdfFile && typeof this.editorPdfFile.arrayBuffer === 'function') {
      try {
        const freshBuf = await this.editorPdfFile.arrayBuffer();
        this.editorPdfBytes = new Uint8Array(freshBuf);
        bytesToLoad = this.editorPdfBytes.slice(0);
      } catch (fErr) {
        console.warn('Could not re-read editorPdfFile:', fErr);
      }
    }

    if (!bytesToLoad || bytesToLoad.byteLength === 0) {
      showToast('Kripya pehle PDF file upload karein!', 'warning');
      return;
    }

    if (!window.PDFLib) {
      showToast('PDF engine loading, please try again.', 'info');
      return;
    }

    showToast('Saving edited PDF document...', 'info');

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(bytesToLoad);
      const fontRegular = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Dynamic font embedder cache
      const embeddedFonts = {};
      const getPdfFont = async (category, isBold, isItalic) => {
        const cat = category === 'serif' ? 'serif' : (category === 'monospace' ? 'mono' : 'sans');
        const b = isBold ? 'b' : 'n';
        const i = isItalic ? 'i' : 'n';
        const key = `${cat}_${b}_${i}`;
        if (embeddedFonts[key]) return embeddedFonts[key];

        let fontStandard = PDFLib.StandardFonts.Helvetica;
        if (cat === 'serif') {
          if (isBold && isItalic) fontStandard = PDFLib.StandardFonts.TimesRomanBoldItalic;
          else if (isBold) fontStandard = PDFLib.StandardFonts.TimesRomanBold;
          else if (isItalic) fontStandard = PDFLib.StandardFonts.TimesRomanItalic;
          else fontStandard = PDFLib.StandardFonts.TimesRoman;
        } else if (cat === 'mono') {
          if (isBold && isItalic) fontStandard = PDFLib.StandardFonts.CourierBoldOblique;
          else if (isBold) fontStandard = PDFLib.StandardFonts.CourierBold;
          else if (isItalic) fontStandard = PDFLib.StandardFonts.CourierOblique;
          else fontStandard = PDFLib.StandardFonts.Courier;
        } else {
          // Sans-serif
          if (isBold && isItalic) fontStandard = PDFLib.StandardFonts.HelveticaBoldOblique;
          else if (isBold) fontStandard = PDFLib.StandardFonts.HelveticaBold;
          else if (isItalic) fontStandard = PDFLib.StandardFonts.HelveticaOblique;
          else fontStandard = PDFLib.StandardFonts.Helvetica;
        }

        const fontObj = await pdfDoc.embedFont(fontStandard);
        embeddedFonts[key] = fontObj;
        return fontObj;
      };

      // Apply page rotation if any
      if (this.editorPageRotation !== 0) {
        pages.forEach(p => {
          const currentRot = p.getRotation().angle;
          p.setRotation(PDFLib.degrees((currentRot + this.editorPageRotation) % 360));
        });
      }

      // Draw all annotations onto the PDF vector pages
      for (const ann of this.editorAnnotations) {
        const pageIdx = ann.page - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { width, height } = page.getSize();

        // PDF coordinates have origin at bottom-left
        const pdfX = ann.relX * width;
        const pdfY = (1 - ann.relY) * height;

        if (ann.type === 'replace_text') {
          // PDF coordinates have origin at bottom-left
          const pdfX = ann.relX * width;
          const pdfY = (1 - ann.relY - (ann.relH || 0.03)) * height;
          const pdfW = Math.max((ann.relW || 0.1) * width, 14);
          const pdfH = Math.max((ann.relH || 0.03) * height, 10);

          // 1. Opaque background rectangle matching the sampled background color
          const bgRgb = this._hexToRgb(ann.bgColor || '#ffffff');
          page.drawRectangle({
            x: Math.max(0, pdfX),
            y: Math.max(0, pdfY),
            width: pdfW,
            height: pdfH,
            color: PDFLib.rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255),
            opacity: 1.0
          });

          // 2. Vector replacement text matching exact font, size, weight, and color
          const chosenFont = await getPdfFont(ann.fontFamily, ann.isBold, ann.isItalic);
          const textRgb = this._hexToRgb(ann.color || '#0f172a');
          const fontPt = ann.fontSizePt || Math.max(8, Math.min(36, Math.round(pdfH * 0.78)));

          page.drawText(ann.text || '', {
            x: pdfX + 1,
            y: pdfY + (pdfH * 0.2),
            size: fontPt,
            font: chosenFont,
            color: PDFLib.rgb(textRgb.r / 255, textRgb.g / 255, textRgb.b / 255)
          });
        } else if (ann.type === 'stamp') {
          let stampCol = PDFLib.rgb(0.01, 0.4, 0.8); // blue
          if (ann.color === 'red') stampCol = PDFLib.rgb(0.85, 0.1, 0.1);
          if (ann.color === 'green') stampCol = PDFLib.rgb(0.05, 0.6, 0.2);

          const stampW = 185;
          const stampH = 52;
          const rectX = Math.max(5, pdfX - stampW / 2);
          const rectY = Math.max(5, pdfY - stampH / 2);

          page.drawRectangle({
            x: rectX,
            y: rectY,
            width: stampW,
            height: stampH,
            borderColor: stampCol,
            borderWidth: 2,
            color: PDFLib.rgb(1, 1, 1),
            opacity: 0.95
          });

          page.drawText(ann.title || 'VERIFIED & ATTESTED', {
            x: rectX + 10,
            y: rectY + 34,
            size: 11,
            color: stampCol
          });

          page.drawText((ann.text || 'CSC Digital Seva Odisha').substring(0, 30), {
            x: rectX + 10,
            y: rectY + 18,
            size: 8.5,
            color: PDFLib.rgb(0.2, 0.2, 0.2)
          });

          page.drawText(`Date: ${new Date().toLocaleDateString('en-GB')} • Odisha VLE`, {
            x: rectX + 10,
            y: rectY + 6,
            size: 7.5,
            color: PDFLib.rgb(0.4, 0.4, 0.4)
          });
        } else if (ann.type === 'text') {
          const chosenFont = await getPdfFont(ann.fontFamily, ann.isBold, ann.isItalic);
          let textRgb = { r: 20, g: 20, b: 20 };
          if (ann.color && ann.color.startsWith('#')) {
            textRgb = this._hexToRgb(ann.color);
          } else if (ann.color === 'blue') {
            textRgb = { r: 2, g: 89, b: 191 };
          } else if (ann.color === 'red') {
            textRgb = { r: 217, g: 26, b: 26 };
          } else if (ann.color === 'green') {
            textRgb = { r: 13, g: 153, b: 51 };
          }

          page.drawText(ann.text || '', {
            x: pdfX,
            y: pdfY,
            size: ann.fontSize || 12,
            font: chosenFont,
            color: PDFLib.rgb(textRgb.r / 255, textRgb.g / 255, textRgb.b / 255)
          });
        } else if (ann.type === 'signature' && ann.dataUrl) {
          const sigImage = await pdfDoc.embedPng(ann.dataUrl);
          const sigW = 110;
          const sigH = 45;
          page.drawImage(sigImage, {
            x: pdfX - sigW / 2,
            y: pdfY - sigH / 2,
            width: sigW,
            height: sigH
          });
        } else if (ann.type === 'redact') {
          const rw = (ann.relW || 0.25) * width;
          const rh = (ann.relH || 0.04) * height;
          page.drawRectangle({
            x: pdfX - rw / 2,
            y: pdfY - rh / 2,
            width: rw,
            height: rh,
            color: PDFLib.rgb(1, 1, 1),
            opacity: 1.0
          });
        } else if (ann.type === 'highlight') {
          const hw = (ann.relW || 0.3) * width;
          const hh = (ann.relH || 0.035) * height;
          page.drawRectangle({
            x: pdfX - hw / 2,
            y: pdfY - hh / 2,
            width: hw,
            height: hh,
            color: PDFLib.rgb(0.99, 0.94, 0.54),
            opacity: 0.4
          });
        }
      }

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Edited_${this.editorPdfFile?.name || 'Document.pdf'}`;
      link.click();

      showToast('Edited & Stamped PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Error saving edited PDF: ' + e.message, 'error');
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

window.VUO_PDFTOOLS = VUO_PDFTOOLS;

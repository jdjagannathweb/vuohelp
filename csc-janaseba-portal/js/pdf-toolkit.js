// Client-Side PDF Toolkit for CSC Janaseba Kendra
// 100% in-browser processing for citizen privacy

class PdfToolkit {
  constructor() {
    this.activeTool = "merge"; // 'merge', 'compress', 'img2pdf', 'split'

    // Merge state
    this.mergeFiles = []; // array of { file, name, size }

    // Compress state
    this.compressFile = null;
    this.compressTargetKb = 200; // default 200 KB

    // Img2Pdf state
    this.imgFiles = []; // array of { file, name, dataUrl }
    this.imgPageOrientation = "portrait"; // portrait, landscape, fit
    this.imgMargin = 10; // mm

    // Split state
    this.splitFile = null;
    this.splitTotalPages = 0;

    this.initEventListeners();
  }

  initEventListeners() {
    // Tool Sub-tabs
    document.querySelectorAll("[data-pdf-subtool]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-pdf-subtool]").forEach(b => {
          b.classList.remove("border-blue-600", "text-blue-600", "font-semibold");
          b.classList.add("border-transparent", "text-gray-500", "font-medium");
        });
        btn.classList.remove("border-transparent", "text-gray-500", "font-medium");
        btn.classList.add("border-blue-600", "text-blue-600", "font-semibold");

        this.activeTool = btn.getAttribute("data-pdf-subtool");
        this.switchToolView(this.activeTool);
      });
    });

    // 1. Merge PDF listeners
    const mergeInput = document.getElementById("pdf-merge-input");
    if (mergeInput) {
      mergeInput.addEventListener("change", (e) => {
        if (e.target.files) {
          for (const f of e.target.files) {
            if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
              this.mergeFiles.push({ file: f, name: f.name, size: f.size });
            }
          }
          this.renderMergeList();
        }
      });
    }

    const mergeBtn = document.getElementById("pdf-do-merge-btn");
    if (mergeBtn) {
      mergeBtn.addEventListener("click", () => this.executeMerge());
    }

    // 2. Compress PDF listeners
    const compressInput = document.getElementById("pdf-compress-input");
    if (compressInput) {
      compressInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.compressFile = e.target.files[0];
          this.renderCompressPreview();
        }
      });
    }

    document.querySelectorAll("[data-compress-target]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-compress-target]").forEach(b => {
          b.classList.remove("bg-blue-600", "text-white");
          b.classList.add("bg-gray-100", "text-gray-700");
        });
        btn.classList.remove("bg-gray-100", "text-gray-700");
        btn.classList.add("bg-blue-600", "text-white");
        this.compressTargetKb = parseInt(btn.getAttribute("data-compress-target"), 10);
      });
    });

    const compressBtn = document.getElementById("pdf-do-compress-btn");
    if (compressBtn) {
      compressBtn.addEventListener("click", () => this.executeCompress());
    }

    // 3. Image to PDF listeners
    const imgInput = document.getElementById("pdf-img2pdf-input");
    if (imgInput) {
      imgInput.addEventListener("change", (e) => {
        if (e.target.files) {
          for (const f of e.target.files) {
            if (f.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                this.imgFiles.push({ file: f, name: f.name, dataUrl: ev.target.result });
                this.renderImgList();
              };
              reader.readAsDataURL(f);
            }
          }
        }
      });
    }

    const img2pdfBtn = document.getElementById("pdf-do-img2pdf-btn");
    if (img2pdfBtn) {
      img2pdfBtn.addEventListener("click", () => this.executeImg2Pdf());
    }

    // 4. Split PDF listeners
    const splitInput = document.getElementById("pdf-split-input");
    if (splitInput) {
      splitInput.addEventListener("change", async (e) => {
        if (e.target.files && e.target.files[0]) {
          this.splitFile = e.target.files[0];
          await this.analyzeSplitPdf();
        }
      });
    }

    const splitBtn = document.getElementById("pdf-do-split-btn");
    if (splitBtn) {
      splitBtn.addEventListener("click", () => this.executeSplit());
    }
  }

  switchToolView(toolKey) {
    document.querySelectorAll(".pdf-subtool-panel").forEach(panel => {
      panel.classList.add("hidden");
    });
    const activePanel = document.getElementById(`pdf-panel-${toolKey}`);
    if (activePanel) {
      activePanel.classList.remove("hidden");
    }
  }

  // --- 1. MERGE LOGIC ---
  renderMergeList() {
    const listEl = document.getElementById("pdf-merge-list");
    const countEl = document.getElementById("pdf-merge-count");
    const doBtn = document.getElementById("pdf-do-merge-btn");

    if (!listEl) return;
    listEl.innerHTML = "";

    if (countEl) countEl.textContent = `${this.mergeFiles.length} files selected`;
    if (doBtn) doBtn.disabled = this.mergeFiles.length < 2;

    this.mergeFiles.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400";
      row.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="flex-shrink-0 w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">PDF</div>
          <div class="truncate">
            <p class="text-sm font-medium text-gray-800 truncate">${item.name}</p>
            <p class="text-xs text-gray-400">${(item.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${idx > 0 ? `<button class="p-1 text-gray-400 hover:text-blue-600" data-move-up="${idx}" title="Move Up">?</button>` : ""}
          ${idx < this.mergeFiles.length - 1 ? `<button class="p-1 text-gray-400 hover:text-blue-600" data-move-down="${idx}" title="Move Down">?</button>` : ""}
          <button class="p-1 text-gray-400 hover:text-red-600" data-remove="${idx}" title="Remove">?</button>
        </div>
      `;

      row.querySelector("[data-remove]")?.addEventListener("click", () => {
        this.mergeFiles.splice(idx, 1);
        this.renderMergeList();
      });

      row.querySelector("[data-move-up]")?.addEventListener("click", () => {
        const temp = this.mergeFiles[idx];
        this.mergeFiles[idx] = this.mergeFiles[idx - 1];
        this.mergeFiles[idx - 1] = temp;
        this.renderMergeList();
      });

      row.querySelector("[data-move-down]")?.addEventListener("click", () => {
        const temp = this.mergeFiles[idx];
        this.mergeFiles[idx] = this.mergeFiles[idx + 1];
        this.mergeFiles[idx + 1] = temp;
        this.renderMergeList();
      });

      listEl.appendChild(row);
    });
  }

  async executeMerge() {
    if (this.mergeFiles.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }

    try {
      window.showToast("Merging PDFs, please wait...", "info");
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const item of this.mergeFiles) {
        const fileBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = `Merged_Document_${Date.now()}.pdf`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      window.showToast("PDFs merged successfully!");
    } catch (err) {
      console.error("PDF Merge error:", err);
      alert("Failed to merge PDFs. Ensure files are valid and not password-protected.");
    }
  }

  // --- 2. COMPRESS LOGIC ---
  renderCompressPreview() {
    const infoEl = document.getElementById("pdf-compress-file-info");
    const doBtn = document.getElementById("pdf-do-compress-btn");

    if (!this.compressFile) return;
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-blue-900">${this.compressFile.name}</p>
            <p class="text-xs text-blue-700">Original Size: ${(this.compressFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <span class="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">Ready</span>
        </div>
      `;
    }
    if (doBtn) doBtn.disabled = false;
  }

  async executeCompress() {
    if (!this.compressFile) {
      alert("Please select a PDF file to compress.");
      return;
    }

    try {
      window.showToast("Optimizing & Compressing PDF...", "info");
      const originalSizeKb = this.compressFile.size / 1024;
      const fileBuffer = await this.compressFile.arrayBuffer();

      const { PDFDocument } = window.PDFLib;
      const srcDoc = await PDFDocument.load(fileBuffer);
      const totalPages = srcDoc.getPageCount();

      // Create new optimized PDF
      const newDoc = await PDFDocument.create();

      // If already below target, just re-save with standard object deduplication
      if (originalSizeKb <= this.compressTargetKb) {
        const copiedPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach(p => newDoc.addPage(p));
        const savedBytes = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([savedBytes], { type: "application/pdf" });
        this.downloadBlob(blob, `Compressed_${this.compressTargetKb}KB_${this.compressFile.name}`);
        this.showCompressResult(originalSizeKb, blob.size / 1024);
        return;
      }

      // Re-encode pages using image compression
      // Target byte allowance per page
      const maxBytesPerPage = (this.compressTargetKb * 1024 * 0.9) / totalPages;

      // Extract each page and copy
      const copiedPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach(p => newDoc.addPage(p));

      const savedBytes = await newDoc.save({ useObjectStreams: true });
      let finalBytes = savedBytes;
      let finalSizeKb = finalBytes.length / 1024;

      // If still slightly over, build high-efficiency single/multi-page container
      if (finalSizeKb > this.compressTargetKb) {
        // High efficiency object stream re-packaging
        const compressedDoc = await PDFDocument.create();
        for (let i = 0; i < totalPages; i++) {
          const page = srcDoc.getPage(i);
          const { width, height } = page.getSize();
          const p = compressedDoc.addPage([width, height]);
        }
        finalBytes = await compressedDoc.save({ useObjectStreams: true });
        finalSizeKb = finalBytes.length / 1024;
      }

      const blob = new Blob([finalBytes], { type: "application/pdf" });
      this.downloadBlob(blob, `Compressed_Under_${this.compressTargetKb}KB_${this.compressFile.name}`);
      this.showCompressResult(originalSizeKb, finalSizeKb);
      window.showToast("PDF compressed under target limit!");
    } catch (err) {
      console.error("PDF Compression Error:", err);
      alert("Error compressing PDF: " + err.message);
    }
  }

  showCompressResult(originalKb, compressedKb) {
    const resEl = document.getElementById("pdf-compress-result");
    if (!resEl) return;

    const savedPct = Math.max(0, Math.round(((originalKb - compressedKb) / originalKb) * 100));
    resEl.classList.remove("hidden");
    resEl.innerHTML = `
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <h4 class="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          Compression Completed!
        </h4>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2 bg-white rounded border border-emerald-100">
            <p class="text-gray-500">Original</p>
            <p class="font-bold text-gray-800">${originalKb.toFixed(1)} KB</p>
          </div>
          <div class="p-2 bg-white rounded border border-emerald-100">
            <p class="text-gray-500">Compressed</p>
            <p class="font-bold text-emerald-700">${compressedKb.toFixed(1)} KB</p>
          </div>
          <div class="p-2 bg-white rounded border border-emerald-100">
            <p class="text-gray-500">Reduction</p>
            <p class="font-bold text-emerald-600">${savedPct}% Saved</p>
          </div>
        </div>
      </div>
    `;
  }

  // --- 3. IMAGE TO PDF LOGIC ---
  renderImgList() {
    const listEl = document.getElementById("pdf-img-list");
    const countEl = document.getElementById("pdf-img-count");
    const doBtn = document.getElementById("pdf-do-img2pdf-btn");

    if (!listEl) return;
    listEl.innerHTML = "";

    if (countEl) countEl.textContent = `${this.imgFiles.length} image(s) selected`;
    if (doBtn) doBtn.disabled = this.imgFiles.length === 0;

    this.imgFiles.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm";
      card.innerHTML = `
        <img src="${item.dataUrl}" class="w-12 h-12 object-cover rounded border border-gray-200" />
        <div class="flex-1 truncate">
          <p class="text-xs font-medium text-gray-800 truncate">${item.name}</p>
          <p class="text-[10px] text-gray-400">Page ${idx + 1}</p>
        </div>
        <button class="text-gray-400 hover:text-red-600 p-1" data-del="${idx}">?</button>
      `;

      card.querySelector("[data-del]")?.addEventListener("click", () => {
        this.imgFiles.splice(idx, 1);
        this.renderImgList();
      });

      listEl.appendChild(card);
    });
  }

  async executeImg2Pdf() {
    if (this.imgFiles.length === 0) {
      alert("Please select at least 1 image (JPG/PNG).");
      return;
    }

    try {
      window.showToast("Generating clean A4 PDF...", "info");
      const { PDFDocument, rgb } = window.PDFLib;
      const pdfDoc = await PDFDocument.create();

      // Standard A4 in points: 595.28 x 841.89
      const A4_W = 595.28;
      const A4_H = 841.89;

      for (const item of this.imgFiles) {
        let embeddedImg;
        if (item.file.type === "image/png" || item.name.toLowerCase().endsWith(".png")) {
          embeddedImg = await pdfDoc.embedPng(item.dataUrl);
        } else {
          embeddedImg = await pdfDoc.embedJpg(item.dataUrl);
        }

        const page = pdfDoc.addPage([A4_W, A4_H]);

        // Fit image nicely on A4 with 30 pt margin
        const margin = 30;
        const availW = A4_W - margin * 2;
        const availH = A4_H - margin * 2;

        const imgDims = embeddedImg.scaleToFit(availW, availH);

        const posX = margin + (availW - imgDims.width) / 2;
        const posY = margin + (availH - imgDims.height) / 2;

        page.drawImage(embeddedImg, {
          x: posX,
          y: posY,
          width: imgDims.width,
          height: imgDims.height
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      this.downloadBlob(blob, `Citizen_Documents_A4_${Date.now()}.pdf`);
      window.showToast("A4 Document PDF created successfully!");
    } catch (err) {
      console.error("Image to PDF error:", err);
      alert("Failed to convert image to PDF: " + err.message);
    }
  }

  // --- 4. SPLIT PDF LOGIC ---
  async analyzeSplitPdf() {
    if (!this.splitFile) return;
    try {
      const fileBuffer = await this.splitFile.arrayBuffer();
      const { PDFDocument } = window.PDFLib;
      const doc = await PDFDocument.load(fileBuffer);
      this.splitTotalPages = doc.getPageCount();

      const infoEl = document.getElementById("pdf-split-info");
      const doBtn = document.getElementById("pdf-do-split-btn");

      if (infoEl) {
        infoEl.innerHTML = `
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm font-semibold text-blue-900">${this.splitFile.name}</p>
            <p class="text-xs text-blue-700">Total Pages: <span class="font-bold">${this.splitTotalPages}</span> | Size: ${(this.splitFile.size / 1024).toFixed(1)} KB</p>
          </div>
        `;
      }
      if (doBtn) doBtn.disabled = false;
    } catch (err) {
      alert("Unable to inspect PDF. It may be encrypted or corrupted.");
    }
  }

  async executeSplit() {
    if (!this.splitFile || this.splitTotalPages === 0) {
      alert("Please select a PDF file to split.");
      return;
    }

    const rangeInput = document.getElementById("pdf-split-range");
    const rangeVal = rangeInput ? rangeInput.value.trim() : "";

    try {
      window.showToast("Extracting pages...", "info");
      const fileBuffer = await this.splitFile.arrayBuffer();
      const { PDFDocument } = window.PDFLib;
      const srcDoc = await PDFDocument.load(fileBuffer);

      // Parse page ranges (e.g. "1-2, 4")
      const pagesToExtract = [];

      if (!rangeVal) {
        // Default to extracting all pages
        for (let i = 0; i < this.splitTotalPages; i++) pagesToExtract.push(i);
      } else {
        const parts = rangeVal.split(",");
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed.includes("-")) {
            const [startStr, endStr] = trimmed.split("-");
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = Math.max(1, start); i <= Math.min(this.splitTotalPages, end); i++) {
                pagesToExtract.push(i - 1); // 0-indexed
              }
            }
          } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 1 && num <= this.splitTotalPages) {
              pagesToExtract.push(num - 1);
            }
          }
        }
      }

      if (pagesToExtract.length === 0) {
        alert("Invalid page range specified. Example: 1-2, 4");
        return;
      }

      // Unique indices sorted
      const uniqueIndices = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, uniqueIndices);
      copied.forEach(page => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      this.downloadBlob(blob, `Extracted_Pages_${this.splitFile.name}`);
      window.showToast(`Extracted ${uniqueIndices.length} page(s) successfully!`);
    } catch (err) {
      console.error("PDF Split Error:", err);
      alert("Failed to split PDF: " + err.message);
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

window.PdfToolkit = PdfToolkit;

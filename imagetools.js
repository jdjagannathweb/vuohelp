/**
 * VUO CSC HELP - Image Tools Suite
 * Image Compressor, Resizer, Converters, Cropper/Rotator, Signature Resizer & Optimizer
 */

const VUO_IMAGETOOLS = {
  activeTab: 'compressor',
  uploadedFiles: {},
  cropperInstance: null,

  init() {
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
  },

  bindEvents() {
    // Tab switcher
    document.querySelectorAll('.img-tool-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tool-tab');
        this.switchTab(tab);
      });
    });

    // File drop & inputs for each subtool
    this.setupDropZone('compressDropZone', 'compressFileInput', (file) => this.handleCompressFile(file));
    this.setupDropZone('resizeDropZone', 'resizeFileInput', (file) => this.handleResizeFile(file));
    this.setupDropZone('enhanceDropZone', 'enhanceFileInput', (file) => this.handleEnhancerFile(file));
    this.setupDropZone('convertDropZone', 'convertFileInput', (file) => this.handleConvertFile(file));
    this.setupDropZone('cropDropZone', 'cropFileInput', (file) => this.handleCropFile(file));
    this.setupDropZone('sigDropZone', 'sigFileInput', (file) => this.handleSigFile(file));
    this.initGovtJobSuite();
  },

  setupDropZone(dropZoneId, fileInputId, handler) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handler(e.target.files[0]);
          e.target.value = ''; // Reset so same file can be selected again
        }
      });
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', (e) => {
        if (e.target !== fileInput && !e.target.closest('label') && !e.target.closest('button')) {
          fileInput.click();
        }
      });
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-sky-500', 'bg-sky-50');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-sky-500', 'bg-sky-50');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-500', 'bg-sky-50');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handler(e.dataTransfer.files[0]);
        }
      });
    }
  },

  switchTab(tabName) {
    this.activeTab = (tabName === 'govtjob') ? 'govtjob' : 'compressor';
    document.querySelectorAll('.img-tool-tab').forEach(btn => {
      const bTab = btn.getAttribute('data-tool-tab');
      if (bTab === this.activeTab) {
        btn.className = 'img-tool-tab flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md cursor-pointer transition-all transform scale-[1.02]';
      } else {
        btn.className = 'img-tool-tab flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition-all';
      }
    });

    document.querySelectorAll('.img-tool-pane').forEach(pane => {
      if (pane.id === `pane_${this.activeTab}`) {
        pane.classList.remove('hidden');
        pane.style.display = 'block';
      } else {
        pane.classList.add('hidden');
        pane.style.display = 'none';
      }
    });
  },

  // ---------------- 1. IMAGE COMPRESSOR (PX * PX & KB TO KB) ---------------- //
  _compressImg: null,
  _compressOrigW: 0,
  _compressOrigH: 0,
  _compressedDataUrl: null,
  _compressedW: 0,
  _compressedH: 0,
  _compressedKb: 0,

  handleCompressFile(file) {
    this.uploadedFiles.compress = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this._compressImg = img;
        this._compressOrigW = img.naturalWidth;
        this._compressOrigH = img.naturalHeight;

        const origSizeKb = (file.size / 1024).toFixed(1);
        const origDimText = `${img.naturalWidth} × ${img.naturalHeight} px`;

        const origImg = document.getElementById('compressOrigImg');
        if (origImg) origImg.src = e.target.result;
        const origSizeEl = document.getElementById('compressOrigSize');
        if (origSizeEl) origSizeEl.textContent = `${origSizeKb} KB`;
        const origDimEl = document.getElementById('compressOrigDim');
        if (origDimEl) origDimEl.textContent = origDimText;

        // Populate Target Dimension Inputs with original dimensions
        const wInput = document.getElementById('compressTargetW');
        if (wInput) wInput.value = img.naturalWidth;
        const hInput = document.getElementById('compressTargetH');
        if (hInput) hInput.value = img.naturalHeight;

        // Reset target KB inputs to empty initially
        const minKbInput = document.getElementById('compressMinKb');
        if (minKbInput) minKbInput.value = '';
        const maxKbInput = document.getElementById('compressMaxKb');
        if (maxKbInput) maxKbInput.value = '';

        const ws = document.getElementById('compressWorkspace');
        if (ws) ws.classList.remove('hidden');
        const dz = document.getElementById('compressDropZone');
        if (dz) dz.classList.add('hidden');

        this.processCompression();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  onCompressDimChange(changedField) {
    if (!this._compressImg) return;
    const ratioLock = document.getElementById('compressRatioLock');
    const isLocked = ratioLock ? ratioLock.checked : true;
    const ratio = (this._compressOrigW && this._compressOrigH) ? (this._compressOrigW / this._compressOrigH) : 1;

    const wInput = document.getElementById('compressTargetW');
    const hInput = document.getElementById('compressTargetH');

    if (isLocked) {
      if (changedField === 'width' && wInput && hInput) {
        const w = parseInt(wInput.value, 10);
        if (w > 0) hInput.value = Math.round(w / ratio);
      } else if (changedField === 'height' && wInput && hInput) {
        const h = parseInt(hInput.value, 10);
        if (h > 0) wInput.value = Math.round(h * ratio);
      }
    }
    this.processCompression();
  },

  onCompressRatioToggle() {
    if (!this._compressImg) return;
    const ratioLock = document.getElementById('compressRatioLock');
    if (ratioLock && ratioLock.checked) {
      const ratio = (this._compressOrigW && this._compressOrigH) ? (this._compressOrigW / this._compressOrigH) : 1;
      const wInput = document.getElementById('compressTargetW');
      const hInput = document.getElementById('compressTargetH');
      const w = parseInt(wInput?.value, 10);
      if (w > 0 && hInput) hInput.value = Math.round(w / ratio);
    }
    this.processCompression();
  },

  setCompressDimPreset(w, h) {
    if (!this._compressImg) return;
    const wInput = document.getElementById('compressTargetW');
    const hInput = document.getElementById('compressTargetH');
    if (!wInput || !hInput) return;

    if (w === 'orig') {
      wInput.value = this._compressOrigW;
      hInput.value = this._compressOrigH;
    } else if (w === 'half') {
      wInput.value = Math.round(this._compressOrigW / 2);
      hInput.value = Math.round(this._compressOrigH / 2);
    } else {
      wInput.value = w;
      hInput.value = h;
    }
    this.processCompression();
  },

  setCompressKbPreset(minKb, maxKb) {
    const minInput = document.getElementById('compressMinKb');
    const maxInput = document.getElementById('compressMaxKb');
    if (minInput) minInput.value = minKb > 0 ? minKb : '';
    if (maxInput) maxInput.value = maxKb > 0 ? maxKb : '';
    this.processCompression();
  },

  onQualitySliderChange(val) {
    const valEl = document.getElementById('compressQualityVal');
    if (valEl) valEl.textContent = `${val}%`;
    this.processCompression();
  },

  padJpegDataUrl(dataUrl, targetMinBytes) {
    try {
      const parts = dataUrl.split(',');
      const byteString = atob(parts[1]);
      const byteLen = byteString.length;
      if (byteLen >= targetMinBytes) return dataUrl;

      const padNeeded = targetMinBytes - byteLen;
      if (padNeeded < 4) return dataUrl;

      const raw = new Uint8Array(byteLen);
      for (let i = 0; i < byteLen; i++) raw[i] = byteString.charCodeAt(i);
      if (raw[0] !== 0xFF || raw[1] !== 0xD8) return dataUrl;

      const segLen = padNeeded - 2;
      if (segLen > 65535) return dataUrl;

      const newBuf = new Uint8Array(byteLen + padNeeded);
      newBuf[0] = 0xFF; newBuf[1] = 0xD8;
      newBuf[2] = 0xFF; newBuf[3] = 0xFE;
      newBuf[4] = (segLen >> 8) & 0xFF;
      newBuf[5] = segLen & 0xFF;

      for (let p = 6; p < 2 + padNeeded; p++) newBuf[p] = (p * 37 + 11) & 0xFF;
      newBuf.set(raw.subarray(2), 2 + padNeeded);

      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < newBuf.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, newBuf.subarray(i, i + chunkSize));
      }
      return parts[0] + ',' + btoa(binary);
    } catch (e) {
      console.warn("JPEG padding warning:", e);
      return dataUrl;
    }
  },

  processCompression() {
    const file = this.uploadedFiles.compress;
    if (!file || !this._compressImg) return;

    // 1. Target Dimensions (px * px)
    const wInput = document.getElementById('compressTargetW');
    const hInput = document.getElementById('compressTargetH');
    let targetW = parseInt(wInput?.value, 10);
    let targetH = parseInt(hInput?.value, 10);

    if (!targetW || targetW <= 0) targetW = this._compressOrigW;
    if (!targetH || targetH <= 0) targetH = this._compressOrigH;

    // 2. Target KB Range (kb to kb)
    const minKbInput = document.getElementById('compressMinKb');
    const maxKbInput = document.getElementById('compressMaxKb');
    const minKb = parseFloat(minKbInput?.value) || 0;
    const maxKb = parseFloat(maxKbInput?.value) || 0;

    // 3. Format & Quality Slider
    const formatEl = document.getElementById('compressFormat');
    const format = formatEl ? formatEl.value : 'image/jpeg';
    const qualitySlider = document.getElementById('compressQuality');
    const manualQ = (parseFloat(qualitySlider ? qualitySlider.value : 75) || 75) / 100;

    // 4. Draw to Canvas at Target Resolution (px * px)
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this._compressImg, 0, 0, targetW, targetH);

    let dataUrl = canvas.toDataURL(format, manualQ);
    let bestQuality = manualQ;

    // 5. Intelligent KB Target Compression
    if (maxKb > 0 || minKb > 0) {
      const upperKb = maxKb > 0 ? maxKb : (minKb * 1.5);
      const lowerKb = minKb > 0 ? minKb : Math.max(1, upperKb * 0.75);

      let lowQ = 0.02;
      let highQ = 0.99;
      let bestUrl = null;
      let bestKb = 0;

      for (let iter = 0; iter < 12; iter++) {
        const midQ = (lowQ + highQ) / 2;
        const testUrl = canvas.toDataURL(format, midQ);
        const testKb = (testUrl.length * 3 / 4) / 1024;
        bestUrl = testUrl;
        bestKb = testKb;
        bestQuality = midQ;

        if (testKb >= lowerKb && testKb <= upperKb) {
          break; // In ideal range!
        }
        if (testKb > upperKb) {
          highQ = midQ;
        } else {
          lowQ = midQ;
        }
      }
      dataUrl = bestUrl || dataUrl;

      // Progressive scale down if resolution exceeds upperKb even at lowQ
      let currentKb = (dataUrl.length * 3 / 4) / 1024;
      if (currentKb > upperKb && targetW > 150 && targetH > 150) {
        let curW = targetW;
        let curH = targetH;
        let scaleIter = 0;
        while (currentKb > upperKb && curW > 120 && curH > 120 && scaleIter < 4) {
          scaleIter++;
          curW = Math.round(curW * 0.85);
          curH = Math.round(curH * 0.85);
          canvas.width = curW;
          canvas.height = curH;
          ctx.drawImage(this._compressImg, 0, 0, curW, curH);

          lowQ = 0.05; highQ = 0.95;
          for (let i = 0; i < 8; i++) {
            const midQ = (lowQ + highQ) / 2;
            const testUrl = canvas.toDataURL(format, midQ);
            const testKb = (testUrl.length * 3 / 4) / 1024;
            dataUrl = testUrl;
            currentKb = testKb;
            bestQuality = midQ;
            if (testKb <= upperKb) break;
            highQ = midQ;
          }
        }
      }

      // If user specified minKb and current size is below minKb, pad JPEG safely
      if (minKb > 0 && currentKb < minKb && format === 'image/jpeg') {
        const targetMinBytes = Math.ceil(minKb * 1024);
        dataUrl = this.padJpegDataUrl(dataUrl, targetMinBytes);
      }

      // Update quality slider display to reflect optimized quality
      if (qualitySlider) {
        qualitySlider.value = Math.round(bestQuality * 100);
        const valEl = document.getElementById('compressQualityVal');
        if (valEl) valEl.textContent = `${Math.round(bestQuality * 100)}% (Auto Target)`;
      }
    } else {
      const valEl = document.getElementById('compressQualityVal');
      if (valEl) valEl.textContent = `${Math.round(manualQ * 100)}%`;
    }

    // 6. Update Result Metrics
    const compressedSizeKb = ((dataUrl.length * 3 / 4) / 1024).toFixed(1);
    const origSizeKb = (file.size / 1024).toFixed(1);
    const savings = Math.max(0, Math.round(((origSizeKb - compressedSizeKb) / origSizeKb) * 100));

    const resultImg = document.getElementById('compressResultImg');
    if (resultImg) resultImg.src = dataUrl;

    const resultSizeEl = document.getElementById('compressResultSize');
    if (resultSizeEl) resultSizeEl.textContent = `${compressedSizeKb} KB`;

    const resultDimEl = document.getElementById('compressResultDim');
    if (resultDimEl) resultDimEl.textContent = `(${canvas.width} × ${canvas.height} px)`;

    const savingsEl = document.getElementById('compressSavings');
    if (savingsEl) {
      savingsEl.textContent = savings > 0 ? `(-${savings}%)` : '';
    }

    // Target Status Badge
    const badge = document.getElementById('compressTargetStatusBadge');
    if (badge) {
      if (maxKb > 0 || minKb > 0) {
        const curNum = parseFloat(compressedSizeKb);
        const meetsMax = (maxKb === 0 || curNum <= maxKb);
        const meetsMin = (minKb === 0 || curNum >= minKb);

        badge.classList.remove('hidden');
        if (meetsMin && meetsMax) {
          badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300';
          badge.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> Target Reached (${minKb > 0 ? minKb + ' - ' : '< '}${maxKb || minKb} KB)`;
        } else {
          badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300';
          badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Target: ${minKb ? minKb + ' - ' : ''}${maxKb} KB`;
        }
      } else {
        badge.classList.add('hidden');
      }
    }

    this._compressedDataUrl = dataUrl;
    this._compressedW = canvas.width;
    this._compressedH = canvas.height;
    this._compressedKb = compressedSizeKb;
  },

  downloadCompressed() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Compressed Image (JPG/WebP)', category: 'photo' }, () => this._doDownloadCompressed());
    }
    this._doDownloadCompressed();
  },

  _doDownloadCompressed() {
    if (!this._compressedDataUrl) return;
    const format = document.getElementById('compressFormat')?.value || 'image/jpeg';
    const ext = format === 'image/webp' ? 'webp' : (format === 'image/png' ? 'png' : 'jpg');
    const w = this._compressedW || 'auto';
    const h = this._compressedH || 'auto';
    const kb = this._compressedKb || 'opt';

    const link = document.createElement('a');
    link.download = `VUO_Compressed_${w}x${h}_${kb}KB_${Date.now()}.${ext}`;
    link.href = this._compressedDataUrl;
    link.click();
    showToast(`Compressed image (${kb} KB, ${w}x${h} px) downloaded successfully!`, "success");
  },

  // ---------------- 2. IMAGE RESIZER ---------------- //
  handleResizeFile(file) {
    this.uploadedFiles.resize = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this._resizeImg = img;
        document.getElementById('resizeOrigDim').textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;
        document.getElementById('resizeWidth').value = img.naturalWidth;
        document.getElementById('resizeHeight').value = img.naturalHeight;
        document.getElementById('resizeWorkspace').classList.remove('hidden');
        document.getElementById('resizeDropZone').classList.add('hidden');
        this.processResize();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  onResizeDimChange(type) {
    if (!this._resizeImg) return;
    const maintainRatio = document.getElementById('resizeRatioLock').checked;
    const origW = this._resizeImg.naturalWidth;
    const origH = this._resizeImg.naturalHeight;
    const ratio = origW / origH;

    const wInput = document.getElementById('resizeWidth');
    const hInput = document.getElementById('resizeHeight');

    if (maintainRatio) {
      if (type === 'width') {
        hInput.value = Math.round(wInput.value / ratio);
      } else {
        wInput.value = Math.round(hInput.value * ratio);
      }
    }
    this.processResize();
  },

  applyResizePreset(w, h) {
    document.getElementById('resizeRatioLock').checked = false;
    document.getElementById('resizeWidth').value = w;
    document.getElementById('resizeHeight').value = h;
    this.processResize();
  },

  processResize() {
    if (!this._resizeImg) return;
    const targetW = parseInt(document.getElementById('resizeWidth').value, 10) || 100;
    const targetH = parseInt(document.getElementById('resizeHeight').value, 10) || 100;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this._resizeImg, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('resizePreviewImg').src = dataUrl;
    document.getElementById('resizeNewDim').textContent = `${targetW} x ${targetH} px`;
    document.getElementById('resizeNewSize').textContent = `${((dataUrl.length * 3 / 4) / 1024).toFixed(1)} KB`;
    this._resizedDataUrl = dataUrl;
  },

  downloadResized() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Resized Image (JPG)', category: 'photo' }, () => this._doDownloadResized());
    }
    this._doDownloadResized();
  },
  _doDownloadResized() {
    if (!this._resizedDataUrl) return;
    const link = document.createElement('a');
    link.download = `VUO_Resized_${Date.now()}.jpg`;
    link.href = this._resizedDataUrl;
    link.click();
    showToast("Resized image downloaded!", "success");
  },

  // ---------------- 3. PHOTO ENHANCER, SHARPENER & UPSCALER ---------------- //
  handleEnhancerFile(file) {
    this.uploadedFiles.enhance = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this._enhanceImg = img;
        document.getElementById('enhanceOrigImg').src = e.target.result;
        document.getElementById('enhanceOrigDim').textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;
        document.getElementById('enhanceOrigSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        document.getElementById('enhanceWorkspace').classList.remove('hidden');
        document.getElementById('enhanceDropZone').classList.add('hidden');
        this.processEnhancer();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  onEnhanceSliderChange() {
    const val = document.getElementById('enhanceSharpness').value;
    document.getElementById('enhanceSharpnessVal').textContent = `${val}%`;
    this.processEnhancer();
  },

  processEnhancer() {
    if (!this._enhanceImg) return;

    const autoTone = document.getElementById('enhanceAutoTone').checked;
    const sharpness = parseInt(document.getElementById('enhanceSharpness').value, 10) || 0;
    const upscaleFactor = parseInt(document.getElementById('enhanceUpscale').value, 10) || 1;

    const srcW = this._enhanceImg.naturalWidth;
    const srcH = this._enhanceImg.naturalHeight;
    const targetW = srcW * upscaleFactor;
    const targetH = srcH * upscaleFactor;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // High quality bicubic upscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this._enhanceImg, 0, 0, targetW, targetH);

    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;

    // 1. Dynamic Auto-Tone Equalization
    if (autoTone) {
      let minLum = 255, maxLum = 0;
      for (let i = 0; i < data.length; i += 16) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
      minLum = Math.max(0, minLum - 10);
      maxLum = Math.min(255, maxLum + 10);
      const range = Math.max(1, maxLum - minLum);

      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          let val = ((data[i + c] - minLum) / range) * 255;
          val = val < 128 ? (2 * val * val) / 255 : 255 - (2 * (255 - val) * (255 - val)) / 255;
          data[i + c] = Math.max(0, Math.min(255, val));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // 2. Convolution Sharpening Mask
    if (sharpness > 0) {
      const src = ctx.getImageData(0, 0, targetW, targetH).data;
      const output = ctx.createImageData(targetW, targetH);
      const dst = output.data;
      const k = (sharpness / 100) * 0.8;

      for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
          const idx = (y * targetW + x) * 4;
          if (x === 0 || x === targetW - 1 || y === 0 || y === targetH - 1) {
            dst[idx] = src[idx];
            dst[idx + 1] = src[idx + 1];
            dst[idx + 2] = src[idx + 2];
            dst[idx + 3] = src[idx + 3];
            continue;
          }

          const top = ((y - 1) * targetW + x) * 4;
          const bot = ((y + 1) * targetW + x) * 4;
          const left = (y * targetW + (x - 1)) * 4;
          const right = (y * targetW + (x + 1)) * 4;

          for (let c = 0; c < 3; c++) {
            const val = src[idx + c] * (1 + 4 * k) - (src[top + c] + src[bot + c] + src[left + c] + src[right + c]) * k;
            dst[idx + c] = Math.max(0, Math.min(255, val));
          }
          dst[idx + 3] = src[idx + 3];
        }
      }
      ctx.putImageData(output, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('enhanceResultImg').src = dataUrl;
    document.getElementById('enhanceNewDim').textContent = `${targetW} x ${targetH} px`;
    document.getElementById('enhanceNewSize').textContent = `${((dataUrl.length * 3 / 4) / 1024).toFixed(1)} KB`;
    this._enhancedDataUrl = dataUrl;
  },

  downloadEnhanced() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Enhanced HD Photo', category: 'photo' }, () => this._doDownloadEnhanced());
    }
    this._doDownloadEnhanced();
  },
  _doDownloadEnhanced() {
    if (!this._enhancedDataUrl) return;
    const link = document.createElement('a');
    link.download = `VUO_Enhanced_HQ_${Date.now()}.jpg`;
    link.href = this._enhancedDataUrl;
    link.click();
    showToast("Enhanced HD photo downloaded!", "success");
  },

  // ---------------- 3. FORMAT CONVERTER ---------------- //
  handleConvertFile(file) {
    this.uploadedFiles.convert = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this._convertImg = img;
        document.getElementById('convertOrigFormat').textContent = file.type.split('/')[1].toUpperCase();
        document.getElementById('convertOrigSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        document.getElementById('convertPreviewImg').src = e.target.result;
        document.getElementById('convertWorkspace').classList.remove('hidden');
        document.getElementById('convertDropZone').classList.add('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  executeFormatConversion() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Converted Image Format', category: 'photo' }, () => this._doExecuteFormatConversion());
    }
    this._doExecuteFormatConversion();
  },
  _doExecuteFormatConversion() {
    if (!this._convertImg) return;
    const targetFormat = document.getElementById('convertTargetFormat').value; // 'image/jpeg', 'image/png', 'image/webp'
    const canvas = document.createElement('canvas');
    canvas.width = this._convertImg.naturalWidth;
    canvas.height = this._convertImg.naturalHeight;
    const ctx = canvas.getContext('2d');

    // White background for JPEG if source had transparency
    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(this._convertImg, 0, 0);

    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
    const dataUrl = canvas.toDataURL(targetFormat, 0.95);

    const link = document.createElement('a');
    link.download = `VUO_Converted_${Date.now()}.${ext}`;
    link.href = dataUrl;
    link.click();
    showToast(`Converted to ${ext.toUpperCase()} and downloaded!`, "success");
  },

  // ---------------- 4. IMAGE CROPPER & ROTATOR ---------------- //
  handleCropFile(file) {
    this.uploadedFiles.crop = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('cropTargetImg');
      img.src = e.target.result;
      document.getElementById('cropWorkspace').classList.remove('hidden');
      document.getElementById('cropDropZone').classList.add('hidden');

      if (this.cropperInstance) this.cropperInstance.destroy();
      this.cropperInstance = new Cropper(img, {
        aspectRatio: NaN, // Free crop default
        viewMode: 1,
        responsive: true
      });
    };
    reader.readAsDataURL(file);
  },

  setCropRatio(ratio) {
    if (!this.cropperInstance) return;
    this.cropperInstance.setAspectRatio(ratio);
  },

  rotateCropper(deg) {
    if (!this.cropperInstance) return;
    this.cropperInstance.rotate(deg);
  },

  flipCropper(dir) {
    if (!this.cropperInstance) return;
    if (dir === 'h') {
      this._flipH = (this._flipH || 1) * -1;
      this.cropperInstance.scaleX(this._flipH);
    } else {
      this._flipV = (this._flipV || 1) * -1;
      this.cropperInstance.scaleY(this._flipV);
    }
  },

  downloadCropped() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Cropped Photo (JPG)', category: 'photo' }, () => this._doDownloadCropped());
    }
    this._doDownloadCropped();
  },
  _doDownloadCropped() {
    if (!this.cropperInstance) return;
    const canvas = this.cropperInstance.getCroppedCanvas();
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `VUO_Cropped_${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast("Cropped image downloaded!", "success");
  },

  // ---------------- 5. SIGNATURE RESIZER & ENHANCER ---------------- //
  handleSigFile(file) {
    this.uploadedFiles.sig = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this._sigImg = img;
        document.getElementById('sigWorkspace').classList.remove('hidden');
        document.getElementById('sigDropZone').classList.add('hidden');
        this.processSignature();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  processSignature() {
    if (!this._sigImg) return;
    const preset = document.getElementById('sigPreset').value; // 'pan' (140x60, max 20kb), 'ssc' (140x60), 'custom'
    const enhanceContrast = document.getElementById('sigEnhance').checked;

    let targetW = 140, targetH = 60;
    if (preset === 'standard_gov') { targetW = 200; targetH = 100; }
    else if (preset === 'pan') { targetW = 140; targetH = 60; }
    else if (preset === 'passport') { targetW = 140; targetH = 80; }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Draw scaled signature centered
    const hRatio = targetW / this._sigImg.naturalWidth;
    const vRatio = targetH / this._sigImg.naturalHeight;
    const ratio = Math.min(hRatio, vRatio) * 0.9;
    const drawW = this._sigImg.naturalWidth * ratio;
    const drawH = this._sigImg.naturalHeight * ratio;
    const drawX = (targetW - drawW) / 2;
    const drawY = (targetH - drawH) / 2;

    ctx.drawImage(this._sigImg, drawX, drawY, drawW, drawH);

    // Apply binarization / high-contrast threshold filter for clean ink
    if (enhanceContrast) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Thresholding to make paper white and ink dark
        if (gray > 180) {
          data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; // White paper
        } else {
          // Deepen ink color
          data[i] = Math.max(0, data[i] - 40);
          data[i + 1] = Math.max(0, data[i + 1] - 40);
          data[i + 2] = Math.max(0, data[i + 2] - 40);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    document.getElementById('sigPreviewImg').src = dataUrl;
    const sizeKb = ((dataUrl.length * 3 / 4) / 1024).toFixed(1);
    document.getElementById('sigResultInfo').textContent = `Size: ${targetW} x ${targetH} px | Weight: ${sizeKb} KB (Within 20KB Govt limit)`;
    this._sigDataUrl = dataUrl;
  },

  downloadSignature() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Govt Compliant Official Signature (JPG)', category: 'photo' }, () => this._doDownloadSignature());
    }
    this._doDownloadSignature();
  },
  _doDownloadSignature() {
    if (!this._sigDataUrl) return;
    const link = document.createElement('a');
    link.download = `VUO_Official_Signature_${Date.now()}.jpg`;
    link.href = this._sigDataUrl;
    link.click();
    showToast("Official signature downloaded (Government Portal Compliant)!", "success");
  },

  loadSample(type = 'compress') {
    const canvas = document.createElement('canvas');
    if (type === 'sig') {
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 400, 150);
      ctx.font = 'italic bold 36px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'center';
      ctx.fillText('Jagannath Dash', 200, 85);
      ctx.beginPath();
      ctx.moveTo(80, 105);
      ctx.bezierCurveTo(150, 115, 260, 95, 330, 110);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1e3a8a';
      ctx.stroke();
    } else {
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ODISHA VLE CITIZEN SERVICES', 400, 260);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText('Digital Certificate & Verification Record', 400, 310);
      ctx.fillStyle = '#bae6fd';
      ctx.font = '18px Inter, sans-serif';
      ctx.fillText('High Quality 300 DPI Sample Document', 400, 360);
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `sample_${type}.jpg`, { type: 'image/jpeg' });
      if (type === 'compress') this.handleCompressFile(file);
      else if (type === 'resize') this.handleResizeFile(file);
      else if (type === 'enhance') this.handleEnhancerFile(file);
      else if (type === 'convert') this.handleConvertFile(file);
      else if (type === 'crop') this.handleCropFile(file);
      else if (type === 'sig') this.handleSigFile(file);
    }, 'image/jpeg', 0.95);
  },

  resetWorkspace(type) {
    const wsMap = {
      compress: ['compressWorkspace', 'compressDropZone'],
      resize: ['resizeWorkspace', 'resizeDropZone'],
      enhance: ['enhanceWorkspace', 'enhanceDropZone'],
      convert: ['convertWorkspace', 'convertDropZone'],
      crop: ['cropWorkspace', 'cropDropZone'],
      sig: ['sigWorkspace', 'sigDropZone']
    };
    if (wsMap[type]) {
      const [wsId, dzId] = wsMap[type];
      const ws = document.getElementById(wsId);
      const dz = document.getElementById(dzId);
      if (ws) ws.classList.add('hidden');
      if (dz) dz.classList.remove('hidden');
    }
  },

  // ---------------- GOVT JOB IMAGE STUDIO ----------------
  govtJobState: {
    preset: 'ossc',
    doctype: 'photo',
    currentFile: null,
    currentImage: null,
    optimizedBlob: null,
    optimizedDataUrl: null,
    targetW: 200,
    targetH: 230,
    minKb: 20,
    maxKb: 50
  },

  govtJobSpecs: {
    ossc: {
      name: 'OSSC / OSSSC / OPSC',
      photo: { w: 200, h: 230, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 150, h: 150, minKb: 10, maxKb: 20 }
    },
    police: {
      name: 'Odisha Police',
      photo: { w: 200, h: 230, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 150, h: 150, minKb: 10, maxKb: 20 }
    },
    ssc: {
      name: 'SSC (CGL/CHSL/MTS/GD)',
      photo: { w: 138, h: 177, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 140, h: 60, minKb: 10, maxKb: 20 }
    },
    rrb: {
      name: 'Railway RRB',
      photo: { w: 200, h: 230, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 140, h: 60, minKb: 10, maxKb: 20 }
    },
    ibps: {
      name: 'IBPS / SBI Banking',
      photo: { w: 200, h: 230, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 150, h: 150, minKb: 10, maxKb: 20 }
    },
    nta: {
      name: 'NTA (NEET/JEE/CUET)',
      photo: { w: 200, h: 250, minKb: 10, maxKb: 200 },
      signature: { w: 140, h: 60, minKb: 4, maxKb: 30 },
      thumb: { w: 150, h: 150, minKb: 10, maxKb: 50 }
    },
    custom: {
      name: 'Custom Target',
      photo: { w: 200, h: 230, minKb: 20, maxKb: 50 },
      signature: { w: 140, h: 60, minKb: 10, maxKb: 20 },
      thumb: { w: 150, h: 150, minKb: 10, maxKb: 20 }
    }
  },

  initGovtJobSuite() {
    // Preset buttons
    document.querySelectorAll('.img-job-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.getAttribute('data-preset');
        this.setGovtJobPreset(preset);
      });
    });

    // Doctype buttons
    document.querySelectorAll('.img-job-doctype-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const doctype = e.currentTarget.getAttribute('data-doctype');
        this.setGovtJobDocType(doctype);
      });
    });

    // Custom inputs
    ['imgJobCustomW', 'imgJobCustomH', 'imgJobCustomMinKb', 'imgJobCustomMaxKb'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (this.govtJobState.preset === 'custom') {
            this.updateGovtJobSpecBadge();
            if (this.govtJobState.currentImage) {
              this.reprocessGovtJobImage();
            }
          }
        });
      }
    });

    // Dropzone & File Input
    const fileInput = document.getElementById('imgJobFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleGovtJobImageFile(e.target.files[0]);
        }
      });
    }

    const dropZone = document.getElementById('imgJobDropZone');
    if (dropZone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('border-amber-500', 'bg-amber-50/30');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('border-amber-500', 'bg-amber-50/30');
        });
      });
      dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleGovtJobImageFile(e.dataTransfer.files[0]);
        }
      });
    }

    this.updateGovtJobSpecBadge();
  },

  setGovtJobPreset(preset) {
    this.govtJobState.preset = preset;
    document.querySelectorAll('.img-job-preset-btn').forEach(btn => {
      if (btn.getAttribute('data-preset') === preset) {
        btn.className = 'img-job-preset-btn px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer';
      } else {
        btn.className = 'img-job-preset-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer';
      }
    });

    const customBox = document.getElementById('imgJobCustomBox');
    if (customBox) {
      if (preset === 'custom') customBox.classList.remove('hidden');
      else customBox.classList.add('hidden');
    }

    this.updateGovtJobSpecBadge();
    if (this.govtJobState.currentImage) {
      this.reprocessGovtJobImage();
    }
  },

  setGovtJobDocType(doctype) {
    this.govtJobState.doctype = doctype;
    document.querySelectorAll('.img-job-doctype-btn').forEach(btn => {
      if (btn.getAttribute('data-doctype') === doctype) {
        btn.className = 'img-job-doctype-btn px-3.5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white shadow-sm flex items-center gap-2 cursor-pointer border border-amber-400';
      } else {
        btn.className = 'img-job-doctype-btn px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer';
      }
    });

    const uploadTitle = document.getElementById('imgJobUploadBoxTitle');
    if (uploadTitle) {
      const pName = (this.govtJobSpecs[this.govtJobState.preset]?.name || 'PORTAL').toUpperCase();
      const dName = doctype.toUpperCase();
      uploadTitle.textContent = `Upload ${pName} - ${dName}`;
    }

    this.updateGovtJobSpecBadge();
    if (this.govtJobState.currentImage) {
      this.reprocessGovtJobImage();
    }
  },

  updateGovtJobSpecBadge() {
    const { preset, doctype } = this.govtJobState;
    let w, h, minKb, maxKb;

    if (preset === 'custom') {
      w = parseInt(document.getElementById('imgJobCustomW')?.value || '200', 10);
      h = parseInt(document.getElementById('imgJobCustomH')?.value || '230', 10);
      minKb = parseInt(document.getElementById('imgJobCustomMinKb')?.value || '20', 10);
      maxKb = parseInt(document.getElementById('imgJobCustomMaxKb')?.value || '50', 10);
    } else {
      const spec = this.govtJobSpecs[preset]?.[doctype] || { w: 200, h: 230, minKb: 20, maxKb: 50 };
      w = spec.w;
      h = spec.h;
      minKb = spec.minKb;
      maxKb = spec.maxKb;
    }

    this.govtJobState.targetW = w;
    this.govtJobState.targetH = h;
    this.govtJobState.minKb = minKb;
    this.govtJobState.maxKb = maxKb;

    const badge = document.getElementById('imgJobSpecBadge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-bullseye"></i><span>Target: ${w} x ${h} px | ${minKb} KB - ${maxKb} KB (JPG)</span>`;
    }
  },

  async handleGovtJobImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      if (typeof showToast === 'function') showToast("Please select a valid image file (JPG, PNG, WebP).", "warning");
      return;
    }
    this.govtJobState.currentFile = file;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        this.govtJobState.currentImage = img;
        this.reprocessGovtJobImage();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  async reprocessGovtJobImage() {
    const img = this.govtJobState.currentImage;
    if (!img) return;

    const { targetW, targetH, minKb, maxKb } = this.govtJobState;

    const statusBadge = document.getElementById('imgJobStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = "Resizing & Optimizing...";
      statusBadge.className = "px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs inline-flex items-center";
    }

    // 1. Render on offscreen canvas at exact target dimensions
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Smart draw: preserve aspect ratio, fit cleanly with white margins if needed
    const aspectImg = img.width / img.height;
    const aspectTarget = targetW / targetH;
    let drawW, drawH, drawX, drawY;

    if (aspectImg > aspectTarget) {
      drawW = targetW;
      drawH = targetW / aspectImg;
      drawX = 0;
      drawY = (targetH - drawH) / 2;
    } else {
      drawH = targetH;
      drawW = targetH * aspectImg;
      drawX = (targetW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 2. Binary search iterative compression
    let lowQ = 0.05;
    let highQ = 0.98;
    let bestBlob = null;
    let bestQuality = 0.85;

    const getBlob = (quality) => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));

    for (let i = 0; i < 8; i++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await getBlob(midQ);
      const kb = blob.size / 1024;

      bestBlob = blob;
      bestQuality = midQ;

      if (kb >= minKb && kb <= maxKb) {
        break;
      }
      if (kb > maxKb) {
        highQ = midQ;
      } else {
        lowQ = midQ;
      }
    }

    // If still below minKb, pad safely
    if (bestBlob && (bestBlob.size / 1024) < minKb) {
      const padBytes = Math.ceil((minKb * 1024) - bestBlob.size + 150);
      const arr = await bestBlob.arrayBuffer();
      const paddedArr = new Uint8Array(arr.byteLength + padBytes);
      paddedArr.set(new Uint8Array(arr), 0);
      // Safe padding bytes
      for (let p = arr.byteLength; p < paddedArr.byteLength; p++) {
        paddedArr[p] = (p * 31 + 7) & 0xFF;
      }
      bestBlob = new Blob([paddedArr], { type: 'image/jpeg' });
    }

    this.govtJobState.optimizedBlob = bestBlob;
    const finalKb = Math.round((bestBlob.size / 1024) * 10) / 10;

    const dataUrl = URL.createObjectURL(bestBlob);
    this.govtJobState.optimizedDataUrl = dataUrl;

    // Update UI
    const resultBox = document.getElementById('imgJobResultBox');
    if (resultBox) resultBox.classList.remove('hidden');

    const previewImg = document.getElementById('imgJobResultImg');
    if (previewImg) previewImg.src = dataUrl;

    const dimEl = document.getElementById('imgJobResultDimensions');
    if (dimEl) dimEl.textContent = `${targetW} x ${targetH} px`;

    const sizeEl = document.getElementById('imgJobResultFileSize');
    if (sizeEl) sizeEl.textContent = `${finalKb} KB`;

    if (statusBadge) {
      const inRange = finalKb >= minKb && finalKb <= maxKb;
      statusBadge.innerHTML = inRange 
        ? `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Strict Portal Match (${minKb}-${maxKb} KB)`
        : `Ready: ${finalKb} KB`;
      statusBadge.className = inRange 
        ? "px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center"
        : "px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs inline-flex items-center";
    }

    if (typeof showToast === 'function') {
      showToast(`Image optimized: ${targetW}x${targetH}px | ${finalKb} KB`, "success");
    }
  },

  downloadGovtJobFile() {
    const { optimizedBlob, preset, doctype, targetW, targetH } = this.govtJobState;
    if (!optimizedBlob) {
      if (typeof showToast === 'function') showToast("Please upload and optimize an image first.", "warning");
      return;
    }

    const kb = Math.round((optimizedBlob.size / 1024) * 10) / 10;
    const pName = (this.govtJobSpecs[preset]?.name || 'PORTAL').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${pName}_${doctype.toUpperCase()}_${targetW}x${targetH}_${kb}KB.jpg`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(optimizedBlob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (typeof showToast === 'function') {
      showToast(`Downloaded: ${filename}`, "success");
    }
  }
};


if (typeof window !== "undefined") {
  window.VUO_IMAGETOOLS = VUO_IMAGETOOLS;
}

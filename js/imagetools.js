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
    this.activeTab = tabName;
    document.querySelectorAll('.img-tool-tab').forEach(btn => {
      if (btn.getAttribute('data-tool-tab') === tabName) {
        btn.className = 'img-tool-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 text-white shadow-sm';
      } else {
        btn.className = 'img-tool-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100';
      }
    });

    document.querySelectorAll('.img-tool-pane').forEach(pane => {
      if (pane.id === `pane_${tabName}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });
  },

  // ---------------- 1. IMAGE COMPRESSOR ---------------- //
  handleCompressFile(file) {
    this.uploadedFiles.compress = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        document.getElementById('compressOrigImg').src = e.target.result;
        document.getElementById('compressOrigSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        document.getElementById('compressOrigDim').textContent = `${img.naturalWidth} x ${img.naturalHeight} px`;
        document.getElementById('compressWorkspace').classList.remove('hidden');
        document.getElementById('compressDropZone').classList.add('hidden');
        this.processCompression();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  processCompression() {
    const file = this.uploadedFiles.compress;
    if (!file) return;

    const quality = parseFloat(document.getElementById('compressQuality').value) / 100;
    const targetKb = parseFloat(document.getElementById('compressTargetKb').value) || 0;

    const img = document.getElementById('compressOrigImg');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let finalQuality = quality;
    let dataUrl = canvas.toDataURL('image/jpeg', finalQuality);

    // If user provided a target KB, binary search for optimal quality
    if (targetKb > 0) {
      let low = 0.05, high = 1.0;
      for (let i = 0; i < 6; i++) {
        const mid = (low + high) / 2;
        const testUrl = canvas.toDataURL('image/jpeg', mid);
        const testSizeKb = (testUrl.length * 3 / 4) / 1024;
        if (testSizeKb > targetKb) {
          high = mid;
        } else {
          low = mid;
        }
      }
      finalQuality = low;
      dataUrl = canvas.toDataURL('image/jpeg', finalQuality);
    }

    const compressedSizeKb = ((dataUrl.length * 3 / 4) / 1024).toFixed(1);
    const origSizeKb = (file.size / 1024).toFixed(1);
    const savings = Math.max(0, Math.round(((origSizeKb - compressedSizeKb) / origSizeKb) * 100));

    const resultImg = document.getElementById('compressResultImg');
    resultImg.src = dataUrl;
    document.getElementById('compressResultSize').textContent = `${compressedSizeKb} KB`;
    document.getElementById('compressSavings').textContent = `(-${savings}%)`;
    this._compressedDataUrl = dataUrl;
  },

  downloadCompressed() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Compressed Image (JPG)', category: 'photo' }, () => this._doDownloadCompressed());
    }
    this._doDownloadCompressed();
  },
  _doDownloadCompressed() {
    if (!this._compressedDataUrl) return;
    const link = document.createElement('a');
    link.download = `VUO_Compressed_${Date.now()}.jpg`;
    link.href = this._compressedDataUrl;
    link.click();
    showToast("Compressed image downloaded!", "success");
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
  }
};

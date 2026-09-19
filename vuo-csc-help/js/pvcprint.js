/**
 * VUO CSC HELP - Smart PVC ID Card Print Studio
 * Standard CR-80 (85.6mm x 54mm) PVC card layout generator.
 * 
 * Supports:
 * - 100% Client-side privacy-first processing (zero server upload)
 * - Single unified PVC Card Print workflow (no redundant card tabs)
 * - 2.0 HD Color PVC Card Background Template (Tricolor Waves, Watermark & UIDAI Helpline)
 * - Original 1:1 Scan Direct Crop mode
 * - Encrypted PDF password unlocking (e-Aadhaar Name+YYYY format)
 * - Large, high-visibility interactive Front & Back Dual Crop Boxes
 * - Zoom in / Zoom out controls
 * - Image enhancement (Brightness, Contrast, Saturation)
 * - Epson PVC Card Tray (2-Card Tray for L805/L8050/T50) direct layout
 * - A4 Photo Paper Single & Multi-card layouts with cut guidelines
 * - Direct 1-click Print, High-Res PNG & PDF Download
 * - 1-click VUO Bill Maker integration
 */

const VUO_PVCPRINT = {
  bgEnabled: true,          // true (Clean HD Color PVC) or false (Original 1:1 Scan Direct)
  bgTone: 45,               // percentage (15% = Ultra Light & clear, 45% = balanced crystal clear, 100% = Deep Dark)
  printLayout: 'epson_tray', // 'epson_tray', 'a4_single', 'a4_multi'
  sourceType: null,         // 'pdf' or 'image'
  pdfDoc: null,
  pdfRawBuffer: null,       // Immutable master ArrayBuffer to prevent PDF.js worker detachment
  pdfPassword: '',
  currentPage: 1,
  totalPages: 1,
  zoomLevel: 1.0,           // 1.0 = 100%
  
  // Base high-res rendering canvas
  sourceCanvas: null,
  sourceCtx: null,

  // Crop coordinates (in source canvas pixels)
  // Free 4-side & 4-corner crop; final output is automatically mapped to CR-80 PVC standard
  frontCrop: { x: 0, y: 0, width: 0, height: 0 },
  backCrop: { x: 0, y: 0, width: 0, height: 0 },
  qrCrop: { x: 0, y: 0, width: 0, height: 0 },
  activeCropSide: 'front', // 'front', 'back', or 'qr'

  // Image Enhancement Filters
  filters: {
    brightness: 100, // percentage
    contrast: 105,   // percentage (slight default boost for PVC ink absorption)
    saturation: 100,
    sharpness: 10    // percentage
  },

  // Printer Tray Fine-Tuning Calibration (in mm)
  trayCalibration: {
    xOffset: 0,
    yOffset: 0
  },

  // Ashok Stambha Emblem Asset
  ashokEmblemImg: null,

  // Citizen Passport Photo Update Option
  customPhotoEnabled: false,
  customPhotoImg: null,
  customPhotoPos: {
    x: 65,
    y: 165,
    width: 250,
    height: 318,
    scale: 1.0
  },

  // Front Card Aadhaar QR Code Option
  frontQrEnabled: false,
  frontQrImg: null,
  frontQrPos: {
    x: 785,
    y: 310,
    size: 180
  },

  showCutMarks: true,
  isDraggingCrop: false,
  isResizingCrop: false,
  dragHandle: null,
  dragStartX: 0,
  dragStartY: 0,
  initialCrop: null,

  init() {
    if (this._initialized) return;
    this.bindEvents();
    this.initPdfJsWorker();
    this.setupCropCanvasInteraction();
    this.updateBackgroundSwitchUI();
    this.updateCustomPhotoUI();
    this.updateFrontQrUI();
    this._initialized = true;
  },

  initPdfJsWorker() {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  },

  toggleBackground(forceState) {
    if (typeof forceState === 'boolean') {
      this.bgEnabled = forceState;
    } else {
      this.bgEnabled = !this.bgEnabled;
    }
    this.updateBackgroundSwitchUI();
    this.renderCardOutputs();

    if (typeof showToast === 'function') {
      if (this.bgEnabled) {
        showToast('Clean HD Background turned ON (Ashok Stambha & Tricolor Waves)', 'info');
      } else {
        showToast('Clean HD Background turned OFF (Original Scan Direct Crop)', 'info');
      }
    }
  },

  updateBackgroundSwitchUI() {
    const btn = document.getElementById('pvcBgToggleBtn');
    const knob = document.getElementById('pvcBgToggleKnob');
    const text = document.getElementById('pvcBgToggleStatusText');
    if (!btn || !knob) return;

    if (this.bgEnabled) {
      btn.className = 'relative inline-flex h-7 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-sky-600 shadow-inner';
      btn.setAttribute('aria-checked', 'true');
      knob.className = 'pointer-events-none inline-flex h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-9 items-center justify-center text-[10px] font-black text-sky-600';
      knob.textContent = 'ON';
      if (text) {
        text.className = 'text-xs font-extrabold text-sky-700';
        text.textContent = 'ON (Clean HD)';
      }
    } else {
      btn.className = 'relative inline-flex h-7 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-300 shadow-inner';
      btn.setAttribute('aria-checked', 'false');
      knob.className = 'pointer-events-none inline-flex h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 items-center justify-center text-[10px] font-black text-slate-500';
      knob.textContent = 'OFF';
      if (text) {
        text.className = 'text-xs font-bold text-slate-500';
        text.textContent = 'OFF (Original)';
      }
    }
    const toneBox = document.getElementById('pvcBgToneBox');
    if (toneBox) {
      if (this.bgEnabled) {
        toneBox.classList.remove('opacity-40', 'pointer-events-none');
      } else {
        toneBox.classList.add('opacity-40', 'pointer-events-none');
      }
    }
  },

  setBgTone(tone) {
    this.bgTone = Math.max(15, Math.min(100, tone));
    const slider = document.getElementById('pvcBgToneSlider');
    const valText = document.getElementById('pvcBgToneVal');
    if (slider) slider.value = this.bgTone;
    if (valText) valText.textContent = `${this.bgTone}%`;
    this.renderCardOutputs();
  },

  toggleCustomPhoto(forceState) {
    if (typeof forceState === 'boolean') {
      this.customPhotoEnabled = forceState;
    } else {
      this.customPhotoEnabled = !this.customPhotoEnabled;
    }
    this.updateCustomPhotoUI();
    this.renderCardOutputs();

    if (typeof showToast === 'function') {
      showToast(this.customPhotoEnabled ? 'Passport photo overlay enabled!' : 'Passport photo overlay turned off.', 'info');
    }
  },

  updateCustomPhotoUI() {
    const btn = document.getElementById('pvcPhotoToggleBtn');
    const knob = document.getElementById('pvcPhotoToggleKnob');
    const box = document.getElementById('pvcPhotoControlsBox');
    const removeBtn = document.getElementById('pvcRemovePhotoBtn');

    if (btn && knob) {
      if (this.customPhotoEnabled) {
        btn.className = 'relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-purple-600 shadow-inner';
        btn.setAttribute('aria-checked', 'true');
        knob.className = 'pointer-events-none inline-flex h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-6 items-center justify-center text-[9px] font-black text-purple-600';
        knob.textContent = 'ON';
      } else {
        btn.className = 'relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-300 shadow-inner';
        btn.setAttribute('aria-checked', 'false');
        knob.className = 'pointer-events-none inline-flex h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 items-center justify-center text-[9px] font-black text-slate-500';
        knob.textContent = 'OFF';
      }
    }

    if (box) {
      if (this.customPhotoImg) box.classList.remove('hidden');
      else box.classList.add('hidden');
    }

    if (removeBtn) {
      if (this.customPhotoImg) removeBtn.classList.remove('hidden');
      else removeBtn.classList.add('hidden');
    }
  },

  loadCustomPhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.customPhotoImg = img;
        this.customPhotoEnabled = true;

        const thumb = document.getElementById('pvcCustomPhotoThumb');
        const nameEl = document.getElementById('pvcPhotoFileName');
        if (thumb) thumb.src = e.target.result;
        if (nameEl) nameEl.textContent = file.name;

        this.updateCustomPhotoUI();
        this.renderCardOutputs();

        if (typeof showToast === 'function') {
          showToast('Citizen passport photo uploaded & positioned on Front card!', 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  removeCustomPhoto() {
    this.customPhotoImg = null;
    this.customPhotoEnabled = false;
    const input = document.getElementById('pvcPhotoFileInput');
    if (input) input.value = '';
    this.updateCustomPhotoUI();
    this.renderCardOutputs();
    if (typeof showToast === 'function') {
      showToast('Custom passport photo removed.', 'info');
    }
  },

  resetPhotoPosition() {
    this.customPhotoPos = { x: 65, y: 165, width: 250, height: 318, scale: 1.0 };
    const xSlider = document.getElementById('pvcPhotoXSlider');
    const ySlider = document.getElementById('pvcPhotoYSlider');
    const scaleSlider = document.getElementById('pvcPhotoScaleSlider');
    const xVal = document.getElementById('pvcPhotoXVal');
    const yVal = document.getElementById('pvcPhotoYVal');
    const scaleVal = document.getElementById('pvcPhotoScaleVal');

    if (xSlider) xSlider.value = 65;
    if (ySlider) ySlider.value = 165;
    if (scaleSlider) scaleSlider.value = 100;
    if (xVal) xVal.textContent = '65px';
    if (yVal) yVal.textContent = '165px';
    if (scaleVal) scaleVal.textContent = '100%';

    this.renderCardOutputs();
  },

  toggleFrontQr(forceState) {
    if (typeof forceState === 'boolean') {
      this.frontQrEnabled = forceState;
    } else {
      this.frontQrEnabled = !this.frontQrEnabled;
    }
    this.updateFrontQrUI();
    this.renderCardOutputs();

    if (typeof showToast === 'function') {
      showToast(this.frontQrEnabled ? 'Front QR Code overlay enabled!' : 'Front QR Code overlay turned off.', 'info');
    }
  },

  updateFrontQrUI() {
    const btn = document.getElementById('pvcQrToggleBtn');
    const knob = document.getElementById('pvcQrToggleKnob');
    const box = document.getElementById('pvcQrControlsBox');
    const removeBtn = document.getElementById('pvcRemoveQrBtn');

    if (btn && knob) {
      if (this.frontQrEnabled) {
        btn.className = 'relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-sky-600 shadow-inner';
        btn.setAttribute('aria-checked', 'true');
        knob.className = 'pointer-events-none inline-flex h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-6 items-center justify-center text-[9px] font-black text-sky-600';
        knob.textContent = 'ON';
      } else {
        btn.className = 'relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-300 shadow-inner';
        btn.setAttribute('aria-checked', 'false');
        knob.className = 'pointer-events-none inline-flex h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 items-center justify-center text-[9px] font-black text-slate-500';
        knob.textContent = 'OFF';
      }
    }

    if (box) {
      if (this.frontQrImg) box.classList.remove('hidden');
      else box.classList.add('hidden');
    }

    if (removeBtn) {
      if (this.frontQrImg) removeBtn.classList.remove('hidden');
      else removeBtn.classList.add('hidden');
    }
  },

  loadFrontQr(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.frontQrImg = img;
        this.frontQrEnabled = true;

        const thumb = document.getElementById('pvcCustomQrThumb');
        const nameEl = document.getElementById('pvcQrFileName');
        if (thumb) thumb.src = e.target.result;
        if (nameEl) nameEl.textContent = file.name;

        this.updateFrontQrUI();
        this.renderCardOutputs();

        if (typeof showToast === 'function') {
          showToast('Aadhaar QR code uploaded & overlaid on Front card!', 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  startQrCuttingSelection() {
    if (!this.sourceCanvas) {
      if (typeof showToast === 'function') {
        showToast('Please upload or open a document first before selecting QR.', 'warning');
      }
      return;
    }

    if (!this.qrCrop || this.qrCrop.width <= 10) {
      this.initQrCropBox();
    }

    this.setActiveCropSide('qr');

    const wrapper = document.getElementById('pvcCanvasWrapper');
    if (wrapper) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      wrapper.focus();
    }

    if (typeof showToast === 'function') {
      showToast('🟣 Move & resize the purple box over the QR code on your document!', 'info');
    }
  },

  initQrCropBox() {
    if (!this.sourceCanvas) return;
    const w = this.sourceCanvas.width;
    const h = this.sourceCanvas.height;

    if (this.backCrop && this.backCrop.width > 100) {
      const qrW = Math.round(this.backCrop.width * 0.42);
      const qrH = qrW;
      const qrX = Math.round(this.backCrop.x + this.backCrop.width * 0.52);
      const qrY = Math.round(this.backCrop.y + (this.backCrop.height - qrH) / 2);
      this.qrCrop = { x: qrX, y: qrY, width: qrW, height: qrH };
    } else {
      const size = Math.round(Math.min(w, h) * 0.25);
      this.qrCrop = {
        x: Math.round(w * 0.65),
        y: Math.round(h * 0.65),
        width: size,
        height: size
      };
    }
  },

  extractQrFromCropBox() {
    if (!this.sourceCanvas || !this.qrCrop || this.qrCrop.width <= 10 || this.qrCrop.height <= 10) return;

    const qb = this.qrCrop;
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = 400;
    qrCanvas.height = 400;
    const qCtx = qrCanvas.getContext('2d');

    // Pure white background for crisp QR scanning
    qCtx.fillStyle = '#ffffff';
    qCtx.fillRect(0, 0, 400, 400);

    qCtx.drawImage(
      this.sourceCanvas,
      qb.x, qb.y, qb.width, qb.height,
      12, 12, 376, 376
    );

    const dataUrl = qrCanvas.toDataURL('image/png');
    const img = new Image();
    img.onload = () => {
      this.frontQrImg = img;
      this.frontQrEnabled = true;

      const thumb = document.getElementById('pvcCustomQrThumb');
      const nameEl = document.getElementById('pvcQrFileName');
      if (thumb) thumb.src = dataUrl;
      if (nameEl) nameEl.textContent = `Crop_QR_${qb.width}x${qb.height}.png`;

      this.updateFrontQrUI();
      this.renderCardOutputs();
    };
    img.src = dataUrl;
  },

  applyCurrentQrCrop() {
    this.extractQrFromCropBox();
    this.setActiveCropSide('front');
    if (typeof showToast === 'function') {
      showToast('Aadhaar QR Code cropped & positioned on Front card!', 'success');
    }
  },

  autoExtractQrFromDocument() {
    if (!this.sourceCanvas) {
      if (typeof showToast === 'function') {
        showToast('Please upload a document first before extracting QR.', 'warning');
      }
      return;
    }

    let qrBox;
    if (this.backCrop && this.backCrop.width > 100) {
      // Standard e-Aadhaar back card QR region (right side)
      const qrW = Math.round(this.backCrop.width * 0.44);
      const qrH = qrW;
      const qrX = Math.round(this.backCrop.x + this.backCrop.width * 0.52);
      const qrY = Math.round(this.backCrop.y + (this.backCrop.height - qrH) / 2);
      qrBox = { x: qrX, y: qrY, w: qrW, h: qrH };
    } else {
      const size = Math.round(Math.min(this.sourceCanvas.width, this.sourceCanvas.height) * 0.30);
      qrBox = {
        x: Math.round(this.sourceCanvas.width * 0.65),
        y: Math.round(this.sourceCanvas.height * 0.65),
        w: size,
        h: size
      };
    }

    this.qrCrop = { x: qrBox.x, y: qrBox.y, width: qrBox.w, height: qrBox.h };
    this.extractQrFromCropBox();
    this.drawCropOverlay();

    if (typeof showToast === 'function') {
      showToast('Aadhaar QR Code automatically cropped & positioned on Front card!', 'success');
    }
  },

  removeFrontQr() {
    this.frontQrImg = null;
    this.frontQrEnabled = false;
    const input = document.getElementById('pvcQrFileInput');
    if (input) input.value = '';
    this.updateFrontQrUI();
    this.renderCardOutputs();
    if (typeof showToast === 'function') {
      showToast('Front QR Code removed.', 'info');
    }
  },

  resetQrPosition() {
    this.frontQrPos = { x: 785, y: 310, size: 180 };
    const xSlider = document.getElementById('pvcQrXSlider');
    const ySlider = document.getElementById('pvcQrYSlider');
    const sizeSlider = document.getElementById('pvcQrSizeSlider');
    const xVal = document.getElementById('pvcQrXVal');
    const yVal = document.getElementById('pvcQrYVal');
    const sizeVal = document.getElementById('pvcQrSizeVal');

    if (xSlider) xSlider.value = 785;
    if (ySlider) ySlider.value = 310;
    if (sizeSlider) sizeSlider.value = 180;
    if (xVal) xVal.textContent = '785px';
    if (yVal) yVal.textContent = '310px';
    if (sizeVal) sizeVal.textContent = '180px';

    this.renderCardOutputs();
  },

  setBgStyle(style) {
    this.toggleBackground(style === 'hd_aadhaar');
  },

  loadSampleDemo() {
    const fileNameEl = document.getElementById('pvcLoadedFileName');
    const fileSizeEl = document.getElementById('pvcLoadedFileSize');
    if (fileNameEl) fileNameEl.textContent = "Aadhaar_2.0_HD_Demo.png (Sample)";
    if (fileSizeEl) fileSizeEl.textContent = "• Ready to Print";

    const statusBanner = document.getElementById('pvcLoadedDocBanner');
    if (statusBanner) statusBanner.classList.remove('hidden');

    const pageControl = document.getElementById('pvcPageControlBox');
    if (pageControl) pageControl.classList.add('hidden');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this.sourceType = 'image';
      this.loadSourceImage(img);

      const scaleX = img.naturalWidth / 1024;
      const scaleY = img.naturalHeight / 576;

      this.frontCrop = {
        x: Math.round(85 * scaleX),
        y: Math.round(83 * scaleY),
        width: Math.round(414 * scaleX),
        height: Math.round(261 * scaleY)
      };

      this.backCrop = {
        x: Math.round(525 * scaleX),
        y: Math.round(83 * scaleY),
        width: Math.round(414 * scaleX),
        height: Math.round(261 * scaleY)
      };

      this.initQrCropBox();
      this.drawCropOverlay();
      this.renderCardOutputs();
    };
    img.src = 'assets/sample_aadhaar_pvc.png';
  },

  bindEvents() {
    // 1. File Input & Drag and Drop
    const fileInput = document.getElementById('pvcFileInput');
    const dropZone = document.getElementById('pvcDropZone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('border-sky-500', 'bg-sky-50/70');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('border-sky-500', 'bg-sky-50/70');
        });
      });

      dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    // 2. Print Layout Tabs
    document.querySelectorAll('.pvc-layout-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const layout = e.currentTarget.getAttribute('data-pvc-layout');
        this.setLayout(layout);
      });
    });

    // 3. Filter Sliders
    ['Brightness', 'Contrast', 'Saturation'].forEach(key => {
      const lower = key.toLowerCase();
      const slider = document.getElementById(`pvc${key}Slider`);
      const valText = document.getElementById(`pvc${key}Val`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.filters[lower] = parseInt(e.target.value, 10);
          if (valText) valText.textContent = `${this.filters[lower]}%`;
          this.renderCardOutputs();
        });
      }
    });

    // 4. Password Modal Form
    const pwdForm = document.getElementById('pvcPasswordForm');
    if (pwdForm) {
      pwdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwdInput = document.getElementById('pvcPdfPasswordInput');
        if (pwdInput && pwdInput.value) {
          // Normalize to uppercase for Indian e-Aadhaar PDFs
          this.pdfPassword = pwdInput.value.trim().toUpperCase();
          this.renderPdfDocument();
        }
      });
    }

    // 4b. Citizen Photo Update Input & Sliders
    const photoInput = document.getElementById('pvcPhotoFileInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadCustomPhoto(e.target.files[0]);
        }
      });
    }

    const photoXSlider = document.getElementById('pvcPhotoXSlider');
    const photoYSlider = document.getElementById('pvcPhotoYSlider');
    const photoScaleSlider = document.getElementById('pvcPhotoScaleSlider');
    const photoXVal = document.getElementById('pvcPhotoXVal');
    const photoYVal = document.getElementById('pvcPhotoYVal');
    const photoScaleVal = document.getElementById('pvcPhotoScaleVal');

    if (photoXSlider) {
      photoXSlider.addEventListener('input', (e) => {
        this.customPhotoPos.x = parseInt(e.target.value, 10);
        if (photoXVal) photoXVal.textContent = `${this.customPhotoPos.x}px`;
        this.renderCardOutputs();
      });
    }

    if (photoYSlider) {
      photoYSlider.addEventListener('input', (e) => {
        this.customPhotoPos.y = parseInt(e.target.value, 10);
        if (photoYVal) photoYVal.textContent = `${this.customPhotoPos.y}px`;
        this.renderCardOutputs();
      });
    }

    if (photoScaleSlider) {
      photoScaleSlider.addEventListener('input', (e) => {
        const pct = parseInt(e.target.value, 10);
        this.customPhotoPos.scale = pct / 100;
        if (photoScaleVal) photoScaleVal.textContent = `${pct}%`;
        this.renderCardOutputs();
      });
    }

    // 4c. Front QR Code Input & Sliders
    const qrInput = document.getElementById('pvcQrFileInput');
    if (qrInput) {
      qrInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFrontQr(e.target.files[0]);
        }
      });
    }

    const qrXSlider = document.getElementById('pvcQrXSlider');
    const qrYSlider = document.getElementById('pvcQrYSlider');
    const qrSizeSlider = document.getElementById('pvcQrSizeSlider');
    const qrXVal = document.getElementById('pvcQrXVal');
    const qrYVal = document.getElementById('pvcQrYVal');
    const qrSizeVal = document.getElementById('pvcQrSizeVal');

    if (qrXSlider) {
      qrXSlider.addEventListener('input', (e) => {
        this.frontQrPos.x = parseInt(e.target.value, 10);
        if (qrXVal) qrXVal.textContent = `${this.frontQrPos.x}px`;
        this.renderCardOutputs();
      });
    }

    if (qrYSlider) {
      qrYSlider.addEventListener('input', (e) => {
        this.frontQrPos.y = parseInt(e.target.value, 10);
        if (qrYVal) qrYVal.textContent = `${this.frontQrPos.y}px`;
        this.renderCardOutputs();
      });
    }

    if (qrSizeSlider) {
      qrSizeSlider.addEventListener('input', (e) => {
        this.frontQrPos.size = parseInt(e.target.value, 10);
        if (qrSizeVal) qrSizeVal.textContent = `${this.frontQrPos.size}px`;
        this.renderCardOutputs();
      });
    }

    // 5. Active Crop Toggle (Front / Back / QR)
    const frontBtn = document.getElementById('pvcSelectFrontBtn');
    const backBtn = document.getElementById('pvcSelectBackBtn');
    const qrBtn = document.getElementById('pvcSelectQrBtn');
    if (frontBtn) {
      frontBtn.addEventListener('click', () => this.setActiveCropSide('front'));
    }
    if (backBtn) {
      backBtn.addEventListener('click', () => this.setActiveCropSide('back'));
    }
    if (qrBtn) {
      qrBtn.addEventListener('click', () => this.startQrCuttingSelection());
    }

    // Background Tone Slider (Light to Dark)
    const bgToneSlider = document.getElementById('pvcBgToneSlider');
    const bgToneVal = document.getElementById('pvcBgToneVal');
    if (bgToneSlider) {
      bgToneSlider.addEventListener('input', (e) => {
        this.bgTone = parseInt(e.target.value, 10);
        if (bgToneVal) bgToneVal.textContent = `${this.bgTone}%`;
        this.renderCardOutputs();
      });
    }

    // 6. Auto Preset Crop Button
    const autoPresetBtn = document.getElementById('pvcAutoPresetCropBtn');
    if (autoPresetBtn) {
      autoPresetBtn.addEventListener('click', () => this.applySmartPresetCrops());
    }

    // 7. Swap Front & Back
    const swapBtn = document.getElementById('pvcSwapCropsBtn');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => this.swapFrontAndBack());
    }

    // 8. Reset Filters
    const resetFiltersBtn = document.getElementById('pvcResetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => this.resetFilters());
    }

    // 9. Cut Marks Toggle
    const cutMarksCheck = document.getElementById('pvcCutMarksCheck');
    if (cutMarksCheck) {
      cutMarksCheck.addEventListener('change', (e) => {
        this.showCutMarks = e.target.checked;
        this.renderCardOutputs();
      });
    }

    // 10. Tray Fine-Tuning Calibration (X/Y Offset)
    const xOffInput = document.getElementById('pvcTrayXOffset');
    const yOffInput = document.getElementById('pvcTrayYOffset');
    if (xOffInput) {
      xOffInput.addEventListener('input', (e) => {
        this.trayCalibration.xOffset = parseFloat(e.target.value) || 0;
        this.renderCardOutputs();
      });
    }
    if (yOffInput) {
      yOffInput.addEventListener('input', (e) => {
        this.trayCalibration.yOffset = parseFloat(e.target.value) || 0;
        this.renderCardOutputs();
      });
    }
  },

  setZoom(delta) {
    if (delta === 0) {
      this.zoomLevel = 1.0;
    } else {
      this.zoomLevel = Math.max(0.6, Math.min(2.2, parseFloat((this.zoomLevel + delta).toFixed(2))));
    }
    const canvas = document.getElementById('pvcCropOverlayCanvas');
    const zoomText = document.getElementById('pvcZoomLevelText');
    if (zoomText) zoomText.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    if (canvas) {
      canvas.style.transform = `scale(${this.zoomLevel})`;
      canvas.style.transformOrigin = 'top center';
    }
  },

  setLayout(layout) {
    this.printLayout = layout;
    document.querySelectorAll('.pvc-layout-tab-btn').forEach(b => {
      const bLayout = b.getAttribute('data-pvc-layout');
      if (bLayout === layout) {
        b.className = 'pvc-layout-tab-btn py-2 px-3 rounded-xl font-black text-xs bg-sky-600 text-white shadow-sm flex items-center gap-1.5 transition-all';
      } else {
        b.className = 'pvc-layout-tab-btn py-2 px-3 rounded-xl font-bold text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-all';
      }
    });

    const calibBox = document.getElementById('pvcTrayCalibrationBox');
    if (calibBox) {
      if (layout === 'epson_tray') {
        calibBox.classList.remove('hidden');
      } else {
        calibBox.classList.add('hidden');
      }
    }

    this.renderCardOutputs();
  },

  setActiveCropSide(side) {
    this.activeCropSide = side;
    const frontBtn = document.getElementById('pvcSelectFrontBtn');
    const backBtn = document.getElementById('pvcSelectBackBtn');
    const qrBtn = document.getElementById('pvcSelectQrBtn');
    const qrBanner = document.getElementById('pvcQrCropGuideBanner');

    if (frontBtn) {
      frontBtn.className = (side === 'front')
        ? 'py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm bg-sky-600 text-white shadow-md flex items-center justify-center gap-2 ring-2 ring-sky-300 transition-all'
        : 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-2 transition-all';
    }
    if (backBtn) {
      backBtn.className = (side === 'back')
        ? 'py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 text-white shadow-md flex items-center justify-center gap-2 ring-2 ring-emerald-300 transition-all'
        : 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-2 transition-all';
    }
    if (qrBtn) {
      qrBtn.className = (side === 'qr')
        ? 'py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm bg-purple-600 text-white shadow-md flex items-center justify-center gap-2 ring-2 ring-purple-300 transition-all'
        : 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center gap-2 transition-all';
    }

    if (qrBanner) {
      if (side === 'qr') qrBanner.classList.remove('hidden');
      else qrBanner.classList.add('hidden');
    }

    this.drawCropOverlay();
  },

  loadFile(file) {
    if (!file) return;

    this.sourceType = null;
    this.pdfDoc = null;
    this.pdfBytes = null;
    this.currentPage = 1;
    this.totalPages = 1;

    const fileNameEl = document.getElementById('pvcLoadedFileName');
    const fileSizeEl = document.getElementById('pvcLoadedFileSize');
    if (fileNameEl) fileNameEl.textContent = file.name;
    if (fileSizeEl) fileSizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    const statusBanner = document.getElementById('pvcLoadedDocBanner');
    if (statusBanner) statusBanner.classList.remove('hidden');

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.sourceType = 'pdf';
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store raw buffer immutably to prevent PDF.js Web Worker detachment
        this.pdfRawBuffer = e.target.result;
        this.pdfPassword = '';
        this.renderPdfDocument();
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith('image/')) {
      this.sourceType = 'image';
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.loadSourceImage(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      if (typeof showToast === 'function') {
        showToast('Please upload an official PDF document or an image file (JPG, PNG).', 'error');
      }
    }
  },

  renderPdfDocument() {
    if (!this.pdfRawBuffer) return;

    if (typeof pdfjsLib === 'undefined') {
      if (typeof showToast === 'function') {
        showToast('PDF rendering engine is loading. Please wait 2 seconds and try again.', 'warning');
      }
      return;
    }

    // Always clone buffer using slice(0) so the PDF.js Web Worker never detaches our master buffer
    const freshBytes = new Uint8Array(this.pdfRawBuffer.slice(0));

    const loadingTask = pdfjsLib.getDocument({
      data: freshBytes,
      password: (this.pdfPassword || '').trim().toUpperCase()
    });

    loadingTask.promise.then(pdf => {
      this.pdfDoc = pdf;
      this.totalPages = pdf.numPages;
      this.currentPage = 1;
      this.closePasswordModal();

      const pageControl = document.getElementById('pvcPageControlBox');
      const pageInfo = document.getElementById('pvcPageInfoText');
      if (pageControl) {
        if (this.totalPages > 1) {
          pageControl.classList.remove('hidden');
          pageControl.style.display = 'inline-flex';
          if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        } else {
          pageControl.classList.add('hidden');
        }
      }

      if (typeof showToast === 'function' && this.pdfPassword) {
        showToast('Document decrypted & unlocked successfully!', 'success');
      }

      this.renderPdfPage(this.currentPage);
    }).catch(err => {
      if (err.name === 'PasswordException') {
        const isWrong = (this.pdfPassword && this.pdfPassword.length > 0) || err.code === 2;
        this.openPasswordModal(
          isWrong ? 'Incorrect password! For e-Aadhaar: Use 4 CAPITALS of Name + Year of Birth (e.g. SURE1985).' : ''
        );
      } else {
        console.error('PDF Load Error:', err);
        if (typeof showToast === 'function') {
          showToast(`Failed to open PDF: ${err.message}`, 'error');
        }
      }
    });
  },

  changePdfPage(delta) {
    if (!this.pdfDoc) return;
    const target = this.currentPage + delta;
    if (target >= 1 && target <= this.totalPages) {
      this.currentPage = target;
      const pageInfo = document.getElementById('pvcPageInfoText');
      if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
      this.renderPdfPage(this.currentPage);
    }
  },

  renderPdfPage(pageNum) {
    if (!this.pdfDoc) return;

    this.pdfDoc.getPage(pageNum).then(page => {
      const scale = 2.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        this.sourceCanvas = canvas;
        this.sourceCtx = ctx;
        this.onSourceReady();
      });
    });
  },

  loadSourceImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    this.sourceCanvas = canvas;
    this.sourceCtx = ctx;
    this.onSourceReady();
  },

  onSourceReady() {
    const promptZone = document.getElementById('pvcUploadPrompt');
    const editorWorkspace = document.getElementById('pvcEditorWorkspace');
    if (promptZone) promptZone.classList.add('hidden');
    if (editorWorkspace) editorWorkspace.classList.remove('hidden');

    this.applySmartPresetCrops();

    if (typeof showToast === 'function') {
      showToast('Document loaded successfully! Front & Back crop boxes positioned.', 'success');
    }
  },

  applySmartPresetCrops() {
    if (!this.sourceCanvas) return;

    const w = this.sourceCanvas.width;
    const h = this.sourceCanvas.height;
    const cr80Ratio = 85.60 / 53.98; // ~1.5858

    // Intelligent default detection:
    // If e-Aadhaar PDF: Card sits at the bottom 30% of page
    if (h > w * 1.25) {
      // Standard A4 portrait document (e-Aadhaar or Parivahan PDF)
      const cardHeight = Math.round(h * 0.23);
      const cardWidth = Math.round(cardHeight * cr80Ratio);
      const startY = Math.round(h * 0.73);
      const startX = Math.round((w - (cardWidth * 2 + w * 0.03)) / 2);
      const gap = Math.round(w * 0.03);

      this.frontCrop = {
        x: Math.max(10, startX),
        y: Math.min(h - cardHeight - 10, startY),
        width: cardWidth,
        height: cardHeight
      };

      this.backCrop = {
        x: Math.min(w - cardWidth - 10, startX + cardWidth + gap),
        y: Math.min(h - cardHeight - 10, startY),
        width: cardWidth,
        height: cardHeight
      };
    } else {
      // Landscape or side-by-side scanned card photo
      const cardWidth = Math.round(w * 0.44);
      const cardHeight = Math.round(cardWidth / cr80Ratio);
      const startY = Math.round((h - cardHeight) / 2);

      this.frontCrop = {
        x: Math.round(w * 0.04),
        y: startY,
        width: cardWidth,
        height: cardHeight
      };
      this.backCrop = {
        x: Math.round(w * 0.52),
        y: startY,
        width: cardWidth,
        height: cardHeight
      };
    }

    this.initQrCropBox();
    this.drawCropOverlay();
    this.renderCardOutputs();
  },

  setupCropCanvasInteraction() {
    const overlayCanvas = document.getElementById('pvcCropOverlayCanvas');
    const canvasWrapper = document.getElementById('pvcCanvasWrapper');
    if (!overlayCanvas) return;

    const getCanvasPoint = (e) => {
      const rect = overlayCanvas.getBoundingClientRect();
      const scaleX = overlayCanvas.width / rect.width;
      const scaleY = overlayCanvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const isInsideBox = (pt, box) => {
      return pt.x >= box.x && pt.x <= box.x + box.width &&
             pt.y >= box.y && pt.y <= box.y + box.height;
    };

    // Detect all 8 handles (4 corners + 4 edges)
    const getHandle = (pt, box) => {
      const cornerTol = 24; // corner hit tolerance
      const edgeTol = 16;   // edge hit tolerance

      // 1. Four Corners
      if (Math.abs(pt.x - box.x) <= cornerTol && Math.abs(pt.y - box.y) <= cornerTol) return 'tl';
      if (Math.abs(pt.x - (box.x + box.width)) <= cornerTol && Math.abs(pt.y - box.y) <= cornerTol) return 'tr';
      if (Math.abs(pt.x - box.x) <= cornerTol && Math.abs(pt.y - (box.y + box.height)) <= cornerTol) return 'bl';
      if (Math.abs(pt.x - (box.x + box.width)) <= cornerTol && Math.abs(pt.y - (box.y + box.height)) <= cornerTol) return 'br';

      // 2. Four Edges (Midpoints)
      const midX = box.x + box.width / 2;
      const midY = box.y + box.height / 2;
      if (Math.abs(pt.y - box.y) <= edgeTol && pt.x >= box.x + cornerTol && pt.x <= box.x + box.width - cornerTol) return 't';
      if (Math.abs(pt.y - (box.y + box.height)) <= edgeTol && pt.x >= box.x + cornerTol && pt.x <= box.x + box.width - cornerTol) return 'b';
      if (Math.abs(pt.x - box.x) <= edgeTol && pt.y >= box.y + cornerTol && pt.y <= box.y + box.height - cornerTol) return 'l';
      if (Math.abs(pt.x - (box.x + box.width)) <= edgeTol && pt.y >= box.y + cornerTol && pt.y <= box.y + box.height - cornerTol) return 'r';

      return null;
    };

    const getActiveBox = () => {
      if (this.activeCropSide === 'front') return this.frontCrop;
      if (this.activeCropSide === 'back') return this.backCrop;
      return this.qrCrop;
    };

    // Update cursor based on hover over 8 handles
    overlayCanvas.addEventListener('mousemove', (e) => {
      if (this.isDraggingCrop || this.isResizingCrop) return;
      const pt = getCanvasPoint(e);
      const activeBox = getActiveBox();

      const handle = getHandle(pt, activeBox);
      if (handle === 'tl' || handle === 'br') overlayCanvas.style.cursor = 'nwse-resize';
      else if (handle === 'tr' || handle === 'bl') overlayCanvas.style.cursor = 'nesw-resize';
      else if (handle === 't' || handle === 'b') overlayCanvas.style.cursor = 'ns-resize';
      else if (handle === 'l' || handle === 'r') overlayCanvas.style.cursor = 'ew-resize';
      else if (isInsideBox(pt, activeBox) || isInsideBox(pt, this.frontCrop) || isInsideBox(pt, this.backCrop) || isInsideBox(pt, this.qrCrop)) overlayCanvas.style.cursor = 'move';
      else overlayCanvas.style.cursor = 'crosshair';
    });

    overlayCanvas.addEventListener('mousedown', (e) => {
      const pt = getCanvasPoint(e);
      const activeBox = getActiveBox();

      const handle = getHandle(pt, activeBox);
      if (handle) {
        this.isResizingCrop = true;
        this.dragHandle = handle;
        this.dragStartX = pt.x;
        this.dragStartY = pt.y;
        this.initialCrop = { ...activeBox };
        return;
      }

      if (isInsideBox(pt, activeBox)) {
        this.isDraggingCrop = true;
        this.dragStartX = pt.x;
        this.dragStartY = pt.y;
        this.initialCrop = { ...activeBox };
        return;
      }

      const otherBoxes = [
        { side: 'front', box: this.frontCrop },
        { side: 'back', box: this.backCrop },
        { side: 'qr', box: this.qrCrop }
      ];

      for (const item of otherBoxes) {
        if (item.side !== this.activeCropSide && isInsideBox(pt, item.box)) {
          this.setActiveCropSide(item.side);
          this.isDraggingCrop = true;
          this.dragStartX = pt.x;
          this.dragStartY = pt.y;
          this.initialCrop = { ...item.box };
          return;
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDraggingCrop && !this.isResizingCrop) return;
      const pt = getCanvasPoint(e);
      const dx = pt.x - this.dragStartX;
      const dy = pt.y - this.dragStartY;
      const activeBox = getActiveBox();

      if (this.isDraggingCrop && this.initialCrop) {
        activeBox.x = Math.max(0, Math.min(this.sourceCanvas.width - activeBox.width, Math.round(this.initialCrop.x + dx)));
        activeBox.y = Math.max(0, Math.min(this.sourceCanvas.height - activeBox.height, Math.round(this.initialCrop.y + dy)));
        this.drawCropOverlay();
      } else if (this.isResizingCrop && this.initialCrop) {
        const minW = 40;
        const minH = 30;
        const maxW = this.sourceCanvas.width;
        const maxH = this.sourceCanvas.height;

        // Free 4-side & 4-corner resizing (standard CR-80 output mapping occurs on render)
        switch (this.dragHandle) {
          case 'r': {
            const newW = Math.max(minW, Math.min(maxW - this.initialCrop.x, this.initialCrop.width + dx));
            activeBox.width = Math.round(newW);
            break;
          }
          case 'l': {
            const newW = Math.max(minW, Math.min(this.initialCrop.x + this.initialCrop.width, this.initialCrop.width - dx));
            const newX = this.initialCrop.x + (this.initialCrop.width - newW);
            activeBox.x = Math.max(0, Math.round(newX));
            activeBox.width = Math.round(newW);
            break;
          }
          case 'b': {
            const newH = Math.max(minH, Math.min(maxH - this.initialCrop.y, this.initialCrop.height + dy));
            activeBox.height = Math.round(newH);
            break;
          }
          case 't': {
            const newH = Math.max(minH, Math.min(this.initialCrop.y + this.initialCrop.height, this.initialCrop.height - dy));
            const newY = this.initialCrop.y + (this.initialCrop.height - newH);
            activeBox.y = Math.max(0, Math.round(newY));
            activeBox.height = Math.round(newH);
            break;
          }
          case 'br': {
            const newW = Math.max(minW, Math.min(maxW - this.initialCrop.x, this.initialCrop.width + dx));
            const newH = Math.max(minH, Math.min(maxH - this.initialCrop.y, this.initialCrop.height + dy));
            activeBox.width = Math.round(newW);
            activeBox.height = Math.round(newH);
            break;
          }
          case 'bl': {
            const newW = Math.max(minW, Math.min(this.initialCrop.x + this.initialCrop.width, this.initialCrop.width - dx));
            const newX = this.initialCrop.x + (this.initialCrop.width - newW);
            const newH = Math.max(minH, Math.min(maxH - this.initialCrop.y, this.initialCrop.height + dy));
            activeBox.x = Math.max(0, Math.round(newX));
            activeBox.width = Math.round(newW);
            activeBox.height = Math.round(newH);
            break;
          }
          case 'tr': {
            const newW = Math.max(minW, Math.min(maxW - this.initialCrop.x, this.initialCrop.width + dx));
            const newH = Math.max(minH, Math.min(this.initialCrop.y + this.initialCrop.height, this.initialCrop.height - dy));
            const newY = this.initialCrop.y + (this.initialCrop.height - newH);
            activeBox.y = Math.max(0, Math.round(newY));
            activeBox.width = Math.round(newW);
            activeBox.height = Math.round(newH);
            break;
          }
          case 'tl': {
            const newW = Math.max(minW, Math.min(this.initialCrop.x + this.initialCrop.width, this.initialCrop.width - dx));
            const newX = this.initialCrop.x + (this.initialCrop.width - newW);
            const newH = Math.max(minH, Math.min(this.initialCrop.y + this.initialCrop.height, this.initialCrop.height - dy));
            const newY = this.initialCrop.y + (this.initialCrop.height - newH);
            activeBox.x = Math.max(0, Math.round(newX));
            activeBox.y = Math.max(0, Math.round(newY));
            activeBox.width = Math.round(newW);
            activeBox.height = Math.round(newH);
            break;
          }
        }
        this.drawCropOverlay();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingCrop || this.isResizingCrop) {
        this.isDraggingCrop = false;
        this.isResizingCrop = false;
        this.dragHandle = null;
        this.initialCrop = null;

        if (this.activeCropSide === 'qr') {
          this.extractQrFromCropBox();
        } else {
          this.renderCardOutputs();
        }
      }
    });

    // 1. Mouse Wheel Interaction: Smooth Zooming & Crop Resizing
    const handleWheelZoom = (e) => {
      if (!this.sourceCanvas) return;
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey || e.altKey) {
        // Shift or Alt + Scroll: resize active crop box smoothly
        const activeBox = getActiveBox();
        const factor = e.deltaY < 0 ? 1.04 : 0.96;
        const newW = Math.round(activeBox.width * factor);
        const newH = Math.round(activeBox.height * factor);
        if (newW >= 40 && newH >= 30 && activeBox.x + newW <= this.sourceCanvas.width && activeBox.y + newH <= this.sourceCanvas.height) {
          activeBox.width = newW;
          activeBox.height = newH;
          this.drawCropOverlay();
          this.renderCardOutputs();
        }
      } else {
        // Standard Mouse Wheel: Smooth Zoom In / Zoom Out
        const delta = e.deltaY < 0 ? 0.12 : -0.12;
        this.setZoom(delta);
      }
    };

    overlayCanvas.addEventListener('wheel', handleWheelZoom, { passive: false });
    if (canvasWrapper) {
      canvasWrapper.addEventListener('wheel', handleWheelZoom, { passive: false });
    }

    // 2. Keyboard Arrow Keys Interaction: Pixel-perfect Nudging & Sizing
    window.addEventListener('keydown', (e) => {
      const pvcView = document.getElementById('view_pvcprint');
      if (!pvcView || pvcView.classList.contains('hidden') || !this.sourceCanvas) return;

      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) return;

      const activeBox = getActiveBox();
      const step = e.shiftKey ? 10 : 1; // 1px default, 10px with Shift

      if (e.altKey) {
        // Alt + Arrow keys: Resize active crop box
        let changed = false;
        if (e.key === 'ArrowRight') {
          activeBox.width = Math.min(this.sourceCanvas.width - activeBox.x, activeBox.width + step);
          changed = true;
        } else if (e.key === 'ArrowLeft') {
          activeBox.width = Math.max(40, activeBox.width - step);
          changed = true;
        } else if (e.key === 'ArrowDown') {
          activeBox.height = Math.min(this.sourceCanvas.height - activeBox.y, activeBox.height + step);
          changed = true;
        } else if (e.key === 'ArrowUp') {
          activeBox.height = Math.max(30, activeBox.height - step);
          changed = true;
        }
        if (changed) {
          e.preventDefault();
          this.drawCropOverlay();
          if (this.activeCropSide === 'qr') {
            this.extractQrFromCropBox();
          } else {
            this.renderCardOutputs();
          }
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Normal Arrow keys: Nudge active crop box position
        e.preventDefault();
        if (e.key === 'ArrowLeft') {
          activeBox.x = Math.max(0, activeBox.x - step);
        } else if (e.key === 'ArrowRight') {
          activeBox.x = Math.min(this.sourceCanvas.width - activeBox.width, activeBox.x + step);
        } else if (e.key === 'ArrowUp') {
          activeBox.y = Math.max(0, activeBox.y - step);
        } else if (e.key === 'ArrowDown') {
          activeBox.y = Math.min(this.sourceCanvas.height - activeBox.height, activeBox.y + step);
        }
        this.drawCropOverlay();
        if (this.activeCropSide === 'qr') {
          this.extractQrFromCropBox();
        } else {
          this.renderCardOutputs();
        }
      } else if (e.key === 'Tab') {
        // Tab key: Toggle active side between Front, Back, and QR
        e.preventDefault();
        const cycle = { front: 'back', back: 'qr', qr: 'front' };
        this.setActiveCropSide(cycle[this.activeCropSide] || 'front');
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        this.setZoom(0.15);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        this.setZoom(-0.15);
      } else if (e.key === '0') {
        e.preventDefault();
        this.setZoom(0);
      }
    });
  },

  drawCropOverlay() {
    if (!this.sourceCanvas) return;

    const overlayCanvas = document.getElementById('pvcCropOverlayCanvas');
    if (!overlayCanvas) return;

    overlayCanvas.width = this.sourceCanvas.width;
    overlayCanvas.height = this.sourceCanvas.height;
    const ctx = overlayCanvas.getContext('2d');

    // Draw document source
    ctx.drawImage(this.sourceCanvas, 0, 0);

    // Dark backdrop overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.48)';
    ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Clear and redraw bright content inside crop boxes
    const boxesToClear = [this.frontCrop, this.backCrop];
    if (this.activeCropSide === 'qr' || this.frontQrEnabled || (this.qrCrop && this.qrCrop.width > 0)) {
      boxesToClear.push(this.qrCrop);
    }

    boxesToClear.forEach(box => {
      if (box && box.width > 0 && box.height > 0) {
        ctx.clearRect(box.x, box.y, box.width, box.height);
        ctx.drawImage(this.sourceCanvas, box.x, box.y, box.width, box.height, box.x, box.y, box.width, box.height);
      }
    });

    const drawBox = (box, label, color, isActive) => {
      if (!box || box.width <= 0 || box.height <= 0) return;
      ctx.save();

      if (isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 4.5 : 2.5;
      ctx.setLineDash(isActive ? [] : [10, 6]);
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      if (isActive) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(box.x + 2, box.y + 2, box.width - 4, box.height - 4);
      }

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Top label badge
      ctx.fillStyle = color;
      const fontSize = Math.max(14, Math.round(box.height * 0.08));
      ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const badgeH = Math.max(28, Math.round(box.height * 0.10));
      const badgeW = textWidth + 24;

      ctx.fillRect(box.x, Math.max(0, box.y - badgeH), badgeW, badgeH);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, box.x + 12, Math.max(20, box.y - 8));

      // Center watermark text
      ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.32)' : 'rgba(255, 255, 255, 0.16)';
      ctx.font = `900 ${Math.max(15, Math.round(box.height * 0.11))}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const isQr = label.includes('QR');
      const centerLabel = isActive ? (isQr ? '🎯 ACTIVE (QR Crop)' : '🎯 ACTIVE (CR-80 Output)') : (label.split(' ')[1] || 'CROP');
      ctx.fillText(centerLabel, box.x + box.width / 2, box.y + box.height / 2);

      // Center crosshair alignment guides
      if (isActive) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(box.x + 15, box.y + box.height / 2);
        ctx.lineTo(box.x + box.width - 15, box.y + box.height / 2);
        ctx.moveTo(box.x + box.width / 2, box.y + 15);
        ctx.lineTo(box.x + box.width / 2, box.y + box.height - 15);
        ctx.stroke();
      }

      // Interactive 8 Handles (4 Corners + 4 Side Edges)
      if (isActive) {
        ctx.setLineDash([]);

        // 1. Four Corner Circles
        const handleRadius = 10;
        const cornerCoords = [
          { x: box.x, y: box.y },
          { x: box.x + box.width, y: box.y },
          { x: box.x, y: box.y + box.height },
          { x: box.x + box.width, y: box.y + box.height }
        ];

        cornerCoords.forEach(h => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(h.x, h.y, handleRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Four Side Midpoint Pill Handles (Top, Bottom, Left, Right)
        const pillW = 26;
        const pillH = 8;
        const edgePills = [
          { x: box.x + box.width / 2 - pillW / 2, y: box.y - pillH / 2, w: pillW, h: pillH }, // Top edge
          { x: box.x + box.width / 2 - pillW / 2, y: box.y + box.height - pillH / 2, w: pillW, h: pillH }, // Bottom edge
          { x: box.x - pillH / 2, y: box.y + box.height / 2 - pillW / 2, w: pillH, h: pillW }, // Left edge
          { x: box.x + box.width - pillH / 2, y: box.y + box.height / 2 - pillW / 2, w: pillH, h: pillW } // Right edge
        ];

        edgePills.forEach(ep => {
          ctx.fillStyle = color;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(ep.x, ep.y, ep.w, ep.h, 4);
          } else {
            ctx.rect(ep.x, ep.y, ep.w, ep.h);
          }
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      ctx.restore();
    };

    drawBox(this.frontCrop, '🟢 FRONT SIDE (85.6 × 54 mm)', '#0284c7', this.activeCropSide === 'front');
    drawBox(this.backCrop, '🔵 BACK SIDE (85.6 × 54 mm)', '#059669', this.activeCropSide === 'back');

    if (this.activeCropSide === 'qr' || this.frontQrEnabled || (this.qrCrop && this.qrCrop.width > 0)) {
      drawBox(this.qrCrop, '🟣 QR CODE CROP (କଟିଂ)', '#9333ea', this.activeCropSide === 'qr');
    }
  },

  swapFrontAndBack() {
    const temp = { ...this.frontCrop };
    this.frontCrop = { ...this.backCrop };
    this.backCrop = temp;
    this.drawCropOverlay();
    this.renderCardOutputs();
    if (typeof showToast === 'function') {
      showToast('Front & Back card crops swapped successfully!', 'info');
    }
  },

  resetFilters() {
    this.filters = {
      brightness: 100,
      contrast: 105,
      saturation: 100
    };

    ['Brightness', 'Contrast', 'Saturation'].forEach(k => {
      const lower = k.toLowerCase();
      const slider = document.getElementById(`pvc${k}Slider`);
      const valText = document.getElementById(`pvc${k}Val`);
      if (slider) slider.value = this.filters[lower];
      if (valText) valText.textContent = `${this.filters[lower]}%`;
    });

    this.renderCardOutputs();
    if (typeof showToast === 'function') {
      showToast('Color & brightness filters reset to recommended defaults.', 'info');
    }
  },

  renderCardOutputs() {
    if (!this.sourceCanvas) return;

    // Standard CR-80 High-Res Output Dimensions at 300 DPI
    const cardPxW = 1011;
    const cardPxH = 638;

    // Extract Front Card Canvas
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = cardPxW;
    frontCanvas.height = cardPxH;
    const fCtx = frontCanvas.getContext('2d', { willReadFrequently: true });
    this.renderSingleCard(fCtx, 'front', this.frontCrop, cardPxW, cardPxH);

    // Extract Back Card Canvas
    const backCanvas = document.createElement('canvas');
    backCanvas.width = cardPxW;
    backCanvas.height = cardPxH;
    const bCtx = backCanvas.getContext('2d', { willReadFrequently: true });
    this.renderSingleCard(bCtx, 'back', this.backCrop, cardPxW, cardPxH);

    this.frontProcessedCanvas = frontCanvas;
    this.backProcessedCanvas = backCanvas;

    const frontPreview = document.getElementById('pvcFrontCardPreview');
    const backPreview = document.getElementById('pvcBackCardPreview');
    if (frontPreview) {
      frontPreview.src = frontCanvas.toDataURL('image/png');
    }
    if (backPreview) {
      backPreview.src = backCanvas.toDataURL('image/png');
    }

    this.renderPrintSheetPreview(frontCanvas, backCanvas);
  },

  renderSingleCard(ctx, side, cropBox, targetW, targetH) {
    ctx.save();

    if (this.bgEnabled) {
      // 1. Draw Clean HD Color PVC Card Background (Tricolor Waves, Ashok Stambha & Security Mandala)
      this.drawHdAadhaarBackground(ctx, side, targetW, targetH);

      // 2. Extract cropped citizen content from source
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetW;
      tempCanvas.height = targetH;
      const tCtx = tempCanvas.getContext('2d');

      // Regardless of how the user cropped the 4 sides, map directly to exact standard CR-80 PVC dimensions
      tCtx.drawImage(
        this.sourceCanvas,
        cropBox.x, cropBox.y, cropBox.width, cropBox.height,
        0, 0, targetW, targetH
      );

      // Apply brightness, contrast & saturation
      const b = this.filters.brightness / 100;
      const c = this.filters.contrast / 100;
      const s = this.filters.saturation / 100;
      tCtx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
      tCtx.drawImage(tempCanvas, 0, 0);
      tCtx.filter = 'none';

      // Multiply blend mode so citizen details overlay seamlessly onto the clean HD template
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

    } else {
      // Original 1:1 Direct Scan Mode (Pure scan without background template)
      ctx.drawImage(
        this.sourceCanvas,
        cropBox.x, cropBox.y, cropBox.width, cropBox.height,
        0, 0, targetW, targetH
      );

      const b = this.filters.brightness / 100;
      const c = this.filters.contrast / 100;
      const s = this.filters.saturation / 100;
      ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
    }

    // 3. Citizen Photo Update Overlay with Scale / Bada-Chhota (Front Card)
    if (side === 'front' && this.customPhotoEnabled && this.customPhotoImg) {
      const scale = this.customPhotoPos.scale || 1.0;
      const effW = Math.round(this.customPhotoPos.width * scale);
      const effH = Math.round(this.customPhotoPos.height * scale);

      // Draw fresh passport photo
      ctx.drawImage(this.customPhotoImg, this.customPhotoPos.x, this.customPhotoPos.y, effW, effH);

      // Crisp official 2.5px dark photo border
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.customPhotoPos.x, this.customPhotoPos.y, effW, effH);
    }

    // 4. Front Card Aadhaar QR Code Overlay (Front Card)
    if (side === 'front' && this.frontQrEnabled && this.frontQrImg) {
      const qPos = this.frontQrPos;
      // Solid white background padding behind QR for maximum scan readability
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qPos.x - 6, qPos.y - 6, qPos.size + 12, qPos.size + 12);

      // Draw QR code image
      ctx.drawImage(this.frontQrImg, qPos.x, qPos.y, qPos.size, qPos.size);

      // Crisp border around QR badge
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qPos.x - 6, qPos.y - 6, qPos.size + 12, qPos.size + 12);
    }

    // Optional Dotted Cutting Border
    if (this.showCutMarks) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(1, 1, targetW - 2, targetH - 2);
    }

    ctx.restore();
  },

  drawHdAadhaarBackground(ctx, side, w, h) {
    ctx.save();

    // Dynamically scale intensity based on bgTone (15% to 100%)
    // Default 45% is soft, clean, and crystal-clear so citizen card text is 100% sharp
    const tone = (this.bgTone || 45) / 100;

    // 1. Base Cream: Ultra-clear ivory white at lower tones to prevent text muddiness
    ctx.fillStyle = tone < 0.5 ? '#fffefc' : '#fcf9f2';
    ctx.fillRect(0, 0, w, h);

    // Saffron warmth in top & center (scaled with tone)
    const bgWarmth = ctx.createRadialGradient(w * 0.75, 50, 20, w * 0.75, 50, 420);
    bgWarmth.addColorStop(0, `rgba(234, 88, 12, ${0.30 * tone})`);
    bgWarmth.addColorStop(0.6, `rgba(249, 115, 22, ${0.16 * tone})`);
    bgWarmth.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bgWarmth;
    ctx.fillRect(0, 0, w, h);

    // 2. Central Security Guilloche / Mandala Watermark Rings (scaled with tone)
    ctx.save();
    ctx.translate(w * 0.60, h * 0.45);
    ctx.strokeStyle = `rgba(194, 65, 12, ${0.25 * tone})`;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 195, 110, (i * Math.PI) / 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Ashoka rosette inner rings (scaled with tone)
    ctx.strokeStyle = `rgba(5, 150, 105, ${0.28 * tone})`;
    ctx.lineWidth = 1.5;
    for (let r = 38; r <= 125; r += 20) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Top Saffron Gradient Wave Banner (Clean - No Logo, No Bharat Sarkar Text)
    // Dynamic alpha so text underneath doesn't get obscured when multiplied
    const topAlpha = Math.max(0.18, Math.min(1.0, 0.18 + tone * 0.82));
    const topGrad = ctx.createLinearGradient(0, 0, w, 115);
    topGrad.addColorStop(0, `rgba(194, 65, 12, ${topAlpha})`);
    topGrad.addColorStop(0.45, `rgba(234, 88, 12, ${topAlpha})`);
    topGrad.addColorStop(1, `rgba(249, 115, 22, ${topAlpha * 0.9})`);

    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, side === 'front' ? 75 : 80);
    ctx.bezierCurveTo(w * 0.72, 112, w * 0.28, 62, 0, side === 'front' ? 95 : 90);
    ctx.closePath();
    ctx.fill();

    // Shadow line under top wave
    ctx.strokeStyle = `rgba(154, 52, 18, ${0.70 * tone})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w, side === 'front' ? 75 : 80);
    ctx.bezierCurveTo(w * 0.72, 112, w * 0.28, 62, 0, side === 'front' ? 95 : 90);
    ctx.stroke();

    // 4. Bottom Rich Green Wave Banner (Clean - No Text)
    const botAlpha = Math.max(0.18, Math.min(1.0, 0.18 + tone * 0.82));
    const botGrad = ctx.createLinearGradient(0, h - 90, w, h);
    botGrad.addColorStop(0, `rgba(20, 83, 45, ${botAlpha})`);
    botGrad.addColorStop(0.5, `rgba(21, 128, 61, ${botAlpha})`);
    botGrad.addColorStop(1, `rgba(22, 163, 74, ${botAlpha * 0.9})`);

    ctx.fillStyle = botGrad;
    ctx.beginPath();
    ctx.moveTo(0, h - 75);
    ctx.bezierCurveTo(w * 0.35, h - 55, w * 0.7, h - 95, w, h - 70);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Accent line above bottom wave
    ctx.strokeStyle = `rgba(20, 83, 45, ${0.70 * tone})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, h - 75);
    ctx.bezierCurveTo(w * 0.35, h - 55, w * 0.7, h - 95, w, h - 70);
    ctx.stroke();

    // 5. Thin Horizontal Red Divider Line
    const redLineY = h - 68;
    ctx.strokeStyle = `rgba(185, 28, 28, ${Math.max(0.25, 0.95 * tone)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, redLineY);
    ctx.lineTo(w, redLineY);
    ctx.stroke();

    ctx.restore();
  },

  drawAadhaarLogo(ctx, cx, cy, radius) {
    ctx.save();
    // Red Sun Rays
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x1 = cx + Math.cos(a) * (radius * 0.65);
      const y1 = cy + Math.sin(a) * (radius * 0.65);
      const x2 = cx + Math.cos(a) * radius;
      const y2 = cy + Math.sin(a) * radius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    // Red Disc
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Fingerprint white lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    for (let r = radius * 0.18; r <= radius * 0.45; r += 3.5) {
      ctx.beginPath();
      ctx.arc(cx, cy + 2, r, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.restore();
  },

  renderPrintSheetPreview(frontCanvas, backCanvas) {
    const printCanvas = document.getElementById('pvcPrintPreviewCanvas');
    if (!printCanvas) return;

    if (this.printLayout === 'epson_tray') {
      const trayW = 1654;
      const trayH = 2362;
      printCanvas.width = trayW;
      printCanvas.height = trayH;
      const ctx = printCanvas.getContext('2d');

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, trayW, trayH);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(trayW / 2, 0);
      ctx.lineTo(trayW / 2, trayH);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EPSON PVC 2-CARD TRAY (L805 / L8050 / T50)', trayW / 2, 80);

      const xOffsetPx = Math.round((this.trayCalibration.xOffset / 25.4) * 300);
      const yOffsetPx = Math.round((this.trayCalibration.yOffset / 25.4) * 300);

      const slotX = Math.round((trayW - 1011) / 2) + xOffsetPx;
      const slot1Y = 200 + yOffsetPx;
      const slot2Y = 1260 + yOffsetPx;

      // Card 1
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(slotX - 10, slot1Y - 10, 1011 + 20, 638 + 20);
      ctx.drawImage(frontCanvas, slotX, slot1Y, 1011, 638);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('SLOT 1: FRONT CARD', trayW / 2, slot1Y - 20);

      // Card 2
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(slotX - 10, slot2Y - 10, 1011 + 20, 638 + 20);
      ctx.drawImage(backCanvas, slotX, slot2Y, 1011, 638);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('SLOT 2: BACK CARD', trayW / 2, slot2Y - 20);

    } else if (this.printLayout === 'a4_single') {
      const a4W = 2480;
      const a4H = 3508;
      printCanvas.width = a4W;
      printCanvas.height = a4H;
      const ctx = printCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, a4W, a4H);

      ctx.fillStyle = '#64748b';
      ctx.font = '24px sans-serif';
      ctx.fillText('VUO CSC HELP — SMART PVC PRINT SHEET (CR-80 85.6 × 54 mm)', 120, 100);

      const startY = 300;
      const gap = 120;
      const totalCardsW = (1011 * 2) + gap;
      const startX = Math.round((a4W - totalCardsW) / 2);

      ctx.drawImage(frontCanvas, startX, startY, 1011, 638);
      ctx.drawImage(backCanvas, startX + 1011 + gap, startY, 1011, 638);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(startX - 20, startY - 20, totalCardsW + 40, 638 + 40);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✂ Cut along the dotted line and insert into Lamination Pouch (85.6mm x 54mm)', startX, startY + 638 + 60);

    } else if (this.printLayout === 'a4_multi') {
      const a4W = 2480;
      const a4H = 3508;
      printCanvas.width = a4W;
      printCanvas.height = a4H;
      const ctx = printCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, a4W, a4H);

      const rowGap = 40;
      const colGap = 80;
      const startX = Math.round((a4W - (1011 * 2 + colGap)) / 2);

      for (let i = 0; i < 5; i++) {
        const y = 140 + i * (638 + rowGap);
        ctx.drawImage(frontCanvas, startX, y, 1011, 638);
        ctx.drawImage(backCanvas, startX + 1011 + colGap, y, 1011, 638);
      }
    }
  },

  directPrint() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'Smart PVC Card (Direct Print)', category: 'pvc' }, () => this._doDirectPrint());
    }
    this._doDirectPrint();
  },
  _doDirectPrint() {
    if (!this.sourceCanvas) {
      if (typeof showToast === 'function') {
        showToast('Please upload a document first before printing.', 'warning');
      }
      return;
    }

    const printCanvas = document.getElementById('pvcPrintPreviewCanvas');
    if (!printCanvas) return;

    const printImgUrl = printCanvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      if (typeof showToast === 'function') {
        showToast('Pop-up blocked. Please allow popups to open direct print window.', 'error');
      }
      return;
    }

    const isEpsonTray = this.printLayout === 'epson_tray';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VUO CSC Smart PVC Print</title>
        <style>
          @page {
            size: ${isEpsonTray ? '140mm 200mm' : 'A4 portrait'};
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
          }
          img {
            width: 100%;
            height: auto;
            max-height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${printImgUrl}" onload="window.print(); setTimeout(() => window.close(), 1000);" />
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  downloadPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Smart PVC Card (Print-Ready PDF)', category: 'pvc' }, () => this._doDownloadPdf());
    }
    this._doDownloadPdf();
  },
  _doDownloadPdf() {
    if (!this.sourceCanvas || typeof jspdf === 'undefined') {
      if (typeof showToast === 'function') {
        showToast('jsPDF library is not loaded or no document selected.', 'error');
      }
      return;
    }

    const printCanvas = document.getElementById('pvcPrintPreviewCanvas');
    if (!printCanvas) return;

    const { jsPDF } = jspdf;
    const isEpsonTray = this.printLayout === 'epson_tray';

    const doc = isEpsonTray ?
      new jsPDF({ orientation: 'portrait', unit: 'mm', format: [140, 200] }) :
      new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const imgData = printCanvas.toDataURL('image/jpeg', 0.98);
    const pdfW = isEpsonTray ? 140 : 210;
    const pdfH = isEpsonTray ? 200 : 297;

    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    doc.save(`VUO_PVC_CARD_${Date.now()}.pdf`);

    if (typeof showToast === 'function') {
      showToast('Print-ready PDF downloaded successfully!', 'success');
    }
  },

  downloadCardImage(side) {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: `Smart PVC Card Image (${side || 'combined'} PNG)`, category: 'pvc' }, () => this._doDownloadCardImage(side));
    }
    this._doDownloadCardImage(side);
  },
  _doDownloadCardImage(side) {
    if (!this.frontProcessedCanvas || !this.backProcessedCanvas) return;

    let targetCanvas;
    let filename = 'VUO_PVC_CARD';

    if (side === 'front') {
      targetCanvas = this.frontProcessedCanvas;
      filename += '_FRONT.png';
    } else if (side === 'back') {
      targetCanvas = this.backProcessedCanvas;
      filename += '_BACK.png';
    } else {
      const combined = document.createElement('canvas');
      combined.width = 1011 * 2 + 40;
      combined.height = 638;
      const ctx = combined.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combined.width, combined.height);
      ctx.drawImage(this.frontProcessedCanvas, 0, 0);
      ctx.drawImage(this.backProcessedCanvas, 1011 + 40, 0);
      targetCanvas = combined;
      filename += '_COMBINED.png';
    }

    const a = document.createElement('a');
    a.href = targetCanvas.toDataURL('image/png');
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (typeof showToast === 'function') {
      showToast(`High-resolution card PNG downloaded!`, 'success');
    }
  },

  openInBillMaker() {
    const billItem = {
      description: 'PVC Smart Identity Card Print (CR-80)',
      qty: 1,
      rate: 50,
      amount: 50
    };

    sessionStorage.setItem('vuo_pending_bill_item', JSON.stringify(billItem));
    window.location.hash = '#billmaker';

    if (typeof showToast === 'function') {
      showToast('Redirecting to Bill Maker for ₹50 PVC Card Print...', 'success');
    }
  },

  openPasswordModal(errorMsg = '') {
    const modal = document.getElementById('pvcPasswordModal');
    const errText = document.getElementById('pvcPasswordErrorText');
    const input = document.getElementById('pvcPdfPasswordInput');

    if (errText) {
      errText.textContent = errorMsg;
      if (errorMsg) errText.classList.remove('hidden');
      else errText.classList.add('hidden');
    }

    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  closePasswordModal() {
    const modal = document.getElementById('pvcPasswordModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }
};

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  window.VUO_PVCPRINT = VUO_PVCPRINT;
  document.addEventListener('DOMContentLoaded', () => {
    VUO_PVCPRINT.init();
  });
}

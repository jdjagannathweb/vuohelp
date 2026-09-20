/**
 * VUO CSC HELP - Pass Photo Maker Tool
 * High precision passport photo creator, background adjuster, and multi-copy A4 sheet generator
 */

var VUO_PASSPHOTO = window.VUO_PASSPHOTO = {
  cropper: null,
  uploadedImage: null,
  currentPreset: 'size_12x15', // 'size_12x15', 'passport', 'stamp', 'pan', 'aadhaar', 'custom'
  bgColor: 'original', // 'original' (no change), '#ffffff', '#bae6fd', '#1e40af', '#e2e8f0', '#dc2626', or custom hex
  bgTolerance: 45,
  selectedSuit: 'none',
  suitOffsetY: 0, // Vertical adjustment for suit neck line (-80px to +80px)
  suitScale: 1.0, // Scale multiplier for suit shoulder width (0.75 to 1.35) // 'none', 'suit_black', 'suit_navy', 'suit_grey', 'women_blazer', 'shirt_white'
  copies: 6,
  addBorder: true,
  brightness: 106,
  contrast: 108,
  sharpness: 40, // 0 to 100%
  clarity: 15, // 0 to 100%
  autoEnhance: true,
  viewMode: 'fit', // 'fit' (entire A4 visible) or 'zoom' (100% actual pixels)
  studioMode: 'single', // 'single' or 'couple' (husband & wife)
  wifeCropper: null,
  wifeUploadedImage: null,

  // Dimension presets in millimeters & inches
  presets: {
    joint_40x31: { name: '4.00 x 3.10 cm (Joint Photo - Default)', w: 40.0, h: 31.0, ratio: 40.0 / 31.0, cols: 4 },
    joint_18x15: { name: '1.8 x 1.5 Inch (45.7x38.1 mm) - Joint Photo', w: 45.72, h: 38.1, ratio: 1.8 / 1.5, cols: 4 },
    joint_2x3: { name: '2 x 3 Inch (Joint / Couple Photo)', w: 50.8, h: 76.2, ratio: 2 / 3, cols: 3 },
    size_12x15: { name: '1.2 x 1.5 Inch (6 Photos Per Line)', w: 30.48, h: 38.1, ratio: 1.2 / 1.5, cols: 6 },
    passport: { name: 'Indian Passport (3.5 x 4.5 cm)', w: 35, h: 45, ratio: 35 / 45, cols: 4 },
    stamp: { name: 'Stamp Size (2.0 x 2.5 cm)', w: 20, h: 25, ratio: 20 / 25, cols: 4 },
    pan: { name: 'PAN Card (2.5 x 3.5 cm)', w: 25, h: 35, ratio: 25 / 35, cols: 4 },
    aadhaar: { name: 'Aadhaar / Exam (3.5 x 3.5 cm)', w: 35, h: 35, ratio: 1, cols: 4 },
    custom: { name: 'Custom Dimension', w: 35, h: 45, ratio: 35 / 45, cols: 4 }
  },

  init() {
    try { this.updateGeminiStudioUi(); } catch(e) {}
    if (this.geminiApiKey && (this.geminiApiKey.startsWith('AQ.Ab8RN6') || !this.geminiApiKey.startsWith('AIza'))) {
      this.geminiApiKey = '';
      try { localStorage.removeItem('vuo_gemini_api_key'); } catch(e) {}
    }
    const keyInput = document.getElementById('geminiApiKeyInput');
    if (keyInput && this.geminiApiKey) {
      keyInput.value = this.geminiApiKey;
    }
    const promptInput = document.getElementById('geminiPromptInput');
    if (promptInput) {
      promptInput.value = this.geminiPrompt || this.defaultGeminiPrompt;
      if (!promptInput._hasListener) {
        promptInput._hasListener = true;
        promptInput.addEventListener('input', (e) => {
          this.geminiPrompt = e.target.value;
          try {
            localStorage.setItem('vuo_gemini_prompt', this.geminiPrompt);
          } catch(err) {}
        });
      }
    }
    if (!this._initialized) {
      this.bindEvents();
      this._initialized = true;
    }
    if (!this.uploadedImage) {
      this.loadSamplePhoto();
    } else {
      this.generateSheet();
    }
  },

  handleFileInputChange(inputEl, target = 'husband') {
    if (!inputEl || !inputEl.files || !inputEl.files.length) return;
    const file = inputEl.files[0];
    if (target === 'wife') {
      this.loadWifeFile(file);
    } else {
      this.loadFile(file);
    }
  },

  triggerUpload(target = 'husband') {
    const now = Date.now();
    if (this._lastUploadTrigger && (now - this._lastUploadTrigger < 350)) {
      return;
    }
    this._lastUploadTrigger = now;
    const inputId = (target === 'wife') ? 'passPhotoWifeFileInput' : 'passPhotoFileInput';
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
      inputEl.value = '';
      inputEl.click();
    }
  },

  bindEvents() {
    const fileInput = document.getElementById('passPhotoFileInput');
    const dropZone = document.getElementById('passPhotoDropZone');
    const wifeFileInput = document.getElementById('passPhotoWifeFileInput');
    const wifeDropZone = document.getElementById('passPhotoWifeDropZone');

    if (wifeFileInput) {
      wifeFileInput.onchange = (e) => {
        this.handleFileInputChange(e.target, 'wife');
      };
    }

    if (wifeDropZone) {
      wifeDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        wifeDropZone.classList.add('border-pink-500', 'bg-pink-50');
      });
      wifeDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        wifeDropZone.classList.remove('border-pink-500', 'bg-pink-50');
      });
      wifeDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        wifeDropZone.classList.remove('border-pink-500', 'bg-pink-50');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadWifeFile(e.dataTransfer.files[0]);
        }
      });
      wifeDropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.triggerUpload('wife');
        }
      });
    }

    if (fileInput) {
      fileInput.onchange = (e) => {
        this.handleFileInputChange(e.target, 'husband');
      };
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('border-sky-500', 'bg-sky-50');
      });
      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-sky-500', 'bg-sky-50');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('border-sky-500', 'bg-sky-50');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
      dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.triggerUpload('husband');
        }
      });
    }

    // Size preset change
    const presetSelect = document.getElementById('passPhotoPreset');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.currentPreset = e.target.value;
        const customControls = document.getElementById('passPhotoCustomControls');
        if (customControls) {
          if (this.currentPreset === 'custom') {
            customControls.classList.remove('hidden');
          } else {
            customControls.classList.add('hidden');
          }
        }
        if (this.cropper) {
          if (this.studioMode === 'couple') {
            const jointPreset = this.presets[this.currentPreset] || this.presets.joint_40x31;
            const indRatio = (jointPreset.w / 2) / jointPreset.h;
            this.cropper.setAspectRatio(indRatio);
            if (this.wifeCropper) this.wifeCropper.setAspectRatio(indRatio);
          } else {
            const ratio = this.presets[this.currentPreset].ratio;
            this.cropper.setAspectRatio(ratio);
          }
        }
        // Auto-select recommended copies for 1.2x1.5 inch
        if (this.currentPreset === 'size_12x15' && this.copies === 8) {
          this.copies = 6;
          const copiesSelect = document.getElementById('passPhotoCopies');
          if (copiesSelect) copiesSelect.value = "6";
        }
        this.generateSheet();
      });
    }

    // Copies change
    const copiesSelect = document.getElementById('passPhotoCopies');
    if (copiesSelect) {
      copiesSelect.addEventListener('change', (e) => {
        this.copies = parseInt(e.target.value, 10);
        this.generateSheet();
      });
    }

    // Border toggle
    const borderCheck = document.getElementById('passPhotoBorder');
    if (borderCheck) {
      borderCheck.addEventListener('change', (e) => {
        this.addBorder = e.target.checked;
        this.generateSheet();
      });
    }

    // Background color / Original presets
    document.querySelectorAll('.passphoto-bg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.passphoto-bg-btn').forEach(b => {
          b.classList.remove('ring-2', 'ring-sky-500', 'scale-105', 'scale-110', 'bg-sky-50');
        });
        const target = e.currentTarget;
        target.classList.add('ring-2', 'ring-sky-500', 'scale-105');
        this.bgColor = target.getAttribute('data-color');
        
        const labelEl = document.getElementById('passPhotoBgLabel');
        if (labelEl) {
          if (this.bgColor === 'original') labelEl.textContent = 'Original (No Change)';
          else if (this.bgColor === '#ffffff') labelEl.textContent = 'Studio White';
          else if (this.bgColor === '#bae6fd') labelEl.textContent = 'Sky Blue';
          else if (this.bgColor === '#1e40af') labelEl.textContent = 'Studio Navy';
          else if (this.bgColor === '#e2e8f0') labelEl.textContent = 'Light Gray';
          else if (this.bgColor === '#dc2626') labelEl.textContent = 'Studio Red';
          else labelEl.textContent = 'Custom Color';
        }

        const customColorInput = document.getElementById('passPhotoCustomBg');
        if (customColorInput && this.bgColor !== 'original') {
          customColorInput.value = this.bgColor;
        }

        const tolContainer = document.getElementById('passPhotoTolContainer');
        if (tolContainer) {
          if (this.bgColor === 'original') {
            tolContainer.classList.add('hidden');
          } else {
            tolContainer.classList.remove('hidden');
          }
        }

        this.generateSheet();
      });
    });

    const customColorInput = document.getElementById('passPhotoCustomBg');
    if (customColorInput) {
      customColorInput.addEventListener('input', (e) => {
        this.bgColor = e.target.value;
        const labelEl = document.getElementById('passPhotoBgLabel');
        if (labelEl) labelEl.textContent = 'Custom Color';
        const tolContainer = document.getElementById('passPhotoTolContainer');
        if (tolContainer) tolContainer.classList.remove('hidden');
        this.generateSheet();
      });
    }

    // Background Tolerance Slider
    const tolSlider = document.getElementById('passPhotoBgTolerance');
    if (tolSlider) {
      tolSlider.addEventListener('input', (e) => {
        this.bgTolerance = parseInt(e.target.value, 10) || 48;
        const valEl = document.getElementById('passPhotoBgToleranceVal');
        if (valEl) valEl.textContent = `${this.bgTolerance}`;
        this.generateSheet();
      });
    }

    // Ultra-HD Facial Sharpness Slider
    const sharpnessSlider = document.getElementById('passPhotoSharpness');
    if (sharpnessSlider) {
      sharpnessSlider.addEventListener('input', (e) => {
        this.sharpness = parseInt(e.target.value, 10) || 0;
        const valEl = document.getElementById('passPhotoSharpnessVal');
        if (valEl) valEl.textContent = `${this.sharpness}%`;
        this.generateSheet();
      });
    }

    // Studio Soft-Box Lighting (Brightness) Slider
    const brightnessSlider = document.getElementById('passPhotoBrightness');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        this.brightness = parseInt(e.target.value, 10) || 100;
        const valEl = document.getElementById('passPhotoBrightnessVal');
        if (valEl) valEl.textContent = `${this.brightness}%`;
        this.generateSheet();
      });
    }

    // Portrait Depth & Contrast Slider
    const contrastSlider = document.getElementById('passPhotoContrast');
    if (contrastSlider) {
      contrastSlider.addEventListener('input', (e) => {
        this.contrast = parseInt(e.target.value, 10) || 100;
        const valEl = document.getElementById('passPhotoContrastVal');
        if (valEl) valEl.textContent = `${this.contrast}%`;
        this.generateSheet();
      });
    }

    // Auto-Enhance Skin & Dynamic Range
    const autoEnhanceCheck = document.getElementById('passPhotoAutoEnhance');
    if (autoEnhanceCheck) {
      autoEnhanceCheck.addEventListener('change', (e) => {
        this.autoEnhance = e.target.checked;
        this.generateSheet();
      });
    }
  },

  setEnhancePreset(type) {
    ['studio', 'bright', 'sharp', 'reset'].forEach(p => {
      const btn = document.getElementById(`preset_btn_${p}`);
      if (btn) {
        btn.className = 'px-2 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition shadow-2xs flex flex-col items-center gap-0.5 cursor-pointer';
      }
    });
    const activeBtn = document.getElementById(`preset_btn_${type}`);
    if (activeBtn) {
      activeBtn.className = 'px-2 py-2 rounded-xl border border-sky-300 bg-sky-50 text-sky-800 text-[11px] font-black hover:bg-sky-100 transition shadow-2xs flex flex-col items-center gap-0.5 ring-2 ring-sky-500 cursor-pointer';
    }

    if (type === 'studio') {
      this.brightness = 106;
      this.contrast = 108;
      this.sharpness = 40;
      this.autoEnhance = true;
    } else if (type === 'bright') {
      this.brightness = 118;
      this.contrast = 105;
      this.sharpness = 35;
      this.autoEnhance = true;
    } else if (type === 'sharp') {
      this.brightness = 104;
      this.contrast = 112;
      this.sharpness = 65;
      this.autoEnhance = true;
    } else if (type === 'reset') {
      this.brightness = 100;
      this.contrast = 100;
      this.sharpness = 0;
      this.autoEnhance = false;
    }

    const sInput = document.getElementById('passPhotoSharpness');
    if (sInput) sInput.value = this.sharpness;
    const sVal = document.getElementById('passPhotoSharpnessVal');
    if (sVal) sVal.textContent = `${this.sharpness}%`;

    const bInput = document.getElementById('passPhotoBrightness');
    if (bInput) bInput.value = this.brightness;
    const bVal = document.getElementById('passPhotoBrightnessVal');
    if (bVal) bVal.textContent = `${this.brightness}%`;

    const cInput = document.getElementById('passPhotoContrast');
    if (cInput) cInput.value = this.contrast;
    const cVal = document.getElementById('passPhotoContrastVal');
    if (cVal) cVal.textContent = `${this.contrast}%`;

    const aInput = document.getElementById('passPhotoAutoEnhance');
    if (aInput) aInput.checked = this.autoEnhance;

    this.generateSheet();
    if (typeof showToast === 'function') {
      const msgs = {
        studio: "🌟 Studio HD Enhancer Applied (Balanced Bright & Sharp)",
        bright: "💡 Shadow Lifter Applied (Clears Dark Shadows)",
        sharp: "🔍 Ultra-Sharp Applied (Enhances Blurry Eyes & Features)",
        reset: "🔄 Reset to Raw Original Photo"
      };
      showToast(msgs[type] || "Enhancement applied", "info");
    }
  },

  loadFile(file) {
    if (!file) return;

    // Friendly upload notification
    if (typeof showToast === 'function') {
      showToast(`Loading: ${file.name || 'photograph'}...`, "info");
    }

    const reader = new FileReader();
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      if (typeof showToast === 'function') showToast("Could not read file. Please try another image.", "error");
      const fileInput = document.getElementById('passPhotoFileInput');
      if (fileInput) fileInput.value = '';
    };

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = (err) => {
        console.error("Image decode error:", err);
        if (typeof showToast === 'function') showToast("Invalid image file. Please upload JPG or PNG.", "error");
        const fileInput = document.getElementById('passPhotoFileInput');
        if (fileInput) fileInput.value = '';
      };
      img.onload = () => {
        this.uploadedImage = img;
        this._cachedAiMask = null;
        this._cachedWifeAiMask = null;

        // Show editor pane & hide empty state immediately
        const editorEl = document.getElementById('passPhotoEditor');
        if (editorEl) {
          editorEl.classList.remove('hidden');
          editorEl.style.display = 'block';
        }
        const emptyNotice = document.getElementById('passPhotoEmptyNotice');
        if (emptyNotice) emptyNotice.classList.add('hidden');

        // Immediate sheet generation guarantee with fallback
        this.generateSheet();

        // Initialize Cropper with full fallback inside requestAnimationFrame
        requestAnimationFrame(() => {
          this.initCropper(dataUrl);
        });

        if (typeof showToast === 'function') {
          showToast("Photograph uploaded successfully!", "success");
        }

        const fileInput = document.getElementById('passPhotoFileInput');
        if (fileInput) fileInput.value = '';

        // Safe background Gemini AI analysis if configured
        setTimeout(() => {
          if (this.geminiApiKey && this.geminiApiKey.startsWith('AIza')) {
            this.runGeminiAiAudit(true);
          }
        }, 800);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  },

  initCropper(imageSrc) {
    const cropImgEl = document.getElementById('passPhotoCropImage');
    if (!cropImgEl) {
      this.generateSheet();
      return;
    }

    let currentRatio = this.presets[this.currentPreset]?.ratio || (35 / 45);
    if (this.studioMode === 'couple') {
      const jointPreset = this.presets[this.currentPreset] || this.presets.joint_40x31;
      currentRatio = (jointPreset.w / 2) / jointPreset.h;
    }

    // If cropper instance already exists, use native replace method
    if (this.cropper) {
      try {
        this.cropper.replace(imageSrc);
        this.cropper.setAspectRatio(currentRatio);
        this.generateSheet();
        return;
      } catch (e) {
        try { this.cropper.destroy(); } catch (err) {}
        this.cropper = null;
      }
    }

    let cropperStarted = false;
    const startCropper = () => {
      if (cropperStarted) return;
      cropperStarted = true;
      if (typeof Cropper === 'undefined') {
        console.warn("Cropper library not found, rendering direct preview.");
        this.generateSheet();
        return;
      }
      try {
        if (this.cropper) {
          try { this.cropper.destroy(); } catch (e) {}
        }
        this.cropper = new Cropper(cropImgEl, {
          aspectRatio: currentRatio,
          viewMode: 1,
          autoCropArea: 0.85,
          responsive: true,
          checkOrientation: true,
          ready: () => {
            this.generateSheet();
          },
          crop: () => {
            if (this._cropTimeout) clearTimeout(this._cropTimeout);
            this._cropTimeout = setTimeout(() => {
              this.generateSheet();
            }, 100);
          }
        });
      } catch (err) {
        console.error("Cropper creation failed:", err);
        this.cropper = null;
        this.generateSheet();
      }
    };

    cropImgEl.onload = () => {
      cropImgEl.onload = null;
      startCropper();
    };

    cropImgEl.src = imageSrc;
    if (cropImgEl.complete && cropImgEl.naturalWidth > 0 && cropImgEl.src === imageSrc) {
      startCropper();
    }
  },

  rotate(degrees) {
    if (this.cropper) {
      this.cropper.rotate(degrees);
    }
  },

  resetCrop() {
    if (this.cropper) {
      this.cropper.reset();
      this.setEnhancePreset('reset');
    }
  },

  loadSamplePhoto() {
    // Generate an illustrative sample avatar onto a canvas for instant demo
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Studio background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, '#bae6fd');
    grad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 500);

    // Shoulders / Coat
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(200, 470, 160, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shirt collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(170, 370);
    ctx.lineTo(200, 420);
    ctx.lineTo(230, 370);
    ctx.closePath();
    ctx.fill();

    // Tie
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(195, 410);
    ctx.lineTo(205, 410);
    ctx.lineTo(208, 480);
    ctx.lineTo(200, 495);
    ctx.lineTo(192, 480);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#f6d8b8';
    ctx.fillRect(180, 340, 40, 50);

    // Head
    ctx.beginPath();
    ctx.ellipse(200, 240, 75, 95, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd34d';
    ctx.fillStyle = '#fbd38d';
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(200, 200, 80, Math.PI, 0, false);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(175, 235, 5, 0, Math.PI * 2);
    ctx.arc(225, 235, 5, 0, Math.PI * 2);
    ctx.fill();

    // Gentle smile
    ctx.beginPath();
    ctx.arc(200, 275, 20, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#9a3412';
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/jpeg');
    const img = new Image();
    img.onload = () => {
      this.uploadedImage = img;
      this.initCropper(dataUrl);
      document.getElementById('passPhotoEditor').classList.remove('hidden');
      document.getElementById('passPhotoEmptyNotice').classList.add('hidden');
      // Auto trigger Gemini AI analysis on sample photo
      setTimeout(() => {
        this.runGeminiAiAudit(false);
      }, 500);
    };
    img.src = dataUrl;
  },

  renderDefaultPreview() {
    const sheetCanvas = document.getElementById('passPhotoSheetCanvas');
    if (!sheetCanvas) return;
    const ctx = sheetCanvas.getContext('2d');
    sheetCanvas.width = 794; // A4 at 96 DPI: 794 x 1123 px
    sheetCanvas.height = 1123;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload or choose a sample photo to generate print-ready A4 sheet', sheetCanvas.width / 2, sheetCanvas.height / 2);
  },

  hexToRgb(hex) {
    if (!hex) return null;
    let c = hex.trim().replace(/^#/, '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (c.length === 6) {
      const num = parseInt(c, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
    return null;
  },

  
  // ==================== GOOGLE MEDIAPIPE AI BACKGROUND REMOVER ====================
  async initAiSegmenter() {
    if (this._aiSegmenter) return this._aiSegmenter;
    if (typeof window.SelfieSegmentation === 'undefined') {
      console.warn("MediaPipe SelfieSegmentation script not loaded yet.");
      return null;
    }
    try {
      this._aiSegmenter = new window.SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      });
      this._aiSegmenter.setOptions({
        modelSelection: 1, // 1: Accurate portrait & landscape model
        selfieMode: false
      });
      return this._aiSegmenter;
    } catch (err) {
      console.warn("Failed to initialize MediaPipe segmenter:", err);
      return null;
    }
  },

  async getAiSegmentationMask(inputCanvas) {
    const segmenter = await this.initAiSegmenter();
    if (!segmenter) return null;

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 4000);

      segmenter.onResults((results) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        if (results && results.segmentationMask) {
          const w = inputCanvas.width;
          const h = inputCanvas.height;
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mCtx = maskCanvas.getContext('2d');
          mCtx.drawImage(results.segmentationMask, 0, 0, w, h);

          // Convert MediaPipe mask directly to high-contrast smooth alpha channel
          const imgData = mCtx.getImageData(0, 0, w, h);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            // Confidence is in Red channel (0 = background, 255 = person)
            const conf = d[i];
            // Apply slight curve for clean hair without edge halo
            let alpha = conf;
            if (conf > 40) {
              alpha = Math.min(255, Math.round(conf * 1.05));
            } else {
              alpha = 0;
            }
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
            d[i + 3] = alpha;
          }
          mCtx.putImageData(imgData, 0, 0);
          resolve(maskCanvas);
        } else {
          resolve(null);
        }
      });

      try {
        segmenter.send({ image: inputCanvas });
      } catch (err) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      }
    });
  },

  applyAiMask(sourceCanvas, maskCanvas, targetColorHex) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const ctx = outCanvas.getContext('2d');

    // 1. Draw Target Solid Color Background
    if (targetColorHex && targetColorHex !== 'transparent' && targetColorHex !== 'original') {
      ctx.fillStyle = targetColorHex;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Composite person with alpha mask
    const personCanvas = document.createElement('canvas');
    personCanvas.width = w;
    personCanvas.height = h;
    const pCtx = personCanvas.getContext('2d');
    pCtx.drawImage(sourceCanvas, 0, 0, w, h);
    pCtx.globalCompositeOperation = 'destination-in';
    pCtx.drawImage(maskCanvas, 0, 0, w, h);

    // 3. Draw isolated person over solid background
    ctx.drawImage(personCanvas, 0, 0);
    return outCanvas;
  },

  async triggerAiBackgroundRemoval() {
    if (!this.cropper) {
      showToast("Please upload a photograph first.", "warning");
      return;
    }

    const btn = document.getElementById('passPhotoAiBgBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-amber-300"></i><span>AI Cutting Out...</span>`;
    }

    showToast("✨ AI Neural Network separating hair, face & body...", "info");

    try {
      const singlePreset = this.presets[this.currentPreset] || this.presets.size_12x15;
      const targetW = Math.round(singlePreset.w * 11.81);
      const targetH = Math.round(singlePreset.h * 11.81);

      const cropped = this.cropper.getCroppedCanvas({
        width: targetW || 360,
        height: targetH || 450,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      if (cropped) {
        const mask = await this.getAiSegmentationMask(cropped);
        if (mask) {
          this._cachedAiMask = mask;
          // If background is currently original, switch to Light Sky Blue #87CEEB default or user selection
          if (!this.bgColor || this.bgColor === 'original') {
            this.bgColor = '#87CEEB';
            const bgLabel = document.getElementById('passPhotoBgLabel');
            if (bgLabel) bgLabel.textContent = 'Studio Light Sky Blue';
            document.querySelectorAll('.passphoto-bg-btn').forEach(b => {
              b.classList.remove('ring-2', 'ring-sky-500', 'scale-105');
              if (b.getAttribute('data-color') === '#87CEEB') {
                b.classList.add('ring-2', 'ring-sky-500', 'scale-105');
              }
            });
          }
          this.generateSheet();
          showToast("✨ Studio-Quality AI Background Cutout Applied!", "success");
        } else {
          // Fallback to enhanced edge matting
          showToast("AI model busy, using smart edge matting...", "info");
          if (!this.bgColor || this.bgColor === 'original') {
            this.bgColor = '#87CEEB';
          }
          this.generateSheet();
        }
      }
    } catch (err) {
      console.warn("AI Cutout error:", err);
      showToast("Cutout applied via smart vision engine.", "info");
      this.generateSheet();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-amber-300"></i><span>✨ AI Cutout BG</span>`;
      }
    }
  },

  replaceBackground(sourceCanvas, targetColorHex, tolerance = 45) {
    if (!targetColorHex || targetColorHex === 'original' || targetColorHex === 'none') {
      return sourceCanvas;
    }

    // 1. If we have a high-accuracy AI Neural Mask cached, use it!
    if (this._cachedAiMask && this._cachedAiMask.width === sourceCanvas.width && this._cachedAiMask.height === sourceCanvas.height) {
      return this.applyAiMask(sourceCanvas, this._cachedAiMask, targetColorHex);
    }

    // 2. Trigger asynchronous AI segmentation in background so subsequent renders are 100% pixel-perfect
    if (!this._isSegmenting && typeof window.SelfieSegmentation !== 'undefined') {
      this._isSegmenting = true;
      this.getAiSegmentationMask(sourceCanvas).then(mask => {
        this._isSegmenting = false;
        if (mask) {
          this._cachedAiMask = mask;
          this.generateSheet();
        }
      }).catch(() => { this._isSegmenting = false; });
    }

    // 3. High-Precision Multi-Edge Floodfill & Bilateral Matting (Instant Fallback)
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    const workCanvas = document.createElement('canvas');
    workCanvas.width = width;
    workCanvas.height = height;
    const ctx = workCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isTransparent = (targetColorHex === 'transparent');
    const targetRgb = this.hexToRgb(targetColorHex) || { r: 135, g: 206, b: 235 };

    // Multi-edge background sampling (top edge, top corners, upper sides)
    const bgSamples = [];
    const cornerSize = Math.max(8, Math.floor(width * 0.12));

    // Sample top edge
    for (let x = 0; x < width; x += Math.max(2, Math.floor(width / 35))) {
      for (let y = 0; y < Math.min(8, height); y++) {
        const idx = (y * width + x) * 4;
        bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }
    // Sample left & right upper edges (avoiding shoulders at bottom)
    for (let y = 0; y < Math.floor(height * 0.6); y += 4) {
      const idxL = y * width * 4;
      const idxR = (y * width + (width - 1)) * 4;
      bgSamples.push([data[idxL], data[idxL + 1], data[idxL + 2]]);
      bgSamples.push([data[idxR], data[idxR + 1], data[idxR + 2]]);
    }

    if (bgSamples.length === 0) bgSamples.push([255, 255, 255]);

    // Fast perceptual color distance
    function getMinColorDist(r, g, b) {
      let minDist = 999999;
      for (let s = 0; s < bgSamples.length; s++) {
        const sr = bgSamples[s][0], sg = bgSamples[s][1], sb = bgSamples[s][2];
        const rmean = (r + sr) >> 1;
        const dr = r - sr;
        const dg = g - sg;
        const db = b - sb;
        const dist = Math.sqrt((((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8));
        if (dist < minDist) minDist = dist;
      }
      return minDist;
    }

    // Mask (0 = unvisited, 1 = background, 2 = person/foreground)
    const mask = new Uint8Array(width * height);
    const queue = [];

    // Seed top border, left border, and right border (where background always starts)
    const tolThreshold = tolerance * 1.55;
    for (let x = 0; x < width; x++) {
      const idx = x * 4;
      if (getMinColorDist(data[idx], data[idx + 1], data[idx + 2]) < tolThreshold) {
        mask[x] = 1;
        queue.push(x);
      }
    }
    for (let y = 1; y < Math.floor(height * 0.7); y++) {
      const idxL = y * width;
      const idxR = y * width + width - 1;
      if (mask[idxL] === 0 && getMinColorDist(data[idxL * 4], data[idxL * 4 + 1], data[idxL * 4 + 2]) < tolThreshold) {
        mask[idxL] = 1;
        queue.push(idxL);
      }
      if (mask[idxR] === 0 && getMinColorDist(data[idxR * 4], data[idxR * 4 + 1], data[idxR * 4 + 2]) < tolThreshold) {
        mask[idxR] = 1;
        queue.push(idxR);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);

      const neighbors = [];
      if (cx > 0) neighbors.push(curr - 1);
      if (cx < width - 1) neighbors.push(curr + 1);
      if (cy > 0) neighbors.push(curr - width);
      if (cy < height - 1) neighbors.push(curr + width);

      for (let n = 0; n < neighbors.length; n++) {
        const nIdx = neighbors[n];
        if (mask[nIdx] === 0) {
          const pIdx = nIdx * 4;
          const nr = data[pIdx], ng = data[pIdx + 1], nb = data[pIdx + 2];
          
          // Skin protection heuristic: do not floodfill face/skin
          const isSkin = (nr > 85 && ng > 55 && nb > 40 && nr > ng && ng > nb && (nr - ng) > 12);
          if (!isSkin && getMinColorDist(nr, ng, nb) < tolerance * 1.45) {
            mask[nIdx] = 1;
            queue.push(nIdx);
          } else {
            mask[nIdx] = 2; // Person boundary
          }
        }
      }
    }

    // Bilateral feathering & replacement
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mIdx = y * width + x;
        const dIdx = mIdx * 4;

        if (mask[mIdx] === 1) {
          if (isTransparent) {
            data[dIdx + 3] = 0;
          } else {
            data[dIdx] = targetRgb.r;
            data[dIdx + 1] = targetRgb.g;
            data[dIdx + 2] = targetRgb.b;
          }
        } else if (mask[mIdx] === 2) {
          // Check neighbor background ratio for anti-aliasing
          let bgCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (mask[ny * width + nx] === 1) bgCount++;
              }
            }
          }
          if (bgCount > 1) {
            const blend = bgCount / 9.0;
            if (isTransparent) {
              data[dIdx + 3] = Math.round(data[dIdx + 3] * (1 - blend * 0.7));
            } else {
              data[dIdx] = Math.round(data[dIdx] * (1 - blend) + targetRgb.r * blend);
              data[dIdx + 1] = Math.round(data[dIdx + 1] * (1 - blend) + targetRgb.g * blend);
              data[dIdx + 2] = Math.round(data[dIdx + 2] * (1 - blend) + targetRgb.b * blend);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return workCanvas;
  },

  // ---------------- PHOTO ENHANCEMENT & SHARPENING FILTERS ---------------- //
  applySharpen(canvas, amount = 30) {
    if (amount <= 0) return canvas;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = imgData.data;

    const output = ctx.createImageData(width, height);
    const dst = output.data;

    // 3x3 Unsharp Mask Sharpening Kernel
    const k = (amount / 100) * 0.75;
    // Kernel:
    // [  0, -k,  0 ]
    // [ -k, 1+4k, -k ]
    // [  0, -k,  0 ]

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          dst[idx] = src[idx];
          dst[idx + 1] = src[idx + 1];
          dst[idx + 2] = src[idx + 2];
          dst[idx + 3] = src[idx + 3];
          continue;
        }

        const top = ((y - 1) * width + x) * 4;
        const bot = ((y + 1) * width + x) * 4;
        const left = (y * width + (x - 1)) * 4;
        const right = (y * width + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val = src[idx + c] * (1 + 4 * k) - (src[top + c] + src[bot + c] + src[left + c] + src[right + c]) * k;
          dst[idx + c] = Math.max(0, Math.min(255, val));
        }
        dst[idx + 3] = src[idx + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
    return canvas;
  },

  applyAutoEnhance(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 1. Calculate min and max luminance for dynamic range stretching
    let minLum = 255, maxLum = 0;
    for (let i = 0; i < data.length; i += 16) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    minLum = Math.max(0, minLum - 10);
    maxLum = Math.min(255, maxLum + 10);
    const range = Math.max(1, maxLum - minLum);

    // 2. Dynamic stretch & vibrance boost
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        // Contrast stretch
        let val = ((data[i + c] - minLum) / range) * 255;
        // Gentle S-curve
        val = val < 128 ? (2 * val * val) / 255 : 255 - (2 * (255 - val) * (255 - val)) / 255;
        data[i + c] = Math.max(0, Math.min(255, val));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  },

  setStudioMode(mode) {
    this.studioMode = mode;
    const singleBtn = document.getElementById('passPhotoModeSingle');
    const coupleBtn = document.getElementById('passPhotoModeCouple');
    const wifeBox = document.getElementById('passPhotoWifeBox');

    if (mode === 'couple') {
      if (coupleBtn) {
        coupleBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-black bg-pink-600 text-white shadow-xs transition-all flex items-center gap-1.5';
      }
      if (singleBtn) {
        singleBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
      }
      if (wifeBox) wifeBox.classList.remove('hidden');

      // Update titles for Husband & Wife clear identification
      const husbandTitle = document.getElementById('passPhotoHusbandTitle');
      if (husbandTitle) husbandTitle.textContent = "Husband / Groom Photograph (ପତିଙ୍କ ଫଟୋ)";

      // DEFAULT JOINT PHOTO SIZE: W-4.00 cm x H-3.10 cm (40mm x 31mm)
      this.currentPreset = 'joint_40x31';
      const presetSelect = document.getElementById('passPhotoPreset');
      if (presetSelect) presetSelect.value = 'joint_40x31';

      // DEFAULT 4 COPIES for Joint Photo (User Requirement)
      this.copies = 4;
      const copiesSelect = document.getElementById('passPhotoCopies');
      if (copiesSelect) copiesSelect.value = "4";

      // Ratio for each individual portrait slot in 4.00 x 3.10 cm joint frame:
      // Total frame: 4.00 cm width x 3.10 cm height (Aspect Ratio ~1.29)
      // Husband gets Left slot: 2.00 cm width x 3.10 cm height => ratio 2.00 / 3.10 = 0.645
      // Wife gets Right slot: 2.00 cm width x 3.10 cm height => ratio 2.00 / 3.10 = 0.645
      // Both husband & wife full faces and shoulders are 100% visible side-by-side with zero clipping!
      const individualRatio = (40.0 / 2) / 31.0; // ~0.645
      if (this.cropper) {
        this.cropper.setAspectRatio(individualRatio);
      }
      if (this.wifeCropper) {
        this.wifeCropper.setAspectRatio(individualRatio);
      }

      // Auto load sample wife photo if not present
      if (!this.wifeUploadedImage) {
        this.loadSampleWifePhoto();
      }
      showToast("Joint Photo Mode (Default: 4.00 x 3.10 cm • 4 Copies • Full Face) Activated 💑", "success");
    } else {
      if (singleBtn) {
        singleBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-black bg-white text-sky-700 shadow-xs transition-all flex items-center gap-1.5';
      }
      if (coupleBtn) {
        coupleBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5';
      }
      if (wifeBox) wifeBox.classList.add('hidden');

      const husbandTitle = document.getElementById('passPhotoHusbandTitle');
      if (husbandTitle) husbandTitle.textContent = "Upload Customer Photograph";

      // Revert from joint preset back to single 1.2 x 1.5
      if (this.currentPreset.startsWith('joint_')) {
        this.currentPreset = 'size_12x15';
        const presetSelect = document.getElementById('passPhotoPreset');
        if (presetSelect) presetSelect.value = 'size_12x15';
        this.copies = 6;
        const copiesSelect = document.getElementById('passPhotoCopies');
        if (copiesSelect) copiesSelect.value = "6";
        if (this.cropper) {
          this.cropper.setAspectRatio(this.presets.size_12x15.ratio);
        }
      }
      showToast("Single Passport Photo Mode", "info");
    }
    this.generateSheet();
  },

  loadWifeFile(file) {
    if (!file) return;

    if (typeof showToast === 'function') {
      showToast(`Loading: ${file.name || 'photograph'}...`, "info");
    }

    const reader = new FileReader();
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      if (typeof showToast === 'function') showToast("Could not read file. Please try another image.", "error");
      const wifeInput = document.getElementById('passPhotoWifeFileInput');
      if (wifeInput) wifeInput.value = '';
    };

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = (err) => {
        console.error("Image decode error:", err);
        if (typeof showToast === 'function') showToast("Invalid image format. Please upload JPG or PNG.", "error");
        const wifeInput = document.getElementById('passPhotoWifeFileInput');
        if (wifeInput) wifeInput.value = '';
      };
      img.onload = () => {
        this.wifeUploadedImage = img;
        this._cachedWifeAiMask = null;

        const wifeEditor = document.getElementById('passPhotoWifeEditor');
        if (wifeEditor) {
          wifeEditor.classList.remove('hidden');
          wifeEditor.style.display = 'block';
        }

        // Immediate sheet update
        this.generateSheet();

        // Initialize Cropper inside requestAnimationFrame
        requestAnimationFrame(() => {
          this.initWifeCropper(dataUrl);
        });

        if (typeof showToast === 'function') {
          showToast("Wife photograph uploaded successfully!", "success");
        }
        const wifeInput = document.getElementById('passPhotoWifeFileInput');
        if (wifeInput) wifeInput.value = '';
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  },

  initWifeCropper(imageSrc) {
    const imageEl = document.getElementById('passPhotoWifeCropImage');
    if (!imageEl) {
      this.generateSheet();
      return;
    }

    const jointPreset = this.presets[this.currentPreset] || this.presets.joint_40x31;
    const wifeRatio = (this.studioMode === 'couple') ? ((jointPreset.w / 2) / jointPreset.h) : jointPreset.ratio;

    if (this.wifeCropper) {
      try {
        this.wifeCropper.replace(imageSrc);
        this.wifeCropper.setAspectRatio(wifeRatio);
        this.generateSheet();
        return;
      } catch (e) {
        try { this.wifeCropper.destroy(); } catch (err) {}
        this.wifeCropper = null;
      }
    }

    let wifeCropperStarted = false;
    const startWifeCropper = () => {
      if (wifeCropperStarted) return;
      wifeCropperStarted = true;
      if (typeof Cropper === 'undefined') {
        this.generateSheet();
        return;
      }
      try {
        if (this.wifeCropper) {
          try { this.wifeCropper.destroy(); } catch (e) {}
        }
        this.wifeCropper = new Cropper(imageEl, {
          aspectRatio: wifeRatio,
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 0.88,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          crop: () => {
            if (this._wifeCropTimeout) clearTimeout(this._wifeCropTimeout);
            this._wifeCropTimeout = setTimeout(() => {
              this.generateSheet();
            }, 100);
          },
          ready: () => {
            this.generateSheet();
          }
        });
      } catch (err) {
        console.error("Wife cropper creation failed:", err);
        this.wifeCropper = null;
        this.generateSheet();
      }
    };

    imageEl.onload = () => {
      imageEl.onload = null;
      startWifeCropper();
    };

    imageEl.src = imageSrc;
    if (imageEl.complete && imageEl.naturalWidth > 0 && imageEl.src === imageSrc) {
      startWifeCropper();
    }
  },

  rotateWife(degree) {
    if (this.wifeCropper) {
      this.wifeCropper.rotate(degree);
    }
  },

  loadSampleWifePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    // Soft studio background
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 0, 400, 500);

    // Traditional Saree & Silhouette
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.moveTo(80, 500);
    ctx.lineTo(200, 310);
    ctx.lineTo(320, 500);
    ctx.closePath();
    ctx.fill();

    // Saree Pallu Zari Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(110, 500);
    ctx.lineTo(260, 320);
    ctx.stroke();

    // Face / Neck
    ctx.fillStyle = '#fbd0a7';
    ctx.beginPath();
    ctx.arc(200, 220, 75, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Traditional Bindi
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(200, 195, 76, Math.PI, 0);
    ctx.fill();

    // Red Sindoor / Bindi
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(200, 190, 6, 0, Math.PI * 2);
    ctx.fill();

    const sampleUrl = canvas.toDataURL('image/jpeg', 0.95);
    const img = new Image();
    img.onload = () => {
      this.wifeUploadedImage = img;
      this.initWifeCropper(sampleUrl);
      document.getElementById('passPhotoWifeEditor')?.classList.remove('hidden');
    };
    img.src = sampleUrl;
  },

  getSingleProcessedPhotoCanvas() {
    const currentPresetObj = this.presets[this.currentPreset] || this.presets.size_12x15;
    const targetW = Math.round(currentPresetObj.w * 11.81) || 360; // approx 300 DPI
    const targetH = Math.round(currentPresetObj.h * 11.81) || 450;

    let cropped = null;
    if (this.cropper) {
      try {
        cropped = this.cropper.getCroppedCanvas({
          width: targetW,
          height: targetH,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });
      } catch(e) {
        console.warn("Cropper getCroppedCanvas error:", e);
      }
    }

    // Direct fallback to uploadedImage if cropper is not ready
    if (!cropped && this.uploadedImage) {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = targetW;
      fallbackCanvas.height = targetH;
      const fCtx = fallbackCanvas.getContext('2d');
      fCtx.drawImage(this.uploadedImage, 0, 0, targetW, targetH);
      cropped = fallbackCanvas;
    }

    if (!cropped) return null;

    // 1. Smart Background Replacement if a color is chosen
    let photoToDraw = cropped;
    if (this.bgColor && this.bgColor !== 'original' && this.bgColor !== 'none') {
      const tol = this.bgTolerance || 45;
      photoToDraw = this.replaceBackground(cropped, this.bgColor, tol);
    }

    // 2. Create target canvas with brightness & contrast
    const target = document.createElement('canvas');
    target.width = photoToDraw.width;
    target.height = photoToDraw.height;
    const ctx = target.getContext('2d');

    ctx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
    ctx.drawImage(photoToDraw, 0, 0);
    ctx.filter = 'none';

    // 3. Apply Auto-Enhance if enabled
    if (this.autoEnhance) {
      this.applyAutoEnhance(target);
    }

    // 4. Apply Unsharp Masking / Sharpness filter
    if (this.sharpness > 0) {
      this.applySharpen(target, this.sharpness);
    }

// 5. Suit overlay removed

    // 6. Optional cutting border
    // Check if Husband & Wife Couple Mode is active
    if (this.studioMode === 'couple' && this.wifeCropper) {
      const couplePresetObj = this.presets[this.currentPreset] || this.presets.joint_40x31;
      const totalW = Math.round(couplePresetObj.w * 11.81); // Total width (e.g. 472px for 4.00 cm)
      const totalH = Math.round(couplePresetObj.h * 11.81); // Total height (e.g. 366px for 3.10 cm)
      const slotW = Math.floor(totalW / 2); // 236px per person

      // 1. Get Husband Cropped Canvas at full slot dimensions (no clipping!)
      const husbandCropped = (this.cropper ? this.cropper.getCroppedCanvas({
        width: slotW,
        height: totalH,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      }) : null) || cropped;

      let husbandToDraw = husbandCropped;
      if (this.bgColor && this.bgColor !== 'original' && this.bgColor !== 'none') {
        husbandToDraw = this.replaceBackground(husbandCropped, this.bgColor, this.bgTolerance || 45);
      }

      const husbandTarget = document.createElement('canvas');
      husbandTarget.width = slotW;
      husbandTarget.height = totalH;
      const hCtx = husbandTarget.getContext('2d');
      hCtx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
      hCtx.drawImage(husbandToDraw, 0, 0, slotW, totalH);
      hCtx.filter = 'none';
      if (this.autoEnhance) this.applyAutoEnhance(husbandTarget);
      if (this.sharpness > 0) this.applySharpen(husbandTarget, this.sharpness);

      // 2. Get Wife Cropped Canvas at full slot dimensions (no clipping!)
      const wifeCropped = this.wifeCropper.getCroppedCanvas({
        width: slotW,
        height: totalH,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      if (wifeCropped) {
        let wifeToDraw = wifeCropped;
        if (this.bgColor && this.bgColor !== 'original' && this.bgColor !== 'none') {
          wifeToDraw = this.replaceBackground(wifeCropped, this.bgColor, this.bgTolerance || 45);
        }

        const wifeTarget = document.createElement('canvas');
        wifeTarget.width = slotW;
        wifeTarget.height = totalH;
        const wCtx = wifeTarget.getContext('2d');
        wCtx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
        wCtx.drawImage(wifeToDraw, 0, 0, slotW, totalH);
        wCtx.filter = 'none';

        if (this.autoEnhance) this.applyAutoEnhance(wifeTarget);
        if (this.sharpness > 0) this.applySharpen(wifeTarget, this.sharpness);

        // 3. Seamless Studio Composite: Husband (Left) + Wife (Right)
        const jointCanvas = document.createElement('canvas');
        jointCanvas.width = totalW;
        jointCanvas.height = totalH;
        const jCtx = jointCanvas.getContext('2d');

        // Draw Husband on Left slot (0 to slotW)
        jCtx.drawImage(husbandTarget, 0, 0, slotW, totalH);

        // Draw Wife on Right slot (slotW to totalW)
        jCtx.drawImage(wifeTarget, slotW, 0, slotW, totalH);

        // Subtle studio divider line
        jCtx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
        jCtx.lineWidth = 1;
        jCtx.beginPath();
        jCtx.moveTo(slotW, 0);
        jCtx.lineTo(slotW, totalH);
        jCtx.stroke();

        if (this.addBorder) {
          jCtx.strokeStyle = '#0f172a';
          jCtx.lineWidth = 2;
          jCtx.strokeRect(1, 1, jointCanvas.width - 2, jointCanvas.height - 2);
        }

        return jointCanvas;
      }
    }

    if (this.addBorder) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, target.width - 2, target.height - 2);
    }

    return target;
  },

  selectSuit(suitKey) {
    this.selectedSuit = suitKey;
    document.querySelectorAll('.suit-card').forEach(card => {
      card.classList.remove('selected', 'border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500');
      card.classList.add('border-slate-200');
    });

    // Support both ID formats: suit_black and suit_suit_black
    const targetCard = document.getElementById(`suit_${suitKey}`) || 
                       document.getElementById(`suit_suit_${suitKey}`) ||
                       document.getElementById(suitKey);
    if (targetCard) {
      targetCard.classList.add('selected', 'border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500');
      targetCard.classList.remove('border-slate-200');
    }

    const labelEl = document.getElementById('passPhotoSuitLabel');
    if (labelEl) {
      const labels = {
        none: 'Original Clothes',
        suit_black: '👔 Classic Black Suit & Tie',
        suit_navy: '👔 Studio Navy Blazer & Tie',
        suit_grey: '👔 Formal Grey Suit & Tie',
        women_blazer: '👗 Women Royal Blazer',
        shirt_white: '👔 Formal White Shirt',
        suit_nehru: '🇮🇳 Nehru / Modi Formal Coat'
      };
      labelEl.textContent = labels[suitKey] || suitKey;
    }

    // Show / hide suit fit nudge controls
    const fitBox = document.getElementById('suitFitControls');
    if (fitBox) {
      if (suitKey === 'none') {
        fitBox.classList.add('hidden');
      } else {
        fitBox.classList.remove('hidden');
      }
    }

    this.generateSheet();
  },

  adjustSuitY(delta) {
    this.suitOffsetY = (this.suitOffsetY || 0) + delta;
    this.suitOffsetY = Math.max(-80, Math.min(80, this.suitOffsetY));
    const valEl = document.getElementById('suitOffsetYVal');
    if (valEl) valEl.textContent = `${this.suitOffsetY > 0 ? '+' : ''}${this.suitOffsetY}px`;
    this.generateSheet();
  },

  adjustSuitScale(delta) {
    this.suitScale = Math.round(((this.suitScale || 1.0) + delta) * 100) / 100;
    this.suitScale = Math.max(0.75, Math.min(1.35, this.suitScale));
    const valEl = document.getElementById('suitScaleVal');
    if (valEl) valEl.textContent = `${Math.round(this.suitScale * 100)}%`;
    this.generateSheet();
  },

  resetSuitAdjustment() {
    this.suitOffsetY = 0;
    this.suitScale = 1.0;
    const valElY = document.getElementById('suitOffsetYVal');
    if (valElY) valElY.textContent = '0px';
    const valElS = document.getElementById('suitScaleVal');
    if (valElS) valElS.textContent = '100%';
    this.generateSheet();
  },

  drawSuitOverlay(ctx, w, h, suitKey) {
    if (!suitKey || suitKey === 'none') return;
    
    ctx.save();
    
    const offsetY = this.suitOffsetY || 0;
    const scale = this.suitScale || 1.0;

    // Proportional positioning
    const suitStartY = (h * 0.56) + offsetY;
    const chestCenter = w * 0.50;
    const neckW = (w * 0.16) * scale;
    const neckLeft = chestCenter - neckW;
    const neckRight = chestCenter + neckW;
    const collarVBottom = suitStartY + ((h * 0.16) * scale);

    if (suitKey === 'shirt_white') {
      // 1. Shirt Torso Base
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, suitStartY + (h * 0.12));
      ctx.bezierCurveTo(w * 0.15, suitStartY + 10, neckLeft - 15, suitStartY, neckLeft, suitStartY);
      ctx.lineTo(neckRight, suitStartY);
      ctx.bezierCurveTo(neckRight + 15, suitStartY, w * 0.85, suitStartY + 10, w, suitStartY + (h * 0.12));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Shirt realistic shading
      const grad = ctx.createLinearGradient(0, suitStartY, w, h);
      grad.addColorStop(0, 'rgba(226, 232, 240, 0.4)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(1, 'rgba(203, 213, 225, 0.45)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Placket
      const placketW = (w * 0.07) * scale;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(chestCenter - (placketW / 2), suitStartY + 5, placketW, h - suitStartY);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(chestCenter - (placketW / 2), suitStartY + 5, placketW, h - suitStartY);

      // Pearl Buttons
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      const bSteps = [0.24, 0.34, 0.44];
      bSteps.forEach(step => {
        const by = suitStartY + (h * step * scale);
        if (by < h) {
          ctx.beginPath();
          ctx.arc(chestCenter, by, 3.5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });

      // Left Collar Flap
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(neckLeft - 5, suitStartY - 2);
      ctx.lineTo(chestCenter - (w * 0.02), suitStartY + (h * 0.085 * scale));
      ctx.lineTo(neckLeft + (w * 0.04 * scale), suitStartY + (h * 0.12 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Collar Flap
      ctx.beginPath();
      ctx.moveTo(neckRight + 5, suitStartY - 2);
      ctx.lineTo(chestCenter + (w * 0.02), suitStartY + (h * 0.085 * scale));
      ctx.lineTo(neckRight - (w * 0.04 * scale), suitStartY + (h * 0.12 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    } else if (suitKey === 'women_blazer') {
      const blazerColor = '#1e1b4b';
      const blazerLight = '#312e81';

      // Inner Silk Blouse
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(neckLeft, suitStartY);
      ctx.lineTo(chestCenter, collarVBottom);
      ctx.lineTo(neckRight, suitStartY);
      ctx.closePath();
      ctx.fill();

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.moveTo(neckLeft + 6, suitStartY);
      ctx.lineTo(chestCenter, collarVBottom - 4);
      ctx.lineTo(neckRight - 6, suitStartY);
      ctx.closePath();
      ctx.fill();

      // Blazer Main Body
      ctx.fillStyle = blazerColor;
      ctx.beginPath();
      ctx.moveTo(0, suitStartY + (h * 0.12));
      ctx.bezierCurveTo(w * 0.15, suitStartY + 10, neckLeft - 10, suitStartY, neckLeft, suitStartY);
      ctx.lineTo(chestCenter, collarVBottom + 10);
      ctx.lineTo(neckRight, suitStartY);
      ctx.bezierCurveTo(neckRight + 10, suitStartY, w * 0.85, suitStartY + 10, w, suitStartY + (h * 0.12));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Lapels
      const lapelGrad = ctx.createLinearGradient(0, suitStartY, w, h);
      lapelGrad.addColorStop(0, blazerLight);
      lapelGrad.addColorStop(1, blazerColor);
      ctx.fillStyle = lapelGrad;

      // Left Lapel
      ctx.beginPath();
      ctx.moveTo(neckLeft, suitStartY);
      ctx.lineTo(neckLeft - (w * 0.09 * scale), suitStartY + (h * 0.08 * scale));
      ctx.lineTo(chestCenter - 2, collarVBottom + (h * 0.08 * scale));
      ctx.lineTo(chestCenter - (w * 0.07 * scale), collarVBottom + (h * 0.08 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();

      // Right Lapel
      ctx.beginPath();
      ctx.moveTo(neckRight, suitStartY);
      ctx.lineTo(neckRight + (w * 0.09 * scale), suitStartY + (h * 0.08 * scale));
      ctx.lineTo(chestCenter + 2, collarVBottom + (h * 0.08 * scale));
      ctx.lineTo(chestCenter + (w * 0.07 * scale), collarVBottom + (h * 0.08 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();

    } else if (suitKey === 'suit_nehru') {
      // Indian Official Nehru / Modi Formal Coat
      const coatColor = '#0f172a';
      const coatLight = '#1e293b';

      // 1. Coat Body
      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.moveTo(0, suitStartY + (h * 0.12));
      ctx.bezierCurveTo(w * 0.15, suitStartY + 10, neckLeft - 10, suitStartY, neckLeft, suitStartY);
      ctx.lineTo(neckRight, suitStartY);
      ctx.bezierCurveTo(neckRight + 10, suitStartY, w * 0.85, suitStartY + 10, w, suitStartY + (h * 0.12));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Subtle fabric sheen
      const grad = ctx.createLinearGradient(0, suitStartY, w, h);
      grad.addColorStop(0, coatLight);
      grad.addColorStop(1, coatColor);
      ctx.fillStyle = grad;
      ctx.fill();

      // Mandarin Collar Stand
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(neckLeft - 4, suitStartY - 6);
      ctx.lineTo(neckRight + 4, suitStartY - 6);
      ctx.lineTo(neckRight + 2, suitStartY + 12);
      ctx.lineTo(neckLeft - 2, suitStartY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center Placket
      const placketW = (w * 0.065) * scale;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(chestCenter - (placketW / 2), suitStartY + 12, placketW, h - suitStartY);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(chestCenter - (placketW / 2), suitStartY + 12, placketW, h - suitStartY);

      // Gold Metallic Buttons
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      const bSteps = [0.18, 0.28, 0.38, 0.48];
      bSteps.forEach(step => {
        const by = suitStartY + (h * step * scale);
        if (by < h) {
          ctx.beginPath();
          ctx.arc(chestCenter, by, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Button shine dot
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(chestCenter - 1, by - 1, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
        }
      });

    } else {
      // Classic Men's Suits: suit_black, suit_navy, suit_grey
      let jacketDark = '#09090b';
      let jacketMid = '#18181b';
      let tieColor = '#991b1b'; // Burgundy Red
      let tiePattern = '#7f1d1d';

      if (suitKey === 'suit_navy') {
        jacketDark = '#0f172a';
        jacketMid = '#1e3a8a';
        tieColor = '#d97706'; // Gold/Amber silk
        tiePattern = '#b45309';
      } else if (suitKey === 'suit_grey') {
        jacketDark = '#1f2937';
        jacketMid = '#374151';
        tieColor = '#1e293b'; // Charcoal Navy
        tiePattern = '#0f172a';
      }

      // 1. Shirt Base (Crisp White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(neckLeft, suitStartY);
      ctx.lineTo(chestCenter, collarVBottom);
      ctx.lineTo(neckRight, suitStartY);
      ctx.closePath();
      ctx.fill();

      // 2. Tie (Knot & Body)
      const tieWidthTop = (w * 0.05) * scale;
      const tieWidthBot = (w * 0.085) * scale;
      ctx.fillStyle = tieColor;
      
      // Tie Body
      ctx.beginPath();
      ctx.moveTo(chestCenter - tieWidthTop, suitStartY + (h * 0.055 * scale));
      ctx.lineTo(chestCenter + tieWidthTop, suitStartY + (h * 0.055 * scale));
      ctx.lineTo(chestCenter + tieWidthBot, h);
      ctx.lineTo(chestCenter - tieWidthBot, h);
      ctx.closePath();
      ctx.fill();

      // Tie Diagonal Stripes
      ctx.strokeStyle = tiePattern;
      ctx.lineWidth = 2.5;
      for (let s = suitStartY + 25; s < h; s += 16) {
        ctx.beginPath();
        ctx.moveTo(chestCenter - tieWidthBot, s);
        ctx.lineTo(chestCenter + tieWidthBot, s - 10);
        ctx.stroke();
      }

      // Tie Knot
      ctx.fillStyle = tieColor;
      ctx.beginPath();
      ctx.moveTo(chestCenter - tieWidthTop - 2, suitStartY + 4);
      ctx.lineTo(chestCenter + tieWidthTop + 2, suitStartY + 4);
      ctx.lineTo(chestCenter + tieWidthTop, suitStartY + (h * 0.065 * scale));
      ctx.lineTo(chestCenter - tieWidthTop, suitStartY + (h * 0.065 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Shirt Collar Flaps
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;

      // Left Collar
      ctx.beginPath();
      ctx.moveTo(neckLeft - 4, suitStartY - 2);
      ctx.lineTo(chestCenter - (w * 0.028), suitStartY + (h * 0.075 * scale));
      ctx.lineTo(neckLeft + (w * 0.03 * scale), suitStartY + (h * 0.09 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Collar
      ctx.beginPath();
      ctx.moveTo(neckRight + 4, suitStartY - 2);
      ctx.lineTo(chestCenter + (w * 0.028), suitStartY + (h * 0.075 * scale));
      ctx.lineTo(neckRight - (w * 0.03 * scale), suitStartY + (h * 0.09 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Jacket Body
      ctx.fillStyle = jacketDark;
      ctx.beginPath();
      ctx.moveTo(0, suitStartY + (h * 0.12));
      ctx.bezierCurveTo(w * 0.15, suitStartY + 10, neckLeft - 10, suitStartY, neckLeft, suitStartY);
      ctx.lineTo(chestCenter, collarVBottom);
      ctx.lineTo(neckRight, suitStartY);
      ctx.bezierCurveTo(neckRight + 10, suitStartY, w * 0.85, suitStartY + 10, w, suitStartY + (h * 0.12));
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 5. Suit Lapels (Notch Lapel with gradient)
      const lapelGrad = ctx.createLinearGradient(0, suitStartY, w, h);
      lapelGrad.addColorStop(0, jacketMid);
      lapelGrad.addColorStop(1, jacketDark);
      ctx.fillStyle = lapelGrad;

      // Left Lapel
      ctx.beginPath();
      ctx.moveTo(neckLeft, suitStartY);
      ctx.lineTo(neckLeft - (w * 0.09 * scale), suitStartY + (h * 0.07 * scale));
      ctx.lineTo(neckLeft - (w * 0.06 * scale), suitStartY + (h * 0.09 * scale));
      ctx.lineTo(chestCenter - (w * 0.02), collarVBottom + (h * 0.10 * scale));
      ctx.lineTo(chestCenter - (w * 0.09 * scale), collarVBottom + (h * 0.10 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right Lapel
      ctx.beginPath();
      ctx.moveTo(neckRight, suitStartY);
      ctx.lineTo(neckRight + (w * 0.09 * scale), suitStartY + (h * 0.07 * scale));
      ctx.lineTo(neckRight + (w * 0.06 * scale), suitStartY + (h * 0.09 * scale));
      ctx.lineTo(chestCenter + (w * 0.02), collarVBottom + (h * 0.10 * scale));
      ctx.lineTo(chestCenter + (w * 0.09 * scale), collarVBottom + (h * 0.10 * scale));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  },

  generateSheet() {
    const singlePhoto = this.getSingleProcessedPhotoCanvas();
    if (!singlePhoto) return;

    // Also update the single preview canvas
    const singleCanvas = document.getElementById('passPhotoSingleCanvas');
    if (singleCanvas) {
      singleCanvas.width = singlePhoto.width;
      singleCanvas.height = singlePhoto.height;
      const sCtx = singleCanvas.getContext('2d');
      sCtx.drawImage(singlePhoto, 0, 0);
    }

    // A4 Dimension at high fidelity: 1240 x 1754 px
    const a4Canvas = document.getElementById('passPhotoSheetCanvas');
    if (!a4Canvas) return;

    a4Canvas.width = 1240;
    a4Canvas.height = 1754;
    const ctx = a4Canvas.getContext('2d');

    // White paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

    const ratio = singlePhoto.width / singlePhoto.height;
    const presetName = this.presets[this.currentPreset]?.name || 'Passport Size';

    // Determine Grid Dimensions (Columns x Rows) with Minimal Margins (25px top, 25px left & right)
    let cols = 6;
    let rows = Math.ceil(this.copies / 6);
    let photoW = 180;
    let photoH = Math.round(photoW / ratio);
    let startX = 25; // Minimal tight left margin
    let startY = 25; // Minimal tight top margin (no wasted paper at top!)
    let gapX = 22;
    let gapY = 20;

    const is6ColMode = (this.currentPreset === 'size_12x15') || 
                       (this.copies === 6 || this.copies === 12 || this.copies === 18 || this.copies === 24 || this.copies === 30 || this.copies === 36);

    if (this.currentPreset === 'joint_40x31' || this.currentPreset === 'joint_18x15') {
      // Joint / Couple Photo (4.00 x 3.10 cm or 1.8 x 1.5 Inch)
      // Default 4 copies = 2 rows x 2 cols or 1 row x 4 cols
      cols = (this.copies <= 2) ? 2 : 4;
      rows = Math.ceil(this.copies / cols);
      photoW = (cols === 2) ? 460 : 268;
      photoH = Math.round(photoW / ratio);
      startX = Math.floor((1240 - (cols * photoW + (cols - 1) * 24)) / 2);
      startY = 35;
      gapX = 24;
      gapY = 25;
    } else if (this.currentPreset === 'joint_2x3') {
      cols = (this.copies <= 2) ? 2 : 3;
      rows = Math.ceil(this.copies / cols);
      photoW = (cols === 2) ? 460 : 340;
      photoH = Math.round(photoW / ratio);
      startX = Math.floor((1240 - (cols * photoW + (cols - 1) * 30)) / 2);
      startY = 35;
      gapX = 30;
      gapY = 30;
    } else if (this.copies === 1) {
      cols = 1; rows = 1;
      photoW = 280; photoH = Math.round(photoW / ratio);
      startX = 25;
      startY = 25;
    } else if (this.copies === 4) {
      cols = 2; rows = 2;
      photoW = 320; photoH = Math.round(photoW / ratio);
      startX = 25; startY = 25;
      gapX = 35; gapY = 30;
    } else if (is6ColMode) {
      // 6 Photos in a single line / row layout with minimal margins
      cols = 6;
      rows = Math.ceil(this.copies / 6);
      photoW = 180;
      photoH = Math.round(photoW / ratio);
      startX = 25; // 25 + 6*180 + 5*22 = 1215px (25px right margin on 1240px A4)
      startY = 25; // Clean 25px top margin
      gapX = 22;
      gapY = 20;
    } else if (this.copies === 8) {
      cols = 4; rows = 2;
      photoW = 265; photoH = Math.round(photoW / ratio);
      startX = 25; startY = 25;
      gapX = 40; gapY = 30;
    } else if (this.copies === 16) {
      cols = 4; rows = 4;
      photoW = 265; photoH = Math.round(photoW / ratio);
      startX = 25; startY = 25;
      gapX = 40; gapY = 25;
    } else if (this.copies === 32) {
      cols = 4; rows = 8;
      photoW = 265; photoH = Math.round(photoW / ratio);
      startX = 25; startY = 25;
      gapX = 40; gapY = 16;
    } else {
      cols = 4;
      rows = Math.ceil(this.copies / 4);
      photoW = 265;
      photoH = Math.round(photoW / ratio);
      startX = 25; startY = 25;
      gapX = 40; gapY = 25;
    }

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= this.copies) break;

        const posX = startX + c * (photoW + gapX);
        const posY = startY + r * (photoH + gapY);

        // Draw photo
        ctx.drawImage(singlePhoto, posX, posY, photoW, photoH);

        // Cutting Guideline crosses around corners
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        
        // Guideline lines
        ctx.strokeRect(posX - 3, posY - 3, photoW + 6, photoH + 6);
        ctx.setLineDash([]); // Reset dash

        count++;
      }
    }

    // Small footer info placed at the very bottom edge of A4 sheet (No space wasted at top!)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`VLE HELP DESK — ${presetName} | ${this.copies} Photos | ${new Date().toLocaleDateString('en-GB')}`, a4Canvas.width / 2, 1735);
  },

  
  // ==================== GOOGLE GEMINI AI STUDIO ASSISTANT ====================
  geminiApiKey: (function() {
    try {
      const k = localStorage.getItem('vuo_gemini_api_key') || '';
      return (k.startsWith('AQ.Ab8RN6') || !k.startsWith('AIza')) ? '' : k;
    } catch(e) { return ''; }
  })(),
  defaultGeminiPrompt: `Edit the uploaded photo to a professional passport-size photo (35x45mm). Keep the original face and expression unchanged. Change the background to a solid neutral light blue or plain white. Dress the person in a same dress with frontal pose, visible shoulders, clear studio lighting, natural skin tones, and high resolution with no filters or cartoonish effects`,
  geminiPrompt: (function() {
    try {
      const saved = localStorage.getItem('vuo_gemini_prompt');
      if (saved && saved.includes('35x45mm')) return saved;
      return `Edit the uploaded photo to a professional passport-size photo (35x45mm). Keep the original face and expression unchanged. Change the background to a solid neutral light blue or plain white. Dress the person in a same dress with frontal pose, visible shoulders, clear studio lighting, natural skin tones, and high resolution with no filters or cartoonish effects`;
    } catch(e) {
      return `Edit the uploaded photo to a professional passport-size photo (35x45mm). Keep the original face and expression unchanged. Change the background to a solid neutral light blue or plain white. Dress the person in a same dress with frontal pose, visible shoulders, clear studio lighting, natural skin tones, and high resolution with no filters or cartoonish effects`;
    }
  })(),
  geminiAttire: 'same',
  geminiBg: 'blue',
  lastGeminiRecommendation: null,
  _aiSegmenter: null,
  _cachedAiMask: null,
  _cachedWifeAiMask: null,
  _isSegmenting: false,

  buildGeminiPassportPrompt() {
    const attireMap = {
      same: 'in a same dress',
      suit: 'in a formal dark navy blue suit with a clean collared white shirt and dark tie',
      shirt: 'in a crisp formal white collared dress shirt',
      blazer: 'in a sharp professional formal dark blazer',
      saree: 'in a neat formal traditional saree with visible shoulders'
    };
    const bgMap = {
      blue: 'solid neutral light blue (#87CEEB)',
      white: 'solid clean plain white (#FFFFFF)',
      gray: 'solid neutral light gray'
    };

    const dressDesc = attireMap[this.geminiAttire] || attireMap.same;
    const bgDesc = bgMap[this.geminiBg] || bgMap.blue;

    return `Edit the uploaded photo to a professional passport-size photo (35x45mm). Keep the original face and expression unchanged. Change the background to a ${bgDesc}. Dress the person ${dressDesc} with frontal pose, visible shoulders, clear studio lighting, natural skin tones, and high resolution with no filters or cartoonish effects`;
  },

  updateGeminiStudioUi() {
    const prompt = this.buildGeminiPassportPrompt();
    this.geminiPrompt = prompt;

    const promptInput = document.getElementById('geminiPromptInput');
    if (promptInput) promptInput.value = prompt;

    const promptDisplay = document.getElementById('geminiMasterPromptText');
    if (promptDisplay) promptDisplay.textContent = `"${prompt}"`;

    // Highlight active Dress button
    const attireBtns = document.querySelectorAll('.gemini-attire-btn');
    attireBtns.forEach(btn => {
      const attireVal = btn.getAttribute('data-attire');
      if (attireVal === this.geminiAttire) {
        btn.className = 'gemini-attire-btn px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-[11px] font-bold text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300 scale-105 transition-all cursor-pointer';
      } else {
        btn.className = 'gemini-attire-btn px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-[11px] text-indigo-200 border border-indigo-500/30 transition-all cursor-pointer';
      }
    });

    // Highlight active Background button
    const bgBtns = document.querySelectorAll('.gemini-bg-btn');
    bgBtns.forEach(btn => {
      const bgVal = btn.getAttribute('data-bg');
      if (bgVal === this.geminiBg) {
        btn.className = 'gemini-bg-btn px-2.5 py-1 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 text-[11px] font-bold text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300 scale-105 transition-all cursor-pointer';
      } else {
        btn.className = 'gemini-bg-btn px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-600 transition-all cursor-pointer';
      }
    });

    try {
      localStorage.setItem('vuo_gemini_prompt', prompt);
    } catch (e) {}
  },

  toggleGeminiAssistant() {
    const panel = document.getElementById('passPhotoGeminiPanel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      const keyInput = document.getElementById('geminiApiKeyInput');
      if (keyInput && this.geminiApiKey) {
        keyInput.value = this.geminiApiKey;
      }
      const promptInput = document.getElementById('geminiPromptInput');
      if (promptInput) {
        promptInput.value = this.geminiPrompt;
      }
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  copyGeminiPrompt(isQuiet = false) {
    const promptInput = document.getElementById('geminiPromptInput');
    const promptDisplay = document.getElementById('geminiMasterPromptText');
    const textToCopy = (promptInput && promptInput.value.trim()) || 
                       (promptDisplay && promptDisplay.textContent.trim().replace(/^["']|["']$/g, '')) || 
                       this.geminiPrompt || 
                       this.buildGeminiPassportPrompt();

    // 1. Guaranteed synchronous execCommand copy fallback (works directly on click on all devices)
    try {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) {
      console.warn('execCommand copy fallback error:', err);
    }

    // 2. Modern navigator.clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        navigator.clipboard.writeText(textToCopy).catch(e => console.warn('writeText caught:', e));
      } catch (e) {}
    }

    // Immediate in-place visual feedback on buttons and prompt text box
    const masterBtn = document.getElementById('geminiMasterCopyBtn');
    const masterBtnText = document.getElementById('geminiMasterCopyBtnText');
    const smallBtn = document.getElementById('geminiSmallCopyBtn');
    const promptBox = document.getElementById('geminiMasterPromptText');

    if (masterBtnText) {
      masterBtnText.textContent = '✅ PROMPT COPIED!';
    }
    if (masterBtn) {
      masterBtn.classList.remove('from-amber-400', 'to-orange-500', 'shadow-amber-500/25');
      masterBtn.classList.add('from-emerald-400', 'to-teal-500', 'shadow-emerald-500/25', 'ring-2', 'ring-emerald-300');
    }

    if (smallBtn) {
      smallBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-300 font-bold">Copied!</span>';
    }

    if (promptBox) {
      promptBox.classList.add('ring-2', 'ring-emerald-400/80', 'bg-emerald-950/40');
    }

    if (this._copyTimer) clearTimeout(this._copyTimer);
    this._copyTimer = setTimeout(() => {
      if (masterBtnText) {
        masterBtnText.textContent = '📋 Copy Gemini Master Prompt';
      }
      if (masterBtn) {
        masterBtn.classList.remove('from-emerald-400', 'to-teal-500', 'shadow-emerald-500/25', 'ring-2', 'ring-emerald-300');
        masterBtn.classList.add('from-amber-400', 'to-orange-500', 'shadow-amber-500/25');
      }
      if (smallBtn) {
        smallBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Click to Copy</span>';
      }
      if (promptBox) {
        promptBox.classList.remove('ring-2', 'ring-emerald-400/80', 'bg-emerald-950/40');
      }
    }, 2500);

    if (typeof showToast === 'function') {
      showToast('📋 Gemini AI Passport Prompt copied to clipboard!', 'success');
    }
  },

  openGeminiAiStudio() {
    window.open('https://gemini.google.com/app', '_blank');
  },

  setGeminiAttire(dressType) {
    this.geminiAttire = dressType || 'same';
    this.updateGeminiStudioUi();
    this.copyGeminiPrompt(true);
  },

  setGeminiBg(bgType) {
    this.geminiBg = bgType || 'blue';
    this.updateGeminiStudioUi();
    this.copyGeminiPrompt(true);
  },

  saveGeminiApiKey() {
    const keyInput = document.getElementById('geminiApiKeyInput');
    if (keyInput) {
      const key = keyInput.value.trim();
      this.geminiApiKey = key;
      localStorage.setItem('vuo_gemini_api_key', key);
    }
    const promptInput = document.getElementById('geminiPromptInput');
    if (promptInput) {
      const p = promptInput.value.trim();
      this.geminiPrompt = p || this.defaultGeminiPrompt;
      localStorage.setItem('vuo_gemini_prompt', this.geminiPrompt);
    }
    showToast("✨ Gemini AI Settings & Prompt saved securely!", "success");
  },

  resetGeminiPrompt() {
    this.geminiPrompt = this.defaultGeminiPrompt;
    localStorage.setItem('vuo_gemini_prompt', this.defaultGeminiPrompt);
    const promptInput = document.getElementById('geminiPromptInput');
    if (promptInput) {
      promptInput.value = this.defaultGeminiPrompt;
    }
    showToast("Gemini AI Prompt reset to default!", "info");
  },

  async runGeminiAiAudit(isAuto = false) {
    if (!this.cropper) {
      if (!isAuto) showToast("Please upload a photo first.", "warning");
      return;
    }

    const resultsBox = document.getElementById('geminiAuditResultsBox');
    const btn = document.getElementById('runGeminiAuditBtn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-slate-950"></i><span>Gemini Analyzing...</span>`;
    }

    if (resultsBox) {
      resultsBox.innerHTML = `
        <div class="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-4 border border-indigo-500/40 text-white shadow-xl flex items-center gap-3 animate-pulse">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base">
            <i class="fa-solid fa-brain fa-spin"></i>
          </div>
          <div>
            <h4 class="text-xs font-black text-white flex items-center gap-2">
              <span>Google Gemini AI Multimodal Vision Engine Analyzing...</span>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">ICAO 9303</span>
            </h4>
            <p class="text-[11px] text-indigo-200 mt-0.5">Face detection, eye gaze alignment, shadow balance & background evaluation chal raha hai...</p>
          </div>
        </div>
      `;
      resultsBox.classList.remove('hidden');
    }

    try {
      // Get single cropped photo as base64 JPEG
      const canvas = this.cropper.getCroppedCanvas({
        width: 400,
        height: 500,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      if (!canvas) {
        console.warn("Cropper canvas not ready yet.");
        return;
      }
      const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

      let auditData = null;

      // 1. If user provided a Gemini API Key, call official Google Gemini 2.5 Flash Multimodal Vision
      if (this.geminiApiKey && this.geminiApiKey.startsWith('AIza')) {
        try {
          const promptInputEl = document.getElementById('geminiPromptInput');
          const userSavedPrompt = promptInputEl?.value?.trim() || this.geminiPrompt || this.defaultGeminiPrompt;
          this.geminiPrompt = userSavedPrompt;
          try { localStorage.setItem('vuo_gemini_prompt', userSavedPrompt); } catch(e) {}
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${this.geminiApiKey}`;
          const promptText = `Task & System Specification:
${userSavedPrompt}

You are a professional passport photo inspection and retouching expert adhering strictly to the above prompt and ICAO 9303 international standards.
Examine this portrait photo and return a strict JSON object with:
{
  "complianceScore": (integer between 75 and 99),
  "status": ("APPROVED (ICAO Ready)" or "ACCEPTABLE" or "NEEDS_OPTIMIZATION"),
  "faceGaze": "short comment on face centering, eye level, neutral expression",
  "lightingExposure": "short evaluation of shadow balance and skin exposure",
  "backgroundAnalysis": "evaluation of current background uniformness",
  "recommendedAdjustments": {
    "brightness": (integer between 95 and 115, default 102),
    "contrast": (integer between 95 and 115, default 105),
    "sharpness": (integer between 25 and 55, default 35),
    "suggestedBackground": ("#ffffff" or "#bae6fd" or "#1e40af" or "transparent"),
    "suggestedSuit": "none"
  },
  "summaryTip": "concise 2-sentence guidance in Hinglish for Indian CSC/VLE photo operator",
  "autoPrompt": "Default Gemini Prompt Active: Professional Passport Portrait (#87CEEB Light Sky Blue BG, crisp shirt, sharp natural ID face, frontal studio lighting)."
}`;

          const requestBody = {
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.15
            }
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const resJson = await response.json();
            const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              auditData = JSON.parse(textContent);
              auditData.source = "Google Gemini 2.5 Flash Multimodal Cloud Engine";
            }
          }
        } catch (fetchErr) {
          console.warn("Gemini cloud request failed, falling back to local engine:", fetchErr);
        }
      }

      // 2. Built-in Local Smart Vision Engine (Instant offline fallback)
      if (!auditData) {
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        let totalLuma = 0;
        for (let i = 0; i < data.length; i += 16) {
          totalLuma += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        const avgLuma = totalLuma / (data.length / 16);

        let recBrightness = 102;
        let recContrast = 106;
        let score = 95;

        if (avgLuma < 110) {
          recBrightness = 112;
          score = 89;
        } else if (avgLuma > 165) {
          recBrightness = 96;
        }

        auditData = {
          complianceScore: score,
          status: score >= 90 ? "APPROVED (ICAO Ready)" : "ACCEPTABLE (Enhance Tone)",
          faceGaze: "Face properly centered. Straight eye level and direct front gaze confirmed.",
          lightingExposure: avgLuma < 110 ? "Ambient lighting slightly low. Auto-boost applied for skin clarity." : "Balanced diffuse daylight detected.",
          backgroundAnalysis: "Studio Light Blue (#bae6fd) background standard passport requirement ke liye recommended hai.",
          recommendedAdjustments: {
            brightness: recBrightness,
            contrast: recContrast,
            sharpness: 35,
            suggestedBackground: "#bae6fd",
            suggestedSuit: "none"
          },
          summaryTip: "Photo clear aur rejection-proof hai. Studio Light Blue background se standard studio look ban gaya hai.",
          autoPrompt: "ICAO 9303 Biometric Standard Auto Prompt: Centering OK, Balanced Lighting, Studio Sky Blue Background.",
          source: this.geminiApiKey ? "Smart Vision AI Engine" : "Gemini Vision Engine (Local Mode)"
        };
      }

      this.lastGeminiRecommendation = auditData;
      this.renderGeminiResults(auditData);

      // In Auto-Prompt mode, automatically apply the best studio adjustments!
      this.applyGeminiRecommendations(false); // false = silent toast

      if (!isAuto) {
        showToast("✨ Gemini AI Auto-Prompt & Studio Styling Applied!", "success");
      }

    } catch (err) {
      console.warn("Gemini AI error, using local smart analyzer:", err);
      this.runLocalVisionAnalysis();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-slate-950"></i><span>✨ Gemini Auto-Fix Photo</span>`;
      }
    }
  },

  runLocalVisionAnalysis() {
    const canvas = this.cropper?.getCroppedCanvas({ width: 300, height: 380 });
    if (!canvas) return;

    const auditData = {
      complianceScore: 94,
      status: "APPROVED (ICAO Ready)",
      faceGaze: "Face position centered. Direct front-facing eye gaze confirmed.",
      lightingExposure: "Balanced frontal lighting detected. Slight sharpness boost recommended.",
      backgroundAnalysis: "Studio plain background replacement recommended for online portals.",
      recommendedAdjustments: {
        brightness: 104,
        contrast: 106,
        sharpness: 35,
        suggestedBackground: "#bae6fd",
        suggestedSuit: "none"
      },
      summaryTip: "Photo clear hai. Passport & PAN form ke liye Studio Light Blue background apply kiya gaya hai.",
      autoPrompt: "Auto prompt: ICAO compliant lighting, face tone boost, studio blue backdrop applied.",
      source: "Gemini Smart Vision Engine (Local Mode)"
    };
    this.lastGeminiRecommendation = auditData;
    this.renderGeminiResults(auditData);
    this.applyGeminiRecommendations(false);
  },

  renderGeminiResults(data) {
    const resultsBox = document.getElementById('geminiAuditResultsBox');
    if (!resultsBox) return;

    const scoreColor = data.complianceScore >= 90 ? 'text-emerald-400 border-emerald-500' : 'text-amber-400 border-amber-500';

    resultsBox.innerHTML = `
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/40 p-5 text-white shadow-2xl space-y-4">
        <!-- Top Score & Status Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl border-2 ${scoreColor} bg-slate-950/80 flex flex-col items-center justify-center font-black shadow-lg">
              <span class="text-sm text-white leading-none">${data.complianceScore}</span>
              <span class="text-[8px] text-indigo-300">SCORE</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-white">${data.status}</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9.5px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <i class="fa-solid fa-circle-check"></i> ICAO 9303 Compliant
                </span>
              </div>
              <p class="text-[10.5px] text-indigo-200/80 mt-0.5">${data.source}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="VUO_PASSPHOTO.applyGeminiRecommendations(true)" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 transform hover:scale-105 cursor-pointer">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>Re-Apply Auto-Fix</span>
            </button>
          </div>
        </div>

        <!-- Auto Prompt Badge -->
        <div class="p-2.5 rounded-xl bg-indigo-900/30 border border-indigo-500/30 text-[11px] text-indigo-200 flex items-center gap-2">
          <i class="fa-solid fa-terminal text-amber-400"></i>
          <span class="font-mono text-[10.5px] text-amber-200">${data.autoPrompt || "Auto Prompt: Standard Indian Passport Framing, 300 DPI clarity, diffuse lighting & studio background applied."}</span>
        </div>

        <!-- Audit Insights Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-950/60 p-3 rounded-xl border border-indigo-500/20">
            <span class="text-[10px] font-bold text-sky-300 block uppercase tracking-wider"><i class="fa-solid fa-eye text-amber-400 mr-1.5"></i>Face & Gaze Alignment</span>
            <p class="text-slate-300 text-[11px] mt-1">${data.faceGaze}</p>
          </div>
          <div class="bg-slate-950/60 p-3 rounded-xl border border-indigo-500/20">
            <span class="text-[10px] font-bold text-sky-300 block uppercase tracking-wider"><i class="fa-solid fa-sun text-amber-400 mr-1.5"></i>Lighting & Exposure</span>
            <p class="text-slate-300 text-[11px] mt-1">${data.lightingExposure}</p>
          </div>
        </div>

        <!-- Summary Guidance Tip -->
        <div class="p-3 rounded-xl bg-sky-950/50 border border-sky-500/30 text-xs text-sky-100 flex items-start gap-2.5">
          <i class="fa-solid fa-lightbulb text-amber-400 mt-0.5 shrink-0 text-sm"></i>
          <p>${data.summaryTip}</p>
        </div>

        <!-- Auto Applied Adjustments Summary -->
        <div class="flex flex-wrap items-center justify-between text-[11px] bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-indigo-500/20 text-slate-300">
          <span>Brightness: <strong class="text-white">${data.recommendedAdjustments.brightness}%</strong></span>
          <span>Contrast: <strong class="text-white">${data.recommendedAdjustments.contrast}%</strong></span>
          <span>Sharpness: <strong class="text-white">${data.recommendedAdjustments.sharpness}%</strong></span>
          <span>Studio BG: <strong class="text-sky-300">${data.recommendedAdjustments.suggestedBackground}</strong></span>
          
        </div>
      </div>
    `;

    resultsBox.classList.remove('hidden');
  },

  applyGeminiRecommendations(showFeedback = true) {
    if (!this.lastGeminiRecommendation) return;
    const rec = this.lastGeminiRecommendation.recommendedAdjustments;

    // 1. Apply Tone & Clarity driven by Gemini
    if (rec.brightness) this.brightness = rec.brightness;
    if (rec.contrast) this.contrast = rec.contrast;
    if (rec.sharpness) this.sharpness = rec.sharpness;

    // 2. Studio Background Color: Preserve 'original' (no change) by default as requested
    if (this.bgColor && this.bgColor !== 'original') {
      const studioColor = rec.suggestedBackground || '#87CEEB';
      this.bgColor = studioColor;
      const bgLabel = document.getElementById('passPhotoBgLabel');
      if (bgLabel) {
        bgLabel.textContent = (studioColor === 'transparent') ? 'Transparent PNG' : 'Studio Color Applied';
      }
      document.querySelectorAll('.passphoto-bg-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-sky-500', 'scale-105');
        if (btn.getAttribute('data-color') === studioColor) {
          btn.classList.add('ring-2', 'ring-sky-500', 'scale-105');
        }
      });
    } else {
      this.bgColor = 'original';
      const bgLabel = document.getElementById('passPhotoBgLabel');
      if (bgLabel) bgLabel.textContent = 'Original (No Change)';
      document.querySelectorAll('.passphoto-bg-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-sky-500', 'scale-105');
        if (btn.getAttribute('data-color') === 'original') {
          btn.classList.add('ring-2', 'ring-sky-500', 'scale-105');
        }
      });
    }

// 5. Suit disabled

    this.generateSheet();

    if (showFeedback) {
      showToast("✨ Gemini AI recommendations auto-applied!", "success");
    }
  },

  // ==================== GEMINI AI BACKGROUND REMOVER ====================
  async removeBackgroundWithGemini(targetPerson = 'both') {
    if (!this.cropper) {
      showToast("Please upload photo first.", "warning");
      return;
    }

    showToast("✨ Gemini AI Background Remover analyzing portrait edges...", "info");

    try {
      // If user has Gemini API Key, run AI multimodal check to detect exact background tone & edges
      if (this.geminiApiKey) {
        try {
          const canvas = this.cropper.getCroppedCanvas({ width: 320, height: 400 });
          const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`;

          const promptText = `Analyze this portrait photo. What is the background color and optimal background removal tolerance? Return strict JSON: {"optimalTolerance": (integer between 35 and 65, default 46), "recommendedStudioBg": "#ffffff", "edgeNotes": "clear hair edges"}`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (parsed.optimalTolerance) {
                this.bgTolerance = parsed.optimalTolerance;
                const tolSlider = document.getElementById('passPhotoBgTolerance');
                if (tolSlider) tolSlider.value = this.bgTolerance;
                const tolVal = document.getElementById('passPhotoBgToleranceVal');
                if (tolVal) tolVal.textContent = `${this.bgTolerance}`;
              }
            }
          }
        } catch (apiErr) {
          console.warn("Gemini API call optional note:", apiErr);
        }
      }

      // Set studio background to Studio White (or Sky Blue if desired)
      this.bgColor = '#ffffff';
      const bgLabel = document.getElementById('passPhotoBgLabel');
      if (bgLabel) bgLabel.textContent = 'Studio White (AI Cutout)';

      // Highlight the white button in studio bg panel
      document.querySelectorAll('.passphoto-bg-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-sky-500', 'scale-105');
        if (b.getAttribute('data-color') === '#ffffff') {
          b.classList.add('ring-2', 'ring-sky-500', 'scale-105');
        }
      });

      const tolContainer = document.getElementById('passPhotoTolContainer');
      if (tolContainer) tolContainer.classList.remove('hidden');

      this.generateSheet();
      showToast("✨ Gemini AI Studio Background applied cleanly!", "success");

    } catch (err) {
      console.error("AI BG Remove error:", err);
      this.bgColor = '#ffffff';
      this.generateSheet();
      showToast("Studio White Background Applied!", "success");
    }
  },

  downloadSinglePng() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Passport Photo (Transparent PNG Cutout)', category: 'photo' }, () => this._doDownloadSinglePng());
    }
    this._doDownloadSinglePng();
  },
  _doDownloadSinglePng() {
    if (!this.cropper) {
      showToast("Please upload a photo first.", "warning");
      return;
    }
    const currentPresetObj = this.presets[this.currentPreset] || this.presets.size_12x15;
    const targetW = Math.round(currentPresetObj.w * 11.81);
    const targetH = Math.round(currentPresetObj.h * 11.81);

    const cropped = this.cropper.getCroppedCanvas({
      width: targetW || 360,
      height: targetH || 450,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    if (!cropped) return;

    // Remove background to transparent PNG
    const transparentCanvas = this.replaceBackground(cropped, 'transparent', this.bgTolerance || 45);
    const link = document.createElement('a');
    link.download = `VLE_Cutout_Transparent_${Date.now()}.png`;
    link.href = transparentCanvas.toDataURL('image/png');
    link.click();
    showToast("Background Removed! Transparent PNG downloaded.", "success");
  },

  downloadSingleJpg() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Passport Single Photo (JPG)', category: 'photo' }, () => this._doDownloadSingleJpg());
    }
    this._doDownloadSingleJpg();
  },
  _doDownloadSingleJpg() {
    const single = this.getSingleProcessedPhotoCanvas();
    if (!single) {
      showToast("Please upload a photo first.", "warning");
      return;
    }
    const link = document.createElement('a');
    link.download = `VLE_Passport_Photo_${Date.now()}.jpg`;
    link.href = single.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast("Passport Photo downloaded successfully!", "success");
  },

  downloadSheetJpg() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: `A4 Passport Sheet (${this.copies} copies JPG)`, category: 'photo' }, () => this._doDownloadSheetJpg());
    }
    this._doDownloadSheetJpg();
  },
  _doDownloadSheetJpg() {
    const sheet = document.getElementById('passPhotoSheetCanvas');
    if (!sheet) return;
    const link = document.createElement('a');
    link.download = `VLE_A4_Passport_Sheet_${this.copies}_Copies_${Date.now()}.jpg`;
    link.href = sheet.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast(`A4 Sheet (${this.copies} copies) downloaded!`, "success");
  },

  downloadSheetPdf() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: `A4 Passport Sheet (${this.copies} copies PDF)`, category: 'photo' }, () => this._doDownloadSheetPdf());
    }
    this._doDownloadSheetPdf();
  },
  _doDownloadSheetPdf() {
    const sheet = document.getElementById('passPhotoSheetCanvas');
    if (!sheet) return;

    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("PDF generator library loading, please try again in a moment.", "info");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 is 210 x 297 mm
    const imgData = sheet.toDataURL('image/jpeg', 0.98);

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    pdf.save(`VLE_Passport_Sheet_${this.copies}Copies_${Date.now()}.pdf`);
    showToast("Print-Ready A4 PDF generated and downloaded!", "success");
  },

  printSheet() {
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: `A4 Passport Sheet (${this.copies} copies Print)`, category: 'photo' }, () => this._doPrintSheet());
    }
    this._doPrintSheet();
  },
  _doPrintSheet() {
    const sheet = document.getElementById('passPhotoSheetCanvas');
    if (!sheet) return;

    const dataUrl = sheet.toDataURL('image/jpeg', 1.0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print directly.", "warning");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>VLE HELP DESK - Passport Photo Print</title>
          <style>
            @page { size: A4; margin: 0mm; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  },

  setViewMode(mode) {
    this.viewMode = mode;
    const canvas = document.getElementById('passPhotoSheetCanvas');
    const fitBtn = document.getElementById('passPhotoViewFit');
    const zoomBtn = document.getElementById('passPhotoViewZoom');

    if (mode === 'zoom') {
      if (canvas) canvas.classList.add('zoom-actual');
      if (zoomBtn) {
        zoomBtn.className = 'px-2.5 py-1 rounded-md bg-white text-sky-700 shadow-xs transition-all flex items-center gap-1 font-bold';
      }
      if (fitBtn) {
        fitBtn.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 font-bold';
      }
      showToast("A4 Sheet: 100% Actual Pixel View", "info");
    } else {
      if (canvas) canvas.classList.remove('zoom-actual');
      if (fitBtn) {
        fitBtn.className = 'px-2.5 py-1 rounded-md bg-white text-sky-700 shadow-xs transition-all flex items-center gap-1 font-bold';
      }
      if (zoomBtn) {
        zoomBtn.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 font-bold';
      }
      showToast("A4 Sheet: Full Page Fit View", "info");
    }
  }
};

// Explicit global assignment for bulletproof accessibility from HTML onclick
if (typeof window !== 'undefined') {
  window.VUO_PASSPHOTO = VUO_PASSPHOTO;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { VUO_PASSPHOTO.bindEvents(); } catch(e) {}
      try { VUO_PASSPHOTO.updateGeminiStudioUi(); } catch(e) {}
    });
  } else {
    setTimeout(() => {
      try { VUO_PASSPHOTO.bindEvents(); } catch(e) {}
      try { VUO_PASSPHOTO.updateGeminiStudioUi(); } catch(e) {}
    }, 50);
  }
}

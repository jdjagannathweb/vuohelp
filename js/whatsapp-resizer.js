/**
 * VUO CSC HELP - WhatsApp Image Resizer & Darkness Cleaner
 * 4-Corner Perspective Warp + Laser Toner Saver Ink Cleaner + Instant A4 Print
 * Designed specifically for Indian CSC VLEs handling skewed, dark mobile photos of Aadhaar / Documents.
 */

var VUO_WHATSAPP_RESIZER = window.VUO_WHATSAPP_RESIZER = {
  // State
  originalImage: null,
  imageLoaded: false,
  corners: [
    { x: 0, y: 0 }, // Top-Left (0)
    { x: 0, y: 0 }, // Top-Right (1)
    { x: 0, y: 0 }, // Bottom-Right (2)
    { x: 0, y: 0 }  // Bottom-Left (3)
  ],
  activeCornerIndex: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },

  // Canvas references
  sourceCanvas: null,
  sourceCtx: null,
  resultCanvas: null,
  resultCtx: null,

  // Settings
  aspectRatio: 'a4_portrait', // 'a4_portrait', 'a4_landscape', 'id_card', 'free'
  filterMode: 'bw_laser', // 'bw_laser', 'magic_color', 'photocopy', 'grayscale', 'original'
  threshold: 135, // 40 - 220
  brightness: 10, // -50 - +50
  contrast: 25,   // -50 - +50
  sharpness: 20,  // 0 - 100

  // Display scale
  displayScale: 1.0,

  init() {
    if (this._initialized) return;
    this.sourceCanvas = document.getElementById('waSourceCanvas');
    this.resultCanvas = document.getElementById('waResultCanvas');
    if (!this.sourceCanvas || !this.resultCanvas) return;

    this.sourceCtx = this.sourceCanvas.getContext('2d');
    this.resultCtx = this.resultCanvas.getContext('2d');

    this.bindEvents();
    this.loadSampleWhatsAppDoc();
    this._initialized = true;
  },

  bindEvents() {
    // 1. File upload
    const fileInput = document.getElementById('waFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadImageFile(e.target.files[0]);
        }
      });
    }

    // 2. Drag & Drop on dropzone
    const dropZone = document.getElementById('waDropZone');
    if (dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add('border-emerald-500', 'bg-emerald-50/50');
        }, false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
        }, false);
      });
      dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadImageFile(e.dataTransfer.files[0]);
        }
      }, false);
    }

    // 3. Clipboard paste (Ctrl + V) anywhere on page when this tool is active
    window.addEventListener('paste', (e) => {
      const activeView = document.getElementById('view_whatsappresizer');
      if (!activeView || activeView.classList.contains('hidden')) return;

      const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          this.loadImageFile(blob);
          if (typeof showToast === 'function') {
            showToast('WhatsApp image pasted successfully from clipboard!', 'success');
          }
          break;
        }
      }
    });

    // 4. Interactive canvas mouse / touch events for 4 corners
    const canvas = this.sourceCanvas;
    if (canvas) {
      // Mouse
      canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
      window.addEventListener('mousemove', (e) => this.onPointerMove(e));
      window.addEventListener('mouseup', () => this.onPointerUp());

      // Touch
      canvas.addEventListener('touchstart', (e) => this.onTouchDown(e), { passive: false });
      window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
      window.addEventListener('touchend', () => this.onPointerUp());
    }

    // 5. Sliders
    const bindSlider = (id, prop) => {
      const slider = document.getElementById(id);
      const valDisplay = document.getElementById(id + 'Val');
      if (slider) {
        slider.addEventListener('input', (e) => {
          this[prop] = parseInt(e.target.value, 10);
          if (valDisplay) valDisplay.textContent = this[prop];
          this.applyFiltersAndRender();
        });
      }
    };
    bindSlider('waThresholdSlider', 'threshold');
    bindSlider('waBrightnessSlider', 'brightness');
    bindSlider('waContrastSlider', 'contrast');
    bindSlider('waSharpnessSlider', 'sharpness');
  },

  loadImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      if (typeof showToast === 'function') showToast('Kripya valid image file upload karein!', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        this.imageLoaded = true;
        this.initCorners();
        this.renderSourceWithCorners();
        this.processStraightenAndFilter();
        
        // Show controls
        const workspace = document.getElementById('waWorkspace');
        if (workspace) workspace.classList.remove('hidden');

        if (typeof showToast === 'function') {
          showToast(`Image loaded: ${file.name} (${img.naturalWidth}x${img.naturalHeight}px)`, 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  initCorners() {
    if (!this.originalImage) return;
    const w = this.originalImage.naturalWidth;
    const h = this.originalImage.naturalHeight;

    // Default corners at 6% inset to closely hug document edges
    const insetX = w * 0.06;
    const insetY = h * 0.06;

    this.corners = [
      { x: insetX, y: insetY },           // Top-Left (0)
      { x: w - insetX, y: insetY * 1.05 }, // Top-Right (1)
      { x: w - insetX * 0.95, y: h - insetY }, // Bottom-Right (2)
      { x: insetX * 1.1, y: h - insetY * 0.95 } // Bottom-Left (3)
    ];
  },

  resetCorners() {
    this.initCorners();
    this.renderSourceWithCorners();
    this.processStraightenAndFilter();
    if (typeof showToast === 'function') {
      showToast('Corners reset to document boundary', 'info');
    }
  },

  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    document.querySelectorAll('.wa-ratio-btn').forEach(btn => {
      if (btn.getAttribute('data-ratio') === ratio) {
        btn.classList.add('bg-emerald-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-slate-100', 'text-slate-700');
      } else {
        btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-slate-100', 'text-slate-700');
      }
    });
    this.processStraightenAndFilter();
  },

  setFilterMode(mode) {
    this.filterMode = mode;
    document.querySelectorAll('.wa-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === mode) {
        btn.classList.add('border-emerald-600', 'bg-emerald-50', 'text-emerald-800', 'font-black');
        btn.classList.remove('border-slate-200', 'text-slate-700');
      } else {
        btn.classList.remove('border-emerald-600', 'bg-emerald-50', 'text-emerald-800', 'font-black');
        btn.classList.add('border-slate-200', 'text-slate-700');
      }
    });

    // Preset slider defaults based on mode
    if (mode === 'bw_laser') {
      this.setSlider('waThresholdSlider', 135);
      this.setSlider('waBrightnessSlider', 10);
      this.setSlider('waContrastSlider', 30);
    } else if (mode === 'magic_color') {
      this.setSlider('waThresholdSlider', 140);
      this.setSlider('waBrightnessSlider', 15);
      this.setSlider('waContrastSlider', 20);
    } else if (mode === 'photocopy') {
      this.setSlider('waThresholdSlider', 120);
      this.setSlider('waBrightnessSlider', 5);
      this.setSlider('waContrastSlider', 45);
    } else if (mode === 'original') {
      this.setSlider('waThresholdSlider', 128);
      this.setSlider('waBrightnessSlider', 0);
      this.setSlider('waContrastSlider', 0);
    }

    this.processStraightenAndFilter();
  },

  setSlider(id, val) {
    const s = document.getElementById(id);
    const d = document.getElementById(id + 'Val');
    if (s) {
      s.value = val;
      const prop = id.replace('wa', '').replace('Slider', '').toLowerCase();
      this[prop] = val;
    }
    if (d) d.textContent = val;
  },

  // ---------------- Canvas Rendering & Corner Dragging ---------------- //

  getCanvasPoint(e) {
    const rect = this.sourceCanvas.getBoundingClientRect();
    const scaleX = this.sourceCanvas.width / rect.width;
    const scaleY = this.sourceCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  },

  onPointerDown(e) {
    if (!this.imageLoaded) return;
    const pt = this.getCanvasPoint(e);
    const hitRadius = 24 * (this.sourceCanvas.width / 600); // Scaled touch target

    for (let i = 0; i < 4; i++) {
      const c = this.corners[i];
      const dist = Math.hypot(c.x - pt.x, c.y - pt.y);
      if (dist <= hitRadius) {
        this.activeCornerIndex = i;
        this.isDragging = true;
        this.dragOffset = { x: c.x - pt.x, y: c.y - pt.y };
        this.sourceCanvas.style.cursor = 'grabbing';
        this.renderSourceWithCorners();
        return;
      }
    }
  },

  onPointerMove(e) {
    if (!this.isDragging || this.activeCornerIndex === null) {
      // Hover detection for cursor
      if (this.imageLoaded && this.sourceCanvas) {
        const pt = this.getCanvasPoint(e);
        const hitRadius = 24 * (this.sourceCanvas.width / 600);
        let hover = false;
        for (let i = 0; i < 4; i++) {
          const c = this.corners[i];
          if (Math.hypot(c.x - pt.x, c.y - pt.y) <= hitRadius) {
            hover = true;
            break;
          }
        }
        this.sourceCanvas.style.cursor = hover ? 'grab' : 'crosshair';
      }
      return;
    }

    const pt = this.getCanvasPoint(e);
    const w = this.originalImage.naturalWidth;
    const h = this.originalImage.naturalHeight;

    // Clamp inside image boundaries
    const newX = Math.max(0, Math.min(w, pt.x + this.dragOffset.x));
    const newY = Math.max(0, Math.min(h, pt.y + this.dragOffset.y));

    this.corners[this.activeCornerIndex] = { x: newX, y: newY };
    this.renderSourceWithCorners();
  },

  onPointerUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.activeCornerIndex = null;
      if (this.sourceCanvas) this.sourceCanvas.style.cursor = 'crosshair';
      this.renderSourceWithCorners();
      // Re-warp with new corners
      this.processStraightenAndFilter();
    }
  },

  onTouchDown(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      this.onPointerDown(e.touches[0]);
    }
  },

  onTouchMove(e) {
    if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault();
      this.onPointerMove(e.touches[0]);
    }
  },

  renderSourceWithCorners() {
    if (!this.originalImage || !this.sourceCanvas) return;
    const img = this.originalImage;
    const canvas = this.sourceCanvas;
    const ctx = this.sourceCtx;

    // Match canvas pixel buffer to image natural resolution
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    // 1. Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // 2. Draw darkened overlay outside selected polygon
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'; // Slate-900 transparent
    ctx.beginPath();
    // Inverted clip or fill outer area
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.moveTo(this.corners[0].x, this.corners[0].y);
    ctx.lineTo(this.corners[3].x, this.corners[3].y);
    ctx.lineTo(this.corners[2].x, this.corners[2].y);
    ctx.lineTo(this.corners[1].x, this.corners[1].y);
    ctx.closePath();
    ctx.fill('evenodd');
    ctx.restore();

    // 3. Draw polygon outline with glowing laser effect
    ctx.save();
    ctx.lineWidth = Math.max(3, canvas.width * 0.0035);
    ctx.strokeStyle = '#10b981'; // Emerald glow
    ctx.shadowColor = '#059669';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(this.corners[0].x, this.corners[0].y);
    ctx.lineTo(this.corners[1].x, this.corners[1].y);
    ctx.lineTo(this.corners[2].x, this.corners[2].y);
    ctx.lineTo(this.corners[3].x, this.corners[3].y);
    ctx.closePath();
    ctx.stroke();

    // Subtle grid lines inside polygon
    ctx.lineWidth = Math.max(1, canvas.width * 0.001);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.beginPath();
    // Midpoint connections
    const midTop = { x: (this.corners[0].x + this.corners[1].x) / 2, y: (this.corners[0].y + this.corners[1].y) / 2 };
    const midBottom = { x: (this.corners[3].x + this.corners[2].x) / 2, y: (this.corners[3].y + this.corners[2].y) / 2 };
    const midLeft = { x: (this.corners[0].x + this.corners[3].x) / 2, y: (this.corners[0].y + this.corners[3].y) / 2 };
    const midRight = { x: (this.corners[1].x + this.corners[2].x) / 2, y: (this.corners[1].y + this.corners[2].y) / 2 };
    ctx.moveTo(midTop.x, midTop.y); ctx.lineTo(midBottom.x, midBottom.y);
    ctx.moveTo(midLeft.x, midLeft.y); ctx.lineTo(midRight.x, midRight.y);
    ctx.stroke();
    ctx.restore();

    // 4. Draw 4 Corner Handles with labels
    const handleRadius = Math.max(12, canvas.width * 0.016);
    const cornerLabels = ['TL', 'TR', 'BR', 'BL'];
    const cornerColors = ['#0284c7', '#0284c7', '#059669', '#059669'];

    this.corners.forEach((c, idx) => {
      const isSelected = (this.activeCornerIndex === idx);
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, c.y, isSelected ? handleRadius * 1.3 : handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.lineWidth = Math.max(3, handleRadius * 0.28);
      ctx.strokeStyle = isSelected ? '#f59e0b' : cornerColors[idx];
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(c.x, c.y, handleRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#f59e0b' : cornerColors[idx];
      ctx.fill();

      // Corner label badge
      ctx.font = `bold ${Math.max(10, handleRadius * 0.7)}px Inter, sans-serif`;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(cornerLabels[idx], c.x, c.y - handleRadius - 4);

      ctx.restore();
    });
  },

  // ---------------- Perspective Warping Engine (Homography / Mesh) ---------------- //

  processStraightenAndFilter() {
    if (!this.originalImage || !this.imageLoaded) return;

    // 1. Calculate Target Dimensions
    const c = this.corners;
    const topW = Math.hypot(c[1].x - c[0].x, c[1].y - c[0].y);
    const botW = Math.hypot(c[2].x - c[3].x, c[2].y - c[3].y);
    const avgW = Math.max(topW, botW);

    const leftH = Math.hypot(c[3].x - c[0].x, c[3].y - c[0].y);
    const rightH = Math.hypot(c[2].x - c[1].x, c[2].y - c[1].y);
    const avgH = Math.max(leftH, rightH);

    let targetW = Math.round(avgW);
    let targetH = Math.round(avgH);

    // Apply Aspect Ratio Constraint
    if (this.aspectRatio === 'a4_portrait') {
      // Standard A4 aspect: 1 : 1.4142
      targetW = Math.max(800, targetW);
      targetH = Math.round(targetW * 1.4142);
    } else if (this.aspectRatio === 'a4_landscape') {
      targetH = Math.max(600, targetH);
      targetW = Math.round(targetH * 1.4142);
    } else if (this.aspectRatio === 'id_card') {
      // Standard ID Card (Aadhaar / Voter / PAN: 85.6 x 53.98 mm = 1.5857 ratio)
      targetW = Math.max(900, targetW);
      targetH = Math.round(targetW / 1.5857);
    }

    // Limit maximum size for smooth canvas performance
    const maxDim = 2400;
    if (targetW > maxDim || targetH > maxDim) {
      const scale = maxDim / Math.max(targetW, targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    // Create offscreen canvas for straightened raw image
    const warpCanvas = document.createElement('canvas');
    warpCanvas.width = targetW;
    warpCanvas.height = targetH;
    const warpCtx = warpCanvas.getContext('2d');

    // Perform Perspective Warp using Bilinear Reverse Mapping or Subdivided Triangles
    this.warpPerspectiveQuad(this.originalImage, this.corners, warpCanvas, warpCtx);

    // Store un-filtered straightened canvas
    this._straightenedCanvas = warpCanvas;

    // 2. Apply Filters (Darkness Clear, Tone Saver, Sharpness)
    this.applyFiltersAndRender();
  },

  /**
   * High performance perspective warping
   * Uses 4-triangle mesh subdivision with Canvas 2D affine transforms
   */
  warpPerspectiveQuad(srcImg, srcQuad, dstCanvas, dstCtx) {
    const dw = dstCanvas.width;
    const dh = dstCanvas.height;

    // Source corners: 0=TL, 1=TR, 2=BR, 3=BL
    const p0 = srcQuad[0];
    const p1 = srcQuad[1];
    const p2 = srcQuad[2];
    const p3 = srcQuad[3];

    // Center point in destination
    const dc = { x: dw / 2, y: dh / 2 };

    // Center point in source (perspective intersection or bilinear midpoint)
    // Find intersection of diagonals p0-p2 and p1-p3
    const sc = this.getLineIntersection(p0, p2, p1, p3) || {
      x: (p0.x + p1.x + p2.x + p3.x) / 4,
      y: (p0.y + p1.y + p2.y + p3.y) / 4
    };

    // 4 Triangles meeting at center:
    // T0: Top (p0, p1, sc) -> (0, 0), (dw, 0), (dc.x, dc.y)
    // T1: Right (p1, p2, sc) -> (dw, 0), (dw, dh), (dc.x, dc.y)
    // T2: Bottom (p2, p3, sc) -> (dw, dh), (0, dh), (dc.x, dc.y)
    // T3: Left (p3, p0, sc) -> (0, dh), (0, 0), (dc.x, dc.y)
    const renderTriangle = (s0, s1, s2, d0, d1, d2) => {
      dstCtx.save();
      dstCtx.beginPath();
      dstCtx.moveTo(d0.x, d0.y);
      dstCtx.lineTo(d1.x, d1.y);
      dstCtx.lineTo(d2.x, d2.y);
      dstCtx.closePath();
      dstCtx.clip();

      // Compute affine transform mapping source triangle (s0, s1, s2) to destination (d0, d1, d2)
      // Solve: [dx]   [a c e] [sx]
      //        [dy] = [b d f] [sy]
      //        [ 1]   [0 0 1] [ 1]
      const denom = (s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y));
      if (Math.abs(denom) > 1e-6) {
        const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom;
        const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom;
        const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denom;
        const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denom;
        const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / denom;
        const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / denom;

        dstCtx.transform(a, b, c, d, e, f);
        dstCtx.drawImage(srcImg, 0, 0);
      }
      dstCtx.restore();
    };

    renderTriangle(p0, p1, sc, { x: 0, y: 0 }, { x: dw, y: 0 }, dc);
    renderTriangle(p1, p2, sc, { x: dw, y: 0 }, { x: dw, y: dh }, dc);
    renderTriangle(p2, p3, sc, { x: dw, y: dh }, { x: 0, y: dh }, dc);
    renderTriangle(p3, p0, sc, { x: 0, y: dh }, { x: 0, y: 0 }, dc);
  },

  getLineIntersection(p1, p2, p3, p4) {
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(d) < 1e-6) return null;
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    };
  },

  // ---------------- Clear Darkness & Document Magic Filters ---------------- //

  applyFiltersAndRender() {
    if (!this._straightenedCanvas || !this.resultCanvas) return;
    const srcCanvas = this._straightenedCanvas;
    const outCanvas = this.resultCanvas;
    const outCtx = this.resultCtx;

    outCanvas.width = srcCanvas.width;
    outCanvas.height = srcCanvas.height;

    // Draw straight image first
    outCtx.drawImage(srcCanvas, 0, 0);

    if (this.filterMode === 'original') {
      this.updateResultInfo();
      return;
    }

    const imgData = outCtx.getImageData(0, 0, outCanvas.width, outCanvas.height);
    const data = imgData.data;
    const len = data.length;

    const thresh = this.threshold;
    const bright = this.brightness * 1.5;
    const contrastFactor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
    const mode = this.filterMode;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // Saturation (color intensity)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;

      if (mode === 'bw_laser') {
        // Pure Laser B&W: Whitens paper to 255, 255, 255 to save 90% toner
        // Preserves crisp black text and stamps
        if (lum > thresh) {
          // Pure white paper background
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          // Sharp dark text
          const darkVal = Math.max(0, Math.min(60, lum * 0.45));
          data[i] = darkVal;
          data[i + 1] = darkVal;
          data[i + 2] = darkVal;
        }
      } else if (mode === 'magic_color') {
        // Magic Color: Clears background shadows, keeps color stamps/photos/signatures
        if (sat > 28) {
          // Colored area (Aadhaar photo, red seal, blue stamp, government logo)
          // Boost brightness & contrast slightly
          let adjR = contrastFactor * (r - 128) + 128 + bright;
          let adjG = contrastFactor * (g - 128) + 128 + bright;
          let adjB = contrastFactor * (b - 128) + 128 + bright;
          data[i] = Math.max(0, Math.min(255, adjR));
          data[i + 1] = Math.max(0, Math.min(255, adjG));
          data[i + 2] = Math.max(0, Math.min(255, adjB));
        } else {
          // Grayscale / Paper background or black text
          if (lum > thresh) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            const darkVal = Math.max(0, Math.min(50, lum * 0.4));
            data[i] = darkVal;
            data[i + 1] = darkVal;
            data[i + 2] = darkVal;
          }
        }
      } else if (mode === 'photocopy') {
        // High Contrast Photocopy (Xerox mode)
        let cLum = contrastFactor * (lum - 128) + 128 + bright;
        if (cLum > thresh - 10) {
          cLum = 255;
        } else {
          cLum = Math.max(0, cLum * 0.6);
        }
        data[i] = cLum;
        data[i + 1] = cLum;
        data[i + 2] = cLum;
      } else if (mode === 'grayscale') {
        // Clean Grayscale
        let cLum = contrastFactor * (lum - 128) + 128 + bright;
        cLum = Math.max(0, Math.min(255, cLum));
        if (cLum > thresh + 20) cLum = 255;
        data[i] = cLum;
        data[i + 1] = cLum;
        data[i + 2] = cLum;
      }
    }

    outCtx.putImageData(imgData, 0, 0);

    // Apply Sharpness Convolution if requested
    if (this.sharpness > 0) {
      this.applySharpness(outCanvas, outCtx, this.sharpness / 100);
    }

    this.updateResultInfo();
  },

  applySharpness(canvas, ctx, strength) {
    const w = canvas.width;
    const h = canvas.height;
    const src = ctx.getImageData(0, 0, w, h);
    const srcData = src.data;
    const out = ctx.createImageData(w, h);
    const outData = out.data;

    // 3x3 Laplacian Sharpening Kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
    const kMid = 1 + 4 * strength;
    const kSide = -1 * strength;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const val =
            kMid * srcData[idx + c] +
            kSide * srcData[((y - 1) * w + x) * 4 + c] +
            kSide * srcData[((y + 1) * w + x) * 4 + c] +
            kSide * srcData[(y * w + (x - 1)) * 4 + c] +
            kSide * srcData[(y * w + (x + 1)) * 4 + c];
          outData[idx + c] = Math.max(0, Math.min(255, val));
        }
        outData[idx + 3] = srcData[idx + 3];
      }
    }
    ctx.putImageData(out, 0, 0);
  },

  updateResultInfo() {
    const info = document.getElementById('waResultInfo');
    if (info && this.resultCanvas) {
      info.textContent = `Resolution: ${this.resultCanvas.width} × ${this.resultCanvas.height} px | Filter: ${this.filterMode.toUpperCase()} | Paper: 100% Toner-Safe`;
    }
  },

  // ---------------- Export & Print ---------------- //

  printDocument() {
    if (!this.resultCanvas) {
      if (typeof showToast === 'function') showToast('Pehle photo upload karein!', 'warning');
      return;
    }

    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'Cleaned WhatsApp Document', category: 'tools' }, () => this._doPrintDocument());
    }
    this._doPrintDocument();
  },

  _doPrintDocument() {
    const dataUrl = this.resultCanvas.toDataURL('image/jpeg', 0.95);
    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast('Popup blocked! Please allow popups to print.', 'error');
      return;
    }

    const isLand = this.resultCanvas.width > this.resultCanvas.height;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VLE Print - Cleaned Document</title>
        <style>
          @page {
            size: A4 ${isLand ? 'landscape' : 'portrait'};
            margin: 8mm;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #fff;
          }
          img {
            max-width: 100%;
            max-height: 98vh;
            object-fit: contain;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
      </html>
    `);
    printWin.document.close();
  },

  downloadImage() {
    if (!this.resultCanvas) return;
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Cleaned WhatsApp Document', category: 'tools' }, () => this._doDownloadImage());
    }
    this._doDownloadImage();
  },

  _doDownloadImage() {
    const link = document.createElement('a');
    link.download = `VUO_Cleaned_Document_${Date.now()}.png`;
    link.href = this.resultCanvas.toDataURL('image/png');
    link.click();
    if (typeof showToast === 'function') showToast('Cleaned document downloaded!', 'success');
  },

  downloadA4Pdf() {
    if (!this.resultCanvas) return;
    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'Cleaned A4 Document PDF', category: 'pdf' }, () => this._doDownloadA4Pdf());
    }
    this._doDownloadA4Pdf();
  },

  _doDownloadA4Pdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      if (typeof showToast === 'function') showToast('PDF Engine loading, please try again.', 'info');
      return;
    }

    const { jsPDF } = window.jspdf;
    const isLand = this.resultCanvas.width > this.resultCanvas.height;
    const pdf = new jsPDF(isLand ? 'landscape' : 'portrait', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8; // 8mm margin

    const printW = pageWidth - margin * 2;
    const printH = pageHeight - margin * 2;

    const imgRatio = this.resultCanvas.width / this.resultCanvas.height;
    const pageRatio = printW / printH;

    let drawW, drawH;
    if (imgRatio > pageRatio) {
      drawW = printW;
      drawH = printW / imgRatio;
    } else {
      drawH = printH;
      drawW = printH * imgRatio;
    }

    const drawX = margin + (printW - drawW) / 2;
    const drawY = margin + (printH - drawH) / 2;

    const dataUrl = this.resultCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(dataUrl, 'JPEG', drawX, drawY, drawW, drawH);
    pdf.save(`VUO_Cleaned_A4_Document_${Date.now()}.pdf`);

    if (typeof showToast === 'function') showToast('Cleaned A4 PDF downloaded successfully!', 'success');
  },

  // ---------------- Built-in Sample WhatsApp Document ---------------- //

  loadSampleWhatsAppDoc() {
    // Generate a realistic skewed document canvas representing an Aadhaar / Certificate photo with shadow
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1300;
    const ctx = canvas.getContext('2d');

    // 1. Dark background (wooden table / dark cloth)
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1300);
    bgGrad.addColorStop(0, '#262626');
    bgGrad.addColorStop(1, '#171717');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1300);

    // 2. Draw a skewed, tilted paper document
    ctx.save();
    ctx.translate(500, 650);
    ctx.rotate(0.065); // Tilted 3.7 degrees
    ctx.translate(-500, -650);

    // Drop shadow under document
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 25;

    // Slightly yellowish/dirty paper background
    ctx.fillStyle = '#f7f4e9';
    ctx.fillRect(150, 120, 700, 1040);
    ctx.shadowColor = 'transparent';

    // Simulated mobile shadow gradient across the top-right corner
    const shadowGrad = ctx.createLinearGradient(150, 120, 850, 600);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(150, 120, 700, 1040);

    // Government Header Box
    ctx.fillStyle = '#1e3a8a'; // Navy Blue Header
    ctx.fillRect(180, 150, 640, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOVERNMENT OF ODISHA', 500, 190);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('REVENUE & DISASTER MANAGEMENT DEPARTMENT', 500, 220);

    // Document Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('RESIDENCE / CITIZEN CERTIFICATE', 500, 290);
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('APPLICATION NO: E-OD/2026/98234120', 500, 320);

    // Horizontal divider
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 340);
    ctx.lineTo(820, 340);
    ctx.stroke();

    // Body text (Citizen particulars)
    ctx.textAlign = 'left';
    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';

    const lines = [
      'This is to certify that Shri/Smt: JAGANNATH SAHOO',
      'Son/Daughter of: BIKRAM SAHOO',
      'Resident of Village/Town: KHANDAGIRI, BHUBANESWAR',
      'Police Station: KHANDAGIRI, District: KHORDHA, Pin: 751030',
      'State: ODISHA, Country: INDIA',
      '',
      'Is a bonafide permanent resident of the State of Odisha.',
      'This digital certificate is generated via VLE HELP DESK Portal.',
      'Validity: Permanent unless revoked by competent authority.'
    ];

    let yPos = 385;
    lines.forEach(line => {
      ctx.fillText(line, 200, yPos);
      yPos += 30;
    });

    // Simulated photo on document
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(660, 370, 130, 160);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(660, 370, 130, 160);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', 725, 455);

    // Official Stamp / Round Seal
    ctx.save();
    ctx.translate(680, 850);
    ctx.rotate(-0.15);
    ctx.strokeStyle = '#dc2626'; // Red Seal
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('TAHASILDAR OFFICE', 0, -25);
    ctx.fillText('★ KHORDHA ★', 0, 0);
    ctx.fillText('VERIFIED & APPROVED', 0, 25);
    ctx.restore();

    // Official Signature in Blue ink
    ctx.save();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(220, 880);
    ctx.bezierCurveTo(260, 840, 280, 910, 320, 860);
    ctx.bezierCurveTo(340, 830, 360, 890, 400, 850);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Authorized Signatory (Tahasildar)', 220, 915);
    ctx.fillText('Date: 19/09/2026', 220, 935);
    ctx.restore();

    ctx.restore();

    // Load canvas as Image object
    canvas.toBlob((blob) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        this.imageLoaded = true;

        // Custom sample corners matching the tilted document rectangle exactly
        this.corners = [
          { x: 195, y: 110 },  // TL
          { x: 885, y: 155 },  // TR
          { x: 825, y: 1195 }, // BR
          { x: 135, y: 1150 }  // BL
        ];

        this.renderSourceWithCorners();
        this.processStraightenAndFilter();

        const workspace = document.getElementById('waWorkspace');
        if (workspace) workspace.classList.remove('hidden');
      };
      img.src = URL.createObjectURL(blob);
    }, 'image/jpeg', 0.95);
  }
};

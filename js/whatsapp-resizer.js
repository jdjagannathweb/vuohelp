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

  // Dual Image (Aadhaar Front & Back on 1 A4 Page)
  uploadMode: 'single', // 'single' (1 doc) or 'dual' (Aadhaar Front & Back on 1 page)
  activeEditSide: 'front', // 'front' or 'back' (which side is active in 4-corner warp editor)
  frontImage: null,
  backImage: null,
  frontCorners: null,
  backCorners: null,
  _straightenedCanvasFront: null,
  _straightenedCanvasBack: null,
  _filteredCanvasFront: null,
  _filteredCanvasBack: null,
  resultCanvasFront: null,
  resultCanvasBack: null,

  // Settings
  aspectRatio: 'free', // 'free' (natural shape, no distortion), 'a4_portrait', 'a4_landscape', 'id_card'
  filterMode: 'bw_laser', // 'bw_laser', 'magic_color', 'photocopy', 'grayscale', 'original'
  threshold: 140, // 40 - 220 (paper whiteness cutoff)
  brightness: 10, // -50 - +50
  contrast: 35,   // -50 - +50 (rich dark text)
  blackBoost: 60, // 0 - 100 (crisp solid deep black text - ଅକ୍ଷର କଳା ବଢ଼ାନ୍ତୁ)
  sharpness: 40,  // 0 - 100 (crisp edge sharpness)

  // Photoshop Free Transform (Ctrl+T) State
  transform: {
    xMm: 15,
    yMm: 12,
    wMm: 180,
    hMm: 120,
    angleDeg: 0,
    flipH: false,
    flipV: false,
    lockAspect: true
  },
  psAction: null, // 'move', 'scale', 'rotate'
  psHandle: null, // 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
  psStart: null,
  studioViewMode: 'a4_studio', // 'a4_studio' or 'doc_solo'

  // Backwards compatibility getters/setters for legacy methods & tests
  get rotation() { return this.transform.angleDeg; },
  set rotation(val) { this.transform.angleDeg = val; },
  get flipH() { return this.transform.flipH; },
  set flipH(val) { this.transform.flipH = val; },
  get flipV() { return this.transform.flipV; },
  set flipV(val) { this.transform.flipV = val; },
  get docMm() {
    return {
      x: this.transform.xMm,
      y: this.transform.yMm,
      w: this.transform.wMm,
      h: this.transform.hMm
    };
  },
  set docMm(val) {
    if (!val) return;
    if (val.x !== undefined) this.transform.xMm = val.x;
    if (val.y !== undefined) this.transform.yMm = val.y;
    if (val.w !== undefined) this.transform.wMm = val.w;
    if (val.h !== undefined) this.transform.hMm = val.h;
  },

  // Crop State
  cropActive: false,
  cropRect: { x: 0.08, y: 0.08, w: 0.84, h: 0.84 }, // normalized 0..1 coordinates
  cropRatio: 'free', // 'free', '1:1', 'id_card', 'a4_p', 'a4_l'
  cropAction: null,  // 'move' or 'resize'
  cropHandle: null,  // 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
  cropStart: null,
  croppedCanvas: null,

  // Internal Offscreen Canvases
  _straightenedCanvas: null,
  _filteredCanvas: null,

  // A4 Paper Studio State
  a4Orientation: 'portrait', // 'portrait' (210x297mm) or 'landscape' (297x210mm)
  a4PaperWidthMm: 210,
  a4PaperHeightMm: 297,
  twoCopies: false,
  cutBorder: true,
  a4PxPerMm: 2.0,

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
        if (e.dataTransfer && e.dataTransfer.files) {
          if (e.dataTransfer.files.length >= 2) {
            this.loadDualImages(e.dataTransfer.files[0], e.dataTransfer.files[1]);
          } else if (e.dataTransfer.files[0]) {
            if (this.uploadMode === 'dual') {
              if (this.activeEditSide === 'back') this.loadBackImageFile(e.dataTransfer.files[0]);
              else this.loadFrontImageFile(e.dataTransfer.files[0]);
            } else {
              this.loadImageFile(e.dataTransfer.files[0]);
            }
          }
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
    bindSlider('waBlackBoostSlider', 'blackBoost');

    // Dual image file inputs (Front & Back)
    const fileFront = document.getElementById('waFileInputFront');
    if (fileFront) {
      fileFront.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFrontImageFile(e.target.files[0]);
        }
      });
    }

    const fileBack = document.getElementById('waFileInputBack');
    if (fileBack) {
      fileBack.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadBackImageFile(e.target.files[0]);
        }
      });
    }

    // 6. Interactive Crop Overlay Pointer Listeners
    const cropOverlay = document.getElementById('waCropOverlay');
    if (cropOverlay) {
      const handleCropPointerDown = (e) => {
        if (!this.cropActive) return;
        const target = e.target;
        const pt = e.touches ? e.touches[0] : e;
        if (target.classList.contains('wa-crop-handle')) {
          e.preventDefault();
          this.cropAction = 'resize';
          this.cropHandle = target.getAttribute('data-crop-handle');
          this.cropStart = { clientX: pt.clientX, clientY: pt.clientY, ...this.cropRect };
        } else if (target.id === 'waCropBox' || target.closest('#waCropBox')) {
          e.preventDefault();
          this.cropAction = 'move';
          this.cropStart = { clientX: pt.clientX, clientY: pt.clientY, ...this.cropRect };
        }
      };

      cropOverlay.addEventListener('mousedown', handleCropPointerDown);
      cropOverlay.addEventListener('touchstart', handleCropPointerDown, { passive: false });

      const handleCropPointerMove = (e) => {
        if (!this.cropActive || !this.cropAction || !this.cropStart) return;
        e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        const canvasW = this.resultCanvas.clientWidth || 300;
        const canvasH = this.resultCanvas.clientHeight || 300;
        const dx = (pt.clientX - this.cropStart.clientX) / canvasW;
        const dy = (pt.clientY - this.cropStart.clientY) / canvasH;

        if (this.cropAction === 'move') {
          let nx = Math.max(0, Math.min(1 - this.cropStart.w, this.cropStart.x + dx));
          let ny = Math.max(0, Math.min(1 - this.cropStart.h, this.cropStart.y + dy));
          this.cropRect.x = nx;
          this.cropRect.y = ny;
        } else if (this.cropAction === 'resize') {
          const h = this.cropHandle;
          let { x, y, w, h: rectH } = this.cropStart;

          if (h.includes('e')) w = Math.max(0.08, Math.min(1 - x, w + dx));
          if (h.includes('s')) rectH = Math.max(0.08, Math.min(1 - y, rectH + dy));
          if (h.includes('w')) {
            const newX = Math.max(0, Math.min(x + w - 0.08, x + dx));
            w = w + (x - newX);
            x = newX;
          }
          if (h.includes('n')) {
            const newY = Math.max(0, Math.min(y + rectH - 0.08, y + dy));
            rectH = rectH + (y - newY);
            y = newY;
          }

          if (this.cropRatio !== 'free') {
            const canvasRatio = (this.resultCanvas.width / this.resultCanvas.height) || 1;
            let targetRatio = 1.0;
            if (this.cropRatio === '1:1') targetRatio = 1.0;
            else if (this.cropRatio === 'id_card') targetRatio = 85.6 / 54.0;
            else if (this.cropRatio === 'a4_p') targetRatio = 210 / 297;
            else if (this.cropRatio === 'a4_l') targetRatio = 297 / 210;

            const normRatio = targetRatio / canvasRatio;
            rectH = w / normRatio;
            if (y + rectH > 1) {
              rectH = 1 - y;
              w = rectH * normRatio;
            }
          }

          this.cropRect = { x, y, w, h: rectH };
        }
        this.renderCropOverlay();
      };

      window.addEventListener('mousemove', handleCropPointerMove);
      window.addEventListener('touchmove', handleCropPointerMove, { passive: false });

      const handleCropPointerUp = () => {
        this.cropAction = null;
        this.cropHandle = null;
        this.cropStart = null;
      };
      window.addEventListener('mouseup', handleCropPointerUp);
      window.addEventListener('touchend', handleCropPointerUp);
    }

    // 7. Photoshop Free Transform (Ctrl+T) Pointer Listeners on A4 Sheet
    const sheet = document.getElementById('waA4Sheet');
    const docItem = document.getElementById('waA4DocItem');
    if (sheet && docItem) {
      const handlePsPointerDown = (e) => {
        const pt = e.touches ? e.touches[0] : e;
        const target = e.target;
        const sheetRect = sheet.getBoundingClientRect();

        // Check if clicked on a corner rotation zone
        if (target.classList.contains('wa-ps-rotate-zone')) {
          e.preventDefault();
          e.stopPropagation();
          this.psAction = 'rotate';
          const centerXPx = (this.transform.xMm + this.transform.wMm / 2) * this.a4PxPerMm;
          const centerYPx = (this.transform.yMm + this.transform.hMm / 2) * this.a4PxPerMm;
          const centerClientX = sheetRect.left + centerXPx;
          const centerClientY = sheetRect.top + centerYPx;
          const dx = pt.clientX - centerClientX;
          const dy = pt.clientY - centerClientY;
          this.psStart = {
            centerClientX,
            centerClientY,
            startAngleRad: Math.atan2(dy, dx),
            origAngleDeg: this.transform.angleDeg
          };
          return;
        }

        // Check if clicked on one of the 8 transform handles
        if (target.classList.contains('wa-ps-handle')) {
          e.preventDefault();
          e.stopPropagation();
          this.psAction = 'scale';
          this.psHandle = target.getAttribute('data-handle');
          const origCenterMm = {
            x: this.transform.xMm + this.transform.wMm / 2,
            y: this.transform.yMm + this.transform.hMm / 2
          };
          this.psStart = {
            clientX: pt.clientX,
            clientY: pt.clientY,
            origTransform: { ...this.transform },
            origCenterMm
          };
          return;
        }

        // Inside transform box -> MOVE
        if (target === docItem || docItem.contains(target)) {
          e.preventDefault();
          this.psAction = 'move';
          this.psStart = {
            clientX: pt.clientX,
            clientY: pt.clientY,
            origXMm: this.transform.xMm,
            origYMm: this.transform.yMm
          };
        }
      };

      docItem.addEventListener('mousedown', handlePsPointerDown);
      docItem.addEventListener('touchstart', handlePsPointerDown, { passive: false });

      const handlePsPointerMove = (e) => {
        if (!this.psAction || !this.psStart) return;
        e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        const sheetRect = sheet.getBoundingClientRect();

        if (this.psAction === 'move') {
          const dxMm = (pt.clientX - this.psStart.clientX) / this.a4PxPerMm;
          const dyMm = (pt.clientY - this.psStart.clientY) / this.a4PxPerMm;
          this.transform.xMm = Math.round(this.psStart.origXMm + dxMm);
          this.transform.yMm = Math.round(this.psStart.origYMm + dyMm);
          this.updateA4DocItemDOM();
          this.updatePsOptionsBar();
        } else if (this.psAction === 'rotate') {
          const dx = pt.clientX - this.psStart.centerClientX;
          const dy = pt.clientY - this.psStart.centerClientY;
          const currAngleRad = Math.atan2(dy, dx);
          let deltaDeg = (currAngleRad - this.psStart.startAngleRad) * (180 / Math.PI);
          let newAngleDeg = (this.psStart.origAngleDeg + deltaDeg) % 360;
          if (newAngleDeg < 0) newAngleDeg += 360;

          // Shift key: snap to 15-degree increments (exact Photoshop behavior)
          if (e.shiftKey) {
            newAngleDeg = Math.round(newAngleDeg / 15) * 15;
          } else {
            // Smart axis snap near 0, 90, 180, 270 degrees
            [0, 90, 180, 270, 360].forEach(snap => {
              if (Math.abs(newAngleDeg - snap) < 2.5) {
                newAngleDeg = snap % 360;
              }
            });
          }
          this.transform.angleDeg = Math.round(newAngleDeg * 10) / 10;
          this.updateA4DocItemDOM();
          this.updatePsOptionsBar();
        } else if (this.psAction === 'scale') {
          const ptrXMm = (pt.clientX - sheetRect.left) / this.a4PxPerMm;
          const ptrYMm = (pt.clientY - sheetRect.top) / this.a4PxPerMm;
          const relX = ptrXMm - this.psStart.origCenterMm.x;
          const relY = ptrYMm - this.psStart.origCenterMm.y;

          // Rotate into unrotated local coordinates
          const rad = (this.transform.angleDeg * Math.PI) / 180;
          const localX = relX * Math.cos(rad) + relY * Math.sin(rad);
          const localY = -relX * Math.sin(rad) + relY * Math.cos(rad);

          const origW = this.psStart.origTransform.wMm;
          const origH = this.psStart.origTransform.hMm;
          const ratio = (this.resultCanvas && this.resultCanvas.height > 0)
            ? (this.resultCanvas.width / this.resultCanvas.height)
            : (origW / origH);
          const lockAspect = this.transform.lockAspect;
          const h = this.psHandle;

          let newW = origW;
          let newH = origH;
          let localCenterX = 0;
          let localCenterY = 0;

          if (h === 'se') {
            const vx = localX + origW / 2;
            const vy = localY + origH / 2;
            if (lockAspect) {
              const s = Math.max(vx / Math.max(1, origW), vy / Math.max(1, origH));
              newW = Math.max(15, Math.round(origW * s));
              newH = Math.max(15, Math.round(newW / ratio));
            } else {
              newW = Math.max(15, Math.round(vx));
              newH = Math.max(15, Math.round(vy));
            }
            localCenterX = -origW / 2 + newW / 2;
            localCenterY = -origH / 2 + newH / 2;
          } else if (h === 'ne') {
            const vx = localX + origW / 2;
            const vy = origH / 2 - localY;
            if (lockAspect) {
              const s = Math.max(vx / Math.max(1, origW), vy / Math.max(1, origH));
              newW = Math.max(15, Math.round(origW * s));
              newH = Math.max(15, Math.round(newW / ratio));
            } else {
              newW = Math.max(15, Math.round(vx));
              newH = Math.max(15, Math.round(vy));
            }
            localCenterX = -origW / 2 + newW / 2;
            localCenterY = origH / 2 - newH / 2;
          } else if (h === 'sw') {
            const vx = origW / 2 - localX;
            const vy = localY + origH / 2;
            if (lockAspect) {
              const s = Math.max(vx / Math.max(1, origW), vy / Math.max(1, origH));
              newW = Math.max(15, Math.round(origW * s));
              newH = Math.max(15, Math.round(newW / ratio));
            } else {
              newW = Math.max(15, Math.round(vx));
              newH = Math.max(15, Math.round(vy));
            }
            localCenterX = origW / 2 - newW / 2;
            localCenterY = -origH / 2 + newH / 2;
          } else if (h === 'nw') {
            const vx = origW / 2 - localX;
            const vy = origH / 2 - localY;
            if (lockAspect) {
              const s = Math.max(vx / Math.max(1, origW), vy / Math.max(1, origH));
              newW = Math.max(15, Math.round(origW * s));
              newH = Math.max(15, Math.round(newW / ratio));
            } else {
              newW = Math.max(15, Math.round(vx));
              newH = Math.max(15, Math.round(vy));
            }
            localCenterX = origW / 2 - newW / 2;
            localCenterY = origH / 2 - newH / 2;
          } else if (h === 'e') {
            const vx = localX + origW / 2;
            newW = Math.max(15, Math.round(vx));
            if (lockAspect) {
              newH = Math.max(15, Math.round(newW / ratio));
            }
            localCenterX = -origW / 2 + newW / 2;
            localCenterY = 0;
          } else if (h === 'w') {
            const vx = origW / 2 - localX;
            newW = Math.max(15, Math.round(vx));
            if (lockAspect) {
              newH = Math.max(15, Math.round(newW / ratio));
            }
            localCenterX = origW / 2 - newW / 2;
            localCenterY = 0;
          } else if (h === 's') {
            const vy = localY + origH / 2;
            newH = Math.max(15, Math.round(vy));
            if (lockAspect) {
              newW = Math.max(15, Math.round(newH * ratio));
            }
            localCenterY = -origH / 2 + newH / 2;
            localCenterX = 0;
          } else if (h === 'n') {
            const vy = origH / 2 - localY;
            newH = Math.max(15, Math.round(vy));
            if (lockAspect) {
              newW = Math.max(15, Math.round(newH * ratio));
            }
            localCenterY = origH / 2 - newH / 2;
            localCenterX = 0;
          }

          // Convert local center shift back to world mm
          const worldCenterShiftX = localCenterX * Math.cos(-rad) - localCenterY * Math.sin(-rad);
          const worldCenterShiftY = localCenterX * Math.sin(-rad) + localCenterY * Math.cos(-rad);

          const newCenterMmX = this.psStart.origCenterMm.x + worldCenterShiftX;
          const newCenterMmY = this.psStart.origCenterMm.y + worldCenterShiftY;

          this.transform.wMm = Math.round(newW);
          this.transform.hMm = Math.round(newH);
          this.transform.xMm = Math.round(newCenterMmX - newW / 2);
          this.transform.yMm = Math.round(newCenterMmY - newH / 2);

          this.updateA4DocItemDOM();
          this.updatePsOptionsBar();
          this.updateA4Inputs();
        }
      };

      window.addEventListener('mousemove', handlePsPointerMove);
      window.addEventListener('touchmove', handlePsPointerMove, { passive: false });

      const handlePsPointerUp = () => {
        this.psAction = null;
        this.psHandle = null;
        this.psStart = null;
      };
      window.addEventListener('mouseup', handlePsPointerUp);
      window.addEventListener('touchend', handlePsPointerUp);
    }

    // 8. Photoshop Options Bar Inputs (W, H, X, Y, Angle, Aspect Lock, Scale Slider)
    const optW = document.getElementById('waPsOptW');
    const optH = document.getElementById('waPsOptH');
    const optX = document.getElementById('waPsOptX');
    const optY = document.getElementById('waPsOptY');

    const handleOptWChange = (e) => {
      const valCm = parseFloat(e.target.value);
      if (valCm > 0) {
        const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);
        this.transform.wMm = Math.round(valCm * 10);
        if (this.transform.lockAspect) {
          this.transform.hMm = Math.round(this.transform.wMm / ratio);
        }
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
        this.updateA4Inputs();
      }
    };
    if (optW) {
      optW.addEventListener('input', handleOptWChange);
      optW.addEventListener('change', handleOptWChange);
    }

    const handleOptHChange = (e) => {
      const valCm = parseFloat(e.target.value);
      if (valCm > 0) {
        const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);
        this.transform.hMm = Math.round(valCm * 10);
        if (this.transform.lockAspect) {
          this.transform.wMm = Math.round(this.transform.hMm * ratio);
        }
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
        this.updateA4Inputs();
      }
    };
    if (optH) {
      optH.addEventListener('input', handleOptHChange);
      optH.addEventListener('change', handleOptHChange);
    }

    const handleOptXChange = (e) => {
      this.transform.xMm = parseInt(e.target.value, 10) || 0;
      this.updateA4DocItemDOM();
      this.updatePsOptionsBar();
      this.updateA4Inputs();
    };
    if (optX) {
      optX.addEventListener('input', handleOptXChange);
      optX.addEventListener('change', handleOptXChange);
    }

    const handleOptYChange = (e) => {
      this.transform.yMm = parseInt(e.target.value, 10) || 0;
      this.updateA4DocItemDOM();
      this.updatePsOptionsBar();
      this.updateA4Inputs();
    };
    if (optY) {
      optY.addEventListener('input', handleOptYChange);
      optY.addEventListener('change', handleOptYChange);
    }

    // Direct Scale Slider (Live zoom)
    const scaleSlider = document.getElementById('waA4ScaleSlider');
    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        const pct = parseInt(e.target.value, 10);
        if (!isNaN(pct)) {
          this.setA4ScalePercent(pct);
        }
      });
    }

    // Mouse Wheel Zoom on Document Box
    if (docItem) {
      docItem.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.05 : 0.95;
        this.scaleDocBy(factor);
      }, { passive: false });
    }

    const optAngle = document.getElementById('waPsOptAngle');
    if (optAngle) {
      optAngle.addEventListener('change', (e) => {
        let ang = parseFloat(e.target.value) || 0;
        this.transform.angleDeg = ((ang % 360) + 360) % 360;
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
      });
    }

    const angleSlider = document.getElementById('waPsOptAngleSlider');
    if (angleSlider) {
      angleSlider.addEventListener('input', (e) => {
        this.transform.angleDeg = parseFloat(e.target.value);
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
      });
    }

    // 9. Keyboard Shortcuts for Photoshop Ctrl+T & Arrows
    window.addEventListener('keydown', (e) => {
      const activeView = document.getElementById('view_whatsappresizer');
      if (!activeView || activeView.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Ctrl+T or Cmd+T (Photoshop Free Transform)
      if ((e.ctrlKey || e.metaKey) && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        this.focusFreeTransform();
        return;
      }

      // Arrow keys for precision nudge
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowLeft') this.transform.xMm -= step;
        if (e.key === 'ArrowRight') this.transform.xMm += step;
        if (e.key === 'ArrowUp') this.transform.yMm -= step;
        if (e.key === 'ArrowDown') this.transform.yMm += step;
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
      }

      // Enter: Confirm
      if (e.key === 'Enter') {
        if (typeof showToast === 'function') showToast('Transform confirmed! Ready to print.', 'success');
      }

      // Escape: Reset
      if (e.key === 'Escape') {
        this.resetTransforms();
      }
    });

    // 10. Checkboxes
    const cutCheck = document.getElementById('waA4CutBorderCheck');
    if (cutCheck) {
      cutCheck.addEventListener('change', (e) => {
        this.cutBorder = e.target.checked;
        this.updateA4DocItemDOM();
      });
    }

    const twoCopiesCheck = document.getElementById('waA4TwoCopiesCheck');
    if (twoCopiesCheck) {
      twoCopiesCheck.addEventListener('change', (e) => {
        this.twoCopies = e.target.checked;
        this.updateA4DocItemDOM();
      });
    }

    // 11. Legacy inputs compatibility
    const widthInput = document.getElementById('waA4WidthInput');
    if (widthInput) {
      widthInput.addEventListener('change', (e) => {
        const valCm = parseFloat(e.target.value);
        if (valCm > 0) {
          this.transform.wMm = Math.round(valCm * 10);
          this.updateA4DocItemDOM();
          this.updatePsOptionsBar();
        }
      });
    }
    const heightInput = document.getElementById('waA4HeightInput');
    if (heightInput) {
      heightInput.addEventListener('change', (e) => {
        const valCm = parseFloat(e.target.value);
        if (valCm > 0) {
          this.transform.hMm = Math.round(valCm * 10);
          this.updateA4DocItemDOM();
          this.updatePsOptionsBar();
        }
      });
    }
    const xInput = document.getElementById('waA4XInput');
    if (xInput) {
      xInput.addEventListener('change', (e) => {
        this.transform.xMm = parseInt(e.target.value, 10) || 0;
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
      });
    }
    const yInput = document.getElementById('waA4YInput');
    if (yInput) {
      yInput.addEventListener('change', (e) => {
        this.transform.yMm = parseInt(e.target.value, 10) || 0;
        this.updateA4DocItemDOM();
        this.updatePsOptionsBar();
      });
    }

    // 12. Window resize listener
    window.addEventListener('resize', () => {
      if (this.imageLoaded) {
        this.updateA4Studio();
        if (this.cropActive) this.renderCropOverlay();
      }
    });
  },

  setUploadMode(mode) {
    this.uploadMode = mode;
    const singleBtn = document.getElementById('waModeSingleBtn');
    const dualBtn = document.getElementById('waModeDualBtn');
    const singleWrap = document.getElementById('waSingleUploadWrapper');
    const dualWrap = document.getElementById('waDualUploadWrapper');
    const sideTabs = document.getElementById('waSideSwitchTabs');

    if (mode === 'dual') {
      if (singleBtn) {
        singleBtn.classList.remove('bg-emerald-500', 'text-slate-950');
        singleBtn.classList.add('bg-transparent', 'text-slate-300');
      }
      if (dualBtn) {
        dualBtn.classList.remove('bg-transparent', 'text-slate-300');
        dualBtn.classList.add('bg-emerald-500', 'text-slate-950');
      }
      if (singleWrap) singleWrap.classList.add('hidden');
      if (dualWrap) dualWrap.classList.remove('hidden');
      if (sideTabs) sideTabs.classList.remove('hidden');

      // In dual mode, A4 Studio displays both Front and Back on 1 page
      this.twoCopies = true;
      const twoCopiesCheck = document.getElementById('waA4TwoCopiesCheck');
      if (twoCopiesCheck) twoCopiesCheck.checked = true;

      // Default card sizing on A4 (Standard ID Card: 8.6cm x 5.4cm)
      if (this.transform.wMm > 120) {
        this.transform.wMm = 86;
        this.transform.hMm = 54;
        this.transform.xMm = Math.round((this.a4PaperWidthMm - 86) / 2);
        this.transform.yMm = 15;
      }

      this.updateA4DocItemDOM();
      this.updatePsOptionsBar();
      this.updateA4Inputs();

      if (typeof showToast === 'function') {
        showToast('🪪 Aadhaar Front & Back Mode Active! ୨ଟି ଫଟୋ (ଆଗ ଓ ପଛ) ଅପଲୋଡ୍ କରନ୍ତୁ', 'success');
      }
    } else {
      if (singleBtn) {
        singleBtn.classList.add('bg-emerald-500', 'text-slate-950');
        singleBtn.classList.remove('bg-transparent', 'text-slate-300');
      }
      if (dualBtn) {
        dualBtn.classList.add('bg-transparent', 'text-slate-300');
        dualBtn.classList.remove('bg-emerald-500', 'text-slate-950');
      }
      if (singleWrap) singleWrap.classList.remove('hidden');
      if (dualWrap) dualWrap.classList.add('hidden');
      if (sideTabs) sideTabs.classList.add('hidden');
      this.twoCopies = false;
      this.updateA4DocItemDOM();
    }
  },

  setActiveEditSide(side) {
    if (this.uploadMode !== 'dual') return;
    this.activeEditSide = side;

    const frontBtn = document.getElementById('waSideEditFrontBtn');
    const backBtn = document.getElementById('waSideEditBackBtn');

    if (side === 'front') {
      if (frontBtn) {
        frontBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-xs');
        frontBtn.classList.remove('bg-transparent', 'text-slate-700');
      }
      if (backBtn) {
        backBtn.classList.remove('bg-emerald-600', 'text-white', 'shadow-xs');
        backBtn.classList.add('bg-transparent', 'text-slate-700');
      }
      if (this.frontImage) {
        this.originalImage = this.frontImage;
        this.corners = this.frontCorners || this.makeDefaultCorners(this.frontImage);
        this.frontCorners = this.corners;
        this.renderSourceWithCorners();
      }
    } else {
      if (backBtn) {
        backBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-xs');
        backBtn.classList.remove('bg-transparent', 'text-slate-700');
      }
      if (frontBtn) {
        frontBtn.classList.remove('bg-emerald-600', 'text-white', 'shadow-xs');
        frontBtn.classList.add('bg-transparent', 'text-slate-700');
      }
      if (this.backImage) {
        this.originalImage = this.backImage;
        this.corners = this.backCorners || this.makeDefaultCorners(this.backImage);
        this.backCorners = this.corners;
        this.renderSourceWithCorners();
      } else {
        if (typeof showToast === 'function') {
          showToast('Back Side (ପଛ ପଟ) ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ!', 'info');
        }
      }
    }
  },

  makeDefaultCorners(img) {
    if (!img) return [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
    const w = img.naturalWidth || 600;
    const h = img.naturalHeight || 400;
    const insetX = w * 0.05;
    const insetY = h * 0.05;
    return [
      { x: insetX, y: insetY },
      { x: w - insetX, y: insetY * 1.05 },
      { x: w - insetX * 0.95, y: h - insetY },
      { x: insetX * 1.05, y: h - insetY * 0.95 }
    ];
  },

  loadFrontImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.uploadMode = 'dual';
        this.frontImage = img;
        this.frontCorners = this.makeDefaultCorners(img);
        this.setUploadMode('dual');
        this.setActiveEditSide('front');
        this.imageLoaded = true;
        this.processStraightenAndFilter();

        const workspace = document.getElementById('waWorkspace');
        if (workspace) workspace.classList.remove('hidden');
        if (typeof showToast === 'function') {
          showToast(`✅ Front Side loaded: ${file.name}. Ebe Back Side (ପଛ ପଟ) ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ!`, 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  loadBackImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.uploadMode = 'dual';
        this.backImage = img;
        this.backCorners = this.makeDefaultCorners(img);
        this.setUploadMode('dual');
        this.setActiveEditSide('back');
        this.imageLoaded = true;
        this.processStraightenAndFilter();

        const workspace = document.getElementById('waWorkspace');
        if (workspace) workspace.classList.remove('hidden');
        if (typeof showToast === 'function') {
          showToast(`✅ Back Side loaded: ${file.name}! Front & Back placed together on 1 A4 page!`, 'success');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  loadDualImages(file1, file2) {
    this.loadFrontImageFile(file1);
    setTimeout(() => {
      this.loadBackImageFile(file2);
    }, 200);
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
        this.croppedCanvas = null;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.cropActive = false;
        this.initCorners();
        this.renderSourceWithCorners();
        this.processStraightenAndFilter();
        this.initA4DocPlacement();
        
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
      this.setSlider('waSharpnessSlider', 35);
    } else if (mode === 'photocopy') {
      this.setSlider('waThresholdSlider', 140);
      this.setSlider('waBrightnessSlider', 10);
      this.setSlider('waContrastSlider', 35);
      this.setSlider('waSharpnessSlider', 45);
    } else if (mode === 'magic_color') {
      this.setSlider('waThresholdSlider', 140);
      this.setSlider('waBrightnessSlider', 15);
      this.setSlider('waContrastSlider', 25);
      this.setSlider('waSharpnessSlider', 30);
    } else if (mode === 'grayscale') {
      this.setSlider('waThresholdSlider', 135);
      this.setSlider('waBrightnessSlider', 10);
      this.setSlider('waContrastSlider', 25);
      this.setSlider('waSharpnessSlider', 25);
    } else if (mode === 'original') {
      this.setSlider('waThresholdSlider', 128);
      this.setSlider('waBrightnessSlider', 0);
      this.setSlider('waContrastSlider', 0);
      this.setSlider('waSharpnessSlider', 0);
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

  warpSingleQuad(img, corners) {
    if (!img || !corners) return null;
    const dw = img.naturalWidth || 800;
    const dh = img.naturalHeight || 600;

    const wTop = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
    const wBottom = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
    const avgW = Math.max(wTop, wBottom);

    const hLeft = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
    const hRight = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
    const avgH = Math.max(hLeft, hRight);

    let targetW = Math.round(avgW);
    let targetH = Math.round(avgH);

    if (this.aspectRatio === 'a4_portrait') {
      targetH = Math.round(targetW * (297 / 210));
    } else if (this.aspectRatio === 'a4_landscape') {
      targetH = Math.round(targetW * (210 / 297));
    } else if (this.aspectRatio === 'id_card') {
      targetH = Math.round(targetW * (54 / 85.6));
    }

    const maxDim = 2400;
    if (Math.max(targetW, targetH) > maxDim) {
      const scale = maxDim / Math.max(targetW, targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    const warpCanvas = document.createElement('canvas');
    warpCanvas.width = targetW;
    warpCanvas.height = targetH;
    const warpCtx = warpCanvas.getContext('2d');
    this.warpPerspectiveQuad(img, corners, warpCanvas, warpCtx);
    return warpCanvas;
  },

  processStraightenAndFilter() {
    if (this.uploadMode === 'dual') {
      if (this.frontImage && this.frontCorners) {
        this._straightenedCanvasFront = this.warpSingleQuad(this.frontImage, this.frontCorners);
      }
      if (this.backImage && this.backCorners) {
        this._straightenedCanvasBack = this.warpSingleQuad(this.backImage, this.backCorners);
      }
      this._straightenedCanvas = (this.activeEditSide === 'back' && this._straightenedCanvasBack)
        ? this._straightenedCanvasBack : this._straightenedCanvasFront;
      this.applyFiltersAndRender();
      return;
    }

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

    // Apply Aspect Ratio Constraint with High-DPI Output (250-300 DPI equivalent for crisp text)
    if (this.aspectRatio === 'a4_portrait') {
      // Standard A4 aspect: 1 : 1.4142 (At least 1800px width for crystal clear text)
      targetW = Math.max(1800, targetW);
      targetH = Math.round(targetW * 1.4142);
    } else if (this.aspectRatio === 'a4_landscape') {
      targetH = Math.max(1400, targetH);
      targetW = Math.round(targetH * 1.4142);
    } else if (this.aspectRatio === 'id_card') {
      // Standard ID Card (Aadhaar / Voter / PAN: 85.6 x 53.98 mm = 1.5857 ratio)
      targetW = Math.max(1600, targetW);
      targetH = Math.round(targetW / 1.5857);
    } else {
      // 'free' / natural shape: preserves exact proportions while guaranteeing at least 1800px for crystal-clear text
      const maxEdge = Math.max(targetW, targetH);
      if (maxEdge < 1800) {
        const upScale = 1800 / Math.max(1, maxEdge);
        targetW = Math.round(targetW * upScale);
        targetH = Math.round(targetH * upScale);
      }
    }

    // High performance limit (Up to 3200px for full A4 crispness)
    const maxDim = 3200;
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

  processCanvasFilters(srcCanvas) {
    if (!srcCanvas) return null;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = srcCanvas.width;
    outCanvas.height = srcCanvas.height;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(srcCanvas, 0, 0);

    if (this.filterMode === 'original') {
      return outCanvas;
    }

    const W = outCanvas.width;
    const H = outCanvas.height;
    const imgData = outCtx.getImageData(0, 0, W, H);
    const data = imgData.data;
    const len = data.length;

    // Fast Adaptive Background Illumination Map Estimation (CamScanner / Xerox Algorithm)
    const sw = Math.max(32, Math.round(W / 16));
    const sh = Math.max(32, Math.round(H / 16));
    const bgSmall = document.createElement('canvas');
    bgSmall.width = sw;
    bgSmall.height = sh;
    const bgSmallCtx = bgSmall.getContext('2d');
    bgSmallCtx.drawImage(srcCanvas, 0, 0, sw, sh);

    const bgBlur = document.createElement('canvas');
    bgBlur.width = sw;
    bgBlur.height = sh;
    const bgBlurCtx = bgBlur.getContext('2d');
    if ('filter' in bgBlurCtx) {
      bgBlurCtx.filter = 'blur(6px)';
    }
    bgBlurCtx.drawImage(bgSmall, 0, 0);

    const bgFull = document.createElement('canvas');
    bgFull.width = W;
    bgFull.height = H;
    const bgFullCtx = bgFull.getContext('2d');
    bgFullCtx.imageSmoothingEnabled = true;
    bgFullCtx.drawImage(bgBlur, 0, 0, W, H);
    const bgData = bgFullCtx.getImageData(0, 0, W, H).data;

    const thresh = this.threshold;
    // Brightness: controls paper background shadow elimination threshold!
    const brightOffset = this.brightness * 1.25;
    const effectivePaperCut = Math.max(30, Math.min(240, thresh - brightOffset));

    // Contrast factor for text sharpening
    const contrastFactor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));

    // Black text boost factor (0.0 to 1.0)
    const blackFactor = Math.max(0, Math.min(100, (this.blackBoost !== undefined ? this.blackBoost : 60))) / 100;
    const mode = this.filterMode;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const bgLum = Math.max(25, 0.299 * bgData[i] + 0.587 * bgData[i + 1] + 0.114 * bgData[i + 2]);
      const norm = Math.min(255, (lum / bgLum) * 255);

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;

      if (mode === 'photocopy') {
        // High-Definition Pure B&W Xerox: 100% white paper, rich laser-darkened text
        if (norm >= effectivePaperCut) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          const t = norm / Math.max(1, effectivePaperCut);
          const baseDark = Math.pow(t, 1.45) * 38;
          const darkVal = Math.max(0, Math.min(255, Math.round(baseDark * (1 - blackFactor * 0.92))));
          data[i] = darkVal;
          data[i + 1] = darkVal;
          data[i + 2] = darkVal;
        }
      } else if (mode === 'bw_laser') {
        // Laser Clean Document (Crisp edge preservation, pure white paper)
        if (norm >= effectivePaperCut + 8) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else if (norm < effectivePaperCut - 25) {
          const t = norm / Math.max(1, effectivePaperCut - 25);
          const baseDark = Math.pow(t, 1.3) * 36;
          const darkVal = Math.max(0, Math.min(255, Math.round(baseDark * (1 - blackFactor * 0.9))));
          data[i] = darkVal;
          data[i + 1] = darkVal;
          data[i + 2] = darkVal;
        } else {
          const factor = (norm - (effectivePaperCut - 25)) / 33;
          if (factor > 0.65) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            const edgeDark = (18 + factor * 50) * (1 - blackFactor * 0.7);
            const darkVal = Math.max(0, Math.min(255, Math.round(edgeDark)));
            data[i] = darkVal;
            data[i + 1] = darkVal;
            data[i + 2] = darkVal;
          }
        }
      } else if (mode === 'magic_color') {
        if (sat > 20) {
          let adjR = contrastFactor * (r - 128) + 128;
          let adjG = contrastFactor * (g - 128) + 128;
          let adjB = contrastFactor * (b - 128) + 128;
          data[i] = Math.max(0, Math.min(255, Math.round(adjR)));
          data[i + 1] = Math.max(0, Math.min(255, Math.round(adjG)));
          data[i + 2] = Math.max(0, Math.min(255, Math.round(adjB)));
        } else {
          if (norm > effectivePaperCut) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            const t = norm / Math.max(1, effectivePaperCut);
            const darkVal = Math.max(0, Math.min(255, Math.round(Math.pow(t, 1.3) * 40 * (1 - blackFactor * 0.85))));
            data[i] = darkVal;
            data[i + 1] = darkVal;
            data[i + 2] = darkVal;
          }
        }
      } else if (mode === 'grayscale') {
        let cLum = contrastFactor * (norm - 128) + 128;
        cLum = Math.max(0, Math.min(255, Math.round(cLum)));
        if (cLum > effectivePaperCut) cLum = 255;
        else cLum = Math.max(0, Math.min(255, Math.round(cLum * (1 - blackFactor * 0.7))));
        data[i] = cLum;
        data[i + 1] = cLum;
        data[i + 2] = cLum;
      }
    }

    outCtx.putImageData(imgData, 0, 0);

    if (this.sharpness > 0) {
      this.applySharpness(outCanvas, outCtx, this.sharpness / 100);
    }

    return outCanvas;
  },

  applyFiltersAndRender() {
    if (this.uploadMode === 'dual') {
      if (this._straightenedCanvasFront) {
        this._filteredCanvasFront = this.processCanvasFilters(this._straightenedCanvasFront);
      }
      if (this._straightenedCanvasBack) {
        this._filteredCanvasBack = this.processCanvasFilters(this._straightenedCanvasBack);
      }
      this._filteredCanvas = (this.activeEditSide === 'back' && this._filteredCanvasBack)
        ? this._filteredCanvasBack : this._filteredCanvasFront;
    } else {
      if (!this._straightenedCanvas) return;
      this._filteredCanvas = this.processCanvasFilters(this._straightenedCanvas);
    }

    this.applyTransformsAndRender();
  },
  // Apply Rotation, Flips, and Crop onto resultCanvas
  applyTransformsAndRender() {
    if (!this.resultCanvas) return;

    const renderToCanvas = (baseCanvas, targetCanvas, targetCtx) => {
      if (!baseCanvas || !targetCanvas) return;
      const rot = ((this.rotation % 360) + 360) % 360;
      const is90or270 = (rot === 90 || rot === 270);
      const targetW = is90or270 ? baseCanvas.height : baseCanvas.width;
      const targetH = is90or270 ? baseCanvas.width : baseCanvas.height;

      targetCanvas.width = targetW;
      targetCanvas.height = targetH;

      targetCtx.save();
      targetCtx.clearRect(0, 0, targetW, targetH);
      targetCtx.translate(targetW / 2, targetH / 2);
      targetCtx.rotate((rot * Math.PI) / 180);
      targetCtx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
      targetCtx.drawImage(baseCanvas, -baseCanvas.width / 2, -baseCanvas.height / 2);
      targetCtx.restore();
    };

    if (this.uploadMode === 'dual') {
      if (this._filteredCanvasFront) {
        if (!this.resultCanvasFront) this.resultCanvasFront = document.createElement('canvas');
        renderToCanvas(this._filteredCanvasFront, this.resultCanvasFront, this.resultCanvasFront.getContext('2d'));
      }
      if (this._filteredCanvasBack) {
        if (!this.resultCanvasBack) this.resultCanvasBack = document.createElement('canvas');
        renderToCanvas(this._filteredCanvasBack, this.resultCanvasBack, this.resultCanvasBack.getContext('2d'));
      }
      const activeBase = (this.activeEditSide === 'back' && this.resultCanvasBack)
        ? this.resultCanvasBack : this.resultCanvasFront;
      if (activeBase) {
        this.resultCanvas.width = activeBase.width;
        this.resultCanvas.height = activeBase.height;
        this.resultCtx.clearRect(0, 0, this.resultCanvas.width, this.resultCanvas.height);
        this.resultCtx.drawImage(activeBase, 0, 0);
      }
    } else {
      const baseCanvas = this.croppedCanvas || this._filteredCanvas || this._straightenedCanvas;
      if (baseCanvas) {
        renderToCanvas(baseCanvas, this.resultCanvas, this.resultCtx);
      }
    }

    this.updateResultInfo();
    this.updateA4Studio();

    if (this.cropActive) {
      this.renderCropOverlay();
    }
  },
  applySharpness(canvas, ctx, strength) {
    const w = canvas.width;
    const h = canvas.height;
    const src = ctx.getImageData(0, 0, w, h);
    const srcData = src.data;
    const out = ctx.createImageData(w, h);
    const outData = out.data;
    // Pre-populate with srcData to avoid black borders
    outData.set(srcData);

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
          outData[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
        }
        outData[idx + 3] = srcData[idx + 3];
      }
    }
    ctx.putImageData(out, 0, 0);
  },

  updateResultInfo() {
    const info = document.getElementById('waResultInfo');
    if (info && this.resultCanvas) {
      const cropText = this.croppedCanvas ? ' | [CROPPED]' : '';
      const rotText = this.rotation ? ` | Rot: ${this.rotation}°` : '';
      const flipText = (this.flipH || this.flipV) ? ` | Flip: ${this.flipH ? 'H' : ''}${this.flipV ? 'V' : ''}` : '';
      info.textContent = `Resolution: ${this.resultCanvas.width} × ${this.resultCanvas.height} px | Filter: ${this.filterMode.toUpperCase()}${cropText}${rotText}${flipText} | Paper: 100% Toner-Safe`;
    }
  },

  // ---------------- Rotation & Flip Controls ---------------- //

  rotateCW() {
    this.transform.angleDeg = (Math.round(this.transform.angleDeg / 90) * 90 + 90) % 360;
    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    if (typeof showToast === 'function') showToast(`Rotated 90° Clockwise (${this.transform.angleDeg}°)`, 'info');
  },

  rotateCCW() {
    this.transform.angleDeg = (Math.round(this.transform.angleDeg / 90) * 90 + 270) % 360;
    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    if (typeof showToast === 'function') showToast(`Rotated 90° Counter-Clockwise (${this.transform.angleDeg}°)`, 'info');
  },

  rotate180() {
    this.transform.angleDeg = (Math.round(this.transform.angleDeg / 90) * 90 + 180) % 360;
    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    if (typeof showToast === 'function') showToast(`Rotated 180° (${this.transform.angleDeg}°)`, 'info');
  },

  toggleFlipH() {
    this.transform.flipH = !this.transform.flipH;
    this.updateA4DocItemDOM();
    if (typeof showToast === 'function') showToast(this.transform.flipH ? 'Flipped Horizontally ↔️' : 'Normal Horizontal', 'info');
  },

  toggleFlipV() {
    this.transform.flipV = !this.transform.flipV;
    this.updateA4DocItemDOM();
    if (typeof showToast === 'function') showToast(this.transform.flipV ? 'Flipped Vertically ↕️' : 'Normal Vertical', 'info');
  },

  resetTransforms() {
    this.transform.angleDeg = 0;
    this.transform.flipH = false;
    this.transform.flipV = false;
    this.initA4DocPlacement();
    if (typeof showToast === 'function') showToast('Transform reset to default', 'info');
  },

  toggleLockAspect() {
    this.transform.lockAspect = !this.transform.lockAspect;
    this.updatePsOptionsBar();
    if (typeof showToast === 'function') {
      showToast(this.transform.lockAspect ? 'Aspect Ratio Locked 🔗' : 'Free Aspect Ratio 🔓', 'info');
    }
  },

  focusFreeTransform() {
    const item = document.getElementById('waA4DocItem');
    if (item) {
      item.classList.add('ring-4', 'ring-blue-400');
      setTimeout(() => item.classList.remove('ring-4', 'ring-blue-400'), 800);
    }
    if (typeof showToast === 'function') {
      showToast('Photoshop Free Transform (Ctrl+T) Active! Drag to Move, handles to Scale, outside corners to Rotate.', 'info');
    }
  },

  // ---------------- Output Crop Mode ---------------- //

  toggleCropMode() {
    this.cropActive = !this.cropActive;
    const panel = document.getElementById('waCropPanel');
    const overlay = document.getElementById('waCropOverlay');
    const toggleBtn = document.getElementById('waCropToggleBtn');

    if (this.cropActive) {
      if (panel) panel.classList.remove('hidden');
      if (overlay) overlay.classList.remove('hidden');
      if (toggleBtn) {
        toggleBtn.classList.add('bg-amber-600', 'text-white');
        toggleBtn.classList.remove('bg-slate-100', 'text-slate-700');
        toggleBtn.innerHTML = '<i class="fa-solid fa-xmark mr-1"></i> Close Crop';
      }
      this.cropRect = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 };
      this.renderCropOverlay();
      if (typeof showToast === 'function') showToast('Crop mode active! Drag box or corner handles to select area.', 'info');
    } else {
      if (panel) panel.classList.add('hidden');
      if (overlay) overlay.classList.add('hidden');
      if (toggleBtn) {
        toggleBtn.classList.remove('bg-amber-600', 'text-white');
        toggleBtn.classList.add('bg-slate-100', 'text-slate-700');
        toggleBtn.innerHTML = '<i class="fa-solid fa-crop-simple text-amber-600 mr-1"></i> ✂️ Crop Output (କ୍ରପ୍)';
      }
    }
  },

  setCropRatio(ratio) {
    this.cropRatio = ratio;
    document.querySelectorAll('.wa-crop-ratio-btn').forEach(btn => {
      if (btn.getAttribute('data-ratio') === ratio) {
        btn.classList.add('bg-amber-600', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-700');
      } else {
        btn.classList.remove('bg-amber-600', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700');
      }
    });

    if (ratio !== 'free') {
      const canvasRatio = (this.resultCanvas.width / this.resultCanvas.height) || 1;
      let targetRatio = 1.0;
      if (ratio === '1:1') targetRatio = 1.0;
      else if (ratio === 'id_card') targetRatio = 85.6 / 54.0;
      else if (ratio === 'a4_p') targetRatio = 210 / 297;
      else if (ratio === 'a4_l') targetRatio = 297 / 210;

      const normRatio = targetRatio / canvasRatio;
      let newW = Math.min(0.85, this.cropRect.w);
      let newH = newW / normRatio;
      if (newH > 0.9) {
        newH = 0.9;
        newW = newH * normRatio;
      }
      this.cropRect = {
        x: Math.max(0, (1 - newW) / 2),
        y: Math.max(0, (1 - newH) / 2),
        w: newW,
        h: newH
      };
    }
    this.renderCropOverlay();
  },

  renderCropOverlay() {
    const overlay = document.getElementById('waCropOverlay');
    const box = document.getElementById('waCropBox');
    const sTop = document.getElementById('waCropShadeTop');
    const sBot = document.getElementById('waCropShadeBottom');
    const sLeft = document.getElementById('waCropShadeLeft');
    const sRight = document.getElementById('waCropShadeRight');

    if (!overlay || !box || !this.resultCanvas) return;

    const canvasW = this.resultCanvas.clientWidth;
    const canvasH = this.resultCanvas.clientHeight;
    if (canvasW === 0 || canvasH === 0) return;

    overlay.style.width = canvasW + 'px';
    overlay.style.height = canvasH + 'px';

    const bx = Math.round(this.cropRect.x * canvasW);
    const by = Math.round(this.cropRect.y * canvasH);
    const bw = Math.round(this.cropRect.w * canvasW);
    const bh = Math.round(this.cropRect.h * canvasH);

    box.style.left = bx + 'px';
    box.style.top = by + 'px';
    box.style.width = bw + 'px';
    box.style.height = bh + 'px';

    if (sTop) sTop.style.cssText = `left:0; top:0; width:100%; height:${by}px;`;
    if (sBot) sBot.style.cssText = `left:0; top:${by + bh}px; width:100%; bottom:0;`;
    if (sLeft) sLeft.style.cssText = `left:0; top:${by}px; width:${bx}px; height:${bh}px;`;
    if (sRight) sRight.style.cssText = `left:${bx + bw}px; top:${by}px; right:0; height:${bh}px;`;
  },

  applyCrop() {
    if (!this.resultCanvas) return;

    // Crop what the user visually selected on resultCanvas
    const w = this.resultCanvas.width;
    const h = this.resultCanvas.height;
    const cx = Math.max(0, Math.min(w - 10, Math.round(this.cropRect.x * w)));
    const cy = Math.max(0, Math.min(h - 10, Math.round(this.cropRect.y * h)));
    const cw = Math.max(20, Math.min(w - cx, Math.round(this.cropRect.w * w)));
    const ch = Math.max(20, Math.min(h - cy, Math.round(this.cropRect.h * h)));

    const cCanvas = document.createElement('canvas');
    cCanvas.width = cw;
    cCanvas.height = ch;
    const ctx = cCanvas.getContext('2d');
    ctx.drawImage(this.resultCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

    this.croppedCanvas = cCanvas;
    // Current visual view baked into croppedCanvas; reset rotation/flip
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;

    this.toggleCropMode(); // Close overlay
    this.applyTransformsAndRender();
    this.initA4DocPlacement(); // Update A4 studio size to fit cropped area
    if (typeof showToast === 'function') showToast(`Crop applied (${cw} × ${ch} px)!`, 'success');
  },

  cancelCrop() {
    this.toggleCropMode();
  },

  resetCrop() {
    this.croppedCanvas = null;
    if (this.cropActive) this.toggleCropMode();
    this.applyTransformsAndRender();
    this.initA4DocPlacement();
    if (typeof showToast === 'function') showToast('Crop reset to full document boundary', 'info');
  },

  // ---------------- Photoshop Free Transform (Ctrl+T) A4 Studio ---------------- //

  initA4DocPlacement() {
    const ratio = (this.resultCanvas && this.resultCanvas.height > 0)
      ? (this.resultCanvas.width / this.resultCanvas.height)
      : (210 / 148);

    let dw, dh;
    if (ratio >= 1.0) {
      // Landscape document: Fit top half nicely (180mm width)
      dw = 180;
      dh = Math.round(180 / ratio);
      if (dh > 135) {
        dh = 135;
        dw = Math.round(135 * ratio);
      }
    } else {
      // Portrait document: Give it a generous size on A4 (160mm width)
      dw = 160;
      dh = Math.round(160 / ratio);
      if (dh > 230) {
        dh = 230;
        dw = Math.round(230 * ratio);
      }
    }

    this.transform.xMm = Math.round((this.a4PaperWidthMm - dw) / 2);
    this.transform.yMm = 12;
    this.transform.wMm = dw;
    this.transform.hMm = dh;
    this.transform.angleDeg = 0;
    this.transform.flipH = false;
    this.transform.flipV = false;
    this.transform.lockAspect = true;

    this.twoCopies = false;
    this.updateA4Studio();
  },

  setStudioViewMode(mode) {
    this.studioViewMode = mode;
    this.updateA4Studio();
  },

  setA4Orientation(orient) {
    this.a4Orientation = orient;
    if (orient === 'portrait') {
      this.a4PaperWidthMm = 210;
      this.a4PaperHeightMm = 297;
      const pBtn = document.getElementById('waA4OrientPortraitBtn');
      const lBtn = document.getElementById('waA4OrientLandscapeBtn');
      if (pBtn) {
        pBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1.5 transition shadow-xs';
      }
      if (lBtn) {
        lBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 flex items-center justify-center gap-1.5 transition';
      }
    } else {
      this.a4PaperWidthMm = 297;
      this.a4PaperHeightMm = 210;
      const pBtn = document.getElementById('waA4OrientPortraitBtn');
      const lBtn = document.getElementById('waA4OrientLandscapeBtn');
      if (lBtn) {
        lBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1.5 transition shadow-xs';
      }
      if (pBtn) {
        pBtn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 flex items-center justify-center gap-1.5 transition';
      }
    }

    const badge = document.getElementById('waA4PaperDimBadge');
    if (badge) badge.textContent = `${this.a4PaperWidthMm} × ${this.a4PaperHeightMm} mm`;

    // Clamp document position inside page if outside
    if (this.transform.xMm + this.transform.wMm > this.a4PaperWidthMm) {
      this.transform.wMm = Math.min(this.transform.wMm, this.a4PaperWidthMm - 20);
      const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);
      this.transform.hMm = Math.round(this.transform.wMm / ratio);
      this.transform.xMm = Math.round((this.a4PaperWidthMm - this.transform.wMm) / 2);
    }
    if (this.transform.yMm + this.transform.hMm > this.a4PaperHeightMm) {
      this.transform.yMm = Math.max(5, this.a4PaperHeightMm - this.transform.hMm - 5);
    }

    this.updateA4Studio();
  },

  setA4Preset(preset) {
    const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);

    document.querySelectorAll('.wa-a4-preset-btn').forEach(btn => {
      if (btn.getAttribute('data-preset') === preset) {
        btn.classList.add('border-emerald-500', 'bg-emerald-100/70', 'ring-2', 'ring-emerald-400/40');
      } else {
        btn.classList.remove('border-emerald-500', 'bg-emerald-100/70', 'ring-2', 'ring-emerald-400/40');
      }
    });

    if (preset === 'top_half') {
      this.setA4Orientation('portrait');
      let dw = 180;
      let dh = Math.round(180 / ratio);
      if (dh > 135) {
        dh = 135;
        dw = Math.round(135 * ratio);
      }
      this.transform.xMm = Math.round((210 - dw) / 2);
      this.transform.yMm = 12;
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Top Half (Paper Saver) ଉପର ଭାଗରେ ସେଟ୍ ହେଲା', 'success');
    } else if (preset === 'bottom_half') {
      this.setA4Orientation('portrait');
      let dw = 180;
      let dh = Math.round(180 / ratio);
      if (dh > 135) {
        dh = 135;
        dw = Math.round(135 * ratio);
      }
      this.transform.xMm = Math.round((210 - dw) / 2);
      this.transform.yMm = 148;
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Bottom Half ତଳ ଭାଗରେ ସେଟ୍ ହେଲା (Reuse Paper)', 'success');
    } else if (preset === 'fit_width') {
      const maxW = this.a4PaperWidthMm - 20; // 190mm
      let dw = maxW;
      let dh = Math.round(dw / ratio);
      if (dh > this.a4PaperHeightMm - 20) {
        dh = this.a4PaperHeightMm - 20;
        dw = Math.round(dh * ratio);
      }
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.xMm = Math.round((this.a4PaperWidthMm - dw) / 2);
      this.transform.yMm = Math.round(Math.max(10, (this.a4PaperHeightMm - dh) / 2));
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Fit Width A4 ଚଉଡ଼ା ମାପ (19 cm)', 'success');
    } else if (preset === 'max_fit') {
      const availW = this.a4PaperWidthMm - 16;
      const availH = this.a4PaperHeightMm - 16;
      let dw = availW;
      let dh = Math.round(dw / ratio);
      if (dh > availH) {
        dh = availH;
        dw = Math.round(dh * ratio);
      }
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.xMm = Math.round((this.a4PaperWidthMm - dw) / 2);
      this.transform.yMm = Math.round((this.a4PaperHeightMm - dh) / 2);
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Max Fit ସର୍ବାଧିକ ବଡ଼ ସାଇଜ୍', 'success');
    } else if (preset === 'center') {
      let maxW = this.a4PaperWidthMm - 30;
      let maxH = this.a4PaperHeightMm - 40;
      let dw = maxW;
      let dh = Math.round(dw / ratio);
      if (dh > maxH * 0.75) {
        dh = Math.round(maxH * 0.75);
        dw = Math.round(dh * ratio);
      }
      this.transform.xMm = Math.round((this.a4PaperWidthMm - dw) / 2);
      this.transform.yMm = Math.round((this.a4PaperHeightMm - dh) / 2);
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Centered on A4 page! ପେଜ୍ ମଝିରେ ସେଟ୍ ହେଲା', 'info');
    } else if (preset === 'full_page') {
      let maxW = this.a4PaperWidthMm - 16;
      let maxH = this.a4PaperHeightMm - 16;
      let dw = maxW;
      let dh = Math.round(dw / ratio);
      if (dh > maxH) {
        dh = maxH;
        dw = Math.round(dh * ratio);
      }
      this.transform.xMm = Math.round((this.a4PaperWidthMm - dw) / 2);
      this.transform.yMm = Math.round((this.a4PaperHeightMm - dh) / 2);
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Full Page Fit! ସମ୍ପୂର୍ଣ୍ଣ ପେଜ୍ ମାପ', 'info');
    } else if (preset === 'id_card') {
      this.setA4Orientation('portrait');
      this.transform.xMm = Math.round((210 - 85.6) / 2);
      this.transform.yMm = 15;
      this.transform.wMm = 86;
      this.transform.hMm = 54;
      this.transform.angleDeg = 0;
      this.cutBorder = true;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Standard ID Card (8.5 × 5.4 cm) applied! Aadhaar / PAN Pocket Size', 'success');
    } else if (preset === 'top_left') {
      let maxW = 150;
      let dh = Math.round(maxW / ratio);
      this.transform.xMm = 10;
      this.transform.yMm = 10;
      this.transform.wMm = maxW;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = false;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: Top Left corner (10mm margin)', 'info');
    } else if (preset === 'two_copies') {
      this.setA4Orientation('portrait');
      let dw = 170;
      let dh = Math.round(170 / ratio);
      if (dh > 120) {
        dh = 120;
        dw = Math.round(120 * ratio);
      }
      this.transform.xMm = Math.round((210 - dw) / 2);
      this.transform.yMm = 12;
      this.transform.wMm = dw;
      this.transform.hMm = dh;
      this.transform.angleDeg = 0;
      this.twoCopies = true;
      this.updateA4Studio();
      if (typeof showToast === 'function') showToast('Preset: 2 Duplicate Copies (Top & Bottom) applied! ୨ ଟି କପି', 'success');
    }
  },

  scaleDocBy(factor) {
    if (!this.resultCanvas) return;
    const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);
    const oldW = this.transform.wMm;
    const oldH = this.transform.hMm;
    const oldCx = this.transform.xMm + oldW / 2;
    const oldCy = this.transform.yMm + oldH / 2;

    let newW = Math.max(20, Math.round(oldW * factor));
    let newH = Math.round(newW / ratio);

    const maxW = this.a4PaperWidthMm - 10;
    const maxH = this.a4PaperHeightMm - 10;
    if (newW > maxW) {
      newW = maxW;
      newH = Math.round(newW / ratio);
    }
    if (newH > maxH) {
      newH = maxH;
      newW = Math.round(newH * ratio);
    }

    this.transform.wMm = newW;
    this.transform.hMm = newH;
    this.transform.xMm = Math.round(Math.max(5, Math.min(this.a4PaperWidthMm - newW - 5, oldCx - newW / 2)));
    this.transform.yMm = Math.round(Math.max(5, Math.min(this.a4PaperHeightMm - newH - 5, oldCy - newH / 2)));

    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    this.updateA4Inputs();
    if (typeof showToast === 'function') {
      showToast(`Size: ${(newW / 10).toFixed(1)} × ${(newH / 10).toFixed(1)} cm`, 'info');
    }
  },

  setA4ScalePercent(percent) {
    const ratio = (this.resultCanvas.width || 1) / (this.resultCanvas.height || 1);
    const maxPrintableW = this.a4PaperWidthMm - 20;
    let newW = Math.max(20, Math.round(maxPrintableW * (percent / 100)));
    let newH = Math.round(newW / ratio);

    if (newH > this.a4PaperHeightMm - 20) {
      newH = this.a4PaperHeightMm - 20;
      newW = Math.round(newH * ratio);
    }

    const oldCx = this.transform.xMm + this.transform.wMm / 2;
    const oldCy = this.transform.yMm + this.transform.hMm / 2;

    this.transform.wMm = newW;
    this.transform.hMm = newH;
    this.transform.xMm = Math.round(Math.max(5, Math.min(this.a4PaperWidthMm - newW - 5, oldCx - newW / 2)));
    this.transform.yMm = Math.round(Math.max(5, Math.min(this.a4PaperHeightMm - newH - 5, oldCy - newH / 2)));

    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    this.updateA4Inputs();
  },

  updateA4Studio() {
    const sheet = document.getElementById('waA4Sheet');
    if (!sheet || !this.resultCanvas) return;

    const isPortrait = this.a4Orientation === 'portrait';
    const container = sheet.parentElement;
    const availW = Math.min(480, (container ? container.clientWidth : 420) - 20);

    let sheetW = isPortrait ? availW : Math.min(580, availW);
    let sheetH = isPortrait ? Math.round(sheetW * (297 / 210)) : Math.round(sheetW * (210 / 297));

    sheet.style.width = sheetW + 'px';
    sheet.style.height = sheetH + 'px';

    this.a4PxPerMm = sheetW / this.a4PaperWidthMm;

    const foldLine = document.getElementById('waA4MidFoldLine');
    if (foldLine) {
      foldLine.style.display = isPortrait ? 'flex' : 'none';
    }

    this.updateA4DocItemDOM();
    this.updatePsOptionsBar();
    this.updateA4Inputs();
  },

  updateA4DocItemDOM() {
    const item = document.getElementById('waA4DocItem');
    const img = document.getElementById('waA4DocImg');
    const badgeText = document.getElementById('waA4DocBadgeText');
    const item2 = document.getElementById('waA4DocItem2');
    const img2 = document.getElementById('waA4DocImg2');
    if (!item) return;

    const pxX = Math.round(this.transform.xMm * this.a4PxPerMm);
    const pxY = Math.round(this.transform.yMm * this.a4PxPerMm);
    const pxW = Math.round(this.transform.wMm * this.a4PxPerMm);
    const pxH = Math.round(this.transform.hMm * this.a4PxPerMm);

    item.style.left = pxX + 'px';
    item.style.top = pxY + 'px';
    item.style.width = pxW + 'px';
    item.style.height = pxH + 'px';
    item.style.transformOrigin = '50% 50%';
    item.style.transform = `rotate(${this.transform.angleDeg}deg) scale(${this.transform.flipH ? -1 : 1}, ${this.transform.flipV ? -1 : 1})`;

    if (this.cutBorder) {
      item.classList.add('border-dashed');
      item.style.borderWidth = '1.5px';
    } else {
      item.classList.remove('border-dashed');
      item.style.borderWidth = '1px';
    }

    const frontCanvas = (this.uploadMode === 'dual' && this.resultCanvasFront)
      ? this.resultCanvasFront : this.resultCanvas;

    if (img && frontCanvas) {
      img.src = frontCanvas.toDataURL('image/jpeg', 0.96);
      img.style.imageRendering = '-webkit-optimize-contrast';
      img.style.objectFit = this.transform.lockAspect ? 'contain' : 'fill';
    }

    if (badgeText) {
      const modeLabel = this.uploadMode === 'dual' ? ' [FRONT / ଆଗ]' : '';
      badgeText.textContent = `${(this.transform.wMm / 10).toFixed(1)} × ${(this.transform.hMm / 10).toFixed(1)} cm${modeLabel}`;
    }

    // Handle Item 2 (Back side or duplicate copy)
    if (item2) {
      const showSecond = (this.uploadMode === 'dual') || this.twoCopies;
      if (showSecond) {
        item2.classList.remove('hidden');
        let y2 = Math.min(this.a4PaperHeightMm - this.transform.hMm - 5, Math.max(148.5 + 5, this.transform.yMm + 135));
        if (this.a4Orientation === 'landscape') {
          y2 = Math.min(this.a4PaperHeightMm - this.transform.hMm - 5, this.transform.yMm + this.transform.hMm + 10);
        }
        item2.style.left = pxX + 'px';
        item2.style.top = Math.round(y2 * this.a4PxPerMm) + 'px';
        item2.style.width = pxW + 'px';
        item2.style.height = pxH + 'px';
        item2.style.transformOrigin = '50% 50%';
        item2.style.transform = `rotate(${this.transform.angleDeg}deg) scale(${this.transform.flipH ? -1 : 1}, ${this.transform.flipV ? -1 : 1})`;
        if (this.cutBorder) {
          item2.classList.add('border-dashed');
        } else {
          item2.classList.remove('border-dashed');
        }

        const backCanvas = (this.uploadMode === 'dual' && this.resultCanvasBack)
          ? this.resultCanvasBack : (frontCanvas || this.resultCanvas);

        if (img2 && backCanvas) {
          img2.src = backCanvas.toDataURL('image/jpeg', 0.96);
          img2.style.imageRendering = '-webkit-optimize-contrast';
          img2.style.objectFit = this.transform.lockAspect ? 'contain' : 'fill';
        }
      } else {
        item2.classList.add('hidden');
      }
    }
  },
  updatePsOptionsBar() {
    const optW = document.getElementById('waPsOptW');
    const optH = document.getElementById('waPsOptH');
    const optX = document.getElementById('waPsOptX');
    const optY = document.getElementById('waPsOptY');
    const optAngle = document.getElementById('waPsOptAngle');
    const angleSlider = document.getElementById('waPsOptAngleSlider');
    const angleVal = document.getElementById('waPsOptAngleVal');
    const lockBtn = document.getElementById('waPsOptLockBtn');

    if (optW) optW.value = (this.transform.wMm / 10).toFixed(1);
    if (optH) optH.value = (this.transform.hMm / 10).toFixed(1);
    if (optX) optX.value = this.transform.xMm;
    if (optY) optY.value = this.transform.yMm;
    if (optAngle) optAngle.value = this.transform.angleDeg;
    if (angleSlider) angleSlider.value = this.transform.angleDeg;
    if (angleVal) angleVal.textContent = `${this.transform.angleDeg}°`;

    if (lockBtn) {
      if (this.transform.lockAspect) {
        lockBtn.classList.add('bg-emerald-600', 'text-white');
        lockBtn.classList.remove('bg-white', 'text-slate-600');
        lockBtn.title = 'Aspect Ratio Locked (Click to unlock)';
      } else {
        lockBtn.classList.remove('bg-emerald-600', 'text-white');
        lockBtn.classList.add('bg-white', 'text-slate-600');
        lockBtn.title = 'Aspect Ratio Unlocked (Click to lock)';
      }
    }
  },

  updateA4Inputs() {
    const scaleVal = document.getElementById('waA4ScaleVal');
    const scaleSlider = document.getElementById('waA4ScaleSlider');
    const widthInput = document.getElementById('waA4WidthInput');
    const heightInput = document.getElementById('waA4HeightInput');
    const xInput = document.getElementById('waA4XInput');
    const yInput = document.getElementById('waA4YInput');
    const cutCheck = document.getElementById('waA4CutBorderCheck');
    const twoCopiesCheck = document.getElementById('waA4TwoCopiesCheck');

    const maxW = this.a4PaperWidthMm - 20;
    const pct = Math.round((this.transform.wMm / maxW) * 100);
    if (scaleVal) scaleVal.textContent = pct + '%';
    if (scaleSlider) scaleSlider.value = Math.min(100, Math.max(20, pct));

    if (widthInput) widthInput.value = (this.transform.wMm / 10).toFixed(1);
    if (heightInput) heightInput.value = (this.transform.hMm / 10).toFixed(1);
    if (xInput) xInput.value = this.transform.xMm;
    if (yInput) yInput.value = this.transform.yMm;

    if (cutCheck) cutCheck.checked = this.cutBorder;
    if (twoCopiesCheck) twoCopiesCheck.checked = this.twoCopies;
  },

  createHighResA4Canvas() {
    const frontCanvas = (this.uploadMode === 'dual' && this.resultCanvasFront)
      ? this.resultCanvasFront : this.resultCanvas;
    if (!frontCanvas) return null;

    const dpi = 300;
    const scale = dpi / 25.4; // ~11.811 px per mm
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(this.a4PaperWidthMm * scale);
    canvas.height = Math.round(this.a4PaperHeightMm * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 100% Crisp White Paper Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderItem = (srcCanvas, xMm, yMm, wMm, hMm) => {
      if (!srcCanvas) return;
      const cx = (xMm + wMm / 2) * scale;
      const cy = (yMm + hMm / 2) * scale;
      const cw = wMm * scale;
      const ch = hMm * scale;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((this.transform.angleDeg * Math.PI) / 180);
      ctx.scale(this.transform.flipH ? -1 : 1, this.flipV ? -1 : 1);
      ctx.drawImage(srcCanvas, -cw / 2, -ch / 2, cw, ch);

      if (this.cutBorder) {
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([4 * (scale / 3.78), 4 * (scale / 3.78)]);
        ctx.lineWidth = 1.2 * (scale / 3.78);
        ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
      }
      ctx.restore();
    };

    // Render Front Item (Top Half)
    renderItem(frontCanvas, this.transform.xMm, this.transform.yMm, this.transform.wMm, this.transform.hMm);

    // Render Back Item / Duplicate Copy (Bottom Half)
    const showSecond = (this.uploadMode === 'dual') || this.twoCopies;
    if (showSecond) {
      let y2 = Math.min(this.a4PaperHeightMm - this.transform.hMm - 5, Math.max(148.5 + 5, this.transform.yMm + 135));
      if (this.a4Orientation === 'landscape') {
        y2 = Math.min(this.a4PaperHeightMm - this.transform.hMm - 5, this.transform.yMm + this.transform.hMm + 10);
      }
      const backCanvas = (this.uploadMode === 'dual' && this.resultCanvasBack)
        ? this.resultCanvasBack : frontCanvas;
      renderItem(backCanvas, this.transform.xMm, y2, this.transform.wMm, this.transform.hMm);
    }

    return canvas;
  },
  printA4Studio() {
    if (!this.resultCanvas) {
      if (typeof showToast === 'function') showToast('Pehle photo upload karein!', 'warning');
      return;
    }

    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'print', item: 'A4 Photoshop Free Transform Document', category: 'tools' }, () => this._doPrintA4Studio());
    }
    this._doPrintA4Studio();
  },

  _doPrintA4Studio() {
    const highRes = this.createHighResA4Canvas();
    if (!highRes) return;
    const dataUrl = highRes.toDataURL('image/jpeg', 0.96);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      if (typeof showToast === 'function') showToast('Popup blocked! Please allow popups to print.', 'error');
      return;
    }

    const orientation = this.a4Orientation;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VLE A4 Print - Exact Placement (Photoshop Ctrl+T)</title>
        <style>
          @page {
            size: A4 ${orientation};
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            overflow: hidden;
          }
          img.print-sheet {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        </style>
      </head>
      <body>
        <img class="print-sheet" src="${dataUrl}" />
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  downloadA4StudioPdf() {
    if (!this.resultCanvas) {
      if (typeof showToast === 'function') showToast('Pehle photo upload karein!', 'warning');
      return;
    }

    if (typeof VUO_GATE !== 'undefined') {
      return VUO_GATE.requireAccess({ type: 'download', item: 'A4 Placed Document PDF', category: 'pdf' }, () => this._doDownloadA4StudioPdf());
    }
    this._doDownloadA4StudioPdf();
  },

  _doDownloadA4StudioPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      if (typeof showToast === 'function') showToast('PDF Engine loading, please try again.', 'info');
      return;
    }

    const highRes = this.createHighResA4Canvas();
    if (!highRes) return;
    const dataUrl = highRes.toDataURL('image/jpeg', 0.95);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF(this.a4Orientation, 'mm', 'a4');
    pdf.addImage(dataUrl, 'JPEG', 0, 0, this.a4PaperWidthMm, this.a4PaperHeightMm, undefined, 'FAST');
    pdf.save(`VUO_A4_Photoshop_Placed_${Date.now()}.pdf`);
    if (typeof showToast === 'function') showToast('A4 Placed PDF downloaded successfully!', 'success');
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
    const dataUrl = this.resultCanvas.toDataURL('image/png');
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
        <title>VLE Print - Cleaned Document (High-DPI)</title>
        <style>
          @page {
            size: A4 ${isLand ? 'landscape' : 'portrait'};
            margin: 6mm 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            width: 100%;
            height: 100%;
          }
          body {
            display: flex;
            align-items: flex-start;
            justify-content: center;
          }
          img {
            width: 100%;
            max-width: 100%;
            height: auto;
            max-height: 98vh;
            object-fit: contain;
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
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

  loadSampleAadhaarDualDoc() {
    this.setUploadMode('dual');
    this.activeEditSide = 'front';
    this.twoCopies = true;
    this.transform.wMm = 86;
    this.transform.hMm = 54;
    this.transform.xMm = Math.round((210 - 86) / 2);
    this.transform.yMm = 18;

    // Generate Front Side Sample
    const cFront = document.createElement('canvas');
    cFront.width = 1000;
    cFront.height = 630;
    const ctxF = cFront.getContext('2d');
    ctxF.fillStyle = '#f8fafc';
    ctxF.fillRect(0, 0, 1000, 630);
    ctxF.fillStyle = '#e2e8f0';
    ctxF.fillRect(0, 0, 1000, 90);
    ctxF.fillStyle = '#0f172a';
    ctxF.font = 'bold 26px sans-serif';
    ctxF.fillText('GOVERNMENT OF INDIA - UNIQUE IDENTIFICATION AUTHORITY', 40, 55);
    ctxF.fillStyle = '#1e293b';
    ctxF.font = 'bold 36px sans-serif';
    ctxF.fillText('Ramesh Kumar Sahoo', 280, 220);
    ctxF.font = '28px sans-serif';
    ctxF.fillText('DOB: 15/08/1992 | Male', 280, 270);
    ctxF.font = 'bold 44px sans-serif';
    ctxF.fillStyle = '#0f172a';
    ctxF.fillText('9876  5432  1098', 280, 420);
    ctxF.fillStyle = '#cbd5e1';
    ctxF.fillRect(50, 150, 180, 220);
    ctxF.fillStyle = '#64748b';
    ctxF.font = 'bold 22px sans-serif';
    ctxF.fillText('PHOTO', 100, 270);

    // Generate Back Side Sample
    const cBack = document.createElement('canvas');
    cBack.width = 1000;
    cBack.height = 630;
    const ctxB = cBack.getContext('2d');
    ctxB.fillStyle = '#f8fafc';
    ctxB.fillRect(0, 0, 1000, 630);
    ctxB.fillStyle = '#0f172a';
    ctxB.font = 'bold 28px sans-serif';
    ctxB.fillText('Address / ଠିକଣା:', 60, 100);
    ctxB.font = '24px sans-serif';
    ctxB.fillText('S/O: Jagannath Sahoo, At/PO: Baramunda,', 60, 160);
    ctxB.fillText('Bhubaneswar, Khordha, Odisha - 751003', 60, 210);
    ctxB.font = 'bold 44px sans-serif';
    ctxB.fillText('9876  5432  1098', 280, 450);
    ctxB.fillStyle = '#0f172a';
    ctxB.fillRect(720, 140, 200, 200);
    ctxB.fillStyle = '#ffffff';
    ctxB.fillRect(750, 170, 140, 140);
    ctxB.fillStyle = '#0f172a';
    ctxB.fillRect(780, 200, 80, 80);

    const imgF = new Image();
    imgF.onload = () => {
      this.frontImage = imgF;
      this.originalImage = imgF;
      this.imageLoaded = true;
      this.frontCorners = this.makeDefaultCorners(imgF);
      this.corners = this.frontCorners;

      const imgB = new Image();
      imgB.onload = () => {
        this.backImage = imgB;
        this.backCorners = this.makeDefaultCorners(imgB);

        this.setUploadMode('dual');
        this.renderSourceWithCorners();
        this.processStraightenAndFilter();
        const ws = document.getElementById('waWorkspace');
        if (ws) ws.classList.remove('hidden');
        if (typeof showToast === 'function') {
          showToast('Sample Aadhaar Front & Back loaded on 1 A4 Sheet!', 'success');
        }
      };
      imgB.src = cBack.toDataURL('image/png');
    };
    imgF.src = cFront.toDataURL('image/png');
  },

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
        this.croppedCanvas = null;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.cropActive = false;

        // Custom sample corners matching the tilted document rectangle exactly
        this.corners = [
          { x: 195, y: 110 },  // TL
          { x: 885, y: 155 },  // TR
          { x: 825, y: 1195 }, // BR
          { x: 135, y: 1150 }  // BL
        ];

        this.renderSourceWithCorners();
        this.processStraightenAndFilter();
        this.initA4DocPlacement();

        const workspace = document.getElementById('waWorkspace');
        if (workspace) workspace.classList.remove('hidden');
      };
      img.src = URL.createObjectURL(blob);
    }, 'image/jpeg', 0.95);
  }
};

// UTIITSL & Protean (NSDL) PAN Card Photo & Signature Cropper & Resizer
// Compliant with strict Indian Income Tax PAN Portal specifications:
// Photo: 213 x 213 px, 300 DPI, < 30KB
// Signature: 400 x 200 px, 600 DPI, < 60KB

class PanCardResizer {
  constructor() {
    this.sourceImage = null;
    this.mode = "photo"; // 'photo', 'signature', 'custom'

    // Preset configurations
    this.presets = {
      photo: {
        width: 213,
        height: 213,
        dpi: 300,
        maxKb: 30,
        label: "NSDL / UTI Photo (213 x 213 px, < 30 KB)",
        filenamePrefix: "PAN_Photo_213x213"
      },
      signature: {
        width: 400,
        height: 200,
        dpi: 600,
        maxKb: 60,
        label: "NSDL / UTI Signature (400 x 200 px, < 60 KB)",
        filenamePrefix: "PAN_Signature_400x200"
      },
      custom: {
        width: 200,
        height: 200,
        dpi: 300,
        maxKb: 50,
        label: "Custom Dimension & File Size",
        filenamePrefix: "Custom_Portal_Image"
      }
    };

    this.currentWidth = 213;
    this.currentHeight = 213;
    this.maxKb = 30;
    this.zoom = 1.0;
    this.rotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Filter controls
    this.brightness = 0;
    this.contrast = 0;
    this.isCleanSignature = false; // B&W high contrast mode

    // Output state
    this.currentBlob = null;
    this.currentSizeKb = 0;

    this.canvas = document.getElementById("pan-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;

    this.initEventListeners();
    this.loadSample();
  }

  initEventListeners() {
    const fileInput = document.getElementById("pan-file-input");
    const dropZone = document.getElementById("pan-dropzone");
    const sampleBtn = document.getElementById("pan-sample-btn");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-emerald-500", "bg-emerald-50");
      });
      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("border-emerald-500", "bg-emerald-50");
      });
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-emerald-500", "bg-emerald-50");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (sampleBtn) {
      sampleBtn.addEventListener("click", () => this.loadSample(true));
    }

    // Preset selector buttons
    document.querySelectorAll("[data-pan-preset]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-pan-preset]").forEach(b => {
          b.classList.remove("border-emerald-600", "bg-emerald-50", "text-emerald-800", "ring-2", "ring-emerald-500");
          b.classList.add("border-gray-200", "bg-white", "text-gray-700");
        });
        btn.classList.remove("border-gray-200", "bg-white", "text-gray-700");
        btn.classList.add("border-emerald-600", "bg-emerald-50", "text-emerald-800", "ring-2", "ring-emerald-500");

        const presetKey = btn.getAttribute("data-pan-preset");
        this.setPreset(presetKey);
      });
    });

    // Custom dimension inputs
    const customW = document.getElementById("pan-custom-w");
    const customH = document.getElementById("pan-custom-h");
    const customKb = document.getElementById("pan-custom-kb");

    [customW, customH, customKb].forEach(inp => {
      if (inp) {
        inp.addEventListener("input", () => {
          if (this.mode === "custom") {
            this.currentWidth = parseInt(customW.value, 10) || 200;
            this.currentHeight = parseInt(customH.value, 10) || 200;
            this.maxKb = parseInt(customKb.value, 10) || 50;
            this.render();
          }
        });
      }
    });

    // Canvas Pan Events
    if (this.canvas) {
      this.canvas.addEventListener("mousedown", (e) => {
        if (!this.sourceImage) return;
        this.isDragging = true;
        this.startX = e.clientX - this.offsetX;
        this.startY = e.clientY - this.offsetY;
        this.canvas.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", (e) => {
        if (!this.isDragging) return;
        this.offsetX = e.clientX - this.startX;
        this.offsetY = e.clientY - this.startY;
        this.render();
      });

      window.addEventListener("mouseup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          if (this.canvas) this.canvas.style.cursor = "grab";
        }
      });

      // Mobile Touch Events
      this.canvas.addEventListener("touchstart", (e) => {
        if (!this.sourceImage || e.touches.length !== 1) return;
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.offsetX;
        this.startY = e.touches[0].clientY - this.offsetY;
      }, { passive: true });

      this.canvas.addEventListener("touchmove", (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        this.offsetX = e.touches[0].clientX - this.startX;
        this.offsetY = e.touches[0].clientY - this.startY;
        this.render();
      }, { passive: true });

      this.canvas.addEventListener("touchend", () => {
        this.isDragging = false;
      });

      // Wheel Zoom
      this.canvas.addEventListener("wheel", (e) => {
        if (!this.sourceImage) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        this.zoom = Math.max(0.2, Math.min(4.0, this.zoom + delta));
        const slider = document.getElementById("pan-zoom-slider");
        if (slider) slider.value = Math.round(this.zoom * 100);
        this.render();
      });
    }

    // Zoom slider
    const zoomSlider = document.getElementById("pan-zoom-slider");
    if (zoomSlider) {
      zoomSlider.addEventListener("input", (e) => {
        this.zoom = parseFloat(e.target.value) / 100;
        this.render();
      });
    }

    // Rotate
    const rotateBtn = document.getElementById("pan-rotate-btn");
    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        this.rotation = (this.rotation + 90) % 360;
        this.render();
      });
    }

    // Reset
    const resetBtn = document.getElementById("pan-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetTransforms());
    }

    // Filters
    const bSlider = document.getElementById("pan-brightness");
    if (bSlider) {
      bSlider.addEventListener("input", (e) => {
        this.brightness = parseInt(e.target.value, 10);
        this.render();
      });
    }

    const cSlider = document.getElementById("pan-contrast");
    if (cSlider) {
      cSlider.addEventListener("input", (e) => {
        this.contrast = parseInt(e.target.value, 10);
        this.render();
      });
    }

    const cleanSigCheckbox = document.getElementById("pan-clean-signature");
    if (cleanSigCheckbox) {
      cleanSigCheckbox.addEventListener("change", (e) => {
        this.isCleanSignature = e.target.checked;
        this.render();
      });
    }

    // Download Button
    const downloadBtn = document.getElementById("pan-download-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => this.downloadImage());
    }
  }

  setPreset(presetKey) {
    this.mode = presetKey;
    const config = this.presets[presetKey];
    this.currentWidth = config.width;
    this.currentHeight = config.height;
    this.maxKb = config.maxKb;

    const customControls = document.getElementById("pan-custom-controls");
    if (customControls) {
      if (presetKey === "custom") {
        customControls.classList.remove("hidden");
      } else {
        customControls.classList.add("hidden");
      }
    }

    const cleanSigContainer = document.getElementById("pan-clean-sig-container");
    const cleanSigCheckbox = document.getElementById("pan-clean-signature");
    if (cleanSigContainer) {
      if (presetKey === "signature") {
        cleanSigContainer.classList.remove("hidden");
        if (cleanSigCheckbox) {
          cleanSigCheckbox.checked = true;
          this.isCleanSignature = true;
        }
      } else {
        if (cleanSigCheckbox) {
          cleanSigCheckbox.checked = false;
          this.isCleanSignature = false;
        }
      }
    }

    this.resetTransforms();
    this.loadSample();
  }

  resetTransforms() {
    this.zoom = 1.0;
    this.rotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.brightness = 0;
    this.contrast = 0;

    const zoomSlider = document.getElementById("pan-zoom-slider");
    if (zoomSlider) zoomSlider.value = 100;

    const bSlider = document.getElementById("pan-brightness");
    if (bSlider) bSlider.value = 0;

    const cSlider = document.getElementById("pan-contrast");
    if (cSlider) cSlider.value = 0;

    if (this.sourceImage) {
      const scale = Math.max(this.currentWidth / this.sourceImage.width, this.currentHeight / this.sourceImage.height);
      this.zoom = scale * 1.05;
      if (zoomSlider) zoomSlider.value = Math.round(this.zoom * 100);
    }
  }

  loadFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        this.resetTransforms();
        this.render();
        window.showToast("Image loaded into PAN Resizer!");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadSample(userTriggered = false) {
    if (this.mode === "signature") {
      // Create sample realistic signature
      const sigCanvas = document.createElement("canvas");
      sigCanvas.width = 600;
      sigCanvas.height = 300;
      const sCtx = sigCanvas.getContext("2d");

      // White paper
      sCtx.fillStyle = "#ffffff";
      sCtx.fillRect(0, 0, 600, 300);

      // Dark blue ink signature curve
      sCtx.strokeStyle = "#0f172a";
      sCtx.lineWidth = 6;
      sCtx.lineCap = "round";
      sCtx.lineJoin = "round";

      sCtx.beginPath();
      sCtx.moveTo(80, 180);
      sCtx.bezierCurveTo(120, 80, 160, 240, 210, 140);
      sCtx.bezierCurveTo(240, 90, 270, 210, 310, 160);
      sCtx.bezierCurveTo(340, 120, 370, 190, 420, 150);
      sCtx.stroke();

      // Flourish loop
      sCtx.beginPath();
      sCtx.moveTo(420, 150);
      sCtx.quadraticCurveTo(500, 100, 520, 180);
      sCtx.quadraticCurveTo(460, 240, 360, 220);
      sCtx.lineTo(540, 220);
      sCtx.stroke();

      // Dot
      sCtx.beginPath();
      sCtx.arc(545, 205, 4, 0, Math.PI * 2);
      sCtx.fill();

      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        this.resetTransforms();
        this.render();
        if (userTriggered) window.showToast("Sample Signature loaded!");
      };
      img.src = sigCanvas.toDataURL("image/jpeg", 0.95);
    } else {
      // Sample photo
      const photoCanvas = document.createElement("canvas");
      photoCanvas.width = 400;
      photoCanvas.height = 400;
      const pCtx = photoCanvas.getContext("2d");

      pCtx.fillStyle = "#e2e8f0";
      pCtx.fillRect(0, 0, 400, 400);

      // Shoulders
      pCtx.fillStyle = "#334155";
      pCtx.beginPath();
      pCtx.ellipse(200, 410, 160, 130, 0, 0, Math.PI * 2);
      pCtx.fill();

      // Neck
      pCtx.fillStyle = "#e2a77c";
      pCtx.fillRect(175, 260, 50, 80);

      // Head
      pCtx.fillStyle = "#f3b993";
      pCtx.beginPath();
      pCtx.ellipse(200, 190, 85, 110, 0, 0, Math.PI * 2);
      pCtx.fill();

      // Hair
      pCtx.fillStyle = "#1e293b";
      pCtx.beginPath();
      pCtx.ellipse(200, 125, 90, 65, 0, 0, Math.PI);
      pCtx.fill();

      // Eyes
      pCtx.fillStyle = "#0f172a";
      pCtx.beginPath();
      pCtx.arc(170, 185, 6, 0, Math.PI * 2);
      pCtx.arc(230, 185, 6, 0, Math.PI * 2);
      pCtx.fill();

      // Smile
      pCtx.strokeStyle = "#b91c1c";
      pCtx.lineWidth = 3;
      pCtx.beginPath();
      pCtx.arc(200, 230, 22, 0.15 * Math.PI, 0.85 * Math.PI, false);
      pCtx.stroke();

      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        this.resetTransforms();
        this.render();
        if (userTriggered) window.showToast("Sample PAN Photo loaded!");
      };
      img.src = photoCanvas.toDataURL("image/jpeg", 0.95);
    }
  }

  render() {
    if (!this.sourceImage || !this.canvas || !this.ctx) return;

    this.canvas.width = this.currentWidth;
    this.canvas.height = this.currentHeight;

    // Fill background
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.currentWidth, this.currentHeight);

    this.ctx.save();

    // Filters
    let filterStr = "";
    if (this.brightness !== 0) filterStr += `brightness(${100 + this.brightness}%) `;
    if (this.contrast !== 0) filterStr += `contrast(${100 + this.contrast}%) `;
    this.ctx.filter = filterStr.trim() || "none";

    // Transformations
    this.ctx.translate(this.currentWidth / 2 + this.offsetX, this.currentHeight / 2 + this.offsetY);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    this.ctx.scale(this.zoom, this.zoom);

    this.ctx.drawImage(
      this.sourceImage,
      -this.sourceImage.width / 2,
      -this.sourceImage.height / 2
    );

    this.ctx.restore();

    // Apply clean signature binarization / threshold if enabled
    if (this.isCleanSignature && this.mode === "signature") {
      this.applySignatureThreshold(this.ctx);
    }

    // Calculate real-time binary compressed size and update gauge
    this.compressAndGauge();
  }

  applySignatureThreshold(ctx) {
    try {
      const imgData = ctx.getImageData(0, 0, this.currentWidth, this.currentHeight);
      const data = imgData.data;

      // Convert scanned grey paper to clean white, and ink to dark navy/black
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum > 175) {
          // Clean white background
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else {
          // Sharp dark blue/black ink
          const factor = lum / 175;
          data[i] = Math.round(15 * factor);
          data[i + 1] = Math.round(23 * factor);
          data[i + 2] = Math.round(42 * factor);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn("Signature threshold skipped:", e);
    }
  }

  async compressAndGauge() {
    if (!this.canvas) return;

    // Iterative binary search to find maximum JPEG quality that is strictly <= this.maxKb
    let minQ = 0.1;
    let maxQ = 0.98;
    let bestBlob = null;
    let bestSizeKb = 0;

    for (let iter = 0; iter < 6; iter++) {
      const midQ = (minQ + maxQ) / 2;
      const blob = await new Promise(resolve => this.canvas.toBlob(resolve, "image/jpeg", midQ));
      const sizeKb = blob.size / 1024;

      if (sizeKb <= this.maxKb) {
        bestBlob = blob;
        bestSizeKb = sizeKb;
        minQ = midQ; // Try higher quality
      } else {
        maxQ = midQ; // Reduce quality
      }
    }

    // Fallback if even lowest quality was slightly above (e.g. extremely noisy image)
    if (!bestBlob) {
      bestBlob = await new Promise(resolve => this.canvas.toBlob(resolve, "image/jpeg", 0.1));
      bestSizeKb = bestBlob.size / 1024;
    }

    this.currentBlob = bestBlob;
    this.currentSizeKb = bestSizeKb;

    // Update UI Gauge
    this.updateGaugeUI();
  }

  updateGaugeUI() {
    const sizeValEl = document.getElementById("pan-size-val");
    const gaugeBar = document.getElementById("pan-gauge-bar");
    const statusBadge = document.getElementById("pan-status-badge");
    const dimValEl = document.getElementById("pan-dim-val");

    if (dimValEl) {
      dimValEl.textContent = `${this.currentWidth} ? ${this.currentHeight} px`;
    }

    if (sizeValEl) {
      sizeValEl.textContent = `${this.currentSizeKb.toFixed(1)} KB / Max ${this.maxKb} KB`;
    }

    if (gaugeBar) {
      const pct = Math.min(100, Math.round((this.currentSizeKb / this.maxKb) * 100));
      gaugeBar.style.width = `${pct}%`;

      if (this.currentSizeKb <= this.maxKb) {
        gaugeBar.className = "h-2.5 rounded-full bg-emerald-500 transition-all duration-300";
      } else {
        gaugeBar.className = "h-2.5 rounded-full bg-red-500 transition-all duration-300";
      }
    }

    if (statusBadge) {
      if (this.currentSizeKb <= this.maxKb) {
        statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Compliant with Portal Specs (< ${this.maxKb} KB)</span>`;
      } else {
        statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Exceeds ${this.maxKb} KB Limit</span>`;
      }
    }
  }

  downloadImage() {
    if (!this.currentBlob) return;

    const prefix = this.presets[this.mode] ? this.presets[this.mode].filenamePrefix : "PAN_Image";
    const url = URL.createObjectURL(this.currentBlob);
    const link = document.createElement("a");
    link.download = `${prefix}_${this.currentWidth}x${this.currentHeight}_${Date.now()}.jpg`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.showToast("Resized & Compressed image downloaded!");
  }
}

window.PanCardResizer = PanCardResizer;

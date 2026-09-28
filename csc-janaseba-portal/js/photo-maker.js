// Passport Photo Maker for CSC Janaseba Kendra
// Generates 35x45mm passport photos and 4x6 inch print-ready grids (6 or 8 photos)

class PassportPhotoMaker {
  constructor() {
    this.sourceImage = null;
    this.zoom = 1.0;
    this.rotation = 0; // degrees
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Settings
    this.bgColor = "original"; // 'original', '#ffffff', '#7eb0d5', '#e5e7eb', '#1e3a8a'
    this.borderType = "thin-black"; // 'none', 'thin-black', 'white-margin'
    this.sheetLayout = "6"; // '6' or '8' photos
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;

    // Canvas references
    this.cropCanvas = document.getElementById("passport-crop-canvas");
    this.cropCtx = this.cropCanvas ? this.cropCanvas.getContext("2d") : null;
    this.sheetCanvas = document.getElementById("passport-sheet-canvas");
    this.sheetCtx = this.sheetCanvas ? this.sheetCanvas.getContext("2d") : null;

    // Single photo resolution: 35mm x 45mm @ 300 DPI = ~413 x 531 px
    this.PHOTO_W = 413;
    this.PHOTO_H = 531;

    // 4x6 inch sheet @ 300 DPI = 1200 x 1800 px (Portrait) or 1800 x 1200 px (Landscape)
    this.SHEET_W = 1800;
    this.SHEET_H = 1200;

    this.initEventListeners();
    this.loadSamplePhoto(); // Load demo placeholder so VLE immediately sees working tool
  }

  initEventListeners() {
    const fileInput = document.getElementById("passport-file-input");
    const dropZone = document.getElementById("passport-dropzone");
    const sampleBtn = document.getElementById("passport-sample-btn");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadImageFile(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-blue-500", "bg-blue-50");
      });
      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("border-blue-500", "bg-blue-50");
      });
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-blue-500", "bg-blue-50");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.loadImageFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (sampleBtn) {
      sampleBtn.addEventListener("click", () => this.loadSamplePhoto(true));
    }

    // Canvas Pan Events
    if (this.cropCanvas) {
      this.cropCanvas.addEventListener("mousedown", (e) => {
        if (!this.sourceImage) return;
        this.isDragging = true;
        this.startX = e.clientX - this.offsetX;
        this.startY = e.clientY - this.offsetY;
        this.cropCanvas.style.cursor = "grabbing";
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
          if (this.cropCanvas) this.cropCanvas.style.cursor = "grab";
        }
      });

      // Touch events for mobile responsiveness
      this.cropCanvas.addEventListener("touchstart", (e) => {
        if (!this.sourceImage || e.touches.length !== 1) return;
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.offsetX;
        this.startY = e.touches[0].clientY - this.offsetY;
      }, { passive: true });

      this.cropCanvas.addEventListener("touchmove", (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        this.offsetX = e.touches[0].clientX - this.startX;
        this.offsetY = e.touches[0].clientY - this.startY;
        this.render();
      }, { passive: true });

      this.cropCanvas.addEventListener("touchend", () => {
        this.isDragging = false;
      });

      // Wheel zoom
      this.cropCanvas.addEventListener("wheel", (e) => {
        if (!this.sourceImage) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        this.setZoom(Math.max(0.4, Math.min(3.0, this.zoom + delta)));
        const zoomSlider = document.getElementById("passport-zoom-slider");
        if (zoomSlider) zoomSlider.value = Math.round(this.zoom * 100);
      });
    }

    // Controls
    const zoomSlider = document.getElementById("passport-zoom-slider");
    if (zoomSlider) {
      zoomSlider.addEventListener("input", (e) => {
        this.setZoom(parseFloat(e.target.value) / 100);
      });
    }

    const rotateBtn = document.getElementById("passport-rotate-btn");
    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        this.rotation = (this.rotation + 90) % 360;
        this.render();
      });
    }

    const resetBtn = document.getElementById("passport-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetTransforms());
    }

    // Background selection
    document.querySelectorAll("[data-passport-bg]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll("[data-passport-bg]").forEach(b => b.classList.remove("ring-2", "ring-blue-600", "ring-offset-2"));
        btn.classList.add("ring-2", "ring-blue-600", "ring-offset-2");
        this.bgColor = btn.getAttribute("data-passport-bg");
        this.render();
      });
    });

    // Border selection
    const borderSelect = document.getElementById("passport-border-select");
    if (borderSelect) {
      borderSelect.addEventListener("change", (e) => {
        this.borderType = e.target.value;
        this.render();
      });
    }

    // Sheet layout selection (6 or 8 photos)
    document.querySelectorAll("[data-sheet-layout]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-sheet-layout]").forEach(b => {
          b.classList.remove("bg-blue-600", "text-white");
          b.classList.add("bg-gray-100", "text-gray-700");
        });
        btn.classList.remove("bg-gray-100", "text-gray-700");
        btn.classList.add("bg-blue-600", "text-white");
        this.sheetLayout = btn.getAttribute("data-sheet-layout");
        this.render();
      });
    });

    // Image Adjustments (Brightness, Contrast, Saturation)
    ["brightness", "contrast", "saturation"].forEach(adj => {
      const slider = document.getElementById(`passport-${adj}`);
      if (slider) {
        slider.addEventListener("input", (e) => {
          this[adj] = parseInt(e.target.value, 10);
          this.render();
        });
      }
    });

    // Export Buttons
    const downloadSheetBtn = document.getElementById("download-4x6-sheet-btn");
    if (downloadSheetBtn) {
      downloadSheetBtn.addEventListener("click", () => this.downloadSheet());
    }

    const downloadSingleBtn = document.getElementById("download-single-photo-btn");
    if (downloadSingleBtn) {
      downloadSingleBtn.addEventListener("click", () => this.downloadSinglePhoto());
    }

    const printBtn = document.getElementById("print-4x6-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => this.printDirectly());
    }
  }

  setZoom(val) {
    this.zoom = val;
    const zoomText = document.getElementById("passport-zoom-val");
    if (zoomText) zoomText.textContent = `${Math.round(this.zoom * 100)}%`;
    this.render();
  }

  resetTransforms() {
    this.zoom = 1.0;
    this.rotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;

    const zoomSlider = document.getElementById("passport-zoom-slider");
    if (zoomSlider) zoomSlider.value = 100;
    const zoomText = document.getElementById("passport-zoom-val");
    if (zoomText) zoomText.textContent = "100%";

    ["brightness", "contrast", "saturation"].forEach(adj => {
      const slider = document.getElementById(`passport-${adj}`);
      if (slider) slider.value = 0;
    });

    this.render();
  }

  loadImageFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        this.resetTransforms();
        // Auto-fit
        const scale = Math.max(this.PHOTO_W / img.width, this.PHOTO_H / img.height);
        this.zoom = scale * 1.1;
        const zoomSlider = document.getElementById("passport-zoom-slider");
        if (zoomSlider) zoomSlider.value = Math.round(this.zoom * 100);
        this.render();
        window.showToast("Citizen photo loaded successfully!");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadSamplePhoto(userTriggered = false) {
    // Generate an illustrative sample passport profile on canvas
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 600;
    sampleCanvas.height = 750;
    const sCtx = sampleCanvas.getContext("2d");

    // Soft neutral studio background
    const bgGrad = sCtx.createLinearGradient(0, 0, 0, 750);
    bgGrad.addColorStop(0, "#cbd5e1");
    bgGrad.addColorStop(1, "#94a3b8");
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, 600, 750);

    // Body / Suit
    sCtx.fillStyle = "#1e293b";
    sCtx.beginPath();
    sCtx.ellipse(300, 670, 240, 180, 0, 0, Math.PI * 2);
    sCtx.fill();

    // White Shirt collar
    sCtx.fillStyle = "#ffffff";
    sCtx.beginPath();
    sCtx.moveTo(250, 520);
    sCtx.lineTo(300, 590);
    sCtx.lineTo(350, 520);
    sCtx.lineTo(300, 620);
    sCtx.closePath();
    sCtx.fill();

    // Tie
    sCtx.fillStyle = "#b91c1c";
    sCtx.beginPath();
    sCtx.moveTo(290, 580);
    sCtx.lineTo(310, 580);
    sCtx.lineTo(320, 690);
    sCtx.lineTo(300, 720);
    sCtx.lineTo(280, 690);
    sCtx.closePath();
    sCtx.fill();

    // Neck
    sCtx.fillStyle = "#e2a77c";
    sCtx.fillRect(265, 430, 70, 110);

    // Head
    sCtx.fillStyle = "#f3b993";
    sCtx.beginPath();
    sCtx.ellipse(300, 340, 115, 145, 0, 0, Math.PI * 2);
    sCtx.fill();

    // Hair
    sCtx.fillStyle = "#1c1917";
    sCtx.beginPath();
    sCtx.ellipse(300, 260, 125, 90, 0, 0, Math.PI);
    sCtx.fill();

    // Eyes
    sCtx.fillStyle = "#374151";
    sCtx.beginPath();
    sCtx.arc(260, 335, 9, 0, Math.PI * 2);
    sCtx.arc(340, 335, 9, 0, Math.PI * 2);
    sCtx.fill();

    // Eyebrows
    sCtx.strokeStyle = "#1c1917";
    sCtx.lineWidth = 5;
    sCtx.beginPath();
    sCtx.moveTo(242, 318);
    sCtx.quadraticCurveTo(260, 310, 278, 318);
    sCtx.moveTo(322, 318);
    sCtx.quadraticCurveTo(340, 310, 358, 318);
    sCtx.stroke();

    // Gentle Smile
    sCtx.strokeStyle = "#991b1b";
    sCtx.lineWidth = 4;
    sCtx.beginPath();
    sCtx.arc(300, 395, 30, 0.15 * Math.PI, 0.85 * Math.PI, false);
    sCtx.stroke();

    const img = new Image();
    img.onload = () => {
      this.sourceImage = img;
      this.resetTransforms();
      this.render();
      if (userTriggered) window.showToast("Sample passport photo loaded!");
    };
    img.src = sampleCanvas.toDataURL("image/jpeg", 0.95);
  }

  applyImageFilters(ctx) {
    let filterStr = "";
    if (this.brightness !== 0) filterStr += `brightness(${100 + this.brightness}%) `;
    if (this.contrast !== 0) filterStr += `contrast(${100 + this.contrast}%) `;
    if (this.saturation !== 0) filterStr += `saturate(${100 + this.saturation}%) `;
    ctx.filter = filterStr.trim() || "none";
  }

  render() {
    if (!this.sourceImage || !this.cropCanvas || !this.cropCtx) return;

    this.cropCanvas.width = this.PHOTO_W;
    this.cropCanvas.height = this.PHOTO_H;

    // Clear Canvas
    this.cropCtx.clearRect(0, 0, this.PHOTO_W, this.PHOTO_H);

    // Apply background color if selected
    if (this.bgColor !== "original") {
      this.cropCtx.fillStyle = this.bgColor;
      this.cropCtx.fillRect(0, 0, this.PHOTO_W, this.PHOTO_H);
    }

    // Draw transformed image
    this.cropCtx.save();
    this.applyImageFilters(this.cropCtx);

    // Move to center of canvas + pan offsets
    this.cropCtx.translate(this.PHOTO_W / 2 + this.offsetX, this.PHOTO_H / 2 + this.offsetY);
    this.cropCtx.rotate((this.rotation * Math.PI) / 180);
    this.cropCtx.scale(this.zoom, this.zoom);

    // Draw centered
    this.cropCtx.drawImage(
      this.sourceImage,
      -this.sourceImage.width / 2,
      -this.sourceImage.height / 2
    );

    this.cropCtx.restore();

    // Background tint replacement blending if not original
    if (this.bgColor !== "original") {
      this.applySmartBgEnhancement(this.cropCtx);
    }

    // Border handling
    if (this.borderType === "thin-black") {
      this.cropCtx.strokeStyle = "#1e293b";
      this.cropCtx.lineWidth = 3;
      this.cropCtx.strokeRect(1.5, 1.5, this.PHOTO_W - 3, this.PHOTO_H - 3);
    } else if (this.borderType === "white-margin") {
      this.cropCtx.strokeStyle = "#ffffff";
      this.cropCtx.lineWidth = 14;
      this.cropCtx.strokeRect(7, 7, this.PHOTO_W - 14, this.PHOTO_H - 14);
      this.cropCtx.strokeStyle = "#cbd5e1";
      this.cropCtx.lineWidth = 1;
      this.cropCtx.strokeRect(1, 1, this.PHOTO_W - 2, this.PHOTO_H - 2);
    }

    // Render 4x6 Sheet layout
    this.renderSheet();
  }

  applySmartBgEnhancement(ctx) {
    // If background tint chosen, enhance top corner pixels to create smooth uniform studio backdrop
    try {
      const imgData = ctx.getImageData(0, 0, this.PHOTO_W, this.PHOTO_H);
      const data = imgData.data;

      let rTarget = 255, gTarget = 255, bTarget = 255;
      if (this.bgColor === "#7eb0d5") { rTarget = 126; gTarget = 176; bTarget = 213; }
      else if (this.bgColor === "#e5e7eb") { rTarget = 229; gTarget = 231; bTarget = 235; }
      else if (this.bgColor === "#1e3a8a") { rTarget = 30; gTarget = 58; bTarget = 138; }

      // Check top 25% of background where head silhouette usually isn't in outer thirds
      for (let y = 0; y < this.PHOTO_H * 0.45; y++) {
        for (let x = 0; x < this.PHOTO_W; x++) {
          // Distance from horizontal center
          const distFromCenter = Math.abs(x - this.PHOTO_W / 2);
          if (distFromCenter > 110 || y < 65) {
            const idx = (y * this.PHOTO_W + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r + g + b) / 3;

            // If background is light or similar to studio backdrop, tint towards selected color
            if (brightness > 130) {
              const blend = Math.min(1.0, (brightness - 130) / 70);
              data[idx] = Math.round(r * (1 - blend) + rTarget * blend);
              data[idx + 1] = Math.round(g * (1 - blend) + gTarget * blend);
              data[idx + 2] = Math.round(b * (1 - blend) + bTarget * blend);
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn("Pixel data manipulation skipped due to cross-origin or local security:", e);
    }
  }

  renderSheet() {
    if (!this.sheetCanvas || !this.sheetCtx || !this.cropCanvas) return;

    // 4x6 Sheet in Landscape (1800 x 1200 px at 300 DPI)
    this.sheetCanvas.width = this.SHEET_W;
    this.sheetCanvas.height = this.SHEET_H;

    // Clean white photo glossy paper background
    this.sheetCtx.fillStyle = "#ffffff";
    this.sheetCtx.fillRect(0, 0, this.SHEET_W, this.SHEET_H);

    const count = parseInt(this.sheetLayout, 10); // 6 or 8

    if (count === 6) {
      // 2 rows of 3 columns
      const cols = 3;
      const rows = 2;
      const photoW = 413;
      const photoH = 531;

      const totalPhotosW = cols * photoW;
      const totalPhotosH = rows * photoH;
      const startX = (this.SHEET_W - totalPhotosW) / (cols + 1);
      const startY = (this.SHEET_H - totalPhotosH) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * (photoW + startX);
          const y = startY + r * (photoH + startY);

          // Draw passport photo
          this.sheetCtx.drawImage(this.cropCanvas, x, y, photoW, photoH);

          // Draw cutting guide dotted lines
          this.drawCuttingMarks(this.sheetCtx, x, y, photoW, photoH);
        }
      }
    } else {
      // 8 photos (2 rows of 4 columns, slightly scaled to fit comfortably on 1800x1200)
      const cols = 4;
      const rows = 2;
      const photoW = 390;
      const photoH = 501;

      const marginX = (this.SHEET_W - cols * photoW) / (cols + 1);
      const marginY = (this.SHEET_H - rows * photoH) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = marginX + c * (photoW + marginX);
          const y = marginY + r * (photoH + marginY);

          this.sheetCtx.drawImage(this.cropCanvas, x, y, photoW, photoH);
          this.drawCuttingMarks(this.sheetCtx, x, y, photoW, photoH);
        }
      }
    }

    // Small footer watermark for VLE
    this.sheetCtx.fillStyle = "#94a3b8";
    this.sheetCtx.font = "16px sans-serif";
    this.sheetCtx.textAlign = "center";
    this.sheetCtx.fillText("Printed by CSC Janaseba Kendra ? 4x6 Photo Glossy Paper ? Standard 35x45mm Passport Size", this.SHEET_W / 2, this.SHEET_H - 12);
  }

  drawCuttingMarks(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Outer cutting guide marks (extend 15px outside corners)
    const len = 15;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(x - len, y); ctx.lineTo(x, y);
    ctx.moveTo(x, y - len); ctx.lineTo(x, y);
    // Top-right
    ctx.moveTo(x + w, y); ctx.lineTo(x + w + len, y);
    ctx.moveTo(x + w, y - len); ctx.lineTo(x + w, y);
    // Bottom-left
    ctx.moveTo(x - len, y + h); ctx.lineTo(x, y + h);
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + h + len);
    // Bottom-right
    ctx.moveTo(x + w, y + h); ctx.lineTo(x + w + len, y + h);
    ctx.moveTo(x + w, y + h); ctx.lineTo(x + w, y + h + len);
    ctx.stroke();

    ctx.restore();
  }

  downloadSheet() {
    if (!this.sheetCanvas) return;
    const link = document.createElement("a");
    link.download = `Passport_4x6_${this.sheetLayout}_Photos_${Date.now()}.jpg`;
    link.href = this.sheetCanvas.toDataURL("image/jpeg", 0.95);
    link.click();
    window.showToast("4x6 Print Sheet downloaded successfully!");
  }

  downloadSinglePhoto() {
    if (!this.cropCanvas) return;
    const link = document.createElement("a");
    link.download = `Passport_35x45mm_${Date.now()}.jpg`;
    link.href = this.cropCanvas.toDataURL("image/jpeg", 0.95);
    link.click();
    window.showToast("Single 35x45mm photo downloaded!");
  }

  printDirectly() {
    if (!this.sheetCanvas) return;
    const dataUrl = this.sheetCanvas.toDataURL("image/jpeg", 0.98);
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Passport 4x6 Sheet</title>
        <style>
          @page {
            size: 6in 4in landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
          img {
            width: 6in;
            height: 4in;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print();window.close();" />
      </body>
      </html>
    `);
    win.document.close();
  }
}

window.PassportPhotoMaker = PassportPhotoMaker;

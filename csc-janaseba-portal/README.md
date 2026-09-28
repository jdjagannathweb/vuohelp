# CSC / Janaseba Kendra (VLE) Portal & Master Admin Suite

A modern, fast, and privacy-first web application designed specifically for Common Services Center (CSC) and Janaseba Kendra (VLE) operators across India.

---

## 🌟 Key Features

### 1. 📷 Passport Photo Maker (35 × 45 mm)
- **Automatic Crop & Ratio**: Centers citizen portrait to exact 35 × 45 mm standard.
- **Background Changer**: One-click Studio White, Indian Standard Sky Blue, Soft Grey, or original.
- **Print-Ready 4x6 Sheet**: Exports 6 or 8 photos with dotted cutting lines on standard glossy paper.
- **Direct Print & JPG Download**: Zero lag, 100% in-browser processing.

### 2. 🪪 UTIITSL & Protean (NSDL) PAN Resizer
- **Photo Mode**: Exact 213 × 213 px, 300 DPI, strictly `< 30 KB`.
- **Signature Mode**: Exact 400 × 200 px (2:1), 600 DPI, strictly `< 60 KB`.
- **B&W Signature Enhancer**: Strips paper shadows and boosts contrast for pure dark ink on white background.
- **Live Size Gauge**: Real-time KB readout with green compliance badge.

### 3. 📄 Client-Side PDF Toolkit
- **Merge PDFs**: Combine multi-page citizen documents.
- **Compress PDF (< 200KB / < 100KB)**: Meets rigid state portal file size constraints.
- **Image to PDF**: Converts Aadhaar / PAN / marksheet scans to clean A4 PDFs.
- **Split PDF**: Extract specific page ranges.

### 4. 📚 Offline Forms Library
- 10+ categorized government application forms (Caste, Income, Residence, Ration Card, Land Mutation, Old Age Pension, PM-Kisan eKYC, Bank KYC).
- Includes required document checklists and printable blank application templates with VLE stamp areas.

### 5. 📢 Sarkari Job & Scheme Updates
- Filterable updates for PM Surya Ghar, Subhadra Yojana, PM Vishwakarma, SSC GD, Railway RRB, and state police.
- **1-Click WhatsApp Notice**: Formats scheme details with emojis, eligibility, and Kendra details for village broadcast groups.

### 6. 👥 Citizen Lead Tracker (CRM)
- Record citizen inquiries (Name, Mobile, Service, Fee, Status).
- 1-click WhatsApp citizen notification.
- Export entire register to CSV / Excel.

### 7. 🔐 Master Admin Portal (`admin.html`)
- **Protected by Security PIN** (Default: `1234`).
- **Daily Cash Ledger (Rojnamcha / Day Book)**: Counter cash, AEPS withdrawals, photo printing revenue, and operating expenses with CSV export.
- **Dynamic Pricing Editor**: Edit VLE convenience fees in real-time; auto-syncs to public rate cards and printable receipts.
- **Operator / Staff Management**: Add and track center operators and daily shifts.
- **1-Click Database Backup & Restore**: Export or import full JSON backups.

---

## 🚀 How to Run

1. **Local Server (Active now)**:
   - Main Operator Portal: [http://localhost:8080](http://localhost:8080)
   - Master Admin Portal: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

2. **To restart server manually anytime**:
   ```bash
   cd C:\Users\Jagannath\.gemini\antigravity\scratch\csc-janaseba-portal
   python -m http.server 8080
   ```

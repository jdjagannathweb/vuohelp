// Offline Forms Library Database for CSC / Janaseba Kendra
window.CSC_FORMS_DATA = [
  {
    id: "caste-cert",
    title: "Caste Certificate Application Form",
    hindiTitle: "???? ?????? ???? ????? ????",
    category: "Certificates",
    department: "Revenue & Disaster Management / Tehsildar Office",
    validity: "Life Time (SC/ST) / 3 Years (OBC-NCL/SEBC)",
    processingTime: "15 to 30 Days",
    govtFee: "?0 - ?30 (Nominal VLE fee)",
    summary: "Standard application format for issuance of Scheduled Caste (SC), Scheduled Tribe (ST), OBC, and SEBC caste certificates.",
    docsRequired: [
      "Aadhaar Card of Applicant & Father",
      "Land Record (RoR / Khatiyan) showing caste identity",
      "School Leaving Certificate (SLC) / Transfer Certificate",
      "Self-Declaration Affidavit",
      "2 Passport Size Photographs"
    ],
    fields: [
      { id: "applicant_name", label: "Applicant Full Name", type: "text", placeholder: "e.g. Ramesh Chandra Sahoo" },
      { id: "father_name", label: "Father's / Guardian's Name", type: "text", placeholder: "e.g. Bipin Chandra Sahoo" },
      { id: "category", label: "Category Applied For", type: "select", options: ["OBC (Non-Creamy Layer)", "SEBC", "SC (Scheduled Caste)", "ST (Scheduled Tribe)", "General - EWS"] },
      { id: "sub_caste", label: "Sub-Caste / Community", type: "text", placeholder: "e.g. Teli, Khandayat, Dhobi, Gond" },
      { id: "village", label: "Village / Ward / Mouza", type: "text", placeholder: "Village or Town Name" },
      { id: "panchayat", label: "Gram Panchayat / Municipality", type: "text", placeholder: "GP Name" },
      { id: "tehsil", label: "Tehsil / Block", type: "text", placeholder: "Tehsil Office" },
      { id: "district", label: "District", type: "text", placeholder: "District Name" },
      { id: "income", label: "Annual Family Income (?)", type: "number", placeholder: "e.g. 120000" }
    ]
  },
  {
    id: "income-cert",
    title: "Income Certificate Application Form",
    hindiTitle: "?? ?????? ???? ????? ????",
    category: "Certificates",
    department: "Revenue Department / Revenue Inspector (RI)",
    validity: "1 Financial Year (April - March)",
    processingTime: "7 to 15 Days",
    govtFee: "?0 - ?30",
    summary: "Official application to certify total annual family income from all sources (Agriculture, Business, Salary, Daily Wages) for scholarships and welfare schemes.",
    docsRequired: [
      "Aadhaar Card of Applicant & Family Head",
      "Salary Slip / Form 16 (for salaried persons) OR RI Field Enquiry Report",
      "Land Record (RoR / Khatiyan) for agriculture income proof",
      "Latest Electricity Bill (Residence Verification)",
      "Self-Declaration of Family Income"
    ],
    fields: [
      { id: "applicant_name", label: "Applicant Name", type: "text", placeholder: "Applicant's full name" },
      { id: "head_name", label: "Head of Family / Father's Name", type: "text", placeholder: "Father or Husband name" },
      { id: "agri_income", label: "Annual Agricultural Income (?)", type: "number", placeholder: "e.g. 50000" },
      { id: "other_income", label: "Annual Income from Other Sources (?)", type: "number", placeholder: "e.g. 70000" },
      { id: "total_income", label: "Total Annual Gross Income (?)", type: "number", placeholder: "e.g. 120000" },
      { id: "purpose", label: "Purpose of Certificate", type: "text", placeholder: "e.g. Scholarship / College Admission / Scheme" }
    ]
  },
  {
    id: "residence-cert",
    title: "Resident / Domicile Certificate Form",
    hindiTitle: "??????? ????? / ?????? ?????? ????",
    category: "Certificates",
    department: "Tehsil Office / District Magistrate",
    validity: "5 Years",
    processingTime: "10 to 20 Days",
    govtFee: "?0 - ?30",
    summary: "Application to prove continuous residence in state/district for 1+ year, mandatory for government recruitments.",
    docsRequired: [
      "Aadhaar Card with local address",
      "Land Record (RoR / Parcha) or House Tax Receipt",
      "Electricity Bill / Gas Book / Bank Passbook",
      "Voter ID Card or Ration Card copy",
      "School Leaving Certificate (SLC) / High School Certificate"
    ],
    fields: [
      { id: "applicant_name", label: "Applicant Name", type: "text", placeholder: "Full Name" },
      { id: "relation_name", label: "Father / Husband Name", type: "text", placeholder: "Relative Name" },
      { id: "residing_years", label: "Residing Continuously Since (Year)", type: "number", placeholder: "e.g. 2008" },
      { id: "present_address", label: "Present Address with PIN Code", type: "text", placeholder: "Complete Address" },
      { id: "permanent_address", label: "Permanent Address with PIN Code", type: "text", placeholder: "Permanent Address" }
    ]
  },
  {
    id: "ration-card",
    title: "New Ration Card (NFSA / SFSS) Form",
    hindiTitle: "??? ???? ????? ????? (????????? ????? ???????)",
    category: "Ration & Food",
    department: "Food Supplies & Consumer Welfare Department",
    validity: "Regular Bi-Monthly Allotment",
    processingTime: "30 to 45 Days",
    govtFee: "Free",
    summary: "Application for issuance of priority household (PHH) or Antyodaya Anna Yojana (AAY) ration card for subsidized food grains under National Food Security Act.",
    docsRequired: [
      "Aadhaar Cards of ALL family members",
      "Bank Passbook of Eldest Woman (Head of Family)",
      "Income Certificate (Under ?1,50,000 p.a.)",
      "No Ration Card Certificate / Surrender slip if migrated",
      "Recent Domestic LPG Connection Details",
      "Group Family Photograph or Woman Head Photo"
    ],
    fields: [
      { id: "woman_head", label: "Name of Woman Head of Household", type: "text", placeholder: "Eldest woman name" },
      { id: "husband_name", label: "Husband's / Father's Name", type: "text", placeholder: "Husband or Father" },
      { id: "members_count", label: "Total Family Members", type: "number", placeholder: "Total Count (e.g. 4)" },
      { id: "bank_details", label: "Bank Account No. & IFSC", type: "text", placeholder: "Aadhaar seeded bank details" },
      { id: "lpg_number", label: "LPG Consumer Number & Agency", type: "text", placeholder: "IOCL / HP / BPCL ID" }
    ]
  },
  {
    id: "ration-member",
    title: "Ration Card Member Addition / Surrender Form",
    hindiTitle: "???? ????? ??? ????? ?????? / ????? / ??????",
    category: "Ration & Food",
    department: "Civil Supplies / Block Supply Office (BSO)",
    validity: "Immediate upon Approval",
    processingTime: "15 to 25 Days",
    govtFee: "Free",
    summary: "Official form to add new bride / newborn child to family ration card, or remove a deceased or transferred member with proper surrender certificate.",
    docsRequired: [
      "Existing Ration Card (Original + Copy)",
      "For Newborn: Birth Certificate + Aadhaar Card",
      "For Marriage: Marriage Certificate + Surrender Slip from Parents' Card",
      "For Deletion: Death Certificate copy or Marriage proof"
    ],
    fields: [
      { id: "card_number", label: "Existing Ration Card Number", type: "text", placeholder: "12-digit Ration Card No." },
      { id: "head_name", label: "Head of Family Name", type: "text", placeholder: "Card Holder Name" },
      { id: "member_name", label: "Name of Member to Add / Delete", type: "text", placeholder: "Member Name" },
      { id: "action_type", label: "Action Type", type: "select", options: ["Addition of New Born Child", "Addition of Bride after Marriage", "Deletion due to Death", "Deletion due to Migration / Marriage"] }
    ]
  },
  {
    id: "land-mutation",
    title: "Land Mutation (Namantaran / RoR) Application",
    hindiTitle: "???? ???????? (?????-?????) ????? ????",
    category: "Revenue & Land",
    department: "Revenue & Disaster Management / Tehsildar Office",
    validity: "Permanent until next property deed transfer",
    processingTime: "30 to 60 Days",
    govtFee: "Prescribed Court Fee / Government Mutation Fee",
    summary: "Application to record change of land title in Record of Rights (RoR / Jamabandi) following sale deed registration, gift deed, inheritance, or partition.",
    docsRequired: [
      "Certified Copy of Registered Sale Deed / Gift Deed / Will",
      "Current Financial Year Land Tax (Khajana) Payment Receipt",
      "Legal Heir Certificate / Death Certificate (if by succession)",
      "Copy of Existing RoR (Khatiyan / Parcha)",
      "Aadhaar Cards of Petitioner and Previous Owner"
    ],
    fields: [
      { id: "deed_no", label: "Deed Registration Number & Year", type: "text", placeholder: "e.g. 1204/2025" },
      { id: "khata_no", label: "Khata No.", type: "text", placeholder: "Khata Number" },
      { id: "plot_no", label: "Plot No. (Khasra)", type: "text", placeholder: "Plot Number" },
      { id: "mouza_name", label: "Mouza / Village Name", type: "text", placeholder: "Mouza Name" },
      { id: "land_area", label: "Total Area (Acres / Decimal)", type: "text", placeholder: "e.g. 0.25 Decimal" },
      { id: "petitioner_name", label: "Petitioner / Purchaser Name", type: "text", placeholder: "Applicant Name" }
    ]
  },
  {
    id: "old-age-pension",
    title: "Old Age / Widow / Disability Pension (NSAP)",
    hindiTitle: "??????????? / ????? / ???????? ????? ????? ????",
    category: "Welfare & Pension",
    department: "Social Security & Empowerment of Persons with Disabilities",
    validity: "Ongoing monthly DBT benefit",
    processingTime: "30 to 45 Days",
    govtFee: "Free",
    summary: "Application for National Social Assistance Programme (IGNOAPS, IGNWPS, IGNDPS) and State Social Security schemes providing ?500 - ?1500 monthly stipend.",
    docsRequired: [
      "Aadhaar Card (Proof of Age: 60+ for Old Age)",
      "Disability Certificate & UDID Card (40%+ disability for IGNDPS)",
      "Death Certificate of Husband (for Widow Pension)",
      "BPL Card / Income Certificate (< ?24,000 - ?40,000 p.a.)",
      "Single Bank Passbook seeded with Aadhaar for DBT",
      "3 Recent Passport Size Photographs"
    ],
    fields: [
      { id: "applicant_name", label: "Beneficiary Full Name", type: "text", placeholder: "Full Name" },
      { id: "pension_type", label: "Pension Type", type: "select", options: ["Indira Gandhi National Old Age Pension (IGNOAPS)", "Indira Gandhi National Widow Pension (IGNWPS)", "Indira Gandhi National Disability Pension (IGNDPS)", "State Social Security Pension"] },
      { id: "dob_age", label: "Date of Birth / Completed Age", type: "text", placeholder: "e.g. 64 Years" },
      { id: "bank_account", label: "Bank Account Number & IFSC", type: "text", placeholder: "Aadhaar Seeded Account" }
    ]
  },
  {
    id: "pm-kisan",
    title: "PM-Kisan Samman Nidhi Registration & e-KYC",
    hindiTitle: "???? ????? ?????? ???? ?????? ? ?-??????? ?????",
    category: "Agriculture & Schemes",
    department: "Ministry of Agriculture & Farmers Welfare, GoI",
    validity: "?6,000 / Year in 3 Installments (Direct DBT)",
    processingTime: "15 to 30 Days",
    govtFee: "?15 Biometric e-KYC Fee at CSC",
    summary: "Application form for eligible small & marginal landholder farmer families to receive ?2,000 financial support every 4 months.",
    docsRequired: [
      "Aadhaar Card linked with active Mobile Number",
      "Land Possession Record (RoR / Record of Rights in farmer name)",
      "Active Bank Passbook with Aadhaar NPCI DBT Mapping",
      "Self-Declaration verifying non-payment of Income Tax and non-govt employment"
    ],
    fields: [
      { id: "farmer_name", label: "Farmer Name (As in Aadhaar)", type: "text", placeholder: "Full Name" },
      { id: "farmer_category", label: "Farmer Category", type: "select", options: ["Small & Marginal (Under 2 Hectares)", "Other Landholder"] },
      { id: "land_khata", label: "Khata No. & Plot No.", type: "text", placeholder: "e.g. Khata 45, Plot 102" },
      { id: "ifsc_code", label: "Bank IFSC Code", type: "text", placeholder: "e.g. SBIN0001234" },
      { id: "mobile_no", label: "Registered Mobile Number", type: "text", placeholder: "10-digit mobile number" }
    ]
  },
  {
    id: "bank-kyc",
    title: "Universal Bank Account KYC / Re-KYC Form",
    hindiTitle: "???? ???? ?-??????? / ???? ??????? ?????",
    category: "Banking & Finance",
    department: "Scheduled Commercial Banks / RRBs / IPPB",
    validity: "Periodic update (2 to 10 years)",
    processingTime: "1 to 2 Working Days",
    govtFee: "Free",
    summary: "Universal customer identification update format for activating dormant accounts, updating mobile number, and enabling DBT payments.",
    docsRequired: [
      "Aadhaar Card (Original + Self-Attested Photocopy)",
      "PAN Card or Form 60 (if applicant does not possess PAN)",
      "2 Recent Color Passport Size Photographs",
      "First Page Photocopy of Bank Passbook"
    ],
    fields: [
      { id: "bank_name", label: "Bank Name & Branch", type: "text", placeholder: "e.g. State Bank of India, Main Branch" },
      { id: "account_no", label: "Account Number", type: "text", placeholder: "Bank Account Number" },
      { id: "cust_mobile", label: "Registered Mobile Number", type: "text", placeholder: "10-digit mobile number" },
      { id: "enable_dbt", label: "Enable Aadhaar DBT for Govt Schemes?", type: "select", options: ["Yes (Seed Aadhaar for DBT Payments)", "No (Normal KYC only)"] }
    ]
  },
  {
    id: "police-pcc",
    title: "Police Character & Verification Certificate (PCC)",
    hindiTitle: "?????? ??? ?????????? ??????? ?????? ???? (PCC)",
    category: "Certificates",
    department: "District Police Office / Local Police Station",
    validity: "6 Months",
    processingTime: "7 to 15 Days",
    govtFee: "?50 - ?100 Government Treasury Fee",
    summary: "Application for antecedent verification required for CSC VLE onboarding, passport processing, arms license, and government recruitment.",
    docsRequired: [
      "Aadhaar Card and Voter ID Card",
      "2 Passport Size Photographs",
      "Character Recommendation from Sarpanch / Ward Councilor / Gazetted Officer",
      "Address Proof for the last 5 years"
    ],
    fields: [
      { id: "applicant_name", label: "Applicant Name", type: "text", placeholder: "Applicant's Full Name" },
      { id: "father_name", label: "Father's Name", type: "text", placeholder: "Father's Full Name" },
      { id: "thana_name", label: "Local Police Station (Thana)", type: "text", placeholder: "Police Station Name" },
      { id: "purpose", label: "Purpose of Police Verification", type: "text", placeholder: "e.g. CSC Janaseba Kendra Onboarding / Bank BC" }
    ]
  }
];

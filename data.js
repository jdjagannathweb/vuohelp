/**
 * VUO CSC HELP - Seed Database & Global Constants
 * Odisha Districts, Government Portals, Training Resources, Announcements
 */

const VUO_DATA = {
  // All 30 Districts of Odisha
  districts: [
    { name: "Angul", blocks: ["Angul", "Athmallik", "Banarpal", "Chhendipada", "Kaniha", "Kishorenagar", "Pallahara", "Talcher"] },
    { name: "Balangir", blocks: ["Agalpur", "Balangir", "Belpara", "Deogaon", "Gudvella", "Khaprakhol", "Loisingha", "Muribahal", "Patnagarh", "Puintala", "Saintala", "Titilagarh", "Turekela"] },
    { name: "Balasore", blocks: ["Bahanaga", "Balasore", "Baliapal", "Basta", "Bhograi", "Jaleswar", "Khaira", "Nilgiri", "Oupada", "Remuna", "Simulia", "Soro"] },
    { name: "Bargarh", blocks: ["Ambabhona", "Attabira", "Barpali", "Bargarh", "Bhatli", "Bheden", "Bijepur", "Gaisilet", "Jharbandh", "Padampur", "Paikmal", "Sohela"] },
    { name: "Bhadrak", blocks: ["Basudevpur", "Bhadrak", "Bhandaripokhari", "Bonth", "Chandabali", "Dhamnagar", "Tihidi"] },
    { name: "Boudh", blocks: ["Boudh", "Harbhanga", "Kantamal"] },
    { name: "Cuttack", blocks: ["Athagarh", "Banki", "Baramba", "Barang", "Cuttack Sadar", "Kantapada", "Mahanga", "Narsinghpur", "Niali", "Nischintakoili", "Salepur", "Tangi-Choudwar", "Tigiria"] },
    { name: "Deogarh", blocks: ["Barkote", "Reamal", "Tileibani"] },
    { name: "Dhenkanal", blocks: ["Bhuban", "Dhenkanal", "Gondia", "Hindol", "Kamakhyanagar", "Kankadahad", "Odapada", "Parjang"] },
    { name: "Gajapati", blocks: ["Guma", "Kashinagar", "Mohana", "Nuagada", "Rayagada", "R.Udayagiri"] },
    { name: "Ganjam", blocks: ["Aska", "Bellaguntha", "Bhanjanagar", "Buguda", "Chhatrapur", "Chikiti", "Digapahandi", "Ganjam", "Hinjilicut", "Jagannathprasad", "Kabisuryanagar", "Khallikote", "Kukudakhandi", "Patrapur", "Polasara", "Purushottampur", "Rangeilunda", "Sanakhemundi", "Sheragada", "Surada"] },
    { name: "Jagatsinghpur", blocks: ["Balikuda", "Biridi", "Erasama", "Jagatsinghpur", "Kujang", "Naugaon", "Raghunathpur", "Tirtol"] },
    { name: "Jajpur", blocks: ["Badachana", "Bari", "Binjharpur", "Danagadi", "Dharmasala", "Jajpur", "Korei", "Rasulpur", "Sukinda"] },
    { name: "Jharsuguda", blocks: ["Jharsuguda", "Kirirmira", "Kolabira", "Laikera", "Lakhanpur"] },
    { name: "Kalahandi", blocks: ["Bhawanipatna", "Dharamgarh", "Golamunda", "Jaipatna", "Junagarh", "Kalampur", "Karlamunda", "Kesinga", "Kokasara", "Lanjigarh", "Madanpur Rampur", "Narla", "Thuamul Rampur"] },
    { name: "Kandhamal", blocks: ["Balliguda", "Chakapad", "Daringbadi", "G.Udayagiri", "K.Nuagaon", "Khajuripada", "Kotagarh", "Phiringia", "Phulbani", "Raikia", "Tikabali", "Tumudibandha"] },
    { name: "Kendrapara", blocks: ["Aul", "Derabish", "Garadpur", "Kendrapara", "Mahakalapara", "Marsaghai", "Pattamundai", "Rajkanika", "Rajnagar"] },
    { name: "Kendujhar (Keonjhar)", blocks: ["Anandapur", "Banspal", "Champua", "Ghashipura", "Ghatgaon", "Harichandanpur", "Hatadihi", "Jhumpura", "Joda", "Keonjhar", "Patna", "Saharpada", "Telkoi"] },
    { name: "Khordha", blocks: ["Balianta", "Balipatna", "Banapur", "Begunia", "Bhubaneswar", "Bolagarh", "Chilika", "Jatni", "Khordha", "Tangi"] },
    { name: "Koraput", blocks: ["Bandhugaon", "Baipariguda", "Borigumma", "Dasamantapur", "Jeypore", "Koraput", "Kotpad", "Kundra", "Lamtaput", "Laxmipur", "Nandapur", "Narayanpatna", "Pottangi", "Semiliguda"] },
    { name: "Malkangiri", blocks: ["Chitrakonda", "Kalimela", "Khairput", "Korkunda", "Malkangiri", "Mathili", "Podia"] },
    { name: "Mayurbhanj", blocks: ["Badasahi", "Bahalda", "Bangiriposi", "Baripada", "Betnoti", "Bijatala", "Bisoi", "Gopabandhunagar", "Jamda", "Jharpokharia", "Kaptipada", "Karanjia", "Khunta", "Kuliana", "Kusumi", "Morada", "Rairangpur", "Raruan", "Rasgovindpur", "Samakhunta", "Saraskana", "Sukruli", "Suliapada", "Tiring", "Udala"] },
    { name: "Nabarangpur", blocks: ["Chandahandi", "Dabugam", "Jharigam", "Kodinga", "Kosagumuda", "Nabarangpur", "Nandahandi", "Papdahandi", "Raighar", "Tentulikhunti", "Umerkote"] },
    { name: "Nayagarh", blocks: ["Bhapur", "Daspalla", "Gania", "Khandapada", "Nayagarh", "Nuagaon", "Odagaon", "Ranpur"] },
    { name: "Nuapada", blocks: ["Boden", "Khariar", "Komna", "Nuapada", "Sinapali"] },
    { name: "Puri", blocks: ["Astaranga", "Brahmagiri", "Delanga", "Gop", "Kakatpur", "Kanas", "Krushnaprasad", "Nimapada", "Pipili", "Puri Sadar", "Satyabadi"] },
    { name: "Rayagada", blocks: ["Bishamkatak", "Chandrapur", "Gudari", "Gunupur", "Kalyansinghpur", "Kashipur", "Kolnara", "Muniguda", "Padmapur", "Ramanaguda", "Rayagada"] },
    { name: "Sambalpur", blocks: ["Bamra", "Dhankauda", "Jamankira", "Jujomura", "Kochinda", "Maneswar", "Naktideul", "Rairakhol", "Rengali"] },
    { name: "Subarnapur (Sonepur)", blocks: ["Birmaharajpur", "Dunguripali", "Tarbha", "Sonepur", "Ullunda", "Binka"] },
    { name: "Sundargarh", blocks: ["Bargaon", "Bisra", "Bonaigarh", "Gurundia", "Hemgir", "Koida", "Kuanrmunda", "Kutra", "Lathikata", "Lahunipara", "Lephripara", "Nuagaon", "Rajgangpur", "Subdega", "Sundargarh", "Tangarpali"] }
  ],

  // Important Portal Links
  // Important Portal Links - Sourced from User's Chrome Bookmarks & Portals
  links: [
    // --- CSC & DIGITAL SEVA ---
    {
      id: "csc-1",
      title: "Digital Seva Portal (CSC Official)",
      titleOdia: "ଡିଜିଟାଲ ସେବା ପୋର୍ଟାଲ (CSC)",
      url: "https://digitalseva.csc.gov.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Official CSC Login for VLEs for all central and state digital services.",
      important: true,
      icon: "laptop"
    },
    {
      id: "csc-2",
      title: "CSC Connect Single Sign-On (SSO)",
      titleOdia: "CSC କନେକ୍ଟ ସିଙ୍ଗଲ୍ ସାଇନ୍ ଅନ୍",
      url: "https://connect.csc.gov.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Direct OAuth authorize login for DigiPay, eGov and CSC partner services.",
      important: true,
      icon: "key"
    },
    {
      id: "csc-3",
      title: "CSC NSDL PAN Card Services",
      titleOdia: "CSC NSDL PAN କାର୍ଡ ସେବା",
      url: "https://egovcsc.csccloud.in/nsdl/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Paperless instant PAN card generation and tracking dashboard on CSC.",
      important: true,
      icon: "id-card"
    },
    {
      id: "csc-4",
      title: "UTI PAN Card Instant Reprint",
      titleOdia: "UTI PAN କାର୍ଡ ରିପ୍ରିଣ୍ଟ ଓ ସଂଶୋଧନ",
      url: "https://www.pan.utiitsl.com/PAN_ONLINE/homereprint",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Online PAN card reprint and physical dispatch tracking via UTIITSL.",
      important: true,
      icon: "credit-card"
    },
    {
      id: "csc-5",
      title: "DigiPay Web Portal & AEPS",
      titleOdia: "ଡିଜିପେ ୱେବ୍ ପୋର୍ଟାଲ ଓ AEPS",
      url: "https://digipayweb.csccloud.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "CSC Web DigiPay AEPS cash withdrawal, balance check and merchant settlement.",
      important: true,
      icon: "wallet"
    },
    {
      id: "csc-6",
      title: "CSC Lead Insurance Portal",
      titleOdia: "CSC ବୀମା ପୋର୍ଟାଲ (Insurance)",
      url: "https://insurance.csccloud.in/Lead/Home",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Two-wheeler, four-wheeler, health and life insurance generation.",
      important: true,
      icon: "shield"
    },
    {
      id: "csc-7",
      title: "CSC CIBIL Score Report Check",
      titleOdia: "CSC CIBIL ସ୍କୋର ରିପୋର୍ଟ",
      url: "https://bureau.csccloud.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Instant CIBIL credit score check and loan eligibility report for customers.",
      important: false,
      icon: "activity"
    },
    {
      id: "csc-8",
      title: "CSC Transport & RTO Services",
      titleOdia: "CSC ଟ୍ରାନ୍ସପୋର୍ଟ ଓ RTO ସେବା",
      url: "https://www.csctransport.in/dashboard",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Driving license application, learning test and road tax payment.",
      important: true,
      icon: "truck"
    },
    {
      id: "csc-9",
      title: "CSC Safar (IRCTC Train Ticket Booking)",
      titleOdia: "CSC ସଫର ରେଳ ଟିକେଟ ବୁକିଂ",
      url: "https://cscsafar.in/railways/searchtrain",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Authorised IRCTC railway ticket booking and cancellation portal.",
      important: true,
      icon: "train"
    },
    {
      id: "csc-10",
      title: "CSC Dak Mitra (Speed Post & Parcel)",
      titleOdia: "CSC ଡାକ ମିତ୍ର ପୋଷ୍ଟ ଅଫିସ ସେବା",
      url: "https://dakmitra.csccloud.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "India Post speed post and parcel booking from CSC Kendra.",
      important: true,
      icon: "mail"
    },
    {
      id: "csc-11",
      title: "e-Shram Portal (CSC Update & Correction)",
      titleOdia: "ଇ-ଶ୍ରମ ପୋର୍ଟାଲ (CSC ଅପଡେଟ୍)",
      url: "https://eshram.csc-services.in/Default.aspx",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Unorganised worker e-Shram card registration, KYC and UAN download.",
      important: true,
      icon: "user-check"
    },
    {
      id: "csc-12",
      title: "PM Vishwakarma Yojana Portal",
      titleOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ବିଶ୍ୱକର୍ମା ଯୋଜନା",
      url: "https://pmvishwakarma.gov.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Artisan registration, biometric verification, training certificate and ₹3 Lakh loan.",
      important: true,
      icon: "tool"
    },
    {
      id: "csc-13",
      title: "PM Maandhan Yojana (PM-KMY / PM-SYM)",
      titleOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ମାନଧନ ଯୋଜନା (ପେନସନ)",
      url: "https://maandhan.in/maandhan/login",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Farmer and labour monthly ₹3,000 pension scheme enrolment portal.",
      important: false,
      icon: "heart"
    },
    {
      id: "csc-14",
      title: "ALIMCO Disability Aids Portal",
      titleOdia: "ALIMCO ଦିବ୍ୟାଙ୍ଗ ସହାୟତା ଉପକରଣ",
      url: "https://alimco.csc-services.in/index.php/dashboard",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Free assistive devices for Divyangjan and senior citizens registration.",
      important: false,
      icon: "smile"
    },
    {
      id: "csc-15",
      title: "BLS E-Services B2C CSC Hub",
      titleOdia: "BLS ଇ-ସର୍ଭିସେସ ପୋର୍ଟାଲ",
      url: "https://b2c.cscbls.com/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Citizen utility bills, recharge and multi-service aggregator panel.",
      important: false,
      icon: "grid"
    },
    {
      id: "csc-16",
      title: "Smart CSC Tools (Online VLE Toolkit)",
      titleOdia: "ସ୍ମାର୍ଟ CSC ଟୁଲ୍ସ ପୋର୍ଟାଲ",
      url: "https://smartcsctools.org/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "Free online utilities for CSC VLEs, cyber cafe tools, passport sizing and crop.",
      important: true,
      icon: "box"
    },
    {
      id: "csc-17",
      title: "Digital India Portal",
      titleOdia: "ଡିଜିଟାଲ ଇଣ୍ଡିଆ ପୋର୍ଟାଲ",
      url: "https://www.digitalindiaportal.co.in/",
      category: "csc",
      categoryName: "CSC Services",
      desc: "NSDL / UTI PAN Card, mobile recharge, DTH, electricity bill and ITR.",
      important: false,
      icon: "flag"
    },

    // --- ODISHA GOVERNMENT PORTALS ---
    {
      id: "od-1",
      title: "Subhadra Yojana Portal Odisha",
      titleOdia: "ସୁଭଦ୍ରା ଯୋଜନା ପୋର୍ଟାଲ (Odisha)",
      url: "https://subhadra.odisha.gov.in/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Women empowerment scheme ₹50,000 financial support application and status.",
      important: true,
      icon: "award"
    },
    {
      id: "od-2",
      title: "e-District Odisha (Certificates Portal)",
      titleOdia: "ଇ-ଡିଷ୍ଟ୍ରିକ୍ଟ ଓଡ଼ିଶା (ପ୍ରମାଣପତ୍ର)",
      url: "https://edistrictapp.odisha.gov.in/web/guest",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Apply for Caste, Income, Residence, Legal Heir, SEBC and EWS Certificates.",
      important: true,
      icon: "file-text"
    },
    {
      id: "od-3",
      title: "Bhulekh Odisha (Land Records / RoR)",
      titleOdia: "ଭୂଲେଖ ଓଡ଼ିଶା (ଜମି ପଟ୍ଟା / RoR)",
      url: "http://bhulekh.ori.nic.in/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Search and download RoR Land Khatiyan, Plot map and Tahasil records.",
      important: true,
      icon: "map"
    },
    {
      id: "od-4",
      title: "Odisha Land Revenue (Khajana & Receipt)",
      titleOdia: "ଓଡ଼ିଶା ଖଜଣା ପୈଠ ଓ ରସିଦ ଡାଉନଲୋଡ଼",
      url: "https://www.odishalandrevenue.nic.in/OnlineOflineReceiptDownload.aspx",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Pay online land rent (Khajana) and download official e-receipt instantly.",
      important: true,
      icon: "receipt"
    },
    {
      id: "od-5",
      title: "Agristack Farmer Registry Odisha",
      titleOdia: "କୃଷକ ରେଜିଷ୍ଟ୍ରି (Agristack Odisha)",
      url: "https://odfr.agristack.gov.in/farmer-registry-od/#/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Official government Farmer ID registration, land linking and farmer verification.",
      important: true,
      icon: "user-plus"
    },
    {
      id: "od-6",
      title: "Agrisnet Odisha (Farmer ID & Seeds DB)",
      titleOdia: "ଅଗ୍ରିସନେଟ୍ କୃଷକ ପୋର୍ଟାଲ (Agrisnet)",
      url: "https://agrisnetodisha.ori.nic.in/stock/farmer/Home.aspx",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Farmer database, seed DBT subsidy, fertilizer licence and farm machinery.",
      important: true,
      icon: "sun"
    },
    {
      id: "od-7",
      title: "CM-KISAN Portal Odisha",
      titleOdia: "ମୁଖ୍ୟମନ୍ତ୍ରୀ କୃଷକ ସହାୟତା (CM-KISAN)",
      url: "https://cmkisan.odisha.gov.in/index.html",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Odisha state farmer income assistance scheme verification and status.",
      important: true,
      icon: "dollar-sign"
    },
    {
      id: "od-8",
      title: "KALIA Portal (Track Beneficiary Token)",
      titleOdia: "କାଳିଆ ଯୋଜନା ଟ୍ରାକିଂ ପୋର୍ଟାଲ",
      url: "https://kaliaportal.odisha.gov.in/TrackToken.aspx",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Krushak Assistance for Livelihood and Income Augmentation beneficiary lookup.",
      important: true,
      icon: "check-circle"
    },
    {
      id: "od-9",
      title: "Odisha One Unified Citizen Portal",
      titleOdia: "ଓଡ଼ିଶା ୱାନ ନାଗରିକ ପୋର୍ଟାଲ",
      url: "https://www.odishaone.gov.in/citizen/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Single window citizen services, municipal tax, utilities and trade licenses.",
      important: true,
      icon: "compass"
    },
    {
      id: "od-10",
      title: "e-PDS Odisha (Ration Card Portal)",
      titleOdia: "ଇ-ପିଡିଏସ ଓଡ଼ିଶା (ରାସନ କାର୍ଡ)",
      url: "http://pdsodisha.gov.in/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "NFSA/SFSS ration card list, new application, and family member addition.",
      important: true,
      icon: "archive"
    },
    {
      id: "od-11",
      title: "PDS Odisha (Ration Card Mobile Link Status)",
      titleOdia: "ରାସନ କାର୍ଡ ମୋବାଇଲ ଲିଙ୍କ ଷ୍ଟାଟସ୍",
      url: "https://grs.pdsodisha.gov.in/COMMON/ComplaintRegistrationOffline/Add",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Check and update mobile number linked with food security ration card.",
      important: true,
      icon: "phone"
    },
    {
      id: "od-12",
      title: "Birth & Death Registration Portal Odisha",
      titleOdia: "ଜନ୍ମ ଓ ମୃତ୍ୟୁ ପ୍ରମାଣପତ୍ର ପୋର୍ଟାଲ",
      url: "https://www.birthdeath.odisha.gov.in/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Official online issuance and correction of Birth and Death certificates.",
      important: true,
      icon: "file"
    },
    {
      id: "od-13",
      title: "Baristha Nagarika Tirtha Yatra",
      titleOdia: "ବରିଷ୍ଠ ନାଗରିକ ତୀର୍ଥ ଯାତ୍ରା ଯୋଜନା",
      url: "https://yatra.odisha.gov.in/",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Free pilgrimage travel scheme online application for senior citizens.",
      important: false,
      icon: "navigation"
    },
    {
      id: "od-14",
      title: "SIAM HSRP High Security Plate Booking",
      titleOdia: "HSRP ହାଇ ସିକ୍ୟୁରିଟି ନମ୍ବର ପ୍ଲେଟ୍",
      url: "https://www.siam.in/selectoem.aspx?id=16282229&stateid=26&city=Puri",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "Online booking for vehicle high security registration plate in Odisha.",
      important: false,
      icon: "shield"
    },
    {
      id: "od-15",
      title: "NIOS Regional Centre Bhubaneswar",
      titleOdia: "NIOS ଭୁବନେଶ୍ୱର ଓଡ଼ିଆ ମାଧ୍ୟମ",
      url: "https://rcbhubaneswar.nios.ac.in/sr-secondary-courses-odia-medium.html",
      category: "gov",
      categoryName: "Odisha Govt",
      desc: "National Institute of Open Schooling 10th and 12th admission in Odia medium.",
      important: false,
      icon: "book"
    },

    // --- BANKING, INSURANCE & CSP ---
    {
      id: "bnk-1",
      title: "PM-KISAN Samman Nidhi (e-KYC & Status)",
      titleOdia: "ପିଏମ କିଷାନ ସମ୍ମାନ ନିଧି (e-KYC)",
      url: "https://pmkisan.gov.in/aadharekyc.aspx",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Aadhaar OTP & Biometric e-KYC, beneficiary status & installment tracking.",
      important: true,
      icon: "dollar-sign"
    },
    {
      id: "bnk-2",
      title: "myAadhaar UIDAI Official Portal",
      titleOdia: "myAadhaar ଆଧାର ପୋର୍ଟାଲ (UIDAI)",
      url: "https://myaadhaar.uidai.gov.in/login",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Download e-Aadhaar, address update, PVC card order and bank linking status.",
      important: true,
      icon: "user"
    },
    {
      id: "bnk-3",
      title: "PMJAY Ayushman Bharat Beneficiary Portal",
      titleOdia: "ଆୟୁଷ୍ମାନ ଭାରତ PMJAY ପୋର୍ଟାଲ",
      url: "https://beneficiary.nha.gov.in/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Ayushman card creation, beneficiary search, family e-KYC and download.",
      important: true,
      icon: "heart"
    },
    {
      id: "bnk-4",
      title: "Atal Pension Yojana (APY Protean NPS)",
      titleOdia: "ଅଟଳ ପେନସନ ଯୋଜନା (APY)",
      url: "https://apy.nps-proteantech.in/CRAlite/AadhaarOnloadAction.do",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Enrolment and PRAN e-card download for Atal Pension Yojana subscribers.",
      important: false,
      icon: "umbrella"
    },
    {
      id: "bnk-5",
      title: "Odisha Gramya Bank (OGB Net Banking)",
      titleOdia: "ଓଡ଼ିଶା ଗ୍ରାମ୍ୟ ବ୍ୟାଙ୍କ ଇଣ୍ଟରନେଟ୍ ବ୍ୟାଙ୍କିଙ୍ଗ",
      url: "https://ebank.odishabank.in/RetailBanking/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "OGB retail banking, fund transfer, statement and account inquiry.",
      important: false,
      icon: "credit-card"
    },
    {
      id: "bnk-6",
      title: "Bank of India Financial Inclusion (FI Portal)",
      titleOdia: "ବ୍ୟାଙ୍କ ଅଫ୍ ଇଣ୍ଡିଆ FI କିଓସ୍କ ପୋର୍ଟାଲ",
      url: "https://fi.bankofindia.bank.in/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Bank of India Kiosk Banking, customer enrollment, AEPS deposit and withdrawal.",
      important: true,
      icon: "home"
    },
    {
      id: "bnk-7",
      title: "Dhanhind B2B Agent Portal",
      titleOdia: "Dhanhind B2B ବ୍ୟାଙ୍କିଙ୍ଗ ପୋର୍ଟାଲ",
      url: "https://agent.dhanhind.com/#/Login",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "AEPS, Micro ATM, Money Transfer (DMT), BBPS Bill payment and travel service.",
      important: false,
      icon: "briefcase"
    },
    {
      id: "bnk-8",
      title: "PayCSC Money Transfer & Recharge",
      titleOdia: "PayCSC ମନି ଟ୍ରାନ୍ସଫର ଓ ରିଚାର୍ଜ",
      url: "https://agent2.paycsc.in/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Fast multi-bank domestic money transfer, wallet top-up and mobile recharge.",
      important: false,
      icon: "send"
    },
    {
      id: "bnk-9",
      title: "Sai Recharge Multi-Recharge Portal",
      titleOdia: "ସାଇ ରିଚାର୍ଜ ପୋର୍ଟାଲ",
      url: "https://sairecharge.in/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "All mobile and DTH instant recharge API and retail commission service.",
      important: false,
      icon: "smartphone"
    },
    {
      id: "bnk-10",
      title: "Bharat Gas Contact & KYC Update",
      titleOdia: "ଭାରତ ଗ୍ୟାସ୍ ମୋବାଇଲ ଓ KYC ଅପଡେଟ୍",
      url: "https://my.ebharatgas.com/bharatgas/UpdateContactNumber/Index",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "LPG subsidy bank account linking and customer contact number updation.",
      important: false,
      icon: "flame"
    },
    {
      id: "bnk-11",
      title: "Swachh Bharat Mission (Toilet Subsidy)",
      titleOdia: "ସ୍ୱଚ୍ଛ ଭାରତ ମିଶନ ଶୌଚାଳୟ ସବସିଡି",
      url: "https://sbm.gov.in/SBM_DBT/secure/login.aspx",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Individual Household Latrine (IHHL) ₹12,000 subsidy application and tracking.",
      important: false,
      icon: "check"
    },
    {
      id: "bnk-12",
      title: "National Fisheries Digital Platform (NFDP Loan)",
      titleOdia: "ମତ୍ସ୍ୟ ପାଳନ ଋଣ ଓ ବୀମା (NFDP)",
      url: "https://nfdp.csccloud.in/nfdp/#/",
      category: "banking",
      categoryName: "Banking & CSP",
      desc: "Fisheries PMMSY loan subsidy, digital ID and institutional credit.",
      important: false,
      icon: "anchor"
    },

    // --- JOB APPLY, RECRUITMENT & EXAMS ---
    {
      id: "job-1",
      title: "Staff Selection Commission (SSC Official)",
      titleOdia: "ଷ୍ଟାଫ୍ ସିଲେକ୍ସନ କମିଶନ (SSC)",
      url: "https://ssc.gov.in/",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "SSC CGL, CHSL, MTS, GD Constable online application, admit card and results.",
      important: true,
      icon: "award"
    },
    {
      id: "job-2",
      title: "Railway Recruitment Board (RRB Apply Portal)",
      titleOdia: "ରେଳବାଇ ନିଯୁକ୍ତି ବୋର୍ଡ (RRB)",
      url: "https://www.rrbapply.gov.in/#/auth/landing",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "Indian Railways NTPC, Group D, ALP and Technician recruitment portal.",
      important: true,
      icon: "train"
    },
    {
      id: "job-3",
      title: "Join Indian Army (Agniveer & Officer Portal)",
      titleOdia: "ଭାରତୀୟ ସେନା ଅଗ୍ନିବୀର ପୋର୍ଟାଲ",
      url: "https://joinindianarmy.nic.in/Index.htm",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "Agniveer rally registration, CEE entrance exam application and admit card.",
      important: true,
      icon: "shield"
    },
    {
      id: "job-4",
      title: "PM Internship Scheme (MCA Government of India)",
      titleOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ଇଣ୍ଟର୍ଣ୍ଣସିପ୍ ଯୋଜନା",
      url: "https://pminternship.mca.gov.in/login/",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "₹5,000 monthly stipend internship in top 500 companies in India.",
      important: true,
      icon: "briefcase"
    },
    {
      id: "job-5",
      title: "National Scholarship Portal (NSP OTR Application)",
      titleOdia: "ଜାତୀୟ ଛାତ୍ରବୃତ୍ତି ପୋର୍ଟାଲ (NSP)",
      url: "https://scholarships.gov.in/otrapplication/#/",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "Pre-matric, post-matric and higher education merit scholarship scheme.",
      important: true,
      icon: "graduation-cap"
    },
    {
      id: "job-6",
      title: "Himalayas Remote Jobs Portal",
      titleOdia: "ରିମୋଟ୍ ଜବ୍ସ ପୋର୍ଟାଲ (Himalayas)",
      url: "https://himalayas.app/jobs",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "Verified work from home, customer support and tech remote jobs worldwide.",
      important: false,
      icon: "globe"
    },
    {
      id: "job-7",
      title: "TELUS International AI Community",
      titleOdia: "TELUS AI ଡାଟା ୱାର୍କ",
      url: "https://www.telusinternational.ai/cmp/contributor/dashboard",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "Online rating, AI data evaluation, translation and freelance task income.",
      important: false,
      icon: "cpu"
    },
    {
      id: "job-8",
      title: "Awign Freelance & Gig Workforce",
      titleOdia: "Awign ଗିଗ୍ ୱାର୍କ ପୋର୍ଟାଲ",
      url: "https://www.awign.com/",
      category: "jobs",
      categoryName: "Jobs & Exams",
      desc: "On-demand field operations, auditing, verification and gig tasks for youth.",
      important: false,
      icon: "users"
    },

    // --- AI TOOLS & SMART UTILITIES ---
    {
      id: "ai-1",
      title: "ChatGPT (OpenAI)",
      titleOdia: "ChatGPT ଆର୍ଟିଫିସିଆଲ ଇଣ୍ଟେଲିଜେନ୍ସ",
      url: "https://chat.openai.com/chat",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "AI assistant for writing letters, drafting applications, coding and citizen queries.",
      important: true,
      icon: "message-square"
    },
    {
      id: "ai-2",
      title: "Google NotebookLM (AI Research Partner)",
      titleOdia: "ଗୁଗୁଲ୍ NotebookLM (AI ରିସର୍ଚ୍ଚ)",
      url: "https://notebooklm.google/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Google AI tool to summarize government PDFs, scheme guidelines and circulars.",
      important: true,
      icon: "book-open"
    },
    {
      id: "ai-3",
      title: "Cutout.Pro (AI Photo Enhancer & BG Remover)",
      titleOdia: "Cutout.Pro (AI ଫଟୋ ଏନହାନ୍ସର)",
      url: "https://www.cutout.pro/photo-enhancer-sharpener-upscaler/upload",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "AI background removal, face sharpener, portrait enhancement and upscaling.",
      important: true,
      icon: "image"
    },
    {
      id: "ai-4",
      title: "Sarvam AI (Indian Languages Voice TTS)",
      titleOdia: "Sarvam AI ଭାରତୀୟ ଭଏସ୍ ଜେନେରେଟର",
      url: "https://dashboard.sarvam.ai/text-to-speech",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "High natural quality Odia, Hindi and Indian regional languages AI voice TTS.",
      important: false,
      icon: "mic"
    },
    {
      id: "ai-5",
      title: "SpeechMa (Hindi & Regional Text to Speech)",
      titleOdia: "SpeechMa ମାଗଣା ଟେକ୍ସଟ୍ ଟୁ ସ୍ପିଚ୍",
      url: "https://speechma.com/hindi",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Free realistic AI voiceover generator for YouTube videos and audio clips.",
      important: false,
      icon: "volume-2"
    },
    {
      id: "ai-6",
      title: "Qwen AI (Alibaba Deep Reasoning Assistant)",
      titleOdia: "Qwen AI ଆସିଷ୍ଟାଣ୍ଟ",
      url: "https://chat.qwen.ai/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Powerful multilingual AI language model with fast response and deep reasoning.",
      important: false,
      icon: "zap"
    },
    {
      id: "ai-7",
      title: "Kimi AI Assistant (Deep Thinking & File Reader)",
      titleOdia: "Kimi AI ଆସିଷ୍ଟାଣ୍ଟ",
      url: "https://www.kimi.com/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Long context PDF reader and intelligent AI assistant for document analysis.",
      important: false,
      icon: "file-text"
    },
    {
      id: "ai-8",
      title: "Rytr AI Writer & Content Generator",
      titleOdia: "Rytr AI କଣ୍ଟେଣ୍ଟ ରାଇଟର",
      url: "https://rytr.me/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Automated email, notice, blog post and YouTube video description writing.",
      important: false,
      icon: "edit"
    },
    {
      id: "ai-9",
      title: "Adobe Express (Online Banner & Poster Design)",
      titleOdia: "Adobe Express ବ୍ୟାନର ଡିଜାଇନ୍",
      url: "https://new.express.adobe.com/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Design shop flex banners, festival greetings, social media posters in minutes.",
      important: false,
      icon: "layout"
    },
    {
      id: "ai-10",
      title: "Pi7 PDF Tool (PDF Compress & Convert)",
      titleOdia: "Pi7 PDF କମ୍ପ୍ରେସର ଓ କନଭର୍ଟର",
      url: "https://pdf.pi7.org/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Fast PDF compression to 50KB, 100KB, 200KB for government job form upload.",
      important: true,
      icon: "minimize"
    },
    {
      id: "ai-11",
      title: "Sejda PDF Editor Online",
      titleOdia: "Sejda PDF ଏଡିଟର ଅନଲାଇନ୍",
      url: "https://www.sejda.com/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Edit text in PDF documents, sign forms, split, merge and reorganize pages.",
      important: true,
      icon: "scissors"
    },
    {
      id: "ai-12",
      title: "TunePocket YouTube Tags Generator",
      titleOdia: "TunePocket ୟୁଟ୍ୟୁବ୍ ଟ୍ୟାଗ୍ ଜେନେରେଟର",
      url: "https://www.tunepocket.com/youtube-tags-generator/#tags-results",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Generate high-ranking SEO tags and keywords for YouTube video uploads.",
      important: false,
      icon: "tag"
    },
    {
      id: "ai-13",
      title: "FileCR Software Store",
      titleOdia: "FileCR ସଫ୍ଟୱେର୍ ଷ୍ଟୋର୍",
      url: "https://filecr.com/en/",
      category: "ai_tools",
      categoryName: "AI Tools",
      desc: "Repository for essential PC utilities, photo editors and Windows software.",
      important: false,
      icon: "download"
    },

    // --- CITIZEN SERVICES & UTILITY TOOLS ---
    {
      id: "cit-1",
      title: "Vahan Citizen Portal (Vehicle RC Status & Tax)",
      titleOdia: "ବାହନ ସିଟିଜେନ୍ ପୋର୍ଟାଲ (ଗାଡି RC)",
      url: "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
      category: "citizen",
      categoryName: "Citizen Utilities",
      desc: "Vehicle registration details, fitness certificate, NOC and online tax receipt.",
      important: true,
      icon: "truck"
    },
    {
      id: "cit-2",
      title: "POS Homepage (idedge Retail POS)",
      titleOdia: "POS ହୋମପେଜ୍ କୋର୍",
      url: "https://pos.idedge.in/core/home",
      category: "citizen",
      categoryName: "Citizen Utilities",
      desc: "Point of sale merchant transaction, receipt and inventory management.",
      important: false,
      icon: "shopping-cart"
    },
    {
      id: "cit-3",
      title: "Railwire Broadband Subscriber Billing",
      titleOdia: "Railwire ବ୍ରଡବ୍ୟାଣ୍ଡ ବିଲିଂ",
      url: "https://od.railwire.co.in/subcntl",
      category: "citizen",
      categoryName: "Citizen Utilities",
      desc: "Odisha Railwire high-speed internet subscriber account renewal and invoice.",
      important: false,
      icon: "wifi"
    },
    {
      id: "cit-4",
      title: "Great Learning Academy (Free Certified Courses)",
      titleOdia: "Great Learning ମାଗଣା ସାର୍ଟିଫିକେଟ୍ କୋର୍ସ",
      url: "https://www.greatlearning.in/academy",
      category: "citizen",
      categoryName: "Citizen Utilities",
      desc: "Free online IT, computer, Python, digital marketing and data courses with certificate.",
      important: false,
      icon: "award"
    },

    // --- VUO CSC HELP OFFICIAL ---
    {
      id: "vuo-1",
      title: "VUO CSC HELP Official Portal",
      titleOdia: "VUO CSC HELP ଅଫିସିଆଲ ପୋର୍ଟାଲ",
      url: "#",
      category: "vuo",
      categoryName: "VUO CSC HELP",
      desc: "Digital assistance portal, tools, state updates and resources for CSC VLEs.",
      important: true,
      icon: "flag"
    },
    {
      id: "vuo-2",
      title: "VUO CSC HELP Support & District Coordinators",
      titleOdia: "VUO CSC ସହାୟତା ଓ ଜିଲ୍ଲା ସଂଯୋଜକ",
      url: "#contact",
      category: "vuo",
      categoryName: "VUO CSC HELP",
      desc: "Direct contact numbers: 9937037131 | Satyabadi, Puri, Odisha",
      important: true,
      icon: "phone-call"
    }
  ],

  // Training Videos - Official "Odia Digital Sikhya" Channel (Jagannath Dash)
  trainingVideos: [
    {
      id: "tr-1",
      title: "CSC Tip Of Day 1 (Smart CSC Tips & Tools)",
      titleOdia: "CSC ଟିପ୍ ଅଫ୍ ଦି ଡେ ୧ | ସ୍ମାର୍ଟ CSC ଟିପ୍ସ",
      category: "CSC Training",
      youtubeId: "U3jaSv9zad4",
      desc: "CSC VLE service tricks, portal speedup and online center productivity tips by Jagannath Dash.",
      duration: "08:15 min",
      views: "1.2K",
      badge: "Featured"
    },
    {
      id: "tr-2",
      title: "Step-by-Step: Pay Your Court Challan Online in Odisha",
      titleOdia: "ଗାଡି ଚାଲାଣ କୋର୍ଟକୁ ଗଲା ପରେ କଣ କରିବେ ? | Pay Court Challan Online",
      category: "Government Services",
      youtubeId: "eQx1_pi83-s",
      desc: "Complete step-by-step tutorial on how to pay Odisha traffic e-court challan online easily.",
      duration: "11:20 min",
      views: "2.5K",
      badge: "Popular"
    },
    {
      id: "tr-3",
      title: "Kanya Vivah Yojana Odisha Online Apply (Get Rs 55,000 Assistance)",
      titleOdia: "କନ୍ୟା ବିବାହ ଯୋଜନା ଆବେଦନ, ମିଳିବ ୫୫୦୦୦ ଟଙ୍କା | Kanya Vivah Yojana",
      category: "Government Schemes",
      youtubeId: "0SNlPY8lUdI",
      desc: "Odisha Kanya Vivah Yojana eligibility, online form fill-up process, and Rs 55,000 financial support.",
      duration: "14:40 min",
      views: "4.8K",
      badge: "Schemes"
    },
    {
      id: "tr-4",
      title: "Mudra Loan Apply in New JanSamarth Portal (JanSamarth 2025)",
      titleOdia: "Mudra Loan Apply in New Jansamarth Portal || Jansamarth ଲୋନ୍ ଆବେଦନ",
      category: "Banking",
      youtubeId: "W7WenlCCfP8",
      desc: "Apply for Pradhan Mantri Mudra Loan on JanSamarth portal for business, shop setup, and CSC center.",
      duration: "13:10 min",
      views: "3.1K",
      badge: "Banking"
    },
    {
      id: "tr-5",
      title: "Farmer Registry Full Process (Krushak Panjikaran Odisha / Farmer ID)",
      titleOdia: "Farmer Registry Full Process with Gov. | Krushak Panjikaran Odisha | Farmer ID",
      category: "Government Services",
      youtubeId: "o6GaNTR-Iak",
      desc: "Official Krushak Panjikaran, Agristack Farmer ID registration, land verification, and e-KYC.",
      duration: "15:35 min",
      views: "5.6K",
      badge: "Farmer"
    },
    {
      id: "tr-6",
      title: "CSC New Service: Foreign e-Migrate Service (Pravasi Shramik Service)",
      titleOdia: "CSC New Service, Foreign E-Migrate Service || ପ୍ରବାସୀ ଶ୍ରମିକ ଙ୍କ ପାଇଁ ନୂଆ ସର୍ଭିସ",
      category: "CSC Training",
      youtubeId: "LsyNTSdthfs",
      desc: "Foreign e-Migrate service registration on CSC portal for Pravasi Shramik and overseas employment.",
      duration: "09:45 min",
      views: "1.8K",
      badge: "New Service"
    },
    {
      id: "tr-7",
      title: "New Service on CSC: All Bank Statement in 2 Min (Account Aggregator)",
      titleOdia: "New Service on CSC || All Bank Statement in 2 Min || Account Aggregator",
      category: "Banking",
      youtubeId: "r64B2mM4gL0",
      desc: "How to download instant bank account statement in 2 minutes using Account Aggregator service on CSC.",
      duration: "10:15 min",
      views: "8.9K",
      badge: "Essential"
    },
    {
      id: "tr-8",
      title: "APAAR ID Generation on UDISE Plus (One Nation One Student ID)",
      titleOdia: "Apaar ID Generation Process on UDISE PLUS || ଅପାର ଆଇଡି କିପରି କରିବେ",
      category: "e-Governance",
      youtubeId: "FVMqGNfk1K0",
      desc: "Generate APAAR Student ID card on UDISE Plus portal with Aadhaar authentication in Odia.",
      duration: "12:50 min",
      views: "6.2K",
      badge: "Students"
    },
    {
      id: "tr-9",
      title: "New Farmer Registration Starting in Odisha (Paddy Procurement)",
      titleOdia: "New Farmer Registration Starting Odisha || ନୂଆ କୃଷକ ରଜିସ୍ଟ୍ରେସନ ଆରମ୍ଭ ହେଲା",
      category: "Government Services",
      youtubeId: "YV2Wl3EufAA",
      desc: "New farmer online registration in Odisha, land details entry, and paddy procurement registration guide.",
      duration: "14:05 min",
      views: "3.4K",
      badge: "Agriculture"
    },
    {
      id: "tr-10",
      title: "How to Link PAN with Aadhaar: Step-by-Step Guide",
      titleOdia: "How to Link PAN with Aadhaar | Step-by-Step Guide | PAN ଆଧାର ଲିଙ୍କ",
      category: "e-Governance",
      youtubeId: "cdOQb7ZVceo",
      desc: "Complete tutorial on linking PAN Card with Aadhaar on income tax e-filing portal.",
      duration: "07:30 min",
      views: "4.1K",
      badge: "Govt Portal"
    },
    {
      id: "tr-11",
      title: "Pradhan Mantri Awas Yojana (PMAY) New Apply & Beneficiary List Odisha",
      titleOdia: "Pradhanmantri Awas Yojana New Apply Odisha | PMAY ଆବାସ ଯୋଜନା ଲିଷ୍ଟ",
      category: "Government Schemes",
      youtubeId: "qPYLu9Z_fNg",
      desc: "PMAY Gramin online application, house sanction list check, and installment status in Odisha.",
      duration: "16:20 min",
      views: "7.8K",
      badge: "Housing"
    },
    {
      id: "tr-12",
      title: "ABHA Health Card Online Apply & Download Complete Process",
      titleOdia: "ABHA Health Card କିପରି କରିବେ | ABHA କାର୍ଡ ଫୁଲ୍ ପ୍ରୋସେସ୍",
      category: "Government Schemes",
      youtubeId: "e_HOvJ2Eu3A",
      desc: "Ayushman Bharat Health Account (ABHA) 14-digit digital health ID creation with Aadhaar OTP.",
      duration: "08:45 min",
      views: "5.1K",
      badge: "Health"
    },
    {
      id: "tr-13",
      title: "KALIA Yojana Landless & Beneficiary Status Check (Krushak Assistance)",
      titleOdia: "Kalia Yojana Landless Beneficiary Details | କାଳିଆ ଯୋଜନା ଟଙ୍କା ଷ୍ଟାଟସ୍",
      category: "Government Schemes",
      youtubeId: "FxzF4KO9soU",
      desc: "KALIA scheme installment payment check, e-KYC status, and landless agriculture worker benefits.",
      duration: "11:15 min",
      views: "9.3K",
      badge: "KALIA"
    },
    {
      id: "tr-14",
      title: "PM-KISAN Samman Nidhi e-KYC, Status & New Registration Full Guide",
      titleOdia: "PM-KISAN Samman Nidhi e-KYC ଓ ନୂଆ ଆବେଦନ | PMKISAN ଟଙ୍କା",
      category: "Banking",
      youtubeId: "E8s6zWKrbzI",
      desc: "PM-KISAN 19th installment, Aadhaar biometric e-KYC, land record seeding, and payment status.",
      duration: "12:40 min",
      views: "12.6K",
      badge: "PM-KISAN"
    },
    {
      id: "tr-15",
      title: "Odisha Labour Card Online Apply, Renewal & Scholarship Benefits",
      titleOdia: "Odisha Labour Card Online Apply & Renewal | ଶ୍ରମିକ କାର୍ଡ ସୁବିଧା",
      category: "Government Services",
      youtubeId: "P8LbJfU96ew",
      desc: "Building and other construction workers (BOCW) welfare board labour card registration and renewal.",
      duration: "13:50 min",
      views: "6.7K",
      badge: "Labour"
    },
    {
      id: "tr-16",
      title: "Odisha Ration Card (e-PDS) New Apply, Member Addition & e-KYC Guide",
      titleOdia: "Odisha Ration Card Apply & Member Add | ରାସନ କାର୍ଡ ନୂଆ ନାମ ଯୋଡିବା",
      category: "Government Services",
      youtubeId: "2vdWSZLB-xA",
      desc: "National Food Security Act (NFSA) Odisha ration card new family member addition and biometric e-KYC.",
      duration: "14:10 min",
      views: "8.4K",
      badge: "e-PDS"
    },
    {
      id: "tr-17",
      title: "Post Matric Scholarship 2025-26 Odisha Online Form Fillup Guide",
      titleOdia: "Post Matric Scholarship 2025-26 || ଛାତ୍ରବୃତ୍ତି ଆବେଦନ ଫୁଲ୍ ପ୍ରୋସେସ୍",
      category: "e-Governance",
      youtubeId: "GHGwrXUGbC4",
      desc: "State scholarship portal Odisha post matric scholarship application for SC/ST/OBC students.",
      duration: "09:30 min",
      views: "3.2K",
      badge: "Scholarship"
    },
    {
      id: "tr-18",
      title: "JNV Navodaya Vidyalaya Class 6 Online Admission Form Fill Up",
      titleOdia: "Navodaya Vidyalaya Class 6 Admission Apply || ନବୋଦୟ ଆଡମିସନ",
      category: "e-Governance",
      youtubeId: "PQGnOhpqU1U",
      desc: "Jawahar Navodaya Vidyalaya selection test online application and certificate upload guide.",
      duration: "08:15 min",
      views: "4.5K",
      badge: "Admission"
    },
    {
      id: "tr-19",
      title: "Ayushman Card Odisha Complete Registration & Benefits",
      titleOdia: "Ayushman Card Odisha || ଆୟୁଷ୍ମାନ କାର୍ଡ କିପରି କରିବେ",
      category: "Government Schemes",
      youtubeId: "acMJ7OIYRYI",
      desc: "Ayushman Bharat National Health Protection Scheme free medical insurance card generation.",
      duration: "07:40 min",
      views: "5.3K",
      badge: "Health"
    },
    {
      id: "tr-20",
      title: "PM-KISAN 19th Installment Beneficiary Account Status & e-KYC",
      titleOdia: "Pmkishan 19th Installment Status || ପିଏମ କିଷାନ ଟଙ୍କା ଷ୍ଟାଟସ୍",
      category: "Banking",
      youtubeId: "VRxWZ7sq1gA",
      desc: "PM-KISAN payment transfer status, Aadhaar bank NPCI seeding, and problem resolution.",
      duration: "06:50 min",
      views: "4.9K",
      badge: "PM-KISAN"
    },
    {
      id: "tr-21",
      title: "Subhadra Yojana Apply Online Complete Process (VLE Form Fill-up)",
      titleOdia: "ସୁଭଦ୍ରା ଯୋଜନା ଅନଲାଇନ୍ ଆବେଦନ ଫୁଲ୍ ପ୍ରୋସେସ୍ | Subhadra Yojana",
      category: "Government Schemes",
      youtubeId: "wzRwXaqkJYc",
      desc: "Subhadra Yojana Odisha official portal form fillup, biometric OTP authentication and bank seeding.",
      duration: "18:45 min",
      views: "45.2K",
      badge: "Trending"
    },
    {
      id: "tr-22",
      title: "Subhadra Yojana Rejected List Secrets You Need To Know (Correction Guide)",
      titleOdia: "ସୁଭଦ୍ରା ଯୋଜନା ରିଜେକ୍ଟ ଲିଷ୍ଟ ଓ ସଂଶୋଧନ ପ୍ରଣାଳୀ | Subhadra Rejected List",
      category: "Government Schemes",
      youtubeId: "vS_KUCplzug",
      desc: "Why Subhadra applications get rejected, NPCI DBT mapping errors, and how to re-apply successfully.",
      duration: "12:15 min",
      views: "28.6K",
      badge: "Important"
    },
    {
      id: "tr-23",
      title: "Subhadra Yojana Standard Operating Procedure (SOP & Guidelines 2024)",
      titleOdia: "ସୁଭଦ୍ରା ଯୋଜନା SOP ଓ ସରକାରୀ ନିୟମାବଳୀ ୨୦୨୪ | Subhadra SOP",
      category: "Government Schemes",
      youtubeId: "o4MM8IG6wrY",
      desc: "Official government SOP guidelines, document checklist, and field verification protocol.",
      duration: "15:20 min",
      views: "19.4K",
      badge: "Official SOP"
    },
    {
      id: "tr-24",
      title: "PM Surya Ghar Muft Bijli Yojana Online Apply (Rooftop Solar Scheme)",
      titleOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ସୂର୍ଯ୍ୟ ଘର ମୁଫ୍ତ ବିଜୁଳି ଯୋଜନା | PM Surya Ghar Yojana",
      category: "Government Schemes",
      youtubeId: "K0XTIzPYR9Y",
      desc: "How to apply for 300 units free electricity subsidy under PM Surya Ghar Rooftop Solar scheme in Odisha.",
      duration: "14:10 min",
      views: "16.8K",
      badge: "Solar Scheme"
    },
    {
      id: "tr-25",
      title: "Swayam Yojana Odisha Online Apply on Mobile (Rs 1 Lakh Interest-Free Loan)",
      titleOdia: "ସ୍ୱୟଂ ଯୋଜନା ମୋବାଇଲରୁ ଆବେଦନ କରନ୍ତୁ | Swayam Scheme Odisha",
      category: "Banking",
      youtubeId: "aTxXKiXhAJ0",
      desc: "Odisha Swayam scheme Rs 1 lakh 0% interest business loan application on mobile/portal.",
      duration: "11:50 min",
      views: "22.3K",
      badge: "0% Loan"
    },
    {
      id: "tr-26",
      title: "Kamdhenu Yojana Odisha Online Apply (Dairy & Cow Farming Subsidy)",
      titleOdia: "କାମଧେନୁ ଯୋଜନା ଓଡ଼ିଶା ଅନଲାଇନ୍ ଆବେଦନ | Kamdhenu Yojana",
      category: "Government Schemes",
      youtubeId: "1mpFLxGBtHA",
      desc: "Govt subsidy for dairy farming, cattle purchase and cow shed construction in Odisha.",
      duration: "13:30 min",
      views: "14.5K",
      badge: "Agriculture"
    },
    {
      id: "tr-27",
      title: "Sumangala Yojana Odisha Online Apply (Inter-Caste Marriage Incentive Rs 2.5 Lakh)",
      titleOdia: "ସୁମଙ୍ଗଳା ଯୋଜନା ଆବେଦନ | Sumangala Yojana Odisha",
      category: "Government Schemes",
      youtubeId: "glw19Obw0gU",
      desc: "Online application process for Sumangala portal incentive for inter-caste married couples.",
      duration: "10:45 min",
      views: "11.2K",
      badge: "Incentive"
    },
    {
      id: "tr-28",
      title: "National Fisheries Digital Platform Registration (NFDP Odisha)",
      titleOdia: "National Fisheries Digital Platform Registration | NFDP ମତ୍ସ୍ୟଜୀବୀ ପଞ୍ଜୀକରଣ",
      category: "Government Services",
      youtubeId: "f7tSkaL_Ua4",
      desc: "NFDP national fisheries digital platform fisherman ID card registration and insurance coverage.",
      duration: "09:55 min",
      views: "8.7K",
      badge: "Fisheries"
    },
    {
      id: "tr-29",
      title: "RTE Paradarshi Odisha Portal: Free School Admission in Private Schools",
      titleOdia: "RTE ପାରଦର୍ଶୀ ପୋର୍ଟାଲ ମାଗଣା ସ୍କୁଲ ଆଡମିସନ | RTE Paradarshi Odisha",
      category: "e-Governance",
      youtubeId: "6G4VVvkJtSg",
      desc: "Right to Education (RTE) 25% free quota student online registration in private schools.",
      duration: "16:05 min",
      views: "34.1K",
      badge: "Education"
    },
    {
      id: "tr-30",
      title: "OJEE Online Application Form Fill Up & Registration Guide",
      titleOdia: "OJEE ଅନଲାଇନ୍ ଫର୍ମ ଫିଲପ୍ ପ୍ରଣାଳୀ | OJEE Registration",
      category: "e-Governance",
      youtubeId: "F3UoI3E-emg",
      desc: "Odisha Joint Entrance Examination (OJEE) student registration and admit card guide.",
      duration: "12:40 min",
      views: "9.6K",
      badge: "Entrance"
    },
    {
      id: "tr-31",
      title: "How To Apply EC (Encumbrance Certificate) Online in Odisha (IGR Portal)",
      titleOdia: "ଇସି (EC) ଅନଲାଇନ୍ ଆବେଦନ ଓଡ଼ିଶା | Encumbrance Certificate IGR Odisha",
      category: "Government Services",
      youtubeId: "XDUP12YTylc",
      desc: "Download land Encumbrance Certificate (EC) online from Inspector General of Registration (IGR) Odisha.",
      duration: "14:50 min",
      views: "18.9K",
      badge: "Land Records"
    },
    {
      id: "tr-32",
      title: "Rose Valley Money Refund Online Application Process in Odisha",
      titleOdia: "Rose Valley ଟଙ୍କା ଫେରସ୍ତ ଅନଲାଇନ୍ ଆବେଦନ | Rose Valley Refund Odisha",
      category: "Government Services",
      youtubeId: "ufFV-xKvI_s",
      desc: "Chit fund money refund commission online claim application process for Rose Valley investors.",
      duration: "13:15 min",
      views: "27.4K",
      badge: "Refund"
    },
    {
      id: "tr-33",
      title: "Bank of India Online DBT & Aadhaar Seeding Linking Full Process",
      titleOdia: "Bank of India Online DBT Linking | ବ୍ୟାଙ୍କ ଆଧାର DBT ଲିଙ୍କ",
      category: "Banking",
      youtubeId: "8Xbfc4N_o2U",
      desc: "How to link Aadhaar with Bank of India account online for receiving DBT govt subsidies and PM-KISAN.",
      duration: "08:35 min",
      views: "15.7K",
      badge: "DBT NPCI"
    },
    {
      id: "tr-34",
      title: "How to Update Aadhaar HOF Based (Head of Family) by UCL / ECMP",
      titleOdia: "ଆଧାର HOF ବେସଡ୍ ଅପଡେଟ୍ | Aadhaar HOF Update Online",
      category: "CSC Training",
      youtubeId: "HDw6qlQ8rNw",
      desc: "Update Aadhaar address using Head of Family (HOF) consent without needing address proof documents.",
      duration: "17:25 min",
      views: "23.8K",
      badge: "Aadhaar UCL"
    },
    {
      id: "tr-35",
      title: "Aadhaar HOF Address Update Online Without Any Document (Self Service)",
      titleOdia: "ବିନା ଡକ୍ୟୁମେଣ୍ଟରେ ଆଧାର ଠିକଣା ବଦଳାନ୍ତୁ HOF | Aadhaar HOF Update",
      category: "e-Governance",
      youtubeId: "3El3iuNnBUw",
      desc: "Self-service Aadhaar portal HOF address change request step-by-step tutorial.",
      duration: "11:40 min",
      views: "19.1K",
      badge: "UIDAI"
    },
    {
      id: "tr-36",
      title: "PMSYM / PMKMY Pension Data Update & Modification Process",
      titleOdia: "PMSYM ରେ ଡାଟା ସଂଶୋଧନ କରନ୍ତୁ | Modify in PMSYM, PMKMY",
      category: "Government Schemes",
      youtubeId: "1Ygejs5ZGAQ",
      desc: "Pradhan Mantri Shram Yogi Maandhan pension account nominee correction and bank change.",
      duration: "07:50 min",
      views: "8.2K",
      badge: "Pension"
    },
    {
      id: "tr-37",
      title: "PM-KISAN 17th / 18th Installment Date & Beneficiary List Verification",
      titleOdia: "ପିଏମ କିଷାନ କିସ୍ତି ତାରିଖ ଓ ଲିଷ୍ଟ | PM Kisan Installment Final Date",
      category: "Banking",
      youtubeId: "XLahbSW1jcU",
      desc: "PM-KISAN DBT credit date, FTO generated status, and PFMS acceptance check.",
      duration: "09:10 min",
      views: "21.5K",
      badge: "PM-KISAN"
    },
    {
      id: "tr-38",
      title: "APAAR ID Card Odisha (One Nation One Student ID Card Registration)",
      titleOdia: "APAAR ID Card Odisha | One Nation One Student ID Card",
      category: "e-Governance",
      youtubeId: "tLNuimV-O8o",
      desc: "Complete guide on Apaar ID card generation, downloading digital card, and Digilocker sync.",
      duration: "10:30 min",
      views: "14.9K",
      badge: "APAAR"
    }
  ],

  // Latest Announcements / News Ticker
  announcements: [
    {
      id: "ann-1",
      text: "📢 VUO CSC HELP: All VLEs are requested to download their 2026 digital membership I-Card from the portal.",
      textOdia: "📢 VUO CSC HELP: ସମସ୍ତ VLE ନିଜର ୨୦୨୬ ଡିଜିଟାଲ ପରିଚୟ ପତ୍ର (I-Card) ପୋର୍ଟାଲରୁ ଡାଉନଲୋଡ଼ କରନ୍ତୁ।",
      date: "August 2026",
      urgent: true
    },
    {
      id: "ann-2",
      text: "🚀 New Feature: 8-Photo & 16-Photo A4 Pass Photo Print Maker is now live with 1-click background tinting!",
      textOdia: "🚀 ନୂତନ ଫିଚର: A4 ପାସପୋର୍ଟ ଫଟୋ ପ୍ରିଣ୍ଟ ମେକର ଏବେ ଲାଇଭ୍ ହୋଇଛି!",
      date: "August 2026",
      urgent: false
    },
    {
      id: "ann-3",
      text: "🔔 Subhadra Yojana Form submission ongoing across all CSC Kendra in Odisha — Check training videos for guidelines.",
      textOdia: "🔔 ସୁଭଦ୍ରା ଯୋଜନା ଆବେଦନ ଜାରି ରହିଛି — ସହାୟତା ପାଇଁ ଟ୍ରେନିଂ ଭିଡ଼ିଓ ଦେଖନ୍ତୁ।",
      date: "August 2026",
      urgent: true
    },
    {
      id: "ann-4",
      text: "📄 CSC Bill Maker now supports saving shop details and generating instant thermal & A4 customer receipts with QR.",
      textOdia: "📄 CSC ବିଲ୍ ମେକର ଦ୍ୱାରା ନିଜ ଦୋକାନ ନାମରେ ଗ୍ରାହକ ବିଲ୍ ତିଆରି କରନ୍ତୁ।",
      date: "August 2026",
      urgent: false
    }
  ],

  // Standard CSC Bill Services Presets
  billServices: [
    { name: "Aadhaar Card Color PVC Print & Lamination", rate: 50 },
    { name: "New PAN Card Application (Form 49A)", rate: 150 },
    { name: "PAN Card Correction / Duplicate", rate: 150 },
    { name: "e-District Caste / Income / Residence Certificate", rate: 60 },
    { name: "Subhadra Yojana Application & Document Upload", rate: 50 },
    { name: "Bhulekh Land RoR / Patta Print (Per Page)", rate: 20 },
    { name: "Electricity Bill Payment (Discom Odisha)", rate: 20 },
    { name: "PM Kisan Samman Nidhi e-KYC Biometric", rate: 30 },
    { name: "Ration Card e-KYC / Member Addition", rate: 40 },
    { name: "AEPS Cash Withdrawal Banking Service", rate: 20 },
    { name: "Fastag Recharge / New Fastag Issuance", rate: 100 },
    { name: "Passport Size Photograph (8 Copies Sheet)", rate: 50 },
    { name: "Passport Size Photograph (16 Copies Sheet)", rate: 80 },
    { name: "Police Clearance Certificate (PCC)", rate: 100 },
    { name: "State Scholarship Online Application", rate: 70 },
    { name: "Job Resume / Bio-Data Typing & Print", rate: 60 },
    { name: "Colour Document Scan & Email / PDF", rate: 20 },
    { name: "Black & White Xerox / Print (Per Page)", rate: 5 }
  ],

  // Sample Pre-registered VLE Members (for instant preview & test)
  sampleMembers: [
    {
      memberNo: "VUO-2026-OD-1082",
      cscId: "782910482910",
      fullName: "Jagannath Mohanty",
      mobile: "9937037131",
      email: "jdjagannath@gmail.com",
      district: "Puri",
      block: "Satyabadi",
      gp: "Satyabadi",
      status: "Active (Verified VLE)",
      designation: "VLE Coordinator",
      joiningDate: "12-Jan-2024",
      validity: "2026 - 2029",
      bloodGroup: "O+",
      passwordHash: "123456" // demo test
    },
    {
      memberNo: "VUO-2026-OD-2491",
      cscId: "654819201948",
      fullName: "Priyanka Sahoo",
      mobile: "9937037131",
      email: "jdjagannath@gmail.com",
      district: "Puri",
      block: "Satyabadi",
      gp: "Satyabadi",
      status: "Active (Verified VLE)",
      designation: "Active VLE Member",
      joiningDate: "05-May-2024",
      validity: "2026 - 2029",
      bloodGroup: "B+",
      passwordHash: "123456"
    }
  ],
  // CSC Offline Application PDF Forms & Formats (Admin Manageable)
  forms: [
    // --- USER DESKTOP CSC OFFLINE FORMS ---
    {
      id: "form-aadhaar-18plus",
      title: "Aadhaar Enrolment & Update Form (18+ Years)",
      titleOdia: "ଆଧାର ନାମାଙ୍କନ ଓ ସଂଶୋଧନ ଫର୍ମ (୧୮ ବର୍ଷରୁ ଊର୍ଦ୍ଧ୍ୱ)",
      category: "pan_aadhaar",
      categoryName: "PAN & Aadhaar",
      fileUrl: "forms/18 +.pdf",
      size: "380 KB",
      pages: "2 Pages",
      desc: "Official UIDAI Aadhaar enrolment and demographic / biometric correction form for adult citizens (18+ years).",
      tags: ["Aadhaar", "UIDAI", "Adult 18+", "Correction", "Biometric"],
      isOfficial: true
    },
    {
      id: "form-aadhaar-5-18",
      title: "Aadhaar Enrolment & Update Form (5 to 18 Years)",
      titleOdia: "ଆଧାର ନାମାଙ୍କନ ଓ ସଂଶୋଧନ ଫର୍ମ (୫ ରୁ ୧୮ ବର୍ଷ ପିଲାଙ୍କ ପାଇଁ)",
      category: "pan_aadhaar",
      categoryName: "PAN & Aadhaar",
      fileUrl: "forms/5-18.pdf",
      size: "379 KB",
      pages: "2 Pages",
      desc: "Official UIDAI Aadhaar enrolment and update form for children and students between 5 to 18 years.",
      tags: ["Aadhaar", "Child", "Student", "UIDAI", "Update"],
      isOfficial: true
    },
    {
      id: "form-uidai-standard",
      title: "UIDAI Standard Certificate for Aadhaar Enrolment / Update",
      titleOdia: "UIDAI ଆଧାର ପ୍ରମାଣପତ୍ର ଫର୍ମାଟ (ଗେଜେଟେଡ୍ ଅଫିସର / ସରପଞ୍ଚ / MLA ସାଇନ୍)",
      category: "pan_aadhaar",
      categoryName: "PAN & Aadhaar",
      fileUrl: "forms/UIDAI Standard Form.pdf",
      size: "519 KB",
      pages: "1 Page",
      desc: "Certificate format for Aadhaar enrolment / address update valid with sign of Gazetted Officer, MP/MLA, Tehsildar, or Head of Institution.",
      tags: ["UIDAI", "Certificate", "Gazetted", "Sarpanch", "Address Proof"],
      isOfficial: true
    },
    {
      id: "form-hof-aadhaar",
      title: "Head of Family (HoF) Based Address Update Form for Aadhaar",
      titleOdia: "ଆଧାର ପରିବାର ମୁଖ୍ୟ (HoF) ଆଧାରିତ ଠିକଣା ପରିବର୍ତ୍ତନ ଫର୍ମ",
      category: "pan_aadhaar",
      categoryName: "PAN & Aadhaar",
      fileUrl: "forms/hf based adress form.pdf",
      size: "28 KB",
      pages: "1 Page",
      desc: "Self-declaration format for sharing address by Head of Family (HoF) to immediate family member for Aadhaar address update.",
      tags: ["HoF", "Aadhaar", "Family", "Address", "UIDAI"],
      isOfficial: true
    },
    {
      id: "form-boi-bc",
      title: "Bank of India (BOI) BC Account Opening Form",
      titleOdia: "ବ୍ୟାଙ୍କ ଅଫ ଇଣ୍ଡିଆ (BOI) BC ଗ୍ରାହକ ଖାତା ଖୋଲା ଫର୍ମ",
      category: "banking",
      categoryName: "Banking & CSP",
      fileUrl: "forms/AC Open Form For BC BOI.pdf",
      size: "730 KB",
      pages: "3 Pages",
      desc: "Official Customer Account Opening Form for Business Correspondents (BC / CSP) of Bank of India.",
      tags: ["Bank of India", "BOI", "BC", "Account Opening", "CSP"],
      isOfficial: true
    },
    {
      id: "form-15g",
      title: "Form 15G - Declaration for Nil / No TDS Deduction on Interest (Sec 197A)",
      titleOdia: "ଫର୍ମ ୧୫G - ବ୍ୟାଙ୍କ ଟିଡିଏସ (TDS) ଛାଡ଼ ଘୋଷଣାନାମା (ଧାରା 197A)",
      category: "banking",
      categoryName: "Banking & CSP",
      fileUrl: "forms/Form15G.pdf",
      size: "365 KB",
      pages: "2 Pages",
      desc: "Official Income Tax declaration under section 197A(1) and 197A(1A) [Rule 29C] (Part I & Part II) for non-deduction of tax on bank fixed deposit interest & securities.",
      tags: ["Form 15G", "TDS Exemption", "Income Tax", "Bank Interest", "Rule 29C"],
      isOfficial: true
    },
    {
      id: "form-121",
      title: "Form 121 - Declaration for Receipt of Incomes Without TDS (Sec 393(6) / Rule 211)",
      titleOdia: "ଫର୍ମ ୧୨୧ - ଟିଡିଏସ (TDS) ଛାଡ଼ ଆୟକର ଘୋଷଣାନାମା (ନିୟମ ୨୧୧)",
      category: "banking",
      categoryName: "Banking & CSP",
      fileUrl: "forms/Form121.pdf",
      size: "82 KB",
      pages: "3 Pages",
      desc: "Official Income Tax declaration under section 393(6) [Rule 211] (Part A & Part B) for receiving PF balance, insurance commission, rent, securities interest & dividend without tax deduction.",
      tags: ["Form 121", "Income Tax", "TDS Exemption", "Rule 211", "Section 393(6)", "Declaration"],
      isOfficial: true
    },
    {
      id: "form-decl-income",
      title: "Self Declaration for Income Certificate (Odisha Form No. 1 / e-District)",
      titleOdia: "ଆୟ ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା (ଫର୍ମ ନଂ ୧, e-District ଓଡ଼ିଶା)",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR ISSUE OF INCOME CERTIFICATE.pdf",
      size: "132 KB",
      pages: "1 Page",
      desc: "Official self-declaration format under Odisha Miscellaneous Certificate Rules, 1984 for annual family income from agriculture, salary, and business for e-District Odisha (Revenue & Disaster Management Dept).",
      tags: ["Income Certificate", "Self Declaration", "Form 1", "e-District Odisha", "Puri", "Revenue"],
      isOfficial: true
    },
    {
      id: "form-decl-residence",
      title: "Self Declaration for Residence Certificate (e-District Odisha)",
      titleOdia: "ସ୍ଥାୟୀ ବାସିନ୍ଦା ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା (e-District ଓଡ଼ିଶା)",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR ISSUE OF RESIDENCE CERTIFICATE.pdf",
      size: "130 KB",
      pages: "1 Page",
      desc: "Official resident self-declaration form for Odisha e-District portal Resident Certificate application.",
      tags: ["Residence", "Domicile", "Self Declaration", "e-District"],
      isOfficial: true
    },
    {
      id: "form-decl-scst",
      title: "Self Declaration for SC / ST Certificate (e-District Odisha)",
      titleOdia: "ଅନୁସୂଚିତ ଜାତି / ଜନଜାତି (SC/ST) ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR ISSUE OF S.C_S.T. CERTIFICATE.pdf",
      size: "131 KB",
      pages: "1 Page",
      desc: "Official self-declaration format for Scheduled Caste (SC) and Scheduled Tribe (ST) certificate in Odisha.",
      tags: ["SC", "ST", "Caste", "Self Declaration", "e-District"],
      isOfficial: true
    },
    {
      id: "form-decl-sebc",
      title: "Self Declaration for SEBC Certificate (e-District Odisha)",
      titleOdia: "SEBC ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା (e-District ଓଡ଼ିଶା)",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR ISSUE OF S.E.B.C CERTIFICATE.pdf",
      size: "135 KB",
      pages: "1 Page",
      desc: "Official self-declaration format for Socially and Educationally Backward Classes (SEBC) certificate.",
      tags: ["SEBC", "Backward Class", "Self Declaration", "e-District"],
      isOfficial: true
    },
    {
      id: "form-decl-obc",
      title: "Self Declaration for OBC Certificate (Odisha Form No. 1 / Central Format)",
      titleOdia: "OBC ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା (ଅନ୍ୟ ପଛୁଆ ବର୍ଗ, e-District ଓଡ଼ିଶା)",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR ISSUE OF O.B.C CERTIFICATE.pdf",
      size: "135 KB",
      pages: "1 Page",
      desc: "Official self-declaration format for Other Backward Class (OBC) non-creamy layer certificate under Odisha Miscellaneous Certificate Rules, 1984 (Govt. of Odisha R&DM Dept).",
      tags: ["OBC Certificate", "Non-Creamy", "Self Declaration", "Form 1", "e-District Odisha"],
      isOfficial: true
    },
    {
      id: "form-decl-cews",
      title: "Self Declaration for Economically Weaker Section (EWS) Certificate",
      titleOdia: "EWS (ଅର୍ଥନୈତିକ ଦୁର୍ବଳ ବର୍ଗ) ପ୍ରମାଣ ପତ୍ର ସ୍ୱ-ଘୋଷଣାନାମା",
      category: "affidavits",
      categoryName: "Affidavits & Declarations",
      fileUrl: "forms/SELF DECLARATION FOR CEWS.pdf",
      size: "89 KB",
      pages: "1 Page",
      desc: "Self-declaration format for income & assets required for Economically Weaker Section (EWS) certificate.",
      tags: ["EWS", "General Category", "Income Assets", "Affidavit"],
      isOfficial: true
    },
    {
      id: "form-legalheir-od",
      title: "Legal Heir Certificate Application Form (e-District Odisha)",
      titleOdia: "ଆଇନଗତ ଉତ୍ତରାଧିକାରୀ (Legal Heir) ଆବେଦନ ଫର୍ମ",
      category: "edistrict",
      categoryName: "e-District & Revenue",
      fileUrl: "forms/ligal hire form.pdf",
      size: "235 KB",
      pages: "2 Pages",
      desc: "Official application format for Legal Heir Certificate from Tahasildar / Revenue Department Odisha.",
      tags: ["Legal Heir", "Uttardhikari", "e-District", "Tahasil", "Death Claim"],
      isOfficial: true
    },
    {
      id: "form-labour-card",
      title: "Odisha Labour Card (Shramik) Registration Form",
      titleOdia: "ଓଡ଼ିଶା ଶ୍ରମିକ / ଲେବର କାର୍ଡ (Labour Card) ଆବେଦନ ଫର୍ମ",
      category: "general",
      categoryName: "General CSC Formats",
      fileUrl: "forms/FORM LEBOUR CARD.pdf",
      size: "211 KB",
      pages: "2 Pages",
      desc: "Official application format for Odisha Building and Other Construction Workers (OBOCW) Labour Card registration.",
      tags: ["Labour Card", "Shramik", "OBOCW", "Nirman Sramik", "Odisha"],
      isOfficial: true
    },
    {
      id: "form-sahamati-paddy",
      title: "Paddy Procurement Consent Form (ସହମତି ପତ୍ର - Krushak Panjikaran)",
      titleOdia: "ଧାନ ବିକ୍ରି ଚାଷୀ ସହମତି ପତ୍ର (କୃଷକ ପଞ୍ଜୀକରଣ)",
      category: "agriculture",
      categoryName: "Agriculture & PM Kisan",
      fileUrl: "forms/SAHAMATI PATRA PADDY.pdf",
      size: "59 KB",
      pages: "1 Page",
      desc: "Farmer land owner consent letter (Sahamati Patra) for Paddy Procurement registration in Odisha.",
      tags: ["Paddy", "Dhana Biki", "Sahamati Patra", "Krushak", "PACS"],
      isOfficial: true
    },
    {
      id: "form-genealogy-paddy",
      title: "Paddy Procurement Self Genealogy / Banshabali Declaration",
      titleOdia: "ଚାଷୀ ବଂଶାବଳୀ / ଉତ୍ତରାଧିକାର ଘୋଷଣାନାମା (ଧାନ କ୍ରୟ ସମିତି)",
      category: "agriculture",
      categoryName: "Agriculture & PM Kisan",
      fileUrl: "forms/self genelogy PADDY.pdf",
      size: "188 KB",
      pages: "1 Page",
      desc: "Self genealogy / family tree affidavit format for Paddy Procurement when land record is in ancestors' name.",
      tags: ["Genealogy", "Banshabali", "Paddy", "Farmer", "RoR"],
      isOfficial: true
    },
    {
      id: "form-bhaga-chasi",
      title: "Bhaga Chasi (Sharecropper) Declaration Form",
      titleOdia: "ଭାଗ ଚାଷୀ ଘୋଷଣା ପତ୍ର (କୃଷକ ପଞ୍ଜୀକରଣ ଓ ସହାୟତା)",
      category: "agriculture",
      categoryName: "Agriculture & PM Kisan",
      fileUrl: "forms/bhaga chasi.pdf",
      size: "112 KB",
      pages: "1 Page",
      desc: "Sharecropper declaration format for agricultural schemes, seed subsidy, and mandi token registration.",
      tags: ["Bhaga Chasi", "Sharecropper", "Krushak", "Farmer", "Agriculture"],
      isOfficial: true
    },
    {
      id: "form-fasal-bima",
      title: "PM Fasal Bima Yojana (PMFBY) Crop Insurance Form",
      titleOdia: "ପ୍ରଧାନମନ୍ତ୍ରୀ ଫସଲ ବୀମା ଯୋଜନା (PMFBY) ଆବେଦନ ଫର୍ମ",
      category: "agriculture",
      categoryName: "Agriculture & PM Kisan",
      fileUrl: "forms/fasal bima.pdf",
      size: "11 MB",
      pages: "Full Set",
      desc: "Comprehensive Pradhan Mantri Fasal Bima Yojana crop loss declaration and farmer insurance format.",
      tags: ["PMFBY", "Crop Insurance", "Fasal Bima", "Farmer", "Claim"],
      isOfficial: true
    },
    {
      id: "form-anganwadi-1",
      title: "Anganwadi Worker / Helper Application Form (Part 1)",
      titleOdia: "ଅଙ୍ଗନୱାଡ଼ି କର୍ମୀ / ସହାୟିକା ନିଯୁକ୍ତି ଆବେଦନ ଫର୍ମ (ଭାଗ - ୧)",
      category: "general",
      categoryName: "General CSC Formats",
      fileUrl: "forms/ANGANWADI 1.pdf",
      size: "11 MB",
      pages: "Full Format",
      desc: "Official application format for recruitment of Anganwadi Workers and Helpers in Odisha W&CD Department.",
      tags: ["Anganwadi", "Worker", "Helper", "WCD", "Job Application"],
      isOfficial: true
    },
    {
      id: "form-anganwadi-2",
      title: "Anganwadi Worker / Helper Application Form (Part 2)",
      titleOdia: "ଅଙ୍ଗନୱାଡ଼ି କର୍ମୀ / ସହାୟିକା ଆବେଦନ ଫର୍ମ (ଭାଗ - ୨ / ଡକ୍ୟୁମେଣ୍ଟ ଯାଞ୍ଚ)",
      category: "general",
      categoryName: "General CSC Formats",
      fileUrl: "forms/ANGANWADI 2.pdf",
      size: "20 MB",
      pages: "Full Format",
      desc: "Verification checklist and candidate undertaking for Anganwadi recruitment in Odisha.",
      tags: ["Anganwadi", "Recruitment", "Checklist", "Job Form"],
      isOfficial: true
    },
    {
      id: "form-vehicle-sale",
      title: "Vehicle Sale & Transfer Declaration (RTO Odisha)",
      titleOdia: "ଗାଡ଼ି ବିକ୍ରୟ ଓ ମାଲିକାନା ହସ୍ତାନ୍ତର ଘୋଷଣାନାମା (RTO)",
      category: "general",
      categoryName: "General CSC Formats",
      fileUrl: "forms/Diclaration of sale vehicle.pdf",
      size: "260 KB",
      pages: "1 Page",
      desc: "Official vehicle sale declaration affidavit for vehicle ownership transfer (Form 29/30 RTO process).",
      tags: ["RTO", "Vehicle Sale", "Ownership Transfer", "Affidavit", "Vahan"],
      isOfficial: true
    },
    {
      id: "form-ri-bhata",
      title: "Revenue Inspector (RI) Verification Report for Social Pension / Bhata",
      titleOdia: "ସାମାଜିକ ସୁରକ୍ଷା ଭତ୍ତା (ପେନସନ) RI ରିପୋର୍ଟ ଓ ତଦନ୍ତ ଫର୍ମ",
      category: "edistrict",
      categoryName: "e-District & Revenue",
      fileUrl: "forms/ri form bhata.pdf",
      size: "93 KB",
      pages: "1 Page",
      desc: "RI verification enquiry report format for Old Age, Widow, and Disability Pension under MBPY/NSAP schemes.",
      tags: ["RI Report", "Pension", "Bhata", "MBPY", "Social Security"],
      isOfficial: true
    },
    {
      id: "form-monthly-vle",
      title: "VLE Monthly CSC Operations & Progress Report Format",
      titleOdia: "VLE ମାସିକ CSC କାର୍ଯ୍ୟ ଓ ରିପୋର୍ଟ ଫର୍ମାଟ",
      category: "general",
      categoryName: "General CSC Formats",
      fileUrl: "forms/monthly form.pdf",
      size: "1.9 MB",
      pages: "Format",
      desc: "Monthly transaction log and CSC center operations format for District / State VLE tracking.",
      tags: ["VLE Report", "Monthly Format", "CSC Operations", "Report"],
      isOfficial: true
    }
  ],

  // Donation & Support QR Code Settings (Admin Manageable)
  donationSettings: {
    upiId: "9937037131@ybl",
    payeeName: "VLE HELP DESK ODISHA",
    bankName: "Odisha Gramya Bank / SBI",
    accountNumber: "9937037131",
    ifscCode: "OGBA0001082",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3D9937037131%40ybl%26pn%3DVLE%2520HELP%2520DESK%26cu%3DINR",
    note: "Your voluntary contribution supports server hosting, free tool development & VLE union legal assistance."
  },

  // Full HD Welcome Announcement Popup Settings (Admin Manageable)
  popupSettings: {
    enabled: true,
    title: "Official Digital Updates — VLE HELP DESK",
    titleOdia: "ଅଫିସିଆଲ୍ ନୋଟିସ୍ ଓ ସୂଚନା — VLE HELP DESK",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
    headline: "Welcome to VLE HELP DESK Portal 2026",
    message: "All CSC Digital Tools, Pass Photo AI Studio (Cutout.pro style), Resume Creator, Odisha Govt Schemes & YouTube Training Videos are live and free for all VLEs.",
    badgeText: "📢 OFFICIAL NOTIFICATION",
    buttonText: "Explore Digital Tools",
    buttonLink: "#passphoto"
  }
};

// Initialize LocalStorage Data Store (Only populate defaults if not already present)
function initVuoStore() {
  if (!localStorage.getItem('vuo_members')) {
    localStorage.setItem('vuo_members', JSON.stringify(VUO_DATA.sampleMembers));
  }
  if (!localStorage.getItem('vuo_links')) {
    localStorage.setItem('vuo_links', JSON.stringify(VUO_DATA.links));
  }
  const existingFormsStr = localStorage.getItem('vuo_forms');
  if (!existingFormsStr) {
    localStorage.setItem('vuo_forms', JSON.stringify(VUO_DATA.forms));
  } else {
    try {
      const existing = JSON.parse(existingFormsStr) || [];
      const deletedIds = JSON.parse(localStorage.getItem('vuo_forms_deleted') || '[]');
      // Retain custom forms first
      const customForms = existing.filter(f => f.isCustom && !deletedIds.includes(f.id));
      const existingIds = new Set(existing.map(f => f.id));
      const merged = [...customForms];
      VUO_DATA.forms.forEach(f => {
        if (!deletedIds.includes(f.id) && !merged.some(m => m.id === f.id)) {
          merged.push(f);
        }
      });
      // Strip any huge base64 dataUrl from localStorage to keep it lightweight (<10KB)
      const lightweight = merged.map(f => {
        const copy = { ...f };
        if (copy.dataUrl && copy.dataUrl.length > 500) {
          copy.hasIndexedDbData = true;
          delete copy.dataUrl;
        }
        return copy;
      });
      localStorage.setItem('vuo_forms', JSON.stringify(lightweight));
    } catch (e) {
      console.warn("Forms init warning:", e);
    }
  }
  if (!localStorage.getItem('vuo_training')) {
    localStorage.setItem('vuo_training', JSON.stringify(VUO_DATA.trainingVideos));
  }
  if (!localStorage.getItem('vuo_announcements')) {
    localStorage.setItem('vuo_announcements', JSON.stringify(VUO_DATA.announcements));
  }
  if (!localStorage.getItem('vuo_donation')) {
    localStorage.setItem('vuo_donation', JSON.stringify(VUO_DATA.donationSettings));
  }
  if (!localStorage.getItem('vuo_popup')) {
    localStorage.setItem('vuo_popup', JSON.stringify(VUO_DATA.popupSettings));
  }
  if (!localStorage.getItem('vuo_tickets')) {
    localStorage.setItem('vuo_tickets', JSON.stringify([]));
  }
}

initVuoStore();

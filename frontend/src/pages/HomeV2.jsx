import { useState, useEffect } from "react";
import { Link } from "react-router";
import nagarSwarLogo from "../assets/nagarswar-logo.png";
import cityPulseImage from "../assets/city-pulse-illustration.png";
import potholeImg from "../assets/pothole-before.webp";
import Icon from "../components/Icons";
import BlurText from "../components/ui/amicro/BlurText";
import MagneticButton from "../components/ui/amicro/MagneticButton";
import CitizenProfileModal from "../components/CitizenProfileModal";
import { getCitizenUser, getCitizenToken, getAdminToken, clearCitizenSession, clearAdminSession } from "../services/api";
import "./HomeV2.css";


const translations = {
  en: {
    home: "Home",
    report: "Report Issue",
    map: "Live Map",
    alerts: "Safety Alerts",
    rewards: "Civic Rewards",
    track: "Track Status",
    signIn: "Sign In",
    adminPortal: "Admin Portal",

    heroEyebrow: "INTELLIGENT MUNICIPAL REDRESSAL • CIVICOS",
    heroOne: "Empower your city.",
    heroTwo: "Elevate civic trust.",
    heroThree: "Resolve issues seamlessly.",

    description:
      "Autonomous civic governance platform powered by multimodal vision AI, real-time spatial deduplication, and transparent field dispatch.",

    reportButton: "Submit Public Issue",
    exploreMap: "Explore Live City Map",

    verified: "AI-Verified Evidence",
    transparent: "100% Transparent Tracking",

    statementLeft: "A platform purpose-built, to transform civic governance.",
    statementQuote:
      "“The true measure of a smart city is not its infrastructure alone, but the speed, transparency, and empathy with which it resolves the grievances of its citizens.”",
    statementAuthor: "— NagarSwar Civic Intelligence Standard",

    showcaseTitle: "How does AI empower citizens & municipalities in real-time?",
    showcaseSubtitle: "From immediate multimodal capture to verified resolution on the ground.",

    intakeTitle: "Instant AI Intake & Verification",
    intakeDesc:
      "Citizens capture a photo or speak naturally in Hindi, English, or Odia. Google Gemini evaluates visual damage severity, classifies municipal jurisdiction, and locks precise geofenced coordinates in under 400 milliseconds.",

    testVoiceBtn: "Test Voice Input",
    listening: "Listening actively...",

    warningTitle: "Early Hazard Warnings & Municipal Alerts",
    safetyGuide: "View Safety Protocol",
    featuresTitle: "Next-generation tools for responsive public administration",
  },

  hi: {
    home: "होम",
    report: "समस्या दर्ज करें",
    map: "लाइव मानचित्र",
    alerts: "सुरक्षा अलर्ट",
    rewards: "नागरिक पुरस्कार",
    track: "स्थिति देखें",
    signIn: "लॉगिन",
    adminPortal: "प्रशासन पोर्टल",

    heroEyebrow: "स्मार्ट नागरिक शिकायत निवारण • सिविक-ओएस",
    heroOne: "शहर सशक्त बनाएं।",
    heroTwo: "नागरिक विश्वास जगाएं।",
    heroThree: "समस्याएं तुरंत सुलझाएं।",

    description:
      "मल्टीमॉडल विजन AI, रियल-टाइम डुप्लीकेट डिटेक्शन और पारदर्शी फील्ड डिस्पैच के साथ नागरिक समस्याओं का त्वरित और सटीक समाधान।",

    reportButton: "समस्या दर्ज करें",
    exploreMap: "लाइव सिटी मैप देखें",

    verified: "AI-सत्यापित साक्ष्य",
    transparent: "100% पारदर्शी ट्रैकिंग",

    statementLeft: "एक समर्पित आधुनिक मंच, पारदर्शी नागरिक शासन के लिए।",
    statementQuote:
      "“एक महान शहर की पहचान केवल उसकी इमारतों से नहीं, बल्कि अपने नागरिकों की समस्याओं को सुलझाने की तत्परता और पारदर्शिता से होती है।”",
    statementAuthor: "— नगरस्वर नागरिक सेवा मानक",

    showcaseTitle: "AI नागरिकों और नगर निगम को वास्तविक समय में कैसे सशक्त बनाता है?",
    showcaseSubtitle: "शिकायत की पहली फोटो से लेकर जमीनी स्तर पर समाधान तक संपूर्ण स्वचालन।",

    intakeTitle: "त्वरित AI सत्यापन एवं विश्लेषण",
    intakeDesc:
      "नागरिक फोटो खींचें या अपनी भाषा में बोलें। जेमिनी AI नुकसान की गंभीरता मापता है, संबंधित विभाग को टैग करता है और 400 मिलीसेकंड में सटीक जीपीएस लोकेशन दर्ज करता है।",

    testVoiceBtn: "आवाज इनपुट जांचें",
    listening: "आवाज सुनी जा रही है...",

    warningTitle: "प्रारंभिक चेतावनी और आपदा सुरक्षा अलर्ट",
    safetyGuide: "सुरक्षा गाइड देखें",
    featuresTitle: "सशक्त और सुरक्षित शहर के लिए आधुनिक AI सुविधाएं",
  },

  od: {
    home: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    report: "ସମସ୍ୟା ଜଣାନ୍ତୁ",
    map: "ଲାଇଭ୍ ମ୍ୟାପ୍",
    alerts: "ସୁରକ୍ଷା ଆଲର୍ଟ",
    rewards: "ନାଗରିକ ପୁରସ୍କାର",
    track: "ସ୍ଥିତି ଦେଖନ୍ତୁ",
    signIn: "ଲଗଇନ୍",
    adminPortal: "ପ୍ରଶାସନ ପୋର୍ଟାଲ",

    heroEyebrow: "ବୁଦ୍ଧିମାନ ନାଗରିକ ଅଭିଯୋଗ ନିବାରଣ • ସିଭିକ-ଓଏସ",
    heroOne: "ସହର ସଶକ୍ତ କରନ୍ତୁ।",
    heroTwo: "ବିଶ୍ୱାସ ସୃଷ୍ଟି କରନ୍ତୁ।",
    heroThree: "ସମସ୍ୟା ଶୀଘ୍ର ସମାଧାନ କରନ୍ତୁ।",

    description:
      "ମଲ୍ଟିମୋଡାଲ ଭିଜନ AI, ରିଅଲ-ଟାଇମ ଡୁପ୍ଲିକେଟ ଚିହ୍ନଟ ଏବଂ ସ୍ୱଚ୍ଛ ଟ୍ରାକିଂ ସହିତ ଆପଣଙ୍କ ସହରକୁ ଉନ୍ନତ କରିବା ପାଇଁ ଏକ ବୁଦ୍ଧିମାନ ମଞ୍ଚ।",

    reportButton: "ସମସ୍ୟା ଦାଖଲ କରନ୍ତୁ",
    exploreMap: "ଲାଇଭ୍ ମ୍ୟାପ୍ ଦେଖନ୍ତୁ",

    verified: "AI ପ୍ରମାଣିତ ତଥ୍ୟ",
    transparent: "୧୦୦% ସ୍ୱଚ୍ଛ ନିରୀକ୍ଷଣ",

    statementLeft: "ନାଗରିକ ଶାସନକୁ ରୂପାନ୍ତରିତ କରିବା ପାଇଁ ଏକ ସ୍ୱତନ୍ତ୍ର ପ୍ଲାଟଫର୍ମ।",
    statementQuote:
      "“ଗୋଟିଏ ସହରର ପ୍ରକୃତ ପରିଚୟ ଏହାର କୋଠାବାଡିରେ ନୁହେଁ, ବରଂ ଏହାର ନାଗରିକଙ୍କ ସମସ୍ୟାକୁ କେତେ ଶୀଘ୍ର ସମାଧାନ କରାଯାଏ ତାହା ଉପରେ ନିର୍ଭର କରେ।”",
    statementAuthor: "— ନଗରସ୍ୱର ନାଗରିକ ସେବା ମାନକ",

    showcaseTitle: "AI କିପରି ବାସ୍ତବ ସମୟରେ ନାଗରିକ ଓ ପ୍ରଶାସନକୁ ସଶକ୍ତ କରେ?",
    showcaseSubtitle: "ସମସ୍ୟା ଫଟୋ ଅପଲୋଡ଼ ଠାରୁ କ୍ଷେତ୍ର ସମାଧାନ ପର୍ଯ୍ୟନ୍ତ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ୱଚ୍ଛତା।",

    intakeTitle: "ତୁରନ୍ତ AI ଯାଞ୍ଚ ଓ ନିରୀକ୍ଷଣ",
    intakeDesc:
      "ନାଗରିକମାନେ ଫଟୋ କିମ୍ବା ଓଡ଼ିଆରେ କହି ସମସ୍ୟା ଜଣାଇପାରିବେ। ଜେମିନି AI କ୍ଷତିର ଗୁରୁତ୍ୱ ନିର୍ଦ୍ଧାରଣ କରି ବିଭାଗକୁ ପଠାଇଥାଏ।",

    testVoiceBtn: "ଭଏସ୍ ଇନପୁଟ୍ ପରୀକ୍ଷା",
    listening: "ଶୁଣାଯାଉଛି...",

    warningTitle: "ପୂର୍ବ ସତର୍କତା ଏବଂ ସୁରକ୍ଷା ଆଲର୍ଟ",
    safetyGuide: "ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ",
    featuresTitle: "ସୁରକ୍ଷିତ ଏବଂ ଉନ୍ନତ ସହର ପାଇଁ ସ୍ମାର୍ଟ ସୁବିଧା",
  },
};

const pulseTranslations = {
  en: {
    title: "City Operations Telemetry",
    live: "LIVE TELEMETRY",
    subtitle: "Real-time municipal health and resolution velocity",
    prototype: "Active Municipal Nodes",
    active: "Open Grievances",
    resolvedWeek: "Resolved This Week",
    rate: "Resolution Efficiency",
    high: "Urgent Incidents",
    latest: "Featured Incident Audit",
    viewAll: "Track All Records",
    submitted: "Logged",
    verified: "Verified",
    assigned: "Dispatched",
    resolved: "Resolved",
  },
  hi: {
    title: "सिटी ऑपरेशंस टेलीमेट्री",
    live: "लाइव टेलीमेट्री",
    subtitle: "शहर की नागरिक समस्याओं और समाधान की वास्तविक स्थिति",
    prototype: "सक्रिय नोड्स",
    active: "सक्रिय समस्याएं",
    resolvedWeek: "इस सप्ताह समाधान",
    rate: "समाधान दर",
    high: "अति-गंभीर मामले",
    latest: "हालिया नागरिक शिकायत",
    viewAll: "सभी ट्रैक करें",
    submitted: "प्राप्त",
    verified: "सत्यापित",
    assigned: "असाइन",
    resolved: "समाधान",
  },
  od: {
    title: "ସିଟି ଅପରେସନ୍ସ ଟେଲିମେଟ୍ରି",
    live: "ଲାଇଭ୍ ଟେଲିମେଟ୍ରି",
    subtitle: "ସହରର ନାଗରିକ ସମସ୍ୟା ଓ ସମାଧାନର ବାସ୍ତବ ସ୍ଥିତି",
    prototype: "ସକ୍ରିୟ ନୋଡ଼୍ସ",
    active: "ସକ୍ରିୟ ସମସ୍ୟା",
    resolvedWeek: "ଏହି ସପ୍ତାହର ସମାଧାନ",
    rate: "ସମାଧାନ ହାର",
    high: "ଜରୁରୀ ସମସ୍ୟା",
    latest: "ନିକଟତମ ଅଭିଯୋଗ ଟ୍ରାକିଂ",
    viewAll: "ସବୁ ଦେଖନ୍ତୁ",
    submitted: "ଦାଖଲ",
    verified: "ଯାଞ୍ଚିତ",
    assigned: "ପଠାଗଲା",
    resolved: "ସମାହିତ",
  },
};

const alertData = {
  en: [
    ["cloud-rain", "Heavy Precipitation Advisory", "High"],
    ["cloud-lightning", "Severe Thunderstorm Warning", "High"],
    ["waves", "Urban Waterlogging & Flood Watch", "Medium"],
    ["flame", "Industrial Fire Precaution", "Medium"],
    ["mountain", "Slope Instability & Landslip Risk", "Low"],
    ["activity", "Sub-surface Seismic Vibration", "Low"],
  ],
  hi: [
    ["cloud-rain", "अत्यधिक वर्षा की चेतावनी", "उच्च"],
    ["cloud-lightning", "भीषण तूफान व आकाशीय बिजली", "उच्च"],
    ["waves", "जलभराव एवं बाढ़ निगरानी", "मध्यम"],
    ["flame", "अग्नि सुरक्षा अलर्ट", "मध्यम"],
    ["mountain", "भूस्खलन संभावित क्षेत्र अलर्ट", "कम"],
    ["activity", "भूगर्भीय कंपन चेतावनी", "कम"],
  ],
  od: [
    ["cloud-rain", "ପ୍ରବଳ ବର୍ଷା ସତର୍କତା", "ଉଚ୍ଚ"],
    ["cloud-lightning", "ଘଡ଼ଘଡ଼ି ଓ ବଜ୍ରପାତ ବିପଦ", "ଉଚ୍ଚ"],
    ["waves", "ଜଳବନ୍ଦୀ ଓ ବନ୍ୟା ନିରୀକ୍ଷଣ", "ମଧ୍ୟମ"],
    ["flame", "ଅଗ୍ନିକାଣ୍ଡ ସତର୍କତା", "ମଧ୍ୟମ"],
    ["mountain", "ଭୂସ୍ଖଳନ ସମ୍ଭାବନା ଆଲର୍ଟ", "କମ୍"],
    ["activity", "ଭୂକମ୍ପ ସତର୍କତା", "କମ୍"],
  ],
};

const safetyGuides = [
  {
    icon: "cloud-rain",
    title: "Heavy Precipitation",
    tips: [
      "Avoid traveling through waterlogged subways and low-lying arterial passages.",
      "Keep away from electrical junction boxes, open transformers, and leaning poles.",
      "Report blocked storm-water drains immediately on NagarSwar for emergency suction trucks.",
    ],
  },
  {
    icon: "cloud-lightning",
    title: "Severe Thunderstorms",
    tips: [
      "Seek indoor shelter; avoid taking refuge beneath tall solitary trees or metal sheds.",
      "Unplug high-voltage domestic appliances during active lightning discharges.",
      "Report damaged power lines or fallen distribution poles through the urgent alert hotline.",
    ],
  },
  {
    icon: "waves",
    title: "Urban Waterlogging",
    tips: [
      "Do not drive through flooded underpasses where water depth is visually uncertain.",
      "Store emergency drinking water and critical pharmaceuticals in elevated dry areas.",
      "Check NagarSwar Live City Map for municipal emergency pump deployment zones.",
    ],
  },
  {
    icon: "flame",
    title: "Fire Safety Precaution",
    tips: [
      "Keep building exit stairs and emergency corridors clear of solid waste and debris.",
      "Ensure localized fire extinguishers are inspected, pressurized, and operational.",
      "Dial 101 immediately and report hazardous fuel spills or short-circuits on NagarSwar.",
    ],
  },
  {
    icon: "mountain",
    title: "Slope Instability",
    tips: [
      "Stay alert for sudden mudflows, rolling boulders, or unusual ground settlement cracks.",
      "Evacuate vulnerable hill-edge dwellings if retaining walls show structural deflection.",
      "Report slope drainage blockage to municipal disaster response cells promptly.",
    ],
  },
  {
    icon: "activity",
    title: "Sub-surface Tremors",
    tips: [
      "Drop, Cover, and Hold On beneath reinforced furniture away from exterior glass walls.",
      "Do not use elevators during tremors; evacuate using external structural stairways.",
      "Shut off domestic gas valves and primary electricity breakers upon ground shaking.",
    ],
  },
];

const featureData = [
  {
    icon: "cpu",
    title: "Gemini Vision Audit",
    color: "amber",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    description:
      "Automated damage severity assessment, categorization, and physical hazard scoring using multimodal AI.",
  },
  {
    icon: "layers",
    title: "Spatial Deduplication",
    color: "plum",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    description:
      "500-meter Haversine proximity clustering aggregates repeated reports into unified high-priority municipal tickets.",
  },
  {
    icon: "building",
    title: "Autonomous Dept Routing",
    color: "terracotta",
    gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
    description:
      "Zero-delay routing directly to designated municipal agencies (PWD, Water, Sanitation) with real-time SLA tracking.",
  },
];

function HomeV2() {
  const [language, setLanguage] = useState("en");
  const [coins, setCoins] = useState(1250);
  const [showRewards, setShowRewards] = useState(false);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [latestComplaint, setLatestComplaint] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeMobileStep, setActiveMobileStep] = useState(2); // 0: Logged, 1: Audited, 2: Dispatched, 3: Resolved

  const citizenUser = getCitizenUser();
  const citizenToken = getCitizenToken();
  const adminToken = getAdminToken();
  const isLoggedIn = Boolean(citizenToken || adminToken || citizenUser);

  const handleLogout = () => {
    clearCitizenSession();
    clearAdminSession();
    setShowProfileModal(false);
    setShowNavMenu(false);
    window.location.reload();
  };

  const text = translations[language];
  const alerts = alertData[language];


  useEffect(() => {
    fetch("http://localhost:5000/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setLatestComplaint(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  const changeLanguage = (e) => {
    setLanguage(e.target.value);
  };

  const redeemReward = (cost, voucherName) => {
    if (coins < cost) {
      alert("Insufficient NagarCoins. Submit verified civic reports to earn more!");
      return;
    }
    setCoins((prev) => prev - cost);
    alert(`Redemption Confirmed! You claimed "${voucherName}". Voucher code sent to your registered citizen profile.`);
  };

  const openAlertDetails = (index) => {
    setSelectedAlert({
      icon: alerts[index][0],
      title: alerts[index][1],
      level: alerts[index][2],
      guide: safetyGuides[index] || safetyGuides[0],
    });
  };

  const startVoiceDemo = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "od" ? "or-IN" : "en-US";
    recognition.interimResults = true;

    setIsListening(true);
    setVoiceTranscript("Listening... Please speak your civic complaint clearly.");

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setVoiceTranscript(transcriptText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceTranscript("Voice capture timed out. Please tap Test Voice Input to try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const renderFeatureContent = () => {
    if (activeFeature === "Gemini Vision Audit") {
      return (
        <div className="feature-modal-body">
          <div className="feature-modal-icon-badge amber-badge">
            <Icon name="cpu" size={28} />
          </div>
          <h2>Multimodal Gemini Vision Audit</h2>
          <p className="feature-modal-desc">
            Incoming photos undergo automatic edge-detection, surface fracture depth analysis, and road defect bounding.
          </p>
          <div className="feature-score-card">
            <div className="score-row">
              <span>Road Defect Identification</span>
              <strong>Severe Asphalt Cavitation</strong>
            </div>
            <div className="score-row">
              <span>Gemini Vision Confidence</span>
              <strong className="badge-high">94.8% Match</strong>
            </div>
            <div className="score-row">
              <span>Safety Risk Multiplier</span>
              <strong>High Hazard (Traffic Impact)</strong>
            </div>
            <div className="score-divider" />
            <div className="score-total">
              <span>Priority Rating Score</span>
              <strong className="score-number">92 / 100</strong>
            </div>
          </div>
          <small className="feature-note">
            Powered by Google Gemini 3.6 Flash multimodal vision engine.
          </small>
        </div>
      );
    }

    if (activeFeature === "Spatial Deduplication") {
      return (
        <div className="feature-modal-body">
          <div className="feature-modal-icon-badge plum-badge">
            <Icon name="layers" size={28} />
          </div>
          <h2>500m Haversine Proximity Deduplication</h2>
          <p className="feature-modal-desc">
            When multiple citizens report the same damaged infrastructure, reports are cross-referenced across 500m geofences and NLP token similarity.
          </p>
          <div className="dedup-comparison-box">
            <div className="dedup-item">
              <span className="dedup-label">Incoming Citizen Submission</span>
              <p className="dedup-text">"Deep crater pothole opposite sector 4 market crossing."</p>
            </div>
            <div className="dedup-match-chip">
              <Icon name="copy" size={16} />
              <span>3 correlated open reports merged (91% spatial confidence)</span>
            </div>
            <div className="dedup-item linked">
              <span className="dedup-label">Parent Ticket #NSAI-2026-000412</span>
              <p className="dedup-text">Roads & Municipal Works • 48m distance offset • 4 Citizens upvoted</p>
            </div>
          </div>
          <small className="feature-note">
            Prevents duplicated technician dispatches while multiplying citizen escalation weight.
          </small>
        </div>
      );
    }

    if (activeFeature === "Autonomous Dept Routing") {
      return (
        <div className="feature-modal-body">
          <div className="feature-modal-icon-badge terracotta-badge">
            <Icon name="building" size={28} />
          </div>
          <h2>Autonomous Municipal Department Routing</h2>
          <p className="feature-modal-desc">
            Classifies issue types and routes directly to the designated municipal agency with zero manual clerk delay.
          </p>
          <div className="routing-list">
            <div className="routing-item">
              <div className="routing-category">
                <Icon name="road" size={18} />
                <span>Road & Pavement Damage</span>
              </div>
              <Icon name="arrow-right" size={16} className="routing-arrow" />
              <strong className="routing-dept">Municipal PWD Division</strong>
            </div>
            <div className="routing-item">
              <div className="routing-category">
                <Icon name="trash" size={18} />
                <span>Solid Waste & Overflowing Bins</span>
              </div>
              <Icon name="arrow-right" size={16} className="routing-arrow" />
              <strong className="routing-dept">Solid Waste Management Board</strong>
            </div>
            <div className="routing-item">
              <div className="routing-category">
                <Icon name="droplet" size={18} />
                <span>Pipeline Leaks & Drainage Clog</span>
              </div>
              <Icon name="arrow-right" size={16} className="routing-arrow" />
              <strong className="routing-dept">Water & Sewerage Authority</strong>
            </div>
            <div className="routing-item">
              <div className="routing-category">
                <Icon name="zap" size={18} />
                <span>Damaged Streetlights & Exposed Cable</span>
              </div>
              <Icon name="arrow-right" size={16} className="routing-arrow" />
              <strong className="routing-dept">Municipal Electrical Engineering</strong>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="reference-canvas-wrapper" id="reference-canvas">
      {/* Background Decorative Floral / Geometric Lotus Radiance */}
      <div className="background-lotus-radiance" aria-hidden="true">
        <div className="radiance-ring ring-1" />
        <div className="radiance-ring ring-2" />
        <div className="radiance-ring ring-3" />
      </div>

      {/* Main Floating Rounded Canvas Container */}
      <div className="reference-main-container">
        {/* ================= HERO SECTION (WARM SUNSET RADIANT GLOW) ================= */}
        <section className="reference-hero-section">
          {/* Subtle floral/geometric watermark */}
          <div className="hero-geometric-watermark" aria-hidden="true">
            <svg viewBox="0 0 600 600" className="watermark-svg">
              <circle cx="300" cy="300" r="280" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
              <circle cx="300" cy="300" r="210" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
              <circle cx="300" cy="300" r="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
              <path
                d="M300 80 C 230 180, 230 420, 300 520 C 370 420, 370 180, 300 80 Z"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M80 300 C 180 230, 420 230, 520 300 C 420 370, 180 370, 80 300 Z"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>

          {/* ================= FLOATING PILL NAVBAR ================= */}
          <header className="reference-pill-navbar">
            <div className="pill-nav-left">
              <button
                type="button"
                className="nav-circular-icon-btn"
                aria-label="Navigation Menu"
                onClick={() => setShowNavMenu((prev) => !prev)}
              >
                <Icon name="menu" size={18} />
              </button>

              {/* Dropdown Menu when hamburger clicked */}
              {showNavMenu && (
                <div className="nav-dropdown-menu">
                  <Link to="/" className="nav-dropdown-item" onClick={() => setShowNavMenu(false)}>
                    <Icon name="home" size={16} />
                    <span>Home</span>
                  </Link>
                  <Link to="/map" className="nav-dropdown-item" onClick={() => setShowNavMenu(false)}>
                    <Icon name="map" size={16} />
                    <span>Live Telemetry Map</span>
                  </Link>
                  <Link to="/track" className="nav-dropdown-item" onClick={() => setShowNavMenu(false)}>
                    <Icon name="search" size={16} />
                    <span>Track Grievances</span>
                  </Link>
                  <a
                    href="#safety-protocols"
                    className="nav-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowNavMenu(false);
                      setShowSafetyGuide(true);
                    }}
                  >
                    <Icon name="shield-check" size={16} />
                    <span>Safety Protocols</span>
                  </a>
                  <a
                    href="#rewards"
                    className="nav-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowNavMenu(false);
                      setShowRewards(true);
                    }}
                  >
                    <Icon name="coin" size={16} />
                    <span>Civic Rewards</span>
                  </a>
                  <Link to="/admin" className="nav-dropdown-item" onClick={() => setShowNavMenu(false)}>
                    <Icon name="shield" size={16} />
                    <span>Admin Dashboard</span>
                  </Link>

                  {/* Citizen Profile & Grievance Stats Option */}
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => {
                      setShowNavMenu(false);
                      setShowProfileModal(true);
                    }}
                  >
                    <Icon name="user" size={16} />
                    <span>Citizen Profile & Stats</span>
                  </button>

                  {/* Dynamic Log Out / Log In Option */}
                  {isLoggedIn ? (
                    <button
                      type="button"
                      className="nav-dropdown-item nav-logout-item"
                      onClick={handleLogout}
                    >
                      <Icon name="log-out" size={16} />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="nav-dropdown-item nav-login-item"
                      onClick={() => setShowNavMenu(false)}
                    >
                      <Icon name="log-in" size={16} />
                      <span>Log In</span>
                    </Link>
                  )}
                </div>
              )}

              <div className="pill-nav-links">
                <Link to="/map" className="pill-nav-link">
                  {text.map}
                </Link>
                <Link to="/track" className="pill-nav-link">
                  {text.track}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSafetyGuide(true)}
                  className="pill-nav-link-btn"
                >
                  {text.alerts}
                </button>
              </div>
            </div>

            {/* Brand Logo Center */}
            <Link to="/" className="pill-nav-brand">
              <div className="pill-brand-icon">
                <Icon name="lotus" size={22} />
              </div>
              <span className="pill-brand-title">NAGARSWAR AI</span>
            </Link>

            {/* Right Tools & Action Button */}
            <div className="pill-nav-right">
              {/* Language Selector Pill */}
              <div className="lang-pill-wrapper">
                <select
                  value={language}
                  onChange={changeLanguage}
                  aria-label="Select language"
                  className="pill-lang-select"
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="od">OD</option>
                </select>
              </div>

              {/* Rewards Coin Badge */}
              <button
                type="button"
                className="pill-rewards-btn"
                onClick={() => setShowRewards(true)}
                title="View NagarCoins Civic Balance"
              >
                <Icon name="coin" size={16} />
                <span>{coins}</span>
              </button>

              {/* User Profile / Auth Control Button */}
              {isLoggedIn ? (
                <button
                  type="button"
                  className="pill-user-profile-btn"
                  onClick={() => setShowProfileModal(true)}
                  title="View Citizen Profile & Complaint Stats"
                >
                  <Icon name="user" size={15} />
                  <span>{citizenUser?.firstName || "Profile"}</span>
                </button>
              ) : (
                <Link to="/login" className="pill-auth-btn" title="Sign In to NagarSwar AI">
                  <Icon name="log-in" size={15} />
                  <span>Log In</span>
                </Link>
              )}

              {/* Notification Bell */}
              <div className="nav-notif-wrapper">
                <button
                  type="button"
                  className="nav-circular-icon-btn"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  <Icon name="bell" size={17} />
                  <span className="pill-notif-dot" />
                </button>

                {showNotifications && (
                  <div className="pill-notifications-dropdown">
                    <div className="dropdown-title-row">
                      <div className="title-left">
                        <Icon name="bell" size={15} />
                        <strong>Notifications</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="notif-close-btn"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>

                    <div className="notif-list-item">
                      <div className="notif-icon-circle success">
                        <Icon name="check-circle" size={14} />
                      </div>
                      <div className="notif-text-box">
                        <strong>Evidence Verified</strong>
                        <p>#NSAI-2026-000412 matched with 94.8% confidence.</p>
                      </div>
                    </div>

                    <div className="notif-list-item">
                      <div className="notif-icon-circle warning">
                        <Icon name="alert-triangle" size={14} />
                      </div>
                      <div className="notif-text-box">
                        <strong>Precipitation Advisory</strong>
                        <p>Heavy rainfall warning in South Zone drainage basin.</p>
                      </div>
                    </div>

                    <div className="notif-list-item">
                      <div className="notif-icon-circle info">
                        <Icon name="activity" size={14} />
                      </div>
                      <div className="notif-text-box">
                        <strong>Field Crew Dispatched</strong>
                        <p>Municipal PWD assigned to road pothole at Sector 4.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Terracotta CTA Button */}
              <Link to="/report" className="pill-cta-btn">
                <Icon name="report" size={16} />
                <span>{text.report}</span>
              </Link>
            </div>
          </header>


          {/* ================= HERO CONTENT ================= */}
          <div className="reference-hero-content">
            {/* Bold Stacked 3-Line Display Headline with Amicro BlurText */}
            <h1 className="hero-stacked-headline">
              <span className="headline-line"><BlurText text={text.heroOne} duration={0.6} /></span>
              <span className="headline-line"><BlurText text={text.heroTwo} duration={0.7} /></span>
              <span className="headline-line headline-accent"><BlurText text={text.heroThree} duration={0.8} /></span>
            </h1>

            {/* Editorial Description */}
            <p className="hero-editorial-subtitle">{text.description}</p>

            {/* Dual CTA Button Row with Amicro Magnetic Pull */}
            <div className="hero-action-buttons-row flex items-center gap-4">
              <Link to="/report">
                <MagneticButton className="hero-btn-primary">
                  <Icon name="report" size={18} />
                  <span>{text.reportButton}</span>
                  <Icon name="arrow-right" size={16} />
                </MagneticButton>
              </Link>

              <Link to="/map">
                <MagneticButton className="hero-btn-secondary !bg-[#1E3E62] !border-[#1E3E62]">
                  <Icon name="map" size={18} />
                  <span>{text.exploreMap}</span>
                </MagneticButton>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= STATEMENT / QUOTE BAND (CREAM) ================= */}
        <section className="reference-statement-band">
          <div className="statement-split-grid">
            <div className="statement-left">
              <h2 className="statement-heading">{text.statementLeft}</h2>
            </div>

            <div className="statement-right">
              <blockquote className="statement-quote-box">
                <p className="statement-quote-text">{text.statementQuote}</p>
                <cite className="statement-quote-author">{text.statementAuthor}</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE DEVICE SHOWCASE ================= */}
        <section className="reference-device-showcase">
          <div className="showcase-header">
            <h2 className="showcase-title">{text.showcaseTitle}</h2>
            <p className="showcase-subtitle">{text.showcaseSubtitle}</p>
          </div>

          <div className="showcase-tri-column-grid">
            {/* Left Column: Feature Description & Live Audio Input */}
            <div className="showcase-left-col">
              <div className="feature-icon-badge-round">
                <Icon name="cpu" size={24} />
              </div>

              <h3 className="feature-col-title">{text.intakeTitle}</h3>
              <p className="feature-col-desc">{text.intakeDesc}</p>

              {/* Interactive Speech Recognition Demo */}
              <div className="voice-interactive-card">
                <div className="voice-card-header">
                  <span className="voice-card-label">Voice Speech-to-Text Stream</span>
                  <span className="voice-lang-tag">
                    {language === "hi" ? "हिन्दी" : language === "od" ? "ଓଡ଼ିଆ" : "English"}
                  </span>
                </div>

                <div className="voice-transcript-box">
                  <p className="transcript-text">
                    {voiceTranscript || "Tap the microphone to speak a civic grievance..."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startVoiceDemo}
                  disabled={isListening}
                  className={`voice-action-button ${isListening ? "active-listening" : ""}`}
                >
                  <Icon name={isListening ? "mic-off" : "mic"} size={17} />
                  <span>{isListening ? text.listening : text.testVoiceBtn}</span>
                </button>
              </div>

              <Link to="/report" className="feature-intake-link">
                <span>Launch Full Grievance Intake</span>
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>

            {/* Center Column: Realistic Smartphone Mockup on Glowing Disc */}
            <div className="showcase-center-col">
              <div className="smartphone-floating-wrapper">
                {/* Floor Reflection Glow Disc */}
                <div className="smartphone-glow-disc" aria-hidden="true" />

                {/* Smartphone Device Frame */}
                <div className="smartphone-device">
                  {/* Top Notch & Camera */}
                  <div className="phone-notch">
                    <span className="speaker-slit" />
                    <span className="camera-dot" />
                  </div>

                  {/* Phone Screen Screen Contents */}
                  <div className="phone-screen-content">
                    {/* Status Bar */}
                    <div className="phone-status-bar">
                      <span className="status-time">9:41</span>
                      <div className="status-icons">
                        <Icon name="activity" size={12} />
                        <span className="status-battery">100%</span>
                      </div>
                    </div>

                    {/* App Header Inside Phone */}
                    <div className="phone-app-header">
                      <div className="phone-app-brand">
                        <Icon name="lotus" size={15} />
                        <span>NAGARSWAR</span>
                      </div>
                      <span className="phone-ward-tag">Ward 12 • PWD</span>
                    </div>

                    {/* Incident Card Preview */}
                    <div className="phone-incident-card">
                      <div className="incident-img-container">
                        <img src={potholeImg} alt="Road defect" className="incident-img" />
                        {/* Gemini Vision Bounding Box Overlay */}
                        <div className="vision-bounding-box">
                          <span className="bounding-label">Pothole Depth 14cm (94%)</span>
                        </div>
                        <span className="incident-status-tag">AI VERIFIED</span>
                      </div>

                      <div className="incident-details">
                        <h4 className="incident-title">
                          {latestComplaint?.title || "Severe Asphalt Crater & Waterlogging"}
                        </h4>
                        <div className="incident-geo-row">
                          <Icon name="pin" size={12} />
                          <span>Sector 4 Market Crossing • 48m</span>
                        </div>
                      </div>
                    </div>

                    {/* 4-Step Interactive Stepper Pipeline */}
                    <div className="phone-stepper-card">
                      <div className="phone-stepper-header">
                        <span className="stepper-title">Grievance Lifecycle</span>
                        <button
                          type="button"
                          className="stepper-advance-btn"
                          onClick={() => setActiveMobileStep((prev) => (prev + 1) % 4)}
                          title="Cycle through lifecycle stages"
                        >
                          Next Step
                        </button>
                      </div>

                      <div className="phone-stepper-row">
                        <div className={`step-node ${activeMobileStep >= 0 ? "done" : ""}`}>
                          <div className="step-circle">
                            <Icon name="check" size={10} />
                          </div>
                          <span>Intake</span>
                        </div>
                        <div className={`step-line ${activeMobileStep >= 1 ? "done" : ""}`} />

                        <div className={`step-node ${activeMobileStep >= 1 ? "done" : ""}`}>
                          <div className="step-circle">
                            <Icon name={activeMobileStep >= 1 ? "check" : "cpu"} size={10} />
                          </div>
                          <span>Audit</span>
                        </div>
                        <div className={`step-line ${activeMobileStep >= 2 ? "done" : ""}`} />

                        <div className={`step-node ${activeMobileStep >= 2 ? "done" : ""}`}>
                          <div className="step-circle">
                            <Icon name={activeMobileStep >= 2 ? "check" : "activity"} size={10} />
                          </div>
                          <span>Dispatch</span>
                        </div>
                        <div className={`step-line ${activeMobileStep >= 3 ? "done" : ""}`} />

                        <div className={`step-node ${activeMobileStep >= 3 ? "done" : ""}`}>
                          <div className="step-circle">
                            <Icon name="shield-check" size={10} />
                          </div>
                          <span>Resolve</span>
                        </div>
                      </div>
                    </div>

                    {/* Rewards NagarCoins Pill inside Phone */}
                    <div className="phone-coins-pill">
                      <div className="coins-pill-icon">
                        <Icon name="coin" size={14} />
                      </div>
                      <div className="coins-pill-text">
                        <strong>+250 NagarCoins</strong>
                        <p>Verified resolution granted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Fan-Tilted 3D Gradient Cards */}
            <div className="showcase-right-col">
              <div className="tilted-cards-stack">
                {featureData.map((feature, idx) => (
                  <div
                    key={feature.title}
                    className={`tilted-card card-${feature.color} tilt-tier-${idx}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveFeature(feature.title)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveFeature(feature.title);
                    }}
                  >
                    <div className="tilted-card-top">
                      <div className="tilted-card-icon">
                        <Icon name={feature.icon} size={20} />
                      </div>
                      <span className="tilted-card-badge">Explore System</span>
                    </div>

                    <h4 className="tilted-card-title">{feature.title}</h4>
                    <p className="tilted-card-desc">{feature.description}</p>

                    <div className="tilted-card-footer">
                      <span>View Architecture</span>
                      <Icon name="arrow-right" size={13} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= AUTHORITY / INNOVATION SPOTLIGHT CARD ================= */}
        <section className="reference-spotlight-section">
          <div className="spotlight-card">
            <div className="spotlight-card-content">
              <div className="spotlight-avatar-wrap">
                <div className="spotlight-halo-disc" />
                <div className="spotlight-icon-core">
                  <Icon name="cpu" size={42} />
                </div>
              </div>

              <div className="spotlight-text-body">
                <span className="spotlight-eyebrow">MULTIMODAL CIVIC INTELLIGENCE</span>
                <h3 className="spotlight-heading">
                  Powered by Multimodal Vision Intelligence. Why NagarSwar AI?
                </h3>
                <p className="spotlight-desc">
                  Traditional grievance portals lose citizen issues in endless bureaucratic paperwork.
                  NagarSwar AI replaces slow manual paperwork with real-time multimodal vision verification,
                  500m Haversine spatial clustering, and tamper-proof public telemetry.
                </p>

                {/* 3 Metric Pills */}
                <div className="spotlight-metrics-row">
                  <div className="spotlight-metric-pill">
                    <strong>&lt; 0.4s</strong>
                    <span>Vision Intake Latency</span>
                  </div>
                  <div className="spotlight-metric-pill">
                    <strong>94.8%</strong>
                    <span>Verification Accuracy</span>
                  </div>
                  <div className="spotlight-metric-pill">
                    <strong>2.4x</strong>
                    <span>Faster Resolution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CIVIC VERIFICATION CONNECTORS SECTION ================= */}
        <section className="reference-connectors-section">
          <div className="connectors-header">
            <span className="connectors-eyebrow">STRUCTURED CIVIC LIFECYCLE</span>
            <h2 className="connectors-title">
              Engineered for seamless trust between citizens and municipal departments.
            </h2>
          </div>

          <div className="connectors-grid">
            {/* Tier 1 */}
            <div className="connector-column">
              <div className="connector-stem-line" aria-hidden="true" />
              <div className="connector-avatar-circle">
                <Icon name="user" size={26} />
              </div>
              <h4 className="connector-name">1. Citizen Intake</h4>
              <span className="connector-role">Multilingual Voice & Photo</span>
              <p className="connector-bio">
                Citizens submit geofenced evidence via speech or camera without filling out complex multi-page forms.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="connector-column">
              <div className="connector-stem-line" aria-hidden="true" />
              <div className="connector-avatar-circle">
                <Icon name="cpu" size={26} />
              </div>
              <h4 className="connector-name">2. Multimodal AI Triage</h4>
              <span className="connector-role">Gemini Vision & Deduplication</span>
              <p className="connector-bio">
                Automated surface damage assessment, 500m Haversine proximity clustering, and municipal severity rating.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="connector-column">
              <div className="connector-stem-line" aria-hidden="true" />
              <div className="connector-avatar-circle">
                <Icon name="shield-check" size={26} />
              </div>
              <h4 className="connector-name">3. Municipal Field Action</h4>
              <span className="connector-role">Direct PWD & SLA Dispatch</span>
              <p className="connector-bio">
                Direct work orders dispatched to ward engineers, verified completion photos, and citizen rewards.
              </p>
            </div>
          </div>
        </section>

        {/* ================= LIVE OPERATIONS & HAZARD ALERTS ================= */}
        <section className="reference-telemetry-section" id="safety-protocols">
          <div className="telemetry-inner-wrapper">
            {/* Animated Live Telemetry Radar Bar */}
            <div className="telemetry-radar-bar">
              <div className="radar-status-badge">
                <span className="radar-ping-dot">
                  <span className="ping-wave" />
                </span>
                <span className="radar-label">AUTONOMOUS CIVIC RADAR</span>
              </div>
              <div className="radar-ticker-window">
                <div className="radar-ticker-content">
                  <span className="ticker-item">🟢 <strong>Ward 12</strong>: PWD Drainage Cleared (SLA 42m)</span>
                  <span className="ticker-sep">•</span>
                  <span className="ticker-item">⚡ <strong>Sector 4</strong>: Pothole Verified (94.8% Match)</span>
                  <span className="ticker-sep">•</span>
                  <span className="ticker-item">🛰️ <strong>South Ward</strong>: Precipitation 14mm/hr Normal</span>
                  <span className="ticker-sep">•</span>
                  <span className="ticker-item">🪙 <strong>Citizen #NS-409</strong>: +250 NagarCoins Granted</span>
                </div>
              </div>
              <div className="radar-scan-line" aria-hidden="true" />
            </div>

            {/* Top Telemetry Header */}
            <div className="telemetry-header">
              <div className="telemetry-title-box">
                <div className="live-status-pill">
                  <span className="pulse-blip" />
                  <span>{pulseTranslations[language].live}</span>
                </div>
                <h3>{pulseTranslations[language].title}</h3>
                <p>{pulseTranslations[language].subtitle}</p>
              </div>

              {/* 4 Animated Stats Chips */}
              <div className="telemetry-stats-strip">
                <div className="telemetry-stat-card animated-card">
                  <div className="stat-card-main">
                    <div className="stat-icon amber float-anim">
                      <Icon name="alert-circle" size={17} />
                    </div>
                    <div className="stat-text">
                      <strong>128</strong>
                      <span>{pulseTranslations[language].active}</span>
                    </div>
                  </div>
                  <div className="stat-progress-track">
                    <div className="stat-progress-bar amber-bar" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="telemetry-stat-card animated-card">
                  <div className="stat-card-main">
                    <div className="stat-icon emerald float-anim">
                      <Icon name="check-circle" size={17} />
                    </div>
                    <div className="stat-text">
                      <strong>47</strong>
                      <span>{pulseTranslations[language].resolvedWeek}</span>
                    </div>
                  </div>
                  <div className="stat-progress-track">
                    <div className="stat-progress-bar emerald-bar" style={{ width: "82%" }} />
                  </div>
                </div>

                <div className="telemetry-stat-card animated-card">
                  <div className="stat-card-main">
                    <div className="stat-icon sky float-anim">
                      <Icon name="chart" size={17} />
                    </div>
                    <div className="stat-text">
                      <strong>92.4%</strong>
                      <span>{pulseTranslations[language].rate}</span>
                    </div>
                  </div>
                  <div className="stat-progress-track">
                    <div className="stat-progress-bar sky-bar" style={{ width: "92.4%" }} />
                  </div>
                </div>

                <div className="telemetry-stat-card animated-card">
                  <div className="stat-card-main">
                    <div className="stat-icon rose float-anim">
                      <Icon name="flame" size={17} />
                    </div>
                    <div className="stat-text">
                      <strong>2</strong>
                      <span>{pulseTranslations[language].high}</span>
                    </div>
                  </div>
                  <div className="stat-progress-track">
                    <div className="stat-progress-bar rose-bar" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental & Hazard Warning Cards Grid */}
            <div className="hazard-section-wrap">
              <div className="hazard-section-title-row">
                <h4>{text.warningTitle}</h4>
                <button
                  type="button"
                  className="btn-hazard-protocol"
                  onClick={() => setShowSafetyGuide(true)}
                >
                  <Icon name="shield-check" size={16} />
                  <span>{text.safetyGuide}</span>
                </button>
              </div>

              <div className="hazard-cards-grid">
                {alerts.map(([iconName, alertTitle, riskLevel], index) => {
                  const isHigh = riskLevel === "High" || riskLevel === "उच्च" || riskLevel === "ଉଚ୍ଚ";
                  const isMedium = riskLevel === "Medium" || riskLevel === "मध्यम" || riskLevel === "ମଧ୍ୟମ";

                  return (
                    <div
                      key={alertTitle}
                      className={`ref-hazard-card ${isHigh ? "hazard-high" : isMedium ? "hazard-medium" : "hazard-low"}`}
                      onClick={() => openAlertDetails(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openAlertDetails(index);
                      }}
                    >
                      <div className="hazard-card-top">
                        <div className="hazard-card-icon">
                          <Icon name={iconName} size={20} />
                        </div>
                        <span className={`hazard-risk-tag ${isHigh ? "tag-high" : isMedium ? "tag-med" : "tag-low"}`}>
                          {riskLevel}
                        </span>
                      </div>
                      <h5 className="hazard-card-name">{alertTitle}</h5>
                      <div className="hazard-card-action">
                        <span>View Protocol</span>
                        <Icon name="chevron-right" size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================= PERSPECTIVE FOOTER BANNER (TERRACOTTA SUNSET) ================= */}
        <section className="reference-footer-banner">
          <div className="footer-banner-inner">
            <h2 className="footer-banner-heading">Ready to build a cleaner, smarter city?</h2>
            <p className="footer-banner-desc">
              Join thousands of active citizens transforming their neighborhoods with NagarSwar AI.
            </p>

            <div className="footer-banner-actions">
              <Link to="/report" className="footer-pill-primary">
                <Icon name="report" size={17} />
                <span>Submit Civic Issue Now</span>
                <Icon name="arrow-right" size={15} />
              </Link>

              <Link to="/map" className="footer-pill-glass">
                <Icon name="map" size={17} />
                <span>Explore City Map</span>
              </Link>
            </div>

          </div>
        </section>

        {/* ================= COMPREHENSIVE CIVIC GOVERNMENT FOOTER ================= */}
        <footer className="civic-government-footer">
          <div className="footer-national-stripe">
            <div className="stripe-saffron" />
            <div className="stripe-white" />
            <div className="stripe-green" />
          </div>

          <div className="footer-main-container">
            <div className="footer-grid-four-col">
              {/* Col 1: Identity & Sovereign Authority */}
              <div className="footer-col footer-col-identity">
                <div className="footer-brand-header">
                  <div className="footer-emblem-badge">
                    <Icon name="lotus" size={24} />
                  </div>
                  <div>
                    <h3 className="footer-brand-title">NAGARSWAR AI</h3>
                    <span className="footer-brand-subtitle">Civic Governance & Telemetry Platform</span>
                  </div>
                </div>
                <p className="footer-col-desc">
                  Autonomous public infrastructure grievance redressal system. Powered by multimodal vision verification, 500m Haversine spatial deduplication, and transparent dispatch telemetry.
                </p>
                <div className="footer-compliance-badges">
                  <span className="badge-pill">
                    <Icon name="shield-check" size={13} />
                    <span>Digital India Compliant</span>
                  </span>
                  <span className="badge-pill">
                    <Icon name="award" size={13} />
                    <span>ISO/IEC 27001 Standard</span>
                  </span>
                </div>
              </div>

              {/* Col 2: Citizen Portals */}
              <div className="footer-col">
                <h4 className="footer-col-heading">Citizen Portals</h4>
                <ul className="footer-nav-list">
                  <li>
                    <Link to="/report">
                      <Icon name="report" size={14} />
                      <span>Submit Civic Grievance</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/map">
                      <Icon name="map" size={14} />
                      <span>Live City Telemetry Map</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/track">
                      <Icon name="clock" size={14} />
                      <span>Track Grievance Status</span>
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={() => setShowRewards(true)} className="footer-action-link">
                      <Icon name="coin" size={14} />
                      <span>NagarCoins Rewards Pool</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => setShowSafetyGuide(true)} className="footer-action-link">
                      <Icon name="shield-check" size={14} />
                      <span>Municipal Hazard Protocols</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Key Civic Departments */}
              <div className="footer-col">
                <h4 className="footer-col-heading">Civic Infrastructure</h4>
                <ul className="footer-nav-list">
                  <li>
                    <span className="footer-static-item">Roads, Bridges & Potholes</span>
                  </li>
                  <li>
                    <span className="footer-static-item">Public Health & Solid Waste</span>
                  </li>
                  <li>
                    <span className="footer-static-item">Street Lighting & Power Lines</span>
                  </li>
                  <li>
                    <span className="footer-static-item">Storm Water & Urban Drainage</span>
                  </li>
                  <li>
                    <span className="footer-static-item">Public Parks & Sanitation</span>
                  </li>
                  <li>
                    <Link to="/admin" className="admin-portal-link">
                      <Icon name="building" size={14} />
                      <span>Municipal Admin Portal</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 4: 24x7 Emergency Helplines */}
              <div className="footer-col footer-col-helplines">
                <h4 className="footer-col-heading">24x7 Emergency Helplines</h4>
                <div className="footer-helpline-cards">
                  <div className="helpline-card highlight-saffron">
                    <span className="helpline-label">All-India Emergency Hotline</span>
                    <strong className="helpline-number">112</strong>
                    <span className="helpline-sub">Police • Fire • Ambulance</span>
                  </div>
                  <div className="helpline-card">
                    <span className="helpline-label">Municipal Civic Helpline</span>
                    <strong className="helpline-number">1912</strong>
                    <span className="helpline-sub">Toll-Free 24x7 City Redressal</span>
                  </div>
                  <div className="helpline-card">
                    <span className="helpline-label">CM Citizen Grievance Cell</span>
                    <strong className="helpline-number">1076</strong>
                    <span className="helpline-sub">Direct State Governance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Legal & Copyright Bar */}
            <div className="footer-bottom-legal-bar">
              <div className="footer-legal-copy">
                <p>© 2026 <strong>NagarSwar AI (CivicMindX)</strong>. Built for sovereign municipal governance & citizen accountability.</p>
                <p className="footer-disclaimer">Content hosted is aligned with Open Government Data (OGD) Platform India guidelines.</p>
              </div>
              <div className="footer-lang-pills">
                <button type="button" onClick={() => setLanguage('en')} className={`footer-lang-btn ${language === 'en' ? 'active' : ''}`}>English</button>
                <button type="button" onClick={() => setLanguage('hi')} className={`footer-lang-btn ${language === 'hi' ? 'active' : ''}`}>हिन्दी</button>
                <button type="button" onClick={() => setLanguage('od')} className={`footer-lang-btn ${language === 'od' ? 'active' : ''}`}>ଓଡ଼ିଆ</button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ================= MODAL: PLATFORM FEATURE ARCHITECTURE ================= */}
      {activeFeature && (
        <div className="v2-modal-backdrop" onClick={() => setActiveFeature(null)}>
          <div className="v2-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-close">
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="close-btn"
                aria-label="Close modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            {renderFeatureContent()}
            <button
              type="button"
              onClick={() => setActiveFeature(null)}
              className="modal-dismiss-btn"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: NAGARCOINS CIVIC REWARDS ================= */}
      {showRewards && (
        <div className="v2-modal-backdrop" onClick={() => setShowRewards(false)}>
          <div className="v2-modal-card rewards-card" onClick={(e) => e.stopPropagation()}>
            <div className="rewards-header">
              <div className="rewards-title-group">
                <div className="rewards-icon-wrap">
                  <Icon name="coin" size={26} />
                </div>
                <div>
                  <h3>NagarCoins Civic Rewards</h3>
                  <p>Incentivizing verified public contributions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRewards(false)}
                className="close-btn light"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="rewards-balance-pill">
              <span className="balance-label">AVAILABLE CITIZEN BALANCE</span>
              <div className="balance-amount">
                <Icon name="award" size={28} />
                <strong>{coins.toLocaleString()}</strong>
                <span>Points</span>
              </div>
            </div>

            <div className="rewards-voucher-list">
              {[
                ["file-text", "₹50 Municipal Utility Rebate", 100],
                ["road", "₹100 Transit & Metro Coupon", 200],
                ["shield-check", "₹250 Civic Champion Voucher", 500],
              ].map(([iconName, voucherName, cost]) => (
                <div key={voucherName} className="voucher-card">
                  <div className="voucher-icon-box">
                    <Icon name={iconName} size={20} />
                  </div>
                  <div className="voucher-details">
                    <strong>{voucherName}</strong>
                    <p>Redeemable with {cost} NagarCoins</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => redeemReward(cost, voucherName)}
                    className="voucher-redeem-btn"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SAFETY PROTOCOL GUIDE ================= */}
      {showSafetyGuide && (
        <div className="v2-modal-backdrop" onClick={() => setShowSafetyGuide(false)}>
          <div className="v2-modal-card safety-card" onClick={(e) => e.stopPropagation()}>
            <div className="safety-header">
              <div className="safety-title-group">
                <div className="safety-icon-wrap">
                  <Icon name="shield-check" size={26} />
                </div>
                <div>
                  <h3>Municipal Emergency Protocols</h3>
                  <p>Standard disaster resilience guidelines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyGuide(false)}
                className="close-btn light"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="safety-body">
              <div className="safety-advisory-notice">
                <Icon name="alert-triangle" size={18} />
                <span>
                  Follow designated instructions from local emergency authorities during active situations.
                </span>
              </div>

              <div className="safety-accordion-list">
                {safetyGuides.map((guide) => (
                  <div key={guide.title} className="safety-guide-panel">
                    <div className="guide-title-row">
                      <Icon name={guide.icon} size={20} />
                      <h4>{guide.title} Protocol</h4>
                    </div>
                    <ul className="guide-tips">
                      {guide.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SINGLE ALERT PROTOCOL ================= */}
      {selectedAlert && (
        <div className="v2-modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="v2-modal-card alert-detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="alert-detail-header">
              <div className="alert-detail-icon-wrap">
                <Icon name={selectedAlert.icon} size={30} />
              </div>
              <div>
                <span className="alert-detail-risk">Risk Level: {selectedAlert.level}</span>
                <h3>{selectedAlert.title}</h3>
              </div>
            </div>

            <div className="alert-detail-body">
              <h4>Recommended Civic Action:</h4>
              <ul className="guide-tips">
                {selectedAlert.guide.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="modal-dismiss-btn"
              >
                Acknowledge Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CITIZEN PROFILE & GRIEVANCE STATS ================= */}
      <CitizenProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default HomeV2;
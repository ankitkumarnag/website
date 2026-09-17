import { useState } from "react";
import { Link } from "react-router";
import nagarSwarLogo from "../assets/nagarswar-logo.png";
import cityPulseImage from "../assets/city-pulse-illustration.png";
import "./HomeV2.css";

const translations = {
  en: {
    home: "Home",
    report: "Report Issue",
    map: "Live Map",
    alerts: "Safety Alerts",
    rewards: "Rewards",
    track: "Track Status",
    signIn: "Sign In",

    heroOne: "Report Issues.",
    heroTwo: "Earn Rewards.",
    heroThree: "Stay Safe.",

    description:
      "One intelligent platform to improve your city, reward civic action and protect communities with timely alerts.",

    reportButton: "Report an Issue",
    exploreMap: "Explore Live Map",

    verified: "Verified Reports",
    transparent: "Transparent Tracking",

    liveMap: "Live City Map",
    live: "Live",

    aiAnalysis: "AI Priority Analysis",
    highPriority: "High Priority",

    analysisText:
      "Waterlogging reported in multiple locations. Action recommended.",

    viewDetails: "View Details",

    currentStatus: "Current Complaint Status",
    inProgress: "In Progress",

    coinsMessage: "+250 after verified resolution",
    redeem: "Redeem Rewards",

    warningTitle: "Early Warning & Safety Alerts",
    safetyGuide: "View Safety Guide",

    featuresTitle: "Smart tools for safer, stronger cities",
  },

  hi: {
    home: "होम",
    report: "शिकायत दर्ज करें",
    map: "लाइव मानचित्र",
    alerts: "सुरक्षा अलर्ट",
    rewards: "पुरस्कार",
    track: "स्थिति देखें",
    signIn: "साइन इन",

    heroOne: "समस्या बताएं।",
    heroTwo: "इनाम कमाएं।",
    heroThree: "सुरक्षित रहें।",

    description:
      "अपने शहर को बेहतर बनाने, नागरिक कार्यों को पुरस्कृत करने और समय पर अलर्ट से समुदाय को सुरक्षित रखने वाला एक बुद्धिमान मंच।",

    reportButton: "समस्या दर्ज करें",
    exploreMap: "लाइव मानचित्र देखें",

    verified: "सत्यापित शिकायतें",
    transparent: "पारदर्शी ट्रैकिंग",

    liveMap: "लाइव सिटी मानचित्र",
    live: "लाइव",

    aiAnalysis: "AI प्राथमिकता विश्लेषण",
    highPriority: "उच्च प्राथमिकता",

    analysisText:
      "कई स्थानों पर जलभराव की शिकायत मिली है। कार्रवाई आवश्यक है।",

    viewDetails: "विवरण देखें",

    currentStatus: "वर्तमान शिकायत स्थिति",
    inProgress: "कार्य जारी है",

    coinsMessage: "सत्यापित समाधान के बाद +250",
    redeem: "पुरस्कार प्राप्त करें",

    warningTitle: "प्रारंभिक चेतावनी और सुरक्षा अलर्ट",
    safetyGuide: "सुरक्षा गाइड देखें",

    featuresTitle: "सुरक्षित और बेहतर शहर के लिए स्मार्ट सुविधाएं",
  },

  od: {
    home: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    report: "ସମସ୍ୟା ଜଣାନ୍ତୁ",
    map: "ଲାଇଭ୍ ମ୍ୟାପ୍",
    alerts: "ସୁରକ୍ଷା ସତର୍କତା",
    rewards: "ପୁରସ୍କାର",
    track: "ସ୍ଥିତି ଦେଖନ୍ତୁ",
    signIn: "ସାଇନ୍ ଇନ୍",

    heroOne: "ସମସ୍ୟା ଜଣାନ୍ତୁ।",
    heroTwo: "ପୁରସ୍କାର ପାଆନ୍ତୁ।",
    heroThree: "ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।",

    description:
      "ସହରକୁ ଉନ୍ନତ କରିବା, ନାଗରିକ କାର୍ଯ୍ୟକୁ ପୁରସ୍କୃତ କରିବା ଏବଂ ସମୟୋଚିତ ସତର୍କତା ସହିତ ସମୁଦାୟକୁ ସୁରକ୍ଷିତ ରଖିବା ପାଇଁ ଏକ ବୁଦ୍ଧିମାନ ପ୍ଲାଟଫର୍ମ।",

    reportButton: "ସମସ୍ୟା ଜଣାନ୍ତୁ",
    exploreMap: "ଲାଇଭ୍ ମ୍ୟାପ୍ ଦେଖନ୍ତୁ",

    verified: "ଯାଞ୍ଚ ହୋଇଥିବା ରିପୋର୍ଟ",
    transparent: "ସ୍ପଷ୍ଟ ଟ୍ରାକିଂ",

    liveMap: "ଲାଇଭ୍ ସିଟି ମ୍ୟାପ୍",
    live: "ଲାଇଭ୍",

    aiAnalysis: "AI ପ୍ରାଥମିକତା ବିଶ୍ଳେଷଣ",
    highPriority: "ଉଚ୍ଚ ପ୍ରାଥମିକତା",

    analysisText:
      "ଏକାଧିକ ସ୍ଥାନରେ ଜଳ ଜମା ରିପୋର୍ଟ ହୋଇଛି। କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଆବଶ୍ୟକ।",

    viewDetails: "ବିବରଣୀ ଦେଖନ୍ତୁ",

    currentStatus: "ବର୍ତ୍ତମାନ ଅଭିଯୋଗ ସ୍ଥିତି",
    inProgress: "କାର୍ଯ୍ୟ ଚାଲିଛି",

    coinsMessage: "ଯାଞ୍ଚ ହୋଇଥିବା ସମାଧାନ ପରେ +250",
    redeem: "ପୁରସ୍କାର ପାଆନ୍ତୁ",

    warningTitle: "ପୂର୍ବ ସତର୍କତା ଏବଂ ସୁରକ୍ଷା ଆଲର୍ଟ",
    safetyGuide: "ସୁରକ୍ଷା ଗାଇଡ୍ ଦେଖନ୍ତୁ",

    featuresTitle: "ସୁରକ୍ଷିତ ଏବଂ ଉନ୍ନତ ସହର ପାଇଁ ସ୍ମାର୍ଟ ସୁବିଧା",
  },
};


const pulseTranslations = {
  en: {
    title: "City Pulse",
    live: "Live",
    subtitle: "Live civic snapshot of NagarSwar",
    prototype: "Prototype metrics",
    active: "Active Issues",
    resolvedWeek: "Resolved This Week",
    rate: "Resolution Rate",
    high: "High Priority",
    quote: "Your voice should not disappear after you report a problem.",
    support:
      "NagarSwar turns citizen reports into visible, trackable civic action.",
    shared: "A cleaner, safer tomorrow is a shared responsibility.",
    latest: "My Latest Complaint",
    viewAll: "View All",
    report: "Report",
    reportSub: "Spot an issue in your city",
    verify: "Verify",
    verifySub: "Validate the complaint",
    prioritize: "Prioritize",
    prioritizeSub: "Set urgency and impact",
    resolve: "Resolve",
    resolveSub: "Authorities take action",
    reward: "Reward",
    rewardSub: "Earn NagarCoins",
    submitted: "Submitted",
    verified: "Verified",
    assigned: "Assigned",
    resolved: "Resolved",
  },
  hi: {
    title: "सिटी पल्स",
    live: "लाइव",
    subtitle: "NagarSwar का नागरिक स्थिति स्नैपशॉट",
    prototype: "प्रोटोटाइप डेटा",
    active: "सक्रिय समस्याएं",
    resolvedWeek: "इस सप्ताह समाधान",
    rate: "समाधान दर",
    high: "उच्च प्राथमिकता",
    quote: "समस्या दर्ज करने के बाद आपकी आवाज़ गायब नहीं होनी चाहिए।",
    support:
      "NagarSwar नागरिक रिपोर्ट को दिखाई देने वाली और ट्रैक की जा सकने वाली कार्रवाई में बदलता है।",
    shared: "स्वच्छ और सुरक्षित कल हम सभी की साझा जिम्मेदारी है।",
    latest: "मेरी नवीनतम शिकायत",
    viewAll: "सभी देखें",
    report: "रिपोर्ट",
    reportSub: "शहर की समस्या बताएं",
    verify: "सत्यापन",
    verifySub: "शिकायत की जांच करें",
    prioritize: "प्राथमिकता",
    prioritizeSub: "गंभीरता तय करें",
    resolve: "समाधान",
    resolveSub: "विभाग कार्रवाई करे",
    reward: "पुरस्कार",
    rewardSub: "NagarCoins कमाएं",
    submitted: "दर्ज",
    verified: "सत्यापित",
    assigned: "असाइन",
    resolved: "समाधान",
  },
  od: {
    title: "ସିଟି ପଲ୍ସ",
    live: "ଲାଇଭ୍",
    subtitle: "NagarSwar ର ନାଗରିକ ସ୍ଥିତି ସ୍ନାପଶଟ୍",
    prototype: "ପ୍ରୋଟୋଟାଇପ୍ ତଥ୍ୟ",
    active: "ସକ୍ରିୟ ସମସ୍ୟା",
    resolvedWeek: "ଏହି ସପ୍ତାହରେ ସମାଧାନ",
    rate: "ସମାଧାନ ହାର",
    high: "ଉଚ୍ଚ ପ୍ରାଥମିକତା",
    quote: "ସମସ୍ୟା ଜଣାଇବା ପରେ ଆପଣଙ୍କ ସ୍ୱର ହରାଇଯିବା ଉଚିତ୍ ନୁହେଁ।",
    support:
      "NagarSwar ନାଗରିକ ରିପୋର୍ଟକୁ ଦୃଶ୍ୟମାନ ଏବଂ ଟ୍ରାକ୍ କରିପାରିବା କାର୍ଯ୍ୟରେ ପରିଣତ କରେ।",
    shared: "ସ୍ୱଚ୍ଛ ଏବଂ ସୁରକ୍ଷିତ ଆଗାମୀକାଲି ଆମ ସମସ୍ତଙ୍କ ଦାୟିତ୍ୱ।",
    latest: "ମୋର ସବୁଠାରୁ ନୂଆ ଅଭିଯୋଗ",
    viewAll: "ସବୁ ଦେଖନ୍ତୁ",
    report: "ରିପୋର୍ଟ",
    reportSub: "ସହରର ସମସ୍ୟା ଜଣାନ୍ତୁ",
    verify: "ଯାଞ୍ଚ",
    verifySub: "ଅଭିଯୋଗ ଯାଞ୍ଚ କରନ୍ତୁ",
    prioritize: "ପ୍ରାଥମିକତା",
    prioritizeSub: "ଗୁରୁତ୍ୱ ନିର୍ଦ୍ଧାରଣ",
    resolve: "ସମାଧାନ",
    resolveSub: "ବିଭାଗ କାର୍ଯ୍ୟ କରେ",
    reward: "ପୁରସ୍କାର",
    rewardSub: "NagarCoins ପାଆନ୍ତୁ",
    submitted: "ଦାଖଲ",
    verified: "ଯାଞ୍ଚ",
    assigned: "ଦାୟିତ୍ୱ",
    resolved: "ସମାଧାନ",
  },
};

const alertData = {
  en: [
    ["🌧️", "Heavy Rain Warning", "High"],
    ["⛈️", "Thunderstorm Risk", "High"],
    ["🌊", "Flood Watch", "Medium"],
    ["🔥", "Fire Alert", "Medium"],
    ["⛰️", "Landslide Risk", "Low"],
    ["〰️", "Earthquake Alert", "Low"],
  ],

  hi: [
    ["🌧️", "भारी बारिश की चेतावनी", "उच्च"],
    ["⛈️", "तूफान का खतरा", "उच्च"],
    ["🌊", "बाढ़ की निगरानी", "मध्यम"],
    ["🔥", "आग का अलर्ट", "मध्यम"],
    ["⛰️", "भूस्खलन का खतरा", "कम"],
    ["〰️", "भूकंप अलर्ट", "कम"],
  ],

  od: [
    ["🌧️", "ଭାରି ବର୍ଷା ସତର୍କତା", "ଉଚ୍ଚ"],
    ["⛈️", "ଝଡ଼ବର୍ଷା ବିପଦ", "ଉଚ୍ଚ"],
    ["🌊", "ବନ୍ୟା ସତର୍କତା", "ମଧ୍ୟମ"],
    ["🔥", "ଅଗ୍ନିକାଣ୍ଡ ସତର୍କତା", "ମଧ୍ୟମ"],
    ["⛰️", "ଭୂସ୍ଖଳନ ବିପଦ", "କମ୍"],
    ["〰️", "ଭୂମିକମ୍ପ ସତର୍କତା", "କମ୍"],
  ],
};

const safetyGuides = [
  {
    icon: "🌧️",
    title: "Heavy Rain",
    tips: [
      "Avoid waterlogged roads and low-lying areas.",
      "Do not walk or drive through fast-moving water.",
      "Keep phones and emergency lights charged.",
      "Follow official local authority warnings.",
    ],
  },
  {
    icon: "⛈️",
    title: "Thunderstorm",
    tips: [
      "Stay indoors during lightning.",
      "Avoid open fields, trees and electric poles.",
      "Unplug sensitive electrical equipment if safe.",
      "Avoid unnecessary travel during severe weather.",
    ],
  },
  {
    icon: "🌊",
    title: "Flood",
    tips: [
      "Move toward higher ground if water levels rise.",
      "Never enter flooded roads without knowing the depth.",
      "Keep important documents and medicines protected.",
      "Follow evacuation instructions from authorities.",
    ],
  },
  {
    icon: "🔥",
    title: "Fire",
    tips: [
      "Move away from smoke and flames immediately.",
      "Use stairs instead of lifts during building fires.",
      "Call emergency services when safe.",
      "Do not re-enter a burning building.",
    ],
  },
  {
    icon: "⛰️",
    title: "Landslide",
    tips: [
      "Stay away from unstable slopes.",
      "Watch for falling rocks and unusual ground movement.",
      "Avoid travelling through affected hill roads.",
      "Follow local evacuation instructions.",
    ],
  },
  {
    icon: "〰️",
    title: "Earthquake",
    tips: [
      "Drop, cover and hold during shaking.",
      "Stay away from windows and heavy objects.",
      "After shaking stops, move carefully to a safe open area.",
      "Expect possible aftershocks.",
    ],
  },
];

const featureData = [
  {
    icon: "🧠",
    title: "AI Prioritization",
    description: "AI analyzes urgency and public impact.",
  },
  {
    icon: "🔍",
    title: "Duplicate Detection",
    description: "Detects repeated complaints and issue clusters.",
  },
  {
    icon: "📍",
    title: "Smart Department Routing",
    description: "Routes issues to the responsible department.",
  },
  {
    icon: "🛰️",
    title: "Live Tracking",
    description: "Track complaint progress and receive updates.",
  },
  {
    icon: "🪙",
    title: "NagarCoins Rewards",
    description: "Earn coins when genuine issues are resolved.",
  },
  {
    icon: "🛡️",
    title: "Safety Alerts",
    description: "Receive warnings to keep your community safe.",
  },
  {
    icon: "🎙️",
    title: "Voice & Language AI",
    description: "Speak complaints and automatically detect language.",
  },
];

function loadLatestComplaint() {
  try {
    const complaints = JSON.parse(
      localStorage.getItem("civicaiComplaints") || "[]"
    );

    return complaints[0];
  } catch {
    return undefined;
  }
}

function HomeV2() {
  const [showNotifications, setShowNotifications] = useState(false);

  const [showRewards, setShowRewards] = useState(false);

  const [showSafetyGuide, setShowSafetyGuide] = useState(false);

  const [selectedAlert, setSelectedAlert] = useState(null);

  const [activeFeature, setActiveFeature] = useState(null);

  const [voiceTranscript, setVoiceTranscript] = useState("");

  const [isListening, setIsListening] = useState(false);

  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem("nagarCoins");

    return savedCoins ? Number(savedCoins) : 1250;
  });

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("nagarswarLanguage");

    return translations[savedLanguage] ? savedLanguage : "en";
  });

  const text = translations[language];

  const alerts = alertData[language];

  const latestComplaint = loadLatestComplaint();

  function changeLanguage(event) {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);

    localStorage.setItem("nagarswarLanguage", selectedLanguage);
  }

  function redeemReward(cost, rewardName) {
    if (coins < cost) {
      alert("❌ You don't have enough NagarCoins!");
      return;
    }

    const newBalance = coins - cost;

    setCoins(newBalance);

    localStorage.setItem("nagarCoins", newBalance);

    alert(`🎉 ${rewardName} redeemed successfully!`);
  }

  function openAlertDetails(index) {
    const alert = alerts[index];

    const guide = safetyGuides[index];

    setSelectedAlert({
      icon: alert[0],
      title: alert[1],
      level: alert[2],
      guide,
    });
  }

  function openSafetyFromNavbar(event) {
    event.preventDefault();

    setShowSafetyGuide(true);
  }

  function openRewardsFromNavbar(event) {
    event.preventDefault();

    setShowRewards(true);
  }

  function handleFeatureClick(featureTitle) {
    if (featureTitle === "Live Tracking") {
      window.location.href = "/track";
      return;
    }

    if (featureTitle === "NagarCoins Rewards") {
      setShowRewards(true);
      return;
    }

    if (featureTitle === "Safety Alerts") {
      setShowSafetyGuide(true);
      return;
    }

    setActiveFeature(featureTitle);
  }

  function startVoiceDemo() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : language === "od"
        ? "or-IN"
        : "en-IN";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      setVoiceTranscript(spokenText);
    };

    recognition.onerror = () => {
      setIsListening(false);

      alert("Could not capture voice. Please allow microphone permission.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function renderFeatureContent() {
    if (activeFeature === "AI Prioritization") {
      return (
        <>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🧠</div>

          <h2>AI Priority Analysis</h2>

          <p style={{ color: "#666" }}>
            NagarSwar analyzes the urgency and potential public impact of a
            reported civic issue.
          </p>

          <div
            style={{
              background: "#f3f7eb",
              borderRadius: "14px",
              padding: "18px",
              marginTop: "18px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Example Priority Score</h3>

            <p>Severity: 24 / 25</p>
            <p>Public Impact: 23 / 25</p>
            <p>Urgency: 22 / 25</p>
            <p>Complaint Frequency: 23 / 25</p>

            <hr />

            <strong style={{ fontSize: "22px", color: "#b43a2d" }}>
              Total: 92 / 100 — High Priority
            </strong>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "15px",
            }}
          >
            Prototype scoring — backend AI integration will replace demo data.
          </p>
        </>
      );
    }

    if (activeFeature === "Duplicate Detection") {
      return (
        <>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🔍</div>

          <h2>Duplicate Complaint Detection</h2>

          <p style={{ color: "#666" }}>
            NagarSwar can compare new complaints with existing reports to find
            complaints describing the same issue.
          </p>

          <div
            style={{
              padding: "16px",
              borderRadius: "14px",
              background: "#f5f5f5",
              marginTop: "18px",
            }}
          >
            <strong>New complaint</strong>

            <p>"Large pothole near market road."</p>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "14px",
              background: "#fff4dd",
              marginTop: "12px",
            }}
          >
            <strong>🔍 3 similar complaints detected</strong>

            <p>Similarity Score: 91%</p>
            <p>Area: Market Road</p>
            <p>Category: Road & Pothole</p>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "15px",
            }}
          >
            Prototype duplicate detection demonstration.
          </p>
        </>
      );
    }

    if (activeFeature === "Smart Department Routing") {
      return (
        <>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>📍</div>

          <h2>Smart Department Routing</h2>

          <p style={{ color: "#666" }}>
            The complaint category can be mapped to the responsible civic
            department.
          </p>

          <div
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "#f3f7eb",
              marginTop: "18px",
            }}
          >
            <p>
              🛣️ <strong>Road / Pothole</strong>
              <br />
              → Roads / Municipal Engineering Department
            </p>

            <hr />

            <p>
              🚮 <strong>Garbage / Sanitation</strong>
              <br />
              → Sanitation Department
            </p>

            <hr />

            <p>
              💧 <strong>Water Supply</strong>
              <br />
              → Water Supply Department
            </p>

            <hr />

            <p>
              ⚡ <strong>Electricity</strong>
              <br />
              → Electricity / Utility Department
            </p>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#777",
            }}
          >
            Prototype routing. Real government routing requires authorised
            integration.
          </p>
        </>
      );
    }

    if (activeFeature === "Voice & Language AI") {
      return (
        <>
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>🎙️</div>

          <h2>Voice & Language AI</h2>

          <p style={{ color: "#666" }}>
            Speak your complaint instead of typing it. The prototype uses
            browser speech recognition.
          </p>

          <button
            type="button"
            onClick={startVoiceDemo}
            disabled={isListening}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "18px",
              border: "none",
              borderRadius: "12px",
              background: "#b7e647",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {isListening ? "🎙️ Listening..." : "🎙️ Start Voice Input"}
          </button>

          <div
            style={{
              marginTop: "18px",
              minHeight: "100px",
              padding: "16px",
              borderRadius: "12px",
              background: "#f5f5f5",
            }}
          >
            <strong>Detected speech</strong>

            <p>
              {voiceTranscript ||
                "Your spoken complaint will appear here after recording."}
            </p>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "12px",
            }}
          >
            Language follows your selected English / Hindi / Odia option.
          </p>
        </>
      );
    }

    return null;
  }

  return (
    <div className="v2-page" id="v2-home">
      {/* ================= NAVBAR ================= */}

      <header className="v2-navbar">
        <a href="#v2-home" className="v2-logo">
          <img src={nagarSwarLogo} alt="NagarSwar AI" />
        </a>

        <nav className="v2-navigation">
          <a href="#v2-home">{text.home}</a>
          <Link to="/report">{text.report}</Link>
          <Link to="/map">{text.map}</Link>

          <a href="#safety-alerts" onClick={openSafetyFromNavbar}>
            {text.alerts}
          </a>

          <a href="#rewards" onClick={openRewardsFromNavbar}>
            {text.rewards}
          </a>

          <Link to="/track">{text.track}</Link>
        </nav>

        <div className="v2-navbar-tools">
          <select
            value={language}
            onChange={changeLanguage}
            aria-label="Select language"
            className="language-selector"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="od">ଓଡ଼ିଆ</option>
          </select>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              onClick={() =>
                setShowNotifications((previousState) => !previousState)
              }
            >
              🔔
              <span>3</span>
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-panel-heading">
                  <strong>🔔 Notifications</strong>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="notification-row">
                  <strong>✅ Complaint submitted</strong>
                  <p>Your complaint was submitted successfully.</p>
                </div>

                <div className="notification-row">
                  <strong>⚠️ Heavy Rain Warning</strong>
                  <p>Heavy rainfall warning has been issued in the demo feed.</p>
                </div>

                <div className="notification-row">
                  <strong>🟡 Complaint under review</strong>
                  <p>Your reported issue is currently being reviewed.</p>
                </div>
              </div>
            )}
          </div>
          <Link to="/admin" className="v2-admin-login">
  🛡 Admin
</Link>

          <Link to="/login" className="v2-sign-in">
            {text.signIn}
          </Link>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="v2-main">
        <section className="v2-dashboard-redesign">
          {/* LEFT HERO */}

          <div className="v2-introduction">
            <p className="v2-eyebrow">NAGARSWAR AI CIVIC PLATFORM</p>

            <h1>
              {text.heroOne}
              <br />
              <span>{text.heroTwo}</span>
              <br />
              {text.heroThree}
            </h1>

            <p className="v2-description">{text.description}</p>

            <div className="v2-actions">
              <Link to="/report" className="v2-primary-button">
                ✎ {text.reportButton} →
              </Link>

              <Link to="/map" className="v2-secondary-button">
                ◫ {text.exploreMap}
              </Link>
            </div>

            <div className="v2-trust-row">
              <span>🛡 {text.verified}</span>
              <span>◉ {text.transparent}</span>
            </div>

            <div className="hero-city-line" aria-hidden="true">
              <span>⌂</span>
              <span>▥</span>
              <span>♜</span>
              <span>▤</span>
              <span>⌂</span>
            </div>

            <p className="hero-city-caption">
              CLEANER CITIES &nbsp; | &nbsp; SAFER COMMUNITIES &nbsp; | &nbsp;
              STRONGER TOMORROW
            </p>
          </div>

          {/* CITY PULSE */}

          <section className="city-pulse-panel">
            <div className="city-pulse-top">
              <div className="city-pulse-content">
                <div className="city-pulse-heading">
                  <div className="pulse-mark">〽</div>

                  <div>
                    <div className="pulse-title-row">
                      <h2>{pulseTranslations[language].title}</h2>
                      <span className="pulse-live">
                        ● {pulseTranslations[language].live}
                      </span>
                    </div>

                    <p>{pulseTranslations[language].subtitle}</p>
                  </div>
                </div>

                <div className="pulse-metrics-label">
                  {pulseTranslations[language].prototype}
                </div>

                <div className="pulse-stats-grid">
                  <article className="pulse-stat-card">
                    <span className="pulse-stat-icon stat-red">▤</span>
                    <strong>128</strong>
                    <p>{pulseTranslations[language].active}</p>
                  </article>

                  <article className="pulse-stat-card">
                    <span className="pulse-stat-icon stat-green">✓</span>
                    <strong>47</strong>
                    <p>{pulseTranslations[language].resolvedWeek}</p>
                  </article>

                  <article className="pulse-stat-card">
                    <span className="pulse-stat-icon stat-blue">◔</span>
                    <strong>82%</strong>
                    <p>{pulseTranslations[language].rate}</p>
                  </article>

                  <article className="pulse-stat-card">
                    <span className="pulse-stat-icon stat-orange">!</span>
                    <strong>12</strong>
                    <p>{pulseTranslations[language].high}</p>
                  </article>
                </div>
              </div>

              <div className="city-pulse-visual">
                <img
                  src={cityPulseImage}
                  alt="Citizens and civic workers improving an Indian city"
                />
              </div>
            </div>

            <div className="city-pulse-middle">
              <article className="impact-quote-card">
                <span className="impact-quote-mark">“</span>

                <div>
                  <h3>{pulseTranslations[language].quote}</h3>
                  <p>{pulseTranslations[language].support}</p>
                </div>

                <div className="impact-side-note">
                  {pulseTranslations[language].shared}
                </div>
              </article>

              <article className="latest-complaint-card">
                <div className="latest-complaint-head">
                  <h3>{pulseTranslations[language].latest}</h3>

                  <Link to="/track">
                    {pulseTranslations[language].viewAll} →
                  </Link>
                </div>

                <div className="latest-complaint-main">
                  <div>
                    <strong>
                      {latestComplaint?.title || "Waterlogging on Main Road"}
                    </strong>

                    <p>
                      #{latestComplaint?.id || "NSAI-2026-000001"}
                    </p>
                  </div>

                  <span className="latest-status">{text.inProgress}</span>
                </div>

                <div className="complaint-timeline">
                  <div className="timeline-step complete">
                    <span>✓</span>
                    <strong>{pulseTranslations[language].submitted}</strong>
                  </div>

                  <i></i>

                  <div className="timeline-step complete">
                    <span>✓</span>
                    <strong>{pulseTranslations[language].verified}</strong>
                  </div>

                  <i></i>

                  <div className="timeline-step current">
                    <span></span>
                    <strong>{pulseTranslations[language].assigned}</strong>
                  </div>

                  <i></i>

                  <div className="timeline-step">
                    <span></span>
                    <strong>{pulseTranslations[language].resolved}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="civic-workflow">
              <div className="workflow-step">
                <span className="workflow-icon workflow-report">▤</span>
                <strong>{pulseTranslations[language].report}</strong>
                <small>{pulseTranslations[language].reportSub}</small>
              </div>

              <b>→</b>

              <div className="workflow-step">
                <span className="workflow-icon workflow-verify">⌕</span>
                <strong>{pulseTranslations[language].verify}</strong>
                <small>{pulseTranslations[language].verifySub}</small>
              </div>

              <b>→</b>

              <div className="workflow-step">
                <span className="workflow-icon workflow-priority">☷</span>
                <strong>{pulseTranslations[language].prioritize}</strong>
                <small>{pulseTranslations[language].prioritizeSub}</small>
              </div>

              <b>→</b>

              <div className="workflow-step">
                <span className="workflow-icon workflow-resolve">⚙</span>
                <strong>{pulseTranslations[language].resolve}</strong>
                <small>{pulseTranslations[language].resolveSub}</small>
              </div>

              <b>→</b>

              <div className="workflow-step">
                <span className="workflow-icon workflow-reward">★</span>
                <strong>{pulseTranslations[language].reward}</strong>
                <small>{pulseTranslations[language].rewardSub}</small>
              </div>
            </div>
          </section>
        </section>

        {/* ================= CLICKABLE PLATFORM CAPABILITIES ================= */}

        <section className="v2-features">
          <div className="features-heading-row">
            <div>
              <p>PLATFORM CAPABILITIES</p>
              <h2>{text.featuresTitle}</h2>
            </div>

            <span>Technology. People. A better tomorrow.</span>
          </div>

          <div className="v2-feature-grid">
            {featureData.map((feature) => (
              <article
                className="v2-feature-card"
                key={feature.title}
                role="button"
                tabIndex={0}
                onClick={() => handleFeatureClick(feature.title)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleFeatureClick(feature.title);
                  }
                }}
              >
                <span>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-arrow">→</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ==================================================
          GENERIC FEATURE POPUP
      ================================================== */}

      {activeFeature && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(5px)",
            zIndex: 1000002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setActiveFeature(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "580px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#ffffff",
              color: "#182018",
              borderRadius: "22px",
              padding: "25px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#eeeeee",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {renderFeatureContent()}

            <button
              type="button"
              onClick={() => setActiveFeature(null)}
              style={{
                width: "100%",
                marginTop: "22px",
                padding: "13px",
                border: "none",
                borderRadius: "10px",
                background: "#18351d",
                color: "#ffffff",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          REWARDS POPUP
      ================================================== */}

      {showRewards && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000000,
            padding: "20px",
          }}
          onClick={() => setShowRewards(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "#ffffff",
              color: "#172217",
              borderRadius: "22px",
              overflow: "hidden",
              boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: "22px 24px",
                background: "linear-gradient(135deg,#17351b,#2a5425)",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>🪙 NagarCoins Rewards</h2>

                <p style={{ margin: "6px 0 0" }}>
                  Redeem your NagarCoins
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRewards(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                margin: "20px",
                padding: "18px",
                borderRadius: "15px",
                background: "#f3f7eb",
              }}
            >
              <small>AVAILABLE BALANCE</small>

              <div
                style={{
                  fontSize: "31px",
                  fontWeight: "900",
                  color: "#315c21",
                }}
              >
                🪙 {coins.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              {[
                ["🛍️", "₹50 Shopping Coupon", 100],
                ["🍔", "₹100 Food Coupon", 200],
                ["🎁", "₹250 Reward Voucher", 500],
              ].map(([icon, name, cost]) => (
                <div
                  key={name}
                  style={{
                    padding: "17px",
                    borderRadius: "14px",
                    border: "1px solid #e6e6e6",
                    marginBottom: "13px",
                  }}
                >
                  <strong>
                    {icon} {name}
                  </strong>

                  <p style={{ color: "#666" }}>
                    Cost: {cost} NagarCoins
                  </p>

                  <button
                    type="button"
                    onClick={() => redeemReward(cost, name)}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "#b7e647",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Redeem • {cost} Coins
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          SAFETY GUIDE
      ================================================== */}

      {showSafetyGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(5px)",
            zIndex: 1000000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowSafetyGuide(false)}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#182018",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: "22px",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#b4372b,#76261f)",
                color: "#ffffff",
                padding: "22px 25px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>🛡 Safety Guide</h2>

                <p>Emergency preparedness information</p>
              </div>

              <button
                type="button"
                onClick={() => setShowSafetyGuide(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "22px" }}>
              <div
                style={{
                  background: "#fff4dd",
                  padding: "14px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}
              >
                ⚠️ Prototype safety guidance. Follow official authorities during
                real emergencies.
              </div>

              {safetyGuides.map((guide) => (
                <div
                  key={guide.title}
                  style={{
                    padding: "18px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "14px",
                    marginBottom: "14px",
                  }}
                >
                  <h3>
                    {guide.icon} {guide.title}
                  </h3>

                  <ul>
                    {guide.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          INDIVIDUAL SAFETY ALERT
      ================================================== */}

      {selectedAlert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            zIndex: 1000001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "470px",
              background: "#ffffff",
              color: "#182018",
              borderRadius: "20px",
              overflow: "hidden",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: "22px",
                background: "#18351d",
                color: "#ffffff",
              }}
            >
              <div style={{ fontSize: "36px" }}>{selectedAlert.icon}</div>

              <h2>{selectedAlert.title}</h2>

              <strong>Risk Level: {selectedAlert.level}</strong>
            </div>

            <div style={{ padding: "22px" }}>
              <h3>What should you do?</h3>

              <ul>
                {selectedAlert.guide.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                style={{
                  width: "100%",
                  padding: "13px",
                  border: "none",
                  background: "#b7e647",
                  borderRadius: "10px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeV2;
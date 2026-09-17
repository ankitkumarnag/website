import { useState } from "react";
import { Link } from "react-router";
import nagarSwarLogo from "../assets/nagarswar-logo.png";
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

          {/* NOTIFICATION */}

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
              <div
                style={{
                  position: "absolute",
                  top: "58px",
                  right: "0",
                  width: "330px",
                  background: "#ffffff",
                  color: "#1a1a1a",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 15px 45px rgba(0,0,0,0.35)",
                  zIndex: 999999,
                }}
              >
                <div
                  style={{
                    padding: "17px 20px",
                    borderBottom: "1px solid #eeeeee",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <strong>🔔 Notifications</strong>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>✅ Complaint submitted</strong>

                  <p style={{ color: "#666", fontSize: "13px" }}>
                    Your complaint was submitted successfully.
                  </p>
                </div>

                <div
                  style={{
                    padding: "15px 20px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>⚠️ Heavy Rain Warning</strong>

                  <p style={{ color: "#666", fontSize: "13px" }}>
                    Heavy rainfall warning has been issued in the demo feed.
                  </p>
                </div>

                <div style={{ padding: "15px 20px" }}>
                  <strong>🟡 Complaint under review</strong>

                  <p style={{ color: "#666", fontSize: "13px" }}>
                    Your reported issue is currently being reviewed.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link to="/login" className="v2-sign-in">
            {text.signIn}
          </Link>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main style={{ padding: "40px" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1.65fr 0.88fr",
            gap: "22px",
            alignItems: "start",
          }}
        >
          {/* HERO */}

          <div style={{ paddingTop: "70px" }}>
            <p
              style={{
                letterSpacing: "3px",
                fontSize: "13px",
                fontWeight: "800",
                color: "#c8f15a",
                marginBottom: "25px",
              }}
            >
              NAGARSWAR AI CIVIC PLATFORM
            </p>

            <h1
              style={{
                fontSize: "60px",
                lineHeight: "1.05",
                margin: 0,
              }}
            >
              {text.heroOne}

              <br />

              <span style={{ color: "#b7e647" }}>{text.heroTwo}</span>

              <br />

              <span style={{ color: "#b7e647" }}>{text.heroThree}</span>
            </h1>

            <p
              style={{
                marginTop: "30px",
                lineHeight: "1.8",
                fontSize: "17px",
                opacity: "0.82",
                maxWidth: "480px",
              }}
            >
              {text.description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                marginTop: "30px",
              }}
            >
              <Link
                to="/report"
                style={{
                  padding: "16px 24px",
                  borderRadius: "12px",
                  background: "#b7e647",
                  color: "#10220e",
                  textDecoration: "none",
                  fontWeight: "800",
                }}
              >
                ✎ {text.reportButton}
              </Link>

              <Link
                to="/map"
                style={{
                  padding: "16px 24px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: "700",
                }}
              >
                ◫ {text.exploreMap}
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px",
              }}
            >
              <span
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                🛡 {text.verified}
              </span>

              <span
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                ◉ {text.transparent}
              </span>
            </div>
          </div>

          {/* CENTER */}

          <div>
            <section
              style={{
                border: "1px solid rgba(183,230,71,0.30)",
                borderRadius: "20px",
                overflow: "hidden",
                background: "rgba(6,31,16,0.75)",
              }}
            >
              <div
                style={{
                  padding: "17px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div>
                  <strong>{text.liveMap}</strong>

                  <span
                    style={{
                      marginLeft: "10px",
                      color: "#80ea58",
                    }}
                  >
                    ● {text.live}
                  </span>
                </div>

                <div>
                  <button type="button">Filter</button>

                  <Link to="/map" style={{ marginLeft: "10px" }}>
                    ⛶
                  </Link>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  minHeight: "445px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg,#10281b,#0e2218 45%,#17301f)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "120%",
                    height: "18px",
                    background: "rgba(255,255,255,0.08)",
                    transform: "rotate(-15deg)",
                    top: "160px",
                    left: "-60px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    width: "120%",
                    height: "18px",
                    background: "rgba(255,255,255,0.08)",
                    transform: "rotate(30deg)",
                    top: "310px",
                    left: "-50px",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: "130px",
                    left: "12%",
                    fontSize: "36px",
                  }}
                >
                  📍
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: "70px",
                    left: "42%",
                    fontSize: "36px",
                  }}
                >
                  🚧
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: "80px",
                    right: "20%",
                    fontSize: "36px",
                  }}
                >
                  ⚠️
                </span>

                <span
                  style={{
                    position: "absolute",
                    top: "275px",
                    left: "35%",
                    fontSize: "36px",
                  }}
                >
                  🌳
                </span>

                <div
                  className="priority-analysis"
                  style={{
                    position: "absolute",
                    right: "20px",
                    bottom: "20px",
                    maxWidth: "290px",
                  }}
                >
                  <p>{text.aiAnalysis}</p>

                  <strong>{text.highPriority}</strong>

                  <span>92/100</span>

                  <small>{text.analysisText}</small>

                  <Link to="/track">{text.viewDetails} →</Link>
                </div>
              </div>
            </section>

            {/* REWARDS + STATUS */}

            <div className="v2-summary-grid">
              <section className="coin-card" id="rewards">
                <div className="coin-symbol">★</div>

                <div className="coin-information">
                  <p>NagarCoins</p>

                  <strong>{coins.toLocaleString()}</strong>

                  <span>{text.coinsMessage}</span>
                </div>

                <div className="coin-progress">
                  <span></span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRewards(true)}
                >
                  {text.redeem}
                </button>
              </section>

              <section className="current-status-card">
                <p>{text.currentStatus}</p>

                <div className="status-card-heading">
                  <strong>
                    {latestComplaint?.id || "NSAI-2026-000001"}
                  </strong>

                  <span>{text.inProgress}</span>
                </div>

                <small>
                  {latestComplaint?.title || "Waterlogging on Road"}
                </small>

                <div className="mini-status-line">
                  <span className="finished">✓</span>
                  <i></i>
                  <span className="finished">✓</span>
                  <i></i>
                  <span className="current"></span>
                  <i></i>
                  <span></span>
                </div>

                <Link to="/track">{text.track} →</Link>
              </section>
            </div>
          </div>

          {/* SAFETY */}

          <aside className="safety-alert-card" id="safety-alerts">
            <div className="safety-heading">
              <span>🔔</span>

              <h2>{text.warningTitle}</h2>
            </div>

            <div className="safety-location">
              <span>📍 Bhubaneswar</span>

              <span>◷ Prototype Feed</span>
            </div>

            <p
              style={{
                fontSize: "11px",
                opacity: "0.7",
                margin: "10px 0 14px",
              }}
            >
              Demo alerts — live government alert integration pending.
            </p>

            <div className="alert-list">
              {alerts.map(([icon, title, level], index) => (
                <div
                  className="alert-item"
                  key={title}
                  onClick={() => openAlertDetails(index)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="alert-icon">{icon}</span>

                  <strong>{title}</strong>

                  <small
                    className={
                      index < 2
                        ? "alert-high"
                        : index < 4
                        ? "alert-medium"
                        : "alert-low"
                    }
                  >
                    {level}
                  </small>
                </div>
              ))}
            </div>

            <p className="verified-source">
              🛡 Prototype Safety Feed
            </p>

            <button
              type="button"
              className="safety-guide-button"
              onClick={() => setShowSafetyGuide(true)}
            >
              {text.safetyGuide}
            </button>
          </aside>
        </section>

        {/* ==================================================
            CLICKABLE PLATFORM CAPABILITIES
        ================================================== */}

        <section className="v2-features">
          <p>PLATFORM CAPABILITIES</p>

          <h2>{text.featuresTitle}</h2>

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
                    handleFeatureClick(feature.title);
                  }
                }}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-6px)";
                  event.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>{feature.icon}</span>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: "25px",
                    color: "#b7e647",
                    fontSize: "24px",
                  }}
                >
                  →
                </span>
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
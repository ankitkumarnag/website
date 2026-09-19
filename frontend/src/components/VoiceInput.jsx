import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";
import AppleSoundWave from "./ui/amicro/AppleSoundWave";
import "./VoiceInput.css";

const speechLanguages = [
  { value: "hi-IN", label: "हिन्दी (Hindi)" },
  { value: "en-IN", label: "English (India)" },
  { value: "or-IN", label: "ଓଡ଼ିଆ (Odia)" },
];

function getInitialLanguage() {
  const saved = localStorage.getItem("nagarswarVoiceLang");
  if (saved && speechLanguages.some((l) => l.value === saved)) {
    return saved;
  }
  return "hi-IN";
}

function detectScriptLanguage(text) {
  if (!text) return "";
  if (/[\u0B00-\u0B7F]/.test(text)) {
    return "ଓଡ଼ିଆ (Odia)";
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return "हिन्दी (Hindi)";
  }
  return "English";
}

function VoiceInput({ onTranscript, buttonText = "Voice Dictate", labelHelper = null }) {
  const [selectedLang, setSelectedLang] = useState(getInitialLanguage);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState(
    "Select your dictation language (Hindi, English, Odia) and tap the microphone to speak."
  );

  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function handleLanguageChange(newLang) {
    setSelectedLang(newLang);
    localStorage.setItem("nagarswarVoiceLang", newLang);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Voice input is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    // Set the exact Speech Recognition language locale requested
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const currentLangLabel = speechLanguages.find((l) => l.value === selectedLang)?.label || selectedLang;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage(`Listening in ${currentLangLabel} (${selectedLang}). Speak clearly now...`);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let temporaryTranscript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const spokenText = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalTranscript += spokenText;
        } else {
          temporaryTranscript += spokenText;
        }
      }

      if (temporaryTranscript) {
        setMessage(`Transcribing in ${currentLangLabel}: "${temporaryTranscript}"`);
      }

      if (finalTranscript.trim()) {
        const scriptLang = detectScriptLanguage(finalTranscript.trim());
        onTranscript(finalTranscript.trim(), scriptLang);
        setMessage(`Transcribed in ${currentLangLabel}: "${finalTranscript.trim()}"`);
      }
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        "not-allowed":
          "Microphone access was denied. Please allow microphone permission in browser settings.",
        "audio-capture":
          "No microphone detected on this device.",
        "no-speech":
          "No speech was detected. Please try again and speak closer to the mic.",
        network:
          "Speech recognition network error. Please check your internet connection.",
      };

      setMessage(
        errorMessages[event.error] ||
          "Voice transcription encountered an error. Please try again."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  const activeLangObj = speechLanguages.find((l) => l.value === selectedLang) || speechLanguages[0];

  return (
    <div className="voice-input-panel bg-[#0B192C]/90 border border-[#1E3E62] rounded-xl p-3.5 shadow-lg backdrop-blur-md">
      <div className="voice-input-controls flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Voice Dictate Button */}
          <button
            type="button"
            className={`voice-button ${isListening ? "listening bg-[#EA580C]" : "bg-[#EA580C] hover:bg-[#C2410C]"} text-white font-semibold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-2 cursor-pointer transition-all border border-[#EA580C]/50`}
            onClick={startListening}
          >
            <Icon name={isListening ? "mic-off" : "mic"} size={16} strokeWidth={2} />
            <span>{isListening ? "Listening..." : buttonText}</span>
          </button>
        </div>

        {isListening && (
          <div className="ml-auto flex items-center gap-2">
            <AppleSoundWave isListening={true} color="saffron" />
          </div>
        )}
      </div>

      <div className="voice-feedback flex items-center gap-2 mt-3 p-2 rounded-lg bg-[#070F1E]/60 border border-[#1E3E62]/60">
        <Icon name={isListening ? "sparkles" : "info"} size={15} className="text-[#EA580C] flex-shrink-0" />
        <span className="voice-message text-xs text-[#94A3B8] font-mono">{message}</span>
      </div>

      {labelHelper && (
        <p className="voice-caption text-[11px] text-[#64748B] mt-1">{labelHelper}</p>
      )}
    </div>
  );
}

export default VoiceInput;
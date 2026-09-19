import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";
import "./VoiceInput.css";

const speechLanguages = [
  { value: "en-IN", label: "English (India)" },
  { value: "hi-IN", label: "हिन्दी (Hindi)" },
  { value: "or-IN", label: "ଓଡ଼ିଆ (Odia)" },
];

function getInitialLanguage() {
  const selectedLanguage = localStorage.getItem("nagarswarLanguage");

  const languageMap = {
    en: "en-IN",
    hi: "hi-IN",
    od: "or-IN",
  };

  return languageMap[selectedLanguage] || "en-IN";
}

function VoiceInput({ onTranscript }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState(
    "Select your language and tap the microphone to dictate your complaint."
  );

  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

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

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage("Listening… Speak clearly in your selected language.");
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
        setMessage(`Transcribing: "${temporaryTranscript}"`);
      }

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        setMessage("Speech converted to text successfully. You can edit it above.");
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

  return (
    <div className="voice-input-panel">
      <div className="voice-input-controls">
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label="Select speech language"
          className="voice-language-select"
        >
          {speechLanguages.map((speechLanguage) => (
            <option value={speechLanguage.value} key={speechLanguage.value}>
              {speechLanguage.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={isListening ? "voice-button listening" : "voice-button"}
          onClick={startListening}
        >
          <Icon name={isListening ? "mic-off" : "mic"} size={18} strokeWidth={2} />
          <span>{isListening ? "Stop Recording" : "Voice Dictate"}</span>
        </button>
      </div>

      <div className="voice-feedback">
        <Icon name={isListening ? "sparkles" : "info"} size={15} className="voice-feedback-icon" />
        <span className="voice-message">{message}</span>
      </div>

      <p className="voice-caption">
        Dictated speech will automatically append into the description box.
      </p>
    </div>
  );
}

export default VoiceInput;
import { useEffect, useRef, useState } from "react";
import "./VoiceInput.css";

const speechLanguages = [
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "हिन्दी" },
  { value: "or-IN", label: "ଓଡ଼ିଆ" },
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
    "Select your language and press the microphone."
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
        "Voice typing is not supported in this browser. Please use Google Chrome."
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
      setMessage("Listening… Speak your complaint clearly.");
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
        setMessage(`Listening: ${temporaryTranscript}`);
      }

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        setMessage("Voice converted to text. Please review it before submitting.");
      }
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        "not-allowed":
          "Microphone permission was blocked. Please allow microphone access.",
        "audio-capture":
          "No microphone was detected on this device.",
        "no-speech":
          "No speech was detected. Please try again and speak clearly.",
        network:
          "Speech service could not connect. Check your internet connection.",
      };

      setMessage(
        errorMessages[event.error] ||
          "Voice recognition failed. Please try again."
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
        >
          {speechLanguages.map((speechLanguage) => (
            <option
              value={speechLanguage.value}
              key={speechLanguage.value}
            >
              {speechLanguage.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={isListening ? "voice-button listening" : "voice-button"}
          onClick={startListening}
        >
          <span>🎙️</span>
          {isListening ? "Stop Listening" : "Speak Complaint"}
        </button>
      </div>

      <p className="voice-message">{message}</p>

      <small>
        Your spoken text will appear in the description box. Review it before
        submitting the complaint.
      </small>
    </div>
  );
}

export default VoiceInput;
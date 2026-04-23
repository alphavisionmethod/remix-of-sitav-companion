// ═══════════════════════════════════════════════════════════════
// Personal Brain — Voice capability probe (Phase 4)
// ═══════════════════════════════════════════════════════════════

export interface VoiceCapabilities {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaRecorder: boolean;
  microphone: boolean;
  secureContext: boolean;
}

export function probeVoiceCapabilities(): VoiceCapabilities {
  if (typeof window === "undefined") {
    return {
      speechRecognition: false,
      speechSynthesis: false,
      mediaRecorder: false,
      microphone: false,
      secureContext: false,
    };
  }
  const w = window as Window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return {
    speechRecognition: Boolean(w.SpeechRecognition || w.webkitSpeechRecognition),
    speechSynthesis: typeof window.speechSynthesis !== "undefined",
    mediaRecorder: typeof window.MediaRecorder !== "undefined",
    microphone: Boolean(navigator?.mediaDevices?.getUserMedia),
    secureContext: window.isSecureContext === true,
  };
}

export function getSpeechRecognitionCtor(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) ?? null;
}
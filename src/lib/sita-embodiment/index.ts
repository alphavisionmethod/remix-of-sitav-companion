export {
  speak as ttsSpeak,
  cancel as ttsCancel,
  isTTSEnabled,
  setTTSEnabled,
  listVoices,
  whenVoicesReady,
  getPreferredVoiceURI,
  setPreferredVoiceURI,
} from "./tts";
export {
  isWakeWordSupported,
  isWakeWordEnabled,
  setWakeWordEnabled,
  startWakeWord,
  stopWakeWord,
  onWake,
  getWakePhrases,
  setWakePhrases,
} from "./wake-word";
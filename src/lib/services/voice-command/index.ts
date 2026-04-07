// ═══════════════════════════════════════════════════════════════
// SITA OS — Voice Command Engine
// Hands-free OS control via Web Speech API with wake word
// ═══════════════════════════════════════════════════════════════
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — stateful module, persist via universal adapter

export type VoiceCommandStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: string;
  domain: string;
  confidence: number;
  timestamp: Date;
  executed: boolean;
  result?: string;
}

export interface VoiceConfig {
  wakeWord: string;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  voiceId?: string;
  speakingRate: number;
  pitch: number;
}

const INTENT_PATTERNS: Array<{ pattern: RegExp; intent: string; domain: string }> = [
  { pattern: /show.*invoices?|open.*invoices?/i, intent: 'navigate_invoices', domain: 'business' },
  { pattern: /check.*balance|show.*money|financial.*overview/i, intent: 'navigate_finance', domain: 'money' },
  { pattern: /new.*lead|add.*lead|create.*lead/i, intent: 'create_lead', domain: 'business' },
  { pattern: /approve.*all|approve.*pending/i, intent: 'approve_pending', domain: 'system' },
  { pattern: /show.*calendar|what.*schedule|today.*events?/i, intent: 'navigate_calendar', domain: 'concierge' },
  { pattern: /send.*invoice|create.*invoice/i, intent: 'create_invoice', domain: 'business' },
  { pattern: /how.*much.*revenue|total.*revenue/i, intent: 'query_revenue', domain: 'business' },
  { pattern: /show.*tasks?|household.*tasks?/i, intent: 'navigate_tasks', domain: 'concierge' },
  { pattern: /go.*home|main.*screen|dashboard/i, intent: 'navigate_home', domain: 'system' },
  { pattern: /help|what.*can.*do|commands?/i, intent: 'show_help', domain: 'system' },
  { pattern: /dark.*mode|light.*mode|toggle.*theme/i, intent: 'toggle_theme', domain: 'system' },
  { pattern: /search.*for|find/i, intent: 'search', domain: 'system' },
  { pattern: /shut.*down|log.*out|sign.*out/i, intent: 'logout', domain: 'system' },
  { pattern: /mute|do.*not.*disturb|focus.*mode/i, intent: 'focus_mode', domain: 'system' },
];

class VoiceCommandEngine {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private status: VoiceCommandStatus = 'idle';
  private config: VoiceConfig = {
    wakeWord: 'hey sita',
    language: 'en-US',
    continuous: true,
    interimResults: true,
    speakingRate: 1.0,
    pitch: 1.0,
  };
  private commandHistory: VoiceCommand[] = [];
  private listeners: Set<(status: VoiceCommandStatus) => void> = new Set();
  private commandListeners: Set<(cmd: VoiceCommand) => void> = new Set();
  private wakeWordDetected = false;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  get currentStatus(): VoiceCommandStatus {
    return this.status;
  }

  get history(): VoiceCommand[] {
    return [...this.commandHistory];
  }

  configure(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  start(): boolean {
    if (!this.isSupported) return false;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();
    this.synthesis = window.speechSynthesis;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;

    this.recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;

      const transcript = last[0].transcript.trim().toLowerCase();

      if (!this.wakeWordDetected) {
        if (transcript.includes(this.config.wakeWord)) {
          this.wakeWordDetected = true;
          this.speak('Yes?');
          setTimeout(() => { this.wakeWordDetected = false; }, 10000);
        }
        return;
      }

      this.wakeWordDetected = false;
      this.processCommand(transcript, last[0].confidence);
    };

    this.recognition.onerror = () => {
      this.setStatus('error');
    };

    this.recognition.onend = () => {
      if (this.status !== 'error' && this.config.continuous) {
        this.recognition?.start();
      }
    };

    this.recognition.start();
    this.setStatus('listening');
    return true;
  }

  stop(): void {
    this.recognition?.stop();
    this.recognition = null;
    this.setStatus('idle');
  }

  speak(text: string): void {
    if (!this.synthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.config.speakingRate;
    utterance.pitch = this.config.pitch;
    utterance.lang = this.config.language;
    this.setStatus('speaking');
    utterance.onend = () => this.setStatus('listening');
    this.synthesis.speak(utterance);
  }

  onStatusChange(listener: (status: VoiceCommandStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onCommand(listener: (cmd: VoiceCommand) => void): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }

  private processCommand(transcript: string, speechConfidence: number): void {
    this.setStatus('processing');

    const matched = INTENT_PATTERNS.find((p) => p.pattern.test(transcript));
    const command: VoiceCommand = {
      id: crypto.randomUUID(),
      transcript,
      intent: matched?.intent || 'unknown',
      domain: matched?.domain || 'system',
      confidence: speechConfidence * (matched ? 0.9 : 0.3),
      timestamp: new Date(),
      executed: false,
    };

    this.commandHistory.unshift(command);
    if (this.commandHistory.length > 50) this.commandHistory.pop();

    this.commandListeners.forEach((l) => l(command));

    if (command.intent === 'unknown') {
      this.speak("I didn't understand that. Try saying a command like 'show invoices' or 'check balance'.");
    } else {
      command.executed = true;
      this.speak(`Got it. ${this.describeIntent(command.intent)}`);
    }

    this.setStatus('listening');
  }

  private describeIntent(intent: string): string {
    const descriptions: Record<string, string> = {
      navigate_invoices: 'Opening invoices.',
      navigate_finance: 'Opening financial overview.',
      create_lead: 'Creating a new lead.',
      approve_pending: 'Processing pending approvals.',
      navigate_calendar: 'Opening your calendar.',
      create_invoice: 'Starting a new invoice.',
      query_revenue: 'Fetching revenue data.',
      navigate_tasks: 'Opening tasks.',
      navigate_home: 'Going home.',
      show_help: 'Here are the available commands.',
      toggle_theme: 'Toggling theme.',
      search: 'Opening search.',
      logout: 'Signing out.',
      focus_mode: 'Enabling focus mode.',
    };
    return descriptions[intent] || 'Processing your request.';
  }

  private setStatus(status: VoiceCommandStatus): void {
    this.status = status;
    this.listeners.forEach((l) => l(status));
  }
}

export const voiceCommandEngine = new VoiceCommandEngine();


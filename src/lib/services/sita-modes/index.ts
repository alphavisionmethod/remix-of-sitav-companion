// SITA OS — SITA Modes (elevated: 12 modes, auto-transition, mode effects)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export type SitaMode = 'standard' | 'focus' | 'executive' | 'stealth' | 'family' | 'travel' | 'emergency' | 'recovery' | 'execution' | 'founder' | 'investor_demo' | 'boardroom';

export interface ModeConfig {
  mode: SitaMode;
  displayName: string;
  surfaces: string[];
  notifications: 'all' | 'critical-only' | 'none';
  aiLevel: 'full' | 'advisory' | 'silent';
  theme?: string;
  summaryDepth: 'full' | 'brief' | 'headlines';
  assistantTone: 'formal' | 'warm' | 'direct' | 'calm';
  routingOverrides: Record<string, string>;
  automationsEnabled: boolean;
  priorityBias: string[];     // domains to prioritize
  suppressDomains: string[];  // domains to suppress
}

export interface ModeTransitionRule {
  from: SitaMode | '*';
  to: SitaMode;
  trigger: string;            // calendar event, time, location, manual
  condition: string;
  autoTransition: boolean;
}

export interface ModeTransitionLog {
  from: SitaMode;
  to: SitaMode;
  trigger: string;
  timestamp: string;
  auto: boolean;
}

const DEFAULT_CONFIGS: ModeConfig[] = [
  { mode: 'standard', displayName: 'Standard', surfaces: ['all'], notifications: 'all', aiLevel: 'full', summaryDepth: 'full', assistantTone: 'warm', routingOverrides: {}, automationsEnabled: true, priorityBias: [], suppressDomains: [] },
  { mode: 'focus', displayName: 'Focus', surfaces: ['current'], notifications: 'critical-only', aiLevel: 'advisory', summaryDepth: 'headlines', assistantTone: 'direct', routingOverrides: {}, automationsEnabled: false, priorityBias: [], suppressDomains: ['concierge'] },
  { mode: 'executive', displayName: 'Executive', surfaces: ['boardroom', 'business', 'finance'], notifications: 'critical-only', aiLevel: 'full', summaryDepth: 'brief', assistantTone: 'formal', routingOverrides: {}, automationsEnabled: true, priorityBias: ['business', 'finance'], suppressDomains: [] },
  { mode: 'stealth', displayName: 'Stealth', surfaces: ['minimal'], notifications: 'none', aiLevel: 'silent', summaryDepth: 'headlines', assistantTone: 'calm', routingOverrides: {}, automationsEnabled: false, priorityBias: [], suppressDomains: ['business', 'finance', 'concierge'] },
  { mode: 'family', displayName: 'Family', surfaces: ['concierge', 'calendar', 'tasks'], notifications: 'all', aiLevel: 'advisory', summaryDepth: 'brief', assistantTone: 'warm', routingOverrides: {}, automationsEnabled: true, priorityBias: ['concierge'], suppressDomains: ['business'] },
  { mode: 'travel', displayName: 'Travel', surfaces: ['travel', 'bookings', 'maps'], notifications: 'critical-only', aiLevel: 'full', summaryDepth: 'brief', assistantTone: 'direct', routingOverrides: {}, automationsEnabled: true, priorityBias: ['concierge'], suppressDomains: [] },
  { mode: 'emergency', displayName: 'Emergency', surfaces: ['all'], notifications: 'all', aiLevel: 'full', summaryDepth: 'full', assistantTone: 'direct', routingOverrides: {}, automationsEnabled: true, priorityBias: [], suppressDomains: [] },
  { mode: 'recovery', displayName: 'Recovery', surfaces: ['minimal', 'health'], notifications: 'none', aiLevel: 'advisory', summaryDepth: 'headlines', assistantTone: 'calm', routingOverrides: {}, automationsEnabled: false, priorityBias: [], suppressDomains: ['business', 'finance'] },
  { mode: 'execution', displayName: 'Execution', surfaces: ['business', 'tasks', 'communications'], notifications: 'critical-only', aiLevel: 'full', summaryDepth: 'brief', assistantTone: 'direct', routingOverrides: {}, automationsEnabled: true, priorityBias: ['business'], suppressDomains: [] },
  { mode: 'founder', displayName: 'Founder', surfaces: ['all'], notifications: 'all', aiLevel: 'full', summaryDepth: 'full', assistantTone: 'direct', routingOverrides: {}, automationsEnabled: true, priorityBias: ['business', 'finance'], suppressDomains: [] },
  { mode: 'investor_demo', displayName: 'Investor Demo', surfaces: ['boardroom', 'business', 'finance'], notifications: 'none', aiLevel: 'full', summaryDepth: 'full', assistantTone: 'formal', routingOverrides: {}, automationsEnabled: false, priorityBias: ['business'], suppressDomains: [] },
  { mode: 'boardroom', displayName: 'Boardroom', surfaces: ['boardroom', 'business', 'finance', 'strategy'], notifications: 'none', aiLevel: 'full', summaryDepth: 'full', assistantTone: 'formal', routingOverrides: {}, automationsEnabled: false, priorityBias: ['business', 'finance'], suppressDomains: ['concierge'] },
];

const DEFAULT_TRANSITIONS: ModeTransitionRule[] = [
  { from: '*', to: 'boardroom', trigger: 'calendar:board_meeting', condition: 'calendar event contains "board"', autoTransition: true },
  { from: '*', to: 'travel', trigger: 'calendar:travel_day', condition: 'calendar has flight/hotel events', autoTransition: true },
  { from: '*', to: 'focus', trigger: 'calendar:focus_block', condition: 'focus time block active', autoTransition: true },
  { from: '*', to: 'emergency', trigger: 'system:emergency', condition: 'emergency signal received', autoTransition: true },
  { from: 'focus', to: 'standard', trigger: 'timer:end', condition: 'focus block ended', autoTransition: true },
  { from: 'boardroom', to: 'standard', trigger: 'calendar:meeting_end', condition: 'board meeting ended', autoTransition: true },
];

export class SitaModesService {
  private currentMode: SitaMode = 'standard';
  private configs: Map<SitaMode, ModeConfig> = new Map();
  private transitionRules: ModeTransitionRule[] = [...DEFAULT_TRANSITIONS];
  private transitionLog: ModeTransitionLog[] = [];

  constructor() {
    for (const c of DEFAULT_CONFIGS) this.configs.set(c.mode, c);
  }

  setMode(mode: SitaMode, trigger = 'manual'): ModeConfig {
    const prev = this.currentMode;
    this.currentMode = mode;
    this.transitionLog.push({ from: prev, to: mode, trigger, timestamp: new Date().toISOString(), auto: trigger !== 'manual' });
    if (this.transitionLog.length > 100) this.transitionLog.shift();
    this._persist();
    return this.configs.get(mode)!;
  }

  getMode(): SitaMode { return this.currentMode; }
  getModeConfig(): ModeConfig { return this.configs.get(this.currentMode)!; }
  listModes(): ModeConfig[] { return [...this.configs.values()]; }

  customizeMode(mode: SitaMode, config: Partial<ModeConfig>): void {
    const c = this.configs.get(mode);
    if (c) Object.assign(c, config);
    this._persist();
  }

  // ── Auto-Transition ────────────────────────────────────────

  evaluateAutoTransition(signals: Record<string, unknown>): ModeTransitionLog | null {
    for (const rule of this.transitionRules) {
      if (!rule.autoTransition) continue;
      if (rule.from !== '*' && rule.from !== this.currentMode) continue;
      if (rule.to === this.currentMode) continue;

      if (signals[rule.trigger]) {
        this.setMode(rule.to, rule.trigger);
        return this.transitionLog[this.transitionLog.length - 1];
      }
    }
    return null;
  }

  addTransitionRule(rule: ModeTransitionRule): void { this.transitionRules.push(rule); }
  getTransitionHistory(limit = 20): ModeTransitionLog[] { return this.transitionLog.slice(-limit); }

  // ── Mode Effects API ───────────────────────────────────────

  shouldSuppressDomain(domain: string): boolean { return this.getModeConfig().suppressDomains.includes(domain); }
  shouldPrioritizeDomain(domain: string): boolean { return this.getModeConfig().priorityBias.includes(domain); }
  getNotificationLevel(): ModeConfig['notifications'] { return this.getModeConfig().notifications; }
  getAssistantTone(): ModeConfig['assistantTone'] { return this.getModeConfig().assistantTone; }
  getSummaryDepth(): ModeConfig['summaryDepth'] { return this.getModeConfig().summaryDepth; }
  areAutomationsEnabled(): boolean { return this.getModeConfig().automationsEnabled; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("sita-modes", this.serialize());

  serialize(): Record<string, unknown> {
    return { configs: Array.from(this.configs.entries()), currentMode: this.currentMode, transitionRules: this.transitionRules, transitionLog: this.transitionLog };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.configs) this.configs = new Map(state.configs as Iterable<[SitaMode, ModeConfig]>);
    if (state.currentMode) this.currentMode = state.currentMode as SitaMode;
    if (state.transitionRules) this.transitionRules = state.transitionRules as ModeTransitionRule[];
    if (state.transitionLog) this.transitionLog = state.transitionLog as ModeTransitionLog[];
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("sita-modes");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createSitaModes = () => new SitaModesService();

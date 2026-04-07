// SITA OS — SITA Modes (merge: owner-control-room)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type SitaMode = 'standard' | 'focus' | 'executive' | 'stealth' | 'family' | 'travel' | 'emergency';
export interface ModeConfig { mode: SitaMode; surfaces: string[]; notifications: 'all' | 'critical-only' | 'none'; aiLevel: 'full' | 'advisory' | 'silent'; theme?: string; }
export class SitaModesService {
  private currentMode: SitaMode = 'standard';
  private configs: Map<SitaMode, ModeConfig> = new Map([
    ['standard', { mode: 'standard', surfaces: ['all'], notifications: 'all', aiLevel: 'full' }],
    ['focus', { mode: 'focus', surfaces: ['current'], notifications: 'critical-only', aiLevel: 'advisory' }],
    ['executive', { mode: 'executive', surfaces: ['boardroom', 'business', 'finance'], notifications: 'critical-only', aiLevel: 'full' }],
    ['stealth', { mode: 'stealth', surfaces: ['minimal'], notifications: 'none', aiLevel: 'silent' }],
    ['family', { mode: 'family', surfaces: ['concierge', 'calendar', 'tasks'], notifications: 'all', aiLevel: 'advisory' }],
    ['travel', { mode: 'travel', surfaces: ['travel', 'bookings', 'maps'], notifications: 'critical-only', aiLevel: 'full' }],
    ['emergency', { mode: 'emergency', surfaces: ['all'], notifications: 'all', aiLevel: 'full' }],
  ]);
  setMode(mode: SitaMode): ModeConfig { this.currentMode = mode; return this.configs.get(mode)!; }
  getMode(): SitaMode { return this.currentMode; }
  getModeConfig(): ModeConfig { return this.configs.get(this.currentMode)!; }
  listModes(): ModeConfig[] { return [...this.configs.values()]; }
  customizeMode(mode: SitaMode, config: Partial<ModeConfig>): void { const c = this.configs.get(mode); if (c) Object.assign(c, config); }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("sita-modes", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      configs: Array.from(this.configs.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.configs) this.configs = new Map(state.configs as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("sita-modes");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createSitaModes = () => new SitaModesService();

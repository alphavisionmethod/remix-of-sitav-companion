// SITA OS — SITA Modes (merge: owner-control-room)
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
}
export const createSitaModes = () => new SitaModesService();

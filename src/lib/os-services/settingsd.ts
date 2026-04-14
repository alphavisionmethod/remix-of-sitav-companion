// ═══════════════════════════════════════════════════════════════
// SITA OS — settingsd: Persistent Settings Backend Daemon
// ═══════════════════════════════════════════════════════════════

export type SettingsNamespace = 'display' | 'sound' | 'network' | 'security' | 'privacy' | 'accessibility' | 'power' | 'storage' | 'time' | 'developer';
export type SettingsScope = 'system' | 'user';

export interface SettingsEntry {
  key: string;
  namespace: SettingsNamespace;
  value: unknown;
  scope: SettingsScope;
  schema?: { type: string; min?: number; max?: number; enum?: string[] };
  updatedAt: number;
  source: 'default' | 'system' | 'user' | 'policy' | 'runtime';
}

export interface SettingsChangeEvent {
  key: string;
  namespace: SettingsNamespace;
  oldValue: unknown;
  newValue: unknown;
  source: SettingsEntry['source'];
  timestamp: number;
}

type SettingsListener = (event: SettingsChangeEvent) => void;

const DEFAULTS: Record<string, SettingsEntry> = {
  'display.brightness': { key: 'display.brightness', namespace: 'display', value: 80, scope: 'user', schema: { type: 'number', min: 0, max: 100 }, updatedAt: Date.now(), source: 'default' },
  'display.darkMode': { key: 'display.darkMode', namespace: 'display', value: true, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'display.scaling': { key: 'display.scaling', namespace: 'display', value: 1.0, scope: 'user', schema: { type: 'number', min: 0.75, max: 2.0 }, updatedAt: Date.now(), source: 'default' },
  'sound.volume': { key: 'sound.volume', namespace: 'sound', value: 70, scope: 'user', schema: { type: 'number', min: 0, max: 100 }, updatedAt: Date.now(), source: 'default' },
  'sound.mute': { key: 'sound.mute', namespace: 'sound', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'network.autoConnect': { key: 'network.autoConnect', namespace: 'network', value: true, scope: 'system', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'network.dns': { key: 'network.dns', namespace: 'network', value: 'auto', scope: 'system', schema: { type: 'string', enum: ['auto', 'cloudflare', 'google', 'custom'] }, updatedAt: Date.now(), source: 'default' },
  'security.lockTimeout': { key: 'security.lockTimeout', namespace: 'security', value: 300, scope: 'user', schema: { type: 'number', min: 30, max: 3600 }, updatedAt: Date.now(), source: 'default' },
  'security.biometric': { key: 'security.biometric', namespace: 'security', value: true, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'privacy.telemetry': { key: 'privacy.telemetry', namespace: 'privacy', value: 'minimal', scope: 'user', schema: { type: 'string', enum: ['none', 'minimal', 'full'] }, updatedAt: Date.now(), source: 'default' },
  'accessibility.reduceMotion': { key: 'accessibility.reduceMotion', namespace: 'accessibility', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'power.profile': { key: 'power.profile', namespace: 'power', value: 'balanced', scope: 'user', schema: { type: 'string', enum: ['performance', 'balanced', 'saver'] }, updatedAt: Date.now(), source: 'default' },
  'time.timezone': { key: 'time.timezone', namespace: 'time', value: 'America/New_York', scope: 'system', schema: { type: 'string' }, updatedAt: Date.now(), source: 'default' },
  'time.use24h': { key: 'time.use24h', namespace: 'time', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
  'developer.debugMode': { key: 'developer.debugMode', namespace: 'developer', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default' },
};

class SettingsDaemon {
  private store = new Map<string, SettingsEntry>();
  private listeners: SettingsListener[] = [];
  private changeLog: SettingsChangeEvent[] = [];

  constructor() { Object.entries(DEFAULTS).forEach(([k, v]) => this.store.set(k, { ...v })); }

  get<T = unknown>(key: string): T | undefined {
    return this.store.get(key)?.value as T | undefined;
  }

  set(key: string, value: unknown, source: SettingsEntry['source'] = 'user'): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.schema) {
      if (entry.schema.type === 'number' && typeof value === 'number') {
        if (entry.schema.min !== undefined && value < entry.schema.min) return false;
        if (entry.schema.max !== undefined && value > entry.schema.max) return false;
      }
      if (entry.schema.enum && !entry.schema.enum.includes(String(value))) return false;
    }
    const evt: SettingsChangeEvent = { key, namespace: entry.namespace, oldValue: entry.value, newValue: value, source, timestamp: Date.now() };
    entry.value = value;
    entry.source = source;
    entry.updatedAt = Date.now();
    this.changeLog.push(evt);
    this.listeners.forEach(l => l(evt));
    return true;
  }

  getNamespace(ns: SettingsNamespace): SettingsEntry[] {
    return [...this.store.values()].filter(e => e.namespace === ns);
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  getChangeLog(): SettingsChangeEvent[] { return [...this.changeLog]; }
  getAllEntries(): SettingsEntry[] { return [...this.store.values()]; }
}

export const settingsd = new SettingsDaemon();

// ═══════════════════════════════════════════════════════════════
// SITA OS — settingsd: Persistent Settings Backend Daemon
// Extended with deep-link IDs, searchable metadata, policy lock
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
  // Extended registry fields
  deepLinkId?: string;
  label?: string;
  description?: string;
  searchTags?: string[];
  policyLocked?: boolean;
  policyLockReason?: string;
  category?: string;
  migrationVersion?: number;
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
  'display.brightness': { key: 'display.brightness', namespace: 'display', value: 80, scope: 'user', schema: { type: 'number', min: 0, max: 100 }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://display/brightness', label: 'Brightness', description: 'Screen brightness level', searchTags: ['screen', 'bright', 'dim'], category: 'appearance' },
  'display.darkMode': { key: 'display.darkMode', namespace: 'display', value: true, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://display/dark-mode', label: 'Dark Mode', description: 'Enable dark color scheme', searchTags: ['dark', 'light', 'theme', 'appearance'], category: 'appearance' },
  'display.scaling': { key: 'display.scaling', namespace: 'display', value: 1.0, scope: 'user', schema: { type: 'number', min: 0.75, max: 2.0 }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://display/scaling', label: 'Display Scaling', description: 'UI scaling factor', searchTags: ['zoom', 'size', 'scale', 'dpi'], category: 'appearance' },
  'sound.volume': { key: 'sound.volume', namespace: 'sound', value: 70, scope: 'user', schema: { type: 'number', min: 0, max: 100 }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://sound/volume', label: 'Volume', description: 'System audio volume', searchTags: ['audio', 'sound', 'speaker', 'loud'], category: 'audio' },
  'sound.mute': { key: 'sound.mute', namespace: 'sound', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://sound/mute', label: 'Mute', description: 'Mute all system audio', searchTags: ['mute', 'silent', 'quiet'], category: 'audio' },
  'network.autoConnect': { key: 'network.autoConnect', namespace: 'network', value: true, scope: 'system', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://network/auto-connect', label: 'Auto Connect', description: 'Automatically connect to known networks', searchTags: ['wifi', 'connect', 'automatic'], category: 'connectivity' },
  'network.dns': { key: 'network.dns', namespace: 'network', value: 'auto', scope: 'system', schema: { type: 'string', enum: ['auto', 'cloudflare', 'google', 'custom'] }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://network/dns', label: 'DNS Provider', description: 'Domain name resolution provider', searchTags: ['dns', 'domain', 'resolver'], category: 'connectivity' },
  'security.lockTimeout': { key: 'security.lockTimeout', namespace: 'security', value: 300, scope: 'user', schema: { type: 'number', min: 30, max: 3600 }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://security/lock-timeout', label: 'Lock Timeout', description: 'Seconds of inactivity before screen locks', searchTags: ['lock', 'screen', 'timeout', 'sleep'], category: 'security' },
  'security.biometric': { key: 'security.biometric', namespace: 'security', value: true, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://security/biometric', label: 'Biometric Auth', description: 'Enable fingerprint or face unlock', searchTags: ['fingerprint', 'face', 'biometric', 'unlock'], category: 'security' },
  'privacy.telemetry': { key: 'privacy.telemetry', namespace: 'privacy', value: 'minimal', scope: 'user', schema: { type: 'string', enum: ['none', 'minimal', 'full'] }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://privacy/telemetry', label: 'Telemetry', description: 'Usage data collection level', searchTags: ['telemetry', 'data', 'privacy', 'analytics'], category: 'privacy' },
  'accessibility.reduceMotion': { key: 'accessibility.reduceMotion', namespace: 'accessibility', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://accessibility/reduce-motion', label: 'Reduce Motion', description: 'Minimize animations and transitions', searchTags: ['motion', 'animation', 'reduce', 'accessibility'], category: 'accessibility' },
  'power.profile': { key: 'power.profile', namespace: 'power', value: 'balanced', scope: 'user', schema: { type: 'string', enum: ['performance', 'balanced', 'saver'] }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://power/profile', label: 'Power Profile', description: 'Battery and performance balance', searchTags: ['power', 'battery', 'performance', 'energy'], category: 'power' },
  'time.timezone': { key: 'time.timezone', namespace: 'time', value: 'America/New_York', scope: 'system', schema: { type: 'string' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://time/timezone', label: 'Timezone', description: 'System timezone', searchTags: ['timezone', 'time', 'zone', 'clock'], category: 'datetime' },
  'time.use24h': { key: 'time.use24h', namespace: 'time', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://time/24h', label: '24-Hour Time', description: 'Use 24-hour clock format', searchTags: ['24h', 'clock', 'format', 'time'], category: 'datetime' },
  'developer.debugMode': { key: 'developer.debugMode', namespace: 'developer', value: false, scope: 'user', schema: { type: 'boolean' }, updatedAt: Date.now(), source: 'default', deepLinkId: 'settings://developer/debug', label: 'Debug Mode', description: 'Enable developer debugging tools', searchTags: ['debug', 'developer', 'dev', 'tools'], category: 'developer' },
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
    // Policy lock check
    if (entry.policyLocked && source === 'user') return false;
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

  getEntry(key: string): SettingsEntry | undefined { return this.store.get(key); }
  getNamespace(ns: SettingsNamespace): SettingsEntry[] { return [...this.store.values()].filter(e => e.namespace === ns); }

  /** Search settings by query (matches label, description, key, tags) */
  search(query: string): SettingsEntry[] {
    const q = query.toLowerCase();
    return [...this.store.values()].filter(e =>
      e.key.toLowerCase().includes(q) ||
      e.label?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.searchTags?.some(t => t.includes(q)) ||
      e.deepLinkId?.toLowerCase().includes(q)
    );
  }

  /** Resolve a deep link to a settings entry */
  resolveDeepLink(deepLinkId: string): SettingsEntry | undefined {
    return [...this.store.values()].find(e => e.deepLinkId === deepLinkId);
  }

  /** Lock a setting via policy */
  policyLock(key: string, reason: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    entry.policyLocked = true;
    entry.policyLockReason = reason;
    return true;
  }

  /** Unlock a setting */
  policyUnlock(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    entry.policyLocked = false;
    entry.policyLockReason = undefined;
    return true;
  }

  /** Get settings by category */
  getByCategory(category: string): SettingsEntry[] {
    return [...this.store.values()].filter(e => e.category === category);
  }

  /** Get all categories */
  getCategories(): string[] {
    const cats = new Set<string>();
    this.store.forEach(e => { if (e.category) cats.add(e.category); });
    return [...cats];
  }

  /** Get all locked settings */
  getLockedSettings(): SettingsEntry[] {
    return [...this.store.values()].filter(e => e.policyLocked);
  }

  subscribe(listener: SettingsListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  getChangeLog(): SettingsChangeEvent[] { return [...this.changeLog]; }
  getAllEntries(): SettingsEntry[] { return [...this.store.values()]; }
}

export const settingsd = new SettingsDaemon();

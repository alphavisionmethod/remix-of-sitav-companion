// ═══════════════════════════════════════════════════════════════
// SITA OS — accessibilityd: Accessibility Services Daemon
// ═══════════════════════════════════════════════════════════════

export interface AccessibilityState {
  screenReaderEnabled: boolean;
  magnificationLevel: number; // 1.0 = normal, up to 5.0
  textScaling: number; // 1.0 = normal, up to 3.0
  reduceMotion: boolean;
  reduceTransparency: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  captionsEnabled: boolean;
  voiceControlEnabled: boolean;
  focusIndicators: boolean;
  colorFilter: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'grayscale';
  cursorSize: 'default' | 'large' | 'extra-large';
  stickyKeys: boolean;
  slowKeys: boolean;
  dwellControl: boolean;
}

export interface AppAccessibilityOverride {
  appId: string;
  overrides: Partial<AccessibilityState>;
}

type A11yListener = (state: AccessibilityState) => void;

const DEFAULT_STATE: AccessibilityState = {
  screenReaderEnabled: false,
  magnificationLevel: 1.0,
  textScaling: 1.0,
  reduceMotion: false,
  reduceTransparency: false,
  highContrast: false,
  keyboardNavigation: true,
  captionsEnabled: false,
  voiceControlEnabled: false,
  focusIndicators: true,
  colorFilter: 'none',
  cursorSize: 'default',
  stickyKeys: false,
  slowKeys: false,
  dwellControl: false,
};

class AccessibilityDaemon {
  private state: AccessibilityState = { ...DEFAULT_STATE };
  private overrides: AppAccessibilityOverride[] = [];
  private listeners: A11yListener[] = [];
  private assistiveTech: string[] = [];

  getState(): AccessibilityState { return { ...this.state }; }

  update(partial: Partial<AccessibilityState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
  }

  getEffectiveState(appId?: string): AccessibilityState {
    if (!appId) return this.state;
    const override = this.overrides.find(o => o.appId === appId);
    return override ? { ...this.state, ...override.overrides } : this.state;
  }

  setAppOverride(appId: string, overrides: Partial<AccessibilityState>): void {
    const existing = this.overrides.find(o => o.appId === appId);
    if (existing) existing.overrides = { ...existing.overrides, ...overrides };
    else this.overrides.push({ appId, overrides });
  }

  removeAppOverride(appId: string): void {
    this.overrides = this.overrides.filter(o => o.appId !== appId);
  }

  registerAssistiveTech(name: string): void {
    if (!this.assistiveTech.includes(name)) this.assistiveTech.push(name);
  }

  getAssistiveTech(): string[] { return [...this.assistiveTech]; }
  getOverrides(): AppAccessibilityOverride[] { return [...this.overrides]; }

  subscribe(listener: A11yListener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  resetToDefaults(): void {
    this.state = { ...DEFAULT_STATE };
    this.overrides = [];
    this.listeners.forEach(l => l(this.state));
  }
}

export const accessibilityd = new AccessibilityDaemon();

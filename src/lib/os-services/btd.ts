// ═══════════════════════════════════════════════════════════════
// SITA OS — Bluetooth Daemon (btd)
// Accessory battery, audio routing, codec selection, BLE privacy,
// stale cleanup, reconnection policies, forgotten device removal
// ═══════════════════════════════════════════════════════════════

export type BTDeviceType = "headphones" | "earbuds" | "keyboard" | "mouse" | "speaker" | "phone" | "watch" | "gamepad" | "unknown";
export type BTCodec = "aac" | "sbc" | "aptx" | "aptx_hd" | "ldac";
export type BTCodecProfile = "auto" | "quality" | "low_latency" | "battery_saver";
export type BTReconnectPolicy = "always" | "on_demand" | "never";
export type BTAudioRole = "media" | "call" | "notification" | "game";

export interface BTBatteryInfo {
  main?: number; // 0-100
  left?: number;
  right?: number;
  case?: number;
}

export interface BTDevice {
  id: string;
  name: string;
  type: BTDeviceType;
  paired: boolean;
  connected: boolean;
  battery: BTBatteryInfo;
  codec?: BTCodec;
  codecProfile: BTCodecProfile;
  reconnectPolicy: BTReconnectPolicy;
  lastSeen: number;
  lastConnected?: number;
  isAudioOutput: boolean;
  isAudioInput: boolean;
  blePrivate: boolean;
  trusted: boolean;
  signalStrength: number; // -100 to 0
  firmwareVersion?: string;
}

export interface AudioRoute {
  outputDevice: string | null;
  inputDevice: string | null;
  activeRole: BTAudioRole;
  preferredOutput: string | null;
  preferredInput: string | null;
}

export interface BTState {
  enabled: boolean;
  discovering: boolean;
  devices: BTDevice[];
  audioRoute: AudioRoute;
  blePrivacyEnabled: boolean;
  staleDaysThreshold: number;
}

const now = Date.now();
const day = 86400000;

const DEVICES: BTDevice[] = [
  { id: "bt-1", name: "AirPods Pro", type: "earbuds", paired: true, connected: true, battery: { left: 85, right: 78, case: 92 }, codec: "aac", codecProfile: "auto", reconnectPolicy: "always", lastSeen: now, lastConnected: now, isAudioOutput: true, isAudioInput: true, blePrivate: true, trusted: true, signalStrength: -35 },
  { id: "bt-2", name: "Sony WH-1000XM5", type: "headphones", paired: true, connected: false, battery: { main: 64 }, codec: "ldac", codecProfile: "quality", reconnectPolicy: "always", lastSeen: now - day * 2, lastConnected: now - day * 2, isAudioOutput: true, isAudioInput: true, blePrivate: false, trusted: true, signalStrength: -55 },
  { id: "bt-3", name: "MX Keys", type: "keyboard", paired: true, connected: true, battery: { main: 45 }, codecProfile: "auto", reconnectPolicy: "always", lastSeen: now, lastConnected: now, isAudioOutput: false, isAudioInput: false, blePrivate: false, trusted: true, signalStrength: -40 },
  { id: "bt-4", name: "MX Master 3S", type: "mouse", paired: true, connected: true, battery: { main: 72 }, codecProfile: "auto", reconnectPolicy: "always", lastSeen: now, lastConnected: now, isAudioOutput: false, isAudioInput: false, blePrivate: false, trusted: true, signalStrength: -38 },
  { id: "bt-5", name: "HomePod Mini", type: "speaker", paired: true, connected: false, battery: {}, codecProfile: "auto", reconnectPolicy: "on_demand", lastSeen: now - day * 15, isAudioOutput: true, isAudioInput: false, blePrivate: false, trusted: true, signalStrength: -70 },
  { id: "bt-6", name: "Old Headset", type: "headphones", paired: true, connected: false, battery: {}, codec: "sbc", codecProfile: "auto", reconnectPolicy: "never", lastSeen: now - day * 45, isAudioOutput: true, isAudioInput: true, blePrivate: false, trusted: false, signalStrength: -90 },
  { id: "bt-7", name: "iPhone 16", type: "phone", paired: true, connected: false, battery: {}, codecProfile: "auto", reconnectPolicy: "on_demand", lastSeen: now - day, isAudioOutput: false, isAudioInput: false, blePrivate: true, trusted: true, signalStrength: -50 },
];

export class BluetoothDaemon {
  private state: BTState;
  private listeners: Array<(s: BTState) => void> = [];

  constructor() {
    this.state = {
      enabled: true,
      discovering: false,
      devices: [...DEVICES],
      audioRoute: { outputDevice: "bt-1", inputDevice: "bt-1", activeRole: "media", preferredOutput: "bt-1", preferredInput: "bt-1" },
      blePrivacyEnabled: true,
      staleDaysThreshold: 30,
    };
  }

  getState(): BTState { return { ...this.state, devices: this.state.devices.map(d => ({ ...d })) }; }

  subscribe(fn: (s: BTState) => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit() { this.listeners.forEach(fn => fn(this.getState())); }

  async discover(): Promise<BTDevice[]> {
    this.state.discovering = true;
    this.emit();
    await new Promise(r => setTimeout(r, 2000));
    this.state.discovering = false;
    this.emit();
    return this.state.devices;
  }

  async toggleConnect(id: string): Promise<boolean> {
    const dev = this.state.devices.find(d => d.id === id);
    if (!dev) return false;
    await new Promise(r => setTimeout(r, 500));
    dev.connected = !dev.connected;
    if (dev.connected) { dev.paired = true; dev.lastConnected = Date.now(); dev.lastSeen = Date.now(); }
    if (dev.isAudioOutput && dev.connected) this.state.audioRoute.outputDevice = id;
    if (dev.isAudioInput && dev.connected) this.state.audioRoute.inputDevice = id;
    this.emit();
    return dev.connected;
  }

  forgetDevice(id: string) {
    const dev = this.state.devices.find(d => d.id === id);
    if (dev) {
      dev.connected = false;
      dev.paired = false;
      dev.trusted = false;
    }
    this.state.devices = this.state.devices.filter(d => d.id !== id);
    if (this.state.audioRoute.outputDevice === id) this.state.audioRoute.outputDevice = null;
    if (this.state.audioRoute.inputDevice === id) this.state.audioRoute.inputDevice = null;
    this.emit();
  }

  setReconnectPolicy(id: string, policy: BTReconnectPolicy) {
    const dev = this.state.devices.find(d => d.id === id);
    if (dev) dev.reconnectPolicy = policy;
    this.emit();
  }

  setCodecProfile(id: string, profile: BTCodecProfile) {
    const dev = this.state.devices.find(d => d.id === id);
    if (dev) dev.codecProfile = profile;
    this.emit();
  }

  setAudioRoute(outputId: string | null, inputId: string | null) {
    this.state.audioRoute.outputDevice = outputId;
    this.state.audioRoute.inputDevice = inputId;
    this.emit();
  }

  getStaleDevices(): BTDevice[] {
    const threshold = Date.now() - this.state.staleDaysThreshold * day;
    return this.state.devices.filter(d => d.paired && !d.connected && d.lastSeen < threshold);
  }

  cleanupStaleDevices(): number {
    const stale = this.getStaleDevices();
    stale.forEach(d => this.forgetDevice(d.id));
    return stale.length;
  }

  getLowBatteryDevices(): BTDevice[] {
    return this.state.devices.filter(d => {
      const b = d.battery;
      return d.connected && ((b.main !== undefined && b.main < 20) || (b.left !== undefined && b.left < 20) || (b.right !== undefined && b.right < 20));
    });
  }
}

let instance: BluetoothDaemon | null = null;
export function getBluetoothDaemon(): BluetoothDaemon {
  if (!instance) instance = new BluetoothDaemon();
  return instance;
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — audiod: Audio Server Daemon
// Input/output routing, per-app volume, BT audio, hotplug
// ═══════════════════════════════════════════════════════════════

export type AudioDeviceType = 'speaker' | 'headphones' | 'bluetooth' | 'hdmi' | 'usb' | 'microphone' | 'line_in';
export type AudioProfile = 'stereo' | 'surround' | 'mono' | 'hfp' | 'a2dp';

export interface AudioDevice {
  id: string;
  name: string;
  type: AudioDeviceType;
  direction: 'input' | 'output' | 'both';
  profile: AudioProfile;
  volume: number; // 0-100
  muted: boolean;
  connected: boolean;
  isDefault: boolean;
  latencyMs: number;
  sampleRate: number;
}

export interface AppAudioState {
  appId: string;
  volume: number; // 0-100
  muted: boolean;
  activeStreams: number;
  ducked: boolean; // lowered for higher-priority audio
}

export interface MicrophonePermission {
  appId: string;
  granted: boolean;
  grantedAt?: number;
  usageCount: number;
  lastUsedAt?: number;
}

type AudioEventHandler = (event: { type: string; deviceId?: string; appId?: string }) => void;

class AudioDaemon {
  private devices = new Map<string, AudioDevice>();
  private appStates = new Map<string, AppAudioState>();
  private micPermissions = new Map<string, MicrophonePermission>();
  private listeners: AudioEventHandler[] = [];
  private masterVolume = 70;
  private masterMuted = false;

  constructor() {
    // Default devices
    const defaults: AudioDevice[] = [
      { id: 'speaker_builtin', name: 'Built-in Speakers', type: 'speaker', direction: 'output', profile: 'stereo', volume: 70, muted: false, connected: true, isDefault: true, latencyMs: 10, sampleRate: 48000 },
      { id: 'mic_builtin', name: 'Built-in Microphone', type: 'microphone', direction: 'input', profile: 'mono', volume: 80, muted: false, connected: true, isDefault: true, latencyMs: 5, sampleRate: 44100 },
      { id: 'bt_airpods', name: 'AirPods Pro', type: 'bluetooth', direction: 'both', profile: 'a2dp', volume: 60, muted: false, connected: false, isDefault: false, latencyMs: 40, sampleRate: 48000 },
    ];
    defaults.forEach(d => this.devices.set(d.id, d));
  }

  // ── Device Management ─────────────────────────────────────
  getDevice(id: string): AudioDevice | undefined { return this.devices.get(id); }
  allDevices(): AudioDevice[] { return [...this.devices.values()]; }
  getOutputDevices(): AudioDevice[] { return this.allDevices().filter(d => d.direction === 'output' || d.direction === 'both'); }
  getInputDevices(): AudioDevice[] { return this.allDevices().filter(d => d.direction === 'input' || d.direction === 'both'); }
  getDefaultOutput(): AudioDevice | undefined { return this.getOutputDevices().find(d => d.isDefault); }
  getDefaultInput(): AudioDevice | undefined { return this.getInputDevices().find(d => d.isDefault); }

  setDefaultOutput(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device || (device.direction !== 'output' && device.direction !== 'both')) return false;
    this.getOutputDevices().forEach(d => { d.isDefault = false; });
    device.isDefault = true;
    this.emit({ type: 'output_changed', deviceId });
    return true;
  }

  setDeviceVolume(deviceId: string, volume: number): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.volume = Math.max(0, Math.min(100, volume));
    this.emit({ type: 'device_volume_changed', deviceId });
    return true;
  }

  connectDevice(device: AudioDevice): void {
    device.connected = true;
    this.devices.set(device.id, device);
    this.emit({ type: 'device_connected', deviceId: device.id });
  }

  disconnectDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.connected = false;
      if (device.isDefault) {
        device.isDefault = false;
        // Fallback to built-in
        const builtin = this.allDevices().find(d => d.type === 'speaker' && d.connected);
        if (builtin) builtin.isDefault = true;
      }
      this.emit({ type: 'device_disconnected', deviceId });
    }
  }

  // ── Master Volume ─────────────────────────────────────────
  getMasterVolume(): number { return this.masterVolume; }
  setMasterVolume(vol: number): void { this.masterVolume = Math.max(0, Math.min(100, vol)); this.emit({ type: 'master_volume_changed' }); }
  getMasterMuted(): boolean { return this.masterMuted; }
  setMasterMuted(muted: boolean): void { this.masterMuted = muted; this.emit({ type: 'master_mute_changed' }); }

  // ── Per-App Volume ────────────────────────────────────────
  setAppVolume(appId: string, volume: number): void {
    const state = this.appStates.get(appId) ?? { appId, volume: 100, muted: false, activeStreams: 0, ducked: false };
    state.volume = Math.max(0, Math.min(100, volume));
    this.appStates.set(appId, state);
    this.emit({ type: 'app_volume_changed', appId });
  }

  getAppState(appId: string): AppAudioState | undefined { return this.appStates.get(appId); }
  allAppStates(): AppAudioState[] { return [...this.appStates.values()]; }

  // ── Microphone Permissions ────────────────────────────────
  grantMicPermission(appId: string): void {
    this.micPermissions.set(appId, { appId, granted: true, grantedAt: Date.now(), usageCount: 0 });
  }

  revokeMicPermission(appId: string): void {
    const perm = this.micPermissions.get(appId);
    if (perm) perm.granted = false;
  }

  hasMicPermission(appId: string): boolean {
    return this.micPermissions.get(appId)?.granted ?? false;
  }

  getMicPermissions(): MicrophonePermission[] { return [...this.micPermissions.values()]; }

  // ── Events ────────────────────────────────────────────────
  private emit(event: { type: string; deviceId?: string; appId?: string }): void {
    this.listeners.forEach(l => { try { l(event); } catch {} });
  }

  subscribe(handler: AudioEventHandler): () => void {
    this.listeners.push(handler);
    return () => { this.listeners = this.listeners.filter(l => l !== handler); };
  }

  stats() {
    return {
      devices: this.devices.size,
      connected: this.allDevices().filter(d => d.connected).length,
      appStreams: this.allAppStates().reduce((s, a) => s + a.activeStreams, 0),
      masterVolume: this.masterVolume,
      masterMuted: this.masterMuted,
    };
  }
}

export const audiod = new AudioDaemon();

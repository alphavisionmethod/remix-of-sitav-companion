// ═══════════════════════════════════════════════════════════════
// SITA OS — deviced: External Device Framework
// Printers, cameras, removable drives, controllers, docks
// ═══════════════════════════════════════════════════════════════

export type DeviceCategory = 'printer' | 'camera' | 'removable_drive' | 'controller' | 'dock' | 'display' | 'scanner' | 'generic';
export type DeviceConnectionType = 'usb' | 'bluetooth' | 'thunderbolt' | 'wifi_direct' | 'network' | 'hdmi' | 'pcie';
export type DeviceStatus = 'connected' | 'disconnected' | 'pairing' | 'error' | 'ejecting' | 'mounted' | 'unmounted';

export interface ExternalDevice {
  id: string;
  name: string;
  category: DeviceCategory;
  connection: DeviceConnectionType;
  status: DeviceStatus;
  driverLoaded: boolean;
  driverName?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firmware?: string;
  connectedAt?: number;
  capabilities: string[];
  encrypted?: boolean;
  filesystem?: string;
  totalSpaceGB?: number;
  usedSpaceGB?: number;
}

export interface MountPolicy {
  autoMount: boolean;
  requireEncryption: boolean;
  malwareScanOnMount: boolean;
  guestAccessAllowed: boolean;
  allowedFilesystems: string[];
  readOnlyForGuest: boolean;
}

export interface EjectResult {
  success: boolean;
  deviceId: string;
  reason?: string;
  safeToRemove: boolean;
}

type DeviceEventHandler = (event: { type: string; device: ExternalDevice }) => void;

class DeviceDaemon {
  private devices = new Map<string, ExternalDevice>();
  private listeners: DeviceEventHandler[] = [];
  private mountPolicy: MountPolicy = {
    autoMount: true, requireEncryption: false, malwareScanOnMount: true,
    guestAccessAllowed: false, allowedFilesystems: ['ext4', 'ntfs', 'fat32', 'exfat', 'apfs', 'hfs+'],
    readOnlyForGuest: true,
  };

  constructor() {
    // Simulated connected devices
    const defaults: ExternalDevice[] = [
      { id: 'dev_usb_drive', name: 'Samsung T7 Shield', category: 'removable_drive', connection: 'usb', status: 'mounted', driverLoaded: true, driverName: 'usb-storage', manufacturer: 'Samsung', model: 'T7 Shield 2TB', connectedAt: Date.now() - 3600000, capabilities: ['read', 'write', 'eject'], encrypted: true, filesystem: 'exfat', totalSpaceGB: 2000, usedSpaceGB: 850 },
      { id: 'dev_printer', name: 'HP LaserJet Pro', category: 'printer', connection: 'network', status: 'connected', driverLoaded: true, driverName: 'hplip', manufacturer: 'HP', model: 'LaserJet Pro M404n', capabilities: ['print', 'duplex', 'status'], connectedAt: Date.now() - 86400000 },
      { id: 'dev_monitor', name: 'LG UltraFine 5K', category: 'display', connection: 'thunderbolt', status: 'connected', driverLoaded: true, manufacturer: 'LG', model: 'UltraFine 27MD5KL', capabilities: ['display', 'brightness', 'hdr'], connectedAt: Date.now() - 172800000 },
    ];
    defaults.forEach(d => this.devices.set(d.id, d));
  }

  // ── Device Management ─────────────────────────────────────
  getDevice(id: string): ExternalDevice | undefined { return this.devices.get(id); }
  allDevices(): ExternalDevice[] { return [...this.devices.values()]; }
  getByCategory(category: DeviceCategory): ExternalDevice[] { return this.allDevices().filter(d => d.category === category); }
  getConnected(): ExternalDevice[] { return this.allDevices().filter(d => d.status !== 'disconnected'); }

  /** Connect a new device (hotplug) */
  connect(device: ExternalDevice): void {
    device.connectedAt = Date.now();
    device.status = 'connected';
    this.devices.set(device.id, device);
    this.emit({ type: 'device_connected', device });

    // Auto-mount removable drives if policy allows
    if (device.category === 'removable_drive' && this.mountPolicy.autoMount) {
      if (device.filesystem && this.mountPolicy.allowedFilesystems.includes(device.filesystem)) {
        device.status = 'mounted';
        this.emit({ type: 'device_mounted', device });
      }
    }
  }

  /** Safely eject a device */
  eject(deviceId: string): EjectResult {
    const device = this.devices.get(deviceId);
    if (!device) return { success: false, deviceId, reason: 'Device not found', safeToRemove: false };

    device.status = 'ejecting';
    this.emit({ type: 'device_ejecting', device });

    // Simulate safe eject
    device.status = 'disconnected';
    this.emit({ type: 'device_ejected', device });
    return { success: true, deviceId, safeToRemove: true };
  }

  /** Disconnect a device */
  disconnect(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = 'disconnected';
      this.emit({ type: 'device_disconnected', device });
    }
  }

  // ── Mount Policy ──────────────────────────────────────────
  getMountPolicy(): MountPolicy { return { ...this.mountPolicy }; }
  updateMountPolicy(updates: Partial<MountPolicy>): void {
    this.mountPolicy = { ...this.mountPolicy, ...updates };
  }

  // ── Events ────────────────────────────────────────────────
  private emit(event: { type: string; device: ExternalDevice }): void {
    this.listeners.forEach(l => { try { l(event); } catch {} });
  }

  subscribe(handler: DeviceEventHandler): () => void {
    this.listeners.push(handler);
    return () => { this.listeners = this.listeners.filter(l => l !== handler); };
  }

  stats() {
    const devices = this.allDevices();
    const byCategory: Partial<Record<DeviceCategory, number>> = {};
    devices.forEach(d => { byCategory[d.category] = (byCategory[d.category] ?? 0) + 1; });
    return {
      total: devices.length,
      connected: this.getConnected().length,
      byCategory,
    };
  }
}

export const deviced = new DeviceDaemon();

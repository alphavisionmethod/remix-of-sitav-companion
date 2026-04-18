// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Identity Manager
// Device registration, trust levels, capabilities, revocation
// ═══════════════════════════════════════════════════════════════

/** Device trust levels */
export type DeviceTrustLevel = "trusted" | "semi-trusted" | "pending" | "revoked" | "quarantined";

/** Device type classification */
export type DeviceType = "desktop" | "laptop" | "phone" | "tablet" | "web" | "server" | "iot";

/** Device platform */
export type DevicePlatform = "sita-os" | "windows" | "macos" | "linux" | "ios" | "android" | "web" | "chromeos";

/** Device capabilities that affect sync permissions */
export interface DeviceCapabilities {
  supportsE2EE: boolean;
  supportsFileSync: boolean;
  supportsSessionSync: boolean;
  supportsBackgroundSync: boolean;
  supportsNearbySync: boolean;
  hasSecureStorage: boolean;
  hasTPM: boolean;
  hasBiometrics: boolean;
  maxStorageBytes: number;
  supportedEncryptionClasses: string[];
}

/** Full device identity record */
export interface DeviceIdentity {
  deviceId: string;
  userId: string;
  name: string;
  type: DeviceType;
  platform: DevicePlatform;
  osVersion: string;
  appVersion: string;
  trustLevel: DeviceTrustLevel;
  capabilities: DeviceCapabilities;
  registeredAt: string;
  lastSeenAt: string;
  lastSyncAt?: string;
  ipAddress?: string;
  userAgent?: string;
  /** Whether this is the current device */
  isCurrent: boolean;
  /** Whether re-authentication is required */
  requiresReauth: boolean;
  /** Device-specific sync token */
  syncToken?: string;
  /** Trust change history */
  trustHistory: TrustChangeRecord[];
  /** Per-namespace sync authorization */
  namespaceSyncAuth: Record<string, boolean>;
}

/** Record of a trust level change */
export interface TrustChangeRecord {
  from: DeviceTrustLevel;
  to: DeviceTrustLevel;
  changedAt: string;
  reason: string;
  changedBy: "system" | "user" | "admin" | "policy";
}

/** Device registration request */
export interface DeviceRegistrationRequest {
  name: string;
  type: DeviceType;
  platform: DevicePlatform;
  osVersion: string;
  appVersion: string;
  capabilities: Partial<DeviceCapabilities>;
}

/** Device fleet summary */
export interface DeviceFleetSummary {
  totalDevices: number;
  trustedDevices: number;
  pendingDevices: number;
  revokedDevices: number;
  devicesByType: Record<string, number>;
  devicesByPlatform: Record<string, number>;
  lastActivityAt: string;
}

class DeviceIdentityManager {
  private devices = new Map<string, DeviceIdentity>();
  private currentDeviceId: string | null = null;
  private listeners: Array<(device: DeviceIdentity, action: string) => void> = [];

  /** Register a new device */
  registerDevice(userId: string, request: DeviceRegistrationRequest): DeviceIdentity {
    const deviceId = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const device: DeviceIdentity = {
      deviceId,
      userId,
      name: request.name,
      type: request.type,
      platform: request.platform,
      osVersion: request.osVersion,
      appVersion: request.appVersion,
      trustLevel: "pending",
      capabilities: {
        supportsE2EE: request.capabilities.supportsE2EE ?? true,
        supportsFileSync: request.capabilities.supportsFileSync ?? true,
        supportsSessionSync: request.capabilities.supportsSessionSync ?? true,
        supportsBackgroundSync: request.capabilities.supportsBackgroundSync ?? true,
        supportsNearbySync: request.capabilities.supportsNearbySync ?? false,
        hasSecureStorage: request.capabilities.hasSecureStorage ?? true,
        hasTPM: request.capabilities.hasTPM ?? false,
        hasBiometrics: request.capabilities.hasBiometrics ?? false,
        maxStorageBytes: request.capabilities.maxStorageBytes ?? 10 * 1024 * 1024 * 1024,
        supportedEncryptionClasses: request.capabilities.supportedEncryptionClasses ?? ["standard", "encrypted-at-rest"],
      },
      registeredAt: now,
      lastSeenAt: now,
      isCurrent: false,
      requiresReauth: false,
      trustHistory: [{ from: "pending", to: "pending", changedAt: now, reason: "Device registered", changedBy: "system" }],
      namespaceSyncAuth: {},
    };

    this.devices.set(deviceId, device);
    this.emit(device, "registered");
    return device;
  }

  /** Set the current device */
  setCurrentDevice(deviceId: string): void {
    // Clear previous current
    for (const dev of this.devices.values()) {
      dev.isCurrent = false;
    }
    const device = this.devices.get(deviceId);
    if (device) {
      device.isCurrent = true;
      this.currentDeviceId = deviceId;
    }
  }

  /** Get the current device */
  getCurrentDevice(): DeviceIdentity | null {
    if (!this.currentDeviceId) return null;
    return this.devices.get(this.currentDeviceId) ?? null;
  }

  /** Get a device by ID */
  getDevice(deviceId: string): DeviceIdentity | undefined {
    return this.devices.get(deviceId);
  }

  /** Get all devices for a user */
  getUserDevices(userId: string): DeviceIdentity[] {
    return Array.from(this.devices.values()).filter(d => d.userId === userId);
  }

  /** Update device trust level */
  setTrustLevel(deviceId: string, level: DeviceTrustLevel, reason: string, by: TrustChangeRecord["changedBy"] = "system"): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    const prev = device.trustLevel;
    device.trustLevel = level;
    device.trustHistory.push({
      from: prev,
      to: level,
      changedAt: new Date().toISOString(),
      reason,
      changedBy: by,
    });

    if (level === "revoked") {
      device.syncToken = undefined;
      device.requiresReauth = true;
    }

    this.emit(device, "trust-changed");
    return true;
  }

  /** Approve a pending device */
  approveDevice(deviceId: string): boolean {
    return this.setTrustLevel(deviceId, "trusted", "Device approved by user", "user");
  }

  /** Revoke a device */
  revokeDevice(deviceId: string, reason: string = "Revoked by user"): boolean {
    return this.setTrustLevel(deviceId, "revoked", reason, "user");
  }

  /** Rename a device */
  renameDevice(deviceId: string, name: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.name = name;
    this.emit(device, "renamed");
    return true;
  }

  /** Update last seen timestamp */
  heartbeat(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeenAt = new Date().toISOString();
    }
  }

  /** Set namespace sync authorization for a device */
  setNamespaceAuth(deviceId: string, namespace: string, allowed: boolean): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.namespaceSyncAuth[namespace] = allowed;
    return true;
  }

  /** Check if a device is authorized to sync a namespace */
  isNamespaceAuthorized(deviceId: string, namespace: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    if (device.trustLevel !== "trusted" && device.trustLevel !== "semi-trusted") return false;
    return device.namespaceSyncAuth[namespace] !== false; // Default to allowed unless explicitly denied
  }

  /** Force re-authentication for a device */
  forceReauth(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.requiresReauth = true;
    this.emit(device, "reauth-required");
    return true;
  }

  /** Remote sign-out (revoke + clear token) */
  remoteSignOut(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.syncToken = undefined;
    device.requiresReauth = true;
    return this.setTrustLevel(deviceId, "revoked", "Remote sign-out", "user");
  }

  /** Get fleet summary */
  getFleetSummary(userId: string): DeviceFleetSummary {
    const devices = this.getUserDevices(userId);
    const byType: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    let lastActivity = "";

    for (const d of devices) {
      byType[d.type] = (byType[d.type] ?? 0) + 1;
      byPlatform[d.platform] = (byPlatform[d.platform] ?? 0) + 1;
      if (d.lastSeenAt > lastActivity) lastActivity = d.lastSeenAt;
    }

    return {
      totalDevices: devices.length,
      trustedDevices: devices.filter(d => d.trustLevel === "trusted").length,
      pendingDevices: devices.filter(d => d.trustLevel === "pending").length,
      revokedDevices: devices.filter(d => d.trustLevel === "revoked").length,
      devicesByType: byType,
      devicesByPlatform: byPlatform,
      lastActivityAt: lastActivity,
    };
  }

  /** Subscribe to device events */
  onDeviceEvent(fn: (device: DeviceIdentity, action: string) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit(device: DeviceIdentity, action: string): void {
    for (const fn of this.listeners) fn(device, action);
  }
}

/** Singleton device identity manager */
export const deviceIdentity = new DeviceIdentityManager();

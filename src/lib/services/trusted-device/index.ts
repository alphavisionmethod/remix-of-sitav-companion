// ═══════════════════════════════════════════════════════════════
// SITA OS — Trusted Device Service
// Device attestation, signing, approval, fleet trust
// Canonical contract: contracts/graph/device-attestation
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
import type {
  DeviceAttestation,
  DeviceTrustLevel,
} from "@/packages/contracts/graph/device-attestation";

// ── Types ───────────────────────────────────────────────────────

export interface DeviceRegistration {
  deviceId: string;
  userId: string;
  platform: string;
  fingerprint: string;
  capabilities: string[];
}

export interface TrustedDeviceState {
  devices: DeviceAttestation[];
  trustedCount: number;
  revokedCount: number;
  pendingAttestations: string[];
}

// ── Service ─────────────────────────────────────────────────────

export class TrustedDeviceService {
  private devices = new Map<string, DeviceAttestation>();
  private pendingAttestations: string[] = [];

  registerDevice(reg: DeviceRegistration): DeviceAttestation {
    const now = new Date().toISOString();
    const attestation: DeviceAttestation = {
      deviceId: reg.deviceId,
      userId: reg.userId,
      trustLevel: "basic",
      attestedAt: now,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      fingerprint: reg.fingerprint,
      capabilities: reg.capabilities,
      lastSeenAt: now,
      platform: reg.platform,
      isRevoked: false,
    };
    this.devices.set(reg.deviceId, attestation);
    return attestation;
  }

  attestDevice(deviceId: string, level: DeviceTrustLevel): boolean {
    const device = this.devices.get(deviceId);
    if (!device || device.isRevoked) return false;
    device.trustLevel = level;
    device.attestedAt = new Date().toISOString();
    device.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    this.pendingAttestations = this.pendingAttestations.filter(id => id !== deviceId);
    return true;
  }

  revokeDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.isRevoked = true;
    device.trustLevel = "untrusted";
    return true;
  }

  getDevice(deviceId: string): DeviceAttestation | undefined {
    return this.devices.get(deviceId);
  }

  getDevicesByUser(userId: string): DeviceAttestation[] {
    return Array.from(this.devices.values()).filter(d => d.userId === userId && !d.isRevoked);
  }

  getTrustedDevices(userId: string): DeviceAttestation[] {
    return this.getDevicesByUser(userId).filter(d =>
      d.trustLevel === "verified" || d.trustLevel === "hardware-attested"
    );
  }

  isDeviceTrusted(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device || device.isRevoked) return false;
    if (new Date(device.expiresAt) < new Date()) return false;
    return device.trustLevel !== "untrusted";
  }

  updateLastSeen(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) device.lastSeenAt = new Date().toISOString();
  }

  requestAttestation(deviceId: string): void {
    if (!this.pendingAttestations.includes(deviceId)) {
      this.pendingAttestations.push(deviceId);
    }
  }

  pruneExpired(): string[] {
    const now = new Date();
    const pruned: string[] = [];
    for (const [id, device] of this.devices) {
      if (!device.isRevoked && new Date(device.expiresAt) < now) {
        device.trustLevel = "untrusted";
        pruned.push(id);
      }
    }
    return pruned;
  }

  evaluate(): TrustedDeviceState {
    const all = Array.from(this.devices.values());
    return {
      devices: all,
      trustedCount: all.filter(d => !d.isRevoked && d.trustLevel !== "untrusted").length,
      revokedCount: all.filter(d => d.isRevoked).length,
      pendingAttestations: [...this.pendingAttestations],
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("trusted-device", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      devices: Array.from(this.devices.entries()),
      pendingAttestations: this.pendingAttestations,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.devices) this.devices = new Map(state.devices as any);
    if (state.pendingAttestations) this.pendingAttestations = state.pendingAttestations as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("trusted-device");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createTrustedDeviceService(): TrustedDeviceService {
  return new TrustedDeviceService();
}

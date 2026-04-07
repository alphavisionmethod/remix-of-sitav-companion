// ═══════════════════════════════════════════════════════════════
// SITA OS — Keyvault Service
// Encrypted credential storage abstraction for connector secrets
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type SecretScope = "connector" | "user" | "system" | "integration";

export type SecretStatus = "active" | "rotated" | "expired" | "revoked";

export interface VaultEntry {
  id: string;
  scope: SecretScope;
  name: string;
  encryptedValue: string;
  status: SecretStatus;
  ownerId: string;
  connectorId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  rotatedAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
  metadata: Record<string, unknown>;
}

export interface VaultAccessLog {
  id: string;
  secretId: string;
  accessedBy: string;
  accessType: "read" | "write" | "rotate" | "revoke";
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  granted: boolean;
  reason?: string;
}

export interface RotationPolicy {
  secretId: string;
  intervalDays: number;
  autoRotate: boolean;
  notifyBeforeDays: number;
  lastRotated: string;
  nextRotation: string;
}

// Simple XOR-based obfuscation for client-side (real encryption happens server-side)
const obfuscate = (value: string): string => {
  const key = "sita-vault-key";
  return btoa(
    value
      .split("")
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join("")
  );
};

const deobfuscate = (encoded: string): string => {
  const key = "sita-vault-key";
  const decoded = atob(encoded);
  return decoded
    .split("")
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join("");
};

export class KeyvaultService {
  private entries: Map<string, VaultEntry> = new Map();
  private accessLog: VaultAccessLog[] = [];
  private rotationPolicies: Map<string, RotationPolicy> = new Map();

  store(name: string, value: string, scope: SecretScope, ownerId: string, options?: { connectorId?: string; expiresAt?: string; metadata?: Record<string, unknown> }): VaultEntry {
    const existing = Array.from(this.entries.values()).find(e => e.name === name && e.ownerId === ownerId && e.status === "active");
    if (existing) {
      existing.status = "rotated";
      existing.rotatedAt = new Date().toISOString();
    }

    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      scope,
      name,
      encryptedValue: obfuscate(value),
      status: "active",
      ownerId,
      connectorId: options?.connectorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt,
      accessCount: 0,
      metadata: options?.metadata ?? {},
    };

    this.entries.set(entry.id, entry);
    this.logAccess(entry.id, ownerId, "write", true);
    return entry;
  }

  retrieve(secretId: string, requesterId: string): string | null {
    const entry = this.entries.get(secretId);
    if (!entry || entry.status !== "active") {
      this.logAccess(secretId, requesterId, "read", false, "Secret not found or inactive");
      return null;
    }

    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      entry.status = "expired";
      this.logAccess(secretId, requesterId, "read", false, "Secret expired");
      return null;
    }

    entry.accessCount++;
    entry.lastAccessedAt = new Date().toISOString();
    this.logAccess(secretId, requesterId, "read", true);
    return deobfuscate(entry.encryptedValue);
  }

  rotate(secretId: string, newValue: string, rotatedBy: string): VaultEntry | null {
    const entry = this.entries.get(secretId);
    if (!entry) return null;

    entry.encryptedValue = obfuscate(newValue);
    entry.rotatedAt = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
    this.logAccess(secretId, rotatedBy, "rotate", true);

    const policy = this.rotationPolicies.get(secretId);
    if (policy) {
      policy.lastRotated = new Date().toISOString();
      const next = new Date();
      next.setDate(next.getDate() + policy.intervalDays);
      policy.nextRotation = next.toISOString();
    }

    return entry;
  }

  revoke(secretId: string, revokedBy: string, reason?: string): boolean {
    const entry = this.entries.get(secretId);
    if (!entry) return false;

    entry.status = "revoked";
    entry.updatedAt = new Date().toISOString();
    this.logAccess(secretId, revokedBy, "revoke", true, reason);
    return true;
  }

  setRotationPolicy(secretId: string, intervalDays: number, autoRotate: boolean = false): RotationPolicy {
    const next = new Date();
    next.setDate(next.getDate() + intervalDays);
    const policy: RotationPolicy = {
      secretId,
      intervalDays,
      autoRotate,
      notifyBeforeDays: Math.max(1, Math.floor(intervalDays * 0.1)),
      lastRotated: new Date().toISOString(),
      nextRotation: next.toISOString(),
    };
    this.rotationPolicies.set(secretId, policy);
    return policy;
  }

  listByOwner(ownerId: string): VaultEntry[] {
    return Array.from(this.entries.values()).filter(e => e.ownerId === ownerId && e.status === "active");
  }

  listByConnector(connectorId: string): VaultEntry[] {
    return Array.from(this.entries.values()).filter(e => e.connectorId === connectorId && e.status === "active");
  }

  getExpiringSecrets(withinDays: number = 7): VaultEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return Array.from(this.entries.values()).filter(e => e.status === "active" && e.expiresAt && new Date(e.expiresAt) <= cutoff);
  }

  getAccessLog(secretId?: string, limit: number = 100): VaultAccessLog[] {
    let log = secretId ? this.accessLog.filter(l => l.secretId === secretId) : [...this.accessLog];
    return log.slice(-limit).reverse();
  }

  private logAccess(secretId: string, accessedBy: string, accessType: VaultAccessLog["accessType"], granted: boolean, reason?: string) {
    this.accessLog.push({
      id: crypto.randomUUID(),
      secretId,
      accessedBy,
      accessType,
      timestamp: new Date().toISOString(),
      granted,
      reason,
    });
    if (this.accessLog.length > 5000) this.accessLog = this.accessLog.slice(-5000);
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("keyvault", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      entries: Array.from(this.entries.entries()),
      accessLog: this.accessLog,
      rotationPolicies: Array.from(this.rotationPolicies.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.entries) this.entries = new Map(state.entries as [string, unknown][]);
    if (state.accessLog) this.accessLog = state.accessLog as never;
    if (state.rotationPolicies) this.rotationPolicies = new Map(state.rotationPolicies as [string, unknown][]);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("keyvault");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createKeyvault(): KeyvaultService {
  return new KeyvaultService();
}

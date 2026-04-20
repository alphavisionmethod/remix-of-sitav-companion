// ═══════════════════════════════════════════════════════════════
// SITA OS — App Permission Ledger
// Append-only record of all permission grants, denials, revocations.
// Persisted to localStorage, exportable for audit/support.
// ═══════════════════════════════════════════════════════════════

import type { AppPermissionKey } from "./permissions";
import type { TrustTier } from "./app-trust-tier-policy";

export type PermissionAction = "grant" | "deny" | "revoke";

export interface PermissionLedgerEntry {
  id: string;
  appId: string;
  permissionKey: AppPermissionKey | string;
  action: PermissionAction;
  actor: string;
  trustTierAtDecision: TrustTier;
  rationale?: string;
  scope?: string;
  expiresAt?: string;
  runtimeSurface?: string;
  lifecycleTransition?: string;
  timestamp: string;
}

export interface PermissionAuditExport {
  exportedAt: string;
  totalEntries: number;
  entries: PermissionLedgerEntry[];
  summary: {
    totalGrants: number;
    totalDenials: number;
    totalRevocations: number;
    appsWithGrants: string[];
  };
}

const LEDGER_KEY = "sita-permission-ledger";

function generateId(): string {
  return `perm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadLedger(): PermissionLedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLedger(entries: PermissionLedgerEntry[]): void {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(entries));
  } catch { /* quota exceeded — oldest entries could be pruned */ }
}

function appendEntry(entry: Omit<PermissionLedgerEntry, "id" | "timestamp">): PermissionLedgerEntry {
  const full: PermissionLedgerEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  const ledger = loadLedger();
  ledger.push(full);
  saveLedger(ledger);
  return full;
}

/** Record a permission grant. */
export function recordGrant(
  appId: string,
  permissionKey: string,
  actor: string,
  trustTier: TrustTier,
  opts?: { rationale?: string; scope?: string; expiresAt?: string; runtimeSurface?: string },
): PermissionLedgerEntry {
  return appendEntry({
    appId,
    permissionKey,
    action: "grant",
    actor,
    trustTierAtDecision: trustTier,
    ...opts,
  });
}

/** Record a permission denial. */
export function recordDenial(
  appId: string,
  permissionKey: string,
  actor: string,
  trustTier: TrustTier,
  reason?: string,
): PermissionLedgerEntry {
  return appendEntry({
    appId,
    permissionKey,
    action: "deny",
    actor,
    trustTierAtDecision: trustTier,
    rationale: reason,
  });
}

/** Record a permission revocation. */
export function recordRevocation(
  appId: string,
  permissionKey: string,
  actor: string,
  trustTier: TrustTier,
  reason?: string,
): PermissionLedgerEntry {
  return appendEntry({
    appId,
    permissionKey,
    action: "revoke",
    actor,
    trustTierAtDecision: trustTier,
    rationale: reason,
  });
}

/** Get all ledger entries for a specific app. */
export function getHistory(appId: string): PermissionLedgerEntry[] {
  return loadLedger().filter(e => e.appId === appId);
}

/** Get effective grants for an app (latest action per permission key). */
export function getEffectiveGrants(appId: string): Record<string, boolean> {
  const history = getHistory(appId);
  const effective: Record<string, boolean> = {};
  // Process in chronological order — last action wins
  for (const entry of history) {
    if (entry.action === "grant") {
      // Check expiry
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        effective[entry.permissionKey] = false;
      } else {
        effective[entry.permissionKey] = true;
      }
    } else {
      effective[entry.permissionKey] = false;
    }
  }
  return effective;
}

/** Export the full ledger for support/operator review. */
export function exportAudit(): PermissionAuditExport {
  const entries = loadLedger();
  const grants = entries.filter(e => e.action === "grant");
  const denials = entries.filter(e => e.action === "deny");
  const revocations = entries.filter(e => e.action === "revoke");
  const appsWithGrants = [...new Set(grants.map(e => e.appId))];

  return {
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries,
    summary: {
      totalGrants: grants.length,
      totalDenials: denials.length,
      totalRevocations: revocations.length,
      appsWithGrants,
    },
  };
}

/** Clear all ledger entries for a specific app (used during uninstall). */
export function clearAppEntries(appId: string): number {
  const ledger = loadLedger();
  const remaining = ledger.filter(e => e.appId !== appId);
  const removed = ledger.length - remaining.length;
  saveLedger(remaining);
  return removed;
}

/** Clear the entire ledger (e.g., on factory reset). */
export function clearAllEntries(): void {
  localStorage.removeItem(LEDGER_KEY);
}
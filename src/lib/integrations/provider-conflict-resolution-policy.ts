// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Conflict Resolution Policy
// CRM/sync conflict detection and resolution strategy
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_IDS } from "./provider-contract-registry";

export type ConflictStrategy = "last-write-wins" | "merge" | "manual" | "source-priority" | "not-applicable";

export interface ConflictResolutionEntry {
  providerId: ProviderId;
  syncCapable: boolean;
  conflictDetection: boolean;
  resolutionStrategy: ConflictStrategy;
  operatorEscalation: boolean;
  auditConflicts: boolean;
}

const SYNC_PROVIDERS: ProviderId[] = ["gmail", "google-calendar", "google-drive", "hubspot", "quickbooks", "dropbox", "slack"];

export const PROVIDER_CONFLICT_RESOLUTION_POLICIES: Record<ProviderId, ConflictResolutionEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const isSyncCapable = SYNC_PROVIDERS.includes(id);
    return [id, {
      providerId: id,
      syncCapable: isSyncCapable,
      conflictDetection: isSyncCapable,
      resolutionStrategy: isSyncCapable ? (id === "hubspot" ? "merge" : "last-write-wins") : "not-applicable",
      operatorEscalation: isSyncCapable,
      auditConflicts: isSyncCapable,
    }];
  })
) as Record<ProviderId, ConflictResolutionEntry>;
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Sync Health
// Snapshot of queue health surfaced to admin + user sync surfaces.
// ═══════════════════════════════════════════════════════════════

import { mobileSyncQueue } from "./sync-queue-manager";
import type { OfflineDomain } from "../contracts/offline-sync-contract";

export interface MobileSyncHealthSnapshot {
  totalQueued: number;
  byDomain: Record<OfflineDomain, number>;
  oldestQueuedAt: string | null;
  failedCount: number;
  conflictCount: number;
  lastSampledAt: string;
}

const DOMAINS: OfflineDomain[] = ["business", "boardroom", "approvals", "proof", "money", "concierge", "notifications"];

export function getMobileSyncHealth(): MobileSyncHealthSnapshot {
  const all = mobileSyncQueue.list();
  const byDomain = DOMAINS.reduce<Record<OfflineDomain, number>>((acc, d) => {
    acc[d] = all.filter((m) => m.domain === d && m.status === "queued").length;
    return acc;
  }, {} as Record<OfflineDomain, number>);

  const queued = all.filter((m) => m.status === "queued");
  const oldest = queued.reduce<string | null>((acc, m) => (!acc || m.enqueuedAt < acc ? m.enqueuedAt : acc), null);

  return {
    totalQueued: queued.length,
    byDomain,
    oldestQueuedAt: oldest,
    failedCount: all.filter((m) => m.status === "failed").length,
    conflictCount: all.filter((m) => m.status === "conflict").length,
    lastSampledAt: new Date().toISOString(),
  };
}

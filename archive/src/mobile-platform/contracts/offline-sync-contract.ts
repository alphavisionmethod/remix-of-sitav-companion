// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Offline Sync Contract
// Domain-aware durable mutation queue + conflict resolution.
// ═══════════════════════════════════════════════════════════════

export type OfflineDomain =
  | "business"
  | "boardroom"
  | "approvals"
  | "proof"
  | "money"
  | "concierge"
  | "notifications";

export type OfflineMutationStatus =
  | "queued"
  | "in-flight"
  | "succeeded"
  | "failed"
  | "conflict"
  | "abandoned";

export type ConflictPolicy =
  | "server-wins"
  | "client-wins"
  | "last-write-wins"
  | "manual-merge";

export interface OfflineMutation {
  id: string;
  domain: OfflineDomain;
  /** Verb such as "approval.decide" or "money.bill.markPaid". */
  verb: string;
  payload: Record<string, unknown>;
  /** Optional optimistic snapshot the UI may show until ack. */
  optimisticSnapshot?: Record<string, unknown>;
  conflictPolicy: ConflictPolicy;
  enqueuedAt: string;
  attempts: number;
  lastError?: string;
  status: OfflineMutationStatus;
}

export interface OfflineDomainPolicy {
  domain: OfflineDomain;
  /** Whether mutations may be queued offline. */
  mutationsAllowed: boolean;
  /** Whether reads are served from cache while offline. */
  readsAllowed: boolean;
  /** Whether the UI must mark cached data as stale. */
  markStale: boolean;
  conflictPolicy: ConflictPolicy;
  /** Soft retry budget before escalating to user. */
  maxAttempts: number;
}

export const OFFLINE_DOMAIN_POLICY: ReadonlyArray<OfflineDomainPolicy> = [
  { domain: "business",      mutationsAllowed: true,  readsAllowed: true, markStale: true,  conflictPolicy: "last-write-wins", maxAttempts: 8 },
  { domain: "boardroom",     mutationsAllowed: false, readsAllowed: true, markStale: true,  conflictPolicy: "server-wins",     maxAttempts: 0 },
  { domain: "approvals",     mutationsAllowed: false, readsAllowed: true, markStale: true,  conflictPolicy: "server-wins",     maxAttempts: 0 },
  { domain: "proof",         mutationsAllowed: false, readsAllowed: true, markStale: false, conflictPolicy: "server-wins",     maxAttempts: 0 },
  { domain: "money",         mutationsAllowed: false, readsAllowed: true, markStale: true,  conflictPolicy: "server-wins",     maxAttempts: 0 },
  { domain: "concierge",     mutationsAllowed: true,  readsAllowed: true, markStale: true,  conflictPolicy: "manual-merge",    maxAttempts: 5 },
  { domain: "notifications", mutationsAllowed: true,  readsAllowed: true, markStale: false, conflictPolicy: "client-wins",     maxAttempts: 3 },
] as const;

export function getOfflinePolicy(domain: OfflineDomain): OfflineDomainPolicy {
  return OFFLINE_DOMAIN_POLICY.find((r) => r.domain === domain)!;
}

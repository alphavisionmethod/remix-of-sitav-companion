// ═══════════════════════════════════════════════════════════════
// SITA OS — Message Replay Policy
// Replay/idempotency rules per message type
// ═══════════════════════════════════════════════════════════════

export type ReplayStrategy = "allow" | "deduplicate" | "reject" | "idempotent-apply";

export interface MessageReplayPolicy {
  messageType: string;
  strategy: ReplayStrategy;
  /** Deduplication window in milliseconds (0 = forever) */
  deduplicationWindowMs: number;
  /** Whether to store an idempotency key */
  storeIdempotencyKey: boolean;
  /** Maximum number of replays allowed (0 = unlimited for "allow") */
  maxReplays: number;
}

export const MESSAGE_REPLAY_POLICIES: MessageReplayPolicy[] = [
  // Commands — deduplicate or reject
  { messageType: "orchestration.intent", strategy: "deduplicate", deduplicationWindowMs: 5_000, storeIdempotencyKey: true, maxReplays: 1 },
  { messageType: "orchestration.execute", strategy: "reject", deduplicationWindowMs: 0, storeIdempotencyKey: true, maxReplays: 0 },
  { messageType: "orchestration.approve", strategy: "idempotent-apply", deduplicationWindowMs: 0, storeIdempotencyKey: true, maxReplays: 3 },

  // Events — allow replay (idempotent)
  { messageType: "trust.changed", strategy: "allow", deduplicationWindowMs: 1_000, storeIdempotencyKey: false, maxReplays: 0 },
  { messageType: "session.started", strategy: "deduplicate", deduplicationWindowMs: 5_000, storeIdempotencyKey: false, maxReplays: 1 },
  { messageType: "session.ended", strategy: "deduplicate", deduplicationWindowMs: 5_000, storeIdempotencyKey: false, maxReplays: 1 },
  { messageType: "service.health", strategy: "allow", deduplicationWindowMs: 0, storeIdempotencyKey: false, maxReplays: 0 },
  { messageType: "advisor.recommendation", strategy: "deduplicate", deduplicationWindowMs: 10_000, storeIdempotencyKey: true, maxReplays: 1 },

  // Proofs — idempotent apply
  { messageType: "proof.receipt", strategy: "idempotent-apply", deduplicationWindowMs: 0, storeIdempotencyKey: true, maxReplays: 5 },
  { messageType: "proof.chain", strategy: "idempotent-apply", deduplicationWindowMs: 0, storeIdempotencyKey: true, maxReplays: 5 },

  // Sync — allow
  { messageType: "sync.push", strategy: "deduplicate", deduplicationWindowMs: 2_000, storeIdempotencyKey: true, maxReplays: 3 },
  { messageType: "sync.pull", strategy: "allow", deduplicationWindowMs: 0, storeIdempotencyKey: false, maxReplays: 0 },

  // Heartbeat — always allow
  { messageType: "runtime.heartbeat", strategy: "allow", deduplicationWindowMs: 0, storeIdempotencyKey: false, maxReplays: 0 },
];

export function getReplayPolicy(messageType: string): MessageReplayPolicy | undefined {
  return MESSAGE_REPLAY_POLICIES.find((p) => p.messageType === messageType);
}

export function shouldRejectReplay(messageType: string): boolean {
  const policy = getReplayPolicy(messageType);
  return policy?.strategy === "reject";
}

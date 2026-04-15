// ═══════════════════════════════════════════════════════════════
// SITA OS — Message Failure Policy
// Failure handling per message type: retry/drop/dlq/escalate
// ═══════════════════════════════════════════════════════════════

export type FailureAction = "retry" | "drop" | "dead-letter-queue" | "escalate" | "fallback";

export interface MessageFailurePolicy {
  messageType: string;
  onFailure: FailureAction;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Retry backoff base in milliseconds */
  retryBackoffMs: number;
  /** Backoff multiplier (exponential) */
  backoffMultiplier: number;
  /** Whether to send to DLQ after max retries */
  dlqAfterMaxRetries: boolean;
  /** Whether to escalate to admin on persistent failure */
  escalateOnPersistentFailure: boolean;
  /** Fallback message type to emit on failure (if action is "fallback") */
  fallbackMessageType?: string;
}

export const MESSAGE_FAILURE_POLICIES: MessageFailurePolicy[] = [
  // ── Critical — escalate ──
  { messageType: "orchestration.execute", onFailure: "escalate", maxRetries: 2, retryBackoffMs: 1_000, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: true },
  { messageType: "orchestration.approve", onFailure: "escalate", maxRetries: 3, retryBackoffMs: 500, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: true },

  // ── Standard — retry then DLQ ──
  { messageType: "orchestration.intent", onFailure: "retry", maxRetries: 3, retryBackoffMs: 1_000, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: false },
  { messageType: "proof.receipt", onFailure: "retry", maxRetries: 5, retryBackoffMs: 2_000, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: true },
  { messageType: "proof.chain", onFailure: "retry", maxRetries: 5, retryBackoffMs: 2_000, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: true },
  { messageType: "sync.push", onFailure: "retry", maxRetries: 5, retryBackoffMs: 3_000, backoffMultiplier: 1.5, dlqAfterMaxRetries: true, escalateOnPersistentFailure: false },
  { messageType: "sync.pull", onFailure: "retry", maxRetries: 3, retryBackoffMs: 2_000, backoffMultiplier: 2, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },
  { messageType: "advisor.recommendation", onFailure: "retry", maxRetries: 2, retryBackoffMs: 5_000, backoffMultiplier: 2, dlqAfterMaxRetries: true, escalateOnPersistentFailure: false },

  // ── Events — drop on failure ──
  { messageType: "trust.changed", onFailure: "drop", maxRetries: 1, retryBackoffMs: 500, backoffMultiplier: 1, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },
  { messageType: "session.started", onFailure: "drop", maxRetries: 1, retryBackoffMs: 500, backoffMultiplier: 1, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },
  { messageType: "session.ended", onFailure: "drop", maxRetries: 1, retryBackoffMs: 500, backoffMultiplier: 1, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },
  { messageType: "service.health", onFailure: "drop", maxRetries: 0, retryBackoffMs: 0, backoffMultiplier: 1, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },

  // ── Heartbeat — drop ──
  { messageType: "runtime.heartbeat", onFailure: "drop", maxRetries: 0, retryBackoffMs: 0, backoffMultiplier: 1, dlqAfterMaxRetries: false, escalateOnPersistentFailure: false },
];

export function getFailurePolicy(messageType: string): MessageFailurePolicy | undefined {
  return MESSAGE_FAILURE_POLICIES.find((p) => p.messageType === messageType);
}

export function shouldEscalate(messageType: string): boolean {
  const policy = getFailurePolicy(messageType);
  return policy?.escalateOnPersistentFailure ?? false;
}

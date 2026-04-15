// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Message Registry
// Canonical message types that flow through the system
// ═══════════════════════════════════════════════════════════════

export type MessageCategory =
  | "command"
  | "event"
  | "query"
  | "response"
  | "notification"
  | "heartbeat"
  | "proof"
  | "sync";

export type MessagePriority = "critical" | "high" | "normal" | "low" | "background";

export interface RuntimeMessageDefinition {
  messageType: string;
  category: MessageCategory;
  priority: MessagePriority;
  /** Domain that owns this message type */
  ownerDomain: string;
  /** Whether the message carries sensitive data */
  sensitive: boolean;
  /** Whether the message is idempotent */
  idempotent: boolean;
  /** Maximum payload size in bytes (0 = unlimited) */
  maxPayloadBytes: number;
  /** TTL in milliseconds (0 = no expiry) */
  ttlMs: number;
  description: string;
}

export const RUNTIME_MESSAGES: RuntimeMessageDefinition[] = [
  // ── Commands ──
  { messageType: "orchestration.intent", category: "command", priority: "high", ownerDomain: "orchestration", sensitive: false, idempotent: false, maxPayloadBytes: 65_536, ttlMs: 30_000, description: "Intent submission to orchestration facade" },
  { messageType: "orchestration.execute", category: "command", priority: "high", ownerDomain: "orchestration", sensitive: true, idempotent: false, maxPayloadBytes: 131_072, ttlMs: 60_000, description: "Execution command from planning layer" },
  { messageType: "orchestration.approve", category: "command", priority: "critical", ownerDomain: "orchestration", sensitive: true, idempotent: true, maxPayloadBytes: 8_192, ttlMs: 0, description: "Approval decision on pending action" },

  // ── Events ──
  { messageType: "trust.changed", category: "event", priority: "high", ownerDomain: "trust", sensitive: false, idempotent: true, maxPayloadBytes: 4_096, ttlMs: 60_000, description: "Trust score or grade changed" },
  { messageType: "session.started", category: "event", priority: "normal", ownerDomain: "platform", sensitive: false, idempotent: true, maxPayloadBytes: 2_048, ttlMs: 0, description: "User session started" },
  { messageType: "session.ended", category: "event", priority: "normal", ownerDomain: "platform", sensitive: false, idempotent: true, maxPayloadBytes: 2_048, ttlMs: 0, description: "User session ended" },
  { messageType: "service.health", category: "event", priority: "low", ownerDomain: "platform", sensitive: false, idempotent: true, maxPayloadBytes: 4_096, ttlMs: 30_000, description: "Service health status update" },
  { messageType: "advisor.recommendation", category: "event", priority: "normal", ownerDomain: "advisor", sensitive: false, idempotent: false, maxPayloadBytes: 32_768, ttlMs: 300_000, description: "Advisor issued a recommendation" },

  // ── Proofs ──
  { messageType: "proof.receipt", category: "proof", priority: "high", ownerDomain: "proof", sensitive: true, idempotent: true, maxPayloadBytes: 16_384, ttlMs: 0, description: "Proof receipt emitted for an action" },
  { messageType: "proof.chain", category: "proof", priority: "high", ownerDomain: "proof", sensitive: true, idempotent: true, maxPayloadBytes: 32_768, ttlMs: 0, description: "Proof chain update" },

  // ── Sync ──
  { messageType: "sync.push", category: "sync", priority: "normal", ownerDomain: "sync", sensitive: false, idempotent: false, maxPayloadBytes: 262_144, ttlMs: 120_000, description: "Push sync payload to server" },
  { messageType: "sync.pull", category: "sync", priority: "normal", ownerDomain: "sync", sensitive: false, idempotent: true, maxPayloadBytes: 8_192, ttlMs: 60_000, description: "Request sync pull from server" },

  // ── Heartbeat ──
  { messageType: "runtime.heartbeat", category: "heartbeat", priority: "background", ownerDomain: "platform", sensitive: false, idempotent: true, maxPayloadBytes: 1_024, ttlMs: 15_000, description: "Runtime heartbeat" },
];

export function getMessage(messageType: string): RuntimeMessageDefinition | undefined {
  return RUNTIME_MESSAGES.find((m) => m.messageType === messageType);
}

export function getMessagesByCategory(category: MessageCategory): RuntimeMessageDefinition[] {
  return RUNTIME_MESSAGES.filter((m) => m.category === category);
}

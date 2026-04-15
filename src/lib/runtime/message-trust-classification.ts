// ═══════════════════════════════════════════════════════════════
// SITA OS — Message Trust Classification
// Classifies messages by trust level
// ═══════════════════════════════════════════════════════════════

export type MessageTrustLevel = "verified" | "standard" | "untrusted" | "system";

export interface MessageTrustClassification {
  messageType: string;
  trustLevel: MessageTrustLevel;
  /** Whether the message must be signed */
  requiresSignature: boolean;
  /** Whether the message must come from an authenticated session */
  requiresAuth: boolean;
  /** Minimum trust score to accept this message */
  minTrustScore: number;
  /** Whether to validate message schema before processing */
  validateSchema: boolean;
}

export const MESSAGE_TRUST_CLASSIFICATIONS: MessageTrustClassification[] = [
  // ── System (highest trust — internal only) ──
  { messageType: "runtime.heartbeat", trustLevel: "system", requiresSignature: false, requiresAuth: false, minTrustScore: 0, validateSchema: true },
  { messageType: "service.health", trustLevel: "system", requiresSignature: false, requiresAuth: false, minTrustScore: 0, validateSchema: true },

  // ── Verified (requires auth + signature) ──
  { messageType: "orchestration.execute", trustLevel: "verified", requiresSignature: true, requiresAuth: true, minTrustScore: 0.7, validateSchema: true },
  { messageType: "orchestration.approve", trustLevel: "verified", requiresSignature: true, requiresAuth: true, minTrustScore: 0.8, validateSchema: true },
  { messageType: "proof.receipt", trustLevel: "verified", requiresSignature: true, requiresAuth: true, minTrustScore: 0.5, validateSchema: true },
  { messageType: "proof.chain", trustLevel: "verified", requiresSignature: true, requiresAuth: true, minTrustScore: 0.5, validateSchema: true },

  // ── Standard (auth required, no signature) ──
  { messageType: "orchestration.intent", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0.3, validateSchema: true },
  { messageType: "trust.changed", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0, validateSchema: true },
  { messageType: "session.started", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0, validateSchema: true },
  { messageType: "session.ended", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0, validateSchema: true },
  { messageType: "advisor.recommendation", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0.4, validateSchema: true },
  { messageType: "sync.push", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0.3, validateSchema: true },
  { messageType: "sync.pull", trustLevel: "standard", requiresSignature: false, requiresAuth: true, minTrustScore: 0.3, validateSchema: true },
];

export function getMessageTrust(messageType: string): MessageTrustClassification | undefined {
  return MESSAGE_TRUST_CLASSIFICATIONS.find((c) => c.messageType === messageType);
}

export function isMessageTrusted(messageType: string, currentTrust: number): boolean {
  const classification = getMessageTrust(messageType);
  if (!classification) return false;
  return currentTrust >= classification.minTrustScore;
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Session Resume Token
// ═══════════════════════════════════════════════════════════════

export interface SessionResumeToken {
  tokenId: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  surfaceType: string;
  context: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  isConsumed: boolean;
  consumedAt?: string;
  consumedBy?: string;
}

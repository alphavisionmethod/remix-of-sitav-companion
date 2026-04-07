// SITA OS — Replay Metadata Service
export interface ReplayMetadata { sessionId: string; userId: string; startedAt: string; endedAt?: string; eventCount: number; errorCount: number; pageViews: string[]; interactionHighlights: string[] }

export function captureReplayMetadata(sessionId: string, userId: string): ReplayMetadata {
  return {
    sessionId, userId, startedAt: new Date(Date.now() - 1800000).toISOString(),
    eventCount: Math.floor(Math.random() * 200) + 50, errorCount: 0,
    pageViews: ["/", "/business/customers", "/money/accounts", "/boardroom"],
    interactionHighlights: ["Viewed pipeline", "Approved payment", "Opened boardroom session"],
  };
}

export function redactReplayForSupport(metadata: ReplayMetadata): ReplayMetadata {
  return { ...metadata, userId: `user-${metadata.userId.substring(0, 4)}***` };
}


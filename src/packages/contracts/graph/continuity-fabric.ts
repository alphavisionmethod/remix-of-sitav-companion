// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Contracts: Continuity Fabric
// Cross-surface workspace continuity
// ═══════════════════════════════════════════════════════════════

export interface ContinuityThread {
  id: string;
  topic: string;
  surfaces: string[];
  lastActivity: string;
  unresolvedCount: number;
  priority: "high" | "medium" | "low";
}

export interface ContinuityFabric {
  userId: string;
  activeThreads: ContinuityThread[];
  sharedTimeline: Array<{
    id: string;
    event: string;
    surface: string;
    timestamp: string;
  }>;
  unresolvedQueue: Array<{
    id: string;
    domain: string;
    description: string;
    age: string;
    priority: "high" | "medium" | "low";
  }>;
  continuityScore: number; // 0-100
  lastSyncAt: string;
}

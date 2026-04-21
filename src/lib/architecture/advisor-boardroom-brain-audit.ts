// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor / Boardroom / Brain Directory Audit (Workstream C)
// Maps all 30 scattered directories to canonical domain assignments
// ═══════════════════════════════════════════════════════════════

export type AIDomain = "advisor" | "boardroom" | "brain" | "cross-cutting";
export type AuditAction = "keep" | "merge" | "rename" | "delete";
export type MigrationPriority = "p0-immediate" | "p1-next-wave" | "p2-future" | "done";

export interface AIDirectoryAudit {
  currentPath: string;
  assignedDomain: AIDomain;
  action: AuditAction;
  targetPath: string | null; // null = keep in place
  priority: MigrationPriority;
  rationale: string;
}

export const AI_DIRECTORY_AUDIT: readonly AIDirectoryAudit[] = [
  // ══════════════ ADVISOR DOMAIN ══════════════
  // Canonical homes: src/lib/advisors/, src/packages/advisor-*
  { currentPath: "src/lib/advisors", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Canonical advisor logic home" },
  { currentPath: "src/packages/advisor-config", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor configuration package" },
  { currentPath: "src/packages/advisor-runtime-contracts", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor runtime type contracts" },
  { currentPath: "src/packages/contracts/advisor", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor contract definitions" },
  { currentPath: "src/pages/advisors", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor page routes" },
  { currentPath: "src/components/advisors", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor UI components" },
  { currentPath: "src/assets/advisors", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor visual assets" },

  // Merge targets — scattered advisor logic
  { currentPath: "src/lib/services/advisor-feedback", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/feedback", priority: "p1-next-wave", rationale: "Advisor feedback belongs in canonical advisor home" },
  { currentPath: "src/lib/services/advisor-knowledge", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/knowledge", priority: "p1-next-wave", rationale: "Advisor knowledge belongs in canonical advisor home" },
  { currentPath: "src/lib/services/advisor-memory", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/memory", priority: "p1-next-wave", rationale: "Advisor memory belongs in canonical advisor home" },
  { currentPath: "src/lib/advisor-intelligence", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/intelligence", priority: "p1-next-wave", rationale: "Advisor intelligence scattered in lib root" },
  { currentPath: "src/lib/advisor-protocol", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/protocol", priority: "p1-next-wave", rationale: "Advisor protocol scattered in lib root" },
  { currentPath: "src/features/advisors", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/features", priority: "p2-future", rationale: "Feature logic → canonical advisor home" },
  { currentPath: "src/domains/advisors", assignedDomain: "advisor", action: "merge", targetPath: "src/lib/advisors/domain", priority: "p2-future", rationale: "Domain logic → canonical advisor home" },
  { currentPath: "src/components/admin/advisor-agents", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Admin UI for advisor agents — keep in admin" },
  { currentPath: "src/components/business/advisor-board", assignedDomain: "advisor", action: "rename", targetPath: "src/components/business/advisor-panel", priority: "p1-next-wave", rationale: "Misleading name — this is single-advisor, not boardroom" },
  { currentPath: "src/lib/services/projections/advisors", assignedDomain: "advisor", action: "keep", targetPath: null, priority: "done", rationale: "Advisor read-model projections — correct location" },

  // ══════════════ BOARDROOM DOMAIN ══════════════
  // Canonical home: src/lib/boardroom/
  { currentPath: "src/lib/boardroom", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Canonical boardroom logic home" },
  { currentPath: "src/packages/boardroom-contracts", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Boardroom contract definitions" },
  { currentPath: "src/pages/boardroom", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Boardroom page routes" },
  { currentPath: "src/components/sita/apps/boardroom", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Boardroom app component" },
  { currentPath: "src/components/admin/boardroom", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Admin analytics for boardroom" },

  // Merge targets — scattered boardroom logic
  { currentPath: "src/lib/services/boardroom", assignedDomain: "boardroom", action: "merge", targetPath: "src/lib/boardroom/services", priority: "p1-next-wave", rationale: "Duplicate boardroom service layer" },
  { currentPath: "src/lib/services/boardroom-service", assignedDomain: "boardroom", action: "merge", targetPath: "src/lib/boardroom/service", priority: "p1-next-wave", rationale: "Second duplicate boardroom service" },
  { currentPath: "src/features/boardroom", assignedDomain: "boardroom", action: "merge", targetPath: "src/lib/boardroom/features", priority: "p2-future", rationale: "Feature logic → canonical boardroom home" },
  { currentPath: "src/domains/boardroom", assignedDomain: "boardroom", action: "merge", targetPath: "src/lib/boardroom/domain", priority: "p2-future", rationale: "Domain logic → canonical boardroom home" },
  { currentPath: "src/lib/hooks/boardroom", assignedDomain: "boardroom", action: "merge", targetPath: "src/lib/boardroom/hooks", priority: "p1-next-wave", rationale: "Boardroom hooks → canonical boardroom home" },
  { currentPath: "src/lib/services/projections/boardroom", assignedDomain: "boardroom", action: "keep", targetPath: null, priority: "done", rationale: "Boardroom read-model projections — correct location" },

  // ══════════════ BRAIN DOMAIN ══════════════
  // Canonical home: src/lib/core-services/brain-core/
  { currentPath: "src/lib/core-services/brain-core", assignedDomain: "brain", action: "keep", targetPath: null, priority: "done", rationale: "Canonical brain substrate" },
  { currentPath: "src/lib/services/brain-core", assignedDomain: "brain", action: "merge", targetPath: null, priority: "p0-immediate", rationale: "Duplicate brain-core — handled by DSP-030 in service consolidation" },
] as const;

// ── Query helpers ──

export function getDirectoriesByDomain(domain: AIDomain): readonly AIDirectoryAudit[] {
  return AI_DIRECTORY_AUDIT.filter(d => d.assignedDomain === domain);
}

export function getMergeTargets(): readonly AIDirectoryAudit[] {
  return AI_DIRECTORY_AUDIT.filter(d => d.action === "merge");
}

export function getRenameTargets(): readonly AIDirectoryAudit[] {
  return AI_DIRECTORY_AUDIT.filter(d => d.action === "rename");
}

export function getAuditProgress() {
  const all = AI_DIRECTORY_AUDIT;
  const done = all.filter(d => d.priority === "done");
  const pending = all.filter(d => d.priority !== "done");
  return {
    totalDirectories: all.length,
    resolved: done.length,
    pendingMerge: all.filter(d => d.action === "merge").length,
    pendingRename: all.filter(d => d.action === "rename").length,
    byDomain: {
      advisor: all.filter(d => d.assignedDomain === "advisor").length,
      boardroom: all.filter(d => d.assignedDomain === "boardroom").length,
      brain: all.filter(d => d.assignedDomain === "brain").length,
    },
    completionPct: Math.round((done.length / all.length) * 100),
  };
}
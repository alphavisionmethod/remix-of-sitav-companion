// ═══════════════════════════════════════════════════════════════
// SITA OS — Workspace View Engine
// Principal / Operator dual-reality workspace powered by
// shared truth chain with role-aware presentation filtering.
// ═══════════════════════════════════════════════════════════════

import type {
  WorkspaceViewMode, ViewModelFilter, WorkspaceHandoff,
  EscalationRecord, GovernanceBoardroomSection,
} from "../types/meta-governance.types";
import type { OSDomain } from "../types/os-unified.types";

const DEFAULT_PRINCIPAL_FILTER: ViewModelFilter = {
  viewMode: "principal",
  visibleDomains: ["business", "finance", "concierge", "boardroom", "identity"],
  redactedFields: ["internalNotes", "debugInfo", "rawConnectorResponse", "systemMetrics"],
  explanationDepth: "executive",
  maxDetailLevel: "summary",
  authorityActions: ["approve", "reject", "escalate", "delegate", "freeze"],
  visibleSeverities: ["warning", "critical"],
};

const DEFAULT_OPERATOR_FILTER: ViewModelFilter = {
  viewMode: "operator",
  visibleDomains: ["business", "finance", "concierge", "boardroom", "admin", "system", "connector", "identity", "device", "ambient"],
  redactedFields: [],
  explanationDepth: "operational",
  maxDetailLevel: "full",
  authorityActions: ["execute", "retry", "rollback", "replay", "acknowledge", "triage", "configure"],
  visibleSeverities: ["info", "warning", "critical"],
};

export class WorkspaceViewEngine {
  private handoffs: WorkspaceHandoff[] = [];
  private escalations: EscalationRecord[] = [];
  private customFilters: Map<string, ViewModelFilter> = new Map();

  /** Get the view filter for a role */
  getFilter(viewMode: WorkspaceViewMode, userId?: string): ViewModelFilter {
    if (userId) {
      const custom = this.customFilters.get(`${userId}:${viewMode}`);
      if (custom) return custom;
    }
    return viewMode === "principal" ? { ...DEFAULT_PRINCIPAL_FILTER } : { ...DEFAULT_OPERATOR_FILTER };
  }

  /** Set custom filter overrides */
  setCustomFilter(userId: string, filter: ViewModelFilter): void {
    this.customFilters.set(`${userId}:${filter.viewMode}`, filter);
  }

  /** Filter data for a specific view mode */
  filterForView<T extends Record<string, unknown>>(data: T[], viewMode: WorkspaceViewMode, userId?: string): T[] {
    const filter = this.getFilter(viewMode, userId);

    return data.map(item => {
      const filtered = { ...item };

      // Redact fields not visible to this role
      for (const field of filter.redactedFields) {
        if (field in filtered) {
          (filtered as Record<string, unknown>)[field] = undefined;
        }
      }

      // Filter by domain if item has a domain field
      if ("domain" in filtered && !filter.visibleDomains.includes(filtered.domain as OSDomain)) {
        return null;
      }

      // Filter by severity if item has severity
      if ("severity" in filtered && !filter.visibleSeverities.includes(filtered.severity as "info" | "warning" | "critical")) {
        return null;
      }

      return filtered;
    }).filter((item): item is T => item !== null);
  }

  /** Check if an action is authorized for a view mode */
  isActionAuthorized(action: string, viewMode: WorkspaceViewMode, userId?: string): boolean {
    const filter = this.getFilter(viewMode, userId);
    return filter.authorityActions.includes(action);
  }

  /** Create a handoff between principal and operator */
  createHandoff(input: {
    fromRole: WorkspaceViewMode;
    toRole: WorkspaceViewMode;
    subject: string;
    context: string;
    urgency: WorkspaceHandoff["urgency"];
    evidencePacketIds: string[];
  }): WorkspaceHandoff {
    const handoff: WorkspaceHandoff = {
      id: `ho_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.handoffs.push(handoff);
    return handoff;
  }

  /** Acknowledge a handoff */
  acknowledgeHandoff(id: string): boolean {
    const h = this.handoffs.find(h => h.id === id);
    if (!h) return false;
    h.acknowledgedAt = new Date().toISOString();
    return true;
  }

  /** Complete a handoff */
  completeHandoff(id: string): boolean {
    const h = this.handoffs.find(h => h.id === id);
    if (!h) return false;
    h.completedAt = new Date().toISOString();
    return true;
  }

  /** Create an escalation */
  createEscalation(input: {
    fromRole: WorkspaceViewMode;
    toRole: WorkspaceViewMode;
    reason: string;
    workflowId: string;
    severity: EscalationRecord["severity"];
  }): EscalationRecord {
    const escalation: EscalationRecord = {
      id: `esc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    this.escalations.push(escalation);
    return escalation;
  }

  /** Resolve an escalation */
  resolveEscalation(id: string, resolution: string): boolean {
    const e = this.escalations.find(e => e.id === id);
    if (!e) return false;
    e.resolved = true;
    e.resolution = resolution;
    return true;
  }

  /** Get pending handoffs for a role */
  getPendingHandoffs(role: WorkspaceViewMode): WorkspaceHandoff[] {
    return this.handoffs.filter(h => h.toRole === role && !h.completedAt);
  }

  /** Get active escalations */
  getActiveEscalations(role?: WorkspaceViewMode): EscalationRecord[] {
    return this.escalations.filter(e =>
      !e.resolved && (!role || e.toRole === role)
    );
  }

  /** Boardroom section */
  getBoardroomSection(): GovernanceBoardroomSection {
    const pendingHandoffs = this.handoffs.filter(h => !h.completedAt);
    const activeEscalations = this.escalations.filter(e => !e.resolved);

    return {
      systemId: "workspace-dual-reality",
      title: "Principal / Operator Workspace",
      severity: activeEscalations.some(e => e.severity === "critical") ? "critical" : pendingHandoffs.length > 3 ? "warning" : "info",
      summary: `${pendingHandoffs.length} pending handoffs, ${activeEscalations.length} active escalations`,
      metrics: [
        { label: "Pending Handoffs", value: pendingHandoffs.length },
        { label: "Active Escalations", value: activeEscalations.length },
        { label: "Critical Escalations", value: activeEscalations.filter(e => e.severity === "critical").length },
      ],
      actionItems: [
        ...activeEscalations.filter(e => e.severity === "critical").map(e => ({
          description: `Critical escalation: ${e.reason}`,
          priority: "high" as const,
          route: `/workspace/${e.toRole}`,
        })),
        ...pendingHandoffs.filter(h => h.urgency === "critical").map(h => ({
          description: `Urgent handoff: ${h.subject}`,
          priority: "high" as const,
        })),
      ].slice(0, 3),
      drilldownRoute: "/workspace/principal",
    };
  }
}


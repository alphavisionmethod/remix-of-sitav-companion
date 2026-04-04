// ═══════════════════════════════════════════════════════════════
// SITA OS — Incident Management Service
// Full incident lifecycle: declare → triage → investigate →
// mitigate → resolve → postmortem
// ═══════════════════════════════════════════════════════════════

export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "declared" | "triaging" | "investigating" | "mitigating" | "resolved" | "postmortem" | "closed";

const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  declared: ["triaging"],
  triaging: ["investigating", "resolved"],
  investigating: ["mitigating", "resolved"],
  mitigating: ["resolved", "investigating"],
  resolved: ["postmortem", "closed", "investigating"],
  postmortem: ["closed"],
  closed: [],
};

export interface TimelineEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly author: string;
  readonly type: "status-change" | "note" | "action" | "escalation" | "communication" | "evidence";
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
}

export interface Incident {
  readonly id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignee?: string;
  priority: number;
  impactScope: string;
  affectedServices: string[];
  timeline: TimelineEntry[];
  tags: string[];
  relatedIncidents: string[];
  declaredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  closedAt?: number;
  resolution?: string;
  resolvedBy?: string;
  ttdMs?: number; // time to detect
  ttaMs?: number; // time to acknowledge
  ttrMs?: number; // time to resolve
}

export interface Postmortem {
  readonly id: string;
  readonly incidentId: string;
  title: string;
  summary: string;
  rootCause: string;
  impact: string;
  timeline: TimelineEntry[];
  lessonsLearned: string[];
  actionItems: Array<{ item: string; owner: string; dueDate: number; completed: boolean }>;
  blameless: boolean;
  createdAt: number;
  publishedAt?: number;
}

export interface IncidentMetrics {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  bySeverity: Record<IncidentSeverity, number>;
  avgTTDMs: number;
  avgTTAMs: number;
  avgTTRMs: number;
  mttrMs: number;
  resolutionRate: number;
  postmortemRate: number;
  incidentsLast24h: number;
  incidentsLast7d: number;
}

export class IncidentManagementService {
  private incidents = new Map<string, Incident>();
  private postmortems = new Map<string, Postmortem>();

  declareIncident(severity: IncidentSeverity, title: string, description: string, opts?: { impactScope?: string; affectedServices?: string[]; tags?: string[] }): Incident {
    const now = Date.now();
    const incident: Incident = {
      id: `inc_${now}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      description,
      severity,
      status: "declared",
      priority: severity === "critical" ? 1 : severity === "high" ? 2 : severity === "medium" ? 3 : 4,
      impactScope: opts?.impactScope ?? "unknown",
      affectedServices: opts?.affectedServices ?? [],
      timeline: [{
        id: `tl_${now}`,
        timestamp: now,
        author: "system",
        type: "status-change",
        content: `Incident declared: ${title} (${severity})`,
      }],
      tags: opts?.tags ?? [],
      relatedIncidents: [],
      declaredAt: now,
    };
    this.incidents.set(incident.id, incident);
    return incident;
  }

  triageIncident(id: string, assignee: string, priority?: number): Incident | null {
    const inc = this.incidents.get(id);
    if (!inc || !VALID_TRANSITIONS[inc.status].includes("triaging")) return null;

    const now = Date.now();
    inc.status = "triaging";
    inc.assignee = assignee;
    if (priority !== undefined) inc.priority = priority;
    inc.acknowledgedAt = now;
    inc.ttaMs = now - inc.declaredAt;

    inc.timeline.push({
      id: `tl_${now}`,
      timestamp: now,
      author: assignee,
      type: "status-change",
      content: `Incident triaged and assigned to ${assignee} (priority ${inc.priority})`,
    });
    return inc;
  }

  updateStatus(id: string, status: IncidentStatus, note: string, author = "system"): Incident | null {
    const inc = this.incidents.get(id);
    if (!inc) return null;

    if (!VALID_TRANSITIONS[inc.status].includes(status)) return null;

    const now = Date.now();
    inc.status = status;
    inc.timeline.push({
      id: `tl_${now}`,
      timestamp: now,
      author,
      type: "status-change",
      content: `Status → ${status}: ${note}`,
    });
    return inc;
  }

  addTimelineEntry(id: string, entry: Omit<TimelineEntry, "id" | "timestamp">): boolean {
    const inc = this.incidents.get(id);
    if (!inc) return false;

    inc.timeline.push({
      ...entry,
      id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    });
    return true;
  }

  resolveIncident(id: string, resolution: string, resolvedBy: string): Incident | null {
    const inc = this.incidents.get(id);
    if (!inc) return null;
    if (!VALID_TRANSITIONS[inc.status].includes("resolved")) return null;

    const now = Date.now();
    inc.status = "resolved";
    inc.resolution = resolution;
    inc.resolvedBy = resolvedBy;
    inc.resolvedAt = now;
    inc.ttrMs = now - inc.declaredAt;

    inc.timeline.push({
      id: `tl_${now}`,
      timestamp: now,
      author: resolvedBy,
      type: "status-change",
      content: `Resolved: ${resolution}`,
    });
    return inc;
  }

  createPostmortem(incidentId: string): Postmortem | null {
    const inc = this.incidents.get(incidentId);
    if (!inc) return null;

    // auto-transition to postmortem status
    if (inc.status === "resolved") {
      inc.status = "postmortem";
      inc.timeline.push({ id: `tl_${Date.now()}`, timestamp: Date.now(), author: "system", type: "status-change", content: "Postmortem initiated" });
    }

    const pm: Postmortem = {
      id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      incidentId,
      title: `Postmortem: ${inc.title}`,
      summary: `Incident ${inc.id} (${inc.severity}) — ${inc.description}`,
      rootCause: "",
      impact: `Affected services: ${inc.affectedServices.join(", ") || "Unknown"}. Scope: ${inc.impactScope}. Duration: ${inc.ttrMs ? Math.round(inc.ttrMs / 60000) + " minutes" : "ongoing"}`,
      timeline: [...inc.timeline],
      lessonsLearned: [],
      actionItems: [],
      blameless: true,
      createdAt: Date.now(),
    };
    this.postmortems.set(pm.id, pm);
    return pm;
  }

  getIncident(id: string): Incident | undefined { return this.incidents.get(id); }

  listIncidents(filter?: { status?: IncidentStatus; severity?: IncidentSeverity; assignee?: string }): Incident[] {
    let results = Array.from(this.incidents.values());
    if (filter?.status) results = results.filter(i => i.status === filter.status);
    if (filter?.severity) results = results.filter(i => i.severity === filter.severity);
    if (filter?.assignee) results = results.filter(i => i.assignee === filter.assignee);
    return results.sort((a, b) => a.priority - b.priority || b.declaredAt - a.declaredAt);
  }

  getActiveIncidents(): Incident[] {
    return this.listIncidents().filter(i => !["resolved", "postmortem", "closed"].includes(i.status));
  }

  getIncidentMetrics(): IncidentMetrics {
    const all = Array.from(this.incidents.values());
    const resolved = all.filter(i => i.resolvedAt);
    const open = all.filter(i => !["resolved", "postmortem", "closed"].includes(i.status));
    const withPostmortem = all.filter(i => Array.from(this.postmortems.values()).some(p => p.incidentId === i.id));

    const now = Date.now();
    const last24h = all.filter(i => now - i.declaredAt < 86400000);
    const last7d = all.filter(i => now - i.declaredAt < 604800000);

    const avgTTD = resolved.filter(i => i.ttdMs).reduce((s, i) => s + (i.ttdMs ?? 0), 0) / (resolved.filter(i => i.ttdMs).length || 1);
    const avgTTA = resolved.filter(i => i.ttaMs).reduce((s, i) => s + (i.ttaMs ?? 0), 0) / (resolved.filter(i => i.ttaMs).length || 1);
    const avgTTR = resolved.filter(i => i.ttrMs).reduce((s, i) => s + (i.ttrMs ?? 0), 0) / (resolved.length || 1);

    const bySeverity: Record<IncidentSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    all.forEach(i => bySeverity[i.severity]++);

    return {
      totalIncidents: all.length,
      openIncidents: open.length,
      resolvedIncidents: resolved.length,
      bySeverity,
      avgTTDMs: Math.round(avgTTD),
      avgTTAMs: Math.round(avgTTA),
      avgTTRMs: Math.round(avgTTR),
      mttrMs: Math.round(avgTTR),
      resolutionRate: all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 0,
      postmortemRate: resolved.length > 0 ? Math.round((withPostmortem.length / resolved.length) * 100) : 0,
      incidentsLast24h: last24h.length,
      incidentsLast7d: last7d.length,
    };
  }

  getPostmortem(id: string): Postmortem | undefined { return this.postmortems.get(id); }
  listPostmortems(): Postmortem[] { return Array.from(this.postmortems.values()).sort((a, b) => b.createdAt - a.createdAt); }

  getDemoIncidents(): Incident[] {
    const now = Date.now();
    return [
      { id: "inc_demo_1", title: "Event bus latency spike", description: "P95 latency exceeded 500ms on event-bus for 12 minutes", severity: "high" as const, status: "resolved" as const, assignee: "ops-team", priority: 2, impactScope: "all-services", affectedServices: ["event-bus", "brain-core", "projections"], timeline: [], tags: ["performance", "event-bus"], relatedIncidents: [], declaredAt: now - 3600000 * 4, acknowledgedAt: now - 3600000 * 3.9, resolvedAt: now - 3600000 * 3, resolution: "Scaled event-bus replicas from 3 to 5", resolvedBy: "ops-team", ttaMs: 360000, ttrMs: 3600000 },
      { id: "inc_demo_2", title: "Auth service certificate expiry warning", description: "TLS certificate expires in 72 hours", severity: "medium" as const, status: "investigating" as const, assignee: "security-team", priority: 3, impactScope: "auth-service", affectedServices: ["auth", "api-gateway"], timeline: [], tags: ["security", "certificate"], relatedIncidents: [], declaredAt: now - 3600000, acknowledgedAt: now - 3500000, ttaMs: 100000 },
    ];
  }
}

export function createIncidentManagement(): IncidentManagementService {
  return new IncidentManagementService();
}

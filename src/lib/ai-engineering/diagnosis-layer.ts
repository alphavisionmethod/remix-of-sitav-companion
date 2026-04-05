// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Diagnosis Layer
// Transforms raw signals into issue clusters, root causes,
// severity assessments, blast radius, and ownership routing
// ═══════════════════════════════════════════════════════════════

import type { RawSignal } from "./observation-layer";

export type DiagnosisSeverity = "low" | "medium" | "high" | "critical";
export type ReproducibilityEstimate = "always" | "frequent" | "intermittent" | "rare" | "unknown";

export interface IssueCluster {
  clusterId: string;
  title: string;
  signals: string[]; // signal IDs
  severity: DiagnosisSeverity;
  likelyRootCause: string;
  confidence: number;
  affectedRoutes: string[];
  affectedComponents: string[];
  affectedServices: string[];
  blastRadius: "isolated" | "component" | "surface" | "cross-surface" | "platform-wide";
  reproducibility: ReproducibilityEstimate;
  recommendedOwner: string; // agent name
  firstSeen: string;
  lastSeen: string;
  signalCount: number;
}

export interface DiagnosisResult {
  clusters: IssueCluster[];
  unclusteredSignals: string[];
  totalSignalsProcessed: number;
  diagnosedAt: string;
}

export class DiagnosisLayer {
  diagnose(signals: RawSignal[]): DiagnosisResult {
    const clusterMap = new Map<string, RawSignal[]>();

    // Cluster by source + affected service/surface
    for (const s of signals) {
      const key = `${s.source}:${s.affectedService ?? s.affectedSurface ?? "general"}`;
      if (!clusterMap.has(key)) clusterMap.set(key, []);
      clusterMap.get(key)!.push(s);
    }

    const clusters: IssueCluster[] = [];
    const clustered = new Set<string>();

    for (const [key, group] of clusterMap) {
      if (group.length < 1) continue;

      const highestSeverity = this.pickHighestSeverity(group);
      const representative = group[0];

      clusters.push({
        clusterId: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: this.generateClusterTitle(group),
        signals: group.map(s => s.id),
        severity: highestSeverity,
        likelyRootCause: this.inferRootCause(group),
        confidence: this.calculateConfidence(group),
        affectedRoutes: [...new Set(group.map(s => s.metadata?.route as string).filter(Boolean))],
        affectedComponents: [...new Set(group.map(s => s.metadata?.component as string).filter(Boolean))],
        affectedServices: [...new Set(group.map(s => s.affectedService).filter(Boolean) as string[])],
        blastRadius: this.assessBlastRadius(group),
        reproducibility: group.length >= 5 ? "always" : group.length >= 3 ? "frequent" : "intermittent",
        recommendedOwner: this.routeToAgent(representative),
        firstSeen: group.reduce((min, s) => s.timestamp < min ? s.timestamp : min, group[0].timestamp),
        lastSeen: group.reduce((max, s) => s.timestamp > max ? s.timestamp : max, group[0].timestamp),
        signalCount: group.length,
      });

      group.forEach(s => clustered.add(s.id));
    }

    return {
      clusters: clusters.sort((a, b) => this.severityWeight(b.severity) - this.severityWeight(a.severity)),
      unclusteredSignals: signals.filter(s => !clustered.has(s.id)).map(s => s.id),
      totalSignalsProcessed: signals.length,
      diagnosedAt: new Date().toISOString(),
    };
  }

  private pickHighestSeverity(signals: RawSignal[]): DiagnosisSeverity {
    const order: DiagnosisSeverity[] = ["critical", "high", "medium", "low"];
    for (const s of order) {
      if (signals.some(sig => sig.severity === s)) return s;
    }
    return "low";
  }

  private severityWeight(s: DiagnosisSeverity): number {
    return { critical: 4, high: 3, medium: 2, low: 1 }[s];
  }

  private generateClusterTitle(signals: RawSignal[]): string {
    const sources = [...new Set(signals.map(s => s.source))];
    const services = [...new Set(signals.map(s => s.affectedService).filter(Boolean))];
    return `${sources.join("/")} issue${services.length ? ` in ${services.join(", ")}` : ""}`;
  }

  private inferRootCause(signals: RawSignal[]): string {
    const sources = [...new Set(signals.map(s => s.source))];
    if (sources.includes("deployment")) return "Recent deployment may have introduced regression";
    if (sources.includes("performance-metric")) return "Performance degradation detected";
    if (sources.includes("design-drift")) return "Design token or layout inconsistency";
    if (sources.includes("accessibility-scan")) return "Accessibility violation introduced";
    return "Automated analysis required — multiple contributing factors possible";
  }

  private calculateConfidence(signals: RawSignal[]): number {
    const base = Math.min(signals.length * 12, 70);
    const sourceDiversity = new Set(signals.map(s => s.source)).size;
    return Math.min(base + sourceDiversity * 8, 95);
  }

  private assessBlastRadius(signals: RawSignal[]): IssueCluster["blastRadius"] {
    const services = new Set(signals.map(s => s.affectedService).filter(Boolean));
    const surfaces = new Set(signals.map(s => s.affectedSurface).filter(Boolean));
    if (services.size > 3 || surfaces.size > 2) return "platform-wide";
    if (surfaces.size > 1) return "cross-surface";
    if (services.size > 1) return "surface";
    if (signals.length > 5) return "component";
    return "isolated";
  }

  private routeToAgent(signal: RawSignal): string {
    const source = signal.source;
    if (["frontend-error", "design-drift"].includes(source)) return "Frontend Engineer";
    if (["backend-error", "trace"].includes(source)) return "Backend Engineer";
    if (["performance-metric"].includes(source)) return "Performance Optimizer";
    if (["accessibility-scan"].includes(source)) return "Frontend Engineer";
    if (["test-result", "ci-pipeline"].includes(source)) return "QA Engineer";
    if (["deployment", "rollback-event"].includes(source)) return "Reliability Engineer";
    if (["connector-health", "edge-function-health"].includes(source)) return "Backend Engineer";
    return "Error Fixer";
  }
}

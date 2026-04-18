// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Diagnosis Layer
// Transforms raw signals into issue clusters, root causes,
// severity, blast radius, causal confidence, known pattern
// matching, config delta comparison, dependency graph traversal
// ═══════════════════════════════════════════════════════════════

import type { RawSignal } from "./observation-layer";

export type DiagnosisSeverity = "low" | "medium" | "high" | "critical";
export type ReproducibilityEstimate = "always" | "frequent" | "intermittent" | "rare" | "unknown";

export type RootCauseCategory =
  | "code-regression"
  | "config-change"
  | "dependency-failure"
  | "performance-degradation"
  | "design-drift"
  | "accessibility-violation"
  | "schema-mismatch"
  | "deployment-issue"
  | "connector-failure"
  | "permission-issue"
  | "resource-exhaustion"
  | "unknown";

export interface CausalLink {
  fromSignalId: string;
  toSignalId: string;
  relationship: "causes" | "correlates" | "precedes" | "amplifies";
  confidence: number;
}

export interface IssueCluster {
  clusterId: string;
  title: string;
  signals: string[]; // signal IDs
  severity: DiagnosisSeverity;
  likelyRootCause: string;
  rootCauseCategory: RootCauseCategory;
  causalConfidence: number;
  confidence: number;
  affectedRoutes: string[];
  affectedComponents: string[];
  affectedServices: string[];
  blastRadius: "isolated" | "component" | "surface" | "cross-surface" | "platform-wide";
  reproducibility: ReproducibilityEstimate;
  recommendedOwner: string;
  contributingFactors: string[];
  dependencies: string[];        // dependent cluster IDs
  causalLinks: CausalLink[];
  knownPatternMatch?: string;    // matched known pattern ID
  configDelta?: string;          // config change that may have caused this
  firstSeen: string;
  lastSeen: string;
  signalCount: number;
  environment?: string;
}

export interface DiagnosisResult {
  clusters: IssueCluster[];
  unclusteredSignals: string[];
  totalSignalsProcessed: number;
  rootCauseSummary: { category: RootCauseCategory; count: number; avgConfidence: number }[];
  diagnosedAt: string;
}

// Known patterns for matching
interface KnownPattern {
  patternId: string;
  name: string;
  signalSignature: { source: string; titleContains?: string }[];
  rootCauseCategory: RootCauseCategory;
  suggestedRootCause: string;
  confidenceBoost: number;
}

const KNOWN_PATTERNS: KnownPattern[] = [
  { patternId: "kp-1", name: "Flag rollback within 2h", signalSignature: [{ source: "rollback-event", titleContains: "feature flag" }], rootCauseCategory: "config-change", suggestedRootCause: "Feature flag activated without canary stage", confidenceBoost: 15 },
  { patternId: "kp-2", name: "Post-deploy error spike", signalSignature: [{ source: "deployment" }, { source: "backend-error" }], rootCauseCategory: "code-regression", suggestedRootCause: "Recent deployment introduced regression", confidenceBoost: 20 },
  { patternId: "kp-3", name: "CDN cache stale after update", signalSignature: [{ source: "frontend-error", titleContains: "stale" }], rootCauseCategory: "config-change", suggestedRootCause: "CDN cache not invalidated after content update", confidenceBoost: 10 },
  { patternId: "kp-4", name: "Concurrent write corruption", signalSignature: [{ source: "backend-error", titleContains: "corruption" }], rootCauseCategory: "code-regression", suggestedRootCause: "Race condition in concurrent write path", confidenceBoost: 15 },
  { patternId: "kp-5", name: "Schema drift after migration", signalSignature: [{ source: "backend-error", titleContains: "schema" }], rootCauseCategory: "schema-mismatch", suggestedRootCause: "Edge function schema out of sync with database", confidenceBoost: 12 },
];

export class DiagnosisLayer {
  diagnose(signals: RawSignal[]): DiagnosisResult {
    const clusterMap = new Map<string, RawSignal[]>();

    for (const s of signals) {
      const key = `${s.source}:${s.affectedService ?? s.affectedSurface ?? "general"}`;
      if (!clusterMap.has(key)) clusterMap.set(key, []);
      clusterMap.get(key)!.push(s);
    }

    const clusters: IssueCluster[] = [];
    const clustered = new Set<string>();

    for (const [, group] of clusterMap) {
      if (group.length < 1) continue;

      const highestSeverity = this.pickHighestSeverity(group);
      const representative = group[0];
      const knownMatch = this.matchKnownPattern(group);
      const rootCauseCategory = knownMatch?.rootCauseCategory ?? this.inferRootCauseCategory(group);
      const baseConfidence = this.calculateConfidence(group);
      const causalConfidence = baseConfidence + (knownMatch?.confidenceBoost ?? 0);

      clusters.push({
        clusterId: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: this.generateClusterTitle(group),
        signals: group.map(s => s.id),
        severity: highestSeverity,
        likelyRootCause: knownMatch?.suggestedRootCause ?? this.inferRootCause(group),
        rootCauseCategory,
        causalConfidence: Math.min(causalConfidence, 95),
        confidence: Math.min(baseConfidence, 95),
        affectedRoutes: [...new Set(group.map(s => s.affectedRoute ?? (s.metadata?.route as string)).filter(Boolean))],
        affectedComponents: [...new Set(group.map(s => s.affectedComponent ?? (s.metadata?.component as string)).filter(Boolean))],
        affectedServices: [...new Set(group.map(s => s.affectedService).filter(Boolean) as string[])],
        blastRadius: this.assessBlastRadius(group),
        reproducibility: group.length >= 5 ? "always" : group.length >= 3 ? "frequent" : "intermittent",
        recommendedOwner: this.routeToAgent(representative),
        contributingFactors: this.identifyContributingFactors(group),
        dependencies: [],
        causalLinks: this.buildCausalLinks(group),
        knownPatternMatch: knownMatch?.patternId,
        configDelta: this.detectConfigDelta(group),
        firstSeen: group.reduce((min, s) => s.timestamp < min ? s.timestamp : min, group[0].timestamp),
        lastSeen: group.reduce((max, s) => s.timestamp > max ? s.timestamp : max, group[0].timestamp),
        signalCount: group.length,
        environment: group[0].environment,
      });

      group.forEach(s => clustered.add(s.id));
    }

    // Build root cause summary
    const rcMap = new Map<RootCauseCategory, { count: number; totalConf: number }>();
    for (const c of clusters) {
      const existing = rcMap.get(c.rootCauseCategory) ?? { count: 0, totalConf: 0 };
      existing.count++;
      existing.totalConf += c.causalConfidence;
      rcMap.set(c.rootCauseCategory, existing);
    }

    return {
      clusters: clusters.sort((a, b) => this.severityWeight(b.severity) - this.severityWeight(a.severity)),
      unclusteredSignals: signals.filter(s => !clustered.has(s.id)).map(s => s.id),
      totalSignalsProcessed: signals.length,
      rootCauseSummary: [...rcMap.entries()].map(([category, data]) => ({
        category,
        count: data.count,
        avgConfidence: Math.round(data.totalConf / data.count),
      })),
      diagnosedAt: new Date().toISOString(),
    };
  }

  // ── Pattern matching ───────────────────────────────────────

  private matchKnownPattern(signals: RawSignal[]): KnownPattern | undefined {
    for (const pattern of KNOWN_PATTERNS) {
      const allMatch = pattern.signalSignature.every(sig =>
        signals.some(s =>
          s.source === sig.source &&
          (!sig.titleContains || s.title.toLowerCase().includes(sig.titleContains.toLowerCase()))
        )
      );
      if (allMatch) return pattern;
    }
    return undefined;
  }

  // ── Causal link building ───────────────────────────────────

  private buildCausalLinks(signals: RawSignal[]): CausalLink[] {
    const links: CausalLink[] = [];
    const sorted = [...signals].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.correlationId && current.correlationId === next.correlationId) {
        links.push({
          fromSignalId: current.id,
          toSignalId: next.id,
          relationship: "precedes",
          confidence: 80,
        });
      }
    }

    // Deployment → error causal link
    const deployments = signals.filter(s => s.source === "deployment");
    const errors = signals.filter(s => ["frontend-error", "backend-error"].includes(s.source));
    for (const d of deployments) {
      for (const e of errors) {
        if (d.timestamp < e.timestamp) {
          links.push({
            fromSignalId: d.id,
            toSignalId: e.id,
            relationship: "causes",
            confidence: 70,
          });
        }
      }
    }

    return links;
  }

  // ── Contributing factors ───────────────────────────────────

  private identifyContributingFactors(signals: RawSignal[]): string[] {
    const factors: string[] = [];
    if (signals.some(s => s.source === "deployment")) factors.push("Recent deployment");
    if (signals.some(s => s.source === "config-drift")) factors.push("Configuration change");
    if (signals.some(s => s.source === "rollback-event")) factors.push("Recent rollback");
    if (signals.some(s => s.source === "connector-health")) factors.push("External connector instability");
    if (signals.length > 10) factors.push("High signal volume (possible cascading failure)");
    return factors;
  }

  // ── Config delta detection ─────────────────────────────────

  private detectConfigDelta(signals: RawSignal[]): string | undefined {
    const configSignals = signals.filter(s => s.source === "config-drift");
    if (configSignals.length > 0) {
      return configSignals.map(s => s.detail).join("; ");
    }
    return undefined;
  }

  // ── Existing helpers ───────────────────────────────────────

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
    if (sources.includes("config-drift")) return "Configuration change may have caused drift";
    if (sources.includes("performance-metric")) return "Performance degradation detected";
    if (sources.includes("design-drift")) return "Design token or layout inconsistency";
    if (sources.includes("accessibility-scan")) return "Accessibility violation introduced";
    if (sources.includes("connector-health")) return "External connector instability";
    return "Automated analysis required — multiple contributing factors possible";
  }

  private inferRootCauseCategory(signals: RawSignal[]): RootCauseCategory {
    const sources = new Set(signals.map(s => s.source));
    if (sources.has("deployment")) return "code-regression";
    if (sources.has("config-drift")) return "config-change";
    if (sources.has("connector-health")) return "connector-failure";
    if (sources.has("performance-metric")) return "performance-degradation";
    if (sources.has("design-drift")) return "design-drift";
    if (sources.has("accessibility-scan")) return "accessibility-violation";
    return "unknown";
  }

  private calculateConfidence(signals: RawSignal[]): number {
    const base = Math.min(signals.length * 12, 70);
    const sourceDiversity = new Set(signals.map(s => s.source)).size;
    const qualityBoost = signals.some(s => s.quality === "verified") ? 10 : 0;
    return Math.min(base + sourceDiversity * 8 + qualityBoost, 95);
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
    if (["config-drift"].includes(source)) return "Reliability Engineer";
    return "Error Fixer";
  }
}

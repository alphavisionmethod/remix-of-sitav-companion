// ═══════════════════════════════════════════════════════════════
// SITA OS — Escalation Package Builder
// Assembles escalation packages with fingerprint, diagnostics,
// incidents, runbooks, kill-switch suggestions, and session.
// ═══════════════════════════════════════════════════════════════

import type {
  BundlePack,
  EscalationPackage,
  EscalationSeverity,
  EscalationTarget,
  KillSwitchSuggestion,
  SupportSessionAction,
} from "./support-bundle-contract";

let escalationCounter = 0;

function generateEscalationId(): string {
  escalationCounter += 1;
  return `ESC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${escalationCounter}`;
}

export class EscalationPackageBuilder {
  private severity: EscalationSeverity = "medium";
  private target: EscalationTarget = "internal-operator";
  private issueSummary = "";
  private fingerprint: BundlePack | null = null;
  private diagnosticsPacks: BundlePack[] = [];
  private incidentIds: string[] = [];
  private runbookIds: string[] = [];
  private killSwitchSuggestions: KillSwitchSuggestion[] = [];
  private sessionHistory: SupportSessionAction[] = [];
  private actionHistory: string[] = [];

  setSeverity(s: EscalationSeverity): this { this.severity = s; return this; }
  setTarget(t: EscalationTarget): this { this.target = t; return this; }
  setIssueSummary(s: string): this { this.issueSummary = s; return this; }
  setFingerprint(fp: BundlePack): this { this.fingerprint = fp; return this; }
  addDiagnosticsPack(p: BundlePack): this { this.diagnosticsPacks.push(p); return this; }
  addIncidentIds(...ids: string[]): this { this.incidentIds.push(...ids); return this; }
  addRunbookIds(...ids: string[]): this { this.runbookIds.push(...ids); return this; }
  addKillSwitchSuggestion(s: KillSwitchSuggestion): this { this.killSwitchSuggestions.push(s); return this; }
  addSessionHistory(actions: SupportSessionAction[]): this { this.sessionHistory.push(...actions); return this; }
  addActionHistory(...actions: string[]): this { this.actionHistory.push(...actions); return this; }

  build(): EscalationPackage {
    return {
      packageId: generateEscalationId(),
      createdAt: new Date().toISOString(),
      severity: this.severity,
      target: this.target,
      issueSummary: this.issueSummary,
      environmentFingerprint: this.fingerprint,
      diagnosticsPacks: [...this.diagnosticsPacks],
      relatedIncidentIds: [...this.incidentIds],
      linkedRunbookIds: [...this.runbookIds],
      killSwitchSuggestions: [...this.killSwitchSuggestions],
      sessionHistory: [...this.sessionHistory],
      actionHistory: [...this.actionHistory],
      redactionStatus: "applied",
    };
  }
}

export function createEscalationPackage(): EscalationPackageBuilder {
  return new EscalationPackageBuilder();
}
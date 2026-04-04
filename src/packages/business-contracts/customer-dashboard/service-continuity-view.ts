// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Service Continuity View
// ═══════════════════════════════════════════════════════════════

export type ContinuityStatus = "healthy" | "at-risk" | "disrupted" | "recovering";

export interface ServiceContinuityView {
  customerId: string;
  overallStatus: ContinuityStatus;
  activeServices: number;
  disruptedServices: number;
  slaCompliancePct: number;
  nextRenewalDate: string;
  backupContactAvailable: boolean;
  lastIncidentDate?: string;
  recoveryTimeObjectiveHours: number;
}

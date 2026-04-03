// SITA OS — Diagnostic Bundle Service
import type { DiagnosticBundle } from "@/packages/contracts";

export function generateDiagnosticBundle(): DiagnosticBundle {
  return {
    id: crypto.randomUUID(), generatedAt: new Date().toISOString(), systemHealth: 94,
    incidents: [], degradedServices: [], stuckWorkflows: [],
    costAnomalies: [], policyViolations: [], supportSafe: true,
  };
}

export function generateExtendedDiagnostic(): DiagnosticBundle & { connectorHealth: Record<string, string>; workflowStatus: Record<string, string>; memoryUsage: Record<string, number> } {
  return {
    ...generateDiagnosticBundle(),
    connectorHealth: { gmail: "healthy", calendar: "healthy", crm: "healthy", banking: "healthy", accounting: "not-configured" },
    workflowStatus: { activeWorkflows: "5", completedToday: "12", failedToday: "0" },
    memoryUsage: { profileEntries: 15, workflowCheckpoints: 3, corrections: 2, trustStates: 1 },
  };
}

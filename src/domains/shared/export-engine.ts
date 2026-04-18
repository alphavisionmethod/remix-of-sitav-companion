// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Export Engine
// CSV/JSON export for audit logs, compliance controls, risk matrix
// ═══════════════════════════════════════════════════════════════

export function exportToCSV(filename: string, headers: string[], rows: string[][]): void {
  const escapeCell = (cell: string) => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map(row => row.map(escapeCell).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Pre-built export functions for each domain
export function exportAuditLog(entries: Array<{
  timestamp: number; action: string; agentName: string; performedBy: string;
  previousState: string; newState: string; correlationId: string;
  ipAddress: string; sessionId: string; success: boolean; reason?: string;
  autonomyBefore?: number; autonomyAfter?: number;
}>): void {
  const headers = ["Timestamp", "Action", "Agent", "Performed By", "Previous State", "New State",
    "Autonomy Before", "Autonomy After", "Correlation ID", "IP Address", "Session ID", "Success", "Reason"];
  const rows = entries.map(e => [
    new Date(e.timestamp).toISOString(),
    e.action, e.agentName, e.performedBy, e.previousState, e.newState,
    e.autonomyBefore?.toString() ?? "", e.autonomyAfter?.toString() ?? "",
    e.correlationId, e.ipAddress, e.sessionId,
    e.success ? "Yes" : "No", e.reason ?? "",
  ]);
  exportToCSV("sita_audit_log", headers, rows);
}

export function exportComplianceControls(controls: Array<{
  framework: string; controlId: string; title: string;
  status: string; owner: string; category: string; lastAuditedAt: number;
}>): void {
  const headers = ["Framework", "Control ID", "Title", "Status", "Owner", "Category", "Last Audited"];
  const rows = controls.map(c => [
    c.framework, c.controlId, c.title, c.status, c.owner, c.category,
    new Date(c.lastAuditedAt).toISOString(),
  ]);
  exportToCSV("sita_compliance_controls", headers, rows);
}

export function exportRiskMatrix(risks: Array<{
  title: string; likelihood: number; impact: number;
  category: string; status: string; owner: string; mitigations: string[];
}>): void {
  const headers = ["Title", "Likelihood", "Impact", "Risk Score", "Category", "Status", "Owner", "Mitigations"];
  const rows = risks.map(r => [
    r.title, r.likelihood.toString(), r.impact.toString(),
    (r.likelihood * r.impact).toString(), r.category, r.status, r.owner,
    r.mitigations.join("; "),
  ]);
  exportToCSV("sita_risk_matrix", headers, rows);
}

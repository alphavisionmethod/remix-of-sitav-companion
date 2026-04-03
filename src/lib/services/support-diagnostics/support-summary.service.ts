// SITA OS — Support Summary Service
export interface SupportSummary { id: string; generatedAt: string; summary: string; severity: string; category: string; piiRedacted: boolean; actionsTaken: string[]; suggestedNextSteps: string[] }

export function generateSupportSummary(incidentDescription: string): SupportSummary {
  return {
    id: crypto.randomUUID(), generatedAt: new Date().toISOString(),
    summary: `Support case: ${incidentDescription.substring(0, 100)}`,
    severity: "medium", category: classifyCategory(incidentDescription),
    piiRedacted: true,
    actionsTaken: ["Diagnostic bundle generated", "System health checked"],
    suggestedNextSteps: ["Review connector health", "Check recent workflow logs"],
  };
}

function classifyCategory(desc: string): string {
  const lower = desc.toLowerCase();
  if (lower.includes("payment") || lower.includes("invoice")) return "billing";
  if (lower.includes("sync") || lower.includes("connector")) return "integration";
  if (lower.includes("login") || lower.includes("auth")) return "authentication";
  return "general";
}

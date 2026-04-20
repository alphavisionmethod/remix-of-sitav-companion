// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Permission Matrix
// Maps advisor roles to allowed action types.
// ═══════════════════════════════════════════════════════════════

export type AdvisorRole = "business" | "finance" | "concierge" | "security" | "operations" | "investment";
export type ActionCategory = "read" | "recommend" | "draft" | "execute" | "execute-financial" | "communicate-external" | "system-config";

export interface PermissionEntry {
  role: AdvisorRole;
  allowed: readonly ActionCategory[];
  blocked: readonly ActionCategory[];
  requiresApproval: readonly ActionCategory[];
}

export const ADVISOR_PERMISSION_MATRIX: readonly PermissionEntry[] = [
  { role: "business", allowed: ["read", "recommend", "draft"], blocked: ["system-config"], requiresApproval: ["execute", "communicate-external"] },
  { role: "finance", allowed: ["read", "recommend", "draft"], blocked: ["system-config", "communicate-external"], requiresApproval: ["execute", "execute-financial"] },
  { role: "concierge", allowed: ["read", "recommend", "draft", "communicate-external"], blocked: ["system-config", "execute-financial"], requiresApproval: ["execute"] },
  { role: "security", allowed: ["read", "recommend"], blocked: ["execute-financial", "communicate-external"], requiresApproval: ["execute", "system-config", "draft"] },
  { role: "operations", allowed: ["read", "recommend", "draft"], blocked: ["execute-financial", "communicate-external"], requiresApproval: ["execute", "system-config"] },
  { role: "investment", allowed: ["read", "recommend", "draft"], blocked: ["system-config", "communicate-external"], requiresApproval: ["execute", "execute-financial"] },
] as const;

export function isActionAllowed(role: AdvisorRole, action: ActionCategory): "allowed" | "blocked" | "requires-approval" {
  const entry = ADVISOR_PERMISSION_MATRIX.find((e) => e.role === role);
  if (!entry) return "blocked";
  if (entry.blocked.includes(action)) return "blocked";
  if (entry.requiresApproval.includes(action)) return "requires-approval";
  if (entry.allowed.includes(action)) return "allowed";
  return "blocked";
}
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Role Contract
// Canonical enum of 8 function roles for topology classification.
// ═══════════════════════════════════════════════════════════════

export type FunctionRole =
  | "PUBLIC_BFF"
  | "ADMIN_BFF"
  | "DOMAIN"
  | "ORCHESTRATION"
  | "WEBHOOK"
  | "RUNTIME_SYSTEM"
  | "VERIFIER"
  | "SUPPORT";

export interface FunctionRoleEntry {
  readonly role: FunctionRole;
  readonly description: string;
  readonly allowedCallers: readonly ("browser" | "edge-function" | "pg-cron" | "webhook" | "admin-ui")[];
  readonly requiresAuth: boolean;
  readonly emitsReceipts: boolean;
}

export const FUNCTION_ROLE_DEFINITIONS: readonly FunctionRoleEntry[] = [
  { role: "PUBLIC_BFF", description: "Browser-facing backend-for-frontend", allowedCallers: ["browser"], requiresAuth: true, emitsReceipts: false },
  { role: "ADMIN_BFF", description: "Admin UI backend-for-frontend", allowedCallers: ["admin-ui"], requiresAuth: true, emitsReceipts: true },
  { role: "DOMAIN", description: "Domain logic invoked by other functions", allowedCallers: ["edge-function"], requiresAuth: false, emitsReceipts: true },
  { role: "ORCHESTRATION", description: "Multi-step workflow coordinator", allowedCallers: ["edge-function", "pg-cron"], requiresAuth: false, emitsReceipts: true },
  { role: "WEBHOOK", description: "External webhook receiver", allowedCallers: ["webhook"], requiresAuth: false, emitsReceipts: true },
  { role: "RUNTIME_SYSTEM", description: "Internal system function (cron, health)", allowedCallers: ["pg-cron", "edge-function"], requiresAuth: false, emitsReceipts: false },
  { role: "VERIFIER", description: "Truth/proof verification function", allowedCallers: ["pg-cron", "edge-function"], requiresAuth: false, emitsReceipts: true },
  { role: "SUPPORT", description: "Diagnostics and support bundle generation", allowedCallers: ["admin-ui"], requiresAuth: true, emitsReceipts: false },
];

export function getFunctionRoleDefinition(role: FunctionRole): FunctionRoleEntry | undefined {
  return FUNCTION_ROLE_DEFINITIONS.find((r) => r.role === role);
}
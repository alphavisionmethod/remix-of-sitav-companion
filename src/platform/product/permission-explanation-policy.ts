// ═══════════════════════════════════════════════════════════════
// SITA OS — Permission Explanation Policy
// What permission, why needed, what if denied, help path.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";

export interface PermissionExplanation {
  readonly permissionKey: string;
  readonly domain: TaskDomain;
  readonly displayLabel: string;
  readonly whyNeeded: string;
  readonly whatIfDenied: string;
  readonly affectedFeatures: readonly string[];
  readonly helpArticleUrl?: string;
  readonly supportPath?: string;
  readonly riskLevel: "low" | "medium" | "high" | "critical";
}

export const PERMISSION_EXPLANATIONS: readonly PermissionExplanation[] = [
  { permissionKey: "admin.users.manage",      domain: "admin",        displayLabel: "User Management",        whyNeeded: "Required to create, edit, or deactivate user accounts.",    whatIfDenied: "You cannot manage user accounts. Contact your administrator.", affectedFeatures: ["user-create", "user-edit", "user-deactivate"], riskLevel: "high" },
  { permissionKey: "admin.fleet.manage",      domain: "admin",        displayLabel: "Fleet Management",       whyNeeded: "Required to manage release rings and fleet configuration.", whatIfDenied: "Fleet controls are hidden. Request access from an admin.",     affectedFeatures: ["release-rings", "fleet-diagnostics"],          riskLevel: "critical" },
  { permissionKey: "admin.killswitch.manage", domain: "admin",        displayLabel: "Kill Switches",          whyNeeded: "Required to activate or deactivate emergency kill switches.", whatIfDenied: "Kill switch controls are unavailable.",                     affectedFeatures: ["kill-switch-toggle"],                           riskLevel: "critical" },
  { permissionKey: "finance.payments.write",  domain: "finance",      displayLabel: "Process Payments",       whyNeeded: "Required to initiate or process payments.",                whatIfDenied: "You can view but not process payments.",                      affectedFeatures: ["payment-processing", "refunds"],               riskLevel: "high" },
  { permissionKey: "ai.advisor.execute",      domain: "ai",           displayLabel: "Execute AI Actions",     whyNeeded: "Required to let AI advisors execute actions on your behalf.", whatIfDenied: "AI advisors can suggest but not execute actions.",          affectedFeatures: ["advisor-execution", "auto-actions"],           riskLevel: "high" },
  { permissionKey: "files.upload",            domain: "files",        displayLabel: "Upload Files",           whyNeeded: "Required to upload documents and files.",                  whatIfDenied: "File uploads are disabled. You can view existing files.",     affectedFeatures: ["file-upload", "document-creation"],            riskLevel: "low" },
  { permissionKey: "integrations.manage",     domain: "integrations", displayLabel: "Manage Integrations",    whyNeeded: "Required to connect or disconnect external integrations.",  whatIfDenied: "You can view but not modify integration connections.",        affectedFeatures: ["connector-setup", "sync-configuration"],       riskLevel: "medium" },
] as const;

export function getPermissionExplanation(key: string): PermissionExplanation | undefined {
  return PERMISSION_EXPLANATIONS.find((p) => p.permissionKey === key);
}
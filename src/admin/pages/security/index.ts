// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Security
// Canonical import: @/admin/pages/security
// ═══════════════════════════════════════════════════════════════

// ── Flat security pages ──
export { default as SecurityCommandCenter } from "@/pages/admin/SecurityCommandCenter";
export { default as SecurityPostureBoard } from "@/pages/admin/SecurityPostureBoard";
export { default as SEC01SessionSecrets } from "@/pages/admin/SEC01SessionSecrets";
export { default as SEC02SecurityFoundation } from "@/pages/admin/SEC02SecurityFoundation";

// ── Security subdirectory ──
export { default as SEC01PostureExecutive } from "@/pages/admin/security/SEC01PostureExecutive";
export { default as SEC02PrivilegedActions } from "@/pages/admin/security/SEC02PrivilegedActions";
export { default as SEC03SensitiveAssets } from "@/pages/admin/security/SEC03SensitiveAssets";
export { default as SEC04EdgeFunctionAudit } from "@/pages/admin/security/SEC04EdgeFunctionAudit";
export { default as SEC05ClaimSafety } from "@/pages/admin/security/SEC05ClaimSafety";
export { default as SEC06IncidentRecovery } from "@/pages/admin/security/SEC06IncidentRecovery";

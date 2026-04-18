// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Bridge Capabilities
// Maps each bridge method to capability ID, security class, fallback
// ═══════════════════════════════════════════════════════════════

export type SecurityClass = "public" | "restricted" | "privileged" | "critical";
export type RuntimeConsequence = "none" | "degraded-ux" | "feature-unavailable" | "data-loss-risk";

export interface BridgeCapabilityBinding {
  bridgeMethod: string;
  capabilityId: string;
  securityClass: SecurityClass;
  runtimeConsequence: RuntimeConsequence;
  fallbackBehavior: string;
  auditRequired: boolean;
}

export const BRIDGE_CAPABILITY_BINDINGS: readonly BridgeCapabilityBinding[] = [
  // ── System ─────────────────────────────────────────────────
  { bridgeMethod: "platform", capabilityId: "system.platform", securityClass: "public", runtimeConsequence: "none", fallbackBehavior: "Return navigator.platform", auditRequired: false },
  { bridgeMethod: "getSystemInfo", capabilityId: "system.info", securityClass: "public", runtimeConsequence: "degraded-ux", fallbackBehavior: "Return partial info from navigator APIs", auditRequired: false },
  { bridgeMethod: "getAppVersion", capabilityId: "system.version", securityClass: "public", runtimeConsequence: "none", fallbackBehavior: "Return build-time version constant", auditRequired: false },

  // ── Window ─────────────────────────────────────────────────
  { bridgeMethod: "windowControl", capabilityId: "window.control", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op — web cannot control browser chrome", auditRequired: false },

  // ── Notification ───────────────────────────────────────────
  { bridgeMethod: "sendNotification", capabilityId: "notification.send", securityClass: "public", runtimeConsequence: "degraded-ux", fallbackBehavior: "Use web Notification API with permission request", auditRequired: false },

  // ── Navigation ─────────────────────────────────────────────
  { bridgeMethod: "onDeepLink", capabilityId: "nav.deeplink", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op — web uses URL routing natively", auditRequired: false },
  { bridgeMethod: "onMenuAction", capabilityId: "nav.menu", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op — web has no native menu", auditRequired: false },
  { bridgeMethod: "onNavigate", capabilityId: "nav.navigate", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op — web uses router directly", auditRequired: false },

  // ── Update ─────────────────────────────────────────────────
  { bridgeMethod: "checkForUpdates", capabilityId: "update.check", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Return null — web auto-deploys", auditRequired: false },
  { bridgeMethod: "downloadUpdate", capabilityId: "update.download", securityClass: "privileged", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Return null", auditRequired: true },
  { bridgeMethod: "installUpdate", capabilityId: "update.install", securityClass: "critical", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op", auditRequired: true },
  { bridgeMethod: "getUpdateStatus", capabilityId: "update.status", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Return null", auditRequired: false },
  { bridgeMethod: "onUpdateStatus", capabilityId: "update.events", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op", auditRequired: false },

  // ── Filesystem ─────────────────────────────────────────────
  { bridgeMethod: "exportBackup", capabilityId: "fs.backup.export", securityClass: "privileged", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Offer cloud backup or JSON download", auditRequired: true },
  { bridgeMethod: "importBackup", capabilityId: "fs.backup.import", securityClass: "privileged", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Offer file input upload", auditRequired: true },
  { bridgeMethod: "saveFile", capabilityId: "fs.write", securityClass: "privileged", runtimeConsequence: "degraded-ux", fallbackBehavior: "Use download blob via anchor tag", auditRequired: true },
  { bridgeMethod: "readFile", capabilityId: "fs.read", securityClass: "privileged", runtimeConsequence: "degraded-ux", fallbackBehavior: "Use file input element", auditRequired: true },
  { bridgeMethod: "autoBackup", capabilityId: "fs.backup.auto", securityClass: "privileged", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Silently skip — rely on cloud persistence", auditRequired: true },
  { bridgeMethod: "listBackups", capabilityId: "fs.backup.list", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Return empty array", auditRequired: false },

  // ── Diagnostics ────────────────────────────────────────────
  { bridgeMethod: "getCrashReports", capabilityId: "diag.crash.list", securityClass: "restricted", runtimeConsequence: "feature-unavailable", fallbackBehavior: "Return null", auditRequired: false },
  { bridgeMethod: "clearCrashReports", capabilityId: "diag.crash.clear", securityClass: "privileged", runtimeConsequence: "feature-unavailable", fallbackBehavior: "No-op", auditRequired: true },
  { bridgeMethod: "reportRendererError", capabilityId: "diag.error.report", securityClass: "public", runtimeConsequence: "degraded-ux", fallbackBehavior: "Log to console.error", auditRequired: false },
] as const;

/** Lookup a capability binding by bridge method */
export function getCapabilityForMethod(method: string): BridgeCapabilityBinding | undefined {
  return BRIDGE_CAPABILITY_BINDINGS.find((b) => b.bridgeMethod === method);
}

/** Get all methods requiring audit */
export function getAuditRequiredMethods(): BridgeCapabilityBinding[] {
  return BRIDGE_CAPABILITY_BINDINGS.filter((b) => b.auditRequired);
}

/** Get methods by security class */
export function getMethodsBySecurityClass(cls: SecurityClass): BridgeCapabilityBinding[] {
  return BRIDGE_CAPABILITY_BINDINGS.filter((b) => b.securityClass === cls);
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Plane Service Barrel
// ═══════════════════════════════════════════════════════════════

export { planeRegistry } from "./plane-registry";
export { adminRbacEngine, PERMISSION_CATEGORIES } from "./admin-rbac-engine";
export { environmentConfig } from "./environment-config";
export { userBFF } from "./user-bff";
export { adminBFF } from "./admin-bff";
export { serviceAuth } from "./service-auth";
export { adminSafety } from "./admin-safety";
export { supportWorkflow } from "./support-workflow";
export { notificationRouter } from "./notification-router";

export type { PlaneKey, PlaneInfo, PlaneServiceAssignment } from "./plane-registry";
export type { AdminPermission, PermissionCategory } from "./admin-rbac-engine";
export type { EnvironmentKey, EnvironmentInfo } from "./environment-config";
export type { UserDashboard, DeviceSummary, NotificationSummary, CaseSummary } from "./user-bff";
export type { SystemOverview, User360View, DeviceFleetSummary } from "./admin-bff";
export type { ServiceIdentity, ServiceToken, ServiceAccessLog } from "./service-auth";
export type { SafetyRequirements, DryRunResult, ConfirmationRequest } from "./admin-safety";
export type { SupportCase, SupportCaseEvent, DiagnosticPackage, CaseCategory, CasePriority, CaseStatus } from "./support-workflow";
export type { PlatformNotification, NotificationAudience, NotificationSeverity } from "./notification-router";

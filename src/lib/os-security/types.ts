// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Security Subsystem: Shared Types & Contracts
// Identity, Authorization, Secrets, Audit, Elevation
// ═══════════════════════════════════════════════════════════════

// ── Identity & Roles ────────────────────────────────────────

export type OSUserRole = "guest" | "standard" | "admin" | "system";

export type OSAuthMethod = "password" | "pin" | "biometric" | "security-key";

export type SessionState = "active" | "inactive" | "locked" | "authenticating" | "terminating";

export interface OSUserAccount {
  userId: string;
  username: string;
  displayName: string;
  role: OSUserRole;
  status: "active" | "disabled" | "locked-out";
  enrolledMethods: OSAuthMethod[];
  createdAt: number;
  updatedAt: number;
  passwordHashRef?: string;
  profileRef?: string;
  failedAttempts: number;
  lockoutUntil?: number;
}

export interface OSSession {
  sessionId: string;
  userId: string;
  role: OSUserRole;
  state: SessionState;
  locked: boolean;
  createdAt: number;
  lastActivityAt: number;
  authFreshUntil: number;
  capabilities: string[];
  enrolledMethods: OSAuthMethod[];
  displayId: string;
  seatId: string;
}

export interface ServiceIdentity {
  serviceName: string;
  serviceUid: string;
  allowedActions: string[];
  secretScopes: string[];
  privileged: boolean;
  registeredAt: number;
}

export interface DeviceIdentity {
  deviceId: string;
  hostname: string;
  hardwareModel: string;
  machinePublicKey?: string;
  tpmPresent: boolean;
  secureBootEnabled: boolean;
  hardwareBackedSecrets: boolean;
}

// ── Capabilities & Authorization ────────────────────────────

export interface OSCapability {
  id: string;
  name: string;
  description: string;
  sensitivityLevel: "low" | "medium" | "high" | "critical";
}

export interface ActionPolicy {
  action: string;
  displayName: string;
  requiredRole: OSUserRole;
  requiredCapability: string;
  elevationRequired: boolean;
  freshAuthRequired: boolean;
  lockedSessionAllowed: boolean;
  auditSeverity: "info" | "warning" | "high" | "critical";
  description: string;
}

// ── Full Capability Registry ────────────────────────────────

export const CAPABILITY_REGISTRY: OSCapability[] = [
  { id: "wifi.toggle", name: "Toggle WiFi", description: "Enable or disable WiFi radio", sensitivityLevel: "low" },
  { id: "wifi.connect.open", name: "Connect Open WiFi", description: "Connect to open WiFi networks", sensitivityLevel: "low" },
  { id: "wifi.connect.secure", name: "Connect Secure WiFi", description: "Connect to password-protected WiFi", sensitivityLevel: "medium" },
  { id: "wifi.forget", name: "Forget WiFi Network", description: "Remove saved WiFi network", sensitivityLevel: "medium" },
  { id: "bluetooth.toggle", name: "Toggle Bluetooth", description: "Enable or disable Bluetooth radio", sensitivityLevel: "low" },
  { id: "bluetooth.pair", name: "Pair Bluetooth Device", description: "Pair a new Bluetooth device", sensitivityLevel: "medium" },
  { id: "bluetooth.unpair", name: "Unpair Bluetooth Device", description: "Remove paired Bluetooth device", sensitivityLevel: "medium" },
  { id: "shield.vpn.toggle", name: "Toggle VPN", description: "Enable or disable VPN connection", sensitivityLevel: "medium" },
  { id: "shield.vpn.configure", name: "Configure VPN", description: "Modify VPN connection settings", sensitivityLevel: "high" },
  { id: "shield.firewall.toggle", name: "Toggle Firewall", description: "Enable or disable system firewall", sensitivityLevel: "high" },
  { id: "shield.firewall.disable", name: "Disable Firewall", description: "Fully disable system firewall protection", sensitivityLevel: "critical" },
  { id: "shield.firewall.rules", name: "Manage Firewall Rules", description: "Add or modify firewall rules", sensitivityLevel: "high" },
  { id: "cert.install.user", name: "Install User Certificate", description: "Install certificate for current user", sensitivityLevel: "medium" },
  { id: "cert.install.system", name: "Install System Certificate", description: "Install root/system-wide certificate", sensitivityLevel: "critical" },
  { id: "cert.remove", name: "Remove Certificate", description: "Remove installed certificate", sensitivityLevel: "high" },
  { id: "power.profile.set", name: "Set Power Profile", description: "Change power management profile", sensitivityLevel: "low" },
  { id: "power.shutdown", name: "Shutdown System", description: "Initiate system shutdown", sensitivityLevel: "medium" },
  { id: "power.reboot", name: "Reboot System", description: "Initiate system reboot", sensitivityLevel: "medium" },
  { id: "audit.view", name: "View Audit Logs", description: "Read system audit trail", sensitivityLevel: "medium" },
  { id: "audit.export", name: "Export Audit Logs", description: "Export audit logs for review", sensitivityLevel: "high" },
  { id: "secrets.read.wifi", name: "Read WiFi Secrets", description: "Access stored WiFi credentials", sensitivityLevel: "high" },
  { id: "secrets.read.vpn", name: "Read VPN Secrets", description: "Access VPN keys and certificates", sensitivityLevel: "critical" },
  { id: "secrets.read.app", name: "Read App Secrets", description: "Access application credentials", sensitivityLevel: "high" },
  { id: "secrets.manage", name: "Manage Secrets", description: "Create, rotate, revoke secrets", sensitivityLevel: "high" },
  { id: "session.lock", name: "Lock Session", description: "Lock the current session", sensitivityLevel: "low" },
  { id: "session.unlock", name: "Unlock Session", description: "Unlock a locked session", sensitivityLevel: "medium" },
  { id: "session.switch", name: "Switch Session", description: "Switch to another user session", sensitivityLevel: "medium" },
  { id: "user.manage", name: "Manage Users", description: "Create, modify, delete user accounts", sensitivityLevel: "critical" },
  { id: "user.promote", name: "Promote User", description: "Change user role to admin", sensitivityLevel: "critical" },
  { id: "user.demote", name: "Demote User", description: "Change admin role to standard", sensitivityLevel: "critical" },
  { id: "security.baseline.change", name: "Change Security Baseline", description: "Modify system security baseline", sensitivityLevel: "critical" },
  { id: "system.settings.modify", name: "Modify System Settings", description: "Change system-wide settings", sensitivityLevel: "high" },
];

// ── Action Authorization Table ──────────────────────────────

export const ACTION_AUTHORIZATION_TABLE: ActionPolicy[] = [
  // WiFi
  { action: "wifi.toggle", displayName: "Toggle WiFi", requiredRole: "standard", requiredCapability: "wifi.toggle", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: true, auditSeverity: "info", description: "Enable or disable WiFi" },
  { action: "wifi.connect.open", displayName: "Connect to Open WiFi", requiredRole: "standard", requiredCapability: "wifi.connect.open", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Connect to an open network" },
  { action: "wifi.connect.secure", displayName: "Connect to Secure WiFi", requiredRole: "standard", requiredCapability: "wifi.connect.secure", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Connect to a password-protected network" },
  { action: "wifi.forget", displayName: "Forget WiFi Network", requiredRole: "standard", requiredCapability: "wifi.forget", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "warning", description: "Remove a saved network" },
  // Bluetooth
  { action: "bluetooth.toggle", displayName: "Toggle Bluetooth", requiredRole: "standard", requiredCapability: "bluetooth.toggle", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Enable or disable Bluetooth" },
  { action: "bluetooth.pair", displayName: "Pair Bluetooth Device", requiredRole: "standard", requiredCapability: "bluetooth.pair", elevationRequired: false, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "warning", description: "Pair a new Bluetooth device" },
  // Shield / VPN / Firewall
  { action: "shield.vpn.toggle", displayName: "Toggle VPN", requiredRole: "standard", requiredCapability: "shield.vpn.toggle", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Enable or disable VPN" },
  { action: "shield.vpn.configure", displayName: "Configure VPN", requiredRole: "admin", requiredCapability: "shield.vpn.configure", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Modify VPN settings" },
  { action: "shield.firewall.toggle", displayName: "Toggle Firewall", requiredRole: "admin", requiredCapability: "shield.firewall.toggle", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Toggle system firewall" },
  { action: "shield.firewall.disable", displayName: "Disable Firewall", requiredRole: "admin", requiredCapability: "shield.firewall.disable", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Fully disable firewall protection" },
  // Certificates
  { action: "cert.install.user", displayName: "Install User Certificate", requiredRole: "standard", requiredCapability: "cert.install.user", elevationRequired: false, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "warning", description: "Install user certificate" },
  { action: "cert.install.system", displayName: "Install System Certificate", requiredRole: "admin", requiredCapability: "cert.install.system", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Install root/system certificate" },
  // Power
  { action: "power.profile.set", displayName: "Set Power Profile", requiredRole: "standard", requiredCapability: "power.profile.set", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Change power profile" },
  { action: "power.shutdown", displayName: "Shutdown", requiredRole: "standard", requiredCapability: "power.shutdown", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "warning", description: "Shutdown the system" },
  // Audit
  { action: "audit.view", displayName: "View Audit Logs", requiredRole: "admin", requiredCapability: "audit.view", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "View system audit trail" },
  { action: "audit.export", displayName: "Export Audit Logs", requiredRole: "admin", requiredCapability: "audit.export", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Export audit logs" },
  // Secrets
  { action: "secrets.read.wifi", displayName: "Read WiFi Credentials", requiredRole: "admin", requiredCapability: "secrets.read.wifi", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Access WiFi credentials" },
  { action: "secrets.read.vpn", displayName: "Read VPN Keys", requiredRole: "admin", requiredCapability: "secrets.read.vpn", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Access VPN private keys" },
  // Session
  { action: "session.lock", displayName: "Lock Session", requiredRole: "guest", requiredCapability: "session.lock", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: true, auditSeverity: "info", description: "Lock the session" },
  { action: "session.unlock", displayName: "Unlock Session", requiredRole: "guest", requiredCapability: "session.unlock", elevationRequired: false, freshAuthRequired: true, lockedSessionAllowed: true, auditSeverity: "info", description: "Unlock the session" },
  // User management
  { action: "user.manage", displayName: "Manage Users", requiredRole: "admin", requiredCapability: "user.manage", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Manage user accounts" },
  { action: "user.promote", displayName: "Promote to Admin", requiredRole: "admin", requiredCapability: "user.promote", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Promote user to admin" },
  // Security
  { action: "security.baseline.change", displayName: "Change Security Baseline", requiredRole: "admin", requiredCapability: "security.baseline.change", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Change security baseline" },
  // Update
  { action: "update.check", displayName: "Check for Updates", requiredRole: "standard", requiredCapability: "system.settings.modify", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Check for system updates" },
  { action: "update.install", displayName: "Install Update", requiredRole: "admin", requiredCapability: "system.settings.modify", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Install system update" },
  { action: "update.rollback", displayName: "Rollback Update", requiredRole: "admin", requiredCapability: "system.settings.modify", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "critical", description: "Rollback to previous version" },
  { action: "update.channel.switch", displayName: "Switch Update Channel", requiredRole: "admin", requiredCapability: "system.settings.modify", elevationRequired: true, freshAuthRequired: true, lockedSessionAllowed: false, auditSeverity: "high", description: "Switch update release channel" },
  // Onboarding
  { action: "onboarding.start", displayName: "Start Onboarding", requiredRole: "guest", requiredCapability: "session.lock", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Start first-boot setup" },
  { action: "onboarding.complete", displayName: "Complete Onboarding", requiredRole: "standard", requiredCapability: "system.settings.modify", elevationRequired: false, freshAuthRequired: false, lockedSessionAllowed: false, auditSeverity: "info", description: "Complete first-boot setup" },
];

// ── Secrets ─────────────────────────────────────────────────

export type SecretType =
  | "wifi-psk"
  | "vpn-private-key"
  | "api-token"
  | "certificate-private-key"
  | "bluetooth-bond-key"
  | "app-credential"
  | "encryption-key"
  | "service-token";

export type KeyringScope = "system" | "user" | "service" | "ephemeral";

export interface SecretMetadata {
  secretId: string;
  type: SecretType;
  ownerScope: string; // "user:<id>" | "service:<name>" | "system"
  label: string;
  keyringId: string;
  createdAt: number;
  updatedAt: number;
  lastAccessedAt?: number;
  exportable: boolean;
  hardwareBacked: boolean;
  accessPolicyId?: string;
  version: number;
  revoked: boolean;
}

export interface Keyring {
  keyringId: string;
  scope: KeyringScope;
  protectionClass: "standard" | "enhanced" | "hardware";
  hardwareBacked: boolean;
  createdAt: number;
  rotatedAt: number;
  secretCount: number;
}

export interface SecretHandle {
  handleId: string;
  secretId: string;
  issuedAt: number;
  expiresAt: number;
  singleUse: boolean;
  consumed: boolean;
  authorizedService: string;
}

// ── Elevation & Approval ────────────────────────────────────

export interface ElevationRequest {
  requestId: string;
  sessionId: string;
  userId: string;
  action: string;
  targetService: string;
  requestedAt: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  impactDescription: string;
  requesterApp?: string;
}

export interface ElevationApprovalToken {
  tokenId: string;
  sessionId: string;
  userId: string;
  action: string;
  targetService: string;
  issuedAt: number;
  expiresAt: number;
  singleUse: boolean;
  consumed: boolean;
  nonce: string;
  signature: string;
}

// ── Audit Events ────────────────────────────────────────────

export type AuditSeverity = "info" | "warning" | "high" | "critical";
export type AuditDecision = "allowed" | "denied" | "elevated" | "failed";

export interface OSAuditEvent {
  eventId: string;
  timestamp: number;
  actorUserId: string;
  actorSessionId: string;
  actorService?: string;
  action: string;
  resource?: string;
  decision: AuditDecision;
  reason?: string;
  severity: AuditSeverity;
  correlationId: string;
  authMethod?: OSAuthMethod;
  metadata?: Record<string, unknown>;
}

// ── IPC Contracts ───────────────────────────────────────────

export type IPCResultStatus = "ok" | "denied" | "error" | "elevation-required" | "auth-required";

export interface IPCResult<T = unknown> {
  status: IPCResultStatus;
  data?: T;
  error?: string;
  auditEventId?: string;
}

export interface ControlCenterCommand {
  commandId: string;
  action: string;
  payload: Record<string, unknown>;
  callerSessionId: string;
  callerUserId: string;
  callerService?: string;
  timestamp: number;
}

// ── Auth Freshness ──────────────────────────────────────────

export const AUTH_FRESHNESS_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
export const ELEVATION_TOKEN_TTL_MS = 60 * 1000; // 60 seconds
export const SESSION_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const PIN_MIN_LENGTH = 4;
export const PASSWORD_MIN_LENGTH = 8;

// ── Role Hierarchy ──────────────────────────────────────────

const ROLE_HIERARCHY: Record<OSUserRole, number> = {
  guest: 0,
  standard: 1,
  admin: 2,
  system: 3,
};

export function hasRequiredRole(userRole: OSUserRole, requiredRole: OSUserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ── Default Capabilities by Role ────────────────────────────

export const DEFAULT_ROLE_CAPABILITIES: Record<OSUserRole, string[]> = {
  guest: [
    "session.lock", "session.unlock", "power.profile.set",
  ],
  standard: [
    "session.lock", "session.unlock", "power.profile.set", "power.shutdown", "power.reboot",
    "wifi.toggle", "wifi.connect.open", "wifi.connect.secure", "wifi.forget",
    "bluetooth.toggle", "bluetooth.pair", "bluetooth.unpair",
    "shield.vpn.toggle", "cert.install.user",
  ],
  admin: [
    "session.lock", "session.unlock", "session.switch", "power.profile.set", "power.shutdown", "power.reboot",
    "wifi.toggle", "wifi.connect.open", "wifi.connect.secure", "wifi.forget",
    "bluetooth.toggle", "bluetooth.pair", "bluetooth.unpair",
    "shield.vpn.toggle", "shield.vpn.configure", "shield.firewall.toggle", "shield.firewall.disable", "shield.firewall.rules",
    "cert.install.user", "cert.install.system", "cert.remove",
    "audit.view", "audit.export",
    "secrets.read.wifi", "secrets.read.vpn", "secrets.read.app", "secrets.manage",
    "user.manage", "user.promote", "user.demote",
    "security.baseline.change", "system.settings.modify",
  ],
  system: [
    ...CAPABILITY_REGISTRY.map(c => c.id),
  ],
};

// ═══════════════════════════════════════════════════════════════
// EXTENDED TYPES — Session Tokens, Secrets Lifecycle, Key Hierarchy
// ═══════════════════════════════════════════════════════════════

// ── Extended Session State ──────────────────────────────────

export type ExtendedSessionState =
  | "creating" | "active" | "inactive" | "locked"
  | "authenticating" | "terminating" | "resuming"
  | "suspended" | "expired" | "revoked";

export type SessionType = "local" | "guest" | "remote";

// ── Session Token Model ─────────────────────────────────────

export type SessionTokenClass =
  | "ui_session" | "privileged_action" | "broker"
  | "service_delegation" | "lockscreen_limited" | "fresh_auth";

export interface SessionToken {
  tokenId: string;
  sessionId: string;
  userId: string;
  audience: string;
  scopes: string[];
  issuedAt: number;
  expiresAt: number;
  sensitive: boolean;
  revoked: boolean;
  revokedAt?: number;
  keyId: string;
  signature: string;
  tokenClass: SessionTokenClass;
  nonce: string;
}

// ── Suspend / Resume / Idle Policy ──────────────────────────

export type SuspendLockMode = "always_lock" | "lock_after_threshold" | "never_lock";

export interface SuspendLockPolicy {
  mode: SuspendLockMode;
  thresholdMs: number;
  forceReauthSensitive: boolean;
}

export interface IdlePolicy {
  idleTimeoutMs: number;
  screensaverDelayMs: number;
  graceIntervalMs: number;
  autoLock: boolean;
}

// ── Lockscreen Action Matrix ────────────────────────────────

export type LockscreenDecision = "allowed" | "denied" | "conditional";

export interface LockscreenActionRule {
  action: string;
  displayName: string;
  decision: LockscreenDecision;
  policySource: string;
  authRequired: boolean;
  auditSeverity: AuditSeverity;
  condition?: string;
}

export const LOCKSCREEN_ACTION_MATRIX: LockscreenActionRule[] = [
  { action: "view.battery", displayName: "View Battery", decision: "allowed", policySource: "system-default", authRequired: false, auditSeverity: "info" },
  { action: "view.time", displayName: "View Time/Date", decision: "allowed", policySource: "system-default", authRequired: false, auditSeverity: "info" },
  { action: "view.connectivity", displayName: "View Connectivity", decision: "conditional", policySource: "policyd", authRequired: false, auditSeverity: "info", condition: "Limited info only" },
  { action: "media.controls", displayName: "Media Controls", decision: "conditional", policySource: "policyd", authRequired: false, auditSeverity: "info", condition: "Play/pause/skip only" },
  { action: "emergency.call", displayName: "Emergency Controls", decision: "allowed", policySource: "system-mandatory", authRequired: false, auditSeverity: "warning" },
  { action: "accessibility.tools", displayName: "Accessibility Tools", decision: "allowed", policySource: "system-mandatory", authRequired: false, auditSeverity: "info" },
  { action: "wifi.toggle", displayName: "Toggle WiFi", decision: "conditional", policySource: "policyd", authRequired: false, auditSeverity: "info", condition: "Policy-driven" },
  { action: "bluetooth.pair", displayName: "Pair Bluetooth", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "warning" },
  { action: "shield.firewall.disable", displayName: "Disable Firewall", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "critical" },
  { action: "cert.install", displayName: "Install Certificate", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "critical" },
  { action: "secrets.access", displayName: "Access Secrets", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "critical" },
  { action: "permission.prompt", displayName: "Approve Permissions", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "high" },
  { action: "user.files", displayName: "Access User Files", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "high" },
  { action: "notifications.full", displayName: "Full Notifications", decision: "denied", policySource: "privacy-policy", authRequired: true, auditSeverity: "info" },
  { action: "notifications.preview", displayName: "Notification Previews", decision: "conditional", policySource: "privacy-policy", authRequired: false, auditSeverity: "info", condition: "Sender only, no content" },
  { action: "camera.access", displayName: "Camera Access", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "high" },
  { action: "microphone.access", displayName: "Microphone Access", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "high" },
  { action: "location.access", displayName: "Location Access", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "high" },
  { action: "usb.mount", displayName: "Mount USB", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "warning" },
  { action: "vpn.toggle", displayName: "Toggle VPN", decision: "denied", policySource: "security-baseline", authRequired: true, auditSeverity: "warning" },
  { action: "power.shutdown", displayName: "Shutdown", decision: "conditional", policySource: "policyd", authRequired: false, auditSeverity: "warning", condition: "Policy-driven" },
  { action: "power.reboot", displayName: "Reboot", decision: "conditional", policySource: "policyd", authRequired: false, auditSeverity: "warning", condition: "Policy-driven" },
];

// ── Secret Status Lifecycle ─────────────────────────────────

export type SecretStatus = "active" | "revoked" | "soft_deleted" | "destroyed";

export interface SecretVersion {
  versionId: string;
  secretId: string;
  version: number;
  ciphertextRef: string;
  wrappingKeyId: string;
  createdAt: number;
  supersededAt?: number;
}

// ── Secret Access Policy Binding ────────────────────────────

export interface SecretAccessPolicyBinding {
  bindingId: string;
  secretType: SecretType;
  ownerScopePattern: string;
  allowedServices: string[];
  exportAllowed: boolean;
  hardwareRequired: boolean;
  rotationIntervalSec: number;
  maxHandleTtlMs: number;
}

export const DEFAULT_SECRET_POLICY_BINDINGS: SecretAccessPolicyBinding[] = [
  { bindingId: "pol-wifi", secretType: "wifi-psk", ownerScopePattern: "user:*", allowedServices: ["wifid", "controlcenterd"], exportAllowed: false, hardwareRequired: false, rotationIntervalSec: 0, maxHandleTtlMs: 30000 },
  { bindingId: "pol-vpn", secretType: "vpn-private-key", ownerScopePattern: "user:*", allowedServices: ["shieldd"], exportAllowed: false, hardwareRequired: true, rotationIntervalSec: 7776000, maxHandleTtlMs: 60000 },
  { bindingId: "pol-cert", secretType: "certificate-private-key", ownerScopePattern: "*", allowedServices: ["certd", "shieldd"], exportAllowed: false, hardwareRequired: true, rotationIntervalSec: 7776000, maxHandleTtlMs: 60000 },
  { bindingId: "pol-bt", secretType: "bluetooth-bond-key", ownerScopePattern: "system", allowedServices: ["btd"], exportAllowed: false, hardwareRequired: false, rotationIntervalSec: 0, maxHandleTtlMs: 10000 },
  { bindingId: "pol-api", secretType: "api-token", ownerScopePattern: "user:*", allowedServices: ["appmgr", "controlcenterd"], exportAllowed: true, hardwareRequired: false, rotationIntervalSec: 2592000, maxHandleTtlMs: 120000 },
  { bindingId: "pol-app", secretType: "app-credential", ownerScopePattern: "user:*", allowedServices: ["appmgr"], exportAllowed: false, hardwareRequired: false, rotationIntervalSec: 0, maxHandleTtlMs: 60000 },
  { bindingId: "pol-svc", secretType: "service-token", ownerScopePattern: "service:*", allowedServices: ["*"], exportAllowed: false, hardwareRequired: false, rotationIntervalSec: 86400, maxHandleTtlMs: 30000 },
  { bindingId: "pol-enc", secretType: "encryption-key", ownerScopePattern: "*", allowedServices: ["secretsd"], exportAllowed: false, hardwareRequired: true, rotationIntervalSec: 7776000, maxHandleTtlMs: 10000 },
];

// ── Secret Deletion Queue ───────────────────────────────────

export type SecretDeleteMode = "soft" | "secure_erase";

export interface SecretDeletionEntry {
  deletionId: string;
  secretId: string;
  deleteMode: SecretDeleteMode;
  scheduledAt: number;
  completedAt?: number;
  result?: "completed" | "failed";
}

// ── Enhanced Secret Handle ──────────────────────────────────

export type SecretOperation =
  | "decrypt" | "sign" | "derive" | "unwrap_temp"
  | "reveal_once" | "connect_auth" | "import_protected";

export interface EnhancedSecretHandle extends SecretHandle {
  allowedOperations: SecretOperation[];
  nonce: string;
  signature: string;
}

// ── TPM State ───────────────────────────────────────────────

export type TPMPosture = "hardware_sealed" | "software_fallback" | "degraded";

export interface TPMState {
  present: boolean;
  sealedKeys: string[];
  fallbackMode: boolean;
  postureFlag: TPMPosture;
  attestationAvailable: boolean;
  lastAttestationAt?: number;
}

// ── Key Hierarchy Visibility ────────────────────────────────

export interface KeyHierarchyNode {
  id: string;
  label: string;
  type: "root_device_key" | "kek" | "keyring_master" | "dek";
  parentId?: string;
  algorithm: string;
  createdAt: number;
  rotatedAt?: number;
  hardwareBacked: boolean;
  children?: KeyHierarchyNode[];
}

// ═══════════════════════════════════════════════════════════════
// EXTENDED TYPES — TPM Posture, IPC Contracts, Prompts, Threats
// ═══════════════════════════════════════════════════════════════

// ── Device Security Posture ─────────────────────────────────

export type PostureLevel = "hardware_backed" | "software_protected" | "degraded";

export interface DeviceSecurityPosture {
  secureHwPresent: boolean;
  secureBootEnabled: boolean;
  measuredBootOk: boolean;
  attestationSupported: boolean;
  systemKeyringHardwareBacked: boolean;
  userKeyringHardwareBacked: boolean;
  deviceRootSealed: boolean;
  hardwareRngAvailable: boolean;
  nonExportableKeySlots: number;
  degradedReason?: string;
  postureLevel: PostureLevel;
  lastVerifiedAt: number;
  pcrValues: Record<string, string>;
}

// ── Extended Service Identity ───────────────────────────────

export interface ExtendedServiceIdentity extends ServiceIdentity {
  signingIdentity: string;
  version: string;
  status: "active" | "suspended" | "revoked";
  policyProfileRef: string;
  lastVerifiedAt: number;
  trustLevel: "system" | "verified" | "unverified";
}

// ── Extended Action Policy ──────────────────────────────────

export interface ExtendedActionPolicy extends ActionPolicy {
  trustedPromptRequired: boolean;
  policyOverridable: boolean;
}

// ── IPC Contract System ─────────────────────────────────────

export type IPCIdempotency = "idempotent" | "not_idempotent" | "conditional";

export interface IPCContractSchema {
  fields: Array<{ name: string; type: string; required: boolean; description: string }>;
}

export interface IPCContract {
  method: string;
  displayName: string;
  description: string;
  requestSchema: IPCContractSchema;
  responseSchema: IPCContractSchema;
  errorCodes: Array<{ code: string; message: string; retryable: boolean }>;
  allowedCallers: string[];
  requiresSessionToken: boolean;
  requiresElevation: boolean;
  requiresFreshAuth: boolean;
  idempotency: IPCIdempotency;
  timeoutMs: number;
  retryPolicy: { maxRetries: number; backoffMs: number };
  auditEvents: string[];
  targetService: string;
}

export const IPC_CONTRACT_REGISTRY: IPCContract[] = [
  {
    method: "session.login", displayName: "Login", description: "Authenticate user and create session",
    requestSchema: { fields: [{ name: "userId", type: "string", required: true, description: "User ID" }, { name: "method", type: "OSAuthMethod", required: true, description: "Auth method" }, { name: "credential", type: "string", required: true, description: "Password/PIN" }] },
    responseSchema: { fields: [{ name: "sessionId", type: "string", required: true, description: "New session ID" }, { name: "tokenIds", type: "string[]", required: true, description: "Issued tokens" }] },
    errorCodes: [{ code: "AUTH_FAILED", message: "Invalid credentials", retryable: true }, { code: "LOCKED_OUT", message: "Account locked", retryable: false }],
    allowedCallers: ["lockscreen", "login-shell"], requiresSessionToken: false, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "not_idempotent", timeoutMs: 10000, retryPolicy: { maxRetries: 3, backoffMs: 1000 }, auditEvents: ["auth.login"], targetService: "authd",
  },
  {
    method: "session.lock", displayName: "Lock Session", description: "Lock current session",
    requestSchema: { fields: [{ name: "sessionId", type: "string", required: true, description: "Session to lock" }] },
    responseSchema: { fields: [{ name: "locked", type: "boolean", required: true, description: "Lock state" }] },
    errorCodes: [{ code: "SESSION_NOT_FOUND", message: "Session not found", retryable: false }],
    allowedCallers: ["controlcenterd", "lockscreen", "powerd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "idempotent", timeoutMs: 5000, retryPolicy: { maxRetries: 1, backoffMs: 500 }, auditEvents: ["session.lock"], targetService: "sessiond",
  },
  {
    method: "session.unlock", displayName: "Unlock Session", description: "Unlock locked session with credential",
    requestSchema: { fields: [{ name: "sessionId", type: "string", required: true, description: "Session to unlock" }, { name: "method", type: "OSAuthMethod", required: true, description: "Auth method" }, { name: "credential", type: "string", required: true, description: "Credential" }] },
    responseSchema: { fields: [{ name: "unlocked", type: "boolean", required: true, description: "Unlock result" }] },
    errorCodes: [{ code: "AUTH_FAILED", message: "Invalid credential", retryable: true }, { code: "RATE_LIMITED", message: "Too many attempts", retryable: false }],
    allowedCallers: ["lockscreen"], requiresSessionToken: false, requiresElevation: false, requiresFreshAuth: true,
    idempotency: "not_idempotent", timeoutMs: 10000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["auth.unlock"], targetService: "authd",
  },
  {
    method: "auth.verify", displayName: "Verify Credential", description: "Verify user credential without creating session",
    requestSchema: { fields: [{ name: "userId", type: "string", required: true, description: "User ID" }, { name: "credential", type: "string", required: true, description: "Credential" }] },
    responseSchema: { fields: [{ name: "valid", type: "boolean", required: true, description: "Verification result" }] },
    errorCodes: [{ code: "USER_NOT_FOUND", message: "User not found", retryable: false }],
    allowedCallers: ["controlcenterd", "promptd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "idempotent", timeoutMs: 5000, retryPolicy: { maxRetries: 2, backoffMs: 500 }, auditEvents: ["auth.verify"], targetService: "authd",
  },
  {
    method: "auth.begin_elevation", displayName: "Begin Elevation", description: "Start privilege elevation flow",
    requestSchema: { fields: [{ name: "sessionId", type: "string", required: true, description: "Session" }, { name: "action", type: "string", required: true, description: "Target action" }, { name: "credential", type: "string", required: true, description: "Admin credential" }] },
    responseSchema: { fields: [{ name: "token", type: "ElevationApprovalToken", required: true, description: "Short-lived approval token" }] },
    errorCodes: [{ code: "AUTH_FAILED", message: "Elevation auth failed", retryable: true }, { code: "NOT_ADMIN", message: "Admin role required", retryable: false }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: true,
    idempotency: "not_idempotent", timeoutMs: 30000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["elevation.begin"], targetService: "authd",
  },
  {
    method: "policy.check", displayName: "Check Policy", description: "Evaluate action authorization",
    requestSchema: { fields: [{ name: "action", type: "string", required: true, description: "Action to check" }, { name: "sessionId", type: "string", required: true, description: "Caller session" }] },
    responseSchema: { fields: [{ name: "allowed", type: "boolean", required: true, description: "Decision" }, { name: "reason", type: "string", required: true, description: "Explanation" }] },
    errorCodes: [{ code: "NO_POLICY", message: "No policy for action", retryable: false }],
    allowedCallers: ["controlcenterd", "any-service"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "idempotent", timeoutMs: 2000, retryPolicy: { maxRetries: 1, backoffMs: 200 }, auditEvents: ["policy.check"], targetService: "policyd",
  },
  {
    method: "secrets.put", displayName: "Store Secret", description: "Encrypt and store a secret",
    requestSchema: { fields: [{ name: "plaintext", type: "string", required: true, description: "Secret value" }, { name: "type", type: "SecretType", required: true, description: "Secret type" }, { name: "label", type: "string", required: true, description: "Display label" }] },
    responseSchema: { fields: [{ name: "secretId", type: "string", required: true, description: "New secret ID" }] },
    errorCodes: [{ code: "KEYRING_NOT_FOUND", message: "Keyring unavailable", retryable: false }],
    allowedCallers: ["controlcenterd", "wifid", "certd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "not_idempotent", timeoutMs: 5000, retryPolicy: { maxRetries: 1, backoffMs: 500 }, auditEvents: ["secrets.store"], targetService: "secretsd",
  },
  {
    method: "secrets.get_handle", displayName: "Get Secret Handle", description: "Issue opaque handle for secret access",
    requestSchema: { fields: [{ name: "secretId", type: "string", required: true, description: "Secret ID" }, { name: "operations", type: "SecretOperation[]", required: true, description: "Allowed ops" }] },
    responseSchema: { fields: [{ name: "handle", type: "EnhancedSecretHandle", required: true, description: "Opaque handle" }] },
    errorCodes: [{ code: "SECRET_NOT_FOUND", message: "Secret not found", retryable: false }, { code: "NOT_AUTHORIZED", message: "Service not authorized", retryable: false }],
    allowedCallers: ["wifid", "shieldd", "certd", "btd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "not_idempotent", timeoutMs: 5000, retryPolicy: { maxRetries: 1, backoffMs: 500 }, auditEvents: ["secrets.handle_issued"], targetService: "secretsd",
  },
  {
    method: "secrets.rotate", displayName: "Rotate Secret", description: "Replace secret with new version",
    requestSchema: { fields: [{ name: "secretId", type: "string", required: true, description: "Secret ID" }, { name: "newPlaintext", type: "string", required: true, description: "New value" }] },
    responseSchema: { fields: [{ name: "version", type: "number", required: true, description: "New version" }] },
    errorCodes: [{ code: "SECRET_NOT_ACTIVE", message: "Secret not active", retryable: false }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: true, requiresFreshAuth: true,
    idempotency: "not_idempotent", timeoutMs: 10000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["secrets.rotate"], targetService: "secretsd",
  },
  {
    method: "wifi.connect", displayName: "Connect WiFi", description: "Connect to wireless network",
    requestSchema: { fields: [{ name: "ssid", type: "string", required: true, description: "Network SSID" }, { name: "password", type: "string", required: false, description: "Network password" }] },
    responseSchema: { fields: [{ name: "connected", type: "boolean", required: true, description: "Connection result" }] },
    errorCodes: [{ code: "NETWORK_NOT_FOUND", message: "Network not found", retryable: true }, { code: "AUTH_REJECTED", message: "Password rejected", retryable: true }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "idempotent", timeoutMs: 30000, retryPolicy: { maxRetries: 2, backoffMs: 2000 }, auditEvents: ["wifi.connect"], targetService: "wifid",
  },
  {
    method: "shield.firewall.disable", displayName: "Disable Firewall", description: "Fully disable system firewall",
    requestSchema: { fields: [{ name: "reason", type: "string", required: false, description: "Reason for disable" }] },
    responseSchema: { fields: [{ name: "disabled", type: "boolean", required: true, description: "Firewall state" }] },
    errorCodes: [{ code: "POLICY_BLOCKED", message: "Blocked by lockdown policy", retryable: false }, { code: "ELEVATION_REQUIRED", message: "Admin elevation needed", retryable: false }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: true, requiresFreshAuth: true,
    idempotency: "idempotent", timeoutMs: 10000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["shield.firewall.disable"], targetService: "shieldd",
  },
  {
    method: "cert.install_root", displayName: "Install Root Certificate", description: "Import root/system CA certificate",
    requestSchema: { fields: [{ name: "certPem", type: "string", required: true, description: "Certificate PEM" }, { name: "privateKeyPem", type: "string", required: false, description: "Private key PEM" }] },
    responseSchema: { fields: [{ name: "certId", type: "string", required: true, description: "Installed cert ID" }] },
    errorCodes: [{ code: "INVALID_CERT", message: "Certificate validation failed", retryable: false }, { code: "TRUST_STORE_LOCKED", message: "Trust store modification blocked", retryable: false }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: true, requiresFreshAuth: true,
    idempotency: "not_idempotent", timeoutMs: 15000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["cert.install.system"], targetService: "certd",
  },
  {
    method: "secrets.unwrap_for_service", displayName: "Unwrap for Service", description: "Perform crypto operation via handle",
    requestSchema: { fields: [{ name: "handleId", type: "string", required: true, description: "Opaque handle ID" }, { name: "operation", type: "SecretOperation", required: true, description: "Crypto operation" }] },
    responseSchema: { fields: [{ name: "result", type: "string", required: true, description: "Operation result" }] },
    errorCodes: [{ code: "HANDLE_EXPIRED", message: "Handle expired", retryable: false }, { code: "HANDLE_CONSUMED", message: "Single-use handle consumed", retryable: false }],
    allowedCallers: ["wifid", "shieldd", "certd", "btd"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "conditional", timeoutMs: 5000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["secrets.unwrap"], targetService: "secretsd",
  },
  {
    method: "secrets.erase", displayName: "Erase Secret", description: "Securely destroy secret and all versions",
    requestSchema: { fields: [{ name: "secretId", type: "string", required: true, description: "Secret to erase" }] },
    responseSchema: { fields: [{ name: "erased", type: "boolean", required: true, description: "Erase result" }] },
    errorCodes: [{ code: "SECRET_NOT_FOUND", message: "Secret not found", retryable: false }],
    allowedCallers: ["controlcenterd"], requiresSessionToken: true, requiresElevation: true, requiresFreshAuth: true,
    idempotency: "idempotent", timeoutMs: 5000, retryPolicy: { maxRetries: 0, backoffMs: 0 }, auditEvents: ["secrets.erase"], targetService: "secretsd",
  },
  {
    method: "policy.explain", displayName: "Explain Policy", description: "Get detailed policy explanation for action",
    requestSchema: { fields: [{ name: "action", type: "string", required: true, description: "Action to explain" }] },
    responseSchema: { fields: [{ name: "policy", type: "ActionPolicy", required: false, description: "Matched policy" }, { name: "roles", type: "OSUserRole[]", required: true, description: "Eligible roles" }] },
    errorCodes: [],
    allowedCallers: ["controlcenterd", "settings-ui"], requiresSessionToken: true, requiresElevation: false, requiresFreshAuth: false,
    idempotency: "idempotent", timeoutMs: 2000, retryPolicy: { maxRetries: 1, backoffMs: 200 }, auditEvents: [], targetService: "policyd",
  },
];

// ── Trusted Prompt Types ────────────────────────────────────

export type PromptState = "idle" | "presenting" | "awaiting_input" | "processing" | "resolved" | "timed_out" | "cancelled";

export interface TrustedPromptConfig {
  promptId: string;
  requester: string;
  action: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  messaging: {
    title: string;
    body: string;
    riskExplanation: string;
    safeAlternative?: string;
  };
  supportedAuthMethods: OSAuthMethod[];
  timeoutMs: number;
  rememberAllowed: boolean;
  rememberMaxMinutes: number;
  screenReaderLabels: {
    promptRole: string;
    actionDescription: string;
    approveButton: string;
    denyButton: string;
  };
  remoteSessionRestricted: boolean;
}

export interface TrustedPromptResult {
  promptId: string;
  state: PromptState;
  approved: boolean;
  method?: OSAuthMethod;
  rememberedUntil?: number;
  resolvedAt: number;
}

// ── Failure Mode & Recovery ─────────────────────────────────

export type FailureCategory = "token" | "secret" | "tpm" | "audit" | "policy" | "prompt" | "session" | "service" | "boot";

export interface FailureMode {
  failureId: string;
  category: FailureCategory;
  name: string;
  userMessage: string;
  internalDetail: string;
  auditBehavior: "log_and_continue" | "log_and_deny" | "log_and_degrade";
  retryPolicy: { retryable: boolean; maxRetries: number; backoffMs: number };
  fallbackPath: string;
  degradedMode: boolean;
  recoveryNeeded: boolean;
  severity: AuditSeverity;
}

export const FAILURE_MODE_REGISTRY: FailureMode[] = [
  { failureId: "FM-001", category: "token", name: "Expired Elevation Token", userMessage: "Your approval has expired. Please try again.", internalDetail: "ElevationApprovalToken.expiresAt < now", auditBehavior: "log_and_deny", retryPolicy: { retryable: true, maxRetries: 2, backoffMs: 0 }, fallbackPath: "re-prompt elevation", degradedMode: false, recoveryNeeded: false, severity: "warning" },
  { failureId: "FM-002", category: "token", name: "Replayed Token", userMessage: "This approval has already been used.", internalDetail: "Token nonce already seen in replay cache", auditBehavior: "log_and_deny", retryPolicy: { retryable: false, maxRetries: 0, backoffMs: 0 }, fallbackPath: "re-prompt elevation", degradedMode: false, recoveryNeeded: false, severity: "high" },
  { failureId: "FM-003", category: "secret", name: "Corrupted Secret Metadata", userMessage: "A stored credential could not be verified. Please re-enter it.", internalDetail: "HMAC verification of secret metadata failed", auditBehavior: "log_and_deny", retryPolicy: { retryable: false, maxRetries: 0, backoffMs: 0 }, fallbackPath: "prompt user to re-store secret", degradedMode: false, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-004", category: "tpm", name: "TPM State Changed", userMessage: "Device security configuration has changed. Additional verification required.", internalDetail: "PCR values drifted from sealed baseline", auditBehavior: "log_and_degrade", retryPolicy: { retryable: false, maxRetries: 0, backoffMs: 0 }, fallbackPath: "software fallback with stronger auth", degradedMode: true, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-005", category: "tpm", name: "TPM Unavailable", userMessage: "Hardware security module is not responding.", internalDetail: "TPM HAL detect returned not_present", auditBehavior: "log_and_degrade", retryPolicy: { retryable: true, maxRetries: 3, backoffMs: 2000 }, fallbackPath: "software-only secure store", degradedMode: true, recoveryNeeded: false, severity: "high" },
  { failureId: "FM-006", category: "audit", name: "Audit Backend Unavailable", userMessage: "System logging is temporarily unavailable.", internalDetail: "auditd chain write failed", auditBehavior: "log_and_continue", retryPolicy: { retryable: true, maxRetries: 5, backoffMs: 1000 }, fallbackPath: "buffer events in memory", degradedMode: true, recoveryNeeded: false, severity: "high" },
  { failureId: "FM-007", category: "policy", name: "Policy Load Failure", userMessage: "Security policy could not be loaded. Default deny is active.", internalDetail: "policyd bundle validation failed", auditBehavior: "log_and_deny", retryPolicy: { retryable: true, maxRetries: 3, backoffMs: 1000 }, fallbackPath: "deny all sensitive actions", degradedMode: true, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-008", category: "prompt", name: "Prompt Broker Unavailable", userMessage: "Secure approval dialog is unavailable.", internalDetail: "promptd not responding", auditBehavior: "log_and_deny", retryPolicy: { retryable: true, maxRetries: 2, backoffMs: 500 }, fallbackPath: "deny elevation-required actions", degradedMode: false, recoveryNeeded: false, severity: "high" },
  { failureId: "FM-009", category: "session", name: "Inconsistent Session State", userMessage: "Your session state is invalid. Please log in again.", internalDetail: "Session state machine transition violation", auditBehavior: "log_and_deny", retryPolicy: { retryable: false, maxRetries: 0, backoffMs: 0 }, fallbackPath: "force logout", degradedMode: false, recoveryNeeded: false, severity: "high" },
  { failureId: "FM-010", category: "secret", name: "KEK Unavailable", userMessage: "Encryption keys are temporarily unavailable.", internalDetail: "Keyring KEK not found in hierarchy", auditBehavior: "log_and_deny", retryPolicy: { retryable: true, maxRetries: 2, backoffMs: 1000 }, fallbackPath: "block secret operations", degradedMode: true, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-011", category: "service", name: "Service Identity Verification Failed", userMessage: "A system service could not be verified.", internalDetail: "Service signing identity mismatch", auditBehavior: "log_and_deny", retryPolicy: { retryable: false, maxRetries: 0, backoffMs: 0 }, fallbackPath: "block service communication", degradedMode: false, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-012", category: "boot", name: "Partial System Boot", userMessage: "System started in limited mode.", internalDetail: "Not all security services initialized", auditBehavior: "log_and_degrade", retryPolicy: { retryable: true, maxRetries: 5, backoffMs: 2000 }, fallbackPath: "safe mode with limited services", degradedMode: true, recoveryNeeded: true, severity: "high" },
  { failureId: "FM-013", category: "secret", name: "Power Loss During Rotation", userMessage: "Key rotation was interrupted. Verifying integrity.", internalDetail: "Rotation transaction not committed", auditBehavior: "log_and_degrade", retryPolicy: { retryable: true, maxRetries: 1, backoffMs: 0 }, fallbackPath: "rollback to previous version", degradedMode: false, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-014", category: "session", name: "Lock Screen Unavailable", userMessage: "Screen lock is unavailable. Session will be terminated.", internalDetail: "Lockscreen compositor not responding", auditBehavior: "log_and_deny", retryPolicy: { retryable: true, maxRetries: 2, backoffMs: 500 }, fallbackPath: "force session termination", degradedMode: false, recoveryNeeded: true, severity: "critical" },
  { failureId: "FM-015", category: "service", name: "Auth Provider Fallback", userMessage: "Primary authentication unavailable. Using backup method.", internalDetail: "Biometric HAL not responding", auditBehavior: "log_and_continue", retryPolicy: { retryable: true, maxRetries: 3, backoffMs: 1000 }, fallbackPath: "password/PIN fallback", degradedMode: true, recoveryNeeded: false, severity: "warning" },
];

// ── Threat Model ────────────────────────────────────────────

export interface ThreatEntry {
  threatId: string;
  name: string;
  description: string;
  category: "escalation" | "spoofing" | "impersonation" | "theft" | "rollback" | "tampering" | "scraping" | "bruteforce" | "replay" | "compromise";
  severity: AuditSeverity;
  mitigation: string;
  residualRisk: string;
  monitoringSignal: string;
  mitigated: boolean;
}

export const THREAT_MODEL_REGISTRY: ThreatEntry[] = [
  { threatId: "T-001", name: "Unprivileged Escalation", description: "Local app attempts to gain admin privileges", category: "escalation", severity: "critical", mitigation: "RBAC + capability checks + elevation tokens with TTL", residualRisk: "Zero-day in policyd", monitoringSignal: "Repeated elevation denials from same PID", mitigated: true },
  { threatId: "T-002", name: "Spoofed UI Prompt", description: "Malicious app imitates elevation prompt to steal credentials", category: "spoofing", severity: "critical", mitigation: "Trusted compositor path — only promptd can render elevation UI", residualRisk: "Compositor vulnerability", monitoringSignal: "Prompt render from non-promptd source", mitigated: true },
  { threatId: "T-003", name: "Service Impersonation", description: "Malicious process claims to be a system service", category: "impersonation", severity: "high", mitigation: "Service identity registry with signing verification", residualRisk: "Compromised signing key", monitoringSignal: "Service identity verification failures", mitigated: true },
  { threatId: "T-004", name: "Stolen Device (No Creds)", description: "Physical device theft without user credentials", category: "theft", severity: "high", mitigation: "FDE + TPM-sealed keys + lockscreen + auto-lock", residualRisk: "Cold boot attack on DRAM", monitoringSignal: "Failed unlock attempts from new location", mitigated: true },
  { threatId: "T-005", name: "Stolen Device (No TPM)", description: "Device theft where no TPM is present", category: "theft", severity: "high", mitigation: "Software FDE + strong passphrase + degraded-security flag", residualRisk: "Offline brute-force of passphrase", monitoringSignal: "Device posture: no TPM", mitigated: true },
  { threatId: "T-006", name: "Config Rollback Attack", description: "Attacker rolls back signed config to weaker version", category: "rollback", severity: "high", mitigation: "Monotonic version counter + signed policy bundles", residualRisk: "Version counter reset via flash", monitoringSignal: "Policy version decrease detected", mitigated: true },
  { threatId: "T-007", name: "Audit Tampering", description: "Attacker modifies audit log to hide activity", category: "tampering", severity: "critical", mitigation: "Hash-chained append-only log + log sealing checkpoints", residualRisk: "Full system compromise before first seal", monitoringSignal: "Chain integrity verification failure", mitigated: true },
  { threatId: "T-008", name: "Memory Scraping", description: "Extracting plaintext secrets from process memory", category: "scraping", severity: "high", mitigation: "SecureBuffer zeroization + handle pattern + minimal exposure time", residualRisk: "Kernel-level memory dump", monitoringSignal: "Unexpected ptrace attach to secretsd", mitigated: true },
  { threatId: "T-009", name: "Brute Force Unlock", description: "Automated attempts to guess lock screen credential", category: "bruteforce", severity: "high", mitigation: "Rate limiting + exponential backoff + account lockout", residualRisk: "Side-channel timing attack", monitoringSignal: "Rapid auth failure rate", mitigated: true },
  { threatId: "T-010", name: "Session Token Replay", description: "Attacker replays captured session/elevation token", category: "replay", severity: "critical", mitigation: "Nonce uniqueness + single-use tokens + short TTL", residualRisk: "Token capture within TTL window", monitoringSignal: "Duplicate nonce detection", mitigated: true },
  { threatId: "T-011", name: "Compromised Update", description: "Malicious or tampered system update package", category: "compromise", severity: "critical", mitigation: "Code signing verification + measured boot + rollback protection", residualRisk: "Compromised signing infrastructure", monitoringSignal: "Signature verification failure on update", mitigated: true },
];

// ── Audit Sealing Checkpoint ────────────────────────────────

export interface AuditSealingCheckpoint {
  checkpointId: string;
  sealedAt: number;
  startIndex: number;
  endIndex: number;
  entriesCount: number;
  chainHash: string;
  previousCheckpointHash?: string;
}

// ── Service Startup Dependencies ────────────────────────────

export const SERVICE_BOOT_ORDER: Array<{ service: string; phase: number; canDegraded: boolean; hardFail: boolean }> = [
  { service: "auditd", phase: 0, canDegraded: true, hardFail: false },
  { service: "secretsd", phase: 0, canDegraded: false, hardFail: true },
  { service: "authd", phase: 1, canDegraded: false, hardFail: true },
  { service: "policyd", phase: 1, canDegraded: true, hardFail: false },
  { service: "sessiond", phase: 2, canDegraded: false, hardFail: true },
  { service: "promptd", phase: 2, canDegraded: true, hardFail: false },
  { service: "controlcenterd", phase: 3, canDegraded: false, hardFail: true },
  { service: "wifid", phase: 4, canDegraded: true, hardFail: false },
  { service: "btd", phase: 4, canDegraded: true, hardFail: false },
  { service: "shieldd", phase: 4, canDegraded: true, hardFail: false },
  { service: "certd", phase: 4, canDegraded: true, hardFail: false },
  { service: "powerd", phase: 4, canDegraded: true, hardFail: false },
  { service: "notifyd", phase: 5, canDegraded: true, hardFail: false },
];

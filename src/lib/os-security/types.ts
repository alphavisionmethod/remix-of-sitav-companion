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
    // Admin inherits all standard + additional
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
    // System has all capabilities
    ...CAPABILITY_REGISTRY.map(c => c.id),
  ],
};

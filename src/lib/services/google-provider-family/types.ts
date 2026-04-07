// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family Types
// Canonical type definitions for Google identity + connector arch
// ═══════════════════════════════════════════════════════════════

/** Google capability keys — strict enum */
export type GoogleCapabilityKey =
  | "google_identity"
  | "google_drive"
  | "google_gmail"
  | "google_calendar"
  | "google_docs"
  | "google_contacts"
  | "google_tasks";

/** OAuth client purpose */
export type GoogleOAuthClientPurpose =
  | "identity_web"
  | "connector_web"
  | "mobile_ios"
  | "mobile_android"
  | "internal_test";

/** Scope tier — least privilege model */
export type ScopeTier = "minimal" | "read_only" | "read_write" | "elevated" | "full";

/** Connection status for a Google service */
export type GoogleConnectionStatus = "connected" | "disconnected" | "error" | "reauth_needed" | "pending";

/** Health status */
export type GoogleHealthStatus = "healthy" | "degraded" | "error" | "unknown";

/** Launch stage */
export type GoogleLaunchStage = "planned" | "alpha" | "beta" | "production" | "deprecated";

/** Reality mode */
export type GoogleRealityMode = "real" | "demo" | "internal_test";

// ── Google Identity ──────────────────────────────────────────

export interface GoogleIdentityState {
  /** Whether Google is the sign-in provider */
  signedInWithGoogle: boolean;
  /** The linked email */
  email: string | null;
  /** Whether this is the primary identity */
  primaryIdentity: boolean;
  /** Link ID in identity_provider_links */
  linkId: string | null;
  /** Provider family ID */
  providerFamilyId: string | null;
  /** Launch stage */
  launchStage: GoogleLaunchStage;
}

// ── Google Connector ─────────────────────────────────────────

export interface GoogleConnectorState {
  capabilityKey: GoogleCapabilityKey;
  displayName: string;
  connectionStatus: GoogleConnectionStatus;
  healthStatus: GoogleHealthStatus;
  permissionLevel: ScopeTier;
  grantedScopes: string[];
  reauthNeeded: boolean;
  lastSyncAt: string | null;
  mode: GoogleRealityMode;
  launchStage: GoogleLaunchStage;
  upgradeAvailable: boolean;
  serviceAccountId: string | null;
}

// ── Google Provider Family Overview ──────────────────────────

export interface GoogleProviderFamilyState {
  familyId: string | null;
  familyName: "Google";
  providerKey: "google";
  launchStage: GoogleLaunchStage;
  identity: GoogleIdentityState;
  connectors: GoogleConnectorState[];
  oauthClients: GoogleOAuthClientInfo[];
  scopePolicies: GoogleScopePolicyEntry[];
  launchHonesty: GoogleLaunchHonestyEntry[];
  realityMode: GoogleRealityMode;
  loaded: boolean;
}

export interface GoogleOAuthClientInfo {
  id: string;
  clientName: string;
  purpose: GoogleOAuthClientPurpose;
  allowedCapabilities: GoogleCapabilityKey[];
  environment: string;
  launchStage: GoogleLaunchStage;
  active: boolean;
}

export interface GoogleScopePolicyEntry {
  capabilityKey: GoogleCapabilityKey;
  displayName: string;
  minimumScopes: string[];
  optionalScopes: string[];
  disallowedScopes: string[];
  defaultGrantProfile: ScopeTier;
  upgradePathAvailable: boolean;
  approvalRequired: boolean;
}

export interface GoogleLaunchHonestyEntry {
  capabilityKey: GoogleCapabilityKey;
  displayName: string;
  launchLabel: string;
  blockers: string[];
  publicClaimSafe: boolean;
  qualifierRequired: boolean;
}

// ── Scope Definitions (canonical) ────────────────────────────

export const GOOGLE_IDENTITY_SCOPES = ["openid", "email", "profile"] as const;

export const GOOGLE_DRIVE_SCOPES = {
  minimal: ["https://www.googleapis.com/auth/drive.metadata.readonly"],
  read_only: ["https://www.googleapis.com/auth/drive.readonly"],
  read_write: ["https://www.googleapis.com/auth/drive.file"],
  elevated: ["https://www.googleapis.com/auth/drive"],
} as const;

export const GOOGLE_GMAIL_SCOPES = {
  minimal: ["https://www.googleapis.com/auth/gmail.metadata"],
  read_only: ["https://www.googleapis.com/auth/gmail.readonly"],
  read_write: ["https://www.googleapis.com/auth/gmail.send"],
  elevated: ["https://www.googleapis.com/auth/gmail.modify"],
  disallowed: ["https://mail.google.com/"],
} as const;

export const GOOGLE_CALENDAR_SCOPES = {
  minimal: ["https://www.googleapis.com/auth/calendar.readonly"],
  read_only: ["https://www.googleapis.com/auth/calendar.readonly"],
  read_write: ["https://www.googleapis.com/auth/calendar.events"],
  elevated: ["https://www.googleapis.com/auth/calendar"],
} as const;

// ── Google API Registry (which APIs need enabling) ───────────

export const GOOGLE_API_REQUIREMENTS: Record<GoogleCapabilityKey, {
  apiName: string;
  apiDisplayName: string;
  consoleUrl: string;
  required: boolean;
}[]> = {
  google_identity: [],
  google_drive: [{ apiName: "drive.googleapis.com", apiDisplayName: "Google Drive API", consoleUrl: "https://console.cloud.google.com/apis/library/drive.googleapis.com", required: true }],
  google_gmail: [{ apiName: "gmail.googleapis.com", apiDisplayName: "Gmail API", consoleUrl: "https://console.cloud.google.com/apis/library/gmail.googleapis.com", required: true }],
  google_calendar: [{ apiName: "calendar-json.googleapis.com", apiDisplayName: "Google Calendar API", consoleUrl: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com", required: true }],
  google_docs: [{ apiName: "docs.googleapis.com", apiDisplayName: "Google Docs API", consoleUrl: "https://console.cloud.google.com/apis/library/docs.googleapis.com", required: true }],
  google_contacts: [{ apiName: "people.googleapis.com", apiDisplayName: "People API", consoleUrl: "https://console.cloud.google.com/apis/library/people.googleapis.com", required: true }],
  google_tasks: [{ apiName: "tasks.googleapis.com", apiDisplayName: "Tasks API", consoleUrl: "https://console.cloud.google.com/apis/library/tasks.googleapis.com", required: true }],
};

// ── OAuth Client Template ────────────────────────────────────

export const GOOGLE_OAUTH_CLIENT_TEMPLATES = {
  identity_web: {
    name: "SITA Web Auth",
    purpose: "identity_web" as const,
    applicationType: "Web application",
    capabilities: ["google_identity"] as GoogleCapabilityKey[],
    scopes: [...GOOGLE_IDENTITY_SCOPES],
    notes: "Used ONLY for Google Sign-In via Supabase Auth. Never for connector access.",
  },
  connector_web: {
    name: "SITA Web Connector Access",
    purpose: "connector_web" as const,
    applicationType: "Web application",
    capabilities: ["google_drive", "google_gmail", "google_calendar"] as GoogleCapabilityKey[],
    scopes: [], // scopes are per-connector, not pre-mixed
    notes: "Separate client for Google data services. Scopes requested per-connector.",
  },
  mobile_ios: {
    name: "SITA iOS Auth",
    purpose: "mobile_ios" as const,
    applicationType: "iOS",
    capabilities: ["google_identity"] as GoogleCapabilityKey[],
    scopes: [...GOOGLE_IDENTITY_SCOPES],
    notes: "Future: iOS native Google sign-in.",
  },
  mobile_android: {
    name: "SITA Android Auth",
    purpose: "mobile_android" as const,
    applicationType: "Android",
    capabilities: ["google_identity"] as GoogleCapabilityKey[],
    scopes: [...GOOGLE_IDENTITY_SCOPES],
    notes: "Future: Android native Google sign-in.",
  },
} as const;


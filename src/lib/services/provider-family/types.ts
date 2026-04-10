// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic Provider Family Types
// Multi-provider support for Apple, Microsoft, Stripe, Slack, Dropbox
// ═══════════════════════════════════════════════════════════════

/** All supported provider family keys */
export type ProviderFamilyKey =
  | "google"
  | "apple"
  | "microsoft"
  | "stripe"
  | "slack"
  | "dropbox";

/** Provider family category */
export type ProviderFamilyCategory =
  | "identity_and_connector"  // Google, Apple, Microsoft
  | "connector_only"          // Stripe, Slack, Dropbox
  | "identity_only";          // future

/** Generic connection status */
export type GenericConnectionStatus = "connected" | "disconnected" | "error" | "reauth_needed" | "pending";

/** Generic health status */
export type GenericHealthStatus = "healthy" | "degraded" | "error" | "unknown";

/** Generic launch stage */
export type GenericLaunchStage = "planned" | "alpha" | "beta" | "production" | "deprecated";

/** Generic reality mode */
export type GenericRealityMode = "real" | "demo" | "internal_test";

/** Generic scope tier */
export type GenericScopeTier = "minimal" | "read_only" | "read_write" | "elevated" | "full";

/** Generic OAuth client purpose */
export type GenericOAuthClientPurpose =
  | "identity_web"
  | "identity_mobile_ios"
  | "identity_mobile_android"
  | "connector_web"
  | "connector_mobile_ios"
  | "connector_mobile_android"
  | "internal_test"
  | "other";

// ── Generic Identity State ───────────────────────────────────

export interface GenericIdentityState {
  signedIn: boolean;
  email: string | null;
  primaryIdentity: boolean;
  linkId: string | null;
  providerFamilyId: string | null;
  launchStage: GenericLaunchStage;
}

// ── Generic Connector State ─────────────────────────────────

export interface GenericConnectorState {
  capabilityKey: string;
  displayName: string;
  connectionStatus: GenericConnectionStatus;
  healthStatus: GenericHealthStatus;
  permissionLevel: GenericScopeTier;
  grantedScopes: string[];
  reauthNeeded: boolean;
  lastSyncAt: string | null;
  mode: GenericRealityMode;
  launchStage: GenericLaunchStage;
  upgradeAvailable: boolean;
  serviceAccountId: string | null;
}

// ── Generic Provider Family State ───────────────────────────

export interface GenericProviderFamilyState {
  familyId: string | null;
  familyKey: ProviderFamilyKey;
  familyName: string;
  category: ProviderFamilyCategory;
  launchStage: GenericLaunchStage;
  identity: GenericIdentityState | null;
  connectors: GenericConnectorState[];
  realityMode: GenericRealityMode;
  loaded: boolean;
}

// ── Provider Family Display Config ──────────────────────────

export interface ProviderFamilyDisplayConfig {
  key: ProviderFamilyKey;
  name: string;
  category: ProviderFamilyCategory;
  icon: string; // lucide icon name
  color: string; // tailwind color class
  identityCapable: boolean;
  connectorCapabilities: string[];
  launchStage: GenericLaunchStage;
  description: string;
}

/** Canonical provider family display configs */
export const PROVIDER_FAMILY_CONFIGS: Record<ProviderFamilyKey, ProviderFamilyDisplayConfig> = {
  google: {
    key: "google",
    name: "Google",
    category: "identity_and_connector",
    icon: "Globe",
    color: "text-blue-500",
    identityCapable: true,
    connectorCapabilities: ["google_drive", "google_gmail", "google_calendar"],
    launchStage: "beta",
    description: "Sign-in, Drive, Gmail, Calendar",
  },
  apple: {
    key: "apple",
    name: "Apple",
    category: "identity_and_connector",
    icon: "Smartphone",
    color: "text-foreground",
    identityCapable: true,
    connectorCapabilities: ["apple_health", "apple_device_trust"],
    launchStage: "planned",
    description: "Sign-in, HealthKit, Device Trust",
  },
  microsoft: {
    key: "microsoft",
    name: "Microsoft",
    category: "identity_and_connector",
    icon: "Monitor",
    color: "text-blue-600",
    identityCapable: true,
    connectorCapabilities: ["microsoft_outlook", "microsoft_calendar", "microsoft_onedrive"],
    launchStage: "planned",
    description: "Sign-in, Outlook, Calendar, OneDrive",
  },
  stripe: {
    key: "stripe",
    name: "Stripe",
    category: "connector_only",
    icon: "DollarSign",
    color: "text-purple-500",
    identityCapable: false,
    connectorCapabilities: ["stripe_payments", "stripe_billing"],
    launchStage: "planned",
    description: "Payments, Billing, Revenue",
  },
  slack: {
    key: "slack",
    name: "Slack",
    category: "connector_only",
    icon: "MessageSquare",
    color: "text-pink-500",
    identityCapable: false,
    connectorCapabilities: ["slack_messaging", "slack_channels"],
    launchStage: "planned",
    description: "Messaging, Channels, Notifications",
  },
  dropbox: {
    key: "dropbox",
    name: "Dropbox",
    category: "connector_only",
    icon: "HardDrive",
    color: "text-blue-400",
    identityCapable: false,
    connectorCapabilities: ["dropbox_files"],
    launchStage: "planned",
    description: "File Storage, Sync",
  },
};

/** Core architectural rule: identity NEVER implies connector */
export function doesIdentityImplyConnectorGeneric(): boolean {
  return false;
}

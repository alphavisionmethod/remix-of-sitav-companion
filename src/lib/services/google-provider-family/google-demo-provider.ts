// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Demo Provider
// Demo/internal_test mode data for Google provider family
// ═══════════════════════════════════════════════════════════════

import type {
  GoogleProviderFamilyState,
  GoogleIdentityState,
  GoogleConnectorState,
  GoogleOAuthClientInfo,
  GoogleScopePolicyEntry,
  GoogleLaunchHonestyEntry,
  GoogleRealityMode,
} from "./types";
import {
  GOOGLE_IDENTITY_SCOPES,
  GOOGLE_DRIVE_SCOPES,
  GOOGLE_GMAIL_SCOPES,
  GOOGLE_CALENDAR_SCOPES,
} from "./types";

const IDENTITY: GoogleIdentityState = {
  signedInWithGoogle: true,
  email: "alex@sita.os",
  primaryIdentity: true,
  linkId: "demo-identity-link-001",
  providerFamilyId: "demo-google-family",
  launchStage: "alpha",
};

const CONNECTORS: GoogleConnectorState[] = [
  {
    capabilityKey: "google_drive",
    displayName: "Google Drive",
    connectionStatus: "connected",
    healthStatus: "healthy",
    permissionLevel: "read_only",
    grantedScopes: [...GOOGLE_DRIVE_SCOPES.read_only],
    reauthNeeded: false,
    lastSyncAt: new Date(Date.now() - 1800000).toISOString(),
    mode: "demo",
    launchStage: "planned",
    upgradeAvailable: true,
    serviceAccountId: "demo-svc-drive-001",
  },
  {
    capabilityKey: "google_gmail",
    displayName: "Gmail",
    connectionStatus: "connected",
    healthStatus: "healthy",
    permissionLevel: "read_only",
    grantedScopes: [...GOOGLE_GMAIL_SCOPES.read_only],
    reauthNeeded: false,
    lastSyncAt: new Date(Date.now() - 600000).toISOString(),
    mode: "demo",
    launchStage: "planned",
    upgradeAvailable: true,
    serviceAccountId: "demo-svc-gmail-001",
  },
  {
    capabilityKey: "google_calendar",
    displayName: "Google Calendar",
    connectionStatus: "disconnected",
    healthStatus: "unknown",
    permissionLevel: "minimal",
    grantedScopes: [],
    reauthNeeded: false,
    lastSyncAt: null,
    mode: "demo",
    launchStage: "planned",
    upgradeAvailable: false,
    serviceAccountId: null,
  },
];

const OAUTH_CLIENTS: GoogleOAuthClientInfo[] = [
  { id: "demo-client-auth", clientName: "SITA Web Auth", purpose: "identity_web", allowedCapabilities: ["google_identity"], environment: "production", launchStage: "alpha", active: true },
  { id: "demo-client-conn", clientName: "SITA Web Connector Access", purpose: "connector_web", allowedCapabilities: ["google_drive", "google_gmail", "google_calendar"], environment: "production", launchStage: "planned", active: true },
  { id: "demo-client-ios", clientName: "SITA iOS Auth", purpose: "mobile_ios", allowedCapabilities: ["google_identity"], environment: "production", launchStage: "planned", active: false },
  { id: "demo-client-android", clientName: "SITA Android Auth", purpose: "mobile_android", allowedCapabilities: ["google_identity"], environment: "production", launchStage: "planned", active: false },
];

const SCOPE_POLICIES: GoogleScopePolicyEntry[] = [
  { capabilityKey: "google_identity", displayName: "Google Sign-In", minimumScopes: [...GOOGLE_IDENTITY_SCOPES], optionalScopes: [], disallowedScopes: [], defaultGrantProfile: "minimal", upgradePathAvailable: false, approvalRequired: false },
  { capabilityKey: "google_drive", displayName: "Google Drive", minimumScopes: [...GOOGLE_DRIVE_SCOPES.minimal], optionalScopes: [...GOOGLE_DRIVE_SCOPES.read_only, ...GOOGLE_DRIVE_SCOPES.read_write, ...GOOGLE_DRIVE_SCOPES.elevated], disallowedScopes: [], defaultGrantProfile: "read_only", upgradePathAvailable: true, approvalRequired: false },
  { capabilityKey: "google_gmail", displayName: "Gmail", minimumScopes: [...GOOGLE_GMAIL_SCOPES.minimal], optionalScopes: [...GOOGLE_GMAIL_SCOPES.read_only, ...GOOGLE_GMAIL_SCOPES.read_write, ...GOOGLE_GMAIL_SCOPES.elevated], disallowedScopes: [...GOOGLE_GMAIL_SCOPES.disallowed], defaultGrantProfile: "read_only", upgradePathAvailable: true, approvalRequired: true },
  { capabilityKey: "google_calendar", displayName: "Google Calendar", minimumScopes: [...GOOGLE_CALENDAR_SCOPES.minimal], optionalScopes: [...GOOGLE_CALENDAR_SCOPES.read_write, ...GOOGLE_CALENDAR_SCOPES.elevated], disallowedScopes: [], defaultGrantProfile: "read_only", upgradePathAvailable: true, approvalRequired: false },
];

const LAUNCH_HONESTY: GoogleLaunchHonestyEntry[] = [
  { capabilityKey: "google_identity", displayName: "Google Sign-In", launchLabel: "alpha", blockers: [], publicClaimSafe: true, qualifierRequired: true },
  { capabilityKey: "google_drive", displayName: "Google Drive", launchLabel: "shell_only", blockers: ["OAuth client not configured", "Connector not built", "Token lifecycle not implemented"], publicClaimSafe: false, qualifierRequired: true },
  { capabilityKey: "google_gmail", displayName: "Gmail", launchLabel: "shell_only", blockers: ["OAuth client not configured", "Connector not built", "Send scope governance pending"], publicClaimSafe: false, qualifierRequired: true },
  { capabilityKey: "google_calendar", displayName: "Google Calendar", launchLabel: "planned", blockers: ["Not yet designed", "OAuth client not configured", "Calendar API not enabled"], publicClaimSafe: false, qualifierRequired: true },
];

/**
 * Returns a fully populated demo state for the Google Provider Family.
 * Used when reality mode is "demo" or "internal_test".
 */
export function getGoogleDemoState(mode: GoogleRealityMode = "demo"): GoogleProviderFamilyState {
  return {
    familyId: "demo-google-family",
    familyName: "Google",
    providerKey: "google",
    launchStage: "alpha",
    identity: IDENTITY,
    connectors: CONNECTORS.map((c) => ({ ...c, mode })),
    oauthClients: OAUTH_CLIENTS,
    scopePolicies: SCOPE_POLICIES,
    launchHonesty: LAUNCH_HONESTY,
    realityMode: mode,
    loaded: true,
  };
}


// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family Tests
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  GOOGLE_IDENTITY_SCOPES,
  GOOGLE_DRIVE_SCOPES,
  GOOGLE_GMAIL_SCOPES,
  GOOGLE_CALENDAR_SCOPES,
  GOOGLE_API_REQUIREMENTS,
  GOOGLE_OAUTH_CLIENT_TEMPLATES,
  type GoogleCapabilityKey,
  type GoogleOAuthClientInfo,
  type GoogleScopePolicyEntry,
} from "@/lib/services/google-provider-family/types";
import {
  doesIdentityImplyConnector,
  resolveOAuthClient,
  isScopeUpgradeSafe,
} from "@/lib/services/google-provider-family/google-provider-family.service";
import { getGoogleDemoState } from "@/lib/services/google-provider-family/google-demo-provider";

// ── Core Architecture Rule ───────────────────────────────────

describe("Google Provider Family — Core Architecture", () => {
  it("identity NEVER implies connector access", () => {
    expect(doesIdentityImplyConnector()).toBe(false);
  });

  it("identity scopes contain only openid, email, profile", () => {
    expect(GOOGLE_IDENTITY_SCOPES).toEqual(["openid", "email", "profile"]);
    expect(GOOGLE_IDENTITY_SCOPES).not.toContain("https://www.googleapis.com/auth/drive");
    expect(GOOGLE_IDENTITY_SCOPES).not.toContain("https://www.googleapis.com/auth/gmail");
  });

  it("identity client template has only google_identity capability", () => {
    const template = GOOGLE_OAUTH_CLIENT_TEMPLATES.identity_web;
    expect(template.capabilities).toEqual(["google_identity"]);
    expect(template.capabilities).not.toContain("google_drive");
    expect(template.capabilities).not.toContain("google_gmail");
    expect(template.capabilities).not.toContain("google_calendar");
  });

  it("connector client template has only connector capabilities", () => {
    const template = GOOGLE_OAUTH_CLIENT_TEMPLATES.connector_web;
    expect(template.capabilities).toContain("google_drive");
    expect(template.capabilities).toContain("google_gmail");
    expect(template.capabilities).toContain("google_calendar");
    expect(template.capabilities).not.toContain("google_identity");
  });
});

// ── Scope Tiers ──────────────────────────────────────────────

describe("Google Provider Family — Scope Tiers", () => {
  it("Drive has 4 tiers from minimal to elevated", () => {
    expect(GOOGLE_DRIVE_SCOPES.minimal.length).toBeGreaterThan(0);
    expect(GOOGLE_DRIVE_SCOPES.read_only.length).toBeGreaterThan(0);
    expect(GOOGLE_DRIVE_SCOPES.read_write.length).toBeGreaterThan(0);
    expect(GOOGLE_DRIVE_SCOPES.elevated.length).toBeGreaterThan(0);
  });

  it("Gmail has disallowed scopes", () => {
    expect(GOOGLE_GMAIL_SCOPES.disallowed).toContain("https://mail.google.com/");
  });

  it("Gmail minimal is metadata only", () => {
    expect(GOOGLE_GMAIL_SCOPES.minimal).toEqual(["https://www.googleapis.com/auth/gmail.metadata"]);
  });

  it("Calendar minimal is read-only", () => {
    expect(GOOGLE_CALENDAR_SCOPES.minimal).toEqual(["https://www.googleapis.com/auth/calendar.readonly"]);
  });
});

// ── API Requirements ─────────────────────────────────────────

describe("Google Provider Family — API Requirements", () => {
  it("identity requires NO additional APIs", () => {
    expect(GOOGLE_API_REQUIREMENTS.google_identity).toEqual([]);
  });

  it("Drive requires Google Drive API", () => {
    expect(GOOGLE_API_REQUIREMENTS.google_drive.length).toBe(1);
    expect(GOOGLE_API_REQUIREMENTS.google_drive[0].apiName).toBe("drive.googleapis.com");
  });

  it("Gmail requires Gmail API", () => {
    expect(GOOGLE_API_REQUIREMENTS.google_gmail[0].apiName).toBe("gmail.googleapis.com");
  });

  it("Calendar requires Calendar API", () => {
    expect(GOOGLE_API_REQUIREMENTS.google_calendar[0].apiName).toContain("calendar");
  });
});

// ── OAuth Client Resolution ──────────────────────────────────

describe("Google Provider Family — OAuth Client Resolution", () => {
  const mockClients: GoogleOAuthClientInfo[] = [
    { id: "c1", clientName: "Auth", purpose: "identity_web", allowedCapabilities: ["google_identity"], environment: "production", launchStage: "alpha", active: true },
    { id: "c2", clientName: "Connector", purpose: "connector_web", allowedCapabilities: ["google_drive", "google_gmail", "google_calendar"], environment: "production", launchStage: "planned", active: true },
    { id: "c3", clientName: "iOS", purpose: "mobile_ios", allowedCapabilities: ["google_identity"], environment: "production", launchStage: "planned", active: false },
  ];

  it("resolves identity to identity_web client", () => {
    const client = resolveOAuthClient("google_identity", mockClients);
    expect(client?.purpose).toBe("identity_web");
  });

  it("resolves Drive to connector_web client", () => {
    const client = resolveOAuthClient("google_drive", mockClients);
    expect(client?.purpose).toBe("connector_web");
  });

  it("resolves Gmail to connector_web client", () => {
    const client = resolveOAuthClient("google_gmail", mockClients);
    expect(client?.purpose).toBe("connector_web");
  });

  it("does NOT resolve identity to connector client", () => {
    const client = resolveOAuthClient("google_identity", mockClients);
    expect(client?.purpose).not.toBe("connector_web");
  });

  it("skips inactive clients", () => {
    const client = resolveOAuthClient("google_identity", mockClients.filter((c) => c.purpose === "mobile_ios"));
    expect(client).toBeNull();
  });
});

// ── Scope Upgrade Safety ─────────────────────────────────────

describe("Google Provider Family — Scope Upgrade Safety", () => {
  const gmailPolicy: GoogleScopePolicyEntry = {
    capabilityKey: "google_gmail",
    displayName: "Gmail",
    minimumScopes: ["https://www.googleapis.com/auth/gmail.metadata"],
    optionalScopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    disallowedScopes: ["https://mail.google.com/"],
    defaultGrantProfile: "read_only",
    upgradePathAvailable: true,
    approvalRequired: true,
  };

  it("allows safe scope requests", () => {
    const result = isScopeUpgradeSafe(gmailPolicy, ["https://www.googleapis.com/auth/gmail.readonly"]);
    expect(result.safe).toBe(true);
    expect(result.blocked.length).toBe(0);
  });

  it("blocks disallowed scopes", () => {
    const result = isScopeUpgradeSafe(gmailPolicy, ["https://mail.google.com/"]);
    expect(result.safe).toBe(false);
    expect(result.blocked).toContain("https://mail.google.com/");
  });

  it("flags approval required", () => {
    const result = isScopeUpgradeSafe(gmailPolicy, ["https://www.googleapis.com/auth/gmail.readonly"]);
    expect(result.needsApproval).toBe(true);
  });
});

// ── Demo State ───────────────────────────────────────────────

describe("Google Provider Family — Demo Mode", () => {
  it("returns fully populated demo state", () => {
    const state = getGoogleDemoState("demo");
    expect(state.loaded).toBe(true);
    expect(state.realityMode).toBe("demo");
    expect(state.familyName).toBe("Google");
    expect(state.providerKey).toBe("google");
  });

  it("demo identity shows signed in", () => {
    const state = getGoogleDemoState("demo");
    expect(state.identity.signedInWithGoogle).toBe(true);
    expect(state.identity.email).toBe("alex@sita.os");
    expect(state.identity.primaryIdentity).toBe(true);
  });

  it("demo has 3 connectors (drive, gmail, calendar)", () => {
    const state = getGoogleDemoState("demo");
    expect(state.connectors).toHaveLength(3);
    const keys = state.connectors.map((c) => c.capabilityKey);
    expect(keys).toContain("google_drive");
    expect(keys).toContain("google_gmail");
    expect(keys).toContain("google_calendar");
  });

  it("demo Drive and Gmail are connected, Calendar is not", () => {
    const state = getGoogleDemoState("demo");
    const drive = state.connectors.find((c) => c.capabilityKey === "google_drive")!;
    const gmail = state.connectors.find((c) => c.capabilityKey === "google_gmail")!;
    const cal = state.connectors.find((c) => c.capabilityKey === "google_calendar")!;
    expect(drive.connectionStatus).toBe("connected");
    expect(gmail.connectionStatus).toBe("connected");
    expect(cal.connectionStatus).toBe("disconnected");
  });

  it("demo has 4 OAuth clients", () => {
    const state = getGoogleDemoState("demo");
    expect(state.oauthClients).toHaveLength(4);
  });

  it("demo has 4 scope policies", () => {
    const state = getGoogleDemoState("demo");
    expect(state.scopePolicies).toHaveLength(4);
  });

  it("demo has 4 launch honesty entries", () => {
    const state = getGoogleDemoState("demo");
    expect(state.launchHonesty).toHaveLength(4);
  });

  it("demo launch honesty: identity is safe, connectors are not", () => {
    const state = getGoogleDemoState("demo");
    const identity = state.launchHonesty.find((h) => h.capabilityKey === "google_identity")!;
    const drive = state.launchHonesty.find((h) => h.capabilityKey === "google_drive")!;
    expect(identity.publicClaimSafe).toBe(true);
    expect(drive.publicClaimSafe).toBe(false);
  });

  it("internal_test mode also works", () => {
    const state = getGoogleDemoState("internal_test");
    expect(state.realityMode).toBe("internal_test");
    expect(state.connectors[0].mode).toBe("internal_test");
  });
});

// ── OAuth Client Templates ───────────────────────────────────

describe("Google Provider Family — OAuth Client Templates", () => {
  it("identity_web is Web application type", () => {
    expect(GOOGLE_OAUTH_CLIENT_TEMPLATES.identity_web.applicationType).toBe("Web application");
  });

  it("connector_web has empty scopes (per-connector)", () => {
    expect(GOOGLE_OAUTH_CLIENT_TEMPLATES.connector_web.scopes).toEqual([]);
  });

  it("mobile clients exist for future expansion", () => {
    expect(GOOGLE_OAUTH_CLIENT_TEMPLATES.mobile_ios.applicationType).toBe("iOS");
    expect(GOOGLE_OAUTH_CLIENT_TEMPLATES.mobile_android.applicationType).toBe("Android");
  });
});

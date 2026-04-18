// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Privacy Guards
// Honest screen-capture + screenshot + recents-blur policy.
// ═══════════════════════════════════════════════════════════════

export type PrivacyGuardRule =
  | "block-screenshot"
  | "blur-on-background"
  | "redact-pii-in-logs";

export interface PrivacyGuardSpec {
  rule: PrivacyGuardRule;
  /** Routes / surface keys this guard applies to. */
  appliesTo: ReadonlyArray<string>;
  /** Honest reason shown in admin / privacy center. */
  reason: string;
}

export const MOBILE_PRIVACY_GUARDS: ReadonlyArray<PrivacyGuardSpec> = [
  {
    rule: "block-screenshot",
    appliesTo: ["/mobile/approval/:id", "/mobile/emergency", "/mobile/device-trust"],
    reason: "Sensitive authority surfaces — screenshot blocked when host supports it.",
  },
  {
    rule: "blur-on-background",
    appliesTo: ["/mobile/approval/:id", "/mobile/emergency", "/mobile/device-trust", "/mobile/money", "/mobile/receipt/:id"],
    reason: "Recents/app-switcher preview blurred to avoid PII leak.",
  },
  {
    rule: "redact-pii-in-logs",
    appliesTo: ["*"],
    reason: "Mobile diagnostics ship redacted payloads only.",
  },
] as const;

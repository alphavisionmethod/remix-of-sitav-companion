// ═══════════════════════════════════════════════════════════════
// Trust tier resolver
// internal > verified-publisher > trusted-domain > unverified
// ═══════════════════════════════════════════════════════════════

export type TrustBadge = "internal" | "verified" | "trusted-domain" | "community" | "unverified";

export interface TrustInputs {
  /** App was bundled with the OS. */
  isInternal?: boolean;
  /** Publisher row.verified === true */
  publisherVerified?: boolean;
  /** Domain present in trustedDomains config. */
  trustedDomain?: boolean;
  /** A valid signature was verified against a known publisher key. */
  signatureVerified?: boolean;
  /** App was admin-approved manually. */
  adminApproved?: boolean;
}

export interface TrustResult {
  badge: TrustBadge;
  score: number; // 0..100
  reasons: string[];
}

const DEFAULT_TRUSTED_DOMAINS = [
  "google.com", "microsoft.com", "github.com", "openai.com", "anthropic.com",
  "vercel.com", "lovable.dev", "supabase.com", "figma.com", "notion.so",
  "slack.com", "spotify.com", "apple.com",
];

export function isTrustedDomain(host: string, extra: string[] = []): boolean {
  const list = [...DEFAULT_TRUSTED_DOMAINS, ...extra];
  const h = host.toLowerCase();
  return list.some((d) => h === d || h.endsWith(`.${d}`));
}

export function resolveTrust(input: TrustInputs): TrustResult {
  const reasons: string[] = [];
  let score = 0;
  let badge: TrustBadge = "unverified";

  if (input.isInternal) {
    badge = "internal";
    score = 100;
    reasons.push("Bundled with the operating system.");
    return { badge, score, reasons };
  }
  if (input.publisherVerified && input.signatureVerified) {
    badge = "verified";
    score = 90;
    reasons.push("Verified publisher with valid signature.");
    return { badge, score, reasons };
  }
  if (input.publisherVerified) {
    badge = "verified";
    score = 75;
    reasons.push("Verified publisher.");
    return { badge, score, reasons };
  }
  if (input.trustedDomain) {
    badge = "trusted-domain";
    score = 60;
    reasons.push("Hosted on a trusted domain.");
    return { badge, score, reasons };
  }
  if (input.adminApproved) {
    badge = "community";
    score = 40;
    reasons.push("Admin-approved community app.");
    return { badge, score, reasons };
  }
  reasons.push("No verification signals.");
  return { badge, score, reasons };
}

export function trustLabel(b: TrustBadge): string {
  switch (b) {
    case "internal":        return "Built-in";
    case "verified":        return "Verified Publisher";
    case "trusted-domain":  return "Trusted Source";
    case "community":       return "Community";
    default:                return "Unverified";
  }
}

// Tests for trust resolver
import { describe, it, expect } from "vitest";
import { resolveTrust, isTrustedDomain, trustLabel } from "@/lib/app-platform/trust";

describe("trust resolver", () => {
  it("internal app wins over everything", () => {
    const r = resolveTrust({ isInternal: true, publisherVerified: false });
    expect(r.badge).toBe("internal");
    expect(r.score).toBe(100);
  });

  it("verified + signature → highest non-internal score", () => {
    const r = resolveTrust({ publisherVerified: true, signatureVerified: true });
    expect(r.badge).toBe("verified");
    expect(r.score).toBe(90);
  });

  it("verified without signature is still verified but lower", () => {
    const r = resolveTrust({ publisherVerified: true });
    expect(r.badge).toBe("verified");
    expect(r.score).toBe(75);
  });

  it("trusted domain when no publisher", () => {
    const r = resolveTrust({ trustedDomain: true });
    expect(r.badge).toBe("trusted-domain");
  });

  it("unverified by default", () => {
    const r = resolveTrust({});
    expect(r.badge).toBe("unverified");
    expect(r.score).toBe(0);
  });

  it("isTrustedDomain matches root + subdomain", () => {
    expect(isTrustedDomain("github.com")).toBe(true);
    expect(isTrustedDomain("api.github.com")).toBe(true);
    expect(isTrustedDomain("attacker.com")).toBe(false);
  });

  it("trustLabel covers all tiers", () => {
    expect(trustLabel("internal")).toBe("Built-in");
    expect(trustLabel("verified")).toBe("Verified Publisher");
    expect(trustLabel("trusted-domain")).toBe("Trusted Source");
    expect(trustLabel("community")).toBe("Community");
    expect(trustLabel("unverified")).toBe("Unverified");
  });
});

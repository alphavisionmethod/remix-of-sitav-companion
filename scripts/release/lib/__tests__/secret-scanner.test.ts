import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { scanForSecrets } from "../secret-scanner";

const FIXTURES = resolve(__dirname, "fixtures");

// ── Dangerous file-path detection ─────────────────────────────
describe("secret-scanner — dangerous file detection", () => {
  const root = resolve(FIXTURES, "dangerous");

  it("flags Android keystore files", () => {
    const findings = scanForSecrets(root, ["android"]);
    const ks = findings.filter(f => f.file.includes("keystore"));
    expect(ks.length).toBeGreaterThanOrEqual(1);
    expect(ks[0].severity).toBe("error");
    expect(ks[0].message).toMatch(/credential.*secret/i);
  });

  it("flags iOS .p12 signing certificates", () => {
    const findings = scanForSecrets(root, ["ios"]);
    const p12 = findings.filter(f => f.file.includes(".p12"));
    expect(p12.length).toBeGreaterThanOrEqual(1);
  });

  it("flags root-level secrets.json", () => {
    const findings = scanForSecrets(root, []);
    const s = findings.filter(f => f.file === "secrets.json");
    expect(s.length).toBe(1);
  });

  it("flags google-services.json", () => {
    const findings = scanForSecrets(root, []);
    const gs = findings.filter(f => f.file === "google-services.json");
    expect(gs.length).toBe(1);
  });
});

// ── Hardcoded secret content matching ─────────────────────────
describe("secret-scanner — hardcoded secret regex", () => {
  const root = resolve(FIXTURES, "hardcoded");

  it("detects Stripe live secret key", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("stripe-key"))).toBe(true);
  });

  it("detects AWS access key ID", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("aws-key"))).toBe(true);
  });

  it("detects PEM private key header", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("private-key"))).toBe(true);
  });

  it("detects GitHub personal access token", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("github-token"))).toBe(true);
  });

  it("detects Slack bot token", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("slack-token"))).toBe(true);
  });

  it("detects hardcoded password assignment", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings.some(f => f.file.includes("password"))).toBe(true);
  });
});

// ── Clean fixture produces no findings ────────────────────────
describe("secret-scanner — clean project", () => {
  const root = resolve(FIXTURES, "clean");

  it("returns zero findings for safe code", () => {
    const findings = scanForSecrets(root, ["src"]);
    expect(findings).toHaveLength(0);
  });
});
#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Sensitive Document Privacy Check
// Ensures no PII or secrets leak into generated artifacts
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();

const PII_PATTERNS = [
  { pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, name: "ssn-like", detail: "Possible SSN pattern detected" },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, name: "email", detail: "Email address detected" },
  { pattern: /\b(?:password|passwd|secret|api_key|apikey|token)\s*[:=]\s*["'][^"']{8,}["']/gi, name: "credential", detail: "Possible credential detected" },
  { pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g, name: "private-key", detail: "Private key detected" },
  { pattern: /\b(?:sk_live|sk_test|pk_live|pk_test)_[a-zA-Z0-9]{20,}\b/g, name: "stripe-key", detail: "Stripe key detected" },
];

const EXEMPT_FILES = [
  "generated/trivy-reports",
  "generated/vmware-appliance",
  "generated/vmware-deliverable",
  "generated/iso-probe",
  ".test.",
  ".spec.",
];

// Check generated artifacts
const generatedFiles = scanDir("generated", [".json", ".md", ".yaml", ".yml"]);

for (const file of generatedFiles) {
  if (EXEMPT_FILES.some(e => file.includes(e))) continue;
  const content = readFileContent(file);
  if (!content) continue;

  for (const { pattern, name, detail } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Filter out obvious false positives
      const realMatches = matches.filter(m => {
        if (name === "email" && (m.includes("example.com") || m.includes("test.com"))) return false;
        if (name === "ssn-like" && m.match(/^[\d.]+$/)) return false; // IP addresses etc
        return true;
      });
      if (realMatches.length > 0) {
        vc.add(file, name, `${detail} (${realMatches.length} occurrence(s))`);
      }
    }
  }
}

vc.report("check-sensitive-document-privacy");
vc.exitIfErrors();

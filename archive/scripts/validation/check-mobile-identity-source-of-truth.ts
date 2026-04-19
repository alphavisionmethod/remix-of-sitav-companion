// SITA OS — Mobile identity source-of-truth validator
// Asserts MOBILE_IDENTITY_SOURCE_OF_TRUTH.md exists, declares all canonical fields,
// and that the values in the doc match capacitor.config.ts (the upstream source).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const SOT = "generated/mobile-identity-reconciliation/MOBILE_IDENTITY_SOURCE_OF_TRUTH.md";
const REQUIRED_FIELDS = [
  "appId",
  "appName",
  "Wrapper stack",
  "Web runtime",
  "Backend platform",
  "iOS scheme",
  "iOS min SDK",
  "Android min SDK",
  "Android target SDK",
  "Build systems",
  "Dependency managers",
];

const issues: GateIssue[] = [];

if (!existsSync(SOT)) {
  issues.push({ severity: "error", area: "missing", message: `${SOT} missing — identity has no source of truth` });
} else {
  const doc = readFileSync(SOT, "utf8");
  for (const field of REQUIRED_FIELDS) {
    if (!doc.includes(field)) {
      issues.push({ severity: "error", area: "field", message: `Source-of-truth missing canonical field: ${field}` });
    }
  }
  // Canonical value cross-check
  if (existsSync("capacitor.config.ts")) {
    const c = readFileSync("capacitor.config.ts", "utf8");
    const idMatch = c.match(/appId:\s*["']([^"']+)["']/);
    const nameMatch = c.match(/appName:\s*["']([^"']+)["']/);
    if (idMatch && !doc.includes(`\`${idMatch[1]}\``)) {
      issues.push({ severity: "error", area: "drift", message: `Source-of-truth doc does not reference canonical appId from capacitor.config.ts: ${idMatch[1]}` });
    }
    if (nameMatch && !doc.includes(`\`${nameMatch[1]}\``)) {
      issues.push({ severity: "error", area: "drift", message: `Source-of-truth doc does not reference canonical appName from capacitor.config.ts: ${nameMatch[1]}` });
    }
  }
  // Forbidden values must be enumerated
  if (!/Forbidden Identity Values/i.test(doc)) {
    issues.push({ severity: "error", area: "completeness", message: "Source-of-truth missing Forbidden Identity Values section" });
  }
  if (!/Change Process/i.test(doc)) {
    issues.push({ severity: "error", area: "completeness", message: "Source-of-truth missing Change Process section" });
  }
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-identity-source-of-truth",
  ok,
  issues,
  extra: { sourceOfTruthDoc: SOT, requiredFields: REQUIRED_FIELDS.length },
});
console.log(`mobile-identity-source-of-truth: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);

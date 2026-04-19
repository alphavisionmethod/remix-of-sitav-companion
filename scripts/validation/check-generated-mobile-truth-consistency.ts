// Validator: generated mobile truth stays inside generated/mobile-scope-closure/
import { existsSync, readdirSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const GENERATED = "generated";

const STRAY_PREFIXES = /^(mobile|capacitor|android|ios|no-flutter|native-project|final-mobile)/i;
const ALLOWED_SUBDIR = "mobile-scope-closure";

if (existsSync(GENERATED)) {
  for (const f of readdirSync(GENERATED)) {
    if (f === ALLOWED_SUBDIR) continue;
    if (STRAY_PREFIXES.test(f)) {
      issues.push({
        severity: "error",
        area: "generated",
        message: `Stray mobile-related artifact in generated/: ${f} — should be archive/generated/mobile/ or removed`,
      });
    }
  }
}

const required = [
  "generated/mobile-scope-closure/mobile-scope-status.json",
  "generated/mobile-scope-closure/install-surface-honesty-status.json",
  "generated/mobile-scope-closure/mobile-manifest-status.json",
  "generated/mobile-scope-closure/mobile-scope-verification.json",
];
for (const r of required) {
  if (!existsSync(r)) {
    issues.push({
      severity: "error",
      area: "canonical",
      message: `Missing canonical artifact: ${r} — run \`npm run mobile:scope:emit\``,
    });
  }
}

const errors = issues.filter((i) => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "generated-mobile-truth-consistency",
  ok,
  issues,
  extra: { allowedSubdir: ALLOWED_SUBDIR },
});
console.log(`generated-mobile-truth-consistency: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);

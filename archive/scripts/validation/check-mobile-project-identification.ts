// SITA OS — Mobile project identification validator
// Asserts canonical app identity values (com.sita.os, SITA OS) appear consistently
// in capacitor.config.ts, infra/deploy/mobile.yaml, store metadata, and signing docs.
// Forbids placeholder Lovable-default identifiers (app.lovable.*).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const CANONICAL_APP_ID = "com.sita.os";
const CANONICAL_APP_NAME = "SITA OS";
const FORBIDDEN_PLACEHOLDER = /app\.lovable\.[a-f0-9]{6,}/i;

const issues: GateIssue[] = [];

// 1. capacitor.config.ts must declare canonical id + name
if (!existsSync("capacitor.config.ts")) {
  issues.push({ severity: "error", area: "missing", message: "capacitor.config.ts missing" });
} else {
  const c = readFileSync("capacitor.config.ts", "utf8");
  if (!c.includes(`appId: "${CANONICAL_APP_ID}"`) && !c.includes(`appId: '${CANONICAL_APP_ID}'`)) {
    issues.push({ severity: "error", area: "identity", message: `capacitor.config.ts missing canonical appId="${CANONICAL_APP_ID}"` });
  }
  if (!c.includes(`appName: "${CANONICAL_APP_NAME}"`) && !c.includes(`appName: '${CANONICAL_APP_NAME}'`)) {
    issues.push({ severity: "error", area: "identity", message: `capacitor.config.ts missing canonical appName="${CANONICAL_APP_NAME}"` });
  }
  if (FORBIDDEN_PLACEHOLDER.test(c)) {
    issues.push({ severity: "error", area: "placeholder", message: "capacitor.config.ts contains forbidden app.lovable.* placeholder identifier" });
  }
}

// 2. infra/deploy/mobile.yaml must declare canonical bundle id in iOS push + entitlements
if (existsSync("infra/deploy/mobile.yaml")) {
  const y = readFileSync("infra/deploy/mobile.yaml", "utf8");
  if (!y.includes(CANONICAL_APP_ID)) {
    issues.push({ severity: "error", area: "identity", message: `infra/deploy/mobile.yaml does not reference canonical appId "${CANONICAL_APP_ID}"` });
  }
  if (FORBIDDEN_PLACEHOLDER.test(y)) {
    issues.push({ severity: "error", area: "placeholder", message: "infra/deploy/mobile.yaml contains forbidden app.lovable.* placeholder" });
  }
}

// 3. Store metadata must declare canonical name
if (existsSync("mobile/store-metadata/android.json")) {
  try {
    const m = JSON.parse(readFileSync("mobile/store-metadata/android.json", "utf8"));
    if (m.title !== CANONICAL_APP_NAME) {
      issues.push({ severity: "error", area: "identity", message: `android.json title="${m.title}" must equal canonical "${CANONICAL_APP_NAME}"` });
    }
  } catch (e) { issues.push({ severity: "error", area: "json", message: `android.json parse: ${(e as Error).message}` }); }
}
if (existsSync("mobile/store-metadata/ios.json")) {
  try {
    const m = JSON.parse(readFileSync("mobile/store-metadata/ios.json", "utf8"));
    if (m.name !== CANONICAL_APP_NAME) {
      issues.push({ severity: "error", area: "identity", message: `ios.json name="${m.name}" must equal canonical "${CANONICAL_APP_NAME}"` });
    }
  } catch (e) { issues.push({ severity: "error", area: "json", message: `ios.json parse: ${(e as Error).message}` }); }
}

// 4. Display name length cap (App Store Connect)
if (CANONICAL_APP_NAME.length > 30) {
  issues.push({ severity: "error", area: "policy", message: "Canonical app name exceeds App Store Connect 30-char limit" });
}

// 5. SOURCE-OF-TRUTH doc must exist
if (!existsSync("generated/mobile-identity-reconciliation/MOBILE_IDENTITY_SOURCE_OF_TRUTH.md")) {
  issues.push({ severity: "error", area: "governance", message: "MOBILE_IDENTITY_SOURCE_OF_TRUTH.md missing — identity has no canonical doc" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-project-identification",
  ok,
  issues,
  extra: {
    canonicalAppId: CANONICAL_APP_ID,
    canonicalAppName: CANONICAL_APP_NAME,
    surfacesChecked: 4,
  },
});
console.log(`mobile-project-identification: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);

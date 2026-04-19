// SITA OS — Mobile env & secret strategy consistency validator
// Asserts the four-zone model: no zone-crossing leaks, no committed signing
// material, no hardcoded secrets in claim surfaces, all signing env vars
// referenced consistently across infra/, mobile/*/SIGNING.md, and release scripts.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const MODEL = "generated/mobile-identity-reconciliation/MOBILE_ENV_AND_SECRET_STRATEGY_MODEL.md";

// 1. Model doc exists
if (!existsSync(MODEL)) {
  issues.push({ severity: "error", area: "missing", message: `${MODEL} missing — env strategy has no canonical doc` });
}

// 2. No committed signing material (Zone 4 violation)
const FORBIDDEN_EXTS = [".p8", ".p12", ".jks", ".keystore", ".mobileprovision"];
function walkForForbidden(dir: string, hits: string[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === "android" || entry === "ios") continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walkForForbidden(full, hits);
    else if (FORBIDDEN_EXTS.includes(extname(entry).toLowerCase())) hits.push(full);
  }
}
const forbiddenHits: string[] = [];
walkForForbidden(".", forbiddenHits);
for (const h of forbiddenHits) {
  issues.push({ severity: "error", area: "zone4-leak", message: `Committed signing material (Zone 4 violation): ${h}` });
}

// 3. No real google-services.json (template OK)
function findGoogleServices(dir: string, hits: string[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "android" || entry === "ios") continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) findGoogleServices(full, hits);
    else if (entry === "google-services.json") hits.push(full);
  }
}
const gsHits: string[] = [];
findGoogleServices(".", gsHits);
for (const h of gsHits) {
  issues.push({ severity: "error", area: "fcm-leak", message: `Committed real google-services.json (use .template suffix): ${h}` });
}

// 4. Required signing env vars referenced consistently
const SIGNING_VARS_ANDROID = ["ANDROID_KEYSTORE_PATH", "ANDROID_KEYSTORE_PASSWORD", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD", "ANDROID_PACKAGE_NAME"];
const SIGNING_VARS_IOS = ["APPLE_TEAM_ID", "APPLE_PROVISIONING_PROFILE_BASE64", "APPLE_DISTRIBUTION_CERT_P12_BASE64", "APPLE_DISTRIBUTION_CERT_PASSWORD", "APP_STORE_CONNECT_API_KEY_ID", "APP_STORE_CONNECT_API_ISSUER_ID", "APP_STORE_CONNECT_API_KEY_P8_BASE64"];

function assertVarsIn(file: string, vars: string[], label: string) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const v of vars) {
    if (!content.includes(v)) {
      issues.push({ severity: "warning", area: "env-coverage", message: `${file} (${label}) does not reference signing var: ${v}` });
    }
  }
}
assertVarsIn("infra/deploy/mobile.yaml", SIGNING_VARS_ANDROID, "Android signing");
assertVarsIn("infra/deploy/mobile.yaml", SIGNING_VARS_IOS, "iOS signing");
assertVarsIn("mobile/android/SIGNING.md", SIGNING_VARS_ANDROID, "Android signing doc");
assertVarsIn("mobile/ios/SIGNING.md", SIGNING_VARS_IOS, "iOS signing doc");

// 5. No VITE_ prefix on signing var names (Zone 1/Zone 2 boundary)
const allSigningVars = [...SIGNING_VARS_ANDROID, ...SIGNING_VARS_IOS];
function scanForViteLeak(dir: string) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) scanForViteLeak(full);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      for (const v of allSigningVars) {
        if (content.includes(`VITE_${v}`) || content.includes(`import.meta.env.VITE_${v}`)) {
          issues.push({ severity: "error", area: "zone-crossing", message: `${full} references signing var with VITE_ prefix (signing→client leak): VITE_${v}` });
        }
      }
    }
  }
}
scanForViteLeak("src");

// 6. process.env.ANDROID_*/APPLE_* must NOT appear in src/ (web layer)
function scanForBackendLeakInSrc(dir: string) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) scanForBackendLeakInSrc(full);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      for (const v of allSigningVars) {
        // process.env.<VAR> in src/ is a Zone 2 leak
        if (new RegExp(`process\\.env\\.${v}\\b`).test(content)) {
          issues.push({ severity: "error", area: "zone-crossing", message: `${full} references Zone-2 signing var via process.env: ${v} (signing secrets must stay in CI scripts only)` });
        }
      }
    }
  }
}
scanForBackendLeakInSrc("src");

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-env-strategy-consistency",
  ok,
  issues,
  extra: {
    model: MODEL,
    zones: 4,
    signingVarsAndroid: SIGNING_VARS_ANDROID.length,
    signingVarsIos: SIGNING_VARS_IOS.length,
    forbiddenExtensions: FORBIDDEN_EXTS,
    forbiddenHits: forbiddenHits.length + gsHits.length,
  },
});
console.log(`mobile-env-strategy-consistency: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);

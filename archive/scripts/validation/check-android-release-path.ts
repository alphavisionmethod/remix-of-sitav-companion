// SITA OS — Android release path validator
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "scripts/android/bootstrap.sh",
  "scripts/release/android/build-android.sh",
  "mobile/android/AndroidManifest.permissions.xml",
  "mobile/android/SIGNING.md",
  "mobile/android/FCM.md",
  "mobile/store-metadata/android.json",
  "mobile/store-metadata/android.data-safety.json",
  "capacitor.config.ts",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "missing-file", message: `Required artifact missing: ${f}` });
}

// Bootstrap must check Node + Java versions
if (existsSync("scripts/android/bootstrap.sh")) {
  const s = readFileSync("scripts/android/bootstrap.sh", "utf8");
  if (!/REQUIRED_NODE_MAJOR/.test(s)) issues.push({ severity: "warning", area: "bootstrap", message: "bootstrap.sh missing Node version pin check" });
  if (!/REQUIRED_JAVA_MAJOR/.test(s)) issues.push({ severity: "warning", area: "bootstrap", message: "bootstrap.sh missing Java version pin check" });
  if (!/Validating generated Android project/.test(s)) issues.push({ severity: "warning", area: "bootstrap", message: "bootstrap.sh missing post-generation validation" });
}

// Release script must declare keystore env-var contract
if (existsSync("scripts/release/android/build-android.sh")) {
  const s = readFileSync("scripts/release/android/build-android.sh", "utf8");
  const required = ["ANDROID_KEYSTORE_PATH", "ANDROID_KEYSTORE_PASSWORD", "ANDROID_KEY_ALIAS", "ANDROID_KEY_PASSWORD", "ANDROID_PACKAGE_NAME"];
  for (const v of required) {
    if (!s.includes(v)) issues.push({ severity: "error", area: "signing", message: `build-android.sh missing env-var declaration: ${v}` });
  }
  if (!/missing=1|exit 2/.test(s)) issues.push({ severity: "error", area: "signing", message: "build-android.sh must refuse to run without keystore env vars" });
}

// Store metadata sanity
if (existsSync("mobile/store-metadata/android.json")) {
  try {
    const meta = JSON.parse(readFileSync("mobile/store-metadata/android.json", "utf8"));
    if (!meta.title || !meta.shortDescription) issues.push({ severity: "error", area: "metadata", message: "android.json missing title/shortDescription" });
    if (!meta.privacyPolicyUrl) issues.push({ severity: "error", area: "metadata", message: "android.json missing privacyPolicyUrl" });
    if (!meta.submission?.tier) issues.push({ severity: "warning", area: "metadata", message: "android.json missing submission.tier" });
  } catch (e) {
    issues.push({ severity: "error", area: "metadata", message: `android.json invalid JSON: ${(e as Error).message}` });
  }
}

// Data safety must declare encryption
if (existsSync("mobile/store-metadata/android.data-safety.json")) {
  try {
    const ds = JSON.parse(readFileSync("mobile/store-metadata/android.data-safety.json", "utf8"));
    if (ds.encryptionInTransit !== true) issues.push({ severity: "error", area: "data-safety", message: "data-safety must declare encryptionInTransit=true" });
    if (ds.encryptionAtRest !== true) issues.push({ severity: "error", area: "data-safety", message: "data-safety must declare encryptionAtRest=true" });
    if (!ds.userDeletionRequestUrl) issues.push({ severity: "error", area: "data-safety", message: "data-safety missing userDeletionRequestUrl" });
  } catch (e) {
    issues.push({ severity: "error", area: "data-safety", message: `data-safety JSON invalid: ${(e as Error).message}` });
  }
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "android-release-path",
  ok,
  issues,
  extra: {
    requiredArtifacts: REQUIRED.length,
    blockerClass: "secret-blocked",
    nextStep: "provision ANDROID_KEYSTORE_PATH + 4 env vars; run scripts/release/android/build-android.sh",
  },
});
console.log(`android-release-path: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);

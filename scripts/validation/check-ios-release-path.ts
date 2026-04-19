// SITA OS — iOS release path validator
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED = [
  "scripts/release/ios/build-ios.sh",
  "mobile/ios/SIGNING.md",
  "mobile/ios/Info.plist.template",
  "mobile/ios/PrivacyInfo.xcprivacy",
  "mobile/store-metadata/ios.json",
  "mobile/store-metadata/ios.screenshots.json",
  "capacitor.config.ts",
];

for (const f of REQUIRED) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "missing-file", message: `Required artifact missing: ${f}` });
}

// build-ios.sh must enforce macOS + 7-secret contract
if (existsSync("scripts/release/ios/build-ios.sh")) {
  const s = readFileSync("scripts/release/ios/build-ios.sh", "utf8");
  const required = [
    "APPLE_TEAM_ID",
    "APPLE_DISTRIBUTION_CERT_P12_BASE64",
    "APPLE_DISTRIBUTION_CERT_PASSWORD",
    "APPLE_PROVISIONING_PROFILE_BASE64",
    "APP_STORE_CONNECT_API_KEY_ID",
    "APP_STORE_CONNECT_API_ISSUER_ID",
    "APP_STORE_CONNECT_API_KEY_P8_BASE64",
  ];
  for (const v of required) {
    if (!s.includes(v)) issues.push({ severity: "error", area: "signing", message: `build-ios.sh missing env-var declaration: ${v}` });
  }
  if (!/Darwin/.test(s)) issues.push({ severity: "error", area: "platform", message: "build-ios.sh must enforce macOS-only" });
  if (!/missing=1|exit 2/.test(s)) issues.push({ severity: "error", area: "signing", message: "build-ios.sh must refuse to run without Apple credentials" });
  if (!/xcodebuild archive/.test(s)) issues.push({ severity: "error", area: "build", message: "build-ios.sh must invoke xcodebuild archive" });
  if (!/exportArchive/.test(s)) issues.push({ severity: "error", area: "build", message: "build-ios.sh must invoke xcodebuild -exportArchive" });
}

// SIGNING.md must declare deferred status + 7 required secrets
if (existsSync("mobile/ios/SIGNING.md")) {
  const s = readFileSync("mobile/ios/SIGNING.md", "utf8");
  if (!/DEFERRED|deferred/i.test(s)) issues.push({ severity: "warning", area: "signing-doc", message: "SIGNING.md should explicitly mark deferred status" });
}

// Store metadata sanity
if (existsSync("mobile/store-metadata/ios.json")) {
  try {
    const meta = JSON.parse(readFileSync("mobile/store-metadata/ios.json", "utf8"));
    if (!meta.title) issues.push({ severity: "error", area: "metadata", message: "ios.json missing title" });
    if (!meta.privacyPolicyUrl) issues.push({ severity: "error", area: "metadata", message: "ios.json missing privacyPolicyUrl" });
  } catch (e) {
    issues.push({ severity: "error", area: "metadata", message: `ios.json invalid: ${(e as Error).message}` });
  }
}

// Privacy manifest must exist (required since May 2024)
if (existsSync("mobile/ios/PrivacyInfo.xcprivacy")) {
  const s = readFileSync("mobile/ios/PrivacyInfo.xcprivacy", "utf8");
  if (s.length < 100) issues.push({ severity: "error", area: "privacy", message: "PrivacyInfo.xcprivacy appears empty/stub" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "ios-release-path",
  ok,
  issues,
  extra: {
    requiredArtifacts: REQUIRED.length,
    blockerClass: "account-blocked",
    nextStep: "Activate Apple Developer Program + provision 7 secrets in CI; run scripts/release/ios/build-ios.sh on macos-14",
  },
});
console.log(`ios-release-path: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);

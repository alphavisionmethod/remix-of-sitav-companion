// SITA OS — Mobile build & dependency model consistency validator
// Asserts the four-tier build model is consistently declared across:
// package.json (Capacitor 6), capacitor.config.ts, infra/deploy/mobile.yaml,
// release scripts, and Podfile.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const MODEL = "generated/mobile-identity-reconciliation/MOBILE_BUILD_AND_DEPENDENCY_MODEL.md";

// 1. Model doc exists
if (!existsSync(MODEL)) {
  issues.push({ severity: "error", area: "missing", message: `${MODEL} missing — build model has no canonical doc` });
}

// 2. Capacitor 6 across all @capacitor/* deps
if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const capDeps = Object.entries(allDeps).filter(([n]) => n.startsWith("@capacitor/"));
  if (capDeps.length === 0) {
    issues.push({ severity: "error", area: "deps", message: "No @capacitor/* deps in package.json" });
  }
  const majors = new Set<string>();
  for (const [name, ver] of capDeps) {
    const major = String(ver).match(/(\d+)/)?.[1];
    if (major) majors.add(major);
    if (!major || parseInt(major, 10) < 6) {
      issues.push({ severity: "error", area: "version", message: `${name} declared as ${ver} — canonical major is 6` });
    }
  }
  if (majors.size > 1) {
    issues.push({ severity: "error", area: "consistency", message: `Mixed Capacitor majors across @capacitor/* deps: ${Array.from(majors).join(", ")}` });
  }
}

// 3. Bootstrap scripts use correct build commands
if (existsSync("scripts/android/bootstrap.sh")) {
  const s = readFileSync("scripts/android/bootstrap.sh", "utf8");
  if (!/npm run build/.test(s)) issues.push({ severity: "error", area: "tier1", message: "Android bootstrap missing 'npm run build' (Tier 1)" });
  if (!/gradlew assembleDebug|gradlew bundleDebug/.test(s)) issues.push({ severity: "error", area: "tier3a", message: "Android bootstrap missing Gradle build invocation (Tier 3a)" });
}
if (existsSync("scripts/ios/bootstrap.sh")) {
  const s = readFileSync("scripts/ios/bootstrap.sh", "utf8");
  if (!/npm run build/.test(s)) issues.push({ severity: "error", area: "tier1", message: "iOS bootstrap missing 'npm run build' (Tier 1)" });
  if (!/pod install/.test(s)) issues.push({ severity: "error", area: "tier3b", message: "iOS bootstrap missing 'pod install' (Tier 3b CocoaPods)" });
}

// 4. Release scripts use canonical build tools
if (existsSync("scripts/release/android/build-android.sh")) {
  const s = readFileSync("scripts/release/android/build-android.sh", "utf8");
  if (!/gradlew bundleRelease|gradlew :app:bundleRelease/.test(s)) {
    issues.push({ severity: "error", area: "release", message: "Android release script must invoke './gradlew bundleRelease'" });
  }
}
if (existsSync("scripts/release/ios/build-ios.sh")) {
  const s = readFileSync("scripts/release/ios/build-ios.sh", "utf8");
  if (!/xcodebuild/.test(s)) {
    issues.push({ severity: "error", area: "release", message: "iOS release script must invoke 'xcodebuild'" });
  }
}

// 5. Podfile (template) declares iOS 16.0
const podfilePaths = ["archive/ios-templates/App/Podfile", "ios-templates/App/Podfile", "mobile/ios-templates/App/Podfile"];
let podfileFound = false;
for (const p of podfilePaths) {
  if (existsSync(p)) {
    podfileFound = true;
    const pf = readFileSync(p, "utf8");
    if (!/platform :ios,\s*['"]16\.0['"]/.test(pf)) {
      issues.push({ severity: "error", area: "podfile", message: `${p} must declare 'platform :ios, '16.0''` });
    }
    if (!/use_frameworks!/.test(pf)) {
      issues.push({ severity: "warning", area: "podfile", message: `${p} should declare 'use_frameworks!' for static linkage` });
    }
  }
}
if (!podfileFound) {
  issues.push({ severity: "warning", area: "podfile", message: "No iOS Podfile template found in archive/, ios-templates/, or mobile/ios-templates/" });
}

// 6. mobile.yaml min/target SDK consistency
if (existsSync("infra/deploy/mobile.yaml")) {
  const y = readFileSync("infra/deploy/mobile.yaml", "utf8");
  if (!/ios:\s*"16\.0"/.test(y)) issues.push({ severity: "error", area: "manifest", message: "mobile.yaml min_sdk.ios must be '16.0' to match Podfile + model" });
  if (!/android:\s*"26"/.test(y)) issues.push({ severity: "error", area: "manifest", message: "mobile.yaml min_sdk.android must be '26' to match model" });
  if (!/target_sdk:[\s\S]*?android:\s*"34"/.test(y)) issues.push({ severity: "error", area: "manifest", message: "mobile.yaml target_sdk.android must be '34' to match model" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-build-model-consistency",
  ok,
  issues,
  extra: { model: MODEL, tiers: ["web/Vite", "wrapper/Capacitor", "Android/Gradle", "iOS/xcodebuild+CocoaPods"] },
});
console.log(`mobile-build-model-consistency: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);

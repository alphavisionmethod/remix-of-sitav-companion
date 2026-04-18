#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Build Pipeline Readiness Gate
//
// Asserts the CI workflow can produce IPA + AAB artifacts.
// Emits: generated/mobile-build-pipeline-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
const WORKFLOW = ".github/workflows/mobile-build.yml";

interface Issue { severity: "error" | "warning"; area: string; message: string }
const issues: Issue[] = [];

function check(area: string, cond: boolean, message: string, severity: "error" | "warning" = "error") {
  if (!cond) issues.push({ severity, area, message });
}

const wfPath = resolve(REPO_ROOT, WORKFLOW);
const wfExists = existsSync(wfPath);
check("workflow", wfExists, `${WORKFLOW} missing`);

let wf = "";
if (wfExists) wf = readFileSync(wfPath, "utf8");

check("workflow.android-job",     wf.includes("android-aab")  || wf.includes("name: android"),         "android job missing");
check("workflow.ios-job",         wf.includes("ios-ipa")      || wf.includes("name: ios"),             "ios job missing");
check("workflow.macos-runner",    wf.includes("macos-14"),     "iOS job must run on macos-14 (xcodebuild)");
check("workflow.android-bundle",  wf.includes("bundleRelease"), "android job must run gradle :app:bundleRelease");
check("workflow.ios-archive",     wf.includes("xcodebuild") && wf.includes("archive"), "ios job must run xcodebuild archive");
check("workflow.readiness-gate",  wf.includes("check-mobile-store-readiness"), "readiness gate missing from workflow");
check("workflow.web-build-deps",  wf.includes("npm run build") || wf.includes("npm ci"), "workflow must build web bundle first");

// Capacitor config
const capTs   = existsSync(resolve(REPO_ROOT, "capacitor.config.ts"));
const capJson = existsSync(resolve(REPO_ROOT, "capacitor.config.json"));
check("capacitor.config", capTs || capJson, "capacitor.config.ts (or .json) missing");

// Min/target SDK policy doc enforces API ≥ 34
const sdkPolicy = resolve(REPO_ROOT, "mobile/android/TARGET_SDK_POLICY.md");
if (existsSync(sdkPolicy)) {
  const txt = readFileSync(sdkPolicy, "utf8");
  check("android.targetSdk-34",
    /target\s*sdk[^0-9]*([3-9]\d|34)/i.test(txt) || txt.includes("targetSdkVersion = 34"),
    "TARGET_SDK_POLICY.md must enforce API ≥ 34", "warning");
} else {
  check("android.targetSdk-policy-doc", false, "mobile/android/TARGET_SDK_POLICY.md missing");
}

// iOS minimum 16.0 in Info.plist template
const infoPlist = resolve(REPO_ROOT, "mobile/ios/Info.plist.template");
if (existsSync(infoPlist)) {
  const txt = readFileSync(infoPlist, "utf8");
  check("ios.minOS-16", txt.includes("MinimumOSVersion") && /16\.\d/.test(txt),
    "Info.plist.template must declare MinimumOSVersion ≥ 16.0", "warning");
} else {
  check("ios.info-plist-template", false, "mobile/ios/Info.plist.template missing");
}

// Submission doc
check("docs.submission",
  existsSync(resolve(REPO_ROOT, "docs/mobile/STORE_SUBMISSION.md")),
  "docs/mobile/STORE_SUBMISSION.md missing");

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "mobile-build-pipeline",
  phase: "phase-13-mobile-distribution",
  ok: errorCount === 0,
  errorCount,
  warningCount,
  workflowFile: WORKFLOW,
  workflowPresent: wfExists,
  pipelines: {
    android: { runner: "ubuntu-latest", produces: "AAB", signed: "if-secret-present" },
    ios:     { runner: "macos-14",       produces: "xcarchive (signed IPA if cert secret present)", signed: "deferred" },
  },
  issues,
};

const outDir = resolve(REPO_ROOT, "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "mobile-build-pipeline-report.json"), JSON.stringify(report, null, 2));

console.log(`[mobile-build-pipeline] ${errorCount} errors · ${warningCount} warnings`);
if (errorCount > 0) {
  for (const e of issues.filter((i) => i.severity === "error")) console.error(`  ✗ ${e.area}: ${e.message}`);
  process.exit(1);
}
console.log("[mobile-build-pipeline] ✓ ok");

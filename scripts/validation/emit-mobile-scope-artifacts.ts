// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Scope Closure · Canonical Truth Emitter
//
// Emits the 4 canonical machine-readable artifacts that represent the
// truthful current state of mobile-native scope:
//
//   generated/mobile-scope-closure/mobile-scope-status.json
//   generated/mobile-scope-closure/install-surface-honesty-status.json
//   generated/mobile-scope-closure/mobile-manifest-status.json
//   generated/mobile-scope-closure/mobile-scope-verification.json
//
// Also writes generated/mobile-scope-closure/MOBILE_SCOPE_FINAL_VERIFICATION.md
// summarizing the rollup.
//
// All five are single-source-of-truth for the 5 BLOCK validators wired into
// scripts/architecture/checks/check-os-release-readiness.ts.
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "generated/mobile-scope-closure";
const PROJECT_ROOT = ".";
const HONESTY_DOC_PATH = "docs/MOBILE_HONESTY.md";
const HONESTY_LINK_RE = /MOBILE_HONESTY\.md/;

mkdirSync(OUT_DIR, { recursive: true });

// ── 1. Mobile scope status ────────────────────────────────────────
const capacitorAtRoot = existsSync(join(PROJECT_ROOT, "capacitor.config.ts"));
const mobileDirAtRoot = existsSync(join(PROJECT_ROOT, "mobile"));
const mobileManifestActive = existsSync(join(PROJECT_ROOT, "infra/deploy/mobile.yaml"));

let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } = {};
try {
  pkg = JSON.parse(readFileSync("package.json", "utf8"));
} catch {
  /* leave pkg empty */
}
const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const capacitorDeps = Object.keys(allDeps).filter((d) => d.startsWith("@capacitor/"));

const archiveCapacitor = existsSync("archive/capacitor/capacitor.config.ts");
const archiveInfra = existsSync("archive/infra/mobile.yaml");
const archiveMobileDir = existsSync("archive/mobile/ARCHIVED.md");
const honestyDocPresent = existsSync(HONESTY_DOC_PATH);

const scopeStatus = {
  generatedAt: new Date().toISOString(),
  status: "ARCHIVED" as const,
  classification: "FUTURE_VISION_ONLY",
  active_deployment: false,
  active_surfaces: ["web-spa", "ubuntu-native-iso", "electron-desktop-shell"],
  archived_surfaces: [
    "native-ios-app",
    "native-android-app",
    "app-store",
    "play-store",
    "apns-push",
    "fcm-push",
    "capacitor-wrapper",
    "mobile-build-manifest",
  ],
  containment: {
    capacitor_config_at_root: capacitorAtRoot,
    capacitor_config_archived: archiveCapacitor,
    mobile_dir_at_root: mobileDirAtRoot,
    mobile_dir_archived: archiveMobileDir,
    mobile_manifest_active: mobileManifestActive,
    mobile_manifest_archived: archiveInfra,
    capacitor_deps_in_package_json: capacitorDeps,
    honesty_doc_present: honestyDocPresent,
  },
  reactivation_doc: "generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md",
  honesty_doc: HONESTY_DOC_PATH,
};
writeFileSync(join(OUT_DIR, "mobile-scope-status.json"), JSON.stringify(scopeStatus, null, 2));

// ── 2. Install surface honesty status ─────────────────────────────
const installSurfaces: { path: string; key: string }[] = [
  { key: "download-page", path: "src/pages/DownloadPage.tsx" },
  { key: "downloads-center", path: "src/pages/DownloadsCenter.tsx" },
  { key: "external-installer", path: "src/pages/app-platform/ExternalInstallerPage.tsx" },
];
const surfaceResults = installSurfaces.map((s) => {
  const exists = existsSync(s.path);
  const content = exists ? readFileSync(s.path, "utf8") : "";
  const linksHonesty = HONESTY_LINK_RE.test(content) || /MobileHonestyNotice/.test(content);
  return {
    key: s.key,
    path: s.path,
    exists,
    links_honesty_doc: linksHonesty,
  };
});
const allSurfacesLinked = surfaceResults.every((s) => s.exists && s.links_honesty_doc);
const installStatus = {
  generatedAt: new Date().toISOString(),
  honesty_doc: HONESTY_DOC_PATH,
  honesty_doc_present: honestyDocPresent,
  surfaces: surfaceResults,
  all_surfaces_linked: allSurfacesLinked,
};
writeFileSync(
  join(OUT_DIR, "install-surface-honesty-status.json"),
  JSON.stringify(installStatus, null, 2),
);

// ── 3. Mobile manifest status ────────────────────────────────────
const manifestStatus = {
  generatedAt: new Date().toISOString(),
  active_manifests: mobileManifestActive ? ["infra/deploy/mobile.yaml"] : [],
  archived_manifests: [
    archiveInfra ? "archive/infra/mobile.yaml" : null,
    archiveCapacitor ? "archive/capacitor/capacitor.config.ts" : null,
  ].filter(Boolean),
  zero_active_mobile_manifests: !mobileManifestActive && !capacitorAtRoot && !mobileDirAtRoot,
};
writeFileSync(join(OUT_DIR, "mobile-manifest-status.json"), JSON.stringify(manifestStatus, null, 2));

// ── 4. Generated mobile truth consistency snapshot ───────────────
const generatedDir = "generated";
// Allow gate-report outputs from the 5 mobile-scope validators to coexist at generated/ root.
const ALLOWED_GATE_REPORTS = new Set([
  "mobile-native-out-of-scope-truth-report.json",
  "mobile-manifest-archive-classification-report.json",
  "no-active-native-mobile-claims-report.json",
  "install-page-mobile-honesty-report.json",
  "generated-mobile-truth-consistency-report.json",
]);
const strayMobileJson: string[] = [];
if (existsSync(generatedDir)) {
  for (const f of readdirSync(generatedDir)) {
    if (f === "mobile-scope-closure") continue;
    if (ALLOWED_GATE_REPORTS.has(f)) continue;
    if (/^(mobile|capacitor|android|ios|no-flutter|native-project)/i.test(f)) {
      strayMobileJson.push(f);
    }
  }
}

// ── 5. Final verification rollup ──────────────────────────────────
const checks = {
  honesty_doc_present: honestyDocPresent,
  capacitor_archived: archiveCapacitor && !capacitorAtRoot,
  mobile_manifest_archived: archiveInfra && !mobileManifestActive,
  mobile_dir_archived: archiveMobileDir && !mobileDirAtRoot,
  no_capacitor_deps: capacitorDeps.length === 0,
  install_surfaces_linked: allSurfacesLinked,
  no_stray_generated_mobile_truth: strayMobileJson.length === 0,
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
const ok = failed.length === 0;
const verification = {
  generatedAt: new Date().toISOString(),
  ok,
  status: ok ? "GREEN" : "RED",
  checks,
  failed_checks: failed,
  stray_generated_mobile_truth: strayMobileJson,
  capacitor_deps_remaining: capacitorDeps,
  acceptance: {
    native_mobile_out_of_scope: ok,
    no_maybe_ready_ambiguity: ok,
    install_surfaces_honest: allSurfacesLinked,
    artifacts_safely_contained: archiveCapacitor && archiveInfra && archiveMobileDir,
    reactivation_path_documented: existsSync(join(OUT_DIR, "MOBILE_REACTIVATION_CONDITIONS.md")),
  },
};
writeFileSync(
  join(OUT_DIR, "mobile-scope-verification.json"),
  JSON.stringify(verification, null, 2),
);

// ── 6. Final verification markdown ────────────────────────────────
const md = [
  "# Mobile Scope Closure — Final Verification",
  "",
  `> Generated: ${verification.generatedAt}`,
  `> Status: **${verification.status}**`,
  "",
  "## Acceptance criteria",
  "",
  "| Criterion | Pass |",
  "|---|---|",
  ...Object.entries(verification.acceptance).map(
    ([k, v]) => `| ${k.replace(/_/g, " ")} | ${v ? "✅" : "❌"} |`,
  ),
  "",
  "## Containment checks",
  "",
  "| Check | Pass |",
  "|---|---|",
  ...Object.entries(checks).map(([k, v]) => `| ${k.replace(/_/g, " ")} | ${v ? "✅" : "❌"} |`),
  "",
  failed.length > 0 ? `## Failed checks\n\n- ${failed.join("\n- ")}` : "",
  "",
  "## Surfaces audited",
  "",
  "| Surface | Path | Honesty link |",
  "|---|---|---|",
  ...surfaceResults.map(
    (s) => `| ${s.key} | \`${s.path}\` | ${s.links_honesty_doc ? "✅" : "❌"} |`,
  ),
  "",
  "## References",
  "",
  "- `docs/MOBILE_HONESTY.md`",
  "- `generated/mobile-scope-closure/MOBILE_SCOPE_CANONICAL_MODEL.md`",
  "- `generated/mobile-scope-closure/MOBILE_SCOPE_REFERENCE_AUDIT.md`",
  "- `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md`",
  "- `archive/mobile/ARCHIVED.md`",
].join("\n");
writeFileSync(join(OUT_DIR, "MOBILE_SCOPE_FINAL_VERIFICATION.md"), md);

console.log(`mobile-scope-closure: ${verification.status}`);
console.log(`  honesty doc:        ${honestyDocPresent ? "ok" : "MISSING"}`);
console.log(`  capacitor archived: ${archiveCapacitor && !capacitorAtRoot ? "ok" : "DRIFT"}`);
console.log(`  capacitor deps:     ${capacitorDeps.length}`);
console.log(`  install honesty:    ${allSurfacesLinked ? "ok" : "MISSING"}`);
console.log(`  stray mobile JSON:  ${strayMobileJson.length}`);
process.exit(ok ? 0 : 1);

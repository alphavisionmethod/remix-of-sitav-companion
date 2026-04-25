#!/usr/bin/env tsx
/**
 * SITA OS — Platform ↔ Admin Capability/Surface Map Generator (Wave 0.8)
 *
 * Walks every src/platform/<system>/pages/**.tsx and classifies each
 * file as one of:
 *   - capability-page    : end-user product surface owned by the capability
 *   - operator-surface   : admin/operator dashboard that should live in src/admin/
 *   - end-user-surface   : product surface for users (TrustCenter, Approvals)
 *   - ambiguous          : flagged for human triage
 *
 * Authority: Constitution Rules 36–38.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const PLATFORM_DIR = join(ROOT, "src", "platform");
const ADMIN_MODULES_DIR = join(ROOT, "src", "admin", "modules");
const OUT_FILE = join(ROOT, "generated", "manifests", "platform-admin-capability-surface-map.json");
const PAGES_DIR = join(ROOT, "src", "pages");
const SUBCLASS_MAP_PATH = join(ROOT, "generated", "manifests", "platform-subclassification-map.json");
const NOW = new Date().toISOString();
const SCHEMA_VERSION = 1;

type Classification = "capability-page" | "operator-surface" | "end-user-surface" | "ambiguous";

/** Strong operator/admin name signals. */
const OPERATOR_PATTERNS = [
  /Dashboard$/i,
  /Audit$/i,
  /Console$/i,
  /Board$/i,
  /Operator/i,
  /Admin/i,
  /Triage/i,
  /Inspector$/i,
  /Diagnostics?$/i,
  /Monitoring$/i,
  /Replay/i,
  /SystemStatus/i,
  /ServiceArchitecture/i,
];

/** Strong end-user signals (these are product surfaces, not operator surfaces). */
const END_USER_PATTERNS = [
  /^TrustCenter$/i,
  /^Approval(s)?(Center|Chamber)$/i,
  /Wizard$/i,
  /^Setup/i,
  /^Onboarding/i,
  /^PersonalBrain/i,
  /^Workspace/i,
  /^MyAccount/i,
  /^Marketing/i,
  /^Beta$/i,
  /^Press$/i,
  /^Investors$/i,
  /^Donate$/i,
  /^Waitlist$/i,
];

/** Manual overrides — explicit human classifications. */
const OVERRIDES: Record<string, Classification> = {
  // platform/observability — operator-control subclass, all operator surfaces
  "src/platform/observability/pages/ObservabilityPage.tsx": "operator-surface",
  "src/platform/observability/pages/ServiceArchitectureDashboard.tsx": "operator-surface",
  "src/platform/observability/pages/SystemStatus.tsx": "operator-surface",
  "src/platform/observability/pages/SpilloverDashboard.tsx": "operator-surface",
  "src/platform/observability/pages/NetworkUtility.tsx": "operator-surface",
  "src/platform/observability/pages/TimeMachinePage.tsx": "operator-surface",
  "src/platform/observability/pages/WorkflowReplayHub.tsx": "operator-surface",

  // platform/governance — operator-only board
  "src/platform/governance/pages/GovernanceDashboard.tsx": "operator-surface",

  // platform/trust — mix of end-user (TrustCenter, Approvals) and operator (TrustAudit, PolicyEditor)
  "src/platform/trust/pages/TrustCenter.tsx": "end-user-surface",
  "src/platform/trust/pages/TrustHome.tsx": "end-user-surface",
  "src/platform/trust/pages/ApprovalsCenter.tsx": "end-user-surface",
  "src/platform/trust/pages/ApprovalChamber.tsx": "end-user-surface",
  "src/platform/trust/pages/PermissionsCenter.tsx": "end-user-surface",
  "src/platform/trust/pages/ProofCenter.tsx": "end-user-surface",
  "src/platform/trust/pages/TrustAudit.tsx": "operator-surface",
  "src/platform/trust/pages/TrustApprovals.tsx": "operator-surface",
  "src/platform/trust/pages/TrustReceipts.tsx": "operator-surface",
  "src/platform/trust/pages/TrustDecisions.tsx": "operator-surface",
  "src/platform/trust/pages/TrustCoverage.tsx": "operator-surface",
  "src/platform/trust/pages/TrustPermissions.tsx": "operator-surface",
  "src/platform/trust/pages/TrustAutomationAuthority.tsx": "operator-surface",
  "src/platform/trust/pages/PolicyEditor.tsx": "operator-surface",
  "src/platform/trust/pages/PolicySimulatorHub.tsx": "operator-surface",

  // platform/atlas — entire system is operator-control
  // (relies on subclass-driven classification below)

  // platform/personal-brain — all end-user
  "src/platform/personal-brain/pages/PersonalBrain.tsx": "end-user-surface",

  // platform/setup, platform/marketing, platform/auth — all end-user
};

function ensureDir(p: string) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }
function writeJson(file: string, data: unknown) {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(e.name)) out.push(full);
  }
  return out;
}

function logicalLineCount(src: string): number {
  let n = 0; let inBlock = false;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (inBlock) { if (line.includes("*/")) inBlock = false; continue; }
    if (line.startsWith("/*")) { if (!line.includes("*/")) inBlock = true; continue; }
    if (line.startsWith("//")) continue;
    n++;
  }
  return n;
}

function classifyByName(basename: string): Classification | null {
  const stem = basename.replace(/\.tsx$/, "");
  for (const pat of END_USER_PATTERNS) if (pat.test(stem)) return "end-user-surface";
  for (const pat of OPERATOR_PATTERNS) if (pat.test(stem)) return "operator-surface";
  return null;
}

function recommendAdminTarget(filePath: string, basename: string): string {
  // src/platform/<system>/pages/<X>.tsx -> src/admin/modules/<system>/views/<X>.tsx
  const m = filePath.match(/src\/platform\/([^/]+)\/pages\/(.+)$/);
  if (!m) return "";
  const [, system, file] = m;
  // Map platform system -> closest admin domain.
  const SYSTEM_TO_ADMIN_DOMAIN: Record<string, string> = {
    observability: "health",
    governance: "trust-security",
    trust: "trust-security",
    verification: "verification",
    security: "trust-security",
    operations: "support",
    "mission-control": "overview",
    atlas: "verification",
    architecture: "verification",
  };
  const domain = SYSTEM_TO_ADMIN_DOMAIN[system] ?? system;
  return `src/admin/modules/${domain}/views/${file}`;
}

function findRouteAdapter(stem: string): string | null {
  // Find any src/pages/**.tsx that re-exports the platform page.
  const re = new RegExp(`from\\s+["']@/platform/[^"']+/pages/${stem}["']`);
  function search(dir: string): string | null {
    if (!existsSync(dir)) return null;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        const found = search(full);
        if (found) return found;
      } else if (e.name === `${stem}.tsx`) {
        try {
          const body = readFileSync(full, "utf8");
          if (re.test(body)) return relative(ROOT, full).split(/[\\/]/).join("/");
        } catch {}
      }
    }
    return null;
  }
  return search(PAGES_DIR);
}

// ── Load subclass map ─────────────────────────────────────────────────────
if (!existsSync(SUBCLASS_MAP_PATH)) {
  console.error("❌ platform-subclassification-map.json missing. Run the platform subclass generator first.");
  process.exit(1);
}
const subclassMap = JSON.parse(readFileSync(SUBCLASS_MAP_PATH, "utf8")) as {
  folders: Array<{ folder: string; subclass: string; disposition: string }>;
};
const folderToSubclass = new Map(subclassMap.folders.map((f) => [f.folder, f.subclass]));

// ── Walk all platform pages ───────────────────────────────────────────────
const allPages: string[] = [];
for (const sub of readdirSync(PLATFORM_DIR, { withFileTypes: true })) {
  if (!sub.isDirectory()) continue;
  const pagesDir = join(PLATFORM_DIR, sub.name, "pages");
  if (!existsSync(pagesDir)) continue;
  walk(pagesDir, allPages);
}

const entries = allPages.map((file) => {
  const rel = relative(ROOT, file).split(/[\\/]/).join("/");
  const m = rel.match(/^src\/platform\/([^/]+)\//);
  const system = m ? m[1] : "";
  const basename = rel.split("/").pop() ?? "";
  const stem = basename.replace(/\.tsx$/, "");
  const subclass = folderToSubclass.get(system) ?? "unknown";
  const src = readFileSync(file, "utf8");
  const lines = logicalLineCount(src);

  // Classification priority:
  //   1. Manual override
  //   2. Subclass = operator-control AND not matched by END_USER_PATTERNS → operator-surface
  //   3. Name pattern match
  //   4. ambiguous
  let classification: Classification;
  if (OVERRIDES[rel]) {
    classification = OVERRIDES[rel];
  } else if (subclass === "operator-control" && !END_USER_PATTERNS.some((p) => p.test(stem))) {
    classification = "operator-surface";
  } else {
    const named = classifyByName(basename);
    if (named === "operator-surface" && subclass !== "operator-control" && subclass !== "governance") {
      // Name says operator but subclass is product/intelligence — likely end-user dashboard.
      classification = "ambiguous";
    } else if (named) {
      classification = named;
    } else {
      // Default: capability-page if pure-reexport, else end-user-surface.
      classification = lines <= 5 ? "capability-page" : "end-user-surface";
    }
  }

  return {
    currentPath: rel,
    system,
    subclass,
    classification,
    logicalLines: lines,
    recommendedAdminTarget:
      classification === "operator-surface" ? recommendAdminTarget(rel, basename) : null,
    routeAdapterPath: findRouteAdapter(stem),
  };
});

const counts = entries.reduce(
  (acc, e) => {
    acc[e.classification] = (acc[e.classification] ?? 0) + 1;
    return acc;
  },
  {} as Record<Classification, number>,
);

writeJson(OUT_FILE, {
  generatedAt: NOW,
  schemaVersion: SCHEMA_VERSION,
  rule: "Constitution Rules 36–38 — platform ↔ admin capability/surface map",
  description:
    "Every src/platform/<system>/pages/*.tsx classified as capability-page, operator-surface, end-user-surface, or ambiguous. operator-surface files SHOULD migrate to src/admin/modules/<domain>/views/.",
  totalFiles: entries.length,
  byClassification: counts,
  bySystem: entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.system] = (acc[e.system] ?? 0) + 1;
    return acc;
  }, {}),
  entries,
});

console.log(
  `✅ platform-admin-capability-surface-map: ${entries.length} files | ` +
    Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", "),
);
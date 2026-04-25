#!/usr/bin/env tsx
/**
 * SITA OS — Admin Plane Ownership Map Generator (Wave 0.6)
 *
 * Authority: Constitution Rules 29–32 (Admin Plane Law).
 *
 * Walks src/pages/admin/** and classifies every .tsx file as either:
 *   - THIN_ADAPTER : ≤10 logical lines AND re-exports from @/admin/**
 *   - LEGACY_PAGE_BODY : a page body that should ratchet down toward @/admin/**
 *
 * Emits:
 *   generated/manifests/admin-plane-ownership-map.json
 *   generated/manifests/admin-page-body-baseline.json (only on first run)
 *   generated/manifests/admin-dependency-violation-baseline.json (only on first run)
 *
 * Run:  npx tsx scripts/manifests/generate/generate-admin-plane-ownership-map.ts
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PAGES_ADMIN = join(ROOT, "src", "pages", "admin");
const PLATFORM = join(ROOT, "src", "platform");
const MODULES = join(ROOT, "src", "modules");
const ADMIN = join(ROOT, "src", "admin");
const MANIFEST_DIR = join(ROOT, "generated", "manifests");
const NOW = new Date().toISOString();

// 12 canonical admin domains (must mirror docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md).
const KNOWN_DOMAINS = [
  "overview",
  "alerts",
  "approvals",
  "environments",
  "ai-runtime",
  "integrations",
  "trust-security",
  "health",
  "releases",
  "verification",
  "config",
  "support",
] as const;

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function writeJson(file: string, data: unknown) {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function logicalLineCount(src: string): number {
  // Count non-blank, non-comment lines.
  let inBlock = false;
  let n = 0;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (inBlock) {
      if (line.includes("*/")) inBlock = false;
      continue;
    }
    if (line.startsWith("/*")) {
      if (!line.includes("*/")) inBlock = true;
      continue;
    }
    if (line.startsWith("//")) continue;
    n++;
  }
  return n;
}

const ADMIN_REEXPORT_RE = /from\s+["']@\/admin\//;

function classifyAdminPage(file: string): {
  kind: "THIN_ADAPTER" | "LEGACY_PAGE_BODY";
  logicalLines: number;
  canonicalPath: string | null;
} {
  const src = readFileSync(file, "utf8");
  const logical = logicalLineCount(src);
  const reExports = ADMIN_REEXPORT_RE.test(src);
  if (reExports && logical <= 10) {
    const m = src.match(/from\s+["'](@\/admin\/[^"']+)["']/);
    return { kind: "THIN_ADAPTER", logicalLines: logical, canonicalPath: m ? m[1] : null };
  }
  return { kind: "LEGACY_PAGE_BODY", logicalLines: logical, canonicalPath: null };
}

function inferDomain(relPath: string): string {
  // src/pages/admin/<domain-or-file>/...
  const parts = relPath.split(sep);
  const head = parts[3] ?? "";
  if (KNOWN_DOMAINS.includes(head as (typeof KNOWN_DOMAINS)[number])) return head;
  // Top-level files use prefix heuristics from the existing admin IA.
  const base = parts[parts.length - 1].toLowerCase();
  if (base.startsWith("ai") || base.includes("advisor") || base.includes("provider")) return "ai-runtime";
  if (base.startsWith("alert") || base.startsWith("incident")) return "alerts";
  if (base.startsWith("hq") || base.includes("approval") || base.startsWith("autonomy")) return "approvals";
  if (base.includes("connector") || base.includes("integration") || base.includes("oauth")) return "integrations";
  if (base.includes("security") || base.includes("policy") || base.includes("trust") || base.includes("audit") || base.includes("kill")) return "trust-security";
  if (base.includes("health") || base.includes("fleet") || base.includes("performance") || base.includes("observability") || base.includes("storage")) return "health";
  if (base.includes("release") || base.includes("deploy") || base.includes("rollout")) return "releases";
  if (base.includes("verif") || base.includes("truth") || base.includes("reality") || base.includes("conformance") || base.includes("journey")) return "verification";
  if (base.includes("recovery") || base.includes("support") || base.includes("replay") || base.includes("diagnost")) return "support";
  if (base.includes("environment") || base.includes("user") || base.includes("device") || base.includes("session")) return "environments";
  if (base.includes("config") || base.includes("flag") || base.includes("template")) return "config";
  return "overview";
}

// ── 1. Classify every src/pages/admin/* file ────────────────────────────────
const allAdminPages = walk(PAGES_ADMIN);
const entries = allAdminPages.map((file) => {
  const rel = relative(ROOT, file);
  const c = classifyAdminPage(file);
  return {
    file: rel.split(sep).join("/"),
    kind: c.kind,
    logicalLines: c.logicalLines,
    canonicalPath: c.canonicalPath,
    domain: inferDomain(rel),
  };
});

const legacyCount = entries.filter((e) => e.kind === "LEGACY_PAGE_BODY").length;
const adapterCount = entries.filter((e) => e.kind === "THIN_ADAPTER").length;

// ── 2. Scan platform→admin and modules→admin imports ───────────────────────
const PLATFORM_ADMIN_IMPORT_RE = /from\s+["']@\/admin\//;
function scanForAdminImports(root: string): string[] {
  const offenders: string[] = [];
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    if (PLATFORM_ADMIN_IMPORT_RE.test(src)) {
      offenders.push(relative(ROOT, file).split(sep).join("/"));
    }
  }
  return offenders;
}
const platformOffenders = scanForAdminImports(PLATFORM);
const moduleOffenders = scanForAdminImports(MODULES);

// ── 3. Scan admin→modules imports (inverse) ────────────────────────────────
const MODULES_IMPORT_RE = /from\s+["']@\/modules\/(?!_shared|_trust)[a-z-]+\//;
function scanAdminToModules(): string[] {
  const offenders: string[] = [];
  for (const file of walk(ADMIN)) {
    const src = readFileSync(file, "utf8");
    if (MODULES_IMPORT_RE.test(src)) {
      offenders.push(relative(ROOT, file).split(sep).join("/"));
    }
  }
  return offenders;
}
const adminToModuleOffenders = scanAdminToModules();

ensureDir(MANIFEST_DIR);

// ── 4. Emit ownership map (always overwrites) ───────────────────────────────
writeJson(join(MANIFEST_DIR, "admin-plane-ownership-map.json"), {
  generatedAt: NOW,
  schemaVersion: 1,
  rule: "Constitution Rules 29–32 (Admin Plane Law)",
  description:
    "Classification of every src/pages/admin/* file as THIN_ADAPTER or LEGACY_PAGE_BODY, plus admin↔platform↔modules dependency inventory.",
  pagesAdminFileCount: entries.length,
  thinAdapterCount: adapterCount,
  legacyPageBodyCount: legacyCount,
  domains: KNOWN_DOMAINS,
  knownAdapterTarget: "@/admin/modules/<domain>/views/<ViewName>",
  dependencyInventory: {
    platformImportingAdmin: platformOffenders,
    moduleImportingAdmin: moduleOffenders,
    adminImportingModules: adminToModuleOffenders,
  },
  entries,
});

// ── 5. Seed monotone ratchet baselines (only on first run) ──────────────────
const baselinePath = join(MANIFEST_DIR, "admin-page-body-baseline.json");
if (!existsSync(baselinePath)) {
  writeJson(baselinePath, {
    generatedAt: NOW,
    schemaVersion: 1,
    rule: "Constitution Rule 30 — admin page-body monotone ratchet",
    description:
      "Snapshot of LEGACY_PAGE_BODY count under src/pages/admin/. New PRs may only DECREASE this count. Bodies must migrate to @/admin/modules/<domain>/views/.",
    direction: "decrease-only",
    enforcer: "scripts/architecture/check-admin-page-body-ratchet.ts",
    legacyPageBodyCount: legacyCount,
    thinAdapterCount: adapterCount,
    sealedAt: NOW,
  });
}

const depBaselinePath = join(MANIFEST_DIR, "admin-dependency-violation-baseline.json");
if (!existsSync(depBaselinePath)) {
  writeJson(depBaselinePath, {
    generatedAt: NOW,
    schemaVersion: 1,
    rule: "Constitution Rule 31 — admin plane dependency direction",
    description:
      "Pre-existing platform→admin and modules→admin imports. Future PRs may only DECREASE these.",
    direction: "decrease-only",
    enforcer: "scripts/architecture/check-admin-plane-boundaries.ts",
    baselines: {
      platformImportingAdmin: platformOffenders,
      platformImportingAdminCount: platformOffenders.length,
      moduleImportingAdmin: moduleOffenders,
      moduleImportingAdminCount: moduleOffenders.length,
      adminImportingModules: adminToModuleOffenders,
      adminImportingModulesCount: adminToModuleOffenders.length,
    },
    sealedAt: NOW,
  });
}

console.log(
  `✅ admin-plane-ownership-map: ${entries.length} files (${adapterCount} adapters, ${legacyCount} legacy bodies); ` +
    `platform→admin=${platformOffenders.length}, modules→admin=${moduleOffenders.length}, admin→modules=${adminToModuleOffenders.length}`,
);

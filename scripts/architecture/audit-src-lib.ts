#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — src/lib Decomposition Audit (Wave 0)
//
// Read-only. Walks every file in src/lib, classifies it into one of:
//   domain | platform | runtime | data | integration | contract
//   | shared-internal | legacy
// Counts importers across the project, flags duplicates, and emits:
//   generated/lib-decomposition/src-lib-classification-map.json
//   generated/lib-decomposition/SRC_LIB_FULL_CLASSIFICATION_AUDIT.md
//   generated/lib-decomposition/SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const ROOT = process.cwd();
const LIB = path.join(ROOT, "src/lib");
const OUT = path.join(ROOT, "generated/lib-decomposition");
fs.mkdirSync(OUT, { recursive: true });

type Klass =
  | "domain"
  | "platform"
  | "runtime"
  | "data"
  | "integration"
  | "contract"
  | "shared-internal"
  | "legacy";

interface FileRecord {
  path: string;            // repo-relative
  rel: string;             // relative to src/lib
  topFolder: string;       // first segment under src/lib (or "<root>")
  loc: number;
  exports: string[];
  importerCount: number;
  topImporters: string[];
  klass: Klass;
  klassReason: string;
  targetPath: string;
  domainHint: string | null;
  isWrapperOnly: boolean;
  fingerprint: string;     // for duplicate detection
}

// ── walk ──────────────────────────────────────────────────────
function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) acc.push(p);
  }
  return acc;
}

const libFiles = walk(LIB);
console.log(`📂 Scanning ${libFiles.length} files under src/lib`);

// ── importers index (single pass over src) ────────────────────
const allSrcFiles = walk(path.join(ROOT, "src"));
const importerMap = new Map<string, Set<string>>(); // libPathKey → set of importer files

function libKeyFromImport(spec: string): string | null {
  // @/lib/foo/bar  →  src/lib/foo/bar  (no extension)
  const m = spec.match(/^@\/lib\/(.+)$/);
  if (!m) return null;
  return path.join("src/lib", m[1]).replace(/\\/g, "/");
}

const IMPORT_RE = /from\s+['"]([^'"]+)['"]/g;
for (const f of allSrcFiles) {
  if (f.startsWith(LIB)) continue; // intra-lib not counted as external pressure
  let content = "";
  try { content = fs.readFileSync(f, "utf8"); } catch { continue; }
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) {
    const libKey = libKeyFromImport(m[1]);
    if (!libKey) continue;
    if (!importerMap.has(libKey)) importerMap.set(libKey, new Set());
    importerMap.get(libKey)!.add(path.relative(ROOT, f));
  }
}
console.log(`🔗 Indexed ${importerMap.size} distinct @/lib import paths from external consumers`);

// resolve a libKey to actual file path — try .ts, .tsx, /index.ts, /index.tsx
function resolveImporter(libKey: string): string | null {
  const candidates = [
    `${libKey}.ts`,
    `${libKey}.tsx`,
    `${libKey}/index.ts`,
    `${libKey}/index.tsx`,
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(ROOT, c))) return c;
  }
  return null;
}

const fileImporters = new Map<string, Set<string>>();
for (const [libKey, importers] of importerMap) {
  const resolved = resolveImporter(libKey);
  if (!resolved) continue;
  if (!fileImporters.has(resolved)) fileImporters.set(resolved, new Set());
  for (const i of importers) fileImporters.get(resolved)!.add(i);
}

// ── classifier ───────────────────────────────────────────────
const FOLDER_CLASS: Record<string, { klass: Klass; target: string; reason: string }> = {
  // data layer
  "persistence":          { klass: "data", target: "src/data/persistence", reason: "Persistence adapters" },
  "sync-engine":          { klass: "data", target: "src/data/sync", reason: "Sync engine" },
  "db":                   { klass: "data", target: "src/data/clients", reason: "DB access helpers" },
  "data-services":        { klass: "data", target: "src/data/repositories", reason: "Data services / repository layer" },
  "storage":              { klass: "data", target: "src/data/persistence", reason: "Storage adapters" },
  "demo-data":            { klass: "data", target: "src/data/seed", reason: "Seed/demo data" },
  "mock-data":            { klass: "data", target: "src/data/seed", reason: "Mock data" },
  "seed":                 { klass: "data", target: "src/data/seed", reason: "Seed data" },
  "demo-scenarios":       { klass: "data", target: "src/data/seed", reason: "Demo scenarios" },
  "fixtures":             { klass: "data", target: "src/data/seed", reason: "Fixtures" },

  // runtime/substrate
  "runtime":              { klass: "runtime", target: "src/runtimes/core", reason: "Runtime core" },
  "devices":              { klass: "runtime", target: "src/runtimes/devices", reason: "Device runtime" },
  "surfaces":             { klass: "runtime", target: "src/runtimes/surfaces", reason: "Surface runtime" },
  "dual-reality":         { klass: "runtime", target: "src/runtimes/reality", reason: "Reality classification" },
  "reality":              { klass: "runtime", target: "src/runtimes/reality", reason: "Reality classification" },
  "reality-audit":        { klass: "runtime", target: "src/runtimes/reality", reason: "Reality audit" },
  "reality-records":      { klass: "runtime", target: "src/runtimes/reality", reason: "Reality records" },
  "detection":            { klass: "runtime", target: "src/runtimes/detection", reason: "Runtime detection" },
  "shell":                { klass: "runtime", target: "src/runtimes/shell", reason: "Shell runtime" },
  "windowing":            { klass: "runtime", target: "src/runtimes/shell", reason: "Window manager" },
  "compositor":           { klass: "runtime", target: "src/runtimes/shell", reason: "Compositor" },

  // platform
  "policy":               { klass: "platform", target: "src/platform/policy", reason: "Policy engine" },
  "observability":        { klass: "platform", target: "src/platform/observability", reason: "Observability" },
  "security":             { klass: "platform", target: "src/platform/security", reason: "Security" },
  "os-security":          { klass: "platform", target: "src/platform/security", reason: "OS security" },
  "support":              { klass: "platform", target: "src/platform/support", reason: "Support tooling" },
  "sovereign-ai-gateway": { klass: "platform", target: "src/platform/ai-gateway", reason: "Sovereign AI Gateway" },
  "ai-gateway":           { klass: "platform", target: "src/platform/ai-gateway", reason: "AI gateway" },
  "ai":                   { klass: "platform", target: "src/platform/ai", reason: "AI platform" },
  "ai-engineering":       { klass: "platform", target: "src/platform/ai", reason: "AI engineering" },
  "no-hallucination":     { klass: "platform", target: "src/platform/ai", reason: "Hallucination guard" },
  "verification":         { klass: "platform", target: "src/platform/verification", reason: "Verification" },
  "control-plane":        { klass: "platform", target: "src/platform/control-plane", reason: "Control plane" },
  "cloud-backbone":       { klass: "platform", target: "src/platform/cloud", reason: "Cloud backbone" },
  "platform":             { klass: "platform", target: "src/platform/core", reason: "Platform core" },
  "platform-plane":       { klass: "platform", target: "src/platform/core", reason: "Platform plane" },
  "platform-law":         { klass: "platform", target: "src/platform/governance", reason: "Platform governance" },
  "orchestration":        { klass: "platform", target: "src/platform/orchestration", reason: "Orchestration" },
  "operations":           { klass: "platform", target: "src/platform/operations", reason: "Operations" },
  "incidents":            { klass: "platform", target: "src/platform/operations", reason: "Incident management" },
  "compute-governance":   { klass: "platform", target: "src/platform/governance", reason: "Compute governance" },
  "capabilities":         { klass: "platform", target: "src/platform/capabilities", reason: "Capability registry" },
  "fip":                  { klass: "platform", target: "src/platform/fip", reason: "Feature Intake Process" },
  "ci":                   { klass: "platform", target: "src/platform/ci", reason: "CI infrastructure" },
  "deploy":               { klass: "platform", target: "src/platform/deploy", reason: "Deploy" },
  "deployment":           { klass: "platform", target: "src/platform/deploy", reason: "Deployment" },
  "migration":            { klass: "platform", target: "src/platform/migration", reason: "Migration tooling" },
  "architecture":         { klass: "platform", target: "src/platform/architecture", reason: "Architecture registries" },
  "meta-arch":            { klass: "platform", target: "src/platform/architecture", reason: "Meta architecture" },
  "truth-manifests":      { klass: "platform", target: "src/platform/truth", reason: "Truth manifests" },
  "backend-topology":     { klass: "platform", target: "src/platform/topology", reason: "Backend topology" },
  "auth":                 { klass: "platform", target: "src/platform/auth", reason: "Auth" },
  "core-services":        { klass: "platform", target: "src/platform/core-services", reason: "Core services (per-file split in Wave 7b)" },
  "nova-sdk":             { klass: "platform", target: "src/platform/nova-sdk", reason: "Nova SDK kernel" },
  "os-services":          { klass: "platform", target: "src/platform/os-services", reason: "OS services" },
  "trust":                { klass: "platform", target: "src/platform/trust", reason: "Trust" },
  "proof":                { klass: "platform", target: "src/platform/proof", reason: "Proof" },
  "receipts":             { klass: "platform", target: "src/platform/proof", reason: "Receipts" },
  "kill-switch":          { klass: "platform", target: "src/platform/governance", reason: "Kill switches" },
  "kill-switches":        { klass: "platform", target: "src/platform/governance", reason: "Kill switches" },
  "release":              { klass: "platform", target: "src/platform/deploy", reason: "Release" },
  "releases":             { klass: "platform", target: "src/platform/deploy", reason: "Releases" },
  "feature-flags":        { klass: "platform", target: "src/platform/feature-flags", reason: "Feature flags" },
  "tenancy":              { klass: "platform", target: "src/platform/tenancy", reason: "Tenancy" },
  "search":               { klass: "platform", target: "src/platform/search", reason: "Search fabric" },
  "notifications":        { klass: "platform", target: "src/platform/notifications", reason: "Notifications" },
  "messaging":            { klass: "platform", target: "src/platform/eventing", reason: "Messaging" },
  "events":               { klass: "platform", target: "src/platform/eventing", reason: "Eventing" },
  "eventing":             { klass: "platform", target: "src/platform/eventing", reason: "Eventing" },
  "execution":            { klass: "platform", target: "src/platform/execution", reason: "Execution" },
  "executor":             { klass: "platform", target: "src/platform/execution", reason: "Executor" },
  "approvals":            { klass: "platform", target: "src/platform/governance", reason: "Approvals" },
  "governance":           { klass: "platform", target: "src/platform/governance", reason: "Governance" },
  "launch":               { klass: "platform", target: "src/platform/launch", reason: "Launch readiness" },

  // domains
  "boardroom":            { klass: "domain", target: "src/domains/boardroom", reason: "Boardroom domain" },
  "investment-office":    { klass: "domain", target: "src/domains/investment", reason: "Investment domain" },
  "advisor-intelligence": { klass: "domain", target: "src/domains/advisors", reason: "Advisors" },
  "advisor-protocol":     { klass: "domain", target: "src/domains/advisors", reason: "Advisors" },
  "strategic-intelligence": { klass: "domain", target: "src/domains/strategic-intelligence", reason: "Strategic intelligence" },
  "intelligence-architecture": { klass: "domain", target: "src/domains/strategic-intelligence", reason: "Intelligence" },
  "customer-journey":     { klass: "domain", target: "src/domains/customer-journey", reason: "Customer journey" },
  "setup":                { klass: "domain", target: "src/domains/setup", reason: "Setup" },
  "internal-agents":      { klass: "domain", target: "src/domains/ai-workforce", reason: "Internal agents" },
  "admin-ai":             { klass: "domain", target: "src/domains/ai-workforce", reason: "Admin AI" },
  "app-platform":         { klass: "domain", target: "src/domains/apps", reason: "App platform" },
  "pack-store":           { klass: "domain", target: "src/domains/apps", reason: "Pack store" },
  "ux-trust":             { klass: "domain", target: "src/domains/ux-trust", reason: "UX trust" },
  "delivery-methodology": { klass: "domain", target: "src/domains/delivery", reason: "Delivery methodology" },
  "engines":              { klass: "domain", target: "src/domains/engines", reason: "Domain engines" },
  "domain-engines":       { klass: "domain", target: "src/domains/engines", reason: "Domain engines" },
  "domain-system":        { klass: "domain", target: "src/domains/shared", reason: "Domain system shared" },
  "boardrooms":           { klass: "domain", target: "src/domains/boardroom", reason: "Boardrooms" },
  "money":                { klass: "domain", target: "src/domains/finance", reason: "Money domain" },
  "finance":              { klass: "domain", target: "src/domains/finance", reason: "Finance domain" },
  "concierge":            { klass: "domain", target: "src/domains/concierge", reason: "Concierge" },
  "files":                { klass: "domain", target: "src/domains/files", reason: "Files" },
  "communications":       { klass: "domain", target: "src/domains/communications", reason: "Communications" },
  "mission-control":      { klass: "domain", target: "src/domains/mission-control", reason: "Mission control" },
  "business":             { klass: "domain", target: "src/domains/business", reason: "Business domain" },
  "workflows":            { klass: "domain", target: "src/domains/workflows", reason: "Workflows" },

  // integrations
  "integrations":         { klass: "integration", target: "src/integrations/external", reason: "External integrations" },
  "shopify":              { klass: "integration", target: "src/integrations/shopify", reason: "Shopify" },
  "api":                  { klass: "integration", target: "src/integrations/api", reason: "API clients" },
  "connectors":           { klass: "integration", target: "src/integrations/connectors", reason: "Connectors" },
  "providers":            { klass: "integration", target: "src/integrations/providers", reason: "Providers" },
  "oauth":                { klass: "integration", target: "src/integrations/oauth", reason: "OAuth" },
  "webhooks":             { klass: "integration", target: "src/integrations/webhooks", reason: "Webhooks" },

  // contracts
  "contracts":            { klass: "contract", target: "src/contracts", reason: "Contracts" },
  "types":                { klass: "contract", target: "src/contracts/types", reason: "Types" },
  "constants":            { klass: "contract", target: "src/contracts/constants", reason: "Constants" },
  "schemas":              { klass: "contract", target: "src/contracts/schemas", reason: "Schemas" },

  // shared-internal (stays put or moves to /utils)
  "utils":                { klass: "shared-internal", target: "src/lib/utils", reason: "Shared utility" },
  "hooks":                { klass: "shared-internal", target: "src/hooks", reason: "Hooks → src/hooks" },

  // legacy candidates
  "canonical-backend":    { klass: "legacy", target: "src/legacy/canonical-backend", reason: "Legacy canonical-backend experiment" },
  "simulation":           { klass: "legacy", target: "src/legacy/simulation", reason: "Simulation" },
};

// services/* requires per-subfolder routing — handled below
const SERVICES_SUBFOLDER_CLASS: Record<string, { klass: Klass; target: string; reason: string }> = {
  "business-os":          { klass: "domain", target: "src/domains/business", reason: "Business OS service" },
  "boardroom":            { klass: "domain", target: "src/domains/boardroom", reason: "Boardroom service" },
  "concierge":            { klass: "domain", target: "src/domains/concierge", reason: "Concierge service" },
  "money":                { klass: "domain", target: "src/domains/finance", reason: "Money service" },
  "finance":              { klass: "domain", target: "src/domains/finance", reason: "Finance service" },
  "files":                { klass: "domain", target: "src/domains/files", reason: "Files service" },
  "communications":       { klass: "domain", target: "src/domains/communications", reason: "Comms service" },
  "mission-control":      { klass: "domain", target: "src/domains/mission-control", reason: "Mission control service" },
  "advisors":             { klass: "domain", target: "src/domains/advisors", reason: "Advisors service" },
  "workflows":            { klass: "domain", target: "src/domains/workflows", reason: "Workflows service" },
  "ai-workforce":         { klass: "domain", target: "src/domains/ai-workforce", reason: "AI workforce service" },
  "investment":           { klass: "domain", target: "src/domains/investment", reason: "Investment service" },
  "projection-service":   { klass: "data", target: "src/data/projections", reason: "Projection (read model)" },
  "sync":                 { klass: "data", target: "src/data/sync", reason: "Sync service" },
  "auth":                 { klass: "platform", target: "src/platform/auth", reason: "Auth service" },
  "policy":               { klass: "platform", target: "src/platform/policy", reason: "Policy service" },
  "observability":        { klass: "platform", target: "src/platform/observability", reason: "Observability service" },
  "support":              { klass: "platform", target: "src/platform/support", reason: "Support service" },
  "ai":                   { klass: "platform", target: "src/platform/ai", reason: "AI service" },
  "search":               { klass: "platform", target: "src/platform/search", reason: "Search service" },
  "notifications":        { klass: "platform", target: "src/platform/notifications", reason: "Notification service" },
  "trust":                { klass: "platform", target: "src/platform/trust", reason: "Trust service" },
  "proof":                { klass: "platform", target: "src/platform/proof", reason: "Proof service" },
  "execution":            { klass: "platform", target: "src/platform/execution", reason: "Execution service" },
};

const ROOT_FILE_CLASS: Record<string, { klass: Klass; target: string; reason: string }> = {
  "utils.ts":                       { klass: "shared-internal", target: "src/lib/utils.ts", reason: "Hot path 763 importers — keeps current canonical home" },
  "supabase-helpers.ts":            { klass: "integration", target: "src/integrations/supabase/helpers.ts", reason: "Supabase helpers (366 importers)" },
  "business-launcher.ts":           { klass: "domain", target: "src/domains/business/launcher.ts", reason: "Business launcher" },
  "finance-launcher.ts":            { klass: "domain", target: "src/domains/finance/launcher.ts", reason: "Finance launcher" },
  "concierge-launcher.ts":          { klass: "domain", target: "src/domains/concierge/launcher.ts", reason: "Concierge launcher" },
  "mission-control-launcher.ts":    { klass: "domain", target: "src/domains/mission-control/launcher.ts", reason: "Mission control launcher" },
  "app-store-launcher.ts":          { klass: "domain", target: "src/domains/apps/launcher.ts", reason: "App store launcher" },
  "business-journey-config.ts":     { klass: "domain", target: "src/domains/business/journey-config.ts", reason: "Business journey" },
  "advisor-topology.ts":            { klass: "domain", target: "src/domains/advisors/topology.ts", reason: "Advisor topology" },
  "cross-domain.ts":                { klass: "domain", target: "src/domains/shared/cross-domain.ts", reason: "Cross-domain" },
  "continuity-engine.ts":           { klass: "domain", target: "src/domains/shared/continuity-engine.ts", reason: "Continuity engine" },
  "export-engine.ts":               { klass: "domain", target: "src/domains/shared/export-engine.ts", reason: "Export engine" },
  "offline-db.ts":                  { klass: "data", target: "src/data/persistence/offline-db.ts", reason: "Offline DB" },
};

function classify(file: string, rel: string, content: string): { klass: Klass; target: string; reason: string; domainHint: string | null } {
  const segments = rel.split(path.sep);
  const top = segments[0];

  // root-level loose files
  if (segments.length === 1 && ROOT_FILE_CLASS[top]) {
    const c = ROOT_FILE_CLASS[top];
    return { ...c, domainHint: null };
  }

  // services/<sub>/...
  if (top === "services" && segments.length >= 2) {
    const sub = segments[1];
    const c = SERVICES_SUBFOLDER_CLASS[sub];
    if (c) {
      const tail = segments.slice(2).join("/");
      return { klass: c.klass, target: tail ? `${c.target}/${tail}` : c.target, reason: `services/${sub}: ${c.reason}`, domainHint: sub };
    }
    // unknown service subfolder → platform default with explicit per-file flag
    return {
      klass: "platform",
      target: `src/platform/services-unclassified/${segments.slice(1).join("/")}`,
      reason: `services/${sub} unclassified — needs per-file review in Wave 7b`,
      domainHint: sub,
    };
  }

  // top-level folder lookup
  if (top && FOLDER_CLASS[top]) {
    const c = FOLDER_CLASS[top];
    const tail = segments.slice(1).join("/");
    return { klass: c.klass, target: tail ? `${c.target}/${tail}` : c.target, reason: c.reason, domainHint: null };
  }

  // unmatched → legacy review
  return {
    klass: "legacy",
    target: `src/legacy/unclassified/${rel}`,
    reason: `Top folder "${top}" not in classifier — flagged for manual review`,
    domainHint: null,
  };
}

// ── exports parsing ──────────────────────────────────────────
const EXPORT_NAME_RE = /^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z0-9_$]+)/gm;
const EXPORT_LIST_RE = /^\s*export\s*\{([^}]+)\}/gm;

function extractExports(src: string): string[] {
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = EXPORT_NAME_RE.exec(src)) !== null) set.add(m[1]);
  while ((m = EXPORT_LIST_RE.exec(src)) !== null) {
    for (const part of m[1].split(",")) {
      const name = part.split(/\s+as\s+/i).pop()!.trim().replace(/[{}]/g, "");
      if (name) set.add(name);
    }
  }
  return [...set].sort();
}

function isWrapperOnly(src: string): boolean {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map(l => l.replace(/\/\/.*$/, ""))
    .filter(l => l.trim().length > 0);
  if (stripped.length > 25) return false;
  return stripped.every(l => /^(export|import|\}|from|\{)/.test(l.trim()));
}

// ── build records ────────────────────────────────────────────
const records: FileRecord[] = [];
const fingerprintGroups = new Map<string, string[]>();

for (const abs of libFiles) {
  const repoRel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const libRel = path.relative(LIB, abs);
  const top = libRel.split(path.sep)[0] || "<root>";
  let content = "";
  try { content = fs.readFileSync(abs, "utf8"); } catch { content = ""; }
  const exports = extractExports(content);
  const wrapper = isWrapperOnly(content);
  const cls = classify(abs, libRel, content);
  const importers = fileImporters.get(repoRel) ?? new Set<string>();
  const fp = crypto.createHash("md5").update(exports.join(",") + ":" + (content.length)).digest("hex").slice(0, 12);
  if (exports.length > 0) {
    if (!fingerprintGroups.has(fp)) fingerprintGroups.set(fp, []);
    fingerprintGroups.get(fp)!.push(repoRel);
  }
  records.push({
    path: repoRel,
    rel: libRel.replace(/\\/g, "/"),
    topFolder: top,
    loc: content.split("\n").length,
    exports,
    importerCount: importers.size,
    topImporters: [...importers].slice(0, 5),
    klass: cls.klass,
    klassReason: cls.reason,
    targetPath: cls.target.replace(/\\/g, "/"),
    domainHint: cls.domainHint,
    isWrapperOnly: wrapper,
    fingerprint: fp,
  });
}

// ── summaries ────────────────────────────────────────────────
const byClass: Record<Klass, number> = {
  domain: 0, platform: 0, runtime: 0, data: 0,
  integration: 0, contract: 0, "shared-internal": 0, legacy: 0,
};
const byTopFolder: Record<string, { total: number; classes: Record<string, number> }> = {};
const topConsumed: FileRecord[] = [];

for (const r of records) {
  byClass[r.klass]++;
  if (!byTopFolder[r.topFolder]) byTopFolder[r.topFolder] = { total: 0, classes: {} };
  byTopFolder[r.topFolder].total++;
  byTopFolder[r.topFolder].classes[r.klass] = (byTopFolder[r.topFolder].classes[r.klass] || 0) + 1;
}
records.sort((a, b) => b.importerCount - a.importerCount);
topConsumed.push(...records.slice(0, 30));

// duplicates
const duplicates = [...fingerprintGroups.entries()]
  .filter(([, files]) => files.length > 1)
  .map(([fp, files]) => ({ fingerprint: fp, files }));

// ── write JSON ───────────────────────────────────────────────
const json = {
  generatedAt: new Date().toISOString(),
  totals: {
    files: records.length,
    importedExternally: records.filter(r => r.importerCount > 0).length,
    wrapperOnly: records.filter(r => r.isWrapperOnly).length,
    byClass,
  },
  byTopFolder,
  duplicates,
  records,
};
fs.writeFileSync(path.join(OUT, "src-lib-classification-map.json"), JSON.stringify(json, null, 2));

// ── write audit MD ───────────────────────────────────────────
const md: string[] = [];
md.push("# SITA OS — src/lib Full Classification Audit (Wave 0)\n");
md.push(`Generated: ${json.generatedAt}\n`);
md.push("## Totals\n");
md.push(`- **Files scanned:** ${records.length}`);
md.push(`- **Imported externally:** ${json.totals.importedExternally}`);
md.push(`- **Wrapper-only files:** ${json.totals.wrapperOnly}`);
md.push("");
md.push("### By classification\n");
md.push("| Class | Count |");
md.push("|-------|------:|");
for (const [k, v] of Object.entries(byClass)) md.push(`| ${k} | ${v} |`);
md.push("");
md.push("## By top-level folder\n");
md.push("| Folder | Files | Dominant class | Class breakdown |");
md.push("|--------|------:|----------------|-----------------|");
const sortedFolders = Object.entries(byTopFolder).sort((a, b) => b[1].total - a[1].total);
for (const [folder, info] of sortedFolders) {
  const sortedClasses = Object.entries(info.classes).sort((a, b) => b[1] - a[1]);
  const dominant = sortedClasses[0]?.[0] ?? "?";
  const breakdown = sortedClasses.map(([k, v]) => `${k}:${v}`).join(", ");
  md.push(`| \`${folder}\` | ${info.total} | ${dominant} | ${breakdown} |`);
}
md.push("");
md.push("## Top 30 most-consumed files (highest blast radius)\n");
md.push("| Importers | File | Class | Target |");
md.push("|----------:|------|-------|--------|");
for (const r of topConsumed) {
  md.push(`| ${r.importerCount} | \`${r.path}\` | ${r.klass} | \`${r.targetPath}\` |`);
}
md.push("");
md.push("## Wrapper-only files (likely already deprecated bridges)\n");
const wrappers = records.filter(r => r.isWrapperOnly).slice(0, 50);
md.push(`Total wrapper-only: ${records.filter(r => r.isWrapperOnly).length}. Showing first 50:\n`);
md.push("| File | Importers | Target |");
md.push("|------|----------:|--------|");
for (const r of wrappers) md.push(`| \`${r.path}\` | ${r.importerCount} | \`${r.targetPath}\` |`);
md.push("");
fs.writeFileSync(path.join(OUT, "SRC_LIB_FULL_CLASSIFICATION_AUDIT.md"), md.join("\n"));

// ── duplicates MD ────────────────────────────────────────────
const dmd: string[] = [];
dmd.push("# SITA OS — src/lib Duplicate & Ambiguous Modules (Wave 0)\n");
dmd.push(`Generated: ${json.generatedAt}\n`);
dmd.push(`Detected ${duplicates.length} fingerprint groups with >1 file (heuristic: identical export shape + identical byte length).\n`);
dmd.push("> Note: This is a heuristic. Manual review required before merging — files with the same export names may have different implementations.\n");
dmd.push("## Duplicate groups\n");
for (const d of duplicates.slice(0, 100)) {
  dmd.push(`### Fingerprint \`${d.fingerprint}\``);
  for (const f of d.files) dmd.push(`- \`${f}\``);
  dmd.push("");
}
if (duplicates.length > 100) dmd.push(`\n_…and ${duplicates.length - 100} more groups in JSON._`);
fs.writeFileSync(path.join(OUT, "SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md"), dmd.join("\n"));

// ── console summary ──────────────────────────────────────────
console.log("\n📊 Classification summary:");
for (const [k, v] of Object.entries(byClass)) console.log(`   ${k.padEnd(18)} ${v}`);
console.log(`\n🔁 Duplicate fingerprint groups: ${duplicates.length}`);
console.log(`📝 Wrappers found: ${records.filter(r => r.isWrapperOnly).length}`);
console.log(`\n✅ Wrote:`);
console.log(`   ${path.relative(ROOT, path.join(OUT, "src-lib-classification-map.json"))}`);
console.log(`   ${path.relative(ROOT, path.join(OUT, "SRC_LIB_FULL_CLASSIFICATION_AUDIT.md"))}`);
console.log(`   ${path.relative(ROOT, path.join(OUT, "SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md"))}`);

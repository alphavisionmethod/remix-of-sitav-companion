#!/usr/bin/env tsx
/**
 * SITA OS — Foundation Manifest Index Generator
 *
 * Emits the master pointer file `generated/manifests/foundation-manifest-index.json`
 * that all future architecture wave prompts attach to. The index enumerates the
 * 14 canonical manifests that constitute the foundation layer (Constitution
 * Rules 21–26).
 *
 * Also (re)seeds the four foundation-owned manifests when missing:
 *   - architecture-exception-ledger.json   (rule 23)
 *   - safe-change-evidence-ledger.json     (rule 24)
 *   - foundation-tier-validator-set.json   (rule 21)
 *   - deprecated-shim-baseline.json        (rule 23, monotone ratchet seed)
 *
 * Pre-existing canonical manifests (artifact-ownership-manifest, capability-owner-map,
 * etc.) are referenced by pointer; they are NOT re-emitted here.
 *
 * Run: npx tsx scripts/manifests/generate/generate-foundation-manifest-index.ts
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const MANIFEST_DIR = join(ROOT, "generated", "manifests");
const NOW = new Date().toISOString();
const FOUNDATION_VERSION = 1;

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}
function writeJson(file: string, data: unknown): void {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}
function readJsonOrNull<T = unknown>(file: string): T | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

ensureDir(MANIFEST_DIR);

// ── 1. Foundation manifest catalogue ───────────────────────────────────────
// Each entry tells future waves where the canonical truth lives + how to refresh.
type FoundationManifestEntry = {
  id: string;
  rule: number;
  path: string;                 // repo-relative path
  owner: string;                // generator script (or "foundation:seeded" / "wave-N:sealed")
  freshnessTtlDays: number | null; // null = sealed, never expires
  description: string;
  required: boolean;
};

const FOUNDATION_MANIFESTS: FoundationManifestEntry[] = [
  {
    id: "validator-gate-map",
    rule: 22,
    path: "generated/validator-gate-map.json",
    owner: "scripts/manifests/generate/generate-validator-gate-map.ts",
    freshnessTtlDays: 14,
    description: "Single source of truth for every architecture validator's classification.",
    required: true,
  },
  {
    id: "foundation-tier-validator-set",
    rule: 21,
    path: "generated/manifests/foundation-tier-validator-set.json",
    owner: "scripts/manifests/generate/generate-foundation-manifest-index.ts",
    freshnessTtlDays: 14,
    description: "Filtered view of validator-gate-map listing the validators that run in foundation-gate.yml.",
    required: true,
  },
  {
    id: "architecture-exception-ledger",
    rule: 23,
    path: "generated/manifests/architecture-exception-ledger.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "All exceptions to constitution rules. Monotone ratchet — counts may only decrease.",
    required: true,
  },
  {
    id: "deprecated-shim-baseline",
    rule: 23,
    path: "generated/manifests/deprecated-shim-baseline.json",
    owner: "scripts/manifests/generate/generate-foundation-manifest-index.ts",
    freshnessTtlDays: null,
    description: "Snapshot of _shared/_trust shim usage for the monotone ratchet.",
    required: true,
  },
  {
    id: "safe-change-evidence-ledger",
    rule: 24,
    path: "generated/manifests/safe-change-evidence-ledger.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "Append-only proof of every delete/merge/folder-retirement under frozen subtrees.",
    required: true,
  },
  {
    id: "wave-10-architectural-attestation",
    rule: 19,
    path: "generated/audits/wave-10-architectural-attestation.json",
    owner: "scripts/architecture/wave-10-emit-attestation.ts",
    freshnessTtlDays: null,
    description: "Sealed Wave-10 manifest — single 64-char fingerprint of the architecture.",
    required: true,
  },
  {
    id: "artifact-ownership-manifest",
    rule: 26,
    path: "generated/artifact-ownership-manifest.json",
    owner: "scripts/architecture/generate/generate-artifact-ownership-graph.ts",
    freshnessTtlDays: 30,
    description: "Artifact → owning script/team mapping for every generated/ file.",
    required: true,
  },
  {
    id: "capability-owner-map",
    rule: 26,
    path: "generated/capability-owner-map.json",
    owner: "scripts/manifests/generate/generate-capability-index.ts",
    freshnessTtlDays: 30,
    description: "Capability → owning module/platform-system mapping.",
    required: true,
  },
  {
    id: "app-plane-map",
    rule: 26,
    path: "generated/app-plane-map.json",
    owner: "scripts/architecture/checks/check-app-plane-coverage.ts",
    freshnessTtlDays: 30,
    description: "Route ↔ app-plane (founder/admin/product/internal-tools/shared) ownership.",
    required: true,
  },
  {
    id: "bounded-context-manifest",
    rule: 26,
    path: "generated/bounded-context-manifest.json",
    owner: "scripts/architecture/checks/check-bounded-context-coverage.ts",
    freshnessTtlDays: 30,
    description: "Bounded contexts and their owning subsystems.",
    required: true,
  },
  {
    id: "contract-manifest",
    rule: 26,
    path: "generated/contract-manifest.json",
    owner: "scripts/contracts/generate-contract-manifest.ts",
    freshnessTtlDays: 30,
    description: "All public contracts/types and their package owners.",
    required: true,
  },
  {
    id: "db-schema-ownership-map",
    rule: 26,
    path: "generated/db-schema-ownership-map.json",
    owner: "scripts/db/generate-db-schema-ownership.ts",
    freshnessTtlDays: 30,
    description: "Database table → owning subsystem mapping.",
    required: true,
  },
  {
    id: "golden-path-registry",
    rule: 26,
    path: "generated/golden-path-registry.json",
    owner: "scripts/manifests/generate/generate-golden-path-registry.ts",
    freshnessTtlDays: 30,
    description: "Canonical user/operator journeys and their backing routes/services.",
    required: true,
  },
  {
    id: "repository-canonicalization-baseline",
    rule: 26,
    path: "generated/audits/repository-canonicalization-baseline.json",
    owner: "scripts/architecture/emit-canonicalization-baseline.ts",
    freshnessTtlDays: 30,
    description: "Canonicalization wave progress + foundation-installation flag.",
    required: true,
  },
  {
    id: "platform-subclassification-map",
    rule: 27,
    path: "generated/manifests/platform-subclassification-map.json",
    owner: "scripts/manifests/generate/generate-platform-subclassification-map.ts",
    freshnessTtlDays: 30,
    description: "Second-level platform taxonomy: every src/platform/<X>/ folder mapped to one of six canonical subclasses.",
    required: true,
  },
  {
    id: "platform-cross-subclass-baseline",
    rule: 27,
    path: "generated/manifests/platform-cross-subclass-baseline.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "Monotone ratchet baseline for cross-subclass platform imports. Decrease-only.",
    required: true,
  },
  {
    id: "admin-plane-ownership-map",
    rule: 29,
    path: "generated/manifests/admin-plane-ownership-map.json",
    owner: "scripts/manifests/generate/generate-admin-plane-ownership-map.ts",
    freshnessTtlDays: 30,
    description: "Per-file classification of src/pages/admin/* (THIN_ADAPTER vs LEGACY_PAGE_BODY) plus admin↔platform↔modules dependency inventory.",
    required: true,
  },
  {
    id: "admin-page-body-baseline",
    rule: 30,
    path: "generated/manifests/admin-page-body-baseline.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "Sealed monotone-ratchet baseline for src/pages/admin/* legacy page-body count. Decrease-only.",
    required: true,
  },
  {
    id: "admin-dependency-violation-baseline",
    rule: 31,
    path: "generated/manifests/admin-dependency-violation-baseline.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "Sealed baseline for platform→admin, modules→admin, admin→modules import counts. Decrease-only.",
    required: true,
  },
  {
    id: "route-adapter-semantic-map",
    rule: 33,
    path: "generated/manifests/route-adapter-semantic-map.json",
    owner: "scripts/manifests/generate/generate-route-adapter-semantic-map.ts",
    freshnessTtlDays: 30,
    description: "Per-file classification of every src/pages/** route adapter into one of six subtypes plus legacy-violation status.",
    required: true,
  },
  {
    id: "page-semantic-violation-baseline",
    rule: 34,
    path: "generated/manifests/page-semantic-violation-baseline.json",
    owner: "foundation:seeded",
    freshnessTtlDays: null,
    description: "Sealed monotone-ratchet baseline of legacy-violation files under src/pages/**. Decrease-only.",
    required: true,
  },
];

// ── 2. Build foundation-tier validator set ─────────────────────────────────
// These are the 15 validators enforced by foundation-gate.yml (BLOCKING).
const FOUNDATION_TIER_VALIDATORS: Array<{
  validator: string;
  rule: string;
  classification: "block";
  origin: "new" | "wired-existing";
  description: string;
}> = [
  // 3 NEW foundation validators
  {
    validator: "scripts/architecture/check-foundation-manifest-freshness.ts",
    rule: "Rule 25",
    classification: "block",
    origin: "new",
    description: "Verifies every foundation manifest exists, parses, and is fresh.",
  },
  {
    validator: "scripts/architecture/check-architecture-exception-ledger.ts",
    rule: "Rule 23",
    classification: "block",
    origin: "new",
    description: "Verifies exception ledger schema + monotone ratchet (count never grows).",
  },
  {
    validator: "scripts/architecture/check-safe-change-evidence.ts",
    rule: "Rule 24",
    classification: "block",
    origin: "new",
    description: "Verifies any deletion under frozen subtrees has a safe-change evidence entry.",
  },
  // 12 EXISTING-but-orphaned validators promoted to foundation tier
  { validator: "scripts/architecture/checks/check-no-duplicate-primary-concept.ts", rule: "Rule 8/9", classification: "block", origin: "wired-existing", description: "No duplicate canonical primary concepts across the tree." },
  { validator: "scripts/architecture/checks/check-deprecated-wrappers.ts",          rule: "Rule 81–86", classification: "block", origin: "wired-existing", description: "Compatibility wrapper regression guard." },
  { validator: "scripts/architecture/checks/check-page-registry-completeness.ts",   rule: "Rule 7",    classification: "block", origin: "wired-existing", description: "Every route has a page registry entry." },
  { validator: "scripts/architecture/checks/check-context-membership.ts",           rule: "Rule 29",   classification: "block", origin: "wired-existing", description: "React contexts are owned by exactly one canonical home." },
  { validator: "scripts/architecture/checks/check-hook-purity.ts",                  rule: "Rule 30",   classification: "block", origin: "wired-existing", description: "Hooks under src/hooks are pillar-blind." },
  { validator: "scripts/architecture/checks/check-no-runtime-in-shared.ts",         rule: "Rule 5",    classification: "block", origin: "wired-existing", description: "Shared components contain no runtime/IO logic." },
  { validator: "scripts/architecture/checks/check-lib-ownership-drift.ts",          rule: "Rule 23/24", classification: "block", origin: "wired-existing", description: "src/lib subsystem ownership drift detector." },
  { validator: "scripts/architecture/checks/check-canonical-paths.ts",              rule: "Rule 16",   classification: "block", origin: "wired-existing", description: "All cross-tree imports use @/... aliases." },
  { validator: "scripts/architecture/checks/check-domain-purity.ts",                rule: "Rule 6",    classification: "block", origin: "wired-existing", description: "src/domains has no IO/UI imports." },
  { validator: "scripts/architecture/checks/check-primitive-purity.ts",             rule: "Rule 13",   classification: "block", origin: "wired-existing", description: "src/components/primitives stay primitive." },
  { validator: "scripts/architecture/checks/check-bounded-context-coverage.ts",     rule: "Rule 26",   classification: "block", origin: "wired-existing", description: "Every subsystem maps to a bounded context." },
  { validator: "scripts/architecture/checks/check-frontend-backend-substrate-map.ts", rule: "Rule 26", classification: "block", origin: "wired-existing", description: "Frontend↔backend substrate boundaries are intact." },
  // Wave 0.5 — Platform Subclassification (Rule 27)
  { validator: "scripts/architecture/check-platform-subclassification.ts", rule: "Rule 27", classification: "block", origin: "new", description: "Every src/platform/<X>/ folder is classified; cross-subclass imports respect the ratchet." },
  // Wave 0.6 — Admin Plane Law (Rules 29–32)
  { validator: "scripts/architecture/check-admin-plane-boundaries.ts", rule: "Rules 30/31", classification: "block", origin: "new", description: "Admin plane dependency direction + new-page-body forbidden in src/pages/admin/." },
  { validator: "scripts/architecture/check-admin-page-body-ratchet.ts", rule: "Rule 30", classification: "block", origin: "new", description: "src/pages/admin/* LEGACY_PAGE_BODY count is decrease-only." },
  // Wave 0.7 — Semantic Route-Adapter Contract (Rules 33–35)
  { validator: "scripts/architecture/check-page-semantic-adapter.ts", rule: "Rules 33/34", classification: "block", origin: "new", description: "src/pages/** legacy-violation count is decrease-only and forbidden APIs are blocked." },
  { validator: "scripts/architecture/check-page-adapter-subtype-declaration.ts", rule: "Rule 35", classification: "block", origin: "new", description: "Files carrying // @route-adapter: directive must match detected subtype." },
];

writeJson(join(MANIFEST_DIR, "foundation-tier-validator-set.json"), {
  generatedAt: NOW,
  foundationVersion: FOUNDATION_VERSION,
  rule: "Constitution Rule 21",
  description: "Validators that run in .github/workflows/foundation-gate.yml as BLOCKING. Adding/removing requires an ADR.",
  count: FOUNDATION_TIER_VALIDATORS.length,
  validators: FOUNDATION_TIER_VALIDATORS,
});

// ── 3. Seed exception ledger (only if absent — never overwrite) ────────────
const exceptionLedgerPath = join(MANIFEST_DIR, "architecture-exception-ledger.json");
if (!existsSync(exceptionLedgerPath)) {
  writeJson(exceptionLedgerPath, {
    generatedAt: NOW,
    foundationVersion: FOUNDATION_VERSION,
    rule: "Constitution Rule 23",
    schema: {
      ruleId: "string — e.g. 'rule-7' or 'wave-7-relative-imports'",
      scope: "string — single file or glob",
      owner: "string — github handle or team",
      reason: "string — why this exception is necessary",
      expiresAt: "ISO date OR null",
      waveBound: "string OR null — e.g. 'foundation-v1'",
      createdAt: "ISO timestamp",
      baselineCount: "number — count at time of ratchet seal",
    },
    monotoneRatchet: {
      enabled: true,
      direction: "decrease-only",
      enforcer: "scripts/architecture/check-architecture-exception-ledger.ts",
    },
    exceptions: [
      {
        ruleId: "rule-20-foundation-day-one",
        scope: "generated/audits/wave-10-architectural-attestation.json",
        owner: "platform-architecture",
        reason: "Wave-10 manifest is sealed pre-foundation; re-sealing requires ADR.",
        expiresAt: null,
        waveBound: "foundation-v1",
        createdAt: NOW,
        baselineCount: 1,
      },
    ],
    totalExceptions: 1,
  });
}

// ── 4. Seed safe-change ledger (append-only — only if absent) ──────────────
const safeChangePath = join(MANIFEST_DIR, "safe-change-evidence-ledger.json");
if (!existsSync(safeChangePath)) {
  // Seed from the existing wave-9 deletion record for historical traceability.
  const wave9 = readJsonOrNull<{ deletedCount?: number; deletedSample?: string[] }>(
    join(ROOT, "generated", "audits", "wave-9-adapter-sunset-deletion.json")
  );
  const seedEntries = wave9
    ? [
        {
          changeId: "wave-9-adapter-sunset",
          kind: "delete" as const,
          target: "src/components/{admin,sita,business,advisors,…}/**",
          targetCount: wave9.deletedCount ?? 0,
          evidence: {
            grepProof: "generated/audits/wave-9-consumer-rewrite.json",
            manifestProof: "generated/audits/wave-9-adapter-sunset-inventory.json",
            routeProof: "Wave-9 codemod rewrote 2,969 imports; verified by tsc + vite build.",
            testProof: "npx vitest run — green at Wave-9 close.",
            duplicateReconciliation: "All deleted files were thin Wave-7 adapters; canonical homes in @/modules/* and @/platform/*.",
          },
          approvedAt: "2026-04-25T00:00:00.000Z",
          owner: "platform-architecture",
        },
      ]
    : [];

  writeJson(safeChangePath, {
    generatedAt: NOW,
    foundationVersion: FOUNDATION_VERSION,
    rule: "Constitution Rule 24",
    appendOnly: true,
    schema: {
      changeId: "string — short slug",
      kind: "delete | merge | retire",
      target: "string — file/folder/glob",
      targetCount: "number",
      evidence: {
        grepProof: "string — path to grep/codemod report",
        manifestProof: "string — path to manifest snapshot",
        routeProof: "string — route/test verification description",
        testProof: "string — test run summary or path",
        duplicateReconciliation: "string OR null — required for merges",
      },
      approvedAt: "ISO timestamp",
      owner: "string",
    },
    enforcer: "scripts/architecture/check-safe-change-evidence.ts",
    entries: seedEntries,
    totalEntries: seedEntries.length,
  });
}

// ── 5. Build deprecated-shim-baseline (snapshot _shared / _trust usage) ────
function countShimUsages(): { sharedShim: number; trustShim: number; sample: string[] } {
  const SHIM_RE = /from\s+["']@\/modules\/_(shared|trust)\//g;
  let sharedShim = 0;
  let trustShim = 0;
  const sample: string[] = [];
  function walk(dir: string): void {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full);
        continue;
      }
      if (!/\.(tsx?|mts|cts|jsx?)$/.test(entry.name)) continue;
      let body: string;
      try {
        body = readFileSync(full, "utf8");
      } catch {
        continue;
      }
      const matches = body.matchAll(SHIM_RE);
      for (const m of matches) {
        if (m[1] === "shared") sharedShim++;
        else trustShim++;
        if (sample.length < 25) sample.push(relative(ROOT, full));
      }
    }
  }
  walk(join(ROOT, "src"));
  return { sharedShim, trustShim, sample };
}

const shimSnapshot = countShimUsages();
writeJson(join(MANIFEST_DIR, "deprecated-shim-baseline.json"), {
  generatedAt: NOW,
  foundationVersion: FOUNDATION_VERSION,
  rule: "Constitution Rule 23 (shim ratchet)",
  description: "Baseline count of _shared / _trust shim imports. Future PRs must not increase these counts.",
  monotoneRatchet: { enabled: true, direction: "decrease-only" },
  baseline: {
    sharedShimImports: shimSnapshot.sharedShim,
    trustShimImports: shimSnapshot.trustShim,
    total: shimSnapshot.sharedShim + shimSnapshot.trustShim,
  },
  sample: shimSnapshot.sample,
  removalWave: 9,
});

// ── 6. Emit master pointer index ───────────────────────────────────────────
function describeManifest(entry: FoundationManifestEntry) {
  const abs = join(ROOT, entry.path);
  const exists = existsSync(abs);
  let sizeBytes: number | null = null;
  let modifiedAt: string | null = null;
  if (exists) {
    const s = statSync(abs);
    sizeBytes = s.size;
    modifiedAt = s.mtime.toISOString();
  }
  return { ...entry, exists, sizeBytes, modifiedAt };
}

const enriched = FOUNDATION_MANIFESTS.map(describeManifest);
writeJson(join(MANIFEST_DIR, "foundation-manifest-index.json"), {
  generatedAt: NOW,
  foundationVersion: FOUNDATION_VERSION,
  rule: "Constitution Rule 26",
  description: "Master pointer file. All future architecture wave prompts attach to this index.",
  manifestCount: enriched.length,
  presentCount: enriched.filter((m) => m.exists).length,
  missingCount: enriched.filter((m) => !m.exists).length,
  manifests: enriched,
});

console.log(`✅ Foundation manifest index emitted (${enriched.length} entries, ${enriched.filter((m) => m.exists).length} present).`);
console.log(`   Foundation-tier validators: ${FOUNDATION_TIER_VALIDATORS.length}`);
console.log(`   Shim baseline: shared=${shimSnapshot.sharedShim}, trust=${shimSnapshot.trustShim}`);
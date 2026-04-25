#!/usr/bin/env tsx
/**
 * SITA OS — Platform Subclassification Map Generator
 *
 * Authority: Constitution Rule 27 (Platform Subclassification, BLOCKING)
 *
 * Emits `generated/manifests/platform-subclassification-map.json` — the single
 * source of truth for which canonical sub-class every top-level
 * `src/platform/<X>/` folder belongs to.
 *
 * The six canonical sub-classes are:
 *   - product-infrastructure
 *   - governance
 *   - operator-control
 *   - identity-and-tenant
 *   - intelligence
 *   - runtime-bridges
 *
 * Refuses to write if any folder under `src/platform/` is unclassified.
 *
 * Run: npx tsx scripts/manifests/generate/generate-platform-subclassification-map.ts
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const PLATFORM_DIR = join(ROOT, "src", "platform");
const OUT_FILE = join(ROOT, "generated", "manifests", "platform-subclassification-map.json");
const NOW = new Date().toISOString();
const SCHEMA_VERSION = 1;

export type PlatformSubclass =
  | "product-infrastructure"
  | "governance"
  | "operator-control"
  | "identity-and-tenant"
  | "intelligence"
  | "runtime-bridges";

export type Disposition = "keep" | "relocate-future" | "split-future";

export const SUBCLASS_PURPOSE: Record<PlatformSubclass, string> = {
  "product-infrastructure":
    "Reusable product capability surfaces (file/notification/search/app/workspace plumbing).",
  governance: "Trust, security, policy, audit, contracts, and verification.",
  "operator-control":
    "Operator/admin/owner UI surfaces and shells. Consumers of every other subclass.",
  "identity-and-tenant": "Identity, auth, tenant, enterprise scoping.",
  intelligence: "AI capability layer, knowledge spine, advisors, boardroom.",
  "runtime-bridges":
    "Runtime/registry/integration/orchestration adapters, bridges, and host SDKs (lowest layer).",
};

/** Allowed cross-subclass dependency directions. */
export const ALLOWED_DEPENDENCIES: Record<PlatformSubclass, PlatformSubclass[]> = {
  "runtime-bridges": ["governance", "identity-and-tenant"],
  "identity-and-tenant": ["governance", "runtime-bridges"],
  governance: ["identity-and-tenant", "runtime-bridges"],
  intelligence: ["governance", "identity-and-tenant", "runtime-bridges"],
  "product-infrastructure": [
    "governance",
    "identity-and-tenant",
    "runtime-bridges",
    "intelligence",
  ],
  "operator-control": [
    "governance",
    "identity-and-tenant",
    "runtime-bridges",
    "intelligence",
    "product-infrastructure",
  ],
};

type ClassificationEntry = {
  subclass: PlatformSubclass;
  disposition: Disposition;
  relocateTarget?: string;
  notes?: string;
};

/**
 * Canonical classification of every current `src/platform/<folder>/`.
 * If a NEW folder appears under `src/platform/`, the generator will fail
 * loudly and the offending PR must add it here (constitutional Rule 27).
 */
export const CLASSIFICATION: Record<string, ClassificationEntry> = {
  // ── product-infrastructure ────────────────────────────────────────────
  files: { subclass: "product-infrastructure", disposition: "keep" },
  workspace: { subclass: "product-infrastructure", disposition: "keep" },
  notifications: { subclass: "product-infrastructure", disposition: "keep" },
  "app-platform": { subclass: "product-infrastructure", disposition: "keep" },
  apps: { subclass: "product-infrastructure", disposition: "keep" },
  search: { subclass: "product-infrastructure", disposition: "keep" },
  marketing: { subclass: "product-infrastructure", disposition: "keep" },
  cloud: { subclass: "product-infrastructure", disposition: "keep" },
  settings: { subclass: "product-infrastructure", disposition: "keep" },
  setup: { subclass: "product-infrastructure", disposition: "keep" },
  "personal-brain": { subclass: "product-infrastructure", disposition: "keep" },
  experience: { subclass: "product-infrastructure", disposition: "keep" },
  "design-system": { subclass: "product-infrastructure", disposition: "keep" },

  // ── governance ────────────────────────────────────────────────────────
  trust: { subclass: "governance", disposition: "keep" },
  security: { subclass: "governance", disposition: "keep" },
  governance: { subclass: "governance", disposition: "keep" },
  contracts: { subclass: "governance", disposition: "keep" },
  proof: { subclass: "governance", disposition: "keep" },
  truth: { subclass: "governance", disposition: "keep" },
  verification: { subclass: "governance", disposition: "keep" },

  // ── operator-control ──────────────────────────────────────────────────
  admin: {
    subclass: "operator-control",
    disposition: "relocate-future",
    relocateTarget: "src/admin/",
    notes:
      "151 files of admin command palettes/sub-navs/shells. Already re-exported by src/admin/components/index.ts. Wave-bound migration to src/admin/.",
  },
  owner: { subclass: "operator-control", disposition: "keep" },
  "mission-control": { subclass: "operator-control", disposition: "keep" },
  atlas: { subclass: "operator-control", disposition: "keep" },
  support: { subclass: "operator-control", disposition: "keep" },
  observability: { subclass: "operator-control", disposition: "keep" },
  operations: { subclass: "operator-control", disposition: "keep" },
  sita: {
    subclass: "operator-control",
    disposition: "split-future",
    notes:
      "551 files spanning HUD, shell, primitives, onboarding, apps. Future split: HUD → operator-control/sita-hud, shell → product-infrastructure/shell, apps → product-infrastructure/apps.",
  },

  // ── identity-and-tenant ───────────────────────────────────────────────
  auth: { subclass: "identity-and-tenant", disposition: "keep" },
  tenant: { subclass: "identity-and-tenant", disposition: "keep" },
  enterprise: { subclass: "identity-and-tenant", disposition: "keep" },

  // ── intelligence ──────────────────────────────────────────────────────
  ai: { subclass: "intelligence", disposition: "keep" },
  intelligence: { subclass: "intelligence", disposition: "keep" },
  knowledge: { subclass: "intelligence", disposition: "keep" },
  advisors: { subclass: "intelligence", disposition: "keep" },
  boardroom: { subclass: "intelligence", disposition: "keep" },
  product: { subclass: "intelligence", disposition: "keep" },

  // ── runtime-bridges ───────────────────────────────────────────────────
  runtime: { subclass: "runtime-bridges", disposition: "keep" },
  registry: { subclass: "runtime-bridges", disposition: "keep" },
  integration: { subclass: "runtime-bridges", disposition: "keep" },
  orchestration: { subclass: "runtime-bridges", disposition: "keep" },
  "core-services": { subclass: "runtime-bridges", disposition: "keep" },
  eventing: { subclass: "runtime-bridges", disposition: "keep" },
  execution: { subclass: "runtime-bridges", disposition: "keep" },
  "sync-engine": { subclass: "runtime-bridges", disposition: "keep" },
  "nova-sdk": { subclass: "runtime-bridges", disposition: "keep" },
  topology: { subclass: "runtime-bridges", disposition: "keep" },
  architecture: { subclass: "runtime-bridges", disposition: "keep" },
  capabilities: { subclass: "runtime-bridges", disposition: "keep" },
  ci: { subclass: "runtime-bridges", disposition: "keep" },
  deploy: { subclass: "runtime-bridges", disposition: "keep" },
  migration: { subclass: "runtime-bridges", disposition: "keep" },
  fip: { subclass: "runtime-bridges", disposition: "keep" },
  "control-plane": { subclass: "runtime-bridges", disposition: "keep" },
};

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function countFiles(dir: string): number {
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) n += countFiles(full);
    else if (/\.(tsx?|mts|cts|jsx?)$/.test(e.name)) n++;
  }
  return n;
}

function main(): void {
  if (!existsSync(PLATFORM_DIR)) {
    console.error(`❌ src/platform/ not found at ${PLATFORM_DIR}`);
    process.exit(1);
  }

  const folders = readdirSync(PLATFORM_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const unclassified: string[] = [];
  const entries = folders.map((name) => {
    const c = CLASSIFICATION[name];
    if (!c) {
      unclassified.push(name);
      return null;
    }
    return {
      folder: name,
      path: `src/platform/${name}/`,
      subclass: c.subclass,
      purpose: SUBCLASS_PURPOSE[c.subclass],
      disposition: c.disposition,
      relocateTarget: c.relocateTarget ?? null,
      notes: c.notes ?? null,
      fileCount: countFiles(join(PLATFORM_DIR, name)),
    };
  });

  if (unclassified.length > 0) {
    console.error(
      `❌ ${unclassified.length} unclassified platform folder(s) — Rule 27 violation:`,
    );
    for (const f of unclassified) console.error(`   - src/platform/${f}/`);
    console.error(
      `\nAdd each one to CLASSIFICATION in scripts/manifests/generate/generate-platform-subclassification-map.ts.`,
    );
    process.exit(1);
  }

  const classifiedEntries = entries.filter((e): e is NonNullable<typeof e> => e !== null);
  const bySubclass: Record<string, number> = {};
  for (const e of classifiedEntries) {
    bySubclass[e.subclass] = (bySubclass[e.subclass] ?? 0) + 1;
  }

  const out = {
    generatedAt: NOW,
    schemaVersion: SCHEMA_VERSION,
    rule: "Constitution Rule 27 — Platform Subclassification",
    description:
      "Single source of truth for the second-level classification of every src/platform/<X>/ folder. Refusing to add a new platform folder here BLOCKS CI.",
    subclasses: Object.entries(SUBCLASS_PURPOSE).map(([id, purpose]) => ({
      id,
      purpose,
      allowedDependencies: ALLOWED_DEPENDENCIES[id as PlatformSubclass],
      memberCount: bySubclass[id] ?? 0,
    })),
    universalRules: [
      "No platform subclass may import from src/modules/<pillar>/** (Constitution Rule 2).",
      "Cross-subclass imports must follow ALLOWED_DEPENDENCIES.",
      "Adding a new top-level src/platform/<X>/ folder requires a CLASSIFICATION entry (Rule 27).",
    ],
    folderCount: classifiedEntries.length,
    folders: classifiedEntries,
  };

  ensureDir(dirname(OUT_FILE));
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `✅ platform-subclassification-map.json: ${classifiedEntries.length} folders classified across ${Object.keys(SUBCLASS_PURPOSE).length} subclasses.`,
  );
  for (const [id, count] of Object.entries(bySubclass)) {
    console.log(`   - ${id}: ${count}`);
  }
}

main();

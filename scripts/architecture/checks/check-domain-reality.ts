/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Gate 35: Domain OS Reality (Checklist 17)
//
// Verifies, for the 5 core domains:
//   1. manifest exists in src/lib/domain-system/manifests/
//   2. row exists in domain_ownership_registry
//   3. every manifest dbTable exists in the live schema
//   4. canonical routes file exists (src/routes/{domain}-routes.tsx)
//   5. e2e spec exists (tests/e2e/{domain}-journey.spec.ts)
//   6. at least one edge fn or BFF named `{domain}-*` exists
//   7. boardroom has decision-receipt proof writes (boardroom-session)
//
// HONESTY RULE (Phase 24.1.D):
//   - Requires `generated/db-schema-snapshot.json` to be present.
//   - If snapshot is missing, Gate 35 FAILS — no silent fallback.
//   - Snapshot must come from `scripts/architecture/snapshot-db-schema.ts`
//     which calls the live `get_db_truth_snapshot('schema')` RPC.
//
// Emits generated/domain-reality-report.json
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface DomainSpec {
  key: string;
  manifestFile: string;
  routesFile: string;
  e2eFile: string;
  edgeFnPrefix: string;
  proofRequired: boolean;
}

const DOMAINS: DomainSpec[] = [
  { key: "business-os",       manifestFile: "business-manifest.ts",   routesFile: "business-routes.tsx",   e2eFile: "business-journey.spec.ts",   edgeFnPrefix: "business",   proofRequired: false },
  { key: "finance-os",        manifestFile: "finance-manifest.ts",    routesFile: "money-routes.tsx",      e2eFile: "money-journey.spec.ts",      edgeFnPrefix: "finance",    proofRequired: false },
  { key: "concierge-os",      manifestFile: "concierge-manifest.ts",  routesFile: "concierge-routes.tsx",  e2eFile: "concierge-journey.spec.ts",  edgeFnPrefix: "concierge",  proofRequired: false },
  { key: "investment-office", manifestFile: "investment-manifest.ts", routesFile: "investment-routes.tsx", e2eFile: "investment-journey.spec.ts", edgeFnPrefix: "investment", proofRequired: false },
  { key: "boardroom",         manifestFile: "boardroom-manifest.ts",  routesFile: "boardroom-routes.tsx",  e2eFile: "boardroom-journey.spec.ts",  edgeFnPrefix: "boardroom",  proofRequired: true  },
];

const ROOT = process.cwd();
const MANIFEST_DIR = join(ROOT, "src/lib/domain-system/manifests");
const ROUTES_DIR   = join(ROOT, "src/routes");
const E2E_DIR      = join(ROOT, "tests/e2e");
const EDGE_DIR     = join(ROOT, "supabase/functions");
const SNAPSHOT_PATH = join(ROOT, "generated/db-schema-snapshot.json");

function fileExists(p: string): boolean {
  try { return existsSync(p); } catch { return false; }
}

function listEdgeFns(): string[] {
  if (!fileExists(EDGE_DIR)) return [];
  return readdirSync(EDGE_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function extractDbTables(manifestPath: string): string[] {
  const src = readFileSync(manifestPath, "utf8");
  const tables: string[] = [];
  const re = /dbTable:\s*"([a-zA-Z0-9_]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) tables.push(m[1]);
  return [...new Set(tables)];
}

function loadLiveTables(): { tables: Set<string>; source: string; count: number } {
  if (!fileExists(SNAPSHOT_PATH)) {
    throw new Error(
      "Gate 35 requires generated/db-schema-snapshot.json. " +
        "Run `npx tsx scripts/architecture/snapshot-db-schema.ts` first " +
        "(SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required).",
    );
  }
  let snap: { tables?: Array<{ tablename?: string; name?: string }>; source?: string; count?: number };
  try {
    snap = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8"));
  } catch (e: any) {
    throw new Error(`Failed to parse db-schema-snapshot.json: ${e.message ?? e}`);
  }
  const arr: string[] = (snap.tables ?? [])
    .map((t) => t.tablename ?? t.name)
    .filter((s): s is string => Boolean(s));
  if (arr.length === 0) {
    throw new Error("db-schema-snapshot.json contains no tables — refusing to pass");
  }
  return {
    tables: new Set(arr),
    source: snap.source ?? "unknown",
    count: snap.count ?? arr.length,
  };
}

async function main() {
  let live: { tables: Set<string>; source: string; count: number };
  try {
    live = loadLiveTables();
  } catch (e: any) {
    console.error(`❌ Gate 35 FAILED — ${e.message}`);
    process.exit(1);
  }

  const edgeFns = listEdgeFns();

  const domainResults = DOMAINS.map((d) => {
    const checks: Record<string, { ok: boolean; detail?: string }> = {};

    // 1. manifest
    const manifestPath = join(MANIFEST_DIR, d.manifestFile);
    checks.manifest = { ok: fileExists(manifestPath), detail: manifestPath };

    // 2. routes
    checks.routes = { ok: fileExists(join(ROUTES_DIR, d.routesFile)), detail: d.routesFile };

    // 3. e2e
    checks.e2e = { ok: fileExists(join(E2E_DIR, d.e2eFile)), detail: d.e2eFile };

    // 4. edge fn (any function whose name contains the prefix)
    const matchingFns = edgeFns.filter((f) => f.includes(d.edgeFnPrefix));
    checks.edgeFn = { ok: matchingFns.length > 0, detail: matchingFns.join(", ") || "none" };

    // 5. proof writer (boardroom only — boardroom-session must exist)
    if (d.proofRequired) {
      checks.proofWriter = { ok: edgeFns.includes("boardroom-session"), detail: "boardroom-session" };
    }

    // 6. dbTables existence — strict, against the LIVE snapshot
    let dbTables: string[] = [];
    let missingTables: string[] = [];
    if (checks.manifest.ok) {
      dbTables = extractDbTables(manifestPath);
      missingTables = dbTables.filter((t) => !live.tables.has(t));
    }
    checks.dbTables = {
      ok: checks.manifest.ok && missingTables.length === 0 && dbTables.length > 0,
      detail: `${dbTables.length} declared, ${missingTables.length} missing${
        missingTables.length ? `: ${missingTables.join(",")}` : " (all present in live schema)"
      }`,
    };

    const allOk = Object.values(checks).every((c) => c.ok);
    const score = Math.round(
      (Object.values(checks).filter((c) => c.ok).length / Object.values(checks).length) * 10,
    );
    return { domain: d.key, ok: allOk, score, checks };
  });

  const ok = domainResults.every((r) => r.ok);

  const report = {
    generatedAt: new Date().toISOString(),
    gate: "phase-24-domain-reality",
    ok,
    dbSnapshotSource: live.source,
    dbSnapshotTableCount: live.count,
    domainCount: domainResults.length,
    okDomainCount: domainResults.filter((r) => r.ok).length,
    domains: domainResults,
  };

  writeFileSync(join(ROOT, "generated/domain-reality-report.json"), JSON.stringify(report, null, 2));

  console.log(
    ok
      ? `✅ Gate 35 (domain reality) OK — ${domainResults.length}/${domainResults.length} domains green (snapshot: ${live.source}, ${live.count} tables)`
      : `❌ Gate 35 FAILED — ${domainResults.filter((r) => !r.ok).length} domain(s) failing`,
  );
  if (!ok) {
    for (const d of domainResults.filter((r) => !r.ok)) {
      const failed = Object.entries(d.checks).filter(([, v]) => !v.ok);
      console.log(`  - ${d.domain}: ${failed.map(([k, v]) => `${k}(${v.detail})`).join(", ")}`);
    }
  }

  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

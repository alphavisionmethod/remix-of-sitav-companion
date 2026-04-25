#!/usr/bin/env tsx
/**
 * SITA OS — Page Semantic Adapter Validator (Wave 0.7, BLOCKING)
 *
 * Authority: Constitution Rules 33–34.
 *
 * Verifies that the `legacy-violation` count under src/pages/** has not
 * grown above the sealed baseline. Forbidden API surfaces detected:
 *   - supabase.<x>
 *   - useQuery / useMutation / useInfiniteQuery / useSuspenseQuery
 *   - useState / useReducer (treated as canonical state ownership)
 *   - >40-line files with no recognized adapter pattern
 *
 * Modes:
 *   default (--strict): non-zero exit on ratchet growth or invalid declarations.
 *   --warn            : print but exit 0.
 *
 * Run: npx tsx scripts/architecture/check-page-semantic-adapter.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const MAP_PATH = join(ROOT, "generated", "manifests", "route-adapter-semantic-map.json");
const BASELINE_PATH = join(ROOT, "generated", "manifests", "page-semantic-violation-baseline.json");
const REPORT_PATH = join(ROOT, "generated", "manifests", "page-semantic-violation-report.json");
const WARN_ONLY = process.argv.includes("--warn");

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

if (!existsSync(MAP_PATH) || !existsSync(BASELINE_PATH)) {
  console.error(
    "❌ Missing manifests. Run: npx tsx scripts/manifests/generate/generate-route-adapter-semantic-map.ts",
  );
  process.exit(WARN_ONLY ? 0 : 1);
}

const map = JSON.parse(readFileSync(MAP_PATH, "utf8")) as {
  totalFiles: number;
  violationCount: number;
  bySubtype: Record<string, number>;
  entries: Array<{ path: string; semanticStatus: string; violations: string[] }>;
};
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as {
  violationCount: number;
  sealedAt: string;
};

const current = map.violationCount;
const delta = current - baseline.violationCount;
const ok = current <= baseline.violationCount;
const invalid = map.entries.filter((e) => e.semanticStatus === "invalid");

ensureDir(dirname(REPORT_PATH));
writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rule: "Constitution Rules 33–34",
      ok,
      baseline: baseline.violationCount,
      current,
      delta,
      direction: "decrease-only",
      invalidDeclarationsCount: invalid.length,
      invalidDeclarations: invalid.slice(0, 25).map((e) => ({ path: e.path, violations: e.violations })),
      bySubtype: map.bySubtype,
    },
    null,
    2,
  ) + "\n",
);

if (!ok) {
  console.error(
    `❌ Page semantic ratchet FAILED — current=${current} > baseline=${baseline.violationCount} (delta +${delta}).`,
  );
  console.error(
    `   New src/pages/** files MUST be valid route adapters (Rule 33). See docs/architecture/ROUTE_ADAPTER_SEMANTIC_MODEL.md.`,
  );
  process.exit(WARN_ONLY ? 0 : 1);
}

if (invalid.length > 0) {
  console.error(`❌ ${invalid.length} file(s) declared a route-adapter subtype that does not match their content (Rule 35):`);
  for (const e of invalid.slice(0, 10)) console.error(`   ${e.path} — ${e.violations.join(", ")}`);
  process.exit(WARN_ONLY ? 0 : 1);
}

if (delta < 0) {
  console.log(
    `✅ Page semantic ratchet OK — drained ${-delta} violations (current ${current} ≤ baseline ${baseline.violationCount}). Re-seal baseline when comfortable.`,
  );
} else {
  console.log(
    `✅ Page semantic ratchet OK — current=${current}, baseline=${baseline.violationCount}, total=${map.totalFiles}.`,
  );
}
process.exit(0);

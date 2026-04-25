#!/usr/bin/env tsx
/**
 * SITA OS — Admin Page-Body Ratchet (Wave 0.6, BLOCKING)
 *
 * Authority: Constitution Rule 30.
 *
 * Verifies the LEGACY_PAGE_BODY count under src/pages/admin/ has not
 * increased above the sealed baseline.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const MAP_PATH = join(ROOT, "generated", "manifests", "admin-plane-ownership-map.json");
const BASELINE_PATH = join(ROOT, "generated", "manifests", "admin-page-body-baseline.json");
const REPORT_PATH = join(ROOT, "generated", "manifests", "admin-page-body-ratchet-report.json");
const WARN_ONLY = process.argv.includes("--warn");

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

if (!existsSync(MAP_PATH) || !existsSync(BASELINE_PATH)) {
  console.error(
    "❌ Missing manifests. Run: npx tsx scripts/manifests/generate/generate-admin-plane-ownership-map.ts",
  );
  process.exit(WARN_ONLY ? 0 : 1);
}

const map = JSON.parse(readFileSync(MAP_PATH, "utf8")) as {
  entries: Array<{ kind: "THIN_ADAPTER" | "LEGACY_PAGE_BODY" }>;
  thinAdapterCount: number;
  legacyPageBodyCount: number;
};
const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as {
  legacyPageBodyCount: number;
  sealedAt: string;
};

const current = map.entries.filter((e) => e.kind === "LEGACY_PAGE_BODY").length;
const delta = current - baseline.legacyPageBodyCount;
const ok = current <= baseline.legacyPageBodyCount;

ensureDir(dirname(REPORT_PATH));
writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rule: "Constitution Rule 30",
      ok,
      baseline: baseline.legacyPageBodyCount,
      current,
      delta,
      direction: "decrease-only",
      adaptersInPlace: map.thinAdapterCount,
    },
    null,
    2,
  ) + "\n",
);

if (ok) {
  if (delta < 0) {
    console.log(
      `✅ Admin page-body ratchet OK — drained ${-delta} bodies (current ${current} ≤ baseline ${baseline.legacyPageBodyCount}). Re-seal baseline when comfortable.`,
    );
  } else {
    console.log(
      `✅ Admin page-body ratchet OK — current=${current}, baseline=${baseline.legacyPageBodyCount}, adapters=${map.thinAdapterCount}.`,
    );
  }
  process.exit(0);
}

console.error(
  `❌ Admin page-body ratchet FAILED — current=${current} > baseline=${baseline.legacyPageBodyCount} (delta +${delta}). New src/pages/admin/* files MUST be thin re-exports from @/admin/** per Rule 30.`,
);
process.exit(WARN_ONLY ? 0 : 1);

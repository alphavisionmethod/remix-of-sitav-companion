#!/usr/bin/env tsx
/**
 * SITA OS — Page Adapter Subtype Declaration Validator (Wave 0.7, BLOCKING)
 *
 * Authority: Constitution Rule 35.
 *
 * Forward-looking check: any file under src/pages/** that contains the
 * `// @route-adapter:` directive must have its declared subtype match the
 * detected subtype.
 *
 * Files without the directive are NOT failed by this validator (legacy
 * grandfathering); they are caught by check-page-semantic-adapter.ts via
 * the violation ratchet.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const MAP_PATH = join(ROOT, "generated", "manifests", "route-adapter-semantic-map.json");
const WARN_ONLY = process.argv.includes("--warn");

if (!existsSync(MAP_PATH)) {
  console.error("❌ Missing route-adapter-semantic-map.json. Run the generator first.");
  process.exit(WARN_ONLY ? 0 : 1);
}

const map = JSON.parse(readFileSync(MAP_PATH, "utf8")) as {
  entries: Array<{
    path: string;
    declaredSubtype: string | null;
    subtype: string;
    semanticStatus: string;
    violations: string[];
  }>;
};

const mismatches = map.entries.filter(
  (e) => e.declaredSubtype !== null && e.semanticStatus === "invalid",
);

if (mismatches.length === 0) {
  const declaredCount = map.entries.filter((e) => e.declaredSubtype !== null).length;
  console.log(
    `✅ Page adapter subtype declarations OK — ${declaredCount} file(s) carry a // @route-adapter: directive, all match content.`,
  );
  process.exit(0);
}

console.error(
  `❌ ${mismatches.length} file(s) have a // @route-adapter: directive that does NOT match detected content (Rule 35):`,
);
for (const e of mismatches.slice(0, 25)) {
  console.error(`   ${e.path} — declared=${e.declaredSubtype}, detected=${e.subtype}`);
}
process.exit(WARN_ONLY ? 0 : 1);

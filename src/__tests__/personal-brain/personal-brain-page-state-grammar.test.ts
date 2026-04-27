import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { INTELLIGENCE_TRUTH_MANIFEST, summarizeManifest } from "@/modules/intelligence/PRODUCTION_TRUTH_MANIFEST";

const PAGES_ROOT = join(process.cwd(), "src/platform/intelligence/pages");
const SUBDIRS: ReadonlyArray<string> = [""];

function listFiles() {
  const out: { page: string; subdir: string; path: string }[] = [];
  for (const sub of SUBDIRS) {
    const dir = sub ? join(PAGES_ROOT, sub) : PAGES_ROOT;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) continue;
      if (!name.endsWith(".tsx")) continue;
      out.push({ page: name.replace(/\.tsx$/, ""), subdir: sub, path: full });
    }
  }
  return out;
}

describe("Intelligence Production-Truth Manifest", () => {
  it("has at least one entry per page file", () => {
    const files = listFiles();
    const keys = new Set(INTELLIGENCE_TRUTH_MANIFEST.map((e) => `${e.subdir}::${e.page}`));
    for (const f of files) {
      expect(keys.has(`${f.subdir}::${f.page}`), `Missing manifest for ${f.subdir}/${f.page}`).toBe(true);
    }
  });

  it("every degraded page renders an honest empty/banner state", () => {
    for (const e of INTELLIGENCE_TRUTH_MANIFEST) {
      if (e.state !== "degraded") continue;
      const dir = e.subdir ? join(PAGES_ROOT, e.subdir) : PAGES_ROOT;
      const src = readFileSync(join(dir, `${e.page}.tsx`), "utf8");
      const ok =
        /EmptyStateCard|PremiumEmptyState|LegacyEmptyStateCard|<EmptyState\b|setup-required|setupRequired/i.test(src) ||
        /PageTruthBanner[^>]*truthState=["'](?:partial|degraded|connecting)["']/.test(src);
      expect(ok, `${e.subdir}/${e.page} must render empty/partial state`).toBe(true);
    }
  });

  it("publishes a sane summary", () => {
    const s = summarizeManifest();
    expect(s.total).toBeGreaterThan(0);
    expect(s.fullyWired + s.degraded + s.hidden).toBe(s.total);
  });
});

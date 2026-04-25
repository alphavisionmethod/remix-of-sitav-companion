#!/usr/bin/env tsx
/**
 * SITA OS — Frontend / Backend Boundary Map (Wave B / Constitution §B.2)
 *
 * Scans `src/pages/**`, `src/components/**`, `src/domains/**` for direct
 * imports of `@/integrations/supabase/**` (page-backend bypass) and emits:
 *   - generated/manifests/frontend-backend-boundary-map.json
 *
 * Boundary law: see docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "generated/manifests/frontend-backend-boundary-map.json");

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (e.isFile() && /\.(ts|tsx)$/.test(e.name)) out.push(f);
  }
  return out;
}

const PATTERN = /from\s+["']@\/integrations\/supabase/;

function scan(rootRel: string): string[] {
  const dir = path.join(SRC, rootRel);
  return walk(dir)
    .filter((f) => PATTERN.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(ROOT, f).replace(/\\/g, "/"))
    .sort();
}

const pages = scan("pages");
const components = scan("components");
const domains = scan("domains");

const out = {
  generatedAt: new Date().toISOString(),
  pages: { count: pages.length, paths: pages },
  components: { count: components.length, paths: components },
  domains: { count: domains.length, paths: domains },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`✅ Wrote boundary map: pages=${pages.length} components=${components.length} domains=${domains.length}`);
#!/usr/bin/env tsx
/**
 * Wave F — Frontend Page Ownership Map Generator (Constitution Rule 50)
 *
 * Walks src/pages/** and classifies every file into:
 *   - "shim"             : ≤ 10 logical lines, exports default + * from a canonical path
 *   - "router-fallback"  : NotFound.tsx (router 404)
 *   - "barrel"           : index.ts re-export aggregator
 *   - "test"             : under __tests__/
 *   - "ratcheted-admin"  : src/pages/admin/** (governed by Rule 30 monotone-decrease ratchet)
 *   - "canonical-body"   : > 10 logical lines outside the allowlist (FORBIDDEN)
 *
 * Output: generated/manifests/frontend-page-ownership-map.json
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PAGES = join(ROOT, "src", "pages");
const OUT = join(ROOT, "generated", "manifests", "frontend-page-ownership-map.json");

type Kind = "shim" | "router-fallback" | "barrel" | "test" | "ratcheted-admin" | "canonical-body";

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function logicalLines(text: string): number {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*") && l !== "*/")
    .length;
}

function classify(rel: string, body: string): { kind: Kind; canonicalOwner: string | null } {
  const norm = rel.split(sep).join("/");
  if (norm.includes("/__tests__/")) return { kind: "test", canonicalOwner: null };
  if (norm.endsWith("NotFound.tsx") && norm === "src/pages/NotFound.tsx") return { kind: "router-fallback", canonicalOwner: null };
  if (norm.endsWith("/index.ts") || norm.endsWith("/index.tsx")) return { kind: "barrel", canonicalOwner: null };
  if (norm.startsWith("src/pages/admin/")) return { kind: "ratcheted-admin", canonicalOwner: "@/admin/modules/<domain>/views/" };
  const ll = logicalLines(body);
  // Detect shim by re-export pattern + small size
  const reexport = body.match(/from\s+["']@\/((modules|platform|admin|features)\/[^"']+)["']/);
  if (ll <= 10 && reexport) {
    return { kind: "shim", canonicalOwner: `@/${reexport[1]}` };
  }
  return { kind: "canonical-body", canonicalOwner: null };
}

const files = walk(PAGES).filter((f) => /\.(ts|tsx)$/.test(f));
const counts: Record<Kind, number> = {
  shim: 0, "router-fallback": 0, barrel: 0, test: 0, "ratcheted-admin": 0, "canonical-body": 0,
};
const entries: Array<{ path: string; kind: Kind; canonicalOwner: string | null; logicalLines: number }> = [];
for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join("/");
  const body = readFileSync(f, "utf8");
  const { kind, canonicalOwner } = classify(rel, body);
  counts[kind] += 1;
  entries.push({ path: rel, kind, canonicalOwner, logicalLines: logicalLines(body) });
}

const out = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  rule: "Constitution Rule 50 (Wave F — Frontend Page Ownership Law)",
  totalFiles: entries.length,
  counts,
  zoning: {
    "src/pages/**": "route adapters only (allowlist: NotFound.tsx + __tests__/ + index.ts barrels + ratcheted admin/**)",
    "src/modules/<pillar>/pages/**": "canonical pillar page bodies",
    "src/platform/<system>/pages/**": "canonical platform page bodies",
    "src/platform/experience/pages/mobile/**": "canonical mobile shell page bodies",
    "src/admin/modules/<domain>/views/**": "canonical admin page bodies (Rule 30 destination)",
  },
  entries,
};

mkdirSync(join(ROOT, "generated", "manifests"), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(
  `✅ frontend-page-ownership-map: total=${entries.length} shim=${counts.shim} ratcheted-admin=${counts["ratcheted-admin"]} canonical-body=${counts["canonical-body"]} barrel=${counts.barrel}`,
);
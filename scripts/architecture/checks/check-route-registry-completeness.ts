/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Route Registry Completeness (Phase 10)
// Diffs `<Route path="…">` declarations under src/routes/** against
// ROUTE_CONTEXT_BINDINGS in context-membership-map. Fails if any
// declared route prefix is unowned by a bounded context.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROUTE_CONTEXT_BINDINGS, resolveRouteContext } from "../../../src/lib/architecture/context-membership-map";

const ROUTES_DIR = "src/routes";
const REPORT_PATH = "generated/route-registry-completeness-report.json";

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(full);
  }
  return out;
}

const ROUTE_RE = /<Route\s+[^>]*path\s*=\s*["'`]([^"'`]+)["'`]/g;

const files = walk(ROUTES_DIR);
const declaredPaths = new Set<string>();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  let m: RegExpExecArray | null;
  while ((m = ROUTE_RE.exec(src)) !== null) {
    let p = m[1];
    if (!p || p === "*" || p === "/" || p.startsWith(":")) continue;
    if (!p.startsWith("/")) p = "/" + p;
    declaredPaths.add(p);
  }
}

const declared = [...declaredPaths].sort();
const unowned: string[] = [];
for (const p of declared) {
  if (!resolveRouteContext(p)) unowned.push(p);
}

// Reverse: any binding prefix that matches no declared route?
// Prefix-aware: a binding "/foo" is considered used if any declared route is "/foo" or starts with "/foo/".
const unusedBindings: string[] = [];
for (const b of ROUTE_CONTEXT_BINDINGS) {
  const id = b.identifier;
  const used = declared.some((p) => p === id || p.startsWith(id + "/") || p.startsWith(id));
  if (!used) unusedBindings.push(id);
}

const report = {
  generatedAt: new Date().toISOString(),
  declaredCount: declared.length,
  bindingsCount: ROUTE_CONTEXT_BINDINGS.length,
  unowned,
  unusedBindings,
  ok: unowned.length === 0,
};

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`Declared routes: ${declared.length}, bindings: ${ROUTE_CONTEXT_BINDINGS.length}`);
if (unowned.length > 0) {
  console.error(`❌ ${unowned.length} routes have no owning bounded context:`);
  for (const p of unowned) console.error(`   - ${p}`);
}
if (unusedBindings.length > 0) {
  console.warn(`⚠️  ${unusedBindings.length} bindings match no declared route (informational):`);
  for (const p of unusedBindings) console.warn(`   - ${p}`);
}

if (!report.ok) process.exit(1);
console.log("✅ Pass");

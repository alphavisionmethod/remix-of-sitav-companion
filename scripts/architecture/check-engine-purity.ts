/**
 * SITA OS — Engine Purity Guardrail
 *
 * Ensures `src/domains/engines/**` stays pure:
 *   - No Supabase imports
 *   - No raw localStorage / sessionStorage / fetch usage
 *   - No imports of services or persistence layers
 *
 * Known intentional exceptions (UI-runtime adapter surfaces) live in
 * the ALLOWLIST below and are documented in
 * `src/lib/services/business-os/README.md`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "src/domains/engines");
const FORBIDDEN: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /from\s+['"]@\/integrations\/supabase/, label: "supabase import" },
  { pattern: /from\s+['"]@\/lib\/services\//, label: "service import" },
  { pattern: /from\s+['"]@\/data\/persistence/, label: "persistence import" },
  { pattern: /\bsessionStorage\b/, label: "sessionStorage usage" },
  { pattern: /\bfetch\s*\(/, label: "raw fetch() call" },
];

// Files where storage-adapter methods are intentionally exposed
// for the UI runtime to call. Documented and stable.
const ALLOWLIST = new Set<string>([
  "setup-orchestration-engine.ts",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts") && !p.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

const violations: string[] = [];
for (const file of walk(ROOT)) {
  const rel = relative(process.cwd(), file);
  const base = rel.split("/").pop() ?? "";
  const src = readFileSync(file, "utf8");

  for (const { pattern, label } of FORBIDDEN) {
    if (pattern.test(src)) {
      violations.push(`  ✗ ${rel} — ${label}`);
    }
  }
  if (!ALLOWLIST.has(base) && /\blocalStorage\b/.test(src)) {
    violations.push(`  ✗ ${rel} — localStorage usage (extract to a service)`);
  }
}

if (violations.length > 0) {
  console.error("\n❌ Engine purity violations:\n");
  for (const v of violations) console.error(v);
  console.error(
    `\nFix: extract side effects to src/lib/services/business-os/* or add to ALLOWLIST with rationale.\n`,
  );
  process.exit(1);
}
console.log("✅ All domain engines are pure.");

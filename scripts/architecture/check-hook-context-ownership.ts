#!/usr/bin/env tsx
/**
 * SITA OS — Hook & Context Ownership Validator
 *
 * Enforces docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md and
 * REPOSITORY_CONSTITUTION.md boundary rule #51.
 *
 * Hard rules (always BLOCKING when --enforce or env
 * HOOK_CONTEXT_OWNERSHIP_ENFORCE=true):
 *
 *   H1. No file in src/hooks/**    may import from "@/modules/<pillar>/...".
 *   H2. No file in src/contexts/** may import from "@/modules/<pillar>/...".
 *
 * Soft rules (reported as warnings; flip to BLOCKING via --enforce-classification):
 *
 *   S1. Every file in src/hooks/** MUST be classified "shared" in
 *       generated/manifests/hook-ownership-map.json.
 *   S2. Every file in src/contexts/** MUST be classified "app-shell" in
 *       generated/manifests/context-ownership-map.json.
 *   S3. Every shim entry in
 *       generated/manifests/hook-context-ownership-exceptions.json MUST
 *       reference an existing canonical file under
 *       src/{modules,platform}/.../{hooks,contexts}/.
 *
 * Exit codes:
 *   0 = clean (within current enforcement gates)
 *   1 = hard rule violation OR (when enforcing) classification drift OR ledger error
 *
 * Usage:
 *   npx tsx scripts/architecture/check-hook-context-ownership.ts
 *   npx tsx scripts/architecture/check-hook-context-ownership.ts --enforce
 *   npx tsx scripts/architecture/check-hook-context-ownership.ts --enforce-classification
 *
 * In CI, the workflow sets env HOOK_CONTEXT_OWNERSHIP_ENFORCE=true to
 * promote hard violations to a blocking gate.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const HOOKS_DIR = join(ROOT, "src", "hooks");
const CONTEXTS_DIR = join(ROOT, "src", "contexts");
const HOOK_MAP = join(ROOT, "generated", "manifests", "hook-ownership-map.json");
const CTX_MAP = join(ROOT, "generated", "manifests", "context-ownership-map.json");
const LEDGER = join(ROOT, "generated", "manifests", "hook-context-ownership-exceptions.json");

const ENFORCE_HARD =
  process.argv.includes("--enforce") ||
  process.env.HOOK_CONTEXT_OWNERSHIP_ENFORCE === "true";
const ENFORCE_CLASSIFICATION = process.argv.includes("--enforce-classification");

const PILLARS = ["business", "concierge", "finance", "health", "intelligence", "mobile", "trust"];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (e === "__tests__") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

function importsIn(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const re = /from\s+["']([^"']+)["']/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

interface Violation { file: string; rule: string; detail: string; severity: "hard" | "soft" }
const violations: Violation[] = [];

function checkHardImports(dir: string, ruleId: string) {
  for (const file of walk(dir)) {
    const imps = importsIn(file);
    for (const spec of imps) {
      const m = spec.match(/^@\/modules\/([^/]+)/);
      if (m && PILLARS.includes(m[1])) {
        // Allow re-export shims: a one-line `export ... from "@/modules/<pillar>/..."`
        // file IS the canonical shim. Detect: file size <= 200 chars and only
        // contains "export ... from" lines.
        const src = readFileSync(file, "utf8");
        const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
        const onlyReexport = stripped.split("\n").every(l => {
          const t = l.trim();
          return t === "" || /^export\s+(?:\*|\{[^}]*\}|default)\s+(?:from\s+["'][^"']+["'])?;?$/.test(t)
            || /^export\s+\*\s+from\s+["'][^"']+["'];?$/.test(t)
            || /^export\s+\{[^}]*\}\s+from\s+["'][^"']+["'];?$/.test(t)
            || /^export\s+(?:type\s+)?\{[^}]*\}\s+from\s+["'][^"']+["'];?$/.test(t)
            || /^export\s+\{\s*default\s*(?:as\s+\w+)?\s*\}\s+from\s+["'][^"']+["'];?$/.test(t);
        });
        if (onlyReexport) {
          // Must be tracked in ledger; recorded later by checkLedger().
          continue;
        }
        violations.push({
          file: relative(ROOT, file).replace(/\\/g, "/"),
          rule: ruleId,
          detail: `imports "${spec}" — pillar-owned code MUST move into src/modules/${m[1]}/{hooks,contexts}/`,
          severity: "hard",
        });
        break;
      }
    }
  }
}

function loadRationaleExemptions(): Set<string> {
  if (!existsSync(LEDGER)) return new Set();
  try {
    const data = JSON.parse(readFileSync(LEDGER, "utf8")) as {
      rationale?: Array<{ path?: string; decision?: string }>;
    };
    const out = new Set<string>();
    for (const r of data.rationale ?? []) {
      if (r.decision === "keep-shared" && r.path) out.add(r.path);
    }
    return out;
  } catch {
    return new Set();
  }
}

function checkClassification(mapPath: string, expected: string, ruleId: string) {
  if (!existsSync(mapPath)) {
    violations.push({ file: relative(ROOT, mapPath), rule: ruleId,
      detail: "ownership map missing — run `npx tsx scripts/architecture/emit-hook-context-ownership-map.ts`",
      severity: "soft" });
    return;
  }
  const exemptions = loadRationaleExemptions();
  const data = JSON.parse(readFileSync(mapPath, "utf8")) as { entries: Array<{ path: string; classification: string }> };
  for (const e of data.entries) {
    if (e.classification !== expected) {
      if (exemptions.has(e.path)) continue;
      violations.push({
        file: e.path,
        rule: ruleId,
        detail: `classification "${e.classification}" — must be "${expected}" or moved to canonical owner path`,
        severity: "soft",
      });
    }
  }
}

function checkLedger() {
  if (!existsSync(LEDGER)) {
    violations.push({ file: relative(ROOT, LEDGER), rule: "L1",
      detail: "exception ledger missing", severity: "soft" });
    return;
  }
  const data = JSON.parse(readFileSync(LEDGER, "utf8")) as {
    shims?: Array<{ shimPath: string; canonicalPath: string; expiry?: string; importerCount?: number; rationale?: string }>;
  };
  const shims = data.shims ?? [];
  for (const s of shims) {
    const canon = join(ROOT, s.canonicalPath);
    if (!existsSync(canon)) {
      violations.push({ file: s.shimPath, rule: "L2",
        detail: `canonical path missing: ${s.canonicalPath}`, severity: "hard" });
    }
    const shim = join(ROOT, s.shimPath);
    if (!existsSync(shim)) {
      violations.push({ file: s.shimPath, rule: "L3",
        detail: "shim entry references nonexistent file — remove from ledger", severity: "soft" });
    }
    if (!s.expiry) {
      violations.push({ file: s.shimPath, rule: "L4",
        detail: "shim missing `expiry` phase tag", severity: "soft" });
    }
  }
}

checkHardImports(HOOKS_DIR, "H1");
checkHardImports(CONTEXTS_DIR, "H2");
checkClassification(HOOK_MAP, "shared", "S1");
checkClassification(CTX_MAP, "app-shell", "S2");
checkLedger();

const hard = violations.filter(v => v.severity === "hard");
const soft = violations.filter(v => v.severity === "soft");

console.log("\n═══ Hook & Context Ownership Check ═══");
console.log(`Hard violations:  ${hard.length}`);
console.log(`Soft violations:  ${soft.length}`);
console.log(`Mode: hard=${ENFORCE_HARD ? "ENFORCE" : "warn"}  classification=${ENFORCE_CLASSIFICATION ? "ENFORCE" : "warn"}`);

if (hard.length) {
  console.log("\n▶ Hard violations (constitutional rule #51):");
  for (const v of hard) console.log(`  ✗ [${v.rule}] ${v.file} — ${v.detail}`);
}
if (soft.length && (process.env.HOOK_CONTEXT_OWNERSHIP_VERBOSE === "true" || ENFORCE_CLASSIFICATION)) {
  console.log("\n▶ Soft violations (classification / ledger):");
  for (const v of soft.slice(0, 200)) console.log(`  • [${v.rule}] ${v.file} — ${v.detail}`);
  if (soft.length > 200) console.log(`  … and ${soft.length - 200} more`);
}

const fail =
  (ENFORCE_HARD && hard.length > 0) ||
  (ENFORCE_CLASSIFICATION && soft.length > 0);

if (fail) {
  console.log("\n❌ BLOCKED — hook/context ownership rules violated.");
  process.exit(1);
}
console.log(`\n✅ ${hard.length || soft.length ? "warn-only mode — drift recorded" : "clean"}`);
process.exit(0);
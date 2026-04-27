#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — End-to-End Flow Continuity Baseline Emitter
//
// Scans the real repository for cross-module continuity wiring and
// emits a canonical JSON baseline used by the Continuity Map doc,
// the warn-only handoff validator, and the per-phase regression
// checks.
//
// Outputs:
//   generated/audits/end-to-end-flow-continuity-baseline.json
//
// Detects:
//   • setLinkedContext call sites: file, line, entity type, target route
//   • consumeLinkedContext call sites: file, line, accepted entity types
//   • convert-to-* action handlers in `useAction(...)` calls
//   • CrossAppAction targets used in JSX
//   • Const-data leaks: pages importing fixtures from
//     `@/data/fixtures/mock-data/...` outside an `isDemo*` branch
//
// This is a STATIC scan — no runtime execution. Designed to run in
// pre-commit / CI without env or DB access.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT_DIR = path.join(ROOT, "generated", "audits");
const OUT_FILE = path.join(OUT_DIR, "end-to-end-flow-continuity-baseline.json");

interface SetLinkedSite {
  file: string;
  line: number;
  entityType: string | null;
  targetRoute: string | null;
  snippet: string;
}

interface ConsumeLinkedSite {
  file: string;
  line: number;
  acceptedEntityTypes: string[];
}

interface ConvertActionSite {
  file: string;
  line: number;
  domain: string | null;
  verb: string | null;
}

interface CrossAppTarget {
  file: string;
  line: number;
  to: string | null;
  label: string | null;
}

interface FixtureLeak {
  file: string;
  line: number;
  fixtureModule: string;
  guarded: boolean;
}

interface Baseline {
  generatedAt: string;
  scannedFileCount: number;
  setLinkedContextSites: SetLinkedSite[];
  consumeLinkedContextSites: ConsumeLinkedSite[];
  convertActionSites: ConvertActionSite[];
  crossAppTargets: CrossAppTarget[];
  fixtureLeaks: FixtureLeak[];
  summary: {
    setLinkedTotal: number;
    consumeLinkedTotal: number;
    convertActionTotal: number;
    crossAppTargetTotal: number;
    fixtureLeakTotal: number;
    fixtureLeakUnguarded: number;
    /** entity types set but never consumed at any target */
    orphanEntityTypes: string[];
  };
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip generated, tests-only-fixture, and non-source dirs that would
      // otherwise add noise.
      if (entry.name === "node_modules" || entry.name === "__tests__" || entry.name === "test") {
        continue;
      }
      walk(full, files);
    } else if (/\.(tsx?|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const SET_LINKED_RX =
  /setLinkedContext\(\s*\{[^}]*entityType\s*:\s*["'`]([a-z0-9_-]+)["'`]/gi;
const NAVIGATE_AFTER_SET_RX =
  /navigate\(\s*["'`](\/[a-z0-9/_:-]+)["'`]/i;
const CONSUME_LINKED_RX = /consumeLinkedContext\(\)/g;
const CONSUME_TYPE_GUARD_RX =
  /(?:linked|ctx)(?:Context)?\??\.entityType\s*(?:===|!==)\s*["'`]([a-z0-9_-]+)["'`]/gi;
const USE_ACTION_RX =
  /useAction\(\s*["'`]([a-z0-9-]+)["'`]\s*,\s*["'`]([a-z0-9._-]+)["'`]/gi;
const CROSS_APP_RX =
  /<CrossAppAction\b[^>]*?to\s*=\s*["'`]([^"'`]+)["'`][^>]*?label\s*=\s*["'`]([^"'`]+)["'`]/gi;
const FIXTURE_IMPORT_RX =
  /from\s+["'`](@\/data\/fixtures\/mock-data\/[a-z0-9/_-]+)["'`]/gi;
const ISDEMO_RX = /\bisDemo(?:Mode)?\b/;

function rel(p: string): string {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function scan(): Baseline {
  const files = walk(SRC);
  const setLinkedSites: SetLinkedSite[] = [];
  const consumeLinkedSites: ConsumeLinkedSite[] = [];
  const convertActionSites: ConvertActionSite[] = [];
  const crossAppTargets: CrossAppTarget[] = [];
  const fixtureLeaks: FixtureLeak[] = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split("\n");
    const relPath = rel(file);

    // setLinkedContext
    let m: RegExpExecArray | null;
    SET_LINKED_RX.lastIndex = 0;
    while ((m = SET_LINKED_RX.exec(text)) !== null) {
      const entityType = m[1];
      const upto = text.slice(m.index);
      // Look ahead in the same callback for a navigate(...) call.
      const window = upto.slice(0, 600);
      const navMatch = window.match(NAVIGATE_AFTER_SET_RX);
      const targetRoute = navMatch ? navMatch[1] : null;
      const lineNo = text.slice(0, m.index).split("\n").length;
      setLinkedSites.push({
        file: relPath,
        line: lineNo,
        entityType,
        targetRoute,
        snippet: lines[lineNo - 1]?.trim().slice(0, 160) ?? "",
      });
    }

    // consumeLinkedContext
    CONSUME_LINKED_RX.lastIndex = 0;
    while ((m = CONSUME_LINKED_RX.exec(text)) !== null) {
      const lineNo = text.slice(0, m.index).split("\n").length;
      // Inspect next 800 chars for entityType comparisons.
      const window = text.slice(m.index, m.index + 800);
      const accepted: string[] = [];
      let g: RegExpExecArray | null;
      CONSUME_TYPE_GUARD_RX.lastIndex = 0;
      while ((g = CONSUME_TYPE_GUARD_RX.exec(window)) !== null) {
        accepted.push(g[1]);
      }
      consumeLinkedSites.push({
        file: relPath,
        line: lineNo,
        acceptedEntityTypes: Array.from(new Set(accepted)),
      });
    }

    // useAction("convert-*" / "*.convert-*")
    USE_ACTION_RX.lastIndex = 0;
    while ((m = USE_ACTION_RX.exec(text)) !== null) {
      if (!/convert/.test(m[2])) continue;
      const lineNo = text.slice(0, m.index).split("\n").length;
      convertActionSites.push({
        file: relPath,
        line: lineNo,
        domain: m[1],
        verb: m[2],
      });
    }

    // CrossAppAction JSX
    CROSS_APP_RX.lastIndex = 0;
    while ((m = CROSS_APP_RX.exec(text)) !== null) {
      const lineNo = text.slice(0, m.index).split("\n").length;
      crossAppTargets.push({
        file: relPath,
        line: lineNo,
        to: m[1],
        label: m[2],
      });
    }

    // Fixture leak: import from mock-data/... in a page that isn't
    // strictly demo-source (i.e. not under `src/data/fixtures/`,
    // `src/website-demo/`, or `src/__tests__/`).
    if (!relPath.startsWith("src/data/fixtures/") &&
        !relPath.startsWith("src/website-demo/") &&
        !relPath.startsWith("src/__tests__/")) {
      FIXTURE_IMPORT_RX.lastIndex = 0;
      while ((m = FIXTURE_IMPORT_RX.exec(text)) !== null) {
        const lineNo = text.slice(0, m.index).split("\n").length;
        // Heuristic: file is "guarded" if it references isDemo / isDemoMode anywhere.
        const guarded = ISDEMO_RX.test(text);
        fixtureLeaks.push({
          file: relPath,
          line: lineNo,
          fixtureModule: m[1],
          guarded,
        });
      }
    }
  }

  // Orphan detection: entity types that are SET somewhere but never
  // mentioned in any consume site's acceptedEntityTypes.
  const consumedTypes = new Set<string>();
  for (const c of consumeLinkedSites) {
    for (const t of c.acceptedEntityTypes) consumedTypes.add(t);
  }
  const orphanEntityTypes = Array.from(
    new Set(
      setLinkedSites
        .map((s) => s.entityType)
        .filter((t): t is string => !!t && !consumedTypes.has(t)),
    ),
  ).sort();

  return {
    generatedAt: new Date().toISOString(),
    scannedFileCount: files.length,
    setLinkedContextSites: setLinkedSites,
    consumeLinkedContextSites: consumeLinkedSites,
    convertActionSites,
    crossAppTargets,
    fixtureLeaks,
    summary: {
      setLinkedTotal: setLinkedSites.length,
      consumeLinkedTotal: consumeLinkedSites.length,
      convertActionTotal: convertActionSites.length,
      crossAppTargetTotal: crossAppTargets.length,
      fixtureLeakTotal: fixtureLeaks.length,
      fixtureLeakUnguarded: fixtureLeaks.filter((l) => !l.guarded).length,
      orphanEntityTypes,
    },
  };
}

function main(): number {
  const baseline = scan();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(baseline, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(
    `✅ Continuity baseline emitted to ${rel(OUT_FILE)} ` +
      `(set=${baseline.summary.setLinkedTotal}, consume=${baseline.summary.consumeLinkedTotal}, ` +
      `convert=${baseline.summary.convertActionTotal}, crossApp=${baseline.summary.crossAppTargetTotal}, ` +
      `fixtureLeaks=${baseline.summary.fixtureLeakTotal}/${baseline.summary.fixtureLeakUnguarded} unguarded, ` +
      `orphans=${baseline.summary.orphanEntityTypes.length})`,
  );
  return 0;
}

process.exit(main());
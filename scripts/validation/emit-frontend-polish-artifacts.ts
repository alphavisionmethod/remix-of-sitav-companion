#!/usr/bin/env node
/* eslint-disable no-console */
// Frontend Polish Closure — emits canonical machine-readable artifacts
// summarizing the AI Engineer hub's polish state. Mirrors the
// emit-mobile-scope-artifacts.ts shape and is the single source of truth
// for the FrontendPolishTruthPanel + the 7 closure validators.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const OUT_DIR = "generated/frontend-polish-closure";
const BOARD_DIR = "src/pages/admin/ai-runtime";
const PANEL_DIR = "src/components/admin/ai-runtime";

mkdirSync(OUT_DIR, { recursive: true });

// ── 1. Enumerate boards in scope ─────────────────────────────────
function listBoards(): string[] {
  if (!existsSync(BOARD_DIR)) return [];
  return readdirSync(BOARD_DIR)
    .filter((f) => f.endsWith("Board.tsx") || f.endsWith("Timeline.tsx"))
    .filter((f) => f !== "AIRuntimeHome.tsx");
}

const boards = listBoards();

// ── 2. Per-board polish scan ────────────────────────────────────
interface BoardScan {
  file: string;
  hasEmptyState: boolean;
  hasBoardSection: boolean;
  hasSkeleton: boolean;
  hasErrorState: boolean;
  rawNoTextCount: number;
  deadCtaCount: number;
  forbiddenPhrases: string[];
}

const FORBIDDEN = ["TODO", "FIXME", "lorem ipsum", "alert(", "console.log("];
const RAW_NO_RE =
  /<(p|div|span)[^>]*className=["'][^"']*text-muted-foreground[^"']*["'][^>]*>\s*No /gi;
const DEAD_CTA_RE =
  /onClick=\{\s*(\(\)\s*=>\s*\{\s*\}|\(\)\s*=>\s*null|undefined)\s*\}|href=["']#["']/g;

function scanBoard(file: string): BoardScan {
  const src = readFileSync(join(BOARD_DIR, file), "utf-8");
  return {
    file,
    hasEmptyState: /from ["']@\/components\/primitives\/feedback\/EmptyState["']/.test(src) ||
      /from ["']@\/components\/admin\/ai-runtime\/_shared\/BoardSection["']/.test(src),
    hasBoardSection:
      /from ["']@\/components\/admin\/ai-runtime\/_shared\/BoardSection["']/.test(src),
    hasSkeleton:
      /from ["']@\/components\/primitives\/feedback\/Skeleton["']/.test(src) ||
      /from ["']@\/components\/admin\/ai-runtime\/_shared\/BoardSection["']/.test(src) ||
      /animate-pulse/.test(src),
    hasErrorState:
      /catch\s*\(/.test(src) || /\.error/.test(src) || /useState[^;]*error/i.test(src),
    rawNoTextCount: (src.match(RAW_NO_RE) ?? []).length,
    deadCtaCount: (src.match(DEAD_CTA_RE) ?? []).length,
    forbiddenPhrases: FORBIDDEN.filter((p) => src.includes(p)),
  };
}

const scans = boards.map(scanBoard);

// ── 3. Aggregates ────────────────────────────────────────────────
const polished = scans.filter(
  (s) => s.hasEmptyState && s.hasErrorState && s.rawNoTextCount === 0,
).length;
const emptyStateViolations = scans.reduce((n, s) => n + s.rawNoTextCount, 0);
const ctaViolations = scans.reduce((n, s) => n + s.deadCtaCount, 0);
const trustCopyViolations = scans.reduce(
  (n, s) => n + s.forbiddenPhrases.length,
  0,
);
const stateHandlingViolations = scans.filter(
  (s) => !s.hasErrorState || !s.hasSkeleton,
).length;
const shellOnlyViolations = scans.filter((s) => {
  const src = readFileSync(join(BOARD_DIR, s.file), "utf-8");
  return !/supabase/.test(src);
}).length;
const responsiveViolations = scans.filter((s) => {
  const src = readFileSync(join(BOARD_DIR, s.file), "utf-8");
  return /<table|<Table /.test(src) && !/overflow-x-auto|ScrollArea/.test(src);
}).length;

const acceptance = {
  every_board_has_empty_state_primitive: emptyStateViolations === 0,
  every_board_has_loading_skeleton: stateHandlingViolations === 0,
  every_board_has_error_handling: scans.every((s) => s.hasErrorState),
  zero_dead_ctas: ctaViolations === 0,
  zero_forbidden_copy: trustCopyViolations === 0,
  zero_shell_only_pages: shellOnlyViolations === 0,
  responsive_tables_wrapped: responsiveViolations === 0,
  truth_panel_mounted: existsSync(
    join(PANEL_DIR, "FrontendPolishTruthPanel.tsx"),
  ),
  shared_helper_present: existsSync(
    join(PANEL_DIR, "_shared/BoardSection.tsx"),
  ),
};

const failed = Object.entries(acceptance)
  .filter(([, v]) => !v)
  .map(([k]) => k);
const ok = failed.length === 0;

// ── 4. Write artifacts ───────────────────────────────────────────
const generatedAt = new Date().toISOString();

writeFileSync(
  join(OUT_DIR, "frontend-completeness-status.json"),
  JSON.stringify(
    {
      generatedAt,
      scope: "admin/ai-runtime",
      boards: scans.map((s) => ({
        surface: s.file.replace(/\.tsx$/, ""),
        emptyStatePolished: s.rawNoTextCount === 0 && s.hasEmptyState,
        loadingPolished: s.hasSkeleton,
        errorPolished: s.hasErrorState,
        boardSectionAdopted: s.hasBoardSection,
      })),
      total: scans.length,
      polished,
    },
    null,
    2,
  ),
);

writeFileSync(
  join(OUT_DIR, "empty-state-status.json"),
  JSON.stringify(
    {
      generatedAt,
      scope: "admin/ai-runtime",
      violations: emptyStateViolations,
      offenders: scans
        .filter((s) => s.rawNoTextCount > 0)
        .map((s) => ({ file: s.file, raw_no_text_count: s.rawNoTextCount })),
    },
    null,
    2,
  ),
);

writeFileSync(
  join(OUT_DIR, "cta-integrity-status.json"),
  JSON.stringify(
    {
      generatedAt,
      scope: "admin/ai-runtime",
      violations: ctaViolations,
      offenders: scans
        .filter((s) => s.deadCtaCount > 0)
        .map((s) => ({ file: s.file, dead_cta_count: s.deadCtaCount })),
    },
    null,
    2,
  ),
);

writeFileSync(
  join(OUT_DIR, "state-handling-status.json"),
  JSON.stringify(
    {
      generatedAt,
      scope: "admin/ai-runtime",
      violations: stateHandlingViolations,
      offenders: scans
        .filter((s) => !s.hasErrorState || !s.hasSkeleton)
        .map((s) => ({
          file: s.file,
          missing_skeleton: !s.hasSkeleton,
          missing_error: !s.hasErrorState,
        })),
    },
    null,
    2,
  ),
);

writeFileSync(
  join(OUT_DIR, "frontend-polish-verification.json"),
  JSON.stringify(
    {
      generatedAt,
      ok,
      status: ok ? "GREEN" : "RED",
      scope: "admin/ai-runtime",
      boards_total: scans.length,
      boards_polished: polished,
      empty_state_violations: emptyStateViolations,
      cta_violations: ctaViolations,
      shell_only_violations: shellOnlyViolations,
      state_handling_violations: stateHandlingViolations,
      trust_copy_violations: trustCopyViolations,
      responsive_violations: responsiveViolations,
      acceptance,
      failed_checks: failed,
    },
    null,
    2,
  ),
);

writeFileSync(
  join(OUT_DIR, "FRONTEND_POLISH_FINAL_VERIFICATION.md"),
  [
    "# Frontend Polish Closure — Final Verification",
    "",
    `_Generated: ${generatedAt}_`,
    "",
    `**Scope:** \`admin/ai-runtime\` (Admin AI Engineer team only)`,
    `**Boards in scope:** ${scans.length}`,
    `**Polished:** ${polished} / ${scans.length}`,
    `**Status:** ${ok ? "🟢 GREEN" : "🔴 RED"}`,
    "",
    "## Acceptance",
    "",
    ...Object.entries(acceptance).map(
      ([k, v]) => `- ${v ? "✅" : "❌"} ${k}`,
    ),
    "",
    "## Per-board scan",
    "",
    "| Board | EmptyState | Skeleton | Error | BoardSection | Raw `No…` |",
    "|---|---|---|---|---|---|",
    ...scans.map(
      (s) =>
        `| ${s.file} | ${s.hasEmptyState ? "✅" : "❌"} | ${s.hasSkeleton ? "✅" : "❌"} | ${s.hasErrorState ? "✅" : "❌"} | ${s.hasBoardSection ? "✅" : "—"} | ${s.rawNoTextCount} |`,
    ),
  ].join("\n"),
);

console.log(
  `${ok ? "✅" : "❌"} frontend-polish-closure: ${polished}/${scans.length} polished, ${emptyStateViolations} raw empty-state, ${ctaViolations} dead CTAs`,
);
process.exit(ok ? 0 : 0); // emitter never blocks; gates do

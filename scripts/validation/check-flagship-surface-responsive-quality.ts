#!/usr/bin/env node
// Flagship Surface Closure — Responsive Quality (WARN-tier hybrid)
//
// HONEST CLASSIFICATION
// IN-SCOPE (admin AI): verifies admin AI surfaces use canonical responsive primitives — must PASS.
// OUT-OF-SCOPE (user-flagship): emits WARN-tier deferrals for the 4 deferred surfaces.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "flagship-surface-responsive-quality";
const issues: GateIssue[] = [];

// Canonical responsive primitives (Tailwind breakpoint usage = canonical).
const RESPONSIVE_TOKENS = [/\bsm:/g, /\bmd:/g, /\blg:/g, /\bxl:/g, /\bgrid-cols-/g, /\bflex-col\b/g];

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const ADMIN_AI_SURFACES = [
  "src/pages/admin/ai-runtime",
  "src/components/admin/ai-runtime",
  "src/pages/admin/integrations",
];

let scanned = 0;
let withResponsive = 0;
let lackResponsive: string[] = [];
for (const root of ADMIN_AI_SURFACES) {
  for (const f of walk(root)) {
    scanned++;
    const src = readFileSync(f, "utf8");
    const hasAny = RESPONSIVE_TOKENS.some((re) => re.test(src));
    if (hasAny) withResponsive++;
    else lackResponsive.push(f);
  }
}

// Threshold: at least 60% of admin AI files should use canonical responsive primitives.
const pct = scanned > 0 ? Math.round((withResponsive / scanned) * 100) : 0;
if (scanned > 0 && pct < 60) {
  issues.push({
    severity: "error",
    area: "admin-ai-responsive-coverage",
    message: `Only ${pct}% of admin AI surfaces (${withResponsive}/${scanned}) use canonical responsive primitives. Threshold: 60%.`,
  });
} else {
  // Informational: list the non-responsive files as warnings only.
  for (const f of lackResponsive.slice(0, 10)) {
    issues.push({
      severity: "warning",
      area: "admin-ai-responsive-coverage",
      message: `${f} does not use canonical responsive primitives (sm:/md:/lg:/xl:/grid-cols-/flex-col). Acceptable if leaf primitive.`,
    });
  }
}

// Deferred surfaces — honest WARN
const DEFERRED = [
  { surface: "onboarding", doc: "generated/flagship-surface-closure/ONBOARDING_WIRING_AUDIT.md" },
  { surface: "boardroom-briefing", doc: "generated/flagship-surface-closure/BOARDROOM_BRIEFING_CLOSURE_SPEC.md" },
  { surface: "concierge", doc: "generated/flagship-surface-closure/CONCIERGE_CHAT_CLOSURE_SPEC.md" },
  { surface: "communications", doc: "generated/flagship-surface-closure/COMMUNICATIONS_INBOX_CLOSURE_SPEC.md" },
];
for (const d of DEFERRED) {
  if (!existsSync(d.doc)) {
    issues.push({
      severity: "error",
      area: `deferral-marker-${d.surface}`,
      message: `Deferral doc missing: ${d.doc}`,
    });
  } else {
    issues.push({
      severity: "warning",
      area: `deferred-${d.surface}`,
      message: `Responsive quality polish for ${d.surface} DEFERRED to user-flagship-pass. See ${d.doc}.`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "hybrid-pass-with-honest-warn-deferrals",
    adminAIScanned: scanned,
    adminAIWithResponsive: withResponsive,
    coveragePct: pct,
    threshold: 60,
  },
});
process.exit(ok ? 0 : 1);

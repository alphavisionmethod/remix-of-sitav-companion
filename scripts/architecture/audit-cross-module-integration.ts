#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Module Integration Audit
// ───────────────────────────────────────────────────────────────
// Walks the repository for cross-module integration touchpoints,
// classifies each as ui-only / partial / strong / missing-reverse /
// missing-proof / missing-identity, and writes a canonical audit
// JSON + Markdown report.
//
// This is the foundation of the Cross-Module Integration Deepening
// project. Every later phase reads its baseline from this audit.
//
// Run: `bun scripts/architecture/audit-cross-module-integration.ts`
// ═══════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const REPO = process.cwd();
const SRC = join(REPO, "src");
const MIGRATIONS = join(REPO, "supabase", "migrations");
const OUT_DIR = join(REPO, "generated", "audits");

type Touchpoint = {
  id: string;
  kind:
    | "link-table"
    | "bridge-service"
    | "linkage-component"
    | "set-linked-context"
    | "fk-column-usage"
    | "background-task-source"
    | "background-task-resolver"
    | "advisor-outcome-handler"
    | "adaptive-signal-emitter"
    | "adaptive-signal-receiver"
    | "readiness-consumer";
  file: string;
  excerpt?: string;
  classification:
    | "strong"
    | "partial"
    | "ui-only"
    | "missing-reverse"
    | "missing-proof"
    | "missing-identity";
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function read(file: string): string {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function rel(file: string): string {
  return relative(REPO, file).replace(/\\/g, "/");
}

function findAll(re: RegExp, text: string): RegExpMatchArray[] {
  const out: RegExpMatchArray[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(text)) !== null) out.push(m);
  return out;
}

function classifyLinkage(file: string, text: string): Touchpoint["classification"] {
  const hasFromTable = /fromTable\(/.test(text);
  const hasSetLinked = /setLinkedContext\(/.test(text);
  const hasNavigate = /useNavigate\(\)|navigate\(/.test(text);
  if (hasFromTable && hasSetLinked && hasNavigate) return "strong";
  if (hasFromTable && hasNavigate) return "partial";
  if (hasNavigate) return "ui-only";
  return "missing-identity";
}

function main() {
  const allFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));
  const migrationFiles = (() => {
    try {
      return walk(MIGRATIONS).filter((f) => /\.sql$/.test(f));
    } catch {
      return [];
    }
  })();

  const touchpoints: Touchpoint[] = [];

  // 1. Link tables (DB)
  for (const f of migrationFiles) {
    const t = read(f);
    const matches = findAll(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_]+_link)\b/i,
      t,
    );
    for (const m of matches) {
      touchpoints.push({
        id: `link-table:${m[1]}`,
        kind: "link-table",
        file: rel(f),
        excerpt: m[0],
        classification: "strong",
      });
    }
  }

  // 2. Bridge services
  for (const f of allFiles) {
    if (!/bridge\.service\.ts$/.test(f)) continue;
    touchpoints.push({
      id: `bridge-service:${rel(f)}`,
      kind: "bridge-service",
      file: rel(f),
      classification: "strong",
    });
  }

  // 3. Linkage components
  for (const f of allFiles) {
    if (!/Linkage\.tsx$/.test(f)) continue;
    const t = read(f);
    touchpoints.push({
      id: `linkage-component:${rel(f)}`,
      kind: "linkage-component",
      file: rel(f),
      classification: classifyLinkage(f, t),
    });
  }

  // 4. setLinkedContext call-sites
  for (const f of allFiles) {
    const t = read(f);
    if (!/setLinkedContext\(/.test(t)) continue;
    if (/CrossAppAction\.tsx$/.test(f)) continue; // definition site
    touchpoints.push({
      id: `set-linked-context:${rel(f)}`,
      kind: "set-linked-context",
      file: rel(f),
      classification: "strong",
    });
  }

  // 5. FK column usage (crm_contact_id / crm_company_id reads)
  for (const f of allFiles) {
    const t = read(f);
    if (!/crm_contact_id|crm_company_id/.test(t)) continue;
    if (/integrations\/supabase\/types\.ts$/.test(f)) continue;
    touchpoints.push({
      id: `fk-column-usage:${rel(f)}`,
      kind: "fk-column-usage",
      file: rel(f),
      classification: "strong",
    });
  }

  // 6. Background-task source tables
  for (const f of allFiles) {
    if (!/task-target-resolver/.test(f)) continue;
    touchpoints.push({
      id: `background-task-resolver:${rel(f)}`,
      kind: "background-task-resolver",
      file: rel(f),
      classification: "strong",
    });
  }

  // 7. Advisor outcome handlers (heuristic — pre-Phase 5 there is none)
  let advisorOutcomePresent = false;
  for (const f of allFiles) {
    const t = read(f);
    if (/advisor_action_outcomes|advisor-outcome-bridge/.test(t)) {
      advisorOutcomePresent = true;
      touchpoints.push({
        id: `advisor-outcome-handler:${rel(f)}`,
        kind: "advisor-outcome-handler",
        file: rel(f),
        classification: "strong",
      });
    }
  }
  if (!advisorOutcomePresent) {
    touchpoints.push({
      id: "advisor-outcome-handler:MISSING",
      kind: "advisor-outcome-handler",
      file: "(none)",
      classification: "missing-proof",
    });
  }

  // 8. Adaptive signal emitters / receivers
  for (const f of allFiles) {
    const t = read(f);
    if (/CrossDomainSignalBridge|cross-domain-signal-bus/.test(t)) {
      const role = /emit|publish|dispatch/i.test(t)
        ? "adaptive-signal-emitter"
        : "adaptive-signal-receiver";
      touchpoints.push({
        id: `${role}:${rel(f)}`,
        kind: role as Touchpoint["kind"],
        file: rel(f),
        classification: /cross-domain-signal-bus/.test(t) ? "strong" : "partial",
      });
    }
  }

  // 9. Readiness consumers
  for (const f of allFiles) {
    const t = read(f);
    if (/readinessGate|readiness_snapshot|use-focus-mode/.test(t)) {
      touchpoints.push({
        id: `readiness-consumer:${rel(f)}`,
        kind: "readiness-consumer",
        file: rel(f),
        classification: /readinessGate/.test(t) ? "strong" : "partial",
      });
    }
  }

  // ── Summarize ───────────────────────────────────────────────
  const byKind = touchpoints.reduce<Record<string, number>>((acc, t) => {
    acc[t.kind] = (acc[t.kind] ?? 0) + 1;
    return acc;
  }, {});
  const byClassification = touchpoints.reduce<Record<string, number>>((acc, t) => {
    acc[t.classification] = (acc[t.classification] ?? 0) + 1;
    return acc;
  }, {});

  mkdirSync(OUT_DIR, { recursive: true });

  const json = {
    generatedAt: new Date().toISOString(),
    counts: { total: touchpoints.length, byKind, byClassification },
    touchpoints,
  };
  writeFileSync(
    join(OUT_DIR, "cross-module-integration-audit.json"),
    JSON.stringify(json, null, 2),
  );

  const md: string[] = [];
  md.push("# SITA OS — Cross-Module Integration Audit");
  md.push("");
  md.push(`Generated: \`${json.generatedAt}\``);
  md.push("");
  md.push("## Counts");
  md.push("");
  md.push(`- Total touchpoints: **${touchpoints.length}**`);
  md.push("");
  md.push("### By kind");
  md.push("");
  for (const [k, v] of Object.entries(byKind).sort()) md.push(`- \`${k}\` — ${v}`);
  md.push("");
  md.push("### By classification");
  md.push("");
  for (const [k, v] of Object.entries(byClassification).sort()) md.push(`- \`${k}\` — ${v}`);
  md.push("");
  md.push("## Touchpoints");
  md.push("");
  md.push("| Kind | Classification | File |");
  md.push("| --- | --- | --- |");
  for (const t of touchpoints.sort((a, b) => a.kind.localeCompare(b.kind))) {
    md.push(`| \`${t.kind}\` | \`${t.classification}\` | \`${t.file}\` |`);
  }
  md.push("");
  writeFileSync(join(OUT_DIR, "cross-module-integration-audit.md"), md.join("\n"));

  // eslint-disable-next-line no-console
  console.log(
    `✓ Cross-module audit: ${touchpoints.length} touchpoints → generated/audits/cross-module-integration-audit.{json,md}`,
  );
}

main();
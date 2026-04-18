#!/usr/bin/env node
// SITA OS — Real File Migration Wave 2
// Second pass: targets the next-heaviest @/lib/* importers after Wave 1.
// Same contract: read original → write canonical → wrap original → record.

import * as fs from "fs";
import * as path from "path";

type Move = { from: string; to: string; canonicalImport: string };

const MOVES: Move[] = [
  // ── Demo data → src/data/seed ────────────────────────────────────
  ...[
    "admin-platform",
    "revenue-office",
    "core-pages",
    "digital-presence",
    "integrations",
    "admin-intelligence",
    "atlas",
    "approval-chamber",
    "app-receipts",
    "apps",
    "business",
    "calendar-workspace",
    "communications",
    "concierge",
    "connectors",
    "durability",
    "enterprise",
    "health-signals",
    "import-export",
    "incidents",
    "media",
    "native-shell",
    "notes",
    "notification-calm",
    "outcome-engine",
    "owner-center-costs",
    "packs",
    "system-status",
  ].map(name => {
    const ext = name === "admin-platform" ? "tsx" : "ts";
    return {
      from: `src/lib/demo-data/${name}.${ext}`,
      to: `src/data/seed/${name}.${ext}`,
      canonicalImport: `@/data/seed/${name}`,
    };
  }),

  // ── Design system → src/platform/design-system ───────────────────
  ...[
    "sita-design-tokens",
    "app-window-system",
    "nova-os",
    "domain-atmospheres",
    "snap-zones",
  ].map(name => ({
    from: `src/lib/design-system/${name}.ts`,
    to: `src/platform/design-system/${name}.ts`,
    canonicalImport: `@/platform/design-system/${name}`,
  })),

  // ── Data services → src/data/repositories (top consumers) ────────
  ...[
    "crm-data-service",
    "file-explorer-service",
  ].map(name => ({
    from: `src/lib/data-services/${name}.ts`,
    to: `src/data/repositories/${name}.ts`,
    canonicalImport: `@/data/repositories/${name}`,
  })),

  // ── Customer journey → src/domains/customer-journey ─────────────
  ...[
    "journey-registry",
    "journey-hooks",
    "journey-ingestion-hooks",
    "journey-scoring-hooks",
    "journey-coverage-hooks",
    "journey-evidence-hooks",
    "ai-journey-classifier",
    "blocker-scoring-engine",
    "journey-registry-seeder",
  ].map(name => ({
    from: `src/lib/customer-journey/${name}.ts`,
    to: `src/domains/customer-journey/${name}.ts`,
    canonicalImport: `@/domains/customer-journey/${name}`,
  })),

  // ── Investment office mock data → domain ─────────────────────────
  {
    from: "src/lib/investment-office/mock-data.ts",
    to: "src/domains/investment/mock-data.ts",
    canonicalImport: "@/domains/investment/mock-data",
  },

  // ── Cloud backbone → src/platform/cloud ──────────────────────────
  ...[
    "cloud-storage-service",
    "cloud-lifecycle-service",
    "cloud-abuse-service",
    "cloud-audit-service",
    "cloud-device-service",
    "cloud-quota-service",
    "cloud-support-service",
    "cloud-sync-service",
    "cloud-tenant-service",
    "cloud-worker-service",
  ].map(name => ({
    from: `src/lib/cloud-backbone/${name}.ts`,
    to: `src/platform/cloud/${name}.ts`,
    canonicalImport: `@/platform/cloud/${name}`,
  })),

  // ── Reality audit → src/runtimes/reality ─────────────────────────
  {
    from: "src/lib/reality-audit/reality-audit-registry.ts",
    to: "src/runtimes/reality/reality-audit-registry.ts",
    canonicalImport: "@/runtimes/reality/reality-audit-registry",
  },

  // ── Platform-law → platform/governance ───────────────────────────
  {
    from: "src/lib/platform-law/platform-law-registry.ts",
    to: "src/platform/governance/platform-law-registry.ts",
    canonicalImport: "@/platform/governance/platform-law-registry",
  },

  // ── Integrations ─────────────────────────────────────────────────
  {
    from: "src/lib/integrations/reality-integration-hub.ts",
    to: "src/integrations/external/reality-integration-hub.ts",
    canonicalImport: "@/integrations/external/reality-integration-hub",
  },
];

interface Result {
  from: string;
  to: string;
  status: "moved" | "skipped-already-moved" | "skipped-source-missing" | "skipped-source-is-wrapper" | "error";
  reason?: string;
}

const WRAPPER_MARK = "// @lovable:migrated-wrapper";

function isWrapper(content: string): boolean {
  if (content.includes(WRAPPER_MARK)) return true;
  const meaningful = content
    .split("\n")
    .filter(l => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("/*") && !l.trim().startsWith("*"));
  if (meaningful.length === 0) return true;
  const allReExports = meaningful.every(l => /^\s*export\s+(\*|\{)/.test(l));
  return allReExports && meaningful.length <= 5;
}

function migrate(m: Move): Result {
  if (!fs.existsSync(m.from)) return { ...m, status: "skipped-source-missing" };
  const src = fs.readFileSync(m.from, "utf8");
  if (isWrapper(src)) return { ...m, status: "skipped-source-is-wrapper" };

  if (fs.existsSync(m.to)) {
    const destContent = fs.readFileSync(m.to, "utf8");
    if (destContent.trim() && !isWrapper(destContent)) {
      return { ...m, status: "skipped-already-moved", reason: "destination has real content" };
    }
  }

  fs.mkdirSync(path.dirname(m.to), { recursive: true });
  fs.writeFileSync(m.to, src);

  const wrapper = `${WRAPPER_MARK}
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecated wrapper. Canonical home: ${m.canonicalImport}
// This file exists only to bridge legacy imports during decomposition.
// New code must import directly from the canonical path.
// ═══════════════════════════════════════════════════════════════
export * from "${m.canonicalImport}";
`;
  fs.writeFileSync(m.from, wrapper);
  return { ...m, status: "moved" };
}

const results = MOVES.map(migrate);
const summary: Record<string, number> = {};
for (const r of results) summary[r.status] = (summary[r.status] || 0) + 1;

console.log("Migration Wave 2 summary:");
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v}`);

const moved = results.filter(r => r.status === "moved");
console.log(`\n✅ Moved ${moved.length}/${MOVES.length} files`);
if (moved.length) {
  console.log("Moved paths:");
  for (const r of moved) console.log(`  ${r.from} → ${r.to}`);
}

fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/real-migration-wave2-report.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2),
);

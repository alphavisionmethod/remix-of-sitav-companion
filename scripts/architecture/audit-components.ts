#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Audit & Registry Generator
// Scans src/components/**, classifies, and emits machine-readable truth
//
// Outputs:
//   - generated/component-registry.json
//   - generated/component-duplication-map.json
//   - generated/COMPONENT_GOVERNANCE_REPORT.md
//
// Classification (3-class constitution):
//   PRIMITIVE          — pure visual building blocks (no domain/service imports)
//   DOMAIN             — semantic component for a specific domain
//   SURFACE            — full assembled page surface
//   PRIVATE_HELPER     — used in only one place, page-local
//   DEPRECATED_WRAPPER — thin re-export to canonical path
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { scanDir, extractImports, readFileContent } from "./lib/utils";

const COMPONENT_ROOT = "src/components";
const PAGE_ROOT = "src/pages";
const OUT_DIR = "generated";

type Classification =
  | "PRIMITIVE"
  | "DOMAIN"
  | "SURFACE"
  | "PRIVATE_HELPER"
  | "DEPRECATED_WRAPPER"
  | "UI_LIB"; // shadcn ui/*

interface ComponentRecord {
  path: string;
  name: string;
  classification: Classification;
  domain: string;
  family: string;          // card | badge | shell | panel | drawer | hero | summary | timeline | list | table | other
  duplicateGroupId: string | null;
  isWrapper: boolean;
  loc: number;
  importsDomain: boolean;
  importsServices: boolean;
  importsHooks: boolean;
}

// ── Family detection by filename suffix ────────────────────────
const FAMILY_PATTERNS: Array<[RegExp, string]> = [
  [/Card(\.tsx)?$/, "card"],
  [/Badge(\.tsx)?$/, "badge"],
  [/Pill(\.tsx)?$/, "badge"],
  [/Chip(\.tsx)?$/, "badge"],
  [/Shell(\.tsx)?$/, "shell"],
  [/Layout(\.tsx)?$/, "shell"],
  [/AppShell(\.tsx)?$/, "shell"],
  [/Wrapper(\.tsx)?$/, "shell"],
  [/Panel(\.tsx)?$/, "panel"],
  [/Drawer(\.tsx)?$/, "drawer"],
  [/Sheet(\.tsx)?$/, "drawer"],
  [/Dialog(\.tsx)?$/, "overlay"],
  [/Modal(\.tsx)?$/, "overlay"],
  [/Hero(\.tsx)?$/, "hero"],
  [/Summary(\.tsx)?$/, "summary"],
  [/Timeline(\.tsx)?$/, "timeline"],
  [/List(\.tsx)?$/, "list"],
  [/Table(\.tsx)?$/, "table"],
  [/Inspector(\.tsx)?$/, "inspector"],
  [/Console(\.tsx)?$/, "console"],
  [/Board(\.tsx)?$/, "board"],
  [/Dashboard(\.tsx)?$/, "board"],
];

function detectFamily(filePath: string): string {
  const base = path.basename(filePath);
  for (const [pattern, family] of FAMILY_PATTERNS) {
    if (pattern.test(base)) return family;
  }
  return "other";
}

// ── Domain detection from directory path ──────────────────────
function detectDomain(filePath: string): string {
  const parts = filePath.split(path.sep);
  const idx = parts.indexOf("components");
  if (idx === -1 || idx + 1 >= parts.length) return "uncategorized";
  const next = parts[idx + 1];
  if (next === "ui") return "ui-library";
  if (next === "primitives") return "primitive";
  if (next === "domain") return parts[idx + 2] || "domain";
  if (next === "surfaces") return parts[idx + 2] || "surface";
  return next;
}

// ── Wrapper detection (thin re-export) ────────────────────────
function isThinWrapper(content: string): boolean {
  const trimmed = content
    .split("\n")
    .filter(l => !l.trim().startsWith("//") && !l.trim().startsWith("*") && !l.trim().startsWith("/*"))
    .join("\n")
    .trim();
  // Thin wrapper = only export/import statements, < 20 lines of code
  const codeLines = trimmed.split("\n").filter(l => l.trim().length > 0);
  if (codeLines.length > 20) return false;
  const onlyExports = codeLines.every(l =>
    /^(export|import|\s*}|\s*from|\s*\{)/.test(l.trim()) ||
    l.trim().length === 0
  );
  return onlyExports && /export\s+(\*|\{)/.test(content);
}

// ── Classify a component ──────────────────────────────────────
function classify(filePath: string, content: string, imports: Array<{ source: string }>): Classification {
  const rel = filePath.replace(/\\/g, "/");

  if (rel.includes("/components/ui/")) return "UI_LIB";
  if (isThinWrapper(content)) return "DEPRECATED_WRAPPER";

  // Path-based hints
  if (rel.includes("/components/primitives/")) return "PRIMITIVE";
  if (rel.includes("/components/surfaces/")) return "SURFACE";
  if (rel.includes("/components/domain/")) return "DOMAIN";

  // Import-based heuristics
  const importsDomain = imports.some(i =>
    i.source.includes("/lib/services/") ||
    i.source.includes("/lib/engines/") ||
    i.source.includes("/lib/orchestrat") ||
    i.source.includes("/integrations/supabase")
  );
  const importsHooks = imports.some(i => i.source.includes("/hooks/"));
  const importsPages = imports.some(i => i.source.includes("/pages/"));

  if (importsPages) return "SURFACE";
  if (importsDomain || importsHooks) return "DOMAIN";

  // Default: small visual files → primitive candidate; otherwise domain
  const loc = content.split("\n").length;
  if (loc < 80 && !importsDomain && !importsHooks) return "PRIMITIVE";
  return "DOMAIN";
}

// ── Usage counting ────────────────────────────────────────────
function buildUsageIndex(): Map<string, number> {
  const usage = new Map<string, number>();
  const allFiles = [
    ...scanDir("src", [".tsx", ".ts"]),
  ];
  for (const f of allFiles) {
    const content = readFileContent(f);
    const imports = extractImports(f);
    for (const imp of imports) {
      // Normalize path
      const key = imp.source.replace(/^@\//, "src/");
      usage.set(key, (usage.get(key) || 0) + 1);
    }
  }
  return usage;
}

// ── Main ──────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = scanDir(COMPONENT_ROOT, [".tsx", ".ts"]).filter(f =>
    !f.endsWith(".test.tsx") && !f.endsWith(".test.ts") && !f.endsWith(".stories.tsx")
  );

  console.log(`📊 Scanning ${files.length} component files...`);

  const records: ComponentRecord[] = [];
  const familyGroups = new Map<string, ComponentRecord[]>();

  for (const file of files) {
    const content = readFileContent(file);
    const imports = extractImports(file);
    const name = path.basename(file).replace(/\.(tsx|ts)$/, "");
    const family = detectFamily(file);
    const domain = detectDomain(file);
    const classification = classify(file, content, imports);

    const rec: ComponentRecord = {
      path: file.replace(/\\/g, "/"),
      name,
      classification,
      domain,
      family,
      duplicateGroupId: null,
      isWrapper: classification === "DEPRECATED_WRAPPER",
      loc: content.split("\n").length,
      importsDomain: imports.some(i => i.source.includes("/services/") || i.source.includes("/engines/")),
      importsServices: imports.some(i => i.source.includes("/services/")),
      importsHooks: imports.some(i => i.source.includes("/hooks/")),
    };

    records.push(rec);

    // Cluster by (family + base name root) for duplicate detection
    if (family !== "other") {
      const groupKey = `${family}:${name.toLowerCase().replace(/(card|badge|panel|shell|hero|summary|drawer|chip|pill)$/i, "")}`;
      if (!familyGroups.has(groupKey)) familyGroups.set(groupKey, []);
      familyGroups.get(groupKey)!.push(rec);
    }
  }

  // Mark duplicates
  let groupId = 0;
  const duplicateMap: Record<string, { canonical: string; members: string[]; family: string }> = {};
  for (const [key, members] of familyGroups.entries()) {
    if (members.length < 2) continue;
    groupId++;
    const id = `dup-${String(groupId).padStart(3, "0")}`;
    // Canonical = shortest path (typically the cleanest)
    const canonical = members.slice().sort((a, b) => a.path.length - b.path.length)[0];
    duplicateMap[id] = {
      canonical: canonical.path,
      members: members.map(m => m.path),
      family: members[0].family,
    };
    for (const m of members) m.duplicateGroupId = id;
  }

  // ── Stats ────────────────────────────────────────────────────
  const stats = {
    total: records.length,
    byClass: {} as Record<string, number>,
    byFamily: {} as Record<string, number>,
    byDomain: {} as Record<string, number>,
    duplicateGroups: Object.keys(duplicateMap).length,
    componentsInDuplicateGroups: records.filter(r => r.duplicateGroupId).length,
    wrappers: records.filter(r => r.isWrapper).length,
    primitives: records.filter(r => r.classification === "PRIMITIVE").length,
    domain: records.filter(r => r.classification === "DOMAIN").length,
    surface: records.filter(r => r.classification === "SURFACE").length,
  };
  for (const r of records) {
    stats.byClass[r.classification] = (stats.byClass[r.classification] || 0) + 1;
    stats.byFamily[r.family] = (stats.byFamily[r.family] || 0) + 1;
    stats.byDomain[r.domain] = (stats.byDomain[r.domain] || 0) + 1;
  }

  // ── Write outputs ────────────────────────────────────────────
  fs.writeFileSync(
    path.join(OUT_DIR, "component-registry.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), stats, records }, null, 2)
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "component-duplication-map.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), groups: duplicateMap }, null, 2)
  );

  // ── Markdown report ─────────────────────────────────────────
  const topFamilies = Object.entries(stats.byFamily)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const topDuplicateFamilies = Object.values(duplicateMap)
    .reduce((acc, g) => {
      acc[g.family] = (acc[g.family] || 0) + g.members.length;
      return acc;
    }, {} as Record<string, number>);

  const md = `# SITA OS — Component Governance Report

_Generated: ${new Date().toISOString()}_

## Constitution: 3 Classes
1. **PRIMITIVE** — Visual building blocks (no domain logic).
2. **DOMAIN** — Semantic components for a specific domain.
3. **SURFACE** — Full assembled page surfaces.

Plus: \`PRIVATE_HELPER\`, \`DEPRECATED_WRAPPER\`, \`UI_LIB\` (shadcn).

## Inventory

| Metric | Count |
|---|---|
| Total component files | ${stats.total} |
| Primitives | ${stats.primitives} |
| Domain components | ${stats.domain} |
| Surface compositions | ${stats.surface} |
| Deprecated wrappers | ${stats.wrappers} |
| Duplicate families detected | ${stats.duplicateGroups} |
| Components in duplicate groups | ${stats.componentsInDuplicateGroups} |

## Classification Breakdown
${Object.entries(stats.byClass).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}

## Top Families
${topFamilies.map(([f, c]) => `- \`${f}\`: ${c}`).join("\n")}

## Top Duplicate Families
${Object.entries(topDuplicateFamilies).sort((a,b)=>b[1]-a[1]).map(([f,c]) => `- \`${f}\`: ${c} components`).join("\n")}

## Duplicate Groups (Top 10)
${Object.entries(duplicateMap).slice(0, 10).map(([id, g]) => `
### ${id} (${g.family})
- **Canonical**: \`${g.canonical}\`
- **Members** (${g.members.length}):
${g.members.map(m => `  - ${m === g.canonical ? "✅" : "🔁"} \`${m}\``).join("\n")}
`).join("\n")}

## Governance Files
- \`generated/component-registry.json\` — full machine-readable registry
- \`generated/component-duplication-map.json\` — duplicate family map
- \`docs/architecture/COMPONENT_CONSTITUTION.md\` — class rules
- \`docs/architecture/COMPONENT_NAMING_POLICY.md\` — naming grammar
- \`src/components/primitives/\` — canonical primitive layer
`;

  fs.writeFileSync(path.join(OUT_DIR, "COMPONENT_GOVERNANCE_REPORT.md"), md);

  console.log(`✅ Audit complete:`);
  console.log(`   ${stats.total} components scanned`);
  console.log(`   ${stats.duplicateGroups} duplicate groups`);
  console.log(`   ${stats.componentsInDuplicateGroups} components in duplicate groups`);
  console.log(`   📄 Reports written to ${OUT_DIR}/`);
}

main();

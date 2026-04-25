#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Duplicate Identifiers (Wave 1.2, BLOCKING)
//
// Enforces Rule 39: every exported type / interface / enum / const
// identifier may exist in exactly one of:
//   - src/contracts/**           (public-barrel re-exports)
//   - src/packages/**            (canonical contract packages)
//   - src/domains/types/**       (domain-native aggregate types)
//   - src/platform/<X>/contracts/**  (platform-local contracts)
//
// Re-exports (`export * from`, `export { X } from`, `export type { X } from`)
// are NOT considered new declarations and are skipped — only true source
// declarations count toward duplication.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OUT_DIR, "manifests"), { recursive: true });
mkdirSync(join(OUT_DIR, "audits"), { recursive: true });

type Layer = "public-barrel" | "package" | "domain-native" | "platform-local";

function classifyLayer(rel: string): Layer | null {
  if (rel.startsWith("src/contracts/")) return "public-barrel";
  if (rel.startsWith("src/packages/")) return "package";
  if (rel.startsWith("src/domains/types/")) return "domain-native";
  if (/^src\/platform\/[^/]+\/contracts\//.test(rel) || /^src\/platform\/contracts\//.test(rel))
    return "platform-local";
  return null;
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      if (e === "node_modules" || e === ".git" || e === "__tests__") continue;
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(e)) {
      acc.push(full);
    }
  }
  return acc;
}

const ROOTS = ["src/contracts", "src/packages", "src/domains/types", "src/platform"];

interface Decl {
  name: string;
  kind: "type" | "interface" | "enum" | "const" | "function" | "class";
  file: string;
  layer: Layer;
}

const decls: Decl[] = [];

const DECL_PATTERNS: Array<[RegExp, Decl["kind"]]> = [
  [/^\s*export\s+interface\s+(\w+)/gm, "interface"],
  [/^\s*export\s+type\s+(\w+)\s*[=<]/gm, "type"],
  [/^\s*export\s+enum\s+(\w+)/gm, "enum"],
  [/^\s*export\s+const\s+(\w+)\s*[:=]/gm, "const"],
  [/^\s*export\s+(?:async\s+)?function\s+(\w+)/gm, "function"],
  [/^\s*export\s+class\s+(\w+)/gm, "class"],
];

for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = relative(".", f);
    const layer = classifyLayer(rel);
    if (!layer) continue;
    // For platform-local, skip files that are deprecated shims (no real declarations expected)
    const content = readFileSync(f, "utf8");
    if (layer === "platform-local" && /@deprecated\s+Wave\s+1\.2/i.test(content)) continue;

    for (const [pat, kind] of DECL_PATTERNS) {
      pat.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pat.exec(content)) !== null) {
        decls.push({ name: m[1], kind, file: rel, layer });
      }
    }
  }
}

// Group by name
const byName = new Map<string, Decl[]>();
for (const d of decls) {
  const list = byName.get(d.name) ?? [];
  list.push(d);
  byName.set(d.name, list);
}

interface Duplicate {
  name: string;
  layers: Layer[];
  occurrences: { file: string; layer: Layer; kind: Decl["kind"] }[];
}

const duplicates: Duplicate[] = [];
for (const [name, list] of byName) {
  // Cross-layer duplicates only — multiple files within same layer are allowed
  const layerSet = new Set(list.map((d) => d.layer));
  if (layerSet.size > 1) {
    duplicates.push({
      name,
      layers: [...layerSet],
      occurrences: list.map((d) => ({ file: d.file, layer: d.layer, kind: d.kind })),
    });
  }
}

// Build the ownership map
const ownershipMap = {
  generatedAt: new Date().toISOString(),
  totalDeclarations: decls.length,
  layerCounts: {
    "public-barrel": decls.filter((d) => d.layer === "public-barrel").length,
    package: decls.filter((d) => d.layer === "package").length,
    "domain-native": decls.filter((d) => d.layer === "domain-native").length,
    "platform-local": decls.filter((d) => d.layer === "platform-local").length,
  },
  duplicateCount: duplicates.length,
  declarations: decls.slice().sort((a, b) => a.name.localeCompare(b.name)),
};
writeFileSync(
  join(OUT_DIR, "manifests", "contract-ownership-map.json"),
  JSON.stringify(ownershipMap, null, 2),
);

// Baseline (decrease-only) — sealed at current count.
const BASELINE_PATH = join(OUT_DIR, "manifests", "contract-duplicate-baseline.json");
let baseline = 0;
if (existsSync(BASELINE_PATH)) {
  try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")).baselineCount ?? 0;
  } catch {
    baseline = 0;
  }
} else {
  // First run: seal whatever the current count is.
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), baselineCount: duplicates.length, note: "Wave 1.2 initial seal." },
      null,
      2,
    ),
  );
  baseline = duplicates.length;
}

const auditReport = {
  generatedAt: new Date().toISOString(),
  gate: "contract-duplicate-identifiers",
  level: "block",
  baselineCount: baseline,
  currentCount: duplicates.length,
  ok: duplicates.length <= baseline,
  duplicates: duplicates.slice(0, 200),
};
writeFileSync(
  join(OUT_DIR, "audits", "duplicate-contract-family-report.json"),
  JSON.stringify(auditReport, null, 2),
);

console.log(
  `contract-duplicate-identifiers: ${duplicates.length} cross-layer duplicate(s) (baseline ${baseline}) — ${
    auditReport.ok ? "OK" : "BLOCK"
  }`,
);
process.exit(auditReport.ok ? 0 : 1);
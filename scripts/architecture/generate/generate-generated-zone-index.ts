#!/usr/bin/env tsx
/**
 * Wave E §B.3 — Generated Folder Zone Index Generator (Constitution Rule 48)
 *
 * Assigns every file under generated/** to exactly one canonical zone:
 *   manifests | audits | proof | readiness | lifecycle | historical | reports
 *
 * This is a VIRTUAL zoning layer — no files are moved. The output is a
 * navigational/governance map that lets engineers and validators ask
 * "what zone does this artifact belong to?" without breaking the 740+
 * hardcoded path references across scripts/CI/src.
 *
 * Outputs:
 *   - generated/lifecycle/generated-artifact-zone-index.json
 *   - generated/REZONED_INDEX.md (human-readable)
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const ROOT = process.cwd();
const GEN = join(ROOT, "generated");
const OUT_JSON = join(ROOT, "generated", "lifecycle", "generated-artifact-zone-index.json");
const OUT_MD = join(ROOT, "generated", "REZONED_INDEX.md");
const GOV_MAP = join(ROOT, "generated", "manifests", "generated-artifact-governance-map.json");

type Zone = "manifests" | "audits" | "proof" | "readiness" | "lifecycle" | "historical" | "reports";

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function classify(relPath: string, lifecycleClass: string | undefined): Zone {
  const lower = relPath.toLowerCase();
  // Physical-folder anchors (override all other heuristics)
  if (lower.startsWith("generated/historical/")) return "historical";
  if (lower.startsWith("generated/manifests/")) return "manifests";
  if (lower.startsWith("generated/audits/")) return "audits";
  if (lower.startsWith("generated/baselines/")) return "lifecycle";
  if (lower.startsWith("generated/lifecycle/")) return "lifecycle";

  // historical-archived files at root or in non-standard subdirs
  if (lifecycleClass === "historical-archived") return "historical";

  // Subfolders that are clearly historical bundles still at root (Tier-1 blocked)
  if (
    /\b(closure|remediation|hardening|cleanup|phase\d|reconciliation|consolidation|polish-closure|proof-bundle|replay-bundle)\b/.test(
      lower,
    ) &&
    relPath.split("/").length >= 3 // is in a subdir, not root
  ) {
    return "historical";
  }

  // Name-based zoning for root-level files
  if (/-manifest\.json$|-registry(?:\.json)?$|-index\.json$|-map(?:\.json)?$|-policy(?:\.json)?$|-truth(?:\.json)?$/.test(lower)) {
    return "manifests";
  }
  if (/-readiness(?:-report)?\.json$|release-(?:gate|readiness|provenance)/.test(lower)) {
    return "readiness";
  }
  if (/-proof(?:\.json)?$|-attestation\.json$|-evidence\.json$|-receipt|-bundle\.json$/.test(lower)) {
    return "proof";
  }
  if (/-audit(?:\.(json|md))?$|-coverage(?:-report)?\.json$|-conformance/.test(lower)) {
    return "audits";
  }
  if (/-report\.(json|md)$/.test(lower)) {
    return "reports";
  }
  if (/-baseline\.json$|-policy\.json$|-freshness/.test(lower)) {
    return "lifecycle";
  }
  if (lower.endsWith(".md")) return "reports";

  // Default
  return "manifests";
}

// Load Wave-B governance map for lifecycle class
const govMap: Record<string, string> = {};
if (existsSync(GOV_MAP)) {
  try {
    const m = JSON.parse(readFileSync(GOV_MAP, "utf8"));
    for (const e of m.entries ?? []) govMap[e.path] = e.lifecycleClass;
  } catch {
    /* ignore */
  }
}

const files = walk(GEN).map((f) => relative(ROOT, f).split(sep).join("/"));
const zoneCounts: Record<Zone, number> = {
  manifests: 0,
  audits: 0,
  proof: 0,
  readiness: 0,
  lifecycle: 0,
  historical: 0,
  reports: 0,
};
const entries = files.map((p) => {
  const zone = classify(p, govMap[p]);
  zoneCounts[zone] += 1;
  const isPhysical = p.startsWith(`generated/${zone}/`);
  return {
    path: p,
    zone,
    lifecycleClass: govMap[p] ?? null,
    isPhysicallyZoned: isPhysical,
  };
});

const out = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  rule: "Constitution Rule 48 (Wave E §B.3 — Generated Folder Zoning Law)",
  totalFiles: entries.length,
  zoneCounts,
  physicallyZoned: entries.filter((e) => e.isPhysicallyZoned).length,
  virtuallyZoned: entries.filter((e) => !e.isPhysicallyZoned).length,
  entries,
};

mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n", "utf8");

// Human-readable REZONED_INDEX.md
const md: string[] = [
  "# Generated Artifact Zone Index",
  "",
  "> **Authority:** `generated/lifecycle/generated-artifact-zone-index.json`",
  "> **Constitution Rule:** 48 (Wave E §B.3)",
  "> **Validator (BLOCK):** `scripts/architecture/checks/check-generated-zone-coverage.ts`",
  "",
  "Every file under `generated/**` is assigned to exactly one of seven canonical zones.",
  "Files marked _virtually zoned_ live at the legacy root path for back-compat (740+ existing references); the zone is a navigational/governance label, not a physical move.",
  "",
  `**Total files:** ${entries.length} · **Physically zoned:** ${out.physicallyZoned} · **Virtually zoned:** ${out.virtuallyZoned}`,
  "",
  "## Zone counts",
  "",
  "| Zone | Count |",
  "|---|---|",
];
for (const z of ["manifests", "audits", "proof", "readiness", "lifecycle", "historical", "reports"] as Zone[]) {
  md.push(`| \`${z}\` | ${zoneCounts[z]} |`);
}
md.push("");
md.push("## Files by zone");
for (const z of ["manifests", "audits", "proof", "readiness", "lifecycle", "historical", "reports"] as Zone[]) {
  md.push("");
  md.push(`### ${z} (${zoneCounts[z]})`);
  md.push("");
  const list = entries.filter((e) => e.zone === z).slice(0, 80);
  for (const e of list) {
    const mark = e.isPhysicallyZoned ? "📁" : "🏷️ ";
    md.push(`- ${mark} \`${e.path}\``);
  }
  if (zoneCounts[z] > 80) md.push(`- _...and ${zoneCounts[z] - 80} more_`);
}
writeFileSync(OUT_MD, md.join("\n") + "\n", "utf8");

console.log(
  `✅ Zone index — total=${entries.length} physical=${out.physicallyZoned} virtual=${out.virtuallyZoned}`,
);
for (const z of Object.keys(zoneCounts) as Zone[]) {
  console.log(`   ${z.padEnd(12)} ${zoneCounts[z]}`);
}
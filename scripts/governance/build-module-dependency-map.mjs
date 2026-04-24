#!/usr/bin/env node
// Build a Mermaid module-dependency map for sitav3 src/ subsystems.
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT_MMD = path.join(ROOT, "/mnt/documents/sitav3-module-dependency-map.mmd".replace("/dev-server/", ""));

// Subsystems we treat as nodes — top-level dirs under src/.
const NODES = readdirSync(SRC).filter((d) => {
  const f = path.join(SRC, d);
  return statSync(f).isDirectory();
});

// Map import path → subsystem.
function subsystemOf(rel) {
  // rel begins with src/...
  const m = rel.match(/^src\/([^/]+)/);
  return m ? m[1] : null;
}

// Walk every .ts/.tsx file, collect inter-subsystem imports.
const edges = new Map(); // "from→to" → count
const fileCount = Object.fromEntries(NODES.map((n) => [n, 0]));
const importRe = /from\s+["']([^"']+)["']/g;

function resolveImport(spec, fromFile) {
  if (spec.startsWith("@/")) return "src/" + spec.slice(2);
  if (spec.startsWith(".")) {
    const abs = path.normalize(path.join(path.dirname(fromFile), spec));
    return path.relative(ROOT, abs);
  }
  return null; // external pkg
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", ".git", "dist", "__tests__", "__mocks__"].includes(entry)) continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      const rel = path.relative(ROOT, full);
      const from = subsystemOf(rel);
      if (!from) continue;
      fileCount[from] = (fileCount[from] || 0) + 1;
      const txt = readFileSync(full, "utf8");
      let m;
      while ((m = importRe.exec(txt)) !== null) {
        const target = resolveImport(m[1], full);
        if (!target || !target.startsWith("src/")) continue;
        const to = subsystemOf(target);
        if (!to || to === from) continue;
        const k = `${from}→${to}`;
        edges.set(k, (edges.get(k) || 0) + 1);
      }
    }
  }
}
walk(SRC);

// Aggregate edges; keep only those above a threshold to avoid clutter.
const sorted = Array.from(edges.entries())
  .map(([k, v]) => { const [from, to] = k.split("→"); return { from, to, count: v }; })
  .sort((a, b) => b.count - a.count);

const THRESHOLD = 20; // ≥20 imports between subsystems = real dependency
const strong = sorted.filter((e) => e.count >= THRESHOLD);

// Build Mermaid graph.
function safe(id) { return id.replace(/[^a-zA-Z0-9]/g, "_"); }
const lines = ["%% sitav3 module dependency map (generated)", "graph LR"];
for (const node of NODES) {
  if (!fileCount[node]) continue;
  lines.push(`  ${safe(node)}["${node}<br/><small>${fileCount[node]} files</small>"]`);
}
for (const e of strong) {
  const w = e.count >= 200 ? "==>" : e.count >= 80 ? "-->" : "-.->";
  lines.push(`  ${safe(e.from)} ${w}|${e.count}| ${safe(e.to)}`);
}
// Color critical hubs.
lines.push("  classDef hub fill:hsl(217_91%_60%),color:#fff,stroke:#333,stroke-width:2px;");
const hubScores = {};
for (const e of strong) {
  hubScores[e.to] = (hubScores[e.to] || 0) + e.count;
  hubScores[e.from] = (hubScores[e.from] || 0) + e.count * 0.3;
}
const topHubs = Object.entries(hubScores).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
if (topHubs.length) lines.push(`  class ${topHubs.map(safe).join(",")} hub;`);

const mmd = lines.join("\n") + "\n";

writeFileSync("/mnt/documents/sitav3-module-dependency-map.mmd", mmd);
writeFileSync(path.join(ROOT, "public/generated/sitav3-module-dependency-map.mmd"), mmd);

// Also write a JSON sidecar for programmatic use.
const json = {
  $schema: "sita/module-dependency-map@1",
  generatedAt: new Date().toISOString(),
  totalSubsystems: NODES.length,
  totalEdges: sorted.length,
  strongEdges: strong.length,
  threshold: THRESHOLD,
  fileCounts: fileCount,
  topHubs,
  edges: sorted,
};
writeFileSync(path.join(ROOT, "public/generated/sitav3-module-dependency-map.json"), JSON.stringify(json, null, 2));

console.log(`✓ Subsystems: ${NODES.length}`);
console.log(`✓ Total edges: ${sorted.length}, strong (≥${THRESHOLD}): ${strong.length}`);
console.log(`✓ Top hubs: ${topHubs.join(", ")}`);
console.log(`✓ Wrote /mnt/documents/sitav3-module-dependency-map.mmd`);

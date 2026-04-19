// SITA OS — Mobile canonical stack validator
// Asserts Capacitor is the only mobile stack referenced in claim-bearing surfaces.
// Flutter mentions in active code/docs are forbidden; archive/ is permitted.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

function walk(dir: string, hits: { file: string; line: number; text: string }[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === "archive") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, hits);
    } else if (/\.(md|ts|tsx|yaml|yml|json|sh)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      content.split("\n").forEach((line, i) => {
        if (/\bflutter\b/i.test(line) && !/forbidden|abandoned|not used|noncanonical|drift|regression|removed|do not|never/i.test(line)) {
          hits.push({ file: full, line: i + 1, text: line.trim().slice(0, 160) });
        }
      });
    }
  }
}

const claimSurfaces = ["src/planes", "infra/deploy", "mobile"];
const hits: { file: string; line: number; text: string }[] = [];
for (const root of claimSurfaces) walk(root, hits);

// capacitor.config.ts must exist
if (!existsSync("capacitor.config.ts")) {
  issues.push({ severity: "error", area: "stack", message: "capacitor.config.ts missing — Capacitor is canonical" });
}

// MOBILE_MANIFEST.md must declare Capacitor canonical
const manifest = existsSync("src/planes/MOBILE_MANIFEST.md")
  ? readFileSync("src/planes/MOBILE_MANIFEST.md", "utf8")
  : "";
if (!/Canonical stack:\s*Capacitor/i.test(manifest)) {
  issues.push({ severity: "error", area: "manifest", message: "src/planes/MOBILE_MANIFEST.md must declare Capacitor as canonical stack" });
}

for (const h of hits) {
  issues.push({
    severity: "error",
    area: "flutter-drift",
    message: `Flutter reference in claim surface: ${h.file}:${h.line} — ${h.text}`,
  });
}

const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({
  gate: "mobile-canonical-stack",
  ok,
  issues,
  extra: {
    canonicalStack: "capacitor",
    claimSurfacesScanned: claimSurfaces,
    flutterDriftHits: hits.length,
  },
});
console.log(`mobile-canonical-stack: ${ok ? "GREEN" : "RED"} (${issues.length} issues, ${hits.length} flutter hits)`);
process.exit(ok ? 0 : 1);

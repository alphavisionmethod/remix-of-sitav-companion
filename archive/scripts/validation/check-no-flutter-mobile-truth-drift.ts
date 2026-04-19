// SITA OS — Flutter drift detector for mobile truth surfaces
// Scans claim-bearing docs (NOT scripts, NOT archive) for Flutter mentions
// that would imply Flutter is part of the mobile stack.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const TRUTH_ROOTS = ["src/planes", "generated/manifests", "infra/deploy", "mobile"];
const ALLOWED_CONTEXT = /forbidden|abandoned|not used|noncanonical|drift|regression|removed|do not use|never|earlier architecture|was abandoned|legacy mention/i;

function walk(dir: string, hits: { file: string; line: number; text: string }[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, hits);
    else if (/\.(md|yaml|yml|json)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      content.split("\n").forEach((line, i) => {
        if (/\bflutter\b/i.test(line) && !ALLOWED_CONTEXT.test(line)) {
          hits.push({ file: full, line: i + 1, text: line.trim().slice(0, 160) });
        }
      });
    }
  }
}

const hits: { file: string; line: number; text: string }[] = [];
for (const root of TRUTH_ROOTS) walk(root, hits);

for (const h of hits) {
  issues.push({
    severity: "error",
    area: "truth-drift",
    message: `Flutter mention in mobile-truth doc without disavowal context: ${h.file}:${h.line}`,
  });
}

const ok = issues.length === 0;
emitGateReport({
  gate: "no-flutter-mobile-truth-drift",
  ok,
  issues,
  extra: { truthRootsScanned: TRUTH_ROOTS, hits: hits.length },
});
console.log(`no-flutter-mobile-truth-drift: ${ok ? "GREEN" : "RED"} (${hits.length} drift hits)`);
process.exit(ok ? 0 : 1);

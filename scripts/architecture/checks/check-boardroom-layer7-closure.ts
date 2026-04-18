#!/usr/bin/env -S deno run -A
// ═══════════════════════════════════════════════════════════════
// Boardroom Layer 7 Closure — master gate adapter
// Reads the 5 sub-validator outputs in
// generated/boardroom-layer7-closure/ and emits the canonical
// generated/boardroom-layer7-closure-report.json file consumed by
// scripts/architecture/checks/check-os-release-readiness.ts
// ═══════════════════════════════════════════════════════════════

interface SubReport {
  status?: string;
  generatedAt?: string;
  [k: string]: unknown;
}

const SUBS = [
  "state-coverage.json",
  "linkage.json",
  "proof-coverage.json",
  "outcome-coverage.json",
  "reflection-coverage.json",
];

async function readSub(name: string): Promise<SubReport | null> {
  try {
    const txt = await Deno.readTextFile(`generated/boardroom-layer7-closure/${name}`);
    return JSON.parse(txt) as SubReport;
  } catch {
    return null;
  }
}

const subs: Record<string, SubReport | null> = {};
for (const s of SUBS) subs[s] = await readSub(s);

const present = Object.values(subs).filter((s): s is SubReport => s !== null);
const statuses = present.map((s) => (s.status as string | undefined) ?? "UNKNOWN");

let verdict: "GREEN" | "AMBER" | "RED";
if (present.length < SUBS.length) {
  verdict = "RED"; // missing sub-reports = ungated = block
} else if (statuses.includes("RED")) {
  verdict = "RED";
} else if (statuses.includes("AMBER")) {
  verdict = "AMBER";
} else {
  verdict = "GREEN";
}

const errors = verdict === "RED" ? 1 : 0;
const warnings = verdict === "AMBER" ? 1 : 0;
const ok = verdict === "GREEN";

const report = {
  gate: "boardroom-layer7-closure",
  generatedAt: new Date().toISOString(),
  verdict,
  ok,
  errors,
  warnings,
  level: "BLOCK",
  description:
    "Boardroom Layer 7 Follow-through closure — every approved decision must reach a terminal state with proof, outcome, and reflection.",
  subReports: subs,
};

await Deno.mkdir("generated", { recursive: true });
await Deno.writeTextFile(
  "generated/boardroom-layer7-closure-report.json",
  JSON.stringify(report, null, 2),
);

console.log(
  `[boardroom-layer7-closure] verdict=${verdict} subReports=${present.length}/${SUBS.length}`,
);
Deno.exit(verdict === "RED" ? 1 : 0);

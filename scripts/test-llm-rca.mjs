#!/usr/bin/env node
// T5 — LLM-backed RCA narrative. Advisory only; never auto-applied.
// Calls the canonical ai-gateway edge function. No-op gracefully if unreachable.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const TRIAGE = "coverage/triage/triage-report.json";
const OUT = "coverage/triage/llm-suggestions";
mkdirSync(OUT, { recursive: true });

if (!existsSync(TRIAGE)) { console.error("[llm-rca] no triage report; run test:heal first."); process.exit(1); }
const triage = JSON.parse(readFileSync(TRIAGE, "utf8"));
const realBugs = triage.triaged.filter((t) => t.cls === "real-bug" && t.tier !== "REFUSAL");

if (realBugs.length === 0) { console.log("[llm-rca] no real-bug failures to analyze."); process.exit(0); }

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.LOVABLE_API_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.warn("[llm-rca] missing VITE_SUPABASE_URL / LOVABLE_API_KEY — emitting placeholders.");
  for (const t of realBugs) {
    writeFileSync(path.join(OUT, `${path.basename(t.file)}.rca.md`),
      `# RCA placeholder for ${t.file}\n\nT5 LLM advisor not configured. Set LOVABLE_API_KEY to enable.\n\n## Signals\n${(t.signals||[]).join("\n")}\n`);
  }
  process.exit(0);
}

const BUDGET_TOTAL = 50_000; let used = 0;
for (const t of realBugs) {
  if (used > BUDGET_TOTAL) { console.log("[llm-rca] budget exhausted"); break; }
  try {
    const src = existsSync(t.file) ? readFileSync(t.file, "utf8").slice(0, 8000) : "(file unreadable)";
    const body = {
      capability: "platform.test-rca",
      model: "google/gemini-2.5-pro",
      messages: [{ role: "user", content:
        `You are a test failure root-cause analyst. Produce a concise RCA in markdown.\n\nFile: ${t.file}\nClass: ${t.cls}\nSignals: ${(t.signals||[]).join(", ")}\n\nSource (truncated):\n\`\`\`\n${src}\n\`\`\`` }],
    };
    const res = await fetch(`${url}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const text = res.ok ? await res.text() : `(gateway error ${res.status})`;
    writeFileSync(path.join(OUT, `${path.basename(t.file)}.rca.md`),
      `# T5 LLM RCA — ${t.file}\n\n> Advisory only. Never auto-applied.\n\n## Class\n\`${t.cls}\`\n\n## Narrative\n${text}\n`);
    used += text.length;
  } catch (e) {
    console.warn(`[llm-rca] ${t.file}: ${String(e?.message || e).slice(0, 200)}`);
  }
}
console.log(`[llm-rca] wrote ${realBugs.length} narratives → ${OUT}/`);

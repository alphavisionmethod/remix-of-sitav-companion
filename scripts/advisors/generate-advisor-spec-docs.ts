#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Build-Spec → Markdown Doc Generator
//
// Renders each registered advisor spec to docs/advisors/<id>.spec.md
// so humans always have an exhaustive, exhaustive-ly truthful copy.
//
// Run: npx tsx scripts/advisors/generate-advisor-spec-docs.ts
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";
import { listAdvisorSpecs } from "../../src/lib/ai-platform/specs";
import type { BusinessAdvisorSpec } from "../../src/lib/ai-platform/specs";

const OUT_DIR = "docs/advisors";
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function bullets(items: readonly string[]): string {
  if (items.length === 0) return "_none_";
  return items.map((i) => `- ${i}`).join("\n");
}

function render(spec: BusinessAdvisorSpec): string {
  const lines: string[] = [];
  lines.push(`# ${spec.displayName} — Build Spec`);
  lines.push("");
  lines.push(`> ${spec.positioning}`);
  lines.push("");
  lines.push(`**Authority ceiling:** ${spec.currentAuthorityCeiling}`);
  lines.push("");

  lines.push("## 1. Identity");
  lines.push(`- **Distinction:** ${spec.distinction}`);
  lines.push(`- **Intelligence archetype:** ${spec.intelligenceArchetype}`);
  lines.push(`- **User feel:** ${spec.userFeel}`);
  lines.push(`- **Trusted by:** ${spec.trustedBy}`);
  lines.push("");

  lines.push("## 2. Mission");
  lines.push(spec.mission);
  lines.push("");
  lines.push(`**Problem space:** ${spec.problemSpace}`);
  lines.push("");
  lines.push(`**Leverage created:** ${spec.leverageCreated}`);
  lines.push("");
  lines.push("**Outcomes improved:**");
  lines.push(bullets(spec.outcomesImproved));
  lines.push("");

  lines.push("## 3. Domain boundaries");
  lines.push("**Handles:**");
  lines.push(bullets(spec.handles));
  lines.push("");
  lines.push("**Does not handle:**");
  lines.push(bullets(spec.doesNotHandle));
  lines.push("");
  lines.push("**Overlaps with:**");
  lines.push(spec.overlapsWith.length === 0 ? "_none_" : spec.overlapsWith.map((o) => `- \`${o.advisorId}\` — ${o.reason}`).join("\n"));
  lines.push("");
  lines.push("**Escalates to:**");
  lines.push(spec.escalatesTo.length === 0 ? "_none_" : spec.escalatesTo.map((o) => `- \`${o.advisorId}\` — ${o.trigger}`).join("\n"));
  lines.push("");

  lines.push("## 4. Core use cases");
  lines.push(bullets(spec.coreUseCases));
  lines.push("");
  lines.push("## 5. Typical user questions");
  lines.push(bullets(spec.typicalQuestions));
  lines.push("");

  lines.push("## 6. Inputs / context sources");
  lines.push("**Required:**");
  lines.push(bullets(spec.requiredInputs));
  lines.push("");
  lines.push("**Optional:**");
  lines.push(bullets(spec.optionalInputs));
  lines.push("");
  lines.push("**High-value future:**");
  lines.push(bullets(spec.highValueFutureInputs));
  lines.push("");

  lines.push("## 7. Intelligence behaviors");
  for (const b of spec.intelligenceBehaviors) {
    lines.push(`- **${b.name}** — ${b.description}`);
  }
  lines.push("");

  lines.push("## 8. Output types");
  lines.push(bullets(spec.outputTypes));
  lines.push("");

  lines.push("## 9. UI / UX surfaces");
  lines.push(bullets(spec.uiSurfaces));
  lines.push("");

  lines.push("## 10. Business OS integration points");
  lines.push(bullets(spec.osIntegrationPoints));
  lines.push("");

  lines.push("## 11. Automation matrix (L0 → L5)");
  for (const e of spec.automationMatrix) {
    lines.push(`### ${e.level} — ${e.label}`);
    lines.push("**Can do:**");
    lines.push(bullets(e.canDo));
    lines.push("");
    lines.push("**Must not do:**");
    lines.push(bullets(e.mustNotDo));
    lines.push("");
    lines.push("**Approval required for:**");
    lines.push(bullets(e.approvalRequiredFor));
    lines.push("");
  }

  lines.push("## 12. Trust / safety / authority");
  lines.push(bullets(spec.trustRules));
  lines.push("");
  lines.push("**Disallowed autonomous actions:**");
  lines.push(bullets(spec.disallowedAutonomousActions));
  lines.push("");
  if (spec.receiptedActions.length > 0) {
    lines.push("**Receipted actions:**");
    lines.push(bullets(spec.receiptedActions));
    lines.push("");
  }

  lines.push("## 13. Explainability requirements");
  lines.push(bullets(spec.explainabilityRequirements));
  lines.push("");

  lines.push("## 14. Simulation contract");
  lines.push(spec.simulation.summary);
  lines.push("");
  for (const s of spec.simulation.scenarios) {
    lines.push(`### \`${s.id}\` — ${s.label}${s.nonAuthoritative ? " *(non-authoritative)*" : ""}`);
    lines.push(`**Compares:** ${s.compares}`);
    lines.push("");
    lines.push(`**Required inputs:** ${s.requiredInputs.join(", ") || "—"}`);
    lines.push(`**Optional inputs:** ${s.optionalInputs.join(", ") || "—"}`);
    lines.push(`**Outputs:** ${s.outputs.join(", ") || "—"}`);
    lines.push("");
  }

  lines.push("## 15. Memory / learning");
  lines.push(bullets(spec.memoryRules));
  lines.push("");

  lines.push("## 16. Proactive behavior");
  for (const p of spec.proactiveSignals) {
    lines.push(`- **${p.trigger}** → ${p.surface} (${p.cadence}, ${p.mode}${p.approvalRequired ? ", approval required" : ""})`);
  }
  lines.push("");

  lines.push("## 17. Knowledge / document support");
  for (const k of spec.knowledgeSources) {
    lines.push(`- **${k.label}** (${k.scope}, ${k.sensitivity}) — ${k.extracts}`);
  }
  lines.push("");

  lines.push("## 18. Analytics events");
  lines.push(bullets(spec.analyticsEvents));
  lines.push("");

  lines.push("## 19. Admin oversight surfaces");
  lines.push(bullets(spec.adminOversightSurfaces));
  lines.push("");

  lines.push("## 20. Testing matrix");
  for (const t of spec.testingMatrix) {
    lines.push(`### ${t.category}`);
    lines.push(bullets(t.scenarios));
    lines.push("");
  }

  lines.push("## 21. Definition of Done");
  lines.push(bullets(spec.definitionOfDone));
  lines.push("");

  lines.push("## 22. Phase roadmap");
  for (const phase of ["phase1", "phase2", "phase3"] as const) {
    const r = spec.roadmap[phase];
    lines.push(`### ${phase} — ${r.title}`);
    lines.push(bullets(r.outcomes));
    lines.push("");
  }

  lines.push("## 23. Wow differentiators");
  lines.push(bullets(spec.wowDifferentiators));
  lines.push("");

  if (spec.synthesizesFrom && spec.synthesizesFrom.length > 0) {
    lines.push("## Synthesizes from");
    lines.push(bullets(spec.synthesizesFrom.map((id) => `\`${id}\``)));
    lines.push("");
  }

  return lines.join("\n");
}

const specs = listAdvisorSpecs();
let written = 0;
for (const spec of specs) {
  const out = path.join(OUT_DIR, `${spec.id}.spec.md`);
  fs.writeFileSync(out, render(spec));
  written++;
  console.log(`✅ wrote ${out}`);
}
console.log(`\nGenerated ${written} advisor spec doc(s).`);
if (specs.length === 0) {
  console.log("(No specs registered yet — phased rollout in progress.)");
}
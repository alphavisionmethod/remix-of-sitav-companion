// ═══════════════════════════════════════════════════════════════
// SITA OS — Jarvis Bridge fusion layer tests (Phase J6)
// ═══════════════════════════════════════════════════════════════
// Verifies the four read-only fusion hooks under src/lib/sita-jarvis/
// stay structurally honest: real table reads, dedupe applied, and
// no hardcoded demo arrays. These tests intentionally avoid spinning
// up a Supabase client — they assert source structure, in keeping with
// the existing sita-kernel.test.ts pattern.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = "src/lib/sita-jarvis";
const HOOKS = [
  "use-now-snapshot.ts",
  "use-unified-action-queue.ts",
  "use-unified-timeline.ts",
  "use-explanation.ts",
];

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf-8");
}

describe("Jarvis Bridge fusion layer", () => {
  it("ships all four canonical hooks", () => {
    for (const h of HOOKS) {
      expect(fs.existsSync(path.join(ROOT, h))).toBe(true);
    }
    expect(fs.existsSync(path.join(ROOT, "index.ts"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "types.ts"))).toBe(true);
  });

  it("re-exports all hooks from the package barrel", () => {
    const barrel = read("index.ts");
    expect(barrel).toContain("use-now-snapshot");
    expect(barrel).toContain("use-unified-action-queue");
    expect(barrel).toContain("use-unified-timeline");
    expect(barrel).toContain("use-explanation");
  });

  it("queues are sourced from real Sita tables, not literals", () => {
    const queue = read("use-unified-action-queue.ts");
    expect(queue).toContain("advisor_action_queue");
    expect(queue).toContain("sita_agent_plans");
    expect(queue).toContain("advisor_board_recommendations");
    // No fixture arrays leaking in
    expect(queue).not.toMatch(/const\s+(DEMO|MOCK|FAKE|SAMPLE)_/);
  });

  it("timeline fuses episodes, perception, board actions and proof packs", () => {
    const timeline = read("use-unified-timeline.ts");
    expect(timeline).toContain("sita_episodes");
    expect(timeline).toContain("sita_perception_events");
    expect(timeline).toContain("advisor_board_actions");
    expect(timeline).toContain("advisor_action_proof_packs");
  });

  it("now snapshot composes world model + missions + briefings + journal", () => {
    const now = read("use-now-snapshot.ts");
    expect(now).toContain("sita_missions");
    expect(now).toContain("sita_proactive_briefings");
    expect(now).toContain("sita_journal_entries");
    expect(now).toContain("useWorldModel");
  });

  it("explanation hook composes persona + confidence + reversibility + council vote", () => {
    const explain = read("use-explanation.ts");
    expect(explain).toMatch(/persona|PersonaBoundary|getPersonaBoundary/);
    expect(explain).toMatch(/confidence|evaluateConfidenceGate/);
    expect(explain).toMatch(/reversib|getReversibility/);
    expect(explain).toContain("sita_council_votes");
  });

  it("action queue applies dedupe by composite (source,id) key", () => {
    const queue = read("use-unified-action-queue.ts");
    expect(queue).toMatch(/dedup|Set<string>/);
    expect(queue).toContain("seen.add");
  });
});
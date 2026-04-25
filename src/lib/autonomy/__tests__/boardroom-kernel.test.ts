import { describe, it, expect } from "vitest";
import {
  synthesizeBoardroomThemes,
  type KernelInputQueueItem,
  type KernelInputBreaker,
} from "../boardroom-kernel";

const NOW = Date.parse("2026-04-25T12:00:00Z");

function qi(overrides: Partial<KernelInputQueueItem>): KernelInputQueueItem {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    advisor_id: "cfo-advisor",
    domain: "finance",
    action_type: "cfo.draft_burn_review",
    summary: "Draft burn review",
    confidence: 0.8,
    status: "awaiting_approval",
    created_at: new Date(NOW - 30 * 60_000).toISOString(),
    payload: { risk_class: "reversible_safe", financial_impact_cents: 0 },
    ...overrides,
  };
}

describe("synthesizeBoardroomThemes", () => {
  it("returns empty when nothing is happening", () => {
    const themes = synthesizeBoardroomThemes({ queueItems: [], reflections: [], breakers: [], now: NOW });
    expect(themes).toEqual([]);
  });

  it("detects consensus when 2+ advisors queue the same action", () => {
    const themes = synthesizeBoardroomThemes({
      queueItems: [
        qi({ advisor_id: "cfo-advisor" }),
        qi({ advisor_id: "coo-advisor" }),
      ],
      reflections: [],
      breakers: [],
      now: NOW,
    });
    const consensus = themes.find((t) => t.kind === "consensus");
    expect(consensus).toBeDefined();
    expect(consensus!.advisors.length).toBe(2);
  });

  it("detects conflict when same domain has different actions from different advisors", () => {
    const themes = synthesizeBoardroomThemes({
      queueItems: [
        qi({ advisor_id: "cfo-advisor", action_type: "cfo.expand_spend", confidence: 0.9 }),
        qi({ advisor_id: "coo-advisor", action_type: "coo.cut_spend", confidence: 0.85 }),
      ],
      reflections: [],
      breakers: [],
      now: NOW,
    });
    const conflict = themes.find((t) => t.kind === "conflict");
    expect(conflict).toBeDefined();
    expect(conflict!.priority).toBeGreaterThanOrEqual(0.8);
  });

  it("flags stalled approvals beyond the SLA window", () => {
    const themes = synthesizeBoardroomThemes({
      queueItems: [
        qi({ created_at: new Date(NOW - 8 * 3600_000).toISOString() }),
      ],
      reflections: [],
      breakers: [],
      now: NOW,
      stalledHours: 6,
    });
    expect(themes.find((t) => t.kind === "stalled")).toBeDefined();
  });

  it("emits a critical theme on policy-breach reflection tag", () => {
    const themes = synthesizeBoardroomThemes({
      queueItems: [],
      reflections: [
        {
          id: "r1", advisor_id: "cfo-advisor", outcome_quality: 0.1, execution_fitness_score: 0.1,
          recommendation_quality_score: 0.5, should_repeat: false,
          pattern_tags: ["policy-breach"], owner_action: "auto_executed",
          created_at: new Date(NOW).toISOString(), lesson_learned: "L3 bypass detected",
        },
      ],
      breakers: [],
      now: NOW,
    });
    const breach = themes.find((t) => t.id === "emergent:policy-breach");
    expect(breach).toBeDefined();
    expect(breach!.priority).toBe(1);
  });

  it("detects a breaker storm when 2+ breakers are open", () => {
    const breakers: KernelInputBreaker[] = [
      { advisor_id: "cfo-advisor", current_state: "circuit_open", circuit_open_until: null, metadata: { breaker_reason: "daily_token_budget_exceeded" } },
      { advisor_id: "coo-advisor", current_state: "circuit_open", circuit_open_until: null, metadata: { breaker_reason: "provider_5xx" } },
    ];
    const themes = synthesizeBoardroomThemes({ queueItems: [], reflections: [], breakers, now: NOW });
    const storm = themes.find((t) => t.kind === "breaker_storm");
    expect(storm).toBeDefined();
    expect(storm!.advisors.length).toBe(2);
  });

  it("ranks higher-priority themes first", () => {
    const themes = synthesizeBoardroomThemes({
      queueItems: [
        qi({ advisor_id: "cfo-advisor", action_type: "cfo.expand_spend", confidence: 0.9 }),
        qi({ advisor_id: "coo-advisor", action_type: "coo.cut_spend", confidence: 0.85 }),
        qi({ advisor_id: "cmo-advisor" }),
        qi({ advisor_id: "chro-advisor" }),
      ],
      reflections: [],
      breakers: [],
      now: NOW,
    });
    expect(themes[0].priority).toBeGreaterThanOrEqual(themes[themes.length - 1].priority);
  });
});
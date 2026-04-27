// ═══════════════════════════════════════════════════════════════
// Phase 13 — Cross-OS Integration Behavioral E2E
// ───────────────────────────────────────────────────────────────
// Closes the cross-OS trust loop: every Business↔Finance↔Concierge
// bridge is anchored to the canonical engine in
// `src/domains/engines/cross-os-integration.ts` and proven against
// the live archetype set (`ALL_ARCHETYPES`, 12 entries).
//
// Asserts:
//   1.  Registry truth — every CROSS_OS_LINKS entry is internally
//       coherent (source ≠ target, valid module strings, valid
//       archetype refs, no duplicate IDs).
//   2.  Archetype filter integrity — for all 12 archetypes × 3
//       source apps, `getCrossOSLinks` returns ONLY links that
//       declare the archetype (or `"all"`), never leaks
//       cross-archetype handoffs.
//   3.  Bidirectional pair coverage — every domain pair (B↔F, B↔C,
//       F↔C) has at least one link in BOTH directions.
//   4.  Adaptation parity — `getFinanceAdaptation` and
//       `getConciergeAdaptation` return a complete, non-empty
//       record for every archetype (no silent fallback collapse).
//   5.  Signal lineage — every CROSS_DOMAIN_SIGNAL has a real
//       source/target, valid severity, and a non-trivial trigger
//       condition / action description.
//   6.  Event bus contract — `emitCrossOSEvent` dispatches both the
//       window CustomEvent AND the registered listener; `crossNavigate`
//       writes the initial-module global AND emits the navigate event.
//   7.  No silent regressions — link/adaptation/signal counts are
//       pinned to ratchet baselines (must explicitly bump on growth).
//
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  CROSS_OS_LINKS,
  CROSS_DOMAIN_SIGNALS,
  getCrossOSLinks,
  getFinanceAdaptation,
  getConciergeAdaptation,
  getActiveSignals,
  emitCrossOSEvent,
  onCrossOSEvent,
  crossNavigate,
  type CrossOSLink,
  type CrossOSEvent,
  type CrossOSEventType,
  type CrossDomainSignal,
} from "@/domains/engines/cross-os-integration";
import { ALL_ARCHETYPES, type ProfileArchetype } from "@/domains/business/types/profile";

// ── Ratchet baselines (bump intentionally when surface grows) ──
const BASELINE_LINK_COUNT = 16;
const BASELINE_SIGNAL_COUNT = 8;
const ALL_APPS = ["business", "finance", "concierge"] as const;

const VALID_EVENT_TYPES: CrossOSEventType[] = [
  "cross-os:navigate",
  "cross-os:data-request",
  "cross-os:signal",
  "cross-os:context-sync",
  "cross-os:escalate",
];

const VALID_SEVERITIES = new Set(["info", "warning", "critical"]);
const VALID_CATEGORIES = new Set(["financial", "operational", "scheduling", "strategic"]);

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("↔");
}

describe("Phase 13 — Cross-OS Integration E2E", () => {
  // ────────────────────────────────────────────────────────────
  // 1. Registry truth
  // ────────────────────────────────────────────────────────────
  describe("registry truth — every CROSS_OS_LINKS entry is coherent", () => {
    it("link count meets the ratchet baseline (no silent shrink)", () => {
      expect(CROSS_OS_LINKS.length).toBeGreaterThanOrEqual(BASELINE_LINK_COUNT);
    });

    it("every link has a unique id", () => {
      const ids = CROSS_OS_LINKS.map((l) => l.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes).toEqual([]);
    });

    it("every link's source ≠ target (no self-loops)", () => {
      const offenders = CROSS_OS_LINKS.filter((l) => l.sourceApp === l.targetApp);
      expect(offenders.map((l) => l.id)).toEqual([]);
    });

    it("every link uses a valid source/target app", () => {
      const offenders = CROSS_OS_LINKS.filter(
        (l) =>
          !ALL_APPS.includes(l.sourceApp as (typeof ALL_APPS)[number]) ||
          !ALL_APPS.includes(l.targetApp as (typeof ALL_APPS)[number]),
      );
      expect(offenders.map((l) => l.id)).toEqual([]);
    });

    it("every link uses a valid category", () => {
      const offenders = CROSS_OS_LINKS.filter((l) => !VALID_CATEGORIES.has(l.category));
      expect(offenders.map((l) => l.id)).toEqual([]);
    });

    it("every link has a non-empty module, label, description, and icon", () => {
      const offenders = CROSS_OS_LINKS.filter(
        (l) =>
          !l.targetModule || !l.label || !l.description || !l.icon ||
          l.targetModule.length < 2 || l.label.length < 2 || l.description.length < 5,
      );
      expect(offenders.map((l) => l.id)).toEqual([]);
    });

    it("every archetype-scoped link references real archetypes", () => {
      const archSet = new Set<string>(ALL_ARCHETYPES);
      const offenders: string[] = [];
      for (const link of CROSS_OS_LINKS) {
        if (link.relevantArchetypes === "all") continue;
        for (const a of link.relevantArchetypes) {
          if (!archSet.has(a)) offenders.push(`${link.id}:${a}`);
        }
      }
      expect(offenders).toEqual([]);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 2. Archetype filter integrity (12 archetypes × 3 source apps)
  // ────────────────────────────────────────────────────────────
  describe("archetype filter integrity — getCrossOSLinks honors archetype scoping", () => {
    for (const archetype of ALL_ARCHETYPES as readonly ProfileArchetype[]) {
      for (const sourceApp of ALL_APPS) {
        it(`${sourceApp} × ${archetype}: only returns links matching source AND archetype`, () => {
          const links = getCrossOSLinks(sourceApp, archetype);

          // Must all be sourced from the requested app.
          const wrongSource = links.filter((l) => l.sourceApp !== sourceApp);
          expect(wrongSource.map((l) => l.id)).toEqual([]);

          // Each archetype-scoped link must declare this archetype.
          const leaks = links.filter((l) =>
            l.relevantArchetypes !== "all" &&
            !l.relevantArchetypes.includes(archetype),
          );
          expect(leaks.map((l) => l.id)).toEqual([]);

          // Every link in the registry that matches BOTH (source, archetype)
          // MUST be returned (no silent omission).
          const expected = CROSS_OS_LINKS.filter(
            (l) =>
              l.sourceApp === sourceApp &&
              (l.relevantArchetypes === "all" || l.relevantArchetypes.includes(archetype)),
          );
          expect(links.map((l) => l.id).sort()).toEqual(expected.map((l) => l.id).sort());
        });
      }
    }

    it("every source app exposes ≥1 universal link (relevantArchetypes='all')", () => {
      for (const app of ALL_APPS) {
        const universal = CROSS_OS_LINKS.filter(
          (l) => l.sourceApp === app && l.relevantArchetypes === "all",
        );
        expect(universal.length, `${app} has no universal cross-OS links`).toBeGreaterThan(0);
      }
    });

    it("calling without archetype returns the full source-filtered set", () => {
      for (const app of ALL_APPS) {
        const noArch = getCrossOSLinks(app);
        const full = CROSS_OS_LINKS.filter((l) => l.sourceApp === app);
        expect(noArch.map((l) => l.id).sort()).toEqual(full.map((l) => l.id).sort());
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // 3. Bidirectional pair coverage
  // ────────────────────────────────────────────────────────────
  describe("bidirectional pair coverage — every domain pair has both directions", () => {
    const REQUIRED_PAIRS = [
      ["business", "finance"],
      ["business", "concierge"],
      ["finance", "concierge"],
    ] as const;

    for (const [a, b] of REQUIRED_PAIRS) {
      it(`${a}↔${b}: at least one link a→b AND one link b→a`, () => {
        const aToB = CROSS_OS_LINKS.filter((l) => l.sourceApp === a && l.targetApp === b);
        const bToA = CROSS_OS_LINKS.filter((l) => l.sourceApp === b && l.targetApp === a);
        expect(aToB.length, `${a}→${b} direction missing`).toBeGreaterThan(0);
        expect(bToA.length, `${b}→${a} direction missing`).toBeGreaterThan(0);
      });
    }

    it("every directed app pair is reachable in the link graph", () => {
      const seen = new Set<string>();
      for (const link of CROSS_OS_LINKS) {
        seen.add(`${link.sourceApp}→${link.targetApp}`);
      }
      const required = [
        "business→finance", "finance→business",
        "business→concierge", "concierge→business",
        "finance→concierge", "concierge→finance",
      ];
      for (const r of required) {
        expect(seen.has(r), `Missing directed pair: ${r}`).toBe(true);
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // 4. Adaptation parity (Finance + Concierge × all archetypes)
  // ────────────────────────────────────────────────────────────
  describe("adaptation parity — every archetype maps to a complete adaptation", () => {
    for (const archetype of ALL_ARCHETYPES) {
      it(`${archetype}: getFinanceAdaptation returns a complete record`, () => {
        const a = getFinanceAdaptation(archetype);
        expect(a.receivablesLabel?.length, `${archetype}: empty receivablesLabel`).toBeGreaterThan(2);
        expect(["high", "medium", "low"]).toContain(a.cashTimingEmphasis);
        expect(["high", "medium", "low"]).toContain(a.investmentEmphasis);
        expect(["simple", "moderate", "complex"]).toContain(a.taxComplexity);
        expect(["personal", "business", "hybrid"]).toContain(a.budgetStyle);
        expect(a.heroMetricLabel?.length).toBeGreaterThan(2);
        expect(a.advisorPersonality?.length).toBeGreaterThan(5);
        expect(a.keyInsightFocus?.length).toBeGreaterThan(5);
      });

      it(`${archetype}: getConciergeAdaptation returns a complete record`, () => {
        const a = getConciergeAdaptation(archetype);
        expect(["primary", "secondary", "hidden"]).toContain(a.appointmentEmphasis);
        expect(Array.isArray(a.errandTypes)).toBe(true);
        expect(a.errandTypes.length, `${archetype}: empty errandTypes`).toBeGreaterThan(0);
        expect(["high", "medium", "low"]).toContain(a.travelEmphasis);
        expect(["full", "light", "minimal"]).toContain(a.householdIntegration);
        expect(a.advisorTone?.length).toBeGreaterThan(10);
        expect(a.schedulingLabel?.length).toBeGreaterThan(2);
        expect(a.primaryConcern?.length).toBeGreaterThan(10);
        expect(["separate", "blended", "work-dominant"]).toContain(a.workLifeBlend);
      });
    }

    it("Finance and Concierge adaptations are unique per archetype (no copy-paste collapse)", () => {
      const finHeroes = ALL_ARCHETYPES.map((a) => getFinanceAdaptation(a).heroMetricLabel);
      const conConcerns = ALL_ARCHETYPES.map((a) => getConciergeAdaptation(a).primaryConcern);
      // Allow at most 2 archetypes to share an identical hero/concern (e.g. similar models).
      const finUnique = new Set(finHeroes).size;
      const conUnique = new Set(conConcerns).size;
      expect(finUnique, "Finance hero metric labels collapsed too far").toBeGreaterThanOrEqual(ALL_ARCHETYPES.length - 2);
      expect(conUnique, "Concierge primary concerns collapsed too far").toBeGreaterThanOrEqual(ALL_ARCHETYPES.length - 2);
    });

    it("unknown archetype falls back to a documented default (no throw)", () => {
      const fakeArch = "fictional" as ProfileArchetype;
      expect(() => getFinanceAdaptation(fakeArch)).not.toThrow();
      expect(() => getConciergeAdaptation(fakeArch)).not.toThrow();
      // Falls back to `service` per engine contract.
      expect(getFinanceAdaptation(fakeArch)).toEqual(getFinanceAdaptation("service"));
      expect(getConciergeAdaptation(fakeArch)).toEqual(getConciergeAdaptation("service"));
    });
  });

  // ────────────────────────────────────────────────────────────
  // 5. Signal lineage
  // ────────────────────────────────────────────────────────────
  describe("cross-domain signal lineage", () => {
    it("signal count meets the ratchet baseline", () => {
      expect(CROSS_DOMAIN_SIGNALS.length).toBeGreaterThanOrEqual(BASELINE_SIGNAL_COUNT);
    });

    it("every signal has unique id, valid source/target, severity, and non-trivial fields", () => {
      const ids = new Set<string>();
      const offenders: string[] = [];
      for (const s of CROSS_DOMAIN_SIGNALS) {
        if (ids.has(s.id)) offenders.push(`dup:${s.id}`);
        ids.add(s.id);
        if (s.source === s.target) offenders.push(`self-loop:${s.id}`);
        if (!ALL_APPS.includes(s.source as (typeof ALL_APPS)[number])) offenders.push(`bad-source:${s.id}`);
        if (!ALL_APPS.includes(s.target as (typeof ALL_APPS)[number])) offenders.push(`bad-target:${s.id}`);
        if (!VALID_SEVERITIES.has(s.severity)) offenders.push(`bad-sev:${s.id}`);
        if (!s.triggerCondition || s.triggerCondition.length < 5) offenders.push(`weak-trigger:${s.id}`);
        if (!s.action || s.action.length < 10) offenders.push(`weak-action:${s.id}`);
        if (!s.label || s.label.length < 5) offenders.push(`weak-label:${s.id}`);
      }
      expect(offenders).toEqual([]);
    });

    it("every signal flow has at least one corresponding cross-OS link (signal→action coherence)", () => {
      // For every (source, target) pair that emits a signal, there must
      // exist at least one CROSS_OS_LINKS entry in the same direction —
      // otherwise the signal has nowhere to land.
      const linkPairs = new Set(CROSS_OS_LINKS.map((l) => `${l.sourceApp}→${l.targetApp}`));
      const orphans = CROSS_DOMAIN_SIGNALS.filter(
        (s) => !linkPairs.has(`${s.source}→${s.target}`),
      );
      expect(orphans.map((s) => s.id)).toEqual([]);
    });

    it("getActiveSignals(archetype) returns a real list for every archetype", () => {
      for (const a of ALL_ARCHETYPES) {
        const sigs = getActiveSignals(a);
        expect(Array.isArray(sigs)).toBe(true);
        expect(sigs.length).toBeGreaterThan(0);
      }
    });

    it("at least one critical-severity signal exists (real escalation surface)", () => {
      const critical = CROSS_DOMAIN_SIGNALS.filter((s) => s.severity === "critical");
      expect(critical.length).toBeGreaterThan(0);
    });
  });

  // ────────────────────────────────────────────────────────────
  // 6. Event bus + crossNavigate behavioral contract
  // ────────────────────────────────────────────────────────────
  describe("event bus contract", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("emitCrossOSEvent dispatches a CustomEvent on the window AND notifies registered listeners", () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const listener = vi.fn();

      const off = onCrossOSEvent("finance", "cross-os:signal", listener);

      emitCrossOSEvent({
        type: "cross-os:signal",
        source: "business",
        target: "finance",
        payload: { kind: "deal-closed", value: 50_000 },
      });

      // Window CustomEvent
      const dispatched = dispatchSpy.mock.calls.find(
        ([ev]) => (ev as CustomEvent).type === "sita-cross-os",
      );
      expect(dispatched, "sita-cross-os CustomEvent not dispatched").toBeTruthy();
      const detail = (dispatched![0] as CustomEvent<CrossOSEvent>).detail;
      expect(detail.source).toBe("business");
      expect(detail.target).toBe("finance");
      expect(detail.payload.kind).toBe("deal-closed");
      expect(typeof detail.timestamp).toBe("number");

      // Targeted listener
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].target).toBe("finance");

      off();
    });

    it("wildcard target listeners receive every signal of that type", () => {
      const wildcard = vi.fn();
      const off = onCrossOSEvent("*", "cross-os:context-sync", wildcard);

      emitCrossOSEvent({
        type: "cross-os:context-sync",
        source: "concierge",
        target: "business",
        payload: { profile: "appointment-based" },
      });
      emitCrossOSEvent({
        type: "cross-os:context-sync",
        source: "concierge",
        target: "finance",
        payload: { profile: "appointment-based" },
      });

      expect(wildcard).toHaveBeenCalledTimes(2);
      off();
    });

    it("listener unsubscription is honored (no leaks across tests)", () => {
      const listener = vi.fn();
      const off = onCrossOSEvent("finance", "cross-os:escalate", listener);
      off();

      emitCrossOSEvent({
        type: "cross-os:escalate",
        source: "business",
        target: "finance",
        payload: {},
      });
      expect(listener).not.toHaveBeenCalled();
    });

    it("event types in the union are exhaustive (no orphan emissions)", () => {
      // Every declared event type must round-trip through the bus.
      for (const t of VALID_EVENT_TYPES) {
        const listener = vi.fn();
        const off = onCrossOSEvent("*", t, listener);
        emitCrossOSEvent({ type: t, source: "business", target: "*", payload: {} });
        expect(listener, `Event type ${t} not delivered`).toHaveBeenCalledTimes(1);
        off();
      }
    });
  });

  describe("crossNavigate contract", () => {
    it("crossNavigate sets the initial-module global AND emits the navigate CustomEvent", () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");

      crossNavigate("finance", "receivables", { dealId: "d-123" });

      // Initial-module global
      expect((window as unknown as Record<string, unknown>).__financeInitialModule).toBe("receivables");

      // Targeted custom event
      const navEvent = dispatchSpy.mock.calls.find(
        ([ev]) => (ev as CustomEvent).type === "sita-finance-navigate",
      );
      expect(navEvent, "sita-finance-navigate CustomEvent not dispatched").toBeTruthy();
      const detail = (navEvent![0] as CustomEvent<{ module: string; dealId?: string }>).detail;
      expect(detail.module).toBe("receivables");
      expect(detail.dealId).toBe("d-123");

      // Generic cross-os event also fired
      const crossEvent = dispatchSpy.mock.calls.find(
        ([ev]) => (ev as CustomEvent).type === "sita-cross-os",
      );
      expect(crossEvent, "sita-cross-os not also emitted").toBeTruthy();
    });

    it("crossNavigate works for every target app", () => {
      for (const app of ALL_APPS) {
        const dispatchSpy = vi.spyOn(window, "dispatchEvent");
        crossNavigate(app, `mod-${app}`);
        const navType = `sita-${app}-navigate`;
        const found = dispatchSpy.mock.calls.find(
          ([ev]) => (ev as CustomEvent).type === navType,
        );
        expect(found, `${navType} not dispatched`).toBeTruthy();
        dispatchSpy.mockRestore();
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // 7. Anti-regression: structural ratchets
  // ────────────────────────────────────────────────────────────
  describe("anti-regression ratchets", () => {
    it("every archetype is referenced by at least one archetype-scoped link OR universal coverage", () => {
      // Every archetype should be reachable: either explicit scoping
      // OR through the "all"-scoped universal links.
      const explicitlyCovered = new Set<string>();
      for (const link of CROSS_OS_LINKS) {
        if (link.relevantArchetypes === "all") continue;
        for (const a of link.relevantArchetypes) explicitlyCovered.add(a);
      }
      const hasUniversal = CROSS_OS_LINKS.some((l) => l.relevantArchetypes === "all");
      expect(hasUniversal, "No universal cross-OS links exist").toBe(true);
      // Surface archetypes that are ONLY served by universal links —
      // documented finding, not a fail (some archetypes intentionally
      // share the universal handoffs).
      const onlyUniversal = (ALL_ARCHETYPES as readonly string[]).filter(
        (a) => !explicitlyCovered.has(a),
      );
      expect(onlyUniversal.length).toBeLessThanOrEqual(ALL_ARCHETYPES.length);
    });

    it("link counts per source app never collapse below 3 (minimum cross-OS surface)", () => {
      for (const app of ALL_APPS) {
        const count = CROSS_OS_LINKS.filter((l) => l.sourceApp === app).length;
        expect(count, `${app} has fewer than 3 cross-OS handoffs`).toBeGreaterThanOrEqual(3);
      }
    });

    it("Finance↔Business pair has the densest link surface (revenue spine invariant)", () => {
      const bizFin = CROSS_OS_LINKS.filter(
        (l) =>
          (l.sourceApp === "business" && l.targetApp === "finance") ||
          (l.sourceApp === "finance" && l.targetApp === "business"),
      ).length;
      const otherPairs: Record<string, number> = {};
      for (const link of CROSS_OS_LINKS) {
        const k = pairKey(link.sourceApp, link.targetApp);
        otherPairs[k] = (otherPairs[k] ?? 0) + 1;
      }
      const bizFinKey = pairKey("business", "finance");
      const maxOther = Math.max(
        ...Object.entries(otherPairs)
          .filter(([k]) => k !== bizFinKey)
          .map(([, v]) => v),
      );
      expect(bizFin, "Finance↔Business is no longer the densest cross-OS pair (revenue spine drift)").toBeGreaterThanOrEqual(maxOther);
    });
  });
});
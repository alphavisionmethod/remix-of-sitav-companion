// ═══════════════════════════════════════════════════════════════
// SITA OS — Business OS Production-Truth Audit Rules (Phase 3)
//
// Validates the new audit rules added in Phase 3 (5–8) against
// positive (violating) and negative (clean) inline source fixtures.
// Importing from the script keeps the rules and their tests in
// lock-step — no parallel duplication.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  findUngatedMockImports,
  hasFakeExecutePattern,
  hasEmptyStateGrammar,
  findFetchedButUnusedQueries,
  hasFakeLiveArray,
} from "../../../../scripts/architecture/check-business-truth";

describe("Phase 3 — audit rule 5: no-mock-fixture-import (ungated)", () => {
  it("flags a fixture import with no isDemo/useRealityModeSafe gate", () => {
    const src = `
      import { DEMO_LEADS } from "@/data/fixtures/mock-data/leads-demo";
      export default function Page() { return <div>{DEMO_LEADS.length}</div>; }
    `;
    expect(findUngatedMockImports(src)).toEqual([
      "@/data/fixtures/mock-data/leads-demo",
    ]);
  });

  it("ignores fixture imports when useRealityModeSafe is present", () => {
    const src = `
      import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
      import { DEMO_LEADS } from "@/data/fixtures/mock-data/leads-demo";
      export default function Page() {
        const { isDemo } = useRealityModeSafe();
        return <div>{isDemo ? DEMO_LEADS.length : 0}</div>;
      }
    `;
    expect(findUngatedMockImports(src)).toEqual([]);
  });

  it("ignores fixture imports when an isDemo identifier appears", () => {
    const src = `
      import { DEMO_LEADS } from "@/data/fixtures/mock-data/leads-demo";
      const isDemo = true;
      export default function Page() { return <div>{isDemo ? 1 : 0}</div>; }
    `;
    expect(findUngatedMockImports(src)).toEqual([]);
  });

  it("returns empty array when no fixture imports exist", () => {
    const src = `import { useState } from "react"; export default () => null;`;
    expect(findUngatedMockImports(src)).toEqual([]);
  });
});

describe("Phase 3 — audit rule 6: no-fake-execute", () => {
  it("flags setTimeout → setStatus('done')", () => {
    const src = `setTimeout(() => setStatus("done"), 2500);`;
    expect(hasFakeExecutePattern(src)).toBe(true);
  });

  it("flags setTimeout → setStatus('complete')", () => {
    const src = `setTimeout(() => setProgress("complete"), 1000);`;
    expect(hasFakeExecutePattern(src)).toBe(true);
  });

  it("flags block-form setTimeout setter", () => {
    const src = `setTimeout(() => { setState("success"); }, 500);`;
    expect(hasFakeExecutePattern(src)).toBe(true);
  });

  it("does not flag legitimate setTimeout for UI delays", () => {
    const src = `setTimeout(() => setOpen(false), 100);`;
    expect(hasFakeExecutePattern(src)).toBe(false);
  });

  it("does not flag mutation handlers", () => {
    const src = `mutation.mutate({}); setStatus("done");`;
    expect(hasFakeExecutePattern(src)).toBe(false);
  });
});

describe("Phase 3 — audit rule 7: degraded-must-render-empty", () => {
  it("accepts pages with EmptyStateCard", () => {
    const src = `import { EmptyStateCard } from "x"; <EmptyStateCard />`;
    expect(hasEmptyStateGrammar(src)).toBe(true);
  });

  it("accepts pages with PremiumEmptyState", () => {
    const src = `<PremiumEmptyState title="x" />`;
    expect(hasEmptyStateGrammar(src)).toBe(true);
  });

  it("accepts pages with PageTruthBanner partial state", () => {
    const src = `<PageTruthBanner truthState="partial" />`;
    expect(hasEmptyStateGrammar(src)).toBe(true);
  });

  it("rejects pages with only a card and no empty grammar", () => {
    const src = `<Card><CardContent>some text</CardContent></Card>`;
    expect(hasEmptyStateGrammar(src)).toBe(false);
  });
});

describe("Phase 3 — audit rule 8: fetched-but-unused-query (advisory)", () => {
  it("flags destructured data that is never referenced again", () => {
    const src = `
      function Page() {
        const { data: liveData } = useThing();
        return <div>hello</div>;
      }
    `;
    expect(findFetchedButUnusedQueries(src)).toEqual(["liveData"]);
  });

  it("does not flag when the data is consumed", () => {
    const src = `
      function Page() {
        const { data: liveData } = useThing();
        return <div>{liveData?.value}</div>;
      }
    `;
    expect(findFetchedButUnusedQueries(src)).toEqual([]);
  });

  it("ignores underscore-prefixed names", () => {
    const src = `const { data: _unused } = useThing();`;
    expect(findFetchedButUnusedQueries(src)).toEqual([]);
  });
});

describe("Phase 3 — sanity: rule 3 still functions", () => {
  it("respects truth-allow: ia-config marker", () => {
    const src = `
      // truth-allow: ia-config
      const NAV: Array<{ id: string; label: string }> = [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ];
    `;
    expect(hasFakeLiveArray(src)).toBe(false);
  });

  it("flags telemetry-shaped top-level arrays", () => {
    // Match the column-0 anchor used in production page sources.
    const src = [
      `const REVENUE = [`,
      `  { id: "r1", amount: 1000 },`,
      `  { id: "r2", amount: 2000 },`,
      `];`,
    ].join("\n");
    expect(hasFakeLiveArray(src)).toBe(true);
  });
});
// ═══════════════════════════════════════════════════════════════
// Phase 4 — Proof lineage probe shape
//
// Asserts that the canonical continuity-verification probes expose
// structurally valid `evidenceRef` pointers — i.e. each probe
// names a real file path or capability id reviewers can audit.
// We run with mocked Supabase (data: []) so probes correctly
// return `unknown` (the honest empty-DB outcome) and never `pass`.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => Promise.resolve({ data: { user: { id: "u" } }, error: null }) },
    from: () => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => chain,
        in: () => chain,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
      };
      return chain;
    },
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: () => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      in: () => chain,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
    };
    return chain;
  },
}));

describe("continuity report — proof lineage probes", () => {
  it("Q→P→I lineage and CRM↔Finance bridge probes are present with audit refs", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();

    const ids = r.probes.map((p) => p.id);
    // Every probe must declare an evidenceRef and a status from the canonical set.
    for (const p of r.probes) {
      expect(p.evidenceRef, `probe ${p.id} missing evidenceRef`).toBeTruthy();
      expect(["pass", "fail", "unknown", "deferred"]).toContain(p.status);
    }

    // The two lineage probes must be in the report.
    expect(ids).toContain("handler-coverage");
    expect(ids.some((i) => i.includes("revenue") || i.includes("ia"))).toBe(true);
  });

  it("totals stay coherent (passed+failed+unknown+deferred = totalProbes)", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();
    expect(r.passed + r.failed + r.unknown + r.deferred).toBe(r.totalProbes);
    expect(r.totalProbes).toBe(r.probes.length);
  });

  it("DB-backed probes return `unknown` (never fake `pass`) when DB empty", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();
    // At least one DB-backed probe must be in the unknown bucket — the
    // service's contract: "If a probe cannot be proven, status='unknown'."
    expect(r.unknown).toBeGreaterThan(0);
    // No probe may falsely report pass when DB is empty, except the static
    // handler-coverage and revenue-IA probes which don't need DB.
    const fabricatedPasses = r.probes.filter(
      (p) =>
        p.status === "pass" &&
        p.id !== "handler-coverage" &&
        !p.id.includes("revenue") &&
        !p.id.includes("ia"),
    );
    expect(
      fabricatedPasses.map((p) => p.id),
      "DB-backed probe falsely passed against empty DB",
    ).toEqual([]);
  });

  it("evidenceRef points to a recognizable code/capability locator", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();
    for (const p of r.probes) {
      const ref = p.evidenceRef;
      const isFilePath = ref.includes("/") || ref.endsWith(".ts") || ref.endsWith(".tsx");
      const isCapId = /^[A-Z][A-Z0-9_]+$/.test(ref) || ref.includes("CANONICAL");
      const isDottedKey = /^[a-z0-9_]+(\.[a-z0-9_-]+)+$/.test(ref);
      expect(
        isFilePath || isCapId || isDottedKey,
        `probe ${p.id} evidenceRef is unrecognizable: ${ref}`,
      ).toBe(true);
    }
  });
});
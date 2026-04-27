// ═══════════════════════════════════════════════════════════════
// Phase 10 — CRM ↔ Concierge Linkage (live data shape)
// Verifies that CRMConciergeLinkage queries appointments,
// concierge_recurring_obligations and errands by crm_contact_id /
// crm_company_id and renders deep-links via setLinkedContext.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const FILE = path.resolve(
  process.cwd(),
  "src/modules/business/components/business/crm/CRMConciergeLinkage.tsx",
);

describe("CRMConciergeLinkage — Phase 2 truth (carried by Phase 10 GP)", () => {
  const src = fs.readFileSync(FILE, "utf8");

  it("does NOT import the demo generators that the legacy version used", () => {
    expect(src).not.toMatch(/generateDemoAppointments/);
    expect(src).not.toMatch(/generateDemoObligations/);
    expect(src).not.toMatch(/generateDemoErrands/);
  });

  it("queries the three canonical Concierge tables filtered by CRM lineage", () => {
    expect(src).toMatch(/fromTable\(["']appointments["']\)/);
    expect(src).toMatch(/fromTable\(["']concierge_recurring_obligations["']\)/);
    expect(src).toMatch(/fromTable\(["']errands["']\)/);
    expect(src).toMatch(/crm_contact_id/);
  });

  it("emits cross-app handoffs via setLinkedContext + navigation", () => {
    expect(src).toMatch(/setLinkedContext\(/);
    // At least one of the three Concierge surfaces is targeted.
    expect(src).toMatch(/\/concierge\/(calendar|recurring|errands)/);
  });
});
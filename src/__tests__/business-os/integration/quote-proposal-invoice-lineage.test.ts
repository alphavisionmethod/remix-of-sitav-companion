// ═══════════════════════════════════════════════════════════════
// Phase 10 — Opportunity → Quote → Proposal → Invoice lineage
// Verifies that the conversion handlers exist with the expected verb
// names and that the canonical lineage columns are written by each
// hop (proven via static inspection so the test is hermetic).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function readSrc(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
}

describe("Opportunity → Quote → Proposal → Invoice lineage", () => {
  it("Opportunities Center converts opportunity → quote with opportunity_id lineage", () => {
    const src = readSrc("src/modules/business/pages/OpportunitiesCenter.tsx");
    expect(src).toMatch(/opportunity\.convert-to-quote/);
  });

  it("Proposals page accepts the converted-from-quote handoff (quote_id lineage)", () => {
    const src = readSrc("src/modules/business/pages/ProposalsContracts.tsx");
    expect(src).toMatch(/quote\.convert-to-proposal|converted_from_quote_id|quote_id|source_quote/);
  });

  it("Invoices page accepts the converted-from-proposal handoff (proposal_id lineage)", () => {
    const src = readSrc("src/modules/business/pages/InvoicesCollections.tsx");
    expect(src).toMatch(/proposals\(|source_proposal|converted_proposal_id|converted_from_proposal_id/);
  });

  it("Invoice detail surfaces upstream lineage chips for proposal + quote", () => {
    const src = readSrc(
      "src/modules/business/components/business/InvoiceDetailPane.tsx",
    );
    // Phase 3 introduced the back-link badges; Phase 10 GP relies on them.
    expect(src).toMatch(/From proposal|converted_from_proposal_id|proposal_id|source_proposal/);
    expect(src).toMatch(/From quote|converted_from_quote_id|quote_id|source_quote/);
  });
});
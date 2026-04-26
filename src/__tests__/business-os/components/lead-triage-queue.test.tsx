// ═══════════════════════════════════════════════════════════════
// Business OS — LeadTriageQueue Empty/Populated Honesty
// Verifies the queue surfaces the *correct empty variant* for
// (1) no leads at all, (2) all triaged (caught-up), (3) filter
// produced zero matches, and renders cards when populated.
// Pure component — no data hooks mocked.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeadTriageQueue } from "@/modules/business/components/business/lead-inbox/LeadTriageQueue";
import type { InboxItem } from "@/modules/business/components/business/lead-inbox/mock-inbox-data";

// Minimal fixture matching the InboxItem shape.
function makeInboxItem(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: "lead-test-1",
    name: "Test Lead",
    email: "test@example.com",
    phone: null,
    company: "Acme",
    source: "form",
    score: 72,
    status: "new",
    intent: "high",
    receivedAt: new Date().toISOString(),
    summary: "Inbound demo request",
    tags: [],
    isDuplicate: false,
    ...(overrides as InboxItem),
  } as InboxItem;
}

const noopHandlers = {
  onSelect: vi.fn(),
  onCheck: vi.fn(),
  onAccept: vi.fn(),
  onRoute: vi.fn(),
  onReject: vi.fn(),
  onSnooze: vi.fn(),
  onFlag: vi.fn(),
};

describe("LeadTriageQueue — empty-state honesty", () => {
  it("renders the first-use empty state when there are no leads at all", () => {
    render(
      <LeadTriageQueue
        items={[]}
        allItems={[]}
        filter="all"
        selectedId={null}
        checkedIds={new Set()}
        scoreMap={new Map()}
        newCount={0}
        {...noopHandlers}
      />,
    );
    // First-use copy from LeadEmptyStates
    expect(screen.getByText(/no leads yet|first lead|connect|import|add lead/i)).toBeInTheDocument();
  });

  it("renders the caught-up state when allItems exist but none match the inbox + filter is 'all' + newCount=0", () => {
    const item = makeInboxItem({ status: "won" as InboxItem["status"] });
    render(
      <LeadTriageQueue
        items={[]}
        allItems={[item]}
        filter="all"
        selectedId={null}
        checkedIds={new Set()}
        scoreMap={new Map()}
        newCount={0}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText(/caught up|all caught/i)).toBeInTheDocument();
  });

  it("renders the no-results state when a filter is active but produced zero matches", () => {
    const item = makeInboxItem();
    render(
      <LeadTriageQueue
        items={[]}
        allItems={[item]}
        filter={"new" as never}
        selectedId={null}
        checkedIds={new Set()}
        scoreMap={new Map()}
        newCount={5}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText(/no matching|adjust|filter|search/i)).toBeInTheDocument();
  });

  it("renders one card per item when populated", () => {
    const items = [
      makeInboxItem({ id: "a", name: "Alpha Lead" }),
      makeInboxItem({ id: "b", name: "Bravo Lead" }),
      makeInboxItem({ id: "c", name: "Charlie Lead" }),
    ];
    render(
      <LeadTriageQueue
        items={items}
        allItems={items}
        filter="all"
        selectedId={null}
        checkedIds={new Set()}
        scoreMap={new Map()}
        newCount={3}
        {...noopHandlers}
      />,
    );
    expect(screen.getByText("Alpha Lead")).toBeInTheDocument();
    expect(screen.getByText("Bravo Lead")).toBeInTheDocument();
    expect(screen.getByText("Charlie Lead")).toBeInTheDocument();
    // No empty-state copy when populated
    expect(screen.queryByText(/caught up|no matching/i)).not.toBeInTheDocument();
  });
});
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
import {
  FALLBACK_INBOX_ITEMS,
  type InboxItem,
} from "@/modules/business/components/business/lead-inbox/mock-inbox-data";

function makeInboxItem(overrides: Partial<InboxItem> = {}): InboxItem {
  return { ...FALLBACK_INBOX_ITEMS[0], ...overrides };
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
    expect(screen.getByText(/Welcome to Lead Inbox/i)).toBeInTheDocument();
  });

  it("renders the caught-up state when allItems exist but none match the inbox + filter is 'all' + newCount=0", () => {
    const item = makeInboxItem({ id: "li-caught", triage_status: "accepted" });
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
    expect(screen.getByText(/No matching items/i)).toBeInTheDocument();
  });

  it("renders one card per item when populated", () => {
    const items = [
      makeInboxItem({ id: "a", contact_name: "Alpha Lead" }),
      makeInboxItem({ id: "b", contact_name: "Bravo Lead" }),
      makeInboxItem({ id: "c", contact_name: "Charlie Lead" }),
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
    expect(screen.queryByText(/You're all caught up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No matching items/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Welcome to Lead Inbox/i)).not.toBeInTheDocument();
  });
});
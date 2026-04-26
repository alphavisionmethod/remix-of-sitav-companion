// ═══════════════════════════════════════════════════════════════
// Business OS — CalendarSyncBadge Honest-State Coverage
// Verifies the badge surfaces the most-actionable status first
// (failed > conflict > pending > synced > deleted) and that
// "no link rows" honestly renders "Not synced" rather than a fake
// success badge.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarSyncBadge } from "@/modules/business/components/business/CalendarSyncBadge";
import type { AppointmentSyncBadgeData } from "@/hooks/use-phase10-actions";

function link(
  status: AppointmentSyncBadgeData["status"],
  overrides: Partial<AppointmentSyncBadgeData> = {},
): AppointmentSyncBadgeData {
  return {
    provider: "google",
    status,
    lastSyncedAt: new Date().toISOString(),
    lastError: null,
    ...overrides,
  };
}

describe("CalendarSyncBadge — honest state surfacing", () => {
  it("shows 'Not synced' when no sync links exist (honest empty)", () => {
    render(<CalendarSyncBadge links={undefined} />);
    expect(screen.getByText(/Not synced/i)).toBeInTheDocument();
  });

  it("shows 'Not synced' for an empty links array (honest empty)", () => {
    render(<CalendarSyncBadge links={[]} />);
    expect(screen.getByText(/Not synced/i)).toBeInTheDocument();
  });

  it("renders 'Synced' when only a synced link exists", () => {
    render(<CalendarSyncBadge links={[link("synced")]} />);
    expect(screen.getByText(/^Synced$/i)).toBeInTheDocument();
  });

  it("renders 'Sync queued' for a single pending link", () => {
    render(<CalendarSyncBadge links={[link("pending")]} />);
    expect(screen.getByText(/Sync queued/i)).toBeInTheDocument();
  });

  it("renders 'Sync failed' for a failed link", () => {
    render(<CalendarSyncBadge links={[link("failed", { lastError: "Calendar API rate limit" })]} />);
    expect(screen.getByText(/Sync failed/i)).toBeInTheDocument();
  });

  it("prioritizes 'failed' over 'synced' when both are present", () => {
    render(<CalendarSyncBadge links={[link("synced"), link("failed", { provider: "outlook" })]} />);
    expect(screen.getByText(/Sync failed/i)).toBeInTheDocument();
    // Synced label MUST NOT take precedence when a failed link exists.
    expect(screen.queryByText(/^Synced$/i)).not.toBeInTheDocument();
  });

  it("prioritizes 'conflict' over 'pending' and 'synced'", () => {
    render(
      <CalendarSyncBadge
        links={[link("synced"), link("pending"), link("conflict")]}
      />,
    );
    expect(screen.getByText(/Sync conflict/i)).toBeInTheDocument();
  });

  it("renders 'Removed from calendar' when only a deleted link exists", () => {
    render(<CalendarSyncBadge links={[link("deleted")]} />);
    expect(screen.getByText(/Removed from calendar/i)).toBeInTheDocument();
  });
});
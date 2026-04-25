// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Components Tests
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { FormProgressIndicator } from "@/platform/sita/components/sita/FormProgressIndicator";
import { DataFreshnessBadge } from "@/platform/sita/components/sita/DataFreshnessBadge";

describe("FormProgressIndicator", () => {
  it("renders saving state", () => {
    render(<FormProgressIndicator status="saving" />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("renders saved state", () => {
    render(<FormProgressIndicator status="saved" />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(<FormProgressIndicator status="error" />);
    expect(screen.getByText("Save failed")).toBeInTheDocument();
  });

  it("renders offline state", () => {
    render(<FormProgressIndicator status="offline" />);
    expect(screen.getByText(/Offline/)).toBeInTheDocument();
  });

  it("renders idle state", () => {
    render(<FormProgressIndicator status="idle" />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});

describe("DataFreshnessBadge", () => {
  it("returns null for fresh data", () => {
    const { container } = render(<DataFreshnessBadge lastFetchedAt={new Date()} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows stale indicator for old data", () => {
    const oldDate = new Date(Date.now() - 400_000);
    render(<DataFreshnessBadge lastFetchedAt={oldDate} />);
    // Should show something like "6m ago"
    expect(screen.getByTitle(/ago/i)).toBeInTheDocument();
  });

  it("shows never for null data", () => {
    render(<DataFreshnessBadge lastFetchedAt={null} />);
    expect(screen.getByTitle(/never/i)).toBeInTheDocument();
  });

  it("calls onRefresh when clicked", async () => {
    const onRefresh = vi.fn();
    const oldDate = new Date(Date.now() - 400_000);
    render(<DataFreshnessBadge lastFetchedAt={oldDate} onRefresh={onRefresh} />);
    const button = screen.getByTitle(/ago/i);
    button.click();
    expect(onRefresh).toHaveBeenCalled();
  });
});

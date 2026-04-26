// ═══════════════════════════════════════════════════════════════
// Business OS — AppointmentsScheduling Page-State Honesty
// Verifies the four canonical states:
//   loading      → skeleton grid (no card list, no KPI value)
//   error        → "Couldn't load appointments" + retry CTA
//   unauth       → "Sign in to view your appointments"
//   empty        → "No appointments yet" empty state
//   populated    → at least one appointment card + KPIs
// Drives the page by mocking use-scheduled-appointments and
// use-phase10-actions hooks.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderBusinessPage } from "../_helpers/render-business-page";

const apptHookState: {
  appointments: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isUnauthenticated: boolean;
} = {
  appointments: [],
  isLoading: false,
  isError: false,
  error: null,
  isUnauthenticated: false,
};

vi.mock("@/hooks/use-scheduled-appointments", () => ({
  useScheduledAppointments: () => ({
    ...apptHookState,
    state: apptHookState.isLoading
      ? "loading"
      : apptHookState.isError
        ? "error"
        : apptHookState.appointments.length === 0
          ? "empty"
          : "ready",
    isEmpty: apptHookState.appointments.length === 0,
    isReady: !apptHookState.isLoading && !apptHookState.isError,
    refetch: vi.fn(),
    userId: apptHookState.isUnauthenticated ? null : "user-1",
    isLive: !apptHookState.isUnauthenticated,
  }),
  useScheduledAppointmentsRealtime: () => undefined,
  useSendConfirmationReminder: () => ({ mutate: vi.fn(), isPending: false }),
  useMarkBookingConfirmed: () => ({ mutate: vi.fn(), isPending: false }),
  useRecoverNoShow: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/use-phase10-actions", () => ({
  useSyncAppointmentToCalendar: () => ({ mutate: vi.fn(), isPending: false }),
  useAppointmentSyncStatus: () => ({ data: new Map(), isLoading: false }),
}));

vi.mock("@/hooks/useAction", () => ({
  useAction: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}));

// EmptyStateCard icon-rendering quirk isolation (see autopilot-hub.test).
vi.mock("@/platform/sita/components/sita/EmptyStateCard", () => ({
  __esModule: true,
  EmptyStateCard: ({ title, description, ctaLabel, onAction }: { title: string; description: string; ctaLabel?: string; onAction?: () => void }) => (
    <div data-testid="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {ctaLabel && (
        <button onClick={onAction}>{ctaLabel}</button>
      )}
    </div>
  ),
  LegacyEmptyStateCard: ({ title, description, ctaLabel, onAction }: { title: string; description: string; ctaLabel?: string; onAction?: () => void }) => (
    <div data-testid="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {ctaLabel && <button onClick={onAction}>{ctaLabel}</button>}
    </div>
  ),
}));

import AppointmentsScheduling from "@/modules/business/pages/AppointmentsScheduling";

function makeAppt(overrides: Record<string, any> = {}) {
  return {
    id: "appt-1",
    customer: "Sarah Chen",
    service: "Strategy Call",
    date: "Today",
    time: "10:00 AM",
    startsAt: "2026-01-15T10:00:00Z",
    duration: "30m",
    location: "Zoom",
    status: "confirmed" as const,
    noShowRisk: "low" as const,
    isFollowUp: false,
    ...overrides,
  };
}

describe("AppointmentsScheduling — page-state honesty", () => {
  beforeEach(() => {
    apptHookState.appointments = [];
    apptHookState.isLoading = false;
    apptHookState.isError = false;
    apptHookState.error = null;
    apptHookState.isUnauthenticated = false;
  });

  it("renders loading skeletons while data is loading", () => {
    apptHookState.isLoading = true;
    const { container } = renderBusinessPage(<AppointmentsScheduling />);
    // Skeletons are rendered (multiple); no empty-state and no appointment card.
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/No appointments yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sarah Chen/i)).not.toBeInTheDocument();
  });

  it("renders error state with retry CTA when load fails", () => {
    apptHookState.isError = true;
    apptHookState.error = new Error("Backend unreachable");
    renderBusinessPage(<AppointmentsScheduling />);
    expect(screen.getByText(/Couldn't load appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend unreachable/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });

  it("renders sign-in required when unauthenticated in live mode", () => {
    apptHookState.isUnauthenticated = true;
    renderBusinessPage(<AppointmentsScheduling />);
    expect(screen.getByText(/Sign in to view your appointments/i)).toBeInTheDocument();
    // Page MUST NOT render the appointment list when unauth.
    expect(screen.queryByText(/No appointments yet/i)).not.toBeInTheDocument();
  });

  it("renders the empty state when authenticated but no appointments exist", () => {
    apptHookState.appointments = [];
    renderBusinessPage(<AppointmentsScheduling />);
    expect(screen.getByText(/No appointments yet/i)).toBeInTheDocument();
  });

  it("renders appointment cards when populated", () => {
    apptHookState.appointments = [
      makeAppt({ id: "a-1", customer: "Sarah Chen", service: "Discovery Call" }),
      makeAppt({ id: "a-2", customer: "James Rodriguez", service: "Strategy Session" }),
    ];
    renderBusinessPage(<AppointmentsScheduling />);
    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Discovery Call/i)).toBeInTheDocument();
    // Empty state MUST NOT show when populated.
    expect(screen.queryByText(/No appointments yet/i)).not.toBeInTheDocument();
  });
});
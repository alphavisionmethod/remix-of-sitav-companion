import { describe, it, expect } from "vitest";
import { evaluateMission } from "../standing-missions";

const baseMission = {
  trigger_kind: "interval" as const,
  trigger_config: { every_minutes: 60 },
  paused: false,
  last_run_at: null as string | null,
  next_run_at: null as string | null,
};

describe("evaluateMission", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("paused missions never fire", () => {
    const d = evaluateMission(
      { ...baseMission, paused: true },
      { now },
    );
    expect(d.fire).toBe(false);
    expect(d.reason).toBe("paused");
  });

  it("interval mission fires on first run", () => {
    const d = evaluateMission(baseMission, { now });
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("interval_elapsed");
  });

  it("interval mission waits when last_run_at is recent", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        last_run_at: new Date(now.getTime() - 10 * 60_000).toISOString(),
      },
      { now },
    );
    expect(d.fire).toBe(false);
    expect(d.reason).toBe("interval_not_elapsed");
  });

  it("interval mission re-fires after the cadence elapses", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        last_run_at: new Date(now.getTime() - 61 * 60_000).toISOString(),
      },
      { now },
    );
    expect(d.fire).toBe(true);
  });

  it("signal trigger requires a matching signal", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        trigger_kind: "signal",
        trigger_config: { signal_kind: "cash.runway_dip" },
      },
      { now },
    );
    expect(d.fire).toBe(false);
    expect(d.reason).toBe("no_matching_signal");
  });

  it("signal trigger respects min_severity", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        trigger_kind: "signal",
        trigger_config: { signal_kind: "cash.runway_dip", min_severity: "high" },
      },
      {
        now,
        recentMatchingSignal: {
          id: "sig-1",
          severity: "low",
          created_at: now.toISOString(),
        },
      },
    );
    expect(d.fire).toBe(false);
    expect(d.reason).toBe("severity_below_threshold");
  });

  it("signal trigger fires when severity meets threshold", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        trigger_kind: "signal",
        trigger_config: { signal_kind: "cash.runway_dip", min_severity: "medium" },
      },
      {
        now,
        recentMatchingSignal: {
          id: "sig-1",
          severity: "high",
          created_at: now.toISOString(),
        },
      },
    );
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("signal_matched");
  });

  it("composite requires BOTH interval and signal", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        trigger_kind: "composite",
        trigger_config: { every_minutes: 60, signal_kind: "inbox.spike" },
        last_run_at: new Date(now.getTime() - 5 * 60_000).toISOString(),
      },
      {
        now,
        recentMatchingSignal: {
          id: "sig",
          severity: "high",
          created_at: now.toISOString(),
        },
      },
    );
    expect(d.fire).toBe(false);
    expect(d.reason).toBe("interval_not_elapsed");
  });

  it("composite fires when both conditions are satisfied", () => {
    const d = evaluateMission(
      {
        ...baseMission,
        trigger_kind: "composite",
        trigger_config: { every_minutes: 60, signal_kind: "inbox.spike" },
        last_run_at: new Date(now.getTime() - 90 * 60_000).toISOString(),
      },
      {
        now,
        recentMatchingSignal: {
          id: "sig",
          severity: "medium",
          created_at: now.toISOString(),
        },
      },
    );
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("interval_and_signal");
  });
});
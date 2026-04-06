// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Hooks Tests
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── useOnlineStatus ─────────────────────────────────────────

describe("useOnlineStatus", () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, "onLine", { value: true, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", { value: originalOnLine, writable: true, configurable: true });
  });

  it("reports online when navigator.onLine is true", async () => {
    const { useOnlineStatus } = await import("@/hooks/use-online-status");
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectionQuality).not.toBe("offline");
  });

  it("reports offline when navigator.onLine is false", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, writable: true, configurable: true });
    const { useOnlineStatus } = await import("@/hooks/use-online-status");
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);
    expect(result.current.connectionQuality).toBe("offline");
  });

  it("detects offline→online transition", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, writable: true, configurable: true });
    const { useOnlineStatus } = await import("@/hooks/use-online-status");
    const { result } = renderHook(() => useOnlineStatus());

    Object.defineProperty(navigator, "onLine", { value: true, writable: true, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });
});

// ── useConfirmation ─────────────────────────────────────────

describe("useConfirmation", () => {
  it("opens and resolves on confirm", async () => {
    const { useConfirmation } = await import("@/hooks/use-confirmation");
    const { result } = renderHook(() => useConfirmation());

    let resolved: boolean | undefined;
    act(() => {
      result.current.confirm({
        title: "Delete?",
        description: "This cannot be undone.",
        variant: "destructive",
      }).then((r) => { resolved = r; });
    });

    expect(result.current.confirmation.isOpen).toBe(true);
    expect(result.current.confirmation.title).toBe("Delete?");

    act(() => {
      result.current.confirmation.onConfirm();
    });

    await vi.waitFor(() => expect(resolved).toBe(true));
    expect(result.current.confirmation.isOpen).toBe(false);
  });

  it("resolves false on cancel", async () => {
    const { useConfirmation } = await import("@/hooks/use-confirmation");
    const { result } = renderHook(() => useConfirmation());

    let resolved: boolean | undefined;
    act(() => {
      result.current.confirm({
        title: "Delete?",
        description: "Are you sure?",
      }).then((r) => { resolved = r; });
    });

    act(() => {
      result.current.confirmation.onCancel();
    });

    await vi.waitFor(() => expect(resolved).toBe(false));
  });
});

// ── useUndoStack ────────────────────────────────────────────

describe("useUndoStack", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("adds and executes undo actions", async () => {
    const { useUndoStack } = await import("@/hooks/use-confirmation");
    const { result } = renderHook(() => useUndoStack(5000));

    const undoFn = vi.fn();
    let id: string;
    act(() => {
      id = result.current.pushUndo("Deleted item", undoFn);
    });

    expect(result.current.undoActions).toHaveLength(1);
    expect(result.current.undoActions[0].label).toBe("Deleted item");

    act(() => {
      result.current.executeUndo(id!);
    });

    expect(undoFn).toHaveBeenCalled();
    expect(result.current.undoActions).toHaveLength(0);
  });

  it("auto-expires after timeout", async () => {
    const { useUndoStack } = await import("@/hooks/use-confirmation");
    const { result } = renderHook(() => useUndoStack(5000));

    act(() => {
      result.current.pushUndo("Test", vi.fn());
    });

    expect(result.current.undoActions).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current.undoActions).toHaveLength(0);
  });
});

// ── useStaleData ────────────────────────────────────────────

describe("useStaleData", () => {
  it("returns fresh for recent data", async () => {
    const { useStaleData } = await import("@/hooks/use-stale-data");
    const { result } = renderHook(() => useStaleData(new Date()));
    expect(result.current.freshness).toBe("fresh");
    expect(result.current.isFresh).toBe(true);
  });

  it("returns expired for null data", async () => {
    const { useStaleData } = await import("@/hooks/use-stale-data");
    const { result } = renderHook(() => useStaleData(null));
    expect(result.current.freshness).toBe("expired");
    expect(result.current.ageLabel).toBe("never");
  });

  it("returns stale for old data", async () => {
    const { useStaleData } = await import("@/hooks/use-stale-data");
    const oldDate = new Date(Date.now() - 400_000); // 6+ minutes ago
    const { result } = renderHook(() => useStaleData(oldDate));
    expect(result.current.freshness).toBe("stale");
    expect(result.current.isFresh).toBe(false);
  });
});

// ── useOptimisticMutation ───────────────────────────────────

describe("useOptimisticMutation", () => {
  it("applies optimistic value then replaces with result", async () => {
    const { useOptimisticMutation } = await import("@/hooks/use-optimistic-mutation");
    const { result } = renderHook(() => useOptimisticMutation<string>("initial"));

    await act(async () => {
      await result.current.execute("optimistic", async () => "final");
    });

    expect(result.current.value).toBe("final");
    expect(result.current.error).toBeNull();
  });

  it("rolls back on error", async () => {
    const { useOptimisticMutation } = await import("@/hooks/use-optimistic-mutation");
    const { result } = renderHook(() => useOptimisticMutation<string>("initial"));

    await act(async () => {
      await result.current.execute("optimistic", async () => {
        throw new Error("fail");
      });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("fail");
  });
});

// ── Contextual Empty States ─────────────────────────────────

describe("contextualEmptyStates", () => {
  it("returns config for known domains", async () => {
    const { getContextualEmptyState, CONTEXTUAL_EMPTY_STATES } = await import("@/lib/ux-trust/contextual-empty-states");

    const domains = Object.keys(CONTEXTUAL_EMPTY_STATES);
    expect(domains.length).toBeGreaterThanOrEqual(10);

    for (const domain of domains) {
      const config = getContextualEmptyState(domain);
      expect(config.title).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.actions.length).toBeGreaterThan(0);
      expect(config.tip).toBeTruthy();
    }
  });

  it("returns fallback for unknown domains", async () => {
    const { getContextualEmptyState } = await import("@/lib/ux-trust/contextual-empty-states");
    const config = getContextualEmptyState("xyznonexistent");
    expect(config.title).toBe("Nothing here yet");
    expect(config.actions.length).toBeGreaterThan(0);
  });
});

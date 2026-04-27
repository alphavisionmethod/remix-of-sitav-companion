// Phase 6 — Hook integration: useHouseholds / useHouseholdMembers
// Drives the real hook through the canonical Supabase mock from
// src/test/test-utils (imported transitively via the concierge
// render helper). With anonymous auth the query is disabled
// (enabled: !!user). With authenticated auth it resolves to [].

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
// Side-effect import: installs canonical Supabase + Auth mocks
import "@/__tests__/concierge/_helpers/render-concierge-page";
import { makeWrapper } from "./_hookHarness";
import {
  useHouseholds,
  useHouseholdMembers,
  useHouseholdSharedItems,
} from "@/modules/concierge/hooks/use-household";

describe("useHouseholds (Phase 6)", () => {
  it("is gated on auth — disabled when no user", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useHouseholds(), { wrapper: Wrapper });
    // anonymous: enabled:false → fetchStatus 'idle', data undefined
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });
});

describe("useHouseholdMembers (Phase 6)", () => {
  it("disabled when householdId is null", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useHouseholdMembers(null), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });
    expect(result.current.data).toBeUndefined();
  });

  it("runs and resolves to empty array when householdId is provided", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useHouseholdMembers("h-1"), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });
    expect(result.current.data).toEqual([]);
  });
});

describe("useHouseholdSharedItems (Phase 6)", () => {
  it("disabled when householdId is null, runs to [] when set", async () => {
    const { Wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      ({ id }: { id: string | null }) => useHouseholdSharedItems(id),
      { wrapper: Wrapper, initialProps: { id: null } },
    );
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));

    rerender({ id: "h-1" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });
    expect(result.current.data).toEqual([]);
  });
});

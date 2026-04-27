// Phase 6 — Canonical hook: usePageData state-grammar contract
// Verifies the loading→empty→ready transitions emitted by the
// shared usePageData wrapper used by Concierge + Finance pages.

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@/__tests__/finance/_helpers/render-finance-page";
import { makeWrapper } from "@/__tests__/concierge/hooks/_hookHarness";
import { usePageData } from "@/hooks/usePageData";

describe("usePageData (Phase 6 canonical)", () => {
  it("transitions loading → ready when queryFn resolves with data", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData({ queryKey: ["pd-ready"], queryFn: async () => [{ id: "a" }] }),
      { wrapper: Wrapper },
    );
    expect(result.current.state).toBe("loading");
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.isReady).toBe(true);
    expect(result.current.data).toEqual([{ id: "a" }]);
  });

  it("transitions loading → empty for empty arrays", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData({ queryKey: ["pd-empty"], queryFn: async () => [] }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.state).toBe("empty"));
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  it("transitions loading → empty for null result", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData({ queryKey: ["pd-null"], queryFn: async () => null as any }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.state).toBe("empty"));
  });

  it("transitions loading → empty for empty objects", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData({ queryKey: ["pd-obj"], queryFn: async () => ({}) }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.state).toBe("empty"));
  });

  it("transitions loading → error and exposes the error", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData({
        queryKey: ["pd-err"],
        queryFn: async () => { throw new Error("boom"); },
      }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe("boom");
  });

  it("respects custom emptyCheck override", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => usePageData<{ items: number[] }>({
        queryKey: ["pd-custom-empty"],
        queryFn: async () => ({ items: [] }),
        emptyCheck: (d) => d.items.length === 0,
      }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.state).toBe("empty"));
  });
});

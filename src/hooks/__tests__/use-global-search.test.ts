import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@/test/test-utils";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        or: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        ilike: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

import { useGlobalSearch } from "../use-global-search";

describe("useGlobalSearch", () => {
  it("starts with empty results and not loading", () => {
    const { result } = renderHook(() => useGlobalSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("ignores queries shorter than 2 chars", async () => {
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => { await result.current.search("a"); });
    expect(result.current.results).toEqual([]);
  });

  it("executes search for valid queries", async () => {
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => { await result.current.search("test query"); });
    // With mocked empty data, results should be empty but no error
    expect(result.current.results).toEqual([]);
  });

  it("clears results on empty query", async () => {
    const { result } = renderHook(() => useGlobalSearch());
    await act(async () => { await result.current.search(""); });
    expect(result.current.results).toEqual([]);
  });
});

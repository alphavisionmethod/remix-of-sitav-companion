// ═══════════════════════════════════════════════════════════════
// Phase 7.4 — useConciergeProofTrail
// Verifies the hook's two modes (domain-level + entity-level), the
// three-query strategy, prefix filtering, dedupe, and ordering.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

type Row = Record<string, unknown>;
const containsCalls: Array<Record<string, unknown>> = [];
const likeCalls: string[] = [];
const containsResults: Row[][] = [];
const likeResults: Row[][] = [];

vi.mock("@/integrations/supabase/client", () => {
  const containsChain = (rowsForCall: () => Row[]) => ({
    contains: (_col: string, val: Record<string, unknown>) => {
      containsCalls.push(val);
      return containsChain(rowsForCall);
    },
    order: () => containsChain(rowsForCall),
    limit: () => Promise.resolve({ data: rowsForCall(), error: null }),
  });
  const likeChain = (rowsForCall: () => Row[]) => ({
    like: (_col: string, expr: string) => {
      likeCalls.push(expr);
      return likeChain(rowsForCall);
    },
    order: () => likeChain(rowsForCall),
    limit: () => Promise.resolve({ data: rowsForCall(), error: null }),
  });
  return {
    supabase: {
      from: () => ({
        select: () => {
          // The first call from the hook either uses .like (domain mode) or
          // .contains (entity mode). We expose both chains; whichever the
          // hook calls first wins.
          const wrapper: any = {};
          wrapper.like = (col: string, expr: string) => {
            const c = likeChain(() => likeResults.shift() ?? []);
            return c.like(col, expr);
          };
          wrapper.contains = (col: string, v: Record<string, unknown>) => {
            const c = containsChain(() => containsResults.shift() ?? []);
            return c.contains(col, v);
          };
          return wrapper;
        },
      }),
    },
  };
});

import { useConciergeProofTrail } from "@/hooks/use-concierge-proof-trail";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  containsCalls.length = 0;
  likeCalls.length = 0;
  containsResults.length = 0;
  likeResults.length = 0;
});

describe("useConciergeProofTrail (Phase 7.4)", () => {
  it("domain mode — issues a single LIKE query scoped to `concierge.%`", async () => {
    likeResults.push([]);
    const { result } = renderHook(() => useConciergeProofTrail(), {
      wrapper: wrapper(),
    });
    await waitFor(() => !result.current.isLoading);
    expect(likeCalls).toEqual(["concierge.%"]);
    expect(containsCalls).toHaveLength(0);
  });

  it("domain mode — projects rows into ProofEntry shape", async () => {
    likeResults.push([
      {
        id: "r1",
        action_type: "concierge.errand.create",
        recommendation_summary: "Created errand",
        status: "executed",
        action_payload: { args: { title: "Dry cleaning" } },
        metadata: { summary: "Created errand" },
        created_at: "2026-04-27T12:00:00Z",
      },
    ]);
    const { result } = renderHook(() => useConciergeProofTrail(), {
      wrapper: wrapper(),
    });
    await waitFor(() => result.current.data !== undefined);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].action).toBe("created");
    expect(result.current.data?.[0].source).toBe("concierge.errand.create");
  });

  it("entity mode — issues three filtered queries (entity_ref / related / legacy)", async () => {
    containsResults.push([], [], []);
    const { result } = renderHook(
      () => useConciergeProofTrail({ entityType: "grocery_list", entityId: "l1" }),
      { wrapper: wrapper() },
    );
    await waitFor(() => !result.current.isLoading);
    expect(containsCalls).toHaveLength(3);
    expect(containsCalls[0]).toEqual({
      entity_ref: { entity_id: "l1", entity_type: "grocery_list" },
    });
    expect(containsCalls[1]).toEqual({
      entity_ref: { related: { list_id: "l1" } },
    });
    expect(containsCalls[2]).toEqual({ args: { id: "l1" } });
  });

  it("entity mode — uses provider_id as the related key for providers", async () => {
    containsResults.push([], [], []);
    const { result } = renderHook(
      () => useConciergeProofTrail({ entityType: "provider", entityId: "p1" }),
      { wrapper: wrapper() },
    );
    await waitFor(() => !result.current.isLoading);
    expect(containsCalls[1]).toEqual({
      entity_ref: { related: { provider_id: "p1" } },
    });
  });

  it("entity mode — filters out non-concierge prefixes (defence-in-depth)", async () => {
    containsResults.push(
      [
        {
          id: "ok",
          action_type: "concierge.errand.update",
          recommendation_summary: "ok",
          status: "executed",
          action_payload: { args: { id: "e1" } },
          metadata: {},
          created_at: "2026-04-27T12:00:00Z",
        },
        {
          id: "noise",
          action_type: "finance.envelope.allocation_change",
          recommendation_summary: "noise",
          status: "executed",
          action_payload: {},
          metadata: {},
          created_at: "2026-04-27T12:00:00Z",
        },
      ],
      [],
      [],
    );
    const { result } = renderHook(
      () => useConciergeProofTrail({ entityType: "errand", entityId: "e1" }),
      { wrapper: wrapper() },
    );
    await waitFor(() => result.current.data !== undefined);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe("ok");
  });

  it("entity mode — dedupes rows that appear in multiple queries", async () => {
    const dup = {
      id: "dup",
      action_type: "concierge.errand.update",
      recommendation_summary: "u",
      status: "executed",
      action_payload: { args: { id: "e1" } },
      metadata: {},
      created_at: "2026-04-27T12:00:00Z",
    };
    containsResults.push([dup], [dup], [dup]);
    const { result } = renderHook(
      () => useConciergeProofTrail({ entityType: "errand", entityId: "e1" }),
      { wrapper: wrapper() },
    );
    await waitFor(() => result.current.data !== undefined);
    expect(result.current.data).toHaveLength(1);
  });

  it("entity mode — orders entries newest-first", async () => {
    containsResults.push(
      [
        {
          id: "old",
          action_type: "concierge.errand.update",
          recommendation_summary: "old",
          status: "executed",
          action_payload: { args: { id: "e1" } },
          metadata: {},
          created_at: "2026-04-20T12:00:00Z",
        },
        {
          id: "new",
          action_type: "concierge.errand.update",
          recommendation_summary: "new",
          status: "executed",
          action_payload: { args: { id: "e1" } },
          metadata: {},
          created_at: "2026-04-27T12:00:00Z",
        },
      ],
      [],
      [],
    );
    const { result } = renderHook(
      () => useConciergeProofTrail({ entityType: "errand", entityId: "e1" }),
      { wrapper: wrapper() },
    );
    await waitFor(() => result.current.data !== undefined);
    expect(result.current.data?.map((e) => e.id)).toEqual(["new", "old"]);
  });

  it("respects the `enabled=false` option", async () => {
    const { result } = renderHook(
      () => useConciergeProofTrail({ enabled: false }),
      { wrapper: wrapper() },
    );
    expect(result.current.data).toBeUndefined();
    expect(likeCalls).toHaveLength(0);
    expect(containsCalls).toHaveLength(0);
  });
});

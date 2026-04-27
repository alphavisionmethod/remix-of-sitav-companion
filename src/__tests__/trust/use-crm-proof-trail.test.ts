// ═══════════════════════════════════════════════════════════════
// Phase 7.2 — useCRMEntityProofTrail
// Verifies the hook's three-query strategy (entity_ref / related /
// legacy args.id), prefix filtering, dedupe, projection, and ordering.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// ── Mock the supabase chain. The hook uses:
//   supabase.from(t).select(s).contains(c, v).order(...).limit(n)
// We capture every `contains()` argument so we can assert the three
// distinct filter shapes.

type Row = Record<string, unknown>;
const containsCalls: Array<Record<string, unknown>> = [];
const containsResults: Row[][] = [];

vi.mock("@/integrations/supabase/client", () => {
  const chain = (rowsForCall: () => Row[]) => ({
    contains: (_col: string, val: Record<string, unknown>) => {
      containsCalls.push(val);
      return chain(rowsForCall);
    },
    order: () => chain(rowsForCall),
    limit: () => Promise.resolve({ data: rowsForCall(), error: null }),
  });
  return {
    supabase: {
      from: () => ({
        select: () =>
          chain(() => containsResults.shift() ?? []),
      }),
    },
  };
});

import { useCRMEntityProofTrail } from "@/hooks/use-crm-proof-trail";

function wrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  containsCalls.length = 0;
  containsResults.length = 0;
});

describe("useCRMEntityProofTrail (Phase 7.2)", () => {
  it("does not fetch when entityId is null", async () => {
    const { result } = renderHook(
      () => useCRMEntityProofTrail("contact", null),
      { wrapper: wrapper() },
    );
    // Query is disabled — data stays undefined and no contains() ran.
    expect(result.current.data).toBeUndefined();
    expect(containsCalls).toHaveLength(0);
  });

  it("issues exactly three filtered queries: entity_ref, related, legacy", async () => {
    containsResults.push([], [], []); // primary, related, legacy
    const { result } = renderHook(
      () => useCRMEntityProofTrail("contact", "c1"),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(containsCalls).toHaveLength(3);
    expect(containsCalls[0]).toEqual({
      entity_ref: { entity_id: "c1", entity_type: "contact" },
    });
    expect(containsCalls[1]).toEqual({
      entity_ref: { related: { contact_id: "c1" } },
    });
    expect(containsCalls[2]).toEqual({ args: { id: "c1" } });
  });

  it("uses opportunity_id as the related key for deals", async () => {
    containsResults.push([], [], []);
    const { result } = renderHook(
      () => useCRMEntityProofTrail("deal", "o1"),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(containsCalls[0]).toEqual({
      entity_ref: { entity_id: "o1", entity_type: "deal" },
    });
    expect(containsCalls[1]).toEqual({
      entity_ref: { related: { opportunity_id: "o1" } },
    });
  });

  it("filters out rows whose action_type does not match the entity prefix", async () => {
    containsResults.push(
      [
        {
          id: "r1",
          action_type: "crm.contact.create",
          recommendation_summary: "ok",
          status: "executed",
          action_payload: { id: "c1" },
          metadata: {},
          created_at: "2026-04-27T12:00:00Z",
        },
        {
          id: "r2",
          action_type: "finance.envelope.allocation_change", // unrelated
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
      () => useCRMEntityProofTrail("contact", "c1"),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].action).toBe("created");
  });

  it("dedupes rows that appear in more than one of the three queries", async () => {
    const dup = {
      id: "r-dup",
      action_type: "crm.contact.update",
      recommendation_summary: "u",
      status: "executed",
      action_payload: { id: "c1" },
      metadata: {},
      created_at: "2026-04-27T12:00:00Z",
    };
    containsResults.push([dup], [dup], [dup]);
    const { result } = renderHook(
      () => useCRMEntityProofTrail("contact", "c1"),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns entries newest-first", async () => {
    containsResults.push(
      [
        {
          id: "old",
          action_type: "crm.contact.update",
          recommendation_summary: "old",
          status: "executed",
          action_payload: { id: "c1" },
          metadata: {},
          created_at: "2026-04-20T12:00:00Z",
        },
        {
          id: "new",
          action_type: "crm.contact.update",
          recommendation_summary: "new",
          status: "executed",
          action_payload: { id: "c1" },
          metadata: {},
          created_at: "2026-04-27T12:00:00Z",
        },
      ],
      [],
      [],
    );
    const { result } = renderHook(
      () => useCRMEntityProofTrail("contact", "c1"),
      { wrapper: wrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((e) => e.id)).toEqual(["new", "old"]);
  });

  it("respects the `enabled=false` option", async () => {
    const { result } = renderHook(
      () => useCRMEntityProofTrail("contact", "c1", { enabled: false }),
      { wrapper: wrapper() },
    );
    expect(result.current.data).toBeUndefined();
    expect(containsCalls).toHaveLength(0);
  });
});
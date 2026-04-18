// ═══════════════════════════════════════════════════════════════
// SITA OS — Files Data Service Honesty Tests
// Verifies that authenticated users see their REAL data (including
// honest empty arrays) and never get silently swapped to mock fixtures.
// Closes audit finding C-006.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  const ordered = vi.fn();
  const eqStatus = vi.fn(() => ({ order: ordered }));
  const eq = vi.fn((..._args: any[]) => ({ order: ordered, eq: eqStatus, in: vi.fn(() => ({ order: ordered })) }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const supabase = {
    from,
    auth: { getUser: vi.fn() },
    storage: { from: vi.fn() },
  };
  return { supabase, __mocks__: { ordered, from, select, eq, eqStatus } };
});

import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllFiles,
  fetchFilesOverview,
  fetchFilesProcessing,
} from "@/data/repositories/files-data-service";

const mocks = (supabase as any);

describe("files-data-service — honesty contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchAllFiles returns [] for authenticated user with zero rows (no mock fallback)", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    const fromChain = mocks.from();
    fromChain.select().eq().order.mockResolvedValue({ data: [], error: null });

    const result = await fetchAllFiles();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("fetchFilesOverview returns [] for authenticated user with zero rows (no mock fallback)", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    const fromChain = mocks.from();
    fromChain.select().eq().order.mockResolvedValue({ data: [], error: null });

    const result = await fetchFilesOverview();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("fetchFilesProcessing returns [] for authenticated user with zero rows (no mock fallback)", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    const fromChain = mocks.from();
    fromChain.select().eq().eq().order.mockResolvedValue({ data: [], error: null });

    const result = await fetchFilesProcessing();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("fetchAllFiles returns [] when unauthenticated (no demo leakage into protected list)", async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await fetchAllFiles();

    expect(result).toEqual([]);
  });
});

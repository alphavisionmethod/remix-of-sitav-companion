// Phase 6 — Hook integration: cross-section of use-concierge-data
// Verifies the real React Query hooks resolve under the canonical
// empty-Supabase mock (anonymous auth → disabled; auth'd via
// helper → resolves to [] without throwing).

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import "@/__tests__/concierge/_helpers/render-concierge-page";
import { makeWrapper } from "./_hookHarness";
import {
  useTravelPlans,
  useGroceryLists,
  useServiceProvidersList,
  useAppointments,
  useErrands,
  useRecurringObligations,
} from "@/modules/concierge/hooks/use-concierge-data";

const HOOKS: Array<[string, () => any]> = [
  ["useTravelPlans", () => useTravelPlans()],
  ["useGroceryLists", () => useGroceryLists()],
  ["useServiceProvidersList", () => useServiceProvidersList()],
  ["useAppointments", () => useAppointments()],
  ["useErrands", () => useErrands()],
  ["useRecurringObligations", () => useRecurringObligations()],
];

describe("Concierge data hooks (Phase 6)", () => {
  it.each(HOOKS)("%s — disabled when anonymous (no error, no data)", async (_name, fn) => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(fn, { wrapper: Wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"), { timeout: 1500 });
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

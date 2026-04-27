// Phase 5 — page-state honesty: HouseholdCommandCenter
// Verifies the real page mounts under the canonical empty-Supabase
// mock and surfaces an explicit empty-state grammar (SectionSkeleton
// during fetch + EmptyState after).
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import HouseholdCommandCenter from "@/modules/concierge/pages/HouseholdCommandCenter";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — HouseholdCommandCenter (Phase 5)", () => {
  it("renders honest empty/loading state with empty backend", async () => {
    const { container } = renderConciergePage(<HouseholdCommandCenter />);
    // Either skeleton (initial) or EmptyState ("No households yet")
    expectHonestStateSignal(container, /Household|No households yet|Create Household/i);
  });
});

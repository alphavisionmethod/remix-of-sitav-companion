// Phase 5 — page-state honesty: FamilyCalendar
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import FamilyCalendar from "@/modules/concierge/pages/FamilyCalendar";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — FamilyCalendar (Phase 5)", () => {
  it("mounts and renders calendar shell + truth banner", () => {
    const { container } = renderConciergePage(<FamilyCalendar />);
    expectHonestStateSignal(container, /Family|Calendar|This Week|Conflicts|Prep/i);
  });
});

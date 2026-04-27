// Phase 5 — page-state honesty: LifeAdminCenter
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import LifeAdminCenter from "@/modules/concierge/pages/LifeAdminCenter";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — LifeAdminCenter (Phase 5)", () => {
  it("renders honest empty PremiumEmptyState for unauthenticated/empty backend", () => {
    const { container } = renderConciergePage(<LifeAdminCenter />);
    expectHonestStateSignal(container, /Life Admin|life-admin|No life-admin items|Sign in/i);
  });
});

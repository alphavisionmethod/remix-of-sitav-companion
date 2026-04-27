// Phase 5 — page-state honesty: AppointmentsPrep
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import AppointmentsPrep from "@/modules/concierge/pages/AppointmentsPrep";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — AppointmentsPrep (Phase 5)", () => {
  it("renders honest empty grammar with empty backend", () => {
    const { container } = renderConciergePage(<AppointmentsPrep />);
    expectHonestStateSignal(container, /Appointments|No appointments|schedule is clear/i);
  });
});

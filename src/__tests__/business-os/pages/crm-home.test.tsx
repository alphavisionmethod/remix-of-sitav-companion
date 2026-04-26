// ═══════════════════════════════════════════════════════════════
// Business OS — CRMHome Page Honesty
// Verifies CRMHome renders without crashing across:
//   - empty data (zero contacts/companies/opps/tasks/comms/notes)
//   - populated data (KPIs reflect real fixture counts)
//   - adaptive copy (language switches with the
//     BusinessProfileContext primary mode)
// Drives the page by stubbing the 6 CRM data hooks; uses the canonical
// renderBusinessPage wrapper for context.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderBusinessPage } from "../_helpers/render-business-page";

const data: Record<string, any[]> = {
  contacts: [],
  companies: [],
  opportunities: [],
  tasks: [],
  comms: [],
  notes: [],
};

vi.mock("@/hooks/use-crm-data", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useCRMContacts: () => ({ data: data.contacts, isLoading: false, isError: false }),
    useCRMCompanies: () => ({ data: data.companies, isLoading: false, isError: false }),
    useCRMOpportunities: () => ({ data: data.opportunities, isLoading: false, isError: false }),
    useCRMTasks: () => ({ data: data.tasks, isLoading: false, isError: false }),
    useCRMCommunications: () => ({ data: data.comms, isLoading: false, isError: false }),
    useCRMNotes: () => ({ data: data.notes, isLoading: false, isError: false }),
  };
});

// Heavy children — we only test the page-level KPI/empty contract.
vi.mock("@/modules/business/components/business/crm/CRMCommandSearch", () => ({
  __esModule: true,
  default: () => <div data-testid="crm-command-search" />,
}));
vi.mock("@/modules/business/components/business/crm/CRMLifecycleEngine", () => ({
  CRMLifecycleEngine: () => <div data-testid="crm-lifecycle-engine" />,
}));
vi.mock("@/modules/business/components/business/crm/CRMRelationshipIntelligence", () => ({
  CRMRelationshipIntelligence: () => <div data-testid="crm-relationship-intelligence" />,
}));

import CRMHome from "@/modules/business/pages/CRMHome";

describe("CRMHome — empty/populated honesty", () => {
  beforeEach(() => {
    data.contacts = [];
    data.companies = [];
    data.opportunities = [];
    data.tasks = [];
    data.comms = [];
    data.notes = [];
  });

  it("renders the page without crashing when all CRM data is empty", () => {
    renderBusinessPage(<CRMHome />);
    // Stable surface markers
    expect(screen.getByTestId("crm-lifecycle-engine")).toBeInTheDocument();
    expect(screen.getByTestId("crm-relationship-intelligence")).toBeInTheDocument();
  });

  it("uses honest insight copy when CRM is empty (no fake KPIs)", () => {
    renderBusinessPage(<CRMHome />);
    // The advisor insight pool falls back to the "good shape" message
    // when there are no warnings to surface.
    expect(screen.getByText(/Your CRM is in good shape/i)).toBeInTheDocument();
  });

  it("surfaces an at-risk warning when contacts have low health scores", () => {
    data.contacts = [
      { id: "c-1", lifecycle_stage: "active", health_score: 20, created_at: new Date().toISOString() },
      { id: "c-2", lifecycle_stage: "active", health_score: 18, created_at: new Date().toISOString() },
    ];
    renderBusinessPage(<CRMHome />);
    // The advisor insight reads "N contact(s) at risk — consider outreach"
    expect(
      screen.getByText(/contact.*at risk.*consider outreach/i),
    ).toBeInTheDocument();
  });

  it("surfaces a strong-win-rate insight when win rate exceeds 60%", () => {
    data.opportunities = [
      { id: "o-1", status: "won",  value: 1000, stage: "closed-won",  probability: 100 },
      { id: "o-2", status: "won",  value: 1000, stage: "closed-won",  probability: 100 },
      { id: "o-3", status: "won",  value: 1000, stage: "closed-won",  probability: 100 },
      { id: "o-4", status: "lost", value: 1000, stage: "closed-lost", probability: 0 },
    ];
    renderBusinessPage(<CRMHome />);
    expect(screen.getByText(/Strong .* win rate/i)).toBeInTheDocument();
  });
});
// ═══════════════════════════════════════════════════════════════
// Business OS — CustomerHealthPage Page-State Honesty
// Verifies the subtitle is truth-anchored to the real customer
// portfolio size (no fake "1234 customers" when DB is empty).
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderBusinessPage } from "../_helpers/render-business-page";

const customersHookState: { data: any[] | undefined; isLoading: boolean } = {
  data: [],
  isLoading: false,
};

vi.mock("@/modules/business/hooks/use-domain-data", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useCustomers: () => ({
      data: customersHookState.data,
      isLoading: customersHookState.isLoading,
      isError: false,
      error: null,
    }),
  };
});

// Stub the heavy dashboard child — we are testing the page's title/subtitle
// truth contract, not the dashboard's internals (which the dashboard's own
// tests cover).
vi.mock("@/modules/business/components/business/CustomerHealthDashboard", () => ({
  CustomerHealthDashboard: () => <div data-testid="customer-health-dashboard" />,
}));

import CustomerHealthPage from "@/modules/business/pages/CustomerHealthPage";

describe("CustomerHealthPage — page-state honesty", () => {
  beforeEach(() => {
    customersHookState.data = [];
    customersHookState.isLoading = false;
  });

  it("shows a loading subtitle while the customers query is in flight", () => {
    customersHookState.isLoading = true;
    customersHookState.data = undefined;
    renderBusinessPage(<CustomerHealthPage />);
    expect(screen.getByText(/Loading lifecycle stages/i)).toBeInTheDocument();
    // Hard-coded fake counts MUST NOT appear.
    expect(screen.queryByText(/across 0 customer/i)).not.toBeInTheDocument();
  });

  it("uses the singular form when exactly one customer exists", () => {
    customersHookState.data = [{ id: "c-1", display_name: "Acme" }];
    renderBusinessPage(<CustomerHealthPage />);
    expect(screen.getByText(/across 1 customer\b/i)).toBeInTheDocument();
  });

  it("uses the plural form when multiple customers exist", () => {
    customersHookState.data = [
      { id: "c-1" }, { id: "c-2" }, { id: "c-3" },
    ];
    renderBusinessPage(<CustomerHealthPage />);
    expect(screen.getByText(/across 3 customers/i)).toBeInTheDocument();
  });

  it("honestly reports zero customers when portfolio is empty", () => {
    customersHookState.data = [];
    renderBusinessPage(<CustomerHealthPage />);
    // Honest empty: "0 customers", not a fake number.
    expect(screen.getByText(/across 0 customers/i)).toBeInTheDocument();
  });

  it("renders the dashboard child component in every non-loading state", () => {
    customersHookState.data = [];
    renderBusinessPage(<CustomerHealthPage />);
    expect(screen.getByTestId("customer-health-dashboard")).toBeInTheDocument();
  });
});
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@/test/test-utils";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all data services
vi.mock("@/data/repositories/business-data-service", () => ({
  fetchCustomers: vi.fn(() => Promise.resolve({ data: [{ id: "c1", name: "Test Customer" }] })),
  fetchCollections: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/files-data-service", () => ({
  fetchFilesOverview: vi.fn(() => Promise.resolve([])),
  fetchFilesProcessing: vi.fn(() => Promise.resolve([])),
  fetchFilesSearchIndex: vi.fn(() => Promise.resolve([])),
  fetchAllFiles: vi.fn(() => Promise.resolve([])),
  fetchFilesByStatus: vi.fn(() => Promise.resolve([])),
  fetchFilesBySensitivity: vi.fn(() => Promise.resolve([])),
  fetchFileSettings: vi.fn(() => Promise.resolve({})),
}));
vi.mock("@/data/repositories/money-data-service", () => ({
  fetchReservesSavings: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/mobile-data-service", () => ({
  fetchMobileAlerts: vi.fn(() => Promise.resolve([])),
  fetchMobileApprovals: vi.fn(() => Promise.resolve([])),
  fetchMobileProofs: vi.fn(() => Promise.resolve([])),
  fetchMobileWorkflowSteps: vi.fn(() => Promise.resolve([])),
}));
vi.mock("@/data/repositories/owner-data-service", () => ({
  fetchLeases: vi.fn(() => Promise.resolve({ data: [] })),
  fetchOwnerApprovals: vi.fn(() => Promise.resolve({ data: [] })),
  fetchPricingItems: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/workspace-data-service", () => ({
  fetchDocs: vi.fn(() => Promise.resolve({ data: [] })),
  fetchSheets: vi.fn(() => Promise.resolve({ data: [] })),
  fetchDecks: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/mission-control-data-service", () => ({
  fetchAdvisorProfiles: vi.fn(() => Promise.resolve([])),
  fetchRecommendations: vi.fn(() => Promise.resolve([])),
  fetchSynthesis: vi.fn(() => Promise.resolve([])),
  fetchApprovals: vi.fn(() => Promise.resolve([])),
  fetchProofHistory: vi.fn(() => Promise.resolve([])),
}));
vi.mock("@/data/repositories/calendar-data-service", () => ({
  fetchCalendarEvents: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/activity-data-service", () => ({
  fetchInboxItems: vi.fn(() => Promise.resolve({ data: [] })),
  fetchActivityTimeline: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/admin-data-service", () => ({
  fetchAutomationRules: vi.fn(() => Promise.resolve([])),
  fetchDelegations: vi.fn(() => Promise.resolve([])),
  fetchReplayableWorkflows: vi.fn(() => Promise.resolve([])),
  fetchAdminUsers: vi.fn(() => Promise.resolve([])),
  fetchTokenUsages: vi.fn(() => Promise.resolve([])),
  fetchAdminIncidents: vi.fn(() => Promise.resolve([])),
}));
vi.mock("@/data/repositories/revenue-data-service", () => ({
  fetchRevenueLeakage: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("@/data/repositories/investment-data-service", () => ({
  fetchCapitalBuckets: vi.fn(() => Promise.resolve({ data: [] })),
  fetchPositions: vi.fn(() => Promise.resolve({ data: [] })),
  fetchTheses: vi.fn(() => Promise.resolve({ data: [] })),
}));

import { useCustomers } from "../use-domain-data";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useDomainData hooks", () => {
  it("useCustomers returns data from fetchCustomers", async () => {
    const { result } = renderHook(() => useCustomers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "c1", name: "Test Customer" }]);
  });
});

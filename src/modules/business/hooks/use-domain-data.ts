import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealityProvider } from "@/hooks/useRealityProvider";
import { useDataMode } from "@/contexts/DataModeContext";
import { fetchCustomers, fetchCollections } from "@/data/repositories/business-data-service";
import { fetchFilesOverview, fetchFilesProcessing, fetchFilesSearchIndex, fetchAllFiles, fetchFilesByStatus, fetchFilesBySensitivity, fetchFileSettings } from "@/data/repositories/files-data-service";
import {
  fetchReservesSavings, fetchFinancialAccounts, fetchMoneyPolicies, fetchMoneyApprovals,
  fetchMoneyProof, fetchFinancialDocuments, fetchCashTimingWindows, fetchMoneyKPIs,
  toggleMoneyPolicy, approveMoneyAction, rejectMoneyAction,
  createFinancialAccount, updateFinancialAccount, deleteFinancialAccount,
  createMoneyPolicy, updateMoneyPolicy, deleteMoneyPolicy,
} from "@/data/repositories/money-data-service";
import { fetchMobileAlerts, fetchMobileApprovals, fetchMobileProofs, fetchMobileWorkflowSteps } from "@/data/repositories/mobile-data-service";
import { fetchLeases, fetchOwnerApprovals, fetchPricingItems } from "@/data/repositories/owner-data-service";
import { fetchDocs, fetchSheets, fetchDecks } from "@/data/repositories/workspace-data-service";
import { fetchAdvisorProfiles, fetchRecommendations, fetchSynthesis, fetchApprovals, fetchProofHistory } from "@/data/repositories/mission-control-data-service";
import { fetchCalendarEvents } from "@/data/repositories/calendar-data-service";
import { fetchInboxItems, fetchActivityTimeline } from "@/data/repositories/activity-data-service";
import { fetchAutomationRules, fetchDelegations, fetchReplayableWorkflows, fetchAdminUsers, fetchTokenUsages, fetchAdminIncidents } from "@/data/repositories/admin-data-service";
import { fetchRevenueLeakage } from "@/data/repositories/revenue-data-service";
import { fetchCapitalBuckets, fetchPositions, fetchTheses } from "@/data/repositories/investment-data-service";

// Helper: unwrap ModeAwareResult to just the data for backward compat
const unwrap = async (fn: (...args: any[]) => Promise<{ data: any }>, ...args: any[]): Promise<any> => {
  const result = await fn(...args);
  return result.data;
};

// Business
export function useCustomers() {
  const { isDemoMode } = useDataMode();
  const mode = isDemoMode ? "demo" : "real";
  return useQuery({ queryKey: ["customers", mode], queryFn: () => unwrap(fetchCustomers, mode) });
}
export function useCollectionsAccounts() { return useQuery({ queryKey: ["collections-accounts"], queryFn: () => unwrap(fetchCollections) }); }

// Files
export function useFilesOverview() { return useQuery({ queryKey: ["files-overview"], queryFn: fetchFilesOverview }); }
export function useFilesProcessing() { return useQuery({ queryKey: ["files-processing"], queryFn: fetchFilesProcessing }); }
export function useFilesSearchIndex() { return useQuery({ queryKey: ["files-search-index"], queryFn: fetchFilesSearchIndex }); }
export function useAllFiles() { return useQuery({ queryKey: ["all-files"], queryFn: fetchAllFiles }); }
export function useFilesByStatus(status: string) { return useQuery({ queryKey: ["files-by-status", status], queryFn: () => fetchFilesByStatus(status) }); }
export function useFilesBySensitivity(sensitivities: string[]) { return useQuery({ queryKey: ["files-by-sensitivity", sensitivities], queryFn: () => fetchFilesBySensitivity(sensitivities) }); }
export function useFileSettings() { return useQuery({ queryKey: ["file-settings"], queryFn: fetchFileSettings }); }

// Money
export function useReservesSavings() { return useQuery({ queryKey: ["reserves-savings"], queryFn: () => unwrap(fetchReservesSavings) }); }
export function useFinancialAccounts() { return useQuery({ queryKey: ["financial-accounts"], queryFn: () => unwrap(fetchFinancialAccounts) }); }
export function useMoneyPolicies() { return useQuery({ queryKey: ["money-policies"], queryFn: () => unwrap(fetchMoneyPolicies) }); }
export function useMoneyApprovals() { return useQuery({ queryKey: ["money-approvals"], queryFn: () => unwrap(fetchMoneyApprovals) }); }
export function useMoneyProofItems() { return useQuery({ queryKey: ["money-proof"], queryFn: () => unwrap(fetchMoneyProof) }); }
export function useFinancialDocuments() { return useQuery({ queryKey: ["financial-documents"], queryFn: () => unwrap(fetchFinancialDocuments) }); }
export function useCashTimingWindows() { return useQuery({ queryKey: ["cash-timing-windows"], queryFn: () => unwrap(fetchCashTimingWindows) }); }
export function useMoneyKPIs() { return useQuery({ queryKey: ["money-kpis"], queryFn: () => unwrap(fetchMoneyKPIs) }); }

// Money mutations
export function useToggleMoneyPolicy() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleMoneyPolicy(id, enabled), onSuccess: () => qc.invalidateQueries({ queryKey: ["money-policies"] }) });
}
export function useApproveMoneyAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => approveMoneyAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["money-approvals"] }) });
}
export function useRejectMoneyAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => rejectMoneyAction(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["money-approvals"] }) });
}
export function useCreateFinancialAccount() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createFinancialAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ["financial-accounts"] }) });
}
export function useDeleteFinancialAccount() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteFinancialAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ["financial-accounts"] }) });
}
export function useCreateMoneyPolicy() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createMoneyPolicy, onSuccess: () => qc.invalidateQueries({ queryKey: ["money-policies"] }) });
}
export function useDeleteMoneyPolicy() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteMoneyPolicy, onSuccess: () => qc.invalidateQueries({ queryKey: ["money-policies"] }) });
}

// Mobile
export function useMobileAlerts() { return useQuery({ queryKey: ["mobile-alerts"], queryFn: fetchMobileAlerts }); }
export function useMobileApprovals() { return useQuery({ queryKey: ["mobile-approvals"], queryFn: fetchMobileApprovals }); }
export function useMobileProofs() { return useQuery({ queryKey: ["mobile-proofs"], queryFn: fetchMobileProofs }); }
export function useMobileWorkflowSteps() { return useQuery({ queryKey: ["mobile-workflow-steps"], queryFn: fetchMobileWorkflowSteps }); }

// Owner
export function useLeases() { return useQuery({ queryKey: ["leases"], queryFn: () => unwrap(fetchLeases) }); }
export function useOwnerApprovals() { return useQuery({ queryKey: ["owner-approvals"], queryFn: () => unwrap(fetchOwnerApprovals) }); }
export function usePricingItems() { return useQuery({ queryKey: ["pricing-items"], queryFn: () => unwrap(fetchPricingItems) }); }

// Workspace
export function useDocs() { return useQuery({ queryKey: ["workspace-docs"], queryFn: () => unwrap(fetchDocs) }); }
export function useSheets() { return useQuery({ queryKey: ["workspace-sheets"], queryFn: () => unwrap(fetchSheets) }); }
export function useDecks() { return useQuery({ queryKey: ["workspace-decks"], queryFn: () => unwrap(fetchDecks) }); }

// Mission Control / Advisors
export function useAdvisorProfiles() { return useQuery({ queryKey: ["advisor-profiles"], queryFn: fetchAdvisorProfiles }); }
export function useAdvisorRecommendations() { return useQuery({ queryKey: ["advisor-recommendations"], queryFn: fetchRecommendations }); }
export function useAdvisorSynthesis() { return useQuery({ queryKey: ["advisor-synthesis"], queryFn: fetchSynthesis }); }
export function useAdvisorApprovals() { return useQuery({ queryKey: ["advisor-approvals"], queryFn: fetchApprovals }); }
export function useProofHistory() { return useQuery({ queryKey: ["proof-history"], queryFn: fetchProofHistory }); }

// Calendar
export function useCalendarEvents(year: number, month: number) { return useQuery({ queryKey: ["calendar-events", year, month], queryFn: () => unwrap(() => fetchCalendarEvents(year, month)) }); }

// Activity
export function useInboxItems() { return useQuery({ queryKey: ["inbox-items"], queryFn: () => unwrap(fetchInboxItems) }); }
export function useActivityTimeline() { return useQuery({ queryKey: ["activity-timeline"], queryFn: () => unwrap(fetchActivityTimeline) }); }

// Admin
export function useAutomationRules() { return useQuery({ queryKey: ["automation-rules"], queryFn: fetchAutomationRules }); }
export function useDelegations() { return useQuery({ queryKey: ["delegations"], queryFn: fetchDelegations }); }
export function useReplayableWorkflows() { return useQuery({ queryKey: ["replayable-workflows"], queryFn: fetchReplayableWorkflows }); }
export function useAdminUsers() { return useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers }); }
export function useTokenUsages() { return useQuery({ queryKey: ["token-usages"], queryFn: fetchTokenUsages }); }
export function useAdminIncidents() { return useQuery({ queryKey: ["admin-incidents"], queryFn: fetchAdminIncidents }); }

// Revenue
export function useRevenueLeakage() { return useQuery({ queryKey: ["revenue-leakage"], queryFn: () => unwrap(fetchRevenueLeakage) }); }

// Investment
export function useCapitalBuckets() { return useQuery({ queryKey: ["capital-buckets"], queryFn: () => unwrap(fetchCapitalBuckets) }); }
export function usePositions() { return useQuery({ queryKey: ["positions"], queryFn: () => unwrap(fetchPositions) }); }
export function useTheses() { return useQuery({ queryKey: ["theses"], queryFn: () => unwrap(fetchTheses) }); }

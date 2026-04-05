import { useQuery } from "@tanstack/react-query";
import { fetchCustomers, fetchCollections } from "@/lib/data-services/business-data-service";
import { fetchFilesOverview, fetchFilesProcessing, fetchFilesSearchIndex, fetchAllFiles, fetchFilesByStatus, fetchFilesBySensitivity, fetchFileSettings } from "@/lib/data-services/files-data-service";
import { fetchReservesSavings } from "@/lib/data-services/money-data-service";
import { fetchMobileAlerts, fetchMobileApprovals, fetchMobileProofs, fetchMobileWorkflowSteps } from "@/lib/data-services/mobile-data-service";
import { fetchLeases, fetchOwnerApprovals, fetchPricingItems } from "@/lib/data-services/owner-data-service";
import { fetchDocs, fetchSheets, fetchDecks } from "@/lib/data-services/workspace-data-service";
import { fetchAdvisorProfiles, fetchRecommendations, fetchSynthesis, fetchApprovals, fetchProofHistory } from "@/lib/data-services/mission-control-data-service";
import { fetchCalendarEvents } from "@/lib/data-services/calendar-data-service";
import { fetchInboxItems, fetchActivityTimeline } from "@/lib/data-services/activity-data-service";
import { fetchAutomationRules, fetchDelegations, fetchReplayableWorkflows, fetchAdminUsers, fetchTokenUsages, fetchAdminIncidents } from "@/lib/data-services/admin-data-service";
import { fetchRevenueLeakage } from "@/lib/data-services/revenue-data-service";
import { fetchCapitalBuckets, fetchPositions, fetchTheses } from "@/lib/data-services/investment-data-service";

// Helper: unwrap ModeAwareResult to just the data for backward compat
const unwrap = async <T,>(fn: () => Promise<{ data: T }>): Promise<T> => {
  const result = await fn();
  return result.data;
};

// Business
export function useCustomers() { return useQuery({ queryKey: ["customers"], queryFn: () => unwrap(fetchCustomers) }); }
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

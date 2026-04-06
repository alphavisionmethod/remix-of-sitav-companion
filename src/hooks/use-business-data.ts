// ═══════════════════════════════════════════════════════════════
// SITA OS — Business/Revenue React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  fetchCustomers,
  fetchDeals,
  fetchInvoices,
  fetchRevenueLeaks,
  fetchRecoveredValues,
  fetchOpportunities,
  fetchCollectionsAccounts,
  fetchCallingContacts,
} from "@/lib/data-services/business-data-service";

export function useCustomersData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["customers", isDemoMode],
    queryFn: () => fetchCustomers(isDemoMode),
  });
}

export function useDealsData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["deals", isDemoMode],
    queryFn: () => fetchDeals(isDemoMode),
  });
}

export function useInvoicesData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["invoices", isDemoMode],
    queryFn: () => fetchInvoices(isDemoMode),
  });
}

export function useRevenueLeaks() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["revenue-leaks", isDemoMode],
    queryFn: () => fetchRevenueLeaks(isDemoMode),
  });
}

export function useRecoveredValues() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["recovered-values", isDemoMode],
    queryFn: () => fetchRecoveredValues(isDemoMode),
  });
}

export function useOpportunities() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["opportunities", isDemoMode],
    queryFn: () => fetchOpportunities(isDemoMode),
  });
}

export function useCollectionsAccounts() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["collections-accounts", isDemoMode],
    queryFn: () => fetchCollectionsAccounts(isDemoMode),
  });
}

export function useCallingContacts() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["calling-contacts", isDemoMode],
    queryFn: () => fetchCallingContacts(isDemoMode),
  });
}

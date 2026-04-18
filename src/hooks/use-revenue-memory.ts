// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Memory Hooks
// React Query hooks for revenue memory domains
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { computeWhatChanged, inferGrowthDNA, assessGrowthFirewall, buildTimeMachineSnapshot, getAdvisorMemory } from "@/lib/services/finance-os/revenue-memory.service";
import { revenueAdvisorStances, revenueMemoryEvents, revenueRetentionSignals, revenueCampaigns, revenueFunnels, revenueFunnelSteps, revenueOffers, revenueOfferSales, revenueBookings, revenueReviews, revenueSegments, revenueReputationMetrics, revenueWinbackQueue, revenueExperiments, revenueExperimentVariants, revenueJourneyTouchpoints } from "@/data/repositories/revenue-ops-data-service";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

// ── Domain Data Hooks ──────────────────────────────────────────

export function useRevenueAdvisorStances() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-advisor-stances", uid],
    enabled: !!uid,
    queryFn: () => revenueAdvisorStances.list(),
    staleTime: 60_000,
  });
}

export function useRevenueMemoryEvents(limit = 50) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-memory-events", uid, limit],
    enabled: !!uid,
    queryFn: () => revenueMemoryEvents.list({ limit }),
    staleTime: 30_000,
  });
}

export function useRevenueRetentionSignals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-retention-signals", uid],
    enabled: !!uid,
    queryFn: () => revenueRetentionSignals.list(),
    staleTime: 60_000,
  });
}

export function useRevenueCampaignsData() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-campaigns-data", uid],
    enabled: !!uid,
    queryFn: () => revenueCampaigns.list(),
    staleTime: 60_000,
  });
}

export function useRevenueFunnelsData() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-funnels-data", uid],
    enabled: !!uid,
    queryFn: () => revenueFunnels.list(),
    staleTime: 60_000,
  });
}

export function useRevenueFunnelSteps(funnelId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-funnel-steps", uid, funnelId],
    enabled: !!uid,
    queryFn: () => revenueFunnelSteps.list(),
    staleTime: 60_000,
  });
}

export function useRevenueOffers() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-offers-data", uid],
    enabled: !!uid,
    queryFn: () => revenueOffers.list(),
    staleTime: 60_000,
  });
}

export function useRevenueBookingsData() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-bookings-data", uid],
    enabled: !!uid,
    queryFn: () => revenueBookings.list(),
    staleTime: 60_000,
  });
}

export function useRevenueReviews() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-reviews-data", uid],
    enabled: !!uid,
    queryFn: () => revenueReviews.list(),
    staleTime: 60_000,
  });
}

export function useRevenueSegmentsData() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-segments-data", uid],
    enabled: !!uid,
    queryFn: () => revenueSegments.list(),
    staleTime: 60_000,
  });
}

export function useRevenueReputationMetrics() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-reputation-metrics", uid],
    enabled: !!uid,
    queryFn: () => revenueReputationMetrics.list(),
    staleTime: 60_000,
  });
}

export function useRevenueWinbackQueue() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-winback-queue", uid],
    enabled: !!uid,
    queryFn: () => revenueWinbackQueue.list(),
    staleTime: 60_000,
  });
}

export function useRevenueExperiments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-experiments", uid],
    enabled: !!uid,
    queryFn: () => revenueExperiments.list(),
    staleTime: 60_000,
  });
}

export function useRevenueJourneyTouchpoints() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-journey-touchpoints", uid],
    enabled: !!uid,
    queryFn: () => revenueJourneyTouchpoints.list(),
    staleTime: 60_000,
  });
}

// ── Computed / Orchestrated Hooks ──────────────────────────────

export function useRevenueWhatChanged(dayWindow = 7) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-what-changed", uid, dayWindow],
    enabled: !!uid,
    queryFn: () => computeWhatChanged(dayWindow),
    staleTime: 120_000,
  });
}

export function useGrowthDNA() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-growth-dna", uid],
    enabled: !!uid,
    queryFn: () => inferGrowthDNA(),
    staleTime: 300_000,
  });
}

export function useGrowthFirewall() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-growth-firewall", uid],
    enabled: !!uid,
    queryFn: () => assessGrowthFirewall(),
    staleTime: 120_000,
  });
}

export function useTimeMachineSnapshot() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-time-machine", uid],
    enabled: !!uid,
    queryFn: () => buildTimeMachineSnapshot(),
    staleTime: 300_000,
  });
}

export function useAdvisorMemory() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-advisor-memory", uid],
    enabled: !!uid,
    queryFn: () => getAdvisorMemory(),
    staleTime: 120_000,
  });
}

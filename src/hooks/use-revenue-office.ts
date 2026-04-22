import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function usePipelineStages() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["pipeline-stages", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("pipeline_stages").select("*").eq("user_id", uid!).order("position");
      return data ?? [];
    },
  });
}

export function useDeals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["deals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("deals").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCampaigns() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["campaigns", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("campaigns").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useBookings() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["bookings", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("bookings").select("*").eq("user_id", uid!).order("booking_date", { ascending: false });
      return data ?? [];
    },
  });
}

export function useForms() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["forms", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("forms").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useFunnels() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["funnels", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("funnels").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useOffers() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["offers", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("offers").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useMemberships() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["memberships", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("memberships").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useReputationReviews() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["reputation-reviews", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("reputation_reviews").select("*").eq("user_id", uid!).order("review_date", { ascending: false });
      return data ?? [];
    },
  });
}

export function useRetentionAlerts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["retention-alerts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("retention_alerts").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useCallingContacts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["calling-contacts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("calling_contacts").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCustomers() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["customers", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("customers").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useRevenueLeakItems() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-leak-items", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("revenue_leak_items").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useAutomationRules() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["automation-rules", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("automation_rules").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCommunicationLog() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["communication-log", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("communication_log").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useConversionExperiments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["conversion-experiments", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("conversion_experiments").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useCommercialMemoryEvents() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["commercial-memory-events", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("commercial_memory_events").select("*").eq("user_id", uid!).order("event_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useRevenueRiskAreas() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["revenue-risk-areas", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("revenue_risk_areas").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCustomerJourneyStages() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["customer-journey-stages", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("customer_journey_stages").select("*").eq("user_id", uid!).order("stage_order");
      return data ?? [];
    },
  });
}

export function useCustomerLifecycleStages() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["customer-lifecycle-stages", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("customer_lifecycle_stages").select("*").eq("user_id", uid!).order("stage_order");
      return data ?? [];
    },
  });
}

export function useComplianceControls() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["compliance-controls", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("compliance_controls").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useRiskRegister() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["risk-register", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("risk_register").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCustomerProfileSnapshots(customerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["customer-profile-snapshots", uid, customerId],
    enabled: !!uid && !!customerId,
    queryFn: async () => {
      const { data } = await fromTable("customer_profile_snapshots").select("*").eq("user_id", uid!).eq("customer_id", customerId!).order("snapshot_date", { ascending: false });
      return data ?? [];
    },
  });
}

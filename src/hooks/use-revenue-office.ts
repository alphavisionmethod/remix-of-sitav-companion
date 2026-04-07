import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      const { data } = await supabase.from("pipeline_stages").select("*").eq("user_id", uid!).order("position");
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
      const { data } = await supabase.from("deals").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("campaigns").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
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
      const { data } = await supabase.from("bookings").select("*").eq("user_id", uid!).order("booking_date", { ascending: false });
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
      const { data } = await supabase.from("forms").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
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
      const { data } = await supabase.from("funnels").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("offers").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
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
      const { data } = await supabase.from("memberships").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("reputation_reviews").select("*").eq("user_id", uid!).order("review_date", { ascending: false });
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
      const { data } = await supabase.from("retention_alerts").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
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
      const { data } = await supabase.from("calling_contacts").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("customers").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("revenue_leak_items").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("automation_rules").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("communication_log").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Ecosystem Devices Hook
// CRUD + queries for Apple/Android device management
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Ecosystem = "apple" | "android";

export function useEcosystemDevices(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-devices", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_devices").select("*").order("last_seen_at", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemTrustRecords(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-trust", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_trust_records").select("*, ecosystem_devices(surface, device_model)").order("last_verified_at", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemHealthConsents(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-health-consents", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_health_consents").select("*").order("created_at", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemPushRoutes(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-push-routes", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_push_routes").select("*, ecosystem_devices(surface, device_model)").order("routing_priority", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemWearableConfigs(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-wearable-configs", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_wearable_configs").select("*, ecosystem_devices(surface, device_model)").order("created_at", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemLaunchReadiness(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-launch-readiness", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_launch_readiness").select("*").order("last_assessed_at", { ascending: false });
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEcosystemContinuityEvents(ecosystem?: Ecosystem) {
  return useQuery({
    queryKey: ["ecosystem-continuity-events", ecosystem],
    queryFn: async () => {
      let q = supabase.from("ecosystem_continuity_events").select("*").order("created_at", { ascending: false }).limit(50);
      if (ecosystem) q = q.eq("ecosystem", ecosystem);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useSeedEcosystemData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ecosystem: Ecosystem) => {
      const { data, error } = await supabase.functions.invoke("ecosystem-operations", {
        body: { action: "seed_ecosystem", ecosystem },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, ecosystem) => {
      toast.success(`${ecosystem === "apple" ? "Apple" : "Android"} ecosystem data seeded`);
      qc.invalidateQueries({ queryKey: ["ecosystem-devices"] });
      qc.invalidateQueries({ queryKey: ["ecosystem-trust"] });
      qc.invalidateQueries({ queryKey: ["ecosystem-health-consents"] });
      qc.invalidateQueries({ queryKey: ["ecosystem-push-routes"] });
      qc.invalidateQueries({ queryKey: ["ecosystem-wearable-configs"] });
      qc.invalidateQueries({ queryKey: ["ecosystem-launch-readiness"] });
    },
    onError: (err: any) => toast.error(`Seed failed: ${err.message}`),
  });
}

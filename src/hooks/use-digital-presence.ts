import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function useSites() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["sites", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("sites").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useSitePages(siteId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["site-pages", uid, siteId],
    enabled: !!uid && !!siteId,
    queryFn: async () => {
      const { data } = await fromTable("site_pages").select("*").eq("user_id", uid!).eq("site_id", siteId!).order("position");
      return data ?? [];
    },
  });
}

export function useBrandAssets() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["brand-assets", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("brand_assets").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useSeoReports() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["seo-reports", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("seo_reports").select("*").eq("user_id", uid!).order("checked_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function usePromotions() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["promotions", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("promotions").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useEcommerceProducts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["ecommerce-products", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("ecommerce_products").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

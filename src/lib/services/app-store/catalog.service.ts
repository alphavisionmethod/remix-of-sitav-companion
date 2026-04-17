// ═══════════════════════════════════════════════════════════════
// catalog.service — read app catalog (DB-backed, falls back to edge fn)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface CatalogApp {
  app_id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  publisher: string | null;
  app_type: "internal" | "web" | "pwa" | "external_desktop" | "pack";
  launch_strategy: string;
  launch_target: Record<string, unknown>;
  category: string | null;
  tags: string[];
  icon_url: string | null;
  banner_url: string | null;
  screenshots: string[];
  permissions_required: Array<{ key: string; label?: string; required?: boolean; risk?: string }>;
  supported_surfaces: string[];
  installability: "installable" | "preinstalled" | "unavailable" | "desktop_only";
  verification_status: "verified" | "publisher_verified" | "unverified" | "community";
  trust_level: "first_party" | "trusted" | "standard" | "restricted";
  version: string;
  latest_version: string;
  enabled: boolean;
  featured: boolean;
  pinned_default: boolean;
  sort_order: number;
  requires_auth: boolean;
  requires_shell: boolean;
  offline_support: "none" | "partial" | "full";
  window_defaults: { width?: number; height?: number };
  manifest_json: Record<string, unknown>;
  update_channel: string;
}

export interface CatalogFilters {
  category?: string;
  appType?: CatalogApp["app_type"];
  surface?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}

const TABLE = "apps" as const;

export const catalogService = {
  async list(filters: CatalogFilters = {}): Promise<CatalogApp[]> {
    let q = (supabase as unknown as { from: (t: string) => any })
      .from(TABLE)
      .select("*")
      .eq("enabled", true);
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.appType) q = q.eq("app_type", filters.appType);
    if (filters.surface) q = q.contains("supported_surfaces", [filters.surface]);
    if (filters.featured) q = q.eq("featured", true);
    if (filters.search) {
      const s = filters.search.replace(/[%_]/g, "\\$&");
      q = q.or(
        `name.ilike.%${s}%,publisher.ilike.%${s}%,description.ilike.%${s}%,short_name.ilike.%${s}%`,
      );
    }
    const { data, error } = await q
      .order("sort_order", { ascending: true })
      .limit(filters.limit ?? 200);
    if (error) throw error;
    return (data ?? []) as CatalogApp[];
  },

  async getByAppId(appId: string): Promise<CatalogApp | null> {
    const { data, error } = await (supabase as unknown as { from: (t: string) => any })
      .from(TABLE)
      .select("*")
      .eq("app_id", appId)
      .eq("enabled", true)
      .maybeSingle();
    if (error) throw error;
    return (data as CatalogApp) ?? null;
  },

  async getBySlug(slug: string): Promise<CatalogApp | null> {
    const { data, error } = await (supabase as unknown as { from: (t: string) => any })
      .from(TABLE)
      .select("*")
      .eq("slug", slug)
      .eq("enabled", true)
      .maybeSingle();
    if (error) throw error;
    return (data as CatalogApp) ?? null;
  },

  async featured(limit = 8): Promise<CatalogApp[]> {
    return this.list({ featured: true, limit });
  },
};

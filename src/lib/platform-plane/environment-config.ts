// ═══════════════════════════════════════════════════════════════
// SITA OS — Environment Configuration Service
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export type EnvironmentKey = "dev" | "staging" | "production";

export interface EnvironmentInfo {
  id: string;
  envKey: EnvironmentKey;
  displayName: string;
  description: string;
  apiBaseUrl: string | null;
  featureFlagContext: Record<string, unknown>;
  config: Record<string, unknown>;
  isCurrent: boolean;
  status: string;
}

let cachedEnv: EnvironmentKey | null = null;

export const environmentConfig = {
  /** Detect current environment from URL patterns */
  getCurrentEnvironment(): EnvironmentKey {
    if (cachedEnv) return cachedEnv;
    const url = import.meta.env.VITE_SUPABASE_URL || "";
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      cachedEnv = "dev";
    } else if (url.includes("staging")) {
      cachedEnv = "staging";
    } else {
      cachedEnv = "production";
    }
    return cachedEnv;
  },

  isProduction(): boolean {
    return this.getCurrentEnvironment() === "production";
  },

  isStaging(): boolean {
    return this.getCurrentEnvironment() === "staging";
  },

  isDev(): boolean {
    return this.getCurrentEnvironment() === "dev";
  },

  /** Fetch all environment configs from DB */
  async getEnvironments(): Promise<EnvironmentInfo[]> {
    const { data } = await fromTable("environment_configs").select("*").order("env_key");
    return (data || []).map((r: any) => ({
      id: r.id,
      envKey: r.env_key as EnvironmentKey,
      displayName: r.display_name,
      description: r.description,
      apiBaseUrl: r.api_base_url,
      featureFlagContext: r.feature_flag_context || {},
      config: r.config || {},
      isCurrent: r.is_current,
      status: r.status,
    }));
  },

  /** Get config value for a specific environment */
  async getEnvConfig(envKey: EnvironmentKey, configKey: string): Promise<unknown> {
    const { data } = await fromTable("environment_configs")
      .select("config")
      .eq("env_key", envKey)
      .maybeSingle();
    return data?.config?.[configKey] ?? null;
  },

  /** Get display badge info for current env */
  getEnvironmentBadge(): { label: string; color: string; icon: string } {
    const env = this.getCurrentEnvironment();
    switch (env) {
      case "dev":
        return { label: "DEV", color: "text-green-400 bg-green-400/10", icon: "code" };
      case "staging":
        return { label: "STAGING", color: "text-amber-400 bg-amber-400/10", icon: "flask-conical" };
      case "production":
        return { label: "PROD", color: "text-red-400 bg-red-400/10", icon: "globe" };
    }
  },
};

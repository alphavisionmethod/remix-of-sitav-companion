// ═══════════════════════════════════════════════════════════════
// Auto-ingestion client — wraps app-ingest-* edge functions
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface WebIngestResult {
  source_url: string;
  canonical_url: string;
  title: string | null;
  description: string | null;
  theme_color: string | null;
  publisher: string | null;
  manifest_url: string | null;
  og_image: string | null;
  icons: Array<{ source_url: string; storage_path: string; size: number | null; mime: string }>;
  apple_touch_icon: { source_url: string; storage_path: string } | null;
  app_id_suggestion: string;
}

export interface PwaIngestResult {
  manifest_url: string;
  name: string | null;
  short_name: string | null;
  description: string | null;
  start_url: string | null;
  scope: string | null;
  display: string | null;
  theme_color: string | null;
  background_color: string | null;
  orientation: string | null;
  icons: Array<{ source_url: string; storage_path: string; size: number | null; mime: string; purpose: string }>;
  manifest_storage_path: string;
}

export interface ScreenshotResult {
  provider: string;
  storage_path: string;
  source_url: string;
}

export type IngestionJobStatus = "pending" | "running" | "completed" | "failed" | "degraded";

export interface IngestionJob {
  id: string;
  source_url: string;
  job_type: "web" | "pwa" | "screenshot" | "native_meta";
  status: IngestionJobStatus;
  result_json: Record<string, unknown> | null;
  error_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const sb = () => supabase as unknown as { functions: { invoke: (n: string, o?: unknown) => Promise<{ data: unknown; error: unknown }> } };

export const ingestionService = {
  async ingestWeb(url: string): Promise<{ ok: boolean; job_id?: string; result?: WebIngestResult; error?: string }> {
    const { data, error } = await sb().functions.invoke("app-ingest-web", { body: { url } });
    if (error) throw error;
    return data as { ok: boolean; job_id?: string; result?: WebIngestResult; error?: string };
  },

  async ingestPwa(manifestUrl: string): Promise<{ ok: boolean; job_id?: string; result?: PwaIngestResult; error?: string }> {
    const { data, error } = await sb().functions.invoke("app-ingest-pwa", { body: { manifest_url: manifestUrl } });
    if (error) throw error;
    return data as { ok: boolean; job_id?: string; result?: PwaIngestResult; error?: string };
  },

  async captureScreenshot(url: string, appId?: string): Promise<{ ok: boolean; job_id?: string; result?: ScreenshotResult; degraded?: boolean; reason?: string }> {
    const { data, error } = await sb().functions.invoke("app-screenshot-capture", { body: { url, app_id: appId } });
    if (error) throw error;
    return data as { ok: boolean; job_id?: string; result?: ScreenshotResult; degraded?: boolean; reason?: string };
  },

  async getJob(jobId: string): Promise<IngestionJob | null> {
    const client = supabase as unknown as { from: (t: string) => { select: (s: string) => { eq: (k: string, v: string) => { single: () => Promise<{ data: IngestionJob | null }> } } } };
    const { data } = await client.from("app_ingestion_jobs").select("*").eq("id", jobId).single();
    return data;
  },

  publicAssetUrl(storagePath: string): string {
    const client = supabase as unknown as { storage: { from: (b: string) => { getPublicUrl: (p: string) => { data: { publicUrl: string } } } } };
    return client.storage.from("app-assets").getPublicUrl(storagePath).data.publicUrl;
  },

  async verifyPackage(packageId: string): Promise<{ ok: boolean; status: string; reason?: string }> {
    const { data, error } = await sb().functions.invoke("package-verify", { body: { package_id: packageId } });
    if (error) throw error;
    return data as { ok: boolean; status: string; reason?: string };
  },
};

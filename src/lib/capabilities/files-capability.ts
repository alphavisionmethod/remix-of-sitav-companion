// ═══════════════════════════════════════════════════════════════
// SITA OS — Files Capability Module
// Surface-neutral file operations
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { supabase } from "@/integrations/supabase/client";
import type { CapabilityResult } from "@/packages/contracts/msa/capability-contract";

registerCapability("files.upload", async (params): Promise<CapabilityResult> => {
  const { file, bucket = "documents", path } = params as { file: File; bucket?: string; path?: string };
  if (!file) return { success: false, error: "No file provided" };

  const filePath = path || `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: { path: filePath, bucket },
    receipt: { id: crypto.randomUUID(), hash: filePath, type: "action" },
  };
});

registerCapability("files.list", async (params): Promise<CapabilityResult> => {
  const { bucket = "documents", folder = "" } = params as { bucket?: string; folder?: string };
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) return { success: false, error: error.message };

  return { success: true, data: data || [] };
});

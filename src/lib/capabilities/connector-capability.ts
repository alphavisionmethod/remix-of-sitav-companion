// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Capability Module
// Surface-neutral connector operations
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { supabase } from "@/integrations/supabase/client";
import type { CapabilityResult } from "@/packages/contracts/msa/capability-contract";

registerCapability("connector.connect", async (params, context): Promise<CapabilityResult> => {
  const { connectorType, config } = params as { connectorType: string; config?: Record<string, unknown> };
  if (!connectorType) return { success: false, error: "No connector type provided" };

  // Create connector instance via edge function
  const { data, error } = await supabase.functions.invoke("connector-operations", {
    body: { action: "create_instance", connector_type: connectorType, config },
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data,
    receipt: { id: crypto.randomUUID(), hash: connectorType, type: "action" },
  };
});

registerCapability("connector.sync", async (params, context): Promise<CapabilityResult> => {
  const { instanceId } = params as { instanceId: string };
  if (!instanceId) return { success: false, error: "No instance ID provided" };

  const { data, error } = await supabase.functions.invoke("connector-operations", {
    body: { action: "sync_instance", instance_id: instanceId },
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data,
    receipt: { id: crypto.randomUUID(), hash: instanceId, type: "action" },
  };
});

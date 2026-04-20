// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Client Factory
// Thin routing layer: validates the action against the connector's
// capability declaration and forwards to the backing edge function
// via supabase.functions.invoke. No business logic lives here.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  ConnectorCapability,
  ConnectorClient,
  ConnectorClientInvokeOptions,
  ConnectorClientResult,
} from "../types";

export function createEdgeFunctionClient(capability: ConnectorCapability): ConnectorClient {
  return {
    connectorId: capability.connectorId,
    async invoke<T>(opts: ConnectorClientInvokeOptions): Promise<ConnectorClientResult<T>> {
      const action = capability.actions.find((a) => a.key === opts.action);
      if (!action) {
        return {
          ok: false,
          error: `Unknown action "${opts.action}" for connector "${capability.connectorId}"`,
        };
      }
      if (!capability.edgeFunction) {
        return {
          ok: false,
          error: `Connector "${capability.connectorId}" has no edge function bound (status: ${capability.status})`,
        };
      }
      try {
        const { data, error } = await supabase.functions.invoke(capability.edgeFunction, {
          body: {
            connectorId: capability.connectorId,
            action: opts.action,
            params: opts.params ?? {},
          },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true, data: data as T };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}

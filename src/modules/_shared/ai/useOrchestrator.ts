// ═══════════════════════════════════════════════════════════════════
// SITA OS — useOrchestrator (Phase 4)
// Single hook every chat / agent / action AI call must use.
// Wraps the `ai-orchestrator` edge function which records an
// invocation plan, performs authority checks, calls `ai-gateway`,
// and persists explainability traces.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveWorkspaceId } from "@/modules/_shared/workspace/workspace-context";

export type OrchestratorMode = "chat" | "simulation" | "action" | "voice" | "recap" | "tool";

export interface OrchestratorMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface OrchestratorContextSources {
  memoryIds?: string[];
  fileIds?: string[];
  advisorIds?: string[];
  priorReceiptIds?: string[];
  workspaceIds?: string[];
  notes?: Array<{ label: string; excerpt?: string; weight?: number }>;
}

export interface OrchestratorRequest {
  mode?: OrchestratorMode;
  capabilityKey?: string;
  moduleId?: string | null;
  workspaceId?: string | null;
  messages: OrchestratorMessage[];
  promptFamilyId?: string;
  promptVars?: Record<string, unknown>;
  contextSources?: OrchestratorContextSources;
  assumptions?: string[];
  confidenceTarget?: number;
  riskTier?: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  authorityActionKey?: string;
  taskClass?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface OrchestratorResponse {
  invocationId: string;
  correlationId: string;
  mode: OrchestratorMode;
  capabilityKey: string;
  result: Record<string, unknown>;
  traceCount: number;
  authority: { decision: string; rationale: string; effective: string };
}

export interface OrchestratorBlocked {
  blocked: true;
  reason: string;
  invocationId: string;
  correlationId: string;
}

export type OrchestratorOutcome = OrchestratorResponse | OrchestratorBlocked;

function isBlocked(o: OrchestratorOutcome): o is OrchestratorBlocked {
  return (o as OrchestratorBlocked).blocked === true;
}

export function useOrchestrator() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOutcome, setLastOutcome] = useState<OrchestratorOutcome | null>(null);

  const invoke = useCallback(
    async (req: OrchestratorRequest): Promise<OrchestratorOutcome> => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = {
          ...req,
          workspaceId: req.workspaceId ?? activeWorkspaceId ?? null,
        };
        const { data, error: fnError } = await supabase.functions.invoke(
          "ai-orchestrator",
          { body: payload },
        );
        if (fnError) {
          const msg = fnError.message ?? "Orchestrator call failed";
          setError(msg);
          throw new Error(msg);
        }
        const outcome = data as OrchestratorOutcome;
        setLastOutcome(outcome);
        return outcome;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activeWorkspaceId],
  );

  return { invoke, isLoading, error, lastOutcome, isBlocked };
}

/**
 * Imperative variant — for non-React callers (services, controllers, tests).
 * Uses the same edge function path; honours the user's existing session.
 */
export async function callOrchestrator(
  req: OrchestratorRequest,
): Promise<OrchestratorOutcome> {
  const { data, error } = await supabase.functions.invoke("ai-orchestrator", {
    body: req,
  });
  if (error) throw new Error(error.message ?? "Orchestrator call failed");
  return data as OrchestratorOutcome;
}

export { isBlocked };
// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Domain Client Base
// Thin wrapper over canonical services that:
//   - reads via Supabase (cache layer up to caller)
//   - mutations route through mobileSyncQueue when offline OR when
//     the domain policy demands durable queueing on mobile.
// Mobile clients MUST NOT implement domain logic — only adapt
// transport for the mobile runtime.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import {
  mobileSyncQueue,
  classifyNetwork,
  shouldQueueMutation,
  getOfflinePolicy,
  type OfflineDomain,
} from "@/lib/mobile-platform";

export interface MobileMutationOptions {
  domain: OfflineDomain;
  verb: string;
  payload: Record<string, unknown>;
  optimisticSnapshot?: Record<string, unknown>;
  /** Force queueing even when online (e.g. background coalescing). */
  forceQueue?: boolean;
}

export interface MobileMutationResult {
  queued: boolean;
  mutationId?: string;
  reason?: "offline" | "degraded" | "policy" | "forced";
}

/**
 * Decide whether to queue a mutation through the mobile sync engine,
 * or pass it through immediately. Pure decision — no side effects.
 */
export function decideMutationTransport(
  domain: OfflineDomain,
  forceQueue?: boolean,
): { queue: boolean; reason?: MobileMutationResult["reason"] } {
  const policy = getOfflinePolicy(domain);
  if (forceQueue && policy.mutationsAllowed) return { queue: true, reason: "forced" };
  const tier = classifyNetwork();
  if (tier === "offline" && policy.mutationsAllowed) return { queue: true, reason: "offline" };
  if (shouldQueueMutation(tier, domain) && policy.mutationsAllowed) return { queue: true, reason: "degraded" };
  return { queue: false };
}

/**
 * Enqueue a mutation onto the mobile sync queue. Throws if the
 * domain forbids offline mutations.
 */
export async function enqueueMobileMutation(opts: MobileMutationOptions): Promise<MobileMutationResult> {
  const decision = decideMutationTransport(opts.domain, opts.forceQueue);
  if (!decision.queue) return { queued: false };
  const m = await mobileSyncQueue.enqueue({
    domain: opts.domain,
    verb: opts.verb,
    payload: opts.payload,
    optimisticSnapshot: opts.optimisticSnapshot,
  });
  return { queued: true, mutationId: m.id, reason: decision.reason };
}

export { supabase };

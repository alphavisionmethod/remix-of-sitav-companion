// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Webhook Replay Policy
// Webhook replay rules, deduplication, idempotency, DLQ behavior
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY, PROVIDER_IDS } from "./provider-contract-registry";

export interface WebhookReplayEntry {
  providerId: ProviderId;
  webhookSupported: boolean;
  replaySupported: boolean;
  idempotencyKeyField: string | null;
  deduplicationWindowMinutes: number;
  dlqEnabled: boolean;
  dlqRetentionDays: number;
  maxReplayAttempts: number;
}

export const PROVIDER_WEBHOOK_REPLAY_POLICIES: Record<ProviderId, WebhookReplayEntry> = Object.fromEntries(
  PROVIDER_IDS.map(id => {
    const c = PROVIDER_CONTRACT_REGISTRY[id];
    const wh = c.webhookBehavior;
    return [id, {
      providerId: id,
      webhookSupported: wh?.supported ?? false,
      replaySupported: wh?.replaySupported ?? false,
      idempotencyKeyField: wh?.idempotencyKeyField ?? null,
      deduplicationWindowMinutes: wh?.supported ? 60 : 0,
      dlqEnabled: wh?.replaySupported ?? false,
      dlqRetentionDays: wh?.replaySupported ? 30 : 0,
      maxReplayAttempts: wh?.replaySupported ? 5 : 0,
    }];
  })
) as Record<ProviderId, WebhookReplayEntry>;
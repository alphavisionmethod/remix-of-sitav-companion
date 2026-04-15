// ═══════════════════════════════════════════════════════════════
// SITA OS — WebSocket Protocol
// Event envelope, reconnect/resume, subscription model,
// backpressure rules, delivery assurance.
// ═══════════════════════════════════════════════════════════════

export type WsEventScope =
  | "command"
  | "approval"
  | "trust"
  | "agent"
  | "rollout"
  | "notification"
  | "sync"
  | "timeline"
  | "health"
  | "boardroom"
  | "advisor";

export type WsDeliveryGuarantee = "at_most_once" | "at_least_once" | "exactly_once";

export type WsConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "suspended"
  | "disconnected"
  | "terminated";

export interface WsEventEnvelope<TPayload = unknown> {
  event_id: string;
  correlation_id?: string;
  scope: WsEventScope;
  event_type: string;
  payload: TPayload;
  actor_id?: string;
  tenant_id?: string;
  sequence_number: number;
  delivery_guarantee: WsDeliveryGuarantee;
  idempotency_key?: string;
  timestamp: string;
  expires_at?: string;
}

export interface WsSubscription {
  subscription_id: string;
  client_id: string;
  scopes: WsEventScope[];
  filters?: Record<string, string>;
  created_at: string;
  last_event_id?: string;
  backpressure_policy: BackpressurePolicy;
}

export interface BackpressurePolicy {
  max_buffer_size: number;
  overflow_strategy: "drop_oldest" | "drop_newest" | "pause" | "disconnect";
  throttle_ms?: number;
  priority_scopes?: WsEventScope[];
}

export interface WsReconnectPolicy {
  max_retries: number;
  base_delay_ms: number;
  max_delay_ms: number;
  jitter: boolean;
  resume_from_last_event: boolean;
}

export interface WsResumeRequest {
  client_id: string;
  last_event_id: string;
  subscriptions: string[];
  session_token: string;
}

export interface WsResumeResponse {
  resumed: boolean;
  missed_events: number;
  replay_from?: string;
  new_session_id?: string;
  reason?: string;
}

export interface WsHealthStatus {
  connection_state: WsConnectionState;
  latency_ms: number;
  events_received: number;
  events_dropped: number;
  buffer_utilization: number;
  last_event_at?: string;
  uptime_ms: number;
}

export interface WsClientSafeEvent<T = unknown> {
  event_id: string;
  scope: WsEventScope;
  event_type: string;
  data: T;
  timestamp: string;
  is_replay: boolean;
}

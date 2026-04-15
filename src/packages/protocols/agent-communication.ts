// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Communication Protocol
// register → heartbeat → command → ack → progress → result → telemetry
// ═══════════════════════════════════════════════════════════════

export type AgentPhase =
  | "unregistered"
  | "registering"
  | "registered"
  | "idle"
  | "commanded"
  | "executing"
  | "reporting"
  | "error"
  | "deregistered";

export interface AgentIdentity {
  agent_id: string;
  agent_type: "os-local" | "cloud-worker" | "advisor" | "monitor";
  version: string;
  capabilities: string[];
  trust_level: number;
  registered_at: string;
}

export interface AgentHeartbeat {
  agent_id: string;
  timestamp: string;
  status: "healthy" | "degraded" | "critical";
  load: { cpu_percent: number; memory_percent: number; queue_depth: number };
  active_tasks: number;
  last_error?: string;
}

export interface AgentCommand<TPayload = unknown> {
  command_id: string;
  correlation_id: string;
  agent_id: string;
  command_type: string;
  payload: TPayload;
  priority: "critical" | "high" | "normal" | "low";
  timeout_ms: number;
  retry_policy: { max_retries: number; backoff_ms: number };
  issued_at: string;
}

export interface AgentCommandAck {
  command_id: string;
  agent_id: string;
  accepted: boolean;
  rejection_reason?: string;
  estimated_duration_ms?: number;
  acked_at: string;
}

export interface AgentProgress {
  command_id: string;
  agent_id: string;
  percent_complete: number;
  stage: string;
  message?: string;
  updated_at: string;
}

export interface AgentResult<TOutput = unknown> {
  command_id: string;
  agent_id: string;
  status: "success" | "failure" | "partial" | "timeout";
  output?: TOutput;
  error?: { code: string; message: string; recoverable: boolean };
  duration_ms: number;
  completed_at: string;
}

export interface AgentTelemetry {
  agent_id: string;
  timestamp: string;
  metrics: Record<string, number>;
  events: Array<{ event_type: string; detail: string; severity: "info" | "warn" | "error" }>;
}

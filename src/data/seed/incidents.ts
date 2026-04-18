// SITA OS — Demo Data: Incidents

export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved" | "closed";

export interface DemoIncident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  source: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  assignee?: string;
  affected_services: string[];
  root_cause?: string;
  mitigation?: string;
  timeline: { time: string; action: string; actor: string }[];
}

export const DEMO_INCIDENTS: DemoIncident[] = [
  {
    id: "INC-001", title: "Connector sync failure — Plaid banking feed", severity: "critical", status: "investigating",
    source: "connector_engine", description: "Plaid connector failing to sync account balances. Affects 3 users. Last successful sync 4h ago.",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(), assignee: "System", affected_services: ["plaid", "finance-advisor", "cash-flow"],
    timeline: [
      { time: "2h ago", action: "Incident auto-created from connector health check", actor: "system" },
      { time: "1h 45m ago", action: "Retry attempt #1 failed — HTTP 503", actor: "connector_engine" },
      { time: "1h 30m ago", action: "Escalated to critical — staleness > 3h", actor: "staleness_monitor" },
      { time: "45m ago", action: "Investigating — checking Plaid API status", actor: "operator" },
    ],
  },
  {
    id: "INC-002", title: "AI advisor latency spike — business council", severity: "high", status: "mitigating",
    source: "telemetry", description: "Business advisor p95 latency exceeded 8s threshold. Avg response time 12.4s over last 30min.",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(), assignee: "AI Team", affected_services: ["business-advisor", "advisor-router"],
    mitigation: "Switched to fallback model (gpt-4o-mini). Monitoring recovery.",
    timeline: [
      { time: "5h ago", action: "Latency threshold breached — p95 > 8s", actor: "telemetry" },
      { time: "4h 30m ago", action: "Auto-downgrade to fallback model initiated", actor: "model_router" },
      { time: "4h ago", action: "Latency stabilized at 2.1s avg", actor: "telemetry" },
    ],
  },
  {
    id: "INC-003", title: "Workflow execution stuck — invoice approval chain", severity: "medium", status: "open",
    source: "workflow_engine", description: "3 workflow runs stuck in 'waiting-approval' state for >48h. No approver action taken.",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(), affected_services: ["workflow_engine", "approval_queue"],
    timeline: [
      { time: "48h ago", action: "Workflow entered waiting-approval state", actor: "workflow_engine" },
      { time: "24h ago", action: "Staleness warning — no action in 24h", actor: "staleness_monitor" },
      { time: "12h ago", action: "Escalated to incident — 3 workflows stuck", actor: "system" },
    ],
  },
  {
    id: "INC-004", title: "Calendar sync credential expired", severity: "low", status: "resolved",
    source: "connector_engine", description: "Google Calendar OAuth token expired. Re-auth required.",
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 70 * 3600000).toISOString(),
    affected_services: ["google-calendar"], root_cause: "OAuth token TTL expired after 7 days without refresh.",
    timeline: [
      { time: "3d ago", action: "Sync failure detected", actor: "connector_engine" },
      { time: "3d ago", action: "Re-auth notification sent to user", actor: "notification_queue" },
      { time: "2d 22h ago", action: "User re-authenticated — sync restored", actor: "user" },
    ],
  },
];

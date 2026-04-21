// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Error Alerting Rules
// Defines threshold-based alerting rules for edge function
// bundling/runtime errors, grouped by requestId and function name.
// Integrates with alert-ingest for notification fan-out.
// ═══════════════════════════════════════════════════════════════

export interface AlertingRule {
  id: string;
  name: string;
  description: string;
  source: "edge-function";
  groupBy: ("requestId" | "functionName" | "fingerprint")[];
  errorClass: "bundling" | "runtime" | "timeout" | "oom" | "any";
  threshold: number;
  windowSeconds: number;
  severity: "critical" | "high" | "medium" | "low";
  escalateAfter?: number;
  escalateTo?: "critical" | "high";
  cooldownSeconds: number;
  alertPayloadTemplate: {
    source: string;
    subsystem: string;
    titleTemplate: string;
    descriptionTemplate: string;
  };
}

export const EDGE_FUNCTION_ALERTING_RULES: AlertingRule[] = [
  {
    id: "ef-bundle-fail",
    name: "Edge Function Bundling Failure",
    description: "Triggers when bundling/import errors exceed threshold for a specific function",
    source: "edge-function",
    groupBy: ["functionName"],
    errorClass: "bundling",
    threshold: 3,
    windowSeconds: 300,
    severity: "critical",
    cooldownSeconds: 600,
    alertPayloadTemplate: {
      source: "edge-function-alerting",
      subsystem: "edge-functions",
      titleTemplate: "Bundling failure: {{functionName}} ({{count}}× in {{window}})",
      descriptionTemplate: "Edge function '{{functionName}}' failed to bundle/import {{count}} times. Latest error: {{latestMessage}}",
    },
  },
  {
    id: "ef-runtime-spike",
    name: "Edge Function Runtime Error Spike",
    description: "Triggers when runtime errors for a function exceed threshold within window",
    source: "edge-function",
    groupBy: ["functionName", "requestId"],
    errorClass: "runtime",
    threshold: 10,
    windowSeconds: 300,
    severity: "high",
    escalateAfter: 25,
    escalateTo: "critical",
    cooldownSeconds: 300,
    alertPayloadTemplate: {
      source: "edge-function-alerting",
      subsystem: "edge-functions",
      titleTemplate: "Runtime error spike: {{functionName}} ({{count}}× in {{window}})",
      descriptionTemplate: "Edge function '{{functionName}}' emitted {{count}} runtime errors. Grouped by requestId for correlation.",
    },
  },
  {
    id: "ef-timeout-burst",
    name: "Edge Function Timeout Burst",
    description: "Triggers when timeout errors exceed threshold, indicating resource starvation",
    source: "edge-function",
    groupBy: ["functionName"],
    errorClass: "timeout",
    threshold: 5,
    windowSeconds: 300,
    severity: "high",
    escalateAfter: 15,
    escalateTo: "critical",
    cooldownSeconds: 300,
    alertPayloadTemplate: {
      source: "edge-function-alerting",
      subsystem: "edge-functions",
      titleTemplate: "Timeout burst: {{functionName}} ({{count}}× in {{window}})",
      descriptionTemplate: "Edge function '{{functionName}}' timed out {{count}} times, suggesting resource starvation or downstream dependency failure.",
    },
  },
  {
    id: "ef-oom-kill",
    name: "Edge Function OOM Kill",
    description: "Triggers immediately on out-of-memory kills",
    source: "edge-function",
    groupBy: ["functionName"],
    errorClass: "oom",
    threshold: 1,
    windowSeconds: 60,
    severity: "critical",
    cooldownSeconds: 120,
    alertPayloadTemplate: {
      source: "edge-function-alerting",
      subsystem: "edge-functions",
      titleTemplate: "OOM kill: {{functionName}}",
      descriptionTemplate: "Edge function '{{functionName}}' was killed due to out-of-memory. Immediate investigation required.",
    },
  },
  {
    id: "ef-global-error-rate",
    name: "Global Edge Function Error Rate",
    description: "Triggers when total edge function errors across all functions exceed a global threshold",
    source: "edge-function",
    groupBy: ["functionName"],
    errorClass: "any",
    threshold: 50,
    windowSeconds: 300,
    severity: "high",
    escalateAfter: 100,
    escalateTo: "critical",
    cooldownSeconds: 600,
    alertPayloadTemplate: {
      source: "edge-function-alerting",
      subsystem: "edge-functions",
      titleTemplate: "Global edge error rate: {{count}} errors in {{window}}",
      descriptionTemplate: "Total edge function errors exceeded {{threshold}} in {{window}}. Top functions: {{topFunctions}}.",
    },
  },
];

// ── Evaluation engine ────────────────────────────────────────

export interface ErrorEvent {
  functionName: string;
  requestId: string;
  errorClass: AlertingRule["errorClass"];
  message: string;
  timestamp: number;
}

interface AlertState {
  ruleId: string;
  lastFiredAt: number;
  count: number;
}

export function classifyEdgeFunctionError(message: string, stack?: string): AlertingRule["errorClass"] {
  const text = `${message} ${stack ?? ""}`.toLowerCase();
  if (text.includes("import") || text.includes("bundle") || text.includes("module not found") || text.includes("cannot resolve")) return "bundling";
  if (text.includes("timeout") || text.includes("deadline exceeded") || text.includes("timed out")) return "timeout";
  if (text.includes("out of memory") || text.includes("oom") || text.includes("heap limit")) return "oom";
  return "runtime";
}

export function evaluateRules(
  events: ErrorEvent[],
  rules: AlertingRule[] = EDGE_FUNCTION_ALERTING_RULES,
  priorState: Map<string, AlertState> = new Map(),
  now: number = Date.now()
): { alerts: Array<{ rule: AlertingRule; context: Record<string, string | number>; groupKey: string }>; updatedState: Map<string, AlertState> } {
  const alerts: Array<{ rule: AlertingRule; context: Record<string, string | number>; groupKey: string }> = [];
  const updatedState = new Map(priorState);

  for (const rule of rules) {
    const windowStart = now - rule.windowSeconds * 1000;
    const windowEvents = events.filter(e =>
      e.timestamp >= windowStart &&
      (rule.errorClass === "any" || e.errorClass === rule.errorClass)
    );

    // Group events
    const groups = new Map<string, ErrorEvent[]>();
    for (const ev of windowEvents) {
      const keyParts = rule.groupBy.map(g => g === "functionName" ? ev.functionName : g === "requestId" ? ev.requestId : ev.message.slice(0, 60));
      const key = keyParts.join("|");
      const arr = groups.get(key) ?? [];
      arr.push(ev);
      groups.set(key, arr);
    }

    for (const [groupKey, grouped] of groups) {
      if (grouped.length < rule.threshold) continue;

      const stateKey = `${rule.id}:${groupKey}`;
      const prior = updatedState.get(stateKey);
      if (prior && (now - prior.lastFiredAt) < rule.cooldownSeconds * 1000) continue;

      let severity = rule.severity;
      if (rule.escalateAfter && grouped.length >= rule.escalateAfter && rule.escalateTo) {
        severity = rule.escalateTo;
      }

      const latest = grouped[grouped.length - 1];
      alerts.push({
        rule: { ...rule, severity },
        context: {
          functionName: latest.functionName,
          count: grouped.length,
          window: `${rule.windowSeconds}s`,
          threshold: rule.threshold,
          latestMessage: latest.message.slice(0, 240),
          requestId: latest.requestId,
        },
        groupKey,
      });

      updatedState.set(stateKey, { ruleId: rule.id, lastFiredAt: now, count: grouped.length });
    }
  }

  return { alerts, updatedState };
}

export function renderTemplate(template: string, context: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(context[key] ?? `{{${key}}}`));
}
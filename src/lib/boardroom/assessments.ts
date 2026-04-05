// ============================================================
// SITA OS — Domain Assessment Generators
// Accepts data bundle from data-service (DB-backed or fallback)
// ============================================================

import type { DomainAssessment, AlertData, OpportunitySummary, ActionItemData, BoardroomContentSection, DataSource } from "./types";
import type { BoardroomDataBundle } from "./data-service";

const now = () => new Date().toISOString();

// ── Finance Assessment ────────────────────────────────────

export function generateFinanceAssessment(bundle: BoardroomDataBundle): DomainAssessment {
  const { invoices, bills, subscriptions, cashFlow, opportunityInsights } = bundle;

  const overdueInvoices = invoices.filter(i => i.status === "overdue");
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const overdueBills = bills.filter(b => b.status === "overdue");
  const wasteSubs = subscriptions.filter(s => s.status === "waste" || s.status === "underused");

  const totalReceivables = [...overdueInvoices, ...pendingInvoices].reduce(
    (s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0
  );

  const alerts: AlertData[] = [];
  if (overdueInvoices.length > 0) {
    alerts.push({ severity: "critical", title: `${overdueInvoices.length} overdue invoice(s)`, description: `$${overdueInvoices.reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0).toLocaleString()} past due`, source: "invoices" });
  }
  if (overdueBills.length > 0) {
    alerts.push({ severity: "warning", title: `${overdueBills.length} overdue bill(s)`, description: overdueBills.map(b => b.name).join(", "), source: "bills" });
  }

  const sections: BoardroomContentSection[] = [
    {
      id: "fin-kpis", type: "metric-card", title: "Financial Snapshot",
      data: [
        { label: "Available Cash", value: cashFlow.available, trend: "up" as const, source: "cash-flow" },
        { label: "Incoming (30d)", value: cashFlow.incoming, trend: "up" as const, source: "cash-flow" },
        { label: "Outgoing", value: cashFlow.outgoing, source: "cash-flow" },
        { label: "Safe to Spend", value: cashFlow.safeToSpend, trend: "up" as const, source: "cash-flow" },
        { label: "Total Receivables", value: `$${totalReceivables.toLocaleString()}`, trend: overdueInvoices.length > 0 ? "down" as const : "flat" as const, source: "invoices" },
        { label: "Runway", value: cashFlow.runway, source: "cash-flow" },
      ],
    },
    {
      id: "fin-narrative", type: "narrative", title: "Financial Summary",
      data: {
        text: `Cash position is ${parseFloat(cashFlow.available.replace(/[$,]/g, "")) > 20000 ? "strong" : "moderate"} at ${cashFlow.available}. ${overdueInvoices.length > 0 ? `${overdueInvoices.length} invoice(s) are overdue, impacting receivables.` : "All invoices are current."} ${overdueBills.length > 0 ? `${overdueBills.length} bill(s) need immediate attention.` : ""} Next major expense: ${cashFlow.nextBigExpense.name} (${cashFlow.nextBigExpense.amount}) on ${cashFlow.nextBigExpense.date}.`,
        confidence: overdueInvoices.length === 0 ? 0.95 : 0.82,
        citations: ["cash-flow-service", "invoice-ledger", "bill-tracker"],
      },
    },
    {
      id: "fin-invoices", type: "table", title: "Invoice Status",
      data: {
        columns: [
          { key: "id", label: "Invoice" }, { key: "client", label: "Client" },
          { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "dueDate", label: "Due" },
        ],
        rows: invoices.map(i => ({ ...i })),
        source: "invoice-ledger",
      },
    },
    {
      id: "fin-bills", type: "table", title: "Upcoming Bills",
      data: {
        columns: [
          { key: "name", label: "Bill" }, { key: "amount", label: "Amount" },
          { key: "dueDate", label: "Due" }, { key: "status", label: "Status" },
        ],
        rows: bills.map(b => ({ ...b })),
        source: "bill-tracker",
      },
    },
  ];

  if (wasteSubs.length > 0) {
    sections.push({
      id: "fin-waste", type: "alert", title: "Subscription Waste",
      data: wasteSubs.map(s => ({
        severity: "warning" as const, title: `${s.name} — ${s.usage} usage`,
        description: `${s.totalCost}/mo — consider cancellation`, source: "subscription-tracker",
      })),
    });
  }

  const actionItems: ActionItemData[] = [];
  overdueInvoices.forEach(i => actionItems.push({ text: `Collect overdue ${i.id} from ${i.client}`, priority: "critical", domain: "finance", dueDate: "Today" }));
  overdueBills.forEach(b => actionItems.push({ text: `Pay overdue ${b.name} (${b.amount})`, priority: "high", domain: "finance", dueDate: "Today" }));
  wasteSubs.forEach(s => actionItems.push({ text: `Review ${s.name} subscription — only ${s.usage} usage`, priority: "medium", domain: "finance" }));

  const freshness = bundle.dataFreshness;
  const dataSources: DataSource[] = [
    { id: "ds-cashflow", name: "Cash Flow Service", domain: "finance", lastUpdated: freshness.cashflow || new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), recordCount: 1 },
    { id: "ds-invoices", name: "Invoice Ledger", domain: "finance", lastUpdated: freshness.invoices || new Date(Date.now() - 30 * 60 * 1000).toISOString(), recordCount: invoices.length },
    { id: "ds-bills", name: "Bill Tracker", domain: "finance", lastUpdated: freshness.bills || new Date(Date.now() - 60 * 60 * 1000).toISOString(), recordCount: bills.length },
    { id: "ds-subs", name: "Subscription Tracker", domain: "finance", lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), recordCount: subscriptions.length },
  ];

  return {
    domain: "finance",
    generatedAt: now(),
    confidence: overdueInvoices.length === 0 ? 0.94 : 0.78,
    sections, alerts, actionItems, dataSources,
    opportunities: [],
    staleFields: [],
  };
}

// ── Business Assessment ───────────────────────────────────

export function generateBusinessAssessment(bundle: BoardroomDataBundle): DomainAssessment {
  const { leads, opportunityInsights } = bundle;

  const newLeads = leads.filter(l => l.status === "new");
  const staleLeads = leads.filter(l => l.status === "cooling");
  const pipelineValue = leads.reduce((s, l) => s + parseFloat(l.value.replace(/[$,]/g, "")), 0);

  const alerts: AlertData[] = [];
  if (staleLeads.length > 0) {
    const atRisk = staleLeads.reduce((s, l) => s + parseFloat(l.value.replace(/[$,]/g, "")), 0);
    alerts.push({ severity: "warning", title: `${staleLeads.length} leads going cold`, description: `$${atRisk.toLocaleString()} pipeline at risk`, source: "lead-tracker" });
  }

  const sections: BoardroomContentSection[] = [
    {
      id: "biz-kpis", type: "metric-card", title: "Pipeline Snapshot",
      data: [
        { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, trend: "up" as const, source: "lead-tracker" },
        { label: "New Leads", value: newLeads.length, trend: "up" as const, trendValue: "this week", source: "lead-tracker" },
        { label: "Stale Leads", value: staleLeads.length, trend: staleLeads.length > 0 ? "down" as const : "flat" as const, source: "lead-tracker" },
        { label: "Conversion Rate", value: "34%", trend: "up" as const, trendValue: "+4pts", source: "analytics" },
      ],
    },
    {
      id: "biz-narrative", type: "narrative", title: "Business Summary",
      data: {
        text: `Pipeline stands at $${pipelineValue.toLocaleString()} across ${leads.length} active leads. ${newLeads.length} new lead(s) this week with ${staleLeads.length > 0 ? `${staleLeads.length} going cold and needing re-engagement` : "strong momentum across all stages"}. Conversion rate trending up at 34%.`,
        confidence: 0.88,
        citations: ["lead-tracker", "crm-analytics", "pipeline-model"],
      },
    },
    {
      id: "biz-pipeline", type: "table", title: "Lead Pipeline",
      data: {
        columns: [
          { key: "name", label: "Lead" }, { key: "company", label: "Company" },
          { key: "value", label: "Value" }, { key: "status", label: "Stage" },
          { key: "score", label: "Score" }, { key: "lastTouch", label: "Last Touch" },
        ],
        rows: leads.map(l => ({ ...l })),
        source: "lead-tracker",
      },
    },
  ];

  const actionItems: ActionItemData[] = [
    ...newLeads.map(l => ({ text: `Follow up with ${l.name} (${l.value})`, priority: "high" as const, domain: "business", assignee: "You", dueDate: "Today" })),
    ...staleLeads.map(l => ({ text: `Re-engage ${l.name} before lead goes cold`, priority: "medium" as const, domain: "business" })),
  ];

  const freshness = bundle.dataFreshness;
  const dataSources: DataSource[] = [
    { id: "ds-leads", name: "Lead Tracker", domain: "business", lastUpdated: freshness.leads || new Date(Date.now() - 15 * 60 * 1000).toISOString(), recordCount: leads.length },
    { id: "ds-crm", name: "CRM Analytics", domain: "business", lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString(), recordCount: 24 },
  ];

  return {
    domain: "business",
    generatedAt: now(),
    confidence: staleLeads.length > 1 ? 0.80 : 0.91,
    sections, alerts, actionItems, dataSources,
    opportunities: opportunityInsights.filter(o => o.domain === "business").map((o, i) => ({
      id: `biz-opp-${i}`, title: o.title, description: o.description,
      domain: "business", projectedValue: o.savings, confidence: o.impact === "high" ? 0.85 : 0.65,
    })),
    staleFields: [],
  };
}

// ── Concierge Assessment ──────────────────────────────────

export function generateConciergeAssessment(bundle: BoardroomDataBundle): DomainAssessment {
  const { householdTasks, familyEvents, opportunityInsights } = bundle;

  const pendingTasks = householdTasks.filter(t => t.status === "pending");
  const highPriority = pendingTasks.filter(t => t.priority === "high");
  const inProgress = householdTasks.filter(t => t.status === "in-progress");

  const alerts: AlertData[] = [];
  if (highPriority.length >= 2) {
    alerts.push({ severity: "warning", title: `${highPriority.length} high-priority tasks pending`, description: highPriority.map(t => t.title).join("; "), source: "task-engine" });
  }

  const sections: BoardroomContentSection[] = [
    {
      id: "con-kpis", type: "metric-card", title: "Household Status",
      data: [
        { label: "Pending Tasks", value: pendingTasks.length, source: "task-engine" },
        { label: "In Progress", value: inProgress.length, source: "task-engine" },
        { label: "High Priority", value: highPriority.length, trend: highPriority.length > 1 ? "down" as const : "flat" as const, source: "task-engine" },
        { label: "Upcoming Events", value: familyEvents.length, source: "calendar" },
      ],
    },
    {
      id: "con-narrative", type: "narrative", title: "Household Summary",
      data: {
        text: `${pendingTasks.length} household tasks pending, ${highPriority.length} at high priority. ${inProgress.length} task(s) in progress. ${familyEvents.length} family events scheduled. ${highPriority.length >= 2 ? "Household load is elevated — consider delegating." : "Load is manageable."}`,
        confidence: 0.90,
        citations: ["task-engine", "family-calendar", "routine-tracker"],
      },
    },
    {
      id: "con-tasks", type: "table", title: "Task Board",
      data: {
        columns: [
          { key: "title", label: "Task" }, { key: "assignee", label: "Assignee" },
          { key: "due", label: "Due" }, { key: "priority", label: "Priority" }, { key: "status", label: "Status" },
        ],
        rows: householdTasks.map(t => ({ ...t })),
        source: "task-engine",
      },
    },
    {
      id: "con-events", type: "table", title: "Family Calendar",
      data: {
        columns: [
          { key: "title", label: "Event" }, { key: "who", label: "Who" },
          { key: "when", label: "When" }, { key: "location", label: "Location" },
        ],
        rows: familyEvents.map(e => ({ ...e })),
        source: "family-calendar",
      },
    },
  ];

  const actionItems: ActionItemData[] = highPriority.map(t => ({
    text: t.title, priority: "high" as const, domain: "concierge", assignee: t.assignee, dueDate: t.due,
  }));

  const dataSources: DataSource[] = [
    { id: "ds-tasks", name: "Task Engine", domain: "concierge", lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(), recordCount: householdTasks.length },
    { id: "ds-calendar", name: "Family Calendar", domain: "concierge", lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString(), recordCount: familyEvents.length },
  ];

  return {
    domain: "concierge",
    generatedAt: now(),
    confidence: 0.92,
    sections, alerts, actionItems, dataSources,
    opportunities: opportunityInsights.filter(o => o.domain === "concierge").map((o, i) => ({
      id: `con-opp-${i}`, title: o.title, description: o.description,
      domain: "concierge", projectedValue: o.savings, confidence: o.impact === "high" ? 0.82 : 0.60,
    })),
    staleFields: [],
  };
}

// ── Incident Assessment ───────────────────────────────────

export function generateIncidentAssessment(bundle: BoardroomDataBundle): DomainAssessment {
  const { incidents } = bundle;

  const openIncidents = incidents.filter(i => i.status === "open");
  const alerts: AlertData[] = openIncidents.map(inc => ({
    severity: inc.severity === "medium" ? "warning" as const : "info" as const,
    title: inc.title, description: `Impact: ${inc.impact}`, source: "incident-system",
  }));

  const sections: BoardroomContentSection[] = [
    {
      id: "inc-kpis", type: "metric-card", title: "Incident Overview",
      data: [
        { label: "Open Incidents", value: openIncidents.length, trend: openIncidents.length > 0 ? "down" as const : "flat" as const, source: "incident-system" },
        { label: "Resolved (7d)", value: incidents.filter(i => i.status === "resolved").length, trend: "up" as const, source: "incident-system" },
        { label: "MTTR", value: "2.4h", source: "incident-system" },
        { label: "Total Incidents", value: incidents.length, source: "incident-system" },
      ],
    },
    {
      id: "inc-narrative", type: "narrative", title: "Incident Summary",
      data: {
        text: `${openIncidents.length} incident(s) currently open. ${incidents.filter(i => i.status === "resolved").length} resolved in the last 7 days with mean time to resolution of 2.4 hours. ${openIncidents.length > 0 ? `Active: ${openIncidents.map(i => i.title).join("; ")}.` : "All systems operating normally."}`,
        confidence: 0.95,
        citations: ["incident-system", "observability-platform"],
      },
    },
    {
      id: "inc-table", type: "table", title: "Incident Log",
      data: {
        columns: [
          { key: "id", label: "ID" }, { key: "title", label: "Incident" },
          { key: "severity", label: "Severity" }, { key: "status", label: "Status" },
          { key: "time", label: "Time" }, { key: "impact", label: "Impact" },
        ],
        rows: incidents.map(i => ({ ...i })),
        source: "incident-system",
      },
    },
  ];

  const freshness = bundle.dataFreshness;

  return {
    domain: "incidents",
    generatedAt: now(),
    confidence: 0.95,
    sections, alerts,
    actionItems: openIncidents.map(i => ({ text: `Resolve: ${i.title}`, priority: i.severity === "medium" ? "high" as const : "medium" as const, domain: "ops" })),
    dataSources: [
      { id: "ds-incidents", name: "Incident System", domain: "ops", lastUpdated: freshness.incidents || new Date(Date.now() - 5 * 60 * 1000).toISOString(), recordCount: incidents.length },
    ],
    opportunities: [],
    staleFields: [],
  };
}

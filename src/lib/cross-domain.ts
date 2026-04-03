// ============================================================
// SITA OS — Cross-Domain Intelligence Engine
// Evaluates data across domains and surfaces insights
// ============================================================

interface CrossDomainInsight {
  id: string;
  title: string;
  description: string;
  sourceDomain: "business" | "money" | "concierge" | "family";
  impactDomain: "business" | "money" | "concierge" | "family";
  severity: "info" | "warning" | "critical";
  suggestedAction?: string;
}

interface DomainData {
  invoices?: Array<{ id: string; status: string; amount: string; dueDate: string; client?: string }>;
  bills?: Array<{ id: string; status: string; amount: string; dueDate: string }>;
  leads?: Array<{ id: string; status: string; lastTouch: string; value: string }>;
  subscriptions?: Array<{ id: string; usage: string; status: string; totalCost: string }>;
  cashFlow?: { safeToSpend: string; available: string; outgoing: string };
  householdTasks?: Array<{ id: string; status: string; priority: string; due: string }>;
  familyEvents?: Array<{ id: string; when: string; title: string; who?: string }>;
  travel?: Array<{ id: string; trip: string; dates: string; status: string; gaps?: string[] }>;
}

export function evaluateCrossDomainIntelligence(data: DomainData): CrossDomainInsight[] {
  const insights: CrossDomainInsight[] = [];

  // 1. Overdue invoices → affect safe-to-spend in Money
  const overdueInvoices = data.invoices?.filter(i => i.status === "overdue") || [];
  if (overdueInvoices.length > 0) {
    const totalOverdue = overdueInvoices.reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);
    insights.push({
      id: `xd-invoice-cash-${Date.now()}`,
      title: `${overdueInvoices.length} overdue invoices affecting cash position`,
      description: `$${totalOverdue.toLocaleString()} in receivables are overdue — this directly reduces your safe-to-spend balance.`,
      sourceDomain: "business",
      impactDomain: "money",
      severity: totalOverdue > 5000 ? "critical" : "warning",
      suggestedAction: "Send follow-up reminders to overdue clients",
    });
  }

  // 2. Upcoming bills vs cash → spending alert
  const upcomingBills = data.bills?.filter(b => b.status === "upcoming" || b.status === "overdue") || [];
  if (upcomingBills.length > 0 && data.cashFlow) {
    const totalBills = upcomingBills.reduce((s, b) => s + parseFloat(b.amount.replace(/[$,]/g, "")), 0);
    const safeToSpend = parseFloat(data.cashFlow.safeToSpend.replace(/[$,]/g, ""));
    if (totalBills > safeToSpend * 0.8) {
      insights.push({
        id: `xd-bills-cash-${Date.now()}`,
        title: "Upcoming bills consuming most of safe-to-spend",
        description: `$${totalBills.toLocaleString()} in upcoming bills vs $${safeToSpend.toLocaleString()} safe-to-spend — tight margin.`,
        sourceDomain: "money",
        impactDomain: "money",
        severity: "warning",
        suggestedAction: "Review bill priority and defer non-essential payments",
      });
    }
  }

  // 3. Stale leads → revenue risk for business
  const staleLeads = data.leads?.filter(l => l.status === "cooling" || l.lastTouch?.includes("d ago")) || [];
  if (staleLeads.length >= 2) {
    const atRiskValue = staleLeads.reduce((s, l) => s + parseFloat(l.value.replace(/[$,]/g, "")), 0);
    insights.push({
      id: `xd-stale-leads-${Date.now()}`,
      title: `${staleLeads.length} leads cooling off — $${atRiskValue.toLocaleString()} at risk`,
      description: "Multiple leads haven't been contacted recently. Revenue pipeline is weakening.",
      sourceDomain: "business",
      impactDomain: "business",
      severity: "warning",
      suggestedAction: "Schedule follow-up calls for stale leads today",
    });
  }

  // 4. Subscription waste → money savings
  const wasteSubs = data.subscriptions?.filter(s => s.status === "waste" || s.status === "underused") || [];
  if (wasteSubs.length > 0) {
    const monthlySavings = wasteSubs.reduce((s, sub) => s + parseFloat(sub.totalCost.replace(/[$,]/g, "")), 0);
    insights.push({
      id: `xd-sub-waste-${Date.now()}`,
      title: `${wasteSubs.length} underused subscriptions — save $${monthlySavings.toFixed(0)}/mo`,
      description: "Subscriptions with low usage are costing money without delivering value.",
      sourceDomain: "money",
      impactDomain: "money",
      severity: "info",
      suggestedAction: "Review and cancel or downgrade underused subscriptions",
    });
  }

  // 5. Household overdue tasks → concierge urgency
  const overdueTasks = data.householdTasks?.filter(t => t.status === "pending" && t.priority === "high") || [];
  if (overdueTasks.length >= 2) {
    insights.push({
      id: `xd-household-overload-${Date.now()}`,
      title: `${overdueTasks.length} high-priority household tasks pending`,
      description: "Multiple urgent household items need attention — schedule time to clear the backlog.",
      sourceDomain: "concierge",
      impactDomain: "concierge",
      severity: "warning",
      suggestedAction: "Block 2 hours today for household tasks",
    });
  }

  // 6. Business receivables impact on personal cash position
  const pendingInvoices = data.invoices?.filter(i => i.status === "pending" || i.status === "overdue") || [];
  if (pendingInvoices.length > 0 && data.cashFlow) {
    const totalReceivables = pendingInvoices.reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);
    const available = parseFloat(data.cashFlow.available.replace(/[$,]/g, ""));
    const ratio = totalReceivables / available;
    if (ratio > 0.15) {
      insights.push({
        id: `xd-receivables-personal-${Date.now()}`,
        title: "Business receivables are affecting your personal cash",
        description: `$${totalReceivables.toLocaleString()} in outstanding receivables represents ${(ratio * 100).toFixed(0)}% of your available cash — collection delays impact personal spending power.`,
        sourceDomain: "business",
        impactDomain: "money",
        severity: ratio > 0.3 ? "critical" : "warning",
        suggestedAction: "Prioritize invoice collection to improve personal cash flow",
      });
    }
  }

  // 7. Family schedule conflicts with business follow-up timing
  const todayEvents = data.familyEvents?.filter(e => 
    e.when?.toLowerCase().includes("today") || e.when?.toLowerCase().includes("tomorrow")
  ) || [];
  const activeLeads = data.leads?.filter(l => l.status === "new" || l.status === "contacted") || [];
  if (todayEvents.length >= 2 && activeLeads.length > 0) {
    insights.push({
      id: `xd-family-followup-${Date.now()}`,
      title: "Busy family schedule may delay lead follow-ups",
      description: `${todayEvents.length} family events (${todayEvents.map(e => e.title).join(", ")}) overlap with ${activeLeads.length} active leads needing follow-up.`,
      sourceDomain: "family",
      impactDomain: "business",
      severity: "warning",
      suggestedAction: "Schedule follow-up calls for early morning before family commitments",
    });
  }

  // 8. Upcoming travel impacts money planning
  const upcomingTrips = data.travel?.filter(t => t.status === "booked" || t.status === "planning") || [];
  if (upcomingTrips.length > 0 && data.cashFlow) {
    const tripsWithGaps = upcomingTrips.filter(t => (t.gaps?.length || 0) > 0);
    const safeToSpend = parseFloat(data.cashFlow.safeToSpend.replace(/[$,]/g, ""));
    insights.push({
      id: `xd-travel-money-${Date.now()}`,
      title: `${upcomingTrips.length} upcoming trip${upcomingTrips.length > 1 ? "s" : ""} — budget impact ahead`,
      description: `Travel expenses will reduce your safe-to-spend ($${safeToSpend.toLocaleString()}).${tripsWithGaps.length > 0 ? ` ${tripsWithGaps.length} trip${tripsWithGaps.length > 1 ? "s" : ""} still ha${tripsWithGaps.length > 1 ? "ve" : "s"} unbooked items that may add costs.` : ""}`,
      sourceDomain: "concierge",
      impactDomain: "money",
      severity: tripsWithGaps.length > 0 ? "warning" : "info",
      suggestedAction: tripsWithGaps.length > 0 
        ? "Complete travel bookings to lock in prices and finalize budget"
        : "Set aside travel budget from safe-to-spend",
    });
  }

  // 9. Travel timing conflicts with business obligations
  if (upcomingTrips.length > 0 && activeLeads.length > 0) {
    insights.push({
      id: `xd-travel-business-${Date.now()}`,
      title: "Upcoming travel may affect deal timelines",
      description: `${upcomingTrips.map(t => t.trip).join(" & ")} could delay response to ${activeLeads.length} active lead${activeLeads.length > 1 ? "s" : ""}. Consider pre-scheduling responses.`,
      sourceDomain: "concierge",
      impactDomain: "business",
      severity: "info",
      suggestedAction: "Draft auto-responses and delegate urgent follow-ups before travel",
    });
  }

  return insights;
}

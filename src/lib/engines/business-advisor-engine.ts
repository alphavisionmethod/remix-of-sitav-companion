// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Intelligence Engine
// Structured advisor outputs, board synthesis, escalation packets
// Pure stateless engine — no I/O, no side effects
// ═══════════════════════════════════════════════════════════════

// ── Core Types ────────────────────────────────────────────────

export interface AdvisorOutput {
  advisorId: string;
  advisorName: string;
  module: string;
  domain: "business";
  summary: string;
  rationale: string;
  positiveSignals: string[];
  negativeSignals: string[];
  confidence: number; // 0-100
  assumptions: string[];
  suggestedActions: AdvisorAction[];
  escalationRecommendation: EscalationRec | null;
  urgency: "low" | "medium" | "high" | "critical";
  relatedObjects: RelatedObject[];
  timestamp: string;
}

export interface AdvisorAction {
  label: string;
  priority: "high" | "medium" | "low";
  type: "immediate" | "scheduled" | "monitor";
}

export interface EscalationRec {
  shouldEscalate: boolean;
  reason: string;
  severity: "medium" | "high" | "critical";
  packet?: Partial<EscalationPacket>;
}

export interface RelatedObject {
  type: "lead" | "opportunity" | "quote" | "account" | "owner" | "campaign";
  id: string;
  label: string;
}

export interface EscalationPacket {
  packetId: string;
  title: string;
  objectContext: { type: string; id: string; status: string; value: number; source: string; owner: string; priority: string };
  leadContext: { name: string; company: string; accountImportance: string; priorHistory: string; relationshipSensitivity: string };
  stageContext: { currentStage: string; priorMovement: string; stageAging: number; failurePoint: string; recoveryActive: boolean };
  communicationHistory: { lastTouch: string; silenceDays: number; missedCallbacks: number; toneHistory: string };
  advisorRationale: AdvisorRationaleEntry[];
  confidence: { level: "strong" | "moderate" | "limited"; basis: string; incompleteData: string[] };
  assumptions: string[];
  recoveryOptions: RecoveryOption[];
  recommendedMotion: { action: string; owner: string; timeline: string; successCriteria: string };
  disagreements: AdvisorDisagreement[];
  createdAt: string;
}

export interface AdvisorRationaleEntry {
  advisorName: string;
  position: string;
  confidence: number;
  agrees: boolean;
  keyFactors: string[];
}

export interface RecoveryOption {
  id: string;
  label: string;
  description: string;
  risk: "low" | "medium" | "high";
  likelihood: number;
}

export interface AdvisorDisagreement {
  disagreementId: string;
  advisorA: { name: string; position: string; confidence: number; factors: string[] };
  advisorB: { name: string; position: string; confidence: number; factors: string[] };
  reason: string;
  escalatable: boolean;
}

export interface BoardSynthesisTheme {
  themeId: string;
  title: string;
  description: string;
  severity: "info" | "watch" | "warning" | "critical";
  modules: string[];
  advisorAgreement: number; // 0-100
  escalationCandidate: boolean;
  metrics: { label: string; value: string; trend?: "up" | "down" | "flat" }[];
  contributingAdvisors: string[];
}

// ── Helper ────────────────────────────────────────────────────

const ts = () => new Date().toISOString();
const uid = () => crypto.randomUUID().slice(0, 8);

// ── Business Home Advisors ───────────────────────────────────

export function runSummaryAdvisor(data: {
  totalLeads: number; activeOpportunities: number; valueAtRisk: number;
  recoveryCount: number; quotesPending: number; overdueFollowups: number;
}): AdvisorOutput {
  const hasRisk = data.valueAtRisk > 10000 || data.overdueFollowups > 3;
  return {
    advisorId: "biz-summary", advisorName: "Business Summary Advisor", module: "business-home", domain: "business",
    summary: hasRisk
      ? `Revenue risk is building: $${(data.valueAtRisk / 1000).toFixed(0)}K at risk across ${data.recoveryCount} recovery candidates. ${data.overdueFollowups} overdue follow-ups need immediate attention before further slippage.`
      : `Business operations are stable. ${data.totalLeads} active leads, ${data.activeOpportunities} opportunities in motion. Pipeline health is positive with ${data.quotesPending} quotes pending response.`,
    rationale: `Analysis based on ${data.totalLeads} leads, ${data.activeOpportunities} opportunities, ${data.recoveryCount} recovery items, and ${data.overdueFollowups} overdue follow-ups.`,
    positiveSignals: [
      data.activeOpportunities > 5 ? "Strong opportunity pipeline" : "Opportunity pipeline active",
      data.totalLeads > 10 ? "Healthy lead volume" : "Lead flow present",
    ].filter(Boolean),
    negativeSignals: [
      data.valueAtRisk > 10000 ? `$${(data.valueAtRisk / 1000).toFixed(0)}K value at risk` : "",
      data.overdueFollowups > 3 ? `${data.overdueFollowups} overdue follow-ups` : "",
      data.recoveryCount > 5 ? `${data.recoveryCount} leads need recovery` : "",
    ].filter(Boolean),
    confidence: hasRisk ? 82 : 90,
    assumptions: ["CRM data is current within 24h", "Lead scoring reflects actual engagement"],
    suggestedActions: [
      ...(data.overdueFollowups > 0 ? [{ label: `Clear ${data.overdueFollowups} overdue follow-ups`, priority: "high" as const, type: "immediate" as const }] : []),
      ...(data.recoveryCount > 0 ? [{ label: `Review ${data.recoveryCount} recovery candidates`, priority: "high" as const, type: "immediate" as const }] : []),
      { label: "Review pipeline movement for this week", priority: "medium" as const, type: "scheduled" as const },
    ],
    escalationRecommendation: data.valueAtRisk > 25000 ? { shouldEscalate: true, reason: "Value at risk exceeds strategic threshold", severity: "high" } : null,
    urgency: hasRisk ? "high" : "medium",
    relatedObjects: [],
    timestamp: ts(),
  };
}

export function runPressureAdvisor(data: {
  responseBacklog: number; stageBlockage: number; ownerOverload: number;
  missedFollowups: number; quoteTimingPressure: number; recoveryLoad: number;
}): AdvisorOutput {
  const totalPressure = data.responseBacklog + data.stageBlockage + data.ownerOverload + data.missedFollowups;
  const level = totalPressure > 15 ? "critical" : totalPressure > 8 ? "high" : totalPressure > 3 ? "medium" : "low";
  return {
    advisorId: "biz-pressure", advisorName: "Pressure Advisor", module: "business-home", domain: "business",
    summary: level === "critical"
      ? `Operational pressure is critical. ${data.responseBacklog} items in response backlog, ${data.stageBlockage} stage blockages, and ${data.ownerOverload} overloaded owners creating compounding risk.`
      : level === "high"
        ? `Pressure building in ${[data.responseBacklog > 2 && "response queue", data.stageBlockage > 2 && "stage progression", data.missedFollowups > 2 && "follow-through"].filter(Boolean).join(", ")}. Address before cascade effects.`
        : `Operational pressure is manageable. No critical bottlenecks detected.`,
    rationale: `Pressure score: ${totalPressure}/40 from backlog (${data.responseBacklog}), blockage (${data.stageBlockage}), overload (${data.ownerOverload}), missed follow-ups (${data.missedFollowups}).`,
    positiveSignals: totalPressure < 5 ? ["All queues within capacity", "No owner overload detected"] : [],
    negativeSignals: [
      data.responseBacklog > 3 ? `Response backlog: ${data.responseBacklog} items` : "",
      data.stageBlockage > 2 ? `${data.stageBlockage} stage blockages` : "",
      data.ownerOverload > 1 ? `${data.ownerOverload} overloaded owners` : "",
    ].filter(Boolean),
    confidence: 85,
    assumptions: ["Workload data reflects current assignments", "No unreported informal task sharing"],
    suggestedActions: [
      ...(data.responseBacklog > 3 ? [{ label: "Clear response backlog — highest conversion impact", priority: "high" as const, type: "immediate" as const }] : []),
      ...(data.ownerOverload > 1 ? [{ label: "Redistribute overloaded owner assignments", priority: "high" as const, type: "immediate" as const }] : []),
      { label: "Monitor pressure indicators daily this week", priority: "medium" as const, type: "monitor" as const },
    ],
    escalationRecommendation: totalPressure > 15 ? { shouldEscalate: true, reason: "System-wide pressure exceeds safe operating threshold", severity: "critical" } : null,
    urgency: level as any,
    relatedObjects: [],
    timestamp: ts(),
  };
}

export function runPriorityAdvisor(data: {
  topLeads: { id: string; name: string; score: number; value: number }[];
  recoveryPriorities: { id: string; name: string; valueAtRisk: number }[];
  quotesUrgent: number;
}): AdvisorOutput {
  const topLead = data.topLeads[0];
  return {
    advisorId: "biz-priority", advisorName: "Priority Advisor", module: "business-home", domain: "business",
    summary: topLead
      ? `Top priority: ${topLead.name} (score ${topLead.score}, $${(topLead.value / 1000).toFixed(0)}K). ${data.recoveryPriorities.length} recovery items and ${data.quotesUrgent} urgent quotes also need attention today.`
      : `No critical priorities identified. Standard operating rhythm recommended.`,
    rationale: "Priority ranking combines lead scoring, recovery urgency, quote timing, and strategic value.",
    positiveSignals: topLead ? [`High-confidence lead: ${topLead.name}`] : ["No urgent items — capacity for proactive work"],
    negativeSignals: data.recoveryPriorities.length > 3 ? [`${data.recoveryPriorities.length} recovery items competing for attention`] : [],
    confidence: topLead ? 88 : 70,
    assumptions: ["Lead scores are current", "Recovery window estimates are accurate"],
    suggestedActions: [
      ...(topLead ? [{ label: `Advance ${topLead.name} — highest conversion potential`, priority: "high" as const, type: "immediate" as const }] : []),
      ...(data.quotesUrgent > 0 ? [{ label: `Review ${data.quotesUrgent} time-sensitive quotes`, priority: "high" as const, type: "immediate" as const }] : []),
      ...(data.recoveryPriorities.length > 0 ? [{ label: `Rescue top recovery: ${data.recoveryPriorities[0]?.name}`, priority: "medium" as const, type: "immediate" as const }] : []),
    ],
    escalationRecommendation: null,
    urgency: topLead && topLead.score > 85 ? "high" : "medium",
    relatedObjects: data.topLeads.slice(0, 3).map(l => ({ type: "lead" as const, id: l.id, label: l.name })),
    timestamp: ts(),
  };
}

// ── Leads Advisors ───────────────────────────────────────────

export function runLeadPrioritizationAdvisor(data: {
  leads: { id: string; name: string; score: number; value: number; lastActivity: number; fit: string }[];
}): AdvisorOutput {
  const urgent = data.leads.filter(l => l.score > 75);
  return {
    advisorId: "lead-prioritization", advisorName: "Lead Prioritization Advisor", module: "leads", domain: "business",
    summary: `${urgent.length} leads require immediate attention based on scoring and recency. ${data.leads.filter(l => l.fit === "strong").length} show strong fit signals.`,
    rationale: "Prioritization combines engagement recency, value potential, fit score, and owner response history.",
    positiveSignals: urgent.map(l => `${l.name}: score ${l.score}`),
    negativeSignals: data.leads.filter(l => l.lastActivity > 14).map(l => `${l.name}: ${l.lastActivity}d since activity`),
    confidence: 84,
    assumptions: ["Activity data is complete", "Scoring weights reflect current business priorities"],
    suggestedActions: urgent.slice(0, 3).map(l => ({ label: `Follow up with ${l.name}`, priority: "high" as const, type: "immediate" as const })),
    escalationRecommendation: null, urgency: urgent.length > 5 ? "high" : "medium",
    relatedObjects: urgent.slice(0, 5).map(l => ({ type: "lead" as const, id: l.id, label: l.name })),
    timestamp: ts(),
  };
}

export function runOpportunityAdvisor(data: {
  activeDeals: number; totalPipelineValue: number; stuckDeals: number; convertingThisWeek: number;
}): AdvisorOutput {
  return {
    advisorId: "opportunity", advisorName: "Opportunity Advisor", module: "leads", domain: "business",
    summary: `${data.activeDeals} active deals worth $${(data.totalPipelineValue / 1000).toFixed(0)}K in pipeline. ${data.convertingThisWeek} expected to convert this week. ${data.stuckDeals} deals are stuck and need intervention.`,
    rationale: "Opportunity analysis based on pipeline stage, deal velocity, and historical conversion patterns.",
    positiveSignals: [`$${(data.totalPipelineValue / 1000).toFixed(0)}K total pipeline value`, `${data.convertingThisWeek} deals nearing close`],
    negativeSignals: data.stuckDeals > 0 ? [`${data.stuckDeals} stuck deals blocking pipeline flow`] : [],
    confidence: 79,
    assumptions: ["Deal stage data is accurate", "Conversion estimates based on historical patterns"],
    suggestedActions: [
      ...(data.stuckDeals > 0 ? [{ label: `Unblock ${data.stuckDeals} stuck deals`, priority: "high" as const, type: "immediate" as const }] : []),
      { label: "Review pipeline velocity trends", priority: "medium" as const, type: "scheduled" as const },
    ],
    escalationRecommendation: data.stuckDeals > 3 ? { shouldEscalate: true, reason: "Multiple stuck deals indicate systemic process issue", severity: "medium" } : null,
    urgency: data.stuckDeals > 3 ? "high" : "medium",
    relatedObjects: [],
    timestamp: ts(),
  };
}

export function runQualificationAdvisor(data: {
  totalLeads: number; strongFit: number; weakFit: number; missingInfo: number;
}): AdvisorOutput {
  return {
    advisorId: "qualification", advisorName: "Qualification Advisor", module: "leads", domain: "business",
    summary: `${data.strongFit} of ${data.totalLeads} leads show strong qualification fit. ${data.weakFit} may need re-evaluation. ${data.missingInfo} have incomplete qualification data.`,
    rationale: "Qualification assessment combines source quality, inquiry depth, business profile match, and engagement signals.",
    positiveSignals: [`${data.strongFit} strong-fit leads identified`],
    negativeSignals: [
      ...(data.weakFit > 0 ? [`${data.weakFit} weak-fit leads consuming resources`] : []),
      ...(data.missingInfo > 0 ? [`${data.missingInfo} leads missing key qualification data`] : []),
    ],
    confidence: 76,
    assumptions: ["Business profile criteria are current", "Source quality ratings are calibrated"],
    suggestedActions: [
      ...(data.missingInfo > 0 ? [{ label: `Complete qualification for ${data.missingInfo} leads`, priority: "high" as const, type: "immediate" as const }] : []),
      ...(data.weakFit > 2 ? [{ label: "Review weak-fit leads for disqualification", priority: "medium" as const, type: "scheduled" as const }] : []),
    ],
    escalationRecommendation: null, urgency: data.missingInfo > 5 ? "high" : "medium",
    relatedObjects: [],
    timestamp: ts(),
  };
}

// ── Lead Inbox Advisors ──────────────────────────────────────

export function runTriageAdvisor(data: {
  itemName: string; source: string; inquiryQuality: string; urgency: boolean; missingFields: string[]; score: number;
}): AdvisorOutput {
  const accept = data.score >= 60 && data.inquiryQuality !== "low";
  return {
    advisorId: "triage", advisorName: "Triage Advisor", module: "lead-inbox", domain: "business",
    summary: accept
      ? `Recommend accepting ${data.itemName} — score ${data.score}, ${data.source} source, ${data.inquiryQuality} quality inquiry.`
      : `${data.itemName} needs review before acceptance. ${data.missingFields.length > 0 ? `Missing: ${data.missingFields.join(", ")}.` : "Quality indicators suggest caution."}`,
    rationale: `Score: ${data.score}. Source: ${data.source}. Quality: ${data.inquiryQuality}. Missing fields: ${data.missingFields.length}.`,
    positiveSignals: [data.score >= 70 ? "High scoring lead" : "", data.urgency ? "Urgent inquiry" : ""].filter(Boolean),
    negativeSignals: data.missingFields.map(f => `Missing: ${f}`),
    confidence: data.missingFields.length === 0 ? 88 : 65,
    assumptions: ["Source quality ratings are accurate"],
    suggestedActions: [{ label: accept ? "Accept and assign" : "Review before accepting", priority: accept ? "medium" as const : "high" as const, type: "immediate" as const }],
    escalationRecommendation: null, urgency: data.urgency ? "high" : "medium",
    relatedObjects: [{ type: "lead", id: data.itemName, label: data.itemName }],
    timestamp: ts(),
  };
}

export function runDuplicateReviewAdvisor(data: {
  itemName: string; duplicateConfidence: number; matchedWith: string;
}): AdvisorOutput {
  const isDupe = data.duplicateConfidence > 70;
  return {
    advisorId: "duplicate-review", advisorName: "Quality Review Advisor", module: "lead-inbox", domain: "business",
    summary: isDupe
      ? `High duplicate probability (${data.duplicateConfidence}%) — ${data.itemName} likely matches ${data.matchedWith}. Recommend merge review.`
      : `Low duplicate risk for ${data.itemName}. Safe to process normally.`,
    rationale: `Duplicate matching confidence: ${data.duplicateConfidence}% against ${data.matchedWith || "no match"}.`,
    positiveSignals: !isDupe ? ["Clean entry — no duplicates detected"] : [],
    negativeSignals: isDupe ? [`${data.duplicateConfidence}% match with ${data.matchedWith}`] : [],
    confidence: data.duplicateConfidence > 50 ? 82 : 90,
    assumptions: ["CRM matching uses name + email + company"],
    suggestedActions: isDupe ? [{ label: `Review merge with ${data.matchedWith}`, priority: "high" as const, type: "immediate" as const }] : [],
    escalationRecommendation: null, urgency: isDupe ? "medium" : "low",
    relatedObjects: [], timestamp: ts(),
  };
}

export function runOwnerSuggestionAdvisor(data: {
  suggestedOwner: string; reason: string; alternates: string[];
}): AdvisorOutput {
  return {
    advisorId: "owner-suggestion", advisorName: "Owner Suggestion Advisor", module: "lead-inbox", domain: "business",
    summary: `Recommended owner: ${data.suggestedOwner}. ${data.reason}`,
    rationale: data.reason,
    positiveSignals: [`${data.suggestedOwner} has matching expertise and availability`],
    negativeSignals: [],
    confidence: 78,
    assumptions: ["Owner workload data is current", "Territory assignments are up to date"],
    suggestedActions: [{ label: `Assign to ${data.suggestedOwner}`, priority: "medium" as const, type: "immediate" as const }],
    escalationRecommendation: null, urgency: "low",
    relatedObjects: [{ type: "owner", id: data.suggestedOwner, label: data.suggestedOwner }],
    timestamp: ts(),
  };
}

// ── Scoring Advisors ─────────────────────────────────────────

export function runScoringAdvisor(data: {
  leadName: string; score: number; previousScore: number; topFactors: string[]; bottomFactors: string[];
}): AdvisorOutput {
  const delta = data.score - data.previousScore;
  return {
    advisorId: "scoring", advisorName: "Scoring Advisor", module: "scoring", domain: "business",
    summary: `${data.leadName} scored ${data.score}/100 (${delta >= 0 ? "+" : ""}${delta} from prior). ${data.topFactors[0] || "No standout factors"} is the strongest driver.`,
    rationale: `Top factors: ${data.topFactors.join(", ")}. Weak factors: ${data.bottomFactors.join(", ")}.`,
    positiveSignals: data.topFactors.map(f => `Strong: ${f}`),
    negativeSignals: data.bottomFactors.map(f => `Weak: ${f}`),
    confidence: data.score > 70 ? 88 : 72,
    assumptions: ["Scoring model weights are calibrated"],
    suggestedActions: delta < -10 ? [{ label: "Investigate score drop", priority: "high" as const, type: "immediate" as const }] : [],
    escalationRecommendation: null, urgency: delta < -20 ? "high" : "medium",
    relatedObjects: [{ type: "lead", id: data.leadName, label: data.leadName }],
    timestamp: ts(),
  };
}

export function runConversionAdvisor(data: {
  leadName: string; likelihood: number; engagementLevel: string; fitScore: number;
}): AdvisorOutput {
  const band = data.likelihood >= 70 ? "High" : data.likelihood >= 40 ? "Moderate" : "Low";
  return {
    advisorId: "conversion", advisorName: "Conversion Advisor", module: "scoring", domain: "business",
    summary: `${band} conversion likelihood (${data.likelihood}%) for ${data.leadName}. Engagement: ${data.engagementLevel}, fit: ${data.fitScore}/100.`,
    rationale: `Conversion estimate combines engagement depth, fit score, and historical pattern matching.`,
    positiveSignals: data.likelihood >= 60 ? [`${data.engagementLevel} engagement level`, `Fit score: ${data.fitScore}`] : [],
    negativeSignals: data.likelihood < 40 ? ["Conversion likelihood below threshold"] : [],
    confidence: data.fitScore > 60 ? 80 : 60,
    assumptions: ["Historical conversion patterns are representative", "Engagement data is complete"],
    suggestedActions: data.likelihood < 50 ? [{ label: "Increase engagement before advancing", priority: "medium" as const, type: "scheduled" as const }] : [],
    escalationRecommendation: null, urgency: "low",
    relatedObjects: [{ type: "lead", id: data.leadName, label: data.leadName }],
    timestamp: ts(),
  };
}

export function runTimingAdvisor(data: {
  leadName: string; daysSinceLastContact: number; quoteAge: number; buyingUrgency: string;
}): AdvisorOutput {
  const stale = data.daysSinceLastContact > 14;
  return {
    advisorId: "timing", advisorName: "Timing Advisor", module: "scoring", domain: "business",
    summary: stale
      ? `${data.leadName} is going stale — ${data.daysSinceLastContact} days since last contact. Act now to prevent recovery territory.`
      : `Timing is favorable for ${data.leadName}. ${data.buyingUrgency} buying urgency detected.`,
    rationale: `Last contact: ${data.daysSinceLastContact}d ago. Quote age: ${data.quoteAge}d. Buying urgency: ${data.buyingUrgency}.`,
    positiveSignals: !stale ? ["Within optimal engagement window"] : [],
    negativeSignals: stale ? [`${data.daysSinceLastContact} days of silence`, data.quoteAge > 30 ? "Quote aging past response window" : ""].filter(Boolean) : [],
    confidence: 82,
    assumptions: ["Response window estimates are based on industry averages"],
    suggestedActions: stale ? [{ label: `Re-engage ${data.leadName} immediately`, priority: "high" as const, type: "immediate" as const }] : [{ label: "Monitor — timing is good", priority: "low" as const, type: "monitor" as const }],
    escalationRecommendation: null, urgency: stale ? "high" : "low",
    relatedObjects: [{ type: "lead", id: data.leadName, label: data.leadName }],
    timestamp: ts(),
  };
}

// ── Stages Advisors ──────────────────────────────────────────

export function runProgressionAdvisor(data: {
  totalInPipeline: number; advancedThisWeek: number; avgDaysInStage: number;
}): AdvisorOutput {
  const healthy = data.advancedThisWeek > 2 && data.avgDaysInStage < 14;
  return {
    advisorId: "progression", advisorName: "Progression Advisor", module: "stages", domain: "business",
    summary: healthy
      ? `Pipeline progression is healthy — ${data.advancedThisWeek} leads advanced this week with ${data.avgDaysInStage}d average stage time.`
      : `Progression is slowing. Only ${data.advancedThisWeek} advances this week, avg ${data.avgDaysInStage}d in stage.`,
    rationale: `${data.totalInPipeline} in pipeline, ${data.advancedThisWeek} moved forward, average ${data.avgDaysInStage} days per stage.`,
    positiveSignals: healthy ? ["Healthy progression velocity", "Stage times within target"] : [],
    negativeSignals: !healthy ? ["Progression velocity below target"] : [],
    confidence: 83, assumptions: ["Stage transitions are recorded accurately"],
    suggestedActions: !healthy ? [{ label: "Review stuck leads for intervention", priority: "high" as const, type: "immediate" as const }] : [],
    escalationRecommendation: null, urgency: !healthy ? "high" : "low",
    relatedObjects: [], timestamp: ts(),
  };
}

export function runStuckStageAdvisor(data: {
  stuckLeads: { id: string; name: string; stage: string; daysStuck: number }[];
}): AdvisorOutput {
  return {
    advisorId: "stuck-stage", advisorName: "Stuck-Stage Advisor", module: "stages", domain: "business",
    summary: data.stuckLeads.length > 0
      ? `${data.stuckLeads.length} leads are stuck: ${data.stuckLeads.slice(0, 3).map(l => `${l.name} (${l.stage}, ${l.daysStuck}d)`).join(", ")}.`
      : "No stuck leads detected — all progressing normally.",
    rationale: "Stage aging analysis identifies leads exceeding expected time in current stage.",
    positiveSignals: data.stuckLeads.length === 0 ? ["All leads progressing on schedule"] : [],
    negativeSignals: data.stuckLeads.map(l => `${l.name}: ${l.daysStuck}d stuck in ${l.stage}`),
    confidence: 86, assumptions: ["Expected stage durations are calibrated to business type"],
    suggestedActions: data.stuckLeads.slice(0, 3).map(l => ({ label: `Intervene on ${l.name} — ${l.daysStuck}d in ${l.stage}`, priority: "high" as const, type: "immediate" as const })),
    escalationRecommendation: data.stuckLeads.length > 5 ? { shouldEscalate: true, reason: "Systemic stage blockage detected", severity: "medium" } : null,
    urgency: data.stuckLeads.length > 3 ? "high" : "medium",
    relatedObjects: data.stuckLeads.slice(0, 5).map(l => ({ type: "lead" as const, id: l.id, label: l.name })),
    timestamp: ts(),
  };
}

export function runLifecycleAdvisor(data: {
  avgCycleTime: number; conversionRate: number; dropoffStage: string; recoveryRateFromDropoff: number;
}): AdvisorOutput {
  return {
    advisorId: "lifecycle", advisorName: "Lifecycle Advisor", module: "stages", domain: "business",
    summary: `Average lifecycle: ${data.avgCycleTime}d. Conversion rate: ${data.conversionRate}%. Biggest drop-off at ${data.dropoffStage} (${data.recoveryRateFromDropoff}% recovery rate from that point).`,
    rationale: "Lifecycle analysis tracks leads from intake through conversion or recovery.",
    positiveSignals: data.conversionRate > 25 ? ["Above-average conversion rate"] : [],
    negativeSignals: data.recoveryRateFromDropoff < 30 ? [`Low recovery rate from ${data.dropoffStage}`] : [],
    confidence: 77, assumptions: ["Lifecycle data spans at least 90 days"],
    suggestedActions: [{ label: `Improve ${data.dropoffStage} stage handling`, priority: "medium" as const, type: "scheduled" as const }],
    escalationRecommendation: null, urgency: "low",
    relatedObjects: [], timestamp: ts(),
  };
}

// ── Recovery Advisors ────────────────────────────────────────

export function runRecoveryAdvisor(data: {
  name: string; recoveryScore: number; failureMode: string; valueAtRisk: number; daysSince: number; successBand: string;
}): AdvisorOutput {
  const worth = data.recoveryScore >= 50 && data.valueAtRisk >= 2000;
  return {
    advisorId: "recovery", advisorName: "Recovery Advisor", module: "lead-recovery", domain: "business",
    summary: worth
      ? `${data.name} is worth recovering (score ${data.recoveryScore}, $${(data.valueAtRisk / 1000).toFixed(1)}K at risk). Failure: ${data.failureMode}. Success band: ${data.successBand}.`
      : `${data.name} has limited recovery potential (score ${data.recoveryScore}). Consider archiving or low-effort reactivation.`,
    rationale: `Recovery score: ${data.recoveryScore}/100. Value: $${data.valueAtRisk}. Days since action: ${data.daysSince}. Failure mode: ${data.failureMode}.`,
    positiveSignals: worth ? [`$${(data.valueAtRisk / 1000).toFixed(1)}K recoverable value`, `Score ${data.recoveryScore}`] : [],
    negativeSignals: [`${data.daysSince}d since last action`, `Failure: ${data.failureMode}`],
    confidence: data.recoveryScore > 70 ? 85 : 68,
    assumptions: ["Recovery window is still open", "Lead contact info is valid"],
    suggestedActions: worth ? [{ label: "Initiate recovery sequence", priority: "high" as const, type: "immediate" as const }] : [{ label: "Low-effort reactivation or archive", priority: "low" as const, type: "scheduled" as const }],
    escalationRecommendation: data.valueAtRisk > 15000 ? { shouldEscalate: true, reason: "High-value recovery requires strategic handling", severity: "high" } : null,
    urgency: data.daysSince < 14 ? "high" : data.daysSince < 30 ? "medium" : "low",
    relatedObjects: [{ type: "lead", id: data.name, label: data.name }],
    timestamp: ts(),
  };
}

export function runCommunicationRecoveryAdvisor(data: {
  name: string; messageHistory: number; noResponseCount: number; lastTone: string; failureMode: string;
}): AdvisorOutput {
  const channelSwitch = data.noResponseCount >= 3;
  return {
    advisorId: "comm-recovery", advisorName: "Communication Recovery Advisor", module: "lead-recovery", domain: "business",
    summary: channelSwitch
      ? `${data.name} has not responded to ${data.noResponseCount} attempts. Switch channel and tone. Previous tone: ${data.lastTone}. Consider softer, value-led approach.`
      : `Standard recovery outreach for ${data.name}. ${data.messageHistory} prior messages, last tone: ${data.lastTone}.`,
    rationale: `${data.noResponseCount} unanswered attempts via current channel. Message history: ${data.messageHistory}. Failure mode: ${data.failureMode}.`,
    positiveSignals: !channelSwitch ? ["Contact has responded to prior messages"] : [],
    negativeSignals: channelSwitch ? [`${data.noResponseCount} unanswered attempts`] : [],
    confidence: 74,
    assumptions: ["Contact info is still valid", "No spam/block filters active"],
    suggestedActions: [
      channelSwitch
        ? { label: "Switch to alternate channel (phone/LinkedIn)", priority: "high" as const, type: "immediate" as const }
        : { label: "Send recovery message with updated value prop", priority: "medium" as const, type: "immediate" as const },
    ],
    escalationRecommendation: null, urgency: channelSwitch ? "medium" : "low",
    relatedObjects: [{ type: "lead", id: data.name, label: data.name }],
    timestamp: ts(),
  };
}

export function runRevenueRescueAdvisor(data: {
  name: string; valueAtRisk: number; recoveryProbability: number; accountTier: string; strategicRelevance: string;
}): AdvisorOutput {
  const strategic = data.accountTier === "enterprise" || data.strategicRelevance === "high";
  return {
    advisorId: "revenue-rescue", advisorName: "Revenue Rescue Advisor", module: "lead-recovery", domain: "business",
    summary: strategic
      ? `Strategic rescue priority: ${data.name} ($${(data.valueAtRisk / 1000).toFixed(1)}K, ${data.accountTier} tier). ${data.recoveryProbability}% recovery probability. Boardroom visibility recommended.`
      : `${data.name}: $${(data.valueAtRisk / 1000).toFixed(1)}K at risk with ${data.recoveryProbability}% recovery chance. Standard recovery path appropriate.`,
    rationale: `Value: $${data.valueAtRisk}. Account tier: ${data.accountTier}. Strategic relevance: ${data.strategicRelevance}. Recovery probability: ${data.recoveryProbability}%.`,
    positiveSignals: [`$${(data.valueAtRisk / 1000).toFixed(1)}K potential recovery`],
    negativeSignals: data.recoveryProbability < 40 ? ["Low recovery probability"] : [],
    confidence: data.recoveryProbability > 60 ? 82 : 62,
    assumptions: ["Value estimates are based on last proposal/quote", "Account tier reflects current relationship"],
    suggestedActions: [
      strategic
        ? { label: "Escalate for senior-level outreach", priority: "high" as const, type: "immediate" as const }
        : { label: "Standard recovery sequence", priority: "medium" as const, type: "immediate" as const },
    ],
    escalationRecommendation: strategic ? { shouldEscalate: true, reason: `Strategic ${data.accountTier} account with $${(data.valueAtRisk / 1000).toFixed(1)}K at risk`, severity: "high" } : null,
    urgency: strategic ? "high" : "medium",
    relatedObjects: [{ type: "account", id: data.name, label: data.name }],
    timestamp: ts(),
  };
}

// ── Board Synthesis ──────────────────────────────────────────

export function synthesizeBusinessBoard(allOutputs: AdvisorOutput[]): BoardSynthesisTheme[] {
  const themes: BoardSynthesisTheme[] = [];

  // Revenue Risk theme
  const riskAdvisors = allOutputs.filter(a => a.negativeSignals.some(s => s.toLowerCase().includes("risk") || s.toLowerCase().includes("value")));
  if (riskAdvisors.length > 0) {
    themes.push({
      themeId: `theme-${uid()}`, title: "Revenue Risk Accumulation",
      description: `${riskAdvisors.length} advisors are flagging revenue risk signals across ${[...new Set(riskAdvisors.map(a => a.module))].length} modules.`,
      severity: riskAdvisors.some(a => a.urgency === "critical") ? "critical" : "warning",
      modules: [...new Set(riskAdvisors.map(a => a.module))],
      advisorAgreement: Math.round(riskAdvisors.filter(a => a.confidence > 70).length / riskAdvisors.length * 100),
      escalationCandidate: riskAdvisors.some(a => a.escalationRecommendation?.shouldEscalate),
      metrics: [{ label: "Advisors Flagging", value: `${riskAdvisors.length}` }],
      contributingAdvisors: riskAdvisors.map(a => a.advisorName),
    });
  }

  // Operational Weakness theme
  const pressureAdvisors = allOutputs.filter(a => a.module === "business-home" && a.advisorId === "biz-pressure" && a.urgency !== "low");
  const stuckAdvisors = allOutputs.filter(a => a.advisorId === "stuck-stage" && a.negativeSignals.length > 0);
  if (pressureAdvisors.length > 0 || stuckAdvisors.length > 0) {
    themes.push({
      themeId: `theme-${uid()}`, title: "Operational Bottleneck",
      description: "Pressure and stage blockage signals indicate operational constraints are limiting conversion velocity.",
      severity: pressureAdvisors.some(a => a.urgency === "critical") ? "critical" : "watch",
      modules: [...new Set([...pressureAdvisors, ...stuckAdvisors].map(a => a.module))],
      advisorAgreement: 85,
      escalationCandidate: pressureAdvisors.some(a => a.escalationRecommendation?.shouldEscalate),
      metrics: [{ label: "Blocked Items", value: `${stuckAdvisors.flatMap(a => a.negativeSignals).length}` }],
      contributingAdvisors: [...pressureAdvisors, ...stuckAdvisors].map(a => a.advisorName),
    });
  }

  // Recovery Opportunity theme
  const recoveryAdvisors = allOutputs.filter(a => a.module === "lead-recovery");
  if (recoveryAdvisors.length > 0) {
    themes.push({
      themeId: `theme-${uid()}`, title: "Recovery Opportunity Window",
      description: `${recoveryAdvisors.length} recovery advisors identify actionable rescue opportunities with varying success probabilities.`,
      severity: recoveryAdvisors.some(a => a.urgency === "high") ? "warning" : "info",
      modules: ["lead-recovery"],
      advisorAgreement: Math.round(recoveryAdvisors.filter(a => a.confidence > 70).length / recoveryAdvisors.length * 100),
      escalationCandidate: recoveryAdvisors.some(a => a.escalationRecommendation?.shouldEscalate),
      metrics: [{ label: "Recovery Candidates", value: `${recoveryAdvisors.length}` }],
      contributingAdvisors: recoveryAdvisors.map(a => a.advisorName),
    });
  }

  // Qualification Gap theme
  const qualAdvisors = allOutputs.filter(a => a.advisorId === "qualification" && a.negativeSignals.length > 0);
  if (qualAdvisors.length > 0) {
    themes.push({
      themeId: `theme-${uid()}`, title: "Qualification Gaps",
      description: "Missing qualification data and weak-fit leads are diluting pipeline quality.",
      severity: "watch", modules: ["leads"],
      advisorAgreement: 78, escalationCandidate: false,
      metrics: [{ label: "Gaps Found", value: `${qualAdvisors.flatMap(a => a.negativeSignals).length}` }],
      contributingAdvisors: qualAdvisors.map(a => a.advisorName),
    });
  }

  // Timing Sensitivity theme
  const timingAdvisors = allOutputs.filter(a => a.advisorId === "timing" && a.urgency === "high");
  if (timingAdvisors.length > 0) {
    themes.push({
      themeId: `theme-${uid()}`, title: "Time-Sensitive Actions",
      description: `${timingAdvisors.length} leads have time-sensitive engagement windows. Delayed action will reduce conversion probability.`,
      severity: "warning", modules: ["scoring"],
      advisorAgreement: 90, escalationCandidate: false,
      metrics: [{ label: "Urgent Leads", value: `${timingAdvisors.length}` }],
      contributingAdvisors: timingAdvisors.map(a => a.advisorName),
    });
  }

  return themes;
}

// ── Escalation Packet Builder ────────────────────────────────

export function buildEscalationPacket(lead: {
  name: string; company: string; value: number; stage: string; daysSince: number;
  failureMode: string; owner: string; sensitivity: string;
}, advisors: AdvisorOutput[]): EscalationPacket {
  const disagreements = detectAdvisorDisagreements(advisors);
  return {
    packetId: `esc-${uid()}`,
    title: `Strategic review required: ${lead.name} — $${(lead.value / 1000).toFixed(0)}K at risk`,
    objectContext: { type: "lead", id: lead.name, status: lead.stage, value: lead.value, source: "CRM", owner: lead.owner, priority: "high" },
    leadContext: { name: lead.name, company: lead.company, accountImportance: lead.value > 15000 ? "strategic" : "standard", priorHistory: `${lead.daysSince}d since last action`, relationshipSensitivity: lead.sensitivity },
    stageContext: { currentStage: lead.stage, priorMovement: "See timeline", stageAging: lead.daysSince, failurePoint: lead.failureMode, recoveryActive: true },
    communicationHistory: { lastTouch: `${lead.daysSince}d ago`, silenceDays: lead.daysSince, missedCallbacks: 0, toneHistory: "See message history" },
    advisorRationale: advisors.map(a => ({ advisorName: a.advisorName, position: a.summary, confidence: a.confidence, agrees: !a.negativeSignals.some(s => s.includes("Low")), keyFactors: [...a.positiveSignals.slice(0, 2), ...a.negativeSignals.slice(0, 2)] })),
    confidence: { level: advisors.every(a => a.confidence > 75) ? "strong" : advisors.some(a => a.confidence > 60) ? "moderate" : "limited", basis: "Multi-advisor consensus", incompleteData: advisors.flatMap(a => a.assumptions).slice(0, 3) },
    assumptions: [...new Set(advisors.flatMap(a => a.assumptions))],
    recoveryOptions: [
      { id: "ro-1", label: "Same-owner rescue", description: "Current owner re-engages with updated approach", risk: "low", likelihood: 60 },
      { id: "ro-2", label: "Reassignment", description: "Transfer to fresh owner with context briefing", risk: "medium", likelihood: 55 },
      { id: "ro-3", label: "Senior outreach", description: "Founder or director-level personal contact", risk: "low", likelihood: 75 },
      { id: "ro-4", label: "Defer & monitor", description: "Set 30-day recheck — no immediate action", risk: "medium", likelihood: 30 },
    ],
    recommendedMotion: { action: "Initiate strategic rescue sequence", owner: lead.owner, timeline: "Within 48 hours", successCriteria: "Response received and engagement re-established" },
    disagreements,
    createdAt: ts(),
  };
}

// ── Disagreement Detector ────────────────────────────────────

export function detectAdvisorDisagreements(advisors: AdvisorOutput[]): AdvisorDisagreement[] {
  const disagreements: AdvisorDisagreement[] = [];

  for (let i = 0; i < advisors.length; i++) {
    for (let j = i + 1; j < advisors.length; j++) {
      const a = advisors[i], b = advisors[j];
      // Detect urgency disagreement
      const urgencyMap = { low: 0, medium: 1, high: 2, critical: 3 };
      if (Math.abs(urgencyMap[a.urgency] - urgencyMap[b.urgency]) >= 2) {
        disagreements.push({
          disagreementId: `dis-${uid()}`,
          advisorA: { name: a.advisorName, position: a.summary.slice(0, 120), confidence: a.confidence, factors: a.positiveSignals.slice(0, 2) },
          advisorB: { name: b.advisorName, position: b.summary.slice(0, 120), confidence: b.confidence, factors: b.negativeSignals.slice(0, 2) },
          reason: `Urgency disagreement: ${a.advisorName} says ${a.urgency}, ${b.advisorName} says ${b.urgency}`,
          escalatable: true,
        });
      }
      // Detect confidence split
      if (Math.abs(a.confidence - b.confidence) > 25) {
        disagreements.push({
          disagreementId: `dis-${uid()}`,
          advisorA: { name: a.advisorName, position: a.summary.slice(0, 120), confidence: a.confidence, factors: a.positiveSignals.slice(0, 2) },
          advisorB: { name: b.advisorName, position: b.summary.slice(0, 120), confidence: b.confidence, factors: b.negativeSignals.slice(0, 2) },
          reason: `Confidence split: ${a.advisorName} at ${a.confidence}% vs ${b.advisorName} at ${b.confidence}%`,
          escalatable: Math.abs(a.confidence - b.confidence) > 35,
        });
      }
    }
  }

  return disagreements;
}

// ── Generate demo advisor outputs for a recovery candidate ──

export function generateRecoveryAdvisors(candidate: {
  name: string; recoveryScore: number; failureMode: string; valueAtRisk: number;
  daysSinceLastAction: number; successBand: string; boardroomCandidate: boolean;
}): AdvisorOutput[] {
  return [
    runRecoveryAdvisor({
      name: candidate.name, recoveryScore: candidate.recoveryScore,
      failureMode: candidate.failureMode, valueAtRisk: candidate.valueAtRisk,
      daysSince: candidate.daysSinceLastAction, successBand: candidate.successBand,
    }),
    runCommunicationRecoveryAdvisor({
      name: candidate.name, messageHistory: 4, noResponseCount: candidate.daysSinceLastAction > 30 ? 3 : 1,
      lastTone: "professional", failureMode: candidate.failureMode,
    }),
    runRevenueRescueAdvisor({
      name: candidate.name, valueAtRisk: candidate.valueAtRisk,
      recoveryProbability: candidate.recoveryScore,
      accountTier: candidate.valueAtRisk > 15000 ? "enterprise" : "standard",
      strategicRelevance: candidate.boardroomCandidate ? "high" : "standard",
    }),
  ];
}

// ── Generate demo advisors for inbox triage ──────────────────

export function generateInboxAdvisors(item: {
  name: string; source: string; score: number; urgency: boolean; missingFields: string[];
}): AdvisorOutput[] {
  return [
    runTriageAdvisor({ itemName: item.name, source: item.source, inquiryQuality: item.score >= 60 ? "good" : "mixed", urgency: item.urgency, missingFields: item.missingFields, score: item.score }),
    runDuplicateReviewAdvisor({ itemName: item.name, duplicateConfidence: Math.random() > 0.7 ? 75 : 15, matchedWith: "Existing CRM contact" }),
    runOwnerSuggestionAdvisor({ suggestedOwner: "Sarah K.", reason: "Best match by territory and availability", alternates: ["Mike R.", "Jordan T."] }),
  ];
}

// ── Generate demo Business Home advisors ─────────────────────

export function generateHomeAdvisors(): AdvisorOutput[] {
  return [
    runSummaryAdvisor({ totalLeads: 42, activeOpportunities: 12, valueAtRisk: 18500, recoveryCount: 8, quotesPending: 5, overdueFollowups: 4 }),
    runPressureAdvisor({ responseBacklog: 5, stageBlockage: 3, ownerOverload: 2, missedFollowups: 4, quoteTimingPressure: 3, recoveryLoad: 8 }),
    runPriorityAdvisor({ topLeads: [{ id: "l1", name: "David Chen", score: 89, value: 17000 }, { id: "l2", name: "Rachel Adams", score: 72, value: 28000 }], recoveryPriorities: [{ id: "r1", name: "James Morton", valueAtRisk: 6000 }], quotesUrgent: 2 }),
  ];
}

// ── Generate Stages advisors ─────────────────────────────────

export function generateStagesAdvisors(data?: {
  totalInPipeline?: number; advancedThisWeek?: number; avgDaysInStage?: number;
  stuckLeads?: { id: string; name: string; stage: string; daysStuck: number }[];
  avgCycleTime?: number; conversionRate?: number; dropoffStage?: string; recoveryRateFromDropoff?: number;
}): AdvisorOutput[] {
  const d = data || {};
  return [
    runProgressionAdvisor({
      totalInPipeline: d.totalInPipeline ?? 42,
      advancedThisWeek: d.advancedThisWeek ?? 4,
      avgDaysInStage: d.avgDaysInStage ?? 11,
    }),
    runStuckStageAdvisor({
      stuckLeads: d.stuckLeads ?? [
        { id: "s1", name: "James Morton", stage: "Proposal", daysStuck: 45 },
        { id: "s2", name: "Taylor Kim", stage: "Demo", daysStuck: 30 },
        { id: "s3", name: "Alex Rivera", stage: "Negotiation", daysStuck: 22 },
      ],
    }),
    runLifecycleAdvisor({
      avgCycleTime: d.avgCycleTime ?? 28,
      conversionRate: d.conversionRate ?? 32,
      dropoffStage: d.dropoffStage ?? "Proposal",
      recoveryRateFromDropoff: d.recoveryRateFromDropoff ?? 35,
    }),
  ];
}

// ── Generate Opportunity advisors ────────────────────────────

export function generateOpportunityAdvisors(data?: {
  leads?: { id: string; name: string; score: number; value: number; lastActivity: number; fit: string }[];
  activeDeals?: number; totalPipelineValue?: number; stuckDeals?: number; convertingThisWeek?: number;
  totalLeads?: number; strongFit?: number; weakFit?: number; missingInfo?: number;
}): AdvisorOutput[] {
  const d = data || {};
  return [
    runLeadPrioritizationAdvisor({
      leads: d.leads ?? [
        { id: "l1", name: "David Chen", score: 89, value: 17000, lastActivity: 3, fit: "strong" },
        { id: "l2", name: "Rachel Adams", score: 72, value: 28000, lastActivity: 8, fit: "strong" },
        { id: "l3", name: "Lisa Park", score: 64, value: 6400, lastActivity: 38, fit: "moderate" },
      ],
    }),
    runOpportunityAdvisor({
      activeDeals: d.activeDeals ?? 12,
      totalPipelineValue: d.totalPipelineValue ?? 185000,
      stuckDeals: d.stuckDeals ?? 3,
      convertingThisWeek: d.convertingThisWeek ?? 2,
    }),
    runQualificationAdvisor({
      totalLeads: d.totalLeads ?? 42,
      strongFit: d.strongFit ?? 18,
      weakFit: d.weakFit ?? 8,
      missingInfo: d.missingInfo ?? 5,
    }),
  ];
}

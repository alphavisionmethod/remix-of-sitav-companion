// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor & Mission Control Mock Data
// Premium mock data for customer-facing advisors and admin ops
// ═══════════════════════════════════════════════════════════════

export type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "sales" | "treasury" | "waste" | "calendar" | "travel" | "risk" | "boardroom";

export interface AdvisorSummary {
  id: string;
  name: string;
  domain: AdvisorDomain;
  mission: string;
  specialAbility: string;
  confidence: number;
  uncertainty: string | null;
  topMove: string;
  pendingApprovals: number;
  availableSimulations: number;
  recentActions: number;
  memoryItems: number;
  status: "active" | "learning" | "degraded" | "paused";
  icon: string;
}

export interface AdvisorRecommendation {
  id: string;
  advisorId: string;
  advisorName: string;
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  urgency: "critical" | "high" | "medium" | "low";
  sources: string[];
  linkedEntities: string[];
  requiresApproval: boolean;
  canSimulate: boolean;
  createdAt: string;
  category: string;
}

export interface SimulationResult {
  id: string;
  title: string;
  scenarioA: { label: string; impact: string; risk: string; confidence: number };
  scenarioB: { label: string; impact: string; risk: string; confidence: number };
  assumptions: string[];
  dataUsed: string[];
  recommendation: string;
  advisors: string[];
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  action: string;
  advisors: string[];
  reason: string;
  expectedImpact: string;
  ifDelayed: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  policyRule: string;
  linkedEntities: string[];
  proofWillExist: string;
  createdAt: string;
  expiresAt: string;
}

export interface ProofHistoryItem {
  id: string;
  type: "recommendation" | "approval" | "execution" | "simulation" | "rollback" | "verification";
  title: string;
  advisor: string;
  outcome: "accepted" | "rejected" | "executed" | "verified" | "rolled-back";
  confidence: number;
  receiptHash: string;
  whatChanged: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  category: "fact" | "preference" | "inference" | "observation" | "instruction";
  key: string;
  value: string;
  source: string;
  confidence: number;
  privacy: "public" | "internal" | "confidential" | "restricted";
  canCorrect: boolean;
  canForget: boolean;
  createdAt: string;
}

export interface MultiAdvisorSynthesis {
  id: string;
  title: string;
  participants: { name: string; recommendation: string; confidence: number }[];
  primaryRecommendation: string;
  alternatePath: string;
  disagreements: string[];
  overlap: string[];
  assumptions: string[];
  requiresApproval: boolean;
  canSimulate: boolean;
}

// ── Internal Agent Types ────────────────────────────────────────────────────

export interface InternalAgentSummary {
  id: string;
  name: string;
  role: string;
  mission: string;
  health: "healthy" | "degraded" | "critical" | "paused";
  autonomyLevel: string;
  currentTasks: string[];
  recentFindings: string[];
  permissions: string[];
  escalationTargets: string[];
  lastMajorAction: string;
  invocations24h: number;
  costTokens24h: number;
}

export interface IncidentSummary {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  scope: string;
  affectedFlows: string[];
  rootCause: string;
  recommendedActions: string[];
  rollbackSuggestion: string | null;
  status: "open" | "investigating" | "mitigated" | "resolved";
  createdAt: string;
  timeline: { time: string; event: string }[];
}

export interface ConnectorHealthItem {
  id: string;
  name: string;
  service: string;
  status: "connected" | "degraded" | "disconnected" | "error";
  healthScore: number;
  errorRate: string;
  recentFailures: number;
  lastSync: string;
  impactedWorkflows: string[];
  nextSteps: string;
}

export interface StuckWorkflow {
  id: string;
  name: string;
  state: string;
  stuckSince: string;
  reason: string;
  impactedEntities: string[];
  retrySuggestion: string;
  rollbackAvailable: boolean;
  humanRequired: boolean;
}

export interface CostAnomaly {
  id: string;
  type: "spike" | "budget-exceeded" | "low-value-loop" | "premium-overuse";
  description: string;
  amount: string;
  advisor: string;
  timeframe: string;
  recommendation: string;
}

export interface PolicyAnomaly {
  id: string;
  type: "approval-bypass" | "trust-incident" | "permission-drift" | "autonomy-escalation";
  description: string;
  severity: "high" | "medium" | "low";
  affectedEntity: string;
  recommendation: string;
  createdAt: string;
}

export interface ReleaseSafetyState {
  currentRing: "canary" | "staging" | "production";
  rolloutProgress: number;
  canaryStatus: "healthy" | "degraded" | "failed";
  regressionAlerts: number;
  linkedIncidents: string[];
  safeModeActive: boolean;
  lastDeployment: string;
  rollbackAvailable: boolean;
}

export interface SafeModeState {
  globalSafeMode: boolean;
  advisorOnlyMode: boolean;
  executionDisabled: boolean;
  connectorPaused: boolean;
  boardroomReadOnly: boolean;
  sensitiveDomainsLocked: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

export const mockAdvisors: AdvisorSummary[] = [
  { id: "adv-business", name: "Business Advisor", domain: "business", mission: "Grow revenue, close deals, retain clients", specialAbility: "Pipeline velocity & deal risk scoring", confidence: 0.87, uncertainty: null, topMove: "Follow up with Bloom Studio — proposal expires in 3 days", pendingApprovals: 1, availableSimulations: 2, recentActions: 5, memoryItems: 23, status: "active", icon: "Briefcase" },
  { id: "adv-money", name: "Money Advisor", domain: "money", mission: "Protect cash, reduce waste, optimize timing", specialAbility: "Cash timing prediction & waste detection", confidence: 0.92, uncertainty: null, topMove: "Pay insurance premium today — $45 late fee risk", pendingApprovals: 2, availableSimulations: 3, recentActions: 8, memoryItems: 31, status: "active", icon: "DollarSign" },
  { id: "adv-concierge", name: "Concierge Advisor", domain: "concierge", mission: "Coordinate household, manage tasks, streamline life", specialAbility: "Schedule conflict detection & task prioritization", confidence: 0.84, uncertainty: "School pickup time may have changed", topMove: "Reschedule dentist — conflicts with parent-teacher conf", pendingApprovals: 0, availableSimulations: 1, recentActions: 12, memoryItems: 45, status: "active", icon: "Headphones" },
  { id: "adv-family", name: "Family Advisor", domain: "family", mission: "Support family coordination, events, and milestones", specialAbility: "Family calendar synthesis & gift tracking", confidence: 0.79, uncertainty: "Unclear if summer camp deposit was paid", topMove: "Mom's birthday in 12 days — no plan yet", pendingApprovals: 0, availableSimulations: 0, recentActions: 3, memoryItems: 18, status: "active", icon: "Heart" },
  { id: "adv-growth", name: "Growth Advisor", domain: "growth", mission: "Find opportunities, recover stale leads, optimize pipeline", specialAbility: "Lead scoring & re-engagement timing", confidence: 0.81, uncertainty: null, topMove: "Re-engage James Morton — 5 days silent, was warm lead", pendingApprovals: 0, availableSimulations: 2, recentActions: 4, memoryItems: 14, status: "active", icon: "TrendingUp" },
  { id: "adv-sales", name: "Sales Advisor", domain: "sales", mission: "Close deals faster, improve win rates", specialAbility: "Negotiation timing & competitive positioning", confidence: 0.88, uncertainty: null, topMove: "Acme negotiation — counter-offer window closes Friday", pendingApprovals: 1, availableSimulations: 1, recentActions: 6, memoryItems: 19, status: "active", icon: "Target" },
];

export const mockRecommendations: AdvisorRecommendation[] = [
  { id: "rec-1", advisorId: "adv-money", advisorName: "Money Advisor", title: "Pay insurance premium immediately", description: "Insurance premium is 2 days overdue. Late fee of $45 applies after tomorrow.", reasoning: "Based on bill calendar analysis, payment history shows you typically pay 3 days early. This is unusual.", confidence: 0.94, impact: "medium", urgency: "high", sources: ["Bill calendar", "Payment history", "Policy terms"], linkedEntities: ["B-003"], requiresApproval: true, canSimulate: false, createdAt: "2 hours ago", category: "bills" },
  { id: "rec-2", advisorId: "adv-business", advisorName: "Business Advisor", title: "Send follow-up to Bloom Studio", description: "Proposal sent 5 days ago with no response. Win probability drops 18% after 7 days silence.", reasoning: "Historical data shows proposals without response after 5 days have 40% lower close rate. A brief check-in increases response by 3x.", confidence: 0.87, impact: "high", urgency: "medium", sources: ["CRM data", "Email history", "Win rate analysis"], linkedEntities: ["O-002", "Q-002"], requiresApproval: false, canSimulate: true, createdAt: "4 hours ago", category: "pipeline" },
  { id: "rec-3", advisorId: "adv-concierge", advisorName: "Concierge Advisor", title: "Reschedule dentist appointment", description: "Dentist at 3:30 PM Thursday conflicts with parent-teacher conference at 3:00 PM.", reasoning: "Calendar conflict detected. Parent-teacher conferences are typically 30-45 min. Dentist can be moved to Friday 10 AM (slot available).", confidence: 0.91, impact: "low", urgency: "high", sources: ["Calendar sync", "School notifications", "Dentist booking system"], linkedEntities: [], requiresApproval: false, canSimulate: false, createdAt: "1 hour ago", category: "scheduling" },
  { id: "rec-4", advisorId: "adv-growth", advisorName: "Growth Advisor", title: "Re-engage James Morton at Morton Labs", description: "Lead has gone cold after 5 days. Score dropped from 72 to 45. Re-engagement window closes in 2 days.", reasoning: "Pattern match: similar leads re-engaged within 7 days of silence have 65% recovery rate vs 12% after 14 days.", confidence: 0.76, impact: "high", urgency: "medium", sources: ["Lead scoring model", "Engagement history", "Industry benchmarks"], linkedEntities: ["L-004"], requiresApproval: false, canSimulate: true, createdAt: "6 hours ago", category: "recovery" },
  { id: "rec-5", advisorId: "adv-money", advisorName: "Money Advisor", title: "Cancel Adobe CC subscription", description: "Usage at 15% for 3 consecutive months. Annual renewal in 18 days. Saving $659.88/year.", reasoning: "Subscription waste detection flagged this 2 months ago. No usage increase observed. Team confirmed they use Figma instead.", confidence: 0.96, impact: "medium", urgency: "low", sources: ["Subscription tracker", "Usage analytics", "Team survey"], linkedEntities: ["S-004"], requiresApproval: true, canSimulate: true, createdAt: "1 day ago", category: "waste" },
];

export const mockSimulations: SimulationResult[] = [
  { id: "sim-1", title: "What if we escalate Bloom Studio collections?", scenarioA: { label: "Send firm reminder now", impact: "+$14,400 in 7 days (60% likely)", risk: "Slight relationship strain", confidence: 0.72 }, scenarioB: { label: "Wait 5 more days", impact: "+$14,400 in 14 days (45% likely)", risk: "Higher non-payment risk", confidence: 0.58 }, assumptions: ["Client has budget allocated", "No competing priorities", "Relationship is stable"], dataUsed: ["Payment history", "Communication logs", "Industry payment norms"], recommendation: "Send firm but friendly reminder now — data supports earlier action", advisors: ["Business Advisor", "Money Advisor"], createdAt: "3 hours ago" },
  { id: "sim-2", title: "What if cash is 20% tighter next month?", scenarioA: { label: "Defer non-essential bills", impact: "Maintain 45-day runway", risk: "Late fees on 2 bills ($145)", confidence: 0.85 }, scenarioB: { label: "Accelerate collections", impact: "Maintain 60-day runway", risk: "Client relationship pressure", confidence: 0.68 }, assumptions: ["No new revenue before month-end", "All recurring bills proceed", "Insurance can be deferred 15 days"], dataUsed: ["Cash flow projections", "Bill calendar", "Receivables aging"], recommendation: "Accelerate collections first, defer only if needed", advisors: ["Money Advisor", "Treasury Advisor"], createdAt: "Yesterday" },
  { id: "sim-3", title: "What if we reschedule travel to next week?", scenarioA: { label: "Keep current dates", impact: "Higher airfare ($340 more)", risk: "Schedule conflict with Q2 review", confidence: 0.82 }, scenarioB: { label: "Shift to next week", impact: "Save $340 on flights", risk: "Miss client dinner Tuesday", confidence: 0.75 }, assumptions: ["Client dinner is optional", "Q2 review is mandatory", "Hotel is refundable"], dataUsed: ["Flight prices", "Calendar", "Client importance score"], recommendation: "Shift travel — savings justify it, client dinner can be video call", advisors: ["Concierge Advisor", "Money Advisor"], createdAt: "5 hours ago" },
];

export const mockApprovals: ApprovalRequest[] = [
  { id: "apr-1", action: "Pay insurance premium ($890)", advisors: ["Money Advisor"], reason: "2 days overdue, $45 late fee imminent", expectedImpact: "Avoid $45 fee, maintain clean payment history", ifDelayed: "Late fee applies tomorrow, potential coverage gap risk", riskLevel: "medium", policyRule: "Finance Approval >$500", linkedEntities: ["B-003"], proofWillExist: "Payment receipt + bill calendar update + cash flow adjustment", createdAt: "2 hours ago", expiresAt: "Tomorrow 5:00 PM" },
  { id: "apr-2", action: "Cancel Adobe CC annual subscription", advisors: ["Money Advisor"], reason: "15% usage for 3 months, team uses Figma", expectedImpact: "Save $659.88/year, no workflow disruption expected", ifDelayed: "Auto-renewal in 18 days, locked for another year", riskLevel: "low", policyRule: "Subscription Cancellation Review", linkedEntities: ["S-004"], proofWillExist: "Cancellation confirmation + cost savings receipt", createdAt: "1 day ago", expiresAt: "In 16 days" },
  { id: "apr-3", action: "Send collection follow-up to Bloom Studio", advisors: ["Business Advisor", "Money Advisor"], reason: "Invoice 12 days overdue, no response to initial reminder", expectedImpact: "Recover $1,200, maintain cash flow", ifDelayed: "Aging increases, harder to collect after 30 days", riskLevel: "medium", policyRule: "Communications Requiring Review", linkedEntities: ["INV-002", "C-002"], proofWillExist: "Communication receipt + invoice status update", createdAt: "4 hours ago", expiresAt: "In 3 days" },
];

export const mockProofHistory: ProofHistoryItem[] = [
  { id: "prf-1", type: "execution", title: "Paid office rent ($2,500)", advisor: "Money Advisor", outcome: "executed", confidence: 0.98, receiptHash: "a3f2c1...8d4e", whatChanged: "Cash balance reduced, bill marked paid, next due date set", createdAt: "Yesterday" },
  { id: "prf-2", type: "recommendation", title: "Follow up with NovaTech", advisor: "Business Advisor", outcome: "accepted", confidence: 0.89, receiptHash: "b7e4a2...1c3f", whatChanged: "Email sent, last-contact updated, follow-up scheduled +7d", createdAt: "2 days ago" },
  { id: "prf-3", type: "simulation", title: "Cash timing optimization", advisor: "Money Advisor", outcome: "verified", confidence: 0.85, receiptHash: "c1d5b3...9f2a", whatChanged: "Bill payment order optimized, saved $45 in late fees", createdAt: "3 days ago" },
  { id: "prf-4", type: "approval", title: "Approved Slack upgrade", advisor: "Money Advisor", outcome: "accepted", confidence: 0.92, receiptHash: "d4f7c6...2e8b", whatChanged: "Subscription upgraded, budget adjusted", createdAt: "5 days ago" },
  { id: "prf-5", type: "rollback", title: "Rolled back auto-reply rule", advisor: "Business Advisor", outcome: "rolled-back", confidence: 0.73, receiptHash: "e2a8d1...5g4c", whatChanged: "Auto-reply disabled, manual review restored", createdAt: "1 week ago" },
];

export const mockMemoryItems: MemoryItem[] = [
  { id: "mem-1", category: "fact", key: "Business type", value: "Solo consultant, design + strategy", source: "Onboarding", confidence: 1.0, privacy: "internal", canCorrect: true, canForget: false, createdAt: "Setup" },
  { id: "mem-2", category: "preference", key: "Bill payment timing", value: "Prefers paying 3 days before due date", source: "Payment history analysis", confidence: 0.92, privacy: "confidential", canCorrect: true, canForget: true, createdAt: "Learned 2 months ago" },
  { id: "mem-3", category: "inference", key: "Risk tolerance", value: "Conservative — prefers safety over optimization", source: "Decision pattern analysis", confidence: 0.78, privacy: "internal", canCorrect: true, canForget: true, createdAt: "Inferred 3 weeks ago" },
  { id: "mem-4", category: "preference", key: "Communication style", value: "Brief, data-driven, no fluff", source: "Message analysis", confidence: 0.85, privacy: "internal", canCorrect: true, canForget: true, createdAt: "Learned 1 month ago" },
  { id: "mem-5", category: "observation", key: "Cash flow pattern", value: "Income clusters around 1st and 15th, expenses spike 28th-5th", source: "Transaction analysis", confidence: 0.91, privacy: "confidential", canCorrect: false, canForget: false, createdAt: "Observed over 6 months" },
  { id: "mem-6", category: "fact", key: "Family size", value: "2 adults, 2 children (ages 8, 12)", source: "User provided", confidence: 1.0, privacy: "restricted", canCorrect: true, canForget: true, createdAt: "Setup" },
  { id: "mem-7", category: "instruction", key: "Never auto-send", value: "All client communications require review before sending", source: "User instruction", confidence: 1.0, privacy: "internal", canCorrect: true, canForget: true, createdAt: "User set 2 months ago" },
];

export const mockSynthesis: MultiAdvisorSynthesis[] = [
  { id: "syn-1", title: "Bloom Studio — Collections + Relationship", participants: [{ name: "Business Advisor", recommendation: "Send firm follow-up with payment link", confidence: 0.84 }, { name: "Money Advisor", recommendation: "Escalate to formal notice after 5 more days", confidence: 0.79 }], primaryRecommendation: "Send friendly-but-firm follow-up now, with payment link. If no response in 5 days, escalate to formal notice.", alternatePath: "Offer 10% discount for immediate payment", disagreements: ["Timing — Business wants now, Money suggests waiting"], overlap: ["Both agree payment is at risk", "Both recommend communication before formal action"], assumptions: ["Client relationship is worth preserving", "Client has ability to pay"], requiresApproval: true, canSimulate: true },
  { id: "syn-2", title: "Q2 Travel + Budget Optimization", participants: [{ name: "Concierge Advisor", recommendation: "Book Tuesday departure for client dinner", confidence: 0.82 }, { name: "Money Advisor", recommendation: "Book Wednesday departure to save $340", confidence: 0.88 }, { name: "Family Advisor", recommendation: "Avoid Tuesday — kids' recital is Monday evening", confidence: 0.75 }], primaryRecommendation: "Book Wednesday departure. Join client dinner via video. Save $340 and attend recital.", alternatePath: "Book Tuesday, skip recital, attend dinner in person", disagreements: ["Departure day preference differs across all three advisors"], overlap: ["All agree the trip is necessary", "All support the Q2 review meeting"], assumptions: ["Client dinner attendance is optional", "Video call is acceptable alternative", "Kids' recital is important to family"], requiresApproval: false, canSimulate: true },
];

// ── Internal Agent Mocks ────────────────────────────────────────────────────

export const mockInternalAgents: InternalAgentSummary[] = [
  { id: "agt-reliability", name: "Reliability Sentinel", role: "Reliability & Uptime", mission: "Ensure all services maintain 99.9% availability", health: "healthy", autonomyLevel: "L3 — Recommend", currentTasks: ["Monitoring API latency", "Checking database connection pools"], recentFindings: ["p99 latency increased 12% on receipt service"], permissions: ["observe", "diagnose", "recommend"], escalationTargets: ["Incident Triage Agent"], lastMajorAction: "Flagged memory service slow query", invocations24h: 847, costTokens24h: 12400 },
  { id: "agt-incident", name: "Incident Triage Agent", role: "Incident Response", mission: "Classify, prioritize, and route incidents to resolution", health: "healthy", autonomyLevel: "L4 — Simulate", currentTasks: ["Monitoring open incident queue"], recentFindings: ["Connector degradation pattern detected"], permissions: ["observe", "diagnose", "recommend", "simulate"], escalationTargets: ["Human operator"], lastMajorAction: "Auto-classified 3 low-severity incidents", invocations24h: 234, costTokens24h: 8900 },
  { id: "agt-connector", name: "Connector Health Agent", role: "Integration Monitoring", mission: "Monitor all external connectors for health and data quality", health: "degraded", autonomyLevel: "L2 — Diagnose", currentTasks: ["Investigating Plaid sync failure", "Monitoring Gmail API rate limits"], recentFindings: ["Plaid sync failed 3 times in 2 hours", "Gmail API approaching rate limit"], permissions: ["observe", "diagnose"], escalationTargets: ["Reliability Sentinel", "Incident Triage Agent"], lastMajorAction: "Paused Plaid sync after 3 failures", invocations24h: 1203, costTokens24h: 5600 },
  { id: "agt-workflow", name: "Workflow Recovery Agent", role: "Workflow Operations", mission: "Detect stuck workflows and suggest recovery paths", health: "healthy", autonomyLevel: "L3 — Recommend", currentTasks: ["Scanning for stuck workflows", "Validating retry queue"], recentFindings: ["1 workflow stuck in 'executing' for 45 min"], permissions: ["observe", "diagnose", "recommend"], escalationTargets: ["Human operator"], lastMajorAction: "Suggested retry for stuck bill payment workflow", invocations24h: 156, costTokens24h: 3200 },
  { id: "agt-cost", name: "Cost Guardrail Agent", role: "Cost Management", mission: "Monitor AI spend and prevent budget overruns", health: "healthy", autonomyLevel: "L2 — Diagnose", currentTasks: ["Tracking daily spend rate", "Analyzing token efficiency"], recentFindings: ["Premium reasoning usage up 30% this week"], permissions: ["observe", "diagnose"], escalationTargets: ["Human operator"], lastMajorAction: "Flagged high-cost loop in boardroom generation", invocations24h: 89, costTokens24h: 1100 },
  { id: "agt-security", name: "Security Watch Agent", role: "Security & Trust", mission: "Monitor for security anomalies and trust violations", health: "healthy", autonomyLevel: "L3 — Recommend", currentTasks: ["Scanning approval patterns", "Monitoring auth anomalies"], recentFindings: [], permissions: ["observe", "diagnose", "recommend"], escalationTargets: ["Human operator", "Incident Triage Agent"], lastMajorAction: "Verified no anomalous login patterns", invocations24h: 445, costTokens24h: 6700 },
  { id: "agt-release", name: "Release Safety Agent", role: "Deployment Safety", mission: "Validate releases and prevent regressions", health: "healthy", autonomyLevel: "L2 — Diagnose", currentTasks: ["Monitoring canary deployment"], recentFindings: ["All health checks passing"], permissions: ["observe", "diagnose"], escalationTargets: ["Human operator"], lastMajorAction: "Approved canary promotion to staging", invocations24h: 34, costTokens24h: 800 },
  { id: "agt-knowledge", name: "Knowledge Coordinator", role: "Knowledge & Runbooks", mission: "Maintain runbooks, coordinate knowledge, support diagnostics", health: "healthy", autonomyLevel: "L2 — Diagnose", currentTasks: ["Indexing new incident resolutions", "Updating troubleshooting guides"], recentFindings: ["3 new resolution patterns documented"], permissions: ["observe", "diagnose"], escalationTargets: ["Human operator"], lastMajorAction: "Updated Plaid connector troubleshooting guide", invocations24h: 67, costTokens24h: 2100 },
  { id: "agt-dataquality", name: "Data Quality Agent", role: "Data Integrity", mission: "Detect data quality issues across all domains", health: "healthy", autonomyLevel: "L2 — Diagnose", currentTasks: ["Validating projection consistency", "Checking memory staleness"], recentFindings: ["2 stale memory entries flagged for review"], permissions: ["observe", "diagnose"], escalationTargets: ["Knowledge Coordinator"], lastMajorAction: "Flagged inconsistent customer contact info", invocations24h: 312, costTokens24h: 4500 },
  { id: "agt-observability", name: "Observability Analyst", role: "System Analysis", mission: "Analyze system patterns, predict issues, surface insights", health: "healthy", autonomyLevel: "L3 — Recommend", currentTasks: ["Analyzing weekly performance trends", "Correlating error patterns"], recentFindings: ["Weekend traffic patterns differ significantly"], permissions: ["observe", "diagnose", "recommend"], escalationTargets: ["Reliability Sentinel"], lastMajorAction: "Recommended scaling adjustment for peak hours", invocations24h: 178, costTokens24h: 7800 },
];

export const mockIncidents: IncidentSummary[] = [
  { id: "inc-1", severity: "medium", title: "Plaid connector sync failures", scope: "Money Center — bank transaction sync", affectedFlows: ["Bill payment automation", "Cash timing projections"], rootCause: "Plaid API rate limiting due to increased sync frequency", recommendedActions: ["Reduce sync frequency to every 30 min", "Implement exponential backoff", "Switch to webhook-based updates"], rollbackSuggestion: "Revert to previous sync schedule", status: "investigating", createdAt: "45 min ago", timeline: [{ time: "45 min ago", event: "First sync failure detected" }, { time: "30 min ago", event: "Connector Health Agent paused sync" }, { time: "15 min ago", event: "Incident Triage Agent classified as medium" }, { time: "5 min ago", event: "Root cause identified: rate limiting" }] },
  { id: "inc-2", severity: "low", title: "Slow boardroom packet generation", scope: "Boardroom — executive summary", affectedFlows: ["Boardroom presentation mode"], rootCause: "Premium reasoning model latency spike", recommendedActions: ["Monitor for next 2 hours", "Fallback to standard model if persists"], rollbackSuggestion: null, status: "mitigated", createdAt: "2 hours ago", timeline: [{ time: "2 hours ago", event: "Generation time exceeded 30s threshold" }, { time: "1.5 hours ago", event: "Cost Guardrail Agent flagged premium model costs" }, { time: "1 hour ago", event: "Automatic fallback activated" }] },
];

export const mockConnectorHealth: ConnectorHealthItem[] = [
  { id: "con-1", name: "Bank Sync (Plaid)", service: "plaid", status: "degraded", healthScore: 72, errorRate: "4.2%", recentFailures: 3, lastSync: "45 min ago", impactedWorkflows: ["Bill payments", "Cash timing"], nextSteps: "Reduce sync frequency, monitor for recovery" },
  { id: "con-2", name: "Email (Gmail)", service: "gmail", status: "connected", healthScore: 94, errorRate: "0.3%", recentFailures: 0, lastSync: "2 min ago", impactedWorkflows: [], nextSteps: "Monitor rate limit usage (78% of quota)" },
  { id: "con-3", name: "Calendar (Google)", service: "google-calendar", status: "connected", healthScore: 99, errorRate: "0%", recentFailures: 0, lastSync: "1 min ago", impactedWorkflows: [], nextSteps: "No action needed" },
  { id: "con-4", name: "CRM (HubSpot)", service: "hubspot", status: "connected", healthScore: 97, errorRate: "0.1%", recentFailures: 0, lastSync: "5 min ago", impactedWorkflows: [], nextSteps: "No action needed" },
  { id: "con-5", name: "Accounting (QuickBooks)", service: "quickbooks", status: "disconnected", healthScore: 0, errorRate: "N/A", recentFailures: 0, lastSync: "Never", impactedWorkflows: ["Invoice sync", "Tax estimation"], nextSteps: "Connect to enable financial automation" },
];

export const mockStuckWorkflows: StuckWorkflow[] = [
  { id: "wf-stuck-1", name: "Bill payment — Insurance Premium", state: "approval-requested", stuckSince: "2 hours ago", reason: "Awaiting user approval (>$500 policy)", impactedEntities: ["B-003"], retrySuggestion: "Approve or reject the pending approval", rollbackAvailable: false, humanRequired: true },
];

export const mockCostAnomalies: CostAnomaly[] = [
  { id: "cost-1", type: "premium-overuse", description: "Premium reasoning model used 30% more than last week", amount: "$12.40 over budget", advisor: "Boardroom Advisor", timeframe: "This week", recommendation: "Switch boardroom summaries to standard model for routine reports" },
  { id: "cost-2", type: "low-value-loop", description: "Lead re-scoring running every 15 min with no changes detected", amount: "$3.20/day wasted", advisor: "Growth Advisor", timeframe: "Last 5 days", recommendation: "Switch to event-driven re-scoring instead of polling" },
];

export const mockPolicyAnomalies: PolicyAnomaly[] = [
  { id: "pol-1", type: "approval-bypass", description: "No anomalies detected — all approvals following correct chain", severity: "low", affectedEntity: "System-wide", recommendation: "No action needed", createdAt: "Last audit: 1 hour ago" },
];

export const mockReleaseSafety: ReleaseSafetyState = {
  currentRing: "staging",
  rolloutProgress: 65,
  canaryStatus: "healthy",
  regressionAlerts: 0,
  linkedIncidents: [],
  safeModeActive: false,
  lastDeployment: "Today 6:00 AM",
  rollbackAvailable: true,
};

export const mockSafeMode: SafeModeState = {
  globalSafeMode: false,
  advisorOnlyMode: false,
  executionDisabled: false,
  connectorPaused: false,
  boardroomReadOnly: false,
  sensitiveDomainsLocked: false,
};

// SITA OS — Demo Data: Revenue Office
import {
  Activity, CheckCircle, Mail, Target, TrendingUp, AlertTriangle,
  Play, Pause, Zap, DollarSign, Users, Phone, Star, FileText, UserPlus,
  Heart, Package, RefreshCw, Calendar, Brain, Shield, Eye, MousePointer,
  Clock, MessageSquare, TrendingDown, Type, Hash, CheckSquare, List,
  AlignLeft, Upload, CreditCard, ShoppingCart, ShoppingBag, Workflow,
  Lightbulb, MessageCircle, ThumbsUp,
} from "lucide-react";

interface Deal {
  id: string; name: string; value: number; probability: number; age: number;
  owner: string; contact: string; nextAction: string; nextActionDate: string;
  source: string; tags: string[];
}


export const DEMO_healthMetrics = [
  { label: "Overall Health", value: 94, target: 95, color: "text-emerald-400", icon: Activity },
  { label: "Success Rate", value: 91, target: 90, color: "text-emerald-400", icon: CheckCircle },
  { label: "Delivery Rate", value: 97, target: 98, color: "text-emerald-400", icon: Mail },
  { label: "Engagement Rate", value: 68, target: 70, color: "text-amber-400", icon: Target },
  { label: "Conversion Rate", value: 24, target: 25, color: "text-blue-400", icon: TrendingUp },
  { label: "Fatigue Score", value: 12, target: 10, color: "text-amber-400", icon: AlertTriangle },
];

export const DEMO_automations = [
  { name: "Welcome Onboarding (7-step)", status: "healthy", successRate: 98, triggers: 28, failures: 0, lastRun: "2hrs ago", contacts: 112, revenue: "—", trend: [95, 96, 97, 98], category: "Onboarding" },
  { name: "Stale Lead Recovery (48hr)", status: "healthy", successRate: 94, triggers: 42, failures: 3, lastRun: "1hr ago", contacts: 156, revenue: "$12,400", trend: [88, 90, 92, 94], category: "Lead Recovery" },
  { name: "Post-Service Review Request", status: "healthy", successRate: 96, triggers: 35, failures: 1, lastRun: "4hrs ago", contacts: 220, revenue: "—", trend: [92, 94, 95, 96], category: "Reputation" },
  { name: "Post-Call Follow-up", status: "healthy", successRate: 89, triggers: 22, failures: 2, lastRun: "30min ago", contacts: 88, revenue: "$15,000", trend: [85, 86, 88, 89], category: "Sales" },
  { name: "Quote Follow-up (3/5/7 day)", status: "warning", successRate: 82, triggers: 12, failures: 2, lastRun: "6hrs ago", contacts: 34, revenue: "$4,800", trend: [88, 85, 83, 82], category: "Sales" },
  { name: "Nurture Sequence (14-day)", status: "warning", successRate: 76, triggers: 89, failures: 21, lastRun: "30min ago", contacts: 340, revenue: "$6,800", trend: [82, 80, 78, 76], category: "Nurture" },
  { name: "Abandoned Checkout Recovery", status: "healthy", successRate: 88, triggers: 22, failures: 3, lastRun: "2hrs ago", contacts: 64, revenue: "$7,200", trend: [84, 85, 87, 88], category: "Sales" },
  { name: "Lead Assignment Engine", status: "error", successRate: 60, triggers: 15, failures: 6, lastRun: "45min ago", contacts: 15, revenue: "—", trend: [78, 72, 65, 60], category: "Operations" },
  { name: "Upsell After Delivery", status: "underperforming", successRate: 43, triggers: 14, failures: 1, lastRun: "1day ago", contacts: 38, revenue: "$5,600", trend: [48, 46, 44, 43], category: "Growth" },
  { name: "Churn Prevention Check-in", status: "warning", successRate: 50, triggers: 8, failures: 0, lastRun: "8hrs ago", contacts: 22, revenue: "$3,100", trend: [55, 53, 51, 50], category: "Retention" },
  { name: "Reactivation Campaign (90-day)", status: "healthy", successRate: 85, triggers: 34, failures: 5, lastRun: "3hrs ago", contacts: 78, revenue: "$2,800", trend: [80, 82, 84, 85], category: "Growth" },
  { name: "No-Show Rescue + Rebook", status: "healthy", successRate: 92, triggers: 18, failures: 1, lastRun: "5hrs ago", contacts: 48, revenue: "$4,200", trend: [88, 89, 91, 92], category: "Booking" },
];

export const DEMO_fatigueAlerts = [
  { contact: "Sarah Chen", DEMO_automations: 4, messagesThisWeek: 7, risk: "high", action: "Pause non-critical sequences for 7 days" },
  { contact: "Marcus Johnson", DEMO_automations: 3, messagesThisWeek: 5, risk: "medium", action: "Reduce to 1 message per 3 days" },
  { contact: "Emily Rodriguez", DEMO_automations: 2, messagesThisWeek: 6, risk: "high", action: "Remove from nurture, keep only appointment reminders" },
];

export const DEMO_advisorInsights = [
  { advisor: "Campaign Advisor", insight: "Nurture Sequence engagement drops 40% at email 4. Test shorter 3-email variant or change topic at email 4.", action: "Create A/B test" },
  { advisor: "Revenue Ops Advisor", insight: "Lead Assignment Engine failing due to missing 'enterprise' segment rule. 5 leads unassigned since yesterday.", action: "Fix rule now" },
  { advisor: "Retention Advisor", insight: "Churn Prevention check-ins have only 50% open rate. Switch to SMS for initial touch — similar businesses see 78% read rate.", action: "Generate SMS variant" },
  { advisor: "Offer Advisor", insight: "Upsell After Delivery at 43% — well below benchmark. Content may be too generic. Test personalized upsells based on service type.", action: "Personalize templates" },
];

export const DEMO_automationStats = [
  { label: "Active Automations", value: "24", delta: "+3 this week", icon: Play, color: "text-emerald-400" },
  { label: "Paused / Under Review", value: "5", delta: "2 need attention", icon: Pause, color: "text-amber-400" },
  { label: "Actions This Week", value: "1,247", delta: "+18% vs last week", icon: Zap, color: "text-blue-400" },
  { label: "Revenue Recovered", value: "$34,800", delta: "from leak repair", icon: DollarSign, color: "text-emerald-400" },
  { label: "Leads Rescued", value: "68", delta: "via recovery flows", icon: Users, color: "text-purple-400" },
  { label: "Automation Health", value: "94%", delta: "2 issues detected", icon: Activity, color: "text-blue-400" },
];

export const DEMO_activeAutomations = [
  { name: "Stale Lead Recovery (48hr)", status: "active", triggers: 42, success: 78, contacts: 156, revenue: "$12,400", category: "Lead Recovery", level: "Auto-run (L3)", icon: Users, trend: "improving" },
  { name: "No-Show Rescue + Rebook", status: "active", triggers: 18, success: 61, contacts: 48, revenue: "$4,200", category: "Booking", level: "Draft for review (L2)", icon: Phone, trend: "stable" },
  { name: "Post-Service Review Request", status: "active", triggers: 35, success: 84, contacts: 220, revenue: "—", category: "Reputation", level: "Auto-run (L3)", icon: Star, trend: "improving" },
  { name: "Quote Follow-up (3/5/7 day)", status: "active", triggers: 12, success: 67, contacts: 34, revenue: "$8,900", category: "Sales", level: "Auto-run (L3)", icon: FileText, trend: "declining" },
  { name: "Welcome Onboarding (7-step)", status: "active", triggers: 28, success: 92, contacts: 112, revenue: "—", category: "Onboarding", level: "Auto-run (L3)", icon: UserPlus, trend: "improving" },
  { name: "Nurture Sequence (14-day)", status: "active", triggers: 89, success: 71, contacts: 340, revenue: "$6,800", category: "Nurture", level: "Auto-run (L3)", icon: Mail, trend: "stable" },
  { name: "Churn Prevention Check-in", status: "warning", triggers: 8, success: 50, contacts: 22, revenue: "$3,100", category: "Retention", level: "AI suggests (L1)", icon: Heart, trend: "declining" },
  { name: "Upsell After Delivery", status: "active", triggers: 14, success: 43, contacts: 38, revenue: "$5,600", category: "Growth", level: "Draft for review (L2)", icon: Package, trend: "stable" },
  { name: "Abandoned Checkout Recovery", status: "active", triggers: 22, success: 58, contacts: 64, revenue: "$7,200", category: "Sales", level: "Auto-run (L3)", icon: Target, trend: "improving" },
  { name: "Reactivation Campaign (90-day)", status: "active", triggers: 34, success: 38, contacts: 78, revenue: "$2,800", category: "Growth", level: "Draft for review (L2)", icon: RefreshCw, trend: "stable" },
];

export const DEMO_atRiskAutomations = [
  { name: "Quote Follow-up (3/5/7 day)", issue: "Conversion rate dropped from 78% to 67% this week — possible message fatigue", severity: "medium", action: "Review messaging and timing" },
  { name: "Churn Prevention Check-in", issue: "Only 50% success — many clients not engaging with check-in emails", severity: "high", action: "Advisor suggests switching to SMS + personal call" },
  { name: "Lead Assignment Engine", issue: "5 leads unassigned due to rule mismatch — sales team missing warm leads", severity: "high", action: "Fix assignment rules for 'enterprise' segment" },
  { name: "Nurture Sequence B", issue: "3 emails bouncing, deliverability at 94% — below 97% threshold", severity: "medium", action: "Clean list and verify sending domain" },
  { name: "Upsell After Delivery", issue: "Low engagement — 8% open rate vs 24% benchmark", severity: "low", action: "Test new subject lines and timing" },
];

export const DEMO_advisorRecommendations = [
  { advisor: "CRM Advisor", recommendation: "12 warm leads have no next step scheduled — create a follow-up automation to prevent drop-off", impact: "$8,200 at risk", confidence: 87, urgency: "high", autoType: "Lead Recovery" },
  { advisor: "Booking Advisor", recommendation: "No-show rate at 18% — add SMS reminder 1hr before appointments to improve show rate by ~22%", impact: "+22% show rate", confidence: 82, urgency: "medium", autoType: "Booking" },
  { advisor: "Retention Advisor", recommendation: "34 clients inactive 60+ days — launch reactivation sequence before they churn permanently", impact: "$12,400 at risk", confidence: 65, urgency: "high", autoType: "Retention" },
  { advisor: "Revenue Ops Advisor", recommendation: "Quote reminders not being sent after 3 days — enable quote expiry flow to recover stalled proposals", impact: "$4,800 at risk", confidence: 91, urgency: "medium", autoType: "Sales" },
  { advisor: "Funnel Advisor", recommendation: "Landing page → form conversion at 12% — create abandoned form recovery sequence for visitors who started but didn't complete", impact: "+35 leads/mo", confidence: 74, urgency: "medium", autoType: "Lead Recovery" },
  { advisor: "Reputation Advisor", recommendation: "28 happy clients never asked for review — create post-delivery review request with 48hr delay", impact: "+12 reviews/mo", confidence: 88, urgency: "low", autoType: "Reputation" },
  { advisor: "Campaign Advisor", recommendation: "Nurture sequence engagement drops 40% at email 4 — create branch for disengaged contacts with different messaging", impact: "+18% nurture conversion", confidence: 70, urgency: "medium", autoType: "Nurture" },
  { advisor: "Chief Revenue Strategist", recommendation: "Your biggest automation gap is post-call follow-up — only 40% of discovery calls get a same-day follow-up. Automating this could recover $15K/mo", impact: "$15,000/mo", confidence: 78, urgency: "critical", autoType: "Sales" },
];

export const DEMO_leakRepairOpportunities = [
  { leak: "Post-call follow-up gap", estimatedLoss: "$15,000/mo", contacts: 24, status: "no automation", fixDifficulty: "easy" },
  { leak: "Quote viewed but no response (>5 days)", estimatedLoss: "$8,400/mo", contacts: 18, status: "partial automation", fixDifficulty: "easy" },
  { leak: "Onboarding incomplete after 3 days", estimatedLoss: "$4,200/mo", contacts: 8, status: "no automation", fixDifficulty: "medium" },
  { leak: "Happy clients never asked for review", estimatedLoss: "reputation cost", contacts: 28, status: "no automation", fixDifficulty: "easy" },
  { leak: "Dormant leads (30-60 days)", estimatedLoss: "$12,400/mo", contacts: 34, status: "no automation", fixDifficulty: "medium" },
  { leak: "Failed payment retry", estimatedLoss: "$2,100/mo", contacts: 6, status: "no automation", fixDifficulty: "easy" },
];

export const DEMO_businessStageAutomations = [
  { stage: "Awareness", automations: 4, coverage: 72, gaps: ["Abandoned form recovery", "Social engagement follow-up"] },
  { stage: "Consideration", automations: 6, coverage: 85, gaps: ["Competitor comparison sends"] },
  { stage: "Conversion", automations: 5, coverage: 68, gaps: ["Post-call follow-up", "Quote objection handling"] },
  { stage: "Onboarding", automations: 3, coverage: 78, gaps: ["Milestone celebration", "Satisfaction pulse at day 7"] },
  { stage: "Retention", automations: 4, coverage: 55, gaps: ["Anniversary recognition", "Usage drop detection", "Renewal warmup"] },
  { stage: "Advocacy", automations: 2, coverage: 40, gaps: ["Referral program", "Case study request", "Community invitation"] },
];

export const DEMO_policies = [
  { category: "Email & SMS Sending", icon: Mail, rules: [
    { rule: "Max 3 emails per contact per week", status: "active", violations: 0 },
    { rule: "Max 2 SMS per contact per week", status: "active", violations: 0 },
    { rule: "No SMS before 9am or after 8pm (contact local time)", status: "active", violations: 0 },
    { rule: "No email on weekends unless tagged 'time-sensitive'", status: "active", violations: 0 },
    { rule: "Opt-out contacts excluded from ALL automated sequences", status: "active", violations: 0 },
    { rule: "Fatigue detection: pause if >3 unopened emails in a row", status: "active", violations: 2 },
    { rule: "Unsubscribe link required in all marketing emails", status: "active", violations: 0 },
    { rule: "Deliverability below 95% triggers automatic pause + alert", status: "active", violations: 1 },
  ]},
  { category: "Lead & CRM Actions", icon: Users, rules: [
    { rule: "Auto-assignment only during business hours (9am-6pm)", status: "active", violations: 0 },
    { rule: "Lead stage changes require confirmation if deal value >$5,000", status: "active", violations: 0 },
    { rule: "Bulk operations (>50 contacts) require approval before execution", status: "active", violations: 0 },
    { rule: "VIP leads (>$5,000) always require human review before outreach", status: "active", violations: 0 },
    { rule: "Lead data enrichment limited to verified sources only", status: "active", violations: 0 },
    { rule: "Contact merging requires manual confirmation", status: "active", violations: 0 },
  ]},
  { category: "Financial Actions", icon: DollarSign, rules: [
    { rule: "Quotes >$10,000 require manual review before sending", status: "active", violations: 0 },
    { rule: "Discount >15% requires Decision Theater approval", status: "active", violations: 0 },
    { rule: "Auto-invoicing disabled (manual trigger only)", status: "active", violations: 0 },
    { rule: "Payment retry max 3 attempts with 24hr intervals", status: "active", violations: 0 },
    { rule: "Refund processing always requires human approval", status: "active", violations: 0 },
    { rule: "Custom pricing requires manager override", status: "active", violations: 0 },
  ]},
  { category: "Booking & Calendar", icon: Calendar, rules: [
    { rule: "No auto-booking outside defined availability windows", status: "active", violations: 0 },
    { rule: "No-show rescue limited to 1 SMS + 1 email per contact per event", status: "active", violations: 0 },
    { rule: "Double-booking prevention enforced across all calendars", status: "active", violations: 0 },
    { rule: "Appointment reminders: 24hr + 1hr before (configurable)", status: "active", violations: 0 },
    { rule: "Buffer time between appointments enforced (15 min default)", status: "active", violations: 0 },
  ]},
  { category: "Content & AI Generation", icon: Brain, rules: [
    { rule: "AI-generated emails require review before first use of new template", status: "active", violations: 0 },
    { rule: "AI tone must match brand voice settings (warm, professional)", status: "active", violations: 0 },
    { rule: "No AI-generated content for legal, financial, or health claims", status: "active", violations: 0 },
    { rule: "AI draft quality check: minimum confidence score 80% before auto-send", status: "active", violations: 0 },
    { rule: "Personalization tokens verified before send (no blank fields)", status: "active", violations: 1 },
  ]},
  { category: "Escalation & Safety", icon: Shield, rules: [
    { rule: "High-impact automations require simulation before activation", status: "active", violations: 0 },
    { rule: "Failed automation retries capped at 3 with exponential backoff", status: "active", violations: 0 },
    { rule: "Negative sentiment detected → pause automation, escalate to human", status: "active", violations: 0 },
    { rule: "All L4 automations generate detailed receipts and weekly summaries", status: "active", violations: 0 },
    { rule: "Emergency pause: any automation can be halted instantly by any team member", status: "active", violations: 0 },
    { rule: "Automation changes require changelog entry and reason", status: "active", violations: 0 },
    { rule: "Rollback available for all actions within 72 hours", status: "active", violations: 0 },
    { rule: "Over-firing detection: pause if >2x normal trigger volume in 1hr", status: "active", violations: 0 },
  ]},
];

export const DEMO_trustLevels = [
  { level: "L1 — Suggest Only", automations: 6, pct: 25, desc: "SITA observes and recommends — no automated actions taken. User decides everything.", icon: Eye, color: "border-purple-500/30" },
  { level: "L2 — Draft & Prepare", automations: 8, pct: 33, desc: "SITA drafts messages, prepares workflows, generates quotes. User reviews and approves before anything executes.", icon: FileText, color: "border-blue-500/30" },
  { level: "L3 — Act Under Rules", automations: 7, pct: 29, desc: "SITA executes within approved policy boundaries automatically. All actions logged with receipts.", icon: CheckCircle, color: "border-emerald-500/30" },
  { level: "L4 — Semi-Autonomous", automations: 3, pct: 13, desc: "Bounded commercial operations with mandatory receipts, weekly summaries, and human escalation for high-impact decisions.", icon: Zap, color: "border-amber-500/30" },
];

export const DEMO_humanVsAI = [
  { domain: "Lead outreach (cold)", recommendation: "Human only", reason: "Cold outreach should always be personal and carefully considered" },
  { domain: "Lead follow-up (warm)", recommendation: "AI drafts, human reviews", reason: "Speed matters but personalization quality must be high" },
  { domain: "Appointment reminders", recommendation: "Full automation", reason: "Standard messages, low risk, high value" },
  { domain: "No-show rescue", recommendation: "Auto-run under rules", reason: "Time-sensitive, standard process, SMS + email" },
  { domain: "Quote generation", recommendation: "AI prepares, human approves", reason: "Financial accuracy and client relationship require human eye" },
  { domain: "Quote follow-up", recommendation: "Auto-run under rules", reason: "Standard cadence, low risk" },
  { domain: "Onboarding sequences", recommendation: "Full automation", reason: "Structured process, tested content, critical timing" },
  { domain: "Churn intervention", recommendation: "AI suggests, human executes", reason: "Requires relationship judgment and personal touch" },
  { domain: "Review requests", recommendation: "Auto-run under rules", reason: "Timing is key, standard process" },
  { domain: "Pricing changes", recommendation: "Human only", reason: "Strategic decision with broad impact" },
  { domain: "Campaign launches", recommendation: "Decision Theater review", reason: "High impact, needs advisor input and simulation" },
  { domain: "Internal task creation", recommendation: "Full automation", reason: "Low risk, high efficiency gain" },
];

export const DEMO_receipts = [
  { time: "14 min ago", automation: "Stale Lead Recovery", action: "Sent recovery email to 24 leads", contacts: 24, approvedBy: "Auto-run (L3)", outcome: "22 delivered, 2 bounced, 8 opened so far", rollback: true, category: "Lead Recovery", impact: "$8,200 at risk", details: { emailVariants: 3, segmentsUsed: ["warm", "hot"], exclusions: 3, fatigueDelays: 5 } },
  { time: "45 min ago", automation: "Post-Call Follow-up", action: "Generated 3 follow-up emails from call notes, created 3 callback tasks", contacts: 3, approvedBy: "Draft reviewed → User approved", outcome: "3 emails sent, 2 opened, 1 replied", rollback: true, category: "Sales", impact: "$7,500 pipeline", details: { aiGenerated: true, callsProcessed: 3, quotesTriggered: 1 } },
  { time: "1 hr ago", automation: "No-Show Rescue", action: "Sent SMS to 3 no-show contacts with rebook link", contacts: 3, approvedBy: "Auto-run (L3)", outcome: "3 delivered, 1 rebooked within 20min", rollback: true, category: "Booking", impact: "$2,400 recovered", details: { channelUsed: "SMS", rebookRate: "33%" } },
  { time: "2 hrs ago", automation: "Quote Follow-up (Day 3)", action: "Sent reminder to 8 prospects with open quotes", contacts: 8, approvedBy: "Auto-run (L3)", outcome: "8 delivered, 5 opened, 2 viewed quote again", rollback: true, category: "Sales", impact: "$18,400 in quotes", details: { quoteValues: "$2,300 avg", viewTracking: true } },
  { time: "3 hrs ago", automation: "VIP Lead Recovery", action: "4 VIP leads ($5K+) — emails drafted and queued for your review", contacts: 4, approvedBy: "Awaiting approval (L2)", outcome: "Pending your review in approval queue", rollback: false, category: "Lead Recovery", impact: "$22,000 at risk", details: { requiresApproval: true, vipThreshold: "$5,000" } },
  { time: "4 hrs ago", automation: "Post-Service Review", action: "Requested review from 12 clients after service delivery", contacts: 12, approvedBy: "Auto-run (L3)", outcome: "12 sent, 4 reviews submitted (3 × 5-star, 1 × 4-star)", rollback: false, category: "Reputation", impact: "+4 reviews", details: { avgRating: 4.75, platforms: ["Google", "Trustpilot"] } },
  { time: "6 hrs ago", automation: "Welcome Onboarding", action: "Sent welcome package to 5 new clients (step 1 of 7)", contacts: 5, approvedBy: "Auto-run (L3)", outcome: "5 delivered, 5 opened, 3 completed intake form", rollback: false, category: "Onboarding", impact: "5 new clients", details: { step: "1/7", intakeCompleted: 3 } },
  { time: "8 hrs ago", automation: "Lead Assignment Engine", action: "Assigned 15 leads to sales team based on rules", contacts: 15, approvedBy: "Jane (manual review — rule fix)", outcome: "15 assigned, 2 re-routed after rule correction", rollback: true, category: "Operations", impact: "15 leads routed", details: { ruleFixed: true, reassigned: 2 } },
  { time: "12 hrs ago", automation: "Churn Prevention", action: "Sent check-in to 8 at-risk clients (60+ days inactive)", contacts: 8, approvedBy: "AI Draft → User approved", outcome: "8 sent, 3 responded, 1 booked call", rollback: true, category: "Retention", impact: "$3,100 at risk", details: { responseRate: "38%", callsBooked: 1 } },
  { time: "1 day ago", automation: "Reactivation Campaign", action: "Launched 3-step reactivation for 34 dormant contacts (step 1)", contacts: 34, approvedBy: "Decision Theater → Approved", outcome: "Step 1: 32 delivered, 14 opened, 4 clicked", rollback: true, category: "Growth", impact: "$2,800 potential", details: { step: "1/3", decisionTheaterUsed: true } },
  { time: "1 day ago", automation: "Upsell After Delivery", action: "Sent personalized upsell to 6 clients post-delivery", contacts: 6, approvedBy: "Auto-run (L3)", outcome: "6 sent, 2 opened, 1 clicked upsell link", rollback: true, category: "Growth", impact: "$3,400 potential", details: { aiPersonalized: true, caseStudyIncluded: true } },
  { time: "2 days ago", automation: "Failed Payment Retry", action: "Retried 4 failed payments (attempt 2 of 3)", contacts: 4, approvedBy: "Auto-run (L3)", outcome: "2 succeeded ($1,800), 2 still failing", rollback: false, category: "Revenue", impact: "$1,800 recovered", details: { recovered: 2, stillFailing: 2, totalValue: "$3,200" } },
];

export const DEMO_templates = [
  { name: "Stale Lead Recovery (48hr)", desc: "Detect leads with no next step for 48hrs. Enrich with CRM data, send personalized email, assign callback task, follow up via SMS if no response, escalate high-value leads.", category: "Lead Recovery", popularity: 94, icon: Users, steps: 8, trustLevel: "L3", impact: "$8,200/mo recovered", difficulty: "Easy", timeToSetup: "5 min", advisorNote: "CRM Advisor: Most impactful first automation for service businesses" },
  { name: "Warm Lead Follow-up", desc: "When lead shows high engagement (multiple page views, form started), immediately send value-driven email, create priority call task, fast-track to sales pipeline.", category: "Lead Recovery", popularity: 88, icon: Target, steps: 6, trustLevel: "L3", impact: "+24% conversion", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Funnel Advisor: Catches hot leads before they cool" },
  { name: "No-Show Rescue + Rebook", desc: "Detect no-show within 15 min of appointment time. Send caring SMS with easy rebook link, follow up with email if no response in 2hrs, track recovery rate.", category: "Booking", popularity: 91, icon: Phone, steps: 6, trustLevel: "L3", impact: "+22% rebook rate", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Booking Advisor: SMS at 15 min works better than 1hr — sense of immediacy" },
  { name: "Post-Service Review Request", desc: "After service completion, wait 24hrs for experience to settle, send personalized review request, follow up if no response at 72hrs, route negative sentiment to recovery workflow.", category: "Reputation", popularity: 89, icon: Star, steps: 5, trustLevel: "L3", impact: "+12 reviews/mo", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "Reputation Advisor: 24hr delay gets better quality reviews than immediate ask" },
  { name: "Quote Follow-up & Expiry (3/5/7/14 day)", desc: "After quote sent: remind at day 3, nudge with social proof at day 5, urgency at day 7, close/archive at day 14 with reactivation tag. Track viewed-but-not-responded separately.", category: "Sales", popularity: 87, icon: FileText, steps: 8, trustLevel: "L3", impact: "$4,800/mo recovered", difficulty: "Medium", timeToSetup: "6 min", advisorNote: "Offer Advisor: Day 5 social proof email has 2x higher conversion than plain reminder" },
  { name: "Welcome Onboarding (7-step)", desc: "New client welcome: day 0 welcome email, day 1 intake form, day 2 kickoff scheduling, day 3 resource packet, day 5 check-in, day 7 satisfaction pulse, day 14 milestone.", category: "Onboarding", popularity: 93, icon: UserPlus, steps: 9, trustLevel: "L3", impact: "+34% completion rate", difficulty: "Medium", timeToSetup: "8 min", advisorNote: "Retention Advisor: Day 5 check-in catches 80% of at-risk onboardings" },
  { name: "Nurture Sequence (14-day value)", desc: "5-email value sequence over 14 days. Branch by engagement level at email 3. Engaged path gets offer. Disengaged path gets different angle. Auto-tag by interest for future campaigns.", category: "Nurture", popularity: 85, icon: Mail, steps: 7, trustLevel: "L3", impact: "+18% nurture conversion", difficulty: "Medium", timeToSetup: "7 min", advisorNote: "Campaign Advisor: Branching at email 3 recovers 40% of otherwise lost leads" },
  { name: "Churn Prevention Check-in", desc: "Detect 60-day inactivity. Send caring check-in, offer incentive at 75 days, escalate to personal call at 90 days, create save-offer if high-value.", category: "Retention", popularity: 80, icon: Heart, steps: 6, trustLevel: "L2", impact: "$12,400/mo saved", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Retention Advisor: Personal call at 90 days saves 3x more than email alone" },
  { name: "Abandoned Checkout Recovery", desc: "Cart/checkout abandonment at 1hr, 24hrs, and 48hrs. Progressive urgency. Discount offer at 48hrs if item allows. Track recovery revenue separately.", category: "Sales", popularity: 86, icon: ShoppingBag, steps: 5, trustLevel: "L3", impact: "$7,200/mo recovered", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Funnel Advisor: 1hr email recovers 60% of all recoverable carts" },
  { name: "Reactivation Campaign (90-day dormant)", desc: "Segment dormant contacts. 3-step reactivation: re-engagement email, value reminder, final exclusive offer. Clean unresponsive contacts after 14 days.", category: "Growth", popularity: 78, icon: RefreshCw, steps: 6, trustLevel: "L2", impact: "$2,800/mo reactivated", difficulty: "Medium", timeToSetup: "6 min", advisorNote: "Campaign Advisor: Clean unresponsive contacts to improve deliverability" },
  { name: "Upsell After Service Delivery", desc: "After successful service delivery + positive feedback, wait 7 days, send relevant upsell based on purchased service. Include case study from similar client.", category: "Growth", popularity: 76, icon: Package, steps: 5, trustLevel: "L2", impact: "$5,600/mo added", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Offer Advisor: Case study inclusion increases upsell acceptance by 45%" },
  { name: "Referral Ask Flow", desc: "Identify high-NPS/satisfaction clients. Send personalized referral request with easy sharing link. Reward on successful referral. Track referral source.", category: "Growth", popularity: 74, icon: Users, steps: 4, trustLevel: "L2", impact: "+8 referrals/mo", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "CRM Advisor: Ask within 7 days of positive feedback for 3x higher referral rate" },
  { name: "Internal Task Handoff", desc: "When deal stage changes or service milestone reached, auto-create tasks for next team member, include context packet, set due dates, escalate if overdue.", category: "Operations", popularity: 82, icon: Workflow, steps: 5, trustLevel: "L3", impact: "-40% handoff delays", difficulty: "Easy", timeToSetup: "4 min", advisorNote: "Revenue Ops Advisor: Structured handoffs prevent 80% of client experience gaps" },
  { name: "Post-Call Follow-up", desc: "After call completed, auto-generate summary from notes, send follow-up email with key points, create next-step task, update pipeline, trigger quote if qualified.", category: "Sales", popularity: 90, icon: Phone, steps: 7, trustLevel: "L2", impact: "$15,000/mo recovered", difficulty: "Medium", timeToSetup: "5 min", advisorNote: "Chief Strategist: Biggest ROI automation — most businesses lose deals between call and follow-up" },
  { name: "Failed Payment Retry", desc: "On payment failure, send immediate notification, retry at 24hrs and 72hrs, offer alternative payment method, escalate to human if still failing.", category: "Revenue", popularity: 84, icon: DollarSign, steps: 5, trustLevel: "L3", impact: "$2,100/mo recovered", difficulty: "Easy", timeToSetup: "3 min", advisorNote: "Revenue Ops Advisor: 72% of failed payments recover with a simple retry + notification" },
];

export const DEMO_REV_categories = ["All", "Lead Recovery", "Sales", "Booking", "Reputation", "Onboarding", "Nurture", "Retention", "Growth", "Operations", "Revenue"];

export const DEMO_UPCOMING = [
  { client: "Sarah Mitchell", type: "Strategy Call", time: "Today, 2:00 PM", duration: "45 min", mode: "video", status: "confirmed" },
  { client: "James Chen", type: "Discovery Call", time: "Today, 4:30 PM", duration: "30 min", mode: "video", status: "confirmed" },
  { client: "Emily Rodriguez", type: "Coaching Session", time: "Tomorrow, 10:00 AM", duration: "60 min", mode: "video", status: "pending" },
  { client: "Michael Park", type: "Quarterly Review", time: "Apr 8, 1:00 PM", duration: "45 min", mode: "in-person", status: "confirmed" },
];

export const DEMO_REV_SERVICES = [
  { name: "Discovery Call", duration: "30 min", price: "Free", bookings: 24, conversionRate: "33%" },
  { name: "Strategy Session", duration: "45 min", price: "$150", bookings: 18, conversionRate: "67%" },
  { name: "Coaching Hour", duration: "60 min", price: "$250", bookings: 12, conversionRate: "83%" },
  { name: "VIP Day", duration: "4 hours", price: "$2,000", bookings: 3, conversionRate: "100%" },
];

export const DEMO_REV_STATS = [
  { label: "This Week", value: "8 bookings", sub: "+2 from last week" },
  { label: "Show Rate", value: "94%", sub: "Excellent" },
  { label: "Revenue from Bookings", value: "$4,350", sub: "This month" },
  { label: "Avg. Lead Time", value: "3.2 days", sub: "Booking to appointment" },
];

export const DEMO_PERIODS = [
  { period: "This Month", revenue: 42800, clients: 28, deals: 7, conversion: 23, trend: "up" as const },
  { period: "Last Month", revenue: 38200, clients: 26, deals: 5, conversion: 19, trend: "up" as const },
  { period: "2 Months Ago", revenue: 35600, clients: 25, deals: 6, conversion: 21, trend: "stable" as const },
  { period: "3 Months Ago", revenue: 31400, clients: 24, deals: 4, conversion: 17, trend: "down" as const },
  { period: "6 Months Ago", revenue: 28100, clients: 22, deals: 3, conversion: 15, trend: "down" as const },
  { period: "1 Year Ago", revenue: 19800, clients: 16, deals: 2, conversion: 12, trend: "stable" as const },
];

export const DEMO_DECISIONS = [
  { date: "Mar 15", decision: "Launched premium service tier", impact: "positive" as const, metric: "+$8,200/mo", detail: "23% of existing clients upgraded within 30 days" },
  { date: "Feb 28", decision: "Activated automated follow-up sequences", impact: "positive" as const, metric: "+12% conv", detail: "Lead-to-close time reduced by 8 days" },
  { date: "Feb 10", decision: "Hired second account manager", impact: "neutral" as const, metric: "+$4,500 cost", detail: "Client satisfaction up 15% but ROI still developing" },
  { date: "Jan 20", decision: "Raised prices 15%", impact: "positive" as const, metric: "+$5,400/mo", detail: "Only 2 clients churned — net positive after 60 days" },
  { date: "Dec 5", decision: "Paused Google Ads", impact: "negative" as const, metric: "-18% leads", detail: "Organic couldn't compensate — resumed after 3 weeks" },
  { date: "Nov 1", decision: "Launched referral program", impact: "positive" as const, metric: "+4 clients", detail: "8% of new clients now come from referrals" },
];

export const DEMO_WHATIF = [
  { q: "What if you raise prices 10%?", proj: "Revenue: +$4,280/mo · Risk: ~5% churn", conf: 72, rec: "Based on Jan data, clients showed low elasticity. Recommended." },
  { q: "What if you stop all paid ads?", proj: "New leads: -35% in 60 days · Revenue: -$6,200/mo by Q3", conf: 65, rec: "Reduce spend 30% instead of eliminating." },
  { q: "What if you launch a retainer model?", proj: "MRR potential: +$12,000/mo if 40% adopt", conf: 55, rec: "High potential. Start with top 10 clients." },
  { q: "What if Bloom Studio churns?", proj: "Revenue: -$6,800/mo · 16% concentration risk realized", conf: 80, rec: "Activate retention protocol now." },
];

export const DEMO_callStats = [
  { label: "Calls Today", value: "8", delta: "3 completed, 5 remaining", icon: Phone, color: "text-blue-400" },
  { label: "Conversion Rate", value: "42%", delta: "+8% vs last month", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Avg Call Duration", value: "18 min", delta: "optimal range", icon: Clock, color: "text-amber-400" },
  { label: "Follow-ups Pending", value: "5", delta: "2 overdue", icon: MessageSquare, color: "text-purple-400" },
  { label: "Revenue from Calls", value: "$28,400", delta: "this month", icon: DollarSign, color: "text-emerald-400" },
  { label: "No-Show Rate", value: "14%", delta: "-4% vs last month", icon: AlertTriangle, color: "text-amber-400" },
];

export const DEMO_callQueue = [
  { name: "Sarah Chen", company: "Apex Coaching Co.", priority: "critical", reason: "Quote follow-up — viewed 3x, no response in 5 days", value: "$12,500", lastContact: "5 days ago", warmth: 72, prepNotes: "Interested in Growth Strategy Package. Asked about ROI and timeline. Viewed pricing section 3x — likely price-sensitive.", objections: ["Comparing with competitor", "Wants ROI data"], suggestedTalkingPoints: ["Share case study from similar coaching business", "Offer payment plan option", "Reference their specific growth goals from intake"], postCallActions: ["Generate updated quote if needed", "Send case study", "Create follow-up task for 48hrs"] },
  { name: "Marcus Johnson", company: "Peak Performance", priority: "high", reason: "Discovery call — booked via funnel, high-value lead", value: "$18,000", lastContact: "New lead", warmth: 85, prepNotes: "Coaching program inquiry. 6-month commitment. Budget confirmed in form. Fitness industry. Source: Google Ads.", objections: [], suggestedTalkingPoints: ["Discuss 6-month program structure", "Share fitness client success stories", "Clarify onboarding process"], postCallActions: ["Generate quote", "Send program overview PDF", "Schedule follow-up if not closed"] },
  { name: "Emily Rodriguez", company: "Studio Bloom", priority: "high", reason: "Proposal review — sent marketing retainer, needs decision push", value: "$4,800", lastContact: "3 days ago", warmth: 58, prepNotes: "Comparing with competitor. Price-sensitive but values quality. Creative industry. Mentioned tight timeline.", objections: ["Price comparison", "Timeline concerns"], suggestedTalkingPoints: ["Emphasize speed of results", "Offer 3-month trial instead of 6", "Show portfolio of creative clients"], postCallActions: ["Adjust quote if needed", "Send portfolio examples", "Set decision deadline"] },
  { name: "David Kim", company: "Zenith Consulting", priority: "medium", reason: "Re-engagement — dormant 60 days, was a strong client", value: "$6,200", lastContact: "60 days ago", warmth: 45, prepNotes: "Previous client. Advisory retainer expired. Good relationship. Left due to budget timing, not dissatisfaction.", objections: ["Budget timing"], suggestedTalkingPoints: ["Reference previous successful engagement", "Offer refreshed scope", "Discuss Q3 budget alignment"], postCallActions: ["Generate new proposal if interested", "Schedule Q3 start if budget timing", "Add to reactivation sequence if not ready"] },
  { name: "Lisa Wang", company: "NextLevel Fitness", priority: "low", reason: "Check-in — onboarding week 2, satisfaction pulse", value: "$8,900", lastContact: "4 days ago", warmth: 92, prepNotes: "Website + funnel project. On track. Week 2 of 6. Very engaged. Ask about add-on services.", objections: [], suggestedTalkingPoints: ["Review project progress", "Ask about satisfaction", "Introduce SEO add-on opportunity"], postCallActions: ["Log satisfaction score", "Generate upsell quote if interested", "Update project status"] },
  { name: "Rachel Green", company: "Harmony Health", priority: "medium", reason: "Quote viewed 5x — very interested but hesitant", value: "$3,200", lastContact: "2 days ago", warmth: 68, prepNotes: "Content marketing package. Health/wellness industry. Wants to see more examples. 5 views = strong interest.", objections: ["Wants examples"], suggestedTalkingPoints: ["Share health industry content examples", "Offer sample content piece", "Discuss measurement framework"], postCallActions: ["Send content samples", "Update quote with sample deliverable", "Set 48hr follow-up"] },
];

export const DEMO_recentCalls = [
  { name: "Tom Harris", company: "Harris Legal", outcome: "Qualified — sending proposal", duration: "22 min", time: "2 hrs ago", nextStep: "Generate quote ($7,500)", sentiment: "positive", quoteTriggered: true, followUpSent: true },
  { name: "Anna Park", company: "Park Designs", outcome: "Booked follow-up for Thursday", duration: "15 min", time: "3 hrs ago", nextStep: "Send case studies before Thursday", sentiment: "warm", quoteTriggered: false, followUpSent: true },
  { name: "James Lee", company: "Lee Ventures", outcome: "Not interested — closed lost", duration: "8 min", time: "Yesterday", nextStep: "Add to reactivation (6 months)", sentiment: "neutral", quoteTriggered: false, followUpSent: false },
  { name: "Sophie Turner", company: "Turner Marketing", outcome: "Closed — accepted $5,200 retainer", duration: "28 min", time: "Yesterday", nextStep: "Onboarding triggered automatically", sentiment: "very positive", quoteTriggered: false, followUpSent: true },
  { name: "Mike Chen", company: "Chen Properties", outcome: "Needs internal approval — follow up Monday", duration: "35 min", time: "2 days ago", nextStep: "Send executive summary for their board", sentiment: "positive", quoteTriggered: true, followUpSent: true },
];

export const DEMO_callAnalytics = [
  { metric: "Calls to Close", value: "3.2 avg", trend: "improving", benchmark: "4.5 industry avg" },
  { metric: "Best Day for Calls", value: "Tuesday", trend: "stable", benchmark: "Based on 90-day data" },
  { metric: "Best Time for Calls", value: "10am-12pm", trend: "stable", benchmark: "42% higher connect rate" },
  { metric: "Avg Deal Size from Calls", value: "$6,800", trend: "improving", benchmark: "+22% vs email-only" },
  { metric: "Post-Call Follow-up Rate", value: "88%", trend: "improving", benchmark: "Target: 100%" },
  { metric: "No-Show Recovery Rate", value: "33%", trend: "stable", benchmark: "Via SMS rescue within 15min" },
];

export const DEMO_REV_CAMPAIGNS = [
  { name: "Welcome Sequence", type: "email", status: "active", subscribers: 234, openRate: 68.4, clickRate: 24.2, conversions: 18, revenue: "$5,400", steps: 5, completionRate: 72 },
  { name: "Re-Engagement Series", type: "email", status: "active", subscribers: 89, openRate: 42.1, clickRate: 12.8, conversions: 6, revenue: "$2,400", steps: 4, completionRate: 45 },
  { name: "Upsell After Purchase", type: "automation", status: "active", subscribers: 47, openRate: 55.3, clickRate: 18.6, conversions: 8, revenue: "$6,800", steps: 3, completionRate: 82 },
  { name: "Holiday Campaign 2026", type: "email", status: "draft", subscribers: 0, openRate: 0, clickRate: 0, conversions: 0, revenue: "$0", steps: 6, completionRate: 0 },
];

export const DEMO_REV_SEGMENTS = [
  { name: "All Contacts", count: 454, growth: "+12" },
  { name: "Active Customers", count: 67, growth: "+3" },
  { name: "Warm Leads", count: 89, growth: "+8" },
  { name: "At-Risk", count: 14, growth: "-2" },
  { name: "VIP / Advocates", count: 12, growth: "+1" },
];

export const DEMO_JOURNEYS = [
  {
    id: "j1", name: "Coaching Client Onboarding", status: "active", activeClients: 8, completionRate: "78%", avgDays: 5,
    steps: [
      { name: "Welcome Email", type: "email", auto: true, completionRate: 100 },
      { name: "Intake Form", type: "form", auto: false, completionRate: 92 },
      { name: "Schedule Kick-off Call", type: "booking", auto: false, completionRate: 85 },
      { name: "Resource Access", type: "access", auto: true, completionRate: 100 },
      { name: "First Session", type: "meeting", auto: false, completionRate: 78 },
      { name: "Feedback Check-in", type: "email", auto: true, completionRate: 65 },
    ],
  },
  {
    id: "j2", name: "VIP Day Preparation", status: "active", activeClients: 2, completionRate: "90%", avgDays: 7,
    steps: [
      { name: "Confirmation + Payment", type: "payment", auto: true, completionRate: 100 },
      { name: "Pre-Work Questionnaire", type: "form", auto: true, completionRate: 95 },
      { name: "Calendar Block", type: "booking", auto: false, completionRate: 90 },
      { name: "Materials Sent", type: "delivery", auto: true, completionRate: 100 },
      { name: "Pre-Call Check", type: "meeting", auto: false, completionRate: 85 },
    ],
  },
  {
    id: "j3", name: "Retainer Setup", status: "draft", activeClients: 0, completionRate: "—", avgDays: 0,
    steps: [
      { name: "Contract Signing", type: "document", auto: false, completionRate: 0 },
      { name: "Kickoff Meeting", type: "meeting", auto: false, completionRate: 0 },
      { name: "Team Introductions", type: "email", auto: true, completionRate: 0 },
      { name: "Access Provisioning", type: "access", auto: true, completionRate: 0 },
      { name: "First Deliverable", type: "delivery", auto: false, completionRate: 0 },
    ],
  },
];

export const DEMO_ACTIVE_CLIENTS = [
  { name: "Sarah Mitchell", journey: "Coaching Client Onboarding", step: 4, totalSteps: 6, startedAt: "3 days ago", status: "on-track" },
  { name: "James Chen", journey: "Coaching Client Onboarding", step: 3, totalSteps: 6, startedAt: "5 days ago", status: "on-track" },
  { name: "Emily Rodriguez", journey: "VIP Day Preparation", step: 3, totalSteps: 5, startedAt: "4 days ago", status: "on-track" },
  { name: "Michael Park", journey: "Coaching Client Onboarding", step: 2, totalSteps: 6, startedAt: "7 days ago", status: "delayed" },
  { name: "Kate Adams", journey: "VIP Day Preparation", step: 5, totalSteps: 5, startedAt: "6 days ago", status: "completed" },
];

export const DEMO_memoryEvents = [
  { time: "2 hours ago", title: "Campaign 'Spring Growth' conversion rate dropped 3%", type: "campaign", severity: "medium", icon: TrendingDown, color: "text-amber-400" },
  { time: "5 hours ago", title: "New review: 5★ from Apex Coaching Co.", type: "reputation", severity: "low", icon: Star, color: "text-emerald-400" },
  { time: "8 hours ago", title: "Lead stage drift: 8 leads stuck in 'Proposal Sent' >14 days", type: "crm", severity: "high", icon: AlertTriangle, color: "text-red-400" },
  { time: "12 hours ago", title: "Booking utilization increased to 78% (was 65%)", type: "booking", severity: "low", icon: Calendar, color: "text-blue-400" },
  { time: "1 day ago", title: "Retention Advisor stance changed: churn risk elevated for Starter tier", type: "advisor", severity: "medium", icon: Users, color: "text-purple-400" },
  { time: "1 day ago", title: "Funnel 'Free Consultation' checkout abandonment up 12%", type: "funnel", severity: "high", icon: TrendingDown, color: "text-red-400" },
  { time: "2 days ago", title: "'Business Growth Masterclass' enrollment +15 this week", type: "membership", severity: "low", icon: TrendingUp, color: "text-emerald-400" },
  { time: "2 days ago", title: "Offer 'Pro Coaching Package' conversion steady at 24%", type: "offer", severity: "low", icon: Package, color: "text-blue-400" },
  { time: "3 days ago", title: "Email deliverability improved: bounce rate 0.8% (was 2.1%)", type: "campaign", severity: "low", icon: CheckCircle, color: "text-emerald-400" },
  { time: "3 days ago", title: "3 no-shows yesterday — above 7-day average", type: "booking", severity: "medium", icon: AlertTriangle, color: "text-amber-400" },
];

export const DEMO_EXPERIMENTS = [
  {
    name: "Landing Page Headline Test", status: "running", startDate: "Mar 15, 2026",
    variants: [
      { name: "Control", visitors: 1420, conversions: 341, rate: 24.0 },
      { name: "Variant A — Social Proof", visitors: 1418, conversions: 398, rate: 28.1 },
    ],
    lift: "+17.1%", confidence: 94, winner: "Variant A",
  },
  {
    name: "Checkout Flow — Single vs Multi-Step", status: "running", startDate: "Mar 22, 2026",
    variants: [
      { name: "Multi-Step (Control)", visitors: 680, conversions: 47, rate: 6.9 },
      { name: "Single-Step", visitors: 675, conversions: 54, rate: 8.0 },
    ],
    lift: "+15.9%", confidence: 78, winner: null,
  },
  {
    name: "Email Subject Line — Urgency vs Curiosity", status: "completed", startDate: "Mar 1, 2026",
    variants: [
      { name: "Urgency", visitors: 2400, conversions: 456, rate: 19.0 },
      { name: "Curiosity", visitors: 2398, conversions: 528, rate: 22.0 },
    ],
    lift: "+15.8%", confidence: 99, winner: "Curiosity",
  },
  {
    name: "Pricing Page — Annual Toggle Default", status: "draft", startDate: "—",
    variants: [
      { name: "Monthly Default", visitors: 0, conversions: 0, rate: 0 },
      { name: "Annual Default", visitors: 0, conversions: 0, rate: 0 },
    ],
    lift: "—", confidence: 0, winner: null,
  },
];

export const DEMO_FORMS = [
  { id: "f1", name: "Free Consultation Application", status: "live", submissions: 186, convRate: "24%", lastSubmission: "2h ago", fields: 8, linkedFunnel: "Free Consultation Funnel", tags: ["lead-gen", "discovery"] },
  { id: "f2", name: "VIP Day Inquiry", status: "live", submissions: 34, convRate: "67%", lastSubmission: "1d ago", fields: 12, linkedFunnel: "VIP Funnel", tags: ["high-value", "qualification"] },
  { id: "f3", name: "Webinar Registration", status: "live", submissions: 412, convRate: "38%", lastSubmission: "45m ago", fields: 4, linkedFunnel: "Webinar Registration", tags: ["event", "lead-gen"] },
  { id: "f4", name: "Client Feedback Survey", status: "live", submissions: 89, convRate: "72%", lastSubmission: "3d ago", fields: 10, tags: ["feedback", "nps"] },
  { id: "f5", name: "Partnership Application", status: "draft", submissions: 0, convRate: "—", lastSubmission: "—", fields: 15, tags: ["partnership", "b2b"] },
];

export const DEMO_FIELD_TYPES = [
  { type: "text", label: "Short Text", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "phone", label: "Phone", icon: Phone },
  { type: "number", label: "Number", icon: Hash },
  { type: "date", label: "Date", icon: Calendar },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "dropdown", label: "Dropdown", icon: List },
  { type: "textarea", label: "Long Text", icon: AlignLeft },
  { type: "file", label: "File Upload", icon: Upload },
  { type: "rating", label: "Rating", icon: Star },
];

export const DEMO_SAMPLE_FIELDS = [
  { id: "sf1", type: "text", label: "Full Name", required: true, placeholder: "Enter your name" },
  { id: "sf2", type: "email", label: "Email Address", required: true, placeholder: "your@email.com" },
  { id: "sf3", type: "phone", label: "Phone Number", required: false, placeholder: "+1 (555) 000-0000" },
  { id: "sf4", type: "dropdown", label: "How did you hear about us?", required: false, options: ["Google", "Referral", "Social Media", "Other"] },
  { id: "sf5", type: "textarea", label: "Tell us about your business", required: true, placeholder: "Share your goals and challenges..." },
  { id: "sf6", type: "dropdown", label: "Budget Range", required: true, options: ["$1K-$5K", "$5K-$15K", "$15K-$50K", "$50K+"] },
];

export const DEMO_REV_STATS_FORMS_BUILDER = [
  { label: "Total Forms", value: DEMO_FORMS.length },
  { label: "Total Submissions", value: "721" },
  { label: "Avg. Conversion", value: "42%" },
  { label: "Active Forms", value: DEMO_FORMS.filter(f => f.status === "live").length },
];

export const DEMO_FUNNELS = [
  {
    name: "Launch Pro Funnel",
    status: "live",
    visitors: 2840,
    optIns: 682,
    sales: 47,
    revenue: "$14,100",
    conversionRate: "1.65%",
    steps: [
      { name: "Landing Page", visitors: 2840, conversion: "24.0%" },
      { name: "Opt-In Form", visitors: 682, conversion: "42.1%" },
      { name: "Sales Page", visitors: 287, conversion: "16.4%" },
      { name: "Checkout", visitors: 47, conversion: "100%" },
      { name: "Thank You", visitors: 47, conversion: "—" },
    ],
  },
  {
    name: "Free Consultation Funnel",
    status: "live",
    visitors: 1240,
    optIns: 186,
    sales: 12,
    revenue: "$28,800",
    conversionRate: "0.97%",
    steps: [
      { name: "Landing Page", visitors: 1240, conversion: "15.0%" },
      { name: "Application Form", visitors: 186, conversion: "38.7%" },
      { name: "Booking Page", visitors: 72, conversion: "16.7%" },
      { name: "Confirmation", visitors: 12, conversion: "—" },
    ],
  },
  {
    name: "Webinar Registration",
    status: "draft",
    visitors: 0,
    optIns: 0,
    sales: 0,
    revenue: "$0",
    conversionRate: "—",
    steps: [
      { name: "Registration Page", visitors: 0, conversion: "—" },
      { name: "Confirmation", visitors: 0, conversion: "—" },
      { name: "Replay + Offer", visitors: 0, conversion: "—" },
    ],
  },
];

export const DEMO_ADVISORS = [
  {
    name: "Growth Advisor",
    icon: TrendingUp,
    domain: "Acquisition & Expansion",
    stance: "Top-of-funnel is healthy. Recommend scaling paid acquisition while CAC is low. Focus on webinar funnel — highest ROI channel right now.",
    watching: ["Lead volume trends", "Channel ROI", "Market positioning", "Competitor moves"],
    confidence: 0.82,
    recommendation: "Scale acquisition spend 15%",
    type: "opportunity" as const,
  },
  {
    name: "Sales Advisor",
    icon: Target,
    domain: "Pipeline & Conversion",
    stance: "Pipeline velocity is slowing in Enterprise segment. Average deal cycle extended by 8 days. Consider re-qualifying stale opportunities.",
    watching: ["Close rates by segment", "Deal velocity", "Proposal-to-close ratio", "Follow-up discipline"],
    confidence: 0.76,
    recommendation: "Re-qualify 12 stale pipeline deals",
    type: "warning" as const,
  },
  {
    name: "Marketing Advisor",
    icon: Zap,
    domain: "Campaigns & Content",
    stance: "Email engagement is strong — open rates above industry average. Content strategy needs more bottom-of-funnel assets. Landing page conversion has room for optimization.",
    watching: ["Email metrics", "Content performance", "Landing page conversion", "Brand awareness"],
    confidence: 0.79,
    recommendation: "Create 3 case study assets",
    type: "opportunity" as const,
  },
  {
    name: "Retention Advisor",
    icon: Shield,
    domain: "Churn & Loyalty",
    stance: "Overall retention is strong at 91%. Two high-value clients showing disengagement signals. Proactive outreach recommended within 48 hours.",
    watching: ["Engagement scores", "Usage patterns", "Support satisfaction", "Renewal pipeline"],
    confidence: 0.74,
    recommendation: "Immediate outreach to 2 at-risk clients",
    type: "alert" as const,
  },
  {
    name: "Pricing Advisor",
    icon: DollarSign,
    domain: "Monetization & Packaging",
    stance: "Current pricing sits below market median for comparable value. 8-12% increase feasible without significant churn risk. Bundle strategy underutilized.",
    watching: ["Price sensitivity", "Competitive pricing", "Bundle performance", "Discount patterns"],
    confidence: 0.68,
    recommendation: "Test 10% price increase on new customers",
    type: "opportunity" as const,
  },
  {
    name: "Relationship Advisor",
    icon: Users,
    domain: "Customer Success & Advocacy",
    stance: "Referral program underperforming — only 12 advocates active. VIP clients highly satisfied but not being leveraged for testimonials or introductions.",
    watching: ["NPS trends", "Referral pipeline", "Testimonial velocity", "Community engagement"],
    confidence: 0.71,
    recommendation: "Launch structured referral ask to top 20 clients",
    type: "opportunity" as const,
  },
];

export const DEMO_REV_PIPELINE_STAGES = [
  { name: "Awareness", count: 142, value: "$0", conversion: "100%" },
  { name: "Interest", count: 89, value: "$0", conversion: "62.7%" },
  { name: "Consideration", count: 34, value: "$85,000", conversion: "38.2%" },
  { name: "Intent", count: 18, value: "$126,000", conversion: "52.9%" },
  { name: "Negotiation", count: 8, value: "$92,000", conversion: "44.4%" },
  { name: "Won", count: 5, value: "$47,280", conversion: "62.5%" },
];

export const DEMO_REV_LEAKS = [
  { area: "Stale leads (>14 days)", count: 12, revenue: "$34,200", severity: "high" },
  { area: "Abandoned checkouts", count: 8, revenue: "$6,400", severity: "medium" },
  { area: "Missed follow-ups", count: 5, revenue: "$18,500", severity: "high" },
  { area: "Expired quotes", count: 3, revenue: "$12,000", severity: "medium" },
];

export const DEMO_REV_ADVISOR_SIGNALS = [
  { advisor: "Growth", signal: "Lead volume up 18% — nurture sequences should scale", type: "opportunity" },
  { advisor: "Sales", signal: "Close rate declining in Enterprise segment", type: "warning" },
  { advisor: "Marketing", signal: "Email open rates strong — increase send frequency", type: "opportunity" },
  { advisor: "Retention", signal: "2 high-value clients showing disengagement signals", type: "alert" },
];

export const DEMO_GROWTH_TRAITS = [
  { trait: "Revenue Concentration", score: 72, status: "warning", insight: "Top 3 clients represent 58% of revenue", recommendation: "Target 3 new mid-market clients this quarter" },
  { trait: "Repeat Purchase Rate", score: 85, status: "strong", insight: "85% of clients return within 90 days", recommendation: "Launch referral program to capitalize on loyalty" },
  { trait: "Lead-to-Close Velocity", score: 61, status: "warning", insight: "Average 34 days from lead to close — 40% slower than benchmark", recommendation: "Streamline proposal stage — add quote templates" },
  { trait: "Revenue per Client", score: 78, status: "strong", insight: "$4,200 avg revenue per client — above industry median", recommendation: "Introduce premium tier to increase ARPC to $5,500" },
  { trait: "Churn Resilience", score: 45, status: "critical", insight: "No win-back system active — lost clients rarely return", recommendation: "Activate automated win-back sequences" },
  { trait: "Seasonal Stability", score: 68, status: "moderate", insight: "Q1 revenue dips 22% — seasonal pattern detected", recommendation: "Pre-sell Q1 packages in Q4 to smooth revenue curve" },
  { trait: "Referral Engine", score: 38, status: "critical", insight: "Only 8% of new clients come from referrals", recommendation: "Launch NPS-triggered referral campaign" },
  { trait: "Upsell Penetration", score: 52, status: "moderate", insight: "32% of clients on base tier — upsell opportunity exists", recommendation: "Create mid-tier package with 2x margin" },
];

export const DEMO_REV_ARCHETYPES = [
  { name: "Relationship Builder", match: 82, description: "Revenue grows through deep trust, repeat business, and referrals", strengths: ["Client retention", "Service quality"], risks: ["Over-reliance on existing clients"] },
  { name: "Sales Machine", match: 45, description: "Revenue grows through systematic pipeline and volume", strengths: ["Lead generation", "Process efficiency"], risks: ["Client depth", "Relationship quality"] },
  { name: "Platform Monetizer", match: 28, description: "Revenue grows through products, memberships, and recurring access", strengths: ["Scalability"], risks: ["Requires significant product investment"] },
];

export const DEMO_PLAYS = [
  { play: "Revenue Diversification Sprint", impact: "high", timeline: "60 days", expected: "+$15,000/mo", description: "Target 5 new mid-market prospects to reduce top-client concentration" },
  { play: "Win-Back Automation", impact: "high", timeline: "14 days", expected: "+$8,400/mo", description: "Activate 3-touch win-back sequence for 23 churned clients" },
  { play: "Referral Engine Launch", impact: "medium", timeline: "7 days", expected: "+$5,200/mo", description: "NPS-triggered referral asks with incentive for top 15 promoters" },
  { play: "Premium Tier Introduction", impact: "high", timeline: "30 days", expected: "+$12,000/mo", description: "Create premium service tier at 2x price for top 20% of clients" },
];

export const DEMO_JOURNEY_STAGES = [
  {
    stage: "Awareness",
    touchpoints: [
      { type: "ad", label: "Google Ad Click", time: "Day 0", icon: Eye },
      { type: "page", label: "Landing Page Visit", time: "Day 0", icon: MousePointer },
    ],
    metrics: { entered: 2840, exited: 1598, conversion: "43.7%" },
  },
  {
    stage: "Engagement",
    touchpoints: [
      { type: "form", label: "Lead Magnet Download", time: "Day 0", icon: MousePointer },
      { type: "email", label: "Welcome Email Opened", time: "Day 1", icon: Mail },
      { type: "email", label: "Follow-Up Email Clicked", time: "Day 3", icon: Mail },
    ],
    metrics: { entered: 1242, exited: 556, conversion: "55.2%" },
  },
  {
    stage: "Consideration",
    touchpoints: [
      { type: "page", label: "Sales Page Visit", time: "Day 4", icon: Eye },
      { type: "call", label: "Discovery Call Booked", time: "Day 5", icon: Phone },
      { type: "email", label: "Case Study Sent", time: "Day 6", icon: Mail },
    ],
    metrics: { entered: 686, exited: 399, conversion: "41.8%" },
  },
  {
    stage: "Decision",
    touchpoints: [
      { type: "proposal", label: "Proposal Viewed", time: "Day 7", icon: Eye },
      { type: "call", label: "Closing Call", time: "Day 10", icon: Phone },
    ],
    metrics: { entered: 287, exited: 200, conversion: "30.3%" },
  },
  {
    stage: "Purchase",
    touchpoints: [
      { type: "checkout", label: "Checkout Completed", time: "Day 12", icon: CreditCard },
    ],
    metrics: { entered: 87, exited: 0, conversion: "100%" },
  },
  {
    stage: "Advocacy",
    touchpoints: [
      { type: "review", label: "Review Submitted", time: "Day 30+", icon: Star },
    ],
    metrics: { entered: 87, exited: 75, conversion: "13.8%" },
  },
];

export const DEMO_REV_LEAKS_LEAK_DETECTOR = [
  {
    category: "Stale Leads", icon: Users, items: 12, revenue: "$34,200", severity: "high",
    description: "Leads with no follow-up in 14+ days", action: "Launch re-engagement sequence",
    details: [
      { name: "Summit Group", value: "$12,000", days: 18 },
      { name: "Nova Ventures", value: "$8,500", days: 22 },
      { name: "Apex Digital", value: "$6,200", days: 15 },
    ],
  },
  {
    category: "Abandoned Checkouts", icon: ShoppingCart, items: 8, revenue: "$6,400", severity: "medium",
    description: "Checkout started but not completed", action: "Send cart recovery emails",
    details: [
      { name: "Growth Blueprint", value: "$297", days: 2 },
      { name: "Coaching Package", value: "$500", days: 3 },
      { name: "VIP Bundle", value: "$697", days: 1 },
    ],
  },
  {
    category: "Missed Follow-ups", icon: Mail, items: 5, revenue: "$18,500", severity: "high",
    description: "Scheduled follow-ups not executed", action: "Complete follow-ups today",
    details: [
      { name: "Green Valley Co", value: "$8,000", days: 5 },
      { name: "Bright Path Inc", value: "$6,500", days: 3 },
    ],
  },
  {
    category: "Expired Quotes", icon: FileText, items: 3, revenue: "$12,000", severity: "medium",
    description: "Proposals past expiry without response", action: "Resend with updated terms",
    details: [
      { name: "Atlas Corp", value: "$8,000", days: 10 },
      { name: "Peak Studios", value: "$4,000", days: 7 },
    ],
  },
];

export const DEMO_courses = [
  { name: "Business Growth Masterclass", members: 342, completion: 67, modules: 12, rating: 4.8, status: "live", revenue: 28400, churnRisk: 8 },
  { name: "Marketing Foundations", members: 189, completion: 54, modules: 8, rating: 4.6, status: "live", revenue: 12600, churnRisk: 15 },
  { name: "Leadership Accelerator", members: 78, completion: 82, modules: 6, rating: 4.9, status: "live", revenue: 15600, churnRisk: 3 },
  { name: "Sales Playbook Pro", members: 0, completion: 0, modules: 10, rating: 0, status: "draft", revenue: 0, churnRisk: 0 },
];

export const DEMO_REV_PRODUCTS = [
  { name: "Growth Strategy Blueprint", type: "digital", price: "$297", sales: 142, revenue: "$42,174", status: "active", category: "Course" },
  { name: "1:1 Coaching — Monthly", type: "service", price: "$500/mo", sales: 18, revenue: "$9,000", status: "active", category: "Membership" },
  { name: "VIP Day Experience", type: "service", price: "$2,000", sales: 8, revenue: "$16,000", status: "active", category: "Service" },
  { name: "Starter Kit Bundle", type: "bundle", price: "$97", sales: 234, revenue: "$22,698", status: "active", category: "Bundle" },
  { name: "Community Membership", type: "membership", price: "$47/mo", sales: 67, revenue: "$3,149", status: "active", category: "Membership" },
  { name: "Advanced Workshop Series", type: "course", price: "$497", sales: 0, revenue: "$0", status: "draft", category: "Course" },
];

export const DEMO_REV_BUNDLES = [
  { name: "Launch Package", includes: ["Growth Strategy Blueprint", "Starter Kit Bundle", "1 Coaching Session"], price: "$697", savings: "Save $197" },
  { name: "VIP All-Access", includes: ["All Courses", "Community Membership", "Monthly Coaching"], price: "$997/mo", savings: "Save $347/mo" },
];

export const DEMO_opportunities = [
  { title: "12 warm leads not yet contacted", impact: "$18,400", confidence: 87, effort: "Low", category: "Conversion", advisor: "CRM Advisor", icon: UserPlus, why: "These leads visited pricing page 3+ times but no follow-up scheduled" },
  { title: "Upsell Premium tier to 34 Professional members", impact: "$6,800/mo", confidence: 72, effort: "Medium", category: "Upsell", advisor: "Retention Advisor", icon: TrendingUp, why: "Usage patterns match Premium member behavior" },
  { title: "23 happy clients ready for review request", impact: "Trust boost", confidence: 91, effort: "Low", category: "Reputation", advisor: "Reputation Advisor", icon: Star, why: "NPS 9-10 scores, no review submitted yet" },
  { title: "Reactivation: 18 dormant clients (90+ days)", impact: "$12,200", confidence: 54, effort: "Medium", category: "Reactivation", advisor: "Retention Advisor", icon: RefreshCw, why: "Previously high-value clients, no recent engagement" },
  { title: "Bundle 'Growth + Marketing' courses", impact: "$8,500", confidence: 65, effort: "Low", category: "Packaging", advisor: "Offer Advisor", icon: DollarSign, why: "78% of Marketing buyers also view Growth Masterclass" },
  { title: "Referral program for top 10% of clients", impact: "$22,000", confidence: 58, effort: "High", category: "Referral", advisor: "Revenue Strategist", icon: Lightbulb, why: "Top clients have high satisfaction but no referral incentive exists" },
];

export const DEMO_STAGES: { name: string; color: string; deals: Deal[] }[] = [
  {
    name: "Prospecting", color: "border-l-blue-400",
    deals: [
      { id: "d1", name: "Apex Digital — Website Redesign", value: 15000, probability: 20, age: 3, owner: "You", contact: "Sarah Mitchell", nextAction: "Discovery call", nextActionDate: "Tomorrow", source: "Referral", tags: ["design", "high-value"] },
      { id: "d2", name: "Nova Labs — Consulting Package", value: 8500, probability: 15, age: 7, owner: "You", contact: "James Chen", nextAction: "Send proposal", nextActionDate: "Apr 8", source: "Website", tags: ["consulting"] },
      { id: "d3", name: "Clarity Inc — Strategy Sprint", value: 6000, probability: 10, age: 2, owner: "You", contact: "Anna Lee", source: "Cold outreach", tags: ["strategy"] },
    ],
  },
  {
    name: "Qualification", color: "border-l-amber-400",
    deals: [
      { id: "d4", name: "Summit Group — Annual Retainer", value: 36000, probability: 40, age: 12, owner: "You", contact: "Michael Park", nextAction: "Budget discussion", nextActionDate: "Apr 9", source: "Conference", tags: ["retainer", "enterprise"] },
      { id: "d5", name: "Bright Path — Coaching Program", value: 4800, probability: 35, age: 5, owner: "You", contact: "Emily Rodriguez", source: "Funnel", tags: ["coaching"] },
    ],
  },
  {
    name: "Proposal", color: "border-l-purple-400",
    deals: [
      { id: "d6", name: "Craft Studios — Brand Package", value: 22000, probability: 65, age: 18, owner: "You", contact: "Lisa Wang", nextAction: "Follow up on proposal", nextActionDate: "Today", source: "Referral", tags: ["branding", "high-value"] },
      { id: "d7", name: "Pinnacle Health — Digital Strategy", value: 14000, probability: 55, age: 10, owner: "You", contact: "David Chen", source: "Website", tags: ["strategy", "healthcare"] },
    ],
  },
  {
    name: "Negotiation", color: "border-l-emerald-400",
    deals: [
      { id: "d8", name: "Atlas Corp — Platform License", value: 48000, probability: 80, age: 25, owner: "You", contact: "Robert Kim", nextAction: "Contract review", nextActionDate: "Apr 7", source: "Inbound", tags: ["enterprise", "recurring"] },
      { id: "d9", name: "Green Valley — Implementation", value: 18500, probability: 75, age: 14, owner: "You", contact: "Kate Adams", source: "Upsell", tags: ["implementation"] },
    ],
  },
  {
    name: "Closed Won", color: "border-l-green-400",
    deals: [
      { id: "d10", name: "Mitchell Co — Q2 Services", value: 12400, probability: 100, age: 0, owner: "You", contact: "Tom Mitchell", source: "Repeat", tags: ["services"] },
    ],
  },
];

export const DEMO_REV_LEAKS_PIPELINE_STUDIO = [
  { deal: "Craft Studios — Brand Package", issue: "Proposal sent 18 days ago, no follow-up scheduled", severity: "high", lostRevenue: 22000 },
  { deal: "Atlas Corp — Platform License", issue: "In negotiation 25 days — above avg 15 days", severity: "medium", lostRevenue: 0 },
  { deal: "Nova Labs — Consulting Package", issue: "No next action defined", severity: "medium", lostRevenue: 8500 },
];

export const DEMO_VELOCITY = [
  { stage: "Prospecting → Qualification", avgDays: 8, target: 7, deals: 12 },
  { stage: "Qualification → Proposal", avgDays: 10, target: 10, deals: 8 },
  { stage: "Proposal → Negotiation", avgDays: 14, target: 12, deals: 5 },
  { stage: "Negotiation → Closed", avgDays: 18, target: 15, deals: 4 },
];

export const DEMO_quoteStats = [
  { label: "Active Quotes", value: "18", delta: "+4 this week", icon: FileText, color: "text-blue-400" },
  { label: "Pipeline Value", value: "$124,800", delta: "across 18 DEMO_quotes", icon: DollarSign, color: "text-emerald-400" },
  { label: "Acceptance Rate", value: "68%", delta: "+5% vs last month", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Avg Time to Accept", value: "4.2 days", delta: "-0.8 days improvement", icon: Clock, color: "text-amber-400" },
  { label: "Revenue from Quotes", value: "$84,200", delta: "this month closed", icon: TrendingUp, color: "text-emerald-400" },
  { label: "At-Risk Quotes", value: "4", delta: "$32,400 at risk", icon: AlertTriangle, color: "text-red-400" },
];

export const DEMO_quotes = [
  { client: "Apex Coaching Co.", service: "Growth Strategy Package", amount: 12500, status: "viewed", sentAt: "2 days ago", viewedAt: "1 day ago", viewCount: 3, expiresIn: "5 days", followUp: "Auto reminder at day 5", discount: null, priority: "high", objections: "Comparing with competitor", aiInsight: "Client viewed pricing section 3x — likely price-sensitive. Consider adding ROI projections." },
  { client: "Studio Bloom", service: "Marketing Retainer (6mo)", amount: 4800, status: "sent", sentAt: "1 day ago", viewedAt: null, viewCount: 0, expiresIn: "13 days", followUp: "Reminder at day 3", discount: null, priority: "medium", objections: null, aiInsight: "Similar clients in creative industry convert 40% higher with case study inclusion." },
  { client: "NextLevel Fitness", service: "Website + Funnel Bundle", amount: 8900, status: "accepted", sentAt: "5 days ago", viewedAt: "4 days ago", viewCount: 2, expiresIn: null, followUp: "Invoice generated → onboarding triggered", discount: "5%", priority: "closed", objections: null, aiInsight: "Accepted after case study send. Pattern: fitness clients respond to visual portfolio." },
  { client: "Zenith Consulting", service: "Advisory Retainer + SEO", amount: 6200, status: "expired", sentAt: "16 days ago", viewedAt: "10 days ago", viewCount: 1, expiresIn: null, followUp: "Reactivation needed", discount: null, priority: "low", objections: "Budget timing", aiInsight: "Client engaged with email but didn't return to quote. Personal call recommended." },
  { client: "Peak Performance", service: "Coaching Program (6mo)", amount: 18000, status: "draft", sentAt: null, viewedAt: null, viewCount: 0, expiresIn: null, followUp: "Awaiting review", discount: null, priority: "high", objections: null, aiInsight: "High-value opportunity. Include testimonial from similar coaching client." },
  { client: "Harmony Health", service: "Content Marketing Package", amount: 3200, status: "viewed", sentAt: "3 days ago", viewedAt: "2 days ago", viewCount: 5, expiresIn: "11 days", followUp: "Day 3 reminder (today)", discount: null, priority: "medium", objections: "Wants to see more examples", aiInsight: "5 views in 2 days = very interested but hesitant. Call may close this." },
  { client: "Urban Eats Co.", service: "Social Media Management", amount: 2400, status: "sent", sentAt: "4 hrs ago", viewedAt: null, viewCount: 0, expiresIn: "14 days", followUp: "Reminder at day 3", discount: "10%", priority: "medium", objections: null, aiInsight: "Discount applied per manager approval. Track if discount drives faster conversion." },
];

export const DEMO_upsellSuggestions = [
  { client: "Apex Coaching Co.", suggestion: "Add Monthly Analytics Report (+$800/mo)", confidence: 78, reason: "They asked about reporting in discovery call", impact: "$9,600/yr" },
  { client: "Studio Bloom", suggestion: "Bundle Social Media Management (+$1,200/mo)", confidence: 65, reason: "Competitor analysis shows content gap", impact: "$14,400/yr" },
  { client: "Harmony Health", suggestion: "Add Email Newsletter Setup (+$500 one-time)", confidence: 82, reason: "They mentioned email list growth in intake form", impact: "$500" },
  { client: "Urban Eats Co.", suggestion: "Photography Package (+$600/mo)", confidence: 71, reason: "Food businesses see 3x engagement with pro photos", impact: "$7,200/yr" },
];

export const DEMO_pricingInsights = [
  { insight: "Your average quote value ($7,143) is 12% below market for your service category", type: "pricing", action: "Review pricing strategy" },
  { insight: "Quotes with case studies have 45% higher acceptance rate than those without", type: "content", action: "Add case studies" },
  { insight: "Quotes viewed 3+ times without response have 80% close rate with a personal call", type: "behavior", action: "Generate call list" },
  { insight: "5% discount converts 2.3x better than 10% — minimize margin erosion", type: "discounting", action: "Update discount rules" },
];

export const DEMO_LIFECYCLE_STAGES = [
  { label: "Subscriber", count: 234, color: "bg-blue-400" },
  { label: "Lead", count: 89, color: "bg-cyan-400" },
  { label: "Qualified", count: 34, color: "bg-green-400" },
  { label: "Opportunity", count: 18, color: "bg-yellow-400" },
  { label: "Customer", count: 67, color: "bg-purple-400" },
  { label: "Advocate", count: 12, color: "bg-pink-400" },
];

export const DEMO_CONTACTS = [
  { name: "Sarah Mitchell", company: "Apex Digital", stage: "Customer", health: 92, ltv: "$12,400", lastContact: "2 days ago", tags: ["enterprise", "upsell-ready"] },
  { name: "James Chen", company: "Nova Labs", stage: "Opportunity", health: 75, ltv: "$0", lastContact: "5 days ago", tags: ["mid-market", "demo-scheduled"] },
  { name: "Emily Rodriguez", company: "Bright Path Co", stage: "Qualified", health: 68, ltv: "$0", lastContact: "1 week ago", tags: ["coaching", "warm"] },
  { name: "Michael Park", company: "Summit Group", stage: "Customer", health: 45, ltv: "$8,200", lastContact: "3 weeks ago", tags: ["at-risk", "enterprise"] },
  { name: "Lisa Wang", company: "Craft Studios", stage: "Advocate", health: 98, ltv: "$18,600", lastContact: "1 day ago", tags: ["referral-source", "vip"] },
];

export const DEMO_REV_STATS_REPUTATION_ENGINE = [
  { label: "Average Rating", value: "4.8", icon: Star, trend: "+0.1", color: "text-amber-400" },
  { label: "Total Reviews", value: "186", icon: MessageCircle, trend: "+12 this month", color: "text-blue-400" },
  { label: "NPS Score", value: "72", icon: ThumbsUp, trend: "+4", color: "text-emerald-400" },
  { label: "Response Rate", value: "96%", icon: Clock, trend: "+2%", color: "text-purple-400" },
];

export const DEMO_REVIEWS = [
  { id: "r1", author: "Sarah K.", rating: 5, text: "Absolutely transformed our business strategy. The coaching sessions were invaluable and the follow-through was exceptional.", platform: "Google", date: "2 days ago", responded: true, sentiment: "positive", helpfulCount: 8 },
  { id: "r2", author: "James C.", rating: 5, text: "Best investment we've made this year. Clear, actionable, and premium. Would recommend to anyone.", platform: "Trustpilot", date: "5 days ago", responded: true, sentiment: "positive", helpfulCount: 12 },
  { id: "r3", author: "Michael R.", rating: 4, text: "Great results overall, scheduling could be smoother. The strategy framework was excellent.", platform: "Google", date: "1 week ago", responded: false, sentiment: "mixed", helpfulCount: 3 },
  { id: "r4", author: "Lisa W.", rating: 5, text: "The VIP Day was worth every penny. Highly recommend for anyone serious about growth.", platform: "Google", date: "2 weeks ago", responded: true, sentiment: "positive", helpfulCount: 15 },
  { id: "r5", author: "David P.", rating: 3, text: "Good content but felt rushed at times. Would have appreciated more follow-up.", platform: "Yelp", date: "3 weeks ago", responded: false, sentiment: "negative", helpfulCount: 1 },
  { id: "r6", author: "Amy T.", rating: 5, text: "Incredible experience from start to finish. The team really cares.", platform: "Google", date: "1 month ago", responded: true, sentiment: "positive", helpfulCount: 6 },
  { id: "r7", author: "Brian M.", rating: 4, text: "Solid program with measurable results. Pricing is fair for the value.", platform: "Trustpilot", date: "1 month ago", responded: true, sentiment: "positive", helpfulCount: 4 },
];

export const DEMO_RATING_DIST = [
  { stars: 5, count: 142, pct: 76 },
  { stars: 4, count: 28, pct: 15 },
  { stars: 3, count: 10, pct: 5 },
  { stars: 2, count: 4, pct: 2 },
  { stars: 1, count: 2, pct: 1 },
];

export const DEMO_REV_PLATFORMS = [
  { name: "Google Business", reviews: 98, rating: 4.9, linked: true, lastSync: "2h ago" },
  { name: "Trustpilot", reviews: 52, rating: 4.7, linked: true, lastSync: "4h ago" },
  { name: "Yelp", reviews: 24, rating: 4.4, linked: true, lastSync: "6h ago" },
  { name: "Facebook", reviews: 12, rating: 4.8, linked: false, lastSync: "—" },
];

export const DEMO_REV_CAMPAIGNS_REPUTATION_ENGINE = [
  { name: "Post-VIP Day Review Request", status: "active", sent: 34, responses: 28, convRate: "82%", lastSent: "1d ago" },
  { name: "Quarterly NPS Survey", status: "active", sent: 120, responses: 86, convRate: "72%", lastSent: "2w ago" },
  { name: "3-Month Anniversary", status: "paused", sent: 45, responses: 18, convRate: "40%", lastSent: "1m ago" },
];

export const DEMO_TESTIMONIALS = [
  { author: "Sarah K.", text: "Absolutely transformed our business strategy.", rating: 5, approved: true, featured: true, usedOn: ["landing-page", "funnel-1"] },
  { author: "Lisa W.", text: "The VIP Day was worth every penny.", rating: 5, approved: true, featured: true, usedOn: ["homepage"] },
  { author: "James C.", text: "Best investment we've made this year.", rating: 5, approved: true, featured: false, usedOn: [] },
  { author: "Brian M.", text: "Solid program with measurable results.", rating: 4, approved: false, featured: false, usedOn: [] },
];

export const DEMO_HEALTH_SEGMENTS = [
  { label: "Thriving", count: 38, pct: 57, color: "bg-green-400" },
  { label: "Stable", count: 16, pct: 24, color: "bg-blue-400" },
  { label: "Cooling", count: 8, pct: 12, color: "bg-yellow-400" },
  { label: "At Risk", count: 5, pct: 7, color: "bg-red-400" },
];

export const DEMO_AT_RISK = [
  { name: "Michael Park", company: "Summit Group", ltv: "$8,200", lastActive: "3 weeks ago", signals: ["No login 21d", "Support ticket unresolved", "Engagement ↓ 60%"] },
  { name: "Rachel Kim", company: "Bright Ideas", ltv: "$4,600", lastActive: "2 weeks ago", signals: ["Usage ↓ 40%", "Skipped last session", "No email opens 14d"] },
];

export const DEMO_WIN_BACK = [
  { name: "Tom Bradley", churned: "45 days ago", ltv: "$3,200", reason: "Pricing concern", strategy: "Offer 20% loyalty discount" },
  { name: "Ana Santos", churned: "30 days ago", ltv: "$5,800", reason: "Competitor switch", strategy: "Feature comparison + personal call" },
];

export const DEMO_pendingDecisions = [
  {
    title: "Launch 'Summer Accelerator' Campaign",
    type: "Campaign Launch",
    impact: "Est. 120 new leads, $18,000 revenue",
    risk: "Audience fatigue if timing overlaps with Spring campaign",
    affected: "3 funnels, 2 segments, 1,200 contacts",
    advisors: [
      { name: "Campaign Advisor", stance: "Approve — timing is good, but delay 5 days to avoid overlap", confidence: 78 },
      { name: "Funnel Advisor", stance: "Approve — landing pages are strong", confidence: 85 },
      { name: "Revenue Strategist", stance: "Approve with caution — watch fatigue signals", confidence: 72 },
    ],
    whatBreaks: ["Audience fatigue from recent Spring campaign", "Email deliverability if volume spikes", "Support capacity during launch week"],
  },
  {
    title: "Enable Auto-Booking for Free Consultations",
    type: "Booking Policy",
    impact: "Est. +40% booking rate, capacity utilization from 60% to 85%",
    risk: "No-show rate may increase without qualification step",
    affected: "All booking pages, 3 funnels, calendar",
    advisors: [
      { name: "Booking Advisor", stance: "Approve — add SMS reminder to offset no-shows", confidence: 82 },
      { name: "CRM Advisor", stance: "Approve — but add pre-call form for qualification", confidence: 76 },
    ],
    whatBreaks: ["No-show rate increase", "Calendar overwhelm without capacity limits", "Unqualified leads consuming time"],
  },
];

export const DEMO_REV_METRICS = [
  { label: "Monthly Revenue", value: "$47,280", change: "+12.4%", trend: "up" },
  { label: "Active Pipeline", value: "$183,500", change: "+8.2%", trend: "up" },
  { label: "Conversion Rate", value: "24.8%", change: "+3.1%", trend: "up" },
  { label: "Customer LTV", value: "$2,840", change: "-1.2%", trend: "down" },
];

export const DEMO_WHAT_CHANGED = [
  { text: "3 leads moved to qualified stage", time: "2h ago", type: "positive" },
  { text: "Funnel 'Launch Pro' conversion dropped 4%", time: "5h ago", type: "warning" },
  { text: "New review: 5★ from Sarah K.", time: "8h ago", type: "positive" },
  { text: "Invoice #1042 overdue by 7 days", time: "1d ago", type: "alert" },
];

export const DEMO_QUICK_ACTIONS = [
  { label: "Growth Boardroom", path: "/revenue-office/boardroom", icon: BarChart3 },
  { label: "Pipeline", path: "/revenue-office/pipeline", icon: Target },
  { label: "Campaigns", path: "/revenue-office/campaigns", icon: Zap },
  { label: "Relationships", path: "/revenue-office/relationships", icon: Users },
];

export const DEMO_ADVISOR_PREVIEW = [
  { name: "Growth Advisor", stance: "Expand top-of-funnel — acquisition cost is low right now", confidence: 0.82 },
  { name: "Retention Advisor", stance: "Watch cohort 3 — engagement dropping", confidence: 0.74 },
  { name: "Pricing Advisor", stance: "Current pricing has room for 8-12% increase", confidence: 0.68 },
];

export const DEMO_COHORT_DATA = [
  { cohort: "Jan 2026", acquired: 24, retained30: 20, retained60: 17, retained90: 14, ltv: "$1,820" },
  { cohort: "Feb 2026", acquired: 31, retained30: 27, retained60: 22, retained90: 19, ltv: "$2,140" },
  { cohort: "Mar 2026", acquired: 28, retained30: 25, retained60: 21, retained90: null, ltv: "$1,680" },
];

export const DEMO_REVENUE_STREAMS = [
  { source: "Courses & Digital", revenue: "$42,174", pct: 45, trend: "+12%" },
  { source: "Services & Coaching", revenue: "$25,000", pct: 27, trend: "+8%" },
  { source: "Memberships", revenue: "$12,149", pct: 13, trend: "+22%" },
  { source: "Consulting Retainers", revenue: "$9,000", pct: 10, trend: "+5%" },
  { source: "Affiliate / Partner", revenue: "$4,700", pct: 5, trend: "+3%" },
];

export const DEMO_LEAKAGE = [
  { type: "Stale Leads", value: "$34,200", action: "Re-engage sequence needed" },
  { type: "Abandoned Carts", value: "$6,400", action: "Recovery email not sent" },
  { type: "Expired Quotes", value: "$12,000", action: "Follow-up overdue" },
  { type: "Churn Risk", value: "$18,500", action: "2 high-value clients disengaging" },
];

export const DEMO_REV_SEGMENTS_SEGMENTATION_ENGINE = [
  { id: "s1", name: "High-Value Clients", type: "dynamic", contacts: 34, revenue: "$284,000", criteria: ["LTV > $5,000", "Active in last 30d"], color: "border-l-emerald-400", growth: "+3 this month" },
  { id: "s2", name: "Warm Leads (Engaged)", type: "dynamic", contacts: 67, revenue: "$0", criteria: ["Opened 3+ emails", "Visited pricing page", "Not yet converted"], color: "border-l-blue-400", growth: "+8 this week" },
  { id: "s3", name: "At-Risk Clients", type: "dynamic", contacts: 12, revenue: "$48,000", criteria: ["No activity 60+ days", "Previously active", "LTV > $1,000"], color: "border-l-red-400", growth: "+2 this month" },
  { id: "s4", name: "VIP Candidates", type: "smart", contacts: 18, revenue: "$126,000", criteria: ["LTV > $3,000", "NPS 9-10", "Referred others"], color: "border-l-amber-400", growth: "Stable" },
  { id: "s5", name: "Email Unengaged", type: "dynamic", contacts: 89, revenue: "$0", criteria: ["No email open in 90d", "Still subscribed"], color: "border-l-muted", growth: "+12 this month" },
  { id: "s6", name: "Coaching Clients", type: "static", contacts: 24, revenue: "$72,000", criteria: ["Product: Coaching Program", "Active subscription"], color: "border-l-purple-400", growth: "+1 this month" },
  { id: "s7", name: "Webinar Attendees (No Purchase)", type: "dynamic", contacts: 156, revenue: "$0", criteria: ["Attended webinar", "No purchase within 14d"], color: "border-l-cyan-400", growth: "+28 this week" },
  { id: "s8", name: "Repeat Buyers", type: "smart", contacts: 42, revenue: "$210,000", criteria: ["2+ purchases", "Active"], color: "border-l-green-400", growth: "+5 this month" },
];

export const DEMO_SCORING_RULES = [
  { signal: "Visited pricing page", points: 15, category: "Engagement" },
  { signal: "Opened 3+ emails in 7 days", points: 10, category: "Email" },
  { signal: "Booked a call", points: 25, category: "Intent" },
  { signal: "Submitted a form", points: 20, category: "Conversion" },
  { signal: "Replied to email", points: 15, category: "Engagement" },
  { signal: "Watched webinar replay (>50%)", points: 12, category: "Content" },
  { signal: "Downloaded resource", points: 8, category: "Content" },
  { signal: "Referred a friend", points: 30, category: "Advocacy" },
  { signal: "No activity 30+ days", points: -20, category: "Decay" },
  { signal: "Unsubscribed from list", points: -15, category: "Decay" },
];

export const DEMO_TOP_LEADS = [
  { name: "Rachel Green", score: 87, company: "GreenCo", signals: ["Pricing page 5x", "Form submitted", "Email reply"], stage: "Qualified" },
  { name: "Tom Hayes", score: 78, company: "Hayes Group", signals: ["VIP inquiry", "Booked call"], stage: "Proposal" },
  { name: "Mia Zhang", score: 72, company: "Studio Co", signals: ["Webinar attended", "3 emails opened"], stage: "Warm" },
  { name: "Alex Rivera", score: 65, company: "Rivera IO", signals: ["Resource download", "Pricing page 2x"], stage: "Warm" },
  { name: "Jordan Lee", score: 54, company: "Lee & Partners", signals: ["Email opens", "Blog visits"], stage: "Cold" },
];

export const DEMO_CLIENTS = [
  { client: "Bloom Studio", score: 92, trend: "up" as const, lastContact: "2d ago", signals: { resp: 95, pay: 100, engage: 88, sat: 85 }, risks: [] as string[], opps: ["Referral candidate", "Case study"] },
  { client: "Carter Legal", score: 78, trend: "stable" as const, lastContact: "5d ago", signals: { resp: 80, pay: 90, engage: 65, sat: 75 }, risks: ["Engagement declining"], opps: ["Upsell premium"] },
  { client: "Nova Digital", score: 65, trend: "down" as const, lastContact: "12d ago", signals: { resp: 55, pay: 85, engage: 50, sat: 70 }, risks: ["Contact gap growing"], opps: ["Re-engagement"] },
  { client: "Skyline Props", score: 88, trend: "up" as const, lastContact: "1d ago", signals: { resp: 90, pay: 95, engage: 82, sat: 85 }, risks: [] as string[], opps: ["Cross-sell booking"] },
  { client: "Meridian Health", score: 42, trend: "down" as const, lastContact: "28d ago", signals: { resp: 30, pay: 60, engage: 25, sat: 50 }, risks: ["Churn risk", "Payment delays", "No contact"], opps: ["Win-back needed"] },
  { client: "Atlas Ventures", score: 71, trend: "stable" as const, lastContact: "8d ago", signals: { resp: 70, pay: 80, engage: 60, sat: 72 }, risks: ["Engagement plateaued"], opps: ["Strategy review"] },
];

export const DEMO_REV_ALERTS = [
  { client: "Meridian Health", msg: "No contact in 28 days — churn probability 68%", severity: "critical" as const, action: "Schedule check-in call" },
  { client: "Nova Digital", msg: "Invoice #847 is 5 days overdue", severity: "warning" as const, action: "Send gentle reminder" },
  { client: "Carter Legal", msg: "Meeting frequency dropped 40% vs last quarter", severity: "warning" as const, action: "Propose quarterly review" },
  { client: "Bloom Studio", msg: "Left 5-star Google review — strong promoter", severity: "positive" as const, action: "Request referral" },
];

export const DEMO_riskAreas = [
  {
    area: "Funnel Conversion",
    risks: [
      { risk: "Landing page load time >3s on mobile (currently 4.2s)", severity: "high", likelihood: 78 },
      { risk: "Checkout form asks for too many fields (8 vs best practice 4)", severity: "medium", likelihood: 65 },
      { risk: "No social proof on main funnel page", severity: "medium", likelihood: 72 },
    ],
    icon: Target, color: "text-blue-400"
  },
  {
    area: "Follow-up & Nurture",
    risks: [
      { risk: "45% of leads receive no follow-up within 24hrs", severity: "high", likelihood: 88 },
      { risk: "Email nurture sequence has no personalization beyond first name", severity: "medium", likelihood: 60 },
      { risk: "No SMS follow-up configured for high-intent leads", severity: "medium", likelihood: 55 },
    ],
    icon: MessageCircle, color: "text-emerald-400"
  },
  {
    area: "Booking & Delivery",
    risks: [
      { risk: "No-show rate at 18% — no automated reminder 1hr before", severity: "high", likelihood: 82 },
      { risk: "Post-call follow-up delayed >48hrs for 30% of calls", severity: "medium", likelihood: 70 },
    ],
    icon: Clock, color: "text-amber-400"
  },
  {
    area: "Retention & Churn",
    risks: [
      { risk: "No reactivation sequence for clients inactive >60 days", severity: "high", likelihood: 90 },
      { risk: "Membership renewal reminder sent too late (day-of vs 7 days before)", severity: "medium", likelihood: 75 },
    ],
    icon: Users, color: "text-purple-400"
  },
];

export const DEMO_PARTNERS = [
  { name: "Peak Digital Agency", type: "Reseller", status: "active", clients: 12, revenue: 18400, margin: 35, health: 88 },
  { name: "Northstar Consulting", type: "White-Label", status: "active", clients: 8, revenue: 24600, margin: 42, health: 92 },
  { name: "Cascade Marketing", type: "Referral", status: "active", clients: 5, revenue: 7200, margin: 25, health: 75 },
  { name: "Summit Solutions", type: "White-Label", status: "onboarding", clients: 0, revenue: 0, margin: 40, health: 60 },
  { name: "Vertex Group", type: "Reseller", status: "paused", clients: 3, revenue: 4100, margin: 30, health: 45 },
];

export const DEMO_BRANDS = [
  { name: "Peak Digital Theme", partner: "Peak Digital Agency", colors: ["#2563EB","#1E293B","#F8FAFC"], domain: "portal.peakdigital.com", status: "live" },
  { name: "Northstar Custom", partner: "Northstar Consulting", colors: ["#059669","#0F172A","#ECFDF5"], domain: "app.northstarconsult.com", status: "live" },
  { name: "Summit Draft", partner: "Summit Solutions", colors: ["#D946EF","#1A1A2E","#FDF4FF"], domain: "pending", status: "draft" },
];

export const DEMO_SPLITS = [
  { partner: "Northstar Consulting", gross: 24600, theirs: 14760, yours: 9840, split: "60/40", pending: 2400 },
  { partner: "Peak Digital Agency", gross: 18400, theirs: 11960, yours: 6440, split: "65/35", pending: 1200 },
  { partner: "Cascade Marketing", gross: 7200, theirs: 5400, yours: 1800, split: "75/25", pending: 0 },
  { partner: "Vertex Group", gross: 4100, theirs: 2870, yours: 1230, split: "70/30", pending: 800 },
];

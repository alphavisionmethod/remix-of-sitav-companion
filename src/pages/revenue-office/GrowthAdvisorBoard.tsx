import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Target, Shield, DollarSign, Users, MessageSquare, Zap, AlertTriangle, CheckCircle, Clock, GitCompare, Eye, ArrowRight, HelpCircle, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRevenueOfficeMode } from "@/contexts/RevenueOfficeModeContext";
import { RevenueOfficeModeToggle } from "@/components/revenue-office/RevenueOfficeModeToggle";
import { DEMO_ADVISORS, DEMO_ADVISOR_DEBATES, DEMO_ADVISOR_WHAT_CHANGED, DEMO_ADVISOR_INVALIDATION, DEMO_ALIGNMENT_CLUSTERS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
type AdvisorQueryType = "disagree" | "missing" | "break";

interface AdvisorQueryResponse {
  advisorName: string;
  queryType: AdvisorQueryType;
  response: string;
  evidence: string[];
  confidence: number;
}

const ADVISOR_QUERY_LABELS: Record<AdvisorQueryType, { label: string; icon: typeof HelpCircle; color: string }> = {
  disagree: { label: "Why do you disagree?", icon: AlertTriangle, color: "text-amber-400" },
  missing: { label: "What are we missing?", icon: Eye, color: "text-blue-400" },
  break: { label: "What would break this?", icon: Shield, color: "text-red-400" },
};

// Pre-computed advisor responses keyed by advisor name and query type
const ADVISOR_RESPONSES: Record<string, Record<AdvisorQueryType, AdvisorQueryResponse>> = {
  "Revenue Strategist": {
    disagree: { advisorName: "Revenue Strategist", queryType: "disagree", response: "The consensus to increase acquisition spend by 15% is premature. Our LTV:CAC ratio has compressed from 4.2x to 3.6x over the last quarter. Scaling spend without fixing the retention leak will accelerate cash consumption without proportional revenue growth. I'd stabilize unit economics first.", evidence: ["LTV:CAC compressed 14% in 90 days", "Churn rate up 1.8pp this quarter", "CAC rising on primary channels"], confidence: 0.82 },
    missing: { advisorName: "Revenue Strategist", queryType: "missing", response: "We're missing expansion revenue data from existing accounts. Upsell and cross-sell revenue isn't tracked separately, so our growth attribution is incomplete. Also missing: competitive win/loss analysis — we don't know why we're losing deals to specific competitors.", evidence: ["No upsell revenue segmentation", "No competitive win/loss tracking", "Missing pricing sensitivity data"], confidence: 0.88 },
    break: { advisorName: "Revenue Strategist", queryType: "break", response: "Three things would break the current growth trajectory: (1) Losing either of the 2 enterprise anchor clients — they represent 31% of MRR. (2) A significant increase in CAC if paid channels saturate. (3) A competitor launching aggressive pricing that forces us into a race to the bottom.", evidence: ["Top 2 clients = 31% MRR concentration", "Paid channel efficiency declining", "3 competitors raised recent funding rounds"], confidence: 0.79 },
  },
  "Pipeline Analyst": {
    disagree: { advisorName: "Pipeline Analyst", queryType: "disagree", response: "I disagree with the 'strong pipeline' assessment. While the total value is high, 68% of it is concentrated in 3 deals that have been stalled for 30+ days. Velocity is the real issue — our average sales cycle has increased from 18 to 27 days, and conversion from proposal to close has dropped to 42%.", evidence: ["68% pipeline concentrated in 3 deals", "Sales cycle up 50% (18→27 days)", "Proposal-to-close conversion dropped to 42%"], confidence: 0.85 },
    missing: { advisorName: "Pipeline Analyst", queryType: "missing", response: "We're missing pipeline velocity metrics by source. Referral deals close 3x faster than cold outreach, but we're not optimizing for that. Also missing: deal engagement scoring — we don't track when prospects stop responding, so dead deals linger and inflate pipeline value.", evidence: ["No velocity-by-source tracking", "No engagement scoring on deals", "12 deals with zero activity >14 days"], confidence: 0.91 },
    break: { advisorName: "Pipeline Analyst", queryType: "break", response: "If the 3 stalled enterprise deals ($47K combined) fall through, pipeline drops below critical threshold. The team would need to generate 2.5x more leads to recover, which at current conversion rates would take 6-8 weeks. Second risk: if the sales hire doesn't ramp within 45 days, capacity becomes the bottleneck.", evidence: ["$47K in stalled deals at risk", "Recovery time: 6-8 weeks", "New hire ramp target: 45 days"], confidence: 0.83 },
  },
  "Retention Guardian": {
    disagree: { advisorName: "Retention Guardian", queryType: "disagree", response: "The board is underweighting the churn signal. We have 2 high-value clients showing classic pre-churn behavior: reduced login frequency, support ticket escalation, and delayed payments. The focus on acquisition is misguided when protecting existing revenue has 5-7x better ROI than acquiring new.", evidence: ["2 clients showing pre-churn signals", "Retention ROI 5-7x vs acquisition", "NPS dropped 8 points for affected accounts"], confidence: 0.89 },
    missing: { advisorName: "Retention Guardian", queryType: "missing", response: "We're missing a client health score composite. We track individual signals (login, NPS, support) but don't aggregate them into a predictive health score. We're also missing proactive outreach tracking — when did we last have a non-transactional conversation with each client?", evidence: ["No composite health scoring", "No proactive outreach tracking", "Last QBR data missing for 40% of clients"], confidence: 0.87 },
    break: { advisorName: "Retention Guardian", queryType: "break", response: "Losing the 2 at-risk clients would immediately wipe out the equivalent of 4 months of new acquisition effort. Combined with natural churn, we'd see a net revenue decline for the first time. The cascading effect: team morale drops, referral pipeline dries up (these clients are active referrers), and our case study pipeline weakens.", evidence: ["2 clients = 4 months acquisition equivalent", "Both are active referral sources", "Case study pipeline depends on their success"], confidence: 0.92 },
  },
  "Acquisition Advisor": {
    disagree: { advisorName: "Acquisition Advisor", queryType: "disagree", response: "The Retention Guardian's caution is valid but overstated. We can't stop growing to fix churn — it's a false dichotomy. The right move is to increase acquisition on our highest-quality channels (referrals, content inbound) while simultaneously addressing the retention gaps. Both need to happen in parallel.", evidence: ["Content inbound converts at 2.3x rate", "Referral pipeline has 18% higher LTV", "Channel mix optimization available"], confidence: 0.78 },
    missing: { advisorName: "Acquisition Advisor", queryType: "missing", response: "We're missing attribution on the full funnel. We know top-of-funnel sources but lose visibility after first touch. Multi-touch attribution would show that content + email nurture is actually driving 40% of conversions, not direct referral alone. Also missing: ICP scoring on incoming leads.", evidence: ["No multi-touch attribution", "Content contribution likely underreported", "No ICP scoring on leads"], confidence: 0.84 },
    break: { advisorName: "Acquisition Advisor", queryType: "break", response: "Three acquisition risks: (1) Google algorithm change could cut organic traffic 30-50%. (2) Our top referral partner is being acquired — relationship may not survive. (3) If we don't build a second acquisition engine beyond referrals, we're one channel failure away from growth stall.", evidence: ["70% of organic traffic from 5 pages", "Key referral partner in M&A process", "Single-channel dependency risk"], confidence: 0.81 },
  },
  "Pricing Advisor": {
    disagree: { advisorName: "Pricing Advisor", queryType: "disagree", response: "The suggestion to test a price increase on new customers only is too conservative. Our pricing hasn't changed in 14 months despite adding significant features. Existing customers are getting more value without paying for it. A value-aligned price adjustment across the board (with proper communication) would yield $18K+ ARR increase with minimal churn.", evidence: ["14 months since last price change", "Feature additions worth 30%+ more value", "Competitor pricing 15-25% higher for similar scope"], confidence: 0.76 },
    missing: { advisorName: "Pricing Advisor", queryType: "missing", response: "We're missing willingness-to-pay research. We don't know where the price ceiling is for each segment. We're also missing packaging analysis — some clients use 80% of features, others use 20%, but they pay the same. Usage-based or tiered pricing could unlock revenue.", evidence: ["No willingness-to-pay data collected", "Usage varies 4x between clients", "No pricing A/B tests run this year"], confidence: 0.83 },
    break: { advisorName: "Pricing Advisor", queryType: "break", response: "If a competitor launches aggressive pricing (30%+ discount), our value proposition becomes harder to defend without better ROI documentation. Also: if the 2 at-risk clients cite pricing as a churn reason, it signals a broader value perception problem that would make any future price increase much harder.", evidence: ["3 funded competitors could undercut", "No ROI calculator for clients", "Pricing objection rate rising in pipeline"], confidence: 0.74 },
  },
  "Engagement Coach": {
    disagree: { advisorName: "Engagement Coach", queryType: "disagree", response: "The email fatigue signals are being dismissed too quickly. We're seeing declining open rates across 3 of 5 sequences, and 2 contacts have explicitly requested fewer communications. The 'scale acquisition spend' recommendation will make this worse — more leads means more emails means more fatigue. We need to fix engagement quality before scaling quantity.", evidence: ["Open rates declining in 3/5 sequences", "2 explicit opt-down requests this week", "Unsubscribe rate up 0.4pp"], confidence: 0.86 },
    missing: { advisorName: "Engagement Coach", queryType: "missing", response: "We're missing engagement velocity tracking. We know who opens emails but not who's accelerating or decelerating their engagement. A contact who went from opening every email to opening 1 in 5 is a bigger risk signal than someone who consistently opens 40%. We also need channel preference detection — some contacts want SMS, not email.", evidence: ["No engagement trend tracking", "No channel preference detection", "No engagement-to-revenue correlation data"], confidence: 0.88 },
    break: { advisorName: "Engagement Coach", queryType: "break", response: "If we hit the spam threshold on our primary sending domain, deliverability could drop 40-60% overnight and take 30-90 days to recover. We're currently at 11.2% complaint rate — the danger zone is 15%. One bad bulk campaign could push us over. Second risk: if email deliverability fails, we have no backup channel for nurture.", evidence: ["Complaint rate at 11.2% (threshold: 15%)", "No backup nurture channel", "Domain recovery time: 30-90 days"], confidence: 0.91 },
  },
  "Reputation Analyst": {
    disagree: { advisorName: "Reputation Analyst", queryType: "disagree", response: "The board isn't weighting reputation enough in growth projections. Our 4.7-star rating drives 34% of referral conversions. If the 2 dissatisfied at-risk clients leave negative reviews, it could drop to 4.4, reducing referral conversion by an estimated 18%. Reputation protection should be the #1 priority, not acquisition scaling.", evidence: ["4.7 rating drives 34% of referral conversions", "Each 0.1-star drop = ~6% conversion decrease", "2 at-risk clients could leave negative reviews"], confidence: 0.84 },
    missing: { advisorName: "Reputation Analyst", queryType: "missing", response: "We're missing sentiment analysis on recent client interactions. Reviews are lagging indicators. We need real-time sentiment tracking across calls, support tickets, and messages to catch reputation risks before they become public. Also missing: competitor review monitoring — we don't know how our rating compares in real-time.", evidence: ["No real-time sentiment tracking", "Review monitoring is manual and monthly", "No competitor review benchmarking"], confidence: 0.82 },
    break: { advisorName: "Reputation Analyst", queryType: "break", response: "A single viral negative review from a high-profile client could undo months of reputation building. Our review response process is reactive and slow (avg 72hrs). If we get 3+ negative reviews in a 30-day window, the algorithm suppresses our positive reviews. We need a 4-hour response SLA and proactive outreach to at-risk clients.", evidence: ["Current review response time: 72hrs avg", "3+ negative reviews trigger algorithm suppression", "No proactive reputation outreach program"], confidence: 0.87 },
  },
  "Automation Strategist": {
    disagree: { advisorName: "Automation Strategist", queryType: "disagree", response: "The 'automate everything' approach is premature. 4 of our current automations have success rates below 70%, and 2 are actively causing client friction through over-messaging. We should fix existing automations before adding new ones. Quality of automation matters more than quantity — one bad automated touchpoint can destroy trust faster than 10 good ones build it.", evidence: ["4 automations below 70% success rate", "2 automations flagged for over-messaging", "Client friction reports up 23%"], confidence: 0.88 },
    missing: { advisorName: "Automation Strategist", queryType: "missing", response: "We're missing automation-to-revenue attribution. We know what automations fire, but not which ones actually drive conversions vs. just create activity. We need to map each automation to downstream revenue events. Also missing: an automation dependency graph — if one fails, which others cascade?", evidence: ["No automation-to-revenue mapping", "No cascade/dependency tracking", "ROI unknown for 60% of automations"], confidence: 0.85 },
    break: { advisorName: "Automation Strategist", queryType: "break", response: "If a critical automation fails during a high-volume period (e.g., product launch, seasonal push), and we have no manual fallback, we could lose 30-50 leads in the gap. Our biggest risk: the quote follow-up automation sends wrong pricing because it pulls from cached data. One pricing error to a VIP client could cost us the relationship.", evidence: ["No manual fallback procedures documented", "Quote automation uses cached pricing data", "System relies on single email sending provider"], confidence: 0.86 },
  },
  "Growth Synthesizer": {
    disagree: { advisorName: "Growth Synthesizer", queryType: "disagree", response: "My synthesis accounts for all advisor positions, but I want to flag that the board is split 5-4 on the acquisition vs. retention priority. The minority position (retention-first) has higher average confidence (86% vs. 79%). When the minority has stronger conviction, it often signals the majority is anchored on optimism bias. I recommend weighting retention actions higher than the consensus suggests.", evidence: ["Board split: 5-4 on priority", "Retention camp avg confidence: 86%", "Acquisition camp avg confidence: 79%"], confidence: 0.90 },
    missing: { advisorName: "Growth Synthesizer", queryType: "missing", response: "The biggest gap across all advisors: we have no unified 'business health score' that combines revenue, pipeline, retention, reputation, engagement, and automation health into a single metric. Without it, each advisor optimizes their domain independently, potentially at the expense of the whole. We also lack scenario modeling — 'What if churn doubles?' 'What if acquisition costs rise 20%?'", evidence: ["No unified business health metric", "No scenario modeling capability", "Advisor recommendations sometimes conflict"], confidence: 0.93 },
    break: { advisorName: "Growth Synthesizer", queryType: "break", response: "The single biggest existential risk: our 2 largest clients churning simultaneously while the enterprise pipeline stalls. This would create a 'triple threat' — revenue loss, referral pipeline collapse, and team morale crater. The probability is low (~8%) but the impact is catastrophic. The mitigation is simple: proactive executive outreach to both clients this week, with a retention offer ready.", evidence: ["Combined scenario probability: ~8%", "Impact: 37% revenue decline if all three hit", "Mitigation: immediate executive outreach"], confidence: 0.94 },
  },
};

export default function GrowthAdvisorBoard() {
  const { isBeginner } = useRevenueOfficeMode();
  const [tab, setTab] = useState("council");
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [activeQueries, setActiveQueries] = useState<Record<string, AdvisorQueryType | null>>({});
  const [loadingQueries, setLoadingQueries] = useState<Record<string, boolean>>({});

  const advisors = DEMO_ADVISORS;
  const debates = DEMO_ADVISOR_DEBATES;
  const whatChanged = DEMO_ADVISOR_WHAT_CHANGED;
  const invalidation = DEMO_ADVISOR_INVALIDATION;
  const clusters = DEMO_ALIGNMENT_CLUSTERS;

  const boardConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / advisors.length * 100);
  const alertCount = advisors.filter(a => a.type === "alert").length;
  const debateCount = debates.reduce((s, d) => s + d.disagreements.length, 0);

  const handleAdvisorQuery = useCallback((advisorName: string, queryType: AdvisorQueryType) => {
    // If same query is already showing, close it
    if (activeQueries[advisorName] === queryType) {
      setActiveQueries(prev => ({ ...prev, [advisorName]: null }));
      return;
    }
    // Simulate loading
    setLoadingQueries(prev => ({ ...prev, [advisorName]: true }));
    setActiveQueries(prev => ({ ...prev, [advisorName]: queryType }));
    setTimeout(() => {
      setLoadingQueries(prev => ({ ...prev, [advisorName]: false }));
    }, 800);
  }, [activeQueries]);

  const getAdvisorResponse = useCallback((advisorName: string): AdvisorQueryResponse | null => {
    const queryType = activeQueries[advisorName];
    if (!queryType) return null;
    return ADVISOR_RESPONSES[advisorName]?.[queryType] || null;
  }, [activeQueries]);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Growth Advisor Board
          </h1>
          <p className="text-sm text-muted-foreground">{isBeginner ? "Your team of AI advisors helping grow your business" : "9-advisor council with debate engine, alignment mapping, interactive queries, and structured intelligence"}</p>
        </div>
        <RevenueOfficeModeToggle />
      </motion.div>

      {/* Board Stats */}
      <div className={`grid ${isBeginner ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"} gap-4`}>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{advisors.length}</p><p className="text-xs text-muted-foreground">{isBeginner ? "Advisors" : "Active Advisors"}</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{boardConfidence}%</p><p className="text-xs text-muted-foreground">{isBeginner ? "Agreement Level" : "Board Confidence"}</p>
        </CardContent></Card>
        {!isBeginner && (
          <>
            <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{debateCount}</p><p className="text-xs text-muted-foreground">Active Debates</p>
            </CardContent></Card>
            <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{alertCount}</p><p className="text-xs text-muted-foreground">Alerts</p>
            </CardContent></Card>
          </>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="council" className="text-[10px] h-7 px-2.5 gap-1"><Users className="h-3 w-3" />{isBeginner ? "Advisors" : "Council"}</TabsTrigger>
          {!isBeginner && <TabsTrigger value="debates" className="text-[10px] h-7 px-2.5 gap-1"><GitCompare className="h-3 w-3" />Debates</TabsTrigger>}
          {!isBeginner && <TabsTrigger value="alignment" className="text-[10px] h-7 px-2.5 gap-1"><Target className="h-3 w-3" />Alignment</TabsTrigger>}
          {!isBeginner && <TabsTrigger value="changes" className="text-[10px] h-7 px-2.5 gap-1"><Clock className="h-3 w-3" />What Changed</TabsTrigger>}
          <TabsTrigger value="synthesis" className="text-[10px] h-7 px-2.5 gap-1"><Sparkles className="h-3 w-3" />{isBeginner ? "Summary" : "Synthesis"}</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Council Tab */}
          <TabsContent value="council">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {advisors.map((a, i) => {
                const queryResponse = getAdvisorResponse(a.name);
                const isLoading = loadingQueries[a.name];
                const activeQuery = activeQueries[a.name];

                return (
                <motion.div key={a.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`border-border/50 transition-all ${a.type === "alert" ? "bg-red-500/5 border-red-500/20" : a.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-card/50"} ${expandedAdvisor === a.name ? "ring-1 ring-primary/30" : ""}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedAdvisor(expandedAdvisor === a.name ? null : a.name)}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><a.icon className="w-4 h-4 text-primary" /></div>
                          <div>
                            <p className="font-medium text-foreground">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.domain}</p>
                          </div>
                        </div>
                        {!isBeginner && (
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence</span>
                              <span className="text-sm font-bold text-foreground">{Math.round(a.confidence * 100)}%</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Uncertainty: {Math.round((1 - a.confidence) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{a.stance}</p>
                      <div className="flex gap-1 flex-wrap">
                        {a.watching.map(w => <Badge key={w} variant="outline" className="text-xs">{w}</Badge>)}
                      </div>
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-xs text-primary font-medium">→ {a.recommendation}</p>
                      </div>
                      {!isBeginner && <Progress value={a.confidence * 100} className="h-1" />}

                      {/* Interactive Advisor Query Buttons */}
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Ask this advisor</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {(Object.entries(ADVISOR_QUERY_LABELS) as [AdvisorQueryType, typeof ADVISOR_QUERY_LABELS["disagree"]][]).map(([type, config]) => (
                            <button
                              key={type}
                              onClick={(e) => { e.stopPropagation(); handleAdvisorQuery(a.name, type); }}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-medium flex items-center gap-1.5 transition-all ${
                                activeQuery === type
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "bg-background/50 border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                              }`}
                            >
                              <config.icon className={`h-3 w-3 ${activeQuery === type ? "text-primary" : config.color}`} />
                              {config.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Advisor Query Response */}
                      <AnimatePresence>
                        {activeQuery && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {isLoading ? (
                              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                <span className="text-xs text-muted-foreground">Advisor is formulating response...</span>
                              </div>
                            ) : queryResponse ? (
                              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-primary/10 text-primary text-[9px] border-primary/20">
                                      {ADVISOR_QUERY_LABELS[queryResponse.queryType].label}
                                    </Badge>
                                    {!isBeginner && (
                                      <span className="text-[10px] text-muted-foreground">
                                        Confidence: <span className="text-foreground font-medium">{Math.round(queryResponse.confidence * 100)}%</span>
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setActiveQueries(prev => ({ ...prev, [a.name]: null })); }}
                                    className="p-1 rounded hover:bg-muted/20 text-muted-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{queryResponse.response}</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Supporting Evidence</p>
                                  {queryResponse.evidence.map((e, ei) => (
                                    <div key={ei} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                      <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                      <span>{e}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expanded Detail */}
                      {expandedAdvisor === a.name && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3 border-t border-border/30 space-y-2">
                          {invalidation.filter(inv => inv.advisor === a.name).map((inv, j) => (
                            <div key={j} className="p-2 rounded bg-muted/10 border border-border/20">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">What would change my mind</p>
                              <p className="text-xs text-foreground">{inv.condition}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Impact: {inv.impact}</p>
                            </div>
                          ))}
                          {whatChanged.filter(wc => wc.advisor === a.name).map((wc, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <Clock className="w-3 h-3 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-foreground">{wc.change}</p>
                                <p className="text-muted-foreground">{wc.reason} · {wc.when}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )})}
            </div>
          </TabsContent>

          {/* Debates Tab */}
          <TabsContent value="debates">
            <div className="space-y-4">
              {debates.map((debate, di) => (
                <Card key={di} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-amber-400" /> {debate.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {debate.disagreements.map((d, j) => (
                      <div key={j} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{d.advisorA}</Badge>
                              <span className="text-xs text-muted-foreground">{Math.round(d.confidenceA * 100)}%</span>
                            </div>
                            <p className="text-sm text-foreground">{d.stanceA}</p>
                          </div>
                          <div className="space-y-1 md:border-l md:border-border/30 md:pl-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{d.advisorB}</Badge>
                              <span className="text-xs text-muted-foreground">{Math.round(d.confidenceB * 100)}%</span>
                            </div>
                            <p className="text-sm text-foreground">{d.stanceB}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={d.severity === "strong" ? "destructive" : "secondary"} className="text-[9px]">{d.severity}</Badge>
                          <span className="text-[10px] text-muted-foreground">Confidence gap: {Math.round(Math.abs(d.confidenceA - d.confidenceB) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">Board Synthesis</p>
                      <p className="text-sm text-foreground">{debate.synthesis}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alignment Tab */}
          <TabsContent value="alignment">
            <div className="space-y-4">
              {clusters.map((cluster, ci) => (
                <Card key={ci} className={`border-border/50 ${cluster.direction === "bullish" ? "bg-emerald-500/5" : cluster.direction === "bearish" ? "bg-red-500/5" : "bg-card/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cluster.direction === "bullish" ? "bg-emerald-400" : cluster.direction === "bearish" ? "bg-red-400" : "bg-amber-400"}`} />
                        <p className="font-medium text-foreground">{cluster.theme}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{cluster.direction}</Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {cluster.advisors.map(name => <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Avg Confidence:</span>
                      <Progress value={cluster.avgConfidence * 100} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium text-foreground">{Math.round(cluster.avgConfidence * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* What Changed Tab */}
          <TabsContent value="changes">
            <div className="space-y-3">
              {whatChanged.map((wc, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">{wc.advisor}</Badge>
                          <span className="text-[10px] text-muted-foreground">{wc.when}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{wc.change}</p>
                        <p className="text-xs text-muted-foreground">{wc.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Synthesis Tab */}
          <TabsContent value="synthesis">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">Chief Revenue Advisor — Board Synthesis</span>
                </div>
                <p className="text-foreground">The board sees strong fundamentals with opportunity to scale. Key risk is Enterprise pipeline slowdown and 2 at-risk high-value clients. Consensus: invest in acquisition while protecting retention. Pricing increase is viable but should be tested carefully on new customers only.</p>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary/20">
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Top Priorities</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Outreach to 2 at-risk clients</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Re-qualify 12 stale pipeline deals</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Scale acquisition spend 15%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Key Watchpoints</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Enterprise deal velocity</li>
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Email fatigue signals</li>
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Price sensitivity on increase test</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary/20">
                  <p className="text-xs font-medium text-primary mb-2">What Would Change This Synthesis</p>
                  {invalidation.slice(0, 3).map((inv, i) => (
                    <p key={i} className="text-xs text-muted-foreground mb-1">• <span className="text-foreground">{inv.advisor}:</span> {inv.condition}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

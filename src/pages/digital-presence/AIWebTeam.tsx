import { PageShell } from "@/components/sita/PageShell";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe, Palette, Target, Wrench, Search, Store, Megaphone, Settings, Eye, Layout, MessageSquare, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Brain, Users, Zap, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DISAGREEMENTS: any[] = [];

type Intensity = "quiet" | "balanced" | "proactive";
type AgentStatus = "active" | "inactive" | "watching";

interface Observation {
  title: string;
  summary: string;
  confidence: number;
  type: "opportunity" | "risk" | "fix" | "insight";
  impact: "high" | "medium" | "low";
}

interface AgentProfile {
  id: string;
  name: string;
  icon: any;
  color: string;
  desc: string;
  status: AgentStatus;
  intensity: Intensity;
  watches: string[];
  recommends: string[];
  observations: Observation[];
  confidence: number;
  uncertainty: number;
  tasksActive: number;
  tasksPending: number;
  lastAction: string;
}

const AGENTS: AgentProfile[] = [
  {
    id: "web-strategist", name: "Web Strategist", icon: Globe, color: "text-blue-400",
    desc: "Site structure, page purpose, business journey alignment, conversion paths",
    status: "active", intensity: "proactive",
    watches: ["Site structure", "Page purpose alignment", "Conversion paths", "Offer architecture", "Campaign landing strategy", "Site sprawl"],
    recommends: ["New pages", "Page consolidation", "Path simplification", "Funnel architecture", "Homepage strategy"],
    observations: [
      { title: "Homepage needs stronger value proposition", summary: "Current fold content is generic. Recommend business-specific hero with clear CTA.", confidence: 87, type: "opportunity", impact: "high" },
      { title: "Services page sprawl detected", summary: "8 service pages with overlapping content. Consolidate to 4 with clear differentiation.", confidence: 72, type: "insight", impact: "medium" },
    ],
    confidence: 82, uncertainty: 14, tasksActive: 2, tasksPending: 3, lastAction: "Analyzed homepage conversion path"
  },
  {
    id: "design-director", name: "Design Director", icon: Palette, color: "text-purple-400",
    desc: "Visual hierarchy, brand alignment, spacing, CTA prominence, premium feel",
    status: "active", intensity: "balanced",
    watches: ["Visual hierarchy", "Brand consistency", "Spacing & composition", "CTA prominence", "Mobile composition", "Premium feel"],
    recommends: ["Layout updates", "Visual simplification", "Trust presentation", "Section ordering", "Mobile composition"],
    observations: [
      { title: "CTA button contrast too low on services page", summary: "Primary CTA blends with background. Needs stronger visual weight.", confidence: 91, type: "fix", impact: "high" },
      { title: "Brand inconsistency on blog", summary: "Blog uses different heading styles than main site. 3 pages affected.", confidence: 78, type: "risk", impact: "medium" },
    ],
    confidence: 85, uncertainty: 10, tasksActive: 1, tasksPending: 2, lastAction: "Reviewed mobile layout consistency"
  },
  {
    id: "content-strategist", name: "Content Strategist", icon: Layout, color: "text-green-400",
    desc: "Message clarity, tone consistency, stale copy, content freshness",
    status: "active", intensity: "proactive",
    watches: ["Message clarity", "Tone consistency", "Stale copy", "Value proposition", "FAQ gaps", "Service descriptions", "Content freshness"],
    recommends: ["Rewrite sections", "Add missing copy", "Refresh product details", "Improve trust text", "Content calendar"],
    observations: [
      { title: "12 blog posts have stale content", summary: "Posts older than 6 months with declining engagement. Recommend refresh cycle.", confidence: 94, type: "risk", impact: "medium" },
      { title: "Pricing page lacks comparison clarity", summary: "Users bounce at pricing — missing clear tier differentiators.", confidence: 68, type: "opportunity", impact: "high" },
    ],
    confidence: 79, uncertainty: 18, tasksActive: 3, tasksPending: 5, lastAction: "Flagged stale service descriptions"
  },
  {
    id: "cro-advisor", name: "CRO Advisor", icon: Target, color: "text-amber-400",
    desc: "CTAs, form friction, conversion drop-off, cart abandonment, trust gaps",
    status: "active", intensity: "proactive",
    watches: ["CTAs", "Form friction", "Conversion drop-off", "Booking conversion", "Cart abandonment", "Checkout weakness", "Trust gaps"],
    recommends: ["CTA changes", "Fewer form fields", "Trust/social proof", "Path simplification", "Checkout improvements"],
    observations: [
      { title: "Contact form has 40% abandonment", summary: "7-field form causing drop-off. Recommend reducing to 4 essential fields.", confidence: 92, type: "fix", impact: "high" },
      { title: "Missing social proof on checkout", summary: "No testimonials or trust badges near payment. Add trust section.", confidence: 85, type: "opportunity", impact: "high" },
    ],
    confidence: 88, uncertainty: 8, tasksActive: 2, tasksPending: 4, lastAction: "Analyzed checkout funnel drop-off"
  },
  {
    id: "technical-qa", name: "Technical QA", icon: Wrench, color: "text-red-400",
    desc: "Broken links, missing assets, mobile responsiveness, form failures, patch verification",
    status: "active", intensity: "balanced",
    watches: ["Broken links", "Missing assets", "Mobile responsiveness", "Page rendering", "Form failures", "Element states"],
    recommends: ["Low-risk fixes", "Patch plans", "Publish blocks", "Verification runs"],
    observations: [
      { title: "3 broken images on product pages", summary: "Images return 404 — likely moved during last update. Auto-fix eligible.", confidence: 99, type: "fix", impact: "medium" },
      { title: "Mobile menu overflow on tablet", summary: "Navigation menu clips on iPad landscape. CSS fix required.", confidence: 95, type: "fix", impact: "low" },
    ],
    confidence: 96, uncertainty: 3, tasksActive: 1, tasksPending: 2, lastAction: "Verified SSL certificate renewal"
  },
  {
    id: "seo-discovery", name: "SEO / Discovery", icon: Search, color: "text-cyan-400",
    desc: "Metadata, findability, indexable structure, content topics, local search",
    status: "active", intensity: "quiet",
    watches: ["Metadata quality", "Title/description", "Indexable structure", "Findability gaps", "Heading clarity", "Local findability"],
    recommends: ["Metadata fixes", "Content topic additions", "Structure improvements", "Internal linking"],
    observations: [
      { title: "4 pages missing meta descriptions", summary: "Services, About, Contact, and FAQ have empty meta descriptions.", confidence: 100, type: "fix", impact: "medium" },
      { title: "Local schema markup missing", summary: "No LocalBusiness structured data. Important for local search visibility.", confidence: 76, type: "opportunity", impact: "medium" },
    ],
    confidence: 84, uncertainty: 12, tasksActive: 0, tasksPending: 3, lastAction: "Scanned heading hierarchy"
  },
  {
    id: "ecommerce-merch", name: "Ecommerce Merchandising", icon: Store, color: "text-rose-400",
    desc: "Product placement, collections, related products, bundle opportunities",
    status: "active", intensity: "balanced",
    watches: ["Product page quality", "Collection ordering", "Related products", "Bundle opportunities", "Low-performing pages", "Promo merchandising"],
    recommends: ["Product highlights", "Collection changes", "Feature rotations", "Bundle ideas", "Seasonal merchandising"],
    observations: [
      { title: "Best seller not featured on homepage", summary: "Top-selling product buried in collection. Should be hero product.", confidence: 88, type: "opportunity", impact: "high" },
      { title: "3 low-performing product pages", summary: "Products with <1% conversion. Consider refreshing copy and images.", confidence: 73, type: "insight", impact: "medium" },
    ],
    confidence: 77, uncertainty: 20, tasksActive: 1, tasksPending: 2, lastAction: "Analyzed product page conversion rates"
  },
  {
    id: "promotions", name: "Promotions Advisor", icon: Megaphone, color: "text-orange-400",
    desc: "Promo timing, banner consistency, conflicts, launch pages, expiry cleanup",
    status: "active", intensity: "quiet",
    watches: ["Promotion timing", "Banner consistency", "Promo conflicts", "Launch pages", "Expiry cleanup", "Revenue Office sync"],
    recommends: ["Banners", "Promo pages", "Start/stop logic", "Urgency placement", "Cleanup tasks"],
    observations: [
      { title: "Summer sale banner performing well", summary: "CTR 4.2% — above average. Consider extending 2 more days.", confidence: 81, type: "insight", impact: "medium" },
      { title: "Expired promo still showing on 2 pages", summary: "Spring offer expired 5 days ago. Cleanup needed.", confidence: 100, type: "fix", impact: "low" },
    ],
    confidence: 80, uncertainty: 15, tasksActive: 0, tasksPending: 1, lastAction: "Checked promo/page alignment"
  },
  {
    id: "website-ops", name: "Website Ops", icon: Settings, color: "text-slate-400",
    desc: "Connection health, publish health, sync issues, patch queues, maintenance",
    status: "active", intensity: "quiet",
    watches: ["Site connection health", "Publish health", "Environment differences", "Sync issues", "Patch queues", "Maintenance load"],
    recommends: ["Pause risky changes", "Rollout strategy", "Patch sequencing", "Rollback", "Environment cleanup"],
    observations: [
      { title: "SSL cert renewal in 14 days", summary: "Auto-renew confirmed. No action needed.", confidence: 100, type: "insight", impact: "low" },
    ],
    confidence: 95, uncertainty: 3, tasksActive: 0, tasksPending: 0, lastAction: "Verified sync health"
  },
  {
    id: "app-experience", name: "App Experience", icon: Eye, color: "text-indigo-400",
    desc: "Mobile-first web experiences, customer portals, PWA, mini-app UX",
    status: "watching", intensity: "quiet",
    watches: ["Mobile-first experiences", "Customer portals", "App-like flows", "PWA interactions", "Account handoffs"],
    recommends: ["App-like path refinements", "Portal improvements", "Mobile upgrades", "Deep-link patterns"],
    observations: [
      { title: "No PWA manifest detected", summary: "Consider adding PWA support for mobile engagement.", confidence: 65, type: "opportunity", impact: "low" },
    ],
    confidence: 60, uncertainty: 35, tasksActive: 0, tasksPending: 1, lastAction: "Checked mobile experience quality"
  },
];

const SYNTHESIS = {
  biggestProblem: "Contact form abandonment at 40% is the largest conversion leak",
  biggestOpportunity: "Adding social proof to checkout could lift conversion by ~15%",
  whatChanged: "3 new broken images detected, summer promo performing above target",
  fixFirst: "Reduce contact form fields from 7 to 4",
  testNext: "A/B test checkout trust badges",
  humanReview: ["Homepage redesign", "Pricing page restructure", "Brand kit changes"],
  autoMaintain: ["Broken image fixes", "Meta description fills", "Expired promo cleanup"],
};

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  const color = value >= 85 ? "bg-green-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ObservationCard({ obs }: { obs: Observation }) {
  const typeIcon = obs.type === "fix" ? <Wrench className="w-3 h-3" /> : obs.type === "risk" ? <AlertTriangle className="w-3 h-3" /> : obs.type === "opportunity" ? <TrendingUp className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />;
  const typeColor = obs.type === "fix" ? "text-red-400" : obs.type === "risk" ? "text-amber-400" : obs.type === "opportunity" ? "text-green-400" : "text-blue-400";
  const impactColor = obs.impact === "high" ? "destructive" : obs.impact === "medium" ? "default" : "secondary";

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/30 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={typeColor}>{typeIcon}</span>
          <span className="text-xs font-medium text-foreground">{obs.title}</span>
        </div>
        <Badge variant={impactColor as never} className="text-[9px] shrink-0">{obs.impact} impact</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{obs.summary}</p>
      <ConfidenceBar value={obs.confidence} label="Confidence" />
    </div>
  );
}

function AgentDetailPanel({ agent }: { agent: AgentProfile }) {
  return (
    <div className="space-y-4 p-4 bg-card/30 rounded-lg border border-border/30">
      <div className="grid grid-cols-2 gap-3">
        <ConfidenceBar value={agent.confidence} label="Overall Confidence" />
        <ConfidenceBar value={100 - agent.uncertainty} label="Certainty" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-lg font-bold text-foreground">{agent.tasksActive}</p>
          <p className="text-[9px] text-muted-foreground">Active</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-lg font-bold text-foreground">{agent.tasksPending}</p>
          <p className="text-[9px] text-muted-foreground">Pending</p>
        </div>
        <div className="p-2 bg-muted/30 rounded">
          <p className="text-lg font-bold text-foreground">{agent.observations.length}</p>
          <p className="text-[9px] text-muted-foreground">Observations</p>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Watching</h4>
        <div className="flex flex-wrap gap-1">
          {agent.watches.map(w => <Badge key={w} variant="outline" className="text-[9px]">{w}</Badge>)}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Observations</h4>
        <div className="space-y-2">
          {agent.observations.map((obs, i) => <ObservationCard key={i} obs={obs} />)}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Last action: <span className="text-foreground">{agent.lastAction}</span>
      </div>
    </div>
  );
}

export default function AIWebTeam() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("team");
  const [intensities, setIntensities] = useState<Record<string, Intensity>>(
    Object.fromEntries(AGENTS.map(a => [a.id, a.intensity]))
  );

  const cycleIntensity = (id: string) => {
    const levels: Intensity[] = ["quiet", "balanced", "proactive"];
    setIntensities(prev => {
      const curr = levels.indexOf(prev[id]);
      return { ...prev, [id]: levels[(curr + 1) % 3] };
    });
  };

  const totalObservations = AGENTS.reduce((sum, a) => sum + a.observations.length, 0);
  const avgConfidence = Math.round(AGENTS.reduce((sum, a) => sum + a.confidence, 0) / AGENTS.length);
  const highImpactCount = AGENTS.reduce((sum, a) => sum + a.observations.filter(o => o.impact === "high").length, 0);

  return (
    <PageShell width="wide">
      <DPOSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">AI Web Team Board</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your full AI-powered web strategy, design, CRO & operations department</p>
      </motion.div>

      {/* Team stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Active Agents", value: AGENTS.filter(a => a.status === "active").length.toString(), icon: Users },
          { label: "Avg Confidence", value: `${avgConfidence}%`, icon: Brain },
          { label: "Observations", value: totalObservations.toString(), icon: Eye },
          { label: "High Impact", value: highImpactCount.toString(), icon: Zap },
          { label: "Disagreements", value: ([] as never[]).length.toString(), icon: MessageSquare },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 flex items-center gap-3">
                <s.icon className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="team">Full Team</TabsTrigger>
          <TabsTrigger value="synthesis">Chief Synthesis</TabsTrigger>
          <TabsTrigger value="disagreements">Disagreements</TabsTrigger>
          <TabsTrigger value="queries">Ask Team</TabsTrigger>
        </TabsList>

        {/* Full Team Tab */}
        <TabsContent value="team" className="space-y-3 mt-4">
          {AGENTS.map((agent, i) => {
            const isExpanded = expandedAgent === agent.id;
            const intensityColor = intensities[agent.id] === "proactive" ? "text-green-400" : intensities[agent.id] === "balanced" ? "text-amber-400" : "text-slate-400";

            return (
              <motion.div key={agent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`bg-card/50 border-border/50 ${agent.status === "inactive" ? "opacity-40" : agent.status === "watching" ? "opacity-70" : ""}`}>
                  <CardContent className="p-0">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <agent.icon className={`w-5 h-5 ${agent.color} shrink-0`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                            <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-[9px]">{agent.status}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{agent.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-muted-foreground">{agent.observations.length} observations</p>
                          <p className="text-[10px] font-medium text-foreground">{agent.confidence}% confident</p>
                        </div>
                        <Button
                          variant="ghost" size="sm"
                          className={`h-6 text-[10px] ${intensityColor}`}
                          onClick={(e) => { e.stopPropagation(); cycleIntensity(agent.id); }}
                        >
                          {intensities[agent.id]}
                        </Button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <AgentDetailPanel agent={agent} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Chief Synthesis Tab */}
        <TabsContent value="synthesis" className="mt-4 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Chief Digital Synthesis</CardTitle>
              </div>
              <p className="text-[10px] text-muted-foreground">Unified intelligence from all 10 agents</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Biggest Problem", value: SYNTHESIS.biggestProblem, icon: AlertTriangle, color: "text-red-400" },
                { label: "Biggest Opportunity", value: SYNTHESIS.biggestOpportunity, icon: TrendingUp, color: "text-green-400" },
                { label: "What Changed", value: SYNTHESIS.whatChanged, icon: Zap, color: "text-amber-400" },
                { label: "Fix First", value: SYNTHESIS.fixFirst, icon: Wrench, color: "text-blue-400" },
                { label: "Test Next", value: SYNTHESIS.testNext, icon: Target, color: "text-purple-400" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                  <item.icon className={`w-4 h-4 ${item.color} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-xs text-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Must Stay Human-Reviewed
                  </h4>
                  <div className="space-y-1">
                    {SYNTHESIS.humanReview.map(item => (
                      <div key={item} className="text-xs text-foreground flex items-center gap-2 p-1.5 bg-muted/20 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Safe for Auto-Maintenance
                  </h4>
                  <div className="space-y-1">
                    {SYNTHESIS.autoMaintain.map(item => (
                      <div key={item} className="text-xs text-foreground flex items-center gap-2 p-1.5 bg-muted/20 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disagreements Tab */}
        <TabsContent value="disagreements" className="mt-4 space-y-4">
          {([] as never[]).map((d, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">{d.topic}</h3>
                </div>
                <div className="space-y-2">
                  {d.positions.map(p => (
                    <div key={p.agent} className="flex items-center gap-3 p-2.5 bg-muted/20 rounded-lg">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-primary">{p.agent}</p>
                        <p className="text-xs text-foreground">{p.position}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-foreground">{p.confidence}%</p>
                        <p className="text-[9px] text-muted-foreground">confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[10px] font-semibold text-primary uppercase mb-1">Resolution</p>
                  <p className="text-xs text-foreground">{d.resolution}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Ask Team Tab */}
        <TabsContent value="queries" className="mt-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Query Your Web Team</h3>
              </div>
              <p className="text-xs text-muted-foreground">Ask a single agent, the full team, or compare perspectives</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Show me only safe fixes",
                  "Show me fastest wins",
                  "What has highest conversion impact?",
                  "Why do you disagree?",
                  "Prepare changes for review",
                  "Show me changes since last visit",
                  "What should stay human-reviewed?",
                  "Explain simply",
                ].map(query => (
                  <Button key={query} variant="outline" size="sm" className="justify-start text-xs h-auto py-2.5 px-3">
                    <ArrowRight className="w-3 h-3 mr-2 shrink-0 text-primary" />
                    {query}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

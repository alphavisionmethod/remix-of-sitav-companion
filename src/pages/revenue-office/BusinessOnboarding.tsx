import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Briefcase, Users, ShoppingBag, GraduationCap, MapPin, Layers,
  Sparkles, ArrowRight, ArrowLeft, Check, DollarSign, Phone, Mail, Globe,
  FileText, Star, Heart, Target, Zap, Shield, Brain, MessageSquare,
  Calendar, Upload, Link2, ClipboardList, TrendingUp, RefreshCw, CheckCircle,
  Package, BarChart3, UserPlus, Search, ShoppingCart, Megaphone, Repeat,
  PenTool, Rocket, Eye, AlertTriangle, Layout,
  Award, Activity, Gauge, CircleDot, Flame, Waves, Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Types ──────────────────────────────────────────────────────
interface OnboardingState {
  businessName: string;
  businessTypes: string[];
  teamSize: string;
  businessStage: string;
  revenueSources: string[];
  preBuyBehavior: string[];
  leadSources: string[];
  whatHappensNext: string[];
  whatCloses: string[];
  journeyTemplate: string;
  journeyPainPoints: string[];
  postSaleSteps: string[];
  postSaleSlips: string[];
  growthBottlenecks: string[];
  teamRoles: Record<string, string>;
  needsApprovals: boolean;
  connectedSystems: string[];
  importedFiles: string[];
  uploadedArtifacts: string[];
  pastedUrls: string[];
  automationLevel: string;
  humanOnlyTasks: string[];
  selectedFirstWins: string[];
}

const defaultState: OnboardingState = {
  businessName: "", businessTypes: [], teamSize: "solo", businessStage: "growing",
  revenueSources: [], preBuyBehavior: [], leadSources: [], whatHappensNext: [],
  whatCloses: [], journeyTemplate: "", journeyPainPoints: [], postSaleSteps: [],
  postSaleSlips: [], growthBottlenecks: [], teamRoles: {}, needsApprovals: false,
  connectedSystems: [], importedFiles: [], uploadedArtifacts: [], pastedUrls: [],
  automationLevel: "draft_review", humanOnlyTasks: [], selectedFirstWins: [],
};

// ─── Stage definitions ──────────────────────────────────────────
const stages = [
  { id: "ceremony", label: "Welcome", icon: Crown, chapter: "Formation" },
  { id: "identity", label: "Business Identity", icon: Building2, chapter: "Formation" },
  { id: "model", label: "Operating Model", icon: Briefcase, chapter: "Engine" },
  { id: "revenue", label: "Revenue Engine", icon: DollarSign, chapter: "Engine" },
  { id: "journey", label: "Customer Journey", icon: Target, chapter: "Engine" },
  { id: "delivery", label: "Delivery Model", icon: Package, chapter: "Delivery" },
  { id: "bottlenecks", label: "Growth Gaps", icon: AlertTriangle, chapter: "Delivery" },
  { id: "team", label: "Team & Roles", icon: Users, chapter: "Operations" },
  { id: "systems", label: "Connected Systems", icon: Link2, chapter: "Operations" },
  { id: "artifacts", label: "Business Materials", icon: FileText, chapter: "Operations" },
  { id: "automation", label: "Trust & Automation", icon: Shield, chapter: "Trust" },
  { id: "firstwin", label: "First Wins", icon: Rocket, chapter: "Launch" },
  { id: "reveal", label: "Your Revenue Office", icon: Layout, chapter: "Launch" },
];

const chapters = ["Formation", "Engine", "Delivery", "Operations", "Trust", "Launch"];

// ─── Helpers ────────────────────────────────────────────────────
function Toggle({ label, desc, icon: Icon, selected, onToggle, badge }: { label: string; desc?: string; icon: any; selected: boolean; onToggle: () => void; badge?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onToggle} className={`p-4 rounded-xl border text-left transition-all ${selected ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm shadow-primary/5" : "bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/80"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg transition-colors ${selected ? "bg-primary/20" : "bg-muted"}`}><Icon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} /></div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-foreground/80"}`}>{label}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badge && <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">{badge}</Badge>}
          {selected && <Check className="h-4 w-4 text-primary" />}
        </div>
      </div>
    </motion.button>
  );
}

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-foreground">{children}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

function ChapterTransitionCard({ chapter, subtitle }: { chapter: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
      <Badge className="bg-primary/10 text-primary text-[10px] mb-2">{chapter}</Badge>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

// ─── Live Intelligence Sidebar ──────────────────────────────────
function LiveOfficeSidebar({ state, stage }: { state: OnboardingState; stage: number }) {
  const insights = useMemo(() => {
    const items: { icon: any; text: string; type: "detected" | "ready" | "warning" | "opportunity" }[] = [];

    if (state.businessTypes.length > 1) items.push({ icon: Layers, text: `Hybrid model detected: ${state.businessTypes.length} business types`, type: "detected" });
    if (state.businessTypes.includes("service") && state.revenueSources.includes("proposals")) items.push({ icon: Brain, text: "Proposal-driven service flow identified", type: "detected" });
    if (state.businessTypes.includes("local")) items.push({ icon: MapPin, text: "Local discovery + reputation engine activating", type: "detected" });
    if (state.businessTypes.includes("coaching") && state.revenueSources.includes("memberships")) items.push({ icon: Heart, text: "Coaching + membership hybrid — retention critical", type: "detected" });
    if (state.preBuyBehavior.includes("book_call") && state.whatCloses.includes("call")) items.push({ icon: Phone, text: "Call-centric sales motion — Call Desk priority", type: "detected" });
    if (state.leadSources.includes("referrals")) items.push({ icon: Users, text: "Referral-dependent — relationship tracking activated", type: "detected" });
    if (state.postSaleSlips.includes("onboarding")) items.push({ icon: AlertTriangle, text: "Onboarding gap detected — automation opportunity", type: "warning" });
    if (state.postSaleSlips.includes("reviews")) items.push({ icon: Star, text: "Review gap — reputation automation recommended", type: "opportunity" });
    if (state.postSaleSlips.includes("followup")) items.push({ icon: MessageSquare, text: "Follow-up slips — nurture automation priority", type: "warning" });
    if (state.growthBottlenecks.includes("no_shows")) items.push({ icon: Phone, text: "No-show problem — rescue flow critical", type: "warning" });
    if (state.growthBottlenecks.includes("lead_followup")) items.push({ icon: TrendingUp, text: "Lead follow-up gap — $8K+ at risk monthly", type: "warning" });
    if (state.connectedSystems.length > 0) items.push({ icon: Link2, text: `${state.connectedSystems.length} systems ready to connect`, type: "ready" });
    if (state.uploadedArtifacts.length > 0) items.push({ icon: FileText, text: `${state.uploadedArtifacts.length} business materials for SITA to learn`, type: "ready" });
    if (state.journeyTemplate) items.push({ icon: Target, text: "Customer Journey Twin forming", type: "ready" });

    return items;
  }, [state]);

  // Compute office readiness
  const readiness = useMemo(() => {
    let score = 0;
    if (state.businessName) score += 8;
    if (state.businessTypes.length > 0) score += 10;
    if (state.revenueSources.length > 0) score += 12;
    if (state.leadSources.length > 0) score += 10;
    if (state.journeyTemplate) score += 15;
    if (state.postSaleSteps.length > 0) score += 10;
    if (state.connectedSystems.length > 0) score += 10;
    if (state.automationLevel) score += 10;
    if (state.selectedFirstWins.length > 0) score += 15;
    return Math.min(score, 100);
  }, [state]);

  // Active advisors based on model
  const advisors = useMemo(() => {
    const list: { name: string; active: boolean }[] = [
      { name: "Revenue Strategist", active: stage >= 3 },
      { name: "CRM Advisor", active: state.leadSources.length > 0 },
      { name: "Funnel Advisor", active: state.journeyTemplate !== "" },
      { name: "Retention Advisor", active: state.postSaleSlips.length > 0 },
      { name: "Reputation Advisor", active: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local") },
      { name: "Automation Advisor", active: stage >= 10 },
    ];
    return list;
  }, [state, stage]);

  if (stage === 0 || stage >= 12) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-28 space-y-4">
        {/* Office readiness */}
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] font-semibold text-foreground">Revenue Office Forming</p>
            </div>
            <Progress value={readiness} className="h-1.5 mb-1.5" />
            <p className="text-[10px] text-muted-foreground">{readiness}% personalized</p>
          </CardContent>
        </Card>

        {/* Live insights */}
        {insights.length > 0 && (
          <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-3.5 w-3.5 text-primary" />
                <p className="text-[11px] font-semibold text-foreground">SITA Noticed</p>
              </div>
              <div className="space-y-2">
                {insights.slice(0, 6).map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-2">
                    <div className={`p-1 rounded ${ins.type === "warning" ? "bg-amber-500/10" : ins.type === "opportunity" ? "bg-emerald-500/10" : ins.type === "ready" ? "bg-blue-500/10" : "bg-primary/10"}`}>
                      <ins.icon className={`h-3 w-3 ${ins.type === "warning" ? "text-amber-400" : ins.type === "opportunity" ? "text-emerald-400" : ins.type === "ready" ? "text-blue-400" : "text-primary"}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{ins.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advisor activation */}
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] font-semibold text-foreground">Advisor Board</p>
            </div>
            <div className="space-y-1.5">
              {advisors.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CircleDot className={`h-2.5 w-2.5 ${a.active ? "text-emerald-400" : "text-muted-foreground/30"}`} />
                  <span className={`text-[10px] ${a.active ? "text-foreground" : "text-muted-foreground/50"}`}>{a.name}</span>
                  {a.active && <Badge className="bg-emerald-500/10 text-emerald-400 text-[8px] ml-auto">Active</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function BusinessOnboarding() {
  const [stage, setStage] = useState(0);
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [showChapterTransition, setShowChapterTransition] = useState(false);
  const navigate = useNavigate();
  const pct = ((stage) / (stages.length - 1)) * 100;

  const toggle = useCallback((field: keyof OnboardingState, value: string) => {
    setState(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }, []);

  const currentChapter = stages[stage]?.chapter;
  const prevChapter = stage > 0 ? stages[stage - 1]?.chapter : null;

  const next = useCallback(() => {
    const nextStage = Math.min(stage + 1, stages.length - 1);
    const nextChapter = stages[nextStage]?.chapter;
    if (nextChapter !== currentChapter && nextStage < stages.length - 1) {
      setShowChapterTransition(true);
      setTimeout(() => { setShowChapterTransition(false); setStage(nextStage); }, 800);
    } else {
      setStage(nextStage);
    }
  }, [stage, currentChapter]);

  const back = () => setStage(s => Math.max(s - 1, 0));

  // ─── Data arrays ─────────────────────────────────────────────
  const businessTypes = [
    { id: "service", label: "Service Business", desc: "Appointments, proposals, delivery milestones, reviews", icon: Briefcase },
    { id: "agency", label: "Agency", desc: "Multi-client, retainers, reporting, white-label", icon: Users },
    { id: "coaching", label: "Coach / Consultant", desc: "Personal brand, bookings, packages, memberships", icon: GraduationCap },
    { id: "creator", label: "Creator / Education", desc: "Products, courses, memberships, launches, content funnels", icon: PenTool },
    { id: "ecommerce", label: "Online Store", desc: "Products, carts, checkout, fulfillment, repeat purchase", icon: ShoppingCart },
    { id: "local", label: "Local / Brick & Mortar", desc: "Visits, bookings, reputation, local campaigns, scheduling", icon: MapPin },
    { id: "membership", label: "Membership Business", desc: "Subscriptions, access tiers, renewal, retention", icon: Heart },
    { id: "hybrid", label: "Hybrid Model", desc: "Multiple revenue streams, mixed delivery", icon: Layers },
    { id: "evolving", label: "Still Evolving", desc: "Exploring models, testing ideas, early stage", icon: Sparkles },
  ];

  const revenueSources = [
    { id: "appointments", label: "Booked calls / appointments", icon: Phone },
    { id: "proposals", label: "Proposals and invoices", icon: FileText },
    { id: "retainers", label: "Recurring retainers", icon: RefreshCw },
    { id: "digital_products", label: "Digital products", icon: Package },
    { id: "memberships", label: "Memberships / subscriptions", icon: Heart },
    { id: "ecommerce", label: "E-commerce sales", icon: ShoppingBag },
    { id: "in_person", label: "In-person visits", icon: MapPin },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "launches", label: "Launches / campaigns", icon: Megaphone },
    { id: "mixed", label: "Mixed / evolving", icon: Layers },
  ];

  const preBuyOptions = [
    { id: "discover_online", label: "Discover me online", icon: Globe },
    { id: "fill_form", label: "Fill out a form", icon: ClipboardList },
    { id: "book_call", label: "Book a call", icon: Phone },
    { id: "message", label: "Message me", icon: MessageSquare },
    { id: "walk_in", label: "Walk in / visit", icon: MapPin },
    { id: "email_list", label: "Join email list", icon: Mail },
    { id: "buy_direct", label: "Buy directly", icon: ShoppingCart },
    { id: "ask_quote", label: "Ask for a quote", icon: FileText },
    { id: "referral", label: "Get referred", icon: UserPlus },
  ];

  const leadSourceOptions = [
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "website", label: "Website", icon: Globe },
    { id: "social", label: "Social / content", icon: Megaphone },
    { id: "outbound", label: "Outbound", icon: Mail },
    { id: "ads", label: "Ads", icon: Target },
    { id: "local", label: "Local discovery", icon: MapPin },
    { id: "repeat", label: "Repeat customers", icon: Repeat },
    { id: "platforms", label: "Marketplaces / platforms", icon: ShoppingBag },
    { id: "partnerships", label: "Partnerships", icon: Briefcase },
  ];

  const whatHappensOptions = [
    { id: "inquiry", label: "Inquiry", icon: MessageSquare },
    { id: "form", label: "Form submission", icon: ClipboardList },
    { id: "call", label: "Discovery call", icon: Phone },
    { id: "quote", label: "Quote / estimate", icon: FileText },
    { id: "proposal", label: "Proposal", icon: FileText },
    { id: "checkout", label: "Checkout", icon: ShoppingCart },
    { id: "booking", label: "Booking", icon: Calendar },
    { id: "visit", label: "In-person visit", icon: MapPin },
    { id: "consultation", label: "Consultation", icon: Brain },
    { id: "trial", label: "Free trial", icon: Eye },
    { id: "nurture", label: "Content nurture", icon: Mail },
  ];

  const whatClosesOptions = [
    { id: "call", label: "A call", icon: Phone },
    { id: "proposal", label: "A proposal", icon: FileText },
    { id: "checkout", label: "Checkout", icon: ShoppingCart },
    { id: "trust", label: "Trust and timing", icon: Shield },
    { id: "referral_conf", label: "Referral confidence", icon: Users },
    { id: "relationship", label: "Recurring relationship", icon: Heart },
    { id: "in_person", label: "In-person experience", icon: MapPin },
  ];

  const journeyTemplates = [
    { id: "service", label: "Service Business", flow: "Lead → Inquiry → Call → Quote → Close → Onboarding → Delivery → Review", icon: Briefcase },
    { id: "coaching", label: "Coaching / Consulting", flow: "Lead magnet → Nurture → Booking → Sales call → Enrollment → Onboarding → Renewal", icon: GraduationCap },
    { id: "ecommerce", label: "E-commerce", flow: "Traffic → Product → Cart → Checkout → Fulfillment → Review → Repeat", icon: ShoppingCart },
    { id: "local", label: "Local Business", flow: "Discovery → Visit/booking → Service → Review → Repeat → Referral", icon: MapPin },
    { id: "agency", label: "Agency", flow: "Referral/content → Discovery → Proposal → Retainer → Delivery → Reporting → Renewal", icon: Users },
    { id: "creator", label: "Creator / Course", flow: "Content → Lead magnet → Nurture → Launch → Enrollment → Delivery → Upsell", icon: PenTool },
    { id: "membership", label: "Membership", flow: "Content → Trial → Enrollment → Onboarding → Engagement → Retention → Upsell", icon: Heart },
    { id: "custom", label: "Custom Journey", flow: "Build your own from scratch", icon: Layers },
  ];

  const journeyPainOptions = [
    { id: "dropoff_inquiry", label: "People inquire but never follow up", icon: MessageSquare },
    { id: "dropoff_call", label: "Calls booked but no-shows are common", icon: Phone },
    { id: "dropoff_quote", label: "Quotes sent but no response", icon: FileText },
    { id: "dropoff_checkout", label: "Checkout abandonment", icon: ShoppingCart },
    { id: "dropoff_onboarding", label: "Clients drop off during onboarding", icon: UserPlus },
    { id: "dropoff_retention", label: "Customers leave after first engagement", icon: Heart },
    { id: "dropoff_referral", label: "Happy customers but no referrals", icon: Users },
    { id: "dropoff_repeat", label: "One-time buyers who never return", icon: Repeat },
  ];

  const postSaleOptions = [
    { id: "onboarding_call", label: "Onboarding call", icon: Phone },
    { id: "intake_forms", label: "Forms / intake", icon: ClipboardList },
    { id: "payment", label: "Payment / invoice", icon: DollarSign },
    { id: "kickoff", label: "Kickoff meeting", icon: Rocket },
    { id: "delivery", label: "Service delivery", icon: Package },
    { id: "course_access", label: "Course / product access", icon: GraduationCap },
    { id: "shipment", label: "Shipment / fulfillment", icon: ShoppingBag },
    { id: "checkins", label: "Recurring check-ins", icon: RefreshCw },
    { id: "renewal", label: "Renewal flow", icon: Repeat },
  ];

  const postSaleSlipOptions = [
    { id: "onboarding", label: "Onboarding", icon: UserPlus },
    { id: "followup", label: "Follow-up", icon: MessageSquare },
    { id: "handoff", label: "Delivery handoff", icon: ArrowRight },
    { id: "expectations", label: "Expectations management", icon: AlertTriangle },
    { id: "retention", label: "Retention", icon: Heart },
    { id: "reviews", label: "Review requests", icon: Star },
    { id: "renewals", label: "Renewals", icon: RefreshCw },
    { id: "upsells", label: "Upsells", icon: TrendingUp },
  ];

  const bottleneckOptions = [
    { id: "lead_flow", label: "Not enough leads coming in", icon: Users, desc: "Pipeline feels empty or unpredictable" },
    { id: "lead_followup", label: "Leads fall through the cracks", icon: MessageSquare, desc: "Inquiries arrive but follow-up is inconsistent" },
    { id: "conversion", label: "Leads don't convert to customers", icon: Target, desc: "Interest exists but deals don't close" },
    { id: "no_shows", label: "No-shows and cancellations", icon: Phone, desc: "Appointments booked but attendance is poor" },
    { id: "pricing", label: "Pricing confusion or undercharging", icon: DollarSign, desc: "Not sure what to charge or leaving money on the table" },
    { id: "delivery", label: "Delivery bottleneck", icon: Package, desc: "Can't scale without quality dropping" },
    { id: "retention_gap", label: "Customers leave too quickly", icon: Heart, desc: "Churn is high, repeat business is low" },
    { id: "review_gap", label: "Not enough reviews or testimonials", icon: Star, desc: "Happy clients but no social proof" },
    { id: "reactivation", label: "Past customers never come back", icon: RefreshCw, desc: "Existing base goes cold" },
    { id: "time_chaos", label: "Overwhelmed / too many hats", icon: AlertTriangle, desc: "Founder doing everything, no systems" },
  ];

  const teamRoles = [
    { id: "leads", label: "Leads & inquiries" },
    { id: "calls", label: "Calls & meetings" },
    { id: "proposals", label: "Proposals & quotes" },
    { id: "delivery", label: "Delivery & fulfillment" },
    { id: "scheduling", label: "Scheduling" },
    { id: "campaigns", label: "Campaigns & marketing" },
    { id: "reviews", label: "Reviews & reputation" },
    { id: "retention", label: "Retention & renewals" },
  ];

  const systemOptions = [
    { id: "hubspot", label: "HubSpot", icon: Globe },
    { id: "activecampaign", label: "ActiveCampaign", icon: Mail },
    { id: "keap", label: "Keap", icon: Zap },
    { id: "mailchimp", label: "Mailchimp", icon: Mail },
    { id: "gmail", label: "Gmail / Outlook", icon: Mail },
    { id: "google_calendar", label: "Google Calendar", icon: Calendar },
    { id: "calendly", label: "Calendly / booking tool", icon: Calendar },
    { id: "stripe", label: "Stripe / payments", icon: DollarSign },
    { id: "shopify", label: "Shopify / store", icon: ShoppingCart },
    { id: "wordpress", label: "WordPress / website", icon: Globe },
    { id: "notion", label: "Notion / docs", icon: FileText },
    { id: "sheets", label: "Google Sheets / Excel", icon: BarChart3 },
    { id: "slack", label: "Slack / Teams", icon: MessageSquare },
    { id: "social", label: "Social media", icon: Megaphone },
    { id: "review_platform", label: "Review platform", icon: Star },
    { id: "course_platform", label: "Course / LMS", icon: GraduationCap },
  ];

  const artifactOptions = [
    { id: "price_sheets", label: "Price sheets", icon: DollarSign },
    { id: "service_guides", label: "Service guides", icon: FileText },
    { id: "offer_decks", label: "Offer decks", icon: Package },
    { id: "proposal_templates", label: "Proposal templates", icon: FileText },
    { id: "onboarding_docs", label: "Onboarding docs", icon: UserPlus },
    { id: "sops", label: "SOPs / processes", icon: ClipboardList },
    { id: "intake_forms", label: "Intake forms", icon: ClipboardList },
    { id: "call_scripts", label: "Call scripts", icon: Phone },
    { id: "faq_docs", label: "FAQ docs", icon: MessageSquare },
    { id: "sales_pages", label: "Sales pages", icon: Globe },
    { id: "email_sequences", label: "Email sequences", icon: Mail },
    { id: "contracts", label: "Contracts", icon: FileText },
    { id: "review_scripts", label: "Review request scripts", icon: Star },
    { id: "journey_diagrams", label: "Customer journey diagrams", icon: Target },
  ];

  const automationLevels = [
    { id: "suggest", label: "Suggestions only", desc: "SITA observes and recommends — you decide and act on everything", icon: Eye, trust: 1 },
    { id: "draft_review", label: "Draft for review", desc: "SITA drafts emails, quotes, workflows — you approve before anything happens", icon: FileText, trust: 2 },
    { id: "auto_rules", label: "Safe automations under rules", desc: "SITA executes routine actions within your policy boundaries automatically", icon: CheckCircle, trust: 3 },
    { id: "broad_auto", label: "Broader automation with approvals", desc: "SITA runs the commercial engine, pauses only for high-impact decisions", icon: Zap, trust: 4 },
  ];

  const humanOnlyOptions = [
    { id: "pricing", label: "Pricing changes", icon: DollarSign },
    { id: "proposals", label: "Proposal sending", icon: FileText },
    { id: "highvalue", label: "High-value lead contact", icon: Star },
    { id: "negative_reviews", label: "Negative review responses", icon: AlertTriangle },
    { id: "churn", label: "Churn rescue", icon: Heart },
    { id: "vip", label: "VIP client follow-up", icon: Award },
    { id: "discounts", label: "Discount approvals", icon: DollarSign },
    { id: "contracts", label: "Contract modifications", icon: FileText },
  ];

  const firstWinOptions = useMemo(() => {
    const wins = [
      { id: "stale_leads", label: "Recover stale leads", desc: "Find and re-engage leads that went quiet", icon: Users, impact: "$8,200 at risk", relevant: state.growthBottlenecks.includes("lead_followup") || state.leadSources.length > 0 },
      { id: "journey_twin", label: "Build Customer Journey Twin", desc: "Create a live model of how customers move through your business", icon: Target, impact: "Strategic clarity", relevant: !!state.journeyTemplate },
      { id: "quote_automation", label: "Create quote automation", desc: "Auto-generate proposals from CRM data and follow up", icon: FileText, impact: "$4,800/mo recovered", relevant: state.revenueSources.includes("proposals") },
      { id: "noshow_rescue", label: "Build no-show recovery", desc: "Rescue missed appointments with automated rebooking", icon: Phone, impact: "+22% show rate", relevant: state.growthBottlenecks.includes("no_shows") || state.revenueSources.includes("appointments") },
      { id: "review_workflow", label: "Launch review requests", desc: "Ask happy clients for reviews at the perfect moment", icon: Star, impact: "+12 reviews/mo", relevant: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local") },
      { id: "leak_detection", label: "Find biggest revenue leak", desc: "Scan your journey for the #1 place money is being lost", icon: Search, impact: "$15K/mo potential", relevant: true },
      { id: "import_contacts", label: "Import and unify contacts", desc: "Bring in existing contacts into a unified CRM", icon: Upload, impact: "Foundation", relevant: state.connectedSystems.length > 0 || state.importedFiles.length > 0 },
      { id: "onboarding_flow", label: "Build client onboarding", desc: "Create an automated welcome and intake sequence", icon: UserPlus, impact: "Retention boost", relevant: state.postSaleSlips.includes("onboarding") },
      { id: "reactivation", label: "Reactivation campaign", desc: "Re-engage past customers who went cold", icon: RefreshCw, impact: "$3,200/mo", relevant: state.growthBottlenecks.includes("reactivation") },
      { id: "upsell", label: "Surface upsell opportunities", desc: "Find clients ready for additional services", icon: TrendingUp, impact: "$5,600/mo", relevant: state.postSaleSlips.includes("upsells") },
    ];
    return wins.sort((a, b) => (b.relevant ? 1 : 0) - (a.relevant ? 1 : 0));
  }, [state]);

  // ─── Render stages ────────────────────────────────────────────
  const renderStage = () => {
    switch (stages[stage].id) {
      case "ceremony":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center py-12 max-w-lg mx-auto">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                  <Crown className="h-10 w-10 text-primary" />
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <h1 className="text-2xl font-bold text-foreground mb-2">Business Formation Ceremony</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                SITA is about to learn how your business actually works — your revenue engine, customer journey, delivery model, and growth gaps.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                By the end, your Revenue Office will be fully personalized: advisors activated, automations calibrated, leaks identified, and your first win ready.
              </p>
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground mb-6">
                {chapters.map((ch, i) => (
                  <div key={ch} className="p-2.5 rounded-lg bg-card/50 border border-border/30">
                    <span className="text-primary font-semibold">{i + 1}.</span> {ch}
                  </div>
                ))}
              </div>
              <button onClick={next} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors">
                Begin Formation <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-[10px] text-muted-foreground">Takes about 8-12 minutes depending on depth</p>
            </motion.div>
          </motion.div>
        );

      case "identity":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 1: Formation" subtitle="Let SITA understand who you are and what you do" />
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">What is your business called?</label>
              <input type="text" value={state.businessName} onChange={e => setState(p => ({ ...p, businessName: e.target.value }))} placeholder="Your business name" className="w-full p-3.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none" />
            </div>
            <div>
              <SectionTitle hint="Choose all that apply — most businesses are hybrids">What best describes what you do?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {businessTypes.map(bt => <Toggle key={bt.id} label={bt.label} desc={bt.desc} icon={bt.icon} selected={state.businessTypes.includes(bt.id)} onToggle={() => toggle("businessTypes", bt.id)} />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SectionTitle>Team size</SectionTitle>
                <div className="space-y-1.5">
                  {[{ id: "solo", label: "Solo / founder" }, { id: "small", label: "Small team (2-10)" }, { id: "growing", label: "Growing team (10+)" }, { id: "multi", label: "Multi-location / agency" }].map(ts => (
                    <button key={ts.id} onClick={() => setState(p => ({ ...p, teamSize: ts.id }))} className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${state.teamSize === ts.id ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>{ts.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <SectionTitle>Business stage</SectionTitle>
                <div className="space-y-1.5">
                  {[{ id: "starting", label: "Just starting" }, { id: "growing", label: "Growing" }, { id: "established", label: "Established" }, { id: "scaling", label: "Scaling / optimizing" }].map(bs => (
                    <button key={bs.id} onClick={() => setState(p => ({ ...p, businessStage: bs.id }))} className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${state.businessStage === bs.id ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>{bs.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "model":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 2: Revenue Engine" subtitle="How your business makes money and acquires customers" />
            <div>
              <SectionTitle>How do you primarily make money today?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {revenueSources.map(rs => <Toggle key={rs.id} label={rs.label} icon={rs.icon} selected={state.revenueSources.includes(rs.id)} onToggle={() => toggle("revenueSources", rs.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle hint="This helps SITA understand the pre-sale journey">What do customers do before they buy?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {preBuyOptions.map(pb => <Toggle key={pb.id} label={pb.label} icon={pb.icon} selected={state.preBuyBehavior.includes(pb.id)} onToggle={() => toggle("preBuyBehavior", pb.id)} />)}
              </div>
            </div>
          </div>
        );

      case "revenue":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <DollarSign className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Map your revenue engine</h2>
              <p className="text-sm text-muted-foreground mt-1">Where leads come from, how they convert, and what closes the deal</p>
            </div>
            <div>
              <SectionTitle>Where does most business come from today?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {leadSourceOptions.map(ls => <Toggle key={ls.id} label={ls.label} icon={ls.icon} selected={state.leadSources.includes(ls.id)} onToggle={() => toggle("leadSources", ls.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>What usually happens next?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {whatHappensOptions.map(wh => <Toggle key={wh.id} label={wh.label} icon={wh.icon} selected={state.whatHappensNext.includes(wh.id)} onToggle={() => toggle("whatHappensNext", wh.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>What usually closes the sale?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {whatClosesOptions.map(wc => <Toggle key={wc.id} label={wc.label} icon={wc.icon} selected={state.whatCloses.includes(wc.id)} onToggle={() => toggle("whatCloses", wc.id)} />)}
              </div>
            </div>
          </div>
        );

      case "journey":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <Target className="h-7 w-7 text-blue-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Sketch your customer journey</h2>
              <p className="text-sm text-muted-foreground mt-1">SITA will build a Customer Journey Twin from this pattern</p>
            </div>
            <div className="space-y-2">
              {journeyTemplates.map(jt => (
                <button key={jt.id} onClick={() => setState(p => ({ ...p, journeyTemplate: jt.id }))} className={`w-full p-4 rounded-xl border text-left transition-all ${state.journeyTemplate === jt.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${state.journeyTemplate === jt.id ? "bg-primary/20" : "bg-muted"}`}><jt.icon className={`h-4 w-4 ${state.journeyTemplate === jt.id ? "text-primary" : "text-muted-foreground"}`} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{jt.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{jt.flow}</p>
                    </div>
                    {state.journeyTemplate === jt.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
            {state.journeyTemplate && state.journeyTemplate !== "custom" && (
              <>
                {/* Visual Journey Twin Preview */}
                <Card className="bg-card/60 border-primary/15 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">Journey Twin Preview</p></div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                      {(journeyTemplates.find(j => j.id === state.journeyTemplate)?.flow || "").split(" → ").map((step, i, arr) => (
                        <div key={i} className="flex items-center gap-1 flex-shrink-0">
                          <div className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary whitespace-nowrap">{step}</div>
                          {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div>
                  <SectionTitle hint="These help SITA detect leakage points">Where do people usually get stuck or drop off?</SectionTitle>
                  <div className="grid md:grid-cols-2 gap-2">
                    {journeyPainOptions.map(jp => <Toggle key={jp.id} label={jp.label} icon={jp.icon} selected={state.journeyPainPoints.includes(jp.id)} onToggle={() => toggle("journeyPainPoints", jp.id)} />)}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "delivery":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 3: Delivery Model" subtitle="What happens after someone buys — the most neglected part of growth" />
            <div>
              <SectionTitle>What happens after someone buys?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {postSaleOptions.map(ps => <Toggle key={ps.id} label={ps.label} icon={ps.icon} selected={state.postSaleSteps.includes(ps.id)} onToggle={() => toggle("postSaleSteps", ps.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle hint="SITA will build automations to fix these">What tends to slip after the sale?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {postSaleSlipOptions.map(sl => <Toggle key={sl.id} label={sl.label} icon={sl.icon} selected={state.postSaleSlips.includes(sl.id)} onToggle={() => toggle("postSaleSlips", sl.id)} />)}
              </div>
            </div>
          </div>
        );

      case "bottlenecks":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <Flame className="h-7 w-7 text-amber-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Where does growth break down?</h2>
              <p className="text-sm text-muted-foreground mt-1">Be honest — this is where SITA can make the biggest impact fastest</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {bottleneckOptions.map(bn => <Toggle key={bn.id} label={bn.label} desc={bn.desc} icon={bn.icon} selected={state.growthBottlenecks.includes(bn.id)} onToggle={() => toggle("growthBottlenecks", bn.id)} />)}
            </div>
            {state.growthBottlenecks.length > 0 && (
              <Card className="bg-amber-500/5 border-amber-500/15">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground font-medium">SITA will prioritize these in your Revenue Office</p>
                      <p className="text-xs text-muted-foreground mt-1">{state.growthBottlenecks.length} bottleneck{state.growthBottlenecks.length !== 1 ? "s" : ""} identified — leak detection, advisor recommendations, and first-win suggestions will focus here.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 4: Operations" subtitle="Who runs what — powers delegation, routing, and approvals" />
            <div className="space-y-2.5">
              {teamRoles.map(tr => (
                <div key={tr.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                  <span className="text-xs font-medium text-foreground w-40">{tr.label}</span>
                  <select value={state.teamRoles[tr.id] || "me"} onChange={e => setState(p => ({ ...p, teamRoles: { ...p.teamRoles, [tr.id]: e.target.value } }))} className="flex-1 p-2 rounded-lg bg-background border border-border/50 text-sm text-foreground">
                    <option value="me">Me / founder</option>
                    <option value="team_member">Team member</option>
                    <option value="shared">Shared responsibility</option>
                    <option value="outsourced">Outsourced / contractor</option>
                    <option value="nobody">Nobody yet</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={state.needsApprovals} onChange={e => setState(p => ({ ...p, needsApprovals: e.target.checked }))} className="accent-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">We need approvals for pricing, campaigns, discounts, or automations</p>
                  <p className="text-[10px] text-muted-foreground">Enables Decision Theater and approval workflows in Revenue Office</p>
                </div>
              </label>
            </div>
          </div>
        );

      case "systems":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <Link2 className="h-7 w-7 text-blue-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Bring in your existing world</h2>
              <p className="text-sm text-muted-foreground mt-1">Connect live systems and import data — SITA adapts instead of replacing</p>
            </div>
            <div>
              <SectionTitle hint="Select all systems you currently use">Connect live systems</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {systemOptions.map(so => <Toggle key={so.id} label={so.label} icon={so.icon} selected={state.connectedSystems.includes(so.id)} onToggle={() => toggle("connectedSystems", so.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>Import files</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {["Contacts CSV", "Leads CSV", "Products CSV", "Bookings export", "Proposals / quotes", "Pipeline spreadsheet", "Customer lists", "Reviews export", "Transaction records", "Campaign exports"].map(f => (
                  <button key={f} onClick={() => toggle("importedFiles", f)} className={`p-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${state.importedFiles.includes(f) ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>
                    <Upload className="h-3 w-3" />{f}
                    {state.importedFiles.includes(f) && <Check className="h-3 w-3 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle hint="SITA can inspect these to understand your business structure">Paste URLs</SectionTitle>
              <div className="space-y-2">
                {["Website URL", "Booking link", "Sales or landing page", "Social profile"].map((placeholder, i) => (
                  <input key={i} type="url" placeholder={placeholder} className="w-full p-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none" />
                ))}
              </div>
            </div>
          </div>
        );

      case "artifacts":
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <FileText className="h-7 w-7 text-purple-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Upload your business materials</h2>
              <p className="text-sm text-muted-foreground mt-1">SITA uses these to understand your service model, pricing, onboarding, and offers — and to generate intelligent automations</p>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {artifactOptions.map(a => <Toggle key={a.id} label={a.label} icon={a.icon} selected={state.uploadedArtifacts.includes(a.id)} onToggle={() => toggle("uploadedArtifacts", a.id)} />)}
            </div>
            {state.uploadedArtifacts.length > 0 && (
              <Card className="bg-primary/5 border-primary/15">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground font-medium">SITA will analyze {state.uploadedArtifacts.length} material{state.uploadedArtifacts.length !== 1 ? "s" : ""}</p>
                      <div className="mt-2 space-y-1">
                        {state.uploadedArtifacts.includes("proposal_templates") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll detect your proposal structure for Quote Studio</p>}
                        {state.uploadedArtifacts.includes("price_sheets") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll map pricing logic for automated quoting</p>}
                        {state.uploadedArtifacts.includes("email_sequences") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll import flow patterns for Campaign Builder</p>}
                        {state.uploadedArtifacts.includes("call_scripts") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll use these for Call Desk prep briefs</p>}
                        {state.uploadedArtifacts.includes("onboarding_docs") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll detect onboarding steps for automation</p>}
                        {state.uploadedArtifacts.includes("sops") && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> We'll identify automatable process steps</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "automation":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 5: Trust & Automation" subtitle="Control how much SITA does — you can always adjust later" />
            <div>
              <SectionTitle>How much should SITA do automatically?</SectionTitle>
              <div className="space-y-2">
                {automationLevels.map(al => (
                  <button key={al.id} onClick={() => setState(p => ({ ...p, automationLevel: al.id }))} className={`w-full p-4 rounded-xl border text-left transition-all ${state.automationLevel === al.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${state.automationLevel === al.id ? "bg-primary/20" : "bg-muted"}`}><al.icon className={`h-4 w-4 ${state.automationLevel === al.id ? "text-primary" : "text-muted-foreground"}`} /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{al.label}</p>
                          <div className="flex gap-0.5">{Array.from({ length: al.trust }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />)}{Array.from({ length: 4 - al.trust }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted" />)}</div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{al.desc}</p>
                      </div>
                      {state.automationLevel === al.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>What should always remain human?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {humanOnlyOptions.map(ho => <Toggle key={ho.id} label={ho.label} icon={ho.icon} selected={state.humanOnlyTasks.includes(ho.id)} onToggle={() => toggle("humanOnlyTasks", ho.id)} />)}
              </div>
            </div>
          </div>
        );

      case "firstwin":
        return (
          <div className="space-y-6">
            <ChapterTransitionCard chapter="Chapter 6: Launch" subtitle="Choose what SITA should do for you right now" />
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Your first wins</h2>
              <p className="text-sm text-muted-foreground mt-1">Select up to 3 — SITA will start working on these immediately</p>
            </div>
            <div className="space-y-2">
              {firstWinOptions.map(fw => (
                <button key={fw.id} onClick={() => {
                  setState(p => {
                    const arr = p.selectedFirstWins;
                    if (arr.includes(fw.id)) return { ...p, selectedFirstWins: arr.filter(v => v !== fw.id) };
                    if (arr.length >= 3) return p;
                    return { ...p, selectedFirstWins: [...arr, fw.id] };
                  });
                }} className={`w-full p-4 rounded-xl border text-left transition-all ${state.selectedFirstWins.includes(fw.id) ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${state.selectedFirstWins.includes(fw.id) ? "bg-primary/20" : "bg-muted"}`}><fw.icon className={`h-4 w-4 ${state.selectedFirstWins.includes(fw.id) ? "text-primary" : "text-muted-foreground"}`} /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{fw.label}</p>
                        {fw.relevant && <Badge className="bg-amber-500/10 text-amber-400 text-[8px]">Recommended</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fw.desc}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{fw.impact}</Badge>
                    {state.selectedFirstWins.includes(fw.id) && <Check className="h-4 w-4 text-primary ml-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "reveal":
        return (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center mb-6">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}>
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">Your Revenue Office is ready</h2>
              <p className="text-sm text-muted-foreground mt-2">SITA has built a personalized commercial command center around your business model</p>
            </motion.div>

            {/* Business Twin Summary */}
            <Card className="bg-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /><p className="text-sm font-semibold text-foreground">Business Twin: {state.businessName || "Your Business"}</p></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div><p className="text-muted-foreground mb-1">Type</p><p className="font-medium text-foreground">{state.businessTypes.map(bt => businessTypes.find(b => b.id === bt)?.label).join(", ") || "—"}</p></div>
                  <div><p className="text-muted-foreground mb-1">Revenue Model</p><p className="font-medium text-foreground">{state.revenueSources.map(rs => revenueSources.find(r => r.id === rs)?.label).slice(0, 2).join(", ") || "—"}</p></div>
                  <div><p className="text-muted-foreground mb-1">Journey</p><p className="font-medium text-foreground">{journeyTemplates.find(j => j.id === state.journeyTemplate)?.label || "—"}</p></div>
                  <div><p className="text-muted-foreground mb-1">Team</p><p className="font-medium text-foreground">{state.teamSize === "solo" ? "Solo" : state.teamSize === "small" ? "Small team" : state.teamSize === "growing" ? "Growing" : "Multi-location"}</p></div>
                  <div><p className="text-muted-foreground mb-1">Trust Level</p><p className="font-medium text-foreground">{automationLevels.find(a => a.id === state.automationLevel)?.label || "—"}</p></div>
                  <div><p className="text-muted-foreground mb-1">Bottlenecks</p><p className="font-medium text-foreground">{state.growthBottlenecks.length} identified</p></div>
                </div>
              </CardContent>
            </Card>

            {/* Journey Twin */}
            {state.journeyTemplate && state.journeyTemplate !== "custom" && (
              <Card className="bg-card/60 border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-blue-400" /><p className="text-xs font-semibold text-foreground">Customer Journey Twin</p></div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
                    {(journeyTemplates.find(j => j.id === state.journeyTemplate)?.flow || "").split(" → ").map((step, i, arr) => (
                      <div key={i} className="flex items-center gap-1 flex-shrink-0">
                        <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-medium text-blue-400 whitespace-nowrap">{step}</div>
                        {i < arr.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40" />}
                      </div>
                    ))}
                  </div>
                  {state.journeyPainPoints.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <p className="text-[10px] text-amber-400">{state.journeyPainPoints.length} drop-off point{state.journeyPainPoints.length !== 1 ? "s" : ""} flagged for leak detection</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Office Modules Ready */}
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { label: "Revenue Boardroom", desc: "Executive overview for your model", icon: BarChart3 },
                { label: "Customer Journey Twin", desc: "Live journey map with leak detection", icon: Target },
                { label: "Revenue Leakage Map", desc: `${state.growthBottlenecks.length} bottlenecks calibrated`, icon: Search },
                { label: "Growth Advisor Board", desc: "Advisors matched to your business type", icon: Brain },
                { label: "Automation Office", desc: `${automationLevels.find(a => a.id === state.automationLevel)?.label} trust level`, icon: Zap },
                { label: "Quote Studio", desc: state.revenueSources.includes("proposals") ? "Proposal-ready" : "Available when needed", icon: FileText },
                { label: "Call Desk", desc: state.revenueSources.includes("appointments") ? "Call-centric mode active" : "Available", icon: Phone },
                { label: "Opportunity Engine", desc: "Growth ranked by impact and effort", icon: TrendingUp },
              ].map(item => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-card/50 border border-border/50 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><item.icon className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{item.label}</p><p className="text-[9px] text-muted-foreground truncate">{item.desc}</p></div>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* First Wins */}
            {state.selectedFirstWins.length > 0 && (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3"><Rocket className="h-4 w-4 text-emerald-400" /><p className="text-xs font-semibold text-foreground">First Wins — Starting Now</p></div>
                  <div className="space-y-2">
                    {state.selectedFirstWins.map(fwId => {
                      const fw = firstWinOptions.find(f => f.id === fwId);
                      if (!fw) return null;
                      return (
                        <div key={fwId} className="flex items-center gap-2">
                          <fw.icon className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs text-foreground flex-1">{fw.label}</span>
                          <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px]">{fw.impact}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <button onClick={() => navigate("/revenue-office/boardroom")} className="w-full p-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              Enter Your Revenue Office <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Chapter transition overlay */}
      <AnimatePresence>
        {showChapterTransition && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}>
              <p className="text-2xl font-bold text-foreground">{stages[Math.min(stage + 1, stages.length - 1)]?.chapter}</p>
              <div className="flex justify-center mt-3"><Waves className="h-5 w-5 text-primary animate-pulse" /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top progress rail */}
      {stage > 0 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/30 px-6 py-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary text-[9px]">{currentChapter}</Badge>
                <p className="text-[10px] text-muted-foreground">Step {stage} of {stages.length - 1}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{Math.round(pct)}% complete</p>
            </div>
            <Progress value={pct} className="h-1.5 mb-2" />
            <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
              {stages.slice(1).map((s, i) => (
                <button key={s.id} onClick={() => setStage(i + 1)} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${i + 1 === stage ? "bg-primary/10 text-primary" : i + 1 < stage ? "text-emerald-400" : "text-muted-foreground/50 hover:text-muted-foreground"}`}>
                  {i + 1 < stage ? <Check className="h-2.5 w-2.5" /> : <s.icon className="h-2.5 w-2.5" />}
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content + Sidebar */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={stages[stage].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {renderStage()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {stage > 0 && stages[stage].id !== "reveal" && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
              <button onClick={back} className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
              <button onClick={next} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
                {stage === stages.length - 2 ? "Build My Revenue Office" : "Continue"}<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Live Intelligence Sidebar */}
        <LiveOfficeSidebar state={state} stage={stage} />
      </div>
    </div>
  );
}

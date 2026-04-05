import { useState, useCallback, useMemo } from "react";
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
  PenTool, Rocket, Eye, Lock, AlertTriangle, Settings, Workflow, Layout,
  ChevronRight, Award, Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Types ──────────────────────────────────────────────────────
interface OnboardingState {
  businessName: string;
  businessTypes: string[];
  teamSize: string;
  revenueSources: string[];
  preBuyBehavior: string[];
  leadSources: string[];
  whatHappensNext: string[];
  whatCloses: string[];
  journeyTemplate: string;
  journeyCustomizations: string[];
  postSaleSteps: string[];
  postSaleSlips: string[];
  teamRoles: Record<string, string>;
  needsApprovals: boolean;
  connectedSystems: string[];
  importedFiles: string[];
  uploadedArtifacts: string[];
  pastedUrls: string[];
  automationLevel: string;
  humanOnlyTasks: string[];
  selectedFirstWin: string;
}

const defaultState: OnboardingState = {
  businessName: "", businessTypes: [], teamSize: "solo", revenueSources: [],
  preBuyBehavior: [], leadSources: [], whatHappensNext: [], whatCloses: [],
  journeyTemplate: "", journeyCustomizations: [], postSaleSteps: [],
  postSaleSlips: [], teamRoles: {}, needsApprovals: false, connectedSystems: [],
  importedFiles: [], uploadedArtifacts: [], pastedUrls: [],
  automationLevel: "draft_review", humanOnlyTasks: [], selectedFirstWin: "",
};

// ─── Stage definitions ──────────────────────────────────────────
const stages = [
  { id: "identity", label: "Business Identity", icon: Building2 },
  { id: "model", label: "Business Model", icon: Briefcase },
  { id: "revenue", label: "Revenue Engine", icon: DollarSign },
  { id: "journey", label: "Customer Journey", icon: Target },
  { id: "delivery", label: "Delivery & Retention", icon: Package },
  { id: "team", label: "Team & Roles", icon: Users },
  { id: "systems", label: "Existing Systems", icon: Link2 },
  { id: "automation", label: "Automation & Trust", icon: Shield },
  { id: "firstwin", label: "First Win", icon: Rocket },
  { id: "reveal", label: "Revenue Office", icon: Layout },
];

// ─── Helpers ────────────────────────────────────────────────────
function Toggle({ label, desc, icon: Icon, selected, onToggle }: { label: string; desc?: string; icon: any; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`p-4 rounded-xl border text-left transition-all ${selected ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${selected ? "bg-primary/20" : "bg-muted"}`}><Icon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted-foreground"}`} /></div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${selected ? "text-foreground" : "text-foreground/80"}`}>{label}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        {selected && <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />}
      </div>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-foreground mb-3">{children}</p>;
}

// ─── Component ──────────────────────────────────────────────────
export default function BusinessOnboarding() {
  const [stage, setStage] = useState(0);
  const [state, setState] = useState<OnboardingState>(defaultState);
  const navigate = useNavigate();
  const pct = ((stage + 1) / stages.length) * 100;

  const toggle = useCallback((field: keyof OnboardingState, value: string) => {
    setState(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }, []);

  const next = () => setStage(s => Math.min(s + 1, stages.length - 1));
  const back = () => setStage(s => Math.max(s - 1, 0));

  // ─── Business type options ────────────────────────────────────
  const businessTypes = [
    { id: "service", label: "Service Business", desc: "Appointments, proposals, delivery milestones, reviews", icon: Briefcase },
    { id: "agency", label: "Agency", desc: "Multi-client, retainers, reporting, white-label", icon: Users },
    { id: "coaching", label: "Coach / Consultant", desc: "Personal brand, bookings, packages, memberships", icon: GraduationCap },
    { id: "creator", label: "Creator / Education", desc: "Products, courses, memberships, launches, content funnels", icon: PenTool },
    { id: "ecommerce", label: "Online Store", desc: "Products, carts, checkout, fulfillment, repeat purchase", icon: ShoppingCart },
    { id: "local", label: "Local / Brick & Mortar", desc: "Visits, bookings, reputation, local campaigns", icon: MapPin },
    { id: "membership", label: "Membership Business", desc: "Subscriptions, access tiers, renewal, retention", icon: Heart },
    { id: "hybrid", label: "Hybrid Model", desc: "Multiple revenue streams, mixed delivery", icon: Layers },
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
    { id: "custom", label: "Custom Journey", flow: "Build your own from scratch", icon: Layers },
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

  const automationLevels = [
    { id: "suggest", label: "Suggestions only", desc: "SITA observes and recommends — you decide and act", icon: Eye },
    { id: "draft_review", label: "Draft for review", desc: "SITA drafts emails, quotes, workflows — you approve before sending", icon: FileText },
    { id: "auto_rules", label: "Safe automations under rules", desc: "SITA executes routine actions within your policy boundaries", icon: CheckCircle },
    { id: "broad_auto", label: "Broader automation with approvals", desc: "SITA runs the commercial engine, pauses for high-impact decisions", icon: Zap },
  ];

  const humanOnlyOptions = [
    { id: "pricing", label: "Pricing changes", icon: DollarSign },
    { id: "proposals", label: "Proposal sending", icon: FileText },
    { id: "highvalue", label: "High-value lead contact", icon: Star },
    { id: "negative_reviews", label: "Negative review responses", icon: AlertTriangle },
    { id: "churn", label: "Churn rescue", icon: Heart },
    { id: "vip", label: "VIP client follow-up", icon: Award },
  ];

  const firstWinOptions = useMemo(() => {
    const wins = [
      { id: "stale_leads", label: "Recover stale leads", desc: "Find and re-engage leads that went quiet — estimated 23 recoverable now", icon: Users, impact: "$8,200 at risk" },
      { id: "journey_twin", label: "Build your Customer Journey Twin", desc: "Create a live model of how customers move through your business", icon: Target, impact: "Visual clarity" },
      { id: "quote_automation", label: "Create first quote automation", desc: "Auto-generate and follow up on proposals from CRM data", icon: FileText, impact: "$4,800/mo recovered" },
      { id: "import_contacts", label: "Import & organize contacts", desc: "Bring in your existing contacts and create a unified CRM", icon: Upload, impact: "Foundation" },
      { id: "leak_detection", label: "Identify biggest revenue leak", desc: "Scan your journey for the #1 place money is being lost", icon: Search, impact: "$15K/mo potential" },
      { id: "noshow_rescue", label: "Build no-show recovery flow", desc: "Automatically rescue missed appointments with SMS + rebook", icon: Phone, impact: "+22% show rate" },
      { id: "review_workflow", label: "Create review request workflow", desc: "Ask happy clients for reviews at the perfect moment", icon: Star, impact: "+12 reviews/mo" },
      { id: "upsell", label: "Surface upsell opportunities", desc: "Find clients ready for additional services based on patterns", icon: TrendingUp, impact: "$5,600/mo" },
    ];
    return wins;
  }, []);

  // ─── Render stages ────────────────────────────────────────────
  const renderStage = () => {
    switch (stages[stage].id) {
      case "identity":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground">Let's shape your business office</h2>
              <p className="text-sm text-muted-foreground mt-1">Tell SITA about your business so the Revenue Office can adapt to how you actually work</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">What is your business called?</label>
              <input type="text" value={state.businessName} onChange={e => setState(p => ({ ...p, businessName: e.target.value }))} placeholder="Your business name" className="w-full p-3 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none" />
            </div>
            <div>
              <SectionTitle>What best describes what you do? <span className="text-[10px] text-muted-foreground font-normal">(choose all that apply)</span></SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {businessTypes.map(bt => <Toggle key={bt.id} label={bt.label} desc={bt.desc} icon={bt.icon} selected={state.businessTypes.includes(bt.id)} onToggle={() => toggle("businessTypes", bt.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>Team size</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: "solo", label: "Solo / founder" }, { id: "small", label: "Small team (2-10)" }, { id: "growing", label: "Growing team (10+)" }].map(ts => (
                  <button key={ts.id} onClick={() => setState(p => ({ ...p, teamSize: ts.id }))} className={`p-3 rounded-xl border text-sm font-medium transition-all ${state.teamSize === ts.id ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>{ts.label}</button>
                ))}
              </div>
            </div>
          </div>
        );

      case "model":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="h-7 w-7 text-primary mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">How does your business make money?</h2>
              <p className="text-sm text-muted-foreground mt-1">Understanding your revenue model helps SITA build the right growth engine</p>
            </div>
            <div>
              <SectionTitle>How do you primarily make money today?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {revenueSources.map(rs => <Toggle key={rs.id} label={rs.label} icon={rs.icon} selected={state.revenueSources.includes(rs.id)} onToggle={() => toggle("revenueSources", rs.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>What do customers do before they buy?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {preBuyOptions.map(pb => <Toggle key={pb.id} label={pb.label} icon={pb.icon} selected={state.preBuyBehavior.includes(pb.id)} onToggle={() => toggle("preBuyBehavior", pb.id)} />)}
              </div>
            </div>
          </div>
        );

      case "revenue":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Map your revenue engine</h2>
              <p className="text-sm text-muted-foreground mt-1">Where leads come from, how they convert, and what closes the sale</p>
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
            <div className="text-center mb-6">
              <Target className="h-7 w-7 text-blue-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Sketch your customer journey</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a pattern that matches how customers move through your business — you can customize later</p>
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
              <Card className="bg-primary/5 border-primary/15">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground font-medium">SITA will build your Customer Journey Twin based on this pattern.</p>
                      <p className="text-xs text-muted-foreground mt-1">You'll be able to customize stages, add steps, and see where customers get stuck — all inside the Revenue Office.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "delivery":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="h-7 w-7 text-purple-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">After someone buys…</h2>
              <p className="text-sm text-muted-foreground mt-1">Understanding your delivery and retention model powers onboarding automations and churn prevention</p>
            </div>
            <div>
              <SectionTitle>What happens after someone buys?</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {postSaleOptions.map(ps => <Toggle key={ps.id} label={ps.label} icon={ps.icon} selected={state.postSaleSteps.includes(ps.id)} onToggle={() => toggle("postSaleSteps", ps.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>What tends to slip after the sale?</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {postSaleSlipOptions.map(sl => <Toggle key={sl.id} label={sl.label} icon={sl.icon} selected={state.postSaleSlips.includes(sl.id)} onToggle={() => toggle("postSaleSlips", sl.id)} />)}
              </div>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="h-7 w-7 text-blue-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Who helps run the business?</h2>
              <p className="text-sm text-muted-foreground mt-1">This powers delegation, owner assignment, and approval routing</p>
            </div>
            <div className="space-y-3">
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
            <div className="text-center mb-6">
              <Link2 className="h-7 w-7 text-amber-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Bring in what you already use</h2>
              <p className="text-sm text-muted-foreground mt-1">Connect live systems, import files, or upload business materials — SITA adapts to your existing world</p>
            </div>
            <div>
              <SectionTitle>Connect live systems</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {systemOptions.map(so => <Toggle key={so.id} label={so.label} icon={so.icon} selected={state.connectedSystems.includes(so.id)} onToggle={() => toggle("connectedSystems", so.id)} />)}
              </div>
            </div>
            <div>
              <SectionTitle>Import files</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {["Contacts CSV", "Leads CSV", "Products CSV", "Bookings export", "Proposals / quotes", "Pipeline spreadsheet", "Customer lists", "Reviews export", "Transaction records"].map(f => (
                  <button key={f} onClick={() => toggle("importedFiles", f)} className={`p-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${state.importedFiles.includes(f) ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>
                    <Upload className="h-3 w-3" />{f}
                    {state.importedFiles.includes(f) && <Check className="h-3 w-3 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>Upload business materials</SectionTitle>
              <div className="grid md:grid-cols-3 gap-2">
                {["Price sheets", "Service guides", "Offer decks", "Proposal templates", "Onboarding docs", "SOPs", "Intake forms", "Call scripts", "FAQ docs", "Sales pages", "Email sequences", "Contracts"].map(a => (
                  <button key={a} onClick={() => toggle("uploadedArtifacts", a)} className={`p-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${state.uploadedArtifacts.includes(a) ? "bg-primary/10 border-primary/40 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"}`}>
                    <FileText className="h-3 w-3" />{a}
                    {state.uploadedArtifacts.includes(a) && <Check className="h-3 w-3 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>Paste URLs for SITA to inspect</SectionTitle>
              <div className="space-y-2">
                {["Website URL", "Booking link", "Sales page", "Social profile"].map((placeholder, i) => (
                  <input key={i} type="url" placeholder={placeholder} className="w-full p-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/30 focus:border-primary/30 outline-none" />
                ))}
              </div>
            </div>
          </div>
        );

      case "automation":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-7 w-7 text-emerald-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Set your automation boundaries</h2>
              <p className="text-sm text-muted-foreground mt-1">Control how much SITA does automatically — you can always adjust later</p>
            </div>
            <div>
              <SectionTitle>How much should SITA do automatically?</SectionTitle>
              <div className="space-y-2">
                {automationLevels.map(al => (
                  <button key={al.id} onClick={() => setState(p => ({ ...p, automationLevel: al.id }))} className={`w-full p-4 rounded-xl border text-left transition-all ${state.automationLevel === al.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${state.automationLevel === al.id ? "bg-primary/20" : "bg-muted"}`}><al.icon className={`h-4 w-4 ${state.automationLevel === al.id ? "text-primary" : "text-muted-foreground"}`} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{al.label}</p>
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
            <div className="text-center mb-6">
              <Rocket className="h-7 w-7 text-amber-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-foreground">Your first win</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose what SITA should create for you right now — immediate value from day one</p>
            </div>
            <div className="space-y-2">
              {firstWinOptions.map(fw => (
                <button key={fw.id} onClick={() => setState(p => ({ ...p, selectedFirstWin: fw.id }))} className={`w-full p-4 rounded-xl border text-left transition-all ${state.selectedFirstWin === fw.id ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20" : "bg-card/50 border-border/50 hover:border-primary/20"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${state.selectedFirstWin === fw.id ? "bg-primary/20" : "bg-muted"}`}><fw.icon className={`h-4 w-4 ${state.selectedFirstWin === fw.id ? "text-primary" : "text-muted-foreground"}`} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{fw.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fw.desc}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{fw.impact}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "reveal":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground">Your Revenue Office is ready</h2>
                <p className="text-sm text-muted-foreground mt-2">SITA has built a personalized commercial command center based on your business model</p>
              </motion.div>
            </div>

            {/* Business Twin Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3"><Brain className="h-4 w-4 text-primary" /><p className="text-sm font-semibold text-foreground">Business Twin Summary</p></div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Business</p>
                    <p className="font-medium text-foreground">{state.businessName || "Your Business"}</p>
                    <p className="text-muted-foreground mt-0.5">{state.businessTypes.map(bt => businessTypes.find(b => b.id === bt)?.label).join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Revenue Model</p>
                    <p className="font-medium text-foreground">{state.revenueSources.map(rs => revenueSources.find(r => r.id === rs)?.label).slice(0, 3).join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Journey Pattern</p>
                    <p className="font-medium text-foreground">{journeyTemplates.find(j => j.id === state.journeyTemplate)?.label || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Team</p>
                    <p className="font-medium text-foreground">{state.teamSize === "solo" ? "Solo / founder" : state.teamSize === "small" ? "Small team" : "Growing team"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Automation Level</p>
                    <p className="font-medium text-foreground">{automationLevels.find(a => a.id === state.automationLevel)?.label || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Connected Systems</p>
                    <p className="font-medium text-foreground">{state.connectedSystems.length || 0} systems</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's ready */}
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Revenue Boardroom", desc: "Executive overview tailored to your revenue model", icon: BarChart3 },
                { label: "Customer Journey Twin", desc: `${journeyTemplates.find(j => j.id === state.journeyTemplate)?.label || "Custom"} journey mapped`, icon: Target },
                { label: "Revenue Leakage Map", desc: "Leak detection calibrated to your post-sale gaps", icon: Search },
                { label: "Growth Advisor Board", desc: "Advisors configured for your business type", icon: Brain },
                { label: "Automation Office", desc: `Trust level: ${automationLevels.find(a => a.id === state.automationLevel)?.label}`, icon: Zap },
                { label: "Opportunity Board", desc: "Growth opportunities ranked for your model", icon: TrendingUp },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-card/50 border border-border/50 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></div>
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.desc}</p></div>
                  <CheckCircle className="h-4 w-4 text-emerald-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* First Win */}
            {state.selectedFirstWin && (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">First Win: {firstWinOptions.find(f => f.id === state.selectedFirstWin)?.label}</p>
                    <p className="text-xs text-muted-foreground">{firstWinOptions.find(f => f.id === state.selectedFirstWin)?.desc}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{firstWinOptions.find(f => f.id === state.selectedFirstWin)?.impact}</Badge>
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
      {/* Top progress rail */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/30 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Stage {stage + 1} of {stages.length}</p>
            <p className="text-xs text-muted-foreground">{Math.round(pct)}% complete</p>
          </div>
          <Progress value={pct} className="h-1.5 mb-2" />
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {stages.map((s, i) => (
              <button key={s.id} onClick={() => setStage(i)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${i === stage ? "bg-primary/10 text-primary" : i < stage ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}>
                {i < stage ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={stages[stage].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {renderStage()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {stages[stage].id !== "reveal" && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
            <button onClick={back} disabled={stage === 0} className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-30 hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
            <button onClick={() => { if (stage === stages.length - 2) { next(); } else { next(); } }} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors">
              {stage === stages.length - 2 ? "Build My Revenue Office" : "Continue"}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

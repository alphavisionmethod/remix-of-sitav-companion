import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe, Palette, Target, Layout, Store, Eye, Megaphone,
  Settings, Search, Wrench, Users, ArrowRight, ArrowLeft,
  CheckCircle, Upload, Link, Sparkles, Shield, Zap,
  Monitor, Smartphone, ShoppingCart, Calendar, Download,
  FileText, Image, Star, Building, Briefcase, MapPin,
  TrendingUp, Lock, Brain, Rocket, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const TOTAL_STEPS = 10;

type PresencePath = "new" | "connected" | "hybrid" | null;
type BusinessModel = string[];
type PagePriority = string[];
type ActionPriority = string[];
type Intensity = "quiet" | "balanced" | "proactive";
type AutonomyMode = "manual" | "draft_review" | "safe_auto" | "broader_auto";

interface OnboardingState {
  path: PresencePath;
  // New site
  siteGoals: string[];
  sitePurpose: string[];
  // Connected site
  platform: string;
  siteUrl: string;
  multiSite: boolean;
  connectionMode: string;
  // Brand
  hasLogo: boolean;
  brandFeel: string[];
  generateBrand: boolean;
  // Model
  businessModel: BusinessModel;
  pagePriorities: PagePriority;
  actionPriorities: ActionPriority;
  // Commerce
  sellsProducts: boolean;
  booksAppointments: boolean;
  usesPromotions: boolean;
  hasCheckout: boolean;
  // Agents
  agentIntensity: Intensity;
  // Trust
  autonomyMode: AutonomyMode;
  humanOnly: string[];
  // First win
  firstWin: string;
}

const DEFAULT_STATE: OnboardingState = {
  path: null,
  siteGoals: [],
  sitePurpose: [],
  platform: "",
  siteUrl: "",
  multiSite: false,
  connectionMode: "",
  hasLogo: false,
  brandFeel: [],
  generateBrand: false,
  businessModel: [],
  pagePriorities: [],
  actionPriorities: [],
  sellsProducts: false,
  booksAppointments: false,
  usesPromotions: false,
  hasCheckout: false,
  agentIntensity: "balanced",
  autonomyMode: "draft_review",
  humanOnly: [],
  firstWin: "",
};

function ToggleChip({ label, selected, onClick, icon: Icon }: { label: string; selected: boolean; onClick: () => void; icon?: any }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2
        ${selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/50 bg-card/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge variant="outline" className="text-[10px]">Step {step} of {TOTAL_STEPS}</Badge>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// Step 1: Path Selection
function Step1({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader step={1} title="Let's shape your digital presence" subtitle="Create something new, connect what you already have, or both" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {[
          { key: "new" as const, icon: Rocket, label: "Build New", desc: "Create a website, landing page, or digital presence from scratch inside SITA" },
          { key: "connected" as const, icon: Link, label: "Connect Existing", desc: "Link your current website and let SITA manage, optimize, and improve it" },
          { key: "hybrid" as const, icon: Globe, label: "Both", desc: "Connect existing sites and create new ones — manage everything from one place" },
        ].map(p => (
          <Card
            key={p.key}
            className={`cursor-pointer transition-all hover:border-primary/40 ${state.path === p.key ? "border-primary bg-primary/5" : "bg-card/50 border-border/50"}`}
            onClick={() => setState({ path: p.key })}
          >
            <CardContent className="p-6 text-center space-y-3">
              <p.icon className={`w-8 h-8 mx-auto ${state.path === p.key ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-semibold text-foreground">{p.label}</h3>
              <p className="text-[11px] text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Step 2A: New Site Goals
function Step2A({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const goals = [
    { label: "Main website", icon: Globe },
    { label: "Landing page", icon: Layout },
    { label: "Service site", icon: Briefcase },
    { label: "Online store", icon: ShoppingCart },
    { label: "Booking site", icon: Calendar },
    { label: "Launch page", icon: Rocket },
    { label: "Membership site", icon: Users },
    { label: "App-like portal", icon: Smartphone },
  ];
  const purposes = [
    { label: "Get leads", icon: Target },
    { label: "Book calls", icon: Calendar },
    { label: "Sell products", icon: ShoppingCart },
    { label: "Build trust", icon: Shield },
    { label: "Explain services", icon: FileText },
    { label: "Launch an offer", icon: Rocket },
  ];
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      <StepHeader step={2} title="What do you need first?" subtitle="Select all that apply — you can always add more later" />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Site Type</p>
        <div className="flex flex-wrap gap-2">
          {goals.map(g => <ToggleChip key={g.label} label={g.label} icon={g.icon} selected={state.siteGoals.includes(g.label)} onClick={() => setState({ siteGoals: toggle(state.siteGoals, g.label) })} />)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">What should it help do first?</p>
        <div className="flex flex-wrap gap-2">
          {purposes.map(p => <ToggleChip key={p.label} label={p.label} icon={p.icon} selected={state.sitePurpose.includes(p.label)} onClick={() => setState({ sitePurpose: toggle(state.sitePurpose, p.label) })} />)}
        </div>
      </div>
    </div>
  );
}

// Step 2B: Connected Site Intake
function Step2B({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const platforms = ["Shopify", "WordPress", "Webflow", "Wix", "Squarespace", "Custom / Other"];
  const modes = [
    { key: "monitor", label: "Monitor only", desc: "SITA watches and recommends" },
    { key: "recommend", label: "Recommend improvements", desc: "SITA suggests changes for you to apply" },
    { key: "prepare", label: "Prepare fixes", desc: "SITA drafts changes for your review" },
    { key: "auto", label: "Manage low-risk updates", desc: "SITA handles safe fixes automatically" },
  ];

  return (
    <div className="space-y-6">
      <StepHeader step={2} title="Tell SITA about your existing site" subtitle="Connect your platform so SITA can analyze and help manage it" />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Platform</p>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => <ToggleChip key={p} label={p} selected={state.platform === p} onClick={() => setState({ platform: p })} />)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Site URL</p>
        <Input placeholder="https://yourbusiness.com" value={state.siteUrl} onChange={e => setState({ siteUrl: e.target.value })} className="max-w-md" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">How should SITA help?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map(m => (
            <Card key={m.key} className={`cursor-pointer transition-all ${state.connectionMode === m.key ? "border-primary bg-primary/5" : "bg-card/30 border-border/50"}`} onClick={() => setState({ connectionMode: m.key })}>
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Brand Style Intake
function Step3({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const feels = ["Premium", "Modern", "Trustworthy", "Warm", "Bold", "Minimal", "Luxurious", "Playful"];
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      <StepHeader step={3} title="Your brand identity" subtitle="Upload existing assets or let SITA help create a brand direction" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
        <Card className={`cursor-pointer transition-all ${state.hasLogo ? "border-primary bg-primary/5" : "bg-card/30 border-border/50"}`} onClick={() => setState({ hasLogo: true })}>
          <CardContent className="p-4 text-center">
            <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs font-semibold">I have a logo / brand kit</p>
          </CardContent>
        </Card>
        <Card className={`cursor-pointer transition-all ${state.generateBrand ? "border-primary bg-primary/5" : "bg-card/30 border-border/50"}`} onClick={() => setState({ generateBrand: true, hasLogo: false })}>
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-xs font-semibold">Generate brand direction</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">What feel should the presence have?</p>
        <div className="flex flex-wrap gap-2">
          {feels.map(f => <ToggleChip key={f} label={f} selected={state.brandFeel.includes(f)} onClick={() => setState({ brandFeel: toggle(state.brandFeel, f) })} />)}
        </div>
      </div>
    </div>
  );
}

// Step 4: Digital Presence Model
function Step4({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const models = [
    { label: "Services", icon: Briefcase },
    { label: "Ecommerce", icon: ShoppingCart },
    { label: "Booking", icon: Calendar },
    { label: "Local traffic", icon: MapPin },
    { label: "Product launches", icon: Rocket },
    { label: "Memberships", icon: Users },
    { label: "Hybrid", icon: Globe },
  ];
  const pages = ["Homepage", "Services", "Products", "Pricing", "About", "Contact", "Blog", "FAQ", "Testimonials", "Booking", "Checkout", "Portfolio"];
  const actions = [
    { label: "Contact form", icon: FileText },
    { label: "Booking", icon: Calendar },
    { label: "Checkout", icon: ShoppingCart },
    { label: "Inquiry", icon: Target },
    { label: "Sign-up", icon: Users },
    { label: "Download", icon: Download },
  ];
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      <StepHeader step={4} title="Your digital presence model" subtitle="Help SITA understand what your site is for and what pages matter most" />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">This site is mostly for…</p>
        <div className="flex flex-wrap gap-2">
          {models.map(m => <ToggleChip key={m.label} label={m.label} icon={m.icon} selected={state.businessModel.includes(m.label)} onClick={() => setState({ businessModel: toggle(state.businessModel, m.label) })} />)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Most important pages</p>
        <div className="flex flex-wrap gap-2">
          {pages.map(p => <ToggleChip key={p} label={p} selected={state.pagePriorities.includes(p)} onClick={() => setState({ pagePriorities: toggle(state.pagePriorities, p) })} />)}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Most important actions</p>
        <div className="flex flex-wrap gap-2">
          {actions.map(a => <ToggleChip key={a.label} label={a.label} icon={a.icon} selected={state.actionPriorities.includes(a.label)} onClick={() => setState({ actionPriorities: toggle(state.actionPriorities, a.label) })} />)}
        </div>
      </div>
    </div>
  );
}

// Step 5: Connection Analysis (connected path)
function Step5({ state }: { state: OnboardingState }) {
  const isConnected = state.path === "connected" || state.path === "hybrid";
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <StepHeader step={5} title="Building your presence blueprint" subtitle="SITA is preparing your site structure based on your inputs" />
        <div className="max-w-md mx-auto space-y-3">
          {["Page hierarchy mapped", "Conversion model built", "CTA structure planned", "Mobile layout optimized", "Trust sections identified"].map((item, i) => (
            <motion.div key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepHeader step={5} title="Analyzing your site" subtitle={`SITA is scanning ${state.siteUrl || "your website"}…`} />
      <div className="max-w-md mx-auto space-y-3">
        {[
          { label: "Platform detected", value: state.platform || "Analyzing…", done: true },
          { label: "Pages found", value: "24 pages", done: true },
          { label: "Likely purpose", value: "Service + booking site", done: true },
          { label: "Obvious issues", value: "7 issues found", done: true },
          { label: "Opportunities", value: "5 quick wins", done: true },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs text-foreground">{item.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Step 6: Commerce Detection
function Step6({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader step={6} title="Commerce & booking" subtitle="Tell SITA about your transaction and booking model" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {[
          { key: "sellsProducts" as const, label: "I sell products online", icon: ShoppingCart },
          { key: "booksAppointments" as const, label: "I book calls / appointments", icon: Calendar },
          { key: "usesPromotions" as const, label: "I run promotions / offers", icon: Megaphone },
          { key: "hasCheckout" as const, label: "I have a cart / checkout", icon: Store },
        ].map(item => (
          <Card key={item.key} className={`cursor-pointer transition-all ${(state as never)[item.key] ? "border-primary bg-primary/5" : "bg-card/30 border-border/50"}`} onClick={() => setState({ [item.key]: !(state as never)[item.key] })}>
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${(state as never)[item.key] ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium text-foreground">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Step 7: Agent Team Activation
function Step7({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const agents = [
    { name: "Web Strategist", icon: Globe, color: "text-blue-400" },
    { name: "Design Director", icon: Palette, color: "text-purple-400" },
    { name: "Content Strategist", icon: Layout, color: "text-green-400" },
    { name: "CRO Advisor", icon: Target, color: "text-amber-400" },
    { name: "Technical QA", icon: Wrench, color: "text-red-400" },
    { name: "SEO / Discovery", icon: Search, color: "text-cyan-400" },
    { name: "Merchandising", icon: Store, color: "text-rose-400" },
    { name: "Promotions", icon: Megaphone, color: "text-orange-400" },
    { name: "Website Ops", icon: Settings, color: "text-slate-400" },
    { name: "App Experience", icon: Eye, color: "text-indigo-400" },
  ];

  return (
    <div className="space-y-6">
      <StepHeader step={7} title="Your AI Web Team" subtitle="These agents will watch, advise, and help maintain your digital presence" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
        {agents.map((a, i) => (
          <motion.div key={a.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <a.icon className={`w-5 h-5 mx-auto ${a.color} mb-1`} />
                <p className="text-[10px] font-medium text-foreground">{a.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="max-w-md mx-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 text-center">Team intensity</p>
        <div className="flex gap-2 justify-center">
          {(["quiet", "balanced", "proactive"] as Intensity[]).map(level => (
            <Button key={level} variant={state.agentIntensity === level ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setState({ agentIntensity: level })}>
              {level}
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          {state.agentIntensity === "quiet" ? "Agents observe silently and surface critical issues only" :
           state.agentIntensity === "balanced" ? "Agents actively monitor and surface recommendations regularly" :
           "Agents proactively suggest improvements and draft changes"}
        </p>
      </div>
    </div>
  );
}

// Step 8: Change Control / Trust
function Step8({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const modes: { key: AutonomyMode; label: string; desc: string }[] = [
    { key: "manual", label: "Manual only", desc: "Agents recommend — you apply everything" },
    { key: "draft_review", label: "Draft for review", desc: "Agents draft changes — you review and approve" },
    { key: "safe_auto", label: "Safe auto-maintenance", desc: "Low-risk fixes applied automatically, rest drafted" },
    { key: "broader_auto", label: "Broader optimization", desc: "Bounded autonomous work with approvals for big changes" },
  ];
  const humanItems = ["Homepage redesign", "Pricing changes", "Checkout changes", "Promo launches", "Product copy", "Legal/policy pages", "Brand changes"];
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      <StepHeader step={8} title="Trust & control boundaries" subtitle="Set how hands-on SITA should be with your digital presence" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
        {modes.map(m => (
          <Card key={m.key} className={`cursor-pointer transition-all ${state.autonomyMode === m.key ? "border-primary bg-primary/5" : "bg-card/30 border-border/50"}`} onClick={() => setState({ autonomyMode: m.key })}>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="max-w-lg mx-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">What must always stay human-reviewed?</p>
        <div className="flex flex-wrap gap-2">
          {humanItems.map(item => <ToggleChip key={item} label={item} icon={Lock} selected={state.humanOnly.includes(item)} onClick={() => setState({ humanOnly: toggle(state.humanOnly, item) })} />)}
        </div>
      </div>
    </div>
  );
}

// Step 9: First Win
function Step9({ state, setState }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void }) {
  const wins = [
    { key: "trust_gaps", label: "Fix trust gaps on homepage", icon: Shield },
    { key: "cart_recovery", label: "Launch cart recovery", icon: ShoppingCart },
    { key: "landing_page", label: "Build first landing page", icon: Layout },
    { key: "stale_refresh", label: "Refresh stale pages", icon: FileText },
    { key: "connect_promos", label: "Connect promotions to site", icon: Megaphone },
    { key: "brand_kit", label: "Create brand kit", icon: Palette },
    { key: "broken_flows", label: "Identify broken flows", icon: Wrench },
    { key: "booking_conversion", label: "Improve booking conversion", icon: Calendar },
    { key: "product_pages", label: "Upgrade product pages", icon: Store },
    { key: "launch_page", label: "Create launch page", icon: Rocket },
  ];

  return (
    <div className="space-y-6">
      <StepHeader step={9} title="Your first win" subtitle="Choose what SITA should tackle first in your Digital Presence Office" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
        {wins.map(w => (
          <Card key={w.key} className={`cursor-pointer transition-all ${state.firstWin === w.key ? "border-primary bg-primary/5" : "bg-card/30 border-border/50 hover:border-primary/30"}`} onClick={() => setState({ firstWin: w.key })}>
            <CardContent className="p-3 flex items-center gap-3">
              <w.icon className={`w-4 h-4 ${state.firstWin === w.key ? "text-primary" : "text-muted-foreground"} shrink-0`} />
              <span className="text-xs font-medium text-foreground">{w.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Step 10: Reveal
function Step10({ state }: { state: OnboardingState }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <StepHeader step={10} title="Your Digital Presence Office is ready" subtitle="SITA has built your workspace around your business and goals" />
      <div className="max-w-md mx-auto space-y-3">
        {[
          { icon: Globe, label: "Presence Boardroom", desc: "Health, traffic, conversions overview" },
          { icon: Monitor, label: "Website Twin", desc: "Live model of your digital presence" },
          { icon: Users, label: "AI Web Team", desc: `10 agents at ${state.agentIntensity} intensity` },
          { icon: AlertTriangle, label: "Issues detected", desc: "7 issues ready for review" },
          { icon: TrendingUp, label: "Opportunities found", desc: "5 quick wins identified" },
          { icon: Shield, label: "Trust posture", desc: `${state.autonomyMode === "manual" ? "Manual control" : state.autonomyMode === "draft_review" ? "Draft for review" : state.autonomyMode === "safe_auto" ? "Safe auto-maintenance" : "Broader optimization"}` },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              <item.icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center pt-4">
        <Button size="lg" onClick={() => navigate("/digital-presence")} className="gap-2">
          Enter Digital Presence Office <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function DPOOnboarding() {
  const [step, setStep] = useState(1);
  const [state, setOnboardingState] = useState<OnboardingState>(DEFAULT_STATE);

  const setState = (partial: Partial<OnboardingState>) => setOnboardingState(prev => ({ ...prev, ...partial }));

  const canProceed = () => {
    switch (step) {
      case 1: return !!state.path;
      case 2: return state.path === "connected" || state.path === "hybrid" ? !!state.platform && !!state.connectionMode : state.siteGoals.length > 0;
      default: return true;
    }
  };

  const getStep2 = () => {
    if (state.path === "connected") return <Step2B state={state} setState={setState} />;
    if (state.path === "hybrid") return <Step2B state={state} setState={setState} />;
    return <Step2A state={state} setState={setState} />;
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 state={state} setState={setState} />;
      case 2: return getStep2();
      case 3: return <Step3 state={state} setState={setState} />;
      case 4: return <Step4 state={state} setState={setState} />;
      case 5: return <Step5 state={state} />;
      case 6: return <Step6 state={state} setState={setState} />;
      case 7: return <Step7 state={state} setState={setState} />;
      case 8: return <Step8 state={state} setState={setState} />;
      case 9: return <Step9 state={state} setState={setState} />;
      case 10: return <Step10 state={state} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <h1 className="sr-only">Digital Presence Onboarding</h1>
      {/* Progress bar */}
      <div className="p-4 border-b border-border/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Digital Presence Formation</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      {step < 10 && (
        <div className="p-4 border-t border-border/30">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button size="sm" onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))} disabled={!canProceed()} className="gap-1">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

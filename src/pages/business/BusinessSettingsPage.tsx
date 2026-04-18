import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Settings, Building2, DollarSign, Target, Zap, Brain, Users, RefreshCw,
  Save, RotateCcw, Check, ChevronDown, ChevronUp, ShoppingCart, Globe,
  Briefcase, GraduationCap, PenTool, Heart, MapPin, Layers, Sparkles,
  FileText, TrendingUp, Phone, MessageSquare, Truck, AlertTriangle
} from "lucide-react";
import { Toggle, SingleSelect, SectionTitle } from "@/pages/revenue-office/onboarding/primitives";
import { useBusinessOnboarding } from "@/hooks/useBusinessOnboarding";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { getRecommendedJourney } from "@/lib/business-journey-config";
import type { OnboardingState } from "@/pages/revenue-office/onboarding/types";
import { toast } from "sonner";

// Exactly matches IdentityScreen's 9 types
const BUSINESS_TYPES = [
  { id: "service", label: "Service Business", desc: "Appointments, proposals, delivery milestones, reviews", icon: Briefcase },
  { id: "agency", label: "Agency", desc: "Multi-client, retainers, reporting, white-label", icon: Users },
  { id: "coaching", label: "Coach / Consultant", desc: "Personal brand, bookings, packages, memberships", icon: GraduationCap },
  { id: "creator", label: "Creator / Education", desc: "Products, courses, memberships, launches, content funnels", icon: PenTool },
  { id: "ecommerce", label: "Online Store", desc: "Products, carts, checkout, fulfillment, repeat purchase", icon: ShoppingCart },
  { id: "local", label: "Local / Brick & Mortar", desc: "Visits, bookings, reputation, local campaigns, scheduling", icon: MapPin },
  { id: "membership", label: "Membership Business", desc: "Subscriptions, access tiers, renewal, retention", icon: Heart },
  { id: "hybrid", label: "Hybrid / Mixed Model", desc: "Multiple revenue streams, mixed delivery", icon: Layers },
  { id: "evolving", label: "Still Evolving", desc: "Exploring models, testing ideas, early stage", icon: Sparkles },
];

const REVENUE_SOURCES = [
  { id: "products", label: "Product Sales", icon: ShoppingCart },
  { id: "services", label: "Service Fees", icon: Briefcase },
  { id: "subscriptions", label: "Subscriptions / Recurring", icon: RefreshCw },
  { id: "retainers", label: "Retainers", icon: FileText },
  { id: "proposals", label: "Proposals / Projects", icon: FileText },
  { id: "advertising", label: "Advertising", icon: Globe },
  { id: "commissions", label: "Commissions / Referrals", icon: Users },
  { id: "courses", label: "Courses / Digital", icon: GraduationCap },
];

const LEAD_SOURCES = [
  { id: "referrals", label: "Referrals / Word of mouth", icon: Users },
  { id: "organic", label: "Organic search (SEO)", icon: Globe },
  { id: "paid_ads", label: "Paid ads (Google, Meta)", icon: TrendingUp },
  { id: "social", label: "Social media", icon: MessageSquare },
  { id: "cold_outreach", label: "Cold outreach", icon: Phone },
  { id: "partnerships", label: "Partnerships", icon: Briefcase },
  { id: "events", label: "Events / Networking", icon: Users },
  { id: "content", label: "Content marketing", icon: FileText },
];

const CONVERSION_CLOSERS = [
  { id: "demo_call", label: "Demo / discovery call", icon: Phone },
  { id: "proposal", label: "Detailed proposal", icon: FileText },
  { id: "free_trial", label: "Free trial / sample", icon: ShoppingCart },
  { id: "case_study", label: "Case studies / proof", icon: TrendingUp },
  { id: "pricing_page", label: "Clear pricing page", icon: DollarSign },
  { id: "testimonials", label: "Testimonials / reviews", icon: MessageSquare },
  { id: "urgency", label: "Urgency / limited offer", icon: AlertTriangle },
  { id: "guarantee", label: "Money-back guarantee", icon: Check },
];

const POST_SALE_STEPS = [
  { id: "onboarding_email", label: "Onboarding email sequence", icon: MessageSquare },
  { id: "kickoff_call", label: "Kickoff call", icon: Phone },
  { id: "setup_wizard", label: "Setup wizard / guide", icon: Settings },
  { id: "fulfillment", label: "Fulfillment & delivery", icon: Truck },
  { id: "check_in", label: "Check-in follow-up", icon: RefreshCw },
  { id: "review_request", label: "Review / feedback request", icon: Heart },
  { id: "upsell", label: "Upsell / cross-sell", icon: TrendingUp },
  { id: "renewal", label: "Renewal reminder", icon: RefreshCw },
];

const GROWTH_GOALS = [
  { id: "more_clients", label: "Get more clients", icon: Users },
  { id: "increase_revenue", label: "Increase revenue per client", icon: DollarSign },
  { id: "retain_clients", label: "Retain existing clients", icon: Heart },
  { id: "automate", label: "Automate operations", icon: Zap },
  { id: "expand_channels", label: "Expand to new channels", icon: Globe },
  { id: "improve_conversion", label: "Improve conversion rate", icon: Target },
  { id: "reduce_churn", label: "Reduce churn", icon: RefreshCw },
  { id: "scale_team", label: "Scale the team", icon: Users },
];

const TEAM_SIZES = [
  { id: "solo", label: "Solo / founder" },
  { id: "small", label: "Small team (2-10)" },
  { id: "growing", label: "Growing team (10+)" },
  { id: "multi", label: "Multi-location / agency" },
];

const STAGES = [
  { id: "starting", label: "Just starting" },
  { id: "growing", label: "Growing" },
  { id: "established", label: "Established" },
  { id: "scaling", label: "Scaling / optimizing" },
];

const AUTOMATION_LEVELS = [
  { id: "manual", label: "Manual — I approve everything" },
  { id: "draft_review", label: "Draft & Review — AI drafts, I approve" },
  { id: "auto_low", label: "Auto Low-Risk — Auto for small tasks" },
  { id: "full_auto", label: "Full Auto — Trust the system" },
];

const JOURNEY_TEMPLATES = [
  { id: "service", label: "Service — Inquiry → Consult → Propose → Close → Deliver" },
  { id: "coaching", label: "Coaching — Nurture → Book → Enroll → Deliver → Renew" },
  { id: "ecommerce", label: "E-commerce — Traffic → Cart → Checkout → Fulfill → Repeat" },
  { id: "local", label: "Local — Discovery → Visit → Service → Review → Repeat" },
  { id: "agency", label: "Agency — Referral → Proposal → Retainer → Deliver → Renew" },
  { id: "creator", label: "Creator — Content → Lead → Launch → Enroll → Upsell" },
  { id: "membership", label: "Membership — Trial → Enroll → Engage → Retain → Upsell" },
  { id: "custom", label: "Custom Journey" },
];

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-card/60 border-border/40 overflow-hidden">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" /> {title}
            {badge && <Badge className="bg-primary/10 text-primary text-[9px] ml-1">{badge}</Badge>}
          </CardTitle>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function BusinessSettingsPage() {
  const { isLoading, savedState, updateState, clearCompletion, markComplete } = useBusinessOnboarding();
  const { updateOverrides } = useBusinessProfile();
  const navigate = useNavigate();
  const [localState, setLocalState] = useState<OnboardingState>(savedState);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [journeyNeedsUpdate, setJourneyNeedsUpdate] = useState(false);
  const [prevTypes, setPrevTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setLocalState(savedState);
      setPrevTypes(savedState.businessTypes);
    }
  }, [isLoading, savedState]);

  // Detect business type changes that should trigger journey sync prompt
  useEffect(() => {
    if (prevTypes.length > 0 && JSON.stringify(prevTypes) !== JSON.stringify(localState.businessTypes)) {
      const rec = getRecommendedJourney(localState.businessTypes);
      if (rec !== localState.journeyTemplate) {
        setJourneyNeedsUpdate(true);
      }
    }
  }, [localState.businessTypes, prevTypes, localState.journeyTemplate]);

  // Phase T: durable autosave (localStorage + IndexedDB) for in-progress edits.
  const { updateDraft, clearDraft } = useDraftAutosave<Partial<OnboardingState>>("business:settings:edit", "business");

  const update = useCallback((partial: Partial<OnboardingState>) => {
    setLocalState(prev => ({ ...prev, ...partial }));
    setHasChanges(true);
    updateDraft(partial);
  }, [updateDraft]);

  const toggleInArray = useCallback((field: keyof OnboardingState, value: string) => {
    setLocalState(prev => {
      const arr = (prev[field] as string[]) || [];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setSaveState("saving");
    await markComplete(localState);
    const weights: Record<string, number> = {};
    if (localState.businessTypes.includes("service") || localState.businessTypes.includes("agency")) weights.service = 0.8;
    if (localState.businessTypes.includes("ecommerce")) weights.ecommerce = 0.8;
    if (localState.businessTypes.includes("local")) weights.local = 0.8;
    if (localState.businessTypes.includes("saas")) weights.saas = 0.8;
    if (localState.businessTypes.includes("creator") || localState.businessTypes.includes("coaching")) weights.creator = 0.8;
    if (localState.businessTypes.includes("membership")) weights.membership = 0.8;
    updateOverrides(weights as Parameters<typeof updateOverrides>[0]);
    setHasChanges(false);
    setPrevTypes(localState.businessTypes);
    setJourneyNeedsUpdate(false);
    setSaveState("saved");
    clearDraft();
    toast.success("Business settings saved successfully");
    setTimeout(() => setSaveState("idle"), 2000);
  };

  const handleJourneySync = () => {
    const rec = getRecommendedJourney(localState.businessTypes);
    update({ journeyTemplate: rec });
    setJourneyNeedsUpdate(false);
    toast.info(`Journey updated to "${JOURNEY_TEMPLATES.find(j => j.id === rec)?.label.split(" — ")[0] || rec}"`);
  };

  const handleRerunOnboarding = async () => {
    await clearCompletion();
    navigate("/revenue-office/onboarding");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground text-sm">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4 pb-24">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Business Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Modify your business configuration anytime. Changes take effect immediately.
          </p>
        </div>
      </div>

      {/* Business Identity */}
      <CollapsibleSection title="Business Identity" icon={Building2} defaultOpen badge={`${localState.businessTypes.length} type${localState.businessTypes.length !== 1 ? "s" : ""}`}>
        <div className="space-y-4">
          <div>
            <SectionTitle>Business Name</SectionTitle>
            <Input value={localState.businessName} onChange={e => update({ businessName: e.target.value })} placeholder="Your business name" className="bg-background/50" />
          </div>
          <div>
            <SectionTitle hint="Select all that apply — most businesses are hybrids">Business Type</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(bt => (
                <Toggle key={bt.id} label={bt.label} desc={bt.desc} icon={bt.icon} selected={localState.businessTypes.includes(bt.id)} onToggle={() => toggleInArray("businessTypes", bt.id)} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SectionTitle>Team Size</SectionTitle>
              <SingleSelect value={localState.teamSize} onChange={v => update({ teamSize: v })} options={TEAM_SIZES} />
            </div>
            <div>
              <SectionTitle>Business Stage</SectionTitle>
              <SingleSelect value={localState.businessStage} onChange={v => update({ businessStage: v })} options={STAGES} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Revenue Model */}
      <CollapsibleSection title="Revenue Model" icon={DollarSign} badge={`${localState.revenueSources.length} source${localState.revenueSources.length !== 1 ? "s" : ""}`}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="Select all your revenue sources">Revenue Sources</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_SOURCES.map(rs => (
                <Toggle key={rs.id} label={rs.label} icon={rs.icon} selected={localState.revenueSources.includes(rs.id)} onToggle={() => toggleInArray("revenueSources", rs.id)} />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Lead Sources */}
      <CollapsibleSection title="Lead Sources" icon={TrendingUp} badge={`${localState.leadSources.length} active`}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="Where do your leads come from?">Active Lead Sources</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_SOURCES.map(ls => (
                <Toggle key={ls.id} label={ls.label} icon={ls.icon} selected={localState.leadSources.includes(ls.id)} onToggle={() => toggleInArray("leadSources", ls.id)} />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Conversion & Sales */}
      <CollapsibleSection title="Conversion & Sales" icon={Target} badge={`${localState.whatCloses.length} closer${localState.whatCloses.length !== 1 ? "s" : ""}`}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="What persuades people to buy?">What Closes Deals</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSION_CLOSERS.map(cc => (
                <Toggle key={cc.id} label={cc.label} icon={cc.icon} selected={localState.whatCloses.includes(cc.id)} onToggle={() => toggleInArray("whatCloses", cc.id)} />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Post-Sale & Delivery */}
      <CollapsibleSection title="Post-Sale & Delivery" icon={Truck} badge={`${localState.postSaleSteps.length} step${localState.postSaleSteps.length !== 1 ? "s" : ""}`}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="What happens after a sale?">Post-Sale Steps</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {POST_SALE_STEPS.map(ps => (
                <Toggle key={ps.id} label={ps.label} icon={ps.icon} selected={localState.postSaleSteps.includes(ps.id)} onToggle={() => toggleInArray("postSaleSteps", ps.id)} />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Growth Priorities */}
      <CollapsibleSection title="Growth Priorities" icon={Target} badge={`${localState.growthGoals.length} goal${localState.growthGoals.length !== 1 ? "s" : ""}`}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="What matters most right now?">Growth Goals</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {GROWTH_GOALS.map(gg => (
                <Toggle key={gg.id} label={gg.label} icon={gg.icon} selected={localState.growthGoals.includes(gg.id)} onToggle={() => toggleInArray("growthGoals", gg.id)} />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Customer Journey */}
      <CollapsibleSection title="Customer Journey" icon={Heart}>
        <div className="space-y-4">
          {journeyNeedsUpdate && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">Your business types changed — your journey template may need updating.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleJourneySync} className="text-[10px] h-7 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-shrink-0">
                Auto-match
              </Button>
            </motion.div>
          )}
          <div>
            <SectionTitle>Journey Template</SectionTitle>
            <SingleSelect value={localState.journeyTemplate} onChange={v => update({ journeyTemplate: v })} options={JOURNEY_TEMPLATES} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Automation & Trust */}
      <CollapsibleSection title="Automation & Trust" icon={Zap}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="How much should SITA automate?">Automation Level</SectionTitle>
            <SingleSelect value={localState.automationLevel} onChange={v => update({ automationLevel: v })} options={AUTOMATION_LEVELS} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Advisors */}
      <CollapsibleSection title="Advisor Board" icon={Brain} badge={`${localState.activeAdvisors.length} active`}>
        <div className="space-y-3">
          <SectionTitle hint="Enable or disable AI advisors">Active Advisors</SectionTitle>
          {["revenue", "growth", "operations", "retention", "strategy"].map(advisor => (
            <Toggle key={advisor} label={`${advisor.charAt(0).toUpperCase() + advisor.slice(1)} Advisor`} icon={Brain}
              selected={localState.activeAdvisors.includes(advisor)} onToggle={() => toggleInArray("activeAdvisors", advisor)} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Re-run Onboarding */}
      <Card className="bg-card/40 border-border/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Re-run Full Onboarding</p>
            <p className="text-[10px] text-muted-foreground">Start the guided setup from scratch — your current data will be preserved</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRerunOnboarding} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Re-run
          </Button>
        </CardContent>
      </Card>

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">Unsaved changes</Badge>
                <p className="text-xs text-muted-foreground">Save to apply your changes</p>
              </div>
              <Button size="sm" onClick={handleSave} disabled={saveState === "saving"} className="gap-1.5 min-w-[100px]">
                {saveState === "saving" ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                ) : saveState === "saved" ? (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Saved!
                  </motion.span>
                ) : (
                  <><Save className="h-3.5 w-3.5" /> Save Changes</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

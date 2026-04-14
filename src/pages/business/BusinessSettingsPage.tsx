import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Settings, Building2, DollarSign, Target, Zap, Brain, Users, RefreshCw,
  Save, RotateCcw, Check, ChevronDown, ChevronUp, ShoppingCart, Globe,
  Briefcase, Palette, BookOpen, Heart, Phone, FileText, TrendingUp
} from "lucide-react";
import { Toggle, SingleSelect, SectionTitle } from "@/pages/revenue-office/onboarding/primitives";
import { useBusinessOnboarding } from "@/hooks/useBusinessOnboarding";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import type { OnboardingState } from "@/pages/revenue-office/onboarding/types";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  { id: "ecommerce", label: "E-Commerce / Online Store", icon: ShoppingCart, desc: "Sell products online" },
  { id: "local", label: "Local / Brick & Mortar", icon: Building2, desc: "Physical location, walk-ins" },
  { id: "service", label: "Service Provider", icon: Briefcase, desc: "Professional services, consulting" },
  { id: "agency", label: "Agency / Studio", icon: Palette, desc: "Creative or marketing agency" },
  { id: "coaching", label: "Coaching / Training", icon: BookOpen, desc: "1:1 or group coaching" },
  { id: "saas", label: "SaaS / Digital Product", icon: Globe, desc: "Software or digital products" },
  { id: "creator", label: "Creator / Content", icon: Heart, desc: "Content, courses, memberships" },
  { id: "marketplace", label: "Marketplace / Platform", icon: TrendingUp, desc: "Two-sided platform" },
];

const REVENUE_SOURCES = [
  { id: "products", label: "Product Sales", icon: ShoppingCart },
  { id: "services", label: "Service Fees", icon: Briefcase },
  { id: "subscriptions", label: "Subscriptions / Recurring", icon: RefreshCw },
  { id: "retainers", label: "Retainers", icon: FileText },
  { id: "proposals", label: "Proposals / Projects", icon: FileText },
  { id: "advertising", label: "Advertising", icon: Globe },
  { id: "commissions", label: "Commissions / Referrals", icon: Users },
  { id: "courses", label: "Courses / Digital", icon: BookOpen },
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
  { id: "solo", label: "Solo" },
  { id: "small", label: "2-5 people" },
  { id: "medium", label: "6-20 people" },
  { id: "large", label: "21-50 people" },
  { id: "enterprise", label: "50+" },
];

const STAGES = [
  { id: "idea", label: "Idea / Pre-launch" },
  { id: "starting", label: "Just Starting" },
  { id: "growing", label: "Growing" },
  { id: "established", label: "Established" },
  { id: "scaling", label: "Scaling" },
];

const AUTOMATION_LEVELS = [
  { id: "manual", label: "Manual — I approve everything" },
  { id: "draft_review", label: "Draft & Review — AI drafts, I approve" },
  { id: "auto_low", label: "Auto Low-Risk — Auto for small tasks" },
  { id: "full_auto", label: "Full Auto — Trust the system" },
];

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-card/60 border-border/40">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" /> {title}
          </CardTitle>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>}
    </Card>
  );
}

export default function BusinessSettingsPage() {
  const { isLoading, savedState, updateState, clearCompletion, markComplete } = useBusinessOnboarding();
  const { updateOverrides } = useBusinessProfile();
  const navigate = useNavigate();
  const [localState, setLocalState] = useState<OnboardingState>(savedState);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLocalState(savedState);
    }
  }, [isLoading, savedState]);

  const update = (partial: Partial<OnboardingState>) => {
    setLocalState(prev => ({ ...prev, ...partial }));
    setHasChanges(true);
  };

  const toggleInArray = (field: keyof OnboardingState, value: string) => {
    const arr = (localState[field] as string[]) || [];
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    update({ [field]: next } as any);
  };

  const handleSave = async () => {
    await markComplete(localState);
    // Update business profile archetype weights based on business types
    const weights: Record<string, number> = {};
    if (localState.businessTypes.includes("service") || localState.businessTypes.includes("agency")) weights.service = 0.8;
    if (localState.businessTypes.includes("ecommerce")) weights.ecommerce = 0.8;
    if (localState.businessTypes.includes("local")) weights.local = 0.8;
    if (localState.businessTypes.includes("saas")) weights.saas = 0.8;
    if (localState.businessTypes.includes("creator") || localState.businessTypes.includes("coaching")) weights.creator = 0.8;
    updateOverrides(weights as any);
    setHasChanges(false);
    toast.success("Business settings saved");
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
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Business Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Modify your business configuration anytime. Changes take effect immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge className="bg-amber-500/10 text-amber-400 text-[10px]">Unsaved changes</Badge>
          )}
          <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>

      {/* Business Identity */}
      <CollapsibleSection title="Business Identity" icon={Building2} defaultOpen>
        <div className="space-y-4">
          <div>
            <SectionTitle>Business Name</SectionTitle>
            <Input
              value={localState.businessName}
              onChange={e => update({ businessName: e.target.value })}
              placeholder="Your business name"
              className="bg-background/50"
            />
          </div>
          <div>
            <SectionTitle hint="Select all that apply — you can have multiple">Business Type</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(bt => (
                <Toggle
                  key={bt.id}
                  label={bt.label}
                  desc={bt.desc}
                  icon={bt.icon}
                  selected={localState.businessTypes.includes(bt.id)}
                  onToggle={() => toggleInArray("businessTypes", bt.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionTitle>Team Size</SectionTitle>
            <SingleSelect value={localState.teamSize} onChange={v => update({ teamSize: v })} options={TEAM_SIZES} />
          </div>
          <div>
            <SectionTitle>Business Stage</SectionTitle>
            <SingleSelect value={localState.businessStage} onChange={v => update({ businessStage: v })} options={STAGES} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Revenue Model */}
      <CollapsibleSection title="Revenue Model" icon={DollarSign}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="Select all your revenue sources">Revenue Sources</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_SOURCES.map(rs => (
                <Toggle
                  key={rs.id}
                  label={rs.label}
                  icon={rs.icon}
                  selected={localState.revenueSources.includes(rs.id)}
                  onToggle={() => toggleInArray("revenueSources", rs.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Growth Priorities */}
      <CollapsibleSection title="Growth Priorities" icon={Target}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="What matters most right now? Select your top priorities.">Growth Goals</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {GROWTH_GOALS.map(gg => (
                <Toggle
                  key={gg.id}
                  label={gg.label}
                  icon={gg.icon}
                  selected={localState.growthGoals.includes(gg.id)}
                  onToggle={() => toggleInArray("growthGoals", gg.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Automation & Trust */}
      <CollapsibleSection title="Automation & Trust" icon={Zap}>
        <div className="space-y-4">
          <div>
            <SectionTitle hint="How much should SITA automate?">Automation Level</SectionTitle>
            <SingleSelect
              value={localState.automationLevel}
              onChange={v => update({ automationLevel: v })}
              options={AUTOMATION_LEVELS}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Customer Journey */}
      <CollapsibleSection title="Customer Journey" icon={Heart}>
        <div className="space-y-4">
          <div>
            <SectionTitle>Journey Template</SectionTitle>
            <SingleSelect
              value={localState.journeyTemplate}
              onChange={v => update({ journeyTemplate: v })}
              options={[
                { id: "simple", label: "Simple — Discover → Buy → Use" },
                { id: "consultation", label: "Consultation — Inquire → Consult → Propose → Close" },
                { id: "subscription", label: "Subscription — Trial → Convert → Retain → Expand" },
                { id: "project", label: "Project — Scope → Propose → Execute → Deliver" },
                { id: "marketplace", label: "Marketplace — Browse → Compare → Purchase → Review" },
              ]}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Advisors */}
      <CollapsibleSection title="Advisor Board" icon={Brain}>
        <div className="space-y-3">
          <SectionTitle hint="Enable or disable AI advisors">Active Advisors</SectionTitle>
          {["revenue", "growth", "operations", "retention", "strategy"].map(advisor => (
            <Toggle
              key={advisor}
              label={`${advisor.charAt(0).toUpperCase() + advisor.slice(1)} Advisor`}
              icon={Brain}
              selected={localState.activeAdvisors.includes(advisor)}
              onToggle={() => toggleInArray("activeAdvisors", advisor)}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Re-run Onboarding */}
      <Card className="bg-card/40 border-border/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Re-run Full Onboarding</p>
            <p className="text-[10px] text-muted-foreground">Start the guided setup from scratch</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRerunOnboarding} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Re-run
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

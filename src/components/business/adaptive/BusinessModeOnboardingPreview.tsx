// ═══════════════════════════════════════════════════════════════
// Business Mode Onboarding Preview
// A "wow moment" during setup: shows users what their Business OS
// will look like based on detected profile — makes it feel like
// the system is configuring itself around them.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown,
  Shield, MapPin, Heart, LayoutDashboard, Bot, Zap, BarChart3,
  CheckCircle, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileArchetype, BusinessProfileResult } from "@/lib/engines/business-profile-engine";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";

const MODE_ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown, Shield, MapPin, Heart,
};

const ARCHETYPE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce",
  "brick-and-mortar": "Local / Retail",
  service: "Service Business",
  "employee-based": "Team Operations",
  "appointment-based": "Appointment-Based",
  agency: "Agency / Consulting",
  "professional-practice": "Professional Practice",
  hybrid: "Hybrid",
  "multi-location": "Multi-Location",
  "product-service": "Product + Service",
  membership: "Membership / Subscription",
  marketplace: "Marketplace",
};

interface Props {
  profile: BusinessProfileResult;
  onConfirm: () => void;
  onCustomize: () => void;
}

export default function BusinessModeOnboardingPreview({ profile, onConfirm, onCustomize }: Props) {
  const identity = getIdentityLayer(profile.primaryMode);
  const ModeIcon = MODE_ICONS[identity.modeIcon] || Briefcase;

  const previewItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      detail: `${identity.surfaceEmphasis.headerStatCount} key metrics, ${identity.surfaceEmphasis.heroType}-first layout`,
    },
    {
      icon: Users,
      label: "CRM Mode",
      detail: `${profile.crm.language.contactLabel} · ${profile.crm.language.dealLabel} · ${profile.crm.pipelineStages.length} stages`,
    },
    {
      icon: Bot,
      label: "Advisors",
      detail: `${profile.advisors.length} specialized advisors activated`,
    },
    {
      icon: Zap,
      label: "Workflows",
      detail: `${profile.workflows.filter(w => w.affinityScore > 0.5).length} suggested automations`,
    },
    {
      icon: BarChart3,
      label: "KPIs",
      detail: profile.kpis.slice(0, 4).join(", "),
    },
  ];

  const topWeights = (Object.entries(profile.weights) as [ProfileArchetype, number][])
    .filter(([, v]) => v > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))`,
            }}
          >
            <ModeIcon className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="text-2xl font-bold text-foreground font-display">
              Your Business OS is Ready
            </h1>
            <p className="text-muted-foreground mt-1">
              Configured as <span className="text-foreground font-medium">{identity.tagline}</span>
            </p>
          </motion.div>
        </div>

        {/* Weight Bars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 space-y-3"
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Business Profile Composition
          </span>
          <div className="space-y-2">
            {topWeights.map(([arch, weight], idx) => (
              <motion.div
                key={arch}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-foreground/80 w-28 truncate">
                  {ARCHETYPE_LABELS[arch] || arch}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(weight * 100)}%` }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {Math.round(weight * 100)}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What's Configured */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 space-y-3"
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Configured For You
          </span>
          <div className="space-y-2.5">
            {previewItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `hsl(${identity.accentColor} / 0.15)` }}
                >
                  <item.icon
                    className="w-4 h-4"
                    style={{ color: `hsl(${identity.accentColor})` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500/60 shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Confidence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-xs text-muted-foreground/60"
        >
          Profile confidence: {Math.round(profile.profileConfidence * 100)}% ·
          {" "}{profile.secondaryModes.length} secondary mode{profile.secondaryModes.length !== 1 ? "s" : ""} detected
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-3 pt-2"
        >
          <button
            onClick={onCustomize}
            className="px-5 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            Customize Profile
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))`,
            }}
          >
            Launch Business OS
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

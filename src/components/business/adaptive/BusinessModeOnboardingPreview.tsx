// ═══════════════════════════════════════════════════════════════
// Enhanced Business Mode Onboarding Preview — Wow moments,
// side-by-side comparison, starter packs, style summary
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown,
  Shield, MapPin, Heart, LayoutDashboard, Bot, Zap, BarChart3,
  CheckCircle, ArrowRight, Sparkles, Package, Star, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileArchetype, BusinessProfileResult } from "@/domains/engines/business-profile-engine";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

const MODE_ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown, Shield, MapPin, Heart,
};

const ARCHETYPE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce", "brick-and-mortar": "Local / Retail", service: "Service Business",
  "employee-based": "Team Operations", "appointment-based": "Appointment-Based", agency: "Agency / Consulting",
  "professional-practice": "Professional Practice", hybrid: "Hybrid", "multi-location": "Multi-Location",
  "product-service": "Product + Service", membership: "Membership / Subscription", marketplace: "Marketplace",
};

const STARTER_PACKS: Record<string, { name: string; items: string[] }> = {
  service: { name: "Service Business Starter", items: ["Service pipeline", "Lead intake workflow", "Proposal follow-up", "Invoice reminders", "5 advisors"] },
  ecommerce: { name: "E-Commerce Starter", items: ["Order funnel", "Cart recovery", "Retention sequence", "4 advisors", "E-commerce dashboard"] },
  agency: { name: "Agency Starter", items: ["Deal flow pipeline", "Client onboarding", "Project checkpoints", "6 advisors", "Agency dashboard"] },
  "brick-and-mortar": { name: "Local Business Starter", items: ["Walk-in pipeline", "Appointment reminders", "No-show recovery", "Loyalty outreach"] },
  "appointment-based": { name: "Appointment Starter", items: ["Booking pipeline", "Confirmation sequence", "No-show recovery", "Post-visit follow-up"] },
};

interface Props {
  profile: BusinessProfileResult;
  onConfirm: () => void;
  onCustomize: () => void;
}

export default function BusinessModeOnboardingPreview({ profile, onConfirm, onCustomize }: Props) {
  const identity = getIdentityLayer(profile.primaryMode);
  const ModeIcon = MODE_ICONS[identity.modeIcon] || Briefcase;
  const [showComparison, setShowComparison] = useState(false);
  const starterPack = STARTER_PACKS[profile.primaryMode] || STARTER_PACKS.service;

  const previewItems = [
    { icon: LayoutDashboard, label: "Dashboard", detail: `${identity.surfaceEmphasis.headerStatCount} key metrics, ${identity.surfaceEmphasis.heroType}-first layout` },
    { icon: Users, label: "CRM Mode", detail: `${profile.crm.language.contactLabel} · ${profile.crm.language.dealLabel} · ${profile.crm.pipelineStages.length} stages` },
    { icon: Bot, label: "Advisors", detail: `${profile.advisors.length} specialized advisors activated` },
    { icon: Zap, label: "Workflows", detail: `${profile.workflows.filter(w => w.affinityScore > 0.5).length} suggested automations` },
    { icon: BarChart3, label: "KPIs", detail: profile.kpis.slice(0, 4).join(", ") },
  ];

  const topWeights = (Object.entries(profile.weights) as [ProfileArchetype, number][])
    .filter(([, v]) => v > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const comparisonModes: ProfileArchetype[] = ["service", "ecommerce", "agency", "brick-and-mortar"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl space-y-5"
      >
        {/* Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))` }}
          >
            <ModeIcon className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h1 className="text-2xl font-bold text-foreground font-display">Your Business OS is Ready</h1>
            <p className="text-muted-foreground mt-1">
              Configured as <span className="text-foreground font-medium">{identity.tagline}</span>
            </p>
          </motion.div>
        </div>

        {/* Operating Style Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4 text-center"
          style={{ background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.06), transparent)`, border: `1px solid hsl(${identity.accentColor} / 0.12)` }}
        >
          <Sparkles size={14} style={{ color: `hsl(${identity.accentColor})` }} className="mx-auto mb-2" />
          <p className="text-[11px] text-foreground/50 leading-relaxed max-w-md mx-auto">
            Your business operates primarily as a <span className="font-semibold text-foreground/70">{ARCHETYPE_LABELS[profile.primaryMode]?.toLowerCase()}</span>
            {profile.secondaryModes.length > 0 && <> with elements of <span className="font-semibold text-foreground/70">{profile.secondaryModes.map(m => ARCHETYPE_LABELS[m]?.toLowerCase()).join(" and ")}</span></>}.
            Business OS is shaping navigation, dashboards, advisors, and workflows around this reality.
          </p>
        </motion.div>

        {/* Weight Bars */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 space-y-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Profile Composition</span>
          <div className="space-y-2">
            {topWeights.map(([arch, weight], idx) => (
              <motion.div key={arch} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.1 }} className="flex items-center gap-3">
                <span className="text-xs text-foreground/80 w-28 truncate">{ARCHETYPE_LABELS[arch] || arch}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(weight * 100)}%` }} transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">{Math.round(weight * 100)}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Configured items */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="rounded-xl border border-border/50 bg-card/50 backdrop-blur p-4 space-y-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configured For You</span>
          <div className="space-y-2.5">
            {previewItems.map((item, idx) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + idx * 0.08 }} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `hsl(${identity.accentColor} / 0.15)` }}>
                  <item.icon className="w-4 h-4" style={{ color: `hsl(${identity.accentColor})` }} />
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

        {/* Starter Pack */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
          className="rounded-xl border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-[hsl(var(--sita-gold))]" />
            <span className="text-[11px] font-bold text-foreground/70">{starterPack.name}</span>
            <Star size={10} className="text-[hsl(var(--sita-gold))]" fill="currentColor" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {starterPack.items.map(item => (
              <span key={item} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] font-medium">{item}</span>
            ))}
          </div>
          <p className="text-[9px] text-foreground/25 mt-2">Most {ARCHETYPE_LABELS[profile.primaryMode]?.toLowerCase()} businesses choose this setup</p>
        </motion.div>

        {/* Compare modes toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} className="text-center">
          <button onClick={() => setShowComparison(!showComparison)} className="text-[10px] text-foreground/30 hover:text-foreground/50 transition-colors flex items-center gap-1 mx-auto">
            <Eye size={10} /> {showComparison ? "Hide" : "Compare"} other business modes
          </button>
        </motion.div>

        <AnimatePresence>
          {showComparison && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-4 gap-2 overflow-hidden">
              {comparisonModes.map(mode => {
                const modeIdentity = getIdentityLayer(mode);
                const isActive = mode === profile.primaryMode;
                return (
                  <div key={mode} className={cn("rounded-xl border p-3 text-center transition-all",
                    isActive ? "border-foreground/15 bg-foreground/5" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] opacity-60")}>
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, hsl(${modeIdentity.gradientPair[0]}), hsl(${modeIdentity.gradientPair[1]}))` }}>
                      {React.createElement(MODE_ICONS[modeIdentity.modeIcon] || Briefcase, { size: 14, className: "text-white" })}
                    </div>
                    <p className="text-[9px] font-semibold text-foreground/60">{ARCHETYPE_LABELS[mode]}</p>
                    {isActive && <span className="text-[7px] text-[hsl(var(--trust-safe))] font-bold uppercase">Current</span>}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confidence + Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-center text-xs text-muted-foreground/60">
          Profile confidence: {Math.round(profile.profileConfidence * 100)}% · {profile.secondaryModes.length} secondary mode{profile.secondaryModes.length !== 1 ? "s" : ""}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex items-center justify-center gap-3 pt-2">
          <button onClick={onCustomize} className="px-5 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm text-muted-foreground hover:text-foreground transition-all">
            Customize Profile
          </button>
          <button onClick={onConfirm} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02] shadow-lg"
            style={{ background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))` }}>
            Launch Business OS <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

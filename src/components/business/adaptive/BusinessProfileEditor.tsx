import React from "react";
import { motion } from "framer-motion";
import { Settings, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { ALL_ARCHETYPES, type ProfileArchetype } from "@/domains/engines/business-profile-engine";
import { Slider } from "@/components/ui/slider";

const ARCHETYPE_LABELS: Record<ProfileArchetype, string> = {
  ecommerce: "E-Commerce",
  "brick-and-mortar": "Brick & Mortar",
  service: "Service Business",
  "employee-based": "Employee / Team",
  "appointment-based": "Appointment-Based",
  agency: "Agency / Consulting",
  "professional-practice": "Professional Practice",
  hybrid: "Hybrid",
  "multi-location": "Multi-Location",
  "product-service": "Product + Service",
  membership: "Membership / Subscription",
  marketplace: "Marketplace / Platform",
};

const ARCHETYPE_COLORS: Record<string, string> = {
  ecommerce: "38 85% 58%",
  "brick-and-mortar": "25 75% 50%",
  service: "217 80% 55%",
  "employee-based": "152 55% 48%",
  "appointment-based": "280 55% 58%",
  agency: "265 55% 58%",
  "professional-practice": "200 60% 50%",
  hybrid: "320 50% 55%",
  "multi-location": "45 90% 55%",
  "product-service": "180 55% 50%",
  membership: "340 60% 55%",
  marketplace: "160 50% 50%",
};

export default function BusinessProfileEditor() {
  const { profile, weights, primaryMode, operatingFlags, adaptations, updateOverrides, resetToDetected, isAdapted } = useBusinessProfile();

  const handleWeightChange = (archetype: ProfileArchetype, value: number) => {
    updateOverrides({ [archetype]: value / 100 });
  };

  const sortedArchetypes = [...ALL_ARCHETYPES].sort(
    (a, b) => (weights[b] || 0) - (weights[a] || 0)
  );

  return (
    <div className="p-5 space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-foreground/90 flex items-center gap-2">
            <Settings size={16} className="text-[hsl(var(--sita-purple))]" />
            Business Profile Engine
          </h1>
          <p className="text-[11px] text-foreground/40 mt-0.5">
            Configure how Business OS adapts to your business model
          </p>
        </div>
        <button
          onClick={resetToDetected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] text-[10px] font-medium text-foreground/50 hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
        >
          <RotateCcw size={10} />
          Reset to Detected
        </button>
      </motion.div>

      {/* Current primary mode */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-[hsl(var(--sita-purple))]/15 bg-[hsl(var(--sita-purple))]/5 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--sita-purple))]/15 flex items-center justify-center">
            <Eye size={18} className="text-[hsl(var(--sita-purple))]" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-foreground/80">
              Primary Mode: <span className="text-[hsl(var(--sita-purple))]">{ARCHETYPE_LABELS[primaryMode]}</span>
            </p>
            <p className="text-[10px] text-foreground/40 mt-0.5">
              {profile.secondaryModes.length > 0
                ? `Secondary: ${profile.secondaryModes.map(m => ARCHETYPE_LABELS[m]).join(", ")}`
                : "No secondary modes detected"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Confidence meter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30">Profile Confidence</p>
          <span className="text-[11px] font-bold text-foreground/60">{Math.round(profile.profileConfidence * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: profile.profileConfidence >= 0.7
                ? "hsl(var(--trust-safe))"
                : profile.profileConfidence >= 0.4
                  ? "hsl(var(--sita-gold))"
                  : "hsl(var(--destructive))",
              width: `${profile.profileConfidence * 100}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${profile.profileConfidence * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-[9px] text-foreground/30 mt-2">
          {profile.profileConfidence >= 0.7
            ? "High confidence — strong signal coverage from onboarding and manual tuning"
            : profile.profileConfidence >= 0.4
              ? "Moderate confidence — more signals would improve accuracy"
              : "Low confidence — complete onboarding or adjust weights manually for better adaptation"}
        </p>
      </motion.div>

      {/* Weight sliders */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-4">
          Archetype Weights
        </p>
        <div className="space-y-4">
          {sortedArchetypes.map((arch) => {
            const weight = Math.round((weights[arch] || 0) * 100);
            const color = ARCHETYPE_COLORS[arch] || "0 0% 60%";
            return (
              <div key={arch} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground/60">{ARCHETYPE_LABELS[arch]}</span>
                  <span className="text-[10px] font-bold text-foreground/40 tabular-nums w-[36px] text-right">{weight}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: `hsl(${color})`, width: `${weight}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${weight}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                  <div className="w-[120px]">
                    <Slider
                      value={[weight]}
                      onValueChange={([v]) => handleWeightChange(arch, v)}
                      max={100}
                      step={5}
                      className="h-4"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Operating flags */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-3">
          Derived Operating Flags
        </p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(operatingFlags).map(([flag, value]) => (
            <div
              key={flag}
              className={cn(
                "rounded-lg px-3 py-2 border text-[10px] font-medium",
                value
                  ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 text-[hsl(var(--trust-safe))]"
                  : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] text-foreground/25"
              )}
            >
              {flag.replace(/^has|^sends/, "").replace(/([A-Z])/g, " $1").trim()}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Adaptations preview */}
      <div className="grid grid-cols-2 gap-4">
        {/* CRM Language */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">CRM Language</p>
          <div className="space-y-1.5">
            {Object.entries(adaptations.crm.language).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/35">{key.replace(/Label$/, "")}</span>
                <span className="text-[10px] font-semibold text-foreground/60">{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar order */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">Sidebar Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {adaptations.sidebar.groupOrder.map((group, i) => (
              <span
                key={group}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.05)] text-foreground/50 font-medium"
              >
                {i + 1}. {group}
              </span>
            ))}
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">Key KPIs</p>
          <div className="flex flex-wrap gap-1.5">
            {adaptations.kpis.map((kpi) => (
              <span key={kpi} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/8 text-[hsl(var(--sita-purple))] font-medium">
                {kpi}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Advisors */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">Active Advisors ({adaptations.advisors.length})</p>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {adaptations.advisors.slice(0, 6).map((adv) => (
              <div key={adv.id} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: `hsl(${adv.accent} / 0.15)`, color: `hsl(${adv.accent})` }}>
                  {adv.name[0]}
                </div>
                <span className="text-[10px] text-foreground/55 font-medium">{adv.name}</span>
                <span className="text-[8px] text-foreground/25 ml-auto">{Math.round(adv.affinityScore * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

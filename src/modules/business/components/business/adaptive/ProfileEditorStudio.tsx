// ═══════════════════════════════════════════════════════════════
// Profile Editor Studio — Enhanced weight editor with visual bars
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import { Settings, RotateCcw, Eye, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { ALL_ARCHETYPES, type ProfileArchetype } from "@/domains/engines/business-profile-engine";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { Slider } from "@/components/ui/slider";

const ARCHETYPE_LABELS: Record<ProfileArchetype, string> = {
  ecommerce: "E-Commerce", "brick-and-mortar": "Brick & Mortar", service: "Service Business",
  "employee-based": "Employee / Team", "appointment-based": "Appointment-Based", agency: "Agency / Consulting",
  "professional-practice": "Professional Practice", hybrid: "Hybrid", "multi-location": "Multi-Location",
  "product-service": "Product + Service", membership: "Membership / Subscription", marketplace: "Marketplace / Platform",
};

const ARCHETYPE_COLORS: Record<string, string> = {
  ecommerce: "38 85% 58%", "brick-and-mortar": "25 75% 50%", service: "217 80% 55%",
  "employee-based": "152 55% 48%", "appointment-based": "280 55% 58%", agency: "265 55% 58%",
  "professional-practice": "200 60% 50%", hybrid: "320 50% 55%", "multi-location": "45 90% 55%",
  "product-service": "180 55% 50%", membership: "340 60% 55%", marketplace: "160 50% 50%",
};

export default function ProfileEditorStudio() {
  const { profile, weights, primaryMode, operatingFlags, adaptations, updateOverrides, resetToDetected } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  const handleWeightChange = (archetype: ProfileArchetype, value: number) => {
    updateOverrides({ [archetype]: value / 100 });
  };

  const sortedArchetypes = [...ALL_ARCHETYPES].sort((a, b) => (weights[b] || 0) - (weights[a] || 0));

  return (
    <div className="p-5 space-y-5 max-w-3xl">
      {/* Primary mode hero card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${identity.accentColor} / 0.08), hsl(${identity.accentColor} / 0.02))`,
          border: `1px solid hsl(${identity.accentColor} / 0.15)`,
        }}
      >
        <div className="p-5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))` }}
          >
            <Eye size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-foreground/85">
              {ARCHETYPE_LABELS[primaryMode]}
            </p>
            <p className="text-[11px] text-foreground/40 mt-0.5">{identity.tagline}</p>
            <p className="text-[10px] text-foreground/30 mt-1">
              {profile.secondaryModes.length > 0
                ? `+ ${profile.secondaryModes.map(m => ARCHETYPE_LABELS[m]).join(", ")}`
                : "Pure mode — no secondary blending"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[22px] font-bold text-foreground/70">{Math.round(profile.profileConfidence * 100)}%</div>
            <div className="text-[9px] text-foreground/30 uppercase tracking-wider">Confidence</div>
          </div>
        </div>
        {/* Confidence bar */}
        <div className="h-1 bg-[hsl(0_0%_100%/0.04)]">
          <motion.div
            className="h-full"
            style={{ backgroundColor: `hsl(${identity.accentColor})` }}
            initial={{ width: 0 }}
            animate={{ width: `${profile.profileConfidence * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.div>

      {/* Reset button */}
      <div className="flex justify-end">
        <button
          onClick={resetToDetected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)] text-[10px] font-medium text-foreground/40 hover:text-foreground/60 hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
        >
          <RotateCcw size={10} />
          Reset to Detected
        </button>
      </div>

      {/* Weight sliders */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30">
          Archetype Weights
        </p>
        {sortedArchetypes.map((arch, i) => {
          const weight = Math.round((weights[arch] || 0) * 100);
          const color = ARCHETYPE_COLORS[arch] || "0 0% 60%";
          const isPrimary = arch === primaryMode;
          return (
            <motion.div
              key={arch}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
                  <span className={cn("text-[11px] font-medium", isPrimary ? "text-foreground/80" : "text-foreground/50")}>
                    {ARCHETYPE_LABELS[arch]}
                  </span>
                  {isPrimary && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-bold uppercase">
                      Primary
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-foreground/40 tabular-nums w-[36px] text-right">{weight}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: `hsl(${color})`, width: `${weight}%` }}
                    animate={{ width: `${weight}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="w-[100px]">
                  <Slider
                    value={[weight]}
                    onValueChange={([v]) => handleWeightChange(arch, v)}
                    max={100}
                    step={5}
                    className="h-4"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Operating flags */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-3">
          Derived Operating Flags
        </p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(operatingFlags).map(([flag, value]) => (
            <div
              key={flag}
              className={cn(
                "rounded-lg px-3 py-2 border text-[10px] font-medium transition-all",
                value
                  ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5 text-[hsl(var(--trust-safe))]"
                  : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] text-foreground/25"
              )}
            >
              {flag.replace(/^has|^sends/, "").replace(/([A-Z])/g, " $1").trim()}
            </div>
          ))}
        </div>
      </div>

      {/* Derived adaptations grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">CRM Language</p>
          <div className="space-y-1.5">
            {Object.entries(adaptations.crm.language).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/35">{key.replace(/Label$/, "")}</span>
                <span className="text-[10px] font-semibold text-foreground/60">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 mb-3">Key KPIs</p>
          <div className="flex flex-wrap gap-1.5">
            {adaptations.kpis.map((kpi) => (
              <span key={kpi} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/8 text-[hsl(var(--sita-purple))] font-medium">
                {kpi}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

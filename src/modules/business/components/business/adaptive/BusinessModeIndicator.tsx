// ═══════════════════════════════════════════════════════════════
// Business Mode Indicator
// A compact header chip showing the current business mode with
// identity-aware accent color and quick-switch capability.
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown,
  Shield, MapPin, Heart, Zap,
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

const MODE_ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown, Shield, MapPin, Heart, Zap,
};

const LABELS: Record<string, string> = {
  ecommerce: "E-Commerce",
  "brick-and-mortar": "Local",
  service: "Service",
  "employee-based": "Team Ops",
  "appointment-based": "Appointments",
  agency: "Agency",
  "professional-practice": "Practice",
  hybrid: "Hybrid",
  "multi-location": "Multi-Location",
  "product-service": "Product+Service",
  membership: "Membership",
  marketplace: "Marketplace",
};

export function BusinessModeIndicator({ onClick }: { onClick?: () => void }) {
  const { primaryMode, profile } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const Icon = MODE_ICONS[identity.modeIcon] || Briefcase;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:brightness-110"
      style={{
        backgroundColor: `hsl(${identity.accentColor} / 0.1)`,
        border: `1px solid hsl(${identity.accentColor} / 0.2)`,
      }}
      title={`Business mode: ${identity.tagline} (${Math.round(profile.profileConfidence * 100)}% confidence)`}
    >
      <Icon size={11} style={{ color: `hsl(${identity.accentColor})` }} />
      <span
        className="text-[9px] font-bold uppercase tracking-wider"
        style={{ color: `hsl(${identity.accentColor})` }}
      >
        {LABELS[primaryMode] || primaryMode}
      </span>
      {profile.profileConfidence < 0.5 && (
        <span className="text-[7px] text-foreground/25 ml-0.5">●</span>
      )}
    </motion.button>
  );
}

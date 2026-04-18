// ═══════════════════════════════════════════════════════════════
// Mode Transition Ceremony
// Cinematic full-screen transition when the business mode changes.
// Shows the new identity layer with accent color wash, icon morph,
// and tagline reveal — makes mode switching feel intentional.
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown,
  Shield, MapPin, Heart, Zap, CheckCircle,
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import type { ProfileArchetype } from "@/domains/engines/business-profile-engine";

const MODE_ICONS: Record<string, React.ElementType> = {
  ShoppingCart, Briefcase, Building2, Users, Calendar, Crown, Shield, MapPin, Heart, Zap,
};

const MODE_LABELS: Record<string, string> = {
  ecommerce: "E-Commerce Mode",
  "brick-and-mortar": "Local Business Mode",
  service: "Service Business Mode",
  "employee-based": "Team Operations Mode",
  "appointment-based": "Appointment Mode",
  agency: "Agency Mode",
  "professional-practice": "Practice Mode",
  hybrid: "Hybrid Mode",
  "multi-location": "Multi-Location Mode",
  "product-service": "Product + Service Mode",
  membership: "Membership Mode",
  marketplace: "Marketplace Mode",
};

export default function ModeTransitionCeremony() {
  const { primaryMode } = useBusinessProfile();
  const [transitioning, setTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState<ProfileArchetype>(primaryMode);
  const prevMode = useRef(primaryMode);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Skip the initial render
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      prevMode.current = primaryMode;
      return;
    }

    if (primaryMode !== prevMode.current) {
      setDisplayMode(primaryMode);
      setTransitioning(true);
      prevMode.current = primaryMode;

      const timer = setTimeout(() => {
        setTransitioning(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [primaryMode]);

  const identity = getIdentityLayer(displayMode);
  const Icon = MODE_ICONS[identity.modeIcon] || Briefcase;

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, hsl(${identity.accentColor} / 0.15) 0%, hsl(220 15% 4% / 0.97) 70%)`,
          }}
        >
          {/* Accent ring pulse */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.5, 3], opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute w-32 h-32 rounded-full"
            style={{
              border: `2px solid hsl(${identity.accentColor} / 0.4)`,
            }}
          />

          {/* Second ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 2.2], opacity: [0, 0.2, 0] }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute w-24 h-24 rounded-full"
            style={{
              border: `1px solid hsl(${identity.accentColor} / 0.3)`,
            }}
          />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(${identity.gradientPair[0]}), hsl(${identity.gradientPair[1]}))`,
                boxShadow: `0 0 60px hsl(${identity.accentColor} / 0.3)`,
              }}
            >
              <Icon size={36} className="text-foreground/90" />
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p
                className="text-[18px] font-bold tracking-tight"
                style={{ color: `hsl(${identity.accentColor})` }}
              >
                {MODE_LABELS[displayMode] || displayMode}
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[11px] text-foreground/40 mt-1 max-w-[300px]"
              >
                {identity.tagline}
              </motion.p>
            </motion.div>

            {/* Confirmation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-1.5 mt-2"
            >
              <CheckCircle size={12} className="text-[hsl(152_55%_48%)]" />
              <span className="text-[10px] text-foreground/30">
                Business OS adapted
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

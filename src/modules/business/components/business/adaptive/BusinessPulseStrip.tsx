// ═══════════════════════════════════════════════════════════════
// Business Pulse Strip
// An animated real-time health strip below the header showing
// mode-specific vital metrics — makes the OS feel alive and aware.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Activity, Zap, Clock,
  ShoppingCart, Users, Calendar, DollarSign, Heart,
  Package, Phone, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

interface PulseMetric {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  trendValue: string;
  icon: React.ElementType;
  pulse?: boolean; // animated pulse for urgent metrics
}

const ARCHETYPE_PULSES: Record<string, PulseMetric[]> = {
  ecommerce: [
    { id: "orders", label: "Orders Today", value: "47", trend: "up", trendValue: "+12%", icon: Package },
    { id: "carts", label: "Active Carts", value: "23", trend: "up", trendValue: "+5", icon: ShoppingCart, pulse: true },
    { id: "aov", label: "Avg Order", value: "$84", trend: "up", trendValue: "+$6", icon: DollarSign },
    { id: "conv", label: "Conversion", value: "3.2%", trend: "down", trendValue: "-0.3%", icon: TrendingDown },
    { id: "abandoned", label: "Abandoned", value: "8", trend: "down", trendValue: "+3", icon: ShoppingCart, pulse: true },
  ],
  service: [
    { id: "active", label: "Active Projects", value: "12", trend: "flat", trendValue: "=", icon: Activity },
    { id: "pipeline", label: "Pipeline Value", value: "$48K", trend: "up", trendValue: "+$8K", icon: TrendingUp },
    { id: "response", label: "Avg Response", value: "2.1h", trend: "up", trendValue: "-18min", icon: Clock },
    { id: "proposals", label: "Open Proposals", value: "5", trend: "up", trendValue: "+2", icon: Zap },
    { id: "nps", label: "Client NPS", value: "72", trend: "up", trendValue: "+4", icon: Heart },
  ],
  "brick-and-mortar": [
    { id: "traffic", label: "Store Traffic", value: "142", trend: "up", trendValue: "+15%", icon: Users },
    { id: "sales", label: "Today's Sales", value: "$2.8K", trend: "up", trendValue: "+$400", icon: DollarSign },
    { id: "appts", label: "Walk-ins", value: "18", trend: "flat", trendValue: "=", icon: Calendar },
    { id: "repeat", label: "Repeat Rate", value: "34%", trend: "up", trendValue: "+2%", icon: Heart },
    { id: "reviews", label: "New Reviews", value: "3", trend: "up", trendValue: "+3", icon: TrendingUp },
  ],
  "employee-based": [
    { id: "tasks", label: "Open Tasks", value: "34", trend: "down", trendValue: "-8", icon: Activity },
    { id: "team", label: "Team Active", value: "8/10", trend: "flat", trendValue: "=", icon: Users },
    { id: "blocked", label: "Blocked", value: "2", trend: "down", trendValue: "+1", icon: Zap, pulse: true },
    { id: "velocity", label: "Velocity", value: "94%", trend: "up", trendValue: "+3%", icon: TrendingUp },
    { id: "overdue", label: "Overdue", value: "1", trend: "up", trendValue: "-2", icon: Clock },
  ],
  "appointment-based": [
    { id: "today", label: "Today's Slots", value: "8/12", trend: "flat", trendValue: "=", icon: Calendar },
    { id: "noshows", label: "No-Shows", value: "1", trend: "up", trendValue: "-1", icon: Phone, pulse: true },
    { id: "revenue", label: "Today's Revenue", value: "$1.2K", trend: "up", trendValue: "+$200", icon: DollarSign },
    { id: "waitlist", label: "Waitlist", value: "6", trend: "up", trendValue: "+2", icon: Users },
    { id: "confirm", label: "Unconfirmed", value: "3", trend: "down", trendValue: "+1", icon: Clock },
  ],
  agency: [
    { id: "retainers", label: "Active Retainers", value: "7", trend: "flat", trendValue: "=", icon: DollarSign },
    { id: "pipeline", label: "New Biz Pipeline", value: "$120K", trend: "up", trendValue: "+$25K", icon: TrendingUp },
    { id: "util", label: "Team Utilization", value: "78%", trend: "up", trendValue: "+5%", icon: Activity },
    { id: "deliverables", label: "Due This Week", value: "4", trend: "down", trendValue: "-2", icon: Package },
    { id: "satisfaction", label: "CSAT", value: "4.6", trend: "up", trendValue: "+0.2", icon: Heart },
  ],
};

const TREND_ICONS: Record<string, React.ElementType> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

export default function BusinessPulseStrip() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const metrics = ARCHETYPE_PULSES[primaryMode] || ARCHETYPE_PULSES.service;
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate through metrics for compact view
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % metrics.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [metrics.length]);

  // Simulated micro-updates for "alive" feeling
  const [microPulse, setMicroPulse] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setMicroPulse(true);
      setTimeout(() => setMicroPulse(false), 600);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mx-2 mt-1 rounded-lg overflow-hidden"
      style={{
        background: `linear-gradient(90deg, hsl(${identity.accentColor} / 0.04), hsl(${identity.accentColor} / 0.02), transparent)`,
        border: `1px solid hsl(${identity.accentColor} / 0.08)`,
      }}
    >
      <div className="flex items-center h-[32px] px-3 gap-1">
        {/* Pulse dot */}
        <div className="relative mr-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: `hsl(${identity.accentColor})` }}
          />
          {microPulse && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: `hsl(${identity.accentColor})` }}
            />
          )}
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          {metrics.map((metric, idx) => {
            const TrendIcon = TREND_ICONS[metric.trend];
            const isGood = metric.trend === "up";
            return (
              <motion.div
                key={metric.id}
                initial={false}
                animate={{
                  opacity: 1,
                  scale: idx === activeIndex ? 1.02 : 1,
                }}
                className="flex items-center gap-1.5 shrink-0"
              >
                <metric.icon
                  size={10}
                  className="shrink-0"
                  style={{ color: `hsl(${identity.accentColor} / 0.5)` }}
                />
                <span className="text-[9px] text-foreground/35 whitespace-nowrap">
                  {metric.label}
                </span>
                <span className="text-[10px] font-bold text-foreground/70 whitespace-nowrap">
                  {metric.value}
                </span>
                <span className={`flex items-center gap-0.5 text-[8px] font-medium whitespace-nowrap ${
                  isGood ? "text-[hsl(152_55%_48%)]" : metric.trend === "down" ? "text-[hsl(0_65%_55%)]" : "text-foreground/25"
                }`}>
                  <TrendIcon size={8} />
                  {metric.trendValue}
                </span>
                {metric.pulse && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1 h-1 rounded-full bg-[hsl(var(--sita-gold))]"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Time indicator */}
        <span className="text-[8px] text-foreground/20 shrink-0 ml-2">
          LIVE
        </span>
      </div>
    </motion.div>
  );
}

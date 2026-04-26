// ═══════════════════════════════════════════════════════════════
// SITA OS — CRMHealth page configuration constants
// Extracted to keep the page file free of fixture-shaped arrays.
// ═══════════════════════════════════════════════════════════════
import {
  Heart, TrendingUp, TrendingDown, AlertTriangle, Eye, ShieldAlert,
} from "lucide-react";
import type React from "react";

export type HealthBucket = {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  min: number;
  max: number;
  description: string;
};

export const HEALTH_BUCKETS: HealthBucket[] = [
  { label: "Healthy", icon: Heart, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", min: 80, max: 101, description: "Strong, active relationships" },
  { label: "Warming", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", min: 70, max: 80, description: "Growing engagement" },
  { label: "Stable", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", min: 60, max: 70, description: "Steady, consistent" },
  { label: "Drifting", icon: TrendingDown, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", min: 40, max: 60, description: "Engagement declining" },
  { label: "At Risk", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", min: 20, max: 40, description: "Needs immediate attention" },
  { label: "Critical", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", min: 0, max: 20, description: "Relationship in danger" },
];

export const healthBucketFor = (score: number): HealthBucket =>
  HEALTH_BUCKETS.find((b) => score >= b.min && score < b.max) ?? HEALTH_BUCKETS[5];
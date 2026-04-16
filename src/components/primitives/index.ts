// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Primitives Barrel
// Class: PRIMITIVE — visual building blocks only.
//
// Rules:
//   - No domain logic
//   - No service / hook / page imports
//   - Composes only @/components/ui/** (shadcn) and @/lib/utils
// ═══════════════════════════════════════════════════════════════

// display
export { BaseCard } from "./display/BaseCard";
export type { BaseCardProps, BaseCardVariant, BaseCardPadding } from "./display/BaseCard";
export { Hero } from "./display/Hero";
export type { HeroProps } from "./display/Hero";
export { Summary } from "./display/Summary";
export type { SummaryProps } from "./display/Summary";
export { Panel } from "./display/Panel";
export type { PanelProps } from "./display/Panel";
export { StatTile } from "./display/StatTile";
export type { StatTileProps } from "./display/StatTile";

// status
export { StatusBadge } from "./status/StatusBadge";
export type { StatusBadgeProps, StatusTone, StatusSize } from "./status/StatusBadge";
export { TrustBadge } from "./status/TrustBadge";
export type { TrustBadgeProps, TrustState } from "./status/TrustBadge";
export { UrgencyBadge } from "./status/UrgencyBadge";
export type { UrgencyBadgeProps, UrgencyLevel } from "./status/UrgencyBadge";
export { ProofBadge } from "./status/ProofBadge";
export type { ProofBadgeProps, ProofState } from "./status/ProofBadge";
export { FreshnessBadge } from "./status/FreshnessBadge";
export type { FreshnessBadgeProps, FreshnessLevel } from "./status/FreshnessBadge";
export { ModeBadge } from "./status/ModeBadge";
export type { ModeBadgeProps, Mode } from "./status/ModeBadge";

// feedback
export { EmptyState } from "./feedback/EmptyState";
export type { EmptyStateProps } from "./feedback/EmptyState";
export { Skeleton } from "./feedback/Skeleton";
export type { SkeletonProps } from "./feedback/Skeleton";

// overlays
export { Drawer } from "./overlays/Drawer";
export type { DrawerProps } from "./overlays/Drawer";

// timelines
export { TimelineRow } from "./timelines/TimelineRow";
export type { TimelineRowProps } from "./timelines/TimelineRow";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-App Action Chip
// Inline navigation chip that links to another domain's page
// while preserving origin state via useAppStatePersistence
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAppState } from "@/hooks/useAppStatePersistence";

export interface CrossAppActionProps {
  /** Target route, e.g. "/money/receivables" */
  to: string;
  /** Display label, e.g. "View in Finance" */
  label: string;
  /** Optional entity context to pass (stored in sessionStorage) */
  context?: {
    entityType: string;   // "customer" | "invoice" | "file" | "appointment" etc.
    entityId: string;
    entityLabel?: string;
  };
  /** Visual variant */
  variant?: "inline" | "chip" | "button";
  /** Optional icon override */
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  business: "text-[hsl(265_55%_58%)] bg-[hsl(265_55%_58%/0.08)] border-[hsl(265_55%_58%/0.15)]",
  money: "text-[hsl(152_55%_48%)] bg-[hsl(152_55%_48%/0.08)] border-[hsl(152_55%_48%/0.15)]",
  concierge: "text-[hsl(285_55%_55%)] bg-[hsl(285_55%_55%/0.08)] border-[hsl(285_55%_55%/0.15)]",
  files: "text-[hsl(220_15%_55%)] bg-[hsl(220_15%_55%/0.08)] border-[hsl(220_15%_55%/0.15)]",
};

function domainFromRoute(route: string): string {
  if (route.startsWith("/business")) return "business";
  if (route.startsWith("/money") || route.startsWith("/finance")) return "money";
  if (route.startsWith("/concierge")) return "concierge";
  if (route.startsWith("/files")) return "files";
  return "business";
}

const LINKED_CONTEXT_KEY = "sita-linked-context";

/** Store context for the target page to pick up */
export function setLinkedContext(ctx: CrossAppActionProps["context"]) {
  if (!ctx) return;
  try {
    sessionStorage.setItem(LINKED_CONTEXT_KEY, JSON.stringify({ ...ctx, timestamp: Date.now() }));
  } catch { /* noop */ }
}

/** Retrieve and clear linked context (call on mount in target page) */
export function consumeLinkedContext(): (CrossAppActionProps["context"] & { timestamp: number }) | null {
  try {
    const raw = sessionStorage.getItem(LINKED_CONTEXT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(LINKED_CONTEXT_KEY);
    const parsed = JSON.parse(raw);
    // Only use if less than 30 seconds old
    if (Date.now() - parsed.timestamp > 30000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CrossAppAction({ to, label, context, variant = "chip", icon: IconOverride, className }: CrossAppActionProps) {
  const navigate = useNavigate();
  const domain = domainFromRoute(to);
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.business;
  const Icon = IconOverride || ExternalLink;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Store linked context if provided
    if (context) {
      setLinkedContext(context);
    }
    navigate(to);
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        className={cn("inline-flex items-center gap-1 text-xs font-medium hover:underline transition-colors micro-press", colors.split(" ")[0], className)}
      >
        <Icon className="h-3 w-3" />
        {label}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:brightness-110 micro-press",
          colors,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
      </button>
    );
  }

  // Default: chip
  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all hover:brightness-110 micro-press",
        colors,
        className
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </button>
  );
}

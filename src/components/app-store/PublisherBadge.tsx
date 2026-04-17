// ═══════════════════════════════════════════════════════════════
// PublisherBadge — visual trust tier indicator
// ═══════════════════════════════════════════════════════════════
import { ShieldCheck, Shield, ShieldAlert, Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trustLabel, type TrustBadge as TrustBadgeKind, type TrustResult } from "@/lib/app-platform/trust";
import { cn } from "@/lib/utils";

interface Props {
  trust: TrustResult;
  className?: string;
  compact?: boolean;
}

const ICONS: Record<TrustBadgeKind, typeof ShieldCheck> = {
  internal: Building2,
  verified: ShieldCheck,
  "trusted-domain": Shield,
  community: Users,
  unverified: ShieldAlert,
};

const VARIANTS: Record<TrustBadgeKind, string> = {
  internal: "bg-primary/15 text-primary border-primary/30",
  verified: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "trusted-domain": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  community: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  unverified: "bg-muted text-muted-foreground border-border",
};

export function PublisherBadge({ trust, className, compact = false }: Props) {
  const Icon = ICONS[trust.badge];
  const label = trustLabel(trust.badge);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={cn("gap-1 font-medium border", VARIANTS[trust.badge], className)}>
          <Icon className="h-3 w-3" />
          {!compact && <span>{label}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-semibold mb-1">{label} · trust {trust.score}/100</p>
        <ul className="text-xs space-y-0.5">
          {trust.reasons.map((r, i) => (
            <li key={i}>· {r}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

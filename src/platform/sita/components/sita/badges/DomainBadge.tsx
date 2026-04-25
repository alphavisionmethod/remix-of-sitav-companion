import { BadgeBase } from "./BadgeBase";
import { Briefcase, DollarSign, Heart, FolderOpen, Shield } from "lucide-react";
import type { DomainId } from "@/platform/sita/components/sita/shell/DomainAppShell";
import { DOMAIN_ATMOSPHERE } from "@/platform/design-system/sita-design-tokens";

const ICONS: Record<DomainId, typeof Briefcase> = {
  business: Briefcase,
  finance: DollarSign,
  concierge: Heart,
  files: FolderOpen,
  trust: Shield,
};

export function DomainBadge({ domain, className }: { domain: DomainId; className?: string }) {
  const atm = DOMAIN_ATMOSPHERE[domain];
  const Icon = ICONS[domain];
  return (
    <BadgeBase bg={`${atm.accentFrom.replace(")", " / 0.12)")}`} text={atm.accentFrom} className={className}>
      <Icon className="h-2.5 w-2.5" />
      {atm.label}
    </BadgeBase>
  );
}

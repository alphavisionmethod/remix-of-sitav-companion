import { cn } from "@/lib/utils";
import { Globe, Users, Upload, Link2, PenLine, Handshake, Megaphone, Share2, MessageSquare } from "lucide-react";

export type LeadSource = "website" | "referral" | "import" | "crm-sync" | "manual" | "partner" | "campaign" | "social" | "message";

const sourceConfig: Record<LeadSource, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  website:   { icon: Globe,        label: "Website",   color: "text-[hsl(210,80%,60%)]",  bg: "bg-[hsl(210,80%,60%)]/10" },
  referral:  { icon: Handshake,    label: "Referral",  color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10" },
  import:    { icon: Upload,       label: "Import",    color: "text-muted-foreground",     bg: "bg-muted/30" },
  "crm-sync":{ icon: Link2,        label: "CRM Sync",  color: "text-[hsl(var(--sita-purple))]", bg: "bg-[hsl(var(--sita-purple))]/10" },
  manual:    { icon: PenLine,      label: "Manual",    color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  partner:   { icon: Users,        label: "Partner",   color: "text-[hsl(280,60%,65%)]",  bg: "bg-[hsl(280,60%,65%)]/10" },
  campaign:  { icon: Megaphone,    label: "Campaign",  color: "text-[hsl(350,70%,60%)]",  bg: "bg-[hsl(350,70%,60%)]/10" },
  social:    { icon: Share2,       label: "Social",    color: "text-[hsl(190,70%,50%)]",  bg: "bg-[hsl(190,70%,50%)]/10" },
  message:   { icon: MessageSquare,label: "Message",   color: "text-accent",              bg: "bg-accent/10" },
};

export const LeadSourceBadge = ({ source, size = "sm" }: { source: LeadSource; size?: "xs" | "sm" }) => {
  const cfg = sourceConfig[source] || sourceConfig.manual;
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border border-border/30 font-medium",
      cfg.bg, cfg.color,
      size === "xs" ? "px-1.5 py-px text-[9px]" : "px-2 py-0.5 text-[10px]"
    )}>
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {cfg.label}
    </span>
  );
};

export const getSourceColor = (source: LeadSource) => sourceConfig[source]?.color || "text-muted-foreground";

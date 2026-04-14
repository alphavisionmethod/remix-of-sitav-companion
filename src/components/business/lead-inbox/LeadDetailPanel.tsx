import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { LeadSourceBadge } from "./LeadSourceBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadSource } from "./LeadSourceBadge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Phone, Building2, Globe, Clock, Sparkles, AlertTriangle,
  Check, ArrowRight, Ban, Star, Calendar, FileText, Copy, ShieldAlert, X
} from "lucide-react";

const timeAgo = (dt: string) => {
  const d = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(d / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const InfoRow = ({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground text-xs">{label}:</span>
      <span className="text-foreground text-xs truncate">{value}</span>
    </div>
  );
};

interface Props {
  item: InboxItem | null;
  onClose: () => void;
  onAccept: (id: string) => void;
  onRoute: (id: string, dest: string) => void;
  onReject: (id: string) => void;
  onOpenDuplicate?: (id: string) => void;
}

export const LeadDetailPanel = ({ item, onClose, onAccept, onRoute, onReject, onOpenDuplicate }: Props) => {
  if (!item) return null;

  const trustLevel = item.quality_score >= 75 ? "verified" as const : item.quality_score >= 40 ? "review" as const : "degraded" as const;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-4"
      >
        {/* Hero */}
        <SitaCard hover={false} glow={item.quality_score >= 80} className="text-center p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita font-display text-xl font-bold text-primary-foreground">
            {initials(item.contact_name)}
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-foreground">{item.contact_name}</h3>
          {item.company && <p className="text-xs text-muted-foreground">{item.company}</p>}
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <LeadSourceBadge source={item.source as LeadSource} />
            <TrustBadge level={trustLevel} size="sm" />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Arrived {timeAgo(item.created_at)}
          </p>
        </SitaCard>

        {/* Contact Info */}
        <SitaCard hover={false} className="p-4 space-y-2.5">
          <SitaCardTitle>Contact Details</SitaCardTitle>
          <InfoRow icon={Mail} label="Email" value={item.contact_email} />
          <InfoRow icon={Phone} label="Phone" value={item.contact_phone} />
          <InfoRow icon={Building2} label="Company" value={item.company} />
        </SitaCard>

        {/* Inquiry */}
        {item.inquiry_text && (
          <SitaCard hover={false} className="p-4">
            <SitaCardTitle>Inquiry</SitaCardTitle>
            <p className="mt-2 text-sm text-foreground leading-relaxed">{item.inquiry_text}</p>
          </SitaCard>
        )}

        {/* Quality Assessment */}
        <SitaCard hover={false} className="p-4">
          <SitaCardTitle>Quality Assessment</SitaCardTitle>
          <div className="mt-3 flex items-center gap-4">
            <div className={`font-display text-3xl font-bold ${item.quality_score >= 75 ? "text-[hsl(var(--trust-safe))]" : item.quality_score >= 40 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--trust-degraded))]"}`}>
              {item.quality_score}
            </div>
            <div className="flex-1">
              <div className="h-2.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.quality_score >= 75 ? "bg-[hsl(var(--trust-safe))]" : item.quality_score >= 40 ? "bg-[hsl(var(--sita-gold))]" : "bg-[hsl(var(--trust-degraded))]"}`}
                  style={{ width: `${item.quality_score}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Completeness: {item.completeness_score}%</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.quality_hints.map((h, i) => (
              <span key={i} className="text-[10px] bg-primary/5 text-primary border border-primary/10 rounded-md px-2 py-0.5">{h}</span>
            ))}
          </div>
        </SitaCard>

        {/* Missing Fields */}
        {item.missing_fields.length > 0 && (
          <SitaCard hover={false} className="p-4 border-l-4 border-l-[hsl(var(--sita-gold))]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
              <SitaCardTitle>Missing Information</SitaCardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.missing_fields.map(f => (
                <span key={f} className="text-xs bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] rounded-lg px-2 py-1 capitalize">{f}</span>
              ))}
            </div>
          </SitaCard>
        )}

        {/* Duplicate Warning */}
        {item.duplicate_status !== "none" && (
          <SitaCard hover={false} className="p-4 border-l-4 border-l-[hsl(var(--trust-degraded))]">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="h-4 w-4 text-[hsl(var(--trust-degraded))]" />
              <SitaCardTitle>Duplicate {item.duplicate_status === "definite" ? "Match" : "Possible"}</SitaCardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.duplicate_status === "definite"
                ? "This contact definitively matches an existing record."
                : "This contact may match an existing CRM record. Review before accepting."}
            </p>
            <SitaButton variant="secondary" size="sm" className="mt-2">
              <Copy className="h-3.5 w-3.5" /> Compare & Merge
            </SitaButton>
          </SitaCard>
        )}

        {/* Advisor Recommendation */}
        {item.advisor_suggestion && (
          <SitaCard hover={false} glass className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <SitaCardTitle>Advisor Recommendation</SitaCardTitle>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{item.advisor_suggestion}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Suggested route:</span>
              <span className="text-[11px] font-semibold text-accent capitalize">{item.suggested_route}</span>
              {item.suggested_owner && (
                <>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[11px] font-semibold text-foreground">{item.suggested_owner}</span>
                </>
              )}
            </div>
          </SitaCard>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <SitaButton variant="primary" onClick={() => onAccept(item.id)} className="col-span-2">
            <Check className="h-4 w-4" /> Accept into Leads
          </SitaButton>
          <SitaButton variant="accent" onClick={() => onRoute(item.id, "consult")}>
            <Calendar className="h-3.5 w-3.5" /> Route to Consult
          </SitaButton>
          <SitaButton variant="accent" onClick={() => onRoute(item.id, "quote")}>
            <FileText className="h-3.5 w-3.5" /> Route to Quote
          </SitaButton>
          {item.suggested_route === "boardroom" && (
            <SitaButton variant="secondary" onClick={() => onRoute(item.id, "boardroom")} className="col-span-2 border-[hsl(var(--sita-gold))]/20">
              <Star className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" /> Escalate to Boardroom
            </SitaButton>
          )}
          <SitaButton variant="ghost" onClick={() => onReject(item.id)} className="col-span-2">
            <Ban className="h-3.5 w-3.5" /> Reject / Archive
          </SitaButton>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

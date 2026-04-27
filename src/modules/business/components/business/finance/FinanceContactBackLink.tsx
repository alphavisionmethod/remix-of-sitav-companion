// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance ↔ CRM Back-Link
// ───────────────────────────────────────────────────────────────
// Cross-Module Integration Deepening — Phase 2.
//
// Embedded inside Finance detail surfaces (Invoice, Quote, Collections
// case) to render a structurally-real "Open in CRM" pill. Resolves
// the originating CRM contact via the canonical
// `crm-finance-bridge.service` (no parallel lookup logic), and hands
// off via `setLinkedContext` so the CRM surface lands focused on the
// right contact.
//
// Reuses canonical primitives:
//   - bridge service:    src/lib/services/business-os/crm-finance-bridge.service.ts
//   - cross-app handoff: src/platform/sita/components/sita/CrossAppAction.tsx
//   - data fetching:     @tanstack/react-query
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Link2, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveCrmEntityForCustomer } from "@/lib/services/business-os/crm-finance-bridge.service";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { useAuth } from "@/contexts/AuthContext";

interface FinanceContactBackLinkProps {
  /** Customer id on the finance row (invoice/quote/collections case). */
  customerId: string | null | undefined;
  /** Optional CRM contact id already known on the row — short-circuits the lookup. */
  crmContactId?: string | null;
  /** Optional CRM company id already known on the row. */
  crmCompanyId?: string | null;
  /** Visual density: `pill` (default) for inline header use, `card` for detail panes. */
  variant?: "pill" | "card";
}

export function FinanceContactBackLink({
  customerId,
  crmContactId,
  crmCompanyId,
  variant = "pill",
}: FinanceContactBackLinkProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If the row already carries a CRM id, we can skip the bridge lookup.
  const hasInlineCrm = Boolean(crmContactId || crmCompanyId);

  const query = useQuery({
    queryKey: ["finance-contact-back-link", customerId, user?.id],
    enabled: !!user && !!customerId && !hasInlineCrm,
    queryFn: async () => {
      if (!customerId) return null;
      return resolveCrmEntityForCustomer(customerId);
    },
  });

  const resolved = hasInlineCrm
    ? {
        crm_contact_id: crmContactId ?? null,
        crm_company_id: crmCompanyId ?? null,
        link_id: null,
        contact_name: null as string | null,
        company_name: null as string | null,
      }
    : query.data;

  if (!customerId && !hasInlineCrm) return null;
  if (query.isLoading && !hasInlineCrm) return null;
  if (!resolved || (!resolved.crm_contact_id && !resolved.crm_company_id)) return null;

  const targetType: "contact" | "company" = resolved.crm_contact_id ? "contact" : "company";
  const targetId = resolved.crm_contact_id ?? resolved.crm_company_id!;
  const label =
    resolved.contact_name ?? resolved.company_name ?? (targetType === "contact" ? "Contact" : "Company");

  const handleOpen = () => {
    setLinkedContext({
      entityType: targetType,
      entityId: targetId,
      entityLabel: label,
    });
    navigate("/business/crm");
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left rounded-lg border border-border/50 bg-card/50 px-3 py-2 hover:bg-muted/30 transition-colors flex items-center gap-2"
      >
        <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Linked CRM {targetType}</p>
          <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
            {targetType === "contact" ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            {label}
          </p>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1.5 text-xs"
      onClick={handleOpen}
    >
      <Link2 className="h-3 w-3" />
      <span>Open in CRM</span>
      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
        {label.length > 18 ? `${label.slice(0, 18)}…` : label}
      </Badge>
    </Button>
  );
}
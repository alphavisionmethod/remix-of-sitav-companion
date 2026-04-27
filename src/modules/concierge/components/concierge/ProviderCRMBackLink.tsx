// ═══════════════════════════════════════════════════════════════
// Provider → CRM Back-Link Surface (Phase 3 reverse navigation)
// ───────────────────────────────────────────────────────────────
// Renders an "Open in CRM" link for any concierge entity (provider,
// recurring obligation, household task) that is bridged to a CRM
// contact or company through `household_business_link` or the
// direct FK columns added in Phase 3. Mirrors the Phase 2
// FinanceContactBackLink shape so the validators can treat both
// reverse-navigation surfaces uniformly.
// ═══════════════════════════════════════════════════════════════
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import {
  findCrmLinksForConciergeEntity,
  type ConciergeEntityType,
} from "@/lib/services/concierge/household-business-bridge.service";

interface ProviderCRMBackLinkProps {
  conciergeEntityType: ConciergeEntityType;
  conciergeEntityId: string;
  /** Optional direct CRM ids (when the entity carries them via FK). */
  directCrmContactId?: string | null;
  directCrmCompanyId?: string | null;
  /** Label used for the destination's linked-context label. */
  fallbackLabel?: string;
}

export function ProviderCRMBackLink({
  conciergeEntityType,
  conciergeEntityId,
  directCrmContactId,
  directCrmCompanyId,
  fallbackLabel,
}: ProviderCRMBackLinkProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const linkQuery = useQuery({
    queryKey: ["household-business-link", conciergeEntityType, conciergeEntityId, user?.id],
    enabled: !!user && !directCrmContactId && !directCrmCompanyId,
    queryFn: () => findCrmLinksForConciergeEntity(conciergeEntityType, conciergeEntityId),
  });

  const links = linkQuery.data ?? [];
  const contactId = directCrmContactId ?? links.find((l) => l.crm_contact_id)?.crm_contact_id ?? null;
  const companyId = directCrmCompanyId ?? links.find((l) => l.crm_company_id)?.crm_company_id ?? null;

  if (!contactId && !companyId) return null;

  const open = () => {
    setLinkedContext({
      entityType: contactId ? "contact" : "company",
      entityId: (contactId ?? companyId) as string,
      entityLabel: fallbackLabel ?? "CRM record",
    });
    navigate("/business/crm");
  };

  return (
    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={open}>
      <Users className="h-3 w-3" /> Open in CRM <ExternalLink className="h-3 w-3 opacity-60" />
    </Button>
  );
}
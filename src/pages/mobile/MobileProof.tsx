// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Proof Center
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/components/mobile/MobileShell";
import { ProofCard, type ProofItem } from "@/components/mobile/ProofCard";
import { useNavigate } from "react-router-dom";

const mockProofs: ProofItem[] = [
  { id: "prf-001", type: "receipt", title: "Invoice #1042 payment processed", status: "verified", timestamp: new Date(Date.now() - 1200000).toISOString(), domain: "Finance", hash: "a3f8c1d9e2b4567890abcdef12345678" },
  { id: "prf-002", type: "execution", title: "Lead scoring batch completed", status: "verified", timestamp: new Date(Date.now() - 3600000).toISOString(), domain: "Business", hash: "b7e2a4f1c3d8901234567890abcdef01" },
  { id: "prf-003", type: "verification", title: "Reserve health assessment", status: "verified", timestamp: new Date(Date.now() - 7200000).toISOString(), domain: "Finance", hash: "c9d1b3e5a7f2345678901234abcdef56" },
  { id: "prf-004", type: "execution", title: "Grocery list auto-generated", status: "pending", timestamp: new Date(Date.now() - 10800000).toISOString(), domain: "Concierge" },
  { id: "prf-005", type: "receipt", title: "Subscription cancellation — Dropbox", status: "verified", timestamp: new Date(Date.now() - 14400000).toISOString(), domain: "Finance", hash: "d2e4f6a8b0c1234567890abcdef78901" },
  { id: "prf-006", type: "verification", title: "Calendar conflict resolution", status: "failed", timestamp: new Date(Date.now() - 18000000).toISOString(), domain: "Concierge" },
  { id: "prf-007", type: "receipt", title: "Collections notice sent — Invoice #892", status: "verified", timestamp: new Date(Date.now() - 21600000).toISOString(), domain: "Business", hash: "e5f7a9b1c3d456789012345678abcdef" },
];

const MobileProof = () => {
  const navigate = useNavigate();

  const verified = mockProofs.filter((p) => p.status === "verified").length;

  return (
    <MobileShell title="Proof">
      <div className="flex items-center gap-3 mb-4">
        <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] text-xs font-medium">
          {verified}/{mockProofs.length} verified
        </div>
        <div className="text-xs text-muted-foreground">
          All actions produce immutable receipts
        </div>
      </div>

      <div className="space-y-2">
        {mockProofs.map((item) => (
          <ProofCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/mobile/receipt/${item.id}`)}
          />
        ))}
      </div>
    </MobileShell>
  );
};

export default MobileProof;

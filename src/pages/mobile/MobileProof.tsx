import { MobileShell } from "@/components/mobile/MobileShell";
import { ProofCard, type ProofItem } from "@/components/mobile/ProofCard";
import { useNavigate } from "react-router-dom";
import { useMobileProofs } from "@/hooks/use-domain-data";

const MobileProof = () => {
  const navigate = useNavigate();
  const { data: proofs = [] } = useMobileProofs();
  const verified = proofs.filter((p) => p.status === "verified").length;

  return (
    <MobileShell title="Proof">
      <div className="flex items-center gap-3 mb-4">
        <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] text-xs font-medium">
          {verified}/{proofs.length} verified
        </div>
        <div className="text-xs text-muted-foreground">All actions produce immutable receipts</div>
      </div>
      <div className="space-y-2">
        {proofs.map((item) => (<ProofCard key={item.id} item={item} onClick={() => navigate(`/mobile/receipt/${item.id}`)} />))}
      </div>
    </MobileShell>
  );
};

export default MobileProof;

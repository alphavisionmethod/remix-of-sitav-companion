import { MobileShell } from "@/components/mobile/MobileShell";
import { ProofCard, type ProofItem } from "@/components/mobile/ProofCard";
import { useNavigate } from "react-router-dom";
import { useMobileProofs } from "@/hooks/use-domain-data";
import { Shield, CheckCircle, Clock } from "lucide-react";

const MobileProof = () => {
  const navigate = useNavigate();
  const { data: proofs = [] } = useMobileProofs();
  const verified = proofs.filter((p) => p.status === "verified").length;
  const pending = proofs.filter((p) => p.status === "pending").length;

  return (
    <MobileShell title="Proof">
      <div className="mb-4 p-3 rounded-xl bg-card border border-border/40">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Proof Summary</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{proofs.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <p className="text-lg font-bold text-emerald-500">{verified}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Verified</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <p className="text-lg font-bold text-amber-500">{pending}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">All actions produce immutable receipts</p>
      </div>
      <div className="space-y-2">
        {proofs.map((item) => (<ProofCard key={item.id} item={item} onClick={() => navigate(`/mobile/receipt/${item.id}`)} />))}
      </div>
    </MobileShell>
  );
};

export default MobileProof;

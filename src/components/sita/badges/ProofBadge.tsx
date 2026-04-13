import { BadgeBase } from "./BadgeBase";
import { Hash, CheckCircle } from "lucide-react";

export function ProofBadge({ hash, verified = false, className }: { hash?: string; verified?: boolean; className?: string }) {
  return (
    <BadgeBase bg="hsl(38 85% 58% / 0.12)" text="hsl(38 85% 58%)" className={className}>
      {verified ? <CheckCircle className="h-2.5 w-2.5" /> : <Hash className="h-2.5 w-2.5" />}
      <span className="font-mono">{hash ? hash.slice(0, 8) : "proof"}</span>
    </BadgeBase>
  );
}

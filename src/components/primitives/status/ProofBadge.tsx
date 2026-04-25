import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge, type StatusSize } from "./StatusBadge";

/**
 * ProofBadge — canonical proof / receipt indicator.
 * Class: PRIMITIVE.
 */
export type ProofState = "signed" | "unsigned" | "broken";

const PROOF_TONES: Record<ProofState, "verified" | "muted" | "failed"> = {
  signed:   "verified",
  unsigned: "muted",
  broken:   "failed",
};

const PROOF_LABELS: Record<ProofState, string> = {
  signed:   "Signed",
  unsigned: "Unsigned",
  broken:   "Broken",
};

const PROOF_ICONS: Record<ProofState, JSX.Element> = {
  signed:   <CheckCircle2 className="h-3 w-3" />,
  unsigned: <Lock className="h-3 w-3" />,
  broken:   <AlertCircle className="h-3 w-3" />,
};

export interface ProofBadgeProps {
  state: ProofState;
  size?: StatusSize;
  showIcon?: boolean;
  hash?: string;
  className?: string;
}

export function ProofBadge({ state, size = "sm", showIcon = true, hash, className }: ProofBadgeProps) {
  return (
    <StatusBadge
      tone={PROOF_TONES[state]}
      size={size}
      icon={showIcon ? PROOF_ICONS[state] : undefined}
      className={className}
    >
      {hash ? `${PROOF_LABELS[state]} · ${hash.slice(0, 8)}` : PROOF_LABELS[state]}
    </StatusBadge>
  );
}

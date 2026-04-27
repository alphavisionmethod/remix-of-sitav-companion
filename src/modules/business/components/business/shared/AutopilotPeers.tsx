// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Peer Surfaces (Phase 9)
// Renders the four canonical Autopilot surface peers with their
// honest role tags and one-tap windowed-app navigation. Surface
// passed via `current` is rendered as the active anchor.
// ═══════════════════════════════════════════════════════════════
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutopilotPeerKey =
  | "playbook-builder"
  | "autopilot-hub"
  | "revenue-autopilot"
  | "revenue-impact";

const PEERS: Array<{ key: AutopilotPeerKey; label: string; role: string }> = [
  { key: "playbook-builder", label: "Playbook Builder", role: "Strategy" },
  { key: "autopilot-hub", label: "Autopilot Hub", role: "Setup / Activation" },
  { key: "revenue-autopilot", label: "Revenue Autopilot", role: "Execution" },
  { key: "revenue-impact", label: "Revenue Impact", role: "Result / Proof" },
];

interface AutopilotPeersProps {
  current: AutopilotPeerKey;
  className?: string;
}

/** Inline cross-link bar exposing the four canonical Autopilot surfaces. */
export default function AutopilotPeers({ current, className }: AutopilotPeersProps) {
  const { navigateTo } = useBusinessNavigation();
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      role="navigation"
      aria-label="Autopilot canonical surfaces"
    >
      {PEERS.map((p) => {
        const active = p.key === current;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => !active && navigateTo(p.key)}
            disabled={active}
            className={cn(
              "text-[10px] uppercase tracking-wide rounded-md border px-2 py-1 transition-colors",
              active
                ? "border-primary/40 bg-primary/10 text-primary cursor-default"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border",
            )}
            aria-current={active ? "page" : undefined}
          >
            {p.role} · {p.label}
            {!active && <ArrowUpRight className="ml-1 h-3 w-3 inline-block" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
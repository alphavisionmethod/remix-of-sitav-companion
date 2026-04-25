import { Clock3 } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";
import type { ContinuityContext, DesktopState } from "../useShellState";

interface Props {
  continuity: ContinuityContext;
  desktopState: DesktopState;
}

export function DesktopContinuityPanel({ continuity, desktopState }: Props) {
  const resumeTitle = continuity.lastWorkspace
    ? `Resume ${continuity.lastWorkspace}`
    : "Your workspace is ready";
  const resumeDescription = continuity.whatChanged.length > 0
    ? continuity.whatChanged.slice(0, 2).join(". ") + "."
    : "Pick up where you left off — your environment is preserved.";

  return (
    <DesktopWidgetCard
      title="Continuity"
      className="min-h-[280px]"
    >
      {/* Ambient breathing glow */}
      <div className="absolute -inset-4 rounded-[32px] bg-[radial-gradient(ellipse_at_center,rgba(114,92,255,0.2),transparent_60%)] animate-[pulse_4s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs text-white/70">
            <Clock3 className="h-3.5 w-3.5" />
            {desktopState === "returning" ? "Resume suggested" : "Ready"}
          </div>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white">
            {resumeTitle}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
            {resumeDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow transition hover:scale-[1.02]">
              Continue
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm text-white/80 backdrop-blur-xl transition hover:bg-white/[0.12]">
              Ask advisors
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Active app</div>
            <div className="mt-2 text-lg font-medium text-white">
              {continuity.lastWorkspace ?? "Desktop"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pending</div>
            <div className="mt-2 text-lg font-medium text-white">
              {continuity.pendingDrafts + continuity.unfinishedWorkflows} items
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Trust posture</div>
            <div className="mt-2 text-lg font-medium text-cyan-300">Review-first</div>
            <div className="mt-1 text-sm text-white/55">High-impact actions gated</div>
          </div>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}

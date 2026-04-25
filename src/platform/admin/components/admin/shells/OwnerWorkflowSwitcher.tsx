// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Workflow Switcher (Phase 25)
// Lets the operator pick one of the 5 canonical owner workflows.
// Selecting a workflow navigates to its entry hub and pins a
// sticky stepper for the remaining steps. Active workflow is
// persisted in sessionStorage so traversal across pages keeps the
// stepper context.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, Workflow } from "lucide-react";
import {
  OWNER_WORKFLOWS,
  type OwnerWorkflowKey,
  getAllWorkflows,
} from "@/platform/architecture/owner-workflow-map";

const STORAGE_KEY = "sita.admin.activeWorkflow";

function readStored(): OwnerWorkflowKey | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v && v in OWNER_WORKFLOWS) return v as OwnerWorkflowKey;
  } catch {}
  return null;
}

export function OwnerWorkflowSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<OwnerWorkflowKey | null>(() => readStored());

  useEffect(() => {
    try {
      if (active) sessionStorage.setItem(STORAGE_KEY, active);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, [active]);

  const all = useMemo(() => getAllWorkflows(), []);
  const w = active ? OWNER_WORKFLOWS[active] : null;
  const currentStepIdx = useMemo(() => {
    if (!w) return -1;
    return w.steps.findIndex((s) => s.route === location.pathname);
  }, [w, location.pathname]);

  return (
    <div className="border-b border-border/50 bg-card/40 px-6 py-1.5 flex items-center gap-2 overflow-x-auto">
      <Workflow className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
        Workflow
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {all.map((wf) => (
          <Button
            key={wf.key}
            variant={active === wf.key ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => {
              setActive(wf.key);
              navigate(wf.entry);
            }}
            title={wf.description}
          >
            {wf.label}
          </Button>
        ))}
        {active && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2 text-muted-foreground"
            onClick={() => setActive(null)}
          >
            Clear
          </Button>
        )}
      </div>

      {w && (
        <div className="flex items-center gap-1 ml-3 min-w-0">
          <Badge variant="outline" className="text-[9px] h-4 shrink-0">
            {w.label}
          </Badge>
          <div className="flex items-center gap-1 overflow-x-auto">
            {w.steps.map((s, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = currentStepIdx >= 0 && idx < currentStepIdx;
              return (
                <button
                  key={s.route}
                  onClick={() => navigate(s.route)}
                  title={s.intent}
                  className={cn(
                    "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : isPast
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <span className="font-mono">{idx + 1}</span>
                  <span className="hidden md:inline">{s.intent}</span>
                  {idx < w.steps.length - 1 && (
                    <ChevronRight className="h-2.5 w-2.5 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

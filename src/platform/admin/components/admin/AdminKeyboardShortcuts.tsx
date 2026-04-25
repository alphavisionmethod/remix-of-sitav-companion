import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHORTCUT_GROUPS = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show shortcuts overlay" },
      { keys: ["⌘", "R"], description: "Refresh current view" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "H"], description: "Go to Mission Control Home" },
      { keys: ["G", "I"], description: "Go to Incidents" },
      { keys: ["G", "D"], description: "Go to Deployment" },
      { keys: ["G", "P"], description: "Go to Proof Matrix" },
      { keys: ["G", "O"], description: "Go to Operations" },
      { keys: ["Esc"], description: "Close current overlay" },
    ],
  },
  {
    title: "Investigation",
    shortcuts: [
      { keys: ["F"], description: "Focus evidence drawer" },
      { keys: ["T"], description: "Open trace view" },
      { keys: ["M"], description: "Open metrics panel" },
      { keys: ["P"], description: "Open proof panel" },
    ],
  },
];

const GO_ROUTES: Record<string, string> = {
  h: "/admin/mission-control",
  i: "/admin/incidents",
  d: "/admin/deployment",
  p: "/admin/proof-matrix",
  o: "/admin/operations",
  c: "/admin/connectors",
  f: "/admin/fleet-health",
  s: "/admin/security-posture",
  l: "/admin/launch-readiness",
  r: "/admin/release-ring",
  n: "/admin/intelligence",
  t: "/admin/implementation-truth",
};

export function AdminKeyboardShortcuts() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [awaitingG, setAwaitingG] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // ? to show shortcuts (only when not in input)
      if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowOverlay(o => !o);
        return;
      }

      // Skip all non-meta shortcuts when in input
      if (isInput) return;

      // G then letter navigation
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        setAwaitingG(true);
        gTimer = setTimeout(() => setAwaitingG(false), 1000);
        return;
      }

      if (awaitingG) {
        const route = GO_ROUTES[e.key];
        if (route) {
          e.preventDefault();
          navigate(route);
        }
        setAwaitingG(false);
        clearTimeout(gTimer);
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      clearTimeout(gTimer);
    };
  }, [awaitingG, navigate]);

  return (
    <Dialog open={showOverlay} onOpenChange={setShowOverlay}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.title}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group.title}</h3>
              <div className="space-y-1.5">
                {group.shortcuts.map(s => (
                  <div key={s.description} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{s.description}</span>
                    <div className="flex gap-1">
                      {s.keys.map(k => (
                        <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded text-muted-foreground">{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open command palette" },
  { keys: ["⌘", "B"], description: "Toggle sidebar" },
  { keys: ["⌘", "J"], description: "Open advisor chat" },
  { keys: ["⌘", "/"], description: "Global search" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["G", "H"], description: "Go to Home / Daily Pulse" },
  { keys: ["G", "B"], description: "Go to Business" },
  { keys: ["G", "M"], description: "Go to Money" },
  { keys: ["G", "C"], description: "Go to Concierge" },
  { keys: ["G", "S"], description: "Go to Settings" },
  { keys: ["Esc"], description: "Close panel / dialog" },
];

export const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                  <span className="text-sm text-foreground">{s.description}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, ki) => (
                      <kbd key={ki} className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-border bg-secondary px-1.5 text-[11px] font-mono font-medium text-muted-foreground">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-3">
              <p className="text-[10px] text-muted-foreground text-center">Press <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px] font-mono">?</kbd> to toggle</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

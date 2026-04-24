// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Receipt Chip (Phase G)
// ═══════════════════════════════════════════════════════════════
// 3-second glassy receipt near the HUD orb after Sita acts.
// Listens for `sita-receipt` CustomEvents and offers Undo when
// the action is reversible.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Undo2 } from "lucide-react";

interface ReceiptDetail {
  id: string;
  label: string;
  reversible?: boolean;
  onUndo?: () => void;
}

export function SitaTrustReceiptChip() {
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ReceiptDetail | undefined;
      if (!detail?.label) return;
      setReceipt(detail);
      const t = setTimeout(() => setReceipt(null), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener("sita-receipt", handler);
    return () => window.removeEventListener("sita-receipt", handler);
  }, []);

  return (
    <AnimatePresence>
      {receipt && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-2 rounded-full bg-background/70 backdrop-blur-xl border border-border shadow-lg text-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-foreground/90">{receipt.label}</span>
          {receipt.reversible && receipt.onUndo && (
            <button
              onClick={() => { receipt.onUndo?.(); setReceipt(null); }}
              className="ml-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
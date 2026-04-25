import { useRef, useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PriorityOrderChip } from "./PriorityOrderChip";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface PriorityReorderStripProps {
  items: { id: string; label: string }[];
  onReorder: (newOrder: string[]) => void;
  onRemove: (id: string) => void;
}

export function PriorityReorderStrip({ items, onReorder, onRemove }: PriorityReorderStripProps) {
  const dragIdx = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeTouch, setActiveTouch] = useState<string | null>(null);

  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    dragIdx.current = idx;
    const el = e.currentTarget.closest('[data-chip]') as HTMLElement;
    if (!el || !stripRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const chipWidth = Math.max(el.offsetWidth + 8, 60);
    let hasMoved = false;

    const onMove = (me: PointerEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;

      // On touch devices, ignore vertical scrolls
      if (!hasMoved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        dragIdx.current = null;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        return;
      }
      if (Math.abs(dx) > 4) hasMoved = true;

      const shift = Math.round(dx / chipWidth);
      if (shift !== 0 && dragIdx.current !== null) {
        const newIdx = Math.max(0, Math.min(items.length - 1, dragIdx.current + shift));
        if (newIdx !== dragIdx.current) {
          const ids = items.map(i => i.id);
          const [moved] = ids.splice(dragIdx.current, 1);
          ids.splice(newIdx, 0, moved);
          dragIdx.current = newIdx;
          onReorder(ids);
        }
      }
    };

    const onUp = () => {
      dragIdx.current = null;
      setActiveTouch(null);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    setActiveTouch(items[idx]?.id ?? null);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [items, onReorder]);

  // Tap-to-move for mobile: move item left/right by one position
  const moveItem = useCallback((idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    const ids = items.map(i => i.id);
    const [moved] = ids.splice(idx, 1);
    ids.splice(newIdx, 0, moved);
    onReorder(ids);
  }, [items, onReorder]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-medium text-foreground/70">Your priorities</p>
        {items.length >= 2 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 hidden sm:flex">
            <ArrowUpDown className="h-3 w-3" /> Drag to reorder
          </span>
        )}
        {items.length >= 2 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 sm:hidden">
            <ArrowUpDown className="h-3 w-3" /> Tap arrows to reorder
          </span>
        )}
      </div>
      <div ref={stripRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <div key={item.id} data-chip className="flex items-center gap-0.5 shrink-0">
              {/* Mobile reorder arrows */}
              {items.length >= 2 && (
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="sm:hidden p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity touch-manipulation"
                  aria-label="Move left"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <div className={activeTouch === item.id ? "ring-1 ring-primary/40 rounded-lg" : ""}>
                <PriorityOrderChip
                  index={idx}
                  label={item.label}
                  onRemove={() => onRemove(item.id)}
                  onPointerDown={(e) => handlePointerDown(idx, e)}
                />
              </div>
              {items.length >= 2 && (
                <button
                  type="button"
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="sm:hidden p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity touch-manipulation"
                  aria-label="Move right"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PriorityReorderStrip;
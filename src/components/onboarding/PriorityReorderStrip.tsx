import { useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { PriorityOrderChip } from "./PriorityOrderChip";
import { ArrowUpDown } from "lucide-react";

interface PriorityReorderStripProps {
  items: { id: string; label: string }[];
  onReorder: (newOrder: string[]) => void;
  onRemove: (id: string) => void;
}

export function PriorityReorderStrip({ items, onReorder, onRemove }: PriorityReorderStripProps) {
  const dragIdx = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    dragIdx.current = idx;
    const el = e.currentTarget.closest('[data-chip]') as HTMLElement;
    if (!el || !stripRef.current) return;

    const startX = e.clientX;
    const chipWidth = el.offsetWidth + 8;

    const onMove = (me: PointerEvent) => {
      const dx = me.clientX - startX;
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
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [items, onReorder]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-medium text-foreground/70">Your priorities</p>
        {items.length >= 2 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Drag to reorder
          </span>
        )}
      </div>
      <div ref={stripRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <div key={item.id} data-chip>
              <PriorityOrderChip
                index={idx}
                label={item.label}
                onRemove={() => onRemove(item.id)}
                onPointerDown={(e) => handlePointerDown(idx, e)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PriorityReorderStrip;
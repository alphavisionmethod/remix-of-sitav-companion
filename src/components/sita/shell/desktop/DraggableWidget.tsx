import { useState, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  position: { x: number; y: number };
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

export function DraggableWidget({ id, position, onMove, onRemove, children, className, dragConstraints }: DraggableWidgetProps) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragControls = useDragControls();

  const handleDragEnd = useCallback((_: any, info: any) => {
    onMove(id, position.x + info.offset.x, position.y + info.offset.y);
    setDragging(false);
  }, [id, position, onMove]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileDrag={{ scale: 1.02, zIndex: 50 }}
      style={{ position: "absolute", left: position.x, top: position.y }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "transition-shadow duration-200 group",
        dragging && "z-50 shadow-[0_0_30px_rgba(114,92,255,0.3)]",
        className
      )}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove(id);
      }}
    >
      {/* Drag handle — always partially visible, fully visible on hover */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] opacity-40 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to move"
      >
        <GripHorizontal className="h-3.5 w-3.5 text-white/50" />
      </div>
      {/* Remove button — always visible on hover with clear styling */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className={cn(
          "absolute -top-2.5 -right-2.5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 border border-white/[0.15] text-white/50 hover:text-white hover:bg-red-500/90 hover:border-red-400/50 transition-all shadow-lg",
          hovered && !dragging ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
        title="Remove widget"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Interactive children — stopPropagation so clicks don't trigger drag */}
      <div onPointerDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </motion.div>
  );
}

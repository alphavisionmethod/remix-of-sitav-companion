import { useState, useCallback, useRef } from "react";
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
      {/* Drag handle — visible on hover, this is the ONLY drag trigger */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 flex items-center justify-center rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripHorizontal className="h-3 w-3 text-white/40" />
      </div>
      {/* Remove button on hover */}
      {hovered && !dragging && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(id); }}
          className="absolute -top-2 -right-2 z-50 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-red-500/80 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {/* Interactive children — receive all clicks normally */}
      {children}
    </motion.div>
  );
}

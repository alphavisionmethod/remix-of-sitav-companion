import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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
  const constraintsRef = useRef<HTMLDivElement | null>(null);

  const handleDragEnd = useCallback((_: any, info: any) => {
    onMove(id, position.x + info.offset.x, position.y + info.offset.y);
    setDragging(false);
  }, [id, position, onMove]);

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      whileDrag={{ scale: 1.02, zIndex: 50 }}
      style={{ position: "absolute", left: position.x, top: position.y }}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow duration-200 group",
        dragging && "z-50 shadow-[0_0_30px_rgba(114,92,255,0.3)]",
        className
      )}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove(id);
      }}
    >
      {/* Grab handle — visible on hover */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      {/* Remove button on hover */}
      {hovered && !dragging && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(id); }}
          className="absolute -top-2 -right-2 z-50 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white hover:bg-red-500/80 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {children}
    </motion.div>
  );
}

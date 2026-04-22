import React, { useState, useCallback, useRef, useEffect } from "react";
import { DEMO_APPS, type DemoAppId } from "./demo-data";
import { AppIconRenderer } from "./AppIconRenderer";
import { cn } from "@/lib/utils";

interface Props {
  onOpen: (id: DemoAppId) => void;
}

const STORAGE_KEY = "sita:demo-icon-order";

function loadOrder(): DemoAppId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoAppId[];
      // Validate all ids exist
      const valid = DEMO_APPS.map(a => a.id);
      if (parsed.length === valid.length && parsed.every(id => valid.includes(id))) return parsed;
    }
  } catch {}
  return DEMO_APPS.map(a => a.id);
}

export function DemoDesktopIcons({ onOpen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<DemoAppId[]>(loadOrder);
  const dragIdx = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  const handleDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    const from = dragIdx.current;
    if (from === null || from === idx) { setDragOver(null); return; }
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    dragIdx.current = null;
    setDragOver(null);
  }, []);

  const orderedApps = order.map(id => DEMO_APPS.find(a => a.id === id)!).filter(Boolean);

  return (
    <div className="absolute top-10 right-6 flex flex-col gap-5 z-10">
      {orderedApps.map((app, idx) => {
        return (
          <button
            key={app.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => setDragOver(null)}
            onClick={() => setSelected(app.id)}
            onDoubleClick={() => onOpen(app.id)}
            className={cn(
              "flex flex-col items-center gap-1 group transition-transform duration-200",
              dragOver === idx && "scale-110 opacity-60",
            )}
          >
            <div className={cn(
              "rounded-[22%] transition-all",
              selected === app.id && "ring-2 ring-blue-400/80",
            )}>
              <AppIconRenderer appId={app.id} size={60} glowOnHover />
            </div>
            <span className={cn(
              "text-[10px] text-white/80 font-medium px-1 rounded",
              selected === app.id && "bg-blue-500/60",
            )}>{app.label}</span>
          </button>
        );
      })}
    </div>
  );
}
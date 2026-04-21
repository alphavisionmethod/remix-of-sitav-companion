import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoAppId } from "./demo-data";

export interface DemoWindow {
  id: string;
  appId: DemoAppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface Props {
  windows: DemoWindow[];
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  renderContent: (appId: DemoAppId) => React.ReactNode;
}

export function DemoWindowManager({ windows, onClose, onFocus, onMinimize, onMaximize, renderContent }: Props) {
  return (
    <AnimatePresence>
      {windows.filter((w) => !w.minimized).map((win) => (
        <DemoFloatingWindow key={win.id} win={win} onClose={onClose}
          onFocus={onFocus} onMinimize={onMinimize} onMaximize={onMaximize}>
          {renderContent(win.appId)}
        </DemoFloatingWindow>
      ))}
    </AnimatePresence>
  );
}

function DemoFloatingWindow({ win, onClose, onFocus, onMinimize, onMaximize, children }: {
  win: DemoWindow; children: React.ReactNode;
  onClose: (id: string) => void; onFocus: (id: string) => void;
  onMinimize: (id: string) => void; onMaximize: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus(win.id);
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos, win.id, onFocus]);

  const isMax = win.maximized;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute"
      style={{
        left: isMax ? 0 : pos.x,
        top: isMax ? 28 : pos.y,
        width: isMax ? "100%" : win.w,
        height: isMax ? "calc(100% - 28px - 72px)" : win.h,
        zIndex: win.z,
      }}
      onMouseDown={() => onFocus(win.id)}
    >
      <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.12] shadow-2xl flex flex-col"
        style={{ background: "rgba(20,20,30,0.82)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
        {/* Title bar */}
        <div className="h-10 shrink-0 flex items-center px-3 gap-2 border-b border-white/[0.08] cursor-grab select-none"
          onMouseDown={handleMouseDown}>
          <div className="flex gap-1.5">
            <button onClick={() => onClose(win.id)} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition" />
            <button onClick={() => onMinimize(win.id)} className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition" />
            <button onClick={() => onMaximize(win.id)} className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition" />
          </div>
          <span className="flex-1 text-center text-xs text-white/60 font-medium">{win.title}</span>
          <div className="w-12" />
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </motion.div>
  );
}
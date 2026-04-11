// ═══════════════════════════════════════════════════════════════
// NovaOS — Click Ripple (Micro-Detail)
// Subtle expanding circle on mousedown, pure CSS animation
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let rippleId = 0;

export function ClickRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const id = ++rippleId;
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);

      // Self-remove after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 400);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {ripples.map(r => (
        <div
          key={r.id}
          className="absolute rounded-full"
          style={{
            left: r.x - 12,
            top: r.y - 12,
            width: 24,
            height: 24,
            background: "hsl(265 60% 70% / 0.15)",
            animation: "nova-ripple 400ms ease-out forwards",
          }}
        />
      ))}
      <style>{`
        @keyframes nova-ripple {
          0% {
            transform: scale(1);
            opacity: 0.15;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

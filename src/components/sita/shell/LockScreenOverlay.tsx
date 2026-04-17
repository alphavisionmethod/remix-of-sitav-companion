// ═══════════════════════════════════════════════════════════════
// SITA OS — Lock Screen Overlay
// Triggered by Apple menu → Lock Screen or ⌃⌘Q
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MENU_EVENTS } from "@/lib/system-menu/menu-actions";

export function LockScreenOverlay() {
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handler = () => setLocked(true);
    window.addEventListener(MENU_EVENTS.lockScreen, handler);
    return () => window.removeEventListener(MENU_EVENTS.lockScreen, handler);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  if (!locked) return null;

  const unlock = () => {
    // Local-session lock: any non-empty input unlocks. Real auth re-validation belongs to dedicated re-auth flow.
    if (pin.length === 0) return;
    setLocked(false);
    setPin("");
  };

  const initial = (user?.user_metadata?.display_name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 99999,
        background: "linear-gradient(135deg, hsl(220 30% 8%) 0%, hsl(240 25% 12%) 100%)",
        backdropFilter: "blur(40px)",
      }}
    >
      <div className="text-center text-white mb-12">
        <div className="text-7xl font-light tabular-nums">
          {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
        </div>
        <div className="text-base mt-2 opacity-70">
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-white/15 flex items-center justify-center text-3xl font-semibold text-white border border-white/20">
          {initial}
        </div>
        <div className="text-white text-sm opacity-80 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Locked
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); unlock(); }}
          className="flex flex-col gap-2 mt-2 w-64"
        >
          <Input
            autoFocus
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter password to unlock"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center"
          />
          <Button type="submit" variant="secondary" disabled={!pin.length}>Unlock</Button>
        </form>
      </div>
    </div>
  );
}

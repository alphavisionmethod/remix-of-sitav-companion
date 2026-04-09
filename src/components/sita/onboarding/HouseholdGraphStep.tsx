import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const roles = ["Partner", "Family", "Team", "Assistant", "Client", "Advisor", "Entity"];

const ROLE_COLORS: Record<string, string> = {
  Partner: "hsl(265 55% 58%)",
  Family: "hsl(152 55% 48%)",
  Team: "hsl(38 85% 58%)",
  Assistant: "hsl(200 70% 55%)",
  Client: "hsl(340 65% 55%)",
  Advisor: "hsl(280 50% 55%)",
  Entity: "hsl(180 40% 50%)",
};

interface HouseholdNode {
  name: string;
  role: string;
}

interface HouseholdGraphStepProps {
  nodes: HouseholdNode[];
  onUpdate: (nodes: HouseholdNode[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function HouseholdGraphStep({ nodes, onUpdate, onNext, onPrev }: HouseholdGraphStepProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(roles[0]);
  const reduced = useReducedMotion();

  const addNode = () => {
    if (!name.trim()) return;
    onUpdate([...nodes, { name: name.trim(), role }]);
    setName("");
  };

  const removeNode = (idx: number) => {
    onUpdate(nodes.filter((_, i) => i !== idx));
  };

  // Calculate positions for visual graph (radial layout around center "You" node)
  const getNodePosition = (index: number, total: number) => {
    const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = total <= 3 ? 90 : total <= 6 ? 100 : 110;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? {} : { opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Your world</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Add the people and entities that matter. This builds your relationship graph.</p>
        <p className="text-[10px] text-muted-foreground/60 mt-2 italic">
          This is private — skip if you prefer. You can add people anytime later.
        </p>
      </div>

      {/* Role chips */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</p>
        <div className="flex flex-wrap gap-1.5">
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border",
                role === r
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/20"
              )}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Add form */}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addNode()}
          placeholder="Name..."
          className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <button onClick={addNode} disabled={!name.trim()}
          className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Visual Node Graph */}
      <div className="min-h-[260px] rounded-2xl border border-border bg-card/50 p-4 flex items-center justify-center">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">Add people to start building your graph</p>
          </div>
        ) : (
          <div className="relative" style={{ width: 260, height: 260 }}>
            {/* Center "You" node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 border-2 border-primary/30">
                <span className="text-xs font-bold text-primary-foreground">You</span>
              </div>
            </div>

            {/* Connection lines + person nodes */}
            <AnimatePresence mode="popLayout">
              {nodes.map((n, i) => {
                const pos = getNodePosition(i, nodes.length);
                const roleColor = ROLE_COLORS[n.role] || "hsl(265 55% 58%)";
                return (
                  <motion.div
                    key={`${n.name}-${i}`}
                    initial={reduced ? {} : { opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduced ? {} : { opacity: 0, scale: 0.5 }}
                    className="absolute top-1/2 left-1/2 z-20"
                    style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
                  >
                    {/* Connection line (SVG would be cleaner but this is simpler) */}
                    <div
                      className="absolute top-1/2 left-1/2 origin-left h-px opacity-20"
                      style={{
                        width: Math.sqrt(pos.x * pos.x + pos.y * pos.y),
                        transform: `rotate(${Math.atan2(-pos.y, -pos.x)}rad)`,
                        backgroundColor: roleColor,
                      }}
                    />
                    {/* Person node */}
                    <div className="relative group cursor-pointer">
                      <div
                        className="h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110"
                        style={{ backgroundColor: `${roleColor}20`, borderColor: `${roleColor}40` }}
                      >
                        <span className="text-[10px] font-bold" style={{ color: roleColor }}>
                          {n.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {/* Label */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <p className="text-[9px] font-semibold text-foreground">{n.name}</p>
                      </div>
                      {/* Role badge */}
                      <div
                        className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[7px] font-bold"
                        style={{ backgroundColor: `${roleColor}25`, color: roleColor }}
                      >
                        {n.role.slice(0, 3)}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeNode(i)}
                        className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Node list (compact) */}
      {nodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {nodes.map((n, i) => (
            <span key={`list-${n.name}-${i}`}
              className="text-[10px] text-muted-foreground bg-secondary/30 rounded-full px-2 py-0.5">
              {n.name} · {n.role}
            </span>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">You can always add more people later from Settings</p>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
        <button onClick={onNext}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2">
          Continue <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

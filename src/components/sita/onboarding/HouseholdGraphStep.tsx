import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const roles = ["Partner", "Family", "Team", "Assistant", "Client", "Advisor", "Entity"];

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

  const addNode = () => {
    if (!name.trim()) return;
    onUpdate([...nodes, { name: name.trim(), role }]);
    setName("");
  };

  const removeNode = (idx: number) => {
    onUpdate(nodes.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">Your world</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Add the people and entities that matter. This builds your relationship graph.</p>
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
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={addNode} disabled={!name.trim()}
          className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Node display */}
      <div className="min-h-[120px] rounded-2xl border border-border bg-card/50 p-4">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">Add people to start building your graph</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {nodes.map((n, i) => (
                <motion.div
                  key={`${n.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-3 pr-1.5 py-1.5"
                >
                  <span className="text-xs font-semibold text-foreground">{n.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{n.role}</span>
                  <button onClick={() => removeNode(i)} className="rounded-full p-0.5 hover:bg-destructive/10 transition-colors">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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

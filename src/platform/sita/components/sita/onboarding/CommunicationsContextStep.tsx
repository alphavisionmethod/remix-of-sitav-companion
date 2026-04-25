import { motion } from "framer-motion";
import { MessageSquare, ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommsContextData {
  communicationStress: string;
  supportNeeds: string[];
}

const STRESS_LEVELS = [
  { id: "none", label: "Not really", desc: "Messages are manageable" },
  { id: "some", label: "Sometimes", desc: "Things pile up occasionally" },
  { id: "often", label: "Often", desc: "I miss or delay replies regularly" },
  { id: "overwhelming", label: "Overwhelming", desc: "Messages are a major stressor" },
];

const SUPPORT_NEEDS = [
  { id: "summaries", label: "Summaries", desc: "Digest of what matters" },
  { id: "follow-up-queue", label: "Follow-up queue", desc: "Who needs a reply" },
  { id: "draft-help", label: "Draft help", desc: "Suggested responses" },
  { id: "reply-triage", label: "Reply triage", desc: "Priority sorting" },
];

interface Props {
  data: CommsContextData;
  onUpdate: (data: CommsContextData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const CommunicationsContextStep = ({ data, onUpdate, onNext, onPrev }: Props) => {
  const toggle = (val: string) => {
    const arr = data.supportNeeds;
    onUpdate({ ...data, supportNeeds: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Communications</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Do messages create stress?</h2>
        <p className="text-sm text-muted-foreground mt-1">SITA can help manage your communication load</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          {STRESS_LEVELS.map(s => (
            <button key={s.id} onClick={() => onUpdate({ ...data, communicationStress: s.id })}
              className={cn("w-full rounded-xl border p-4 text-left transition-all",
                data.communicationStress === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>

        {data.communicationStress && data.communicationStress !== "none" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <p className="text-xs text-muted-foreground mb-3">What communication support would help?</p>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_NEEDS.map(n => {
                const sel = data.supportNeeds.includes(n.id);
                return (
                  <button key={n.id} onClick={() => toggle(n.id)}
                    className={cn("rounded-xl border p-3 text-left transition-all",
                      sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.desc}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Inline preview */}
        {data.supportNeeds.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-2">Preview</p>
            <p className="text-[11px] text-muted-foreground">
              SITA will provide: {data.supportNeeds.map(n => SUPPORT_NEEDS.find(s => s.id === n)?.label).filter(Boolean).join(", ")}
            </p>
          </motion.div>
        )}

        {/* Show what this changes (Req #8) */}
        {data.communicationStress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">This changes</p>
            <p className="text-[11px] text-muted-foreground">
              Notification frequency: <span className="text-foreground">{data.communicationStress === "overwhelming" ? "reduced, batched" : data.communicationStress === "often" ? "smart filtering" : "standard"}</span> · 
              Desktop widget: <span className="text-foreground">{data.supportNeeds.length > 0 ? "reply queue active" : "communication overview"}</span>
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={onPrev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>
        <button onClick={onNext} disabled={!data.communicationStress}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
          Continue <ChevronRight className="inline h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

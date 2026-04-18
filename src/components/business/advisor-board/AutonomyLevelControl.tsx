import { motion } from "framer-motion";
import { AUTONOMY_LEVELS, ALL_DOMAINS, type TrustModeState, type AutonomyDomain, type AutonomyLevel } from "@/domains/engines/business-autonomy-engine";

interface Props {
  state: TrustModeState;
  onDomainChange: (domain: AutonomyDomain, level: AutonomyLevel) => void;
  onGlobalChange: (level: AutonomyLevel) => void;
}

const domainLabels: Record<AutonomyDomain, string> = {
  email: "Email",
  files: "Files",
  finance: "Finance",
  crm: "CRM",
  calendar: "Calendar",
  messaging: "Messaging",
  scheduling: "Scheduling",
  "team-workflows": "Team Workflows",
  notifications: "Notifications",
  "outbound-communication": "Outbound Comms",
};

export function AutonomyLevelControl({ state, onDomainChange, onGlobalChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
    >
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Autonomy Controls</h3>

      {/* Global level */}
      <div className="mb-4">
        <p className="text-[9px] text-muted-foreground mb-1.5">Global Level</p>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5, 6] as AutonomyLevel[]).map(level => {
            const cfg = AUTONOMY_LEVELS[level];
            const active = state.globalLevel === level;
            return (
              <button
                key={level}
                onClick={() => onGlobalChange(level)}
                className={`flex-1 rounded-md px-1 py-1.5 text-center transition-all border ${
                  active
                    ? `border-[hsl(${cfg.color}/0.4)] bg-[hsl(${cfg.color}/0.1)]`
                    : "border-[hsl(0_0%_100%/0.04)] bg-transparent hover:bg-[hsl(0_0%_100%/0.03)]"
                }`}
              >
                <p className={`text-[10px] font-bold ${active ? "" : "text-muted-foreground"}`} style={active ? { color: `hsl(${cfg.color})` } : {}}>
                  L{level}
                </p>
                <p className="text-[7px] text-muted-foreground leading-tight">{cfg.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain levels */}
      <div className="space-y-1.5">
        {ALL_DOMAINS.map(domain => {
          const policy = state.domainPolicies.find(p => p.domain === domain);
          const level = policy?.level ?? 2;
          const cfg = AUTONOMY_LEVELS[level];
          return (
            <div key={domain} className="flex items-center justify-between gap-2">
              <span className="text-[9px] text-muted-foreground w-24 truncate">{domainLabels[domain]}</span>
              <div className="flex gap-0.5 flex-1">
                {([1, 2, 3, 4, 5, 6] as AutonomyLevel[]).map(l => {
                  const lCfg = AUTONOMY_LEVELS[l];
                  const active = level === l;
                  return (
                    <button
                      key={l}
                      onClick={() => onDomainChange(domain, l)}
                      className={`w-5 h-5 rounded text-[8px] font-bold transition-all ${
                        active
                          ? `bg-[hsl(${lCfg.color}/0.2)] border border-[hsl(${lCfg.color}/0.4)]`
                          : "bg-transparent hover:bg-[hsl(0_0%_100%/0.04)] border border-transparent"
                      }`}
                      style={active ? { color: `hsl(${lCfg.color})` } : { color: "hsl(0 0% 40%)" }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

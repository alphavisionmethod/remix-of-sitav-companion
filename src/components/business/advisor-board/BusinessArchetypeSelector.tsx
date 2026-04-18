// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Archetype Selector
// Premium card-based business type selection
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ARCHETYPE_PROFILES, type BusinessArchetype } from "@/domains/engines/business-archetype-engine";

interface Props {
  selected: BusinessArchetype;
  onSelect: (archetype: BusinessArchetype) => void;
}

export function BusinessArchetypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-display font-bold text-foreground mb-1">Business Type</h3>
        <p className="text-[10px] text-muted-foreground">
          Select your business model to optimize advisor priorities, metrics, and automation suggestions.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {ARCHETYPE_PROFILES.map((profile, i) => {
          const isSelected = profile.key === selected;
          return (
            <motion.div
              key={profile.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[hsl(265_55%_58%)] bg-[hsl(265_55%_58%/0.08)] shadow-[0_0_12px_hsl(265_55%_58%/0.15)]"
                    : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.12)]"
                }`}
                onClick={() => onSelect(profile.key)}
              >
                <CardContent className="p-3 relative">
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
                    </div>
                  )}
                  <div className="text-lg mb-1">{profile.emoji}</div>
                  <h4 className="text-[11px] font-semibold text-foreground mb-0.5">{profile.label}</h4>
                  <p className="text-[9px] text-muted-foreground line-clamp-2 mb-2">{profile.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.priorityAdvisors.slice(0, 2).map(a => (
                      <Badge key={a} variant="secondary" className="text-[7px] px-1 py-0">
                        {a.replace("-advisor", "")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected archetype details */}
      {selected && (() => {
        const profile = ARCHETYPE_PROFILES.find(p => p.key === selected);
        if (!profile) return null;
        return (
          <Card className="border-[hsl(265_55%_58%/0.1)] bg-[hsl(265_55%_58%/0.03)]">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-[10px] font-semibold text-foreground mb-1.5">Top Risks</h4>
                {profile.topRisks.map(r => (
                  <p key={r} className="text-[9px] text-muted-foreground mb-0.5">• {r}</p>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-foreground mb-1.5">Key Metrics</h4>
                {profile.importantMetrics.map(m => (
                  <p key={m} className="text-[9px] text-muted-foreground mb-0.5">• {m}</p>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-semibold text-foreground mb-1.5">Automation Opportunities</h4>
                {profile.automationOpportunities.map(a => (
                  <p key={a} className="text-[9px] text-muted-foreground mb-0.5">• {a}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}

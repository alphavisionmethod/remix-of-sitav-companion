// ═══════════════════════════════════════════════════════════════
// SITA OS — Executive Reset Mode
// Overload relief — narrows board to essentials only
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, AlertCircle, CheckCircle, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AIRecommendation } from "@/modules/business/hooks/useBusinessAdvisorBoard";

interface Props {
  isActive: boolean;
  overloadScore: number; // 0-100, >70 triggers reset
  criticalActions: AIRecommendation[];
  onActivate: () => void;
  onDeactivate: () => void;
  onApproveAction?: (rec: AIRecommendation) => void;
}

export function ExecutiveResetMode({ isActive, overloadScore, criticalActions, onActivate, onDeactivate, onApproveAction }: Props) {
  // Show trigger button when overload detected but not active
  if (!isActive && overloadScore > 70) {
    return (
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-[hsl(38_85%_58%/0.2)] bg-[hsl(38_85%_58%/0.05)]">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[hsl(38_85%_58%)]" />
              <div>
                <p className="text-xs font-medium text-foreground">High cognitive load detected</p>
                <p className="text-[9px] text-muted-foreground">
                  {criticalActions.length} critical items. Consider entering Focus Mode to reduce noise.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="text-[10px] h-7 bg-[hsl(38_85%_58%)] hover:bg-[hsl(38_85%_48%)] text-white"
              onClick={onActivate}
            >
              <Shield className="h-3 w-3 mr-1" />
              Enter Focus Mode
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!isActive) return null;

  // Full reset mode overlay
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <Card className="border-[hsl(265_55%_58%/0.2)] bg-gradient-to-br from-[hsl(265_55%_58%/0.08)] to-[hsl(0_0%_0%/0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[hsl(265_55%_58%)]" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Focus Mode Active</h2>
                  <p className="text-[10px] text-muted-foreground">
                    Only critical items are shown. Everything else is paused.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-muted-foreground"
                onClick={onDeactivate}
              >
                <X className="h-3 w-3 mr-1" />
                Exit Focus Mode
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-[9px] border-[hsl(265_55%_58%)] text-[hsl(265_55%_58%)]">
                <Pause className="h-2.5 w-2.5 mr-1" />
                Non-essential advisors paused
              </Badge>
              <Badge variant="outline" className="text-[9px] border-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]">
                {criticalActions.length} items need attention
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Critical actions only */}
        <div className="space-y-2">
          {criticalActions.length === 0 ? (
            <Card className="border-[hsl(152_55%_48%/0.15)] bg-[hsl(152_55%_48%/0.05)]">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto text-[hsl(152_55%_48%)] mb-2" />
                <p className="text-xs font-medium text-foreground">All clear</p>
                <p className="text-[10px] text-muted-foreground">No critical items require your attention right now.</p>
              </CardContent>
            </Card>
          ) : (
            criticalActions.map((rec, i) => (
              <motion.div
                key={`${rec.advisorId}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.03)]">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="destructive" className="text-[7px] px-1 py-0">{rec.urgency}</Badge>
                        <span className="text-[9px] text-muted-foreground">{Math.round(rec.confidence * 100)}%</span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground">{rec.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{rec.summary}</p>
                    </div>
                    <Button
                      size="sm"
                      className="text-[10px] h-7 bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_48%)] text-white ml-3"
                      onClick={() => onApproveAction?.(rec)}
                    >
                      Act Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Rescue Panel
// Emergency pipeline recovery surface
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { PhoneCall, Mail, Calendar, AlertTriangle, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfitSignal } from "@/domains/engines/continuous-profit-engine";

interface Props {
  signals: ProfitSignal[];
  totalAtRisk: number;
  onRecoverAll?: () => void;
  onRecoverSignal?: (id: string) => void;
}

export function RevenueRescuePanel({ signals, totalAtRisk, onRecoverAll, onRecoverSignal }: Props) {
  const revenueSignals = signals.filter(s => s.category === "recover-revenue" && !s.resolved);

  if (revenueSignals.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-[hsl(0_65%_50%/0.2)] bg-gradient-to-br from-[hsl(0_65%_50%/0.05)] to-[hsl(38_85%_58%/0.03)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[hsl(0_65%_50%)]" />
              <CardTitle className="text-sm font-display">Revenue Rescue</CardTitle>
            </div>
            <Button
              size="sm"
              className="text-[10px] h-7 bg-[hsl(0_65%_50%)] hover:bg-[hsl(0_65%_40%)] text-white"
              onClick={onRecoverAll}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Recover ${totalAtRisk.toLocaleString()}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {revenueSignals.length} revenue recovery opportunities detected
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {revenueSignals.slice(0, 5).map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.05)] group hover:border-[hsl(0_65%_50%/0.2)] transition-colors"
            >
              <div className="flex-shrink-0">
                {signal.lever === "overdue-invoices" ? (
                  <DollarSign className="h-4 w-4 text-[hsl(38_85%_58%)]" />
                ) : signal.lever === "slow-response" ? (
                  <PhoneCall className="h-4 w-4 text-[hsl(0_65%_50%)]" />
                ) : (
                  <Mail className="h-4 w-4 text-[hsl(265_55%_58%)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-foreground truncate">{signal.title}</span>
                  <Badge
                    variant={signal.urgency === "critical" ? "destructive" : "secondary"}
                    className="text-[7px] px-1 py-0 flex-shrink-0"
                  >
                    {signal.urgency}
                  </Badge>
                </div>
                <p className="text-[9px] text-muted-foreground truncate">{signal.actionRequired}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-[hsl(38_85%_58%)]">
                  ${signal.estimatedValue.toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRecoverSignal?.(signal.id)}
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

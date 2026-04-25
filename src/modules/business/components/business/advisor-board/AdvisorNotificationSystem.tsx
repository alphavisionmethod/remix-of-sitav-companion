// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Notification System
// Proactive advisor alerts with one-click actions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";
import type { AIRecommendation } from "@/hooks/useBusinessAdvisorBoard";

interface AdvisorNotification {
  id: string;
  advisorId: string;
  title: string;
  message: string;
  urgency: "low" | "medium" | "high" | "critical";
  actionLabel?: string;
  recommendation?: AIRecommendation;
  createdAt: number;
}

interface Props {
  recommendations: AIRecommendation[];
  onAction?: (rec: AIRecommendation) => void;
  maxVisible?: number;
}

export function AdvisorNotificationSystem({ recommendations, onAction, maxVisible = 3 }: Props) {
  const [notifications, setNotifications] = useState<AdvisorNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Generate notifications from critical/high recommendations
  useEffect(() => {
    const urgent = recommendations.filter(r =>
      (r.urgency === "critical" || r.urgency === "high") && r.confidence > 0.6
    );
    const newNotifs: AdvisorNotification[] = urgent.map(r => ({
      id: `notif-${r.advisorId}-${r.title.slice(0, 20)}`,
      advisorId: r.advisorId,
      title: r.title,
      message: r.summary.slice(0, 100),
      urgency: r.urgency,
      actionLabel: r.suggestedActions[0]?.slice(0, 30) || "Take action",
      recommendation: r,
      createdAt: Date.now(),
    }));
    setNotifications(newNotifs);
  }, [recommendations]);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const visible = notifications
    .filter(n => !dismissed.has(n.id))
    .slice(0, maxVisible);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {visible.map((notif, i) => {
          const advisor = BUSINESS_ADVISORS.find(a => a.id === notif.advisorId);
          const urgencyIcon = notif.urgency === "critical"
            ? <AlertTriangle className="h-3.5 w-3.5 text-[hsl(0_65%_50%)]" />
            : notif.urgency === "high"
            ? <Zap className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
            : <TrendingUp className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="relative p-3 rounded-xl border backdrop-blur-xl bg-[hsl(220_18%_8%/0.95)] border-[hsl(0_0%_100%/0.1)] shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => dismiss(notif.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-1.5 pr-4">
                <span className="text-sm">{advisor?.emoji ?? "🤖"}</span>
                <span className="text-[10px] font-medium text-foreground">{advisor?.displayName ?? notif.advisorId}</span>
                {urgencyIcon}
                <Badge
                  variant={notif.urgency === "critical" ? "destructive" : "secondary"}
                  className="text-[7px] px-1 py-0 ml-auto"
                >
                  {notif.urgency}
                </Badge>
              </div>

              {/* Content */}
              <p className="text-[10px] font-medium text-foreground mb-0.5">{notif.title}</p>
              <p className="text-[9px] text-muted-foreground mb-2">{notif.message}</p>

              {/* Action */}
              {notif.recommendation && (
                <Button
                  size="sm"
                  className="text-[9px] h-6 w-full bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_48%)] text-white"
                  onClick={() => {
                    onAction?.(notif.recommendation!);
                    dismiss(notif.id);
                  }}
                >
                  {notif.actionLabel}
                </Button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
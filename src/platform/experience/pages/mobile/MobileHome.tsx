// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Home (Pulse Summary)
// Wired to live DB data via useMobileHome* hooks
// ═══════════════════════════════════════════════════════════════

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { PulseCard } from "@/platform/experience/components/mobile/PulseCard";
import { useNavigate } from "react-router-dom";
import { Heart, TrendingUp, Shield, Wallet, Calendar, Users, ArrowRight, BarChart3 } from "lucide-react";
import { useMobileHomePulse, useMobileHomeQuickActions, useMobileHomeActivity } from "@/modules/mobile/hooks/use-mobile-data";
import { MobileEmptyState, MobileErrorState } from "@/platform/experience/components/mobile/MobileEmptyState";
import { PulseGridSkeleton, QuickActionsSkeleton, ActivityFeedSkeleton } from "@/platform/experience/components/mobile/MobileSectionSkeleton";

import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Heart, TrendingUp, Shield, Wallet, Calendar, Users,
};

const MobileHome = () => {
  const navigate = useNavigate();
  const pulse = useMobileHomePulse();
  const quickActions = useMobileHomeQuickActions();
  const activity = useMobileHomeActivity();

  const hasError = pulse.error || quickActions.error;

  return (
    <MobileShell title="Pulse">
      {hasError ? (
        <MobileErrorState
          onRetry={() => { pulse.refetch(); quickActions.refetch(); activity.refetch(); }}
        />
      ) : (
        <>
          {/* Health summary */}
          {pulse.isLoading ? (
            <PulseGridSkeleton />
          ) : pulse.data.length === 0 ? (
            <MobileEmptyState
              icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
              title="No metrics yet"
              description="Your system health, revenue, and trust metrics will appear here once data flows in."
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {pulse.data.map((metric) => {
                const Icon = ICON_MAP[metric.icon] ?? Heart;
                return (
                  <PulseCard
                    key={metric.label}
                    icon={Icon}
                    label={metric.label}
                    value={metric.value}
                    trend={metric.trend}
                    accent={metric.accent}
                  />
                );
              })}
            </div>
          )}

          {pulse.isDemo && (
            <p className="text-[10px] text-muted-foreground text-center mb-3 italic">Demo data — sign in to see live metrics</p>
          )}

          {/* Quick actions */}
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h2>
          {quickActions.isLoading ? (
            <QuickActionsSkeleton />
          ) : (
            <div className="space-y-1.5">
              {quickActions.data.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <div className="flex items-center gap-2">
                    {action.count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                        {action.count}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent activity */}
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">Latest Activity</h2>
          {activity.isLoading ? (
            <ActivityFeedSkeleton />
          ) : activity.data.length === 0 ? (
            <MobileEmptyState
              title="No recent activity"
              description="Your latest actions and events will show up here."
            />
          ) : (
            <div className="space-y-2">
              {activity.data.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/20 bg-card/50">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">{item.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground capitalize">{item.domain}</span>
                      <span className="text-[10px] text-muted-foreground">· {item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </MobileShell>
  );
};

export default MobileHome;

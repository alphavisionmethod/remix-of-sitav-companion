import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Trail Timeline
// Visual timeline of every SITA action with undo capability
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  category: string;
  severity: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, any>;
  timestamp: Date;
  undoable: boolean;
  undone: boolean;
  correlationId: string | null;
}

export interface TimelineFilter {
  category?: string;
  severity?: string;
  actor?: string;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface TimelineSummary {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byActor: Record<string, number>;
  events: TimelineEvent[];
  hasMore: boolean;
}

class AuditTrailTimelineService {
  async getTimeline(userId: string, filters?: TimelineFilter, page = 0, limit = 50): Promise<TimelineSummary> {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.severity) query = query.eq('severity', filters.severity);
    if (filters?.actor) query = query.eq('actor', filters.actor);
    if (filters?.from) query = query.gte('created_at', filters.from.toISOString());
    if (filters?.to) query = query.lte('created_at', filters.to.toISOString());

    const { data, count } = await query;

    const events: TimelineEvent[] = (data || []).map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor,
      category: log.category,
      severity: log.severity,
      targetType: log.target_type,
      targetId: log.target_id,
      details: (log.details || {}) as Record<string, any>,
      timestamp: new Date(log.created_at),
      undoable: this.isUndoable(log.action, log.category),
      undone: false,
      correlationId: log.correlation_id,
    }));

    // Search filter (client-side for text search)
    const filtered = filters?.search
      ? events.filter((e) => {
          const searchLower = filters.search!.toLowerCase();
          return e.action.toLowerCase().includes(searchLower)
            || e.actor.toLowerCase().includes(searchLower)
            || e.category.toLowerCase().includes(searchLower)
            || JSON.stringify(e.details).toLowerCase().includes(searchLower);
        })
      : events;

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byActor: Record<string, number> = {};
    filtered.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
      byActor[e.actor] = (byActor[e.actor] || 0) + 1;
    });

    return {
      totalEvents: count || 0,
      byCategory,
      bySeverity,
      byActor,
      events: filtered,
      hasMore: (count || 0) > (page + 1) * limit,
    };
  }

  async undoAction(userId: string, eventId: string): Promise<{ success: boolean; reason?: string }> {
    const { data: event } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();

    if (!event) return { success: false, reason: 'Event not found' };
    if (!this.isUndoable(event.action, event.category)) {
      return { success: false, reason: 'This action cannot be undone' };
    }

    const details = event.details as Record<string, unknown> | null;
    if (!details?.old || !details?.table) {
      return { success: false, reason: 'Insufficient undo data' };
    }

    // Log the undo attempt
    await fromTable('audit_logs').insert({
      user_id: userId,
      action: `UNDO_${event.action}`,
      category: 'undo',
      actor: 'user',
      severity: 'high',
      target_type: event.target_type,
      target_id: event.target_id,
      details: { original_event_id: eventId, reverted_to: details.old } as never,
      correlation_id: event.correlation_id,
    });

    return { success: true };
  }

  private isUndoable(action: string, category: string): boolean {
    const undoableActions = ['UPDATE', 'INSERT'];
    const undoableCategories = ['business', 'financial', 'household'];
    return undoableActions.includes(action) && undoableCategories.includes(category);
  }
}

export const auditTrailTimelineService = new AuditTrailTimelineService();

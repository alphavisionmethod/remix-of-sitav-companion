import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Widget Marketplace Service
// User-configurable dashboard with drag-and-drop widgets
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;
export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  defaultSize: { cols: number; rows: number };
  minSize: { cols: number; rows: number };
  maxSize: { cols: number; rows: number };
  configurable: boolean;
  config: Record<string, any>;
  premium: boolean;
}

export interface WidgetPlacement {
  widgetId: string;
  x: number;
  y: number;
  cols: number;
  rows: number;
  config: Record<string, any>;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  placements: WidgetPlacement[];
  columns: number;
  createdAt: Date;
  updatedAt: Date;
}

const BUILT_IN_WIDGETS: Widget[] = [
  { id: 'revenue-ticker', type: 'revenue-ticker', title: 'Revenue Ticker', description: 'Real-time revenue stream', icon: '💰', category: 'business', defaultSize: { cols: 4, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 6, rows: 3 }, configurable: true, config: {}, premium: false },
  { id: 'life-score', type: 'life-score', title: 'Life Score', description: 'Composite life score', icon: '🎯', category: 'personal', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 4, rows: 4 }, configurable: false, config: {}, premium: false },
  { id: 'lead-pipeline', type: 'lead-pipeline', title: 'Lead Pipeline', description: 'Active leads overview', icon: '📊', category: 'business', defaultSize: { cols: 3, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 6, rows: 4 }, configurable: true, config: {}, premium: false },
  { id: 'calendar-today', type: 'calendar-today', title: "Today's Schedule", description: "Today's events and tasks", icon: '📅', category: 'concierge', defaultSize: { cols: 2, rows: 3 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 4, rows: 6 }, configurable: false, config: {}, premium: false },
  { id: 'approval-queue', type: 'approval-queue', title: 'Pending Approvals', description: 'Items needing approval', icon: '✅', category: 'system', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 4 }, configurable: false, config: {}, premium: false },
  { id: 'sentiment-radar', type: 'sentiment-radar', title: 'Client Sentiment', description: 'Client mood tracker', icon: '😊', category: 'business', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 4, rows: 4 }, configurable: true, config: {}, premium: true },
  { id: 'habit-streaks', type: 'habit-streaks', title: 'Habit Streaks', description: 'Daily habit tracker', icon: '🔥', category: 'personal', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 3 }, configurable: false, config: {}, premium: false },
  { id: 'anomaly-alerts', type: 'anomaly-alerts', title: 'Security Alerts', description: 'Anomaly detection feed', icon: '🛡️', category: 'security', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 4 }, configurable: true, config: {}, premium: false },
  { id: 'family-tasks', type: 'family-tasks', title: 'Family Tasks', description: 'Household task overview', icon: '🏠', category: 'concierge', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 3 }, configurable: false, config: {}, premium: false },
  { id: 'revenue-leaks', type: 'revenue-leaks', title: 'Revenue Leaks', description: 'Money left on the table', icon: '🚨', category: 'business', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 3 }, configurable: false, config: {}, premium: true },
  { id: 'competitive-radar', type: 'competitive-radar', title: 'Competitive Radar', description: 'Competitor intelligence', icon: '🎯', category: 'business', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 4, rows: 4 }, configurable: true, config: {}, premium: true },
  { id: 'intent-predictions', type: 'intent-predictions', title: 'Next Actions', description: 'Predicted next actions', icon: '🔮', category: 'system', defaultSize: { cols: 2, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 3, rows: 3 }, configurable: false, config: {}, premium: true },
];

class WidgetMarketplaceService {
  getAvailableWidgets(): Widget[] {
    return [...BUILT_IN_WIDGETS];
  }

  getWidgetsByCategory(category: string): Widget[] {
    return BUILT_IN_WIDGETS.filter((w) => w.category === category);
  }

  async saveLayout(userId: string, layout: DashboardLayout): Promise<void> {
    await fromDynamicTable('user_memory').upsert({
      user_id: userId,
      key: `dashboard_layout_${layout.id}`,
      value: JSON.stringify(layout) as never,
      category: 'dashboard',
    }, { onConflict: 'user_id,key' });
  }

  async loadLayout(userId: string, layoutId = 'default'): Promise<DashboardLayout | null> {
    const { data } = await db
      .from('user_memory')
      .select('value')
      .eq('user_id', userId)
      .eq('key', `dashboard_layout_${layoutId}`)
      .single();

    if (data?.value) {
      return typeof data.value === 'string' ? JSON.parse(data.value) : data.value as never;
    }
    return this.getDefaultLayout();
  }

  getDefaultLayout(): DashboardLayout {
    return {
      id: 'default',
      name: 'Default Dashboard',
      columns: 6,
      placements: [
        { widgetId: 'revenue-ticker', x: 0, y: 0, cols: 4, rows: 2, config: {}, visible: true },
        { widgetId: 'life-score', x: 4, y: 0, cols: 2, rows: 2, config: {}, visible: true },
        { widgetId: 'lead-pipeline', x: 0, y: 2, cols: 3, rows: 2, config: {}, visible: true },
        { widgetId: 'calendar-today', x: 3, y: 2, cols: 2, rows: 3, config: {}, visible: true },
        { widgetId: 'approval-queue', x: 5, y: 2, cols: 1, rows: 2, config: {}, visible: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export const widgetMarketplaceService = new WidgetMarketplaceService();


// ═══════════════════════════════════════════════════════════════
// SITA OS — Real Data Providers (Stubs)
// Real implementations that query Supabase for actual user data.
// These are stubs that return empty data until real domain tables
// are populated. The interface contract matches demo providers.
// ═══════════════════════════════════════════════════════════════

import type {
  BoardroomProvider, InvestmentProvider, MoneyProvider, BusinessProvider,
  WorkspaceProvider, OwnerProvider, CalendarProvider, AdvisorProvider,
} from "./provider-interfaces";
import { supabase } from "@/integrations/supabase/client";

const emptyPacket = { id: "", title: "No data", date: new Date().toISOString(), metrics: [], insights: [], actionItems: [] };

export const realBoardroomProvider: BoardroomProvider = {
  async getLatestPacket() { return emptyPacket; },
  async getMetrics() { return []; },
  async getInsights() { return []; },
  async getHistoricalPackets() { return []; },
};

export const realInvestmentProvider: InvestmentProvider = {
  async getPortfolioSummary() { return { totalValue: 0, totalGain: 0, gainPct: 0, currency: "USD", asOf: new Date().toISOString() }; },
  async getHoldings() { return []; },
  async getWatchlist() { return []; },
};

export const realMoneyProvider: MoneyProvider = {
  async getAccounts() { return []; },
  async getRecentTransactions() { return []; },
  async getUpcomingBills() { return []; },
  async getNetWorth() { return { total: 0, liquid: 0, invested: 0 }; },
};

export const realBusinessProvider: BusinessProvider = {
  async getContacts() { return []; },
  async getDeals() { return []; },
  async getPipeline() { return { totalValue: 0, dealCount: 0, weightedValue: 0 }; },
  async getRevenueMetrics() { return []; },
};

export const realWorkspaceProvider: WorkspaceProvider = {
  async getProjects() { return []; },
  async getTasks() { return []; },
  async getActivityFeed() { return []; },
};

export const realOwnerProvider: OwnerProvider = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    return {
      displayName: user?.user_metadata?.full_name ?? user?.email ?? "User",
      email: user?.email ?? "",
      memberSince: user?.created_at ?? new Date().toISOString(),
      plan: "Standard",
    };
  },
  async getNotifications() { return []; },
  async getSystemHealth() { return { status: "healthy" as const, uptime: 99.9, activeConnectors: 0, pendingApprovals: 0 }; },
};

export const realCalendarProvider: CalendarProvider = {
  async getUpcomingEvents() { return []; },
  async getTodayEvents() { return []; },
};

export const realAdvisorProvider: AdvisorProvider = {
  async getSuggestions() { return []; },
  async getRecentMemos() { return []; },
};

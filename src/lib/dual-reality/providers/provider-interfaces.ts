// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Provider Interfaces
// Canonical interfaces for all mode-aware domain data providers
// ═══════════════════════════════════════════════════════════════

// ── Boardroom ───────────────────────────────────────────────────

export interface BoardroomMetric { key: string; label: string; value: string | number; trend?: "up" | "down" | "flat"; delta?: string; }
export interface BoardroomInsight { id: string; title: string; summary: string; severity: "info" | "warning" | "critical"; domain: string; }
export interface BoardroomPacket { id: string; title: string; date: string; metrics: BoardroomMetric[]; insights: BoardroomInsight[]; actionItems: string[]; }

export interface BoardroomProvider {
  getLatestPacket(): Promise<BoardroomPacket | null>;
  getMetrics(): Promise<BoardroomMetric[]>;
  getInsights(): Promise<BoardroomInsight[]>;
  getHistoricalPackets(limit?: number): Promise<BoardroomPacket[]>;
}

// ── Investment ──────────────────────────────────────────────────

export interface PortfolioSummary { totalValue: number; totalGain: number; gainPct: number; currency: string; asOf: string; }
export interface Holding { id: string; symbol: string; name: string; quantity: number; currentPrice: number; totalValue: number; gainPct: number; assetClass: string; }
export interface WatchlistItem { id: string; symbol: string; name: string; price: number; change24h: number; }

export interface InvestmentProvider {
  getPortfolioSummary(): Promise<PortfolioSummary>;
  getHoldings(): Promise<Holding[]>;
  getWatchlist(): Promise<WatchlistItem[]>;
}

// ── Money ───────────────────────────────────────────────────────

export interface AccountSummary { id: string; name: string; type: string; balance: number; currency: string; institution: string; }
export interface Transaction { id: string; date: string; description: string; amount: number; category: string; accountId: string; }
export interface BillItem { id: string; payee: string; amount: number; dueDate: string; status: string; recurring: boolean; }

export interface MoneyProvider {
  getAccounts(): Promise<AccountSummary[]>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getUpcomingBills(): Promise<BillItem[]>;
  getNetWorth(): Promise<{ total: number; liquid: number; invested: number; }>;
}

// ── Business ────────────────────────────────────────────────────

export interface BusinessContact { id: string; name: string; company: string; role: string; lastContact: string; stage: string; }
export interface Deal { id: string; title: string; value: number; stage: string; probability: number; closeDate: string; contactId: string; }
export interface RevenueMetric { period: string; revenue: number; growth: number; mrr: number; churn: number; }

export interface BusinessProvider {
  getContacts(limit?: number): Promise<BusinessContact[]>;
  getDeals(): Promise<Deal[]>;
  getPipeline(): Promise<{ totalValue: number; dealCount: number; weightedValue: number; }>;
  getRevenueMetrics(): Promise<RevenueMetric[]>;
}

// ── Workspace ───────────────────────────────────────────────────

export interface WorkspaceProject { id: string; name: string; status: string; progress: number; memberCount: number; }
export interface WorkspaceTask { id: string; title: string; status: string; priority: string; assignee: string; dueDate?: string; projectId: string; }

export interface WorkspaceProvider {
  getProjects(): Promise<WorkspaceProject[]>;
  getTasks(filters?: { status?: string; projectId?: string }): Promise<WorkspaceTask[]>;
  getActivityFeed(limit?: number): Promise<Array<{ id: string; action: string; actor: string; timestamp: string; }>>;
}

// ── Owner ────────────────────────────────────────────────────────

export interface OwnerProfile { displayName: string; email: string; memberSince: string; plan: string; }
export interface OwnerNotification { id: string; title: string; body: string; category: string; read: boolean; createdAt: string; }
export interface SystemHealth { status: "healthy" | "degraded" | "down"; uptime: number; activeConnectors: number; pendingApprovals: number; }

export interface OwnerProvider {
  getProfile(): Promise<OwnerProfile>;
  getNotifications(limit?: number): Promise<OwnerNotification[]>;
  getSystemHealth(): Promise<SystemHealth>;
}

// ── Calendar ────────────────────────────────────────────────────

export interface CalendarEvent { id: string; title: string; startTime: string; endTime: string; type: string; attendees?: string[]; location?: string; }

export interface CalendarProvider {
  getUpcomingEvents(days?: number): Promise<CalendarEvent[]>;
  getTodayEvents(): Promise<CalendarEvent[]>;
}

// ── Advisor ─────────────────────────────────────────────────────

export interface AdvisorSuggestion { id: string; title: string; summary: string; confidence: number; domain: string; actionable: boolean; }
export interface AdvisorMemo { id: string; title: string; content: string; domain: string; generatedAt: string; }

export interface AdvisorProvider {
  getSuggestions(limit?: number): Promise<AdvisorSuggestion[]>;
  getRecentMemos(limit?: number): Promise<AdvisorMemo[]>;
}

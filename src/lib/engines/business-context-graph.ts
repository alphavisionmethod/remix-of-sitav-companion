// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared Business Context Graph
// Single source of truth for all advisors to query
// ═══════════════════════════════════════════════════════════════

export interface BusinessIdentity {
  name: string;
  type: string;
  industry: string;
  serviceCategories: string[];
  geographicFootprint: string;
  operatingHours: string;
  deliveryModel: string;
  salesModel: string;
}

export interface RevenueEngine {
  leadSources: { name: string; leads: number; conversion: number }[];
  dealStages: string[];
  averageDealValue: number;
  closeTimingDays: number;
  revenueConcentration: number; // 0-1 how concentrated in top clients
  pipelineVelocity: number; // deals/month
}

export interface ClientModel {
  activeClients: number;
  prospects: number;
  atRiskClients: { name: string; risk: string; reason: string; value: number }[];
  highValueClients: { name: string; revenue: number; potential: number }[];
  recurringClients: number;
  unresolvedIssues: number;
}

export interface FinancialModel {
  recurringExpenses: number;
  monthlyBurn: number;
  currentBalance: number;
  cashRunwayDays: number;
  reserveLevel: "healthy" | "adequate" | "thin" | "critical";
  overdueReceivables: number;
  upcomingBills: number;
  marginCategories: { name: string; margin: number }[];
}

export interface OperationsModel {
  totalWorkflows: number;
  blockedWorkflows: number;
  totalTasks: number;
  overdueTasks: number;
  completionRate: number;
  handoffFailures: number;
  schedulingCongestion: number; // 0-1
}

export interface PeopleModel {
  owner: string;
  teamSize: number;
  roles: string[];
  overloadedMembers: string[];
  handoffDependencies: string[];
}

export interface PerformanceModel {
  businessHealthScore: number;
  dailyVelocity: number;
  pipelinePressure: number;
  revenueProtectionScore: number;
  cashClarityScore: number;
  executionConsistencyScore: number;
  clientHealthScore: number;
  teamCoordinationScore: number;
}

export interface BusinessContextSnapshot {
  identity: BusinessIdentity;
  revenue: RevenueEngine;
  clients: ClientModel;
  financial: FinancialModel;
  operations: OperationsModel;
  people: PeopleModel;
  performance: PerformanceModel;
  updatedAt: string;
}

export class SharedBusinessContextGraph {
  private context: BusinessContextSnapshot;

  constructor() {
    this.context = this.createDefault();
  }

  getBusinessSnapshot(): BusinessContextSnapshot {
    return { ...this.context, updatedAt: new Date().toISOString() };
  }

  updateIdentity(partial: Partial<BusinessIdentity>) {
    this.context.identity = { ...this.context.identity, ...partial };
  }

  updateRevenue(partial: Partial<RevenueEngine>) {
    this.context.revenue = { ...this.context.revenue, ...partial };
  }

  updateClients(partial: Partial<ClientModel>) {
    this.context.clients = { ...this.context.clients, ...partial };
  }

  updateFinancial(partial: Partial<FinancialModel>) {
    this.context.financial = { ...this.context.financial, ...partial };
  }

  updateOperations(partial: Partial<OperationsModel>) {
    this.context.operations = { ...this.context.operations, ...partial };
  }

  updatePeople(partial: Partial<PeopleModel>) {
    this.context.people = { ...this.context.people, ...partial };
  }

  recalculatePerformance() {
    const { financial, operations, clients, revenue } = this.context;
    this.context.performance = {
      businessHealthScore: Math.round(
        (financial.reserveLevel === "healthy" ? 90 : financial.reserveLevel === "adequate" ? 70 : financial.reserveLevel === "thin" ? 40 : 15) * 0.25 +
        ((1 - operations.blockedWorkflows / Math.max(operations.totalWorkflows, 1)) * 100) * 0.2 +
        (operations.completionRate * 100) * 0.15 +
        ((1 - clients.atRiskClients.length / Math.max(clients.activeClients, 1)) * 100) * 0.15 +
        (revenue.pipelineVelocity > 5 ? 85 : revenue.pipelineVelocity > 2 ? 65 : 40) * 0.15 +
        ((1 - operations.overdueTasks / Math.max(operations.totalTasks, 1)) * 100) * 0.1
      ),
      dailyVelocity: revenue.pipelineVelocity / 30,
      pipelinePressure: Math.min(1, (clients.prospects * revenue.averageDealValue) / Math.max(financial.monthlyBurn * 3, 1)),
      revenueProtectionScore: Math.round((1 - revenue.revenueConcentration) * 100),
      cashClarityScore: Math.round(
        Math.min(100, (financial.cashRunwayDays / 90) * 100)
      ),
      executionConsistencyScore: Math.round(operations.completionRate * 100),
      clientHealthScore: Math.round(
        (1 - clients.atRiskClients.length / Math.max(clients.activeClients, 1)) * 100
      ),
      teamCoordinationScore: Math.round(
        (1 - operations.handoffFailures / Math.max(operations.totalTasks * 0.1, 1)) * 100
      ),
    };
  }

  // ── Compact summary for AI prompt injection ────────────────
  toPromptContext(): string {
    const s = this.context;
    return [
      `Business: ${s.identity.name} (${s.identity.type}, ${s.identity.industry})`,
      `Revenue: $${s.revenue.averageDealValue} avg deal, ${s.revenue.pipelineVelocity} deals/mo, ${s.revenue.leadSources.length} sources`,
      `Clients: ${s.clients.activeClients} active, ${s.clients.atRiskClients.length} at-risk, ${s.clients.prospects} prospects`,
      `Cash: $${s.financial.currentBalance} balance, ${s.financial.cashRunwayDays}d runway, ${s.financial.reserveLevel} reserves`,
      `Ops: ${s.operations.overdueTasks}/${s.operations.totalTasks} overdue tasks, ${s.operations.blockedWorkflows} blocked workflows`,
      `Team: ${s.people.teamSize} members, ${s.people.overloadedMembers.length} overloaded`,
      `Health: ${s.performance.businessHealthScore}/100`,
    ].join(". ");
  }

  private createDefault(): BusinessContextSnapshot {
    return {
      identity: {
        name: "My Business",
        type: "service",
        industry: "Professional Services",
        serviceCategories: ["Consulting", "Implementation"],
        geographicFootprint: "Regional",
        operatingHours: "Mon-Fri 9-5",
        deliveryModel: "hybrid",
        salesModel: "consultative",
      },
      revenue: {
        leadSources: [
          { name: "Referrals", leads: 12, conversion: 0.45 },
          { name: "Website", leads: 28, conversion: 0.15 },
          { name: "LinkedIn", leads: 8, conversion: 0.35 },
        ],
        dealStages: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"],
        averageDealValue: 15000,
        closeTimingDays: 21,
        revenueConcentration: 0.45,
        pipelineVelocity: 6,
      },
      clients: {
        activeClients: 14,
        prospects: 22,
        atRiskClients: [
          { name: "Meridian LLC", risk: "high", reason: "No contact in 28 days, unresolved ticket", value: 36000 },
          { name: "Cascade Group", risk: "medium", reason: "Late delivery on last project", value: 18000 },
        ],
        highValueClients: [
          { name: "Atlas Corp", revenue: 48000, potential: 72000 },
          { name: "Nova Inc", revenue: 24000, potential: 36000 },
        ],
        recurringClients: 8,
        unresolvedIssues: 3,
      },
      financial: {
        recurringExpenses: 12000,
        monthlyBurn: 18000,
        currentBalance: 45000,
        cashRunwayDays: 75,
        reserveLevel: "adequate",
        overdueReceivables: 20900,
        upcomingBills: 5150,
        marginCategories: [
          { name: "Consulting", margin: 0.65 },
          { name: "Implementation", margin: 0.40 },
        ],
      },
      operations: {
        totalWorkflows: 8,
        blockedWorkflows: 2,
        totalTasks: 34,
        overdueTasks: 6,
        completionRate: 0.78,
        handoffFailures: 2,
        schedulingCongestion: 0.35,
      },
      people: {
        owner: "Owner",
        teamSize: 3,
        roles: ["Owner/CEO", "Operations Lead", "Sales Associate"],
        overloadedMembers: ["Owner/CEO"],
        handoffDependencies: ["Owner approval on quotes", "Ops lead for scheduling"],
      },
      performance: {
        businessHealthScore: 72,
        dailyVelocity: 0.2,
        pipelinePressure: 0.65,
        revenueProtectionScore: 55,
        cashClarityScore: 83,
        executionConsistencyScore: 78,
        clientHealthScore: 71,
        teamCoordinationScore: 68,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

let _instance: SharedBusinessContextGraph | null = null;
export function getBusinessContextGraph(): SharedBusinessContextGraph {
  if (!_instance) _instance = new SharedBusinessContextGraph();
  return _instance;
}

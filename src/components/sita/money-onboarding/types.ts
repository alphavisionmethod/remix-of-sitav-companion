export type MoneyMode = "personal" | "founder" | "household" | "hybrid";

export type FinancialPriority =
  | "control_spending"
  | "understand_flows"
  | "build_reserves"
  | "reduce_debt"
  | "avoid_bill_stress"
  | "separate_biz_personal"
  | "tax_readiness"
  | "household_money"
  | "plan_goals";

export type BudgetStyle = "envelope" | "category" | "lightweight" | "advisor_guided";

export type OperatingMode =
  | "stable"
  | "tightening"
  | "recovery"
  | "growth"
  | "expansion"
  | "debt_attack"
  | "tax_protection"
  | "founder_conservation"
  | "household_protection"
  | "launch";

export interface ConnectedAccountStub {
  type: "bank" | "card" | "loan" | "business" | "household" | "csv" | "accounting" | "credit_monitor" | "crypto_wallet" | "crypto_exchange" | "defi" | "forex";
  label: string;
  connected: boolean;
}

export interface StructureItem {
  type: "bill" | "recurring" | "debt" | "goal" | "reserve" | "household_commitment" | "tax" | "payroll_draw";
  label: string;
  enabled: boolean;
}

export interface MoneyOnboardingState {
  moneyMode: MoneyMode;
  includesBusiness: boolean;
  includesHousehold: boolean;
  priorities: FinancialPriority[];
  connectedAccounts: ConnectedAccountStub[];
  structureItems: StructureItem[];
  budgetStyle: BudgetStyle;
  rollover: boolean;
  sinkingFunds: boolean;
  founderSetup: {
    businessAccounts: boolean;
    ownerDraw: boolean;
    payroll: boolean;
    taxReserve: boolean;
    reimbursements: boolean;
    blurPoints: string[];
  };
  householdSetup: {
    sharedAccounts: boolean;
    partnerVisibility: "full" | "summary" | "private";
    sharedGoals: boolean;
    sharedCategories: boolean;
    permissionBoundaries: boolean;
  };
  operatingMode: OperatingMode;
  completed: boolean;
}

export const DEFAULT_ONBOARDING_STATE: MoneyOnboardingState = {
  moneyMode: "personal",
  includesBusiness: false,
  includesHousehold: false,
  priorities: [],
  connectedAccounts: [],
  structureItems: [],
  budgetStyle: "category",
  rollover: false,
  sinkingFunds: false,
  founderSetup: {
    businessAccounts: false,
    ownerDraw: false,
    payroll: false,
    taxReserve: false,
    reimbursements: false,
    blurPoints: [],
  },
  householdSetup: {
    sharedAccounts: false,
    partnerVisibility: "summary",
    sharedGoals: false,
    sharedCategories: false,
    permissionBoundaries: false,
  },
  operatingMode: "stable",
  completed: false,
};

const STORAGE_KEY = "sita-money-onboarding";

export function persistMoneyOnboarding(state: MoneyOnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadMoneyOnboarding(): MoneyOnboardingState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isMoneyOnboardingComplete(): boolean {
  const state = loadMoneyOnboarding();
  return state?.completed === true;
}

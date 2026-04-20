// ════════════════════════════════════════════════════════════════
// ONBOARDING SURFACE: money-introduction  (registry: ONBOARDING_SURFACES)
// SCOPE: Optional Finance-app onboarding. Runs inside the Money app
//        on first visit. Not the OS first-boot flow, not business formation.
// Entry: MoneyOnboardingFlow. Truth source:
//        src/lib/architecture/onboarding-surface-registry.ts
// ════════════════════════════════════════════════════════════════
export { MoneyOnboardingFlow } from "./MoneyOnboardingFlow";
export { MoneyWelcomeStep } from "./MoneyWelcomeStep";
export { MoneyIdentityStep } from "./MoneyIdentityStep";
export { FinancialPrioritiesStep } from "./FinancialPrioritiesStep";
export { ConnectAccountsStep } from "./ConnectAccountsStep";
export { MoneyStructureStep } from "./MoneyStructureStep";
export { BudgetStyleStep } from "./BudgetStyleStep";
export { FounderBoundaryStep } from "./FounderBoundaryStep";
export { HouseholdSharingStep } from "./HouseholdSharingStep";
export { OperatingModeStep } from "./OperatingModeStep";
export { MoneyOfficeRevealStep } from "./MoneyOfficeRevealStep";
export { isMoneyOnboardingComplete, persistMoneyOnboarding, loadMoneyOnboarding } from "./types";
export type { MoneyOnboardingState, MoneyMode, OperatingMode, BudgetStyle, FinancialPriority } from "./types";

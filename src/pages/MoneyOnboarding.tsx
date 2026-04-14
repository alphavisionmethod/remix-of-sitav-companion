import { MoneyOnboardingFlow } from "@/components/sita/money-onboarding";
import { openFinanceModule } from "@/lib/finance-launcher";

const MoneyOnboarding = () => {
  return (
    <MoneyOnboardingFlow onComplete={() => openFinanceModule("overview")} />
  );
};

export default MoneyOnboarding;

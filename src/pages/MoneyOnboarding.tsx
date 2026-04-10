import { useNavigate } from "react-router-dom";
import { MoneyOnboardingFlow } from "@/components/sita/money-onboarding";

const MoneyOnboarding = () => {
  const navigate = useNavigate();

  return (
    <MoneyOnboardingFlow onComplete={() => navigate("/money", { replace: true })} />
  );
};

export default MoneyOnboarding;

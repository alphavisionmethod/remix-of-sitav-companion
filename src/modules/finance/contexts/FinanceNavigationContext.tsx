import { createContext, useContext } from "react";

interface FinanceNavigationContextType {
  navigateTo: (moduleKey: string) => void;
  activeModule: string;
}

export const FinanceNavigationContext = createContext<FinanceNavigationContextType>({
  navigateTo: () => {},
  activeModule: "overview",
});

export function useFinanceNavigation() {
  return useContext(FinanceNavigationContext);
}

import { createContext, useContext } from "react";

interface ConciergeNavigationContextType {
  navigateTo: (moduleKey: string) => void;
  activeModule: string;
}

export const ConciergeNavigationContext = createContext<ConciergeNavigationContextType>({
  navigateTo: () => {},
  activeModule: "overview",
});

export function useConciergeNavigation() {
  return useContext(ConciergeNavigationContext);
}

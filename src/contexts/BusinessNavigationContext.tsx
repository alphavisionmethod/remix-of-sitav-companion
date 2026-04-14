import { createContext, useContext, useCallback } from "react";

interface BusinessNavigationContextType {
  navigateTo: (moduleKey: string) => void;
  activeModule: string;
}

export const BusinessNavigationContext = createContext<BusinessNavigationContextType>({
  navigateTo: () => {},
  activeModule: "overview",
});

export function useBusinessNavigation() {
  return useContext(BusinessNavigationContext);
}

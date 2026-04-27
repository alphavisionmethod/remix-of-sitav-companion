import { createContext, useContext } from "react";
import type { useWindowManager } from "@/platform/sita/hooks/useWindowManager";

type WindowManagerContextType = ReturnType<typeof useWindowManager> | null;

export const WindowManagerContext = createContext<WindowManagerContextType>(null);

export function useWindowManagerContext() {
  return useContext(WindowManagerContext);
}

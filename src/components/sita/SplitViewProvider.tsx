import { createContext, useContext, useState, type ReactNode } from "react";

interface SplitViewState {
  active: boolean;
  leftPath: string;
  rightPath: string;
  activate: (left: string, right: string) => void;
  deactivate: () => void;
}

const SplitViewContext = createContext<SplitViewState>({
  active: false, leftPath: "/", rightPath: "/money",
  activate: () => {}, deactivate: () => {},
});

export const useSplitView = () => useContext(SplitViewContext);

export const SplitViewProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(false);
  const [leftPath, setLeftPath] = useState("/");
  const [rightPath, setRightPath] = useState("/money");

  const activate = (left: string, right: string) => {
    setLeftPath(left);
    setRightPath(right);
    setActive(true);
  };
  const deactivate = () => setActive(false);

  return (
    <SplitViewContext.Provider value={{ active, leftPath, rightPath, activate, deactivate }}>
      {children}
    </SplitViewContext.Provider>
  );
};

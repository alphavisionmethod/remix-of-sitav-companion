// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity Context Switcher
// Household / Organization / Business entity context
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type EntityContextType = "personal" | "household" | "business";

export interface EntityProfile {
  id: string;
  type: EntityContextType;
  name: string;
  icon: string;
  members?: number;
}

const DEFAULT_ENTITIES: EntityProfile[] = [
  { id: "personal", type: "personal", name: "Personal", icon: "👤" },
  { id: "household", type: "household", name: "Household", icon: "🏠", members: 4 },
  { id: "business", type: "business", name: "Business", icon: "💼", members: 1 },
];

interface EntityContextValue {
  current: EntityProfile;
  entities: EntityProfile[];
  switchEntity: (id: string) => void;
}

const EntityCtx = createContext<EntityContextValue>({
  current: DEFAULT_ENTITIES[0],
  entities: DEFAULT_ENTITIES,
  switchEntity: () => {},
});

export const useEntityContext = () => useContext(EntityCtx);

export const EntityContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentId, setCurrentId] = useState("personal");
  const current = DEFAULT_ENTITIES.find(e => e.id === currentId) || DEFAULT_ENTITIES[0];

  const switchEntity = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  return (
    <EntityCtx.Provider value={{ current, entities: DEFAULT_ENTITIES, switchEntity }}>
      {children}
    </EntityCtx.Provider>
  );
};

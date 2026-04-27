import React, { createContext, useState, useCallback, useEffect } from "react";
import {
  computeBusinessProfile,
  type BusinessProfileResult,
  type ArchetypeWeights,
  type ProfileArchetype,
} from "@/domains/engines/business-profile-engine";
import {
  saveBusinessProfile,
  loadBusinessProfile,
} from "@/lib/services/business-os/business-profile.service";

interface BusinessProfileContextValue {
  profile: BusinessProfileResult;
  primaryMode: ProfileArchetype;
  updateOverrides: (overrides: Partial<ArchetypeWeights>) => void;
  resetToDetected: () => void;
  isAdapted: boolean;
}

const defaultProfile = computeBusinessProfile({});

export const BusinessProfileCtx = createContext<BusinessProfileContextValue>({
  profile: defaultProfile,
  primaryMode: "service",
  updateOverrides: () => {},
  resetToDetected: () => {},
  isAdapted: false,
});

export function BusinessProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BusinessProfileResult>(() => loadBusinessProfile() || defaultProfile);
  const [isAdapted, setIsAdapted] = useState(() => !!loadBusinessProfile());

  useEffect(() => {
    if (isAdapted) saveBusinessProfile(profile);
  }, [profile, isAdapted]);

  const updateOverrides = useCallback((overrides: Partial<ArchetypeWeights>) => {
    const next = computeBusinessProfile({}, { ...profile.manualOverrides, ...overrides });
    setProfile(next);
    setIsAdapted(true);
  }, [profile.manualOverrides]);

  const resetToDetected = useCallback(() => {
    const next = computeBusinessProfile({});
    setProfile(next);
    setIsAdapted(false);
  }, []);

  return (
    <BusinessProfileCtx.Provider value={{ profile, primaryMode: profile.primaryMode, updateOverrides, resetToDetected, isAdapted }}>
      {children}
    </BusinessProfileCtx.Provider>
  );
}

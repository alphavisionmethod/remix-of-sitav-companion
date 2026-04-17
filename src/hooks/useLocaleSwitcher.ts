// ═══════════════════════════════════════════════════════════════
// SITA OS — Locale Switcher Hook
// Returns current locale, switch function, and supported locale list.
// RTL handling is applied in src/i18n/index.ts on `languageChanged`.
// ═══════════════════════════════════════════════════════════════

import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { SUPPORTED_LOCALES, RTL_LOCALES, type LocaleCode } from "@/i18n";

export interface LocaleOption {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

export function useLocaleSwitcher() {
  const { i18n } = useTranslation();

  const currentLocale = (i18n.language?.split("-")[0] as LocaleCode) || "en";
  const isRtl = RTL_LOCALES.has(currentLocale);

  const setLocale = useCallback(
    async (code: LocaleCode) => {
      await i18n.changeLanguage(code);
    },
    [i18n],
  );

  return {
    currentLocale,
    isRtl,
    locales: SUPPORTED_LOCALES as readonly LocaleOption[],
    setLocale,
  };
}

// ═══════════════════════════════════════════════════════════════
// SITA OS — i18n Configuration (react-i18next)
// 5 locales: en (base), es, fr, de, ar (RTL)
// ═══════════════════════════════════════════════════════════════

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" as const },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" as const },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" as const },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" as const },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" as const },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const RTL_LOCALES: ReadonlySet<string> = new Set(
  SUPPORTED_LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code),
);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LOCALES.map((l) => l.code),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Apply dir attribute on language change for RTL support
if (typeof document !== "undefined") {
  const applyDir = (lng: string) => {
    const dir = RTL_LOCALES.has(lng) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lng);
  };
  applyDir(i18n.language || "en");
  i18n.on("languageChanged", applyDir);
}

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/common.json";
import de from "@/locales/de/common.json";

const STORAGE_KEY = "gnp_locale";

export function getStoredLocale(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) ?? "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    de: { common: de },
  },
  lng: getStoredLocale(),
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language;

export default i18n;

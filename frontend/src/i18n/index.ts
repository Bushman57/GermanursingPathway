import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "@/locales/en/common.json";
import deCommon from "@/locales/de/common.json";
import enHome from "@/locales/en/home.json";
import deHome from "@/locales/de/home.json";
import enAbout from "@/locales/en/about.json";
import deAbout from "@/locales/de/about.json";
import enEligibility from "@/locales/en/eligibility.json";
import deEligibility from "@/locales/de/eligibility.json";
import enOnboardingProcess from "@/locales/en/onboardingProcess.json";
import deOnboardingProcess from "@/locales/de/onboardingProcess.json";
import enScholarshipsPage from "@/locales/en/scholarshipsPage.json";
import deScholarshipsPage from "@/locales/de/scholarshipsPage.json";
import enChat from "@/locales/en/chat.json";
import deChat from "@/locales/de/chat.json";
import enPayment from "@/locales/en/payment.json";
import dePayment from "@/locales/de/payment.json";

const STORAGE_KEY = "gnp_locale";

export function getStoredLocale(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) ?? "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      home: enHome,
      about: enAbout,
      eligibility: enEligibility,
      onboardingProcess: enOnboardingProcess,
      scholarshipsPage: enScholarshipsPage,
      chat: enChat,
      payment: enPayment,
    },
    de: {
      common: deCommon,
      home: deHome,
      about: deAbout,
      eligibility: deEligibility,
      onboardingProcess: deOnboardingProcess,
      scholarshipsPage: deScholarshipsPage,
      chat: deChat,
      payment: dePayment,
    },
  },
  lng: getStoredLocale(),
  fallbackLng: "en",
  defaultNS: "common",
  ns: [
    "common",
    "home",
    "about",
    "eligibility",
    "onboardingProcess",
    "scholarshipsPage",
    "chat",
    "payment",
  ],
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng.startsWith("de") ? "de" : "en";
});

document.documentElement.lang = i18n.language.startsWith("de") ? "de" : "en";

export default i18n;

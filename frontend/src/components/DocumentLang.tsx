import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const TITLE_KEYS: Record<string, string> = {
  "/": "meta.home.title",
  "/register": "meta.register.title",
  "/eligibility": "meta.eligibility.title",
  "/onboarding-process": "meta.onboardingProcess.title",
  "/how-it-works": "meta.onboardingProcess.title",
  "/scholarships": "meta.scholarships.title",
  "/partners": "meta.partners.title",
  "/resources": "meta.resources.title",
  "/about": "meta.about.title",
  "/portal": "meta.portal.title",
};

export function DocumentLang() {
  const { i18n, t } = useTranslation("common");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const apply = () => {
      document.documentElement.lang = i18n.language.startsWith("de") ? "de" : "en";
      const key = TITLE_KEYS[pathname];
      if (key) document.title = t(key);
    };
    apply();
    i18n.on("languageChanged", apply);
    return () => {
      i18n.off("languageChanged", apply);
    };
  }, [i18n, pathname, t]);

  return null;
}

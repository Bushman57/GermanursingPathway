import i18n from "@/i18n";
import { metaTags, type PageMeta } from "@/lib/routeHead";

export function metaHead(meta: PageMeta) {
  return { meta: metaTags(meta) };
}

/** Route head meta from common.meta.* keys (uses current i18n language at navigation). */
export function metaFromKeys(
  key: "home" | "register" | "eligibility" | "onboardingProcess" | "scholarships" | "partners" | "resources" | "blog" | "about" | "portal",
) {
  const meta: PageMeta = {
    title: i18n.t(`meta.${key}.title`, { ns: "common" }),
    description: i18n.t(`meta.${key}.description`, { ns: "common" }),
  };
  return metaHead(meta);
}

export function metaFromScholarshipsPage() {
  const meta: PageMeta = {
    title: i18n.t("meta.title", { ns: "scholarshipsPage" }),
    description: i18n.t("meta.description", { ns: "scholarshipsPage" }),
  };
  return metaHead(meta);
}

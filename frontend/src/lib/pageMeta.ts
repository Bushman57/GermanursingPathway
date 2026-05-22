import i18n from "@/i18n";
import { metaTags, type PageMeta } from "@/lib/routeHead";

/** Route head meta from common.meta.* keys (uses current i18n language at navigation). */
export function metaFromKeys(
  key: "home" | "register" | "eligibility" | "howItWorks" | "scholarships" | "partners" | "resources" | "about" | "portal",
): ReturnType<typeof metaTags> {
  const meta: PageMeta = {
    title: i18n.t(`meta.${key}.title`, { ns: "common" }),
    description: i18n.t(`meta.${key}.description`, { ns: "common" }),
  };
  return metaTags(meta);
}

export function metaFromScholarshipsPage(): ReturnType<typeof metaTags> {
  const meta: PageMeta = {
    title: i18n.t("meta.title", { ns: "scholarshipsPage" }),
    description: i18n.t("meta.description", { ns: "scholarshipsPage" }),
  };
  return metaTags(meta);
}

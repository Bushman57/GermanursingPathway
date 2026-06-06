import { RegisterInterestForm } from "@/components/register/RegisterInterestForm";
import { useTranslation } from "react-i18next";

type Props = {
  blogSlug: string;
};

export function BlogRegisterSidebar({ blogSlug }: Props) {
  const { t } = useTranslation("common");

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
        <div className="px-4 pt-5 pb-2 text-center">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t("blogPage.sidebarTitle")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("blogPage.sidebarSubtitle")}</p>
        </div>
        <RegisterInterestForm source={`blog:${blogSlug}`} compact />
      </div>
    </aside>
  );
}

import { Link } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScholarshipCard } from "./ScholarshipCard";
import type { ScholarshipSummary } from "@/lib/scholarships";
import { useTranslation } from "react-i18next";

type Props = {
  lang: string;
  picks: ScholarshipSummary[];
  onClearFilters: () => void;
};

export function ScholarshipEmptyState({ lang, picks, onClearFilters }: Props) {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <div className="text-center py-16">
      <Award className="w-10 h-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
      <p className="text-muted-foreground">{t("noResults")}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{t("emptyState.hint")}</p>
      <Button variant="outline" className="mt-4" onClick={onClearFilters}>
        {t("emptyState.clearFilters")}
      </Button>
      {picks.length > 0 && (
        <div className="mt-12 text-left">
          <h3 className="font-heading font-semibold text-lg mb-4">{t("emptyState.picks")}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {picks.map((s) => (
              <ScholarshipCard key={s.slug} s={s} lang={lang} email={undefined} />
            ))}
          </div>
        </div>
      )}
      <Button variant="warm" className="mt-6" asChild>
        <Link to="/portal">{t("emptyState.signIn")}</Link>
      </Button>
    </div>
  );
}

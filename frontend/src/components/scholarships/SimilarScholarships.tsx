import { Link } from "@tanstack/react-router";
import type { Scholarship, ScholarshipSummary } from "@/lib/scholarships";
import { scholarshipText } from "@/lib/scholarships";
import { useTranslation } from "react-i18next";

type Props = {
  current: Scholarship;
  all: ScholarshipSummary[];
  lang: string;
};

export function SimilarScholarships({ current, all, lang }: Props) {
  const { t } = useTranslation("scholarshipsPage");
  const similar = all
    .filter((s) => s.slug !== current.slug)
    .filter(
      (s) =>
        s.programType === current.programType ||
        (s.tags ?? []).some((t) => (current.tags ?? []).includes(t)),
    )
    .slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section className="py-12 border-t border-border print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-bold">{t("detail.similarTitle")}</h2>
        <ul className="mt-4 grid sm:grid-cols-3 gap-4">
          {similar.map((s) => (
            <li key={s.slug}>
              <Link
                to="/scholarships/$slug"
                params={{ slug: s.slug }}
                className="block p-4 rounded-xl border border-border hover:border-warm/40 transition-colors"
              >
                <div className="font-medium text-sm">{scholarshipText(s, "title", lang)}</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {scholarshipText(s, "shortDescription", lang)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

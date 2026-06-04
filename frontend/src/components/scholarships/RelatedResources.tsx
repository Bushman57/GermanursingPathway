import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useResourcesQuery } from "@/lib/queries/resources";
import { BookOpen } from "lucide-react";

const TOPIC_CATEGORIES: Record<string, string[]> = {
  visa: ["visa"],
  language: ["language"],
  default: ["guide", "language", "visa"],
};

export function RelatedResources({ topic = "default" }: { topic?: string }) {
  const { t, i18n } = useTranslation("scholarshipsPage");
  const { data: articles = [] } = useResourcesQuery();
  const isDe = i18n.language.startsWith("de");
  const cats = TOPIC_CATEGORIES[topic] ?? TOPIC_CATEGORIES.default;
  const related = articles.filter((a) => cats.includes(a.category)).slice(0, 2);

  if (related.length === 0) return null;

  return (
    <div className="bg-muted/40 border border-border rounded-2xl p-6 print:hidden">
      <h3 className="font-heading font-semibold flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-warm" />
        {t("detail.relatedGuides")}
      </h3>
      <ul className="mt-3 space-y-2">
        {related.map((a) => (
          <li key={a.slug}>
            <Link
              to="/resources/$slug"
              params={{ slug: a.slug }}
              className="text-sm text-warm hover:underline font-medium"
            >
              {isDe ? a.titleDe : a.titleEn}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

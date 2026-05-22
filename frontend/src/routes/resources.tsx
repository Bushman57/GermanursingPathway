import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { resourceArticles } from "@/lib/resources";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => metaFromKeys("resources"),
  component: ResourcesPage,
});

const categoryLabels: Record<string, { en: string; de: string }> = {
  language: { en: "Language", de: "Sprache" },
  visa: { en: "Visa", de: "Visum" },
  story: { en: "Stories", de: "Geschichten" },
  guide: { en: "Guides", de: "Leitfäden" },
};

function ResourcesPage() {
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground">
            {t("resourcesPage.title")} <span className="text-warm">{t("resourcesPage.titleAccent")}</span>
          </h1>
          <p className="mt-4 text-primary-foreground/80">{t("resourcesPage.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {resourceArticles.map((article) => (
            <Link
              key={article.slug}
              to="/resources/$slug"
              params={{ slug: article.slug }}
              className="block bg-card border border-border rounded-2xl p-6 hover:border-warm/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-warm uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                {isDe ? categoryLabels[article.category].de : categoryLabels[article.category].en}
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground flex items-center gap-1 normal-case">
                  <Clock className="w-3 h-3" />
                  {article.readMinutes} min
                </span>
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mt-2 group-hover:text-warm transition-colors">
                {isDe ? article.titleDe : article.titleEn}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {isDe ? article.excerptDe : article.excerptEn}
              </p>
              <span className="inline-flex items-center text-sm text-warm font-medium mt-4">
                {t("resourcesPage.read")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

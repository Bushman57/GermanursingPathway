import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { resourceArticles } from "@/lib/resources";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import i18n from "@/i18n";
import { metaTags } from "@/lib/routeHead";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const article = resourceArticles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const isDe = i18n.language.startsWith("de");
    const title = isDe ? loaderData.titleDe : loaderData.titleEn;
    return { meta: metaTags({ title: `${title} — German Nursing Pathway`, description: isDe ? loaderData.excerptDe : loaderData.excerptEn }) };
  },
  component: ResourceArticlePage,
});

function ResourceArticlePage() {
  const article = Route.useLoaderData();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const excerpt = isDe ? article.excerptDe : article.excerptEn;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-28 pb-20 max-w-3xl mx-auto px-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/resources">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("resourcesPage.back")}
          </Link>
        </Button>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          {isDe ? article.titleDe : article.titleEn}
        </h1>
        <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
          {t("resourcesPage.body", { excerpt })}
        </p>
        <div className="mt-10">
          <Button variant="warm" asChild>
            <Link to="/register">{t("resourcesPage.registerCta")}</Link>
          </Button>
        </div>
      </article>
      <Footer />
    </div>
  );
}

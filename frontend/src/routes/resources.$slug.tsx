import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { fetchResourceBySlug } from "@/lib/api/resources";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import i18n from "@/i18n";
import { metaTags } from "@/lib/routeHead";
import { VideoEmbed, extractVideoUrl } from "@/components/resources/VideoEmbed";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    try {
      return await fetchResourceBySlug(params.slug);
    } catch {
      throw notFound();
    }
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
  const body = isDe ? article.bodyDe : article.bodyEn;
  const videoUrl = extractVideoUrl(body);
  const bodyWithoutVideo = videoUrl && body ? body.replace(videoUrl, "").trim() : body;

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
        {videoUrl && (
          <div className="mt-6">
            <VideoEmbed url={videoUrl} title={isDe ? article.titleDe : article.titleEn} />
          </div>
        )}
        {bodyWithoutVideo?.trim() ? (
          <div className="mt-6 text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
            {bodyWithoutVideo}
          </div>
        ) : (
          !videoUrl && (
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              {t("resourcesPage.body", { excerpt })}
            </p>
          )
        )}
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

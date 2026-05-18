import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { resourceArticles } from "@/lib/resources";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const article = resourceArticles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.titleEn ?? "Article"} — German Nursing Pathway` }],
  }),
  component: ResourceArticlePage,
});

function ResourceArticlePage() {
  const article = Route.useLoaderData();
  const { i18n } = useTranslation();
  const isDe = i18n.language.startsWith("de");

  const bodyEn = `This guide is part of the German Nursing Pathway resource library. ${article.excerptEn} For personalised support with your application, register your interest and our team will follow up with clear next steps.`;
  const bodyDe = `Dieser Leitfaden ist Teil der Ressourcenbibliothek von German Nursing Pathway. ${article.excerptDe} Für individuelle Unterstützung bei Ihrer Bewerbung registrieren Sie bitte Ihr Interesse — unser Team meldet sich mit den nächsten Schritten.`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-28 pb-20 max-w-3xl mx-auto px-4">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/resources">
            <ArrowLeft className="w-4 h-4 mr-1" />
            All resources
          </Link>
        </Button>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          {isDe ? article.titleDe : article.titleEn}
        </h1>
        <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
          {isDe ? bodyDe : bodyEn}
        </p>
        <div className="mt-10">
          <Button variant="warm" asChild>
            <Link to="/register">Register your interest</Link>
          </Button>
        </div>
      </article>
      <Footer />
    </div>
  );
}

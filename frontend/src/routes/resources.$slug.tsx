import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { fetchResourceBySlug } from "@/lib/api/resources";
import { fetchResources } from "@/lib/api/resources";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LearningHubUnlockDialog } from "@/features/payments";
import { ChevronRight, ArrowLeft, Lock } from "lucide-react";
import i18n from "@/i18n";
import { metaTags } from "@/lib/routeHead";
import { ArticleReader } from "@/components/resources/ArticleReader";
import { ModuleSidebar } from "@/components/resources/ModuleSidebar";
import { TopicNav } from "@/components/resources/TopicNav";
import { getModuleContext, moduleRequiresUnlock } from "@/lib/learningHub";
import { useLearningAccess } from "@/lib/useLearningAccess";
import { useLearningProgress } from "@/lib/useLearningProgress";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    try {
      const [article, articles] = await Promise.all([
        fetchResourceBySlug(params.slug),
        fetchResources(),
      ]);
      return { article, articles };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const isDe = i18n.language.startsWith("de");
    const title = isDe ? loaderData.article.titleDe : loaderData.article.titleEn;
    return {
      meta: metaTags({
        title: `${title} — German Nursing Pathway`,
        description: isDe ? loaderData.article.excerptDe : loaderData.article.excerptEn,
      }),
    };
  },
  component: ResourceArticlePage,
});

function ResourceArticlePage() {
  const { article, articles } = Route.useLoaderData();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const { isComplete, isTopicDone, markComplete, unmarkComplete } = useLearningProgress();
  const { unlocked, isAuthenticated, amountKes, refetch } = useLearningAccess();
  const [unlockOpen, setUnlockOpen] = useState(false);

  const context = getModuleContext(article.slug, articles);
  const moduleLocked =
    context != null
      ? moduleRequiresUnlock(context.module.id, unlocked)
      : article.locked === true;
  const complete = isComplete(article.slug);

  const handleToggleComplete = () => {
    if (complete) {
      unmarkComplete(article.slug);
    } else {
      markComplete(article.slug);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={() => void refetch()}
      />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/resources">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("resourcesPage.back")}
            </Link>
          </Button>

          {context && (
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Link to="/resources" className="hover:text-foreground transition-colors">
                {t("resourcesPage.hubTitle")}
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Link
                to="/resources/module/$moduleId"
                params={{ moduleId: context.module.id }}
                className="hover:text-foreground transition-colors"
              >
                {context.module.title}
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                {isDe ? article.titleDe : article.titleEn}
              </span>
            </nav>
          )}

          <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {context && (
              <aside className="lg:sticky lg:top-24 lg:self-start order-2 lg:order-1">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <ModuleSidebar
                    context={context}
                    activeSlug={article.slug}
                    isTopicDone={isTopicDone}
                  />
                </div>
              </aside>
            )}

            <article className="min-w-0 order-1 lg:order-2">
              {moduleLocked ? (
                <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
                  <Lock className="w-10 h-10 text-warm mx-auto mb-4" />
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                    {isDe ? article.titleDe : article.titleEn}
                  </h1>
                  <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {isDe ? article.excerptDe : article.excerptEn}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
                    {t("resourcesPage.articleLocked", { amount: amountKes.toLocaleString() })}
                  </p>
                  <Button variant="warm" className="mt-6" onClick={() => setUnlockOpen(true)}>
                    {isAuthenticated
                      ? t("resourcesPage.unlockAllModules", {
                          amount: amountKes.toLocaleString(),
                        })
                      : t("resourcesPage.signInToUnlock")}
                  </Button>
                </div>
              ) : (
                <>
                  <ArticleReader article={article} isDe={isDe} />

                  {context && (
                    <TopicNav
                      prevSlug={context.prevSlug}
                      nextSlug={context.nextSlug}
                      isComplete={complete}
                      onToggleComplete={handleToggleComplete}
                    />
                  )}
                </>
              )}

              <div className="mt-10">
                <Button variant="warm" asChild>
                  <Link to="/register">{t("resourcesPage.registerCta")}</Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

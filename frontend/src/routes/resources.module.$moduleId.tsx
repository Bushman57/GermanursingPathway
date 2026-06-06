import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LearningHubUnlockDialog } from "@/features/payments";
import { ModuleProgressBar } from "@/components/resources/ModuleProgressBar";
import { TopicLink, topicIsLinked } from "@/components/resources/TopicLink";
import { useResourcesQuery } from "@/lib/queries/resources";
import {
  buildModuleTopics,
  getFeaturedArticlesForModule,
  getFirstUnreadTopic,
  getModuleById,
  getModuleProgress,
  moduleRequiresUnlock,
} from "@/lib/learningHub";
import { useLearningAccess } from "@/lib/useLearningAccess";
import { useLearningProgress } from "@/lib/useLearningProgress";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { buildLearningTopicHref } from "@/lib/learningProgressKeys";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/resources/module/$moduleId")({
  head: () => metaFromKeys("resources"),
  component: ModulePage,
});

function ModulePage() {
  const { moduleId } = Route.useParams();
  const module = getModuleById(moduleId);
  if (!module) throw notFound();

  const { data: articles = [], isLoading } = useResourcesQuery();
  const { completed, isTopicDone } = useLearningProgress();
  const { unlocked, isAuthenticated, amountKes, refetch } = useLearningAccess();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const [unlockOpen, setUnlockOpen] = useState(false);

  const locked = moduleRequiresUnlock(moduleId, unlocked);

  const topics = buildModuleTopics(module, articles);
  const progress = getModuleProgress(moduleId, articles, completed);
  const featured = getFeaturedArticlesForModule(moduleId, articles);
  const startTopic = getFirstUnreadTopic(moduleId, articles, completed);
  const returnTo = `/resources/module/${moduleId}`;
  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={() => void refetch()}
      />

      <section className="pt-28 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/resources">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("resourcesPage.back")}
            </Link>
          </Button>

          <div
            className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${module.accent} p-6 sm:p-8`}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center shadow-sm">
                {locked ? (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Icon className="w-7 h-7 text-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                  {t("resourcesPage.moduleLabel")}
                </div>
                <h1 className="mt-1 font-heading text-3xl sm:text-4xl font-bold text-foreground">
                  <span className="mr-2" aria-hidden>
                    {module.emoji}
                  </span>
                  {module.title}
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {locked ? t("resourcesPage.moduleLockedHint") : module.description}
                </p>
                {!locked && progress.total > 0 && (
                  <ModuleProgressBar progress={progress} className="mt-5 max-w-md" />
                )}
              </div>
            </div>
          </div>

          {locked ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
              <Lock className="w-10 h-10 text-warm mx-auto mb-4" />
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {t("resourcesPage.premiumPaywallTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                {t("resourcesPage.premiumPaywallBody", { amount: amountKes.toLocaleString() })}
              </p>
              <Button
                variant="warm"
                className="mt-6"
                onClick={() => setUnlockOpen(true)}
              >
                {isAuthenticated
                  ? t("resourcesPage.unlockAllModules", { amount: amountKes.toLocaleString() })
                  : t("resourcesPage.signInToUnlock")}
              </Button>
            </div>
          ) : (
            startTopic && (
              <div className="mt-6">
                {startTopic.slug ? (
                  <Button variant="warm" asChild>
                    <Link to="/resources/$slug" params={{ slug: startTopic.slug }}>
                      {t("resourcesPage.startModule")}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                ) : startTopic.href ? (
                  <Button variant="warm" asChild>
                    <a
                      href={buildLearningTopicHref(startTopic, moduleId, returnTo)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("resourcesPage.startModule")}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </a>
                  </Button>
                ) : null}
              </div>
            )
          )}
        </div>
      </section>

      {!locked && (
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("resourcesPage.topicsHeading")}
            </h2>
            <ol className="mt-4 space-y-2">
              {topics.map((topic) => {
                const slug = topic.slug;
                const linked = topicIsLinked(topic);
                const done = isTopicDone(topic, moduleId);
                const titleClass =
                  "text-foreground font-medium hover:text-warm hover:underline underline-offset-2 transition-colors";

                const content = (
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-mono flex items-center justify-center">
                          {String(topic.index + 1).padStart(2, "0")}
                        </span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      {linked && !slug ? (
                        <TopicLink
                          topic={topic}
                          moduleId={moduleId}
                          returnTo={returnTo}
                          className={titleClass}
                        >
                          {topic.title}
                        </TopicLink>
                      ) : (
                        <span className="text-foreground font-medium">{topic.title}</span>
                      )}
                      {slug && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <BookOpen className="w-3 h-3" /> {t("resourcesPage.readBadge")}
                          </span>
                          {topic.videoUrl && (
                            <span className="inline-flex items-center gap-1 text-warm font-semibold">
                              <PlayCircle className="w-3 h-3" /> {t("resourcesPage.videoBadge")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {slug && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                  </div>
                );

                if (slug) {
                  return (
                    <li key={topic.index}>
                      <Link
                        to="/resources/$slug"
                        params={{ slug }}
                        className="group block p-4 rounded-xl border border-border hover:border-warm/40 hover:bg-card transition-all"
                      >
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li
                    key={topic.index}
                    className={cn(
                      "p-4 rounded-xl border border-dashed border-border",
                      !linked && "opacity-60",
                    )}
                  >
                    {content}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {!locked && featured.length > 0 && (
        <section className="pb-16 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 pt-12">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("resourcesPage.featuredGuides")}
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {featured.map((a) => (
                <Link
                  key={a.slug}
                  to="/resources/$slug"
                  params={{ slug: a.slug }}
                  className="block p-4 rounded-2xl bg-card border border-border hover:border-warm/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 text-[11px] font-medium text-warm uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> {t("resourcesPage.featuredGuide")}
                    <span className="text-muted-foreground inline-flex items-center gap-1 normal-case">
                      · <Clock className="w-3 h-3" /> {a.readMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-heading font-semibold text-foreground group-hover:text-warm transition-colors text-sm leading-snug">
                    {isDe ? a.titleDe : a.titleEn}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {isDe ? a.excerptDe : a.excerptEn}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!locked && !isLoading && featured.length === 0 && progress.total === 0 && (
        <section className="pb-16 px-4">
          <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
            {t("resourcesPage.comingSoon")}
          </p>
        </section>
      )}

      <Footer />
    </div>
  );
}

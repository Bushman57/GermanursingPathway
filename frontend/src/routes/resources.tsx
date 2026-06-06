import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useResourcesQuery } from "@/lib/queries/resources";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import {
  ArrowRight,
  Lock,
  Search,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { learningModules } from "@/lib/learningModules";
import { ContinueLearning } from "@/components/resources/ContinueLearning";
import { LearningHubUnlockDialog } from "@/features/payments";
import { ModuleCard } from "@/components/resources/ModuleCard";
import {
  getContinueTarget,
  getModuleProgress,
  moduleRequiresUnlock,
} from "@/lib/learningHub";
import { useLearningAccess } from "@/lib/useLearningAccess";
import { useLearningProgress } from "@/lib/useLearningProgress";
import { cn } from "@/lib/utils";

function parseResourcesSearch(raw: Record<string, unknown>) {
  const payment = typeof raw.payment === "string" ? raw.payment.trim() : "";
  return { payment: payment || undefined };
}

export const Route = createFileRoute("/resources")({
  validateSearch: parseResourcesSearch,
  head: () => metaFromKeys("resources"),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { payment: returnReference } = Route.useSearch();
  const navigate = useNavigate({ from: "/resources" });
  const { data: articles = [], isLoading } = useResourcesQuery();
  const { completed } = useLearningProgress();
  const { unlocked, isLoading: accessLoading, isAuthenticated, amountKes, refetch } =
    useLearningAccess();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const clearPaymentReturn = () => {
    navigate({ search: { payment: undefined }, replace: true });
  };

  const openUnlock = () => setUnlockOpen(true);
  const openSignIn = () => setUnlockOpen(true);

  const continueTarget = useMemo(
    () => getContinueTarget(completed, articles),
    [completed, articles],
  );

  const storyArticle = articles.find((a) => a.slug === "candidate-story-nairobi-to-berlin");

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learningModules;
    return learningModules
      .map((m) => ({
        ...m,
        topics: m.topics.filter(
          (tp) =>
            tp.title.toLowerCase().includes(q) ||
            m.title.toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.topics.length > 0);
  }, [query]);

  const totalTopics = learningModules.reduce((n, m) => n + m.topics.length, 0);
  const hasAnyProgress = completed.size > 0;
  const hasSearch = query.trim().length > 0;

  useEffect(() => {
    if (hasSearch && filteredModules.length === 1) {
      setExpandedId(filteredModules[0].id);
    }
  }, [hasSearch, filteredModules]);

  const scrollToModule = (moduleId: string) => {
    if (moduleRequiresUnlock(moduleId, unlocked)) {
      if (isAuthenticated) openUnlock();
      else openSignIn();
      return;
    }
    setExpandedId(moduleId);
    requestAnimationFrame(() => {
      document.getElementById(moduleId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        returnReference={returnReference}
        onReturnHandled={clearPaymentReturn}
        onUnlocked={() => void refetch()}
      />

      <section className="pt-28 pb-16 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-primary-foreground/90 text-xs font-medium backdrop-blur">
            <GraduationCap className="w-3.5 h-3.5" />
            {t("resourcesPage.hubBadge")}
          </span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
            {t("resourcesPage.hubTitle")}{" "}
            <span className="text-warm">{t("resourcesPage.hubTitleAccent")}</span>
          </h1>
          <p className="mt-5 text-primary-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t("resourcesPage.hubSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{learningModules.length}</span>{" "}
              {t("resourcesPage.statModules")}
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{totalTopics}</span>{" "}
              {t("resourcesPage.statTopics")}
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{articles.length}</span>{" "}
              {t("resourcesPage.statArticles")}
            </div>
          </div>

          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("resourcesPage.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 bg-background/95 backdrop-blur border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {continueTarget && hasAnyProgress && (
        <section className="py-6 border-b border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-4">
            <ContinueLearning target={continueTarget} />
          </div>
        </section>
      )}

      {isAuthenticated && !accessLoading && !unlocked && (
        <section className="py-4 border-b border-warm/20 bg-warm/5">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-warm shrink-0 mt-0.5" />
              <div>
                <p className="font-heading font-semibold text-foreground">
                  {t("resourcesPage.unlockBannerTitle", { amount: amountKes.toLocaleString() })}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("resourcesPage.unlockBannerBody")}
                </p>
              </div>
            </div>
            <Button variant="warm" size="sm" className="shrink-0" onClick={openUnlock}>
              {t("resourcesPage.unlockAllModules", { amount: amountKes.toLocaleString() })}
            </Button>
          </div>
        </section>
      )}

      <section className="sticky top-16 z-30 bg-background/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {learningModules.map((m) => {
              const progress = getModuleProgress(m.id, articles, completed);
              const isActive = expandedId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => scrollToModule(m.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap",
                    "hover:border-warm/40 hover:shadow-sm hover:-translate-y-px",
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-md"
                      : "bg-card text-foreground/80 border-border hover:text-foreground",
                  )}
                >
                  <span aria-hidden>{m.emoji}</span>
                  {m.title}
                  {progress.total > 0 && progress.percent > 0 && (
                    <span
                      className={cn(
                        "ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        isActive ? "bg-background/20 text-background" : "bg-warm/15 text-warm",
                      )}
                    >
                      {progress.percent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {filteredModules.length === 0 && (
            <p className="text-center text-muted-foreground">
              {t("resourcesPage.noResults", { query })}
            </p>
          )}

          {filteredModules.map((module, idx) => {
            const moduleIndex = learningModules.findIndex((m) => m.id === module.id);
            const locked = moduleRequiresUnlock(module.id, unlocked);
            return (
              <ModuleCard
                key={module.id}
                module={module}
                moduleIndex={moduleIndex >= 0 ? moduleIndex : idx}
                articles={articles}
                isLoading={isLoading}
                isDe={isDe}
                expanded={!locked && expandedId === module.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === module.id ? null : module.id))
                }
                progress={getModuleProgress(module.id, articles, completed)}
                locked={locked}
                isAuthenticated={isAuthenticated}
                amountKes={amountKes}
                onUnlock={openUnlock}
                onSignIn={openSignIn}
                t={t}
              />
            );
          })}
        </div>
      </section>

      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm/10 text-warm text-xs font-semibold uppercase tracking-wider">
            <PlayCircle className="w-3.5 h-3.5" /> {t("resourcesPage.watchLearnBadge")}
          </span>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-bold text-foreground">
            {t("resourcesPage.storiesHeading")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("resourcesPage.storiesSubtitle")}</p>
          {storyArticle && (
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/resources/$slug" params={{ slug: storyArticle.slug }}>
                  {t("resourcesPage.readStory")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="warm" asChild>
              <Link to="/register">{t("resourcesPage.registerCta")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/eligibility">{t("resourcesPage.eligibilityCta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

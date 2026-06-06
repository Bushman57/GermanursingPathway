import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleProgressBar } from "@/components/resources/ModuleProgressBar";
import { TopicLink, topicIsLinked } from "@/components/resources/TopicLink";
import type { LearningModule } from "@/lib/learningModules";
import {
  buildModuleTopics,
  getFeaturedBlogsForModule,
  type ModuleProgress,
} from "@/lib/learningHub";
import type { BlogPost } from "@/lib/blogs";
import { useLearningProgress } from "@/lib/useLearningProgress";
import { cn } from "@/lib/utils";
import type { TFunction } from "i18next";

type Props = {
  module: LearningModule;
  moduleIndex: number;
  blogs: BlogPost[];
  isLoading: boolean;
  isDe: boolean;
  expanded: boolean;
  onToggle: () => void;
  progress: ModuleProgress;
  locked: boolean;
  isAuthenticated: boolean;
  amountKes: number;
  onUnlock: () => void;
  onSignIn: () => void;
  t: TFunction<"common">;
};

export function ModuleCard({
  module,
  moduleIndex,
  blogs,
  isLoading,
  isDe,
  expanded,
  onToggle,
  progress,
  locked,
  isAuthenticated,
  amountKes,
  onUnlock,
  onSignIn,
  t,
}: Props) {
  const Icon = module.icon;
  const topics = buildModuleTopics(module, blogs);
  const moduleBlogs = getFeaturedBlogsForModule(module.id, blogs);
  const linkedCount = topics.filter((tp) => tp.hasContent).length;
  const { isTopicDone } = useLearningProgress();
  const returnTo = `/resources/module/${module.id}`;

  const handleHeaderClick = () => {
    if (locked) {
      if (isAuthenticated) onUnlock();
      else onSignIn();
      return;
    }
    onToggle();
  };

  return (
    <article id={module.id} className="scroll-mt-32 group/module">
      <button
        type="button"
        onClick={handleHeaderClick}
        aria-expanded={!locked && expanded}
        aria-controls={`module-panel-${module.id}`}
        className={cn(
          "w-full text-left relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-all duration-300",
          "bg-gradient-to-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2",
          module.accent,
          locked
            ? "border-border/80 opacity-90 hover:border-warm/30 hover:shadow-sm group-hover/module:animate-[pulse_1.5s_ease-in-out_1]"
            : expanded
              ? "border-warm/40 shadow-lg ring-1 ring-warm/20"
              : "border-border hover:border-warm/35 hover:shadow-md hover:-translate-y-0.5",
        )}
      >
        {locked && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 border border-border text-xs font-semibold text-muted-foreground">
            <Lock className="w-3 h-3" />
            {t("resourcesPage.moduleLocked")}
          </span>
        )}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "shrink-0 w-12 h-12 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center shadow-sm transition-transform duration-300",
              !expanded && !locked && "group-hover/module:scale-105",
              locked && "opacity-70",
            )}
          >
            {locked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Icon className="w-6 h-6 text-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-mono text-muted-foreground tracking-wider">
                  {t("resourcesPage.moduleNumber", {
                    number: String(moduleIndex + 1).padStart(2, "0"),
                  })}
                </div>
                <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-foreground">
                  <span className="mr-2" aria-hidden>
                    {module.emoji}
                  </span>
                  {module.title}
                </h2>
              </div>
              {!locked && (
                <ChevronDown
                  className={cn(
                    "w-5 h-5 shrink-0 mt-1 text-muted-foreground transition-transform duration-300",
                    expanded && "rotate-180 text-warm",
                  )}
                  aria-hidden
                />
              )}
            </div>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              {locked ? t("resourcesPage.moduleLockedHint") : module.description}
            </p>
            {!locked && (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-full bg-background/60 border border-border/60">
                    {module.topics.length} {t("resourcesPage.statTopics")}
                  </span>
                  {linkedCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {linkedCount} {t("resourcesPage.readBadge").toLowerCase()}
                    </span>
                  )}
                  {progress.total > 0 && progress.percent > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-warm/10 text-warm border border-warm/20">
                      {progress.percent}%
                    </span>
                  )}
                </div>
                {progress.total > 0 && (
                  <ModuleProgressBar progress={progress} className="mt-4 max-w-xs" />
                )}
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {expanded ? t("resourcesPage.collapseModule") : t("resourcesPage.expandModule")}
                </p>
              </>
            )}
            {locked && (
              <div className="mt-5 flex flex-wrap gap-2">
                {isAuthenticated ? (
                  <Button
                    type="button"
                    variant="warm"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlock();
                    }}
                  >
                    {t("resourcesPage.unlockAllModules", {
                      amount: amountKes.toLocaleString(),
                    })}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSignIn();
                    }}
                  >
                    {t("resourcesPage.signInToUnlock")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </button>

      {!locked && (
        <div
          id={`module-panel-${module.id}`}
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            expanded
              ? "grid-rows-[1fr] opacity-100 mt-5"
              : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none",
          )}
          aria-hidden={!expanded}
        >
          <div className="overflow-hidden min-h-0">
            <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-sm">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {t("resourcesPage.topicsHeading")}
                  </h3>
                  <ol className="space-y-1.5">
                    {topics.map((topic) => {
                      const slug = topic.slug;
                      const linked = topicIsLinked(topic);
                      const done = isTopicDone(topic, module.id);
                      const rowClass =
                        "group flex items-start gap-3 p-3 rounded-xl border border-transparent transition-all duration-200";
                      const titleClass =
                        "text-foreground font-medium transition-colors hover:text-warm hover:underline underline-offset-2";

                      const content = (
                        <>
                          <span className="shrink-0 mt-0.5">
                            {done ? (
                              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                            ) : (
                              <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-mono flex items-center justify-center">
                                {String(topic.index + 1).padStart(2, "0")}
                              </span>
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {linked && !slug ? (
                                <TopicLink
                                  topic={topic}
                                  moduleId={module.id}
                                  returnTo={returnTo}
                                  className={titleClass}
                                >
                                  {topic.title}
                                </TopicLink>
                              ) : (
                                <span className="text-foreground font-medium group-hover:text-warm transition-colors">
                                  {topic.title}
                                </span>
                              )}
                              {topic.videoUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-warm font-semibold">
                                  <PlayCircle className="w-3 h-3" /> {t("resourcesPage.videoBadge")}
                                </span>
                              )}
                              {slug && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <BookOpen className="w-3 h-3" /> {t("resourcesPage.readBadge")}
                                </span>
                              )}
                            </div>
                          </div>
                          {slug && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
                          )}
                        </>
                      );

                      if (slug) {
                        return (
                          <li key={topic.index}>
                            <Link
                              to="/blog/$slug"
                              params={{ slug }}
                              className={cn(
                                rowClass,
                                "hover:border-border hover:bg-muted/40 hover:shadow-sm",
                              )}
                            >
                              {content}
                            </Link>
                          </li>
                        );
                      }

                      return (
                        <li key={topic.index} className={cn(rowClass, !linked && "opacity-55")}>
                          {content}
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <aside className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {t("resourcesPage.featuredGuides")}
                  </h3>
                  {moduleBlogs.slice(0, 3).map((a) => (
                    <Link
                      key={a.slug}
                      to="/blog/$slug"
                      params={{ slug: a.slug }}
                      className="block p-4 rounded-2xl bg-card border border-border hover:border-warm/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-medium text-warm uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> {t("resourcesPage.featuredGuide")}
                        <span className="text-muted-foreground inline-flex items-center gap-1 normal-case">
                          · <Clock className="w-3 h-3" /> {a.readMinutes} min
                        </span>
                      </div>
                      <h4 className="mt-1.5 font-heading font-semibold text-foreground group-hover:text-warm transition-colors text-sm leading-snug">
                        {isDe ? a.titleDe : a.titleEn}
                      </h4>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {isDe ? a.excerptDe : a.excerptEn}
                      </p>
                    </Link>
                  ))}
                  {moduleBlogs.length === 0 && !isLoading && (
                    <div className="p-4 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                      {t("resourcesPage.comingSoon")}
                    </div>
                  )}
                </aside>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/resources/module/$moduleId" params={{ moduleId: module.id }}>
                    {t("resourcesPage.openModule")}
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

import { BookOpen, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { TopicLink, topicIsLinked } from "@/components/resources/TopicLink";
import type { ModuleContext } from "@/lib/learningHub";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import type { ModuleTopicEntry } from "@/lib/learningHub";

type Props = {
  context: ModuleContext;
  activeSlug: string;
  isTopicDone: (topic: ModuleTopicEntry, moduleId: string) => boolean;
};

export function ModuleSidebar({ context, activeSlug, isTopicDone }: Props) {
  const { t } = useTranslation("common");
  const { module, topics } = context;
  const titleClass =
    "hover:text-warm hover:underline underline-offset-2 transition-colors";
  const returnTo = `/resources/module/${module.id}`;

  return (
    <nav aria-label={t("resourcesPage.moduleNav")} className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span aria-hidden>{module.emoji}</span>
        <span className="font-heading">{module.title}</span>
      </div>
      <ol className="space-y-1">
        {topics.map((topic) => {
          const slug = topic.slug;
          const linked = topicIsLinked(topic);
          const active = slug === activeSlug;
          const done = isTopicDone(topic, module.id);
          const hasVideo = Boolean(topic.videoUrl);

          const title = (
            <span
              className={cn(
                "block text-sm leading-snug",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {String(topic.index + 1).padStart(2, "0")}.{" "}
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
                topic.title
              )}
            </span>
          );

          const meta = slug ? (
            <span className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-wider">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <BookOpen className="w-3 h-3" /> {t("resourcesPage.readBadge")}
              </span>
              {hasVideo && (
                <span className="inline-flex items-center gap-0.5 text-warm font-semibold">
                  <PlayCircle className="w-3 h-3" /> {t("resourcesPage.videoBadge")}
                </span>
              )}
            </span>
          ) : null;

          if (slug) {
            return (
              <li key={topic.index}>
                <Link
                  to="/resources/$slug"
                  params={{ slug }}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors",
                    active
                      ? "border-warm/40 bg-warm/5"
                      : "border-transparent hover:border-border hover:bg-muted/50",
                  )}
                >
                  <span className="shrink-0 mt-0.5">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    {title}
                    {meta}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li
              key={topic.index}
              className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-xl",
                !linked && "opacity-60",
              )}
            >
              <span className="shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/50" />
                )}
              </span>
              <span className="flex-1 min-w-0">{title}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

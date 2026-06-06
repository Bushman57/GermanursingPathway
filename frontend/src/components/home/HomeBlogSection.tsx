import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LearningHubUnlockDialog } from "@/features/payments";
import { learningModules } from "@/lib/learningModules";
import { buildModuleTopics, moduleRequiresUnlock } from "@/lib/learningHub";
import { buildLearningTopicHref } from "@/lib/learningProgressKeys";
import { useResourcesQuery } from "@/lib/queries/resources";
import { useLearningAccess } from "@/lib/useLearningAccess";
import type { ResourceArticle } from "@/lib/resources";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const PREMIUM_MODULES = learningModules.slice(1);

export type HomeBlogEntry = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  moduleEmoji: string;
  moduleIcon: LucideIcon;
  topicIndex: number;
  topicTitle: string;
  slug?: string;
  href?: string;
  hash?: string;
  hasContent: boolean;
  dateLabel: string;
};

function formatBlogDate(moduleIndex: number, topicIndex: number, locale: string): string {
  const base = new Date(2024, 5, 1);
  base.setDate(base.getDate() + moduleIndex * 7 + topicIndex * 3);
  return base.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export function getHomeBlogEntries(articles: ResourceArticle[], locale: string): HomeBlogEntry[] {
  const entries: HomeBlogEntry[] = [];

  for (let moduleIndex = 0; moduleIndex < PREMIUM_MODULES.length; moduleIndex++) {
    const module = PREMIUM_MODULES[moduleIndex];
    const topics = buildModuleTopics(module, articles);
    for (const topic of topics) {
      entries.push({
        id: `${module.id}-${topic.index}`,
        moduleId: module.id,
        moduleTitle: module.title,
        moduleDescription: module.description,
        moduleEmoji: module.emoji,
        moduleIcon: module.icon,
        topicIndex: topic.index,
        topicTitle: topic.title,
        slug: topic.slug,
        href: topic.href,
        hash: topic.hash,
        hasContent: topic.hasContent,
        dateLabel: formatBlogDate(moduleIndex + 1, topic.index, locale),
      });
    }
  }

  return entries;
}

function getTopicHref(entry: HomeBlogEntry): string | null {
  if (entry.slug) return `/resources/${entry.slug}`;
  if (entry.href) {
    return buildLearningTopicHref(
      { href: entry.href, hash: entry.hash, index: entry.topicIndex },
      entry.moduleId,
      "/resources",
    );
  }
  return `/resources/module/${entry.moduleId}`;
}

type BlogCardProps = {
  entry: HomeBlogEntry;
  locked: boolean;
  onLockedClick: () => void;
  readMoreLabel: string;
  lockedHint: string;
};

function BlogCard({ entry, locked, onLockedClick, readMoreLabel, lockedHint }: BlogCardProps) {
  const href = getTopicHref(entry);
  const isExternal = Boolean(entry.href && /^https?:\/\//i.test(entry.href));

  const cardBody = (
    <article
      className={cn(
        "relative flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300",
        locked
          ? "opacity-90 hover:border-warm/30 hover:shadow-md cursor-pointer"
          : "hover:border-warm/40 hover:shadow-lg hover:-translate-y-1",
      )}
    >
      <div className="relative h-32 sm:h-36">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-warm" />
          <div className="w-1/2 bg-primary" />
        </div>
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background border-4 border-card shadow-lg flex items-center justify-center",
              locked && "opacity-80",
            )}
          >
            {locked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <span className="text-xl sm:text-2xl" aria-hidden>
                {entry.moduleEmoji}
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 text-center">
          <h3 className="font-heading text-sm sm:text-base font-bold text-primary-foreground line-clamp-2 leading-snug">
            {entry.topicTitle}
          </h3>
          <p className="mt-0.5 text-[11px] sm:text-xs text-primary-foreground/80 line-clamp-1">
            {entry.moduleTitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 py-4">
        <p className="text-xs text-muted-foreground">{entry.dateLabel}</p>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {entry.moduleDescription}
        </p>
        <span
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 text-sm font-medium",
            locked ? "text-muted-foreground" : "text-warm group-hover:gap-2 transition-all",
          )}
        >
          {readMoreLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {locked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 border border-border text-xs font-semibold text-muted-foreground shadow-sm">
            <Lock className="w-3 h-3" />
            {lockedHint}
          </span>
        </div>
      )}
    </article>
  );

  if (locked) {
    return (
      <button type="button" className="group w-full text-left" onClick={onLockedClick}>
        {cardBody}
      </button>
    );
  }

  if (isExternal && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block h-full">
        {cardBody}
      </a>
    );
  }

  if (entry.slug) {
    return (
      <Link to="/resources/$slug" params={{ slug: entry.slug }} className="group block h-full">
        {cardBody}
      </Link>
    );
  }

  return (
    <Link to="/resources/module/$moduleId" params={{ moduleId: entry.moduleId }} className="group block h-full">
      {cardBody}
    </Link>
  );
}

type Props = {
  returnReference?: string;
  onReturnHandled?: () => void;
};

export function HomeBlogSection({ returnReference, onReturnHandled }: Props) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language.startsWith("de") ? "de-DE" : "en-GB";
  const { data: articles = [] } = useResourcesQuery();
  const { unlocked, refetch } = useLearningAccess();
  const [unlockOpen, setUnlockOpen] = useState(false);

  const entries = useMemo(() => getHomeBlogEntries(articles, locale), [articles, locale]);

  const openUnlock = () => setUnlockOpen(true);

  const handleLockedClick = () => {
    openUnlock();
  };

  if (entries.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        returnReference={returnReference}
        onReturnHandled={onReturnHandled}
        onUnlocked={() => void refetch()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            {t("home.blog.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("home.blog.subtitle")}</p>
        </div>

        <div className="relative px-10 sm:px-12">
          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {entries.map((entry) => {
                const locked = moduleRequiresUnlock(entry.moduleId, unlocked);
                return (
                  <CarouselItem
                    key={entry.id}
                    className="pl-3 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <BlogCard
                      entry={entry}
                      locked={locked}
                      onLockedClick={handleLockedClick}
                      readMoreLabel={t("home.blog.readMore")}
                      lockedHint={t("home.blog.lockedHint")}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-border bg-card shadow-md hover:bg-muted" />
            <CarouselNext className="right-0 border-border bg-card shadow-md hover:bg-muted" />
          </Carousel>
        </div>

        <div className="text-center mt-10">
          <Button variant="warm" asChild>
            <Link to="/resources">
              {t("home.blog.viewMore")}
              <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

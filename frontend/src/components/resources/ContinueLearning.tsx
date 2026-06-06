import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { buildLearningTopicHref } from "@/lib/learningProgressKeys";
import type { ContinueTarget } from "@/lib/learningHub";
import { useTranslation } from "react-i18next";

type Props = {
  target: ContinueTarget;
};

export function ContinueLearning({ target }: Props) {
  const { t } = useTranslation("common");

  const resumeHref = target.slug
    ? undefined
    : target.href
      ? buildLearningTopicHref(
          {
            href: target.href,
            hash: target.hash,
            index: target.topicIndex ?? 0,
          },
          target.moduleId,
          `/resources/module/${target.moduleId}`,
        )
      : undefined;

  return (
    <div className="rounded-2xl border border-warm/30 bg-gradient-to-r from-warm/10 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-warm/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-warm" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm">
            {t("resourcesPage.continueLabel")}
          </p>
          <p className="mt-1 font-heading font-semibold text-foreground truncate">
            {target.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("resourcesPage.continueModule", { module: target.moduleTitle })}
          </p>
        </div>
      </div>
      <Button variant="warm" asChild className="shrink-0">
        {target.slug ? (
          <Link to="/blog/$slug" params={{ slug: target.slug }}>
            {t("resourcesPage.continueCta")}
            <ArrowRight />
          </Link>
        ) : resumeHref ? (
          <a href={resumeHref} target="_blank" rel="noopener noreferrer">
            {t("resourcesPage.continueCta")}
            <ArrowRight />
          </a>
        ) : (
          <Link to="/resources/module/$moduleId" params={{ moduleId: target.moduleId }}>
            {t("resourcesPage.continueCta")}
            <ArrowRight />
          </Link>
        )}
      </Button>
    </div>
  );
}

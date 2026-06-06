import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  prevSlug: string | null;
  nextSlug: string | null;
  isComplete: boolean;
  onToggleComplete: () => void;
};

export function TopicNav({
  prevSlug,
  nextSlug,
  isComplete,
  onToggleComplete,
}: Props) {
  const { t } = useTranslation("common");

  return (
    <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex gap-2 flex-1">
        {prevSlug ? (
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link to="/resources/$slug" params={{ slug: prevSlug }}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t("resourcesPage.prevTopic")}
            </Link>
          </Button>
        ) : (
          <div className="flex-1 sm:flex-none" />
        )}
        {nextSlug ? (
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link to="/resources/$slug" params={{ slug: nextSlug }}>
              {t("resourcesPage.nextTopic")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        ) : null}
      </div>
      <Button
        variant={isComplete ? "secondary" : "warm"}
        size="sm"
        onClick={onToggleComplete}
        className="sm:ml-auto"
      >
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        {isComplete ? t("resourcesPage.markIncomplete") : t("resourcesPage.markComplete")}
      </Button>
    </div>
  );
}

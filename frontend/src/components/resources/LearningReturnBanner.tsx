import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { parseTopicProgressKey } from "@/lib/learningProgressKeys";
import { useLearningProgress } from "@/lib/useLearningProgress";
import { ArrowLeft, BookOpen } from "lucide-react";

type Props = {
  learningReturn?: string;
  learningTopic?: string;
};

export function LearningReturnBanner({ learningReturn, learningTopic }: Props) {
  const { t } = useTranslation("common");
  const { markTopicComplete } = useLearningProgress();

  useEffect(() => {
    if (!learningTopic) return;
    const parsed = parseTopicProgressKey(learningTopic);
    if (parsed) {
      markTopicComplete(parsed.moduleId, parsed.index);
    }
  }, [learningTopic, markTopicComplete]);

  if (!learningReturn) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-warm/30 bg-gradient-to-r from-warm/10 to-warm/5 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0 text-sm text-foreground">
          <BookOpen className="w-4 h-4 text-warm shrink-0" />
          <span className="truncate">{t("resourcesPage.learningReturnLabel")}</span>
        </div>
        <Button variant="warm" size="sm" asChild className="shrink-0">
          <a href={learningReturn}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t("resourcesPage.learningReturnCta")}
          </a>
        </Button>
      </div>
    </div>
  );
}

import { Progress } from "@/components/ui/progress";
import type { ModuleProgress } from "@/lib/learningHub";
import { useTranslation } from "react-i18next";

type Props = {
  progress: ModuleProgress;
  className?: string;
};

export function ModuleProgressBar({ progress, className }: Props) {
  const { t } = useTranslation("common");

  if (progress.total === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>
          {t("resourcesPage.progressLabel", {
            completed: progress.completed,
            total: progress.total,
          })}
        </span>
        <span>{progress.percent}%</span>
      </div>
      <Progress value={progress.percent} className="h-2 bg-muted [&>div]:bg-warm" />
    </div>
  );
}

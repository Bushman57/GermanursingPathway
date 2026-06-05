import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Plane,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JourneyStageStatus } from "@/lib/api/portal";
import { usePortalJourneyQuery } from "@/lib/queries/portal";

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  register: UserCheck,
  eligibility: CheckCircle2,
  documents: FileText,
  language: GraduationCap,
  placement: GraduationCap,
  visa: Plane,
};

export function PortalJourney() {
  const { t } = useTranslation("portal");
  const { data, isLoading } = usePortalJourneyQuery();

  if (isLoading || !data) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("journey.loading", { defaultValue: "Loading journey…" })}
        </p>
      </section>
    );
  }

  const { stages, progress, eligibility } = data;

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading font-semibold">{t("journey.title")}</h2>
        <span className="text-sm text-muted-foreground">{t("journey.percent", { progress })}</span>
      </div>
      <div
        className="h-2 bg-muted rounded-full overflow-hidden mb-6"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {eligibility && (
        <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">
            {t("journey.eligibilitySummary", {
              defaultValue: "Eligibility score: {{score}}% ({{status}})",
              score: eligibility.score,
              status: eligibility.status,
            })}
          </p>
        </div>
      )}

      {stages.find((s) => s.key === "eligibility")?.status === "in_progress" && (
        <div className="mb-6">
          <Button variant="warm" size="sm" asChild>
            <Link to="/eligibility" search={{ from: "register" }}>
              {t("journey.completeEligibility", { defaultValue: "Complete eligibility review" })}
            </Link>
          </Button>
        </div>
      )}

      <ol className="space-y-5">
        {stages.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.key] ?? Circle;
          return (
            <li key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StageDot status={stage.status} />
                {i < stages.length - 1 && (
                  <div
                    className={`w-px flex-1 mt-1 min-h-[24px] ${
                      stage.status === "done" ? "bg-success/50" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="pb-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className="h-4 w-4 text-warm shrink-0" aria-hidden />
                  <h3 className="font-medium text-foreground">
                    {t(`journey.stages.${stage.key}.title`)}
                  </h3>
                  <StatusBadge status={stage.status} label={t(`journey.status.${stage.status}`)} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`journey.stages.${stage.key}.description`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StageDot({ status }: { status: JourneyStageStatus }) {
  if (status === "done")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success shadow-sm">
        <CheckCircle2 className="h-4 w-4 text-success-foreground" />
      </div>
    );
  if (status === "in_progress")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-success bg-success/15">
        <Clock className="h-3.5 w-3.5 text-success" />
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center">
      <Circle className="w-3 h-3 text-muted-foreground" />
    </div>
  );
}

function StatusBadge({ status, label }: { status: JourneyStageStatus; label: string }) {
  const map = {
    done: "bg-success/15 text-success",
    in_progress: "bg-success/15 text-success",
    pending: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${map[status]}`}
    >
      {label}
    </span>
  );
}

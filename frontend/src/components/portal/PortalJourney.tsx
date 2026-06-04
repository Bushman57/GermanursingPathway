import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  GraduationCap,
  Plane,
} from "lucide-react";

type StageStatus = "done" | "in_progress" | "pending";

type Stage = {
  key: string;
  status: StageStatus;
  icon: React.ComponentType<{ className?: string }>;
};

const STAGES: Stage[] = [
  { key: "register", status: "done", icon: CheckCircle2 },
  { key: "eligibility", status: "done", icon: CheckCircle2 },
  { key: "documents", status: "in_progress", icon: FileText },
  { key: "language", status: "pending", icon: GraduationCap },
  { key: "placement", status: "pending", icon: GraduationCap },
  { key: "visa", status: "pending", icon: Plane },
];

export function PortalJourney() {
  const { t } = useTranslation("portal");
  const completed = STAGES.filter((s) => s.status === "done").length;
  const progress = Math.round((completed / STAGES.length) * 100);

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-heading font-semibold">{t("journey.title")}</h2>
        <span className="text-sm text-muted-foreground">{t("journey.percent", { progress })}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="space-y-5">
        {STAGES.map((stage, i) => (
          <li key={stage.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <StageDot status={stage.status} />
              {i < STAGES.length - 1 && (
                <div
                  className={`w-px flex-1 mt-1 min-h-[24px] ${
                    stage.status === "done" ? "bg-success/50" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-foreground">{t(`journey.stages.${stage.key}.title`)}</h3>
                <StatusBadge status={stage.status} label={t(`journey.status.${stage.status}`)} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t(`journey.stages.${stage.key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageDot({ status }: { status: StageStatus }) {
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

function StatusBadge({ status, label }: { status: StageStatus; label: string }) {
  const map = {
    done: "bg-success/15 text-success",
    in_progress: "bg-success/15 text-success",
    pending: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${map[status]}`}>
      {label}
    </span>
  );
}

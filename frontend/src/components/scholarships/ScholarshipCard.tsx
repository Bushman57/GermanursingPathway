import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Calendar, BadgeCheck, GitCompare } from "lucide-react";
import { ScholarshipApplyButton, ScholarshipTitleLink } from "@/components/scholarships/ScholarshipCardLinks";
import { ScholarshipSaveButton } from "@/components/scholarships/ScholarshipSaveButton";
import { DeadlineBadge } from "@/components/scholarships/DeadlineBadge";
import { Button } from "@/components/ui/button";
import {
  fundingDisplayLabel,
  optionLabel,
} from "@/lib/scholarshipFieldOptions";
import { scholarshipText, type ScholarshipSummary } from "@/lib/scholarships";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { cn } from "@/lib/utils";

type Props = {
  s: ScholarshipSummary;
  lang: string;
  email?: string;
  comparing?: boolean;
  onCompareToggle?: (slug: string) => void;
  className?: string;
};

export function ScholarshipCard({
  s,
  lang,
  email,
  comparing,
  onCompareToggle,
  className,
}: Props) {
  const { t } = useTranslation("scholarshipsPage");
  const { isSaved, toggle } = useSavedScholarships(email);
  const saved = isSaved(s.slug);
  const deadline = scholarshipText(s, "deadline", lang);

  return (
    <article
      className={cn(
        "group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-warm/40 transition-all flex flex-col scholarship-card-enter",
        comparing && "ring-2 ring-warm/50",
        className,
      )}
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <ScholarshipTitleLink scholarship={s} title={scholarshipText(s, "title", lang)} />
          <div className="flex items-center gap-0.5 shrink-0">
            {email && (
              <ScholarshipSaveButton
                saved={saved}
                onToggle={() => toggle(s.slug, scholarshipText(s, "title", lang))}
              />
            )}
            {onCompareToggle && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onCompareToggle(s.slug)}
                aria-pressed={comparing}
                aria-label={t("compare.toggle")}
              >
                <GitCompare className={cn("w-4 h-4", comparing && "text-warm")} />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <DeadlineBadge deadline={deadline} />
          {s.verified && (
            <Badge className="bg-success/15 text-success border-0 text-[10px] font-medium gap-0.5">
              <BadgeCheck className="w-3 h-3" />
              {t("verifiedBadge")}
            </Badge>
          )}
          {s.applicationStatus && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium">
              {optionLabel(s.applicationStatus)}
            </Badge>
          )}
          {s.intakeMonth && (
            <Badge className="bg-muted text-muted-foreground border border-border text-[10px] font-medium">
              {optionLabel(s.intakeMonth)}
            </Badge>
          )}
          {(s.tags ?? []).slice(0, 2).map((tag) => (
            <Badge key={tag} className="bg-muted text-muted-foreground border border-border text-[10px] font-medium">
              {optionLabel(tag)}
            </Badge>
          ))}
          <Badge
            className={`border-0 text-[10px] font-medium ${
              s.funding === "fully_funded" ||
              scholarshipText(s, "funding", lang).toLowerCase().includes("fully")
                ? "bg-success/15 text-success hover:bg-success/15"
                : "bg-warm/15 text-warm hover:bg-warm/15"
            }`}
          >
            {fundingDisplayLabel(s.funding) || scholarshipText(s, "funding", lang)}
          </Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 text-[10px] font-medium">
            {scholarshipText(s, "provider", lang)}
          </Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
            {s.hostCountry}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mt-4">
          {scholarshipText(s, "shortDescription", lang)}
        </p>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-warm shrink-0" />
            <span className="truncate">{deadline}</span>
          </span>
          <ScholarshipApplyButton scholarship={s} applyLabel={t("apply")} />
        </div>
      </div>
    </article>
  );
}

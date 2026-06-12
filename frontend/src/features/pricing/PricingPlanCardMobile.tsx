import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingPlanConfig } from "@/features/pricing/pricingPlanConfig";

type Props = {
  plan: PricingPlanConfig;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleBenefits: () => void;
};

export function PricingPlanCardMobile({
  plan,
  selected,
  expanded,
  onSelect,
  onToggleBenefits,
}: Props) {
  const { t } = useTranslation("pricing");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "rounded-2xl border bg-card p-4 text-left transition-shadow",
        selected ? "border-warm ring-2 ring-warm/40 shadow-md" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center",
            selected ? "border-warm" : "border-muted-foreground/40",
          )}
          aria-hidden
        >
          {selected && <div className="h-2.5 w-2.5 rounded-full bg-warm" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
              {plan.id}
            </span>
            {plan.popular && (
              <span className="text-[10px] font-semibold uppercase text-warm">{t("mostPopular")}</span>
            )}
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {plan.priceKes.toLocaleString()} KES
            </span>
            <span className="text-xs text-muted-foreground ml-1">{t("perTerm")}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t(plan.shortDescriptionKey)}</p>
          {plan.inheritsFrom === "essential" && (
            <p className="mt-1 text-xs text-muted-foreground">{t("inheritsEssential")}</p>
          )}
          {plan.inheritsFrom === "plus" && (
            <p className="mt-1 text-xs text-muted-foreground">{t("inheritsPlus")}</p>
          )}
        </div>
      </div>

      {expanded && (
        <ul className="mt-4 ml-8 space-y-2 border-t border-border pt-4 text-sm">
          {plan.featureKeys.map((key) => (
            <li key={key} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-warm shrink-0 mt-0.5" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="mt-3 ml-8 flex items-center gap-1 text-sm font-medium text-warm"
        onClick={(e) => {
          e.stopPropagation();
          onToggleBenefits();
        }}
      >
        {expanded ? t("hideBenefits") : t("seeBenefits")}
        <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
      </button>
    </div>
  );
}

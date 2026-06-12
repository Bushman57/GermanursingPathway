import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PricingPlanConfig } from "@/features/pricing/pricingPlanConfig";

type Props = {
  plan: PricingPlanConfig;
  onSelect: () => void;
  loading?: boolean;
};

export function PricingPlanCardDesktop({ plan, onSelect, loading }: Props) {
  const { t } = useTranslation("pricing");

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 sm:p-8 shadow-sm",
        plan.popular ? "border-warm ring-2 ring-warm/30" : "border-border",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-warm px-3 py-0.5 text-xs font-semibold text-white">
          {t("mostPopular")}
        </span>
      )}
      <h3 className="font-heading text-xl font-bold capitalize text-foreground">{plan.id}</h3>
      <div className="mt-4">
        <span className="text-3xl font-bold text-foreground">{plan.priceKes.toLocaleString()} KES</span>
        <span className="text-sm text-muted-foreground ml-1">{t("perTerm")}</span>
      </div>
      <ul className="mt-6 space-y-3 flex-1 text-sm text-foreground/90">
        {plan.featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-warm shrink-0 mt-0.5" />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={plan.popular ? "warm" : "outline"}
        size="lg"
        className="mt-8 w-full"
        disabled={loading}
        onClick={onSelect}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t(plan.ctaKey)}
      </Button>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planByTier, type SubscriptionTier } from "@/features/pricing/pricingPlanConfig";

type Props = {
  selectedTier: SubscriptionTier;
  onUpgrade: () => void;
  loading?: boolean;
};

export function PricingStickyUpgradeBar({ selectedTier, onUpgrade, loading }: Props) {
  const { t } = useTranslation("pricing");
  const plan = planByTier(selectedTier);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Button variant="warm" size="lg" className="w-full" disabled={loading} onClick={onUpgrade}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("upgradeButton", { amount: plan.priceKes.toLocaleString() })
        )}
      </Button>
    </div>
  );
}

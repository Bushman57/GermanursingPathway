import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PricingPlanCardDesktop } from "@/features/pricing/PricingPlanCardDesktop";
import { PricingPlanCardMobile } from "@/features/pricing/PricingPlanCardMobile";
import { PricingStickyUpgradeBar } from "@/features/pricing/PricingStickyUpgradeBar";
import { PRICING_PLANS, type SubscriptionTier } from "@/features/pricing/pricingPlanConfig";
import { SubscriptionCheckoutSheet } from "@/features/pricing/SubscriptionCheckoutSheet";
import { useSubscriptionCheckout } from "@/features/pricing/useSubscriptionCheckout";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";

export function PricingPlans() {
  const { t } = useTranslation("pricing");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("plus");
  const [expandedTier, setExpandedTier] = useState<SubscriptionTier | null>(null);
  const { checkout, loading, signInOpen, setSignInOpen, onSignedIn } = useSubscriptionCheckout();

  const handleSignedIn = (session: { email: string; fullName: string }) => {
    queryClient.setQueryData(queryKeys.auth.me, session);
    onSignedIn();
  };

  return (
    <>
      <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCardDesktop
            key={plan.id}
            plan={plan}
            loading={loading}
            onSelect={() => checkout(plan.id)}
          />
        ))}
      </div>

      <div className="md:hidden space-y-4 pb-24">
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCardMobile
            key={plan.id}
            plan={plan}
            selected={selectedTier === plan.id}
            expanded={expandedTier === plan.id}
            onSelect={() => {
              setSelectedTier(plan.id);
              setExpandedTier(null);
            }}
            onToggleBenefits={() =>
              setExpandedTier((prev) => (prev === plan.id ? null : plan.id))
            }
          />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-muted/30 px-5 py-4 text-center">
        <p className="font-medium text-foreground">{t("freeTrial.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("freeTrial.body")}</p>
      </div>

      <PricingStickyUpgradeBar
        selectedTier={selectedTier}
        loading={loading}
        onUpgrade={() => checkout(selectedTier)}
      />

      <SubscriptionCheckoutSheet
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSignedIn={handleSignedIn}
      />
    </>
  );
}

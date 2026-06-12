import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { initializeSubscriptionPayment } from "@/features/payments/api";
import { launchPaystackCheckout } from "@/features/payments/launchPaystackCheckout";
import type { SubscriptionTier } from "@/features/pricing/pricingPlanConfig";
import { useAuthMeQuery } from "@/lib/queries/auth";

export function useSubscriptionCheckout() {
  const { t } = useTranslation("pricing");
  const { data: me } = useAuthMeQuery();
  const [loading, setLoading] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const runCheckout = useCallback(
    async (tier: SubscriptionTier) => {
      setLoading(true);
      try {
        const result = await initializeSubscriptionPayment(tier);
        launchPaystackCheckout(result.authorization_url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("checkout.processing");
        toast.error(msg);
        setLoading(false);
      }
    },
    [t],
  );

  const checkout = useCallback(
    (tier: SubscriptionTier) => {
      if (!me) {
        setPendingTier(tier);
        setSignInOpen(true);
        return;
      }
      void runCheckout(tier);
    },
    [me, runCheckout],
  );

  const onSignedIn = useCallback(() => {
    setSignInOpen(false);
    if (pendingTier) {
      const tier = pendingTier;
      setPendingTier(null);
      void runCheckout(tier);
    }
  }, [pendingTier, runCheckout]);

  return {
    checkout,
    loading,
    signInOpen,
    setSignInOpen,
    onSignedIn,
    pendingTier,
  };
}

import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionsEnabled } from "@/lib/queries/siteConfig";

type Props = {
  tier?: "essential" | "plus" | "premium";
  message?: string;
};

export function SubscriptionUpgradePanel({ tier = "plus", message }: Props) {
  const subscriptionsEnabled = useSubscriptionsEnabled();
  const { t } = useTranslation("pricing");
  if (!subscriptionsEnabled) return null;
  const body =
    message ??
    (tier === "plus" ? t("upgradePlusBody") : t("upgradeEssentialBody"));

  return (
    <div className="max-w-lg mx-auto text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-warm/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7 text-warm" />
      </div>
      <h2 className="font-heading text-xl font-bold text-foreground">{t("upgradeRequired")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Button variant="warm" size="lg" className="mt-6" asChild>
        <Link to="/pricing">{t("viewPlans")}</Link>
      </Button>
    </div>
  );
}

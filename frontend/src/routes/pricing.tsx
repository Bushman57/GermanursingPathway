import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingPlans } from "@/features/pricing/PricingPlans";
import { usePaymentReturnConfirm } from "@/features/payments/hooks/usePaymentReturnConfirm";
import type { PaymentStep } from "@/features/payments/types";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { metaHead } from "@/lib/pageMeta";
import { useSubscriptionsEnabled } from "@/lib/queries/siteConfig";

function parsePaymentSearch(raw: Record<string, unknown>) {
  return {
    payment: typeof raw.payment === "string" ? raw.payment.trim() : "",
  };
}

export const Route = createFileRoute("/pricing")({
  validateSearch: parsePaymentSearch,
  head: () =>
    metaHead({
      title: "Pricing — German Nursing Pathway",
      description: "Essential, Plus, and Premium plans for your German nursing pathway.",
    }),
  component: PricingPage,
});

function PricingPage() {
  const { t } = useTranslation("pricing");
  const subscriptionsEnabled = useSubscriptionsEnabled();
  const { payment: returnReference } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<PaymentStep>("idle");

  usePaymentReturnConfirm({
    returnReference: returnReference || undefined,
    onReturnHandled: () => {
      void navigate({ to: "/pricing", search: { payment: "" }, replace: true });
    },
    onSuccess: () => {
      setStep("success");
      toast.success(t("success"));
      void queryClient.invalidateQueries({ queryKey: queryKeys.portal.subscription });
      void queryClient.invalidateQueries({ queryKey: queryKeys.portal.learningAccess });
    },
    onFailure: (msg) => {
      setStep("error");
      toast.error(msg);
    },
    setStep,
  });

  useEffect(() => {
    if (!subscriptionsEnabled) {
      void navigate({ to: "/", replace: true });
    }
  }, [subscriptionsEnabled, navigate]);

  if (!subscriptionsEnabled) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {t("meta.title").replace(" — German Nursing Pathway", "")}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t("meta.subtitle")}</p>
            {step === "waiting" && (
              <p className="mt-4 text-sm text-muted-foreground">{t("checkout.processing")}</p>
            )}
          </div>
          <PricingPlans />
        </div>
      </main>
      <Footer />
    </div>
  );
}
